title: JavaScript 规范（ES6）
tags: [Guide]
categories: [JavaScript]
date: 2015-04-05 20:26:37
keywords:
---

Airbnb 的 [ES5 规范](https://github.com/airbnb/javascript/blob/master/README.md)写的非常好，现在添加了 ES6 的部分。

另外[阮一峰老师](http://www.ruanyifeng.com/)的 [ECMAScript 6 入门](http://es6.ruanyifeng.com/)值得参考。

<!--more-->

## 类型

- 原始类型：值传递

  - `string`
  - `number`
  - `boolean`
  - `null`
  - `undefined`

```js
	const foo = 1;
	let bar = foo;

	bar = 9;

	console.log(foo, bar); // => 1, 9
```

- 复杂类型：引用传递
 
  - `object`
  - `array`
  - `function` 

```js
const foo = [1, 2];
const bar = foo;

bar[0] = 9;

console.log(foo[0], bar[0]); // => 9, 9
```

## 引用

- 为引用使用 `const` 关键字，而不是 `var`
  
  > 这样确保你不能修改引用类型，否则可能会导致一些 bug 或难以理解的代码。 

```js
  // bad
  var a = 1;
  var b = 2;

  // good
  const a = 1;
  const b = 2;
```

- 如果你必须修改引用，使用 `let` 代替 `var`

  > 因为 `let` 是块作用域的，而 `var` 是函数作用域。

```js
  // bad
  var count = 1;
  if (true) {
    count += 1;
  }

  // good, use the let.
  let count = 1;
  if (true) {
    count += 1;
  }
```

- `let` 和 `const` 都是块作用域的

```js
// const and let only exist in the blocks they are defined in.
{
  let a = 1;
  const b = 1;
}
console.log(a); // ReferenceError
console.log(b); // ReferenceError
```

## 对象

- 使用对象字面量创建对象

```js
// bad
var item = new Object();

// good
var item = {};
```
- 不要使用[保留字（reserved words）](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Reserved_Words)作为键，否则在 IE8 下将出错，[issue](https://github.com/airbnb/javascript/issues/61)

```js
// bad
var superman = {
  class: 'superhero',
  default: { clark: 'kent' },
  private: true
};

// good
var superman = {
  klass: 'superhero',
  defaults: { clark: 'kent' },
  hidden: true
};
```

- 使用易读的同义词代替保留字

```js
// bad
const superman = {
  class: 'alien'
};

// bad
const superman = {
  klass: 'alien'
};

// good
const superman = {
  type: 'alien'
};
```

- 创建对象时使用计算的属性名，而不要在创建对象后使用对象的动态特性

  > 这样可以在同一个位置定义对象的所有属性。
  
```js
function getKey(k) {
    return `a key named ${k}`;
  }

  // bad
  const obj = {
    id: 5,
    name: 'San Francisco'
  };
  obj[getKey('enabled')] = true;

  // good
  const obj = {
    id: 5,
    name: 'San Francisco',
    [getKey('enabled')]: true
  };
```

- 使用定义对象方法的简短形式


```js
// bad
const atom = {
  value: 1,

  addValue: function (value) {
    return atom.value + value;
  }
};

// good
const atom = {
  value: 1,

  addValue(value) {
    return atom.value + value;
  }
};
```

- 使用定义对象属性的简短形式

  > 书写起来更加简单，并且可以自描述。

```js
const lukeSkywalker = 'Luke Skywalker';

  // bad
  const obj = {
    lukeSkywalker: lukeSkywalker
  };

  // good
  const obj = {
    lukeSkywalker
  };
```

- 将所有简写的属性写在对象定义的最顶部

  > 这样可以更加方便地知道哪些属性使用了简短形式。

```js
const anakinSkywalker = 'Anakin Skywalker';
  const lukeSkywalker = 'Luke Skywalker';

  // bad
  const obj = {
    episodeOne: 1,
    twoJedisWalkIntoACantina: 2,
    lukeSkywalker,
    episodeThree: 3,
    mayTheFourth: 4,
    anakinSkywalker
  };

  // good
  const obj = {
    lukeSkywalker,
    anakinSkywalker,
    episodeOne: 1,
    twoJedisWalkIntoACantina: 2,
    episodeThree: 3,
    mayTheFourth: 4
  };
```

## 数组

- 使用字面量语法创建数组


```js
// bad
const items = new Array();

// good
const items = [];
```

- 如果你不知道数组的长度，使用 `push`

```js
const someStack = [];


// bad
someStack[someStack.length] = 'abracadabra';

// good
someStack.push('abracadabra');
```

- 使用 `...` 来拷贝数组

```js
// bad
const len = items.length;
const itemsCopy = [];
let i;

for (i = 0; i < len; i++) {
  itemsCopy[i] = items[i];
}

// good
const itemsCopy = [...items];
```

- 使用 `Array.from` 将类数组对象转换为数组

```js
const foo = document.querySelectorAll('.foo');
const nodes = Array.from(foo);
```

## 解构 Destructuring

- 访问或使用对象的多个属性时请使用对象的解构赋值

  > 解构赋值避免了为这些属性创建临时变量或对象。
  
```js
  // bad
  function getFullName(user) {
    const firstName = user.firstName;
    const lastName = user.lastName;

    return `${firstName} ${lastName}`;
  }

  // good
  function getFullName(obj) {
    const { firstName, lastName } = obj;
    return `${firstName} ${lastName}`;
  }

  // best
  function getFullName({ firstName, lastName }) {
    return `${firstName} ${lastName}`;
  }
```

- 使用数组解构赋值


```js
const arr = [1, 2, 3, 4];

// bad
const first = arr[0];
const second = arr[1];

// good
const [first, second] = arr;
```

- 函数有多个返回值时使用对象解构，而不是数组解构

  > 这样你就可以随时添加新的返回值或任意改变返回值的顺序，而不会导致调用失败。

```js
function processInput(input) {
    // then a miracle occurs
    return [left, right, top, bottom];
  }

  // the caller needs to think about the order of return data
  const [left, __, top] = processInput(input);

  // good
  function processInput(input) {
    // then a miracle occurs
    return { left, right, top, bottom };
  }

  // the caller selects only the data they need
  const { left, right } = processInput(input);
```

## 字符串

- 使用单引号 `''`


```js
// bad
var name = "Bob Parr";

// good
var name = 'Bob Parr';

// bad
var fullName = "Bob " + this.lastName;

// good
var fullName = 'Bob ' + this.lastName;
```

- 超过80个字符的字符串应该使用字符串连接换行
- 注：如果过度使用长字符串连接可能会对性能有影响。[jsPerf](http://jsperf.com/ya-string-concat) & [Discussion](https://github.com/airbnb/javascript/issues/40)

```js
// bad
var errorMessage = 'This is a super long error that was thrown because of Batman. When you stop to think about how Batman had anything to do with this, you would get nowhere fast.';

// bad
var errorMessage = 'This is a super long error that \
was thrown because of Batman. \
When you stop to think about \
how Batman had anything to do \
with this, you would get nowhere \
fast.';


// good
var errorMessage = 'This is a super long error that ' +
  'was thrown because of Batman.' +
  'When you stop to think about ' +
  'how Batman had anything to do ' +
  'with this, you would get nowhere ' +
  'fast.';
```

- 编程构建字符串时，使用字符串模板而不是字符串连接

  > 模板给你一个可读的字符串，简洁的语法与适当的换行和字符串插值特性。

```js
  // bad
  function sayHi(name) {
    return 'How are you, ' + name + '?';
  }

  // bad
  function sayHi(name) {
    return ['How are you, ', name, '?'].join();
  }

  // good
  function sayHi(name) {
    return `How are you, ${name}?`;
  }
```

## 函数

- 使用函数声明而不是函数表达式

  > 函数声明拥有函数名，在调用栈中更加容易识别。并且，函数声明会整体提升，而函数表达式只会提升变量本身。这条规则也可以这样描述，始终使用[箭头函数](https://github.com/airbnb/javascript/tree/es6?utm_source=javascriptweekly&utm_medium=email#arrow-functions)来代替函数表达式。

```js
  // bad
  const foo = function () {
  };

  // good
  function foo() {
  }
```

- 函数表达式

```js
// immediately-invoked function expression (IIFE)
(() => {
  console.log('Welcome to the Internet. Please follow me.');
})();
```

- 绝对不要在一个非函数块（if，while，等等）里声明一个函数，把那个函数赋给一个变量。浏览器允许你这么做，但是它们解析不同
- 注：ECMA-262 把 `块` 定义为一组语句，函数声明不是一个语句。阅读 [ECMA-262](http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf#page=97) 对这个问题的说明

```js
// bad
if (currentUser) {
  function test() {
    console.log('Nope.');
  }
}

// good
if (currentUser) {
  var test = function test() {
    console.log('Yup.');
  };
}
```

- 绝对不要把参数命名为 `arguments`, 这将会覆盖函数作用域内传过来的 `arguments` 对象

```js
// bad
function nope(name, options, arguments) {
  // ...stuff...
}

// good
function yup(name, options, args) {
  // ...stuff...
}
```

- 永远不要使用 `arguments`，使用 `...` 操作符来代替

  > `...` 操作符可以明确指定你需要哪些参数，并且得到的是一个真实的数组，而不是 `arguments` 这样的类数组对象。

```js
  // bad
  function concatenateAll() {
    const args = Array.prototype.slice.call(arguments);
    return args.join('');
  }

  // good
  function concatenateAll(...args) {
    return args.join('');
  }
```

- 使用函数参数默认值语法，而不是修改函数的实参

```js
// really bad
function handleThings(opts) {
  // No! We shouldn't mutate function arguments.
  // Double bad: if opts is falsy it'll be set to an object which may
  // be what you want but it can introduce subtle bugs.
  opts = opts || {};
  // ...
}

// still bad
function handleThings(opts) {
  if (opts === void 0) {
    opts = {};
  }
  // ...
}

// good
function handleThings(opts = {}) {
  // ...
}
```

## 箭头函数 Arrow Functions

- 当必须使用函数表达式时（例如传递一个匿名函数时），请使用箭头函数

  > 箭头函数提供了更简洁的语法，并且箭头函数中 `this` 对象的指向是不变的，`this` 对象绑定定义时所在的对象，这通常是我们想要的。如果该函数的逻辑非常复杂，请将该函数提取为一个函数声明。
 
```js
  // bad
  [1, 2, 3].map(function (x) {
    return x * x;
  });

  // good
  [1, 2, 3].map((x) => {
    return x * x
  });
```

- 总是用括号包裹参数，省略括号只适用于单个参数，并且还降低了程序的可读性

```javascript
// bad
  [1, 2, 3].map(x => x * x);

  // good
  [1, 2, 3].map((x) => x * x);
```

## 构造函数

- 总是使用 `class` 关键字，避免直接修改 `prototype`

  > `class` 语法更简洁，也更易理解。
  
```javascript
  // bad
  function Queue(contents = []) {
    this._queue = [...contents];
  }
  Queue.prototype.pop = function() {
    const value = this._queue[0];
    this._queue.splice(0, 1);
    return value;
  }


  // good
  class Queue {
    constructor(contents = []) {
      this._queue = [...contents];
    }
    pop() {
      const value = this._queue[0];
      this._queue.splice(0, 1);
      return value;
    }
  }
```

- 使用 `extends` 关键字来继承

  > 这是一个内置的继承方式，并且不会破坏 `instanceof` 原型检查。


```javascript
// bad
  const inherits = require('inherits');
  function PeekableQueue(contents) {
    Queue.apply(this, contents);
  }
  inherits(PeekableQueue, Queue);
  PeekableQueue.prototype.peek = function() {
    return this._queue[0];
  }

  // good
  class PeekableQueue extends Queue {
    peek() {
      return this._queue[0];
    }
  }
```

- 在方法中返回 `this` 以方便链式调用

```javascript
// bad
Jedi.prototype.jump = function() {
  this.jumping = true;
  return true;
};

Jedi.prototype.setHeight = function(height) {
  this.height = height;
};

const luke = new Jedi();
luke.jump(); // => true
luke.setHeight(20); // => undefined

// good
class Jedi {
  jump() {
    this.jumping = true;
    return this;
  }

  setHeight(height) {
    this.height = height;
    return this;
  }
}

const luke = new Jedi();

luke.jump()
  .setHeight(20);
```

- 可以写一个自定义的toString()方法，但是确保它工作正常并且不会有副作用


```javascript
class Jedi {
  contructor(options = {}) {
    this.name = options.name || 'no name';
  }

  getName() {
    return this.name;
  }

  toString() {
    return `Jedi - ${this.getName()}`;
  }
}
```

## 模块

- 总是在非标准的模块系统中使用标准的 `import` 和 `export` 语法，我们总是可以将标准的模块语法转换成支持特定模块加载器的语法。 
 
  > 模块是未来的趋势，那么我们为何不现在就开始使用。


```javascript
  // bad
  const AirbnbStyleGuide = require('./AirbnbStyleGuide');
  module.exports = AirbnbStyleGuide.es6;

  // ok
  import AirbnbStyleGuide from './AirbnbStyleGuide';
  export default AirbnbStyleGuide.es6;

  // best
  import { es6 } from './AirbnbStyleGuide';
  export default es6;
```

- 不要使用通配符 `*` 的 `import`

  > 这样确保了只有一个默认的 `export` 项

```javascript
  // bad
  import * as AirbnbStyleGuide from './AirbnbStyleGuide';

  // good
  import AirbnbStyleGuide from './AirbnbStyleGuide';
```

- 不要直接从一个 `import` 上 `export`

  > 虽然一行代码看起来更简洁，但是有一个明确的 `import` 和一个明确的 `export` 使得代码行为更加明确。

```javascript
  // bad
  // filename es6.js
  export default { es6 } from './airbnbStyleGuide';

  // good
  // filename es6.js
  import { es6 } from './AirbnbStyleGuide';
  export default es6;
```

## Iterators 和 Generators

- 不要使用迭代器（Iterators）。优先使用 JavaScript 中 `map` 和 `reduce` 这类高阶函数来代替 `for-of` 循环

  > 处理纯函数的返回值更加容易并且没有副作用
  

```javascript
const numbers = [1, 2, 3, 4, 5];

  // bad
  let sum = 0;
  for (let num of numbers) {
    sum += num;
  }

  sum === 15;

  // good
  let sum = 0;
  numbers.forEach((num) => sum += num);
  sum === 15;

  // best (use the functional force)
  const sum = numbers.reduce((total, num) => total + num, 0);
  sum === 15;
```

- 不要使用 generators

  > 它们不太容易转换为 ES5 的语法。

## 属性

- 使用点 `.` 操作符来访问属性


```javascript
const luke = {
  jedi: true,
  age: 28
};

// bad
const isJedi = luke['jedi'];

// good
const isJedi = luke.jedi;
```

- 当使用变量访问属性时使用中括号 `[]`


```javascript
var luke = {
  jedi: true,
  age: 28
};

function getProp(prop) {
  return luke[prop];
}

var isJedi = getProp('jedi');
```

## 变量

- 总是使用 `const` 来声明变量，否则将生成全局变量，我们应该避免污染全局命名空间


```javascript
// bad
superPower = new SuperPower();

// good
const superPower = new SuperPower();
```

- 为每个变量都使用 `const` 关键字声明

  > 这种方式更加容易添加新变量，并且不必担忧将 `,` 错误写成 `;` 而导致生成全局变量。 

```javascript
// bad
const items = getItems(),
    goSportsTeam = true,
    dragonball = 'z';

// bad
// (compare to above, and try to spot the mistake)
const items = getItems(),
    goSportsTeam = true;
    dragonball = 'z';

// good
const items = getItems();
const goSportsTeam = true;
const dragonball = 'z';
```

- 将所有 `const` 变量放在一起，然后将所有 `let` 变量放在一起

```javascript
  // bad
  let i, len, dragonball,
      items = getItems(),
      goSportsTeam = true;

  // bad
  let i;
  let items = getItems();
  let dragonball;
  let goSportsTeam = true;
  let len;

  // good
  const goSportsTeam = true;
  const items = getItems();
  let dragonball;
  let i;
  let length;
```

- 在必要的时候声明变量，并且将其放在合适的位置

  > `let` 和 `const` 是块级作用域的，而不是函数作用域。
  
```javascript
// good
  function() {
    test();
    console.log('doing stuff..');

    //..other stuff..

    const name = getName();

    if (name === 'test') {
      return false;
    }

    return name;
  }

  // bad
  function() {
    const name = getName();

    if (!arguments.length) {
      return false;
    }

    return true;
  }

  // good
  function() {
    if (!arguments.length) {
      return false;
    }

    const name = getName();

    return true;
  }
```

## 变量提升 Hoisting

- 通过 `var` 声明的变量将被提升到作用域的顶部，但他们的赋值不会被提升。通过 `const` 和 `let` 声明的变量不存在变量提升，这里有一个新概念，称为“[暂时性死区（ Temporal Dead Zones (TDZ)）](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let#Temporal_dead_zone_and_errors_with_let)”。有必要理解  [`typeof` 不再是一个百分之百安全的操作](http://es-discourse.com/t/why-typeof-is-no-longer-safe/15)。


```javascript
// we know this wouldn't work (assuming there
// is no notDefined global variable)
function example() {
  console.log(notDefined); // => throws a ReferenceError
}

// creating a variable declaration after you
// reference the variable will work due to
// variable hoisting. Note: the assignment
// value of `true` is not hoisted.
function example() {
  console.log(declaredButNotAssigned); // => undefined
  var declaredButNotAssigned = true;
}

// The interpreter is hoisting the variable
// declaration to the top of the scope,
// which means our example could be rewritten as:
function example() {
  let declaredButNotAssigned;
  console.log(declaredButNotAssigned); // => undefined
  declaredButNotAssigned = true;
}

// using const and let
function example() {
  console.log(declaredButNotAssigned); // => throws a ReferenceError
  console.log(typeof declaredButNotAssigned); // => throws a ReferenceError
  const declaredButNotAssigned = true;
}
```

- 匿名函数表达式提升了对应的变量名，但赋值过程没有被提升


```javascript
function example() {
  console.log(anonymous); // => undefined

  anonymous(); // => TypeError anonymous is not a function

  let anonymous = function() {
    console.log('anonymous function expression');
  };
}
```

- 命名的函数表达式提升了对应的变量名，函数名和函数体没有被提升


```javascript
function example() {
  console.log(named); // => undefined

  named(); // => TypeError named is not a function

  superPower(); // => ReferenceError superPower is not defined

  var named = function superPower() {
    console.log('Flying');
  };
}

// the same is true when the function name
// is the same as the variable name.
function example() {
  console.log(named); // => undefined

  named(); // => TypeError named is not a function

  var named = function named() {
    console.log('named');
  }
}
```

- 函数声明将被提升


```javascript
function example() {
  superPower(); // => Flying

  function superPower() {
    console.log('Flying');
  }
}
```

- 更多细节可以参考 [Ben Cherry](http://www.adequatelygood.com/) 的 [JavaScript Scoping & Hoisting](http://www.adequatelygood.com/2010/2/JavaScript-Scoping-and-Hoisting)

## 比较运算符和等号

- 使用 `===` 和 `!==` 而不是 `==` 和 `!=`
- 比较运算通过 `ToBoolean` 强制转换并遵循一下规则：
  
  - `Object` - `true`
  - `Undefined` - `false`
  - `Null` - `false`
  - `Booleans` - 被转换为对应的值
  - `Number` - 值为 `+0`，`-0`，`NaN` 时为 `false`，否则为 `true`
  - `String` - 空字符串 `''` 为 `false`，否则为 `true`
  
```javascript
if ([0]) {
  // true
  // An array is an object, objects evaluate to true
}
```

- 使用快捷方式


```javascript
// bad
if (name !== '') {
  // ...stuff...
}

// good
if (name) {
  // ...stuff...
}

// bad
if (collection.length > 0) {
  // ...stuff...
}

// good
if (collection.length) {
  // ...stuff...
}
```

- 更多细节请阅读 [Truth Equality and JavaScript](http://javascriptweblog.wordpress.com/2011/02/07/truth-equality-and-javascript/#more-2108) 

## 块

- 给所有多行的块使用大括号


```javascript
// bad
if (test)
  return false;

// good
if (test) return false;

// good
if (test) {
  return false;
}

// bad
function() { return false; }

// good
function() {
  return false;
}
```

- 使用 `if...else` 这样的多行块时，请将 `else` 和 `if` 的结束括号放在同一行


```javascript
// bad
if (test) {
  thing1();
  thing2();
}
else {
  thing3();
}

// good
if (test) {
  thing1();
  thing2();
} else {
  thing3();
}
```

## 注释

- 使用 `/** ... */` 进行多行注释，包括描述，指定类型以及参数值和返回值


```javascript
// bad
// make() returns a new element
// based on the passed in tag name
//
// @param <String> tag
// @return <Element> element
function make(tag) {

  // ...stuff...

  return element;
}

// good
/**
 * make() returns a new element
 * based on the passed in tag name
 *
 * @param <String> tag
 * @return <Element> element
 */
function make(tag) {

  // ...stuff...

  return element;
}
```

- 使用 `//` 进行单行注释，将注释放在被注释对象的上面，并在注释之前保留一个空行


```javascript
// bad
const active = true;  // is current tab

// good
// is current tab
const active = true;

// bad
function getType() {
  console.log('fetching type...');
  // set the default type to 'no type'
  const type = this._type || 'no type';

  return type;
}

// good
function getType() {
  console.log('fetching type...');

  // set the default type to 'no type'
  const type = this._type || 'no type';

  return type;
}
```

- 使用 `// FIXME:` 来注释一个问题


```javascript
function Calculator() {

  // FIXME: shouldn't use a global here
  total = 0;

  return this;
}
```


- 使用 `// TODO:` 来注释一个问题的解决方案


```javascript
function Calculator() {

  // TODO: total should be configurable by an options param
  this.total = 0;

  return this;
}
```

## 空白

- 将 `tab` 设置为 `2` 个空格缩进


```javascript
// bad
function() {
∙∙∙∙const name;
}

// bad
function() {
∙const name;
}

// good
function() {
∙∙const name;
}
```

- 前大括号前放置一个空格


```javascript
// bad
function test(){
  console.log('test');
}

// good
function test() {
  console.log('test');
}

// bad
dog.set('attr',{
  age: '1 year',
  breed: 'Bernese Mountain Dog'
});

// good
dog.set('attr', {
  age: '1 year',
  breed: 'Bernese Mountain Dog'
});
```

- 运算符之间用空格分隔


```javascript
// bad
const x=y+5;

// good
const x = y + 5;
```

- 文件末尾使用单个换行符


```javascript
// bad
(function(global) {
  // ...stuff...
})(this);
```


```javascript
// bad
(function(global) {
  // ...stuff...
})(this);↵
↵
```


```javascript
// good
(function(global) {
  // ...stuff...
})(this);↵
```

- 方法链式调用时保持适当的缩进，并且使用前置的 `.` 来表示该行是一个方法调用，而不是一个新语句

```javascript
// bad
$('#items').find('.selected').highlight().end().find('.open').updateCount();

// bad
$('#items').
  find('selected').
    highlight().
    end().
  find('.open').
    updateCount();

// good
$('#items')
  .find('.selected')
    .highlight()
    .end()
  .find('.open')
    .updateCount();

// bad
const leds = stage.selectAll('.led').data(data).enter().append('svg:svg').class('led', true)
    .attr('width',  (radius + margin) * 2).append('svg:g')
    .attr('transform', 'translate(' + (radius + margin) + ',' + (radius + margin) + ')')
    .call(tron.led);

// good
const leds = stage.selectAll('.led')
    .data(data)
  .enter().append('svg:svg')
    .class('led', true)
    .attr('width',  (radius + margin) * 2)
  .append('svg:g')
    .attr('transform', 'translate(' + (radius + margin) + ',' + (radius + margin) + ')')
    .call(tron.led);
```

- 在语句块之后和下一语句之前都保持一个空行


```javascript
// bad
if (foo) {
  return bar;
}
return baz;

// good
if (foo) {
  return bar;
}

return baz;

// bad
const obj = {
  foo: function() {
  },
  bar: function() {
  }
};
return obj;

// good
const obj = {
  foo: function() {
  },

  bar: function() {
  }
};

return obj;
```

## 逗号

- 不要将逗号放前面


```javascript
// bad
const story = [
    once
  , upon
  , aTime
];

// good
const story = [
  once,
  upon,
  aTime
];

// bad
const hero = {
    firstName: 'Bob'
  , lastName: 'Parr'
  , heroName: 'Mr. Incredible'
  , superPower: 'strength'
};

// good
const hero = {
  firstName: 'Bob',
  lastName: 'Parr',
  heroName: 'Mr. Incredible',
  superPower: 'strength'
};
```

- 不要添加多余的逗号，否则将在 IE6/7 和 IE9 的怪异模式下导致错误。同时，某些 ES3 的实现会计算多数组的长度，这在 ES5 中有[澄清](http://es5.github.io/#D)


```javascript
// bad
  const hero = {
    firstName: 'Kevin',
    lastName: 'Flynn',
  };

  const heroes = [
    'Batman',
    'Superman',
  ];

  // good
  const hero = {
    firstName: 'Kevin',
    lastName: 'Flynn'
  };

  const heroes = [
    'Batman',
    'Superman'
  ];
```

## 分号

- 句末一定要添加分号

```javascript
// bad
(function() {
  const name = 'Skywalker'
  return name
})()

// good
(() => {
  const name = 'Skywalker';
  return name;
})();

// good (guards against the function becoming an argument when two files with IIFEs are concatenated)
;(() => {
  const name = 'Skywalker';
  return name;
})();
```

## 类型转换

- 在语句的开始执行类型转换
- 字符串：


```javascript
//  => this.reviewScore = 9;

// bad
const totalScore = this.reviewScore + '';

// good
const totalScore = String(this.reviewScore);
```

- 对数字使用 parseInt 并且总是带上类型转换的基数


```javascript
const inputValue = '4';

// bad
const val = new Number(inputValue);

// bad
const val = +inputValue;

// bad
const val = inputValue >> 0;

// bad
const val = parseInt(inputValue);

// good
const val = Number(inputValue);

// good
const val = parseInt(inputValue, 10);
```

- 不管是出于一些奇特的原因，还是 `parseInt` 是一个瓶颈而需要位运算来解决某些[性能问题](http://jsperf.com/coercion-vs-casting/3)，请为你的代码注释为什么要这样做


```javascript
// good
/**
 * parseInt was the reason my code was slow.
 * Bitshifting the String to coerce it to a
 * Number made it a lot faster.
 */
const val = inputValue >> 0;
```
 
- **注意：**使用位移运算时要特别小心。`Number` 在 JavaScript 中表示为 [64 位的值](http://es5.github.io/#x4.3.19)，但位移运算总是返回一个 32 位的整数（[source](http://es5.github.io/#x11.7)），对大于 32 位的整数进行位移运算会导致意外的结果（[讨论](https://github.com/airbnb/javascript/issues/109)）。32 位最大整数为 `2,147,483,647`：


```javascript
2147483647 >> 0 //=> 2147483647
2147483648 >> 0 //=> -2147483648
2147483649 >> 0 //=> -2147483647
```

- 布尔值


```javascript
var age = 0;

// bad
var hasAge = new Boolean(age);

// good
var hasAge = Boolean(age);

// good
var hasAge = !!age;
```

## 命名约定

- 避免单个字符名，让你的变量名有描述意义


```javascript
// bad
function q() {
  // ...stuff...
}

// good
function query() {
  // ..stuff..
}
```

- 命名对象、函数和实例时使用小驼峰命名规则


```javascript
// bad
var OBJEcttsssss = {};
var this_is_my_object = {};
var this-is-my-object = {};
function c() {};
var u = new user({
  name: 'Bob Parr'
});

// good
var thisIsMyObject = {};
function thisIsMyFunction() {};
var user = new User({
  name: 'Bob Parr'
});
```

- 命名构造函数或类时使用大驼峰命名规则


```javascript
// bad
function user(options) {
  this.name = options.name;
}

const bad = new user({
  name: 'nope'
});

// good
class User {
  constructor(options) {
    this.name = options.name;
  }
}

const good = new User({
  name: 'yup'
});
```

- 命名私有属性时前面加个下划线 `_`


```javascript
// bad
this.__firstName__ = 'Panda';
this.firstName_ = 'Panda';

// good
this._firstName = 'Panda';
```

- 保存对 `this` 的引用时使用 `_this`


```javascript
// bad
function() {
  var self = this;
  return function() {
    console.log(self);
  };
}

// bad
function() {
  var that = this;
  return function() {
    console.log(that);
  };
}

// good
function() {
  var _this = this;
  return function() {
    console.log(_this);
  };
}
```

- 导出单一一个类时，确保你的文件名就是你的类名


```javascript
// file contents
class CheckBox {
  // ...
}
module.exports = CheckBox;

// in some other file
// bad
const CheckBox = require('./checkBox');

// bad
const CheckBox = require('./check_box');

// good
const CheckBox = require('./CheckBox');
```

- 导出一个默认小驼峰命名的函数时，文件名应该就是导出的方法名


```javascript
function makeStyleGuide() {
}

export default makeStyleGuide;
```

- 导出单例、函数库或裸对象时，使用大驼峰命名规则


```javascript
const AirbnbStyleGuide = {
  es6: {
  }
};

export default AirbnbStyleGuide;
```

## 访问器

- 属性的访问器函数不是必须的
- 如果你确实有存取器函数的话使用 `getVal()` 和 `setVal('hello')`


```javascript
// bad
dragon.age();

// good
dragon.getAge();

// bad
dragon.age(25);

// good
dragon.setAge(25);
```

- 如果属性是布尔值，使用 `isVal()` 或 `hasVal()`


```javascript
// bad
if (!dragon.age()) {
  return false;
}

// good
if (!dragon.hasAge()) {
  return false;
}
```

- 可以创建get()和set()函数，但是要保持一致性


```javascript
function Jedi(options) {
  options || (options = {});
  var lightsaber = options.lightsaber || 'blue';
  this.set('lightsaber', lightsaber);
}

Jedi.prototype.set = function(key, val) {
  this[key] = val;
};

Jedi.prototype.get = function(key) {
  return this[key];
};
```

## 事件

- 当给事件附加数据时，传入一个哈希而不是原始值，这可以让后面的贡献者加入更多数据到事件数据里而不用找出并更新那个事件的事件处理器


```javascript
// bad
$(this).trigger('listingUpdated', listing.id);

...

$(this).on('listingUpdated', function(e, listingId) {
  // do something with listingId
});
```


```javascript
// good
$(this).trigger('listingUpdated', { listingId : listing.id });

...

$(this).on('listingUpdated', function(e, data) {
  // do something with data.listingId
});
```

## jQuery

- 为 jQuery 对象命名时添加 `$` 前缀


```javascript
// bad
const sidebar = $('.sidebar');

// good
const $sidebar = $('.sidebar');
```

- 缓存 jQuery 的查询结果


```javascript
// bad
function setSidebar() {
  $('.sidebar').hide();

  // ...stuff...

  $('.sidebar').css({
    'background-color': 'pink'
  });
}

// good
function setSidebar() {
  const $sidebar = $('.sidebar');
  $sidebar.hide();

  // ...stuff...

  $sidebar.css({
    'background-color': 'pink'
  });
}
```

- 对DOM查询使用级联的 `$('.sidebar ul')` 或 `$('.sidebar ul')`，[jsPerf](http://jsperf.com/jquery-find-vs-context-sel/16)
- 在指定作用域进行查询时使用 `find`


```javascript
// bad
$('ul', '.sidebar').hide();

// bad
$('.sidebar').find('ul').hide();

// good
$('.sidebar ul').hide();

// good
$('.sidebar > ul').hide();

// good
$sidebar.find('ul').hide();
```

## ECMAScript 5 兼容性

- 参考 [Kangax](https://twitter.com/kangax/) 的 [ES5 compatibility table](http://kangax.github.com/es5-compat-table/)

## ECMAScript 6 新特性

下面是本文涉及到的 ES6 新特性：

## 性能

- [On Layout & Web Performance](http://kellegous.com/j/2013/01/26/layout-performance/)
- [String vs Array Concat](http://jsperf.com/string-vs-array-concat/2)
- [Try/Catch Cost In a Loop](http://jsperf.com/try-catch-in-loop-cost)
- [Bang Function](http://jsperf.com/bang-function)
- [jQuery Find vs Context, Selector](http://jsperf.com/jquery-find-vs-context-sel/13)
- [innerHTML vs textContent for script text](http://jsperf.com/innerhtml-vs-textcontent-for-script-text)
- [Long String Concatenation](http://jsperf.com/ya-string-concat)
- Loading...

## 资源


**Read This**

  - [Annotated ECMAScript 5.1](http://es5.github.com/)

**工具**

  - Code Style Linters
    + [JSHint](http://www.jshint.com/) - [Airbnb Style .jshintrc](https://github.com/airbnb/javascript/blob/master/linters/jshintrc)
    + [JSCS](https://github.com/jscs-dev/node-jscs) - [Airbnb Style Preset](https://github.com/jscs-dev/node-jscs/blob/master/presets/airbnb.json)

**其它规范**

  - [Google JavaScript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
  - [jQuery Core Style Guidelines](http://docs.jquery.com/JQuery_Core_Style_Guidelines)
  - [Principles of Writing Consistent, Idiomatic JavaScript](https://github.com/rwldrn/idiomatic.js/)

**其它风格**

  - [Naming this in nested functions](https://gist.github.com/4135065) - Christian Johansen
  - [Conditional Callbacks](https://github.com/airbnb/javascript/issues/52) - Ross Allen
  - [Popular JavaScript Coding Conventions on Github](http://sideeffect.kr/popularconvention/#javascript) - JeongHoon Byun
  - [Multiple var statements in JavaScript, not superfluous](http://benalman.com/news/2012/05/multiple-var-statements-javascript/) - Ben Alman

**更多文章**

  - [Understanding JavaScript Closures](http://javascriptweblog.wordpress.com/2010/10/25/understanding-javascript-closures/) - Angus Croll
  - [Basic JavaScript for the impatient programmer](http://www.2ality.com/2013/06/basic-javascript.html) - Dr. Axel Rauschmayer
  - [You Might Not Need jQuery](http://youmightnotneedjquery.com/) - Zack Bloom & Adam Schwartz
  - [ES6 Features](https://github.com/lukehoban/es6features) - Luke Hoban
  - [Frontend Guidelines](https://github.com/bendc/frontend-guidelines) - Benjamin De Cock

**书籍**

  - [JavaScript: The Good Parts](http://www.amazon.com/JavaScript-Good-Parts-Douglas-Crockford/dp/0596517742) - Douglas Crockford
  - [JavaScript Patterns](http://www.amazon.com/JavaScript-Patterns-Stoyan-Stefanov/dp/0596806752) - Stoyan Stefanov
  - [Pro JavaScript Design Patterns](http://www.amazon.com/JavaScript-Design-Patterns-Recipes-Problem-Solution/dp/159059908X)  - Ross Harmes and Dustin Diaz
  - [High Performance Web Sites: Essential Knowledge for Front-End Engineers](http://www.amazon.com/High-Performance-Web-Sites-Essential/dp/0596529309) - Steve Souders
  - [Maintainable JavaScript](http://www.amazon.com/Maintainable-JavaScript-Nicholas-C-Zakas/dp/1449327680) - Nicholas C. Zakas
  - [JavaScript Web Applications](http://www.amazon.com/JavaScript-Web-Applications-Alex-MacCaw/dp/144930351X) - Alex MacCaw
  - [Pro JavaScript Techniques](http://www.amazon.com/Pro-JavaScript-Techniques-John-Resig/dp/1590597273) - John Resig
  - [Smashing Node.js: JavaScript Everywhere](http://www.amazon.com/Smashing-Node-js-JavaScript-Everywhere-Magazine/dp/1119962595) - Guillermo Rauch
  - [Secrets of the JavaScript Ninja](http://www.amazon.com/Secrets-JavaScript-Ninja-John-Resig/dp/193398869X) - John Resig and Bear Bibeault
  - [Human JavaScript](http://humanjavascript.com/) - Henrik Joreteg
  - [Superhero.js](http://superherojs.com/) - Kim Joar Bekkelund, Mads Mobæk, & Olav Bjorkoy
  - [JSBooks](http://jsbooks.revolunet.com/) - Julien Bouquillon
  - [Third Party JavaScript](http://manning.com/vinegar/) - Ben Vinegar and Anton Kovalyov
  - [Effective JavaScript: 68 Specific Ways to Harness the Power of JavaScript](http://amzn.com/0321812182) - David Herman

**播客**

  - [DailyJS](http://dailyjs.com/)
  - [JavaScript Weekly](http://javascriptweekly.com/)
  - [JavaScript, JavaScript...](http://javascriptweblog.wordpress.com/)
  - [Bocoup Weblog](http://weblog.bocoup.com/)
  - [Adequately Good](http://www.adequatelygood.com/)
  - [NCZOnline](http://www.nczonline.net/)
  - [Perfection Kills](http://perfectionkills.com/)
  - [Ben Alman](http://benalman.com/)
  - [Dmitry Baranovskiy](http://dmitry.baranovskiy.com/)
  - [Dustin Diaz](http://dustindiaz.com/)
  - [nettuts](http://net.tutsplus.com/?s=javascript)

**Podcasts**

  - [JavaScript Jabber](http://devchat.tv/js-jabber/)