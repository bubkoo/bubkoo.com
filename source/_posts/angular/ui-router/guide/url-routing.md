title: 学习 ui-router - 路由控制
date: 2014-01-02 00:39:20
updated: 2014-01-02 00:39:20
tags: [AngularJS,ui-router]
categories: []
keywords:
---
参考原文：https://github.com/angular-ui/ui-router/wiki/URL-Routing

在你的应用中大多数状态都有与其相关联的 url，路由控制不是设计完成 state 之后的事后想法，而是开始开发时就应该考虑的问题。

这里是如何设置一个基本url。

``` javascript
$stateProvider
    .state('contacts', {
        url: "/contacts",
        templateUrl: 'contacts.html'
    })
```

当我们访问`index.html/contacts`时， `'contacts'`状态将被激活，同时`index.html`中的`ui-view`将被`'contacts.html'`填充。或者，通过`transitionTo('contacts')`方法将状态转变到`'contacts'`状态，同时 url 将更新为`index.html/contacts`。
<!--more-->

## URL参数 ##

### 基本参数 ###

通常，url动态部分被称为参数，有几个选项用于指定参数。基本参数如下：

``` javascript
$stateProvider
    .state('contacts.detail', {
        // 这里设置了url参数
        url: "/contacts/:contactId",
        templateUrl: 'contacts.detail.html',
        controller: function ($stateParams) {
            // If we got here from a url of /contacts/42
            expect($stateParams).toBe({contactId: 42});
        }
    })
```

或者，你也可以使用花括号的方式来指定参数：

``` javascript
// 与前面的设置方法等效
url: "/contacts/{contactId}" 
```

**示例：**
- `'/hello/'` - 只匹配`'/hello/'`路径，没有对斜杠进行特殊处理，这种模式将匹配整个路径，而不仅仅是一个前缀。
- `'/user/:id'` - 匹配`'/user/bob'`、`'/user/1234!!!'`，甚至还匹配 `'/user/'`，但是不匹配`'/user'`和`'/user/bob/details'`。第二个路径段将被捕获作为参数`"id"`。
- `'/user/{id}'` - 与前面的示例相同,但使用花括号语法。

### 含正则表达式的参数 ###
使用花括号的方式可以设置一个正则表达式规则的参数：

``` javascript
// 只会匹配 contactId 为1到8位的数字
url: "/contacts/{contactId:[0-9]{1,8}}"
```

**示例：**
- `'/user/{id:[^/]*}'` - 与`'/user/{id}'`相同
- `'/user/{id:[0-9a-fA-F]{1,8}}'` - 与前面的示例相似，但只匹配1到8为的数字和字符
- `'/files/{path:.*}'` - 匹配任何以`'/files/'`开始的URL路径，并且捕获剩余路径到参数`'path'`中。
- `'/files/*path'` - 与前面相同，捕获所有特殊的语法。

**警告：**不要把捕获圆括号写进正则表达式，ui-router 的 UrlMatcher 将为整个正则表达式添加捕获。

### Query Parameters ###

可以通过`?`来指定参数作为查询参数

``` javascript
url: "/contacts?myParam"
// 匹配 "/contacts?myParam=value"
```
如果你需要不止一个查询参数，请用`&`分隔：
``` javascript
url: "/contacts?myParam1&myParam2"
// 匹配 "/contacts?myParam1=value1&myParam2=wowcool"
```

## 嵌套状态的路由控制 ##

### 附加的方式（默认） ###
在嵌套状态的路由控制中，默认方式是子状态的 url 附加到父状态的 url 之后。

``` javascript
$stateProvider
  .state('contacts', {
     url: '/contacts',
     ...
  })
  .state('contacts.list', {
     url: '/list',
     ...
  });
```

路由将成为：
- `'contacts'`状态将匹配`"/contacts"`
- `'contacts.list'`状态将匹配`"/contacts/list"`。子状态的url是附在父状态的url之后的。

### 绝对路由（^） ###

如果你使用绝对 url 匹配的方式，那么你需要给你的url字符串加上特殊符号`"^"`。

``` javascript
$stateProvider
  .state('contacts', {
     url: '/contacts',
     ...
  })
  .state('contacts.list', {
     url: '^/list',
     ...
  });
```

路由将成为：
- `'contacts'`状态将匹配`"/contacts"`
- `'contacts.list'`状态将匹配`"/list"`。子状态的url没有附在父状态的url之后的，因为使用了`^`。

## $stateParams 服务 ##

之前看到的`$stateParams`服务是一个对象，包含 url 中每个参数的键/值。`$stateParams`可以为控制器或者服务提供 url 的各个部分。
**注意：**`$stateParams`服务必须与一个控制器相关，并且`$stateParams`中的“键/值”也必须事先在那个控制器的`url`属性中有定义。

``` javascript
// 如果状态中 url 属性是：
url: '/users/:id/details/{type}/{repeat:[0-9]+}?from&to'

// 当浏览
'/users/123/details//0'

// $stateParams 对象将是
{ id:'123', type:'', repeat:'0' }

// 当浏览
'/users/123/details/default/0?from=there&to=here'

// $stateParams 对象将是
{ id:'123', type:'default', repeat:'0', from:'there', to:'here' }
```

### 使用`$stateParams`的两个陷阱 ###

- 只有当状态被激活并且状态的所有依赖项都被注入时，`$stateParams`对象才存在。这代表你不能再状态的`resolve`函数中使用`$stateParams`对象，可以使用`$state.current.params`来代替。

``` javascript
$stateProvider.state('contacts.detail', {  
   resolve: { 
      someResolve: function($state){ 
         //*** 不能在这里使用 $stateParams , the service is not ready ***//
         //*** 使用 $state.current.params 来代替 ***//
         return $state.current.params.contactId + "!" 
      }; 
   },
   // ...
})
```

- 在状态控制器中，`$stateParams`对象只包含那些在状态中定义的参数，因此你不能访问在其他状态或者祖先状态中定义的参数。

``` javascript
$stateProvider.state('contacts.detail', {
   url: '/contacts/:contactId',   
   controller: function($stateParams){
      $stateParams.contactId  //*** Exists! ***//
   }
}).state('contacts.detail.subitem', {
   url: '/item/:itemId', 
   controller: function($stateParams){
      $stateParams.contactId //*** 注意! DOESN'T EXIST!! ***//
      $stateParams.itemId //*** Exists! ***//  
   }
})
```

## $urlRouterProvider ##

`$urlRouterProvider`负责处理在状态配置中指定的url路由方式之外的 url 请求的路由方式。`$urlRouterProvider`负责监视`$location`，当`$location`改变后，`$urlRouterProvider`将从一个列表，一个接一个查找匹配项，直到找到。所有 url 都编译成一个`UrlMatcher`对象。

`$urlRouterProvider`有一些实用的方法，可以在`module.config`中直接使用。

**`when()` for redirection 重定向**

参数：
- `what` **String | RegExp | UrlMatcher**，你想重定向的传入路径
- `handler` **String | Function** 将要重定向到的路径

`handler` 作为 **String**
如果`handler`是字符串，它被视为一个重定向，并且根据匹配语法决定重定向的地址。

``` javascript
app.config(function($urlRouterProvider){
    // when there is an empty route, redirect to /index   
    $urlRouterProvider.when('', '/index');

    // You can also use regex for the match parameter
    $urlRouterProvider.when('/aspx/i', '/index');
})
```

`handler` 作为 **Function**
如果`handler`是一个函数，这个函数是注入一些服务的。如果`$location`匹配成功，函数将被调用。你可以选择性注入`$match`。

函数可以返回：
- **falsy** 表明规则不匹配，`$urlRouter`将试图寻找另一个匹配
- **String** 该字符串作为重定向地址并且作为参数传递给`$location.url()`
- **nothing**或者任何为真的值，告诉`$urlRouter`url 已经被处理

示例：

``` javascript
$urlRouterProvider.when(state.url, ['$match', '$stateParams', function ($match, $stateParams) {
    if ($state.$current.navigable != state || !equalForKeys($match, $stateParams)) {
        $state.transitionTo(state, $match, false);
    }
}]);
```

**`otherwise()` 无效路由**

参数：
- `path` **String | Function** 你想重定向url路径或者一个函数返回url路径。函数可以包含`$injector`和`$location`两个参数。

``` javascript
app.config(function($urlRouterProvider){
    // 在配置（状态配置和when()方法）中没有找到url的任何匹配
    // otherwise will take care of routing the user to the specified url
    $urlRouterProvider.otherwise('/index');

    // Example of using function rule as param
    $urlRouterProvider.otherwise(function($injector, $location){
        ... some advanced code...
    });
})
```

**`rule()` 自定义url处理**

参数：
- `handler` **Function** 一个函数，包含`$injector`和`$location`两个服务作为参数，函数负责返回一个有效的路径的字符串。

``` javascript
app.config(function($urlRouterProvider){
    // Here's an example of how you might allow case insensitive urls
    $urlRouterProvider.rule(function ($injector, $location) {
        var path = $location.path(), normalized = path.toLowerCase();
        if (path != normalized) return normalized;
    });
})
```

## $urlMatcherFactory 和 UrlMatchers ##

定义了url模式和参数占位符的语法。`$urlMatcherFactory`是在幕后被`$urlRouterProvider`调用，来缓存编译后的`UrlMatcher`对象，而不必在每次 location 改变后重新解析url。大多数用户不需要直接使用`$urlMatcherFactory`方法，但是在状态配置中非常实用，可以使用`$urlMatcherFactory`方法来生成一个`UrlMatcher`对象，并在状态配置中使用该对象。

``` javascript
var urlMatcher = $urlMatcherFactory.compile("/home/:id?param1");
$stateProvider.state('myState', {
    url: urlMatcher 
});
```