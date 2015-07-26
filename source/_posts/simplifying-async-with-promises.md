title: 用 Promises 简化异步编程
date: 2014-03-25 04:45:32
updated: 2014-03-25 00:45:32
tags: [Async,Promise,When]
categories: [JavaScript]
keywords:
---
在[凌乱的异步编程](../async-programming-is-messy)一文中，我们见识了用回调处理异步调用的尴尬局面，即使是一组简单的函数调用。

快速回顾一下，看看我们最初的代码，使用回调函数时的凌乱结果，以及我们为了回到正途而想要解决的几个问题：

1. 我们再也不能使用简单的“调用 - 返回”（call-and-return）编程模型
2. 我们再也不能使用 try/catch/finally 来处理异常
3. 我们必须为可能执行异步操作的每个函数的签名增加 callback 和 errback 参数

## 1. Promises ##

一个 Promise（或者叫 Future, Delayed value, Deferred value）代表一个尚不可用的值，因为产生这个值的计算过程尚未完成。一个 Promise 是最终的成功结果或失败原因的占位符。

Promises 还提供了一个简单的 API（见下文），用于在结果完成或故障发生时获取通知。

Promises [不是一个新概念](http://en.wikipedia.org/wiki/Futures_and_promises)，已经在许多语言中被实现。一些 JavaScript 实现也已经有一段时间了，并且最近变得更加流行，因为我们开始构建更庞大、更复杂的系统，需要协调更多的异步任务。

（注意：虽然 Promise API 标准存在[多个提案](http://wiki.commonjs.org/wiki/Promises)，但是 [Promises/A+](http://promises-aplus.github.io/promises-spec/) 已经在多个主流框架中被实现，似乎正在成为事实上的标准。无论哪种提案，基本的概念是相同的：1) Promises 作为结果或错误的占位符；2) 提供了一种在结果完成或错误发生时的通知方式。）

<!--more-->

## 2. 典型的 XHR 示例 ##

在 XHR Get 示例中，我们关注的是请求 url 的内容。我们知道 XHR 是一个异步操作，返回值不会立即可用。这种情况完全符合 Promise 的定义。

假设我们有一个 XHR 库，它立即返回一个 Promise 作为内容的占位符，而不是要求我们传入一个回调函数。我们可以重写 [Part 1](../async-programming-is-messy) 中的异步函数 `thisMightFail`，像下面这样：

```javascript
function thisMightFail() {
    // XHR 库将返回一个 Promise 作为内容的占位符
    // XHR 本身将在稍后执行
    var promise = xhrGet('/result');

    // 我们可以简单地返回这个 Promise，它就像真正的结果
    return promise;
}
```

（需要注意的是，一些流行的 JavaScript 库，包括Dojo（参考 [@bryanforbes](https://twitter.com/bryanforbes) 写的 [great article on Dojo's Deferred](http://dojotoolkit.org/documentation/tutorials/1.6/deferreds/)）和 [jQuery](http://api.jquery.com/Types/#jqXHR)，都使用了 Promises 来实现 XHR 操作）

现在，我们可以返回 Promise 占位符，就像它是真正的结果，这样异步函数 `thisMightFail` 看起来非常像传统的同步操作和“调用 - 返回”编程模式。


## 3. 调用栈 ##

在没有回调函数的世界里，结果和错误沿着调用栈*向上*回传。这是一种符合预期和友好的模式。而在基于回调函数的世界里，正如我们之前看到的那样，结果和错误不再遵循这种熟悉的模式，回调函数必须*向下*传递，深入到调用栈中。

通过使用 Promises，我们可以恢复到熟悉的“调用 - 返回”编程模型，并移除回调函数。

### 3.1 回到“调用 - 返回”编程模型 ###

为了看看它是如何工作的，让我们从 [Part 1](../async-programming-is-messy)  中同步函数 `getTheResult` 的简化版本开始，不使用 try/catch，这样异常将总是沿着调用栈向上传播。

```javascript
function thisMightFail() {
    //...
    if(badThingsHappened) {
        throw new Error(...);
    }

    return theGoodResult;
}

function getTheResult() {
    // 返回 thisMightFail 的执行结果
    // 或者让异常抛出
    return thisMightFail();
}
```

现在，让我们使用基于 Promise 的 XHR 库，来为上面的代码引入异步的 `thisMightFail`：

```javascript
function thisMightFail() {
    // XHR 库将返回一个 Promise 作为内容的占位符
    // XHR 本身将在稍后执行
    var promise = xhrGet('/result');

    // 我们可以简单地返回这个 Promise，它就像真正的结果
    return promise;
}

function getTheResult() {
    // 返回 thisMightFail 的执行结果，它是一个 Promise
    // 代表将来的执行结果或错误
    return thisMightFail();
}
```

使用 Promises 时，`getTheResult()` 在同步和异步情况下是相同的！并且在这两种情况下，成功结果或失败将沿着调用栈传播到调用者。

### 3.2 移除回调函数 ###

还请注意，没有向调用栈传入 callbacks  或 errbacks（或 alwaysbacks），也没有污染任何函数的签名。通过使用 Promises，我们的函数的外观和行为就像友好的、同步的“调用 - 返回”编程模型。

### 3.3 完成了吗？ ###

我们已经使用 Promises 重构了简单的 `getTheResult` 函数，并且解决了在 [Part 1](../async-programming-is-messy) 提出的的两个问题。我们已经：
1. 回到了“调用 - 返回”编程模型
2. 移除了参数 callback/errback/alwaysback 的传播

但是，对于 `getTheResult` 的调用者意味着什么呢？别忘了，我们返回的是一个 Promise，并且无论成功结果（XHR 的结果）还是错误最终将落实到占位符 Promise，到那时调用者将需要采取一些行动。

## 4. 调用者该如何处理 ##

正如上面所提到的，Promises 提供了一个 API，用于在结果可用或错误时获取通知。例如，在 Promises/A 规范提案中，一个 Promise 含有一个 `.then()` 方法，而且许多 Promise 库提供了一个 `when()` 方法来达到同样的目的。

首先，让我们看看使用回调方式时，调用代码可能的样子：

```javascript
// 基于回调的 getTheResult
getTheResult(
    function(theResult) {
        // theResult 将是 XHR 的响应结果
        resultNode.innerHTML = theResult;
    },
    function(error) {
        // error 表示 XHR 失败的原因
        // 例如，它可能是一个 Error 对象 
        errorNode.innerHTML = error.message;
    }
);
```

现在，让我们如何通过 Promises/A 的 `.then()` 来使用使用 `getTheResult` 所返回的 Promise。

```javascript
getTheResult().then(
    function(theResult) {
        // theResult 将是 XHR 的响应结果
        resultNode.innerHTML = theResult;
    },
    function(error) {
        // error 表示 XHR 失败的原因
        // 例如，它可能是一个 Error 对象 
        errorNode.innerHTML = error.message;
    }
);
```

![图片来自 http://themetapicture.com/wat/](http://bubkoo.qiniudn.com/funny-surprised-owl-WHAT.jpg)

这就是 Promises 用来*避免使用回调函数*的全部内容？我们就这么使用它们？！？

## 5. 还没结束 ##

在 JavaScript 中，通过使用回调函数来实现 Promises，因为没有语言级的结构可以用于处理异步。回调函数是 Promises *必然的实现方式*。如果 Javascript 已经提供或者未来可能提供其他的语言结构，那么 Promises 可能会以不同的方式实现。

然而，相较于 [Part 1](../async-programming-is-messy) 中深度传递回调函数的方式，Promises 具备一些明显的优势。

首先，我们的函数签名是正常的。我们不再需要为从调用者到 XHR 库的每个函数签名添加 callback 和 errback 参数，只需要为对最终结果感兴趣的调用者传递回调函数。

其次，Promise API 标准化了回调函数的传递。JavaScript 库可能会把 callbacks 和 errbacks 参数放到函数签名的不同位置，某些库甚至不接受 errback 参数，而且大部分库不接受 alwaysback（即“finally”）参数。我们可以依赖 Promise API，而不是许多有着潜在差异的库的 API。

第三，Promise 保障了回调函数和错误回调函数被调用的方式和时机，以及如何处理返回值和回调函数抛出的异常。在没有 Promise 的世界里，如果库和函数签名支持许多不同的回调函数，便意味着许多不同的行为：

1. 你的回调函数允许返回一个值吗？
2. 如果允许返回会发生什么？
3. 是否所有库都允许你的回调函数抛出一个异常？如果允许抛出会发生什么？悄悄的把它吞掉吗？
4. 如果你的回调函数真的抛出一个异常，错误回调是否会被调用？

...等等...

所以，Promises 一方面可以作为回调函数注册的标准 API，同时也为如何以及何时调用回调函数和处理异常提供了标准的、可预测的行为。

## 6. 怎么处理 try/catch/finally ##

现在，我们已经回到了“调用 - 返回”编程模型，并从函数签名中移除了回调函数，我们还需要一种方式来处理失败的情况。理想情况下，我们希望使用 try/catch/finally，或者是至少在外观和行为上与它相似，并且在面对异步时可以正常工作。

在[用 Promises 控制异步错误处理](../mastering-async-error-handling-with-promises)一文中，我们将把拼图的最后一块填到位，看看如何用 Promises 模仿 try/catch/finally。

<p class="j-quote">原文：[Simplifying Async with Promises](http://know.cujojs.com/tutorials/async/simplifying-async-with-promises)</p>