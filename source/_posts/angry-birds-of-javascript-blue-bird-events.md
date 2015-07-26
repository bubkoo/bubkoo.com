title: 蓝色小鸟 - 事件
date: 2014-03-28 21:35:58
updated: 2014-03-28 21:35:58
tags: [Architecture,Event]
categories: [JavaScript]
keywords:
---
![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-blue-bird-events.png)

## 介绍 ##

一群恶魔的猪从无辜的小鸟那里偷走了所有的前端架构，现在它们要夺回来。一对特工英雄（愤怒的小鸟）将攻击那些卑鄙的猪，直到夺回属于他们的前端架构。（译者注：本系列是关乎前端架构的讨论，作者借用当前最风靡的游戏 - 愤怒的小鸟，为我们揭开了前端架构的真实面目。）

小鸟们最终能取得胜利吗？它们会战胜那些满身培根味的敌人吗？让我们一起来揭示 JavaScript 之愤怒的小鸟系列的另一个扣人心弦的章节！

> 阅读本系列的[介绍文章](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-series/)，查看所有小鸟以及它们的进攻力量。

## 战况 ##

- [红色大鸟 - 立即调用的函数表达式](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-red-bird-iife/)

## 蓝色小鸟的攻击力 ##

![](http://bubkoo.qiniudn.com/angry-birds-blue-bird-1.png)

在这篇文章中，我们将看看蓝色小鸟，它通过触发事件和消息来渗透进猪猪的城堡中，慢慢的，小鸟们将一个接一个地夺回本属于他们的东西。

<!--more-->

## 猪猪偷走了什么 ##

小鸟们曾经使用组件化的方式来构建 web 应用，但是组件之间有强依赖关系，它们最终开始学习，并引入了消息和事件机制来降低组件之间的耦合度。不幸的是，在进攻过程中，猪猪偷走了它们的观察者模式。

其中一只蓝色小鸟被指派去夺回被盗走的东西，并恢复松散耦合的组件。

## 示例程序 ##

我们将以下面的 web 应用为例，来解释消息的必要性。这个应用的功能是从 Netflix 上搜索电影，我将展示这个应用的原始代码，然后重构它。

<iframe allowfullscreen="allowfullscreen" frameborder="0" height="350" src="http://jsfiddle.net/LrFVp/14/embedded/result" width="100%"></iframe>

## 紧耦合的代码 ##

上面应用的第一个版本是用如下方式编写，看看这段代码，试着理解它。这可能很痛苦，但还请稍微忍耐一下 ;)

```javascript
$( document ).on( "click", ".term", function( e ) {
    $( "input" ).val( $( this ).text() );
    $( "button" ).trigger( "click" );
});
 
$( "button" ).on( "click", function( e ) {
    var searchTerm = $( "input" ).val(),
        url = "http://odata.netflix.com/Catalog/Titles?$filter=substringof('" + 
            escape( searchTerm ) + "',Name)&$callback=callback&$format=json";
 
    $( ".help-block" ).html( function( index, html ) {
        return e.originalEvent ? 
            html + ", " + "<a href='#' class='term'>" + searchTerm + "</a>" : html;
    });
 
    $.ajax({
        dataType: "jsonp",
        url: url,
        jsonpCallback: "callback",
        success: function( data ) {
            var rows = [];
            $.each( data.d.results, function( index, result ) {
                var row = "";
                if ( result.Rating && result.ReleaseYear ) {
                    row += "<td>" + result.Name + "</td>";
                    row += "<td>" + result.Rating + "</td>";
                    row += "<td>" + result.ReleaseYear + "</td>";
                    row = "<tr>" + row + "</tr>";
                    rows.push( row );
                }
            });
            $( "table" ).show().find( "tbody" ).html( rows.join( "" ) );
        }
    });
});
```

上面的代码示例是一个典型的 jQuery 例子，在网上随处可见。这段代码可以工作，但是在同个位置处理了许多不同的事务，你可以发现，事件处理、获取数据和处理数据都混杂在了同一个地方。可以想象，随着时间推移，这段代码可能变得越来越庞大，也变得越来越容易发生错误。

在继续深入之前，我们先看看事件具体是什么，它有些什么类型。

## 事件类型 ##

### 观察者事件 ###

如果你熟悉前端开发，观察者事件很可能是你最常用的一种事件。对于 DOM 来说，你可以将这种事件看着是给 DOM 元素添加事件处理函数，DOM 元素直接引用了事件的回调函数，当指定的事件发送时，回调函数将被执行。

#### 例子 ####

```javascript
document.getElementById( "bird" )
    // 用原生的 addEventListener 方法给 DOM 元素添加事件
    .addEventListener( "click", function() { console.log( "Catapult!" ); }, false );
 
$( "#bird" )
    // Old school event helpers attaches observer to the DOM element
    .click( function() { console.log( "Flying through the air..." ); } )
    // Old school bind method attaches observer to the DOM element
    .bind( "click", function() { console.log( "COWABUNGA!" ); } )
    // New school 2 parameter on method attaches observer to the DOM element
    .on( "click", function() { console.log( "Destroy those pesky pigs!" ); } );
 
// Event is triggered and the list of observers are notified
$( "#bird" ).trigger( "click" );
```

## 媒介事件 ##

在最近几年中媒介事件变得越来越普遍，其核心思想是，用一个实体来管理订阅和发布消息，与观察者事件最大的不同在于，媒介事件不会直接绑定在触发事件的对象上。

> 这就是设计模式中的发布订阅模式，或者叫观察者模式

#### 例子 ####

```javascript
var channel = postal.channel(),
    $lastUpdated = $( "#lastUpdated" );
 
// 订阅 bird.launch 消息
channel.subscribe( "bird.launch", function( data ) {
    console.log( "Launch the blue birds at a " + data.angle + " angle!" );
});
 
// 订阅 bird.reset 消息
channel.subscribe( "bird.reset", function( data ) {
    console.log( "Resetting blue birds to the catapult." );
});
 
// 订阅满足 bird.* 通配符格式的消息
channel.subscribe( "bird.*", function( data ) {
    $lastUpdated.text( moment().format( "MMMM Do YYYY, h:mm:ss a" ) ); 
});
 
// 发布消息，并附带可选的参数
channel.publish( "bird.launch", { angle: 45 } );
channel.publish( "bird.reset" );
```


#### 实现 ####

有一些库可以让你方便地使用媒介事件，下面列举出了一些可择库，个人推荐使用 Jim [postal.js](https://github.com/postaljs/postal.js) 库。

- Ben Alman's ([@cowboy](http://twitter.com/cowboy)) [Tiny jQuery Pub/Sub](https://github.com/cowboy/jquery-tiny-pubsub) library
- Peter Higgin's ([@phiggins](http://twitter.com/phiggins)) [pubsub.js](https://github.com/phiggins42/bloody-jquery-plugins/blob/master/pubsub.js) library
- **Jim Cowart's ([@ifandelse](http://twitter.com/ifandelse)) [postal.js](https://github.com/postaljs/postal.js) library ← 推荐**
- Dustin Diaz's ([@ded](http://twitter.com/ded)) [reqwest](https://github.com/ded/reqwest) library
- appendTo's ([@appendTo](http://twitter.com/appendTo)) [AmplifyJS Pub/Sub](http://amplify.js/) component

## 混合事件 ##

另外一种事件则混合了观察者事件和媒介事件。这种事件看起来像是媒介事件，但是如果仔细看，你可以追述到事件的订阅者。jQuery 的代理模式就是一个很好的例子，代理模式很有用，但是它是基于 DOM 的事件冒泡机制，所以我们可以追踪到事件的来源。

```javascript
// Observer is attached to the #pigs element where impact events are delegated
$( "#pigs" ).on( "impact", ".pig", function( e ) {
    console.log( "I know which pig was impacted: " + e.target.innerHTML );
    console.log( "I know where the subscribers are listed: " + e.delegateTarget.id );
    console.log( "I can invoke another subscriber if I want!" );
    $._data( e.delegateTarget, "events" ).secret[ 0 ].handler( e );
    $( this ).text( "Bacon" );
});
 
$( "#pigs" ).on( "secret", ".pig", function( e ) {
    console.log( "Shh, I'm hiding. Don't tell anyone..." );
});
 
// 事件在 .pig 元素上触发并冒泡到 #pigs 元素上
$( ".pig:first" ).trigger( "impact" );
```

顺便说一下，我不推荐使用 `$._data()` 方法，因为它并没有出现在官方 API 文档中，因此不能保证在 jQuery 的以后的版本中可用，这是 jQuery 内部的一个帮助方法。但是，我这里想告诉你的是，在混合事件中，订阅者可以获取到一些在媒介事件中不能获取到的一些消息。别误会我的意思，我很喜欢 jQuery 的代理事件，这里只是为了演示混合事件是上面两种事件的组合。

## 该使用哪一个 ##

概念都梳理清楚了，那么我该使用哪种类型的事件呢，以及在什么时候使用？这是一个很好的问题，我的一个朋友 Jim 在他最近的一篇文章中也有提及该问题，下面是他文章中的一段引用...

> 在组件内部使用观察者事件，在组件之间使用媒介事件，不管怎么样，他们可以同时使用。 -[Jim Cowart](http://freshbrewedcode.com/jimcowart/2013/02/07/client-side-messaging-essentials/)

Jim 推荐在模块内部的通信时使用观察者事件（jQuery 的 `.on()` 方法），组件之间的通信则使用中介事件（postal.js）。

Jim 在他的文章中提出的另一项技术，就是将观察者事件和媒介事件合成在一起，这样可以两全其美，他展示了一些很棒的例子，我推荐你去看看他的文章，文章链接在下面的参考资源中用粗体标示出来了。

## 附加资源 ##

如果你对上述概念有兴趣并想获取更多信息，你可以考虑通过下面这些资源来了解更多关于事件的信息。

- **Jim Cowart's ([@ifandelse](http://twitter.com/ifandelse)) [Client-side Messaging Essentials](http://freshbrewedcode.com/jimcowart/2013/02/07/client-side-messaging-essentials/) article**
- Addy Osmani's ([@addyosmani](http://twitter.com/addyosmani)) [Understanding the Publish/Subscribe Pattern for Greater JavaScript Scalability](http://msdn.microsoft.com/en-us/magazine/hh201955.aspx) article
- Rebecca Murphey's ([@rmurphey](http://twitter.com/rmurphey)) [Loose Coupling with the pubsub Plugin](http://net.tutsplus.com/tutorials/javascript-ajax/loose-coupling-with-the-pubsub-plugin/) screencast

## 松散耦合的代码 ##

我原打算用 Backbone.js 或构造函数来编写下面的代码，但是为了保持简单和表达消息的理念，我把它们都移除了。因此，虽然这可能不是实际代码库的代码，但希望你一看就明白是什么意思。

```javascript
var channel = postal.channel();
 
$( document ).on( "click", ".term", function( e ) {
    var term = $( this ).text();
    
    e.preventDefault();
    $( "input" ).val( term );
    channel.publish( "searchTerm.changed", { term: term } );
});
 
$( "button" ).on( "click", function() {
    channel.publish( "searchTerm.changed", { term: $( "input" ).val() } );
});
 
channel.subscribe( "searchTerm.changed", function( data ) {
    netflix.getTitles( data.term, function( titles ) {
        channel.publish( "netflix.titles.updated", titles );
    });    
});
 
channel.subscribe( "searchTerm.changed", function( data ) {
    $( ".help-block" ).html( function( index, html ) {
        return ~html.indexOf( data.term ) ? html :
            html + ", " + "<a href='#' class='term'>" + data.term + "</a>";
    });
});
 
channel.subscribe( "netflix.titles.updated", function( titles ) {
    var rows = [];
    $.each( titles, function( index, result ) {
        var row = "";
        if ( result.Rating && result.ReleaseYear ) {
            row += "<td>" + result.Name + "</td>";
            row += "<td>" + result.Rating + "</td>";
            row += "<td>" + result.ReleaseYear + "</td>";
            row = "<tr>" + row + "</tr>";
            rows.push( row );
        }
    });
    $( "table" ).show().find( "tbody" ).html( rows.join( "" ) );
});
 
window.netflix = {
    getTitles: function( term, callback ) {
        var url = "http://odata.netflix.com/Catalog/Titles?$filter=substringof('" +
                escape( term ) + "',Name)&$callback=callback&$format=json";
      
        $.ajax({
            dataType: "jsonp",
            url: url,
            jsonpCallback: "callback",
            success: function( data ) { callback( data.d.results ); }
        });
    }
};
```


## 进攻 ##

下面是一个用 [boxbox](http://incompl.github.com/boxbox/) 构建的简版 Angry Birds，boxbox 是一个用于 [box2dweb](https://code.google.com/p/box2dweb/) 的物理学框架，由 [Bocoup](http://bocoup.com/) 的 [Greg Smith](http://twitter.com/_gsmith) 编写。

> 按下空格键来发射蓝色小鸟，你也可以使用方向键。如果花了很长时间也不能摧毁猪群，那么你可能要考虑多按几次空格键了 ;)

![](http://bubkoo.qiniudn.com/angry-birds-blue-bird-attack.png)

## 结论 ##

在你的 web 应用中使用事件和消息可以帮助通信，事件可以实现组件的内部通信，消息则可以使实现组件之间的监听，而不需要强依赖关系。

还有很多其他的前端架构技术也被猪偷走了。接下来，另一只愤怒的小鸟将继续复仇！Dun, dun, daaaaaaa!

<p class="j-quote">原文：[Angry Birds of JavaScript- Blue Bird: Events](http://www.elijahmanor.com/angry-birds-of-javascript-blue-bird-events/)</p>