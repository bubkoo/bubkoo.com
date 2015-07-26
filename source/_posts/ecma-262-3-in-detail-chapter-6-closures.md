title: ECMA-262-3 详解 第六章 闭包
tags: [ECMA-262-3, ECMAScript, Closure, Funarg]
categories: [JavaScript]
date: 2014-06-15 21:56:23
keywords:
---
本文译自 [Dmitry A. Soshnikov](http://dmitrysoshnikov.com/) 的文章 [ECMA-262-3 in detail. Chapter 6. Closures](http://dmitrysoshnikov.com/ecmascript/chapter-5-functions/).

其中大部分参考了 [goddyzhao](http://zh.blog.goddyzhao.me/) 的[翻译](http://zh.blog.goddyzhao.me/post/11311499651/closures)。

## 概述

本文将介绍在 JavaScript 中大家经常讨论的话题 -- 闭包（Closure）。事实上，闭包是个老生常谈的话题了，管如此，这里还是要试着从理论角度来讨论下闭包，看看 ECMAScript 中的闭包内部究竟是如何工作的。

正如在此前文章中提到的，这些文章都是系列文章，相互之间都是有关联的。因此，为了更好的理解本文要介绍的内容， 建议先去阅读下[第四章 作用域链](http://bubkoo.com/2014/06/01/ecma-262-3-in-detail-chapter-4-scope-chain/)和[第二章 变量对象](http://bubkoo.com/2014/05/31/ecma-262-3-in-detail-chapter-2-variable-object/)。
<!--more-->

## 概论

在开始讨论 ECMAScript 闭包之前，先来介绍下函数式编程（与 ECMA-262-3 标准无关）中一些基本定义。然而，为了更好的解释这些定义，这里还是拿 ECMAScript 来举例。

众所周知，在函数式语言中（ECMAScript 也支持这种风格），函数即是数据。就比方说，函数可以保存在变量中，可以当参数传递给其他函数，还可以当返回值返回等等。这类函数有特殊的名字和结构。

### 定义

> 函数式参数（Funarg） —— 值为函数的参数。

看下面例子：

```js
function exampleFunc(funArg) {
  funArg();
}
 
exampleFunc(function () {
  alert('funArg');
});
```

上面代码中，`funArg` 的实参是一个传递给 `exampleFunc` 的匿名函数。

> 反过来，接受函数式参数的函数称为*高阶函数（high-order function 简称：HOF）*。

还可以称作：*函数式函数*或者偏数理的叫法：*操作符函数*。上述例子中，`exampleFunc` 就是这样的函数。

此前提到的，函数不仅可以作为参数，还可以作为返回值。

> 这类以函数为返回值的函数称为*带函数值的函数（functions with functional value or function valued functions）*。

```js
(function functionValued() {
  return function () {
    alert('returned function is called');
  };
})()();
```

> 可以以正常数据形式存在的函数（比方说：当参数传递，接受函数式参数或者以函数值返回）都称作*第一类函数*（一般说*第一类对象*）。

在 ECMAScript 中，所有的函数都是第一类对象。

以自己作为参数的函数称为*自应用函数（auto-applicative function 或 self-applicative function）*：

```js
(function selfApplicative(funArg) {
 
  if (funArg && funArg === selfApplicative) {
    alert('self-applicative');
    return;
  }
 
  selfApplicative(selfApplicative);
 
})();
```

以自己为返回值的函数称为*自复制函数（auto-replicative function 或 self-replicative function）*。通常，“自复制”这个词用在文学作品中：

```js
(function selfReplicative() {
  return selfReplicative;
})();
```

在函数式参数中定义的变量，在 `funarg` 激活时就能够访问了（因为存储上下文数据的变量对象每次在进入上下文阶段时就创建出来了）：

```js
function testFn(funArg) {
 
  // 激活funarg, 本地变量localVar可访问
  funArg(10); // 20
  funArg(20); // 30
 
}
 
testFn(function (arg) {
 
  var localVar = 10;
  alert(arg + localVar);
 
});
```

然而，我们知道（特别在[第四章](http://bubkoo.com/2014/06/01/ecma-262-3-in-detail-chapter-4-scope-chain/)中提到的），在 ECMAScript 中，函数是可以封装在父函数中的，并可以使用父函数上下文的变量。这个特性会引发 funarg 问题。

### Funarg 问题

在[面向堆栈的编程语言](http://en.wikipedia.org/wiki/Stack-oriented_programming_language)中，函数的本地变量都是保存在堆栈上的，每当函数激活的时候，这些变量和函数参数都会压栈到该堆栈上。

当函数返回的时候，这些参数又会从堆栈中移除。这种模型对将函数作为函数式值使用的时候有很大的限制（比方说，作为返回值从父函数中返回）。绝大部分情况下，问题会出现在当函数有自由变量的时候。

> 自由变量是指在函数中使用的，但既不是函数参数也不是函数的局部变量的变量

如下所示：

```js
function testFn() {
 
  var localVar = 10;
 
  function innerFn(innerParam) {
    alert(innerParam + localVar);
  }
 
  return innerFn;
}
 
var someFn = testFn();
someFn(20); // 30
```

上述例子中，对于 `innerFn` 函数来说，`localVar` 就属于自由变量。

对于采用*面向堆栈模型*来存储局部变量的系统而言，就意味着当 `testFn` 函数调用结束后，其局部变量都会从堆栈中移除。这样一来，当从外部对 `innerFn` 进行函数调用的时候，就会发生错误（因为 `localVar` 变量已经不存在了）。

而且，上述例子在 面向堆栈实现模型中，要想将 `innerFn` 以返回值返回根本是不可能的。因为它也是 `testFn` 函数的局部变量，也会随着 `testFn` 的返回而移除。

还有一个函数对象问题和当系统采用动态作用域，函数作为函数参数使用的时候有关。

看如下例子（伪代码）：

```js
var z = 10;
 
function foo() {
  alert(z);
}
 
foo(); // 10 – 静态作用域和动态作用域情况下都是
 
(function () {
 
  var z = 20;
  foo(); // 10 – 静态作用域情况下, 20 – 动态作用域情况下
 
})();
 
// 将foo函数以参数传递情况也是一样的
 
(function (funArg) {
 
  var z = 30;
  funArg(); // 10 – 静态作用域情况下, 30 – 动态作用域情况下
 
})(foo);
```

我们看到，采用动态作用域，变量（标识符）处理是通过动态堆栈来管理的。因此，自由变量是在当前活跃的动态链中查询的，而不是在函数创建的时候保存起来的静态作用域链中查询的。

这样就会产生冲突。比方说，即使 `z` 仍然存在（与之前从堆栈中移除变量的例子相反），还是会有这样一个问题：在不同的函数调用中，`z` 的值到底取哪个呢（从哪个上下文，哪个作用域中查询）？

上述描述的就是两类 funarg 问题 —— 取决于是否将函数以返回值返回（第一类问题）以及是否将函数当函数参数使用（第二类问题）。

为了解决上述问题，就引入了*闭包*的概念。

### 闭包

> 闭包是代码块和创建该代码块的上下文中数据的结合。

让我们来看下面这个例子（伪代码）：

```js
var x = 20;
 
function foo() {
  alert(x); // 自由变量 "x" == 20
}
 
// foo的闭包
fooClosure = {
  call: foo // 对函数的引用
  lexicalEnvironment: {x: 20} // 查询自由变量的上下文
};
```

上述例子中，`fooClosure` 部分是伪代码。对应的，在 ECMAScript 中，`foo` 函数已经有了一个内部属性 —— 创建该函数上下文的作用域链（`[[Scope]]`）。

这里 lexical 是不言而喻的，通常是省略的。上述例子中是为了强调在闭包创建的同时，上下文的数据就会保存起来。 当下次调用该函数的时候，自由变量就可以在保存的（闭包）上下文中找到了，正如上述代码所示，变量 `z` 的值总是10。

定义中我们使用的比较广义的词 —— “代码块”，然而，通常（在 ECMAScript 中）会使用我们经常用到的函数。当然，并不是所有对闭包的实现都会将闭包和函数绑在一起，比方说，在 Ruby 语言中，闭包就有可能是：一个程序对象（procedure object），一个 lambda 表达式或者是代码块。

对于要实现将局部变量在上下文销毁后仍然保存下来，基于堆栈的实现显然是不适用的（因为与基于堆栈的结构相矛盾）。 因此在这种情况下，上层作用域的闭包数据是通过动态分配内存的方式来实现的（基于“堆”的实现），配合使用垃圾回收器（garbage collector 简称 GC）和引用计数（reference counting）。这种实现方式比基于堆栈的实现性能要低，然而，任何一种实现总是可以优化的：可以分析函数是否使用了自由变量，函数式参数或者函数式值，然后根据情况来决定 —— 是将数据存放在堆栈中还是堆中。

## ECMAScript 闭包的实现

讨论完理论部分，接下来让我们来介绍下 ECMAScript 中闭包究竟是如何实现的。这里还是有必要再次强调下：ECMAScript 只使用[静态（词法）作用域](http://en.wikipedia.org/wiki/Scope_programming#Lexical_scoping)（而诸如 Perl 这样的语言，既可以使用静态作用域也可以使用动态作用域进行变量声明）。

```js
var x = 10;
 
function foo() {
  alert(x);
}
 
(function (funArg) {
 
  var x = 20;
 
  // funArg的变量 "x" 是静态保存的，在该函数创建的时候就保存了
 
  funArg(); // 10, 而不是 20
 
})(foo);
```

从技术角度来说，创建该函数的上层上下文的数据是保存在函数的内部属性 `[[Scope]]` 中的。如果你还不了解什么是 `[[Scope]]`，建议你先阅读[第四章](http://bubkoo.com/2014/06/01/ecma-262-3-in-detail-chapter-4-scope-chain/)，该章节对 `[[Scope]]` 作了非常详细的介绍。如果你对 `[[Scope]]` 和作用域链的知识完全理解了的话，那对闭包也就完全理解了。

根据函数创建的算法，我们知道在 ECMAScript 中，所有的函数都是闭包，因为它们都是在创建的时候就保存了上层上下文的作用域链（除开异常的情况，不管这个函数后续是否会激活 —— `[[Scope]]` 在函数创建的时候就有了）：

```js
var x = 10;
 
function foo() {
  alert(x);
}
 
// foo is a closure
foo: <FunctionObject> = {
  [[Call]]: <code block of foo>,
  [[Scope]]: [
    global: {
      x: 10
    }
  ],
  ... // other properties
};
```

正如此前提到过的，出于优化的目的，当函数不使用自由变量的时候，实现层可能就不会保存上层作用域链。然而，ECMAScript-262-3 标准中并未对此作任何说明；因此，严格来说 —— 所有函数都会在创建的时候将上层作用域链保存在 `[[Scope]]` 中。

在某些实现中，允许对闭包作用域直接进行访问。比如 Rhino，针对函数的 `[[Scope]]` 属性，对应有一个非标准的 `__parent__` 属性，在[第二章](http://bubkoo.com/2014/05/31/ecma-262-3-in-detail-chapter-2-variable-object/)中作过介绍：

```js
var global = this;
var x = 10;
 
var foo = (function () {
 
  var y = 20;
 
  return function () {
    alert(y);
  };
 
})();
 
foo(); // 20
alert(foo.__parent__.y); // 20
 
foo.__parent__.y = 30;
foo(); // 30
 
// 还可以操作作用域链
alert(foo.__parent__.__parent__ === global); // true
alert(foo.__parent__.__parent__.x); // 10
```

### “万能”的 `[[Scope]]`

这里还要注意的是：在 ECMAScript 中，同一个上下文中创建的闭包是共用一个 `[[Scope]]` 属性的。也就是说，某个闭包对其中的变量做修改会影响到其他闭包对其变量的读取：

```js
var firstClosure;
var secondClosure;
 
function foo() {
 
  var x = 1;
 
  firstClosure = function () { return ++x; };
  secondClosure = function () { return --x; };
 
  x = 2; // 对AO["x"]产生了影响, 其值在两个闭包的[[Scope]]中
 
  alert(firstClosure()); // 3, 通过 firstClosure.[[Scope]]
}
 
foo();
 
alert(firstClosure()); // 4
alert(secondClosure()); // 3
```

正因为这个特性，很多人都会犯一个非常常见的错误：当在循环中创建了函数，然后将循环的索引值和每个函数绑定的时候，通常得到的结果不是预期的（预期是希望每个函数都能够获取各自对应的索引值）。

```js
var data = [];
 
for (var k = 0; k < 3; k++) {
  data[k] = function () {
    alert(k);
  };
}
 
data[0](); // 3, 而不是 0
data[1](); // 3, 而不是 1
data[2](); // 3, 而不是 2
```

上述例子就证明了 —— 同一个上下文中创建的闭包是共用一个 `[[Scope]]` 属性的。因此上层上下文中的变量 `k`是可以很容易就被改变的。

如下所示：

```js
activeContext.Scope = [
  ... // higher variable objects
  {data: [...], k: 3} // activation object
];
 
data[0].[[Scope]] === Scope;
data[1].[[Scope]] === Scope;
data[2].[[Scope]] === Scope;
```

这样一来，在函数激活的时候，最终使用到的 `k` 就已经变成了 `3` 了。

<p class="j-quote">这与所有变量都是在代码执行前创建好相关，即在进入上下文阶段时创建了所有变量，这个行为就是所谓的“变量提升”。</p>

如下所示，创建一个额外的闭包就可以解决这个问题了：

```js
var data = [];
 
for (var k = 0; k < 3; k++) {
  data[k] = (function _helper(x) {
    return function () {
      alert(x);
    };
  })(k); // 将 "k" 值传递进去
}
 
// 现在就对了
data[0](); // 0
data[1](); // 1
data[2](); // 2
```

上述例子中，函数 `_helper` 创建出来之后，通过参数 `k` 激活。其返回值也是个函数，该函数保存在对应的数组元素中。这种技术产生了如下效果：在函数激活时，每次 `_helper` 都会创建一个新的变量对象，其中含有参数 `x`，`x` 的值就是传递进来的 `k` 的值。这样一来，返回的函数的 `[[Scope]]` 就成了如下所示：

```js
data[0].[[Scope]] === [
  ... // 更上层的变量对象
  上层上下文的AO: {data: [...], k: 3},
  _helper上下文的AO: {x: 0}
];
 
data[1].[[Scope]] === [
  ... // 更上层的变量对象
  上层上下文的AO: {data: [...], k: 3},
  _helper上下文的AO: {x: 1}
];
 
data[2].[[Scope]] === [
  ... // 更上层的变量对象
  上层上下文的AO: {data: [...], k: 3},
  _helper上下文的AO: {x: 2}
];
```

我们看到，这个时候函数的 `[[Scope]]` 属性就有了真正想要的值了，为了达到这样的目的，我们不得不在 `[[Scope]]` 中创建额外的变量对象。要注意的是，在返回的函数中，如果要获取 `k` 的值，那么该值还是会是 `3`。

顺便提一下，大量介绍 JavaScript 的文章都认为只有额外创建的函数才是闭包，这种说法是错误的。实践得出，这种方式是最有效的，然而，从理论角度来说，在 ECMAScript 中所有的函数都是闭包。

然而，上述提到的方法并不是唯一的方法。通过其他方式也可以获得正确的 `k` 的值，比如下面这样：

```js
var data = [];
 
for (var k = 0; k < 3; k++) {
  (data[k] = function () {
    alert(arguments.callee.x);
  }).x = k; // 将“k”存储为函数的一个属性
}
 
// 同样也是可行的
data[0](); // 0
data[1](); // 1
data[2](); // 2
```

### Funarg 和 return

另外一个特性是从闭包中返回。在 ECMAScript 中，闭包中的返回语句会将控制流返回给调用上下文（调用者）。而在其他语言中，比如 Ruby，有很多中形式的闭包，相应的处理闭包返回也都不同，下面几种方式都是可能的：可能直接返回给调用者，或者在某些情况下 —— 直接从上下文退出。

ECMAScript 标准的退出行为如下：

```js
function getElement() {
 
  [1, 2, 3].forEach(function (element) {
 
    if (element % 2 == 0) {
      // 返回给函数"forEach"，
      // 而不会从getElement函数返回
      alert('found: ' + element); // found: 2
      return element;
    }
 
  });
 
  return null;
}
 
alert(getElement()); // null, 而不是 2
```

然而，在 ECMAScript 中通过 `try catch` 可以实现如下效果：

```js
var $break = {};
 
function getElement() {
 
  try {
 
    [1, 2, 3].forEach(function (element) {
 
      if (element % 2 == 0) {
        // 直接从getElement"返回"
        alert('found: ' + element); // found: 2
        $break.data = element;
        throw $break;
      }
 
    });
 
  } catch (e) {
    if (e == $break) {
      return $break.data;
    }
  }
 
  return null;
}
 
alert(getElement()); // 2
```

### 理论版本

通常，程序员会误认为，只有匿名函数才是闭包。其实并非如此，正如我们所看到的 —— 正是因为作用域链（静态），使得所有的函数都是闭包（与函数类型无关：匿名函数，FE，NFE，FD 都是闭包），这里只有一类函数除外，那就是通过 `Function` 构造器创建的函数，因为其 `[[Scope]]` 只包含全局对象。为了更好的澄清该问题，我们对 ECMAScript 中的闭包作两个定义（即两种闭包）。

ECMAScript中，闭包指的是：

- 从理论角度：所有的函数。因为它们都在创建的时候就将上层上下文的数据保存起来了。哪怕是简单的全局变量也是如此，因为函数中访问全局变量就相当于是在访问自由变量，这个时候使用最外层的作用域。
- 从实践角度：以下函数才算是闭包：
   - 即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）
   - 在代码中引用了自由变量 

## 闭包实践

实际使用的时候，闭包可以创建出非常优雅的设计，允许对 funarg 上定义的多种计算方式进行定制。如下就是数组排序的例子，它接受一个排序条件函数作为参数：

```js
[1, 2, 3].sort(function (a, b) {
  ... // 排序条件
});
```

同样的例子还有，数组的 `map` 方法（并非所有的实现都支持数组 `map` 方法，SpiderMonkey 从 1.6 版本开始有支持），该方法根据函数中定义的条件将原数组映射到一个新的数组中：

```js
[1, 2, 3].map(function (element) {
  return element * 2;
}); // [2, 4, 6]
```

使用函数式参数，可以很方便的实现一个搜索方法，并且可以支持无穷多的搜索条件：

```js
someCollection.find(function (element) {
  return element.someProperty == 'searchCondition';
});
```

还有应用函数，比如常见的 `forEach` 方法，将 funarg 应用到每个数组元素：

```js
[1, 2, 3].forEach(function (element) {
  if (element % 2 != 0) {
    alert(element);
  }
}); // 1, 3
```

顺便提下，函数的 `apply` 和 `call` 方法，在函数式编程中也可以用作应用函数。 `apply` 和 `call` 已经在讨论 `this` 的时候介绍过了；这里，我们将它们看作是应用函数 —— 应用到参数中的函数（在 `apply` 中是参数列表，在 `call` 中是独立的参数）：

```js
(function () {
  alert([].join.call(arguments, ';')); // 1;2;3
}).apply(this, [1, 2, 3]);
```

闭包还有另外一个非常重要的应用 —— 延迟调用：

```js
var a = 10;
setTimeout(function () {
  alert(a); // 10, 一秒钟后
}, 1000);
```

也可以用于回调函数：

```js
...
var x = 10;
// only for example
xmlHttpRequestObject.onreadystatechange = function () {
  // 当数据就绪的时候，才会调用;
  // 这里，不论是在哪个上下文中创建，变量“x”的值已经存在了
  alert(x); // 10
};
..
```

还可以用于封装作用域来隐藏辅助对象：

```js
var foo = {};
 
// initialization
(function (object) {
 
  var x = 10;
 
  object.getX = function _getX() {
    return x;
  };
 
})(foo);
 
alert(foo.getX()); // get closured "x" – 10
```

## 总结
本文介绍了更多关于 ECMAScript-262-3 的理论知识，而我认为，这些基础的理论有助于理解 ECMAScript 中闭包的概念。
## 扩展阅读

- [Javascript Closures (by Richard Cornford)](http://jibbering.com/faq/notes/closures/)
- [Funarg problem](http://en.wikipedia.org/wiki/Funarg_problem)
- [Closures][ref3]

[ref3]: http://en.wikipedia.org/wiki/Closure_(computer_science)


<p class="j-dot">**Translated by:** Dmitry Soshnikov.
**Published on:** 2010-02-28

**Originally written by:** Dmitry Soshnikov [ru, [read »](http://dmitrysoshnikov.com/ecmascript/ru-chapter-6-closures/)]
**Originally published on:** 2009-07-20 [ru]</p>