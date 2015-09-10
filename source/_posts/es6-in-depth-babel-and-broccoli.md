title: 深入解析 ES6：使用 Babel 和 Broccoli
tags:
  - ES6
categories:
  - JavaScript
date: 2015-08-15 13:12:38
updated: 2015-08-15 13:12:38
keywords:
---

ES6 才刚被标准化，人们就在开始谈论 ES7 将提供哪些闪亮的新特性了。作为 Web 开发人员，我们更想知道如何使用这些新特性。在之前的文章中，作者鼓励我们在一些工具的帮助下开始使用 ES6：

> 如果你想使用这些新语法，你可以使用 [Babel](https://babeljs.io/) 或 Google 的 [Traceur](https://github.com/google/traceur-compiler) 将 ES6 代码转换为友好的 ES5 代码。

本文的主题就是这些工具的使用，上面这些工具被统称为 *transpiler*，transpiler 也被称为[源码到源码的编译器](https://en.wikipedia.org/wiki/Source-to-source_compiler)，用于在抽象级别进行编程语言之间的相互转换。使用 transpiler 可以让我们用 ES6 语法来编写代码，同时保证这些代码能在所有浏览器上运行。

<!--more-->

## Transpiler

使用 transpiler 非常简单，只需要下面两步：

1.用 ES6 语法编写代码：

```javascript
let q = 99;
let myVariable = `${q} bottles of beer on the wall, ${q} bottles of beer.`;
```

2.将上面代码作为 transpiler 的输入，经 transpiler 处理后将得到下面的代码：

```javascript
"use strict";

var q = 99;
var myVariable = "" + q + " bottles of beer on the wall, " + q + " bottles of beer."
```

得到的代码是老式的 JavaScript 语法，可以在任何浏览器中运行。

transpiler 的内部工作原理相当复杂，超出了本文的讨论范围。这里我们仅仅将 transpiler 作为一个黑盒来处理我们的代码，正如你会开车，但并不需要知道发动机的工作原理一样。

## Babel 实践

使用 Babel 有几种不同的方式。Babel 提供了一个命令行工具，你可以在终端中使用：


```shell
babel script.js --out-file script-compiled.js
```

还有一个浏览器端库。首先，将 Babel 嵌入到页面中，然后将你的 ES6 代码放在 `type` 属性值为 `text/babel` 的 `script` 标签中：


```html
<script src="node_modules/babel-core/browser.js"></script>
<script type="text/babel">
// Your ES6 code
</script>
```

上面两种方式实用性不强，当代码变得庞大，我们就会开始将代码分割到不同文件或文件夹中。这时，我们就需要一个构建工具，并将 Babel 集成到我们的构建流程中。

下面我们将把 Babel 集成到一个构建工具中 -- [Broccoli.js](http://broccolijs.com/)，并通过几个例子来演示 ES6 代码的编写和执行。示例的完整代码放在[这里](https://github.com/givanse/broccoli-babel-examples)，一共包含三个示例：

- es6-fruits
- es6-website
- es6-modules

每个例子都是建立在前个例子的基础上，我们可以先从最简单的例子入手，然后进阶到一个通用的解决方案，最终可以作为一个庞大项目的起点。本文将详细讨论前面两个例子，之后你将能自行阅读和理解第三个例子中的代码。

如果你还在犹豫，那就等到浏览器兼容这些新特性吧，这样你也会被甩在时代的后面。浏览器完全兼容这些新特性需要很长的时间，而且每年都将发布一些新的 ECMAScript 标准，我们将看到新标准将比浏览器厂商的发布更加频繁。所以，别犹豫了，让我们开始使用这些新特性吧。

## 小试牛刀

Broccoli 是一个快速构建工具，不仅可以用来混淆和压缩文件，借助 [Broccoli 插件](https://www.npmjs.com/browse/keyword/broccoli-plugin)还可以做很多构建相关的工作，为我们节省了在处理文件、目录和执行命令上的时间。

### 准备工作

首先，我们需要[安装 Node 0.11 ](https://nodejs.org/)或更新的版本。

如果你使用的是 unix 系统，那么请避免使用 package manager (apt, yum) 来安装，这可以避免在安装过程中使用 root 权限。最好只为当前用户使用链接中提供的二进制文件安装。在 [这篇文章](http://givan.se/do-not-sudo-npm/)中介绍了为什么不推荐使用 root 权限，同时文章中还提供了一些[其他安装方式](http://givan.se/do-not-sudo-npm/#install-npm-properly)。

### 项目初始化

使用下面命令初始化我们的项目：


```bash
mkdir es6-fruits
cd es6-fruits
npm init
# Create an empty file called Brocfile.js
touch Brocfile.js
```

安装  **broccoli** 和 **broccoli-cli**：


```bash
# the broccoli library
npm install --save-dev broccoli
# command line tool
npm install -g broccoli-cli
```

### 编写 ES6 代码

创建一个 `src` 目录，在目录中创建一个 `fruits.js` 文件：

```bash
mkdir src
vim src/fruits.js
```

在我们创建的文件中，使用 ES6 语法编写一小段代码：


```javascript
let fruits = [
  {id: 100, name: 'strawberry'},
  {id: 101, name: 'grapefruit'},
  {id: 102, name: 'plum'}
];

for (let fruit of fruits) {
  let message = `ID: ${fruit.id} Name: ${fruit.name}`;

  console.log(message);
}

console.log(`List total: ${fruits.length}`);
```

上面代码中使用了 ES6 的三个新特性：

1. 用 `let` 声明局部变量
2. [for-of](https://hacks.mozilla.org/2015/04/es6-in-depth-iterators-and-the-for-of-loop/) 循环
3. [template strings](https://hacks.mozilla.org/2015/05/es6-in-depth-template-strings-2/)

保存文件，然后尝试执行一下：

```bash
node src/fruits.js
```

我们看到执行报错了，但我们的目标是使这段代码可以在 Node 和任何浏览器上都能被执行：

```bash
let fruits = [
    ^^^^^^
SyntaxError: Unexpected identifier
```

### Transpilation

接下来我们将使用 Broccoli 来加载代码，并通过 Babel 处理，修改 `Brocfile.js` 文件如下：


```javascript
// import the babel plugin
var babel = require('broccoli-babel-transpiler');

// grab the source and transpile it in 1 step
fruits = babel('src'); // src/*.js

module.exports = fruits;
```

`broccoli-babel-transpiler` 这个包是 Broccoli 的一个插件，使用前需要安装：


```bash
npm install --save-dev broccoli-babel-transpiler
```

构建并执行：

```bash
broccoli build dist # compile
node dist/fruits.js # execute ES5
```

执行结果如下：

```bash
ID: 100 Name: strawberry
ID: 101 Name: grapefruit
ID: 102 Name: plum
List total: 3
```

有木有很简单啊！打开 `dist/fruits.js` 文件来看看编译后的代码，我们将发现通过 Babel 生成的代码可读性是非常强的。

## 在 Web 开发中的使用

接下来我们来看一个稍复杂的例子。首先，退出 `es6-fruits` 目录；然后，按照之前的步骤创建 `es6-website` 目录。

在 `src` 目录下创建下面三个文件：

`src/index.html`


```html
<!DOCTYPE html>
<html>
  <head>
    <title>ES6 Today</title>
  </head>
  <style>
    body {
      border: 2px solid #9a9a9a;
      border-radius: 10px;
      padding: 6px;
      font-family: monospace;
      text-align: center;
    }
    .color {
      padding: 1rem;
      color: #fff;
    }
  </style>
  <body>
    <h1>ES6 Today</h1>
    <div id="info"></div>
    <hr>
    <div id="content"></div>

    <script src="//code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src="js/my-app.js"></script>
  </body>
</html>
```

`src/print-info.js`


```javascript
function printInfo() {
  $('#info')
      .append('<p>minimal website example with' +
              'Broccoli and Babel</p>');
}

$(printInfo);
```


`src/print-colors.js`



```javascript
// ES6 Generator
function* hexRange(start, stop, step) {
  for (var i = start; i < stop; i += step) {
    yield i;
  }
}

function printColors() {
  var content$ = $('#content');

  // contrived example
  for ( var hex of hexRange(900, 999, 10) ) {
    var newDiv = $('<div>')
      .attr('class', 'color')
      .css({ 'background-color': `#${hex}` })
      .append(`hex code: #${hex}`);
    content$.append(newDiv);
  }
}

$(printColors);
```

或许你已经注意到 `function* hexRange`，没错这就是 [ES6 generator](https://hacks.mozilla.org/2015/05/es6-in-depth-generators/)，目前该特性还没有被所有浏览器兼容，为了使用这个特性，我们需要一个 polyfill，Babel 为我们提供了这个 polyfill。

下一步就是合并 JS 文件，难点在于 `Brocfile.js` 文件的编写，这次我们需要安装 4 个插件：


```bash
npm install --save-dev broccoli-babel-transpiler
npm install --save-dev broccoli-funnel
npm install --save-dev broccoli-concat
npm install --save-dev broccoli-merge-trees
```

`Brocfile.js`

```javascript
// Babel transpiler
var babel = require('broccoli-babel-transpiler');
// filter trees (subsets of files)
var funnel = require('broccoli-funnel');
// concatenate trees
var concat = require('broccoli-concat');
// merge trees
var mergeTrees = require('broccoli-merge-trees');

// Transpile the source files
var appJs = babel('src');

// Grab the polyfill file provided by the Babel library
var babelPath = require.resolve('broccoli-babel-transpiler');
babelPath = babelPath.replace(/\/index.js$/, '');
babelPath += '/node_modules/babel-core';
var browserPolyfill = funnel(babelPath, {
  files: ['browser-polyfill.js']
});

// Add the Babel polyfill to the tree of transpiled files
appJs = mergeTrees([browserPolyfill, appJs]);

// Concatenate all the JS files into a single file
appJs = concat(appJs, {
  // we specify a concatenation order
  inputFiles: ['browser-polyfill.js', '**/*.js'],
  outputFile: '/js/my-app.js'
});

// Grab the index file
var index = funnel('src', {files: ['index.html']});

// Grab all our trees and
// export them as a single and final tree
module.exports = mergeTrees([index, appJs]);
```

构建：


```bash
broccoli build dist
```

构建结果，`dist` 的目录结构：


```bash
$> tree dist/
dist/
├── index.html
└── js
    └── my-app.js
```

这就是一个完整静态网站的根目录，可以使用任何静态服务器来启动，比如：


```bash
cd dist/
python -m SimpleHTTPServer
# visit http://localhost:8000/
```

你将看到如下结果：

![](http://bubkoo.qiniudn.com/images/es6-in-depth-babel-and-broccoli.png)

 
<p class="j-quote">参考原文：[ES6 In Depth: Using ES6 today with Babel and Broccoli](https://hacks.mozilla.org/2015/06/es6-in-depth-babel-and-broccoli/)
原文作者：[Jason Orendorff](https://hacks.mozilla.org/author/jorendorffmozillacom/) 
原文日期：2015-07-17 21:38</p>