title: 凌乱的异步编程
date: 2014-03-25 07:14:35
tags: [Async,Promise,When]
categories: [JavaScript]
keywords:
---
## 1. 异常和 try/catch ##
当执行可能失败的操作时，采用异常机制和 try/catch 是一种直观的方式，这样我们就可以从异常中恢复，或将异常抛出，异常沿着调用堆栈到达调用者，调用者可以处理该异常或将其继续抛出。

看一个简单的例子：

```javascript
function thisMightFail() {
    //...
    if(badThingsHappened) {
        throw new Error(...);
    }

    return theGoodResult;
}

function recoverFromFailure(e) {
    //...
    return recoveryValue;
}

function getTheResult() {

    var result;

    try {
        result = thisMightFail();
    } catch(e) {
        result = recoverFromFailure(e);
    }

    return result;
}
```

在这个例子中，调用 `thisMightFail` 时一定会失败并抛出一个 `Error` 异常，   `getTheResult` 捕获了该异常，然后调用 `recoverFromFailure`（例如，返回某个默认值）来从异常中恢复。这个例子之所以能够工作，是因为 `thisMightFail` 是**同步**的。 
<!--more-->
## 2. 面向异步 ##

如果 `thisMightFail` 是异步的会如何呢？例如，它可能执行一个异步的 XHR 来获取数据：

```javascript
function thisMightFail(callback, errback) {
    xhrGet('/result', callback, errback);
}
```

现在使用 try/catch 是不可能的了，我们必须提供一个 `callback` 和 `errback` 来处理成功和失败的情况。这在 JavaScript 中相当常见，所以没什么大不了的，真是这样吗？先别急，现在 `getTheResult` 也需要稍作修改：

```javascript
function getTheResult(callback) {

    // 模拟 try/catch 中从异常回复的行为
    thisMightFail(callback, function(e) {

        var result = recoverFromFalure(e);
        callback(result);

    });
}
```

现在，需要对最终执行结果感兴趣的调用方增加 `callback` （和可能的 `errback`）这样的回调函数。请继续阅读下面。

## 3. 更多异步 ##

如果 `recoverFromFailure` 也是异步的，我们不得不再添加一层嵌套的回调函数：

```javascript
function getTheResult(callback) {

    // 模拟 try/catch 中从异常回复的行为
    thisMightFail(callback, function(e) {

        recoverFromFailure(callback, function(e) {
            // 这里该如何处理？！？！
        });

    });
}
```

这就提出了另一个问题：如果 `recoverFromFailure` 失败了该如何处理呢？当使用同步的 try/catch 时，`recoverFromFailure` 可以简单的抛出一个 `Error`，`Error` 将传播到 `getTheResult` 的调用者。为了处理异步失败，我们不得不引入另一个 `errback`，这就导致从 `recoverFromFailure` 到调用方的路径上，函数签名到处都是 `callback` 和 `errback`，而且调用方必须提供它们。 

这也可能意味着我们不得不检查是否真地提供了 `callback` 和 `errback` 回调，以及它们是否会抛出异常：

```javascript
function thisMightFail(callback, errback) {
    xhrGet('/result', callback, errback);
}

function recoverFromFailure(callback, errback) {
    recoverAsync(
        function(result) {
            if(callback) {
                try {
                    callback(result);
                } catch(e) {
                    // 如果执行 callback 时发生异常，我们就执行 errback 回调
                    // 这至少可以让调用者知道是某个地方出错了
                    // 但是，现在 callback 和 errback 都被执行了
                    // 这也许并不是开发者所期望的
                    errback(e);
                }
            }
        }
        function(error) {
            if(errback) {
                try {
                    errback(error);
                } catch(ohnoes) {
                    // 这里该如何处理呢？！？
                    // 我们可以不处理或将异常抛出，但是没有代码
                    // 可以捕获到该异常，因为这都是异步的
                    // 现在，连 console.error 也深入渗透到我们的代码中了
                    console.error(ohnoes);
                }
            }
        },
    );
}

function getTheResult(callback, errback) {

    // 模拟 try/catch 中从异常回复的行为
    thisMightFail(callback, function(e) {

        recoverFromFailure(callback, errback);

    });

}
```

这段代码已经从一个简单的 try/catch 变为深度嵌套的回调函数，每个函数签名需要增加 `callback` 和 `errback`，而且需要额外的逻辑来检查是否可以安全地调用它们，讽刺的是，需要用两个 try/catch 块来确保 `recoverFromFailure` 真的可以从失败中恢复。

## 4. 如何处理 finally？ ##

想象一下，如果我们再将 `finally` 引入这种混乱的实现方式，事情必然会变得异常复杂。基本上有两种选择：1) 为所有方法的签名增加一个 `alwaysback` 回调函数，并做相应的检查以确保可以安全地调用它；2) 在 callback/errback 的内部处理异常，并确保总是会调用 `alwaysback`。但是无论哪种选择都不如语言所提供的 `finally` 简单和优雅。

## 5. 总结 ##

在异步编程中使用回调函数改变了传统的编程模型，并且引发了下面的问题：
1. 我们再也不能使用简单的“调用 - 返回”（call-and-return）编程模型
2. 我们再也不能使用 try/catch/finally 来处理异常
3. 我们必须为可能执行异步操作的每个函数的签名增加 callback 和 errback 参数

事实上我们可以做得更好。在 JavaScript 中，还有另一种异步编程模型，更接近于标准的“调用 - 返回”模型，非常类似于 try/catch/finally，并且不会强迫我们为大量的函数增加两个回调函数参数。

下一步，我们将看看 [Promises](../simplifying-async-with-promises)，以及它们如何使异步编程回归到更简单、更友好的模型。

<p class='j-quote'>原文：[Async Programming is Messy](http://know.cujojs.com/tutorials/async/async-programming-is-messy)<p>

