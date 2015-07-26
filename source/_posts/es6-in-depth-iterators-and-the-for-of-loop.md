title: 深入解析 ES6：Iterator 和 for-of 循环
tags:
  - ES6
categories:
  - JavaScript
date: 2015-06-15 02:28:29
updated: 2015-06-15 02:28:29
keywords:
---

如何遍历一个数组的元素？在 20 年前，当 JavaScript 出现时，你也许会这样做：

```javascript
for (var index = 0; index < myArray.length; index++) {
  console.log(myArray[index]);
}
```
自从 ES5 开始，你可以使用内置的 `forEach` 方法：

```javascript
myArray.forEach(function (value) {
  console.log(value);
});
```
代码更为精简，但有一个小缺点：不能使用 `break` 语句来跳出循环，也不能使用 `return` 语句来从闭包函数中返回。

如果有 `for-` 这种语法来遍历数组就会方便很多。

<!--more-->

那么，使用 `for-in` 怎么样？

```javascript
for (var index in myArray) { // 实际代码中不要这么做
  console.log(myArray[index]);
}
```

这样不好，因为： 
 
- 上面代码中的 `index` 变量将会是 `"0"`、`"1"`、`"3"` 等这样的字符串，而并不是数值类型。如果你使用字符串的 `index` 去参与某些运算（`"2" + 1 == "21"`），运算结果可能会不符合预期。 
- 不仅数组本身的元素将被遍历到，那些由用户添加的[附加（expando）元素](https://developer.mozilla.org/en-US/docs/Glossary/Expando)也将被遍历到，例如某数组有这样一个属性 `myArray.name`，那么在某次循环中将会出现 `index="name"` 的情况。而且，甚至连数组原型链上的属性也可能被遍历到。 
- 最不可思议的是，在某些情况下，上面代码将会以任意顺序去遍历数组元素。

简单来说，`for-in` 设计的目的是用于遍历包含键值对的对象，对数组并不是那么友好。

## 强大的 for-of 循环

记得上次我提到过，ES6 并不会影响现有 JS 代码的正常运行，已经有成千上万的 Web 应用都依赖于 `for-in` 的特性，甚至也依赖 `for-in` 用于数组的特性，所以从来就没有人提出“改善”现有 `for-in` 语法来修复上述问题。ES6 解决该问题的唯一办法是引入新的循环遍历语法。

这就是新的语法：

```javascript
for (var value of myArray) {
  console.log(value);
}
```

通过介绍上面的 `for-in` 语法，这个语法看起来并不是那么令人印象深刻。后面我们将详细介绍 `for-of` 的奇妙之处，现在你只需要知道：

- 这是遍历数组最简单直接的方法
- 避免了所有 `for–in` 语法存在的坑
- 与 `forEach()` 不同的是，它支持 `break`、`continue` 和 `return` 语句。

`for–in` 用于遍历对象的属性。

`for-of` 用于遍历数据 -- 就像数组中的元素。

然而，这还不是 `for-of` 的所有特性，下面还有更精彩的部分。

## 支持 for-of 的其他集合

`for-of` 不仅仅是为数组设计，还可以用于类数组的对象，比如 DOM 对象的集合 [NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList)。

也可以用于遍历字符串，它将字符串看成是 Unicode 字符的集合：


```javascript
for (var chr of "😺😲") {
  alert(chr);
}
```

它还适用于 `Map` 和 `Set` 对象。

也许你从未听说过 `Map` 和 `Set` 对象，因为它们是 ES6 中的新对象，后面将有单独的文章去详细介绍它们。如果你在其他语言中使用过这两个对象，那就简单多了。

例如，可以用一个 `Set` 对象来对数组元素去重：

```javascript
// make a set from an array of words
var uniqueWords = new Set(words);
```

当得到一个 `Set` 对象后，你很可能会去遍历该对象，这很简单：

```javascript
for (var word of uniqueWords) {
  console.log(word);
}
```

`Map` 对象由键值对构成，遍历方式略有不同，你需要用两个独立的变量来分别接收键和值：

```javascript
for (var [key, value] of phoneBookMap) {
  console.log(key + "'s phone number is: " + value);
}
```

到目前为止，你已经知道：JS 已经支持一些集合对象，而且后面将会支持更多。`for-of` 语法正是为这些集合对象而设计。

`for-of` 不能直接用来遍历对象的属性，如果你想遍历对象的属性，你可以使用 `for-in` 语句（`for-in` 就是用来干这个的），或者使用下面的方式：

```javascript
// dump an object's own enumerable properties to the console
for (var key of Object.keys(someObject)) {
  console.log(key + ": " + someObject[key]);
}
```

## 内部原理

> “好的艺术家复制，伟大的艺术家偷窃。” -- 巴勃罗·毕加索

被添加到 ES6 中的那些新特性并不是无章可循，大多数特性都已经被使用在其他语言中，而且事实也证明这些特性很有用。

就拿 `for-of` 语句来说，在 C++、JAVA、C# 和 Python 中都存在类似的循环语句，并且用于遍历这门语言和其标准库中的各种数据结构。

与其他语言中的 `for` 和 `foreach` 语句一样，`for-of` **要求被遍历的对象实现特定的方法**。所有的 `Array`、`Map` 和 `Set` 对象都有一个共性，那就是他们都实现了一个迭代器（iterator）方法。

那么，只要你愿意，对其他任何对象你都可以实现一个迭代器方法。

这就像你可以为一个对象实现一个 `myObject.toString（）` 方法，来告知 JS 引擎如何将一个对象转换为字符串；你也可以为任何对象实现一个 `myObject[Symbol.iterator]()` 方法，来告知 JS 引擎如何去遍历该对象。

例如，如果你正在使用 jQuery，并且非常喜欢用它的 `each()` 方法，现在你想使所有的 jQuery 对象都支持 `for-of` 语句，你可以这样做：

```javascript
// Since jQuery objects are array-like,
// give them the same iterator method Arrays have
jQuery.prototype[Symbol.iterator] =
  Array.prototype[Symbol.iterator];
```

你也许在想，为什么 `[Symbol.iterator]` 语法看起来如此奇怪？这句话到底是什么意思？问题的关键在于方法名，ES 标准委员会完全可以将该方法命名为 `iterator()`，但是，现有对象中可能已经存在名为“iterator”的方法，这将导致代码混乱，违背了最大兼容性原则。所以，标准委员会引入了 `Symbol`，而不仅仅是一个字符串，来作为方法名。

`Symbol` 也是 ES6 的新特性，后面将会有单独的文章来介绍。现在你只需要知道标准委员会引入全新的 `Symbol`，比如 `Symbol.iterator`，是为了不与之前的代码冲突。唯一不足就是语法有点奇怪，但对于这个强大的新特性和完美的后向兼容来说，这个就显得微不足道了。

一个拥有 `[Symbol.iterator]()` 方法的对象被认为是可遍历的（iterable）。在后面的文章中，我们将看到“可遍历对象”的概念贯穿在整个语言中，不仅在 `for-of` 语句中，而且在 `Map` 和 `Set` 的构造函数和析构（Destructuring）函数中，以及新的扩展操作符中，都将涉及到。

## 迭代器对象

通常我们不会完完全全从头开始去实现一个迭代器（Iterator）对象，下一篇文章将告诉你为什么。但为了完整起见，让我们来看看一个迭代器对象具体是什么样的。（如果你跳过了本节，你将会错失某些技术细节。）

就拿 `for-of` 语句来说，它首先调用被遍历集合对象的 `[Symbol.iterator]()` 方法，该方法返回一个迭代器对象，迭代器对象可以是拥有 `.next` 方法的任何对象；然后，在 `for-of` 的每次循环中，都将调用该迭代器对象上的 `.next` 方法。下面是一个最简单的迭代器对象：


```javascript
var zeroesForeverIterator = {
  [Symbol.iterator]: function () {
    return this;
  },
  next: function () {
    return {done: false, value: 0};
  }
};
```

在上面代码中，每次调用 `.next()` 方法时都返回了同一个结果，该结果一方面告知 `for-of` 语句循环遍历还没有结束，另一方面告知 `for-of` 语句本次循环的值为 `0`。这意味着 `for (value of zeroesForeverIterator) {}` 是一个死循环。当然，一个典型的迭代器不会如此简单。

ES6 的迭代器通过 `.done` 和 `.value` 这两个属性来标识每次的遍历结果，这就是迭代器的设计原理，这与其他语言中的迭代器有所不同。在 Java 中，迭代器对象要分别使用 `.hasNext()` 和 `.next()` 两个方法。在 Python 中，迭代器对象只有一个 `.next()` 方法，当没有可遍历的元素时将抛出一个 `StopIteration` 异常。但从根本上说，这三种设计都返回了相同的信息。

迭代器对象可以还可以选择性地实现 `.return()` 和 `.throw(exc)` 这两个方法。如果由于异常或使用 `break` 和 `return` 操作符导致循环提早退出，那么迭代器的 `.return()` 方法将被调用，可以通过实现 `.return()` 方法来释放迭代器对象所占用的资源，但大多数迭代器都不需要实现这个方法。`throw(exc)` 更是一个特例：在遍历过程中该方法永远都不会被调用，关于这个方法，我会在下一篇文章详细介绍。

现在我们知道了 `for-of` 的所有细节，那么我们可以简单地重写该语句。

首先是 `for-of` 循环体：

```javascript
for (VAR of ITERABLE) {
  STATEMENTS
}
```
这只是一个语义化的实现，使用了一些底层方法和几个临时变量：

```javascript
var $iterator = ITERABLE[Symbol.iterator]();
var $result = $iterator.next();
while (!$result.done) {
  VAR = $result.value;
  STATEMENTS
  $result = $iterator.next();
}
```

上面代码并没有涉及到如何调用 `.return()` 方法，我们可以添加相应的处理，但我认为这样会影响我们对内部原理的理解。`for-of` 语句使用起来非常简单，但在其内部有非常多的细节。

## 兼容性

目前，所有 Firefox 的 Release 版本都已经支持 `for-of` 语句。Chrome 默认禁用了该语句，你可以在地址栏输入 `chrome://flags` 进入设置页面，然后勾选其中的 "Experimental JavaScript" 选项。微软的 Spartan 浏览器也支持该语句，但是 IE 不支持。如果你想在 Web 开发中使用该语句，而且需要兼容 IE 和 Safari 浏览器，你可以使用 [Babel](http://babeljs.io/) 或 Google 的 [Traceur](https://github.com/google/traceur-compiler#what-is-traceur) 这类编译器，来将 ES6 代码转换为 Web 友好的 ES5 代码。

对于服务器端，我们不需要任何编译器 -- 可以在 io.js 中直接使用该语句，或者在 NodeJS 启动时使用 `--harmony` 启动选项。

## {done: true}

到此，今天的话题已经结束，但对于 `for-of` 的话题还没有结束。

在 ES6 中还有一个新对象，该对象可以与 `for-of` 语句完美地结合使用，今天我并没有提及该对象，因为这是下篇文章我们讨论的主题，我认为这个新对象是 ES6 中最大的特性。如果你还没有在 Python 或 C# 中接触过该对象，你会认为这太奇妙了，但这是编写一个迭代器的最简单的方法，而且它对代码重构非常有用，它还可能改变我们处理异步代码的方式。所以，接着关注我的下篇关于 Generator 的讨论。

<p class="j-quote">参考原文：[ES6 In Depth: Iterators and the for-of loop](https://hacks.mozilla.org/2015/04/es6-in-depth-iterators-and-the-for-of-loop/)
原文作者：[Jason Orendorff](https://hacks.mozilla.org/author/jorendorffmozillacom/) 
原文日期：2015-04-29 11:39</p>