title: 几个必备的 JavaScript 函数
tags:
  - Essential
categories:
  - JavaScript
photos:
  - http://bubkoo.qiniudn.com/images/7-essential-javascript-functions.jpg
date: 2015-06-10 11:40:13
updated: 2015-06-10 11:40:13
keywords:
---

参考原文：[7 Essential JavaScript Functions](http://davidwalsh.name/essential-javascript-functions) 以下是意译。


早期，由于浏览器厂商对 JavaScript 实现不同，我们通常需要一些简单的函数来实现某些边缘特性，甚至某些基本特性，比如 `addEventListener` 和 `attachEvent`。现在，虽然时代进步了，但仍有一些函数需要开发者掌握，以便于性能优化和快速开发。

<!--more-->

## 去抖 Debounce

去抖（debounce）函数可以提高某些事件绑定的性能，如果你没有为 `scroll`、`resize` 和 `key*` 事件使用去抖函数，你的代码很可能是性能低下的，下面是一个 `debounce` 函数的实现：



```javascript
// 返回一个函数的去抖版本，将函数延迟到事件停止触发，并等待 wait 毫秒之后才执行
// 如果 immediate 为 true，那么会在开始时立即调用这个函数一次，并在 wait 时间内不会被重复调用

function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}


// 使用案例：resize 事件监听
var myEfficientFn = debounce(function () {
    // 这里完成那些复杂的业务功能
}, 250);
window.addEventListener('resize', myEfficientFn);
```

在给定的时间段内，去抖函数至多只允许回调函数被调用一次，这对于某些频繁触发的事件回调特别有用。

[深入阅读](http://davidwalsh.name/javascript-debounce-function)

## 轮询 Poll

有时你需要在指定状态时才触发某些事件，而当前状态很可能不是你所需要的，所以我们需要在一定时间间隔内来轮询当前状态：


```javascript
function poll(fn, callback, errback, timeout, interval) {
    var endTime = Number(new Date()) + (timeout || 2000);
    interval = interval || 100;

    (function p() {
        // 满足条件时，触发回调
        if (fn()) {
            callback();
        }
        // 条件不满足，并在指定的时间段内，那么延迟一段时间后再次触发检查
        else if (Number(new Date()) < endTime) {
            setTimeout(p, interval);
        }
        // 条件不满足并已经超时，触发错误回调
        else {
            errback(new Error('timed out for ' + fn + ': ' + arguments));
        }
    })();
}


// 使用案例：确保元素可见
poll(
    function () {
        return document.getElementById('lightbox').offsetWidth > 0;
    },
    function () {
        // Done, success callback
    },
    function () {
        // Error, failure callback
    }
);
```

轮询函数在 Web 开发中一直都非常实用，将来也一样。

[深入阅读](http://davidwalsh.name/javascript-polling)

## 只触发一次 Once

某些时候，你希望一个函数只被调用一次，比如 `onload` 事件的回调函数，那么下面代码是你需要的：

```javascript
function once(fn, context) {
    var result;

    return function () {
        if (fn) {
            result = fn.apply(context || this, arguments);
            fn = null;
        }

        return result;
    };
}


// 使用
var canOnlyFireOnce = once(function () {
    console.log('Fired!');
});

canOnlyFireOnce(); // "Fired!"
canOnlyFireOnce(); // nada
```

`once` 函数确保给定的函数只被调用一次，以防止重复初始化。

[深入阅读](http://davidwalsh.name/javascript-once)

## 获取绝对路径 getAbsoluteUrl

从一个字符串变量中获取绝对 URL 地址并不是想象的那么简单，这里有一个巧妙的实现来从一个字符串获取绝对 URL:


```javascript
var getAbsoluteUrl = (function () {
    var a;

    return function (url) {
        if (!a) {
            a = document.createElement('a');
        }
        a.href = url;

        return a.href;
    };
})();

// 使用
getAbsoluteUrl('/something'); // http://davidwalsh.name/something
```
元素 `a` 的 `href` 属性给你带来了简单的实现，并返回一个可靠的绝对 URL。

[深入阅读](http://davidwalsh.name/get-absolute-url)

## 判断是否是原生函数 isNative

当你想要重写一个函数时，很有必要知道该函数是否是引擎的原生函数，下面的代码将能判断一个函数是否是原生函数：


```javascript
;(function () {

    // Used to resolve the internal `[[Class]]` of values
    var toString = Object.prototype.toString;

    // Used to resolve the decompiled source of functions
    var fnToString = Function.prototype.toString;

    // Used to detect host constructors (Safari > 4; really typed array specific)
    var reHostCtor = /^\[object .+?Constructor\]$/;

    // Compile a regexp using a common native method as a template.
    // We chose `Object#toString` because there's a good chance it is not being mucked with.
    var reNative = RegExp('^' +
            // Coerce `Object#toString` to a string
        String(toString)
            // Escape any special regexp characters
            .replace(/[.*+?^${}()|[\]\/\\]/g, '\\$&')
            // Replace mentions of `toString` with `.*?` to keep the template generic.
            // Replace thing like `for ...` to support environments like Rhino which add extra info
            // such as method arity.
            .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    function isNative(value) {
        var type = typeof value;
        return type == 'function'
            // Use `Function#toString` to bypass the value's own `toString` method
            // and avoid being faked out.
            ? reNative.test(fnToString.call(value))
            // Fallback to a host object check because some environments will represent
            // things like typed arrays as DOM methods which may not conform to the
            // normal native pattern.
            : (value && type == 'object' && reHostCtor.test(toString.call(value))) || false;
    }

    // export however you want
    module.exports = isNative;
}());

// 使用
isNative(alert); // true
isNative(myCustomFunction); // false
```

上面代码看上去并不那么优雅，但最终实现了我们想要的功能。

[深入阅读](http://davidwalsh.name/detect-native-function)

## 插入样式规则 insertRule

我们可以通过 `document.querySelectorAll` 来获取到一些节点，然后依次为这些节点设置样式，但更有效的方法在样式表中是通过选择器来设置：

```javascript
var sheet = (function () {
    // Create the <style> tag
    var style = document.createElement('style');

    // Add a media (and/or media query) here if you'd like!
    // style.setAttribute('media', 'screen')
    // style.setAttribute('media', 'only screen and (max-width : 1024px)')

    // WebKit hack :(
    style.appendChild(document.createTextNode(''));

    // Add the <style> element to the page
    document.head.appendChild(style);

    return style.sheet;
})();

// Usage
sheet.insertRule("header { float: left; opacity: 0.8; }", 1);
```

对于一些动态的重度 AJAX 的网站来说，这个函数非常有用，通过选择器来设置样式，你就不再需要为符合这个选择器的每个元素单独设置（现在不要这样做，将来更不要）。

[深入阅读](http://davidwalsh.name/add-rules-stylesheets)

## 元素匹配 matchesSelector

通常，我们在进一步操作之前都需要验证输入的合法性，以确保数据的有效性和真实性等。但我们如何验证一个给定的元素是否满足指定的选择器呢？看下面的 `matchesSelector` 方法：

```javascript
function matchesSelector(el, selector) {
    var p = Element.prototype;
    var f = p.matches
        || p.webkitMatchesSelector
        || p.mozMatchesSelector
        || p.msMatchesSelector
        || function (s) {
            return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
        };
    return f.call(el, selector);
}

// 使用
matchesSelector(document.getElementById('myDiv'), 'div.someSelector[some-attribute=true]');
```

[深入阅读](http://davidwalsh.name/element-matches-selector)

## 生成随机数 random

在 `min` 和 `max` 之间生成一个随机数，如果 `integer` 为 `true` 那么将生成随机整数。

```javascript
function rand(min, max, integer) {
  var r = Math.random() * (max - min) + min; 
  return integer ? r|0 : r;
}
console.log(rand(2,5)); // float random between 2 and 5 inclusive
console.log(rand(1,100,true)); // integer random between 1 and 100
```
