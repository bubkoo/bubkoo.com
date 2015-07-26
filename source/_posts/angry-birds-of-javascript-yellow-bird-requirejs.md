title: 黄色小鸟 - 模块化、依赖管理、性能优化
date: 2014-03-29 00:01:16
updated: 2014-03-29 00:01:16
tags: [Architecture, RequireJS, Modular, Dependency, Performance]
categories: [JavaScript]
keywords:
---

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-yellow-bird-requirejs.png)

## 介绍 ##

一群恶魔的猪从无辜的小鸟那里偷走了所有的前端架构，现在它们要夺回来。一对特工英雄（愤怒的小鸟）将攻击那些卑鄙的猪，直到夺回属于他们的前端架构。（译者注：本系列是关乎前端架构的讨论，作者借用当前最风靡的游戏 - 愤怒的小鸟，为我们揭开了前端架构的真实面目。）

小鸟们最终能取得胜利吗？它们会战胜那些满身培根味的敌人吗？让我们一起来揭示 JavaScript 之愤怒的小鸟系列的另一个扣人心弦的章节！

> 阅读本系列的[介绍文章](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-series/)，查看所有小鸟以及它们的进攻力量。

## 战况 ##

- [红色大鸟 - 立即调用的函数表达式](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-red-bird-iife/)
- [蓝色小鸟 - 事件](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-blue-bird-events/)

## 黄色小鸟的攻击力 ##

![](http://bubkoo.qiniudn.com/angry-birds-yellow-bird.png)

在这片文章中，我们将看看黄色小鸟，它使用 [RequireJS](http://requirejs.org/) 作为助推器，利用动态脚本加载来攻击那些讨厌的猪。慢慢的，小鸟们将一个接一个地夺回本属于他们的东西。

<!--more-->

## 猪猪偷走了什么 ##

小鸟们曾经手动添加到本文件到 HTML 页面中，首先这并不会导致什么问题，但是一旦当它们的应用变得更加庞大和复杂，就会面临组织代码、解决依赖关系和确定优化策略等一系列困难。庆幸的是，它们引入了 [RequireJS](http://requirejs.org/) 实现代码模块化、脚本异步加载、依赖管理，并提供了一种简单的方式来优化代码。后来发生了一件不幸的事情，在猪猪进攻过程中，RequireJS 库被他们偷走了。

## 一个崩溃的应用 ##

让我们以一个简单的页面开始，只引入了少数几个脚本文件。你会注意到在页面最后我只加载了 3 个流行的库（jQuery，Underscore 和 Postal）和一些自定义代码。

```javascript
<!DOCTYPE html>
<html>  
    <head lang="en">
        <meta charset="utf-8">
        <title>Angry Birds</title>
        <link rel="stylesheet" href="./css/style.css">
    </head>
    <body>
        <script src="./libs/jquery.min.js"></script>
        <script src="./libs/postal.min.js"></script>
        <script src="./libs/underscore.min.js"></script>
        <script>
            var channel = postal.channel();
        
            channel.subscribe( "pig.collide", function() {
                console.log( "Pig Down!" );
            });
        
            channel.publish( "pig.collide" );
        </script>
    </body>
</html>
```

上面代码看上去非常简单，但是当我运行页面时，在开发者工具的控制台中却得到如下错误...

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-yellow-bird-requirejs-error.png)

你在自问自答：什么！？！我没有在任何位置看到 `each` 方法啊，到底是怎么回事？噢，好像是在 postal.min.js 内部某处发生了异常，找到了一个 BUG...再运行一遍看是不是这样，但是，等等！？！这里也许还有别的东西。

其实，真正的问题不是 postal.js 存在 BUG，而是 postal.js 依赖 underscore.js，问题在于 underscore.js 需要在 postal.js 之前加载，修改一下脚本的加载顺序就可以轻松地解决这个问题。在上面示例中，修复过程并不值得一提，但是请想想一下，一旦项目变得庞大，需要大量的脚本文件，这是一件繁重的工作。

## RequireJS 基础 ##

在我们开始使用 RequireJS 来解决上述问题前，先高度概括一下这个库能为我们做什么。RequireJS 是一个异步模块加载器，它提供的 API 允许我们定义和加载模块，这两个方法（define 和 require）非常容易理解，我们一起来看看。

### define 方法 ###

创建一个模块，你需要提供一个模块名称，依赖列表和一个回调函数。

```javascript
// 文件名: my-first-module.js
 
// 按照约定，模块的默认名称是文件名
define( 
    [ "underscore", "jquery" ], // 依赖项数组
    function( _, $ ) { // 回调函数，其参数和请求的依赖项对应
        // Underscore 和 jQuery 已经加载完成
        // 可以通过 `_` & `$` 变量来使用
 
        return { // 不管是谁加载该模块，回调函都将是可用的
            message: "Hello World!"
        };
    }
);
```

### require 方法 ###

在应用的某个地方，你需要使用 `require` 函数来开始执行代码。

```javascript
require( 
    [ "my-first-module" ],    // 依赖项数组
    function( firstModule ) { // 回调函数的参数与依赖项项对应
        console.log( firstModule.message );
    }
);
```

## 修复应用 ##

我用 RequireJS 修复了上面的小应用，你可以看到下面的代码中我移除了其他所有的 `<script>` 标签，只剩一个指向 require.js 库，RequireJS 知道从哪里开始执行应用，因为我们在 `<script>` 标签的属性上添加了一个 HTML5 的 `data-main` 属性，该属性指定了开始执行的脚本。

```javascript
<!DOCTYPE html>
<html>  
    <head lang="en">
        <meta charset="utf-8">
        <title>Angry Birds</title>
        <link rel="stylesheet" href="./css/style.css">
    </head>
    <body>
        <!-- 
            You'll notice that the markup is cleaned up dramatically
            The data-main HTML5 attribute defines where to kick things off
        -->
        <script src="./libs/require.min.js" data-main="./js/main"></script>
    </body>
</html>
```

主脚本文件中有一段配置，在这里你可以为现有的 AMD 模块指定别名，也可以通过 shim 来配置不符合 AMD 规范的模块。虽然 jQuery 和 Postal 已经是符合 AMD 规范的模块，我们需要在配置中包含它们，因为它们的文件位置和 `main.js` 不在同一个文件夹下面。

你不必在配置中包含应用程序中的所有自定义模块。你可以通过文件路径和名称引用它们。

```javascript
/* main.js */
 
// Let RequireJS know where all the scripts are
require.config({
    paths: {
        "jquery": "../libs/jquery.min",
        "underscore": "../libs/underscore.min",
        "postal": "../libs/postal.min"
    },
    shim: {
        // Underscore.js 不是一个 AMD 模块，所以需要为其配置在 shim 中
        underscore: {
            exports: "_"
        }
    }
});
 
// 在 postal.js 内部定义了依赖 underscore
// 所以在加载 postal 之前，RequireJS 会先加载 underscore
require([ "postal" ], function( postal ) {
    var channel = postal.channel();
 
    channel.subscribe( "pig.collide", function() {
        console.log( "Pig Down!" );
    });
 
    channel.publish( "pig.collide" );
});
```

## 优化 ##

目前，我们的应用只包含 5 个脚本文件，但是你知道我们的应用只会继续添加额外的脚本，因此，需要一种简单的方式来合并和压缩我们的脚本文件，使其在线上环境有更好的性能，通过使用 RequireJS 已经为我们的应用定义好了所有依赖。

值得庆幸的是，有一个称为 [r.js](http://requirejs.org/docs/1.0/docs/optimization.html) 的工具可以收集依赖信息，并用这些信息生成一个合并和压缩过的脚本文件。你可以通过 Node 包管理器 `npm install requirejs` 安装这个工具。

在运行这个工具时，你需要在控制台中输入运行所需要的命令行参数，但我更喜欢为其指定一个构建配置文件，就像下面这样，你可以在官方 GitHub 上找到[完整的选项列表](https://github.com/jrburke/r.js/blob/master/build/example.build.js)。

```javascript
({
	appDir: ".",               // The main root URL
	dir: "../dist",            // Directory that we build to
	mainConfigFile: "main.js", // Location of main.js
	name: "main",              // Name of the module that we are loading
	optimizeCss: "standard",   // Standard optimization for CSS
	removeCombined: true,      // Temporary combined files will be removed
	paths : {
		"jquery": "libs/jquery.min",
		"underscore": "libs/underscore.min",
		"postal": "libs/postal.min"
	}
})
```

一旦定义好 `build.js` 文件之后，你需要让 `r.js` 知道你将使用这个配置文件，通过运行这条命令 `r.js -o build.js` 来开始执行，你可以在控制台中看到输出结果，就像下面这样。

```dos
$ r.js -o build.js
Optimizing (standard) CSS file: C:/Users/Elijah/Desktop/demo/dist/css/style.css
 
Tracing dependencies for: main
Uglifying file: C:/Users/Elijah/Desktop/demo/dist/build.js
Uglifying file: C:/Users/Elijah/Desktop/demo/dist/libs/jquery.min.js
Uglifying file: C:/Users/Elijah/Desktop/demo/dist/libs/postal.min.js
Uglifying file: C:/Users/Elijah/Desktop/demo/dist/libs/require.min.js
Uglifying file: C:/Users/Elijah/Desktop/demo/dist/libs/underscore.min.js
Uglifying file: C:/Users/Elijah/Desktop/demo/dist/main.js
Uglifying file: C:/Users/Elijah/Desktop/demo/dist/r.js
 
css/style.css
----------------
css/style.css
 
C:/Users/Elijah/Desktop/demo/src/main.js
----------------
C:/Users/Elijah/Desktop/demo/src/main.js
```

## 其他资源 ##

在本文中，对于 RequireJS 和 r.js 优化工具，只涉及到很浅的部分，如果你想更加深入了解这些工具，你可以参考下面这些资源。

- Jack Franklin's ([@jack_franklin](http://twitter.com/jack_franklin)) [Introduction to RequireJS](http://javascriptplayground.com/blog/2012/07/requirejs-amd-tutorial-introduction) article
- Jeffrey Way's ([@jeffrey_way](http://twitter.com/jeffrey_way)) [A RequireJS, Backbone, and Bower Starter Template](http://net.tutsplus.com/tutorials/javascript-ajax/a-requirejs-backbone-and-bower-starter-template/) screencast
- Cary Landholt's ([@carylandholt](http://twitter.com/carylandholt)) [RequireJS Basics](http://www.youtube.com/watch?v=VGlDR1QiV3A) video
- Jonathan Creamer's ([@jcreamer898](http://twitter.com/jcreamer898)) [Using Require.js in an ASP.NET MVC application](http://tech.pro/tutorial/1156/using-requirejs-in-an-aspnet-mvc-application) article


## 进攻 ##


下面是一个用 [boxbox](http://incompl.github.com/boxbox/) 构建的简版 Angry Birds，boxbox 是一个用于 [box2dweb](https://code.google.com/p/box2dweb/) 的物理学框架，由 [Bocoup](http://bocoup.com/) 的 [Greg Smith](http://twitter.com/_gsmith) 编写。

> 按下空格键来发射黄色小鸟，你也可以使用方向键。

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-yellow-bird-requirejs-attack.png)

## 结论 ##

前端应用很容易就变得复杂，理想的做法是提供某种结构和依赖管理的方式，以及对最终结果进行优化的方式。经过黄色小鸟的不懈努力，它们最终夺回了 RequireJS，并将在下一个应用中使用起来。

还有很多其他的前端架构技术也被猪偷走了。接下来，另一只愤怒的小鸟将继续复仇！Dun, dun, daaaaaaa!

<p class="j-quote">原文：[Angry Birds of JavaScript: Yellow Bird RequireJS](http://www.elijahmanor.com/angry-birds-of-javascript-yellow-bird-requirejs/)</p>