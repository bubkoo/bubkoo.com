title: 深入解析 ES6：简介
tags:
  - ES6
categories:
  - JavaScript
date: 2015-06-14 11:40:52
updated: 2015-06-14 11:40:52
keywords:
---

欢迎来到深入解析 ES6 系列，本系列将探讨 JavaScript 即将面世的新版本 -- ECMAScript 6。ES6 包含许多新特性，这使得 JavaScript 语言更强大和更具表现力，接下来的每周我们将逐一揭开 ES6 的神秘面纱。在开始之前，我们值得花几分钟时间来谈谈什么是 ES6 或者你期待它是什么样的。

<!--more-->

## 什么是 ECMAScript

JavaScript 语言的标准是由 ECMA（类似 W3C 的标准化组织）制定，并命名为 ECMAScript，除其他事项外，ECMAScript 还定义了：

- [语法规则](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar) -- 解析规则、关键字、声明、操作符等
- [变量类型](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures) -- 布尔、数字、字符串、对象等
-  [原型和继承机制](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain)
-  包含内置对象和方法的[标准库](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) --  [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)、[Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)、[数组方法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)、[遍历对象的方法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)等

ECMAScript 并没有定义处理 HTML 和 CSS 的相关标准，也就是说并没有定义这些 [Web API](https://developer.mozilla.org/en-US/docs/Web/API)，如 DOM（文档对象模型），这些都被定义在单独的标准中。ECMAScript 规范不仅存在于浏览器端，还包括非浏览器端，如 [NodeJS](http://nodejs.org/)。

## 新规范

就在上周，第 6 版 ECMAScript 规范的最终草案提交给了 ECMA 审查，这意味着什么呢？

这意味着，这个新规范将在今年夏天与大家正式见面。

这将是历史性的一刻，新的 JS 规范不是每天都会降临，上个版本 -- ES5   出现于 2009 年，从那时起，ES 标准委员会就开始着手制定 ES6 规范。

ES6 是该语言的重大升级，与此同时，你的 JS 代码也将继续正常运行，ES6 将最大兼容现有代码。事实上，许多浏览器已经实现了 ES6 的某些新特性，这意味着，你的 JS 代码已经在实现了某些 ES6 新特性的浏览器中运行了。如果现在你的代码没有出现任何兼容性问题，那么以后也不会。

## 关于版本号

以前的 ECMAScript 版本号分别是 1、2、3 和 5。

那么，第 4 版到哪里去了呢？实际上，第 4 版也在计划之列，并完成了大量工作，但由于想法过于大胆（比如，它制定了一个非常复杂的基于泛型和类型推断的静态类型系统），而最终不得不被废弃掉。

其实 ES4 是有争议的，当标准委员会停止制定 ES4 规范时，委员会成员同意发布一个相对温和的 ES5，然后继续制定一些更实质性的新特性，这就是为什么在 ES5 的规范中包含下面这句话：

> ECMAScript 是一个充满活力的语言，语言本身的进化并不完整，在未来的版本中将进行一些重大的技术改进。

这句话可以被视为一种承诺。

## 兑现承诺

在 2009 年发布的 ES5 中，引入了[`Object.create()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)、[`Object.defineProperty()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)、[`getter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)、[`setter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set)、[严格模式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode)和 [`JSON`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) 对象。我用过所有这些特性，我也很欣赏 ES5 为这门语言所做的改进，但这并没有对我的编码方式产生巨大影响。对我来说，最重要的创新莫过于那些数组的新方法，如[`.map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)和[`.filter()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)等。

然而，ES6 是不同的，这是多年“和谐”工作的结晶，也是 JS 历史上从来没有过的实质性的升级。这些新特性包括从简单的箭头函数、字符串插值到复杂的代理、Generator 函数等。

ES6 改变了我们编写 JS 代码的方式。

本系列将逐步展示 ES6 的这些新特性，并介绍如何使用这些新特性。

我们将从一个典型的人们期待了数十年的“缺失功能”开始，所以，下周我们一起来看看 ES6 的迭代器（Iterator）和新的 `for-of` 循环。

<p class="j-quote">参考原文：[ES6 In Depth: An Introduction](https://hacks.mozilla.org/2015/04/es6-in-depth-an-introduction/)
原文作者：[Jason Orendorff](https://hacks.mozilla.org/author/jorendorffmozillacom/) 
原文日期：2015-04-23 20:55</p>
