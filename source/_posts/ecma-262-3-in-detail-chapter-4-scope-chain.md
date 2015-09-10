title: ECMA-262-3 详解 第四章 作用域链
tags: [ECMA-262-3, ECMAScript, Scope]
categories: [JavaScript]
date: 2014-06-01 21:56:23
keywords:
---
本文译自 [Dmitry A. Soshnikov](http://dmitrysoshnikov.com/) 的文章 [ECMA-262-3 in detail. Chapter 4. Scope chain](http://dmitrysoshnikov.com/ecmascript/chapter-4-scope-chain/).

## 概述

通过[第二章 变量对象](http://bubkoo.com/2014/05/31/ecma-262-3-in-detail-chapter-2-variable-object/)的学习我们知道，执行上下文的数据（变量、函数声明、函数形参）都是以属性的方式储存在变量对象中。

我们还知道，变量对象是在[进入执行上下文阶段](http://bubkoo.com/2014/05/31/ecma-262-3-in-detail-chapter-2-variable-object/#i-4-1)被创建和初始化，随后在[执行代码阶段](http://bubkoo.com/2014/05/31/ecma-262-3-in-detail-chapter-2-variable-object/#i-4-2)会对属性值进行更新。

本文将深入讨论与执行上下文密切相关的另外一个重要的概念 —— 作用域链（Scope Chain）。

<!--more-->

## 定义

如果简单扼要地讲，那么作用域链就是与内部函数息息相关的一个概念。

众所周知，ECMAScript 允许创建内部函数，甚至可以将这些内部函数作为父函数的返回值。

```javascript
var x = 10;
 
function foo() {
 
  var y = 20;
 
  function bar() {
    alert(x + y);
  }
 
  return bar;
 
}
 
foo()(); // 30
```

每个上下文都有自己的变量对象：对于全局上下文而言，其变量对象就是全局对象本身，对于函数而言，其变量对象就是活动对象。

作用域链是所有内部上下文的*变量对象*的列表，用于变量查询。比如，在上述例子中，`bar` 上下文的作用域链包含了`AO(bar)`、`AO(foo)` 和 `VO(global)`。

下面就来详细介绍下作用域链。

先从定义开始，随后再结合例子详细介绍：

> 作用域链是一条变量对象的链，它和执行上下文有关，用于在处理标识符时候进行变量查询。

作用域链在函数调用时被创建，它包含了活动对象（AO）和该函数的内部属性 `[[Scope]]`。关于 `[[Scope]]` 会在后面作详细介绍。

示意如下：

```javascript
activeExecutionContext = {
    VO: {...}, // 或者 AO
    this: thisValue,
    Scope: [   // 作用域链
      // 所有变量对象的列表
      // 用于标识符查找
    ]
};
```

上述代码中的 `Scope` 定义如下所示：

```javascript
Scope = AO + [[Scope]]
```

针对我们的例子来说，可以将 `Scope` 和 `[[Scope]]` 用普通的 ECMAScript 数组来表示：

```javascript
var Scope = [VO1, VO2, ..., VOn]; // 作用域链
```

除此之外，还可以用分层对象链的数据结构来表示，链中每一个链接都有对父作用域（上层变量对象）的引用。这种表示方式和[第二章](http://bubkoo.com/2014/05/31/ecma-262-3-in-detail-chapter-2-variable-object/)中讨论的某些实现中 `__parent__` 的概念相对应：

```javascript
var VO1 = {__parent__: null, ... other data}; -->
var VO2 = {__parent__: VO1, ... other data}; -->
// etc.
```

然而，使用数组来表示作用域链会更方便，因此，我们这里就采用数组的表示方式。 除此之外，不论在实现层是否采用包含 `__parent__` 特性的分层对象链的数据结构，规范对其做了抽象的定义“作用域链是一个对象列表”。数组就是实现列表这一概念最好的选择。

下面将要介绍的 `AO+[[Scope]]` 以及标识符的处理方式，都和函数的生命周期有关。

## 函数的生命周期

函数的的生命周期分为创建和激活（调用）阶段，下面分别详细介绍。

### 函数创建

我们知道，进入上下文阶段时函数声明被储存在变量对象/活动对象中（VO/AO）。让我们看看在全局上下文中的变量和函数声明的例子（这里变量对象是全局对象自身，还记得，是吧？）

```js
var x = 10;
 
function foo() {
  var y = 20;
  alert(x + y);
}
 
foo(); // 30
```

在函数激活（调用）后，我们得到了正确（预期）的结果 —— `30`。不过，这里有一个非常重要的特性。

此前，我们仅仅谈到当前上下文的变量对象。这里，变量 `y` 在函数 `foo` 中定义（意味着它在 `foo` 上下文的 AO 中），但是变量 `x` 并未在 `foo` 上下文中定义，自然也不会被添加到 `foo` 的 AO 中。乍一看，变量 `x` 相对于函数 `foo` 根本就不存在。但也仅仅是乍一看。

```js
fooContext.AO = {
  y: undefined // undefined – 在进入上下文时, 20 – 在激活阶段
};
```

那么，`foo` 函数到底是如何访问到变量 `x` 的呢？一个顺其自然的想法是：函数应当有访问更高层上下文变量对象的权限。而事实也恰是如此，就是通过函数的内部属性 `[[Scope]]` 来实现这一机制的。

> `[[Scope]]` 是一个包含了所有上层变量对象的分层链，它属于当前函数上下文，并在函数创建的时候，保存在函数中。

这里要注意的很重要的一点是：`[[Scope]]` 是在函数创建的时候保存起来的 —— 静态的（不变的），永远永远 —— 直到函数销毁。也就是说，哪怕函数永远都不能被调用到，`[[Scope]]` 属性也已经保存在函数对象上了。

另外要注意的一点是：`[[Scope]]` 与 `Scope` (作用域链)是不同的，前者是函数的属性，后者是上下文的属性。 以上述例子来说，`foo` 函数的 `[[Scope]]` 如下所示：

```js
foo.[[Scope]] = [
  globalContext.VO // === Global
];
```

当函数被调用时，就进入函数上下文，此时活动对象被创建，`this` 和作用域（作用域链）被确定。下面我们详细讨论这个时刻。

### 函数激活

正如上面定义的那样，在进入上下文，AO/VO 创建之后，上下文的 `Scope` 属性（作用域链，用于变量查询）会定义为如下所示：

```js
Scope = AO|VO + [[Scope]]
```

特别注意的是活跃对象是 Scope 数组的第一个元素。添加在作用域链的最前面：

```js
Scope = [AO].concat([[Scope]]);
```

这个特性对处理标识符非常重要。

> 处理标识符其实就是一个确定变量（或者函数声明）属于作用域链中哪个变量对象的过程。

此算法返回的总是一个引用类型的值，其 `base` 属性就是对应的变量对象（或者如果变量不存在的时候则返回 `null`），其 `propertyname` 属性的名字就是要查询的标识符。要详细了解引用类型可以参看[第三章 this](http://bubkoo.com/2014/06/01/ecma-262-3-in-detail-chapter-3-this/)。

标识符处理过程包括了对应的变量名的属性查询，即在作用域链中会进行一系列的变量对象的检测，从作用域链的最底层上下文一直到最上层上下文。

因此，在查询过程中上下文中的*局部变量*比上层上下文的变量会优先被查询到，换句话说，如果两个相同名字的变量存在于不同的上下文中时，处于底层上下文的变量会优先被找到。

下面是一个相对比较复杂的例子：

```js
var x = 10;
 
function foo() {
 
  var y = 20;
 
  function bar() {
    var z = 30;
    alert(x +  y + z);
  }
 
  bar();
}
 
foo(); // 60
```

全局上下文的变量对象如下所示：

```js
globalContext.VO === Global = {
  x: 10
  foo: <reference to function>
};
```

在 `foo` 函数创建的时候，其 `[[Scope]]` 属性如下所示：

```js
foo.[[Scope]] = [
  globalContext.VO
];
```

在 `foo` 函数激活的时候（进入上下文时），`foo` 函数上下文的活跃对象如下所示：

```js
fooContext.AO = {
  y: 20,
  bar: <reference to function>
};
```

同时，`foo` 函数上下文的作用域链如下所示：

```js
fooContext.Scope = fooContext.AO + foo.[[Scope]] // i.e.:
 
fooContext.Scope = [
  fooContext.AO,
  globalContext.VO
];
```

在内部 `bar` 函数创建的时候，其 `[[Scope]]` 属性如下所示：

```js
bar.[[Scope]] = [
  fooContext.AO,
  globalContext.VO
];
```

在 `bar` 函数激活的时候，其对应的活跃对象如下所示：

```js
barContext.AO = {
  z: 30
};
```

同时，`bar` 函数上下文的作用域链如下所示：

```js
barContext.Scope = barContext.AO + bar.[[Scope]] // i.e.:
 
barContext.Scope = [
  barContext.AO,
  fooContext.AO,
  globalContext.VO
];
```

如下是 `x`，`y` 和 `z` 标识符的查询过程：

```js
- "x"
-- barContext.AO // not found
-- fooContext.AO // not found
-- globalContext.VO // found - 10
```

```js
- "y"
-- barContext.AO // not found
-- fooContext.AO // found - 20
```

```js
- "z"
-- barContext.AO // found - 30
```

## 作用域的特性

下面让我们看看与作用域链和函数 `[[scope]]` 属性相关的一些重要特征。

### 闭包

在 ECMAScript 中，闭包和函数的 `[[Scope]]` 属性息息相关。正如此前介绍的，`[[Scope]]` 是在函数创建的时候就保存在函数对象上了，并且直到函数销毁的时候才消失。 事实上，闭包就是函数代码和其 `[[Scope]]` 属性的组合。因此，`[[Scope]]` 包含了函数创建所在的词法环境（上层变量对象）。上层上下文中的变量，可以在函数激活的时候，通过变量对象的词法链（函数创建的时候就保存起来了）查询到。

如下例子所示：

```js
var x = 10;
 
function foo() {
  alert(x);
}
 
(function () {
  var x = 20;
  foo(); // 10, but not 20
})();
```

变量 `x` 是在 `foo` 函数的 `[[Scope]]` 中找到的。对于变量查询而言，词法链是在函数创建的时候就定义的，而不是在调用函数时动态确定的（这个时候，变量 `x` 才会是 `20`）。

下面是另一个典型的闭包的例子：

```js
function foo() {
 
  var x = 10;
  var y = 20;
 
  return function () {
    alert([x, y]);
  };
 
}
 
var x = 30;
 
var bar = foo(); // anonymous function is returned
 
bar(); // [10, 20]
```

上述例子再一次证明了处理标识符的时候，词法作用域链是在函数创建的时候定义的 —— 变量 `x` 的值是 `10`，而不是 `30`。 并且，上述例子清楚的展示了函数（上述例子中指的是函数 `foo` 返回的匿名函数）的 `[[Scope]]` 属性，即使在创建该函数的上下文结束的时候依然存在。

更多关于 ECMAScript 对闭包的实现细节会在[第六章-闭包](http://bubkoo.com/2014/06/16/ecma-262-3-in-detail-chapter-6-closures/)中做介绍。

### 通过 Function 构造器创建的函数的 [[Scope]] 属性

在上面的例子中，我们看到函数在创建的时候就拥有了 `[[Scope]]` 属性，并且通过该属性可以获取所有上层上下文中的变量。然而，这里有个例外，就是当函数通过 `Function` 构造器创建的时候。

```js
var x = 10;
 
function foo() {
 
  var y = 20;
 
  function barFD() { // FunctionDeclaration
    alert(x);
    alert(y);
  }
 
  var barFE = function () { // FunctionExpression
    alert(x);
    alert(y);
  };
 
  var barFn = Function('alert(x); alert(y);');
 
  barFD(); // 10, 20
  barFE(); // 10, 20
  barFn(); // 10, "y" is not defined
 
}
 
foo();
```

上述例子中，函数 `barFn` 就是通过 `Function` 构造器来创建的，这个时候变量 `y` 就无法访问到了。但这并不意味着函数 `barFn` 就没有内部的 `[[Scope]]` 属性（否则它连变量 `x` 都无法访问到）。问题就在于当函数通过 `Function` 构造器来创建的时候，其 `[[Scope]]` 属性永远都只包含全局对象。哪怕在上层上下文中（非全局上下文）创建一个闭包都是无济于事的。

### 二维作用域链查找

在作用域链查找的时候还有很重要的一点：需要考虑变量对象的原型（如果存在的话） -- 源于原型链的特性：如果一个属性在对象中没有直接找到，查询将在原型链中继续。即常说的二维链查找。（1）作用域链环节；（2）每个作用域链 -- 深入到原型链环节。如果在 `Object.prototype` 中定义了属性，我们能看到这种效果。

```js
function foo() {
  alert(x);
}
 
Object.prototype.x = 10;
 
foo(); // 10
```

活动对象是没有原型的，我们可以在下面的例子中看出：

```js
function foo() {
 
  var x = 20;
 
  function bar() {
    alert(x);
  }
 
  bar();
}
 
Object.prototype.x = 10;
 
foo(); // 20
```

试想下，如果 `bar` 函数的活动对象有原型的话，属性 `x` 则应当在 `Object.prototype` 中找到，因为它在 AO 中根本不存在。然而，上面第一个例子中，在标识符处理阶段遍历了整个作用域链，到了全局对象（部分实现是这样的），它继承自 `Object.prototype`，因此，最终变量 `x` 的值就变成了 `10`。

同样的情况出现在某些版本的 SpiderMonkey 的命名函数表达式（简称：NFE）中，那些存储了可选的函数表达式的名字的特殊对象也继承自 `Object.prototype`。同样的，在某些版本的 Blackberry 中，也是如此，其活跃对象是继承自 `Object.prototype` 的。不过，关于这块详细的特性将会在[第五章 函数](http://)中作介绍。

### 全局和 eval 上下文的作用域链

尽管这部分内容没多大意思，但还是值得一提的。全局上下文的作用域链中只包含全局对象。`eval` 代码类型的上下文和调用上下文（calling context）有相同的作用域链。

```js
globalContext.Scope = [
  Global
];
 
evalContext.Scope === callingContext.Scope;
```

### 执行代码阶段对作用域的影响

在代码执行阶段有两个语句能修改作用域链，那就是 `with` 声明和 `catch` 语句。在标识符查询阶段，这两者都会被添加到作用域链的最前面。也就是说，当有 `with` 或 `catch` 的时候，作用域链就会被修改如下形式：

```js
Scope = withObject|catchObject + AO|VO + [[Scope]]
```

如下例子中，`with` 语句添加了 `foo` 对象，使得它的属性可以不需要前缀直接访问。

```js
var foo = {x: 10, y: 20};
 
with (foo) {
  alert(x); // 10
  alert(y); // 20
}
```

对应的作用域链修改为如下所示：

```js
Scope = foo + AO|VO + [[Scope]]
```

再看下面例子，`with` 对象被添加到作用域链的最前端：

```js
var x = 10, y = 10;
 
with ({x: 20}) {
 
  var x = 30, y = 30;
 
  alert(x); // 30
  alert(y); // 30
}
 
alert(x); // 10
alert(y); // 30
```

这里发生了什么？在进入上下文阶段，`x` 和 `y` 被添加到变量对象中，在代码执行阶段，发生了如下修改：

- `x = 10`, `y = 10`
- `{x: 20}` 被添加到作用域链的最前端
- 在 `with` 内部，遇到了 `var` 声明，当然什么也没创建，因为在进入上下文时，所有变量已被解析添加
- 这里只修改了 `x` 的值，此时的 `x` 被解析后是第二步中添加到作用域链最前的的那个对象中的 `x`，`x` 的值由`20` 变为 `30`
- 这里也修改了 `y` 的值，`y` 是上层作用域变量对象的属性，相应地，由 `10` 修改为 `30`
- 当 `with` 语句结束后，这个特殊对象从作用域链中移除（被修改后的 `x` - `30` 也随着对象被移除了），也就是说，作用域链回到执行 `with` 语句之前的状态
- 正如在最后两个 `alert` 中看到的，`x` 的值恢复到了原先的 `10`，而 `y` 的值因为在 `with` 语句的时候被修改过了，因此变为了 `30` 

同样，`catch` 语句会创建一个只包含一个属性（异常参数名）的新对象。如下所示：

```js
try {
  ...
} catch (ex) {
  alert(ex);
}
```

作用域链修改为：

```js
var catchObject = {
  ex: 
};
 
Scope = catchObject + AO|VO + [[Scope]]
```

在 `catch` 从句结束后，作用域链同样也会恢复到之前的状态。

## 总结

本文介绍了几乎所有与执行上下文相关的概念以及相应的细节。后面的章节中，会给大家介绍函数对象的细节：函数的类型（FunctionDeclaration，FunctionExpression）和闭包。顺便提下，本文中介绍过，闭包与 `[[Scope]]` 有直接关系，但是关于闭包的细节会在后续章节中作介绍。

## 扩展阅读

- 8.6.2 – [[[Scope]]](http://bclary.com/2004/11/07/#a-8.6.2)
- 10.1.4 – [Scope Chain and Identifier Resolution](http://bclary.com/2004/11/07/#a-10.1.4)


<p class="j-dot">**Translated by:** Dmitry Soshnikov.
**Published on:** 2010-03-21

**Originally written by:** Dmitry Soshnikov [ru, [read »](http://dmitrysoshnikov.com/ecmascript/ru-chapter-4-scope-chain/)]
**Originally published on:** 2009-07-01</p>