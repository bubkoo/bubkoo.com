title: ECMA-262-3 详解 第三章 This
tags: [ECMA-262-3, ECMAScript, this]
categories: [JavaScript]
date: 2014-06-01 09:56:23
keywords:
---

本文译自 [Dmitry A. Soshnikov](http://dmitrysoshnikov.com/) 的文章 [ECMA-262-3 in detail. Chapter 3. This.](http://dmitrysoshnikov.com/ecmascript/chapter-3-this/)

翻译过程参考了现有的中文翻译，学习 ECMAScript 是一个非常抽象的过程，因为很多概念都是通过抽象的方式来解释的，作者尝试尽量用一些简单的方式并使用了一些具体图表，来使我们的学习曲线稍微平稳一点。

## 概述

本文将讨论和[执行上下](http://bubkoo.com/2014/05/28/ecma-262-3-in-detail-chapter-1-execution-contexts/)文密切相关的更多细节 - `this` 关键字。

实践证明，这个主题很难，在不同的执行上下文中确定 `this` 的值经常会发生问题。

许多程序员习惯性地讲 `this` 和面向对象编程密切联系在一起，`this` 指向了构造函数中新创建的对象。在 ECMAScript 中，这样说也没问题，但就像我们即将看到的那样，`this` 不限于用来指向新创建的对象。

接下来给大家揭开在 ECMAScript 中 `this` 神秘的面纱。

<!--more-->

## 定义

`this` 是执行上下文的一个属性：

```js
activeExecutionContext = {
  VO: {...},
  this: thisValue
};
```

这里的 VO 就是上一章介绍的[变量对象](http://bubkoo.com/2014/05/31/ecma-262-3-in-detail-chapter-2-variable-object/)。

`this` 与上下文的可执行代码类型紧密相关，其值在*进入上下文阶段*就确定了，并且在*执行代码阶段*不能被改变。

下面详细讨论这些情景。

## 全局代码中的 this

全局代码中的 `this` 非常简单，`this` 始终是全局对象自身，因此，可以间接获取引用：

```js
// 显式定义全局对象的属性
this.a = 10; // global.a = 10
alert(a);    // 10
 
// 通过赋值给不受限的标识符来进行隐式定义
b = 20;
alert(this.b); // 20
 
// 通过变量声明来进行隐式定义
// 因为全局上下文中的变量对象就是全局对象本身
var c = 30;
alert(this.c); // 30
```

## 函数代码中的 this

当 `this` 在函数代码中的时候，事情就变得有趣多了。这种情况下是最复杂的，并且会引发很多的问题。

函数代码中的 `this` 的第一个（同时也是最主要）的特性就是：它并非静态绑定在函数上。

如上所述，`this` 的值是进入执行上下文阶段确定的，函数代码中的 `this` 的值可能*每次都不一样*。
 
而且，一旦进入代码执行阶段，其值就维持不变了。也就是说，要给 `this` 赋一个新值是不可能的，因为 `this` 根本就不是一个变量（相反，在 Python 这类语言中，显示定义的 `self` 对象在运行时是可以随意更改的）：

```js
var foo = {x: 10};
 
var bar = {
  x: 20,
  test: function () {
 
    alert(this === bar); // true
    alert(this.x);       // 20
 
    this = foo;    // error, 不能更改this的值
 
    alert(this.x); // 如果没有错误，则其值为10而不是20
 
  }
 
};
 
// 在进入上下文的时候，this 的值就确定了是“bar”对象
// 至于为什么，会在后面作详细介绍
 
bar.test(); // true, 20
 
foo.test = bar.test;
 
// 但是，这个时候，this的值又会变成“foo”
// 虽然我们调用的是同一个函数
 
foo.test(); // false, 10
```

那么，在函数代码中有哪些因素会影响 `this` 值的变化？有如下几个因素：

首先，在通常的函数调用时，`this` 是由激活上下文代码的调用者（caller）决定的，即调用函数的父级上下文。并且 `this` 的值是由调用表达式的形式决定的（换句话说就是，由调用函数的语法决定）。

了解并记住这点非常重要，这样才能在任何上下文中都能准确判断 `this` 的值。更确切地讲，调用表达式的形式（或者说，调用函数的方式）影响了 `this` 的值，而不是其他因素。

（一些关于 JavaScript 的文章和书籍中指出：“`this` 的值取决于函数定义的方式，如果是全局函数，那么 `this` 的值就是全局对象，如果函数是某个对象的方法，那么 `this` 的值就是该对象” -- 这绝对不正确）。下面我们将看到，即便是全局函数，`this` 的值也会因为调用函数的方式不同而不同。

```js
function foo() {
  alert(this);
}
 
foo(); // global
 
alert(foo === foo.prototype.constructor); // true
 
// 然而，同样的函数，以另外一种调用方式的话，this的值就不同了
 
foo.prototype.constructor(); // foo.prototype
```
 
同样，调用对象中定义的方法时，`this` 的值也有可能不是该对象：

```js
var foo = {
  bar: function () {
    alert(this);
    alert(this === foo);
  }
};
 
foo.bar(); // foo, true
 
var exampleFunc = foo.bar;
 
alert(exampleFunc === foo.bar); // true
 
// 同样地，相同的函数以不同的调用方式，this的值也就不同了
 
exampleFunc(); // global, false
```

那么，究竟调用函数的方式是如何影响 `this` 的值？为了完全弄懂其中的奥妙，首选需要了解一种内部类型 - 引用（`Reference`）类型

### 引用类型

引用类型可以用伪代码表示为拥有两个属性的对象：`base`（即拥有属性的那个对象），和 `base` 中的 `propertyName` 。

```js
var valueOfReferenceType = {
  base: ,
  propertyName: 
};
```

引用类型的值只有可能是以下两种情况：

1. 当处理一个标识符的时候
2. 或者进行属性访问的时候

标示符的处理过程在[第四章 作用域链](http://)中讨论；在这里我们只需要知道，使用这种处理方式的返回值总是一个引用类型的值（这对 `this` 来说很重要）。

标识符是变量名，函数名，函数参数名和全局对象中未识别的属性名。如下所示：

```js
var foo = 10;
function bar() {}
```

中间过程中，对应的引用类型的值如下所示：

```js
var fooReference = {
  base: global,
  propertyName: 'foo'
};
 
var barReference = {
  base: global,
  propertyName: 'bar'
};
```

要从引用类型的值中获取一个对象实际的值需要 `GetValue` 方法，该方法用伪代码可以描述成如下形式：

```js
function GetValue(value) {
 
  if (Type(value) != Reference) {
    return value;
  }
 
  var base = GetBase(value);
 
  if (base === null) {
    throw new ReferenceError;
  }
 
  return base.[[Get]](GetPropertyName(value));
 
}
```

上述代码中的 `[[Get]]` 方法返回了对象属性实际的值，包括从原型链中继承的属性：

```js
GetValue(fooReference); // 10
GetValue(barReference); // function object "bar"
```

对于属性访问来说，有两种方式： 点符号（这时属性名是正确的标识符并且提前已经知道了）或者中括号符号：

```js
foo.bar();
foo['bar']();
```

中间过程中，得到如下的引用类型的值：

```js
var fooBarReference = {
  base: foo,
  propertyName: 'bar'
};
 
GetValue(fooBarReference); // function object "bar"
```

那么，引用类型的值与函数上下文中 `this` 的值是如何关联起来的呢？这很重要，也是本文的核心内容。总体来说，确定函数上下文中 `this` 值的一般规则如下：

<p class="j-quote">函数上下文中 `this` 的值由调用者（caller）提供，并由调用表达式的形式确定（函数调用的语法）。

如果在调用括号 `()` 的左边是*引用类型*，那么 `this` 的值就是该引用类型值的 `base` 对象。

在其他情况下（非引用类型），`this` 的值总是 `null`。然而，`null` 对于 `this` 来说没有任何意义，因此为隐式转换为全局对象。</p>

看下面例子：

```js
function foo() {
  return this;
}
 
foo(); // global
```

上面代码中，调用括号左侧是引用类型（因为 `foo` 是标识符）：

```js
var fooReference = {
  base: global,
  propertyName: 'foo'
};
```

相应的，`this` 的值会设置为引用类型值的 `base` 对象，这里就是全局对象。

同样，使用属性访问器：

```js
var foo = {
  bar: function () {
    return this;
  }
};
 
foo.bar(); // foo
```

同样，`bar` 也是引用类型的值，它的 `base` 对象是 `foo` 对象，当激活 `bar` 函数的时，`this` 的值就设置为 `foo` 对象：

```js
var fooBarReference = {
  base: foo,
  propertyName: 'bar'
};
```

然而，同样的函数以不同的激活方式的话，`this` 的值就完全不同了：

```js
var test = foo.bar;
test(); // global
```
因为 `test` 也是标识符，这样就产生了其他引用类型的值，该值的 `base`（全局对象）被设置为 `this` 的值。
```js
var testReference = {
  base: global,
  propertyName: 'test'
};
```
<p class="j-quote">注意：在 ES5 的严格模式下，`this` 的值不再是全局对象，而是 `undefined`</p>
现在，我们已经清楚地知道，为什么同样的函数以不用的方式调用，`this` 的值也会不同了，答案就在于引用类型的不同：
```js
function foo() {
  alert(this);
}
 
foo(); // global, 因为
 
var fooReference = {
  base: global,
  propertyName: 'foo'
};
 
alert(foo === foo.prototype.constructor); // true
 
// 另一种调用方式
 
foo.prototype.constructor(); // foo.prototype, 因为
 
var fooPrototypeConstructorReference = {
  base: foo.prototype,
  propertyName: 'constructor'
};
```

另一个通过调用方式动态确定 `this` 的值的经典例子：

```js
function foo() {
  alert(this.bar);
}
  
var x = {bar: 10};
var y = {bar: 20};
  
x.test = foo;
y.test = foo;
  
x.test(); // 10
y.test(); // 20
```

### 函数调用和非引用类型

正如此前提到过的，当调用括号左侧为非引用类型的时候，`this` 的值会设置为 `null`，并最终成为全局对象。

请看下面这种函数表达式：

```js
(function  () {
  alert(this); // null => global
})();
```

在这个例子中，我们有一个函数对象但不是引用类型的对象（因为它不是标示符，也不是属性访问器），因此 `this` 的值最终被设为全局对象。

更多复杂的例子：

```js
var foo = {
  bar: function () {
    alert(this);
  }
};
  
foo.bar();   // Reference, OK => foo
(foo.bar)(); // Reference, OK => foo
  
(foo.bar = foo.bar)(); // global?
(false || foo.bar)();  // global?
(foo.bar, foo.bar)();  // global?
```

那么，为什么明明是属性访问，而最终 `this` 不是引用类型的 `base` 对象（`foo`），而是全局对象呢？

问题出在后面三个调用，在执行一定的操作运算之后，在调用括号的左边的值不再是引用类型。

第一种情况，很明显是引用类型，`this` 的值为 `base` 对象，即 `foo`。

第二种情况，分组操作符没有实际意义，分组操作符返回的仍是一个引用类型，这就是 `this` 的值为什么再次被设为 `base` 对象，即  `foo`。

第三种情况，赋值操作符（assignment operator）与组操作符不同，它会触发调用 `GetValue` 方法（参见[11.13.1](http://bclary.com/2004/11/07/#a-11.13.1)中的第三步）。最后返回的时候就是一个函数对象了（而不是引用类型的值了），这就意味着 `this` 的值会设置为 `null`，最终会变成全局对象。

第四和第五种情况也类似，逗号操作符和 `OR` 逻辑表达式都会触发调用 `GetValue` 方法，于是相应地就会丢失原先的引用类型值，变成了函数类型，`this` 的值就变成了全局对象了。

### 引用类型和 this 为 null

有一种情况，当调用表达式左侧是引用类型的值，但是 `this` 的值却是 `null`，最终变为全局对象。发生这种情况的条件是当引用类型值的 `base` 对象恰好为活跃对象。

当内部子函数在父函数中被调用的时候就会发生这种情况。正如[第二章](http://bubkoo.com/2014/05/31/ecma-262-3-in-detail-chapter-2-variable-object/)介绍的那样，局部变量，内部函数以及函数的形参都会存储在指定函数的活跃对象中：

```js
function foo() {
  function bar() {
    alert(this); // global
  }
  bar(); // 和AO.bar()是一样的
}
```

活跃对象总是会返回 `this` 值为 `null`（用伪代码来表示， `AO.bar()` 就相当于 `null.bar()`）。然后，如此前描述的，`this` 的值最终会由 `null` 变为全局对象。

当函数调用包含在 `with` 语句的代码块中，并且 `with` 对象包含一个函数属性的时候，就会出现例外的情况。`with` 语句会将该对象添加到作用域链的最前面，在活跃对象的之前。相应地，在引用类型的值（标识符或者属性访问）的情况下，`base` 对象就不再是活跃对象了，而是 `with` 语句的对象。另外，值得一提的是，它不仅仅只针对内部函数，全局函数也是如此， 原因就是 `with` 语句中的对象掩盖了作用域链中更高层的对象（全局对象或者活跃对象）：

```js
var x = 10;
 
with ({
 
  foo: function () {
    alert(this.x);
  },
  x: 20
 
}) {
 
  foo(); // 20
 
}
 
// because
 
var  fooReference = {
  base: __withObject,
  propertyName: 'foo'
};
```

当调用的函数恰好是 `catch` 从句的参数时，情况也是类似的：在这种情况下，`catch` 对象也会添加到作用域链的最前面，在活跃对象和全局对象之前。 然而，这个行为在 ECMA-262-3 中被指出是个 bug，并且已经在 ECMA-262-5 中修正了；因此，在这种情况下，`this` 的值应该设置为全局对象，而不是 `catch` 对象：

```js
try {
  throw function () {
    alert(this);
  };
} catch (e) {
  e(); // __catchObject - in ES3, global - fixed in ES5
}
 
// on idea
 
var eReference = {
  base: __catchObject,
  propertyName: 'e'
};
 
// 然而，既然这是个bug
// 那就应该强制设置为全局对象
// null => global
 
var eReference = {
  base: global,
  propertyName: 'e'
};
```

同样的情况还会在递归调用一个非匿名函数的时候发生（函数的更多细节参考第五章）。在第一次函数调用的时候，`base` 对象是外层的活跃对象（或者全局对象），在接下来的递归调用的时候，`base` 对象应当是一个存储了可选的函数表达式名字的特殊对象，然而，事实却是，在这种情况下，`this` 的值永远都是全局对象：

```js
(function foo(bar) {
 
  alert(this);
 
  !bar && foo(1); // "should" be special object, but always (correct) global
 
})(); // global
```

### 作为构造器调用的函数中的 this

这里介绍另外一种情况，当函数作为构造器被调用的时候：

```js
function A() {
  alert(this); // newly created object, below - "a" object
  this.x = 10;
}
 
var a = new A();
alert(a.x); // 10
```

在这种情况下，[`new`](http://bclary.com/2004/11/07/#a-11.2.2) 操作符会调用 “A” 函数的内部 [`[[Construct]]`](http://bclary.com/2004/11/07/#a-13.2.2)。在对象创建之后，会调用内部的 [`[[Call]]`](http://bclary.com/2004/11/07/#a-13.2.1) 函数，然后所有 “A” 函数中 `this` 的值会设置为新创建的对象。

### 手动设置函数调用时 this 的值

`Function.prototype` 上定义了两个方法（因此，它们对所有函数而言都是可访问的），允许手动指定函数调用时 `this` 的值。这两个方法是：`.apply` 和 `.call` ； 它们都接受第一个参数作为调用上下文中 `this` 的值。而它们的不同点其实无关紧要：对于 `.apply` 来说，第二个参数接受数组类型（或者是类数组的对象，比如 `arguments` ）, 而 `.call` 方法接受任意多的参数。这两个方法只有第一个参数是必要的—— `this` 的值。

如下所示：

```js
var b = 10;
 
function a(c) {
  alert(this.b);
  alert(c);
}
 
a(20); // this === global, this.b == 10, c == 20
 
a.call({b: 20}, 30); // this === {b: 20}, this.b == 20, c == 30
a.apply({b: 30}, [40]) // this === {b: 30}, this.b == 30, c == 40
```

## 总结

本文我们讨论了 ECMAScript 中 `this` 关键字的特性（相对 C++ 或 Java 而言，真的可以说是特性）。希望此文对大家理解 `this` 关键字在 ECMAScript 中的工作原理有所帮助。

## 扩展阅读

- 10.1.7 – [This](http://bclary.com/2004/11/07/#a-10.1.7)
- 11.1.1 – [The this keyword](http://bclary.com/2004/11/07/#a-11.1.1)
- 11.2.2 – [The new operator](http://bclary.com/2004/11/07/#a-11.2.2)
- 11.2.3 – [Function calls](http://bclary.com/2004/11/07/#a-11.2.3)



<p class="j-dot">**Translated by:** Dmitry A. Soshnikov with help of Stoyan Stefanov.
**Published on:** 2010-03-07

**Originally written by:** Dmitry A. Soshnikov [ru, [read »](http://dmitrysoshnikov.com/ecmascript/ru-chapter-3-this/)]
**With additions and corrections by:** Zeroglif

**Originally published on:** 2009-06-28; **updated on:** 2010-03-07</p>