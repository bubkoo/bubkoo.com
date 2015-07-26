title: ECMA-262-3 详解 第一章 执行上下文
tags: [ECMA-262-3, ECMAScript, execution context]
categories: [JavaScript]
date: 2014-05-28 16:56:23
keywords:
---
本文译自 [Dmitry A. Soshnikov](http://dmitrysoshnikov.com/) 的 [ECMA-262-3 in detail. Chapter 1. Execution Contexts.](http://dmitrysoshnikov.com/ecmascript/chapter-1-execution-contexts/)

参阅了已有的中文翻译，以此来加深对 ECMAScript 的理解。

## 概要

本文将介绍 ECMAScript 的执行上下文以及与之相关的可执行代码的类型。

## 定义

每当控制器到达 ECMAScript 的可执行代码时，控制器就进入了一个执行上下文。

> 执行上下文（简称 - EC）是 ECMA-262 中的一个抽象概念，用于区别不同类型的可执行代码。

规范中并没有从技术角度来定义执行上下文的具体结构和类型，这是实现标准 ECMAScript 引擎所需要考虑的问题。

一系列活动执行上下文在逻辑上形成一个栈。栈底永远是全局上下文，而栈顶是当前（活动）执行上下文。栈在进入或退出各种执行上下文（EC）时被修改（入栈/出栈）。

<!--more-->

## 可执行代码类型

可执行代码类型这个概念与执行上下文的抽象概念息息相关。在某些时刻，说道可执行代码类型时，很可能就代表了一个可执行上下文。

例如，我们将可执行上下文栈定义为一个数组：

```javascript
ECStack = [];
```

每当控制器进入一个函数（即便该函数是被递归调用或作为构造函数调用），都将发触发压栈操作，调用内置的 `Eval` 函数时也不例外。

### 全局代码

这类代码在“程序”级别上被处理：比如：加载一个外部的 JS 文件或内联的 JS 代码（包含在 `<script></script>` 内的代码）。全局代码不包含定义在任何函数体内的代码。

在初始化（程序开始）时，`ECStack` 是下面这样：

```js
ECStack = [
  globalContext
];
```

### 函数代码

当控制器进入函数代码（各类函数）时，就会有新的元素被压入 `ECStack` 中。值得注意的是：这里的函数代码不包含内部函数（inner functions）的代码。

我们以一个递归调用自身一次的函数为例：

```js
(function foo(bar){
    if (bar){
        return;
    }
    foo(true);
})(false);
```

`ECStack` 将发生两次入栈操作：

```js
// 首先激活 foo 函数
ECStack = [
     functionContext
     globalContext
];
// 递归激活 foo 函数
ECStack = [
     functionContext - recursively
     functionContext
     globalContext
];
```

每当函数返回，退出当前执行上下文时，`ECStack` 就会发生相应的出栈操作，先进后出，这与典型的堆栈逻辑一样。当这些代码执行完毕之后，`ECStack` 再次回到只包含 `globalContext` 的状态，直到程序结束。

一个抛出而未被捕获的异常同样也会退出一个或多个执行上下文：

```js
(function foo() {
  (function bar() {
    throw 'Exit from bar and foo contexts';
  })();
})();
```

### Eval 代码

对于 `Eval` 代码就比较有意思了。这里有一个调用上下文的概念，即 `Eval` 函数被调用时的上下文。

在 `Eval` 中所作的操作，如变量声明或函数定义，都将影响整个调用上下文：

```js
// 影响全局上下文
eval('var x = 10');

(function foo() {
  // 变量 `y` 在 `foo` 函数的本地上下文中定义
  eval('var y = 20');
})();
 
alert(x); // 10
alert(y); // "y" is not defined
```

<p class="j-quote">注意：在 ES5 的严格模式下，`eval` 不再影响调用上下文，而是在本地沙箱中执行代码（即存在 `Eval` 作用域）。</p>

`ECStack` 将发生如下入栈/出栈变化：

```js
ECStack = [
  globalContext
];
 
// eval('var x = 10');
ECStack.push({
  context: evalContext,
  callingContext: globalContext
});

// 退出 eval
ECStack.pop();

// 调用 foo 函数
ECStack.push(<foo> functionContext);

// eval('var y = 20');
ECStack.push({
  context: evalContext,
  callingContext: <foo> functionContext
});

// 退出 eval 
ECStack.pop();

// 退出 foo 函数
ECStack.pop();
```

也就是一个非常普通的堆栈调用逻辑。

在版本号 1.7 以下的 SpiderMonkey 实现中（Firefox），可以把调用上下文作为第二个参数传递给 `Eval`。此时，如果传入的调用上下文还存在的话，就有可能影响该上下文中的私有变量（在该上下文中声明的变量）：

```js
function foo(){
    var x = 1;
    return function() { alert(x); }
};

var bar = foo();

bar(); // 1
eval(‘x = 2’, bar); // 传递上下文，影响了内部变量“var x”
bar(); // 2
```

然而，由于安全原因，现代引擎已经修复了这个问题。

## 结论

这些基本理论对于后续章节中执行上下文相关细节（如变量、对象、作用域链等等）是非常必要的。

## 扩展阅读

ECMA-262-3 规范文档的对应的章节 - [10. Execution Contexts.](http://bclary.com/2004/11/07/#a-10)


<p class="j-dot">**Translated by:** Dmitry Soshnikov.
**Published on:** 2010-03-11

**Originally written by:** Dmitry Soshnikov [ru, [read »](http://dmitrysoshnikov.com/ecmascript/ru-chapter-1-execution-contexts/)]
**Originally published on:** 2009-06-26</p>