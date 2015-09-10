title: 面向切面编程（AOP）简介
tags: [AOP]
categories: [JavaScript]
date: 2014-05-08 16:30:37
keywords:
---

原文连接：[Intro to Aspect Oriented Programming](http://know.cujojs.com/tutorials/aop/intro-to-aspect-oriented-programming)

本文简单地介绍了 AOP 的原理，以及 AOP 与其他方式的异同，并没有涉及太多的复杂逻辑，另外推荐下面两篇文章，这些文章中都间接或直接提及了 AOP：

- [用 AOP 改善 JavaScript 代码](http://www.alloyteam.com/2013/08/yong-aop-gai-shan-javascript-dai-ma/)
- [使用 JavaScript 拦截和跟踪浏览器中的 HTTP 请求](http://www.ibm.com/developerworks/cn/web/wa-lo-jshttp/index.html)


面向切面编程（AOP）是一种非侵入式扩充对象、方法和函数行为的技术。通过 AOP 可以从“外部”去增加一些行为，进而合并既有行为或修改既有行为。

虽然有很多技术可以用来增加和合并行为，例如继承、组合、委托，然而，在很多情况下，AOP 被证明是更灵活和更少侵入的方式，非常值得将其纳入我们的工具箱中。
<!--more-->
我们先通过一个简单的例子，来了解它是如何工作的。

假设，在我们的代码中包含如下一个简单类：

```javascript
function Thing() {}

Thing.prototype.doSomething = function(x, y) {
    var result;

    // compute some result using x and y

    return result;
};
```

然后，在我们的程序中的许多部位使用了上面的类的实例，代码看起来像下面：

```javascript
var thing = new Thing();

// some time later, and possibly even in
// another part of the application
var result = thing.doSomething(x, y);
```

## 增加行为

现在，假设我们怀疑 `Thing.prototype.doSomething` 是导致性能问题的根源，我们想要跟踪记录该方法的输入参数 `x` 和 `y`、计算 `result` 所花费的时间，以及 `result` 的值。

### 修改所有调用点

有一条捷径就是在 `Thing.prototype.doSomething` 被调用的每个位置进行日志记录，像下面这样：

```javascript
var start = Date.now();

var result = thing.doSomething(x, y);

console.log((Date.now() - start) + 'ms', x, y, result);
```

很明显，如果 `Thing.prototype.doSomething` 在很多位置被调用，这意味着将进行很多次的复制、粘贴。你可能会遗漏某些位置，更糟糕的是，在收集到数据后，可能忘记将某些位置的代码移除。

### 修改源代码

另一条途径就是修改 `Thing` 的源代码：

```javascript
Thing.prototype.doSomething = function(x, y) {
    var result;

    var start = Date.now();

    // compute some result using x and y

    console.log((Date.now() - start) + 'ms', x, y, result);

    return result;
};
```

尽管这样做只需要修改一个位置，但具有相当的入侵性：需要修改 `Thing` 的源代码。想象一下，如果 `Thing.prototype.doSomething` 的源码更加复杂，包含多处 `return` 和一些 `try/catch/finally` 块。在不改变方法的行为的同时，收集到所需要的数据，代码修改起来并不是那么容易。

如果你也想使用类似的方式来分析其他方法，你也将不得不修改他们的源代码。

## 使用继承

使用继承可以避免修改 `Thing` 的源代码：

```javascript
function ProfiledThing() {
    Thing.apply(this, arguments);
}

ProfiledThing.prototype = Object.create(Thing.prototype);

ProfiledThing.prototype.doSomething = function() {
    var start = Date.now();

    var result = Thing.prototype.doSomething.apply(this, arguments);

    console.log((Date.now() - start) + 'ms', x, y, result);

    return result;
}
```

这种方式避免了修改 `Thing` 的源代码，但有一个显著的问题：需要将使用 `new Thing()` 的每一个位置修改为 `new ProfiledThing()`

有一些方法可以缓解这个问题，但是现在可以清晰地知道我们需要一个更好的方式。

## 关注分离

这个分析行为的一个有趣特点是，它与 `Thing` 的原本目的无关，它是一个额外的功能。`Thing` 很可能是为了解决特定领域的特定问题而创建，上面的那些解决方案都将一些无关行为引入到 `Thing` 中。

`Thing` 只需要完成自身的工作而不需要关心任何与分析相关的工作，但以上的解决方案都迫使分析工作与 `Thing` 的本质工作直接关联在一起。

我们需要一种技术，以一种可控的、非侵入式的方式来引入这类行为。也就是说，这种方式能够有力保障 `Thing` 的行为，并且不需要我们修改 `Thing` 的源代码，或者使用 `Thing` 的位置的源代码。

## 引入 AOP

正如之前描述的那样，AOP 是一种非侵入的增加对象行为的方式。在 JavaScript，这非常简单，甚至不需要使用任何工具或库就能实现 AOP，但它非常实用，就像其他工具或库帮助你构建可复用的模式一样。

如果你曾经写过下面这样的代码，那么你已经在 JavaScript 中实现了 AOP：

```javascript
var origDoSomething = thing.doSomething;

// Method replacement is a simple form of AOP
thing.doSomething = function() {
    doSomethingElseFirst();

    return origDoSomething.apply(this, arguments);
}
```

这有效地为 `thing.doSomething` 增加了行为。现在，调用 `thing.doSomething` 时，将首先调用 `doSomethingElseFirst`，然后再执行原来的行为。

从 AOP 的角度，我们可以说 `doSomethingElseFirst` 是应用于 `thing.doSomething` 的一个行为切面。确切地讲，`doSomethingElseFirst` 被称作“before advice”，也就是说，我们使 `thing.doSomething` 在执行原来的行为之前执行 `doSomethingElseFirst`。AOP 通常可以实现多种类型，比如 `before`、`after`、`afterReturning`、`afterThrowing` 和 `around`。

对于上面简单的例子，有几个重点需要注意：

- `Thing` 的源代码没有被修改
- `Thing` 的使用方无需修改调用代码
- `doSomething` 的原本行为得以保留
- `Thing` 并不知道 `doSomethingElseFirst` 的存在，并且不依赖它。因此，`Thing` 的单元测试也不需要更新。当然，我们需要为 `doSomethingElseFirst` 编写单元测试，除此之外，没有其他的代码需要测试用例。

## AOP 应用示例

我们用 AOP 的方式来给 `Thing` 增加分析行为：

```javascript
var origDoSomething = Thing.prototype.doSomething;

Thing.prototype.doSomething = function() {
    var start = Date.now();

    var result = origDoSomething.apply(this, arguments);

    console.log((Date.now() - start) + 'ms', x, y, result);

    return result;
}
```

我们再次使用了方法替换的技术，只是这次替换的是 `Thing` 原型上的方法罢了。所有 `Thing` 的实例都拥有了这个新的，包含分析行为的 `doSomething` 方法了。这种类型的 AOP 称作“around”，因为在原来行为之前和之后都做了某些事情。

尽管这与上面的继承方式看起来非常像，但有一个非常重要的不同点：我们没有引入新的构造函数，因此 `Thing` 的调用方无需修改代码。

## AOP 实践

上面通过非侵入式地为原型上的单个方法添加分析行为，简单地演示了 AOP 在 JavaScript 中可以方便地应用，不仅如此，该技术还可以应用于更复杂更有趣的事情，例如：

- 收集整个应用的分析数据
- 跟踪程序的执行过程来可视化调用栈
- 自动重新执行失败的异步 I/O，如 XHR 或数据库查询
- 在应用程序中以松散耦合的方式连接合作组件，而不是使用事件机制或 Pub/Sub

在后面的教程中，我们将看到更多的关于如何应用 AOP 的例子，以及它的适用场景。