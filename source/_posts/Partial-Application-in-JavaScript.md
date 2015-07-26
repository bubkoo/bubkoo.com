

title: Partial Application in JavaScript
tags: [Partial Application]
categories: [JavaScript]
date: 2014-11-13 10:32:45
keywords: Partial Application
---

## 概述

[Partial Application](http://en.wikipedia.org/wiki/Partial_application)？不要被字面意思误解，这里要说的并不是 Application，而是 JavaScript 中的 `function`。可以这样来描述 Partial Application，一个接受多个参数的函数，预先给该函数绑定一些参数，并返回一个新的函数来接受剩下未绑定的参数。貌似有点像柯里化(currying)函数，但不尽然。

典型的柯里化函数定义如下：

```js
Function.prototype.curry = function() {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return function() {
      return fn.apply(this, args.concat(
        Array.prototype.slice.call(arguments)));
    };
};
```

上面代码预先绑定函数参数列表左侧的参数到新返回的函数中，新函数接受右侧剩下的参数，相比起来 Partial Application 更加灵活。
<!--more-->

## 分情况看看 Partial Application

### From the Left

这里和上面的柯里化类似，预先绑定函数左侧的参数，调用时传入右侧剩下的参数：


```js
function partial(fn /*, args...*/) {
  var slice = Array.prototype.slice;
  // 将参数转换为数组，除开第一个参数
  var args = slice.call(arguments, 1);

  return function() {
    // 调用原来的方法，并将参数拼接到预先绑定的参数后面
    return fn.apply(this, args.concat(slice.call(arguments, 0)));
  };
}
```

使用也比较简单：


```js
// 将传入的所有参数求和
function addAllTheThings() {
  var sum = 0;
  for (var i = 0; i < arguments.length; i++) {
    sum += arguments[i];
  }
  return sum;
}

// 正常调用
addAllTheThings(1, 2);            // 3
addAllTheThings(1, 2, 3);         // 6
addAllTheThings(1, 4, 9, 16, 25); // 55

// 预先绑定左侧参数
var addOne = partial(addAllTheThings, 1);
addOne()                          // 1
addOne(2);                        // 3
addOne(2, 3);                     // 6
addOne(4, 9, 16, 25);             // 55

var addTen = partial(addAllTheThings, 1, 2, 3, 4);
addTen();                         // 10
addTen(2);                        // 12
addTen(2, 3);                     // 15
addTen(4, 9, 16, 25);             // 64
```

### From the Right

实现方式类似：

```js
function partialRight(fn /*, args...*/) {
  var slice = Array.prototype.slice;
  var args = slice.call(arguments, 1);

  return function() {
    // 将剩下参数拼接在预先绑定参数的左侧 
    return fn.apply(this, slice.call(arguments, 0).concat(args));
  };
}
```

使用例子：

```js
function wedgie(a, b) {
  return a + ' gives ' + b + ' a wedgie.';
}

var joeGivesWedgie = partial(wedgie, 'Joe');
joeGivesWedgie('Ron');    // "Joe gives Ron a wedgie."
joeGivesWedgie('Bob');    // "Joe gives Bob a wedgie."

var joeReceivesWedgie = partialRight(wedgie, 'Joe');
joeReceivesWedgie('Ron'); // "Ron gives Joe a wedgie."
joeReceivesWedgie('Bob'); // "Bob gives Joe a wedgie."
```

上面代码需要注意的是，如果使用时给函数传递不止一个参数，那么预先绑定的参数将不起任何作用。更加健壮的代码需要将函数参数的个数也考虑进来。


### From Anywhere 

上面两种情况预先绑定的参数和后传入的参数都要求有一定顺序，而我们可能需要随机替换参数中的某些值，为了达到这个目的我们可以给预绑定的参数赋值为某个占位符，函数实际调用时，再用传入的参数来替换这些占位符，请看下面代码：

```js
var partialAny = (function() {

  var slice = Array.prototype.slice;

  function partialAny(fn /*, args...*/) {
    // 预先绑定的参数
    var orig = slice.call(arguments, 1);

    return function() {
      // 后面传入的参数
      var partial = slice.call(arguments, 0);
      var args = [];

      // 如果预绑定的参数为占位符，则用传入的参数替换
      for (var i = 0; i < orig.length; i++) {
        args[i] = orig[i] === partialAny._ ? partial.shift() : orig[i];
      }

      // 占位符替换结束后，将替换后的预绑定参数与剩余参数拼接为参数数组
      return fn.apply(this, args.concat(partial));
    };
  }

  // 定义参数占位符
  partialAny._ = {};

  return partialAny;
}());
```

请看实例：


```js
function hex(r, g, b) {
  return '#' + r + g + b;
}

hex('11', '22', '33'); // "#112233"

// A more visually-appealing placeholder.
var __ = partialAny._;

var redMax = partialAny(hex, 'ff', __, __);
redMax('11', '22');    // "#ff1122"

var greenMax = partialAny(hex, __, 'ff');
greenMax('33', '44');  // "#33ff44"

var blueMax = partialAny(hex, __, __, 'ff');
blueMax('55', '66');   // "#5566ff"

var magentaMax = partialAny(hex, 'ff', __, 'ff');
magentaMax('77');      // "#ff77ff"
```

### "Full" Application?

如果给一个函数预先绑定了所有参数，那么这里的 partial 就失去了意义，看下面例子：

```js
function add(a, b) {
    // 这里没有使用 arguments，而是直接使用了形参
    return a + b;
}

// 这里已经绑定了所有参数
var alwaysNine = partial(add, 4, 5);
alwaysNine();     // 9
alwaysNine(1);    // 9 - 等于调用 add(4, 5, 1)
alwaysNine(9001); // 9 - 等于调用 add(4, 5, 9001)
```

## 使用 `bind()` 

熟悉 `bind()` 的同学大概知道，`bind()` 方法不仅可以指定函数的执行上下文，还可以给函数预绑定一些参数：


```js
var add = function (a, b) {
  return a + b;
};
var add2 = add.bind(null, 2);

add2(10) === 12;
```

我们通常的 DOM 事件绑定方式如下：

```js
this.setup = function () {
  this.on('tweet', function (e, data) {
    this.handleStreamEvent('tweet', e, data);
  }.bind(this));
  this.on('retweet', function (e, data) {
    this.handleStreamEvent('retweet', e, data);
  }.bind(this));
};
```
 如果 `tweet` 和 `retweet` 事件回调的内部逻辑差不多，这样组织代码非常不错，但是，还是有一些冗余代码，两个绑定都需要创建一个匿名函数，并在匿名函数上调用 `bind` 来绑定 `this`，确保上下文，然后在匿名函数内部调用绑定方法。
 
 其实我们有更简单的方式：
 
 
```js
this.setup = function () {
  this.on('tweet', this.handleStreamEvent.bind(this, 'tweet'));
  this.on('retweet', this.handleStreamEvent.bind(this, 'retweet'));
};
```

代码非常清爽吧！这里，我们创建了两个 partially applied 的函数，绑定了 `this`，并分别预先传入 `tweet` 和 `retweet` 两个参数，当事件触发时，再分别传入 `e` 和 `data` 两个参数。


## 参考文章

- [Partial Application in JavaScript](http://benalman.com/news/2012/09/partial-application-in-javascript) by  [BEN ALMAN](http://benalman.com/)
- [Partial Application in JavaScript](http://ejohn.org/blog/partial-functions-in-javascript/) by [John Resig](http://ejohn.org/)
- [Partial Application in JavaScript using bind()](http://passy.svbtle.com/partial-application-in-javascript-using-bind)