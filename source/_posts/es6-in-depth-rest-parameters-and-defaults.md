title: 深入解析 ES6：Rest 参数和参数默认值
tags:
  - ES6
categories:
  - JavaScript
date: 2015-06-27 17:36:05
updated: 2015-06-27 17:36:05
keywords:
---

本文将讨论使 JavaScript 函数更有表现力的两个特性：Rest 参数和参数默认值。

## Rest 参数

通常，我们需要创建一个可变参数的函数，可变参数是指函数可以接受任意数量的参数。例如，[`String.prototype.concat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/concat) 可以接受任何数量的字符串作为参数。使用 Rest 参数，ES6 为我们提供一种新的方式来创建可变参数的函数。

我们来实现一个示例函数 `containsAll`，用于检查一个字符串中是否包含某些子字符串。例如，`containsAll("banana", "b", "nan")` 将返回`true`，`containsAll("banana", "c", "nan")` 将返回 `false`。

下面是传统的实现方式：

```javascript
function containsAll(haystack) {
  for (var i = 1; i < arguments.length; i++) {
    var needle = arguments[i];
    if (haystack.indexOf(needle) === -1) {
      return false;
    }
  }
  return true;
}
```

<!--more-->

该实现用到了 [arguments](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments) 对象，该对象是一个类数组对象，包含函数被调用时的实参列表。这段代码正是我们想要的，但其可读性却不是最优的。函数只有一个形参 `haystack`，所以不可能一看就知道该函数需要多个参数，并且在遍历 `arguments` 时，需要特别注意遍历的开始索引为 `1` ，而不是常见的 `0`，因为 `arguments[0]` 就是函数定义时的形参 `haystack`。如果我们想在 `haystack` 参数之前或之后添加一些参数，我们不得不更新内部的循环。Rest 参数解决了这些问题，下面是 使用 Rest 参数的实现方式：

```javascript
function containsAll(haystack, ...needles) {
  for (var needle of needles) {
    if (haystack.indexOf(needle) === -1) {
      return false;
    }
  }
  return true;
}
```

以上两个实现都满足了我们的需求，但后者包含一个特殊的 `...needles` 语法。我们来看看调用 `containsAll("banana", "b", "nan")` 时的细节，参数 `haystack` 和以往一样，将用函数的第一个实参填充，值为 `"banana"`，`needles` 前面的省略号表示它是一个 Rest 参数，剩余的所有实参将被放入一个数组中，并将该数组赋给 `needles` 遍量。在这个调用中，`needles` 的值为 `["b", "nan"]`。然后，就是正常的函数执行了。

只能将函数的最后一个函数作为 Rest 参数，在函数被调用时，Rest 参数之前的参数都将被正常填充，之外的参数将被放入一个数组中，并将该数组作为 Rest 参数的值，如果没有更多的参数，那么 Rest 参数的值为一个空数组 `[]`，Rest 参数的值永远都不会是 `undefined`。

## 参数的默认值

通常，调用一个函数时，不需要调用者传递所有可能的参数，那些没有传递的参数都需要一个合理的默认值。JavaScript 对那些没有传递的参数都有一个固定的默认值 `undefined`。在 ES6 中，引入了一种新方法来指定任意参数的默认值。

看下面例子：

```javascript
function animalSentence(animals2="tigers", animals3="bears") {
    return `Lions and ${animals2} and ${animals3}! Oh my!`;
}
```

在每个参数的 `=` 后面是一个表达式，指定了参数未传递时的默认值。所以，`animalSentence()` 返回 `"Lions and tigers and bears! Oh my!"`， `animalSentence("elephants")` 返回 `"Lions and elephants and bears! Oh my!"`， `animalSentence("elephants", "whales")` 返回 `"Lions and elephants and whales! Oh my!"`。 

参数默认值需要注意的几个细节：

- 与 Python 不一样的是，**参数默认值的表达式是在函数调用时从左到右计算的**，这意味着表达式可以使用前面已经被填充的参数。例如，我们可以将上面的函数变得更有趣一点：

```javascript
function animalSentenceFancy(animals2="tigers",
    animals3=(animals2 == "bears") ? "sealions" : "bears")
{
  return `Lions and ${animals2} and ${animals3}! Oh my!`;
}
```

那么，`animalSentenceFancy("bears")` 将返回 `"Lions and bears and sealions. Oh my!"`。

- 传递 `undefined` 等同于没有传递该参数。因此，`animalSentence(undefined, "unicorns")` 将返回 `"Lions and tigers and unicorns! Oh my!"`。

- 如果没有为一个参数指定默认值，那么该参数的默认值为 `undefined`，所以

```javascript
function myFunc(a=42, b) {...}
```
等同于


```javascript
function myFunc(a=42, b=undefined) {...}
```

## 抛弃 arguments

通过 Rest 参数和参数的默认值，我们可以完全抛弃 `arguments` 对象，使我们的代码可读性更高。此外，`arguments` 对象也加深了[优化 JavaScript 的难题](https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments)。 

希望以上两个新特性可以完全取代 `arguments`。作为第一步，在使用 Rest 参数或参数的默认值时，请避免使用 `arguments` 对象，假如 `arguments` 对象还不会立即被移除，或者永远不会，那么也最好是避免在使用 Rest 参数或参数默认值时使用 `arguments` 对象。

## 兼容性

Firefox 15 以上的版本已经支持这两个新特性。然而，除此之外，还没有其他任何浏览器支持。最近，V8 的[实验环境添加了对 Rest 参数的支持](https://code.google.com/p/v8/issues/detail?id=2159)，而参数默认值还有一个 [issue](https://code.google.com/p/v8/issues/detail?id=2160)，JSC 也对 [Rest 参数](https://bugs.webkit.org/show_bug.cgi?id=38408)和[参数默认值](https://bugs.webkit.org/show_bug.cgi?id=38409)提了一些 issue。

 [Babel](http://babeljs.io/) 和 [Traceur](https://github.com/google/traceur-compiler#what-is-traceur) 这两个编译器都已经支持了参数默认值，所以你可以大胆使用。
 
##  结论

尽管从技术层面上看，这两个新特性在并没有给函数引入新的行为，但它们可以使一些函数的声明更具表现力和可读性。

<p class="j-quote">参考原文：[ES6 In Depth: Rest parameters and defaults](https://hacks.mozilla.org/2015/05/es6-in-depth-rest-parameters-and-defaults/)
原文作者：[Jason Orendorff](https://hacks.mozilla.org/author/jorendorffmozillacom/) 
原文日期：2015-05-21 13:32</p>
