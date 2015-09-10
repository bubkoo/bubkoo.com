title: 绿色小鸟 - 模拟请求和模拟数据
date: 2014-04-17 21:39:20
updated: 2014-04-17 21:39:20
tags: [Architecture,Mock]
categories: [JavaScript]
keywords:
---
![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-green-bird-mocking.png)

一群恶魔的猪从无辜的小鸟那里偷走了所有的前端架构，现在它们要夺回来。一对特工英雄（愤怒的小鸟）将攻击那些卑鄙的猪，直到夺回属于他们的前端架构。（译者注：本系列是关乎前端架构的讨论，作者借用当前最风靡的游戏 - 愤怒的小鸟，为我们揭开了前端架构的真实面目。）

小鸟们最终能取得胜利吗？它们会战胜那些满身培根味的敌人吗？让我们一起来揭示 JavaScript 之愤怒的小鸟系列的另一个扣人心弦的章节！

> 阅读本系列的[介绍文章](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-series/)，查看所有小鸟以及它们的进攻力量。

## 战况

- [红色大鸟 - 立即调用的函数表达式](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-red-bird-iife/)
- [蓝色小鸟 - 事件](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-blue-bird-events/)
- [黄色小鸟 - 模块化、依赖管理、性能优化](http://bubkoo.com/2014/03/29/angry-birds-of-javascript-yellow-bird-requirejs/)
- [黑色小鸟 - 前端分层架构](http://bubkoo.com/2014/03/29/angry-birds-of-javascript-black-bird-backbone/)
- [白色小鸟 - 代码质量和代码分析](http://bubkoo.com/2014/04/14/angry-birds-of-javascript-white-bird-linting/)

## 绿色小鸟的攻击力

![](http://bubkoo.qiniudn.com/angry-birds-green-bird.png)

本文将介绍绿色小鸟，它可以穿透那些难以抵达的地方，并且伪装和监视那些偷东西的小猪，这正是他们的攻击力。渐渐地，他们夺回了属于他们的东西。

<!--more-->

## 猪猪偷走了什么

大多数鸟都是前端开发人员，不怎么关注后端。结果小鸟和水牛就形成了共生关系，水牛编写后端代码，小鸟做前端开发。这种安排有个问题就是，当水牛们正在做后端开发时，小鸟们只能在旁边玩弄自己的羽毛，直到后端开发完成。然而，一旦完成后端开发，项目的交付压力就落在了小鸟们身上，而水牛们却在树荫下的水坑中悠哉。幸运的是，不久前一只绿色小鸟提出了模拟后端服务的想法，这样在它们在等待水牛完成后端开发的同时，也能同步进行前端开发。同时，它还引入了一些很方便的库，使模拟过程变得更加容易。

但是，在小猪的进攻过程中，小鸟们的模拟库被偷走了。然后，一只绿色小鸟被派去夺回被偷走的东西。它将使用具有颠覆力量的诡计去夺回本属于它们的东西。

## Twitter 应用

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-green-bird-mocking-twitter.jpg)

我们一起来一个简单的 Twitter 应用，根据用户名获取 Twitter 消息。为什么是 Twitter？因为愤怒的小鸟们与 Twitter 有特殊的关系，尤其是蓝色小鸟 ;)

下面的应用使用 JSONP 从 Twitter 获取数据，我曾经想使用 Backbone 来编写这个应用，但是考虑到这样做可能会使模拟（mocking）的概念不是那么清晰，并且我也没有使用模板引擎，我是故意这样做的，另一只愤怒的小鸟将介绍模板引擎的概念 ;)

```javascript
(function( twitter, $, undefined ) {
 
    var channel = twitter.channel = postal.channel(),
        URL_TEMPLATE = "https://api.twitter.com/1/statuses/user_timeline/" + 
            "%(userName)s.json?count=%(count)s&include_rts=1",
        $selection = null;
        
    twitter.selector = null;
 
    twitter.init = function( selector ) {
        twitter.selector = selector;
        
        channel.subscribe( "tweets.available", twitter.displayTweets );    
    };
    
    twitter.displayTweets = function( tweets ) {
        var $list = $( "<ul/ >" ),
            $location = $selection || $( twitter.selector );
        
        // This would be better suited for a templating engine,
        // but that's for another Angry Bird ;)
        $.each( tweets || {}, function( index, tweet ) {
            var html = "<i>" + moment( tweet.created_at ).fromNow() + "</i>: ";
            html += "<b>" + tweet.user.name + "</b> - ";
            html += tweet.text;
            html += tweet.retweeted ? " <i class='icon-repeat'></i>" : "";
            html += tweet.favorited ? " <i class='icon-star'></i>" : "";
            
            $( "<li />", { html: html }).appendTo( $list );         
        });
            
       $location.append( $list.children() );         
    };
    
    twitter.getTweets = function( userName, count ) {
        var url = _.string.sprintf( URL_TEMPLATE, { 
                userName: userName, 
                count: count || 5 
            });
 
        $.ajax({
            url: url,
            dataType: "jsonp",
            success: function( tweets ) {
                channel.publish( "tweets.available", tweets );
            }
        });                
    };
    
}( window.twitter = window.twitter || {}, jQuery ));
 
twitter.init( ".tweets" );
 
$( document ).on( "click", "button", function( e ) {
    var $input = $( this ).closest( "form" ).find( "input" );
    
    e.preventDefault();                                                 
    twitter.getTweets( $input.val() || "elijahmanor" );    
});
```

上面的代码片段用 jsFiddle 嵌入在了下面

## 使用 api.twitter.com 的 Twitter 应用

<iframe allowfullscreen="allowfullscreen" frameborder="0" height="300" src="http://jsfiddle.net/KXr8U/1/embedded/result,html" width="100%"></iframe>

从 Twitter 返回的数据看起来像下面的截图：

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-green-bird-mocking-twitter-raw.png)

## 模拟静态数据

如果 Twitter 服务器挂掉了，或者不稳定，或者你只是想在没有联网的情况下测试你的应用，会怎么样呢？这个时候模拟后端服务的优势就凸显出来了。我们可以使用 Mockjax 这个 jQuery 库，你只需要调用 `$.mockjax` 方法，并提供你想监听的 `url` 和你想要返回的数据。下面是一个模拟 api.twitter.com 并返回一些静态数据的示例。

```javascript
$.mockjax({
    url: "https://api.twitter.com/1/statuses/user_timeline/*",
    responseTime: 750,
    responseText: [
        { id: 0, created_at: "Mon Apr 11 8:00:00 +0000 2012",  text: "Test Tweet 1",
            favorited: false, retweeted: false, user: { name: "User 1" } },
        { id: 1, created_at: "Mon Apr 11 9:00:00 +0000 2012",  text: "Test Tweet 2",
            favorited: true,  retweeted: true,  user: { name: "User 2" } },
        { id: 2, created_at: "Mon Apr 11 10:00:00 +0000 2012", text: "Test Tweet 3",
            favorited: false, retweeted: true,  user: { name: "User 3" } },
        { id: 3, created_at: "Mon Apr 11 11:00:00 +0000 2012", text: "Test Tweet 4",
            favorited: true,  retweeted: false, user: { name: "User 4" } },
        { id: 4, created_at: "Mon Apr 11 12:00:00 +0000 2012", text: "Test Tweet 5",
            favorited: true,  retweeted: true,  user: { name: "User 5" } }
    ]
});
```

这样前端开发就于后端独立开来，不仅这个很酷，在编写 AJAX 的单元测试时也非常方便。

上面的代码片段用 jsFiddle 嵌入在了下面。

## 使用 Mockjax 的 Twitter 应用

<iframe allowfullscreen="allowfullscreen" frameborder="0" height="300" src="http://jsfiddle.net/ufqPC/1/embedded/result,html" width="100%"></iframe>

从 Mockjax 返回的数据看起来像下面这样：

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-green-bird-mocking-twitter-mock-static.png)

## 模拟动态随机数据
这种方式的一个缺点就是，静态的数据让开发者逐渐变得缺乏想象和懒惰。我通常的做法是，仍然使用相同的对象，只是在某些值上面加 1 或者其他一些东西。这样做很不错，但也很麻烦，而且还耗时，还不能让你了解真正的 UI 可能的样子。辛运的是，有一个非常好的库 - mockJSON，你需要为你的真实数据提供一个模板，指定字段的类型、长度等信息。下面是我重写后的代码，这将随机生成 5 到 10 个要显示的消息对象。

```javascript
$.mockjax({
    url: "https://api.twitter.com/1/statuses/user_timeline/*",
    responseTime: 750,
    response: function() {
        var data = $.mockJSON.generateFromTemplate({
            "tweets|5-10": [{
                "id|+1": 0, 
                "created_at": "Mon Apr 11 @TIME_HH:@TIME_MM:@TIME_SS +0000 2012",
                "text": "@LOREM_IPSUM",
                "favorited|0-1": false,
                "retweeted|0-1": false,
                "user": { "name": "@MALE_FIRST_NAME @LAST_NAME" }
            }]
        });
        
        this.responseText = data.tweets;
    }
});
```

上面的代码用 jsFiddle 嵌入在了下面的页面中。

## 使用 Mockjax 和 mockJSON 的 Twitter 应用

<iframe allowfullscreen="allowfullscreen" frameborder="0" height="300" src="http://jsfiddle.net/cHS9q/1/embedded/result,html" width="100%"></iframe>

使用 Mockjax 和 mockJSON 返回的数据看起来像下面这样：

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-green-bird-mocking-twitter-mock-dynamic.png)

## 进攻

下面是一个用 [boxbox](http://incompl.github.com/boxbox/) 构建的简易版 Angry Birds，boxbox 是一个用于 [box2dweb](https://code.google.com/p/box2dweb/) 的物理学框架，由 [Bocoup](http://bocoup.com/) 的 [Greg Smith](http://twitter.com/_gsmith) 编写。

> 按下空格键来发射绿色小鸟，你也可以使用方向键。

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-green-bird-mocking-attack.png)

## 结论

前后端分离开发或许有些困难，还好有一些技术和库可以使前端开发和原型构建与后端开发独立开。模拟静态数据还可以帮助开发人员进行单元测试。

还有很多其他的前端架构技术也被猪偷走了。接下来，另一只愤怒的小鸟将继续复仇！Dun, dun, daaaaaaa!

<p class="j-quote">原文：[Angry Birds of JavaScript- Green Bird: Mocking](http://www.elijahmanor.com/angry-birds-of-javascript-green-bird-mocking/)</p>