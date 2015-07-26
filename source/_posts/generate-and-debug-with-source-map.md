title: Generate and Debug with Source Map
date: 2014/1/6 20:00:05 
updated: 2014/1/6 20:00:10 
tags: [Source Map, JavaScript, SASS, Debug, Tools]
categories: []
keywords:
---
[上一篇文章](http://bubkoo.com/2014/01/05/source-map/introduction-to-javascript-source-maps/)简单介绍了 Source Map，接下来我们来看看如何利用各种工具来生成 Source Map。

## 什么是 Source Map？ ##

> Source Map 提供了一个与语言无关的方式，来将生产环境中的代码映射回开发环境中的原始代码。

在现代的开发流程中，我们的开发环境和实际线上环境的代码通常都不一样。在应用上线部署前，我们通常都要对我们的代码进行编译、合并、压缩或者其他方面的优化，这使得我们非常困难来准确定位会原始代码。但是，在生成过程中，Source Map 文件储存了这些位置信息，因此，当我们查找一行中的某个位置时，Source Map 文件可以准确定位到原始文件中的位置。这使得我们线上环境中的代码变得可读，甚至可调试，为开发者提供了极大的便利。这就是 Source Map 的用武之地。

在这篇介绍性的教程中，我们利用一个非常简单的 JavaScript 和 SASS 代码，通过各种编译器运行它们，然后在 Source Map 的帮助下，在浏览器中查看我们的原始文件。文中示例代码可以在这里【[下载](https://github.com/NETTUTS/Source-Maps-101)】。
<!--more-->

## Source Map 文件包含的信息 ##
Source Map 文件包含了从优化后的文件到原始文件的映射信息，Source Map 文件的结构通常是JSON格式的，使用 [V3 规范](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?hl=en_US&pli=1&pli=1)。它通常包含以下属性：
  1. version：Source Map 的版本号，通常是 3 
  2. file：优化文件的文件名
  3. sources：原始文件的文件名
  4. names：映射所需要的符号
  5. mappings：映射数据
  
![](http://bubkoo.qiniudn.com/source-maps-file.png)

## 浏览器支持 ##
[Chrome](https://www.google.com/intl/en/chrome/browser/) 或 WebKit 内核浏览器已经支持 [JavaScript Source Maps](http://addyosmani.com/blog/the-breakpoint-episode-3-source-maps-shortcut-secrets-and-jsrun/)，Chrome 甚至支持 [SASS Source Maps](http://addyosmani.com/blog/the-breakpoint-episode-2-sass-source-maps-feature-inspection-and-more/)。[Firefox 23](https://wiki.mozilla.org/DevTools/Features/SourceMap) 以及以上的版本的开发者工具中默认开启了 Source Maps 功能。下面图片中 Firefox 默认开启了对 Source Map 的支持。

![](http://bubkoo.qiniudn.com/source-map-in-firefox.png)

本文中以 Chrome 为调试浏览器，通过下面步骤来开启你的开发者工具对 Source Map 的支持：
- 打开 Chrome 的开发人员工具：菜单 -> 工具 -> 开发者工具 或者直接按 F12
- 点击右下角的“设置”齿轮
- 选择“General”，并选择“Enable source maps”

![](http://bubkoo.qiniudn.com/source-maps-in-chromn.png)

## 下载并运行示例 ##
从【[这里](https://github.com/NETTUTS/Source-Maps-101)】下载示例，解压后打开“start”目录，里面的文件和目录结构非常清晰，有一些简单的 JavaScript 文件，例如 `scripts/script.js`，用 Chrome 打开`index.html`，可以在文本框中输入一些CSS颜色名称或十六进制颜色值来修改背景颜色。

![](http://bubkoo.qiniudn.com/source-maps-demo.png)

``` html
$ start 目录结构
.
├── index.html
├── scripts
│   ├── jquery.d.ts
│   ├── script.coffee.coffee
│   ├── script.js
│   └── script.typescript.ts
└── styles
    ├── style.css
    └── style.sass
```

用你常用的编辑器，快速预览一下文件夹中的纯JavaScript、TypeScript 和 CoffeeScript 文件。我们将创建一个生产版本，以及生成相应的 Source Map。

接下来，我将用五种不同的方式来生成一个编译和压缩后的`script.js`，同时生成对应的 Source Map 文件。你可以选择测试所有的方法，或者选择一个你已经熟悉的方法。这五种方法包括：
- [Closure Compiler](https://developers.google.com/closure/compiler/)
- [Grunt](http://gruntjs.com/) 的插件 [JSMin](https://github.com/twolfson/grunt-jsmin-sourcemap)
- [Uglifyjs 2](http://lisperator.net/uglifyjs/)
- [CoffeeScript](http://coffeescript.org/) 和 [Redux](https://github.com/michaelficarra/CoffeeScriptRedux)
- [TypeScript](http://www.typescriptlang.org/)

## 使用 Closure Compiler ##
[Closure Compiler](https://developers.google.com/closure/compiler/) 是Google推出优化 JavaScript 的一个工具，它通过分析代码，删除无关的部分，然后将剩余部分压缩，除那以外，它也可以[生成 Source Map 文件](http://code.google.com/p/closure-compiler/wiki/SourceMaps)。

我们可以使用 Closure compiler 按照以下步骤来生成优化后的 `script.js`：
  1. [点击这里](http://code.google.com/p/closure-compiler/downloads/detail?name=compiler-latest.zip)下载最新版本的 Closure compiler
  2. 负责下载的 compiler.jar 文件到 `/start/scripts/` 目录
  3. 在 `/start/scripts/` 目录中，按住 Shift 点击右键，在弹出菜单中选择“在此处打开命令窗口”，输入下面的命令并执行，这样就创建了一个优化后的 `script.closure.js` 文件

  ``` html
  java -jar compiler.jar
　　　   --js script.js
　　　   --js_output_file script.closure.js
  ```

  4. 在编辑器中打开 index.html 文件，修改引用的 JavaScript 文件为刚刚创建的 `scripts/script.closure.js`

  ``` html
  <script src="scripts/script.jsmin-grunt.js"></script>
  ```

简单说明：`--js` 表示需要优化的 JavaScript 文件，`--js_output_file` 表示输出文件名，这里是 script.closure.js 。

![](http://bubkoo.qiniudn.com/source-maps-closure.png)

在 Chrome 中打开 index.html，然后开打开发者工具，选择 Sources 选项卡，可以看到 index.html 只引用了优化后的 `script.closure.js`，我们没有办法看到我们最初创建的有适当的缩进 JavaScript 文件。接下来我们在 `/start/scripts/` 目录中执行下面的命令来创建 Source Map 文件。

``` html
java -jar compiler.jar
      --js script.js 
      --create_source_map script.closure.js.map 
      --source_map_format=V3 
      --js_output_file script.closure.js
```

注意 Closure Compiler 中的新增的两个设置项，`--create_source_map` 代表要创建的Source Map 文件的文件名，这里是：`script.closure.js.map`，`--source_map_format` 代表 Source Map 的版本是 V3。然后在 script.closure.js 文件的末尾添加 Source Map 文件的 URL，这样优化后的 JavaScript 就包含了 Source Map 的位置信息，添加 Source Map 文件的 URL 代码如下：

``` html
//@ sourceMappingURL=script.closure.js.map
```

刷新页面，在开发者工具中我们可以看到 “scripts” 目录下包含我们的原始代码文件 “script.js” 和优化后的文件 “script.closure.js” ，但浏览器实际运行的是在 index.html 中我们引用的优化后的文件，这样 Source Map 就为我们建立了一个指向源文件的连接。

同时，你也可以尝试在源文件中断点来调试代码，需要注意的是 “计算表达式” 和 “变量” 在 Source Map 中是不可用的，希望将来他们也被支持。

![](http://bubkoo.qiniudn.com/source-maps-closure-map.png)

## 使用 Grunt 的插件 JSMin ##

如果你已经在使用 [Grunt](http://gruntjs.com/) 来构建项目，那么使用 Grunt 的插件 [JSMin source maps](https://github.com/twolfson/grunt-jsmin-sourcemap) 对你来说就是信手拈来的事。这个插件不仅会优化你的代码，而且也会生成 Source Map 文件。

下面将演示如何利用 JSMin 来压缩你的 script.js 文件：
  1. 打开控制台窗口，运行 `npm install -g grunt` 命令来安装 Grunt
  2. 在 `/start/` 目录下执行 `npm install grunt-jsmin-sourcemap` 命令来安装 Grunt 的插件 [grunt-jsmin-sourcemap](https://github.com/twolfson/grunt-jsmin-sourcemap)
  3. 编辑新创建的 grunt.js 文件，为了简便我们只创建了 jsmin-sourcemap 这一个任务

  ``` javascript
  module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-jsmin-sourcemap');
    grunt.initConfig({
      'jsmin-sourcemap': {
        all: {
          src: ['scripts/script.js'],
          dest: 'scripts/script.jsmin-grunt.js',
          destMap: 'scripts/script.jsmin-grunt.js.map'
        }
      }
    });
    grunt.registerTask('default', 'jsmin-sourcemap');
  };
  ```

  4. 返回控制台，运行 `grunt` 命令，这将默认运行 jsmin-sourcemap 这个任务，因为在上一步的配置中我们将 jsmin-sourcemap 设置成了默认任务
  5. 打开新创建的 script.grunt-jsmin.js.map 文件，可以查看到源文件是 `"sources":["script.js"]`
  6. 在编辑器中打开 index.html 文件，修改引用的 JavaScript 文件为刚刚创建的 `script.grunt-jsmin.js`

  ``` html
  <script src="scripts/script.jsmin-grunt.js"></script>
  ```

  7. 刷新，在浏览器中查看效果

利用 Grunt 和它的插件 jsmin-sourcemap 创建了压缩后的文件：script.jsmin-grunt.js 和 Source Map 文件：script.jsmin-grunt.js.map。

![](http://bubkoo.qiniudn.com/source-maps-gruntjsmin.png)

## 使用 UglifyJS ##

[UglifyJS2](https://github.com/mishoo/UglifyJS2) 是另一个压缩 JavaScript 的工具，和上面的两个工具一样，UglifyJS2 将创建压缩后的文件，同时在文件末尾加上 Source Map 文件的 URL，同时也创建了 Source Map 文件。在 /start/ 目录中执行下面的命令来使用 UglifyJS2:
  1. 安装 UglifyJS2

  ``` javascript
  npm install uglify-js
  ```

  2. 在 /start/scripts/ 目录中执行以下命令来压缩原文件，同时创建 Source Map 文件

  ``` javascript
  uglifyjs --source-map script.uglify.js.map --output script.uglify.js script.js
  ``` 

  3. 在编辑器中打开 index.html 文件，修改引用的 JavaScript 文件为刚刚创建的 `script.uglify.js`

  ``` html
  <script src="scripts/script.uglify.js"></script>
  ```

![](http://bubkoo.qiniudn.com/source-maps-uglify.png)

## 使用 CoffeeScript Redux## 
前面的例子中我们只进行了压缩这样一步操作，但是，对于 [CoffeeScript](http://coffeescript.org/) 这样的语言，我们需要两步操作：CoffeeScript -> JavaScript -> 压缩后 JavaScript。这一部分，我将介绍怎么样通过 CoffeeScript Redux 来创建 [Multi-Level Source Maps](http://www.thecssninja.com/javascript/multi-level-sourcemaps)。

**步骤一：从 CoffeeScript 到纯 JavaScript**

  1. [全局安装](https://npmjs.org/package/coffee-script) CoffeeScript:

  ``` javascript
  npm install -g coffee-script
  ``` 

  2. 使用下面命令编译 CoffeeScript 文件：script.coffee.coffee，生成纯 JavaScript 代码:

  ``` javascript
  coffee -c scripts/script.coffee.coffee
  ```

  3. 安装 [CoffeeScript Redux](https://github.com/michaelficarra/CoffeeScriptRedux):

  ``` javascript
  git clone https://github.com/michaelficarra/CoffeeScriptRedux.git coffee-redux
  cd coffee-redux
  npm install
  make -j test
  cd ..
  ```

  4. 接下来，创建 Source Map 文件：script.coffee.js.map，这个文件包含从生成的纯 JavaScript 到原始的 CoffeeScript 文件的位置信息：

  ``` javascript
  coffee-redux/bin/coffee --source-map -i scripts/script.coffee.coffee > scripts/script.coffee.js.map
  ```

  5. 查看生成的 script.coffee.js 文件，确保文件末尾包含 Source Map 信息：

  ``` javascript
  //@ sourceMappingURL=script.coffee.js.map
  ```

  6. 查看 script.coffee.js.map 文件，确保引用文件是："file":"script.coffee.coffee",源文件是："sources":["script.coffee.coffee"]

**步骤二：从纯 JavaScript 文件到压缩的 JavaScript 文件**

  1. 我们再一次使用 UglifyJS 来压缩 JavaScript 文件和生成 Source Map 文件，这一次我们需要指定一个 Source Map 文件来确保可以回到原始的 CoffeeScript 文件，在 /start/script/目录下执行下面命令：

  ``` javascript
  cd scripts/
  uglifyjs script.coffee.js -o script.coffee.min.js --source-map script.coffee.min.js.map --in-source-map script.coffee.js.map
  ```

  2. 打开 script.coffee.min.js.map 文件，确保里面包含正确的引用文件："file":"script.coffee.min.js"，和正确的源文件："sources":["script.coffee.coffee"]。

![](http://bubkoo.qiniudn.com/source-maps-coffee.png)

## 使用 TypeScript ##

和 CoffeeScript 一样，TypeScript 也需要两步操作：TypeScript -> JavaScript -> 压缩的 JavaScript。由于使用的是 jQuery 插件，我们需要两个 TypeScript 文件：script.typescript.ts 和 jquery.d.ts。这两个文件在示例中 /complete/scripts/目录下。

**步骤一：从 TypeScript 文件到纯 JavaScript 文件**
  在 /start/scripts/ 文件夹下执行下面命令，这将创建一个新的 JavaScript 文件：script.typescript.js，文件末尾包含 Source Map 信息：`//@ sourceMappingURL=script.typescript.js.map`，执行这个命令的同时也创建了 Source Map 文件：script.typescript.js.map。

  ``` javascript
  tsc script.typescript.ts -sourcemap
  ```

**步骤二：从纯 JavaScript 文件到压缩的 JavaScript 文件**
和 CoffeeScript 的例子一样，我们使用 UglifyJS 来压缩 JavaScript 文件

  ``` javascript
  uglifyjs script.typescript.js -o script.typescript.min.js --source-map script.typescript.min.js.map --in-source-map script.typescript.js.map
  ```

最后，在编辑器中打开 index.html 文件，修改引用的 JavaScript 文件为刚刚创建的 `scripts/script.typescript.min.js`

  ``` html
  <script src="scripts/scripts/script.typescript.min.js"></script>
  ```

![](http://bubkoo.qiniudn.com/source-maps-typescript.png)

## 在 SASS 中使用 Source Map ##
除了 JavaScript，Chrome 还支持 SASS 和 SCSS 的 Source Map，为了演示 SASS 的 Source Map 功能，我们需要修改一下 Chrome 的设置，然后将 SASS 编译为带条件参数的 CSS 文件：
  1. 在修改任何设置前，在开发人员工具中监视一个元素，这将只显示 CSS 文件的引用。对于 SASS 来说意义并不是很大。

  ![](http://bubkoo.qiniudn.com/source-maps-onlycss.png)
  
  2. 打开 [chrome://flags/]( chrome://flags/)，启用开发者工具实验，重启 Chrome（最新版本的Chrome 无需设置，直接跳过）
  
  ![](http://bubkoo.qiniudn.com/source-maps-devtoolsexp.png)

  3. 开发者工具 > 设置 > Experiments > 选中 “Support for SASS” （最新版本的Chrome 无需设置，直接跳过）

  ![](http://bubkoo.qiniudn.com/dev-tools-experiments.png)

  4. 开发者工具 > 设置 > General > 选中 “Enable source maps” 和 “Auto-reload CSS upon Sass save”

  ![](http://bubkoo.qiniudn.com/sass-support-dev-tools.png)
 
  5. 安装 SASS 预览版：
  
  ``` html
  gem install sass --version 3.3.0.alpha.243
  ```

  6. 在 /start/styles/ 目录下运行以下命令来编译 SASS 文件，同时生成一个 Source Map 文件，“--watch” 表示监视 SASS 文件的变化，然后自动生成 CSS 文件和对应的 Source Map 文件。
  
  ``` html
  sass --watch --sourcemap sass/styles.scss:styles.css
  ```
  7. 重启开发者工具并刷新页面
  
  ![](http://bubkoo.qiniudn.com/source-maps-onlysass.png)

除了可以在浏览器中查看到 SASS 文件之外，如果你正在使用 [LiveReload](http://livereload.com/)，任何对 SASS 文件的修改将立刻显示到浏览器中。

## 参考资源 ##

Source Map 目前仍在迅速发展，网络上已经有一些很好的资源。如果你想了解更多信息，请参考以下链接。

- [An Introduction to Source Maps](http://net.tutsplus.com/tutorials/tools-and-tips/source-maps-101/)
- [Introduction to JavaScript Source Maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) by Ryan Seddon, HTML5 Rocks
- [The Breakpoint Episode 3: JavaScript Source Maps](http://addyosmani.com/blog/the-breakpoint-episode-3-source-maps-shortcut-secrets-and-jsrun/) by the Google Developer Team
- [The Breakpoint Episode 2: SASS Source Maps](http://addyosmani.com/blog/the-breakpoint-episode-2-sass-source-maps-feature-inspection-and-more/) by the Google Developer Team
- [Source Maps wiki](https://github.com/ryanseddon/source-map/wiki/Source-maps%3A-languages%2C-tools-and-other-info) on languages, tools, articles on Source Maps
- [Multi Level Source Maps](http://www.thecssninja.com/JavaScript/multi-level-sourcemaps) with CoffeeScript and TypeScript by Ryan Seddon
- [Source Maps Version 3 proposal](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?hl=en_US&pli=1&pli=1)
- [Happy debugging with JavaScript source maps](http://globaldev.co.uk/2013/01/happy-debugging-with-javascript-source-maps/)
- [Sourcemap support in Chrome greatly improves debugging](http://blog.mascaraengine.com/news/2012/4/16/sourcemap-support-in-chrome-greatly-improves-debugging.html)
- [JavaScript Source Map 介绍](introduction-to-javascript-source-maps)
- [JavaScript Source Map 详解](http://www.ruanyifeng.com/blog/2013/01/javascript_source_map.html)
- [Working with CSS Preprocessors](https://developers.google.com/chrome-developer-tools/docs/css-preprocessors#toc-enabling-css-source-maps)

