title: 学习 ui-router - 管理状态
date: 2014-01-01 16:31:40
updated: 2014-01-01 16:31:40
tags: [AngularJS,ui-router]
categories: []
keywords:
---
参考原文：https://github.com/angular-ui/ui-router/wiki

ui-router 的工作原理非常类似于 Angular 的路由控制器，但它只关注状态。

- 在应用程序的整个用户界面和导航中，一个状态对应于一个页面位置
- 通过定义`controller`、`template`和`view`等属性，来定义指定位置的用户界面和界面行为
- 通过嵌套的方式来解决页面中的一些重复出现的部位

## 最简单的形式 ##

模板可以通过下面这种最简单的方式来指定

``` html
<!-- in index.html -->
<body ng-controller="MainCtrl">
    <section ui-view></section>
</body>
```

``` javascript
// in app-states.js (or whatever you want to name it)
$stateProvider.state('contacts', {
  template: '<h1>My Contacts</h1>'
})
```

<!--more-->
### 模板将被插入哪里? ###

状态被激活时，它的模板会自动插入到父状态对应的模板中包含`ui-view`属性的元素内部。如果是顶层的状态，那么它的父模板就是`index.html`。

### 激活状态 ###

有三种方法来激活状态：
1. 调用`$state.go()`方法，这是一个高级的便利方法；
2. 点击包含`ui-sref`指令的链接；
3. 导航到与状态相关联的 url。

## Templates 模板 ##

可以通过下面几种方法来配置一个状态的模板。

方法一：配置`template`属性，指定一段 HTML 字符串，这人是设置模板的最简单的方式

``` javascript
$stateProvider.state('contacts', {
  template: '<h1>My Contacts</h1>'
})
```

方法二：配置`templateUrl`属性，来加载指定位置的模板，**这是设置模板的常用方法。**

``` javascript
$stateProvider.state('contacts', {
  templateUrl: 'contacts.html'
})
```

`templateUrl`的值也可以是一个函数返回的url，函数带一个预设参数`stateParams`。

``` javascript
$stateProvider.state('contacts', {
  templateUrl: function (stateParams){
    return '/partials/contacts.' + stateParams.filterBy + '.html';
  }
})
```

方法三：通过`templateProvider`函数返回模板的 HTML。

``` javascript
$stateProvider.state('contacts', {
  templateProvider: function ($timeout, $stateParams) {
    return $timeout(function () {
      return '<h1>' + $stateParams.contactId + '</h1>'
    }, 100);
  }
})
```

如果想在状态被激活前，让`<ui-view>`有一些默认的内容，当状态被激活之后默认内容将被状态对应的模板替换。

``` html
<body>
    <ui-view>
        <i>Some content will load here!</i>
    </ui-view>
</body>
```

## Controllers 控制器 ##

可以为模板指定一个控制器（controller）。**警告**：控制器不会被实例化如果模板没有定义。

设置控制器：

``` javascript
$stateProvider.state('contacts', {
  template: '<h1>{{title}}</h1>',
  controller: function($scope){
    $scope.title = 'My Contacts';
  }
})
```

如果在模块中已经定义了一个控制器，只需要指定控制器的名称即可：

``` javascript
$stateProvider.state('contacts', {
  template: ...,
  controller: 'ContactsCtrl'
})
```

使用`controllerAs`语法：

 ``` javascript
$stateProvider.state('contacts', {
  template: ...,
  controller: 'ContactsCtrl as contact'
})
```

对于更高级的需要，可以使用`controllerProvider`来动态返回一个控制器函数或字符串：

 ``` javascript
$stateProvider.state('contacts', {
  template: ...,
  controllerProvider: function($stateParams) {
      var ctrlName = $stateParams.type + "Controller";
      return ctrlName;
  }
})
```

控制器可以使用`$scope.on()`方法来监听事件状态转换。

控制器可以根据需要实例化，当相应的`scope`被创建时。例如，当用户点击一个url手动导航一个状态时，`$stateProvider`将加载对应的模板到视图中，并且将控制器和模板的`scope`绑定在一起。

## 解决器 Resolve ##

可以使用`resolve`为控制器提供可选的依赖注入项。

`resolve`配置项是一个由`key/value`构成的对象。

- key – {string}：注入控制器的依赖项名称。
- factory - {string|function}：
  + string：一个服务的别名
  + function：函数的返回值将作为依赖注入项，如果函数是一个耗时的操作，那么控制器必须等待该函数执行完成（be resolved）才会被实例化。

### 例子 ###

在`controller`实例化之前，`resolve`中的每一个对象都必须 be resolved，请注意每个 resolved object 是怎样作为参数注入到控制器中的。

``` javascript
$stateProvider.state('myState', {
      resolve:{

         // Example using function with simple return value.
         // Since it's not a promise, it resolves immediately.
         simpleObj:  function(){
            return {value: 'simple!'};
         },

         // Example using function with returned promise.
         // 这是一种典型使用方式
         // 请给函数注入任何想要的服务依赖，例如 $http
         promiseObj:  function($http){
            // $http returns a promise for the url data
            return $http({method: 'GET', url: '/someUrl'});
         },

         // Another promise example. 
         // 如果想对返回结果进行处理， 可以使用 .then 方法
         // 这是另一种典型使用方式
         promiseObj2:  function($http){
            return $http({method: 'GET', url: '/someUrl'})
               .then (function (data) {
                   return doSomeStuffFirst(data);
               });
         },        

         // 使用服务名的例子，这将在模块中查找名称为 'translations' 的服务，并返回该服务 
         // Note: The service could return a promise and
         // it would work just like the example above
         translations: "translations",

         // 将服务模块作为解决函数的依赖项，通过参数传入
         // 提示：依赖项 $stateParams 代表 url 中的参数
         translations2: function(translations, $stateParams){
             // Assume that getLang is a service method
             // that uses $http to fetch some translations.
             // Also assume our url was "/:lang/home".
             translations.getLang($stateParams.lang);
         },

         // Example showing returning of custom made promise
         greeting: function($q, $timeout){
             var deferred = $q.defer();
             $timeout(function() {
                 deferred.resolve('Hello!');
             }, 1000);
             return deferred.promise;
         }
      },

      // 控制器将等待上面的解决项都被解决后才被实例化
      controller: function($scope, simpleObj, promiseObj, promiseObj2, translations, translations2, greeting){
          
          $scope.simple = simpleObj.value;

          // 这里可以放心使用 promiseObj 中的对象
          $scope.items = promiseObj.items;
          $scope.items = promiseObj2.items;

          $scope.title = translations.getLang("english").title;
          $scope.title = translations2.title;

          $scope.greeting = greeting;
      }
   })
```

## 为 $state 对象提供自定义数据 ##

可以给 $state 对象提供自定义数据（建议使用`data`属性，以免冲突）

``` javascript
// 基于对象和基于字符串定义 state 的例子
var contacts = { 
    name: 'contacts',
    templateUrl: 'contacts.html',
    data: {
        customData1: 5,
        customData2: "blue"
    }  
}
$stateProvider
  .state(contacts)
  .state('contacts.list', {
    templateUrl: 'contacts.list.html',
    data: {
        customData1: 44,
        customData2: "red"
    } 
  })
```

可以通过下面的方式来访问上面定义的数据：

``` javascript
function Ctrl($state){
    console.log($state.current.data.customData1) // 输出 5;
    console.log($state.current.data.customData2) // 输出 "blue";
}
```

## onEnter 和 onExit 回调函数 ##
`onEnter`和`onExit`回调函数是可选配置项，分别称为当一个状态变得活跃的和不活跃的时候触发。回调函数也可以访问所有解决依赖项。

``` javascript
$stateProvider.state("contacts", {
  template: '<h1>{{title}}</h1>',
  resolve: { title: 'My Contacts' },
  controller: function($scope, title){
    $scope.title = 'My Contacts';
  },
  // title 是解决依赖项，这里也是可以使用解决依赖项的
  onEnter: function(title){ 
    if(title){ ... do something ... }
  },
  // title 是解决依赖项，这里也是可以使用解决依赖项的
  onExit: function(title){
    if(title){ ... do something ... }
  }
})
```

## State Change Events 状态改变事件 ##

所有这些事件都是在`$rootScope`作用域触发
- **$stateChangeStart** - 当模板开始解析之前触发

``` javascript
$rootScope.$on('$stateChangeStart', 
function(event, toState, toParams, fromState, fromParams){ ... })
```
注意：使用`event.preventDefault()`可以阻止模板解析的发生
``` javascript
$rootScope.$on('$stateChangeStart', 
function(event, toState, toParams, fromState, fromParams){ 
    event.preventDefault(); 
    // transitionTo() promise will be rejected with 
    // a 'transition prevented' error
})
```

- **$stateNotFound** - `v0.3.0` - 在 transition 时通过状态名查找状态，当状态无法找到时发生。该事件在 scope 链上广播，只允许一次处理错误的机会。`unfoundState`将作为参数传入事件监听函数，下面例子中可以看到`unfoundState`的三个属性。使用 `event.preventDefault()` 来阻止模板解析，

``` javascript
// somewhere, assume lazy.state has not been defined
$state.go("lazy.state", {a:1, b:2}, {inherit:false});

// somewhere else
$scope.$on('$stateNotFound', 
function(event, unfoundState, fromState, fromParams){ 
    console.log(unfoundState.to); // "lazy.state"
    console.log(unfoundState.toParams); // {a:1, b:2}
    console.log(unfoundState.options); // {inherit:false} + default options
})
```

- **$stateChangeSuccess** - 当模板解析完成后触发

``` javascript
$rootScope.$on('$stateChangeSuccess', 
function(event, toState, toParams, fromState, fromParams){ ... })
```

- **$stateChangeError** - 当模板解析过程中发生错误时触发

``` javascript
$rootScope.$on('$stateChangeError', 
function(event, toState, toParams, fromState, fromParams, error){ ... })
```

## View Load Events 视图加载事件 ##

- **$viewContentLoading** - 当视图开始加载，DOM渲染完成之前触发，该事件将在`$scope`链上广播此事件。

``` javascript
$scope.$on('$viewContentLoading', 
function(event, viewConfig){ 
    // Access to all the view config properties.
    // and one special property 'targetView'
    // viewConfig.targetView 
});
```

- **$viewContentLoaded** - 当视图加载完成，DOM渲染完成之后触发，视图所在的`$scope`发出该事件。

``` javascript
$scope.$on('$viewContentLoading', 
$scope.$on('$viewContentLoaded', 
function(event){ ... });
```