title: 黑色小鸟 - 前端分层架构
date: 2014-03-29 15:28:40
updated: 2014-03-29 15:28:40
tags: [Architecture,Backbone]
categories: [JavaScript]
keywords:
---

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-black-bird-backbone.jpg)

## 介绍 ##

一群恶魔的猪从无辜的小鸟那里偷走了所有的前端架构，现在它们要夺回来。一对特工英雄（愤怒的小鸟）将攻击那些卑鄙的猪，直到夺回属于他们的前端架构。（译者注：本系列是关乎前端架构的讨论，作者借用当前最风靡的游戏 - 愤怒的小鸟，为我们揭开了前端架构的真实面目。）

小鸟们最终能取得胜利吗？它们会战胜那些满身培根味的敌人吗？让我们一起来揭示 JavaScript 之愤怒的小鸟系列的另一个扣人心弦的章节！

> 阅读本系列的[介绍文章](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-series/)，查看所有小鸟以及它们的进攻力量。

## 战况 ##

- [红色大鸟 - 立即调用的函数表达式](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-red-bird-iife/)
- [蓝色小鸟 - 事件](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-blue-bird-events/)
- [黄色小鸟 - 模块化、依赖管理、性能优化](http://bubkoo.com/2014/03/29/angry-birds-of-javascript-yellow-bird-requirejs/)

## 黑色小鸟的攻击力 ##

![black bird](http://bubkoo.qiniudn.com/angry-birds-black-bird.png)

在这篇文章中，我们将看看黑色小鸟，它们使用 Backbone.js 的组织方式，用炸弹进攻肥小猪们。慢慢的，小鸟们将一个接一个地夺回本属于他们的东西。

<!--more-->

## 猪猪偷走了什么 ##

小鸟们从曾经写出来的 jQuery 代码就像蠕虫大杂烩那样乱成一团，它们将视图、模型和展现逻辑的代码混淆在一起。后来，它们的其中一个祖先，一只黑色小鸟，引入了 Backbone.js，并向它们演示了一种不同的方式来开发前端应用。但是，在小猪最近的一次进攻中，小猪们从小鸟那里偷走了 Backbone.js，并带回了它们肮脏的猪圈。

其中一只黑色小鸟被指派去夺回被偷去的东西，为了夺回属于它们的东西，它将使用具有爆炸性力量的组织结构来帮助它摧毁猪群。

## 乱成一团的蠕虫大杂烩 ##

我们再来看看下面的应用，在上次[蓝色小鸟](http://draft.blogger.com/blogger.g?blogID=30404818)进攻中已经处理过，之前通过增加消息来理清混乱，这里我们将使用 Backbone.js 来达到同样的目的，下面是程序运行结果...

> 现在貌似 [Plunker](http://plnkr.co/) 不能正确地嵌入在页面上，该应用是一个简单的 Netflix 搜索入口，返回 Netflix 的搜索结果。如果 Plunker 失效，我将把这个 demo  移到别处，抱歉带来不便。

<iframe allowfullscreen="allowfullscreen" frameborder="0" src="http://embed.plnkr.co/td1ZTtptDT0RIxc7VIgM" style="height: 300px; width: 100%;"></iframe>

为了再次唤起你的记忆，下面再次贴出了该应用的实现代码。你会发现代码将许多关注点都混在一起了（DOM事件，视图更新，AJAX交互，等等）

```javascript
$( document ).on( "click", ".term", function( e ) {
    e.preventDefault();
    $( "input" ).val( $( this ).text() );
    $( "button" ).trigger( "click" );
});
 
$( document ).ready( function() {  
    $( "button" ).on( "click", function( e ) {
        var searchTerm = $( "input" ).val();
        var url = "http://odata.netflix.com/Catalog/Titles?$filter=substringof('" +
                escape( searchTerm ) + "',Name)&$callback=callback&$format=json";
        
        $( ".help-block" ).html( function( index, html ) {
            return e.originalEvent ? html + ", " + "<a href='#' class='term'>" +
                searchTerm + "</a>" : html;
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
        e.preventDefault();
    });
});
```

你发现问题了吗？很容易写出像上面那样的代码，但我希望你能发现，这样的代码使用和维护起来都将令人难以忍受。别担心，我们都曾写过那样的代码。好消息是，我们不必接着那样写代码。让我们来看看 Backbone.js 到底是什么，以及它是如何帮助我们解决上述问题的。

> 还有很多其他前端 MV* 框架（Knockout、AngularJS、EmberJS以及其他）可以结构化上面的代码。我鼓励你选择一个工具，并熟练使用它。

## Backbone.js 基础 ##

Backbone.js 有一些组件，他们可以协同来创建一个 web 应用，你不必都用上这些组件，但你想用时它们都是可用的。

- Model - 代表数据以及相关逻辑
- Collection - 模型的有序集合
- View - 依赖模型，并含有渲染方法的模块
- Router - 提供可链接和可分享 URL 的机制
- Event - 观察者事件模块
- History - 提供操作历史的功能（支持后退按钮）
- Sync - 可扩展组件，提供与服务器端 RESTful 风格的通信

## 重构紧耦合的代码 ##

让我们尝试重构上面混乱的 jQuery 代码，使用 Backbone.js 将我们的关注点分离开。

本文不会深入介绍上面的所有组件，重点会放在 3 个主要的组件（Models，Collections 和 Views），同时涉及到一些 Sync 组件，但是是作为其他主题的一部分。如果你想深入研究这些主题，可以参考文章末尾我列举的一些资源。

### RequireJS ###

在进入讨论 Models，Collections 和 Views 之前，我想演示如何使用 RequireJS  来帮助我们将 index.html 页面中脚本文件都移除。

> 如果你从未接触过 RequireJS，你可以参考 [黄色小鸟 - RequireJS](http://bubkoo.com/2014/03/29/angry-birds-of-javascript-yellow-bird-requirejs/) 这篇关于 RequireJS 的文章。

#### main.js ####

```javascript
require.config({
    paths: {
        jquery: "https://ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min",
        underscore: "http://underscorejs.org/underscore",
        backbone: "http://backbonejs.org/backbone",
        postal: "http://cdnjs.cloudflare.com/ajax/libs/postal.js/0.8.2/postal.min",
        bootstrap: "http://netdna.bootstrapcdn.com/twitter-bootstrap/2.2.0/js/bootstrap.min"
    },
    shim: {
        underscore: {
            exports: "_"
        },
        backbone: {
            deps: [ "jquery", "underscore" ],
            exports: "Backbone"
        },
        bootstrap: {
            "deps" : [ "jquery" ]
        }
    }
});
 
require( [ "jquery", "search-view", "search", "movie-view", "movies" ], 
    function( $, SearchView, Search, MovieView, Movies ) {
        $( document ).ready( function() {
            var searchView = new SearchView({
                el: $( "#search" ),
                model: new Search()
            });
            
            var movieView = new MovieView({
                el: $( "#output" ),
                collection: new Movies()
            });
        });
    });
```

上面代码定义了  jQuery、Underscore、Backbone、Postal 和     Bootstrap 的路径，需要给 Underscore、Backbone 和 Bootstrap 设置垫片（shim），因为它们不是 AMD 模块。

调用 `require` 方法来加载依赖项，回调执行时，jQuery 和 其他依赖的模型和视图都已经加载好。

### 模型 ###

我们将创建 2 个模型（Seach 和 Movie）来表示上面的应用。

下面的 Search 模型相当简单，它的主要任务是响应 `term` 属性的变化。我们使用 Backbone 的事件（观察者事件）来监听模型的变化，然后传播消息到 Postal.js（媒介事件）。关于这些术语的更多信息以及它们的不同之处，可以参考关于事件的[愤怒的蓝色小鸟](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-blue-bird-events/)一文。

```javascript
define( [ "backbone", "channels" ], function( Backbone, channels ) {
    var Model = Backbone.Model.extend({
        initialize: function() {
            this.on( "change:term", function( model, value ) {
                channels.bus.publish( "search.term.changed", { term: value } );
            });
        }
    });
    
    return Model;
});
```

下面的 Movie 模型也没有处理很多事情，它的主要目的是解析服务器返回的数据，并把结果映射为更易于管理的结构。这样我们只需要关心 releaseYear、rating 和 name 属性。

#### movie.js ####

```javascript
efine( [ "backbone" ], function( Backbone ) {
    var Model = Backbone.Model.extend({
        defaults: { term: "" },
        parse: function( data, xhr ) {
            return {
                releaseYear: data.ReleaseYear,
                rating: data.Rating,
                name: data.Name
            };
        }
    });
    
    return Model;
});
```

### 集合 ###

正如上面描述的那样，集合是一组模型，下面代码就是一组 Movie 模型。集合定义了从服务器获取模型的服务器地址，该应用的后端是 Netflix，它的入口稍微有点复杂，所以我们定义了一函数来动态创建服务器的 URL。同时，我们还定义了一个 `parse` 方法，它将直接返回映射到 `Movie` 模型的数组。由于这个 AJAX 用到了 JSONP，我们还需要重写 `sync` 方法提供一些额外的选项。  

#### movies.js ####

```javascript
define( [ "backbone", "movie" ], function( Backbone, Movie ) {
    var Collection = Backbone.Collection.extend({
        model: Movie,
        url: function() {
            return "http://odata.netflix.com/Catalog/Titles?$filter=substringof('" +
                escape( this.term ) + "',Name)&$callback=callback&$format=json";
        },
        parse : function( data, xhr ) {
            return data.d.results;
        },
        sync: function( method, model, options ) {  
            options.dataType = "jsonp";  
            options.jsonpCallback = "callback";
            
            return Backbone.sync( method, model, options );  
        }
    });
 
    return Collection;
});
```

### 视图 ###

与传统的 MVC 中的视图相比，我认为这里的视图更加。不管怎么样，这个应用有 2 个视图，我们简要地看看。

`SearchView` 视图处理 DOM 和模型之间的交互。`events` 属性主要用来绑定 DOM 事件，在这个应用中监听了按钮的点击事件和之前搜索链接的点击事件，搜索链接的改变将被记录在模型的 `term` 属性中。`initialize` 方法为 `term` 属性改变设置了事件监听，如果 `term` 发生改变，对应的 UI 将发生改变。  

#### search-view.js ####

```javascript
define( [ "jquery", "backbone", "underscore", "channels" ], 
    function( $, Backbone ) {
 
        var View = Backbone.View.extend({
            events: {
                "click button": "searchByInput",
                "click .term": "searchByHistory"
            },
            initialize: function() {
                this.model.on( "change", this.updateHistory, this );
                this.model.on( "change", this.updateInput, this );
            },
            searchByInput: function( e ) {
                e.preventDefault();
                
                this.model.set( "term", this.$( "input" ).val() );
            },
            searchByHistory: function( e ) {
                var text = $( e.target ).text();
                
                this.model.set( "term", text );
            },
            updateHistory: function() {
                var that = this;
                
                this.$el.find( ".help-block" ).html( function(index, html) {
                    var term = that.model.get( "term" );
                    
                    return ~html.indexOf( term ) ? html : 
                        html + ", " + "<a href='#' class='term'>" + term + "</a>";
                });
            },
            updateInput: function() {
                this.$el.find( "input" ).val( this.model.get("term") );    
            }
        });
 
        return View;
    });
```

`MovieView` 视图与上面的视图有些许不一样。第一点要指出的就是奇怪的 `text!movie-template.html` 依赖，我使用了  RequireJS 的 `text.js` 插件，该插件允许将将文本资源作为依赖项的一部分加载。这对于使用文本文件的场景非常有用，比如模板引擎中的模板文件，或与某个组件对应的 CSS 文件。在 `initialize` 方法中，我们订阅了 `term` 的改变事件，当发生改变时通知集合从服务器 `fetch` 新数据，当数据从服务器返回时，`render` 方法将被调用，在 `render` 方法中我们使用 `Underscore` 的模板引擎来将结果渲染到页面中。   

#### movie-view.js ####

```javascript
define( [ "jquery", "backbone", "underscore", "channels", "text!movie-template.html" ], 
    function( $, Backbone, _, channels, template ) {
        var View = Backbone.View.extend({
            template: _.template( template ),
            initialize: function() {
                var that = this;
                
                _.bindAll( this, "render" );                
                channels.bus.subscribe( "search.term.changed", function( data ) {
                    that.collection.term = data.term;
                    that.collection.fetch({
                        success: that.render
                    });
                });
            },
            render: function() {
                var html = this.template({ movies: this.collection.toJSON() });
                this.$el.show().find( "tbody" ).html( html );
            }
        });
    
        return View;
    });
```

下面就是你想知道的模板文件，我使用的是 Underscore 的模板引擎，该引擎与 John 多年之前写的 micro-templating 非常相似。还有一些其他的模板库，我使用这个引擎，是因为它是 Underscore 内置的模板引擎，并且 Underscore 是 Backbone 的依赖项，如果想有更多的特性，我会使用 Handlebars 来代替，单这是关于愤怒的小鸟的另一个故事了。

#### movie-template.html ####

```html
<% _.each( movies, function( movie ) { %>
    <tr>
        <td><%= movie.name %></td>
        <td><%= movie.rating %></td>
        <td><%= movie.releaseYear %></td>
    </tr>
<% }); %>
```

## 附加资源 ##

本文只涉及到了 Backbone.js 的皮毛，如果你想了解更多关于 Backbone.js，下面这些资源你也许用的上。

> 下面这些资源来源于 [Beginner HTML5, JavaScript, jQuery, Backbone, and CSS3 Resources](http://www.elijahmanor.com/2013/01/beginner-html5-javascript-jquery.html) 这篇博文。

- [Backbone.js API](http://backbonejs.org/)
- [Annotated Backbone.js Code](http://backbonejs.org/docs/backbone.html)
- [Backbone Extensions, Plugins, & Resources](https://github.com/documentcloud/backbone/wiki/Extensions,-Plugins,-Resources)
- [Backbone Boilerplate](https://github.com/tbranyen/backbone-boilerplate)
- [Backbone Fundamentals eBook](https://github.com/addyosmani/backbone-fundamentals) by Addy Osmani ([@addyosmani](http://twitter.com/addyosmani))
- [Peep Code: Backbone.js Video Series](https://peepcode.com/products/backbone-js) by Geoffery Grosenbach ([@topfunky](http://twitter.com/topfunky)) and David Goodlad ([@dgoodlad](http://twitter.com/dgoodlad))
- [The Pragmatic Bookshelf: Hands-on Backbone.js](http://pragprog.com/screencasts/v-dback/hands-on-backbone-js) by Derick Bailey ([@derickbailey](http://twitter.com/derickbailey))
- [Backbone.js Screencasts](http://backbonescreencasts.com/) by Joey Beninghove
- [Pluralsight: Backbone.js Fundamentals](http://www.pluralsight.com/training/Courses/TableOfContents/backbone-fundamentals) by Liam McLennan ([@liammclennan](http://twitter.com/liammclennan))
- [The Skinny on BackboneJS](http://codular.com/starting-with-backbone) by Ben Howdle ([@benhowdle](http://twitter.com/benhowdle))
- [Backbone Tutorials](http://backbonetutorials.com/)
- [Backbone.js Tutorials](http://net.tutsplus.com/tag/backbone/) via Nettuts
- [Exploring Backbone.js Series](http://javascriptplayground.com/blog/category/backbonejs) by Jack Franklin ([@jack_franklin](http://twitter.com/jack_franklin))

## 进攻 ##

下面是一个用 [boxbox](http://incompl.github.com/boxbox/) 构建的简版 Angry Birds，boxbox 是一个用于 [box2dweb](https://code.google.com/p/box2dweb/) 的物理学框架，由 [Bocoup](http://bocoup.com/) 的 [Greg Smith](http://twitter.com/_gsmith) 编写。

> 按下空格键来发射黄色小鸟，你也可以使用方向键。

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-black-bird-backbone-attack.png)

## 结论 ##

前端 web 应用很容易就变得复杂，如果你不小心，那么你的代码就可能在不知不觉间变得混乱起来。幸好有了 Backbone.js 提供的各种组件，来帮助我们将应用分为可用的、包含各自目的的模块。感谢黑色小鸟为小鸟们夺回了 Backbone，这样它们就可以更早休息，因为它们知道在应用的适当地方，被有条理的组织了起来。

还有很多其他的前端架构技术也被猪偷走了。接下来，另一只愤怒的小鸟将继续复仇！Dun, dun, daaaaaaa!

<p class="j-quote">原文：[Angry Birds of JavaScript- Black Bird: Backbone](http://www.elijahmanor.com/angry-birds-of-javascript-black-bird-backbone/)</p>