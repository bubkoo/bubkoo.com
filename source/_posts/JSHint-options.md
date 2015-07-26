title: JSHint 选项列表
tags: [JSHint, Tools]
categories: [前端工具]
date: 2014-02-22 00:22:44
keywords:
---
![JSHint](http://bubkoo.qiniudn.com/jshint-dark.png)

有时候会查找 [JSHint](http://jshint.com/) 某些选项的具体含义，针对项目需求开启或关闭某些选项，所以从[这里](https://github.com/basecss/jshint-doc-cn)转载了 JSHint 选项列表的中文翻译，供不时之需。

这是 JSHint 所有配置选项的完整列表。如果发现遗漏了某些信息，你可以给作者提[ issues](https://github.com/jshint/jshint/issues/new) 或者[发邮件](https://github.com/basecss/jshint-doc-cn/blob/master/anton@kovalyov.net)。

<!--more-->

<style>table thead tr th:first-child{width:100px;}</style>

## Enforcing 选项

当下列选项设置为 `true` 时，JSHint 会基于这些选项对代码产生更多的警告信息。

### bitwise

这个选项禁止在 JavaScript 中使用位运算符，如 `^` (XOR)，`|` (OR)。在 JavaScript 中位运算很少见，`&` 与 `&&` 经常容易混淆，大多数情况下应该使用 `&&`。

### camelcase

这个选项允许代码块中的变量名用驼峰式或者用下划线连接的全大写。

### curly

这个选项要求在循环和条件判断的代码块中总是使用大括号包围，即使是单行代码，否则极易引起错误：

JavaScript 允许在单行语句的情况下不使用大括号，如下例所示：

```js
while(day) 
  shuffle();
```

然而，在某些情况容易导致bug，比如：

```js
while (day)
  shuffle();
  sleep();
```

### eqeqeq

这个选项禁止使用 `==` 和 `!=`，而是 `===` 和 `!==`。前者会在比较之前强制类型转换，这样会导致一些无法预期的结果；而后者不会，所以更安全。如果想了解更多关 JavaScript 强制类型，请参考 [Truth, Equality and JavaScript by Angus Croll](http://javascriptweblog.wordpress.com/2011/02/07/truth-equality-and-javascript/)。

### es3

这个选项指当前代码严格最受 ECMAScript 3 规范，一般当 JavaScript 程序需要在 IE6、IE7、IE8 或者其它遗留的 JavaScript 运行环境中工作时需要用到这个选项。

### forin

这个选项要求所有的 `for...in` 循环过滤对象的 items。`for...in` 语句允许依据对象的所有属性名称进行循环，包括从原型链中集成来的属性，这个行为可以导致一些在代码中没有期望的属性出现，所以一般在使用`for...in` 的时候需过滤掉继承的属性。如下例：

```js
for (key in obj) {
  if (obj.hasOwnProperty(key)) {
    // We are sure that obj[key] belongs to the object and was not inherited.
  }
}
```
想深入了解 `for...in` 循环，请参见 [Exploring JavaScript for-in loops by Angus Croll](http://javascriptweblog.wordpress.com/2011/01/04/exploring-javascript-for-in-loops/)。

### immed

这个选项禁止使用没有括号的调用函数的方法。函数加括号意味着这段代码是执行方法的返回结果，而非方法本身，减少一些阅读的困惑。

### indent

强制代码使用特定的 tab 宽度，例如下面代码会报 indent 警告信息。


```js
/*jshint indent:4 */

if (cond) {
  doSomething(); // We used only two spaces for indentation here
}
```

### latedef

latedef 选项是关于变量的声明与使用的先后顺序，它禁止变量没有定义就使用。JavaScript 只有函数作用域，另外，JavaScript 解析时所有的变量都回被搬到或者提升到函数的最顶端，这种行为会导致一些很怪异的 Bug，所以在变量定义后在使用总是安全的。

将 latedef 的选项值设为 `”nofunc”` 允许忽略函数的声明。深入研究，请参见 [JavaScript Scoping and Hoisting by Ben Cherry](http://www.adequatelygood.com/JavaScript-Scoping-and-Hoisting.html)。

### newcap

要求将构造函数的名字大写，这只是一种惯例，标志这些函数将会用 `new` 操作符构建对象，用以区分其它的函数类型，避免一些错误。不这么做也没什么问题，但是会对代码的理解增加一些难度，同时如果本来应该用 `new` 构建但却没有 `new`，可能会使得变量指向全局对象而不是一个 `new` 的对象。

### noarg

禁止在 JavaScript 代码中使用 `arguments.caller and arguments.callee`。这些调用阻止了 JavaScript 一批量的优化措施变，在新版本的规法中已经将它门定义为过时，实际上 ECMAScript 5 已经禁止在严格模式下使用这两种方式。

### noempty

当发现代码有空的代码块是会发出警告信息。

### nonew

禁止使用构造函数，因为它会带来一些不必要的副作用。一些程序员喜欢调用构造函数，但并不将它的结果赋予任何变量。`new MyConstructor()`。

这种方式没有与简单的 `MyConstructor()` 相比没有什么优势，因为用 `new` 操作符创建的对象没有被任何地方使用。

### plusplus ++

禁止使用一元递增和递减的操作符，有些人认为 `++` 和 `-–` 会降低代码风格的质量，也有人认为使用 `++` 和 `-–` 有性能上的优化。

### quotmark

强制项目代码的引用保持一致，它介绍三个值，`true`, `single` 和 `double`。`true` 指不想引入任何一种具体的引号风格，但想保持一致。`single` 指单引号，`double` 指只允许双引号。

### undef

禁止使用显示的未声明的变量，这个选项在寻找泄露以及输入错误的变量时很有用。

```js
/*jshint undef:true */
function test() {
  var myVar = 'Hello, World';
  console.log(myvar); // Oops, typoed here. JSHint with undef will complain
}
```

如果所使用的变量在另一个文件中定义，可以使用 `/global … / directive` 来声明。

### unused

发现定义了但为被使用的变量时报警告信息。当要进行代码清理的时候特别有用，常与 `undef` 一起使用。

```js
/*jshint unused:true */

function test(a, b) {
  var c, d = 2;

  return a + d;
}

test(1, 2);

// Line 3: 'b' was defined but never used.
// Line 4: 'c' was defined but never used.
```

另外，它也可以警告关于没有用到的全局变量。它的值可以设为 ”vars”，只检查变量，不包括函数参数或者严格的只检查变量和参数。缺省位 `true`，允许未使用的参数后面跟一个使用过的参数。

### strict

要求所有函数遵循 ECMAScript 5 的严格模式。严格模式消除了一些 JavaScript 易混淆的痛点，修复了一些阻碍 JavaScript 引擎进行优化的错误。严格模式只在函数作用域生效，禁止全局范围的严格模式，因为会破坏第三方依赖的代码，如果一定要使用，请参见 globalstrict 选项。

### trailing

当发现代码的尾部有空行会报错。尾部有空格会导致一些怪异的 Bug，尤其是在多行字符串的情况下。

```js
// This otherwise perfectly valid string will error if
// there is a whitespace after \
var str = "Hello \
World";
```

### maxparams

可以设置一个函数最多允许的参数个数。

```js
/*jshint maxparams:3 */

function login(request, onSuccess) {
  // ...
}

// JSHint: Too many parameters per function (4).
function logout(request, isManual, whereAmI, onSuccess) {
  // ...
}
```

### maxdepth

允许控制代码的嵌套层次。

```js
/*jshint maxdepth:2 */

function main(meaning) {
  var day = true;

  if (meaning === 42) {
    while (day) {
      shuffle();

      if (tired) { // JSHint: Blocks are nested too deeply (3).
          sleep();
      }
    }
  }
}
```

### maxstatements

设置一个函数最多允许的有效代码行数。

```js
/*jshint maxstatements:4 */

function main() {
  var i = 0;
  var j = 0;

  // Function declarations count as one statement. Their bodies
  // don't get taken into account for the outer function.
  function inner() {
    var i2 = 1;
    var j2 = 1;

    return i2 + j2;
  }

  j = i + j;
  return j; // JSHint: Too many statements per function. (5)
}
```

### maxcomplexity

允许控制代码的圈复杂度。圈复杂度测量代码中独立路径的数量，请参见 [cyclomatic complexity on Wikipedia](http://en.wikipedia.org/wiki/Cyclomatic_complexity)。

### maxlen

设置一行的最大长度。

## Relaxing 选项

当下面这些选项设为 `true`，将会减少警告信息的产生。

### asi

asi选项针对 JavaScript 代码的分号问题，有很多人认为应该严格的在行尾添加分号，更多信息请参见 [An Open Letter to JavaScript Leaders Regarding Semicolons by Isaac Schlueter](http://blog.izs.me/post/2353458699/an-open-letter-to-javascript-leaders-regarding) 和 [JavaScript Semicolon Insertion](http://inimino.org/~inimino/blog/javascript_semicolons)。

### boss

经常在代码中会出先应该是用条件判断的地方出现了赋值语句，boss 选项设为 `true` 会隐藏这些错误信息。

### eqnull

eqnull 与 `null` 比较相关，如果设为 `true`，在看到 `==null` 操作时不会报错。

### esnext

要求代码使用 ECMAScript 6 规范语法。注意这个 feature 还没有最后确定并且不是所有的浏览器都实现。 [Draft Specification for ES.next (ECMA-262 Ed. 6)](http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts)

### evil

隐藏 `eval` 使用的警告。`eval` 的使用使得代码有了被攻击的缺陷，并且阻碍了 JavaScript 解析器的一些优化措施。

### expr

隐藏了关于 expressions 异常使用的代码，通常期待赋值或者函数定义而出现的 expression 往往是一种错误，但规范中并没有禁止此种使用方式，所以对这种代码只是警告信息。

### funcscope

关于变量的作用域问题，有些变量在控制结构内声明，然而在之外企图访问。尽管 JavaScript 只有两种作用域，函数作用域与全局作用域，然而这种跨作用域的使用方式会对 JavaScript 的初学者造成困惑，并很难调试，缺省 JSHint 会对这种使用提示警告信息。

```js
function test() {
  if (true) {
    var x = 0;
  }

  x += 1; // Default: 'x' used out of scope.
            // No warning when funcscope:true
}
```

### globalstrict

隐藏了全局作用域使用严格模式的警告信息，它可能会到第三方代码的功能破化，所以不推荐使用，参见 strict 选项。

### iterator

隐藏了 `iterator` 属性的警告信息，并不是所有浏览器都支持，所以使用要首先确认支持的浏览器。

### lastsemic

只针对在只有一行的代码块的最后一行，如果缺失分号缺省会报警告信息；如果 lastsemic 设为 `true`，即隐藏了这类的警告信息。

```js
var name = (function() { return 'Anton' }());
```

### laxbreak

隐藏了可能不安全的换行代码。对于以逗号分隔的代码参见 laxcomma。

### laxcomma

针对逗号开头的代码风格。

```js
var obj = {
    name: 'Anton'
  , handle: 'valueof'
  , role: 'SW Engineer'
};
```

### loopfunc

针对循环内定义 function 的代码块。

```js
var nums = [];

for (var i = 0; i < 10; i++) {
  nums[i] = function (j) {
    return i + j;
  };
}
nums[0](2); // Prints 12 instead of 2
```

使用闭包可解决以上问题，此时 `nums[i]` 的 `i` 是 for 循环 `i` 的一个复本。

```js
var nums = [];

for (var i = 0; i < 10; i++) {
  (function (i) {
    nums[i] = function (j) {
        return i + j;
    };
  }(i));
}
```

### moz

声明代码使用mozilla JavaScript 扩展。

### multistr

关于多行字符串的。多行字符串是很危险的，如果不小心在转义符或者换行符之间插入了一个空格，那么代码就被破坏了。

```js
/*jshint multistr:true */

var text = "Hello\
World"; // All good.

text = "Hello
World"; // Warning, no escape character.

text = "Hello\
World"; // Warning, there is a space after \
```

### proto

关于 proto 属性。

### scripturl

关于 script-trageted URLS，诸如 javascript: …

### smarttabs

隐藏当空格用来对齐，tab 和空格混用的代码。

### shadow

指在不同作用域重复定义变量，特指在外层作用域已经定义了，在小作用域内定义会 shadow 外层的变量。

### sub

提示需要用 `.` 访问属性而不是 `[]`，例如 `person[‘name’]` 和 `person.name`。

### supernew

隐藏关于一些器官的构造方式，诸如 `new function(){…}` 和 `new Object`。这些代码块在一些场合下用来创建单例对象。

```js
var singleton = new function() {
  var privateVar;

  this.publicMethod  = function () {}
  this.publicMethod2 = function () {}
};
```

### validthis

只在函数作用域内生效，隐藏了违反严格模式使用标准的代码，或则在非构造函数中使用 `this`。

## Environments

下列选项是关于一些预定以的全局变量。

- browser
- couch
- devel
- dojo
- jquery
- mootools
- node
- nonstandard
- phantom
- prototypejs
- rhino
- worker
- wsh
- yui