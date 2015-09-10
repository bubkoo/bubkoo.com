title: 理解 JavaScript 中的原型
date: 2014-03-12 10:26:25
updated: 2014-03-12 10:26:25
tags: [Prototype]
categories: [JavaScript]
keywords:
---
当你在JavaScript中定义一个函数，它有一些预定义的属性，其中之一就是令人迷惑的原型。本文将详细解释什么是原型，以及为什么要在项目中使用它。

![](http://bubkoo.qiniudn.com/prototypes-in-javascript.jpg)

## 什么是原型 ##

对象初始化时原型是一个空对象，你可以将任何其他对象添加到原型上。

``` javascript
var myObject = function(name){
    this.name = name;
    return this;
};
 
console.log(typeof myObject.prototype); // object
console.log(myObject.prototype); // Object {}
 
myObject.prototype.getName = function(){
    return this.name;
};

console.log(myObject.prototype); // Object {getName: function...}
```

上面的代码中，我们创建了一个函数，如果我们调用 `myObject()`，它将简单的返回一个 `window` 对象，因为它还没有被实例化，而这个函数是在全局作用域中定义的，`this` 理所当然地指向了全局对象。

``` javascript
console.log(myObject() === window); // true
```

<!--more-->

## 一个“隐秘”属性 ##

继续之前，我想讨论一下关于原型的一个的“隐秘”属性。

JavaScript 中的每一个对象在被定义或实例化之后，都有一个叫做 `__proto__` 的隐秘属性，这是原型链的核心。但是，我并不建议在代码中直接访问 `__proto__`，因为并不是所有的浏览器都支持它。

不能将 `__proto__` 和对象的原型混为一谈，它们是两个不同的属性，但又紧密相关，可能初学者会感到非常困惑，很难将他们区分开来，下面我将详细道来。当我们创建 `myObject` 这个函数时，实际上是定义了一个 `Function` 类型的对象。

```javascript
console.log('function' === typeof myObject); // true
```

`Function` 是 JavaScript 中的一个预定义对象，它有自己的一些属性（比如 `length` 和 `arugments`） 和方法（比如 `call` 和 `apply`），还有自己的原型对象，以及“隐秘”的 `__proto__` 属性。这意味着，在 JavaScript 引擎内的某个位置，可能有一些类似于下面的代码：

```javascript
Function.prototype = {
    arguments: null,
    length: 0,
    call: function(){
        // secret code
    },
    apply: function(){
        // secret code
    }
    ...
}
```

事实上，`Function` 的定义并不是如此简单，这里只是为了说明原型链的原理。

目前为止，我们定义了 `myObject` 这个函数，并为其指定了名为 `name` 的形参，但我们并没有为其设定任何属性（如 `length`）和方法（如 `call`），那么下面的代码是怎么回事呢？
 
```javascript
console.log(myObject.length); // 1 (形参的数量)
```

这是因为在定义 `myObject` 这个对象时，它内置了 `__proto__` 这个属性，并且其值是 `Function.prototype`。所以，当我们使用 `myObject.length` 时，首先将在 `myObject` 对象中查找名为 `length` 的属性， 没有找到，然后将通过 `__proto__` 这个“隐秘”的属性查找其原型链，最后找到 `length` 这个属性并返回。

您可能想知道为什么 `length` 的值为什么是 1，而不是 0，或任何其他数字。这是因为 `myObject` 实际上是 `Function` 的一个实例。

```javascript
console.log(myObject instanceof Function); // true
console.log(myObject === Function); // false
```

当一个对象的实例被创建时，`__proto__` 将指向构造函数的原型，在我们的例子中就是 `Function` 的原型。

```javascript
console.log(myObject.__proto__ === Function.prototype) // true
```

当创建一个新的 `Function` 对象时，在 `Function` 的构造函数内将获取形参的数量，并更新 `this.length` 的值，在这里是 1。

如果我们使用 `new` 操作符创建一个 `myObject` 的实例，该实例的 `__proto__` 将指向 `myObject.prototype`，因为 `myObject` 是该实例的构造函数。

```javascript
var myInstance = new myObject(“foo”);
console.log(myInstance.__proto__ === myObject.prototype); // true
```

现在 `myInstance` 除了可以访问 `Function.prototype` 中的原生方法（比如 `call` 和 `apply`）之外，还可以访问到 `myObject.prototype` 中的方法： `getName`。

```javascript
console.log(myInstance.getName()); // foo
 
var mySecondInstance = new myObject(“bar”);
 
console.log(mySecondInstance.getName()); // bar
console.log(myInstance.getName()); // foo
```

译者注：一个对象实际上包含 `__proto__` 和 `prototype` 两个属性，这两个属性代表着不一样的东西，`__proto__` 指向创建该对象的构造函数的原型，原型链查找就是借助于 `__proto__` 来实现；而 `prototype` 指向该对象自身的原型。

可以想象，这是非常方便的，我们可以用它来获取一个对象的结构，并根据需要创建实例，让我们开始讨论下一个话题。

## 为什么要使用原型 ##

我们先来看一个实例，现在我们需要开发一个 canvas 上的游戏，需要在 canvas 一次性绘制一些（可能是数百个）对象，每个对象都包含一些自己的属性，比如 `x` 和 `y` 坐标、`width`、`height`等等。

我们可以这样做：

```javascript
var GameObject1 = {
    x: Math.floor((Math.random() * myCanvasWidth) + 1),
    y: Math.floor((Math.random() * myCanvasHeight) + 1),
    width: 10,
    height: 10,
    draw: function(){
        myCanvasContext.fillRect(this.x, this.y, this.width, this.height);
    }
   ...
};
 
var GameObject2 = {
    x: Math.floor((Math.random() * myCanvasWidth) + 1),
    y: Math.floor((Math.random() * myCanvasHeight) + 1),
    width: 10,
    height: 10,
    draw: function(){
        myCanvasContext.fillRect(this.x, this.y, this.width, this.height);
    }
    ...
};
```

... 重复做 98 次 ...

这将在内存中创建所有这些对象，这些对象都有单独的方法，比如 `draw` 和其他一些所需要的方法。这当然会很糟糕，因为这个游戏很可能将占光浏览器内存，并运行的非常缓慢，甚至停止响应。

虽然只有 100 个对象的时候这还不可能发生，但会对性能造成很大的影响，因为它需要查找一百个不同的对象，而不是一个相同的原型对象。
 

## 如何使用原型 ##

为了使我们的应用运行的更快，遵循最佳实践，我们来重新定义 `GameObject` 的原型，`GameObject` 对象的每一个实例将使用 `GameObject.prototype` 中的方法，就像它们自身的方法一样。

```javascript
// 定义 GameObject 的构造函数
var GameObject = function(width, height) {
    this.x = Math.floor((Math.random() * myCanvasWidth) + 1);
    this.y = Math.floor((Math.random() * myCanvasHeight) + 1);
    this.width = width;
    this.height = height;
    return this;
};
 
// 定义 GameObject 的原型
GameObject.prototype = {
    x: 0,
    y: 0,
    width: 5,
    width: 5,
    draw: function() {
        myCanvasContext.fillRect(this.x, this.y, this.width, this.height);
    }
};
```

然后，我们来实例化 100 个 GameObject 对象：

```javascript
var x = 100,
arrayOfGameObjects = [];
 
do {
    arrayOfGameObjects.push(new GameObject(10, 10));
} while(x--);
```

现在，我们有了一个有 100 个 GameObjects 实例的数组，这些实例对象共享相同的原型，这大大节省了应用所占用的内存。

当我们调用 `draw` 方法时，实际上调用的都是原型上相同的方法。

```javascript
var GameLoop = function() {
    for(gameObject in arrayOfGameObjects) {
        gameObject.draw();
    }
};
```

## 原型是活动对象（Live Object） ##

对象的原型是一个活动对象，什么意思呢？根据上面示例来说就是，当我创建 `GameObject` 对象的实例之后，我们可以修改 `GameObject.prototype.draw` 方法，来画一个圆，而不是画一个矩形，这样调用所有已经实例化的对象或后面再实例化的对象中的 `draw` 方法就会画一个圆。

```javascript
GameObject.prototype.draw = function() {
    myCanvasContext.arc(this.x, this.y, this.width, 0, Math.PI*2, true);
}
```

## 修改内置对象的原型 ##

你可能熟悉一些 JavaScript 库，比如 [Prototype](http://www.prototypejs.org/)，他们都充分利用了这种方法。

来看一个简单的例子：

```javascript
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ‘’);
};
```

现在我们可以在任何字符串上使用该方法：

```javascript
"foo bar".trim(); // "foo bar"
```

不过这样做也有一定的缺点。比如，你将这个方法应用到你的代码中，也许一两年之后，JavaScript 可能会在 `String` 的原型中实现了该方法，这意味着你的方法将覆盖 JavaScript 的原生方法。为了避免这种情况，我们需要在定义自身的方法前，做一个简单的判断：

```javascript
if(!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, ‘’);
    };
}
```

如果存在原生的 `trim` 方法，我们就会使用原生的 `trim` 方法。

> 根据经验法则，通常也被认为是最佳实践，最好避免扩展内置对象的原型。但是，如果有必要，也可以不遵循这个规则。

## 总结 ##

希望本文已经阐释清楚了 JavaScript 中的原型，现在你应该能够编写更加高效的代码了。

如果你有关于原型的任何问题，你可以写在评论中，我会尽力解答。

英文原文：[Leigh Kaszick](http://hub.tutsplus.com/authors/leigh-kaszick)，翻译：[布谷 bubkoo](http://bubkoo.com/)

原文链接：[Prototypes in JavaScript](http://code.tutsplus.com/tutorials/prototypes-in-javascript--net-24949)