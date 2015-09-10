title: 深入解析 ES6：解构赋值
tags:
  - ES6
categories:
  - JavaScript
date: 2015-06-28 17:36:05
updated: 2015-06-28 17:36:05
keywords:
---

## 什么是解构赋值？

解构赋值允许你使用类似数组或对象字面量的语法将数组和对象的属性值赋给一系列变量。这个语法非常简洁，而且比传统的属性访问更加清晰。

在不使用解构赋值的情况下，访问数组的前三项：

```javascript
var first = someArray[0];
var second = someArray[1];
var third = someArray[2];
```

使用解构赋值后，相应的代码变得更简洁和可读：

```javascript
var [first, second, third] = someArray;
```

SpiderMonkey（Firefox 的 JavaScript 引擎）已经支持解构赋值的大部分特性，但还不完全。

<!--more-->

## 数组和可迭代对象的解构赋值

上面我们已经看到了数组解构赋值的例子，该语法的一般形式是：

```javascript
[ variable1, variable2, ..., variableN ] = array;
```

这将把数组中对应的项依次赋给 `variable1` 到 `variableN`，如果同时需要声明变量，可以在解构表达式前面添加 `var`，`let` 或 `const` 关键字。


```javascript
var [ variable1, variable2, ..., variableN ] = array;
let [ variable1, variable2, ..., variableN ] = array;
const [ variable1, variable2, ..., variableN ] = array;
```

事实上，你还可以嵌套任意的深度：


```javascript
var [foo, [[bar], baz]] = [1, [[2], 3]];
console.log(foo);
// 1
console.log(bar);
// 2
console.log(baz);
// 3
```

此外，还可以跳过数组中的某些项：

```javascript
var [,,third] = ["foo", "bar", "baz"];
console.log(third);
// "baz"
```

你还可以用一个 Rest 表达式来捕获数组中的剩余项：


```javascript
var [head, ...tail] = [1, 2, 3, 4];
console.log(tail);
// [2, 3, 4]
```

如果数组越界或访问数组中不存在的项，将得到和通过数组索引访问一样的值：`undefined`。


```javascript
console.log([][0]);
// undefined

var [missing] = [];
console.log(missing);
// undefined
```

注意，数组解构赋值的方式也同样适用于可遍历的对象：

```javascript
function* fibs() {
  var a = 0;
  var b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

var [first, second, third, fourth, fifth, sixth] = fibs();
console.log(sixth);
// 5
```

## 对象的解构赋值

对象的解构赋值允许你将变量绑定到对象不同的属性值。指定被绑定的属性名，后面紧跟要绑定的变量：

```javascript
var robotA = { name: "Bender" };
var robotB = { name: "Flexo" };

var { name: nameA } = robotA;
var { name: nameB } = robotB;

console.log(nameA);
// "Bender"
console.log(nameB);
// "Flexo"
```

当绑定的属性名和接收属性值的变量名一样时，还有一个语法糖：

```javascript
var { foo, bar } = { foo: "lorem", bar: "ipsum" };
console.log(foo);
// "lorem"
console.log(bar);
// "ipsum"
```

与数组一样，也可以嵌套：


```javascript
var complicatedObj = {
  arrayProp: [
    "Zapp",
    { second: "Brannigan" }
  ]
};

var { arrayProp: [first, { second }] } = complicatedObj;

console.log(first);
// "Zapp"
console.log(second);
// "Brannigan"
```

解构一个不存在的属性时，将得到 `undefined`：

```javascript
var { missing } = {};
console.log(missing);
// undefined
```

使用对象的解构赋值时还有一个潜在的陷阱，在解构赋值时没有声明变量（没有 `var`、`let` 或 `const` 关键字）：

```javascript
{ blowUp } = { blowUp: 10 };
// Syntax error
```

这是因为 JavaScript 语法告诉引擎任何以 `{` 开始的语句都是语句块（例如，`{console}` 就是一个合法的语句块），解决方法是将整个语句用一对括号包裹：


```javascript
({ safe } = {});
// No errors
```

## 其他情况

当你尝试解构 `null` 或 `undefined`，你将得到类型错误：


```javascript
var {blowUp} = null;
// TypeError: null has no properties
```

不过，你可以对其他基本类型（Boolean、String 和 Number）进行解构，将得到 `undefined`：

```javascript
var {wtf} = NaN;
console.log(wtf);
// undefined
```

结果也许会让你感到意外，但深究一下，其实原因很简单。在进行对象解构赋值时，被解构的对象将被[强制转换](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-requireobjectcoercible)为 `Object`，除 `null` 和 `undefined` 外，其它类型都可以被强制转换为对象。进行数组的结构赋值时，要求被解构的对象有一个[遍历器](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-getiterator)。 

## 默认值

可以为不存在的属性指定一个默认值：

```javascript
var [missing = true] = [];
console.log(missing);
// true

var { message: msg = "Something went wrong" } = {};
console.log(msg);
// "Something went wrong"

var { x = 3 } = {};
console.log(x);
// 3
```

## 实际应用

### 函数参数

作为开发人员，我们经常把一个包含多个属性的对象作为函数的参数，来实现更灵活的 API，而不是让 API 的使用者记住一些特定顺序的参数。我们可以使用对象的解构赋值，来避免每次使用参数时的属性访问：


```javascript
function removeBreakpoint({ url, line, column }) {
  // ...
}
```


### 配置对象

完善上面的例子，我们可以为要被解构的对象属性提供默认值，这在对那些作为配置参数的对象非常实用，因为许多配置项都有一个合理的默认值。例如，jQuery 的 `ajax` 方法的第二个参数为一个配置对象，我们可以这样实现：

```javascript
jQuery.ajax = function (url, {
  async = true,
  beforeSend = noop,
  cache = true,
  complete = noop,
  crossDomain = false,
  global = true,
  // ... more config
}) {
  // ... do stuff
};
```

这避免了类似这样的重复代码：`var foo = config.foo || theDefaultFoo;`。


### 与迭代器一起使用

当遍历 Map 对象时，我们可以使用解构赋值来遍历 `[key, value]`：


```javascript
var map = new Map();
map.set(window, "the global");
map.set(document, "the document");

for (var [key, value] of map) {
  console.log(key + " is " + value);
}
// "[object Window] is the global"
// "[object HTMLDocument] is the document"
```

只遍历键：


```javascript
for (var [key] of map) {
  // ...
}
```


只遍历值：


```javascript
for (var [,value] of map) {
  // ...
}
```

### 返回多个值

返回一个数组，通过解构赋值提取到返回值：


```javascript
function returnMultipleValues() {
  return [1, 2];
}
var [foo, bar] = returnMultipleValues();
```

或者，返回一个键值对的对象：


```javascript
function returnMultipleValues() {
  return {
    foo: 1,
    bar: 2
  };
}
var { foo, bar } = returnMultipleValues();
```

这两者都比使用中间变量好：


```javascript
function returnMultipleValues() {
  return {
    foo: 1,
    bar: 2
  };
}
var temp = returnMultipleValues();
var foo = temp.foo;
var bar = temp.bar;
```

采用延续式：


```javascript
function returnMultipleValues(k) {
  k(1, 2);
}
returnMultipleValues((foo, bar) => ...);
```

### 导入 CommonJS 模块的指定部分

还没使用过 ES6 的模块吧，那至少使用过 CommonJS 吧。当导入一个 CommonJS 模块 X 时，模块提供的方法也许多余你实际使用的。使用解构赋值，你可以明确指定你需要使用模块的哪些部分：

```javascript
const { SourceMapConsumer, SourceNode } = require("source-map");
```

如果你使用 ES6 的模块机制，你可以看到 import 声明时有一个类似的语法。


## 结论

我们看到，解构赋值在很多场景下都很实用。在 Mozilla，我们已经有很多经验。Lars Hansen 在 10 年前就向 Opera 引入了解构赋值，Brendan Eich 在稍微晚点也给 Firefox 添加了支持，最早出现在 Firefox 2 中。因此，解构赋值已经渗透到我们每天对 JS 的使用中，悄悄地使我们的代码更简短、整洁。

几周之前，我说过 ES6 将改变我们的编码方式。这些简单地改进，可以在几分钟内就掌握使用，这些改进正是我们需要的。总的来说，它们最终将影响我们日常的每项工作，是一种革命式进化。

开发版的 Chrome 已经支持解构赋值，毋庸置疑，其他浏览器在不久将来也会陆续支持。如果现在你想使用该特性，你可以使用 [Babel](http://babeljs.io/) 或 [Traceur](https://github.com/google/traceur-compiler#what-is-traceur) 这两个编译器。

<p class="j-quote">参考原文：[ES6 In Depth: Destructuring](https://hacks.mozilla.org/2015/05/es6-in-depth-destructuring/)
原文作者：[Jason Orendorff](https://hacks.mozilla.org/author/jorendorffmozillacom/) 
原文日期：2015-05-28 16:12</p>