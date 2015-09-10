title: Promises 和异步编程
date: 2014-03-25 08:36:57
tags: [Async,Promise,When]
categories: [JavaScript]
keywords:
---

在 JavaScript 中处理异步和回调就是家常便饭，我们通常会面对这样一些问题：
1. 如何优雅滴组织我们的回调代码
2. 对异步函数错误处理的最佳实践是什么
3. 异步嵌套问题
4. 怎样使我们的代码可读性和可维护性更高




> Programs are meant to be read by humans and only incidentally for computers to execute. 程序是给人读的，只是顺带让计算机执行一下。 ——《编写可维护的JavaScript》@Donald Knuth


当然，最常见也是最简单的处理方式就是，直接将回调函数或错误处理函数作为异步函数的参数，在异步函数返回时进行相应的调用，这种方式的缺陷估计大家心里或多或少都有点见解。难道就没有爽的编程模式？

这里分享了几篇文章，主要讲解了 JavaScript 中的 Promise 机制，以及如何使用它来改善我们的异步编程和回调问题。其中三篇参阅了 http://nuysoft.com/2013/08/29/async-programming/ ，另外一篇来自 [html5rocks 的 Promise 教程](http://www.html5rocks.com/zh/tutorials/es6/promises/)。

- [凌乱的异步编程](http://bubkoo.com/2014/03/25/async-programming-is-messy/)
- [用 Promises 简化异步编程](http://bubkoo.com/2014/03/25/simplifying-async-with-promises/) 
- [用 Promises 控制异步错误处理](http://bubkoo.com/2014/03/25/mastering-async-error-handling-with-promises/) 
- [JavaScript Promises 教程](http://bubkoo.com/2014/03/22/javascript-promises/)

下图是 jQuery 中动画回调链，图片来自 @司徒正美 的 MVC 分享 PPT。

![回调的噩梦](http://bubkoo.qiniudn.com/nightmare-of-callback.jpg)

<!--more-->