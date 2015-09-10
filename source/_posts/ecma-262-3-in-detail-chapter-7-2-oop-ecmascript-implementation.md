title: ECMA-262-3 详解 第七章 面向对象(二)：ECMAScript 实现
tags: [ECMA-262-3, ECMAScript, OOP, Prototype]
categories: [JavaScript]
date: 2014-06-22 18:57:22
keywords:
---

此文译自 [Dmitry A. Soshnikov](http://dmitrysoshnikov.com/) 的 [ECMA-262-3 in detail. Chapter 7.2. OOP: ECMAScript implementation](http://dmitrysoshnikov.com/ecmascript/chapter-7-2-oop-ecmascript-implementation/).

## 概述

这一章的第二部分是关于 EMCAScript 中的面向对象编程。在第一部分中我们讨论了 OOP 的基本理论并勾画出和 ECMAScript 的相似之处。在阅读第二部分之前，如果有必要，我还是建议首先阅读这一章的[第一部分 概论](http://bubkoo.com/2014/06/21/ecma-262-3-in-detail-chapter-7-1-oop-the-general-theory/)，因为后面将会用到其中的一些术语。

<!--more-->

## ECMAScript 中 OOP 的实现

在回顾了概论中的一些重点之后，我们终于回到了 ECMAScript 本身。现在，我们已经了解了它的 OOP 方式，让我们再来准确地给出一个定义：

> ECMAScript 是一种面向对象语言，支持基于原型的委托式继承。

我们将从最基本的数据类型来分析，首先需要注意的是，ECMAScript中将实体（数据）分为原始值（primitive values）和对象。因此，一些文章中所说的“在 JavaScript 里，一切都是对象”是不正确的（不完整的）。原始值涉及到数据的几种具体类型，让我们来讨论一下相关的细节。

### 数据类型

虽然 ECMAScript 是动态转化类型的弱类型（“鸭子类型”）语言，但它也是有数据类型的。也就是说，一个对象在某个时刻要属于一个实实在在的类型。

标准中定义了九种类型，而在 ECMAScript 程序中只有六种是可以直接访问的：

- Undefined
- Null
- Boolean
- Number
- String
- Object

另外三种类型只能在实现级别中被访问（没有一个 ECMAScript 对象能够访问这些类型），它们在规范中被用来解释一些运算的行为，或用来储存中间值，等等。这几种类型如下：

- Reference
- List
- Completion

简单地说，引用（Reference）类型用来解释诸如 `delete`，`typeof`，`this` 等运算，它由一个基本对象（base object）和属性名组成。列表（List）类型用来解释参数列表的行为（在 `new` 表达式和函数调用中）。完成（Completion）类型用来解释 `break`，`continue`，`return` 和 `throw` 语句的行为。

#### 原始类型

回头来看六种用于 ECMAScript 程序的数据类型，前五种是原始值类型，包括 `Undefined`、`Null`、`Boolean`、`String`、`Number`。

原始值类型例子：

```js
var a = undefined;
var b = null;
var c = true;
var d = 'test';
var e = 10;
```

这些值是在底层上直接实现的，他们不是 `object`，所以没有原型，没有构造函数。

如果没有正确地理解而只是用 `typeof` 运算来返回类型，那么得到的结果将可能是错误的。其中一个例子是关于 `null` 值。当对 `null` 进行 `typeof` 运算时，返回值是 `object`，而 `null` 实际的类型应该是 `Null`。

```js
alert(typeof null); // "object"
```

其原因是 `null` 的返回值是根据规范表格中的描述 —— “对于（`typeof` 运算中）`null` 的值应该返回 `object` 字符串”来实现的。

规范中并没有澄清这一点，但是 Brendan Eich（JavaScript 发明者）提到，`null` 和 `undefined` 不同，`null` 主要用在对象的场合中，换句话说，本质上更接近于对象（它意味着一个对象的“空引用”，可能是为将来的操作预留位置）。但是，在一些草案中，将这个现象描述为一个普通的 bug。最后结果是，让它保持原样（返回 `object`），虽然 ECMA-262-3 中定义 `null` 的类型为 `Null`。


#### 对象类型

Object 类型是唯一用来表示 ECMAScript 对象的类型。

> Object 是一种无序的键值对的集合。

对象中的键称为属性。属性（的值）可以是原始值也可以是其他对象。当属性的值是函数时，它们被称为方法。

例如：

```js
var x = { // 对象"x"有三个属性: a, b, c
  a: 10, // 原始值
  b: {z: 100},     // 另一个对象
  c: function () { // 函数(方法)
    alert('method x.c');
  }
};
 
alert(x.a);   // 10
alert(x.b);   // [object Object]
alert(x.b.z); // 100
x.c();        // 'method x.c'
```


##### 动态的本资

正如我们在本章的第一部分中所注意到的，ES 中的对象是完全动态的。这意味着我们可以在程序执行的任何时候添加、修改和删除对象的属性。

例如：

```js
var foo = {x: 10};
 
// add new property
foo.y = 20;
console.log(foo); // {x: 10, y: 20}
 
// change property value to function
foo.x = function () {
  console.log('foo.x');
};
 
foo.x(); // 'foo.x'
 
// delete property
delete foo.x;
console.log(foo); // {y: 20}
```

有些属性（只读属性 (read-only)、已删除属性或不可配置 (non-configurable) 的属性）不能被修改。我们将稍后在内部属性里讲解。


注意，ES5 中标准化的静态对象（static object）不能扩展新属性，也不能修改或删除现有属性。这些被称为冻结的对象（frozen objects）。可以通过使用 `Object.freeze(o)` 方法来获得这些对象。

```js
var foo = {x: 10};
 
// freeze the object
Object.freeze(foo);
console.log(Object.isFrozen(foo)); // true
 
// can't modify
foo.x = 100;
 
// can't extend
foo.y = 200;
 
// can't delete
delete foo.x;
 
console.log(foo); // {x: 10}
```

同样，可以通过 `Object.preventExtensions(o)` 方法来防止扩展，或者通过 `Object.defineProperty(o)` 方法来具体控制属性的内部参数：

```js
var foo = {x : 10};
 
Object.defineProperty(foo, "y", {
  value: 20,
  writable: false, // read-only
  configurable: false // non-configurable
});
 
// can't modify
foo.y = 200;
 
// can't delete
delete foo.y; // false
 
// prevent extensions
Object.preventExtensions(foo);
console.log(Object.isExtensible(foo)); // false
 
// can't add new properties
foo.z = 30;
 
console.log(foo); {x: 10, y: 20}
```

##### 内置对象、原生对象和宿主对象

同样需要注意的是，区分的原生对象（native objects），内置对象（built-in objects）和宿主对象（host objects）。

内置对象和原生对象是由 ECMAScript 规范和实现器来定义的，它们之间的区别并不大。原生对象（native objects）是指由 ECMAScript 实现器提供的全部对象（其中一些是内助对象，另一些可以是在程序扩展中创建的，比如用户定义的对象）。

内置对象（built-in objects）是原生对象的子类型，它们会在程序开始前预先建立到 ECMAScript 中（比如`parseInt`，`Math` 等等）。

宿主对象（host objects）是由宿主环境（通常是一个浏览器）提供的对象，比如 `window`，`alert` 等。

注意，宿主对象可能是 ES 自身实现的，完全符合规范的语义。从这点来说，他们能称为“原生宿主”对象（尽快很理论），不过规范没有定义“原生宿主”对象的概念。


##### `Boolean`、`String` 和 `Number` 对象

另外，规范也定义了一些原生的特殊包装类，这些对象是：

- Boolean-object
- String-object
- Number-object

这些对象的创建，是通过相应的内置构造器创建，并且包含原生值作为其内部属性，这些对象可以转换省原始值，反之亦然。

示例 —— 与原始类型对应的对象的值：

```js
var c = new Boolean(true);
var d = new String('test');
var e = new Number(10);
 
// converting to primitive
// conversion: ToPrimitive
// applying as a function, without "new" keyword
с = Boolean(c);
d = String(d);
e = Number(e);
 
// back to Object
// conversion: ToObject
с = Object(c);
d = Object(d);
e = Object(e);
```

此外，也有对象是由特殊的内置构造函数创建： Function（函数对象构造器）、Array（数组构造器） RegExp（正则表达式构造器）、Math（数学模块）、 Date（日期的构造器）等等，这些对象也是Object对象类型的值，他们彼此的区别是由内部属性管理的，我们在下面讨论这些内容。


##### 字面量 Literal

对于以下三种对象的值：对象（object）, 数组（array）, 正则表达式（regexp expression），有一个简短的（和完整的内建构造式创建方式相比，）表示法，分别成为：对象初始化器（object initialiser），数组初始化器（array initialiser），正则表达式字面量（regexp expression literal）：

```js
// equivalent to new Array(1, 2, 3);
// or array = new Array();
// array[0] = 1;
// array[1] = 2;
// array[2] = 3;
var array = [1, 2, 3];
 
// equivalent to
// var object = new Object();
// object.a = 1;
// object.b = 2;
// object.c = 3;
var object = {a: 1, b: 2, c: 3};
 
// equivalent to new RegExp("^\\d+$", "g")
var re = /^\d+$/g;
```


注意，如果将名称绑定 —— Object，Array，RegExp 重新复制到新的对象上，之后使用字面量表示法的语法在不同实现器中可能会有所不同。例如在目前的 Rhino 实现器或者旧的 1.7 版的 SpiderMonkey 中，使用字面量表示法将会创建和构造式名称相对应的新的值类型的对象。在另一些实现器中（包括目前的 Spider 和 TraceMonkey）字面量表示法的语义不会随着构造式名称绑定到新的对象上而改变。

```js
var getClass = Object.prototype.toString;
 
Object = Number;
 
var foo = new Object;
alert([foo, getClass.call(foo)]); // 0, "[object Number]"
 
var bar = {};
 
// in Rhino, SpiderMonkey 1.7 - 0, "[object Number]"
// in other: still "[object Object]", "[object Object]"
alert([bar, getClass.call(bar)]);
 
// the same with Array name
Array = Number;
 
foo = new Array;
alert([foo, getClass.call(foo)]); // 0, "[object Number]"
 
bar = [];
 
// in Rhino, SpiderMonkey 1.7 - 0, "[object Number]"
// in other: still "", "[object Object]"
alert([bar, getClass.call(bar)]);
 
// but for RegExp, semantics of the literal
// isn't being changed in all tested implementations
 
RegExp = Number;
 
foo = new RegExp;
alert([foo, getClass.call(foo)]); // 0, "[object Number]"
 
bar = /(?!)/g;
alert([bar, getClass.call(bar)]); // /(?!)/g, "[object RegExp]"
```

###### 正则表达式字面量和RegExp对象

注意，虽然在 ES3 中，两种正则表达式的情况（字面量形式和对象形式）在语义上是相等的，但是还是有所不同。正则字面量只是一个实例，它在解析阶段创建；而 `RegExp` 构造式创建的总是一个新的对象。这将产生一些问题，比如当 `test` 失败时正则对象的 `lastIndex` 属性：

```js
for (var k = 0; k < 4; k++) {
  var re = /ecma/g;
  alert(re.lastIndex); // 0, 4, 0, 4
  alert(re.test("ecmascript")); // true, false, true, false
}
 
// in contrast with
 
for (var k = 0; k < 4; k++) {
  var re = new RegExp("ecma", "g");
  alert(re.lastIndex); // 0, 0, 0, 0
  alert(re.test("ecmascript")); // true, true, true, true
}
```

注意，ES5 中问题已经被解决，正则字面量也总是创建新的对象。

##### 关联数组

在各种文章和讨论中，常常把 JavaScript 对象（这里通常是特指通过声明的形式 —— 通过对象初始化器 `{}` 创建的对象）称为哈希表（hash-tables）或者简称 —— hash(从 Ruby 和 Perl 中来的术语)、关联数组（associative arrays，从 PHP 中来的术语）、字典（dictionaries，从 Python 中来的术语），等等。

使用这些术语主要是从具体的技术中带来的习惯。事实上，它们确实足够相似，在“键值对”储存的方式上完全符合关联数组或哈希表的数据结构。并且哈希表的抽象数据类型可能并且常常也在实现器级别上使用到。

然而，虽然术语本身是对思想的一种概念式的描述，但是涉及到 ECMAScript，（用关联数组来描述对象）在技术上是不正确的。因为 ECMAScript 中只有一种对象类型，而在它的以“键值对”方式储存的“子类型”方面，其他的对象也可以使用这种方式。因此，没有针对这种储存方式而定义的特殊的独立的术语（hash或者其他）。任何对象，无论它的内部属性是什么，都可以以这种方式储存：

```js
var a = {x: 10};
a['y'] = 20;
a.z = 30;
 
var b = new Number(1);
b.x = 10;
b.y = 20;
b['z'] = 30;
 
var c = new Function('');
c.x = 10;
c.y = 20;
c['z'] = 30;
 
// etc. – with any object "subtype"
```

而且，由于 ES 中对象的委托的特性它可以是非空的，因此术语 hash 也是不合适的。

```js
Object.prototype.x = 10;
 
var a = {}; // create "empty" "hash"
 
alert(a["x"]); // 10, but it's not empty
alert(a.toString); // function
 
a["y"] = 20; // add new pair to "hash"
alert(a["y"]); // 20
 
Object.prototype.y = 20; // and property into the prototype
 
delete a["y"]; // remove
alert(a["y"]); // but key and value are still here – 20
```

注意，ES5 中提供了标准化的创建没有属性的对象的能力 —— 它们的原型会被设为 `null`。这是通过 `Object.create(null)` 方法来实现的。从这个角度上说，这些对象是纯粹的哈希表。

```js
var aHashTable = Object.create(null);
console.log(aHashTable.toString); // undefined
```

同样，一些属性可能有特殊的读写器（getters/setters），所以可能产生混乱：

```js
var a = new String("foo");
a['length'] = 10;
alert(a['length']); // 3
```

然而，即使考虑 hash 可以有原型的情况（例如在 Ruby 或 Python 中，有 hash-objects 委托的类），在 ES 中这个属于还是不合适的，因为各种属性访问器（即 `.` 和 `[]`）之间没有语义上的区别。

同样，在 ES 中一个“属性（property）”的概念在语义上并不细分为“键（key）”，“数组索引（array index）”，“方法（method）”或“属性（property）”。它们都是属性，在原型链的测试中都符合读写算法的一般规则。

在下面的 Ruby 的例子中我们能看到语义上的区别，因此在术语上可以做出区分。

```Ruby
a = {}
a.class # Hash
 
a.length # 0
 
# new "key-value" pair
a['length'] = 10;
 
# but semantics for the dot notation
# remains other and means access
# to the "property/method", but not to the "key"
 
a.length # 1
 
# and the bracket notation
# provides access to "keys" of a hash
 
a['length'] # 10
 
# we can augment dynamically Hash class
# with new properties/methods and they via
# delegation will be available for already created objects
 
class Hash
  def z
    100
  end
end
 
# a new "property" is available
 
a.z # 100
 
# but not a "key"
 
a['z'] # nil
```

总之，ECMA-262-3 标准中没有关于 hash (或者其他类似概念)的定义。然而如果只是从理论的数据结构的角度上说，也可以这样称呼对象。

##### 类型转换

将对象转换为原始值可以通过 `valueOf` 方法。正如我们注意到的，将构造式（或具体类型）作为函数调用，换句话说不带 `new` 看运算符，结果也是将一个对象类型转换为一个原始值。这种转换事实上隐含了 `valueOf` 方法的调用：

```js
var a = new Number(1);
var primitiveA = Number(a); // implicit "valueOf" call
var alsoPrimitiveA = a.valueOf(); // explicit
 
alert([
  typeof a, // "object"
  typeof primitiveA, // "number"
  typeof alsoPrimitiveA // "number"
]);
```

这种方法允许对象参与不同的运算，比如相加：

```js
var a = new Number(1);
var b = new Number(2);
 
alert(a + b); // 3
 
// or even so
 
var c = {
  x: 10,
  y: 20,
  valueOf: function () {
    return this.x + this.y;
  }
};
 
var d = {
  x: 30,
  y: 40,
  // the same .valueOf
  // functionality as "с" object has,
  // borrow it:
  valueOf: c.valueOf
};
 
alert(c + d); // 100
```


`valueOf` 方法的默认值根据对象的类型而定。对于一些对象，它返回的是 `this` 值 —— 例如`Object.prototype.valueOf`；对于另一些则是可计算的值，例如，`Date.prototype.valueOf()`，会返回 date 的 time 值：

```js
var a = {};
alert(a.valueOf() === a); // true, "valueOf" returned this value
 
var d = new Date();
alert(d.valueOf()); // time
alert(d.valueOf() === d.getTime()); // true
```

同样，有另一个原始值可以表示对象——字符串表示。这是和 `toString` 方法相关的，这种方法在一些运算中同样会自动调用：

```js
var a = {
  valueOf: function () {
    return 100;
  },
  toString: function () {
    return '__test';
  }
};
 
// in this operation
// toString method is
// called automatically
alert(a); // "__test"
 
// but here - the .valueOf() method
alert(a + 10); // 110
 
// but if there is no
// valueOf method, it
// will be replaced with the
//toString method
delete a.valueOf;
alert(a + 10); // "_test10"
```

定义在 `Object.prototype` 上的 `toString` 方法有特殊的含义。它返回的是内部属性 `[[Class]]` 的值，我们将在下面讨论到。

除了将对象转换为原始值之外，相反也可以把原始值转换为对象。

其中一种显示转换为对象的方式就是将内建的 Object 构造式作为函数使用（虽然对于一些类型而言加上 `new` 运算符也可以）：

```js
var n = Object(1); // [object Number]
var s = Object('test'); // [object String]
 
// also for some types it is
// possible to call Object with new operator
var b = new Object(true); // [object Boolean]
 
// but applied with arguments,
// new Object creates a simple object
var o = new Object(); // [object Object]
 
// in case if argument for Object function
// is already object value,
// it simply returns
var a = [];
alert(a === new Object(a)); // true
alert(a === Object(a)); // true
```

关于调用内建构造器时是否加上 `new` 运算符，并没有一般规则，而是根据具体的构造器而定。例如 Array 和 Function 构造器无论在作为构造式调用（使用 `new`），还是作为函数调用（不使用 `new`），结果都是一样的：

```js
var a = Array(1, 2, 3); // [object Array]
var b = new Array(1, 2, 3); // [object Array]
var c = [1, 2, 3]; // [object Array]
 
var d = Function(''); // [object Function]
var e = new Function(''); // [object Function]
```

在使用一些运算符时，也可能会发生显式和隐式的类型转换：

```js
var a = 1;
var b = 2;
 
// implicit
var c = a + b; // 3, number
var d = a + b + '5' // "35", string
 
// explicit
var e = '10'; // "10", string
var f = +e; // 10, number
var g = parseInt(e, 10); // 10, number
 
// etc.
```


##### 属性的内部参数

所有的属性都可以有一些内部参数：

- {ReadOnly} ——（有这个内部属性时）对属性写入值的尝试会被忽略；ReadOnly 的属性可以通过宿主环境的行为而改变，因此 ReadOnly 并不等于“常量”
- {DontEnum} —— 属性不能通过 `for...in` 循环枚举
- {DontDelete} —— 对这个属性的 `delete` 运算将会被忽略
- {Internal} —— 属性是内部的，它没有名称并且只在实现器级别上使用。这类属性不能通过 ECMAScript 程序访问。

注意，在 ES5 中，{ReadOnly}，{DontEnum}，{DontDelete} 分别被重命名为 [[Writable]]，[[Enumerable]] 和 [[Configurable]]，并且可以通过 `Object.defineProperty` 以及类似方法来手动管理。


```js
var foo = {};
 
Object.defineProperty(foo, "x", {
  value: 10,
  writable: true, // aka {ReadOnly} = false
  enumerable: false, // aka {DontEnum} = true
  configurable: true // {DontDelete} = false
});
 
console.log(foo.x); // 10
 
// attributes set is called a descriptor
var desc = Object.getOwnPropertyDescriptor(foo, "x");
 
console.log(desc.enumerable); // false
console.log(desc.writable); // true
// etc.
```



##### 内部属性和方法

对象也可以有一些内部属性，这些属性是实现器级别的，不能在 ECMAScript 程序中直接访问（然而正如我们下面将看到的，一些实现器也允许访问其中的一些属性）。这些属性在管理上是有两个外加的中括号 `[[]]`。

我们将会接触它们中的一部分（所有对象中必需的那些）；其他属性的描述可以在规范中找到。

每一个对象都需要实现如下的属性和方法：

- [[Prototype]] —— 对象的原型（在下面会详细谈到）
- [[Class]] —— 一个用于表示对象类型的字符串(例如Object, Array, Function，等)；它用于区分对象
- [[Get]] —— 一种获取属性值的方法
- [[Put]] —— 一种设定属性值的方法
- [[CanPut]] —— 检查是否可以写入相关属性
- [[HasProperty]] —— 检查对象是否已经有了相关属性
- [[Delete]] —— 将属性从对象中删除
- [[DefaultValue]] —— 返回和对象相关的原始值（为了获得这个值调用了 `valueOf` 方法，对于一些对象，可能抛出 `TypeError` 异常）

在 ES 程序中，可以通过 `Object.prototype.toString()` 方法来间接获得对象的 `[[Class]]` 属性。(译注：注意和对象的一些分支类型的 `toString` 方法相区别，比如`Array.prototype.toString`)。这个方法将返回如下字符串`[object + [[Class]] + ]`，例如：

```js
var getClass = Object.prototype.toString;
 
getClass.call({}); // [object Object]
getClass.call([]); // [object Array]
getClass.call(new Number(1)); // [object Number]
// etc.
```

这个特性常常被用来检查对象的类型，然而需要注意的是，在规范中，宿主对象(host objects)的内部属性 `[[Class]]` 可以是任何值，包括内置对象的 `[[Class]]` 属性的值，这样理论上就不能 100% 保证检测正确性。例如，`document.childNodes.item(...)`的属性 `[[Class]]` 在 IE 中返回为 `String`（而在其他实现器中则是 `Function`）。

```js
// in IE - "String", in other - "Function"
alert(getClass.call(document.childNodes.item));
```


### 构造函数

所以，如我们上面所说，在 ECMAScript 中的对象是通过所谓的构造函数来创建的。

> 构造函数是一个函数，用来创建并初始化新创建的对象。

创建（内存分配）的过程是由构造器函数的内部方法 `[[Construct]]` 负责的。这个内部方法的行为是指定好的，所有的构造器函数都使用这个方法来为新对象分配内存。

初始化的过程是通过在新创建的对象的上下文中调用函数来管理的，它由构造器函数的内部方法 `[[Call]]` 负责。

注意，在用户代码中，只有初始化阶段是可以访问的。虽然，即使在初始化阶段中我们也能够返回不同的对象而无视在创建阶段中生成的 `this` 对象：

```js
function A() {
  // update newly created object
  this.x = 10;
  // but return different object
  return [1, 2, 3];
}
 
var a = new A();
console.log(a.x, a); undefined, [1, 2, 3]
```

根据[第五章 函数](http://bubkoo.com/2014/06/12/ecma-262-3-in-detail-chapter-5-functions/)中讨论过的函数对象创建的算法我们看到，函数是一个原生对象，它有若干内部属性其中包括 `[[Call]]` 和 `[[Construct]]`，它还有显式的属性 `prototype` —— 未来对象的原型的引用（注：NativeObject是对于native object原生对象的约定，在下面的伪代码中使用）。

```js
F = new NativeObject();
 
F.[[Class]] = "Function"
 
.... // 其它属性
 
F.[[Call]] = <reference to function> // function自身
 
F.[[Construct]] = internalConstructor // 普通的内部构造函数
 
.... // 其它属性
 
// F构造函数创建的对象原型
__objectPrototype = {};
__objectPrototype.constructor = F // {DontEnum}
F.prototype = __objectPrototype
```

因此，除了 `[[Class]]` 属性（值为 `Function`），`[[Call]]` 属性在对象区分方面起到主要作用，内部属性 `[[Call]]` 的对象被当做函数调用。这样的对象用 `typeof` 运算操作符的话返回的是 `function`。然而它主要是和原生对象有关，有些情况的实现中用 `typeof` 获取值的是不一样的，例如：`window.alert (...)`在 IE 中的效果：

```js
// IE浏览器中 - "Object", "object", 其它浏览器 - "Function", "function"
alert(Object.prototype.toString.call(window.alert));
alert(typeof window.alert); // "Object"
```

内部方法 `[[Construct]]` 由构造器函数的 `new` 运算符激活。如我们所说，这个方法负责内存的分配以及对象的创建。如果没有参数，函数构造器的调用括号可以省略：

```js
function A(x) { // constructor А
  this.x = x || 10;
}
 
// 不传参数的话，括号也可以省略
var a = new A; // or new A();
alert(a.x); // 10
 
// 显式传入参数x
var b = new A(20);
alert(b.x); // 20
```

我们同样知道，构造器内部的 `this` 的值（在初始化阶段）是新创建的对象。

让我们来看看对象创建的算法。


#### 对象创建的算法

内部方法 `[[Construct]]` 的行为可以描述为：

```js
F.[[Construct]](initialParameters):
 
O = new NativeObject();
 
// 属性[[Class]]被设置为"Object"
O.[[Class]] = "Object"
 
// 引用F.prototype的时候获取该对象g
var __objectPrototype = F.prototype;
 
// 如果__objectPrototype是对象，就:
O.[[Prototype]] = __objectPrototype
// 否则:
O.[[Prototype]] = Object.prototype;
// 这里O.[[Prototype]]是Object对象的原型
 
// 新创建对象初始化的时候应用了F.[[Call]]
// 将this设置为新创建的对象O
// 参数和F里的initialParameters是一样的
R = F.[[Call]](initialParameters); this === O;
// 这里R是[[Call]]的返回值
// 在JS里看，像这样:
// R = F.apply(O, initialParameters);
 
// 如果R是对象
return R
// 否则
return O
```

注意两个主要特点：

首先，所创建的对象的原型是从“当前”时刻下构造器函数的 `prototype` 属性而来的（意味着由一个构造器创建的两个对象的原型可以是不同的，因为函数的 `prototype` 属性同样是可变的）。

其次，正如上面提到的，如果对象初始化时 `[[Call]]` 返回的是对象，那么它将作为整个 `new` 表达式的返回值：

```js
function A() {}
A.prototype.x = 10;
 
var a = new A();
alert(a.x); // 10 – 从原型上得到
 
// 设置.prototype属性为新对象
// 为什么显式声明.constructor属性将在下面说明
A.prototype = {
  constructor: A,
  y: 100
};
 
var b = new A();
// 对象"b"有了新属性
alert(b.x); // undefined
alert(b.y); // 100 – 从原型上得到
 
// 但a对象的原型依然可以得到原来的结果
alert(a.x); // 10 - 从原型上得到
 
function B() {
  this.x = 10;
  return new Array();
}
 
// 如果"B"构造函数没有返回（或返回this）
// 那么this对象就可以使用，但是下面的情况返回的是array
var b = new B();
alert(b.x); // undefined
alert(Object.prototype.toString.call(b)); // [object Array]
```

让我们来详细了解一下原型


### 原型

每个对象都有一个原型（一些系统对象除外）。原型通信是通过内部的、隐式的、不可直接访问 `[[Prototype]]` 原型属性来进行的，原型可以是一个对象，也可以是 `null` 值。


#### `constructor` 属性

上面的例子中有两个重点。其中之一是关于函数原型属性的 `constructor` 属性的。

正如我们在函数对象创建的算法中看到的，在函数创建时设定了函数原型属性的 `constructor` 属性。这个属性的值是循环引用函数本身：

```js
function A() {}
var a = new A();
alert(a.constructor); // function A() {}, by delegation
alert(a.constructor === A); // true
```

对于这个情况常常有一种误解 —— `constructor` 属性被错误地当做了所创建对象的自有属性。然而正如我们看到的，这个属性属于原型而对象通过继承访问。

通过继承的 `constructor` 属性，实例对象可以间接引用原型对象：

```js
function A() {}
A.prototype.x = new Number(10);
 
var a = new A();
alert(a.constructor.prototype); // [object Object]
 
alert(a.x); // 10, via delegation
// the same as a.[[Prototype]].x
alert(a.constructor.prototype.x); // 10
 
alert(a.constructor.prototype.x === a.x); // true
```

注意，虽然函数的 `prototype` 属性和原型的 `constructor` 属性都可以在对象创建后重定义，但是这种情况下对象可能失去上面的引用机制。

如果我们在初始的原型中新增或者修改已有属性（通过函数的 `prototype` 属性），实例将可以看到这些新增或修改后的结果。

但是，如果我们完全改变函数的 `prototype` 属性（通过赋值为一个新对象），对于初始构造函数的引用将会丢失（初始的原型也是一样，不能通过 `.contructor.prototype` 访问）。这是因为新创建的对象没有了 `constructor` 属性：

```js
function A() {}
A.prototype = {
  x: 10
};
 
var a = new A();
alert(a.x); // 10
alert(a.constructor === A); // false!
```

因此必须手动添加对构造器的引用：

```js
function A() {}
A.prototype = {
  constructor: A,
  x: 10
};
 
var a = new A();
alert(a.x); // 10
alert(a.constructor === A); // true
```

注意，虽然手动储存 `constructor` 属性可以避免丢失对构造器的引用，但是它没有 `{DontEnum}` 内部参数，因此会在 `prototype` 的 `for...in` 循环中枚举到（而函数创建过程中自动设定的这个属性有 `{DontEnum}`）。

在 ES5 中引入了控制属性的 `[[Enumerable]]` 内部参数的方法：`defineProperty`

```js
var foo = {x: 10};
 
Object.defineProperty(foo, "y", {
  value: 20,
  enumerable: false // aka {DontEnum} = true
});
 
console.log(foo.x, foo.y); // 10, 20
 
for (var k in foo) {
  console.log(k); // only "x"
}
 
var xDesc = Object.getOwnPropertyDescriptor(foo, "x");
var yDesc = Object.getOwnPropertyDescriptor(foo, "y");
 
console.log(
  xDesc.enumerable, // true
  yDesc.enumerable  // false
);
```


#### 显式 `prototype` 和隐式 `[[Prototype]]` 属性

一个对象的原型（`[[Prototype]]` 内部属性）常常不容易正确地和函数 `prototype` 属性的显式引用区分开来。是的，它们确实引用的是同一个对象：

```js
a.[[Prototype]] ----> Prototype <---- A.prototype
```

而且，实例的 `[[Prototype]]` 正是从构造器的 `prototype` 属性上获得值 —— 在对象创建时。

但是，对于构造器的 `prototype` 属性的重置不会影响到已创建的对象的原型。改变的只是构造器的 `prototype` 属性！这意味着之后创建的新对象将会有新的原型。但是已创建的对象（在构造器的 `prototype` 改变之前创建的），引用的还是旧的原型并且这个引用将不能再被改变：

```js
// was before changing of A.prototype
a.[[Prototype]] ----> Prototype <---- A.prototype
 
// became after
A.prototype ----> New prototype // new objects will have this prototype
a.[[Prototype]] ----> Prototype // reference to old prototype
```

例如：


```js
function A() {}
A.prototype.x = 10;
 
var a = new A();
alert(a.x); // 10
 
A.prototype = {
  constructor: A,
  x: 20
  y: 30
};

// 译注：
// 原本对象的 [[Prototype]] 属性和 A.prototype 引用的是同一个对象
// 这里直接将修改了 A.prototype 的引用
// 修改不会影响到已经创建的对象，已经创建对象的 [[Prototype]] 属性还是引用到之前的对象
// 注意：A.prototype.xxx 的方式与上面方式的不同
 
// object "а" delegates to
// the old prototype via
// implicit [[Prototype]] reference
alert(a.x); // 10
alert(a.y) // undefined
 
var b = new A();
 
// but new objects at creation
// get reference to new prototype
alert(b.x); // 20
alert(b.y) // 30
```

因此，在一些文章中声称的“动态改变原型将会影响到所有对象，它们将拥有新的原型”的说法是不正确的。只有在原型改变后创建的对象才受这些新的原型的影响。

这里的主要规则是：对象的原型是在对象创建时设定的，在这之后不能改变为新的对象。只有当它和构造器的 `prototype` 的显示引用指向的是同一个对象时，才能通过构造器的 `prototype` 新增或者修改对象原型的属性。

#### 非标准的 `__proto__` 属性

然而，一些实现器，比如 SpiderMonkey，提供了对于对象原型的显示引用，通过一个非标准的 `__proto__` 属性：

```js
function A() {}
A.prototype.x = 10;
 
var a = new A();
alert(a.x); // 10
 
var __newPrototype = {
  constructor: A,
  x: 20,
  y: 30
};
 
// 将原型指向一个新对象
A.prototype = __newPrototype;
 
var b = new A();
alert(b.x); // 20
alert(b.y); // 30
 
// 对象 "a" 仍然引用老对象
alert(a.x); // 10
alert(a.y); // undefined
 
// 显式修改原型
a.__proto__ = __newPrototype;
 
// 此时，对象 "а" 引用到了新对象
alert(a.x); // 20
alert(a.y); // 30
```

注意，ES5 中的 `Object.getPropertyOf(o)` 方法，可以直接返回一个对象的 `[[Prototype]]` 属性 —— 实例的初始原型。然而和 `__proto__` 不同，这个方法只是一个 getter，它不允许设定原型。

```js
var foo = {};
Object.getPrototypeOf(foo) == Object.prototype; // true
```





#### 对象独立于构造函数

由于一个实例对象的原型是独立于它的构造函数和构造函数的 `prototype` 属性的，构造函数在完成了它的主要目的 -- 创建对象 -- 之后可以被删除。原型对象将仍然存在，并通过 `[[Prototype]]` 属性引用：

```js
function A() {}
A.prototype.x = 10;
 
var a = new A();
alert(a.x); // 10
 
// 设置A为null - 显示引用构造函数
A = null;
 
// 但如果.constructor属性没有改变的话，
// 依然可以通过它创建对象
var b = new a.constructor();
alert(b.x); // 10
 
// 隐式的引用也删除掉
delete a.constructor.prototype.constructor;
delete b.constructor.prototype.constructor;
 
// 通过A的构造函数再也不能创建对象了
// 但这2个对象依然有自己的原型
alert(a.x); // 10
alert(b.x); // 10
```


#### `instanceof` 操作符的特性

对一个原型的显示引用 —— 通过构造器的 `prototype` 属性，是和 `instanceof` 运算的工作相关的。

这个运算直接工作于原型链上而不是通过构造函数。关于这一点常常有一种误解，那就是，当进行下面这种检查方式时：

```js
if (foo instanceof Foo) {
  ...
}
```

**它不是表示检查对象foo是否由构造器Foo创建！**

`instanceof` 运算所做的只是获取一个对象的原型 —— `foo.[[Prototype]]`，并且检查它在原型链中的存在情况，（对于运算符右边则分析它的原型属性）对比分析 `Foo.prototype`。`instanceof` 运算由构造器的内部方法 `[[HasInstance]]` 激活。

让我们来一个示例：

```js
function A() {}
A.prototype.x = 10;
 
var a = new A();
alert(a.x); // 10
 
alert(a instanceof A); // true
 
// 如果设置原型为null
A.prototype = null;
 
// ..."a"依然可以通过a.[[Prototype]]访问原型
alert(a.x); // 10
 
// 不过，instanceof操作符不能再正常使用了
// 因为它是从构造函数的prototype属性来实现的
alert(a instanceof A); // 错误，A.prototype不是对象
```

而另一方面，可能通过一个构造器创建的对象，但在 `instanceof` 检查另一个构造器时返回 `true`。而这只需要将对象的 `[[Property]]` 和新的构造器的 `prototype` 属性设为同一个对象即可：

```js
function B() {}
var b = new B();
 
alert(b instanceof B); // true
 
function C() {}
 
var __proto = {
  constructor: C
};
 
C.prototype = __proto;
b.__proto__ = __proto;
 
alert(b instanceof C); // true
alert(b instanceof B); // false
```




#### 原型可以存放方法并共享属性


ECMAScript 中原型最有用的就是作为对象方法、默认状态和共享属性的储存器。

的确，对象可以有自身的状态，但方法通常都是相同的。因此，为了内存占用的性能优化，方法通常定义在原型中。这意味着，通过一个构造器创建的所有实例，总是共用相同的方法。

```js
function A(x) {
  this.x = x || 100;
}
 
A.prototype = (function () {
 
  // 初始化上下文
  // 使用额外的对象
 
  var _someSharedVar = 500;
 
  function _someHelper() {
    alert('internal helper: ' + _someSharedVar);
  }
 
  function method1() {
    alert('method1: ' + this.x);
  }
 
  function method2() {
    alert('method2: ' + this.x);
    _someHelper();
  }
 
  // 原型自身
  return {
    constructor: A,
    method1: method1,
    method2: method2
  };
 
})();
 
var a = new A(10);
var b = new A(20);
 
a.method1(); // method1: 10
a.method2(); // method2: 10, internal helper: 500
 
b.method1(); // method1: 20
b.method2(); // method2: 20, internal helper: 500
 
// 2个对象使用的是原型里相同的方法
alert(a.method1 === b.method1); // true
alert(a.method2 === b.method2); // true
```


### 读写属性

正如我们提到过的，对于属性的读写是通过内部方法 `[[Get]]` 和 `[[Put]]` 来管理的。这两个方法是通过属性访问器激活的 —— 点符号或中括号：

```js
// 写入
foo.bar = 10; // 调用了[[Put]]
 
console.log(foo.bar); // 10, 调用了[[Get]]
console.log(foo['bar']); // 效果一样
```

让我们通过伪代码来展示这些方法的工作原理。

#### `[[Get]]` 方法

除了对象的自有属性外，`[[Get]]` 方法也考虑到了对象原型链中的属性。因此原型中的属性也像对象的自有属性一样可以被访问到。

```js
O.[[Get]](P):
 
// 如果是自己的属性，就返回
if (O.hasOwnProperty(P)) {
  return O.P;
}
 
// 否则，继续分析原型
var __proto = O.[[Prototype]];
 
// 如果原型是null，返回undefined
// 这是可能的：最顶层Object.prototype.[[Prototype]]是null
if (__proto === null) {
  return undefined;
}
 
// 否则，对原型链递归调用[[Get]]，在各层的原型中查找属性
// 直到原型为null
return __proto.[[Get]](P)
```

请注意，因为 `[[Get]]` 在如下情况也会返回`undefined`：

```js
if (window.someObject) {
  ...
}
```

这里，在 `window` 里没有找到 `someObject` 属性，然后会在原型里找，原型的原型里找，以此类推，如果都找不到，按照定义就返回 `undefined`。

注意，对于实际的存在性是由 `in` 运算负责的。它同样考虑原型链中的属性。

```js
if ('someObject' in window) {
  ...
}
```

它帮助避免了一些情况中上面的检测失效，比如属性值为 `false` 的情况将不会通过，即使属性是确实存在的。




#### `[[Put]]` 方法

`[[Put]]` 方法可以创建、更新对象自身的属性，并且掩盖原型里的同名属性。

```js
O.[[Put]](P, V):
 
// 如果不能给属性写值，就退出
if (!O.[[CanPut]](P)) {
  return;
}
 
// 如果对象没有自身的属性，就创建它
// 所有的attributes特性都是false
if (!O.hasOwnProperty(P)) {
  createNewProperty(O, P, attributes: {
    ReadOnly: false,
    DontEnum: false,
    DontDelete: false,
    Internal: false
  });
}
 
// 如果属性存在就设置值，但不改变attributes特性
O.P = V
 
return;
```

例如：

```js
Object.prototype.x = 100;
 
var foo = {};
console.log(foo.x); // 100, 继承属性
 
foo.x = 10; // [[Put]]
console.log(foo.x); // 10, 自身属性
 
delete foo.x;
console.log(foo.x); // 重新是100,继承属性
```

请注意，不能掩盖原型里的只读属性，赋值结果将忽略，这是由内部方法 `[[CanPut]]` 控制的。

```js
// 例如，属性length是只读的，我们来掩盖一下length试试
 
function SuperString() {
  /* nothing */
}
 
SuperString.prototype = new String("abc");
 
var foo = new SuperString();
 
console.log(foo.length); // 3, "abc"的长度
 
// 尝试掩盖
foo.length = 5;
console.log(foo.length); // 依然是3
```

在 ES5 的严格模式下，如果掩盖只读属性的话，会抛出 `TypeError` 错误。




#### 属性访问器

内部方法 `[[Get]]` 和 `[[Put]]` 在 ECMAScript 里是通过点符号或者索引法来激活的，如果属性标示符是合法的名字的话，可以通过 `.` 来访问，而索引方运行动态定义名称。

```js
var a = {testProperty: 10};
 
alert(a.testProperty); // 10, 点
alert(a['testProperty']); // 10, 索引
 
var propertyName = 'Property';
alert(a['test' + propertyName]); // 10, 动态属性通过索引的方式
```

这里有一个非常重要的特性——属性访问器总是使用 ToObject 规范来对待 `.` 左边的值。这种隐式转化和这句“在 JavaScript 中一切都是对象”有关系，（然而，当我们已经知道了，JavaScript 里不是所有的值都是对象）。

如果对原始值进行属性访问器取值，访问之前会先对原始值进行对象包装（包括原始值），然后通过包装的对象进行访问属性，属性访问以后，包装对象就会被删除。

例如：

```js
var a = 10; // 原始值
 
// 但是可以访问方法（就像对象一样）
alert(a.toString()); // "10"
 
// 此外，我们可以在a上创建一个心属性
a.test = 100; // 好像是没问题的
 
// 但，[[Get]]方法没有返回该属性的值，返回的却是undefined
alert(a.test); // undefined
```

那么，为什么整个例子里的原始值可以访问 `toString` 方法，而不能访问新创建的 `test` 属性呢？

答案很简单：

首先，正如我们所说，使用属性访问器以后，它已经不是原始值了，而是一个包装过的中间对象（整个例子是使用 `new Number(a)`），而 `toString` 方法这时候是通过原型链查找到的：

```js
// 执行a.toString()的原理:
 
1. wrapper = new Number(a);
2. wrapper.toString(); // "10"
3. delete wrapper;
```

接下来，`[[Put]]` 方法创建新属性时候，也是通过包装装的对象进行的：

```js
// 执行a.test = 100的原理：
 
1. wrapper = new Number(a);
2. wrapper.test = 100;
3. delete wrapper;
```

我们看到，在第 3 步的时候，包装的对象以及删除了，随着新创建的属性页被删除了 —— 删除包装对象本身。

然后使用 `[[Get]]` 获取 `test` 值的时候，再一次创建了包装对象，但这时候包装的对象已经没有 `test` 属性了，所以返回的是 `undefined`：

```js
// 执行a.test的原理:
 
1. wrapper = new Number(a);
2. wrapper.test; // undefined
```

这种方式解释了原始值的读取方式，另外，任何原始值如果经常用在访问属性的话，时间效率考虑，都是直接用一个对象替代它；与此相反，如果不经常访问，或者只是用于计算的话，到可以保留这种形式。


### 继承

如我们所知，ECMAScript 使用基于原型的委托式继承。

（对象的）原型(式继承)是链式的，称为原型链。

事实上，所有委托的实现和原型链分析的工作都简化为了上面提到的 `[[Get]]` 的工作。

如果你完全理解了上面 `[[Get]]` 方法的简单算法，关于 JavaScript 中继承的问题就不证自明了。

论坛中常常谈论 JavaScript 中的继承，我通过一个一行代码的例子来具体描述这门语言中的对象结构以及基于委托的继承。事实上我们可以不创建任何构造器或者对象，因为这门语言中已经到处是继承了。这行代码很简单：

```js
alert(1..toString()); // "1"
```

现在，我们已经知道了 `[[Get]]` 的算法和属性访问器，我们能看到这里面发生了什么：

1. 首先，从原始值 1 创建了包装对象new Number(1)
2. 然后这个包装对象调用了继承的方法toString

为什么发生了继承？因为 ES 中的对象可以有自有属性，而这种情况下创建的包装对象没有自有属性 `toString`，因此，它从原型中，即 `Number.prototype` 中继承了 `toString` 方法。

注意语法中的细节。上面例子中的两个点不是一个错误。第一个点是用作一个数值的分数部分，第二个点是属性访问器

```js
1.toString(); // SyntaxError!
 
(1).toString(); // OK
 
1..toString(); // OK
 
1['toString'](); // OK
```

#### 原型链

让我们来看下如何为用户定义的对象创建原型链。

```js
function A() {
  alert('A.[[Call]] activated');
  this.x = 10;
}
A.prototype.y = 20;
 
var a = new A();
alert([a.x, a.y]); // 10 (自身), 20 (继承)
 
function B() {}
 
// 最近的原型链方式就是设置对象的原型为另外一个新对象
B.prototype = new A();
 
// 修复原型的constructor属性，否则的话是A了 
B.prototype.constructor = B;
 
var b = new B();
alert([b.x, b.y]); // 10, 20, 2个都是继承的
 
// [[Get]] b.x:
// b.x (no) -->
// b.[[Prototype]].x (yes) - 10
 
// [[Get]] b.y
// b.y (no) -->
// b.[[Prototype]].y (no) -->
// b.[[Prototype]].[[Prototype]].y (yes) - 20
 
// where b.[[Prototype]] === B.prototype,
// and b.[[Prototype]].[[Prototype]] === A.prototype
```

这种方法有两个特性：

首先，`B.prototype` 将包含 `x` 属性。虽然第一眼看去似乎这是不正确的。因为 `x` 属性是定义在 `A` 中的自有属性，所以预期也它是 `B` 构造器产生的对象的自有属性（就像 `A` 产生的对象 `a` 那样）。


在一般的原型式继承中，当一个对象没有所需的自有属性时将会委托一个原型。这个机制背后的逻辑是可能构造器 `B` 创建的对象不需要属性 `x`。相反，在基于类的继承模式中，（类）所有的属性都复制给了类的后裔。


然而，如果还是有必要让属性 `x` 成为构造器 `B` 创建的对象的自有属性的话（模拟基于类的方式），也有几种技术可以实现，其中一种我们将在下面看到。

第二点，其实已经不算是特点而是一个缺点 —— 当后裔原型创建时（e.g. `B.prototype = new A()`）会执行父构造器的代码。我们看到 `A.[[Call]] activated` 的消息出现了两次，构造器 `A` 创建对象 `a` 时以及 `A` 创建的新对象被用作 `B.prototype` 时。

一个更严重的例子是当父构造器抛出异常时：可能，对于构造器创建的真实对象而言这种检查是需要的，但很明显，将这些父对象作为原型时再检查是完全不能接受的：

```js
function A(param) {
  if (!param) {
    throw 'Param required';
  }
  this.param = param;
}
A.prototype.x = 10;
 
var a = new A(20);
alert([a.x, a.param]); // 10, 20
 
function B() {}
B.prototype = new A(); // Error
```

同样，父构造器中的大量运算也将会是这种方式的一个缺点。

为了解决这些“特性”和问题，现在的程序员使用的是我们下面展示的这种原型链的标准模式。这个技巧的主要目的是创建一个用来链接原型的中间包装构造器：

```js
function A() {
  alert('A.[[Call]] activated');
  this.x = 10;
}
A.prototype.y = 20;
 
var a = new A();
alert([a.x, a.y]); // 10 (own), 20 (inherited)
 
function B() {
  // 或者简单的A.apply(this, arguments);
  B.superproto.constructor.apply(this, arguments);
}
 
// 通过创建空的构造器来链接原型
var F = function() {};
F.prototype = A.prototype;
B.prototype = new F();
B.superproto = A.prototype; // 显式引用父原型
// fix constructor
B.prototype.constructor = B;
 
var b = new B(); // 'A.[[Call]] activated'
alert([b.x, b.y]); // 10 (own), 20 (inherited)
```


注意，我们如何在 `b` 实例上创建了自有属性 `x`：在新创建的对象的上下文中通过 `B.superproto.constructor` 的引用来调用父构造式。

我们同样解决了创建子代原型时会不必要地调用父构造器的问题。

而为了避免每次重复链接原型部分（创建中间构造器，设置"superproto"，储存初始构造器等等），可以把这个部分封装在函数里：

```js
function inherit(child, parent) {
  var F = function() {};
  F.prototype = parent.prototype;
  child.prototype = new F();
  child.prototype.constructor = child;
  child.superproto = parent.prototype;
  return child;
}
```

相应的继承：

```js
function A() {}
A.prototype.x = 10;
 
function B() {}
inherit(B, A); // chaining prototypes
 
var b = new B();
alert(b.x); // 10, found in the A.prototype
```

这种包装有许多变体（在语法上），然而它们都是为了简化上面所说的过程。

例如，我们可以把中间构造器的声明提到外面来以便只执行一次：

```js
var inherit = (function(){
  function F() {}
  return function (child, parent) {
    F.prototype = parent.prototype;
    child.prototype = new F;
    child.prototype.constructor = child;
    child.superproto = parent.prototype;
    return child;
  };
})();
```

由于一个对象的原型是 `[[Prototype]]` 属性，这就意味着上面简化后 `F.prototype` 的重新使用不会影响到之前通过通过 `F` 继承的 child：

```js
function A() {}
A.prototype.x = 10;
 
function B() {}
inherit(B, A);
 
B.prototype.y = 20;
 
B.prototype.foo = function () {
  alert("B#foo");
};
 
var b = new B();
alert(b.x); // 10, is found in A.prototype
 
function C() {}
inherit(C, B);
 
// and using our "superproto" sugar
// we can call parent method with the same name
 
C.ptototype.foo = function () {
  C.superproto.foo.call(this);
  alert("C#foo");
};
 
var c = new C();
alert([c.x, c.y]); // 10, 20
 
c.foo(); // B#foo, C#foo
```

注意，ES5 标准化了这种优化原型链的函数，它是 `Object.create` 方法。

ES3 中这个方法的简化版可以通过如下方式实现：

```js
Object.create || Object.create = function(parent, properties) {
  function F() {}
  F.prototype = parent.prototype;
  var child = new F;
  for (var k in properties) {
    child[k] = properties[k];
  }
  return child;
};
 
//Usage:
 
var foo = {x: 10};
var bar = Object.create(foo, {y: 20});
console.log(bar.x, bar.y); // 10, 20
```

同样，所有现存的模拟“JS中类式继承”的各种变体也都是基于这个原则。当然现在我们看到，事实上它甚至不是一个“基于类的继承的模拟”，而是一种简单的原型链的重用。

## 总结

这一章很长，有不少细节。我希望这些材料能有助于理解相关的主题。任何问题欢迎在评论中讨论。

## 扩展阅读

- 4.2 — [Language Overview](http://bclary.com/2004/11/07/#a-4.2)
- 4.3 — [Definitions](http://bclary.com/2004/11/07/#a-4.3)
- 7.8.5 — [Regular Expression Literals](http://bclary.com/2004/11/07/#a-7.8.5)
- 8 — [Types](http://bclary.com/2004/11/07/#a-8)
- 9 — [Type Conversion](http://bclary.com/2004/11/07/#a-9)
- 11.1.4 — [Array Initialiser](http://bclary.com/2004/11/07/#a-11.1.4)
- 11.1.5 — [Object Initialiser](http://bclary.com/2004/11/07/#a-11.1.5)
- 11.2.2 — [The new Operator](http://bclary.com/2004/11/07/#a-11.2.2)
- 13.2.1 — [[[Call]]](http://bclary.com/2004/11/07/#a-13.2.1)
- 13.2.2 — [[[Construct]]](http://bclary.com/2004/11/07/#a-13.2.2)
- 15 — [Native ECMAScript Objects](http://bclary.com/2004/11/07/#a-15)

<p class="j-dot">**Translated by:** Dmitry Soshnikov with additions by Garrett Smith.
**Published on:** 2010-03-04

**Originally written by:** Dmitry Soshnikov [ru, [read »](http://dmitrysoshnikov.com/ecmascript/ru-chapter-7-2-oop-ecmascript-implementation/)]
**Originally published on:** 2009-09-12 [ru]</p>