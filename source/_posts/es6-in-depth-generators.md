title: 深入解析 ES6：Generator
tags:
  - ES6
categories:
  - JavaScript
date: 2015-06-20 17:35:22
updated: 2015-06-20 17:35:22
keywords:
---

今天讨论的新特性让我非常兴奋，因为这个特性是 ES6 中最神奇的特性。

这里的“神奇”意味着什么呢？对于初学者来说，该特性与以往的 JS 完全不同，甚至有些晦涩难懂。从某种意义上说，它完全改变了这门语言的通常行为，这不是“神奇”是什么呢。

不仅如此，该特性还可以简化程序代码，将复杂的“回调堆栈”改成直线执行的形式。

我是不是铺垫的太多了？下面开始深入介绍，你自己去判断吧。

<!--more-->

## 简介

什么是 Generator？

看下面代码：

```javascript
function* quips(name) {
  yield "hello " + name + "!";
  yield "i hope you are enjoying the blog posts";
  if (name.startsWith("X")) {
    yield "it's cool how your name starts with X, " + name;
  }
  yield "see you later!";
}
```

上面代码是模仿 [Talking cat](http://people.mozilla.org/~jorendorff/demos/meow.html)（当下一个非常流行的应用）的一部分，[点击这里](http://people.mozilla.org/~jorendorff/demos/meow.html)试玩，如果你对代码感到困惑，那就回到这里来看下面的解释。

这看上去很像一个函数，这被称为 Generator 函数，它与我们常见的函数有很多共同点，但还可以看到下面两个差异：

- 通常的函数以 `function` 开始，但 Generator 函数以 `function*` 开始。
- 在 Generator 函数内部，`yield` 是一个关键字，和 `return` 有点像。不同点在于，所有函数（包括 Generator 函数）都只能返回一次，而在 Generator 函数中可以 yield 任意次。*yield 表达式暂停了 Generator 函数的执行，然后可以从暂停的地方恢复执行。*

常见的函数不能暂停执行，而 Generator 函数可以，这就是这两者最大的区别。

## 原理

调用 `quips()` 时发生了什么？

```javascript
> var iter = quips("jorendorff");
  [object Generator]
> iter.next()
  { value: "hello jorendorff!", done: false }
> iter.next()
  { value: "i hope you are enjoying the blog posts", done: false }
> iter.next()
  { value: "see you later!", done: false }
> iter.next()
  { value: undefined, done: true }
```

我们对普通函数的行为非常熟悉，函数被调用时就立即执行，直到函数返回或抛出一个异常，这是所有 JS 程序员的第二天性。

Generator 函数的调用方法与普通函数一样：`quips("jorendorff")`，但调用一个 Generator 函数时并没有立即执行，而是返回了一个 Generator 对象（上面代码中的 `iter`），这时函数就立即暂停在函数代码的第一行。

每次调用 Generator 对象的 `.next()` 方法时，函数就开始执行，直到遇到下一个 yield 表达式为止。

这就是为什么我们每次调用 `iter.next()` 时都会得到一个不同的字符串，这些都是在函数内部通过 yield 表达式产生的值。

当执行最后一个 `iter.next()` 时，就到达了 Generator 函数的末尾，所以返回结果的 `.done` 属性值为 `true`，并且 `.value` 属性值为 `undefined`。

现在，回到 [Talking cat](http://people.mozilla.org/~jorendorff/demos/meow.html) 的 DEMO，尝试在代码中添加一些 yield 表达式，看看会发生什么。

从技术层面上讲，每当 Generator 函数执行遇到 yield 表达式时，函数的栈帧 -- 本地变量，函数参数，临时值和当前执行的位置，就从堆栈移除，但是 Generator 对象保留了对该栈帧的引用，所以下次调用 `.next()` 方法时，就可以恢复并继续执行。

值得提醒的是 Generator 并不是多线程。在支持多线程的语言中，同一时间可以执行多段代码，并伴随着执行资源的竞争，执行结果的不确定性和较好的性能。而 Generator 函数并不是这样，当一个 Generator 函数执行时，它与其调用者都在同一线程中执行，每次执行顺序都是确定的，有序的，并且执行顺序不会发生改变。与线程不同，Generator 函数可以在内部的 yield 的标志点暂停执行。

通过介绍 Generator 函数的暂停、执行和恢复执行，我们知道了什么是 Generator 函数，那么现在抛出一个问题：Generator 函数到底有什么用呢？

## 迭代器

通过上篇文章，我们知道迭代器并不是 ES6 的一个内置的类，而只是作为语言的一个扩展点，你可以通过实现 `[Symbol.iterator]()` 和 `.next()` 方法来定义一个迭代器。

但是，实现一个接口还是需要写一些代码的，下面我们来看看在实际中如何实现一个迭代器，以实现一个 `range` 迭代器为例，该迭代器只是简单地从一个数累加到另一个数，有点像 C 语言中的 `for (;;)` 循环。

```javascript
// This should "ding" three times
for (var value of range(0, 3)) {
  alert("Ding! at floor #" + value);
}
```

现在有一个解决方案，就是使用 ES6 的类。（如果你对 `class` 语法还不熟悉，不要紧，我会在将来的文章中介绍。）

```javascript
class RangeIterator {
  constructor(start, stop) {
    this.value = start;
    this.stop = stop;
  }

  [Symbol.iterator]() { return this; }

  next() {
    var value = this.value;
    if (value < this.stop) {
      this.value++;
      return {done: false, value: value};
    } else {
      return {done: true, value: undefined};
    }
  }
}

// Return a new iterator that counts up from 'start' to 'stop'.
function range(start, stop) {
  return new RangeIterator(start, stop);
}
```

[查看该 DEMO](http://codepen.io/anon/pen/NqGgOQ)。

这种实现方式与 [Java](http://gafter.blogspot.com/2007/07/internal-versus-external-iterators.html) 和 [Swift](https://schani.wordpress.com/2014/06/06/generators-in-swift/) 的实现方式类似，看上去还不错，但还不能说上面代码就完全正确，代码没有任何 Bug？这很难说。我们看不到任何传统的 `for (;;)` 循环代码：迭代器的协议迫使我们将循环拆散了。

在这一点上，你也许会对迭代器不那么热衷了，它们使用起来很方便，但是实现起来似乎很难。

我们可以引入一种新的实现方式，以使得实现迭代器更加容易。上面介绍的 Generator 可以用在这里吗？我们来试试：

```javascript
function* range(start, stop) {
  for (var i = start; i < stop; i++)
    yield i;
}
```
[查看该 DEMO](http://codepen.io/anon/pen/mJewga)。

上面这 4 行代码就可以完全替代之前的那个 23 行的实现，替换掉整个 `RangeIterator` 类，这是因为 Generator 天生就是迭代器，所有的 Generator 都原生实现了 `.next()` 和 `[Symbol.iterator]()` 方法。你只需要实现其中的循环逻辑就够了。

不使用 Generator 去实现一个迭代器就像被迫写一个很长很长的邮件一样，本来简单的表达出你的意思就可以了，`RangeIterator` 的实现是冗长和令人费解的，因为它没有使用循环语法去实现一个循环功能。使用 Generator 才是我们需要掌握的实现方式。

我们可以使用作为迭代器的 Generator 的哪些功能呢？

- **使任何对象可遍历** -- 编写一个 Genetator 函数去遍历 `this`，每遍历到一个值就 yield 一下，然后将该 Generator 函数作为要遍历的对象上的 `[Symbol.iterator]` 方法的实现。
- **简化返回数组的函数** -- 假如有一个每次调用时都返回一个数组的函数，比如：

```javascript
// Divide the one-dimensional array 'icons'
// into arrays of length 'rowLength'.
function splitIntoRows(icons, rowLength) {
  var rows = [];
  for (var i = 0; i < icons.length; i += rowLength) {
    rows.push(icons.slice(i, i + rowLength));
  }
  return rows;
}
```

使用 Generator 可以简化这类函数：

```javascript
function* splitIntoRows(icons, rowLength) {
  for (var i = 0; i < icons.length; i += rowLength) {
    yield icons.slice(i, i + rowLength);
  }
}
```
这两者唯一的区别在于，前者在调用时计算出了所有结果并用一个数组返回，后者返回的是一个迭代器，结果是在需要的时候才进行计算，然后一个一个地返回。

- **无穷大的结果集** -- 我们不能构建一个无穷大的数组，但是我们可以返回一个生成无尽序列的 Generator，并且每个调用者都可以从中获取到任意多个需要的值。
- **重构复杂的循环** -- 你是否想将一个复杂冗长的函数重构为两个简单的函数？Generator 是你重构工具箱中一把新的瑞士军刀。对于一个复杂的循环，我们可以将生成数据集那部分代码重构为一个 Generator 函数，然后用 `for-of` 遍历：`for (var data of myNewGenerator(args))`。
- **构建迭代器的工具** -- ES6 并没有提供一个可扩展的库，来对数据集进行 `filter` 和 `map` 等操作，但 Generator 可以用几行代码就实现这类功能。

例如，假设你需要在 Nodelist 上实现与 `Array.prototype.filter` 同样的功能的方法。小菜一碟的事：

```javascript
function* filter(test, iterable) {
  for (var item of iterable) {
    if (test(item))
      yield item;
  }
}
```

所以，Generator 很实用吧？当然，这是实现自定义迭代器最简单直接的方式，并且，在 ES6 中，迭代器是数据集和循环的新标准。

但，这还不是 Generator 的全部功能。

## 异步代码

下面是我之前写过的 JS 代码（表示代码缩进层次太多）：

```javascript
          };
        })
      });
    });
  });
});
```

你也许也写过这样的代码。[异步 API](http://www.html5rocks.com/en/tutorials/async/deferred/) 通常都需要一个回调函数，这意味着每次你都需要编写一个匿名函数来处理异步结果。如果同时处理三个异步事务，我们看到的是三个缩进层次的代码，而不仅仅是三行代码。

看下面代码：

```javascript
}).on('close', function () {
  done(undefined, undefined);
}).on('error', function (error) {
  done(error);
});
```

异步 API 通常都有错误处理的约定，不同的 API 有不同的约定。大多数情况下，错误是默认丢弃的，甚至有些将成功也默认丢弃了。

直到现在，这些问题仍是我们处理异步编程必须付出的代价，而且我们也已经接受了异步代码只是看不来不像同步代码那样简单和友好。

Generator 给我们带来了希望，我们可以不再采用上面的方式。

[Q.async()](https://github.com/kriskowal/q/tree/v1/examples/async-generators)是一个将 Generator 和 Promise 结合起来处理异步代码的实验性尝试，让我们的异步代码类似于相应的同步代码。

例如： 

```javascript
// Synchronous code to make some noise.
function makeNoise() {
  shake();
  rattle();
  roll();
}

// Asynchronous code to make some noise.
// Returns a Promise object that becomes resolved
// when we're done making noise.
function makeNoise_async() {
  return Q.async(function* () {
    yield shake_async();
    yield rattle_async();
    yield roll_async();
  });
}
```

最大的区别在于，需要在每个异步方法调用的前面添加 `yield` 关键字。

在 `Q.async` 中，添加一个 `if` 语句或 `try-catch` 异常处理，就和在同步代码中的方式一样，与其他编写异步代码的方式相比，减少了很多学习成本。

如果你想深入阅读，可以参考 James Long 的[文章](http://jlongster.com/A-Study-on-Solving-Callbacks-with-JavaScript-Generators)。

Generator 为我们提供了一种更适合人脑思维方式的异步编程模型。但更好的语法也许更有帮助，在 ES7 中，一个基于 Promise 和 Generator 的异步处理函数正在规划之中，灵感来自 C# 中类似的特性。

## 兼容性

在服务器端，现在就可以直接在 io.js 中使用 Generator（或者在 NodeJs 中以 `--harmony` 启动参数来启动 Node）。

在浏览器端，目前只有 Firefox 27 和 Chrome 39 以上的版本才支持 Generator，如果想直接在 Web 上使用，你可以使用 [Babel](http://babeljs.io/) 或 Google 的 [Traceur](https://github.com/google/traceur-compiler#what-is-traceur) 将 ES6 代码转换为 Web 友好的 ES5 代码。

一些题外话：JS 版本的 Generator 最早是由 Brendan Eich 实现，他借鉴了 [Python Generator](https://www.python.org/dev/peps/pep-0255/) 的实现，该实现的灵感来自 [Icon](http://www.cs.arizona.edu/icon/)，早在 [2006 年](https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/1.7)的 Firefox 2.0 就吸纳了 Generator。但标准化的道路是坎坷的，一路下来，其语法和行为都发生了很多改变，Firefox 和 Chrome 中的 ES6 Generator 是由 [Andy Wingo](http://wingolog.org/) 实现 ，这项工作是由 Bloomberg 赞助的。


## yield;

关于 Generator 还有一些未提及的部分，我们还没有涉及到 `.throw()` 和 `.return()` 方法的使用，`.next()` 方法的可选参数，还有 `yield*` 语法。但我认为这篇文章已经够长了，就像 Generator 一样，我们也暂停一下，另外找个时间再剩余的部分。

我们已经介绍了 ES6 中两个非常重要的特性，那么现在可以大胆地说，ES6 将改变我们的生活，看似简单的特性，却有极大的用处。

接下来将介绍一个你每天写的代码都将接触到的特性 -- template string。
 

<p class="j-quote">参考原文：[ES6 In Depth: Generators](https://hacks.mozilla.org/2015/05/es6-in-depth-generators/)
原文作者：[Jason Orendorff](https://hacks.mozilla.org/author/jorendorffmozillacom/) 
原文日期：2015-04-29 11:39</p>