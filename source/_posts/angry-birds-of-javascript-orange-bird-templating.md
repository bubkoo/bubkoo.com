title: 橙色小鸟 - 模板系统
date: 2014-04-18 21:39:35
updated: 2014-04-18 21:39:35
tags: [Architecture,Template]
categories: [JavaScript]
keywords:
---
![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-orange-bird-templating.jpg)

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

## 橙色小鸟的攻击力

![](http://bubkoo.qiniudn.com/angry-birds-Orange-bird.png)

本文我们将一起来看看橙色小鸟。开始时，它是一个简单的模板，然后被解析成为 DOM 对象，这明确传达了一个消息就是小鸟们是认真的。渐渐的，小鸟们一个接一个地夺回了本属于他们的东西。

<!--more-->

## 猪偷走了什么

近几年来，有一个趋势就是，Web 开发中越来越多的工作都由前端来完成。我们通过 AJAX 或者 Web Socket 与后端通信，然后将数据以某种方式渲染在 UI 上。大多数前端都是使用字符串拼接的方式来构建丰富的用户界面，这就出现了很多烦人的代码，并可能导致一些错误。这时，橙色小鸟走过来说：“嘿，我们有更好的方式吗？我们可以以某种方式将数据和视图分开吗？”，这就是模板引擎进入小鸟们世界的开端。橙色小鸟从人类那里借来了一些模板库，比如 Underscore.js 和 [Handlebar.js](http://handlebarsjs.com/)，来满足这种需求。

然而，在小猪进攻过程中，小鸟们的模板库被盗走了。现在，一只橙色小鸟被派去夺回失窃的模板库。它将使用爆炸性的力量去摧毁猪群，夺回本属于它们的东西。

## 为什么要使用模板引擎

开始深入之前，我们先看看为什么需要模板引擎。我开发的越多，就越想找到将应用各个部分分开的方式，将太多东西放在同一处让我觉得恶心。看看下面一段代码，然后告诉我你的感受...

```javascript
(function( twitter, $, undefined ) { 
    var _selection;
        
    twitter.init = function( $selection ) {
        _selection = $selection;
    };
    
    twitter.displayTweets = function( tweets ) {
        var $list = $( "<ul/ >" );
        
        $.each( tweets || {}, function( index, tweet ) {
            var html = "<i>" + moment( tweet.created_at ).fromNow() + "</i>: ";
            html += "<b>" + tweet.user.name + "</b> - ";
            html += "<span>" + tweet.text + "</span>";
            html += tweet.retweeted ? " <i class='icon-repeat'></i>" : "";
            html += tweet.favorited ? " <i class='icon-star'></i>" : "";
            
            $( "<li />", { html: html }).appendTo( $list );         
        });
            
       _selection.empty().append( $list.children() );         
    };
}( window.twitter = window.twitter || {}, jQuery ));
```

是吧，你也不喜欢字符串拼接的方式。我不希望在我的代码里面出现展现相关的代码。不过这样做它确实可以工作，你可以看到内嵌的 jsFiddle 的输出结果。

<iframe allowfullscreen="allowfullscreen" frameborder="0" height="200" src="http://jsfiddle.net/B4fJB/embedded/result,js,html" width="100%"></iframe>

那么我们将如何做呢？模板引擎就可以帮助我们简化我们的代码，并将 HTML 标签从代码中独立出来。

## Underscore.js

![Underscore](http://bubkoo.qiniudn.com/angry-birds-of-javascript-orange-bird-templating-underscore.png)

我们来看看 Underscore.js 库中提供的模板方法。在我最近的一些项目中我都趋向于使用 Underscore，因此我切实感受到了它的强大。如果我正在做的工作非常简单，那么我通常会默认使用 Underscore 模板引擎。然而，你会看到它有一些局限性，因此我们将看看下一个更吸引人的库。

### 示例1

下面就是使用 Underscore 模板引擎重新的上面示例的代码，你会发现代码大大地精简了！哈哈！


```javascript
twitter.displayTweets = function( tweets ) {
    var templateString = $( "#tweets-underscore" ).html(),
        template = _.template( templateString );
    
   _selection.empty().append( template( { tweets: tweets } ) );                   
};

```

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-orange-bird-templating-Inflated-orange-bird-sprite.png)

大部分工作都由模板来完成了，模板中包含大量标记。现在我们的橙色小鸟看起来就完全不同了;) 将模板放入一个 `script` 标签中，并给标签指定一个 ID，模板中的特殊标记 `<%= expression %>` 表示将要插入的变量的值，你也可以在 `<% statements %>` 中插入任意的 JavaScript 语法（如循环、流程控制等）！


```html
<script id="tweets-underscore" type="text/template">
    <ul>
        <% _.each( tweets, function( tweet ) { %>
        <li>
            <i><%= moment( tweet.created_at ).fromNow() %></i>:
            <b><%= tweet.user.name %></b> - 
            <span><%= tweet.text %></span> 
            <% if ( tweet.retweeted ) { %><i class="icon-repeat"></i><% } %> 
            <% if ( tweet.favorited ) { %><i class="icon-star"></i><% } %>
        </li>
        <% }); %>
    </ul>
</script>
```

你可以在 [jsFiddle](http://jsfiddle.net/wkH3k/) 中试验上面的代码。

正如 Uncle Ben 所说：“能力越大，责任就越大。”

![](http://bubkoo.qiniudn.com/with_great_power_comes_great_responsibility_by_itomibhaa-d4lajvl.jpg)

在现实环境中，允许在模板中插入任意的代码并不好，在模板中放入数据操作逻辑将使单元测试难以开展。试想一下，如果在模板中混入大量逻辑代码，情况会是怎样？如果你这样做，并没有解决我们刚刚提到的问题，即展现和逻辑混在一起。

### 示例2

下面是使用 Underscore 的另一个例子，这次我们预先处理了数据。我使用了 `_.map()` 方法来将每个属性转换为预期的样式，这样做的缺点就是，在将数据传递给模板之前需要先遍历一边，这会导致一些性能开销。

```javascript
twitter.displayTweets = function( tweets ) {
    var templateString = $( "#tweets-underscore" ).html(),
        template = _.template( templateString );
 
    tweets = _.map( tweets, function( tweet ) {
        tweet.created_at = moment( tweet.created_at ).fromNow();
        return tweet;
    });
 
    _selection.empty().append( template( { tweets: tweets } ) );                   
};
```

我们可以将之前模板中的数据逻辑移除了，因为我们在上面的 JavaScript 中完成了这项工作。这个版本比上面的好，但是还可以更好。

```html
<script id="tweets-underscore" type="text/template">
    <ul>
        <% _.each( tweets, function( tweet ) { %>
        <li>
            <i><%= tweet.created_at %></i>: 
            <b><%= tweet.user.name %></b> - 
            <span><%= tweet.text %></span> 
            <% if ( tweet.retweeted ) { %><i class="icon-repeat"></i><% } %> 
            <% if ( tweet.favorited ) { %><i class="icon-star"></i><% } %>
        </li>
        <% }); %>
    </ul>
</script>
```

你可以在 [jsFiddle](http://jsfiddle.net/auBUX/) 中试验上面的代码。

### 为什么使用 Underscore.js 

#### 赞成

- 可以在模板中嵌入任意的 JavaScript 代码
- 非常轻量级
- 如果你正在使用 Backbone.js，那么你可以直接使用它
- 如果你正在使用 Underscore.js，那么你可以直接使用它
- 可以预编译模板
- 可以运行在客户端和服务端
- 你还能想到其他的吗？

#### 反对

- 可以在模板中嵌入任意的 JavaScript 代码
- 模板中没有 `this` 概念
- 你还能想到其他的吗？

## Handlebars.js

![Handlebars](http://bubkoo.qiniudn.com/angry-birds-of-javascript-orange-bird-templating-handlebars-logo.png)

总体来看，我更倾向于选择 Handlebars 模板引擎。Handlebars 鼓励你将展现和逻辑分开，速度也更快，并提供了一套预编译机制，我们将对此稍作深入的讨论。首先，我们换个角度看看本文之前提出的问题。下面代码是使用 Handlebars 的解决方案，这段代码和之前版本一样干净。同时你会发现，我在模板中使用了 `fromNow` 这个 helper 方法。

```javascript
twitter.init = function( $selection ) {
    _selection = $selection;
    
    Handlebars.registerHelper( "fromNow", function( time ) {
        return moment( time ).fromNow();
    });
};
 
twitter.displayTweets = function( tweets ) {
    var templateString = $( "#tweets-handlebars" ).html(),
        template = Handlebars.compile( templateString );
                        
    _selection.empty().append( template( tweets ) );         
};
```

下面是模板的语法，这种语法与 Underscore 相比更加简洁，这正是我喜欢的。在模板内部我使用了模板的帮助方法 `fromNow` 来转换时间。这非常好，因为我们不需要像在 Underscore 中那样预先转换数据，或在模板内部嵌入数据操作的逻辑代码。

````html
<script id="tweets-handlebars" type="text/x-handlebars-template">
    <ul>
    </ul>
</script>
````

你可以在 [jsFiddle](http://jsfiddle.net/UeWHb/) 中试验上面的代码。

## 模板预编译

![](http://bubkoo.qiniudn.com/batman-unicorn-dolphins.jpg)

我在前面简单提到过，我喜欢 Handlebars 的原因之一是，它可以对模板进行预编译。这是什么意思呢！？！对于 Underscore 和 Handlebars，在使用模板之前都需要先编译模板（使用 Underscore 时你可以一步完成，但是在内部仍然需要先编译模板）。如果你打算多次重用同一个模板，或者你仅仅希望在使用模板时它就已经就绪，那么预编译就是很好的做法。然而，使用 Handlebars 可以帮你做更多，你可以在服务器端先编译好模板，然后直接在前端引用编译后的模板。这意味着这样可以大大减少前端的工作量，并且 Handlebars 有一个运行时的精简版本，其中只包含了必要的执行模板的方法（不是编译模板）。这太酷了，不是吗？如果你的答案是“这就像蝙蝠侠骑着彩虹独角兽和海豚在一起一样！”，那么你是对的，恭喜...

那么，它到底是如何工作的？好吧，首先你在服务器上用 Node 安装 Handlebars...


```bash
npm install -g handlebars
```

然后将模板内容（`script` 标签之间）提取到一个文件中，这里我们将其保存为 `tweets.tmpl`。现在运行 handlebars 预编译模板文件。

```bash
handlebars tweets.tmpl -f tweets.tmpl.js
```

完成之后，你就得到了模板的一个预编译版本，现在你可以在前端应用中引用它，就像下面这样...

```html
<script src="tweets.tmpl.js"></script>
```

现在，预编译的模板在页面上是可用的，你可以通过 Handlebars 来访问到预编译的模板，这样你就可以开始使用它了。

```javascript
var template = Handlebars.templates[ "tweets.tmpl" ],
    markup = template( tweets );
```

## 为什么使用 Handlebars.js

### 赞成

- 它是一个弱逻辑模板引擎
- 支持服务端预编译模板
- 支持 Helper 方法
- 可以运行在客户端和服务端
- 在模板中支持 `this` 的概念
- 它是 Mustache.js 的超集
- 你能想到其他的吗？

### 反对 

- 你能想到任何理由吗？

## 其他模板引擎怎么样

这个问题问的非常好，也许你的需求和我不一样，或者你只是单纯不喜欢某个我提到的模板引擎。如果是这样的话，那么你应该看看由 Garann Means ([@garannm](http://twitter.com/garannm)) 创建的[模板选择工具](http://garann.github.io/template-chooser/)，这是一个很强大的工具，它将询问你一组问题，来辅助判断哪个模板引擎适合你的需求，界面看起就像下面的例子...

![](http://bubkoo.qiniudn.com/template-chooser.png)

## 其他资源

- [An Introduction to Handlebars](http://net.tutsplus.com/tutorials/javascript-ajax/introduction-to-handlebars/) by Gabriel Manricks ([@GabrielManricks](http://twitter.com/GabrielManricks))
- [Best Practices When Working With JavaScript Templates](http://net.tutsplus.com/tutorials/javascript-ajax/best-practices-when-working-with-javascript-templates/) by Andrew Burgess ([@andrew8088](http://twitter.com/andrew8088))
- [Demo of Handlebars, and Why You Should Consider a Templating Engine](http://css.dzone.com/articles/demo-handlebars-and-why-you) Raymond Camden([@cfjedimaster](http://twitter.com/cfjedimaster))
- [HTML's New Template Tag: Standardizing Client-Side Templating](http://www.html5rocks.com/en/tutorials/webcomponents/template/) by Eric Bidelman ([@ebidel](http://twitter.com/ebidel))

## 进攻

下面是一个用 [boxbox](http://incompl.github.com/boxbox/) 构建的简易版 Angry Birds，boxbox 是一个用于 [box2dweb](https://code.google.com/p/box2dweb/) 的物理学框架，由 [Bocoup](http://bocoup.com/) 的 [Greg Smith](http://twitter.com/_gsmith) 编写。

> 按下空格键来发射橙色小鸟，你也可以使用方向键。

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-orange-bird-templating-attact.png)

## 结论

在代码中混入 HTML 标记非常让人讨厌，代码繁琐、枯燥，并且难以维护。将各个部分按职能分开，不仅简化了代码，而且保证了各部分各司其职，带来了极大的好处。值得庆幸的是，像 Underscore 和 Handlebars 这样的库提供了一种清晰的方式，将展现描述从逻辑中分离出来。你可以自由选择使用什么库，但是我鼓励你多进行一些比较，找到最适合你的库。因此这个问题的答案可能是不仅仅使用一个库，这才是一个不错的选择。

还有很多其他的前端架构技术也被猪偷走了。接下来，另一只愤怒的小鸟将继续复仇！Dun, dun, daaaaaaa!


<p class="j-quote">原文：[Angry Birds of JavaScript- Orange Bird: Templating](http://www.elijahmanor.com/angry-birds-of-javascript-orange-bird-templating/)</p>
