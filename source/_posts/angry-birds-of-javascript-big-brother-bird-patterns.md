title: 大兄弟 - 设计模式
date: 2014-04-19 00:39:52
tags: [Architecture,Pattern]
categories: [JavaScript]
keywords:
---

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-big-brother-bird-patterns.jpg)

一群恶魔的猪从无辜的小鸟那里偷走了所有的前端架构，现在它们要夺回来。一对特工英雄（愤怒的小鸟）将攻击那些卑鄙的猪，直到夺回属于他们的前端架构。（译者注：本系列是关乎前端架构的讨论，作者借用当前最风靡的游戏 - 愤怒的小鸟，为我们揭开了前端架构的真实面目。）

小鸟们最终能取得胜利吗？它们会战胜那些满身培根味的敌人吗？让我们一起来揭示 JavaScript 之愤怒的小鸟系列的另一个扣人心弦的章节！

> 阅读本系列的[介绍文章](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-series/)，查看所有小鸟以及它们的进攻力量。

## 战况

- [红色大鸟 - 立即调用的函数表达式](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-red-bird-iife/)
- [蓝色小鸟 - 事件](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-blue-bird-events/)
- [黄色小鸟 - 模块化、依赖管理、性能优化](http://bubkoo.com/2014/03/29/angry-birds-of-javascript-yellow-bird-requirejs/)
- [黑色小鸟 - 前端分层架构](http://bubkoo.com/2014/03/29/angry-birds-of-javascript-black-bird-backbone/)
- [白色小鸟 - 代码质量和代码分析](http://bubkoo.com/2014/04/14/angry-birds-of-javascript-white-bird-linting/)
- [绿色小鸟 - 模拟请求和模拟数据](http://bubkoo.com/2014/04/17/angry-birds-of-javascript-green-bird-mocking/)
- [橙色小鸟 - 模板引擎](http://bubkoo.com/2014/04/18/angry-birds-of-javascript-orange-bird-templating/)

## 大兄弟的攻击力

![](http://bubkoo.qiniudn.com/angry-birds-big-brother-bird.png)

本文我们将看看大兄弟，它拿出了重武器：有限状态机和成熟的设计模式，渐渐的，它们逐一夺回了本属于它们的东西

<!--more-->

## 猪猪偷走了什么

鸟儿们了解编程的大部分知识，但对于一些大家都能理解的通用场景，他们还没有形成共同的术语。一天大兄弟到来了，并为常见设计模式做了命名和描述的文档，这样，当鸟儿们在讨论架构时都能使用相同的术语。后来大兄弟的术语广受欢迎，最终成文著名的**四人帮**一书。但是，在最近的一次进攻过程中，小猪偷走了四人帮一书，大兄弟就被指派去夺回该书。它将使用势不可挡的力量摧毁猪群，夺回本属于它们的东西。

## 四人帮的设计模式

### 创建模式

- 抽象工厂模式
- 构造器模式
- 工厂模式
- 原型模式
- 单例模式

### 行为模式

- 责任链模式
- 命令模式
- 解释器模式
- 迭代器模式
- 中介模式
- 备忘录模式
- 观察者模式
- 状态模式
- 策略模式
- 模板方法模式
- 访问者模式

### 结构模式

- 适配器模式
- 桥接模式
- 组合模式
- 装饰模式
- 外观模式
- 享元模式
- 代理模式

## JavaScript 中的一些设计模式

### 单例模式

单例模式最简单的形式就是对象字面量，像下面代码这样，我们只是简单地创建了一个对象。从技术上讲，有人或许会建议使用 `Object.create`，但大多数情况下，对象字面量的方式就已经满足单例模式的定义了。你可以在本文末尾的附加资源中找到更高级的解决方案。

```javascript
var bird = {
    type: "Red",
    fly: function() {
        console.log( "Weeeee!" );
    },
    destroy: function() {
        console.log( "Hasta la vista, baby!" );
    }
};
```

### 工厂模式

工厂模式就是在不使用 `new` 关键字的情况下创建一个对象的方式，核心在于在工厂方法内部用抽象的方式来创建对象。在下面的示例中，我们不需要太多的花招，就可以按照这种方式来添加一些自定的代码，而不会额外修改 API，这就是工厂模式的关键点所在。 

```javascript
var Bird = function() {};
Bird.factory = function( type ) {
    var bird;
    if ( typeof Bird[ type ] === "function" ) {
        bird = new Bird[ type ]();
    }
    return bird;
};
 
Bird.Red = function() {};
Bird.Blue = function() {};
 
var redBird = Bird.factory( "Red" );
var blueBird = Bird.factory( "Blue" );
```

### 桥接模式

在下面代码中，我们在时间处理程序和将要执行的代码之间建立了一个简单的桥接，从而使被执行的代码更易于测试，因为它不在依赖于 jQuery 返回的上下文元素。

```javascript
// 普通方式
var getUrl = function() {
    var url = $( this ).attr( "href" );
    
    $.ajax({
        url: url,
        success: function( data ) {
            console.log( data );
        }
    });
};
$( "a.ajax" ).on( "click", getUrl );
 
// 桥接模式
var getUrl = function( url, callback ) {
    $.ajax({
        url: url,
        success: function( data ) {
            if ( callback ) { callback( data ); }
        }
    });
};
var getUrlBridge = function() {
    var url = $( this ).attr( "href" );
    
    getUrl( url, function( data ) {
        console.log( data );
    });
}
$( "a.ajax" ).on( "click", getUrlBridge );
```


### 外观模式

外观模式在前端开发中很普遍，因为有太多的跨浏览器问题。外观模式为这种不统一提供了一个统一的 API。在下面代码中，我们为各个浏览器抽象出了一个统一的添加事件监听的方法。

```javascript
/ Facade
var addEvent = function( element, type, eventHandler ) {
	if ( element.addEventListener ) {
		element.addEventListener( type, eventHandler, false );
	} else if ( elemement.attachEvent ) {
		element.attachEvent( "on" + type, eventHandler );    
	}
};
```


### 适配器模式

适配器模式是实现代码之间合作的方式。当你需要切换到使用其它库，而又不能忍受重写大量代码时，适配器模式将非常凑效。在下面代码中，我修改了 jQuery 的 `$.when` 方法，使其与 `WinJS.Promise` 方法兼容。这是我在 appendTo 工作时写的代码，当时我们希望在 Windows 8 APP 中可以使用 jQuery。你可以在 [jquery-win8](https://github.com/appendto/jquery-win8) 中找到这段代码。

> jquery-win8 库的大部分功能已经不再需要了，因为 Jonathan Sampson 已经与 jQuery 开发团队一起协作，以确保他对这一垫片的更新被添加到 jQuery 2.0 版本中，[这篇文章](http://appendto.com/blog/2013/03/windows-store-applications-with-jquery-2-0/)记录了这一点。

```javascript
/*!
 * jquery-win8-deferred - jQuery $.when that understands WinJS.promise
 * version: 0.1
 * author: appendTo, LLC
 * copyright: 2012
 * license: MIT (http://www.opensource.org/licenses/mit-license)
 * date: Thu, 01 Nov 2012 07:38:13 GMT
 */
 (function () {
    var $when = $.when;
    $.when = function () {
        var args = Array.prototype.slice.call(arguments);
 
        args = $.map(args, function (arg) {
            if (arg instanceof WinJS.Promise) {
                arg = $.Deferred(function (dfd) {
                    arg.then(
                        function complete() {
                            dfd.resolveWith(this, arguments);
                        }, function error() {
                            dfd.rejectWith(this, arguments);
                        }, function progress() {
                            dfd.notifyWith(this, arguments);
                        }
                    );
                }).promise();
            }
 
            return arg;
        });
 
        return $when.apply(this, args);
    };
}());
```

### 观察者模式

我已经在本系列的 [Blue Bird](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-blue-bird-events/) 一文中阐述了观察者模式，这是一个强大的模式，可以实现各种组件的解耦。个人推荐使用 [postal.js](https://github.com/postaljs/postal.js) 库。

## 更多模式

### 继承

在 JavaScript 中实现继承有多种方式，当你在应用中创建对象时，最好了解一下下面的这些方式。

#### 原型继承

```javascript
var bird = {
    name: "Red Bird",
    power: "",
    getName: function() {
        return this.name;
    },
    catapult: function() {
        return this.name + " is catapulting with " + this.power;
    }
};
 
var yellowBird = Object.create( bird );
yellowBird.name = "Yellow Bird";
yellowBird.power = "Speed";
console.log( yellowBird.catapult() );
```


#### 模拟继承

```javascript
var Bird = function( name, power ) {
    this.name = name + " Bird";
    this.power = power || "";
};
Bird.prototype.getName = function() {
    return this.name;
};
Bird.prototype.catapult = function() {
    return this.getName() + " is catapulting with " + this.power;
};
 
var YellowBird = function() {
    this.constructor.apply( this, arguments );
};
YellowBird.prototype = new Bird();
 
var yellowBird = new YellowBird( "Yellow", "Speed" );
yellowBird.getName = function() {
  return "Super Awesome " + this.name;
};
console.log( yellowBird.catapult() );
```


### 链式调用

由于 jQuery 库，链式调用在前端开发中变得流行起来。其实实现起来非常简单，你只需要在每一个方法结束时返回 `this`，这样就可以立即调用对象中的其它方法，请看下面的例子。

```javascript
var bird = {
    catapult: function() {
        console.log( "Yippeeeeee!" );
        return this;
    },
    destroy: function() {
        console.log( "That'll teach you... you dirty pig!" );
        return this;
    }
};
 
bird.catapult().destroy();
```


### 封装模式

我在 [Red Bird](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-red-bird-iife/) 一文中已经阐述了封装模式，只不过当时说的是 IIFE。封装模式允许你拥有公共和私有的属性和方法，以此来封装你的代码。下面是一个非常简单的示例。更多细节请参阅文章 [Red Bird](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-red-bird-iife/)。

```javascript
// IIFE
var yellowBird = (function() {
    var superSecret  = {
        power: "Speed" 
    };
    
    return {
        type: "Red",
        mood: "Angry",
        goal: "Vengence"
    }
}());
```

### 有限状态机

有限状态机是我最喜欢的模式之一，我的朋友 Jim Cowart ([@ifandelse](http://twitter.com/ifandelse)) 创建了 [Machina.js](https://github.com/ifandelse/machina.js) 库来在 JavaScript 中实现这一模式，更多信息请参考他的[博客文章](http://freshbrewedcode.com/jimcowart/2012/03/12/machina-js-finite-state-machines-in-javascript/)和 [GitHub 库](https://github.com/ifandelse/machina.js)。下面示例是使用状态机来描述愤怒的小鸟。 

```javascript
var attackFsm = new machina.Fsm({
    initialState: "idle",
    states : {
        "idle" : {
            _onEnter: function() {
                this.handle( "Zzzzzz" );
            },
            "bird.launch" : function( data ) {
                console.log( "Weeeeee at " + data.angle + " degrees!" );
                this.transition( "attacking" );
            }
        },
        "attacking" : {
            _onEnter: function() {
                console.log( "Yay, hear me tweet!" );
            },
            "pig.destroyed" : function() {
                this.transition( "victorious" );
            },
            "pig.alive" : function() {
                this.transition( "defeated" );
            }
        },
        "victorious": {
            _onEnter: function() {
                console.log( "Yay, we are victorious!" );
            },
            "game.restart": function() {
                this.transition( "idle" );
            },
            "game.next": function() {
                // Goto next level
                this.transition( "idle" );
            }
        },
        "defeated": {
            _onEnter: function() {
                console.log( "You may have won this time, but I'll be back!" );
            },
            "gmae.restart": function() {
                this.transition( "idle" );
            }
        }
    }
});
 
attackFsm.handle( "bird.launch", { angle: 45 } );
attackFsm.handle( "pig.destroyed" );
```


## 建议

除了学习这些设计模式之外，我建议你选择一个你最喜欢的库，然后深入研究它的源代码，你可以从中学到有价值的东西。起初时某些代码可能很难理解，但坚持一段时间后，你可以从那些真正理解这些设计模式的库开发者身上学到很多干货。你也可以选择其中某个特别的方法并深入研究它，如果你不知道到哪里去寻找这样的特别方法，为什么不选择 jQuery？并使用 James Padolsey ([@padosley](http://twitter.com/padosley)) 的 [jQuery Source Viewer](http://james.padolsey.com/jquery/) 来帮你寻找。

## 附加资源

有太多的设计模式，以至于我无法一一在此列出，在我之前已经有太多关于设计模式的博客，而已还会有更多。如果我错过了任何好的设计模式，请告知我。

- [JavaScript Design Patterns](http://www.joezimjs.com/javascript/javascript-design-patterns-singleton/) by Joe Zim ([@JoeZimJS](http://twitter.com/JoeZimJS))
- [Understanding Design Patterns in JavaScript](http://net.tutsplus.com/tutorials/javascript-ajax/digging-into-design-patterns-in-javascript/) by Tilo Mitra ([@tilomitra](http://twitter.com/tilomitra))
- [Learning JavaScript Design Patterns](http://addyosmani.com/resources/essentialjsdesignpatterns/book/) by Addy Osmani ([@addyosmani](http://twitter.com/addyosmani))
- [JS Patterns](http://shichuan.github.io/javascript-patterns/) by Shi Chuan ([@shichuan](http://twitter.com/shichuan))
- [JavaScript Patterns](http://shop.oreilly.com/product/9780596806767.do) by Stoyan Stefanov ([@xyz](http://twitter.com/xyz))
- [JavaScript: The Good Parts](http://shop.oreilly.com/product/9780596517748.do) by Douglas Crockford

## 进攻

下面是一个用 [boxbox](http://incompl.github.com/boxbox/) 构建的简易版 Angry Birds，boxbox 是一个用于 [box2dweb](https://code.google.com/p/box2dweb/) 的物理学框架，由 [Bocoup](http://bocoup.com/) 的 [Greg Smith](http://twitter.com/_gsmith) 编写。

> 按下空格键来发射大兄弟，你也可以使用方向键。

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-big-brother-bird-patterns-attack.png)

## 结论

你不知道所有的这些设计模式也能完成前端开发，但是了解一些经常重复使用的设计模式确实大有益处。一旦习惯使用这些设计模式，架构设计时变得更加容易，也可以更快找到解决方案。你可以花一些时间去学习附加资源中的东西，然后着手选择适合目前的你的设计模式。

还有很多其他的前端架构技术也被猪偷走了。接下来，另一只愤怒的小鸟将继续复仇！Dun, dun, daaaaaaa!

<p class="j-quote">原文：[Angry Birds of JavaScript- Big Brother Bird: Patterns](http://www.elijahmanor.com/angry-birds-of-javascript-big-brother-bird-patterns/)</p>
