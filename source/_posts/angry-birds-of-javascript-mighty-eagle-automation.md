title: 神鹰 - 自动化
date: 2014-04-20 21:40:10
tags: [Architecture]
categories: [JavaScript]
keywords:
---

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-mighty-eagle-automation.png)

一群恶魔的猪从无辜的小鸟那里偷走了所有的前端架构，现在它们要夺回来。一对特工英雄（愤怒的小鸟）将攻击那些卑鄙的猪，直到夺回属于他们的前端架构。（译者注：本系列是关乎前端架构的讨论，作者借用当前最风靡的游戏 - 愤怒的小鸟，为我们揭开了前端架构的真实面目。）

小鸟们最终能取得胜利吗？它们会战胜那些满身培根味的敌人吗？让我们一起来揭示 JavaScript 之愤怒的小鸟系列的另一个扣人心弦的章节！

> 阅读本系列的[介绍文章](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-series/)，查看所有小鸟以及它们的进攻力量。

## 战况

- [红色大鸟 - 立即调用的函数表达式](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-red-bird-iife/)
- [蓝色小鸟 - 事件](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-blue-bird-events/)
- [黄色小鸟 - 模块化、依赖管理、性能优化](http://bubkoo.com/2014/03/29/angry-birds-of-javascript-yellow-bird-requirejs/)
- [黑色小鸟 - 前端分层架构](http://bubkoo.com/2014/03/29/angry-birds-of-javascript-black-bird-backbone/)
- [白色小鸟 - 代码质量和代码分析](http://bubkoo.com/2014/04/14/angry-birds-of-javascript-white-bird-linting/)
- [绿色小鸟 - 模拟请求和模拟数据](http://bubkoo.com/2014/04/17/angry-birds-of-javascript-green-bird-mocking/)
- [橙色小鸟 - 模板引擎](http://bubkoo.com/2014/04/18/angry-birds-of-javascript-orange-bird-templating/)
- [大兄弟 - 设计模式](http://bubkoo.com/2014/04/19/angry-birds-of-javascript-big-brother-bird-patterns/)



## 神鹰的攻击力

![](http://bubkoo.qiniudn.com/angry-birds-angrybirds-eagle.png)

本文我们将看看使用超级武器的神鹰，它使用一套工具来组织和部署鸟儿们到战斗中去。渐渐的，它们一个接一个地夺回了本属于他们的东西。

<!--more-->

## 猪猪偷走了什么

经过一段时间后，小鸟们开始使用 RequireJS (黄色小鸟)，JSHint (白色小鸟)，Plato，Mustache (橙色小鸟) 和其他一系列强大的工具，但所有这些工具都需要依靠命令行。记住这些工具对应的命令很烦人，并且在更新网站时，很容易忘记运行某个命令。幸好，神鹰带来了一些工具，使得这些工作变得简单，神鹰用 Grunt 和 Bowser 自动执行常见任务，并让项目可以很容易的引入必需的常用库。

但是，在最近的一次进攻中，小猪偷走了鸟儿们的自动化工具。其中一只神鹰被指派去夺回来，它将使用神鹰神奇的力量去夺回本系列中介绍过的技术。

## Grunt

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-mighty-eagle-automation-grunt.png)

Grunt 是一个基于任务的命令行工具，用于前端应用的自动构建。社区被这个工具深深吸引，并产出了大量插件可供选择，例如 CoffeeScript 编译、Handlebars 预编译、Less 支持、JSHint 检查等等...

事实上已经有几个大型项目正在使用 Grunt 辅助自动构建过程以及其他任务，例如 Twitter、jQuery、Modernizr、Sauce Labs 等。

### 开始使用

开始使用之前，你需要在 node 中用下面的命令安装 Grunt

```bash
npm install -g grunt-cli grunt-init
```

安装 Grun 之后，每个项目需要两个主要的文件：

- Gruntfile.js
- package.json

#### Gruntfile.js

你可以从头创建自己的 `Gruntfile.js`，也可以从文档中拷贝一份初学者的 `Gruntfile.js`，或者使用项目脚手架 `grunt-init gruntfile`。如何安装脚手架请参阅 Grunt 的项目[脚手架页面](http://gruntjs.com/project-scaffolding)的介绍。下面的 `Gruntfile.js` 示例来自 Grunt 的[入门指南](http://gruntjs.com/getting-started)页面...

```javascript
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        }
    });
    
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    // Default task(s).
    grunt.registerTask('default', ['uglify']);
};
```

#### package.json

`package.json` 描述了项目名称、版本，以及可能有的依赖，例如 Grunt 和 Grunt 插件。你可以从 Grunt 的[入门指南](http://gruntjs.com/getting-started)页面拷贝一份 package.json 示例...（如下所示）

```javascript
{
    "name": "my-project-name",
    "version": "0.1.0",
    "devDependencies": {
        "grunt": "~0.4.1",
        "grunt-contrib-jshint": "~0.1.1",
        "grunt-contrib-nodeunit": "~0.1.2"
    }
}
```

### Grunt 插件

现在一切就绪，你可以使用一整套插件开始自动执行任务。这里有几个有趣的插件，你可能会感兴趣...

- grunt-contrib-coffee - 把 CoffeeScript 编译为 JavaScript
- grunt-contrib-compass - 把 Compass 编译为 CSS
- grunt-contrib-concat - 合并文件
- grunt-contrib-connect - 启动一个 Web 服务
- grunt-contrib-csslint - 检测 CSS 文件
- grunt-contrib-handlebars - 预编译 Handlebar 模板
- grunt-contrib-htmlmin - 压缩 HTML 文件
- grunt-contrib-imagemin - 压缩 PNG 和 JPEG 图片
- grunt-contrib-jshint - 用 JSHint 检查 JS 文件
- grunt-contrib-less - 将 LESS 编译为 CSS
- grunt-contrib-nodeunit - 运行 Nodeunit 单元测试
- grunt-contrib-watch - 当文件发生变化时运行与定义任务
- grunt-contrib-requirejs - 使用 r.js 优化 RequireJS 项目
- grunt-contrib-uglify - 用 UglifyJS 压缩文件
- grunt-contrib-yuidoc - 编译 YUIDocs
- ... more ...

### jQuery 的 Gruntfile

我从 GitHub 上 clone 了一份 jQuery，用来查看 jQuery 是如何使用 Grunt 的，下面是执行 Grunt 时得到的输出。

![](http://bubkoo.qiniudn.com/grunt-jquery.png)

如果你仔细查看上图，你会发现执行了一下任务：更新 Git 子模块（Sizzle，Qunit），从各个模块中构建出 jQuery，执行 JSHint 检查，创建 SourceMaps，并运行一个比较指定文件大小的任务。如果你深入研究它的 Gruntfile 的话，你还会发现它自定义一种不同于 Browserstack 的方式来运行单元测试。

### Modernizr 的 Gruntfile

我同样也 clone 了一份 Modernizr 库，然后输入 `grunt qunit` 观察它的 746 项单元测试的测试过程，并在 369ms 内测试通过，测试使用了无界面的浏览器引擎 PhantomJS。

![](http://bubkoo.qiniudn.com/grunt-modernizr.png)

### Grunt 资源

本文的意图不是教会你如何使用 Grunt，只是让你意识到有这个东西的存在，它是实现前端自动化构建的一个非常好的工具，如果你还不了解 Grunt，你可以参阅下面的资源，这些资源将引导你逐步深入...

- [The Grunt Basics](http://www.youtube.com/watch?v=q3Sqljpr-Vc) by Cary Landholt ([@carylandholt](http://twitter.com/carylandholt))
- [Grunt.js Workflow](http://merrickchristensen.com/articles/gruntjs-workflow.html) by Merrick Christensen ([@iammerrick](http://twitter.com/iammerrick))
- [Meet Grunt: The Build Tool for JavavScript](http://net.tutsplus.com/tutorials/javascript-ajax/meeting-grunt-the-build-tool-for-javascript/) by Andrew Burgess ([@andrew8088](http://twitter.com/andrew8088))

## Twitter Bower

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-mighty-eagle-automation-bower.png)

使用 Node 或 Ruby 的开发人员可能已经熟悉了 npm 或 gems，但是对于浏览器脚本和样式没有类似的工具...至少到目前为止还没有！

Twitter Bower 项目旨在为 HTML、CSS 和 JavaScript 提供一套包管理器来解决这个问题。


```bash
npm install -g bower
```

安装 Bower 之后你就可以开始下载库！例如，我想下载最新版本的 jQuery，只需要运行 `bower install jquery`，然后你会看到下面的输出...

![](http://bubkoo.qiniudn.com/bower-install-jquery.png)

#### Bower 资源

如果想更多的了解 Bower，建议去看看下面的这些好资源。

- [Meet Bower: A Package Manager For The Web](http://net.tutsplus.com/tutorials/tools-and-tips/meet-bower-a-package-manager-for-the-web/) by Andrew Burgess ([@andrew8088](http://twitter.com/andrew8088))
- [A RequireJS, Backbone, and Bower Starter Template](http://net.tutsplus.com/tutorials/javascript-ajax/a-requirejs-backbone-and-bower-starter-template/) by Jeffrey Way ([@jeffrey_way](http://twitter.com/jeffrey_way))

## Yeoman

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-mighty-eagle-automation-yo.png)

Yeoman 项目是一款与 Grunt 和 Bower 协同工作的脚手架引擎。可以让你的应用快速运行起来。要使用 Yeoman，你需要先用下面的语法安装它...

```bash
npm install -g yo grunt-cli bower 
```

Yeoman 安装之后，你可以生成各种不同类型的项目。在下面的的截图中，我用 Yeoman 创建了一个 Web 应用。在按我的需求订制应用的过程中，它会问几个问题。

![](http://bubkoo.qiniudn.com/yo-webapp.png)

还有其他的脚手架，例如 [Backbone](https://github.com/yeoman/generator-backbone)、[AngularJS](https://github.com/yeoman/generator-angular) 等，你可以安装它们，然后开始你的项目。可以在 Yeoman 的 GitHub 页面看到更多的[生成器列表](https://github.com/yeoman)。

例如在下面的截图中，我先创建了一个新的 Backbone 应用，然后立即创建了一个新的 `bird` 模型。

![](http://bubkoo.qiniudn.com/yo-backbone-app.png)

![](http://bubkoo.qiniudn.com/yo-backbone-model.png)

> Yeoman 目前是 1.0 测试版，网站上说在 Windows 下有一些问题。虽然我已经能用它做一些扩展，但是我敢肯定有一些计划完全支持的功能尚不支持。

## 进攻

下面是一个用 [boxbox](http://incompl.github.com/boxbox/) 构建的简易版 Angry Birds，boxbox 是一个用于 [box2dweb](https://code.google.com/p/box2dweb/) 的物理学框架，由 [Bocoup](http://bocoup.com/) 的 [Greg Smith](http://twitter.com/_gsmith) 编写。

> 按下空格键来发射神鹰，你也可以使用方向键。

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-mighty-eagle-automation-attack.png)

## 结论

拥抱 Grunt、Bower 和 Yeoman 可以帮助自动化开发、测试、部署过程中的各个环节。这些工具的社区非常活跃，你可以在上面找到满足你应用需求的插件。

还有很多其他的前端架构技术也被猪偷走了。接下来，另一只愤怒的小鸟将继续复仇！Dun, dun, daaaaaaa!

<p class="j-quote">原文：[Angry Birds of JavaScript- Mighty Eagle: Automation](http://www.elijahmanor.com/angry-birds-of-javascript-mighty-eagle-automation/)</p>
