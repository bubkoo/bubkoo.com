title: 深入理解 JavaScript 中的 delete 操作符
date: 2014-01-23 16:26:07
updated: 2014-01-23 16:26:07
tags: [JavaScript,delete]
categories: []
keywords:
---
delete 操作符用于删除对象的属性。

似乎很多同学（包括我）对 delete 操作符都是似是而非，为什么有的属性可以被删除，有的却不能被删除？为什么能够删除对象的属性却不能删除变量或函数？在 eval 和 [严格模式](https://developer.mozilla.org/en-US/docs/JavaScript/Strict_mode)下，delete 操作符又有哪些特性？等等。。

本文将从基本概念到 ECMPScript 内部原理来学习 delete 操作符。

## 语法 ##

**表达式**

``` javascript
delete object.property    // 点操作符方式，常用方式
delete object['property'] // 字符串属性名方式
```

**参数**

- object - 对象名称，或者返回一个对象的表达式
- property - 将要删除的属性

**返回值**

delete 操作符返回 true 或 false。当被 delete 的对象的属性存在并且拥有 DontDelete (对象属性的一个内部属性，拥有该内部属性表明该属性不能被删除) 时返回 false（在[严格模式](https://developer.mozilla.org/en-US/docs/JavaScript/Strict_mode)下将抛出异常），否则返回 true。需要注意的是，对象属性不存在时也返回 true，*所以返回值并非完全等同于删除成功与否*。

![](http://bubkoo.qiniudn.com/delete-operator.jpg)

<!--more-->

## delete 删除了什么 ##

delete 操作符用来删除对象的属性，这里所说的属性实际上是属性本身，而不是属性指向的对象（对于引用类型来说）。所以，对于引用类型的值，delete 删除了对象属性的本身，不会删除属性指向的对象。 

``` javascript
var o = {};
o.x = new Object();
delete o.x;     // 上一行new的Object对象依然存在
o.x;            // undefined，o的名为x的属性被删除了
```

在实际的 JavaScrip t中，`delete o.x` 之后，Object 对象会由于失去了引用而被垃圾回收， 所以 `delete o.x` 也就“相当于”删除了 `o.x` 所指向的对象，但这个动作并不是 ECMAScript 标准，也就是说，即使某个实现完全不删除 Object 对象，也不算是违反 ECMAScript 标准。

下面代码说明了 delete 只删除属性本身，而不会删除属性所指的对象：

``` javascript
var o = {};
var a = { x: 10 };
o.a = a;
delete o.a;    // o.a属性被删除
o.a;           // undefined
a.x;           // 10, 因为{ x: 10 } 对象依然被 a 引用，所以不会被回收
```

虽然是一个小小的 delete 操作符，其行为却异常复杂。

为什么我们能删除一个对象的属性：

``` javascript
var x = { a: 1 };
delete x.a; // true
x.a; // undefined
```

但却不能删除一个变量：

``` javascript
var x = 1;
delete x; // false;
x; // 1
```

也不能删除一个函数：

``` javascript
function x() { };
delete x; // false;
typeof x; // "function"
```

要知道其中的原委，我们需要先了解一些基本概念。

## 代码类型 ##
在 ECMAScript 中，有 3 种不同类型的可执行代码：
1. 全局代码 (Global code) - 当一段源代码被看成程序 (Program) 时，它将会在全局作用域内执行，并且被认为是全局代码。在浏览器环境中，脚本元素的内容通常被解释为程序，因此被作为全局代码来执行。
2. 函数代码 (Function code) - 在一段函数中直接执行的代码就被认为是一段函数代码，在浏览器环境下，节点的事件属性（如 `<a onclick="..."`）通常都作为函数代码来解析和执行。
3. Eval代码 (Eval code) - 被内置函数 `eval` 执行的代码文本被解释成 Eval 代码

## 执行上下文 (Execution context) ##

代码的执行都是在特定的执行上下文中进行的，对于以上三种代码类型都有一个执行上下文与其对应。比如，当一个函数被执行时，程序控制就进入了函数代码执行上下文；当一段全局代码被执行时，程序控制就进入了全局代码执行上下文，等等。

执行上下文在逻辑上是一个栈（stack）。首先可能有一段全局代码，它拥有属于自己的执行上下文；在这段代码中可能调用一个函数，这个函数同样拥有属于自己的执行上下文；这个函数可能调用另一个函数，等等。即使当函数递归调用自己时，在每一步调用中仍然进入了不同的执行上下文。

执行上下文与作用域链和闭包等概念息息相关，欲深入了解执行上下文可以查阅作用域链和闭包的相关资料。

## 活动对象 (Activation object) / 变量对象 (Variable Object) ##
每个执行上下文都有一个与之相关联的**变量对象 (Variable object)**，在某个执行上下文中申明的变量和函数将被当着属性 (properties) 附加到这个变量对象上面。

当在全局代码的执行上下文时，全局对象 (Global object) 成为当前执行上下文的变量对象，在浏览器中就是 window 对象。因此，声明的全局函数和变量就成为全局对象的属性。

``` javascript
/* this 指代全局对象 */
var GLOBAL_OBJECT = this;

var foo = 1;
GLOBAL_OBJECT.foo; // 1
foo === GLOBAL_OBJECT.foo; // true

function bar(){}
typeof GLOBAL_OBJECT.bar; // "function"
GLOBAL_OBJECT.bar === bar; // true
```

局部变量（那些在函数代码中定义的变量）是怎么样的呢？当在函数代码的执行上下文时，**活动对象 (Activation object)** 成为当前执行上下文中的变量对象，在函数代码中申明的变量和函数成为活动对象的属性，并且函数的参数（形参名为属性名）和 Arguments 对象（arguments 为属性名）也将成为活动对象的属性。

注意，活动对象只是一个内部描述机制，在程序代码中不能直接访问。

``` javascript
(function(foo) {
    var bar = 2;
    function baz() {};
    /*
        抽象的过程

        'arguments' 对象成为所在函数的活化对象的属性：
        ACTIVATION_OBJECT.arguments = arguments;

        ...参数 'foo' 也是一样：
        ACTIVATION_OBJECT.foo; // 1

        ...变量 'bar' 也是一样：
        ACTIVATION_OBJECT.bar; // 2

        ...函数 'baz' 也是一样：
        typeof ACTIVATION_OBJECT.baz; // "function"
    */
})(1);
```

在 eval 代码中申明的变量会根据 eval 所在的执行上下文来确定变量将成为哪个变量对象的属性。例如：

在全局环境中执行 eval，那么变量将成为全局对象的属性：

``` javascript
var GLOBAL_OBJECT = this;
eval('var foo = 1');
GLOBAL_OBJECT.foo; // 1;
```

在函数作用域中执行 eval，变量将成为活动对象的属性：

``` javascript
var GLOBAL_OBJECT = this;

(function () {
    eval('var bar = 2;');

    /*
    抽象过程
    ACTIVATION_OBJECT.bar; // 1
    */
})();

// 全局环境下不能访问 bar
this.bar // undefined
```

## 属性的内部属性 ##
我们马上就接近本文主题了，从上面我们知道声明的变量成了变量对象（全局对象或活动对象）的属性，同时每个属性都可以拥有一个或多个内部属性：`ReadOnly`、`DontEnum`、`DontDelete` 和 `Internal`。这里我们关注的是 `DontDelete` 这个内部属性，拥有这个内部属性的变量表明该变量不能使用 delete 操作符删除。

**当被声明的变量和函数成为变量对象的属性时，这些属性在创建时就带上了 DontDelete 这个内部属性**。然而，**任何显式/隐式赋值的属性不生成 DontDelete**。这就是为什么我们能够删除一些属性，但有的却不能删除。

上面的分析可能不好理解，直接看下面的代码：

``` javascript
var GLOBAL_OBJECT = this;

/* 'foo' 是全局对象的一个属性，
    它通过变量声明而生成，因此拥有内部属性 DontDelete
    这就是为什么它不能被删除
*/
var foo = 1;
delete foo; // false
typeof foo; // "number"

/* 'bar' 是全局对象的一个属性，
    它通过变量声明而生成，因此拥有 DontDelete
    这就是为什么它同样不能被删除
*/
function bar() {};
delete bar; // false
typeof bar; // "function"

/* 'baz' 也是全局对象的一个属性，
    然而，它通过属性赋值而生成，因此没有DontDelete
    这就是为什么它可以被删除
*/
GLOBAL_OBJECT.baz = "baz";
delete GLOBAL_OBJECT.baz; // true
typeof GLOBAL_OBJECT.baz; // "undefined"
```

## 内置对象和DontDelete ##

所以，某些属性不能被删除的**根本原因在于：这些属性拥有内部属性 `DontDelete`**，该内部属性控制着该属性是否可以被删除。注意：内置对象的一些属性拥有内部属性 `DontDelete`，因此不能被删除； 特殊的 arguments 变量（活化对象的属性）拥有 `DontDelete`； 任何函数实例的 length (返回形参长度)属性也拥有 `DontDelete`： 

``` javascript
(function() {
    //不能删除'arguments'，因为有DontDelete
    delete arguments; // false;
    typeof arguments; // "object"

    //也不能删除函数的'length',因为有DontDelete
    function f() {};
    delete f.length; // false;
    typeof f.length; // "number"
}) ();
```

与函数 arguments 相关联的属性也拥有 DontDelete，同样不能被删除：

``` javascript
(function(foo, bar) {
    delete foo; // false
    foo; // 1

    delete bar; // false
    bar; // "bah"
}) (1, "bah");
```

## 未声明的变量赋值 ##
我们知道，直接给未声明的变量赋值会成为全局对象的属性，除非这一属性在作用域链内的其他地方被找到。而我们之前提到过，属性赋值和变量声明的区别：后者生成 `DontDelete` 而前者不生成，这也就是为什么未声明的变量赋值可以被删除。

``` javascript
var GLOBAL_OBJECT = this;

/* 通过变量声明生成全局对象的属性，拥有 DontDelete */
var foo = 1;

/* 通过未声明的变量赋值生成全局对象的属性，没有 DontDelete */
bar = 2;

delete foo; // false
delete bar; // true
```

注意：内部属性是在属性生成时确定的，之后的赋值过程不会改变已有的属性的内部属性。理解这点非常重要。

``` javascript
/* 'foo'创建的同时生成 DontDelete */
function foo() {};

/* 之后的赋值过程不改变已有属性的内部属性，DontDelete仍然存在 */
foo = 1;
delete foo; // false;
typeof foo; // "number"

/* 但赋值一个不存在的属性时，创建了一个没有内部属性的属性，因此没有 DontDelete */
this.bar = 1;
delete bar; // true;
typeof bar; // "undefined"
```

## 原型中声明的属性和对象自带的属性 ##
原型 prototype 中声明的属性和对象自带的属性(其实这些属性也是在原型 prototype 中的)可以认为是带有 DontDelete 特性的，无法被删除。例如：

``` javascript
//原型中声明的属性无法被删除

function C() { this.x = 42; }
C.prototype.x = 12;

var o = new C();
o.x;     // 42, 构造函数中定义的o.x

delete o.x;
o.x;     // 12,  prototype中定义的o.x，即使再次执行delete o.x也不会被删除

//对象自带的属性无法被删除

var re = /abc/i;
delete re.ignoreCase;
re.ignoreCase; // true, ignoreCase无法删除
```

## Eval 和 Firebug 控制台 ##
**在 console 中的所有文本都会被当做 eval 代码来解析和执行，而不是全局或函数代码。**我之前说过，eval 在处理变量声明时有一个特殊的行为：**在 eval 中声明的变量事实上没有 DontDelete 属性**。所以，下面声明的所有变量最后都没有 DontDelete 这个内部属性，所以它们都能被删除。所以要小心普通的全局代码和 Firebug 控制台中代码的区别。

``` javascript
eval('var foo = 1;');
foo; // 1
delete foo; // true
typeof foo; // "undefined"
```

在函数代码中也是一样：

``` javascript
(function() {
    eval('var foo = 1;');
    foo; // 1
    delete foo; // true
    typeof foo; // "undefined"
}) ();
```

但是这也有一点**例外**，在 eval 代码中的函数内部通过 `var` 定义的变量具有 DontDelete，不能被删除。

``` javascript
eval("(function() { var x = 42; delete x; return x; })();");
// 返回 42
```



## 浏览器兼容性 ##
了解事物的工作原理是重要的，但实际的实现情况更重要。浏览器在创建和删除变量/属性时都遵守这些标准吗？ 对于大部分来说，是的。

这里有一个[简单的测试集](http://kangax.github.com/jstests/delete_compliance_test/)来检查全局代码、函数代码和 Eval 代码的遵守情况。 测试单元同时检测了 delete 操作的返回值和属性是否像预期那样被删除。delete 的返回值并不像它的实际结果那样重要，delete 操作返回 true 或 false 并不重要， 重要的是拥有/没有 DontDelete 的属性是否被删除。

现代浏览器总的来说还是遵守删除规则的，以下浏览器全部通过测试： Opera 7.54+，Firefox 1.0+，Safari 3.1.2+，Chrome 4+。

Safari 2.x 和 3.0.4 在删除函数 arguments 时存在问题，似乎这些属性在创建时不带 DontDelete，因此可以被删除。Safari 2.x 还有其他问题——删除无引用时（例如 delete 1）抛出错误（译者按：IE 同样有）；函数声明生成了可删除的属性（奇怪的是变量声明则正常）；eval 中的变量声明变成不可删除（而 eval 中的函数声明则正常）。

与 Safari 类似，Konqueror（3.5，而非4.3）在 delete 无引用和删除 arguments 是也存在同样问题。

**Gecko DontDelete bug**
Gecko 1.8.x 浏览器—— Firefox 2.x, Camino 1.x, Seamonkey 1.x, etc. ——存在一个有趣的 bug：显式赋值值给一个属性能移除它的 DontDelete，即使该属性通过变量或函数声明而生成。

``` javascript
function foo() { };
delete foo; // false;
typeof foo; // "function"

this.foo = 1;
delete foo; // true
typeof foo; // "undefined"
```

令人惊讶的是，IE5.5-8 也通过了绝大部分测试，除了删除非引用抛出错误（e.g. delete 1，就像旧的 Safari）。 但是，虽然不能马上发现，事实上 IE 存在更严重的 bug，这些 bug 是关于全局对象。

## IE bugs ##
在 IE 中（至少在 IE6-8 中），下面的表达式抛出异常（在全局代码中）：

``` javascript
this.x = 1;
delete x; // TypeError: Object doesn't support this action
```

下面则是另一个：

``` javascript
var x =1;
delete this.x; // TypeError: Cannot delete 'this.x'
// 译者按：在IE8下抛出此异常，在IE6,7下抛出的是和上面一样的异常
```

这似乎说明，在 IE 中在**全局代码中的变量声明并没有生成全局对象的同名属性**。 通过赋值创建的属性（this.x = 1）然后通过 delete x 删除时抛出异常； 通过变量声明（var x = 1）创建的属性然后通过 delete this.x 删除时抛出另一个（译者按：在 IE6,7 下错误信息与上面的相同）。

但不只是这样，事实上通过显式赋值创建的属性**在删除时总是抛出异常**。 这不只是一个错误，而是创建的属性看上去拥有了 DontDelete 内部属性，而按规则应该是没有的：

``` javascript
this.x = 1;
delete this.x; // TypeError: Object doesn't support this action
delete x; // TypeError: Object doesn't support this action
```

另一方面，未声明的变量赋值（那些同样生成全局对象的属性）又确实在IE下能够正常删除：

``` javascript
x = 1;
delete x; // true
```

但如果你试图通过 this 关键字来进行删除（delete this.x），那么上面的异常又将抛出：

``` javascript
x = 1;
delete this.x; //TypeError: Cannot delete 'this.x'
```

如果归纳一下，我们将发现在全局代码中 `delete this.x` 永远不会成功。当通过显式赋值来生成属性（this.x = 1）时抛出一个异常； 当通过声明/非声明变量的方式（var x = 1 or x = 1）生成属性时抛出另一个异常。而另一方面，delete x 只有在显示赋值生成属性(this.x = 1)时才抛出异常。

## 宿主对象(Host Object) ##

小小总结一下 delete 操作符：
1. 如果操作数不是引用类型，则返回 `true`
2. 如果对象没有同名的**直接属性**，返回 `true` （对象可以是活动对象或全局对象）
3. 如果属性存在但是有 DontDelete 特性, 返回 `false`
4. 其它情况，删除属性并且返回 `true`

然而，**对于宿主对象（host object）的 delete 操作的行为却可能是不可预料的**。

我们已经看到了在IE中的一些问题：当删除某些对象（那些实现为了宿主对象）属性时抛出异常。 一些版本的 firefox 当试图删除 window.location 时抛出异常（译者按：IE 同样抛出）。 同样，在一些宿主对象中你也不能相信 delete 的返回值， 例如下面发生在 firefox 中的(译者按：chrome 中同样结果；IE 中抛出异常；opera 和 safari 允许删除，并且删除后无法调用，姑且算’正常‘，尽管，从下面的讨论来看似乎却是不正常的，它们事实上删除了不能删除的属性，而前面的浏览器没有)：

``` javascript
/* 'alert'是’window‘的一个直接属性（如果我们能够相信'hasOwnProperty'） */
window.hasOwnProperty('alert'); // true

delete window.alert; // true
typeof window.alert; // "function"
```

`delete window.alert` 返回 `true`，尽管这个属性没有任何条件可能产生这个结果（按照上面的算法）：它解析为一个引用，因此不能在第一步返回 `true`；它是 window 对象的直接属性，因此不能在第二步返回 true；唯一能返回 true 的是当算法达到最后一步同时确实删除这个属性，而事实上它并没有被删除。（译者按：不，在 opera 和 safari 中确实被删除了...）。

所以这个故事告诉我们永远不要相信宿主对象。


## ES5 严格模式 ##
在 ES5 严格模式下，当删除操作指向一个变量/函数参数/函数声明的直接引用时抛出 SyntaxError。 此外，如果属性拥有内部属性 [[Configurable]] == false，将抛出 TypeError：

``` javascript
(function(foo) {
    "use strict"; //在函数中开启严格模式

    var bar;
    function baz;
    delete foo; // SyntaxError，当删除函数参数时
    delete bar; // SyntaxError，当删除变量时
    delete baz; // SyntaxError，当删除由函数声明创建的变量时

    /* function实例的length拥有[[Configurable]] : false */
    delete (function() {}).length; // TypeError
}) ();
```

而且，在严格模式下，删除未声明的变量（换句话说，未解析的引用），同样抛出 SyntaxError；同时，在严格模式下未声明的赋值也将抛出异常 ReferenceError：

``` javascript
"use strict";
delete i_dont_exist; // SyntaxError

i_dont_exist_either = 1; // ReferenceError
```

看了之前给出的变量、函数声明和参数的例子，相信现在你也理解了，所有这些限制都是有其意义的。严格模式采取了更积极的和描述性的措施，而不只是忽略这些问题。

## 总结 ##
下面是对于 JavaScript 中 delete 操作是如何工作的简短的总结：
- 变量和函数声明都是活化对象(Activation Object) 或全局对象(Global Object)的属性
- 属性拥有内部属性，其中 DontDelete 这个内部属性负责确定一个属性是否能够被删除
- 在**全局或者函数代码**中的变量和函数声明总是创建**带有 DontDelete 特性**的属性
- **函数参数**总是活动对象的属性, 并且**带有 DontDelete**
- 在 **Eval 代码**中声明的变量和函数总是创建**不带 DontDelete 特性** 的属性
- **新的未声明的属性**在生成时带空的内部属性，因此也**不带 DontDelete 特性**
- 永远不要相信**宿主对象**对 delete 操作做出的反应

如果你想要对这里所描述的东西更加熟悉的话，请参阅 [ECMA-262 3rd edition specification](http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf)。

## 参考资源 ##
- [MDN > Web technology for developers > JavaScript > JavaScript reference > Operators > delete](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FOperators%2Fdelete#section_5)
- [Perfection Kills: Understanding delete](http://perfectionkills.com/understanding-delete/)
- [理解delete](http://www.ituring.com.cn/article/7620)
- [Javascript的变量与delete操作符](http://blog.charlee.li/javascript-variables-and-delete-operator/)
- [Javascript中的delete操作符](http://www.css88.com/archives/5137)