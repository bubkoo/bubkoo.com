title: 深入解析 ES6：Symbol
tags:
  - ES6
categories:
  - JavaScript
date: 2015-07-24 01:39:57
updated: 2015-07-24 01:39:57
keywords:
---

Symbol 是什么？

Symbols 不是图标，也不是指在代码中可以使用小图片：

```javascript
let 😻 = 😺 × 😍;  // SyntaxError
```

也不是指代其他一些东西的语法。那么，Symbol 到究竟是什么呢？

<!--more-->

## 七种数据类型

JavaScript 在 1997 年被标准化时，就有 6 种数据类型，直到 ES6 出现之前，程序中的变量一定是以下 6 种数据类型之一：

- Undefined
- Null
- Boolean
- Number
- String
- Object

每种数据类型都是一系列值的组合，前面 5 种数据类型值的数量都是有限的。`Boolean` 类型只有两个值：`true` 和 `false`，为 `Boolean` 类型的变量赋值时，并不会产生新的值（共享了 `true` 和 `false` 这两个值）。对于 `Number` 和 `String` 来说，它们的值则多得多了，标准的说法是有 18,437,736,874,454,810,627 个 `Number` 类型的值（包括 `NAN`）。`String` 类型的个数就难以统计了，我原以为是 (2<sup>144,115,188,075,855,872</sup> − 1) ÷ 65,535...不过也许我算错了。

对象值的个数是无限的，每个对象都是独一无二的，每次打开一个网页，都创建了一系列的对象。

ES6 中的 Symbol 也是一种数据类型，但是不是字符串，也不是对象，而是一种新的数据类型：第七种数据类型。

下面我们来看一个场景，也许 Symbol 能派上用场。

## 一个布尔值引出的问题

有时，把一些属于其他对象的数据暂存在另一个对象中是非常方便的。例如，假设你正在编写一个 JS 库，使用 CSS 中的 transition 来让一个 DOM 元素在屏幕上飞奔，你已经知道不能同时将多个 transition 应用在同一个 `div` 上，否则将使得动画非常不美观，你也确实有办法来解决这个问题，但是首先你需要知道该 `div` 是否已经在移动中。

怎么解决这个问题呢？

其中一个方法是使用浏览器提供的 API 来探测元素是否处于动画状态，但杀鸡焉用牛刀，在将元素设置为移动时，你的库就知道了该元素正在移动。

你真正需要的是一种机制来跟踪哪些元素正在移动，你可以将正在移动的元素保存在一个数组中，每次要为一个元素设置动画时，首先检查一下这个元素是否已经在这个列表中。

啊哈，但是如果你的数组非常庞大，即便是这样的线性搜索也会产生性能问题。

那么，你真正想做的就是直接在元素上设置一个标志：

```javascript
if (element.isMoving) {
  smoothAnimations(element);
}
element.isMoving = true;
```
这也有一些潜在的问题，不得不承认这样一个事实：还有其他代码也可能操作该 ODM 元素。

1. 在其他代码中，你创建的属性会被 `for-in` 或 `Object.keys()` 枚举出来；
2. 在其他一些库中也许已经使用了同样的方式（在元素上设置了相同的属性），那么这将和你的代码发生冲突，产生不可预计的结果；
3. 其他一些库可能在将来会使用同样的方式，这也会与你的代码发生冲突；
4. 标准委员会可能会为每个元素添加一个 `.isMoving()` 原生方法，那么你的代码就彻底不能工作了。

当然，对于最后三个问题，你可以选择一个无意义的不会有人会使用到的字符串：


```javascript
if (element.__$jorendorff_animation_library$PLEASE_DO_NOT_USE_THIS_PROPERTY$isMoving__) {
  smoothAnimations(element);
}
element.__$jorendorff_animation_library$PLEASE_DO_NOT_USE_THIS_PROPERTY$isMoving__ = true;
```

这似乎太不靠谱了，看了让人眼睛痛。

你还可以用加密算法来生成一个几乎唯一的字符串：

```javascript
// get 1024 Unicode characters of gibberish
var isMoving = SecureRandom.generateName();

...

if (element[isMoving]) {
  smoothAnimations(element);
}
element[isMoving] = true;
```

`object[name]` 语法允许我们将任何字符串作为属性名，代码能正常工作，冲突几乎是不可能了，代码看起来也美观多了。

但是，这回导致糟糕的调试体验，每次使用 `console.log()` 打印出包含该属性的元素时，你回看到一个庞大的垃圾字符串，并且如果还不止一个这样的属性呢？每次刷新后属性名都发生了变化，怎么样使这些属性看起来更加直观呢？

为什么这么难？我们只是为了保存一个小小的标志位。

## 用 Symbol 来解决问题

Symbol 值可以由程序创建，并可以作为属性名，而且不用担心属性名冲突。

```javascript
var mySymbol = Symbol();
```
调用 `Symbol()` 方法将创建一个新的 Symbol 类型的值，并且该值不与其它任何值相等。

与数字和字符串一样，Symbol 类型的值也可以作为对象的属性名，正是由于它不与任何其它值相等，对应的属性也不会发生冲突：

```javascript
obj[mySymbol] = "ok!";  // guaranteed not to collide
console.log(obj[mySymbol]);  // ok!
```

下面是使用 Symbol 来解决上面的问题：

```javascript
// create a unique symbol
var isMoving = Symbol("isMoving");

...

if (element[isMoving]) {
  smoothAnimations(element);
}
element[isMoving] = true;
```

上面代码需要注意几点：

- 方法 `Symbol("isMoving")` 中的 `"isMoving"` 字符串被称为 Symbol 的描述信息，这对调试非常有帮助。可以通过 `console.log(isMoving)` 打印出来，或通过 `isMoving.toString()` 将 `isMoving` 转换为字符串时，或在一些错误信息中显示出来。
- `element[isMoving]` 访问的是 *symbol-keyed* 属性，除了属性名是 Symbol 类型的值之外，与其它属性都一样。
- 和数组一样，symbol-keyed 属性不能通过 `.` 操作符来访问，必须使用方括号的方式。
- 操作 symbol-keyed 属性也非常方便，通过上面代码我们已经知道如何获取和设置 `element[isMoving]` 的值，我们还可以这样使用：`if (isMoving in element)` 或 `delete element[isMoving]`。
- 另一方面，只有在 `isMoving` 的作用域范围内才可以使用上述代码，这可以实现弱封装机制：在一个模块内创建一些 Symbol，只有在该模块内部的对象才能使用，而不用担心与其它模块的代码发生冲突。

由于 Symbol 的设计初衷是为了避免冲突，当遍历 JavaScript 对象时，并不会枚举到以 Symbol 作为建的属性，比如，`for-in` 循环只会遍历到以字符串作为键的属性，`Object.keys(obj)` 和 `Object.getOwnPropertyNames(obj)` 也一样，但这并不意味着 Symbol 为键的属性是不可枚举的：使用 `Object.getOwnPropertySymbols(obj)` 这个新方法可以枚举出来，还有 `Reflect.ownKeys(obj)` 这个新方法可以返回对象中所有字符串和 Symbol 键。（我将在后面的文章中详细介绍 `Reflect` 这个新特性。）

库和框架的设计者将会发现很多 Symbol 的用途，稍后我们将看到，JavaScript 语言本身也对其有广泛的应用。


## Symbol 究竟是什么呢

```javascript
> typeof Symbol()
"symbol"
```

Symbol 是完全不一样的东西。一旦创建后就不可更改，不能对它们设置属性（如果在严格模式下尝试这样做，你将得到一个 TypeError）。它们可以作为属性名，这时它们和字符串的属性名没有什么区别。

另一方面，每个 Symbol 都是独一无二的，不与其它 Symbol 重复（即便是使用相同的 Symbol 描述创建），创建一个 Symbol 就跟创建一个对象一样方便。

ES6 中的 Symbol 与传统语言（如 Lisp 和 Ruby）中的 Symbol 中的类似，但并不是完全照搬到 JavaScript 中。在 Lisp 中，所有标识符都是 Symbol；在 JavaScript 中，标识符和大多数属性仍然是字符串，Symbol 只是提供了一个额外的选择。

值得注意的是：与其它类型不同的是，Symbol 不能自动被转换为字符串，当尝试将一个 Symbol 强制转换为字符串时，将返回一个 TypeError。

```javascript
> var sym = Symbol("<3");
> "your symbol is " + sym
// TypeError: can't convert symbol to string
> `your symbol is ${sym}`
// TypeError: can't convert symbol to string
```

应该避免这样的强制转换，应该使用 `String(sym)` 或 `sym.toString()` 来转换。

## 获取 Symbol 的三种方法

- **Symbol()** 每次调用时都返回一个唯一的 Symbol。
- **Symbol.for(string)** 从 Symbol 注册表中返回相应的 Symbol，与上个方法不同的是，Symbol 注册表中的 Symbol 是共享的。也就是说，如果你调用 `Symbol.for("cat")` 三次，都将返回相同的 Symbol。当不同页面或同一页面不同模块需要共享 Symbol 时，注册表就非常有用。
- **Symbol.iterator** 返回语言预定义的一些 Symbol，每个都有其特殊的用途。

如果你仍不确定 Symbol 是否有用，那么接下来的内容将非常有趣，因为我将为你演示 Symbol 的实际应用。

## Symbol 在 ES6 规范中的应用

我们已经知道可以使用 Symbol 来避免代码冲突。之前在[介绍 iterator](https://hacks.mozilla.org/2015/04/es6-in-depth-iterators-and-the-for-of-loop/) 时，我们还解析了 `for (var item of myArray)` 内部是以调用 `myArray[Symbol.iterator]()` 开始的，当时我提到这个方法可以使用 ` myArray.iterator()` 来代替，但是使用 Symbol 的后向兼容性更好。

在 ES6 中还有一些地方使用到了 Symbol。（这些特性还没有在 FireFox 中实现。）

- **使 `instanceof` 可扩展**。在 ES6 中，` object instanceof constructor` 表达式被标准化为构造函数的一个方法：`constructor[Symbol.hasInstance](object)`，这意味着它是可扩展的。
- **消除新特性和旧代码之间的冲突**。
- **支持新类型的字符串匹配**。在 ES5 中，调用 `str.match(myObject)` 时，首先会尝试将 `myObject` 转换为 `RegExp` 对象。在 ES6 中，首先将检查 `myObject` 中是否有 `myObject[Symbol.match](str)` 方法，在所有正则表达式工作的地方都可以提供一个自定义的字符串解析方法。

这些用途还比较窄，但仅仅通过我文章中的代码很难看到这些新特性产生的重大影响。JavaScript 的 Symbol 是 PHP 和 Python 中 `__doubleUnderscores` 的改进版本，标准组织将使用它来为语言添加新特性，而不会对已有代码产生影响。


## 兼容性

Firefox 36 和 Chrome 38 实现了 Symbol，并且 Firefox 的实现者是本文的原文作者，所以有什么问题可以直接联系作者。

对于还没有原生支持 Symbol 的浏览器，你可以使用 polyfill，如 [core.js](https://github.com/zloirock/core-js#ecmascript-6-symbols)，但该 polyfill 实现并不完美，请阅读[注意事项](https://github.com/zloirock/core-js#caveats-when-using-symbol-polyfill)。 

<p class="j-quote">参考原文：[ES6 In Depth: Symbols](https://hacks.mozilla.org/2015/06/es6-in-depth-symbols/)
原文作者：[Jason Orendorff](https://hacks.mozilla.org/author/jorendorffmozillacom/) 
原文日期：2015-07-11 23:13</p>