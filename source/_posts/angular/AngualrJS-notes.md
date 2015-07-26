title: AngualrJS 使用笔记
date: 2014-1-1 14:05:13 
updated: 2014-1-1 14:05:19 
tags: [AngularJS,MVC]
categories: []
keywords:
---
元旦放假一天，由于太宅，于是有了新年第一个产出。主题来源于这一周在项目中使用 [AngularJS][1] 所遇到的问题，在此做一个使用笔记，以加深对 [AngularJS][1] 的理解。本人文笔不行，如文章被有幸浏览到，还请各位童鞋多多提意见。

## AugularJS 简单介绍 ##

[AngularJS][1] 由 Google 倾力打造的前端 JavaScript 工具。这里只说它是“工具”，没说它是完整的“框架”，是因为它并不是定位于去完成一套框架要做的事。更重要的，是它给我们提供了一种新的应用组织与开发方式。与其他许多模版系统最大的不同在于，他直接扩展了现有的 HTML 架构，透过声明式语言 (Directives Syntax)直接赋予 HTML 新的功能，让许多 [AngularJS][1] 自定义的 HTML 属性自然而然地融入 HTML 之中，并且赋予其意义。这是大多数模版系统不敢做的尝试。

另外，在其他模版系统当中，都会实作所谓的模板引擎(Template Engine)，它们通常都通过模版字符串与数据进行连接，生成最终的 HTML 字符串，并将结果通过`innerHTML`属性插入 DOM 树中。这意味着任何数据发生改变时，都需要重新将数据、模版合并成字符串，然后当作`innerHTML`插入 DOM 树中，所以存在一些从字符串转换成 HTML 的隐性成本。但是 [AngularJS][1] 是与众不同的，[AngularJS][1] 通过自身的编译引擎将 HTML 和自定义的 HTML 语法(Directives)，解析成 DOM 结构之后，[AngularJS][1] 会直接将原生的 DOM 当作网页片段模板，然后直接对 DOM 进行操作，大幅减少了转换成本，当然绑定效率可见比其他模板要高很多。

**没有银弹**，与其他所有的模版系统一样，这个世界没有银弹，不会有任何一套框架可以解决所有问题，[AngularJS][1] 也不例外。所以，要能理解 [AngularJS][1] 所擅长与不擅长的领域，可以有助于你评估与理解是否要采用 [AngularJS][1] 当作你未来的开发框架。<!--more-->

下面是我学习过程中收集的一些比较不错的文章，排序不分先后，有需要的童鞋可以通过这些文章快速学习。
- [AngularJS 官网][1]
- [AngularJS 中文社区](http://angularjs.cn/tag/AngularJS)
- [AngularJS 的五个超酷特性](http://www.gbin1.com/technology/javascript/20120717-AugularJS-features/)
- [现在就开始使用 AngularJS 的三个重要原因](http://developer.51cto.com/art/201302/380661.htm)
- [专访 AngularJS 框架创始人 Misko Hevery：让 Web 开发更便捷](http://www.csdn.net/article/2013-10-08/2817118-AngularJS-Framework-Google)
- [知乎专栏使用 AngularJS 框架有什么经验心得？](http://www.zhihu.com/question/21497720)
- [Angular Developer Guide 中文翻译系列](http://www.cnblogs.com/lcllao/archive/2012/10/18/2728787.html)
- [AngularJS 学习笔记](http://zouyesheng.com/angular.html)
- [大漠穷秋的 AngularJS 系列文章](http://damoqiongqiu.iteye.com/category/287942)
- [破狼的 AngularJS 系列文章](http://www.cnblogs.com/whitewolf/category/404298.html)
- [ngot AngularJS 系列文章](http://ngot.iteye.com/category/291820)
- [AngularJS 体验式编程系列文章](http://blog.fens.me/series-angular/)

废话了这么多，接下来还是进入本文主题，看看我在使用过程中遇到过哪些问题。

## AngularJS 项目的目录结构 ##

怎样组织代码文件和目录？这恐怕是初学者一开始就会遇到的问题。下面推荐两种目录划分方式，开发者可以根据项目复杂程度选择采取一种。

**按业务逻辑划分**，就像下面这样：

- controllers/
 - LoginController.js
 - RegistrationController.js
 - ProductDetailController.js
 - SearchResultsController.js
- directives.js
- filters.js
- models/
 - CartModel.js
 - ProductModel.js
 - SearchResultsModel.js
 - UserModel.js
- services/
 - CartService.js
 - UserService.js
 - ProductService.js

这种结构把不同的业务功能拆分为独立的文件，条理清晰，**适用于项目较简单的应用**。一旦项目复杂度较高，controllers, models, servers 三个目录下的文件数量就会随着项目复杂度增加we增加，想要找到对应模块的代码文件比较麻烦，如果项目比较复杂推荐采用下面的方式来划分目录结构。

**按功能模块划分**，就像下面这样：


- cart/
 - CartModel.js
 - CartService.js
- common/
 - directives.js
 - filters.js
- product/
 + search/
   * SearchResultsController.js
   * SearchResultsModel.js  
 + ProductDetailController.js
 + ProductModel.js
 + ProductService.js
- user/
 - LoginController.js
 - RegistrationController.js
 - UserModel.js
 - UserService.js

另外有一个 AngularJS 应用开发的官方入门项目 [angular-seed](https://github.com/angular/angular-seed)，推荐只作为练习使用，为了不误导大家，其目录结构就不在此列举出来，有需要的同学可以自行[下载](https://github.com/angular/angular-seed)学习。

## AngularJs 中使用 $http.jsonp ##
在开发过程中使用到了 jsonp，问题出现于，之前用 jQuery 的 ajax 方法，换成 AngularJs 的 $http.jsonp 方法后，拿不到数据，打开 Console 一看发现 Angular 抛出异常了。

jQuery 使用 jsonp 的方法如下：

``` javascript
jQuery.ajax({
    url: 'http://' + config.hostname + ':' + config.port + '/trace/app?callback=?',
    dataType: 'jsonp',
    global: false,
    success: function (data) {

    }
});
```

换成 AngularJs 的 $http.jsonp 的代码如下：

``` javascript
$http.jsonp('http://' + config.hostname + ':' + config.port + '/trace/apps?callback=?')
    .success(function (data) {

    });
```

好的，现在打开页面，页面上什么数据都没有获取到，这是什么原因呢？

好吧，打开强大的 Google 找到如下几篇文章：
- [官方文档中的 $http.jsonp](http://docs.angularjs.org/api/ng.$http#methods_jsonp)
- [parsing JSONP $http.jsonp() response in angular.js](http://stackoverflow.com/questions/12066002/parsing-jsonp-http-jsonp-response-in-angular-js)
- [详解Jquery和AngularJs中jsonp解决跨域问题](http://xunmengsj.iteye.com/blog/1881008)

最后解决问题，总计如下：
1. url中必须指定callback和回调函数名，函数名为JSON_CALLBACK时，才会调用success回调函数，JSON_CALLBACK**必须全为大写**。
2. 也可以指定其它回调函数，但必须是定义在window下的全局函数。
3. 当callback为JSON_CALLBACK时，只会调用success，即使window中有JSON_CALLBACK函数，也不会调用该函数。

所以，修改后的代码是：

``` javascript
$http.jsonp('http://' + config.hostname + ':' + config.port + '/trace/apps?callback=JSON_CALLBACK')
    .success(function (data) {

    });
```


## 文章推荐 ##
- [Angularjs开发一些经验总结](http://www.cnblogs.com/whitewolf/archive/2013/03/24/2979344.html)
- [AngularJS 最佳实践](http://www.lovelucy.info/angularjs-best-practices.html)
- [AngularJS：何时应该使用Directive、Controller、Service？](http://damoqiongqiu.iteye.com/blog/1971204)
- [《AngularJS》5个实例详解Directive（指令）机制](http://damoqiongqiu.iteye.com/blog/1917971)
- [如何使用AngularJS构建大型Web应用](http://angularjs.cn/A00T)
- [AngularJs项目实战01：模块划分和目录组织](http://angularjs.cn/A08q)
- [AngularJs项目实战02：前端的页面分解与组装](http://angularjs.cn/A0d9)
- [angularJs项目实战03：angularjs与其他类库的协作](http://angularjs.cn/A0fG)
- [AngularJs项目实战04：angularjs的性能问题](http://angularjs.cn/A0gy)




[1]: http://angularjs.org/