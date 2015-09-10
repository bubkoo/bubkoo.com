title: 用 Promises 控制异步错误处理
date: 2014-03-25 02:32:37
tags: [Async,Promise,When]
categories: [JavaScript]
keywords:
---
正如我们在[凌乱的异步编程](http://bubkoo.com/2014/03/25/async-programming-is-messy/)一文中看到的那样，基于回调函数的异步代码的错误处理也很快变得混乱起来，丢失了许多同步代码具有的优秀品质，使我们更难定位到错误原因。在[用 Promises 简化异步编程](http://bubkoo.com/2014/03/25/simplifying-async-with-promises/)一文中，我们介绍了 Promises，看到了它如何使我们回到“调用 - 返回”编程模型，允许异步错误像同步错误那样沿着调用堆栈向上传播，并提供一种更清晰方法来管理异步，特别是在处理错误时。

## 1. Try/catch/finally ##

在同步代码中，try/catch/finally 提供了一种简单友好但非常强大的惯用语法来执行任务、处理错误，并且总是确保稍后可以执行清理。

> 译注：idiom 习语

下面是一个简单的 try/catch/finally 示例，与 [Part 1](http://bubkoo.com/2014/03/25/async-programming-is-messy/) 中的原始 `getTheResult()` 一模一样：

```javascript
// 同步版本
function getTheResult() {
    try {
        return thisMightFail();
    } catch(e) {
        return recoverFromFailure(e);
    } finally {
        alwaysCleanup();
    }
}
```

正如我们已经看到的那样，通过基于回调函数的方式来模拟 try/catch 充满了陷阱，加入 finally 的概念后（即确保执行清理）只会使事情变得更糟。

使用 Promises，我们可以建立一种方法，类似于友好的 try/catch/finally 惯用语法，并且没有深度回调结构。
<!--more-->

## 2. Try/catch ##

让我们从一个简单的例子开始，只使用了 try/catch，然后看看如何用 Promises 以同样的方式处理错误。

```javascript
// 同步版本
function getTheResult() {

    try {
        return thisMightFail();
    } catch(e) {
        return recoverFromFailure(e);
    }

}
```

现在，就像在 [Part 2](http://bubkoo.com/2014/03/25/simplifying-async-with-promises/) 中一样，我们假设 `thisMightFail()` 是异步的，并且返回一个 Promise，我们可以用 `then()` 来模拟 catch：

```javascript
// 异步版本
function thisMightFail() {
    //...
    return promise;
}

function getTheResult() {

    return thisMightFail()
        .then(null, recoverFromFailure);

}
```

等等，这里的代码甚至比 try/catch 的代码更少！这是怎么回事呢？

### 2.1 传播成功状态 ###

这个例子引入了两个关于 Promises 行为非常重要的事实。其中第一个是：

如果没有给 `then` 提供 `onFulfilled` 处理程序，结果值将原封不动地传播到返回的 Promise。

在调用 `then()` 时，我们没有提供 `onFulfilled` 处理程序。这意味着 `thisMightFail()` 的成功结果将简单地传播，并返回给调用者。

### 2.2 处理错误 ###

另外一个重要的行为是：

处理程序可以通过返回一个值来产生一个成功结果，也可以通过抛出错误或返回一个被拒（rejected）的 Promise 来产生一个错误。

我们提供了一个 `onRejected` 处理程序：`recoverFromFailure`。这意味着，`thisMightFail` 产生的任何错误将被传给 `recoverFromFailure`。就像同步例子中的 `catch` 语句，`recoverFromFailure` 可以处理传入的错误并 `return` 一个成功结果，也可以通过抛出错误或返回一个被拒的 Promise 来产生一个错误。

现在我们有一个完整的异步结构，它的行为就像是同步的模拟，并且也很容易编写。

### 2.3 添加一点语法糖 ###

> 译注：Syntactic sugar 语法糖

但我们把 `null` 作为第一个参数传入是什么意思？在想要使用类似 `try/catch` 的异步结构的地方，我们为什么必须要键入 `null`？能不能做的更好点？

虽然遵循 Promises/A+ 规范的 Promise 的主要接口是 then() 方法，但是许多实现都（用很少的代码）以 `then()` 为基础构建和添加了便捷方法。例如，[when.js](https://github.com/cujojs/when) Promises 提供了一个 `otherwise()` 方法，允许我们更直观、更紧凑地编写这个例子：

```javascript
// 异步版本: 使用 when.js 中的 promise.otherwise();
function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure);

}
```

现在我们有了阅读起来很棒的异步结构！

## 3. 添加 finally ##

让我们把 `finally` 添加到这种混合结构中，看看如何用 Promises 使异步操作达到同样的结果。

```javascript
// 同步版本
function getTheResult() {
    try {
        return thisMightFail();
    } catch(e) {
        return recoverFromFailure(e);
    } finally {
        alwaysCleanup();
    }
}
```

首先需要注意的是，这个看似简单的 `finally` 块包含了一些有趣的东西：
1. 总是在 `thisMightFail` 和/或 `recoverFromFailure` 之后执行
2. <a name="footnote-1-ref"></a>不能访问到 `thisMightFail` 返回的值或抛出的异常 `e`，`也不能访问到recoverFromFailure` 返回的值[^1](#footnote-1)
3. <a name="footnote-2-ref"></a>在这种情况下，`recoverFromFailure` 抛出异常时，不能将其转换回成功结果[^2](#footnote-2)
4. 如果 `alwaysCleanup` 抛出一个异常，会将成功结果（由 `thisMightFail` 或 `recoverFromFailure` 得到）转换为一个失败
5. 可以用一个新异常替换掉 `recoverFromFailure` 抛出的异常。也就是说，如果 `recoverFromFailure` 和 `alwaysCleanup` 都抛出了异常，`alwaysCleanup` 抛出的异常将传播到调用者，而由 `recoverFromFailure` 抛出的却不会

这似乎相当复杂。让我们回到异步的 `getTheResult`，看看如何用 Promises 实现同样的特性。

### 3.1 总是会执行 ###

首先，让我们用 `then()` 确保 `alwaysCleanup` 在所有情况下都将会执行（为了简洁些，我们会保留 when.js 的 `otherwise`）：

```javascript
// 异步版本
function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure);
        .then(alwaysCleanup, alwaysCleanup);
}
```

这似乎很简单！现在，`alwaysCleanup` 在所有情况下都将会被执行：

1. 如果 `thisMightFail` 成功了
2. 如果 `thisMightFail` 失败了，而 `recoverFromFailure` 成功了
3. 如果 `thisMightFail` 和 `recoverFromFailure` 都失败了

但等等，虽然我们已经确保了 `alwaysCleanup` 将总是会执行，但是也侵犯了其他两项特性：`alwaysCleanup` 会收到成功结果或错误，因此有机会访问其中之一，或者两个，并且可以通过返回一个成功值把一个错误转换为一个成功结果。

### 3.2 不要访问结果/错误 ###

我们可以引入一个包装函数，以防把结果或错误传给 `alwaysCleanup`：

```javascript
// 异步版本
function alwaysCleanupWrapper(resultOrError) {
    // 不要传递成功/错误结果
    return alwaysCleanup();
}

function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure);
        .then(alwaysCleanupWrapper, alwaysCleanupWrapper);
}
```

现在，我们已经实现了曾丢掉的两项特性中的一项：`alwaysCleanup` 不再可以访问结果或错误。不幸的是，我们不得不添加一些感觉没必要的代码。不过，让我们继续探索，看看是否可以实现剩下的特性。

### 3.3 不要改变结果 ###

虽然 `alwaysCleanupWrapper` 阻止了 `alwaysCleanup` 访问结果或错误，但是它仍然允许 `alwaysCleanup` 把一个错误状态转换一个成功结果。例如，如果 `recoverFromFailure` 产生一个错误，它将被传给 `alwaysCleanupWrapper`，然后调用 `alwaysCleanup`。如果 `alwaysCleanup` 成功返回，返回值将传播到调用者，从而消除了之前的错误。

这与同步的 `finally` 之句的行为并不匹配，所以让我们重构它：

```javascript
// 同步版本
function alwaysCleanupOnSuccess(result) {
    // 不要传递成功结果，并忽略 alwaysCleanup 的返回值
    // 并将传递过来的返回值返回
    alwaysCleanup();
    return result;
}

function alwaysCleanupOnFailure(error) {
    // 不要传递错误结果，并忽略 alwaysCleanup 的返回值
    // 并抛出原始的错误
    alwaysCleanup();
    throw error;
}

function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure);
        .then(alwaysCleanupOnSuccess, alwaysCleanupOnFailure);

}
```

在成功和失败状态下，我们已经保存了结果：`alwaysCleanupOnSuccess` 将执行 `alwaysCleanup` 但不允许它改变最终结果，`alwaysCleanupOnFailure` 也将执行 `alwaysCleanup` 并总是抛出原始的错误，从而传播错误，即使 `alwaysCleanup` 成功返回。


### 3.4 剩下的两项特性 ###

看看上面的重构，我们还可以发现它涵盖了剩下的两项特性：

在 `alwaysCleanupOnSuccess` 中，如果 `alwaysCleanup` 抛出错误，`return result` 将永远不会被执行，并且这个新错误将传播到调用者，从而把一个成功结果转换为一个失败结果。

在 `alwaysCleanupOnFailure` 中，如果 `alwaysCleanup` 抛出错误，`throw error` 将永远不会被执行，并且这个由 `alwaysCleanup` 抛出的错误将传播到调用者，从而代之以一个新错误。

## 4. 圆满了吗？ ##

通过最新重构代码，我们已经创建类似于同步的 `try/catch/finally` 的异步结构。

### 4.1 更多语法糖 ###

一些 Promise 提供了类似 `finally` 行为的抽象。例如，when.js 的 Promises 提供了一个 `ensure()` 方法，它具备我们前面实现的所有特性，但是更简洁：

```javascript
// 异步版本: 使用 when.js 的 promise.ensure();
function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure)
        .ensure(alwaysCleanup);

}
```

## 5. 小结 ##

我们一开始的目标是为异步操作寻找一种方式来模拟有用且好用的同步 `try/catch/finally` 的行为。下面是我们开始时的简单同步代码：

```javascript
// 同步版本
function getTheResult() {

    try {
        return thisMightFail();
    } catch(e) {
        return recoverFromFailure(e);
    } finally {
        alwaysCleanup();
    }

}
```

然后，下面是最终的异步模拟，结构紧凑，而且易于阅读：

```javascript
// 异步版本
function getTheResult() {

    return thisMightFail()
        .otherwise(recoverFromFailure)
        .ensure(alwaysCleanup);

}
```

## 6. Try/finally ##

另一种常见的结构是 `try/finally`。在执行清理代码时它很有用，但是在这种没有恢复路径（catch）的情况下，它总是允许异常传播。例如：

```javascript
// 同步版本
function getTheResult() {

    try {
        return thisMightFail();
    } finally {
        alwaysCleanup();
    }

}
```

现在，我们已经 Promises 完整地模拟了 `try/catch/finally` 结构，模拟 `try/finally` 就是小菜一碟了。就像上面简单地删除掉 `catch` 一样，我们可以在 Promise 版本中删去 `otherwise()`：

```javascript
// 异步版本
function getTheResult() {

    return thisMightFail()
        .ensure(alwaysCleanup);

}
```

我们一直试图实现的制约（特性）仍然保留了下来：这个异步结构的行为类似于对应的同步 `try/finally`。

## 7. 应用异步结构 ##

让我们来比较一下如何使用 `getTheResult` 的同步和异步版本。假设已经有下面两个用于展示结果和错误的函数。为了简单起见，我们还假设 `showResult` 可能会失败，而 `showError` 永远不会失败。

```javascript
// 假设 showResult 可能会失败
function showResult(result) { /* 格式化并显示结果 */ }

// 假设 showError 永远不会失败
function showError(error) { /* 显示错误，警告用户等等 */ }
```

### 7.1 同步版本 ###

首先是同步版本，我们可能会这样使用：

```javascript
// 同步版本
try {
    showResult(getTheResult());
} catch(e) {
    showError(e);
}
```

正如我们预料的，它相当简单。如果我们成功地得到结果，然后就展示结果。如果得到失败的结果（通过抛出一个异常），就展示错误。

同样需要重点注意的是，如果 `showResult` 失败了，将展示一个错误。这是同步异常的一个重要标志。我们写下的 `catch` 单句将处理来自 `getTheResult` 或 `showResult` 的错误。这种错误传播是自动的，不需要为之增加额外的代码。

### 7.2 异步版本 ###

现在，让我们看看如何用异步版本完成同样的目标：

```javascript
// 异步版本
getTheResult().then(showResult)
    .otherwise(showError);
```

这里的功能是类似的，而且你会惊讶，它看起来居然比同步版本更简单。我们得到了结果，或者更确切地说，是结果的一个 Promise，并且当真正的结果实现时（记住，一切都是异步的），我们将展示它。如果得到了失败的结果（通过拒绝 Promise），我们将展示错误。

由于 Promises 像传播异常一样传播错误，因此如果 `showResult` 失败了，我们也会展示一个错误。因此，这种自动的行为与同步版本是也是等价的：我们编写的 `otherwise` 单句调用将处理来自 `getTheResult` 和 `showResult` 的错误。

另外需要注意的是，同样的 `showResult` 和 `showError` 函数也可以使用在同步版本中。我们不需要为了能在 Promises 中运行而人工改造特定函数的签名 —— 与我们在任意地方编写的函数完全一样。

## 8. 整合 ##

我们已经重构了 `getTheResult` 的代码，用 Promises 来模拟 `try/catch/finally`，也使调用代码用返回的 Promise 来处理与同步版本相同的错误。让我们完整地看看代码基于 Promise 的异步版本：

```javascript
// 使用 getTheResult()
getTheResult().then(showResult)
    .otherwise(showError);

function getTheResult() {
    return thisMightFail()
        .otherwise(recoverFromFailure)
        .ensure(alwaysCleanup);
}

function thisMightFail() {
    // 使用 Promises/A+ 规范推荐的 API 来创建 Promises
    return makePromise(function(resolve, reject) {
        var result, error;

        // Do work, then:

        if(error) {
            reject(error);
        } else {
            resolve(result);
        }
    });
}
```

## 9. 结语 ##
当然同步执行和异步执行之间总是有所差异，但是我们可以通过使用 Promises 缩小这种差异。同步版本和我们构建的基于 Promise 的异步版本不仅看起非常相似，而且它们的行为也相似。它们有着相似的固定格式。我们可以用相似的方式揣测它们，甚至能用相似的方式重构和测试它们。

提供友好和可预测的错误处理模式，以及可组合的“调用 - 返回”语法，这是 Promises 两个强大的特性，但是这仅仅是开始。基于 Promises 的异步结构，可以轻松地将许多其他功能完全异步化：高级功能（例如 map、reduce/fold）、[并行和顺序](https://github.com/cujojs/when/blob/master/docs/api.md#concurrency)的执行任务等等。


<a name="footnote-1"></a>

1. 你可能会奇怪，为什么我们需要这个特性。在这篇文章中，我们选择尝试尽可能近似地模拟 `finally`。同步 `finally` 的意图是引发某种副作用，例如关闭一个文件或数据库连接，并不是执行一个函数来转换结果或错误。而且，向 `alwaysCleanup` 传入一个可能是结果或错误的参数，却不告诉 `alwaysCleanup` 正在接受的参数什么类型，可能是一个危害源。事实上，`finally` 没有”参数“，不像 `catch`，这意外着开发人员需要承担授权访问结果或错误的烦扰，通常的做法是在进入 `finally` 之前把结果或错误存储到一个局部变量中。这种做法也可以应用在基于 Promise 的方式中。[↩](#footnote-1-ref)
2. <a name="footnote-2"></a>需要注意的是，`finally` 可以通过明确地返回一个值消除异常。但是在这种情况下，我们没有明确地返回任何东西。我从来没有在现实中见过需要用这种方式来消除异常。[↩](#footnote-2-ref)

<p class="j-quote">原文：[Mastering Async Error Handling with Promises](http://know.cujojs.com/tutorials/async/mastering-async-error-handling-with-promises)</p>