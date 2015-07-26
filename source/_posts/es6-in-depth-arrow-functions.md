title: 深入解析 ES6：箭头函数
tags:
  - ES6
categories:
  - JavaScript
date: 2015-06-28 23:36:05
updated: 2015-06-28 23:36:05
keywords:
---

从一开始箭头就是 JavaScript 的一部分，在第一个 JavaScript 中就建议将内联的脚本代码包裹在 HTML 的注释中，这可以防止那些不支持 JavaScript 的浏览器错误滴将你的代码显示为明文。你也许写过下面这样的代码：

```html
<script language="javascript">
<!--
    document.bgColor = "brown";  // red
// -->
</script>
```

古老的浏览器将看到两个不被支持的标签和一段注释，只有支持 JavaScript 的新浏览器才会将其解析为 JavaScript 代码。

为了支持这个古怪的特性，浏览器的 JavaScript 引擎把 `<!--` 作为一个单行注释的开始，这不是开玩笑的，这一直都是这门语言的一部分，并且至今还能用，不仅仅在 ` <script>` 标签内的首行，而是在 JavaScript 代码的任何部位都可用，它甚至还能在 Node 中使用。

凑巧的是，这种风格的注释在 ES6 中首次[被标准化](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-html-like-comments)。但这并不是我们将谈论的箭头。

<!--more-->

`-->` 也表示一个单行注释，与 HTML 不同的是，在 HTML 中，`-->` 之前的部分是注释内容，而在 JavaScript 中，在 `-->` 之后的行才是注释。

只有当 `-->` 出现在一行的开始时，才表示该箭头是一个注释，因为在其他情况下，`-->` 是一个操作符（goes to）。

```javascript
function countdown(n) {
  while (n-->0)  // "n goes to zero"
    alert(n);
  blastoff();
}
```
[上面代码是真实能运行的](http://codepen.io/anon/pen/oXZaBY?editors=001)。循环运行直到 `n` 为 `0`，这并不是 ES6 的新特性，但结合我们熟悉的特性，这具有很强的误导性。你能搞明白上面代码的运行情况吗？你可以在 [Stack Overflow](http://stackoverflow.com/questions/1642028/what-is-the-name-of-the-operator) 上找到相应的解答。
 
当然还有一个箭头，那就是小于等于操作符 `<=`，也许你还可以找到使用箭头的地方，但我们还是停下来，看一个我们从没见过的箭头：

- `<!--` 单行注释
- `-->` goes to 操作符
- `<=` 小于等于操作符
- `=>` ???

那么，`=>` 表示什么呢？这就是本文将讨论的话题。

首先，我们来谈谈函数。

## 无处不在的函数表达式

JavaScript 一个有趣的特点是，任何时候你需要一个函数，你可以很方便地创建它们。

例如，为一个按钮绑定点击事件：


```javascript
$("#confetti-btn").click(
```

jQuery 的 `.click()` 方法需要一个函数作为参数，我们可以很方便地就地创建一个函数：

```javascript
$("#confetti-btn").click(function (event) {
  playTrumpet();
  fireConfettiCannon();
});
```

现在对我们来说，编写这样的代码是最自然的事了。但是在 JavaScript 流行起来之前，这种风格的代码看起来还是有些奇怪，因为在其他语言中都没有这样的特性。在 1958 年，Lisp 就有了函数表达式，也叫 lambda 函数，而在存在多年的 C++、Python、C# 和 Java 中没有该特性。

现在，这四门语言都有了 lambda 表达式，而且新出现的语言都普遍内置了 lambda 表达式。如今 JavaScript 也支持该特性了，这必须感谢那些重度依赖 lambda 表达式的库的开发者，这推动了该特性被广泛采纳。

与其他几门语言相比，JavaScript 的语法略显冗长：


```javascript
// A very simple function in six languages.
function (a) { return a > 0; } // JS
[](int a) { return a > 0; }  // C++
(lambda (a) (> a 0))  ;; Lisp
lambda a: a > 0  # Python
a => a > 0  // C#
a -> a > 0  // Java
```

## 箭头函数

ES6 引入了一种新的语法来编写函数：


```javascript
// ES5
var selected = allJobs.filter(function (job) {
  return job.isSelected();
});

// ES6
var selected = allJobs.filter(job => job.isSelected());
```

当你需要只有一个参数的函数，箭头函数的语法可以简化为 `Identifier => Expression`，直接省略了 `function` 和 `return` 关键字，连括号和结尾的分号也同时省略了。

编写一个有多个（或没有参数，或 [Rest 参数和参数默认值](http://bubkoo.com/2015/06/27/es6-in-depth-rest-parameters-and-defaults/)，或[解构](http://bubkoo.com/2015/06/28/es6-in-depth-destructuring/)参数）参数的函数，你需要用括号将参数括起来：


```javascript
// ES5
var total = values.reduce(function (a, b) {
  return a + b;
}, 0);

// ES6
var total = values.reduce((a, b) => a + b, 0);
```

箭头函数还可以与一些工具函数库完美地配合使用，比如  [Underscore.js](http://underscorejs.org/) 和 [Immutable](https://facebook.github.io/immutable-js/)，事实上，[Immutable 文档](https://facebook.github.io/immutable-js/docs/#/)中的例子全部都是使用 ES6 编写，其中有很多已经使用到了箭头函数。


函数体除了使用一个表达式外，箭头函数还可以包含一个语句块，回忆之前我们提到过的例子：


```javascript
// ES5
$("#confetti-btn").click(function (event) {
  playTrumpet();
  fireConfettiCannon();
});
```

下面是采用箭头函数的写法：


```javascript
// ES6
$("#confetti-btn").click(event => {
  playTrumpet();
  fireConfettiCannon();
});
```

需要注意的是，使用语句块的箭头函数不会自动返回一个值，必须显式地使用 `return` 来返回一个值。

还有一个忠告，当使用箭头函数来返回一个对象时，始终使用括号将返回的对象括起来：


```javascript
// create a new empty object for each puppy to play with
var chewToys = puppies.map(puppy => {});   // BUG!
var chewToys = puppies.map(puppy => ({})); // ok
```

因为空对象 `{}` 与空语句块 `{}` 看上去一模一样，ES6 将始终把紧跟在 `=>` 后面的 `{` 当作语句块的开始，而不是一个对象的开始，那么 `puppy => {}` 就被解析为一个没有函数体的箭头函数，而且返回值为 `undefined`。

## this 关键字

箭头函数和普通函数有一个微妙的区别，那就是**箭头函数没有它们自己的 `this`**，箭头函数中的 `this` 值始终来自闭包所在的作用域。

开始实际例子前，我们一起来回顾一些知识点。

在 JavaScript 中 `this` 是如何工作的？它的值来自哪里？[这里](http://stackoverflow.com/questions/3127429/how-does-the-this-keyword-work)有一个简短的回答。如果这个问题对你来说非常简单，说明你已经有一定的实践经验了。

之所以这个问题被频繁地提出，是因为函数都是自动判断其 `this` 值，而不管你是否使用到了 `this` 的值。你是否也写过下面这样的 hack 代码：

```javascript
{
  ...
  addAll: function addAll(pieces) {
    var self = this;
    _.each(pieces, function (piece) {
      self.add(piece);
    });
  },
  ...
}
```

内部函数仅仅是为了调用外部对象中的 `.add(piece)` 方法，但内部函数并没有继承外部函数的 `this`，在内部函数中，`this` 的值可能是 `window` 或 `undeinfed`。这里使用了 `self` 这个临时变量来将外部函数中的 `this` 值传递到内部函数中（也可以使用 `.bind(this)` 的方式，但两个方式都不是特别漂亮）。

在 ES6 中，如果你遵循以下规则，那么你就再也不会写出上面的 hack 代码了：

- 调用对象的方法时，使用 `object.method()` 语法，这样将通过调用者为这些方法提供一个有意义的 `this` 值
- 其他情况请使用箭头函数


```javascript
// ES6
{
  ...
  addAll: function addAll(pieces) {
    _.each(pieces, piece => this.add(piece));
  },
  ...
}
```

在上面的 ES6 实现中，`addAll` 方法将通过调用者获取到 `this` 的值，内部函数中使用了箭头函数，所以将从闭包区域继承 `this` 的值。

ES6 还提供了一种更简短的方式来书写对象字面量中的方法，以上代码可以简化为：


```javascript
// ES6 with method syntax
{
  ...
  addAll(pieces) {
    _.each(pieces, piece => this.add(piece));
  },
  ...
}
```

箭头函数与普通函数还有一个区别，那就是箭头函数中不能使用 `arguments` 对象。当然，你可以使用 rest 参数和参数默认值。

## 使用箭头来刺穿计算机的黑暗心脏

我们已经讨论了箭头函数的实际用途，这里还有一点我想谈谈：ES6 的箭头函数可以作为一个学习工具，来探索计算机世界中一些深层次的东西。本节的东西不一定实用，你可以自己决定是否跳过本节。

在 1936 年，阿隆佐·邱奇（Alonzo Church）和阿兰·图灵（Alan Turing）开始独立研发强大的计算机模型。图灵称他的模型为 *a-machines*，但人们都称其为图灵机。邱奇编写了一种函数机制，他的模型被称为 [λ 表达式](https://en.wikipedia.org/wiki/Lambda_calculus)（λ 是小写希腊字母 lambda），这是 Lisp 使用 LAMBDA 来表示函数的原因，同时也是为什么我们今天将函数表达式称为 "lambda" 表达式的原因。

但 λ 表达式是什么呢？“计算模型”又是什么意思呢？

这很难用简单几句话就表达清楚，但我尽力：λ 表达式是最早的编程语言之一，但这并不是 λ 表达式的设计初衷，毕竟一个程序语言不会延续十年或二十年，但 λ 表达式是一个非常简单、纯粹并符合数学思想的语言，可以表达任何形式的计算。邱奇希望通过该模型来证明计算相关的一切事情。

他发现，在他的模型中只需要一个东西：*function*。

想象一下该机制是多么强大，不需要对象、数组、数字，不需要 `if` 语句和 `while` 循环，不需要分号、赋值语句、逻辑操作符和事件循环，只使用函数就可以实现 JavaScript 中的任何运算。

下面是使用 λ 表达式实现的一个排序程序：


```javascript
fix = λf.(λx.f(λv.x(x)(v)))(λx.f(λv.x(x)(v)))
```

等价的 JavaScript 函数是：

```javascript
var fix = f => (x => f(v => x(x)(v)))
               (x => f(v => x(x)(v)));
```

也就是说，JavaScript 包含了一个 λ 表达式的运行时实例，λ 表达式存在于 JavaScript 内部。

关于邱奇以及之后的研究者与 λ 表达式之间的故事，以及 λ 表达式如何悄然成为每种编程语言中的主要实现的故事，已经超出了本文的范围。但如果你对计算机基础科学感兴趣，或者你只想了解如何在一门语言中只使用函数来实现循环和递归，你可以在某个下雨的下午研究一下  [Church numerals](https://en.wikipedia.org/wiki/Church_encoding) 和 [fixed-point combinators](https://en.wikipedia.org/wiki/Fixed-point_combinator#Strict_fixed_point_combinator)，并在 Firefox 的控制台或 [Scratchpad](https://developer.mozilla.org/en-US/docs/Tools/Scratchpad) 中实践一下。有了 ES6 中的箭头函数的优势，JavaScript 可以称为探索 λ 表达式最好的语言。

## 兼容性

早在 2013 年，原文作者就在 Firefox 中实现了箭头函数，Mooij 使其运行得更加快，还要感谢 Tooru Fujisawa 和 ziyunfei 的补丁。

微软的 Edge 的预览版中也已经实现了箭头函数，若果你现在就想在 Web 开发中使用箭头函数，你可以借助 [Babel](http://babeljs.io/), [Traceur](https://github.com/google/traceur-compiler#what-is-traceur) 和 [TypeScript](http://www.typescriptlang.org/)。


下周我们将讨论一个比较陌生的特性，我们将看到 `typeof x` 将返回一个从未见过的值。

<p class="j-quote">参考原文：[ES6 In Depth: Arrow functions](https://hacks.mozilla.org/2015/06/es6-in-depth-arrow-functions/)
原文作者：[Jason Orendorff](https://hacks.mozilla.org/author/jorendorffmozillacom/) 
原文日期：2015-06-04 16:25</p>