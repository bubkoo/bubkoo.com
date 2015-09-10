title: ECMA-262-3 详解 第二章 变量对象
tags: [ECMA-262-3, ECMAScript, Variable object]
categories: [JavaScript]
date: 2014-05-31 20:56:23
keywords:
---

本文译自 [Dmitry A. Soshnikov](http://dmitrysoshnikov.com/) 的文章 [ECMA-262-3 in detail. Chapter 2. Variable object.](http://dmitrysoshnikov.com/ecmascript/chapter-2-variable-object/)

参考了一些译文，作为自己学习 ECMAScript 的一点积累。

## 概要

创建应用程序的时，总免不了要声明变量和函数。然而，解析器（interpreter）是如何以及从哪里找到这些数据（变量，函数）的，当我们引用一个变量时，在解析器内部又发生了什么？

许多 ECMAScript 程序员都知道变量与[执行上下](http://bubkoo.com/2014/05/28/ecma-262-3-in-detail-chapter-1-execution-contexts/)文密切相关：

```js
var a = 10; // 全局上下文中的变量
 
(function () {
  var b = 20; // 函数上下文中的局部变量
})();
 
alert(a); // 10
alert(b); // "b" is not defined
```

同样，许多 ECMAScript 程序员也知道，基于当前版本的规范，独立作用域只能通过“函数代码”才能创建。也就是说，与 C/C++ 不同，在 ECMAScript 中 `for` 循环不会创建一个局部上下文（即局部作用域）。

```js
for (var k in {a: 1, b: 2}) {
  alert(k);
}
 
alert(k); // 尽管循环已经结束，但是变量 “k” 仍然在作用域中
```

下面具体来看一下，当我们声明变量和函数时，究竟发生了什么。

<!--more-->

## 数据声明

如果变量与执行上下文相关，那么它就应该知道数据储存在哪里以及如何访问这些数据，这种机制被称为变量对象（variable object）。

变量对象（简称为 VO）是与某个执行上下文相关的一个特殊对象，并储存了一下数据：

- 变量（var, VariableDeclaration）
- 函数声明（FunctionDeclaration, 缩写为FD）
- 函数形参

<p class="j-quote">注意，在 ES5 中，变量对象和活动对象并入了词法环境模型（lexical environments model），详细的描述请[看这里](http://dmitrysoshnikov.com/ecmascript/es5-chapter-3-2-lexical-environments-ecmascript-implementation/)。</p>

简单举例，可以用 ECMAScript 的对象来表示变量对象：

```js
VO = {};
```

正如我们之前所说，VO 是执行上下文的一个属性：

```js
activeExecutionContext = {
  VO: {
    // 上下文中的数据 (变量声明（var）, 函数声明（FD), 函数形参（function arguments）)
  }
};
```

只有全局上下文中的变量对象可以通过 VO 的属性名间接访问（因为在全局上下文中，全局对象自身就是变量对象，稍候会详细介绍）。在其他上下文中是不能直接访问 VO 对象的，因为它只是内部机制的一个实现（抽象的）。

当我们声明一个变量或函数时，就等于是在 VO 对象上添加了一个相应键/值的属性。

例如：

```js
var a = 10;
 
function test(x) {
  var b = 20;
};
 
test(30);
```

对应的变量对象是：

```js
// 全局上下文中的变量对象
VO(globalContext) = {
  a: 10,
  test: <reference to function>
};
 
// “test” 函数上下文中的变量对象
VO(test functionContext) = {
  x: 30,
  b: 20
};
```

但是，在实现层面上（和规范中）变量对象只是一个抽象概念。从本质上说，在实际执行上下文中，VO 可能完全不叫 VO，而且其初始结构也可能完全不同。

## 不同执行上下文中的变量对象

对于所有类型的执行上下文，变量对象的一些操作（如变量初始化）和行为都是相同的。从这个角度来看，把变量对象表示为抽象概念更加合适。而在函数上下文中同样可以通过变量对象定义一些相关的额外细节。

```
AbstractVO (变量实例化过程中的通用行为)
 
  ║
  ╠══> GlobalContextVO
  ║        (VO === this === global)
  ║
  ╚══> FunctionContextVO
           (VVO === AO, <arguments> object and <formal parameters> are added)
```

下面具体分析。

### 全局上下文中的变量对象

首先，有必要给出全局对象（Global Object）的定义：

> 全局对象是一个在进入任何执行上下文之前就创建的对象，此对象以单例的形式存在，它的属性在程序任何地方都可以访问，其生命周期随着程序的结束而终止。

全局对象创建时，`Math`、`String`、`Date`、`parseInt` 等属性也会同时被初始化，同样也可以附加其它对象作为属性，其中包括可以引用全局对象自身的属性。比如，BOM 中，全局对象上的 `window` 属性就指向了全局对象自身（但是，并非所有的实现都是如此）：

```js
global = {
  Math: <...>,
  String: <...>
  ...
  ...
  window: global
};
```

在引用全局对象的属性时，前缀通常可以省略，因为全局对象是不能通过名字直接访问的。尽管如此，通过全局上下文中的 this 是可以直接访问到全局对象的，也可以通过全局对象中的属性来访问到全局对象，例如，DOM 中的 `window` 属性。看下面写法：

```js
String(10); // 等同于 global.String(10);
 
// 带前缀
window.a = 10; // === global.window.a = 10 === global.a = 10;
this.b = 20;   // global.b = 20;
```

因此，全局上下文中的变量对象就是全局对象自身：

```js
VO(globalContext) === global;
```

准确理解“全局上下文中的变量对象就是全局对象自身”是非常必要的，正是由于如此，在全局上下文中声明一个变量时，我们可以通过全局对象的属性间接访问到这个变量：

```js
var a = new String('test');
 
alert(a); // 直接访问，is found in VO(globalContext): "test"
 
alert(window['a']);  // 间接访问，通过 global === VO(globalContext): "test"
alert(a === this.a); // true
 
var aKey = 'a';
alert(window[aKey]); // 间接访问，通过动态属性名的方式："test"
```

### 函数上下文中的变量对象

在函数上下文中，变量对象（VO）不能直接被访问到，此时活动对象（Activation Object，简称 AO）扮演着 VO 的角色。

```js
VO(functionContext) === AO;
```

> 活动对象在进入函数上下文的时候被创建，同时伴随着 `arguments` 属性的初始化，该属性是 `Arguments` 对象的值：

```js
AO = {
  arguments: 
};
```

`arguments` 对象是活动对象（AO）中的一个属性，包含以下属性：

- callee - 当前函数的引用
- length - 实参数量
- properties-indexes（字符串类型的整数），属性的值就是函数的参数值（按参数列表从左到右排列）。`properties-indexes` 的元素的个数等于 `arguments.length`，`properties-indexes` 的值和实际传递进来的参数之间是共享的。

例如：

```js
function foo(x, y, z) {
 
  // 定义的函数参数（x,y,z）的个数
  alert(foo.length); // 3
 
  // 实际传递的参数个数
  alert(arguments.length); // 2
 
  // 引用函数自身
  alert(arguments.callee === foo); // true
 
  // 参数互相共享
  alert(x === arguments[0]); // true
  alert(x); // 10
 
  arguments[0] = 20;
  alert(x); // 20
 
  x = 30;
  alert(arguments[0]); // 30
 
  // 然而，对于没有传递的参数 z，
  // 相关的 arguments 对象的 index-property 是不共享的
  z = 40;
  alert(arguments[2]); // undefined
 
  arguments[2] = 50;
  alert(z); // 40
 
}
 
foo(10, 20);
```

对于最后一种情况，在老版本的 Chrome 浏览器中有一个 Bug：形参 `z` 和 `arguments[2]` 之间仍然是共享的。


## 处理上下文代码的几个阶段

至此，也就到了本文最核心的部分了。处理执行上下文代码分为两个阶段：

1. 进入执行上下文
2. 执行代码

变量对象的修改和这两个阶段密切相关。

要注意的是，这两个处理阶段是通用的行为，与上下文类型无关（不管是全局上下文还是函数上下文都是一致的）。

### 进入执行上下文

当进入执行上下文时（在代码执行前），VO 就会被下列属性填充（在此前已经描述过了）：

- 函数的所有形参（如果是在函数执行上下文中）
  每个形参都对应变量对象中的一个属性，该属性由形参名和对应的实参值构成，如果没有传递实参，那么该属性值就为 `undefined`
- 所有函数声明（FunctionDeclaration, FD）
  每个函数声明都对应变量对象中的一个属性，这个属性由一个函数对象的名称和值构成，如果变量对象中存在相同的属性名，则完全替换该属性。
- 所有变量声明（var, VariableDeclaration）
  每个变量声明都对应变量对象中的一个属性，该属性的键/值是变量名和 `undefined`，如果变量名与已经声明的形参或函数相同，则变量声明不会干扰已经存在的这类属性。
  
  
举例说明：

```js
function test(a, b) {
  var c = 10;
  function d() {}
  var e = function _e() {};
  (function x() {});
}
 
test(10); // call
```
当进入 `test` 的执行上下文，并传递了实参 `10`，AO 对象如下：

```js
AO(test) = {
  a: 10,
  b: undefined,
  c: undefined,
  d: <reference to FunctionDeclaration "d">
  e: undefined
};
```

注意：AO 并不包含函数 `x`，这是因为 `x` 不是函数声明，而是一个函数表达式（FunctionExpression，简称为 FE），函数表达式不会影响 VO。

同理，函数 `_e` 也是函数表达式，就像我们即将看到的那样，因为它分配给了变量 `e`，所以可以通过名称 `e` 来访问。函数声明与函数表达式的异同，将在 [Chapter 5. Functions](http://dmitrysoshnikov.com/ecmascript/chapter-5-functions/) 中进行详细的探讨。

这之后，将进入处理上下文代码的第二个阶段：执行代码。

### 执行代码

此时，AO/VO 的属性已经填充好了。（尽管，大部分属性都还没有赋予真正的值，都只是初始化时候的 `undefined` 值）。

继续以上一例子，到了执行代码阶段，AO/VO 就会修改为如下形式：

```js
AO['c'] = 10;
AO['e'] = <reference to FunctionExpression "_e">;
```

再次注意，函数表达式 `_e` 仍在内存中，它被保存在声明的变量 `e` 中。但函数表达式 `x` 却不在 AO/VO 中，如果尝试在其定义前或者定义后调用 `x` 函数，这时会发生“x未定义”的错误。未保存在变量中的函数表达式只能在其内部或通过递归才能被调用。

另一个经典的例子：

```js
alert(x); // function
 
var x = 10;
alert(x); // 10
 
x = 20;
 
function x() {};
 
alert(x); // 20
```

为什么第一次弹出的是 “function”？为何在 `x` 声明前就能访问到？为什么弹出的不是 “10” 或者 “20”？原因在于，根据规范，在进入上下文时，VO 中的 `x` 被填充为函数声明。同时，还有变量声明 `x`，但是，根据前面的规则，变量声明是在函数形参和函数声明之后，并且，变量声明不会影响已经存在的同名函数或形参，因此，进入上下文时，VO 如下：

```js
VO = {};
 
VO['x'] = <引用了函数声明“x”>
 
// 发现var x = 10;
// 如果函数“x”还未定义
// 则 "x" 为 undefined, 但是，在我们的例子中
// 变量声明并不会影响同名的函数值
 
VO['x'] = <值不受影响，仍是函数>
```

随后，在执行代码阶段，VO 被修改为如下：

```js
VO['x'] = 10;
VO['x'] = 20;
```

正如在第二个和第三个alert显示的那样。

下面的例子里我们可以再次看到，变量是在进入上下文阶段放入VO中的。(因为，虽然else部分代码永远不会执行，但是不管怎样，变量 `b` 仍然存在于VO中。)：

```js
if (true) {
  var a = 1;
} else {
  var b = 2;
}
 
alert(a); // 1
alert(b); // undefined, but not "b is not defined"
```

## 关于变量

通常，各类文章和 JavaScript 相关的书籍都声称：“不管是使用 `var` 关键字（在全局上下文）还是不使用 `var` 关键字（在任何地方），都可以声明一个全局变量”。这样描述是不恰当的，请记住：

使用 `var` 是声明变量的唯一方式。

如下赋值语句：

```js
a = 10;
```

仅仅是在全局对象时创建了新的属性（而不是变量）。“不是变量”并不是意味着它无法改变，而是指它不符合 ECMAScript 规范中的变量概念，所以它“不是变量”（它之所以能成为全局对象的属性，完全是因为 `VO(globalContext) === global`，大家还记得这个吧？）。

让我们通过下面的实例看看具体的区别吧：

```js
alert(a); // undefined
alert(b); // "b" is not defined
 
b = 10;
var a = 20;
```

所有根源仍然是 VO 和它的修改阶段（进入上下文阶段和执行代码阶段）：

进入上下文：

```js
VO = {
  a: undefined
};
```

我们看到，这个阶段并没有任何 `b`，因为它不是变量，`b` 在执行代码阶段才出现。（但是，在我们这个例子中也不会出现，因为在 `b` 出现前就发生了错误）

将上述代码稍作改动：

```js
alert(a); // undefined, we know why
 
b = 10;
alert(b); // 10, created at code execution
 
var a = 20;
alert(a); // 20, modified at code execution
```

关于变量还有非常重要的一点：与简单属性不同的是，变量是不能删除的`{DontDelete}`，这意味着要想通过 `delete` 操作符来删除一个变量是不可能的。

```js
a = 10;
alert(window.a); // 10
 
alert(delete a); // true
 
alert(window.a); // undefined
 
var b = 20;
alert(window.b); // 20
 
alert(delete b); // false
 
alert(window.b); // still 20
```

<p class="j-quote">注意，在 ES5 中，`{DontDelete}` 被 重命名为了 `[[Configurable]]`，而且可以通过 `Object.defineProperty` 来手动控制。</p>

但是，这里有个例外，就是 `eval` 执行上下文中，是可以删除变量的：

```js
eval('var a = 10;');
alert(window.a); // 10
 
alert(delete a); // true
 
alert(window.a); // undefined
```

在一些调试工具（如 Firebug）的控制台中实验这些例子时，需要注意：Firebug 是使用 `eval` 来执行控制台里的代码，因此，变量同样没有 `{DontDelete}` 特性，可以被删除。

## 特殊属性: \_\_parent\_\_

根据前面的介绍，按照规范，活动对象是不能被直接访问到的。但是，一些具体的实现并没有完全遵守规范，例如在 SpiderMonkey 和 Rhino 中，函数有个特殊属性 `__parent__`，通过这个属性可以直接引用到创建该函数的上下文的活动对象或全局变量对象。

例如（在 SpiderMonkey 和 Rhino 中）：

```js
var global = this;
var a = 10;
 
function foo() {}
 
alert(foo.__parent__); // global
 
var VO = foo.__parent__;
 
alert(VO.a); // 10
alert(VO === global); // true
```

在上面例子中，可以看到函数 `foo` 是在全局上下文中创建的，相应的，它的 `__parent__` 属性设置为全局上下文的变量对象，也就是全局对象。

然而，在 SpiderMonkey 中以相同的方式获取活动对象（AO）是不可能的：不同的版本表现都不同，内部函数的 `__parent__` 属性会返回 `null` 或者全局对象。

在 Rhino 中，以相同的方式获取活动对象是允许的：

如下所示（Rhino）：

```js
var global = this;
var x = 10;
 
(function foo() {
 
  var y = 20;
 
  // 函数 foo 的活动对象
  var AO = (function () {}).__parent__;
 
  print(AO.y); // 20
 
  // 当前活动对象的 __parent__ 属性指向全局对象
  // 这样就形成了所说的作用域链
  print(AO.__parent__ === global); // true
  print(AO.__parent__.x); // 10
 
})();
```

## 总结

本文深入讨论了跟执行上下文相关的对象，我希望这些知识对您来说能有所帮助，能解决一些您曾经遇到的问题或困惑。按照计划，在后续的章节中，我们将探讨 [Scope chain](http://dmitrysoshnikov.com/ecmascript/chapter-4-scope-chain/)，[Identifier resolution](http://dmitrysoshnikov.com/ecmascript/chapter-4-scope-chain/#function-activation)，[Closures](http://dmitrysoshnikov.com/ecmascript/chapter-6-closures/)。

## 扩展阅读

- 10.1.3 — [Variable Instantiation](http://bclary.com/2004/11/07/#a-10.1.3)
- 10.1.5 — [Global Object](http://bclary.com/2004/11/07/#a-10.1.5)
- 10.1.6 — [Activation Object](http://bclary.com/2004/11/07/#a-10.1.6)
- 10.1.8 — [Arguments Object](http://bclary.com/2004/11/07/#a-10.1.8)


<p class="j-dot">**Translated by:** Dmitry A. Soshnikov.
**Published on:** 2010-03-15

**Originally written by:** Dmitry A. Soshnikov [ru, [read »](http://dmitrysoshnikov.com/ecmascript/ru-chapter-2-variable-object/)]
**Originally published on:** 2009-06-27</p>

