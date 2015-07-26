title: 修改 Hexo 源码实现默认主题的 CSS 文件自动压缩
date: 2014-01-03 03:18:03
updated: 2014-01-03 03:18:03
tags: [Hexo,CSS]
categories: []
keywords:
---
开始使用 [HEXO][1] 时就发现默认主题 **light** 的 **style.css** 文件是没有经过压缩的，虽然文件本身不大，对博客加载速度不会有太大影响，但是作为喜欢折腾的程序猿，同时为了提升自身博客那么一点点的完美性，一直想去解决这个问题，由于工作比较忙，这个就一直压在心里，直到昨天写完博客，又开始折腾起来。下面记录了具体的修改方式，有需要的同学可以试试。

PS：本博的主题是基于默认主题稍作修改后的样式。

最开始想使用 [Grunt](http://gruntjs.com/) 来压缩，但是这样只能在博客文件目录内引入 Grunt 插件。这就使得文件结构不那么清晰，作为比较追求完美的我，最后还是放弃了该方式。什么？你还不知道 Grunt，那么你 out 很久了，简单的说 Grunt 就是前端自动化构建工具，实现 JS、CSS 文件合并和压缩什么的，飞一般的赶脚啊，有木有。。还有什么 CSS 预编译，JS 单元测试，都可以轻松搞定，如果你在前端开发过程中还在不停按 F5 刷新页面（另外有个工具叫 [**F5**](http://getf5.com/)，不推荐使用，免费版每十分钟的弹窗太揪心了），推荐使用 Grunt 的 **watch** 和 **livereload** 插件，监视文件自动刷新，用起来太爽了，个人非常感谢 NodeJS 和 Grunt 给前端带来的便利。

![](http://bubkoo.qiniudn.com/grunt-logo.png "牛逼的Grunt，LOGO也这么牛叉")<!--more-->

继续折腾吧，放弃了使用 Grunt，只能修改 HEXO 的源码了，由于 HEXO 是基于 NodeJS 的，所以可以直接修改其源码。首先找到 HEXO 安装位置，以Windows 平台为例，通过 `npm install hexo -g`安装 HEXO 的源码位置在`\AppData\Roaming\npm\node_modules\hexo`目录下，目录下面的`lib`文件夹就是 HEXO 的源代码。在目录下面探索了半天，终于找到 HEXO 编译 [Stylus](http://learnboost.github.io/stylus/) 文件的一些端倪，在源码中`\AppData\Roaming\npm\node_modules\hexo\lib\plugins\renderer\stylus.js`是编译 Stylus 的位置，具体代码如下：

``` javascript
module.exports = function(data, options, callback){
  stylus(data.text)
    .use(nib())
    .use(defineConfig)
    .set('filename', data.path)
    .render(callback);
};
```

通过 [Stylus官网](http://learnboost.github.io/stylus/docs/js.html) 了解到编译 Stylus 时是可以指定压缩选项的，知道了这个顿然兴奋（现在已经是凌晨1:30），好了我们在源码中加入设置压缩选项的代码`.set('compress', true)`，修改后如下：

``` javascript
module.exports = function(data, options, callback) {
  stylus(data.text)
    .use(nib())
    .use(defineConfig)
    .set('filename', data.path)
    .set('compress', true)
    .render(callback);
};
```

迫不及待，马上`hexo generate`，打开编译后的 CSS 文件一看

![](http://bubkoo.qiniudn.com/hexo-css-compress.png)

虽然 CSS 确实被压缩了，但是不是我想要的那种压缩成一行的样子，SO，GO ON.

通过看源码，想到像引入编译 Stylus 插件一样，引入一个压缩 CSS 的插件，可以选择使用 [yuicompressor](https://github.com/yui/yuicompressor) 和 [clean-css](https://github.com/GoalSmashers/clean-css)，两个的使用方式基本相同。首先，在刚才的文件中引入 clean-css 插件：`var cleanCSS = require('clean-css');`，再修改源代码如下：

``` javascript
module.exports = function(data, options, callback) {
  stylus(data.text)
    .use(nib())
    .use(defineConfig)
    .set('filename', data.path)
    .set('compress', true)
    .render(function(err, css) {
      var compressed = new cleanCSS().minify(css);
      if (callback) {
        callback.apply(null, [err, compressed]);
      }
    });
};
```

简单分析一下，查看 Stylus 官方文档可知，`render`的调用方法是`render(function(err, css) {})`，该方法接受一个回调函数，在修改之前的 HEXO 源码中 render 传入了一个在其他模块设置好的`callback`方法，该方法成为`render`的回调函数，源码中的`callback`完成将编译后的 CSS 字符串写入到目标文件中，所以我们可以在写入文件之前，调用压缩 CCS 的方法`var compressed = new cleanCSS().minify(css);`，再将压缩后的 CSS 字符串作为参数传给预设的`callback`方法，最后调用`callback`写入目标文件。

好了，经测试该方法有效，可以查看本博[源码](http://bubkoo.com/css/style.css)，其中的 `style.css` 就是压缩之后的。

最后，感谢 [HEXO][1] 提供这么优秀的博客框架，感谢开源社区丰富的资源，希望他们越做越好，晚安啦。

[1]: http://zespia.tw/hexo/?utm_source=feedly