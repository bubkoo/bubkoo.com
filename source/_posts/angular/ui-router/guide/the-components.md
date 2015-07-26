title: 学习 ui-router - 组件
date: 2014-01-02 02:32:32
updated: 2014-01-02 02:32:32
tags: [AngularJS,ui-router]
categories: []
keywords:
---
参考原文：https://github.com/angular-ui/ui-router/wiki/The-Components

- **$state / $stateProvider**：管理状态定义、当前状态和状态转换。包含触发状态转换的事件和回调函数，异步解决目标状态的任何依赖项，更新`$location`到当前状态。由于状态包含关联的 url，通过$urlRouterProvider生成一个路由规则来执行转换的状态。

- **ui-view**指示器：渲染状态中定义的视图，是状态中定义的视图的一个占位符。

- **$urlRouter / $urlRouterProvider**：管理了一套路由规则列表来处理当`$location`发生变化时如何跳转。最低级的方式是，规则可以是任意函数，来检查`$location`，并在处理完成时候返回`true`。支持正则表达式规则和通过`$urlMatcherFactory`编译的`UrlMatcher`对象的 url 占位符规则。

- **$urlMatcherFactory**：将 url和占位符编译为`UrlMatcher`对象。除了`$routeProvider`支持的占位符语法之外，它还支持扩展语法，允许一个正则表达式指定占位符，并且能够提取命名参数和查询url的一部分。

- **$templateFactory** - 通过`$http` / `$templateCache`来加载模板，供状态配置中使用。
<!--more-->