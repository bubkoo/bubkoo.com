title: 红色大鸟 - 立即调用的函数表达式
date: 2014-03-28 12:23:29
updated: 2014-03-28 12:23:29
tags: [Architecture,IIFE]
categories: [JavaScript]
keywords:
---
![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-red-bird-iife.png)

## 介绍 ##

一群恶魔的猪从无辜的小鸟那里偷走了所有的前端架构，现在它们要夺回来，一对特工英雄（愤怒的小鸟）将攻击那些卑鄙的猪，直到夺回属于他们的前端架构。（译者注：本系列是关乎前端架构的讨论，作者借用当前最风靡的游戏 - 愤怒的小鸟，为我们揭开了前端架构的真实面目。）

本文将介绍红色大鸟，它们以 IIFE 作为中坚力量进行进攻，IIFE 是一切私有化的基础。

> 译注：IIFE (Immediately-invoked Function Expression) 立即调用的函数表达式

![](http://bubkoo.qiniudn.com/angry-birds-red-bird.png)

## 猪猪偷走了什么 ##

多年来小鸟们们习惯于将它们自定的变量和函数乱扔在全局命名空间下（`window` 对象），随着时间的推移，它们慢慢学会了如何使用一些技巧来保护他们的对象，但是，最近这些非全局命名空间中的秘密都被猪猪给偷走了，幸好小鸟们很辛运，这项技术存在一些缺陷，它们计划攻击猪群，然后释放本属于它们的东西。

<!--more-->

## 对象是如何成为全局的 ##

有几种方式来使一个对象成为全局对象，战争的一部分就是来了解这些方式。

- **在 window 作用域中声明对象**

下面例子中声明了 `type` 和 `attack` 两个变量，它们被声明在顶级作用域中，因此它们可以通过 `window` 对象来访问。

```javascript
var type = "Red",
    attack = function() {
        console.log( type + " Bird Attacks!" );
    };
 
console.log( window.type );   // 这是全局变量
console.log( window.attack ); // 这是全局函数
```

- **对象未在任何作用域中声明**

在 JavaScript 中意外声明一个全局变量是最危险和最易发生的事情，当然你不是故意要这样做。如果你忘记声明一个变量，那么 JavaScript 将为你声明并使其成为一个全局变量，这通常不是你期望的，并可能暴露你程序的某些部分。

```javascript
var type = "Red",
    attack = function() {
        typeOfBird = type + " Bird";
 
        return typeOfBird + " Bird Attacks!";
    };
 
console.log( window.type );       // 这是全局变量
console.log( window.attack() );   // 这是全局函数
console.log( window.typeOfBird ); // 这也是一个全局变量 :(
```

- **明确地向 Window 添加对象**

你也可以有意将变量暴露给全局命名空间。你可以简单地访问 `window` 对象来手动添加属性或方法，在代码中使用这项技术，这并不是一个好主意，也没有任何价值。

```javascript
var type = "Red",
    attack = function() {
        typeOfBird = type + " Bird";
 
        window.message = typeOfBird + " Attacks!";
 
        return typeOfBird + " Bird Attacks!";
    };
 
console.log( window.type );       // 这是全局变量
console.log( window.attack() );   // 这是全局函数
console.log( window.typeOfBird ); // 这也是一个全局变量 :(
console.log( window.message );    // 这也是一个全局变量 :|
```

## 为什么全局对象会导致一些问题 ##

- **代码冲突**
  与你同一个公司的开发人员，可能会声明一些在你的程序中已经存在的函数、方法或属性，这是有风险的。如果你没有减少全局命名空间中条目的机制，随着你的程序变得越来越庞大和复杂，变量被意外覆盖的风险就会随之增加。你可能会规避这个风险，因为你有严格的代码审查，并且所有的开发人员都知道你代码的方方面面。如果这正是描述的你，那么请看看下面的原因 ;)

- **与第三方库冲突**
  使用全局变量的另一个风险就是，你的代码可能和你正在使用的第三方库冲突。目前有很多库、插件和框架，并不是所有这些三方库都了解和有意识地将全局变量控制到最少，你的代码和这些库可能会发生冲突，并覆盖彼此的行为，这可能导致意想不到的结果。你可能会规避这个风险，因为你深入了解了你正在使用的三方库，并完全知道这些三方库暴露了那些全局变量。如果这正是描述的你，那么请接着看下面的原因 ;)

- **与浏览器的附加元件/扩展/插件冲突**
  使用全局变量的最后一个风险就是，你的代码可能和浏览器自身冲突。什么！？！我们以 Chrome 为例，Chrome 的插件是基于 JavaScript 的，并且当页面加载完成之后，所有已经安装的插件将运行在你的页面上。你永远不知道你的用户会安装什么样的插件，那么这些插件暴露的全局变量就可能与你的代码冲突。这也许有些牵强？好吧，这只是一种可能，但是我的确遇到一个高调的网站（我不会说是哪一个）面临了这种问题，当我使用这个网站时，却发现它被损坏了。我认识这个网站的开发人员，因此我联系了他们，经过反复排查，结果发现是一个安装的插件导致了网站的崩溃。我联系了插件的开发者，然后他们更新了他们的代码，现在一切才恢复正常。

## 保护自己的各种方式 ##

虽然上面的代码片段都很短并且很简单，他们都暴露的太多的变量到全局命名空间中。所以，我们如何保护我们的代码呢？

- **对象字面量**
  防止全局扩散最简单的方式是，将一些全局变量放在一个中心的对象字面量上。

```javascript
// 将 type & attack 属性放在 bird 这个对象字面量上
var bird = {
    type: "Red",
    attack: function() {
        console.log( this.type + " Bird Attacks!" );
    }
};
 
console.log( window.bird );          // 只有一个全局对象
console.log( window.bird.type );     // Red
console.log( window.bird.attack() ); // Red Bird Attacks! 
```

- **立即执行的函数表达式**
  立即执行的函数表达式（IIFE）是解决全局变量问题的另一种方式，这种方式比对象字面量更复杂，但也提供能更强大的功能。这种方式允许开发人员暴露公共和私有的属性、方法给使用者。在进去正题之前，我们先看看这种方式的一些奇怪的语法，JavaScript 变量的作用域是通过函数作用域来决定的，而没有块级作用域的概念。因此，如果你在 `if` 语句内声明一个变量，这个变量将在包含这个 `if` 语句的函数的任何位置都将可用，这也许对于那些惯于使用 C、C++、C#、Java 和 类似语言的开发者有些震惊。下面，我们将利用函数作用域这一特性来创建一个匿名函数（没有名字的函数），并立即调用它。

```javascript
// Error: JavaScript 不能正确解析这段代码
function() {
    // 所有变量或函数都包含在这个范围
}(); // <-- 立即调用
```

不幸的是，上面这段代码并不能被正确执行，因为 JavaScript 不能正确解析这段代码。思路是对的，但是实现有一点点偏差。值得庆幸的，有一种简单的方式让 JavaScript 知道我们在做什么，就是用一组额外的括号包裹这个表达式。

```javascript
// JavaScript 能够正确解析
(function() {
    // 所有变量或函数都包含在这个范围
}()); // <-- 立即调用
```

译者注：立即执行的函数还有另外一种书写方式，后面会有介绍：

```javascript
// JavaScript 能够正确解析
(function() {
    // 所有变量或函数都包含在这个范围
})(); // <-- 立即调用
```

下面的模式是大家所熟知的暴露模块模式（Revealing Module Pattern）。你应该注意到，使用立即执行的函数创建了一个特殊的函数作用域，并且，需要特别注意的是，在结尾处返回了作用域中那些你想作为公共的属性，剩下的那些没有被返回的将会成为私有属性。

```javascript
// Revealing Module Pattern
var bird = (function() {
    var type = "Red",
        power = "IIFE", // 这将是私有的
        attack = function() {
            console.log( type + " Bird Attacks with an " + power +  "!" );
        };
    
    return { // 只有被返回的那些才是公共的
        type: type,
        attack: attack
    };
}());
 
console.log( window.bird );          // 只有一个全局变量
console.log( window.bird.type );     // 公共属性
console.log( window.bird.attack() ); // 公共方法，并能访问私有变量
console.log( window.bird.power );    // 私有变量，将不能被访问（执行到这里将会报错） 
```

你可能也遇到过下面这种替代语法，它在很多库和框架中很流行。这种模式仍然使用了 IIFE，但是传入了一个全局变量作为命名空间。`window.bird = window.bird || {}` 这段代码，是一种奇特的方式来检查 `bird` 对象是否已经存在，如果不存在就创建一个新对象。在立即执行的函数内部，任何附加到 `bird` 对象的变量或方法都将是公共的，而其他的都将是私有的。这种模式的好处是，它可以重复使用，用各种组件来构建一个库。

```javascript
(function( bird ) {
    var power = "IIFE"; // 这将是私有的
    
    bird.type = "Red";
    bird.attack = function() {
        console.log( bird.type + " Bird Attacks with an " + power + "!" );
    };
}( window.bird = window.bird || {} ));
 
console.log( window.bird );          // 只有一个全局对象
console.log( window.bird.type );     // 公共属性
console.log( window.bird.attack() ); // 公共方法，并能访问私有变量
console.log( window.bird.power );    // 私有变量，将不能被访问（执行到这里将会报错） 
```

## 进攻！ ##

下面是一个用 [boxbox](http://incompl.github.com/boxbox/) 构建的简版 Angry Birds，boxbox 是一个用于 [box2dweb](https://code.google.com/p/box2dweb/) 的物理学框架，由 [Bocoup](http://bocoup.com/) 的 [Greg Smith](http://twitter.com/_gsmith) 编写。

> 按下空格键来发射红色小鸟，你也可以使用方向键。

![](http://bubkoo.qiniudn.com/angry-birds-jsfiddle-shadow.png)

## 结论 ## 
这些技术对一个前端应用程序是至关重要的，因为它可以保护自己免受其他代码的干扰，并且提供了一种方式来封装组织你的代码。

还有很多其他的前端架构技术也被猪偷走了。接下来，另一只愤怒的小鸟将继续复仇！Dun, dun, daaaaaaa!

<p class="j-quote">原文： [Angry Birds of JavaScript- Red Bird: IIFE](http://www.elijahmanor.com/angry-birds-of-javascript-red-bird-iife/)</p>