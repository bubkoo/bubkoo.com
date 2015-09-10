title: JavaScript 核心
tags: [ECMA-262-3, ECMAScript]
categories: [JavaScript]
date: 2014-05-20 16:54:01
keywords:
---
此文译自 [Dmitry A. Soshnikov](http://dmitrysoshnikov.com/) 的 [JavaScript. The core.](http://dmitrysoshnikov.com/ecmascript/javascript-the-core/).

本文是[详解 ECMA-262-3 系列](http://dmitrysoshnikov.com/tag/ecma-262-3/)的概述和总结。每个部分都包含对应章节的连接，所以你可以阅读它们以获得更深入的了解。

**目标阅读者**：有经验的程序员，专业人士。

我们从对象的概念开始，这是 ECMAScript 的根本。

<!--more-->

## 对象

ECMAScript 做为一个高度抽象的面向对象语言，是通过对象来交互的。即使 ECMAScript 里边也有基本类型，但是，当需要的时候，它们也会被转换成对象。

> 一个对象就是一个属性集合，并拥有一个独立的 `prototype`（原型）对象。这个 `prototype` 可以是一个对象或者 `null`。

让我们看一个关于对象的基本例子。一个对象的 `prototype` 是以内部的 `[[Prototype]]` 属性来引用的。但是，在示意图里边我们将会使用 `__<internal-property>__` 下划线标记来替代两个括号，对于 `prototype` 对象来说是：`__proto__`。

对于以下代码：

```js
var foo = {
  x: 10,
  y: 20
};
```

我们拥有一个这样的结构，两个显式的自身属性和一个隐含的 `__proto__` 属性，这个属性是对 `foo` 原型对象的引用：

![图 1. 一个含有原型的基本对象](http://bubkoo.qiniudn.com/basic-object.png)

这些 `prototype` 有什么用？让我们以原型链（prototype chain）的概念来回答这个问题。


## 原型链

原型对象也是简单的对象并且可以拥有它们自己的原型。如果一个原型对象的原型是一个非 `null` 的引用，那么以此类推，这就叫作原型链。

> 原型链是一个用来实现继承和共享属性的有限对象链。

考虑这么一个情况，我们拥有两个对象，它们之间只有一小部分不同，其他部分都相同。显然，对于一个设计良好的系统，我们将会*重用*相似的功能/代码，而不是在每个单独的对象中重复它。在基于类的系统中，这个代码重用风格叫作*类继承*－你把相似的功能放入类 `A` 中，然后类 `B` 和类 `C` 继承类 `A`，并且拥有它们自己的一些小的额外变动。


ECMAScript 中没有类的概念。但是，代码重用的风格并没有太多不同（尽管从某些方面来说比基于类的方式要更加灵活）并且通过原型链来实现。这种继承方式叫作委托继承（或者，更贴近 ECMAScript 一些，叫作原型继承）。

跟例子中的类 `A`，`B`，`C` 相似，在 ECMAScript 中你创建对象：`a`，`b`，`c`。于是，对象 `a` 中存储对象 `b` 和 `c` 中通用的部分。然后 `b` 和 `c` 只存储它们自身的额外属性或者方法。

```js
var a = {
  x: 10,
  calculate: function (z) {
    return this.x + this.y + z
  }
};

var b = {
  y: 20,
  __proto__: a
};

var c = {
  y: 30,
  __proto__: a
};

// call the inherited method
b.calculate(30); // 60
c.calculate(40); // 80
```

足够简单，是不是？我们看到 `b` 和 `c` 访问到了在对象 `a` 中定义的 `calculate` 方法。这是通过原型链实现的。

规则很简单：如果一个属性或者一个方法在对象自身中无法找到（也就是对象自身没有一个那样的属性），然后它会尝试在原型链中寻找这个属性/方法。如果这个属性在原型中没有查找到，那么将会查找这个原型的原型，以此类推，遍历整个原型链（当然这在类继承中也是一样的，当解析一个继承的方法的时候 -- 我们遍历 `class` 链）。第一个被查找到的同名属性/方法会被使用。因此，一个被查找到的属性叫作继承属性。如果在遍历了整个原型链之后还是没有查找到这个属性的话，返回 `undefined` 值。

注意，继承方法中所使用的 `this` 的值被设置为原始对象，而并不是在其中查找到这个方法的（原型）对象。也就是，在上面的例子中 `this.y` 取的是 `b` 和 `c` 中的值，而不是 `a` 中的值。但是，`this.x` 是取的是 `a` 中的值，并且又一次通过原型链机制完成。

如果没有明确为一个对象指定原型，那么它将会使用 `__proto__` 的默认值 -- `Object.prototype`。`Object.prototype` 对象自身也有一个 `__proto__` 属性，这是原型链的终点并且值为 `null`。

下一张图展示了对象 `a`，`b`，`c` 之间的继承层级：

![图 2. 原型链](http://bubkoo.qiniudn.com/prototype-chain.png)

注意： ES5 标准化了一个实现原型继承的可选方法，即使用 `Object.create` 函数：

```js
var b = Object.create(a, {y: {value: 20}});
var c = Object.create(a, {y: {value: 30}});
```

你可以在[对应的章节](http://dmitrysoshnikov.com/ecmascript/es5-chapter-1-properties-and-property-descriptors/#new-api-methods)获取到更多关于 ES5 新 API 的信息。 ES6 标准化了 `__proto__` 属性，并且可以在对象初始化的时候使用它。

通常情况下需要对象拥有相同或者相似的状态结构（也就是相同的属性集合），赋以不同的状态值。在这个情况下我们可能需要使用构造函数，其以指定的模式来创造对象。


## 构造函数

除了以指定模式创建对象之外，构造函数也做了另一个有用的事情 -- 它自动地为新创建的对象设置一个原型对象。这个原型对象存储在 `ConstructorFunction.prototype` 属性中。

例如，我们重写之前例子，使用构造函数创建对象 `b` 和 `c`。因此，对象 `a`（一个原型对象）的角色由 `Foo.prototype` 来扮演：

```js
// 构造函数
function Foo(y) {
// 构造函数将会以特定模式创建对象：被创建的对象都会有"y"属性
this.y = y;
}

// "Foo.prototype"存放了新建对象的原型引用
// 所以我们可以将之用于定义继承和共享属性或方法
// 所以，和上例一样，我们有了如下代码：

// 继承属性"x"
Foo.prototype.x = 10;

// 继承方法"calculate"
Foo.prototype.calculate = function (z) {
returnthis.x + this.y + z;
};

// 使用foo模式创建 "b" and "c"
var b = new Foo(20);
var c = new Foo(30);

// 调用继承的方法
b.calculate(30); // 60
c.calculate(40); // 80

// 让我们看看是否使用了预期的属性

console.log(

  b.__proto__ === Foo.prototype, // true
  c.__proto__ === Foo.prototype, // true

// "Foo.prototype"自动创建了一个特殊的属性"constructor"
// 指向a的构造函数本身
// 实例"b"和"c"可以通过授权找到它并用以检测自己的构造函数

  b.constructor === Foo, // true
  c.constructor === Foo, // true
  Foo.prototype.constructor === Foo // true

  b.calculate === b.__proto__.calculate, // true
  b.__proto__.calculate === Foo.prototype.calculate // true

);
```

![图 3. 构造函数与对象之间的关系](http://bubkoo.qiniudn.com/constructor-proto-chain.png)

这张图又一次说明了每个对象都有一个原型。构造函数 `Foo` 也有自己的 `__proto__`，值为`Function.prototype`，`Function.prototype` 也通过其 `__proto__` 属性关联到 `Object.prototype`。重申一遍，`Foo.prototype` 只是一个显式的属性，也就是 `b` 和 `c` 的 `__proto__` 属性。

有关这个主题的完整、详细的解释可以在 ES3 系列的第七章找到。分为两个部分：[7.1 面向对象基本理论](http://bubkoo.com/2014/06/21/ecma-262-3-in-detail-chapter-7-1-oop-the-general-theory/)，在那里你将会找到对各种面向对象范例、风格的描述以及它们和 ECMAScript 之间的对比，然后在 [7.2 面向对象 ECMAScript 实现](http://bubkoo.com/2014/06/22/ecma-262-3-in-detail-chapter-7-2-oop-ecmascript-implementation/)，是对 ECMAScript 中面向对象的介绍。

现在，在我们知道了对象的基础之后，让我们看看运行时程序的执行在 ECMAScript 中是如何实现的。这叫作执行上下文栈，其中的每个元素也可以抽象成为一个对象。是的，ECMAScript 几乎在任何地方都和对象的概念打交道。

## 执行上下文栈

有三种类型的 ECMAScript 代码：全局代码、函数代码和 `eval` 代码。每段代码都是在其对于的执行上下文中被执行。有且只有一个全局执行上下文，可能多个函数执行上下文和 `eval` 执行上下文。当调用一个函数时，就进入了函数执行上下文，并运行函数内部的代码；当执行 `eval` 时，就进入 `eval` 的执行上下文，并运行 `eval` 中的代码。

注意：一个函数可以创建无数个执行上下文，因为对函数的每次调用（即便是该函数递归调用自己）都将生成一个具有新状态的上下文。

```js
function foo(bar) {}

// call the same function,
// generate three different
// contexts in each call, with
// different context state (e.g. value
// of the "bar" argument)

foo(10);
foo(20);
foo(30);
```

一个执行上下文可能会激活另一个上下文，比如，一个函数调用另一个函数（或者在全局上下文中调用一个全局函数），等等。从逻辑上来说，这是以堆栈的形式实现的，称为执行上下文栈。

激活其他上下文的上下文被称为调用者（caller），被激活的上下文称为被调用者（callee）。被调用者同时也可能是调用者（比如，一个在全局上下文中被调用的函数，之后调用了一些内部函数）。

当一个 caller 激活了一个 callee，那么这个 caller 就会暂停它自身的执行，然后将控制权交给这个 callee。这个 callee 被压入栈中，并成为一个运行中（活动的）执行上下文。在 callee 的上下文结束后，它会把控制权返回给 caller，然后 caller 的上下文继续执行（它可能触发其他上下文）直到它结束，以此类推。一个 callee 可以简单的返回或抛出一个异常来结束自身的上下文，一个抛出而未被捕获的异常可以退出（出栈）一个或多个执行上下文。

也就是说，所有的 ECMAScript 程序运行时都可以用执行上下文栈来表示，栈顶是当前活动执行上下文：

![图4. 执行上下文栈](http://bubkoo.qiniudn.com/an-execution-context-stack.png)

程序开始运行时就进入额全局执行上下文，全局上下文位于栈底，而且是栈的第一个元素。然后，全局代码开始初始化，创建一些需要的对象或函数。当在全局上下文中运行时，其中的代码可能调用其他函数（已经创建），此时就会进入这个函数的上下文，向栈中压入新的元素，依次类推。当初始化完成后，运行时系统（runtime system）就会等待一些事件（比如鼠标点击事件），这些事件将触发一些函数，从而进入新的执行山下文。

下图中，包含某个函数的上下文 `EC1` 和全局上下文 `Global EC`，当进入和退出 `EC` 的执行上下文时，栈将发生如下变化：

![图 5. 执行上下文栈的变化](http://bubkoo.qiniudn.com/ec-stack-changes.png)

ECMAScript 的运行时系统就是这样管理代码执行的。

更多有关 ECMAScript 中执行上下文的信息可以在对应的[ECMA-262-3 详解.第一章.执行上下文](http://bubkoo.com/2014/05/28/ecma-262-3-in-detail-chapter-1-execution-contexts/)中获取。

每个执行上下文都可以用一个对象来表示，让我们来看看该对象的结构以及一个上下文需要什么样的状态（属性）来执行其中的代码。

## 执行上下文

一个执行上下文可以抽象为一个简单的对象来表示，每个执行上下文拥有一系列属性（也可以称作上下文状态）来跟踪其代码的执行过程，下图展示了一个上下文的结构：

![图 6. 上下文结构](http://bubkoo.qiniudn.com/execution-context.png)

除了这三个必需的属性（变量对象 (variable object)，this 指针 (this value)，作用域链 (scope chain)），执行上下文根据具体实现还可以具有任意额外属性。

让我们详细看看上下文中的这些重要属性。

## 变量对象

> 变量对象是执行上下文的数据容器，它是一个与执行上下文相关的特殊对象，储存了在执行上下文中定义的变量和函数声明。 

注意，函数表达式（与函数声明相对）不包含在变量对象中。

变量对象是一个抽象概念，在不同的执行上下文中，变量对象在结构上表现为不同的对象。例如，在全局上下文中，变量对象就是全局对象自身（这就是为什么我们可以通过全局对象的属性名来访问全局变量）。

请看下面在全局执行上下文的例子：

```js
var foo = 10;

function bar() {} // // 函数声明
(function baz() {}); // 函数表达式

console.log(
  this.foo == foo, // true
  window.bar == bar // true
);

console.log(baz); // 引用错误，baz没有被定义
```

全局上下文的变量对象（variable objec，简称 VO）将会拥有如下属性：

![图 7. 全局变量对象](http://bubkoo.qiniudn.com/variable-object.png)

在看一遍上面代码，函数 `baz` 是一个函数表达式，并不包含在变量对象中。这就是为什么当我们在函数表达式之外访问它时会出现 `ReferenceError`。

注意，与其他语言（比如C/C++）相比，在 ECMAScript 中只有函数才会创建新的作用域。函数作用域中声明的变量和函数，在函数外部不能直接访问，并且不会污染全局变量对象。

使用 `eval` 时也会进入一个新的（`eval` 的）执行上下文。然而，`eval` 要么使用全局变量对象，要么使用调用者（caller）的变量对象（比如，`eval` 被调用时所在的函数）。

那么函数上下文中的变量对象是怎样的呢？在一个函数上下文中，变量对象是以活动对象（activation object）来表示。

## 活动对象

当一个函数被调用时，一个称为活动对象（activation object）的特殊对象将被创建。活动对象包含形参和特殊的 `arguments` 对象（具有索引属性的参数映射）。在函数上下文中，活动对象作为变量对象来使用。

也就是说，一个函数的变量对象仍然是一个简单的对象，除了储存变量和函数声明外，它还储存了函数的形参以及 `arguments` 对象，并被称为活动对象。

看下面例子：

```js
function foo(x, y) {
  var z = 30;
  function bar() {} // 函数声明
  (function baz() {}); // 函数表达式
}

foo(10, 20);
```

函数 `foo` 上下文中的活动对象：

![图 8. 活动对象](http://bubkoo.qiniudn.com/activation-object.png)

函数表达式 `baz` 仍然不在活动对象/变量对象中。

针对所有细节（比如变量和函数声明的提升问题（hoisting））的完整描述请参阅 [ECMA-262-3 详解.第二章.变量对象](http://bubkoo.com/2014/05/31/ecma-262-3-in-detail-chapter-2-variable-object/)。

<p class="j-quote">注意，在 ES5 中，变量对象和活动对象并入了词法环境模型（lexical environments model），详细的描述请[看这里](http://dmitrysoshnikov.com/ecmascript/es5-chapter-3-2-lexical-environments-ecmascript-implementation/)。</p>

让我们移步下一节。众所周知，在 ECMAScript 中我们可以使用内部函数，在这些内部函数中我们可以访问父函数的变量或全局作用域中的变量。我们将上下文中变量对象命名为作用域对象，与原型链相似，也有所谓的作用域链。

## 作用域链

> 作用域链是一个对象列表，上下文代码中出现的标识符将在这个列表中查找。

与原型链相似，查找规则也很简单：如果一个变量在函数自身作用域（在函数自身的变量/活动对象）中没有找到，那么就会查找父级函数（外层函数）的变量对象，以次类推。

就上下文而言，标识符指：变量名称、函数声明、形参，等等。当一个函数在其代码中引用的标识符不是本地变量（函数或形参），那么这个标识符就称为*自由变量*，查找这些自由变量时就需要用到作用域链。

在通常情况下，一条作用域链就是所有父级变量对象（VO）加上（作用域链头部的）函数自身的变量对象/活动对象（VO/AO）。但是，这个作用域链也可以包含任何其他对象，比如，在上下文执行过程中动态加入到作用域链中的对象－像 `with` 对象或者特殊的 `catch` 从句（catch-clauses）对象。

当解析（查找）一个标识符的时候，会从作用域链中的活动对象开始查找，然后（如果这个标识符在函数自身的活动对象中没有被查找到）向作用域链的上一层查找 － 重复这个过程，就和原型链一样。

```js
var x = 10;

(function foo() {
  var y = 20;
  (function bar() {
    var z = 30;
    // "x" 和 "y" 是自由变量，在作用域链的
    // 上层对象（bar 的活动对象之后）中查找
    console.log(x + y + z);
  })();
})();
```

我们可以假设作用域链是通过隐藏属性 `__parent__` 连接起来的，该属性指向作用域链上的上一层对象。这可以在 Rhino 下用真实代码进行测试，并且这项技术已经用于 [ES5 的词法分析环境](http://dmitrysoshnikov.com/ecmascript/es5-chapter-3-2-lexical-environments-ecmascript-implementation/)（在那里被叫作outer连接）。作用域链的另一种表现形式可以是一个简单的数组。利用 `__parent__` 的概念，我们可以用下图表示上面的自理（并且父变量对象存储在函数的[[Scope]]属性中）：

![图 9. 作用域链](http://bubkoo.qiniudn.com/scope-chain.png) 

在代码执行过程中，使用 `with` 语句和 `catch` 从句对象来扩大作用域链。并且由于这些对象是简单的对象，他们也会有原型链。这使作用域链查找变为两个维度：（1）首先是作用域链，然后（2）在每个连接点，深入到连接点的原型链中（如果此链接有原型）。

看下面例子：

```js
Object.prototype.x = 10;

var w = 20;
var y = 30;

// 在 SpiderMonkey 中，全局对象，即全局上下文中的变量对象
// 继承自 "Object.prototype"，所以我们可以访问到 “并没有
// 定义的全局变量 x”，这是在原型链中找到的。

console.log(x); // 10

(function foo() {

  // "foo" local variables
  var w = 40;
  var x = 100;

  // "x" 在 "Object.prototype" 中查找到，
  // 因为 {z: 50} 继承自 "Object.prototype"
  
  with ({z: 50}) {
    console.log(w, x, y , z); // 40, 10, 30, 50
  }

  // 当 "with" 对象从作用域链中移除后，
  // "x" 又成为 "foo" 上下文中的活动对象（AO）的属性。
  // 变量 "w" 仍然是本地的
  console.log(x, w); // 100, 40

  // 在浏览器环境中，下面展示了如何引用全局变量
  console.log(window.w); // 20

})();
```

我们就会有如下的结构（确切的说，在我们查找__parent__连接之前，首先查找__proto__链）：

![图 10. with 增大的作用域链](http://bubkoo.qiniudn.com/scope-chain-with.png)

注意，不是在所有的实现中全局对象都是继承自 `Object.prototype`。上图中描述的行为（从全局上下文中引用「未定义」的变量 `x`）可以在诸如 SpiderMonkey 引擎中进行测试。

只要所有父变量对象都存在，那么从内部函数引用外部数据则没有特别之处 -- 我们只要遍历作用域链去解析（搜寻）需要的变量。然而，如上文所提及，当一个上下文终止之后，其状态与自身将会被销毁，同时父函数可能会返回一个内部函数。而且，这个返回的函数之后可能在另一个上下文中被调用。如果自由变量的上下文已经「消失」了，那么这样的调用将会发生什么？通常来说，有一个概念可以帮助我们解决这个问题，叫作（词法）闭包，其在 ECMAScript 中就是和作用域链的概念紧密相关的。

## 闭包

在 ECMAScript 中，函数是一等（first-class）对象。这个术语意味着函数可以做为参数传递给其他函数（在那种情况下，这些参数叫作「*函数类型参数*」（*funargs*，是"functional arguments"的简称））。接收「函数类型参数」的函数叫作*高阶函数*或者，贴近数学一些，叫作*高阶操作符*。同样函数也可以从其他函数中返回。返回其他函数的函数叫作*以函数为值的函数*（或者叫作*拥有函数类值的函数*）。

有两个在概念上与「函数类型参数（funargs）」和「函数类型值」相关的问题。并且这两个子问题在"Funarg 问题"（或者叫作"中很普遍。为了解决整个"Funarg 问题"，闭包（closure）的概念被创造了出来。我们详细的描述一下这两个子问题（我们将会看到这两个问题在 ECMAScript 中都是使用图中所提到的函数的 `[[Scope]]` 属性来解决的）。

funarg 的第一个问题是「向上 funarg 问题」。它会在当一个函数从另一个函数向上返回（到外层）并且使用上面所提到的自由变量的时候出现。为了在即使父函数上下文结束的情况下也能访问其中的变量，内部函数在被创建的时候会在它的 `[[Scope]]` 属性中保存父函数的作用域链。所以当函数被调用的时候，它上下文的作用域链会被格式化成活动对象与 `[[Scope]]` 属性的和（实际上就是我们刚刚在上图中所看到的）：

```js
Scope chain = Activation object + [[Scope]]
作用域链 = 活动对象 + [[Scope]]
```
请注意，最主要的事情是——函数在被创建时保存外部作用域，是因为这个被保存的作用域链将会在未来的函数调用中用于变量查找。

```js
function foo() {
  var x = 10;
  return function bar() {
    console.log(x);
  };
}

// "foo"返回的也是一个函数
// 并且这个返回的函数可以随意使用内部的变量x

var returnedFunction = foo();

// 全局变量 "x"
var x = 20;

// 执行返回的函数
returnedFunction(); // 结果是10而不是20
```

这种形式的作用域称为静态作用域（词法作用域）。上面的 `x` 变量就是在函数 `bar` 的 `[[Scope]]` 中搜寻到的。理论上来说，也会有动态作用域，也就是上述的 `x` 被解释为 `20`，而不是 `10`。但是 EMCAScript 不使用动态作用域。

funarg 的第二个问题是「向下 funarg 问题」。在这种情况下，由于存在父级上下会，在判断一个变量值的时候会有多义性。也就是，这个变量究竟应该使用哪个作用域？是在函数创建时的作用域呢，还是在执行时的作用域呢？为了避免这种多义性，可以采用闭包，也就是使用静态作用域。

请看下面：

```js
// 全局变量 "x"
var x = 10;

// 全局function
function foo() {
  console.log(x);
}

(function (funArg) {

// 局部变量 "x"
var x = 20;

// 这不会有歧义
// 因为我们使用"foo"函数的[[Scope]]里保存的全局变量"x",
// 并不是caller作用域的"x"

  funArg(); // 10, 而不是20

})(foo); // 将foo作为一个"funarg"传递下去
```

我们可以断定静态作用域是一门语言拥有闭包的必需条件。不过，在某些语言中，会提供动态和静态作用域的结合，可以允许开发员选择哪一种作用域。但是在 ECMAScript 中，只采用了静态作用域。所以结论是：ECMAScript 完全支持闭包，技术上是通过函数的 `[[Scope]]` 属性实现的。现在我们可以给闭包下一个准确的定义：

> 闭包是一个代码块（在 ECMAScript 是一个函数）和以静态方式/词法方式进行存储的所有父作用域的一个集合体。所以，通过这些存储的作用域，函数可以很容易的找到自由变量。

注意，由于每个（标准的）函数都在创建的时候保存了 `[[Scope]]`，所以理论上来讲，ECMAScript 中的所有函数都是闭包。

另一个需要注意的重要事情是，多个函数可能拥有相同的父作用域（这是很常见的情况，比如当我们拥有两个内部/全局函数的时候）。在这种情况下，`[[Scope]]` 属性中存储的变量是在拥有相同父作用域链的所有函数之间共享的。一个闭包对变量进行的修改会体现在另一个闭包对这些变量的读取上：

```js
function baz() {
  var x = 1;
  return {
    foo: function foo() { return ++x; },
    bar: function bar() { return --x; }
  };
}

var closures = baz();

console.log(
  closures.foo(), // 2
  closures.bar()  // 1
);
```

以上代码可以通过下图进行说明：

![图 11. 共享的[[Scope]]](http://bubkoo.qiniudn.com/shared-scope.png)

这个特性在循环中创建多个函数的时候会使人非常困惑。在创建的函数中使用循环计数器的时候，一些程序员经常会得到非预期的结果，所有函数中的计数器都是同样的值。现在是到了该揭开谜底的时候了 －- 因为所有这些函数拥有同一个 `[[Scope]]`，这个属性中的循环计数器的值是最后一次所赋的值。

```js
var data = [];

for (var k = 0; k < 3; k++) {
  data[k] = function () {
    alert(k);
  };
}

data[0](); // 3, but not 0
data[1](); // 3, but not 1
data[2](); // 3, but not 2
```

有几种技术可以解决这个问题。其中一种是在作用域链中提供一个额外的对象。比如，使用额外函数：

```js
var data = [];

for (var k = 0; k < 3; k++) {
  data[k] = (function (x) {
    return function () {
      alert(x);
    };
  })(k); // pass "k" value
}

// now it is correct
data[0](); // 0
data[1](); // 1
data[2](); // 2
```

对闭包理论和它们的实际应用感兴趣的同学可以在[第六章 闭包](http://bubkoo.com/2014/06/15/ecma-262-3-in-detail-chapter-6-closures/)中了解更多细节。如果想获取更多关于作用域链的信息，可以看一下[第四章 作用域链](http://bubkoo.com/2014/06/01/ecma-262-3-in-detail-chapter-4-scope-chain/)。

继续下个部分，讨论一下执行上下文的最后一个属性。这就是关于 `this` 值的概念。

## This

> `this` 是一个与执行上下文密切相关的特殊对象，因此，它可以称为上下文对象（context object），也就是用来指明执行上下文是在哪个上下文中被触发的对象。

任何对象都可以做为上下文中的 `this` 的值。我想再一次澄清，一些对 ECMAScript 执行上下文特别是 `this` 的值的误解。`this` 经常被错误地描述为变量对象的一个属性，这类错误存在于比如像这[本书中](http://yuiblog.com/assets/High_Perf_JavaScr_Ch2.pdf)（即便如此，这本书的相关章节还是十分不错的）。在重复一次：

> `this` 是执行上下文的一个属性，而不是变量对象的属性。

这个特性非常重要，因为与变量相反，`this` 从不会参与到标识符解析过程。换句话说，在代码中当访问 `this` 的时候，它的值是直接从执行上下文中获取的，并不需要任何作用域链查找。`this` 的值只在进入上下文的时候进行一次确定。

顺便说一下，与 ECMAScript 相反，比如，Python 的方法都会拥有一个被当作简单变量的 `self` 参数，这个变量的值在各个方法中是相同的，并且在执行过程中可以被更改成其他值。在 ECMAScript 中，给 `this` 赋一个新值是不可能的，因为，再重复一遍，它不是一个变量并且不存在于变量对象中。

在全局上下文中，`this` 就等于全局对象本身（这意味着，这里的 `this` 等于变量对象）：

```js
var x = 10;

console.log(
  x,        // 10
  this.x,   // 10
  window.x  // 10
);
```

在函数上下文的情况下，对函数的每次调用，其中的 `this` 值可能是不同的。这个 `this` 值是通过函数调用表达式（也就是函数被调用的方式）的形式由 caller 所提供的。举个例子，下面的函数 `foo` 是一个 callee，在全局上下文中被调用，此上下文为 caller。让我们通过例子看一下，对于一个代码相同的函数，`this` 值是如何在不同的调用中（函数触发的不同方式），由 caller 给出不同的结果的：

```js
// 函数 foo 的代码从未改变，但是 this 的值在每次调用时都不一样
function foo() {
  alert(this);
}

// caller 激活 "foo" (callee) 并为 callee 提供 this 的值

foo(); // 全局对象
foo.prototype.constructor(); // foo.prototype

var bar = {
  baz: foo
};

bar.baz(); // bar

(bar.baz)(); // also bar
(bar.baz = bar.baz)(); // but here is global object
(bar.baz, bar.baz)();  // also global object
(false || bar.baz)();  // also global object

var otherFoo = bar.baz;
otherFoo(); // again global object
```

为了深入理解 `this` 为什么（或者更本资一点来说，是如何）在每个函数调用中可能会发生变化，你可以阅读[第三章 This](http://bubkoo.com/2014/06/01/ecma-262-3-in-detail-chapter-3-this/)。在那里，对上面所提到的情况都会有详细的讨论。

## 总结
在此我们完成了一个简短的概述。尽管看来不是那么简短，但是这些话题若要完整表述完毕，则需要一整本书。我们没有提及两个重要话题：函数（以及不同类型的函数之间的不同，比如函数声明与函数表达式）与 ECMAScript 的求值策略（evaluation strategy） 。这两个话题可以分别查阅本系列教程[第五章 函数](http://)与[第八章 求值策略（evaluation strategy）](http://)。

如果你有留言，问题或者补充，我将会很乐意地在评论中讨论它们。

祝学习ECMAScript好运！

<p class="j-dot">**Written by:** Dmitry A. Soshnikov
**Published on:** 2010-09-02</p>