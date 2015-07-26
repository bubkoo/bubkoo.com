title: 【译】构建您自己的 AngularJS，第一部分：scopes 和 digest
date: 2014-01-19 21:26:18
updated: 2014-01-19 21:26:18
tags: [AngularJS]
categories: []
keywords:
---
原文链接：[Make Your Own AngularJS, Part 1: Scopes And Digest](http://teropa.info/blog/2013/11/03/make-your-own-angular-part-1-scopes-and-digest.html)

![AngularJS](http://bubkoo.qiniudn.com/AngularJS-large.png)

Angular 是一个成熟和功能强大的 JavaScript 框架，也是一个庞大的框架，要正真有效地使用它，需要掌握许多新概念。在 Web 开发人员涌向 Angular 的同时，许多人都面临着同样的疑问：Digest 到底是做什么的？可以有哪些不同的方式来定义一个指令（directive）？service 和 provider 之间有些什么区别？

[Angular官方文档](http://docs.angularjs.org/)是非常好的学习资源，并且还有越来越多的[第三方资源](http://syntaxspectrum.com/tag/angularjs/)，不过，想要深入了解一个新的框架，没有比分解它，然后研究其内部运作原理更加有效。

在本系列文章中，我将从零开始建立一个 AngularJS 类库，并逐步深入讲解，最后，您将对 Angular 的工作原理有一个全面深刻地理解。

这是本系列的第一部分，我们将分析 Angular 中的 scopes 的工作原理，并且将知道像 `$eval`、`$digest` 和 `$apply` 这些方法到底有些什么作用，Angular 的脏值检查（dirty-checking）貌似很神奇，但是后面您将看到的并非如此。

<!--more-->

## 关于源代码 ##

您可以在 GitHub 上获取到本项目的[完整代码](https://github.com/teropa/schmangular.js)，但是我更加鼓励您自己一步一步地跟着教程来构建，并从各个方面去研究每一行代码。同时，我在页面中嵌入了 [JSBins](http://jsbin.com/)，这样您就可以直接在页面上与代码进行交互。

我将使用 [Lo-Dash](http://lodash.com/) 来对数组和对象做一些基本操作，Angular 本身并没有使用 Lo-Dash，但是为了更好地达到我们的学习目的，就引入 Lo-Dash 来省去一些重复造轮子的工作。如果您在代码中看到以 `_` 开始的方法或对象，表示这些方法或对象都是由 Lo-Dash 提供。

在代码中我还使用了 [`console.assert`](https://developers.google.com/chrome-developer-tools/docs/console-api#consoleassertexpression_object) 方法来做一些随机测试，该方法在现代 JavaScript 环境下应该是可用的。

下面是  Lo-Dash 和 `console.assert` 方法的使用示例：

<iframe src="http://jsbin.com/UGOVUk/4/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

## Scope 对象 ##
Scope 对象其实就是一个普通的 JavaScript 对象，您可以像在其他对象上添加属性那样在 Scope 对象添加一些属性，Scope 对象是由 Scope 构造函数创建，这里我们实现了一个最简单的版本：

``` javascript
function Scope() {
}
```

现在，我们就可以通过 new 操作符来创建一个 Scope 对象了，并且可以在上面添加属性：

``` javascript
var aScope = new Scope();
aScope.firstName = 'Jane';
aScope.lastName = 'Smith';
```

这些属性并没有什么特别，也不需要调用一些特殊的 setter 方法，并且对属性值的类型也没有限制。其实真正神奇的地方在于两个特殊的方法：`$watch` 和 `$digest`。

## 监视对象属性：$watch 和 $digest ##

`$watch` 和 `$digest` 是硬币的正反两面，它们一起构成了 Scope 的核心：数据变化的响应（译者注：双向数据绑定）。

您可以使用 `$watch` 方法来给 scope 添加一个监视器，当 scope 发生变化时监视器就会收到通知。创建监视器需要给 `$watch` 传递两个参数：

- 一个监视函数，它指定了您将要监视数据
- 一个监听回调函数，当监视的数据发生变化时将被调用

<p class="dot">作为 Angular 的使用者，您通常会指定 watch 表达式而不是 watch 方法，表达式是一个字符串，比如 “user.firstName”，通常在数据绑定、指示器属性或者 JavaScript 代码中指定。表达式将被 Angular 编译成一个监视函数。在后面的文章中，我们将分析 Angular 如何编译一个表达式，在本文中我们将简单滴直接使用监视函数。</p>

为了实现 `$watch` 方法，我们需要储存所有注册的监视器，在 Scope 构造函数中添加一个数组：

``` javascript
function Scope() {
  this.$$watchers = [];
}
```

双美元符号 `$$` 表示该变量是 Angular 框架中的一个私有变量，不能被外部代码调用。

现在我们来定义 `$watch` 方法，把上面提到的两个函数作为参数，并将它们储存在 `$$watchers` 数组中。同时，我们希望 Scope 的每一个实例都具有该方法，所以将其定义在 Scope 的原型上：

``` javascript
Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn
  };
  this.$$watchers.push(watcher);
};
```

硬币的另一面就是 `$digest` 方法，它将运行所有注册在 scope 上的监视器。这里定义了一个简化的版本，仅仅实现了遍历监视器和调用侦听函数的功能，同样也将其定义在 Scope 的原型上：

``` javascript
Scope.prototype.$digest = function() {
  _.forEach(this.$$watchers, function(watch) {
    watch.listenerFn();
  });
};
```

现在，我们来注册一个监视器，然后调用 `$digest` 方法，来触发所有的侦听函数：
<iframe src="http://jsbin.com/oMaQoxa/2/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 198px;"></iframe>

当然，这并不是很有用。我们真正想要的是当监视的值发生改变时，才触发调用侦听函数。

## 脏值检查 ##

正如上文所述，监视器中的监视函数应该返回被监视数据的变更情况，通常，被监视的数据是绑定在 Scope 上的数据，为了更方便的访问 Scope 上的数据，监视函数把当前 Scope 作为它的一个参数。例如下面，在监视函数中访问 Scope 上的 `firstName` 属性：

``` javascript
function(scope) {
  return scope.firstName;
}
```

这是监控函数的一般形式：从 Scope 中获取一些值，然后返回。

`$digest` 的职责就是调用监视函数，并且将监视函数的返回值与上一次返回值进行比较，如果发现两次的返回值不一样，说明出现了脏值，同时，与监视函数对应的侦听函数将被调用。

想要实现这个功能，`$digest` 必须记住每个监视函数的上次返回值，既然我们为每一个监视器中都创建了一个对象，那么我们可以很方便地保存上一次监视函数的返回值，下面是为每个监视器检查脏值的 `$digest` 的新的实现：
 
``` javascript
Scope.prototype.$digest = function() {
  var self = this;
  _.forEach(this.$$watchers, function(watch) {
    var newValue = watch.watchFn(self);
    var oldValue = watch.last;
    if (newValue !== oldValue) {
      watch.listenerFn(newValue, oldValue, self);
      watch.last = newValue;
    }
  });  
};
```

通过循环，调用每个监视器中的监视函数，并将 Scope 作为监视函数的参数，然后将返回值与储存在 `last` 属性中的上一次返回值进行比较。如果发生改变，我们将调用侦听函数，为了方便，我们把监视函数的新返回值、上一次返回值和 Scope 作为侦听函数的参数。最后，我们将监视函数的新返回值储存在 `last` 属性中，作为下一次比较的值。

下面的示例演示了当我们调用 `$digest` 时侦听器是如果工作的：

<iframe src="http://jsbin.com/OsITIZu/5/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

现在，我们已经实现了 Angular 中 Scope 的精髓部分：添加监视并在 `$digest` 中调用它们。

我们已经可以看到 Scope 两个重要的特性：

- 将数据附加到 Scope 上，数据自身不会对性能产生影响，如果没有监视器来监视这个属性，那个这个属性在不在 Scope 上是无关重要的；Angular 并不会遍历 Scope 上的属性，它将遍历所有的观察器。
- 每个监视函数是在每次 `$digest` 过程中被调用的。因此，我们要注意观察器的数量以及每个监视函数或者监视表达式的性能。

## 收到 Digests 的通知 (Getting Notified Of Digests) ##

如果想在每次 digest 之后都收到通知，我们可以利用监视函数将在每次 digest 过程中都会被调用这个事实，只要注册一个监视函数而没有侦听函数的监视器就可以了。

为了支持这个使用场景，我们需要检查监视器中的侦听函数是否为空，如果为空则将一个空函数赋给侦听函数：

``` javascript
Scope.prototype.$watch = function(watchFn, listenerFn) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn || function() { }
  };
  this.$$watchers.push(watcher);
};
```

如果使用了这种方式，需要注意的是，即使没有提供 `listenerFn`，Angular 也将检查 `watchFn` 的返回值。如果返回了一个值，该值必须经过脏值检查，所以，为了确保在使用这种模式时不会引起额外的工作，我们在观察函数中不返回任何值。在这种情况下观察函数的返回值将始终是 `undefined`。

<iframe src="http://jsbin.com/OsITIZu/6/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

核心就是现在这样，但我们还远远没有完成。例如，有一个相当典型的场景我们还不支持：监听函数本身也可能改变 Scope 的属性，如果发生这种情况，并且还有另外一个监视函数监视了刚刚改变的属性值，那么就有可能在同一个 `digest` 过程中不会收到这个改变通知。

<iframe src="http://jsbin.com/eTIpUyE/3/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

下面让我们来修复这个问题。

## 当有脏值时保持 digest 过程 (Keep Digesting While Dirty) ##

我们需要修改 `digest` 函数，通过不间断循环遍历所有观察函数，直到所有被监视的值停止改变。 

首先，将现有的 `$digest` 函数重命名为 `$$digestOnce`，修改这个函数的实现，让它运行一次所有的观察函数，并返回一个布尔值，表示是否有任何变化：

``` javascript
Scope.prototype.$$digestOnce = function() {
  var self  = this;
  var dirty;
  _.forEach(this.$$watchers, function(watch) {
    var newValue = watch.watchFn(self);
    var oldValue = watch.last;
    if (newValue !== oldValue) {
      watch.listenerFn(newValue, oldValue, self);
      dirty = true;
      watch.last = newValue;
    }
  });
  return dirty;
};
```

然后，重新定义一个 `$digest` 函数，只要改变还在发生，在函数内部将不断循环调用 `$$digestOnce` 函数：

``` javascript
Scope.prototype.$digest = function() {
  var dirty;
  do {
    dirty = this.$$digestOnce();
  } while (dirty);
};
```

现在 `$digest` 函数将至少运行一次所有的观察函数。如果在第一次运行后，有任何的观察值发生了改变，这个过程叫标记为“脏”，然后所有的观察函数将被运行第二遍，这样继续下去，直到有一个完整的过程中所有观察值都没有发生改变，这种情况被认为是稳定的。

<p class="dot">实际上在 Angular 的 Scope 中并没有一个函数叫 `$$digestOnce`，所有的 digest  循环都是嵌套在 `$digest` 函数中。我们的目标是清晰地呈现整个过程，所以将内层循环提取到一个单独的函数中。</p>

下面是新的实现代码：

<iframe src="http://jsbin.com/Imoyosa/4/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

现在我们对观察函数有另外一个重要的认识：在一次 digest 过程中观察函数可能被运行多次，这就是为什么人们常说观察函数应该是[幂等](http://en.wikipedia.org/wiki/Idempotence)的：观察函数应该没有副作用，或者仅发生有限次数的副作用。例如，如果观察函数触发一个 Ajax 请求，这将不确定你的应用程序将发起多少次请求。

在我们现在的实现中有一个明显的遗漏：如果有两个观察函数监视着彼此彼此的变化，这将发生什么？也就是说，如果状态永远不稳定我们将怎么办？下面代码展示了这种情况。代码中 `$digest` 的调用被注释掉了，去掉注释看看将发生什么：

<iframe src="http://jsbin.com/eKEvOYa/4/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

一段时间之后 JSBin 将强制停止函数的执行（在我的机器上它运行了 100000 次迭代）。如果在像 Node.js 这样的平台上运行这段代码，它会永远运行下去。

## 丢弃一个不稳定的 Digest 过程 (Giving Up On An Unstable Digest) ##

我们需要做的是，在可接受数量的迭代范围内是保持运行 Digest 过程。如果超出迭代范围后，Scope 任然没有稳定下来，我们必须停止 Digest 过程，因为 Scope 可能永远不会稳定下来。对于这一点，我们不妨抛出一个异常，因为 Scope 的任何状态都不太可能是用户所期待的的结果。

最大数量迭代次数被称作 TTL (Time To Live)，默认情况下是 10 次，这个值看起来很小（我们刚刚运行了 100000 次 digest 过程），但请记住这是一个性能敏感地带，因为 digest 过程将经常发生，并且每次 digest 过程都将循环调用观察函数，超过 10 次的迭代通常是不可能的。

<p class="dot">事实上在 Angular 中 TTL 的值是可以[调整](http://docs.angularjs.org/api/ng.$rootScopeProvider)的，在后面的文章中，讨论 provider 和依赖注入时我们将再次讨论这个。</p>


接着，在 digest 循环外添加一个循环计数变量，如果计数到达 TTL，我们将抛出一个异常：

``` javascript
Scope.prototype.$digest = function() {
  var ttl = 10;
  var dirty;
  do {
    dirty = this.$$digestOnce();
    if (dirty && !(ttl--)) {
      throw "10 digest iterations reached";
    }
  } while (dirty);
};
```

这个更新版本会导致我们循环引用的观察函数抛出一个异常：

<iframe src="http://jsbin.com/uNapUWe/3/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

这些应该已经把 digest 说清楚了。

下面，让我们将注意力转向如何检测值变更上。

## 基于值的脏值检查 (Value-Based Dirty-Checking) ##

现在我们是通过严格相等操作符 `===` 来比较新值和旧值。这在大多数情况下是不错的，因为这可以检测到所有值类型（Number、String等）的变化，也可以检测到对象和数组改变为另一个新值（译者注：引用类型的引用改变）。但 Angular 还有另一种方式，并可以检测到对象或数组内部的改变。也就是说，必须基于值来做检测，而不是引用。

这种脏值检测机制需要在 `$watch` 函数上引入一个可选的布尔标志参数，如果标志参数为 `true`，将基于值来进行脏值检测。让我们来重新定义观察器：

``` javascript
Scope.prototype.$watch = function(watchFn, listenerFn, valueEq) {
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn,
    valueEq: !!valueEq
  };
  this.$$watchers.push(watcher);
};
```

我们做的是将标记添加到观察器，通过 `!!` 运算强制将其转换为布尔类型。当用户调用 `$watch` 时并没有提供第三个参数，那么 `valueEq` 将是 `undefined`，在 `watcher` 对象的内部将是 fasle。

基于值的脏值检测意味着我们必须遍历新旧对象或数组中所有的值，如果新旧两个值有任何差异，就表示发现了脏值。如果有其他对象或数组嵌套，也将递归比较其中的值。

Angular 是通过自身的[比较函数](https://github.com/angular/angular.js/blob/8d4e3fdd31eabadd87db38aa0590253e14791956/src/Angular.js#L812)来进行基于值的比较，我们将使用 [Lo-Dash 提供的一个函数](http://lodash.com/docs#isEqual)来替代。这里我们定义了一个新的函数，函数包含两个待比较的值和一个布尔标志，并比较相应的值：

``` javascript
Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq) {
  if (valueEq) {
    return _.isEqual(newValue, oldValue);
  } else {
    return newValue === oldValue;
  }
};
```

为了得到值改变的通知，我们也需要在观察器中修改储存旧值的方式，储存值的引用并不够，因为如果值的内部发生改变其引用并不会改变，`$$areEqual` 函数将认为这两个引用是相同的，不能监控到值的变化。因此，我们需要对将要储存的值进行深拷贝，然后再将其储存起来。

和相等检测函数一样，Angular 有一个自身的[深拷贝函数](https://github.com/angular/angular.js/blob/8d4e3fdd31eabadd87db38aa0590253e14791956/src/Angular.js#L725)，但是我们将使用 [Lo-Dash 内部提供的一个函数](http://lodash.com/docs#cloneDeep)。让我们来修改一下 `$digestOnce` 函数，这样在 `$digestOnce` 函数中将使用新的 `$$areEqual` 函数，并在需要的时进行深拷贝来储存更新后的值。

``` javascript
Scope.prototype.$$digestOnce = function() {
  var self  = this;
  var dirty;
  _.forEach(this.$$watchers, function(watch) {
    var newValue = watch.watchFn(self);
    var oldValue = watch.last;
    if (!self.$$areEqual(newValue, oldValue, watch.valueEq)) {
      watch.listenerFn(newValue, oldValue, self);
      dirty = true;
      watch.last = (watch.valueEq ? _.cloneDeep(newValue) : newValue);
    }
  });
  return dirty;
};
```

现在，我们可以看到两种脏值检查之间的区别：
<iframe src="http://jsbin.com/ARiWENO/4/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

基于值进行检查明显比仅仅检查引用更复杂，有时可能会很复杂，遍历嵌套的数据结构需要时间，并且进行深拷贝也占用内存，这就是为什么 Angular 默认不是基于值进行脏值检测的原因，用户需要显式地设置标志来启用它。

<p class="dot">Angular 还提供了第三种脏值检测的机制：检测集合。与基于值的脏值检测机制一样，也将检测对象和数组的内部，不一样的是，它是一个浅检测，不递归到更深层次，这使其性能比基于值检测更好。通过调用 `$watchCollection` 函数来实现这种检测机制，在本系列的后续文章中我们将看到它是如何实现的。</p>

在完成值比较之前，我们还需要处理一个 JavaScript 陷阱。

## 非数字（NaN） ##

在 JavaScript 中 NaN (Not a Number) 与自身并不相等，这听起来可能有点怪，但是确实就是这样。如果我们不在脏值检测函数中对 NaN 进行特殊处理，那么包含 NaN 的观察器将始终是脏的。

在基于值的脏值检测函数中，Lo-Dash 的 `isEqual` 函数已经为我们处理了这种情况，但是在基于引用的脏值检测函数中我们需要自己来处理，我们需要对 `$$areEqual` 函数进行微小的修改：

``` javascript
Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq) {
  if (valueEq) {
    return _.isEqual(newValue, oldValue);
  } else {
    return newValue === oldValue ||
      (typeof newValue === 'number' && typeof oldValue === 'number' &&
       isNaN(newValue) && isNaN(oldValue));
  }
};
```

这样，包含 NaN 的观察器也将符合预期：

<iframe src="http://jsbin.com/ijINaRA/3/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

有了脏值检测的实现，现在该将我们的注意力转向应用程序中与 Scope 进行交互的方式上了。

## $eval - 在 Scope 上下文中执行代码 ##

在 Angular 中有几种方法来容许你在 Scope 上下文中执行代码。其中最简单的就是 `$eval` 方法，它使用一个函数作为参数，在方法内部该函数将被调用，调用时将 Scope 自身作为一个参数传递给它，然后返回该函数的返回值。`$eval` 方法也可以有一个可选的第二个参数，该参数将作为第一个参数被调用时的参数。

`$eval` 的实现如下：

``` javascript
Scope.prototype.$eval = function(expr, locals) {
  return expr(this, locals);
};
```

使用 `$eval` 也非常简单：

<iframe src="http://jsbin.com/UzaWUC/3/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

那么，为什么要使用这种看似迂回的方式来调用一个函数呢？这是因为 `$eval` 明确指定了代码在 Scope 的上下文中执行。接下来我们将会看到 `$eval` 也构建了 `$apply` 的上下文。

然而，或许使用 `$eval` 最有趣的地方不是传入函数，而是前面提到过的表达式。就和 `$watch` 方法一样，你可以给 `$eval` 方法传递一个字符串表达式，`$eval` 将编译该字符串然后在 Scope 的上下文中执行。我们将在本系列的后续文章中实现这个。

## $apply - 集成外部代码到 digest 循环 ##

或许 Scope 上我们知道最多的是 `$apply`，它被誉为 Angular 集成外部代码的标准方法，这样说是有原因的。

`$apply` 把一个函数作为参数，接着在其内部使用 `$eval` 掉用该函数，然后再进行 digest 循环。下面是简单的实现：

``` javascript
Scope.prototype.$apply = function(expr) {
  try {
    return this.$eval(expr);
  } finally {
    this.$digest();
  }
};
```

将 `$digest` 放在 finally 中，来确保即使函数中发生了异常，也会执行 digest 过程。

`$apply` 的最大创意在于执行一些不受 Angular 管控的代码，这些代码可能修改 Scope 中的某些值， `$apply` 可以确保观察器可以收到这些改变的通知。当人们提到使用 `$apply` 来将外部代码集成到 Abgular 的生命周期中时，他们指的就是这个事情，实在没有比这更重要的了。

下面是 `$apply` 的实例：

<iframe src="http://jsbin.com/UzaWUC/4/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

## $evalAsync - 延迟执行 ##

在 JavaScript 中延迟执行一段代码很常见 - 把执行延迟到当前执行上下文结束之后的未来某个时间点，通常的方法是通过调用 `setTimeout()` 函数，传递一个 0 (或很小)延迟参数。

这种模式也适用于 Angular 应用程序，尽管首选的方法是通过使用 `$timeout` [服务](http://docs.angularjs.org/api/ng.$timeout)，不同的是，`$timeout` 将通过 `$apply` 方法将延迟函数集成到 digest 循环的生命周期中。

但在 Angular 中还有另外一种方式来延迟代码的执行，那就是 `Scope.$evalAsync` 函数， `$evalAsync` 接收一个函数作为参数，并使其在当前 digest 循环或下一个 digest 循环之前被执行。例如，你可以在观察函数中延迟执行一段代码，虽然被延迟执行，但任然会在当前 digest 循环中被调用。

首先，我们需要一种方式来储存 `$evalAsync` 中计划的任务，可以在 Scope 的构造函数中初始化一个数组来实现：

``` javascript
function Scope() {
  this.$$watchers = [];
  this.$$asyncQueue = [];
}
```

然后，定义 `$evalAsync` 函数，将需要延迟执行的方法添加到队列中：

``` javascript
Scope.prototype.$evalAsync = function(expr) {
  this.$$asyncQueue.push({scope: this, expression: expr});
};
```

<p class='dot'>我们将当前 Scope 显示地设置在延迟队列中的目的在于 Scope 的继承，我们将在本系列的下一篇文章中讨论。</p>

接着，我们在 `$digest` 函数中使用 `$eval` 调用延迟队列中的所有被延迟的方法：

``` javascript
Scope.prototype.$digest = function() {
  var ttl = 10;
  var dirty;
  do {
    while (this.$$asyncQueue.length) {
      var asyncTask = this.$$asyncQueue.shift();
      this.$eval(asyncTask.expression);
    }
    dirty = this.$$digestOnce();
    if (dirty && !(ttl--)) {
      throw "10 digest iterations reached";
    }
  } while (dirty);
};
```

这个实现确保了：当 Scope 正处于“脏”的状态时你推迟一个函数的执行，这个函数会被延迟，但是还是处于当前的 digest 循环中。

下面是 `$evalAsync` 的使用实例：

<iframe src="http://jsbin.com/ilepOwI/2/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

## Scope 的阶段状态（Scope Phases） ##

`$evalAsync` 所做的另外一件事是：如果当前没有正在运行的 digest 循环，就延迟执行一个，这样就可以确保，每当调用 `$evalAsync` 方法时，digest 循环将很快被触发，而不是等待引发一个 digest 循环。

`$evalAsync` 需要一个机制来检查是否已经有一个 digest 循环正在运行，如果已经有一个 digest 循环就不必再执行一个。为此，Angular 引入了 *phase*，它就是 Scope 上的一个字符串属性，储存了当前正在发生着什么。

在 Scope 的构造函数中引入 `$$phase` 字段，并初始化为 null。

``` javascript
function Scope() {
  this.$$watchers = [];
  this.$$asyncQueue = [];
  this.$$phase = null;
}
```

然后，我们定义了两个方法来控制 phase：一个用于设置，另一个用于清理，同时添加一个额外的检查，以确保我们不会试图设置一个已经激活的 phase：

``` javascript
Scope.prototype.$beginPhase = function(phase) {
  if (this.$$phase) {
    throw this.$$phase + ' already in progress.';
  }
  this.$$phase = phase;
};
 
Scope.prototype.$clearPhase = function() {
  this.$$phase = null;
};
```

在 `$digest` 方法中，在 digest 循环开始前将 pahse 的值设置为 "$digest" ：

``` javascript
Scope.prototype.$digest = function() {
  var ttl = 10;
  var dirty;
  this.$beginPhase("$digest");
  do {
    while (this.$$asyncQueue.length) {
      var asyncTask = this.$$asyncQueue.shift();
      this.$eval(asyncTask.expression);
    }
    dirty = this.$$digestOnce();
    if (dirty && !(ttl--)) {
      this.$clearPhase();
      throw "10 digest iterations reached";
    }
  } while (dirty);
  this.$clearPhase();
};
```

把 `$apply` 函数也修改一下，在其内部设置 phase，这对我们调试非常有帮助：

``` javascript
Scope.prototype.$apply = function(expr) {
  try {
    this.$beginPhase("$apply");
    return this.$eval(expr);
  } finally {
    this.$clearPhase();
    this.$digest();
  }
};
```

最后，我们在 `$evalAsync` 函数中添加 digest 计划任务，它将检查当前 Scope 的 phase，如果 phase 没有被设置（并且没有异步的计划任务），就把这个 digest 列入计划。

``` javascript
Scope.prototype.$evalAsync = function(expr) {
  var self = this;
  if (!self.$$phase && !self.$$asyncQueue.length) {
    setTimeout(function() {
      if (self.$$asyncQueue.length) {
        self.$digest();
      }
    }, 0);
  }
  self.$$asyncQueue.push({scope: self, expression: expr});
};
```

这样，不管什么时候调用 `$evalAsync`，都可以确保一定有一个 digest 将在稍候就发生。

<iframe src="http://jsbin.com/iKeSaGi/2/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 206px;"></iframe>

## $$postDigest - digest 之后执行代码 ##

通过计划执行一个 `$$postDigest` 函数，也可以把代码附加到 digest 循环中。

双美元符号 `$$` 表示该函数是 Angular 的一个内部函数，不是应用开发人员应该使用的，但是它确实存在，因此我们也要实现它。

和 `$evalAsync` 一样，`$$postDigest` 也是延迟执行一个任务，不同的是，被延迟的任务是在下一次 digest 循环结束之后执行。`$$postDigest` 并不会引起计划执行一个 digest 循环，所以只有某些其他原因引发 digest 循环后才会调用被延迟的函数，因此，如果在延迟函数内部也修改了 Scope 上的数据，您需要手动调用 `$digest` 或 `$apply` 来使得这些变更会被监视到。

首先，我们在 Scope 的构造函数中添加一个 `$$postDigest` 将要使用到的队列：

``` javascript
function Scope() {
  this.$$watchers = [];
  this.$$asyncQueue = [];
  this.$$postDigestQueue = [];
  this.$$phase = null;
}
```

然后，实现 `$$postDigest` 函数，它所做的就是将给定的函数添加到队列中：

``` javascript
Scope.prototype.$$postDigest = function(fn) {
  this.$$postDigestQueue.push(fn);
};
```

最后，在 `$digest` 函数中，当 digest 循环结束之后，遍历并调用队列中的函数：

``` javascript
Scope.prototype.$digest = function() {
  var ttl = 10;
  var dirty;
  this.$beginPhase("$digest");
  do {
    while (this.$$asyncQueue.length) {
      var asyncTask = this.$$asyncQueue.shift();
      this.$eval(asyncTask.expression);
    }
    dirty = this.$$digestOnce();
    if (dirty && !(ttl--)) {
      this.$clearPhase();
      throw "10 digest iterations reached";
    }
  } while (dirty);
  this.$clearPhase();
 
  while (this.$$postDigestQueue.length) {
    this.$$postDigestQueue.shift()();
  }
};
```

这样我们就可以使用 `$$postDigest` 函数了：
<iframe src="http://jsbin.com/IMEhowO/5/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 208px;"></iframe>

## 异常处理 ##

我们现有的实现已经非常接近 Angular 的实际样子了，但是还比较脆弱，这是因为我们还没有花太多心思去做异常处理。
 
在 Angular 中，Scope 在遇到错误时是非常健壮的： 当在监控函数、`$evalAsync` 函数或者 `$$postDigest` 函数中发生异常时，并不会导致 digest 循环的终止。在我们现在实现中，以上任何函数中发生异常都会导致 digest 循环的终止。

不过，这也很容易修复，把上面三个函数的调用都包在 `try...catch` 中就可以了。

<p class="dot">
Angular 实际上是把这些异常抛给了它的 [$exceptionHandler 服务](http://docs.angularjs.org/api/ng.$exceptionHandler)。但是我们现在还没有实现这个服务，所以就先把这些异常打印到控制台上。
</p>

对 `$evalAsync` 和 `$$postDigest` 的异常处理是在 `$digest` 函数内部进行的，在延迟函数中抛出的异常将被记录成日志，而后面的延迟函数将继续正常执行：

``` javascript
Scope.prototype.$digest = function() {
  var ttl = 10;
  var dirty;
  this.$beginPhase("$digest");
  do {
    while (this.$$asyncQueue.length) {
      try {
        var asyncTask = this.$$asyncQueue.shift();
        this.$eval(asyncTask.expression);
      } catch (e) {
        (console.error || console.log)(e);
      }
    }
    dirty = this.$$digestOnce();
    if (dirty && !(ttl--)) {
      this.$clearPhase();
      throw "10 digest iterations reached";
    }
  } while (dirty);
  this.$clearPhase();
 
  while (this.$$postDigestQueue.length) {
    try {
      this.$$postDigestQueue.shift()();
    } catch (e) {
      (console.error || console.log)(e);
    }
  }
};
```

对观察函数的异常处理是在 `$$digestOnce` 函数中进行的：

``` javascript
Scope.prototype.$$digestOnce = function() {
  var self  = this;
  var dirty;
  _.forEach(this.$$watchers, function(watch) {
    try {
      var newValue = watch.watchFn(self);
      var oldValue = watch.last;
      if (!self.$$areEqual(newValue, oldValue, watch.valueEq)) {
        watch.listenerFn(newValue, oldValue, self);
        dirty = true;
        watch.last = (watch.valueEq ? _.cloneDeep(newValue) : newValue);
      }
    } catch (e) {
      (console.error || console.log)(e);
    }
  });
  return dirty;
};
```

现在我们的 digest 循环碰到异常的时候健壮多了：
<iframe src="http://jsbin.com/IMEhowO/6/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 208px;"></iframe>

## 销毁监听器 ##

通常，我们注的监视器都一直存在于 Scope 的生命周期中，很少需要显示地去移除这些监视器。但是在有些场景下，我么需要在 Scope 的生命周期中把某个监听器移除。

Angular 中的 `$watch` 函数实际上是有返回值的，它返回的是一个函数，当调用该函数时，可以移除刚刚注册的监视器。为了实现我们自己的版本，我们需要返回一个函数来将监视器从 `$$watchers` 数组中移除：

``` javascript
Scope.prototype.$watch = function(watchFn, listenerFn, valueEq) {
  var self = this;
  var watcher = {
    watchFn: watchFn,
    listenerFn: listenerFn,
    valueEq: !!valueEq
  };
  self.$$watchers.push(watcher);
  return function() {
    var index = self.$$watchers.indexOf(watcher);
    if (index >= 0) {
      self.$$watchers.splice(index, 1);
    }
  };
};
```

现在，我们可以储存 `$watch` 函数的返回值，以后通过调用它来移除这个监视器：

<iframe src="http://jsbin.com/IMEhowO/7/embed?js,console" class="jsbin-embed" id="" style="border: 1px solid rgb(170, 170, 170); width: 100%; min-height: 300px; height: 208px;"></iframe>

## 展望 ##

我们已经取得了很大的进展，并且已经实现了一个完美可用的，类似 Angular 这样基于脏检测的 Scope 系统，但是 Angular 中的 Scope 要复杂得多。

更重要的是，在 Angular 里 Scope 对象并不是孤立对象，相反，一个 Scope 对象是可以继承另外一个 Scope 对象的，并且监视器不仅可以监视当前 Scope 对象上的数据变化，还可以监视其父 Scope 对象。概念虽然简单，这却让很多初学者很困惑。所以，本系列的下一篇文章主题就是 Scope 的继承。

随后，我们还会讨论 Angular 的事件系统，这也是在 Scope 上实现的。

![](http://bubkoo.qiniudn.com/Build%20Your%20Own%20AngularJS.jpg)

[这里](http://teropa.info/build-your-own-angular)有该书的电子版，不过要花钱。