title: 理解正则表达式的全局匹配
date: 2014-03-19 19:22:18
updated: 2014-03-19 19:22:18
tags: [Regex]
categories: [JavaScript]
keywords:
---
本文讨论何时以及如何使用正则表达式全局匹配（/g），以及使用全局匹配可能会遇到的一些坑。

![你真的懂全局匹配吗？](http://bubkoo.qiniudn.com/regex-with-global-flag-in-javascript.png)

## 什么是全局匹配 ##
有时候你可能期望重复匹配目标字符串多次，那么你就会创建一个全局匹配的正则表达式（通过正则表达式字面量 `/.../g` 或创建 `new RegExp(..., 'g')` 对象），这样正则表达式的 `global` 属性将会是 `true`，并且会导致一些行为的不同，下面会具体介绍。 

``` javascript
var regex = /x/g;
regex.global // true
```

全局的正则表达式的另一个属性 `lastIndex` 表示上一次匹配文本之后的第一个字符的位置，上次匹配的结果是由方法 `RegExp.prototype.exec()` 和 `RegExp.prototype.test()` 找到的，它们都以 `lastIndex` 属性所指的位置作为下次检索的起始点。这样，就可以通过反复调用这两个方法来遍历一个字符串中的所有匹配文本。`lastIndex` 属性是可读可写的，只要目标字符串的下一次搜索开始，就可以对它进行设置。当方法 `RegExp.prototype.exec()` 或 `RegExp.prototype.test()` 再也找不到可以匹配的文本时，它们会自动把 `lastIndex` 属性重置为 0。

<!--more-->

## RegExp.prototype.test()：检测是否存在匹配 ##

对于非全局的正则表达式，`test()`只会检测是否存在某个目标字符串，多次检测的结果都相同，例如：

``` javascript
var str = '_x_x';

/x/.test(str); // true
/x/.test(str); // true
/x/.test(str); // true
/x/.test(str); // true
```

当设置全局标志 `/g` 时，一旦字符串中还存在匹配，`test()` 方法都将返回 `true`，同时匹配成功后将把 `lastIndex` 属性的值设置为上次匹配成功之后的第一个字符所在的位置，下次匹配将从 `lastIndex` 指示的位置开始；匹配不成功时返回 `false`，同时将 `lastIndex` 属性的值重置为 0。

``` javascript
var str = '_x_x';

var regex = /x/g; // 全局的正则表达式
regex.lastIndex;  // 初始化时为 0

regex.test(str);  // true , 第一次匹配成功
regex.lastIndex;  // 2

regex.test(str);  // true , 第二次匹配成功
regex.lastIndex;  // 4

regex.test(str);  // false , 匹配失败
regex.lastIndex;  // 0 ， 被重置为 0 
```

## RegExp.prototype.exec()：捕获指定的字符串 ##

如果没有设置全局项 `/g`，该方法将始终返回第一个匹配项：

``` javascript
var str = '_x_x';
var regex = /x/;

regex.lastIndex; // 0

regex.exec(str); // ["x", index: 1, input: "_x_x"] 
regex.lastIndex; // 0

regex.exec(str); // ["x", index: 1, input: "_x_x"] 
regex.lastIndex; // 0

regex.exec(str); // ["x", index: 1, input: "_x_x"] 
regex.lastIndex; // 0
```

当全局匹配时，该方法每次返回一个匹配项，直到没有匹配项时返回 `null`：

``` javascript
var str = '_x_x';
var regex = /x/g;

regex.lastIndex; // 0

regex.exec(str); // ["x", index: 1, input: "_x_x"] 
regex.lastIndex; // 2

regex.exec(str); // ["x", index: 3, input: "_x_x"] 
regex.lastIndex; // 4

regex.exec(str); // null
regex.lastIndex; // 0
```

## String.prototype.search()：查找匹配位置 ##

该方法将忽略全局设置项，简单地返回**首次**匹配的位置：

``` javascript
// 非全局
var regex = /x/;
var str = '_x_x';
str.search(regex); // 1

// 全局
var regex = /x/g;
var str = '_x_x';

regex.lastIndex;   // 初始化时为 0

str.search(regex); // 1
regex.lastIndex;   // 任然是 0，因为该方法忽略了全局设置项

```

## String.prototype.match()：找到一个或多个正则表达式的匹配 ##

非全局匹配时，多次执行结果一样，都返回首次匹配结果，忽略 `lastIndex`：

``` javascript
var regex = /x/;
var str = '_x_x';

str.match(regex); // ["x", index: 1, input: "_x_x"] 
regex.lastIndex   // 0

str.match(regex); // ["x", index: 1, input: "_x_x"]
regex.lastIndex   // 0

str.match(regex); // ["x", index: 1, input: "_x_x"]
regex.lastIndex   // 0
```

全局匹配时，该方法返回所有匹配结果，并忽略 `lastIndex`：

``` javascript
var regex = /x/g;
var str = '_x_x';

str.match(regex); // ["x", "x"]
regex.lastIndex   // 0

str.match(regex); // ["x", "x"]
regex.lastIndex   // 0

str.match(regex); // ["x", "x"]
regex.lastIndex   // 0
```

## String.prototype.replace()：替换与正则表达式匹配的子串 ##

如果没有设置全局匹配，那么将替换首次匹配的位置；如果设置了全局匹配，那么将替换所有匹配位置：

``` javascript
// 非全局匹配
'_x_x'.replace(/x/, 'y');  // '_y_x'
// 全局匹配
'_x_x'.replace(/x/g, 'y'); // '_y_y'
```

## 一些坑 ##

使用全局匹配的正则表达式可能会出现一些问题，比如[这篇文章](http://qianduanblog.com/2542.html)中提到的关于正则全局匹配结果为奇偶真假的小疑问；还有当使用 `RegExp.prototype.test()` 和 `RegExp.prototype.exec()` 方法时，必须调用多次才能返回所有结果，这样我们就可能在 JavaScript 循环中滥用正则表达式，这将导致一些问题。

当使用这些方法时，正则表达式不能用内联的方式，例如：

``` javascript
var count = 0;
while (/a/g.test('babaa')) count++;
```

上面代码将导致死循环，因为每次循环都创建了一个新的正则表达式对象，每次匹配就相当于重新开始，所以上面代码应该像这样写：

``` javascript
var count = 0;
var regex = /a/g;
while (regex.test('babaa')) count++;
```

**注意**：最佳实践是不论何时都不要用内联的方式。

还有将正则表达式作为函数的参数，并在函数内部使用 `test()` 或 `exec()` 循环执行时，必须要小心。

下面函数将检测字符串 `str` 中匹配正则表达式 `regex` 的次数： 

``` javascript
function countOccurrences(regex, str) {
    var count = 0;
    while (regex.test(str)) count++;
    return count;
}
```

使用示例：

``` javascript
countOccurrences(/x/g, '_x_x'); // 2
```

第一个问题是，如果我们的正则表达式忘记设置为全局的，那么上面方法可能导致死循环：

``` javascript
countOccurrences(/x/, '_x_x');
```

第二个问题是，该函数可能不会返回预期的结果，因为参数 `regex` 的  `lastIndex` 属性可能并不为 0： 

``` javascript
var regex = /x/g;
regex.lastIndex = 2; // 将 lastIndex 设置为 2
countOccurrences(/x/g, '_x_x'); // 返回 1 ，不是预期结果
```

按照下面的实现可以解决这两个问题：

``` javascript
function countOccurrences(regex, str) {
    if (! regex.global) {
        throw new Error('Please set flag /g of regex');
    }
    var origLastIndex = regex.lastIndex;  // 保存 lastIndex 的值
    regex.lastIndex = 0;

    var count = 0;
    while (regex.test(str)) count++;

    regex.lastIndex = origLastIndex;  // 恢复 lastIndex 的值
    return count;
}
```

一个更简单的代替方法是使用 `String.prototype.match()` 方法：

``` javascript
function countOccurrences(regex, str) {
    if (! regex.global) {
        throw new Error('Please set flag /g of regex');
    }
    return (str.match(regex) || []).length;
}
```

性能比较：[Juan Ignacio Dopazo](https://twitter.com/juandopazo) 对这两种实现做了[性能比较](http://jsperf.com/regex-counting)，结果是使用 `test()` 的性能更好，因为它不需要将匹配结果放到数组中。

## 参考资料 ##
- http://www.w3school.com.cn/jsref/jsref_obj_regexp.asp
- http://stackoverflow.com/questions/1520800/why-regexp-with-global-flag-in-javascript-give-wrong-results
- http://www.2ality.com/2013/08/regexp-g.html
- http://qianduanblog.com/2542.html
- http://www.oschina.net/question/141557_46091