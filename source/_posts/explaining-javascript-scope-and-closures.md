title: 解释 JavaScript 的作用域和闭包
date: 2014-03-10 20:39:23
updated: 2014-03-10 20:39:23
tags: [Scope, Closure]
categories: [JavaScript]
keywords:
---
面试或被面试时基本都会涉及到这个最原始的 JavaScript 基础问题，试想一下您有没有在某些时候向别人解释这些概念时，把自己给绕进去了；网络上偶遇一篇英文文章，细读之后觉得有参考价值，文章不长，就顺手翻译了一下，希望某些同学可以用的上。

原文文中的 Scope 翻译成中文是“**变量作用域**”，译文某些地方直接简称为“**作用域**” ，Closure 翻译后是“闭包”。[Rebort Nyman](http://robertnyman.com/) 的原文是 [Explaining JavaScript Scope And Closures](http://robertnyman.com/2008/10/09/explaining-javascript-scope-and-closures/)，某些不清楚的地方可以直接参考原文。

以下是译文

## 背景 ##

很多文章或博客都在试着解释作用域和闭包，但大多数都没有解释的很清楚（crystal-clear）。此外，很多人想当然地认为每个人都有大约 15 种其他语言的开发经验，但依我的经验，大多数 JavaScript 开发人员是来自 HTML 和 CSS 的背景，而不是 C 或者 Java。（译者注：在 Node 盛行的今天，情况或许有些不一样。）

因此，文本谦虚的目标是想让大家都能理解作用域和闭包，他们的原理是什么，尤其重要的是如果更好地使用他们。在阅读本文之前，需要您有一些 JavaScript 中变量和函数的基础知识。
<!--more-->
## 作用域（Scope） ##

作用域表示变量或函数能够被访问的范围，以及它们在什么样的上下文中被执行。一般来说，变量和函数可以被定义在全局和局部作用域范围中，变量有所谓的“**函数作用域**”，函数也有和变量一样的作用域。

### 全局作用域（Global Scope） ###
当某个东西是全局的，就意味着它可以在你代码中的任何地方被访问到，看下面的例子：

```javascript
// 全局变量
var monkey = "Gorilla";
 
// 全局函数
function greetVisitor () {
    return alert("Hello dear blog reader!");
}
```

如果上面的代码运行在浏览器环境中，`monkey` 和 `greetVisitor` 的作用域将是 `window` 对象，因此跑在同一页面下的代码都能存取这两个变量。

### 局部作用域（Local Scope ） ###

与全局作用域相反，局部作用域表示变量和函数定义在代码的某些区域中，也只能在这些区域中被访问到，例如在函数内部定义的变量或函数，举例来说：

```javascript
function talkDirty () {
    var saying = "Oh, you little VB lover, you";
    return alert(saying);
}
alert(saying); // 将抛出异常
```

上面代码中，`saying` 这个变量只能在 `talkDirty` 函数内部被访问到。在函数外部，它根本就没有被定义。特别要注意的是，如果你在第二行没有用关键字 `var` 来定义 `saying`，那它会自动变成全域变量。

这也意味着，在嵌套的函数中，内层函数可以访问到外层函数中定义的变量或函数。

```javascript
function saveName (firstName) {
    function capitalizeName () {
        return firstName.toUpperCase();
    }
    var capitalized = capitalizeName();
    return capitalized; 
}
alert(saveName("Robert")); // Returns "ROBERT"
```

像你看到的那样，内层函数 `capitalizeName` 不需要参数任何参数，但是它能访问到外层函数 `saveName` 中的 `firstName` 这个变量。为了更加清晰地解释，我们再来看一个例子：

```javascript
function siblings () {
    var siblings = ["John", "Liza", "Peter"];

    function siblingCount () {
        var siblingsLength = siblings.length;
        return siblingsLength;
    }

    function joinSiblingNames () {
        return "I have " + siblingCount() + " siblings:\n\n" + siblings.join("\n");
    }

    return joinSiblingNames(); 
}

alert(siblings()); // Outputs "I have 3 siblings: John Liza Peter"
```

两个内层的函数都可以访问到外层函数中的 `siblings` 数组，同时两个同级别的函数也能彼此访问（在本例中，`joinSiblingNames` 调用了 `siblingCount` 函数）。然而，定义在 `siblingCount` 函数内部的变量 `siblingsLength`，只能在这个函数内部被访问到，这个函数就是它的作用域。

## 闭包（Closures） ##

现在你应该对作用域有了比较清晰的认识，下面我们来看看闭包。闭包是一些表达式，通常是函数，它可以使用特定作用域中的变量。说简单一点就是，当内层函数引用了外层函数中的变量就形成了闭包。看例子：

```javascript
function add (x) {
    return function (y) {
        return x + y;
    };
}
var add5 = add(5);
var no8 = add5(3);
alert(no8); // Returns 8
```

哇，哇 !刚刚发生什么事了？我们一步步分解来看：
1. 当调用 add 函数时，它返回了一个函数
2. 这个返回的函数封闭了它的作用域，并记住了封闭时参数 `x` 的值（也就是上面代码中的 5）
3. 用变量 `add5` 保存返回的函数，它将一直记得初始化时 `x` 的值
4. `add5` 这个变量就引用到一个永远会把传入的变量加上 5 的函数
5. 当调用 `add5` 时，传入参数 3，它就会把 3 跟 5 相加，然后返回 8

因此，在 JavaScript 的世界中，`add5` 引用的函数实际上看起来像这样： 

```javascript
function add5 (y) {
    return 5 + y;
}
```

### 臭名昭著的循环问题 ###

你曾经有多少次遇到过这样的情况，在一个循环中，你想将变量 i 的值赋给其他地方（比如，赋给一个元素），但是却发现传回的是 i 的最后一个值。

#### 错误的引用 ####
我们来看看这个错误的示例，代码中循环创建了 5 个 `a` 元素，并把 `i` 的值作为其显示的文字的一部分，然后再为每个元素绑定了 click 事件，当点击 `a` 元素时 `alert` 出对应的 `i` 的值，最后将元素 `append` 到 `body` 中：

```javascript
function addLinks () {
    for (var i=0, link; i<5; i++) {
        link = document.createElement("a");
        link.innerHTML = "Link " + i;
        link.onclick = function () {
            alert(i);
        };
        document.body.appendChild(link);
    }
}
window.onload = addLinks;
```

运行代码后，你将发现，每个元素都显示了预期的文字，也就是"Link 0"，"Link 1"等等。但是，不管我们点击哪一个元素，`alert` 出来的都是 5。怎么会这样呢？原因是 `i` 的值在每次循环后都会加 1，而绑定的 `click` 事件还没有被触发，只是绑定到了元素的事件上，`i` 的值也会累加上去。

因此，循环结束后 `i` 的值是 5，也就是在函数 `addLinks` 退出时，`i` 的值成为了其最终值。然后，不管你点击哪一个元素，它都会拿到 `i` 的最终值。

#### 正确的引用 ####

你需要做的是，建立一个闭包，这样当你把 `i` 的值绑定到事件上时，它就会获取到 `i` 当下的那个值。像这样：

```javascript
function addLinks () {
    for (var i=0, link; i<5; i++) {
        link = document.createElement("a");
        link.innerHTML = "Link " + i;
        link.onclick = function (num) {
            return function () {
                alert(num);
            };
        }(i);
        document.body.appendChild(link);
    }
}
window.onload = addLinks;
```

运行这段代码时，如果你点击第一个元素，它会 `alert` 出 0，点击第二个 `alert` 出 1，依次类推，这正是你期望的那样。解决方案是，在绑定事件时创建了一个闭包，将 `i` 的值通过参数 `num` 传递给了事件的回调函数，这样就能获取到 `i` 的当前值。

### 立即执行的函数（Self-Invoking Functions） ###
立即执行的函数是一个立即中，并构建自己的闭包的一种函数。看下面代码：

```javascript
(function () {
    var dog = "German Shepherd";
    alert(dog);
})();
alert(dog); // Returns undefined
```

`dog` 这个变量只能在它所在的作用域中被访问到。有什么了不起的嘛，不就是一只被隐藏起来的狗吗！但是，朋友们，这正是它有趣的地方。这解决了上面的循环问题，并且这也是 [Yahoo 模块模式](http://yuiblog.com/blog/2007/06/12/module-pattern/)的基础。

#### Yahoo 模块模式 ####
这种模式的核心是通过立即执行的函数建立起一个闭包，因此可以定义出私有和共有的变量或方法。下面是一个简单的例子：

```javascript
var person = function () {
    // 私有变量
    var name = "Robert";

    return {
        getName : function () {
            return name;
        },

        setName : function (newName) {
            name = newName;
        }
    };

}();

alert(person.name); // Undefined

alert(person.getName()); // "Robert"

person.setName("Robert Nyman");

alert(person.getName()); // "Robert Nyman"
```

这样做的美好之处在于，从此你可以决定哪些东西需要公开，哪些东西是私有的。上面的 `name` 这个变量，在函数外部不能被访问，但是能通过 `getName` 方法来取值，以及通过 `setName` 方法来设置其值。因为这两个函数形成了闭包，他们保存了对变量 `name` 的引用。

## 结论 ##
无论是新手还是有经验的程序猿，我真诚地希望你在看完这篇文章之后，都能够清楚的领会到作用域和闭包在 JavaScript 中的机制。欢迎各位提出问题，如果你的建议够重要，我会把它加到我的文章里面。

Happy coding!

（原文完）

英文原文：[Robert Nyman](http://robertnyman.com/)，翻译：[布谷 bubkoo](http://bubkoo.com/)

原文链接：[Explaining JavaScript Scope And Closures](http://robertnyman.com/2008/10/09/explaining-javascript-scope-and-closures/)