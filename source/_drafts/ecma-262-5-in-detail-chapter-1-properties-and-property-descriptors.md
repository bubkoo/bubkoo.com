title: ECMA-262-5 详解 第一章 属性和属性描述符
tags:
  - ECMA-262-5
  - ECMAScript
  - Property
  - Property Descriptor
categories:
  - JavaScript
date: 2014-07-14 01:34:00
keywords:
---
本文翻译自 [Dmitry A. Soshnikov](http://dmitrysoshnikov.com/) 的文章 [ECMA-262-5 in detail. Chapter 1. Properties and Property Descriptors](http://dmitrysoshnikov.com/ecmascript/es5-chapter-1-properties-and-property-descriptors/)

## 概述

本文将讨论 ECMA-262-5 规范的新概念之一，属性和属性的处理机制 -- 属性描述符。

通常说“对象拥有一些属性”是指*属性名称*和对应的*属性值*。但是，正如我们在 ES3 中已经了解到的那样，一个属性的结构远不止只有一个*属性名*那样简单，它还有自身的一些特性（attributes） -- 比如那些我们在 ES3 中已经讨论过的 `{ReadOnly}`，`{DontEnum}` 等等。从这点来看，属性本身也是一个对象。

为了完全理解本章，我推荐你先阅读 ECMA-262-3 系列[第七章 面向对象(二)：ECMAScript 实现](http://bubkoo.com/2014/06/22/ecma-262-3-in-detail-chapter-7-2-oop-ecmascript-implementation/)。

<!--more-->

## 新的 API

ES5 中标准化了一些与属性和属性特性相关的新方法，下面我们简单地了解一下这些 API：

```js
// 更好的基于原型的继承inheritance
Object.create(parentProto, properties);

// 获取对象的原型
Object.getPrototypeOf(o);

// 定义属性和属性特性
Object.defineProperty(o, propertyName, descriptor);
Object.defineProperties(o, properties);

// 获取属性描述
Object.getOwnPropertyDescriptor(o, propertyName);

// 定义静态化的对象
Object.freeze(o);
Object.isFrozen(o);

// 定义不可扩展的对象
Object.preventExtensions(o);
Object.isExtensible(o);

// "sealed": 不可扩展（non-extensible）和不可配置（non-configurable）的对象
Object.seal(o);
Object.isSealed(o);

// 获取属性名
Object.keys(o);
Object.getOwnPropertyNames(o);
```

下面详细解释这些 API。

## 属性类型

在 ES3 中，我只与属性名和属性值直接打交道。虽然一些实现提供了一些扩展，比如 `getter` 和 `setter` 方法，但也和属性值间接相关。ECMA-262-5 标准化了这些概念，现在一共有三种属性类型。

你也应该知道，一个属性可以直属于对象，或通过继承，来自原型链中的某个对象。

*具名属性*，可以直接在 ECMAScript 程序中使用；*内部属性*，只在实现层面可用（然而，在 ECMAScript 中可以通过一些特殊方法来操控他们）。下面我们来简单讨论他们。

### 属性特性 Property attributes

具名属性可以用一系列特性来区分。在 ES3 系列的讨论中，诸如 `{ReadOnly}`，`{DontEnum}` 等等这些属性的特性，在 ES5 中已被重名为具有相反的布尔值的名称，其中下面两个特性是数据属性描述符和访问器属性描述通用的：

- `[[Enumerable]]`
  对应于 ES3 中的 `{DontEnum}` 的相反状态，为 `true` 表示该属性在 `for-in` 循环时可以被枚举出来。

- `[[Configurable]]`
  对应于 ES3 中的 `{DontDelete}` 的相反状态，为 `false` 表示该属性不可删除，不能修改为访问器属性，不可修改其特性（`[[Value]]` 除外）。

注意，一旦 `[[Configurable]]` 被设置为 `false` 之后，将不能重新设置为 `true`，正如之前所说，我们也不能修改属性的其他特性，比如 `[[Enumerable]]`。但我们仍可以修改 `[[Value]]` 和 `[[Writable]]`，并且只能将其由 `true` 修改为 `false`，反之则不然 -- 如果 `[[Writable]]` 已经为 `false`，在 `non-configurable` 状态下将不能被设置为 `true`。

我们将讨论和其他和具名属性相关的一些特性，下面先看看属性类型。

### 数据属性

该属性在 ES3 中就已经存在，每个属性都有一个*名称*（永远都是一个字符串）和一个对应的*值*。

例如：

```js
// define in the declarative form
var foo = {
  bar: 10 // direct Number type value
};

// define in the imperative form,
// also direct, but Function type value, a "method"
foo.baz = function () {
  return this.bar;
};
```

与 ES3 一样，如果一个属性的值是一个函数，这种属性就被称为*方法*。但是，请注意不要将这种直接的属性值为函数的属性与那些间接的特殊的访问器函数混淆起来。

除开具名属性拥有的这些一般特性外，数据属性还有如下特性：

- `[[Value]]`
  指定了检索该属性时返回的值
  
- `[[Writable]]`
  对应 ES3 中 `{ReadOnly}` 的相反状态，如果为 `false` 将不能通过 `[[Put]]` 这个内部方法来修改 `[[Value]]` 对应的值。 

一个具名的数据属性的完整特性（默认值）如下：

```js
var defaultDataPropertyAttributes = {
  [[Value]]: undefined,
  [[Writable]]: false,
  [[Enumerable]]: false,
  [[Configurable]]: false
};
```

因此，默认情况下属性是一些常量：

```js
// 定义一个全局常量

Object.defineProperty(this, "MAX_SIZE", {
  value: 100
});
console.log(MAX_SIZE); // 100
MAX_SIZE = 200; // error in strict mode, [[Writable]] = false,
delete MAX_SIZE; // error in strict mode, [[Configurable]] = false

console.log(MAX_SIZE); // still 100
```

但在 ES3 中，我们不能操控属性的特性，这是导致总所周知的原型增强问题的根源。由于 ECMAScript 的动态特性，我们可以很方便地为一个对象扩展新的方法并使用，代理到一个原型，就像某个对象拥有该原型一样。在 ES3 中，由于不能操控 `{DontEnum}`  特性，我们可以看到通过 `for-in` 来枚举放大的数组原型的问题：

```js
// ES3

Array.prototype.sum = function () {
  // sum implementation
};

var a = [10, 20, 30];

// works fine
console.log(a.sum()); // 60

// but because of for-in examines the 
// prototype chain as well, the new "sum"
// property is also enumerated, because has
// {DontEnum} == false

// iterate over properties
for (var k in a) {
  console.log(k); // 0, 1, 2, sum
}
```

ES5 提供了一些元方法来操控属性的特性：

```js
Object.defineProperty(Array.prototype, "sum", {

  value: function arraySum() {
    //  sum implementation
  },

  enumerable: false

});

// now with using the same example this "sum"
// is no longer enumerable

for (var k in a) {
  console.log(k); // 0, 1, 2
}
```

上面例子中，我们手动明确指定了 `enumerable` 的值。但是，正如之前提到的那样，所有特性的默认值都是 `false`，因此我们可以省略值为 `false` 的设置。

简单的*赋值*操作，所有特性的值都为 `true`（事实上，这也是在 ES3 中的值）：

```js
// simple assignment (if we create a new property)
foo.bar = 10;

// the same as
Object.defineProperty(foo, "bar", {
  value: 10,
  writable: true,
  enumerable: true,
  configurable: true
});
```

需要注意的是，`Object.defineProperty` 方法不仅可以用来定义对象的属性，也可以用来修改对象的属性，并返回修改后的对象啊ing，因此我们可以使用该方法来创建新对象，并未该对象绑定必要的变量名：

```js
// 创建 "foo" 对象并定义了 "bar" 属性
var foo = Object.defineProperty({}, "bar", {
  value: 10,
  enumerable: true
});

// 修改属性值和特性
Object.defineProperty(foo, "bar", {
  value: 20,
  enumerable: false
});

console.log(foo.bar); // 20
```

获取对象的属性名数组有两个元方法：`Object.keys`，只返回对象可枚举的属性名；`Object.getOwnPropertyNames`，返回可枚举和不可枚举的属性名：

```js
var foo = {bar: 10, baz: 20};

Object.defineProperty(foo, "x", {
  value: 30,
  enumerable: false
});

console.log(Object.keys(foo)); // ["bar", "baz"]
console.log(Object.getOwnPropertyNames(foo)); // ["bar", "baz", "x"]
```

### 访问器属性

> 一个访问器属性与对象的某个属性名（一个字符串）关联，包含一个或两个访问器方法：`getter` 和 `setter`。

访问器方法用来获取或储存与其间接相关的属性值。

正如我们之前看到的那样，在 ES3 的一些实现中已经有这个概念了。在 ES5 中正式定义了该规范，并为这类特性的定义提供了稍微不同的语法（与 SpiderMonkey 实现相比）。

除了一般的特性，一个访问器属性包含如下两个与 getter 和 setter 相关的特性：

- `[[Get]]`
  该特性是一个函数对象，每当通过属性名来获取属性值时都将被调用，不要将该特性与对象的同名内部方法混淆 - 获取属性值的通用方法。因此，访问属性时，内部方法 `[[Get]]` 将调用属性的 `[[Get]]` 特性方法。
- `[[Set]]` 
  该特性也是一个方法，用于设置属性的值，将被对象的内部方法 `[[Put]]` 调用。
  
注意，调用 `[[Set]]` 方法可能会影响后续调用 `[[Get]]` 方法的返回值。也就是说，如果我们给一个属性赋值为 `10`，然后通过 getter 也许会返回完全不一样的值，例如，可能返回 `20`，因为这两者是完全独立的。

命名属性访问器的完整属性映射的默认值如下：

```js
var defaultAccessorPropertyAttributes = {
  [[Get]]: undefined,
  [[Set]]: undefined,
  [[Enumerable]]: false,
  [[Configurable]]: false
};
```

因此，如果缺省了 `[[Set]]`，该属性就成为一个只读属性，这与把 `[[Writable]]` 设置为 `false` 效果等同。

访问器属性也可以通过之前提到的 `Object.defineProperty` 来定义：

```js
var foo = {};

Object.defineProperty(foo, "bar", {

  get: function getBar() {
    return 20;
  },

  set: function setBar(value) {
    // setting implementation
  }

});

foo.bar = 10; // calls foo.bar.[[Set]](10)

// independently always 20
console.log(foo.bar); // calls foo.bar.[[Get]]()
```

或者通过对象初始化器：

```js
var foo = {

  get bar () {
    return 20;
  },

  set bar (value) {
    console.log(value);
  }

};

foo.bar = 100;
console.log(foo.bar); // 20
```



## 属性描述符和属性标识符类型

## 总结

## 扩展阅读

- [4.3 Definitions](http://es5.github.com/#x4.3)
- [8.6 The Object Type](http://es5.github.com/#x8.6)
- [8.10 The Property Descriptor and Property Identifier Specification Types](http://es5.github.com/#x8.10)
- [8.12 Algorithms for Object Internal Methods](http://es5.github.com/#x8.12)
- [15.2.3 Properties of the Object Constructor](http://es5.github.com/#x15.2.3)

<p class="j-dot">**Written by:** Dmitry A. Soshnikov.
**Published on:** 2010-04-28</p>