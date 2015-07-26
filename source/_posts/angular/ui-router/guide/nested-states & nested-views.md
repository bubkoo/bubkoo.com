title: 学习 ui-router - 状态嵌套和视图嵌套
date: 2014-01-01 20:55:08
updated: 2014-01-01 20:55:08
tags: [AngularJS,ui-router]
categories: []
keywords:
---
参考原文：https://github.com/angular-ui/ui-router/wiki/Nested-States-%26-Nested-Views
## 状态嵌套的方法 ##
状态可以相互嵌套。有三个嵌套的方法：
1. 使用“点标记法”，例如：`.state('contacts.list', {})`
2. 使用`parent`属性，指定一个父状态的名称字符串，例如：`parent: 'contacts'`
3.  使用`parent`属性，指定一个父状态对象，例如：`parent: contacts`（contacts 是一个状态对象）

<!--more-->
### 点标记法 ###

在`$stateProvider`中可以使用点语法来表示层次结构，下面，`contacts.list`是`contacts`的子状态。

``` javascript
$stateProvider
  .state('contacts', {})
  .state('contacts.list', {});
```

### 使用`parent`属性，指定一个父状态的名称字符串 ###

``` javascript
$stateProvider
  .state('contacts', {})
  .state('list', {
    parent: 'contacts'
  });
```

### 基于对象的状态 ###
如果你不喜欢使用基于字符串的状态，您还可以使用基于对象的状态。`name`属性将在状态对象内部设置，在所有的子状态对象中设置`parent`属性为父状态对象，像下面这样：

``` javascript
var contacts = { 
    name: 'contacts',  //mandatory
    templateUrl: 'contacts.html'
}
var contactsList = { 
    name: 'list',      //mandatory
    parent: contacts,  //mandatory
    templateUrl: 'contacts.list.html'
}

$stateProvider
  .state(contacts)
  .state(contactsList)
```

在方法调用和属性比较时可以直接引用状态对象：

``` javascript
$state.transitionTo(states.contacts);
$state.current === states.contacts;
$state.includes(states.contacts)
```

## 注册状态的顺序 ##
可以以**任何顺序**和**跨模块**注册状态，也可以在父状态存在之前注册子状态。一旦父状态被注册，将触发自动排序，然后注册子状态。

## 状态命名 ##
状态不允许重名，当使用“点标记法”，`parent`属性被推测出来，但这并不会改变状态的名字；当不使用“点标记法”时，`parent`属性必须明确指定，但你仍然不能让任何两个状态有相同的名称，例如你不能有两个不同的状态命名为"edit"，即使他们有不同的父状态。

## 嵌套状态和视图 ##
当应用程序在一个特定的状态 - 当一个状态是活动状态时 - 其所有的父状态都将成为活跃状态。下面例子中，当"contacts.list"是活跃状态时，"contacts"也将隐性成为活跃状态，因为他是"contacts.list"的父状态。

子状态将把其对应的模板加载到父状态对应模板的`ui-view`中。

``` javascript
$stateProvider
  .state('contacts', {
    templateUrl: 'contacts.html',
    controller: function($scope){
      $scope.contacts = [{ name: 'Alice' }, { name: 'Bob' }];
    }
  })
  .state('contacts.list', {
    templateUrl: 'contacts.list.html'
  });

function MainCtrl($state){
  $state.transitionTo('contacts.list');
}
```

``` html
<!-- index.html -->
<body ng-controller="MainCtrl">
  <div ui-view></div>
</body>
```
``` html
<!-- contacts.html -->
<h1>My Contacts</h1>
<div ui-view></div>
```
``` html
<!-- contacts.list.html -->
<ul>
  <li ng-repeat="contact in contacts">
    <a>{{contact.name}}</a>
  </li>
</ul>
```

### 子状态将从父状态继承哪些属性？ ###

子状态将从父母继承以下属性：
- 通过解决器解决的依赖注入项
- 自定义的`data`属性
除了这些，没有其他属性继承下来（比如`controllers`、`templates`和`url`等）

#### 继承解决的依赖项 ####

版本 v0.2.0 的新特性

子状态将从父状态继承通过解决器解决的依赖注入项，并且可以重写（overwrite）依赖项，可以将解决依赖项注入子状态的控制器和解决函数中。
``` javascript
$stateProvider.state('parent', {
      resolve:{
         resA:  function(){
            return {'value': 'A'};
         }
      },
      controller: function($scope, resA){
          $scope.resA = resA.value;
      }
   })
   .state('parent.child', {
      resolve:{
         // 将父状态的解决依赖项注入到子状态的解决函数中
         resB: function(resA){
            return {'value': resA.value + 'B'};
         }
      },
      // 将父状态的解决依赖项注入到子状态的控制器中
      controller: function($scope, resA, resB){
          $scope.resA2 = resA.value;
          $scope.resB = resB.value;
      }
```

#### 继承自定义`data`属性值 ####
子状态将从父状态继承自定义`data`属性值，并且可以重写（overwrite）`data`属性值
``` javascript
$stateProvider.state('parent', {
      data:{
         customData1:  "Hello",
         customData2:  "World!"
      }
   })
   .state('parent.child', {
      data:{
         // customData1 inherited from 'parent'
         // 覆盖了 customData2 的值
         customData2:  "UI-Router!"
      }
   });

$rootScope.$on('$stateChangeStart', function(event, toState){ 
    var greeting = toState.data.customData1 + " " + toState.data.customData2;
    console.log(greeting);

    // 'parent'被激活时，输出 "Hello World!"
    // 'parent.child'被激活时，输出 "Hello UI-Router!"
})
```

## Abstract States 抽象状态 ##
一个抽象的状态可以有子状态但不能显式激活，它将被隐性激活当其子状态被激活时。

下面是一些你将可能会使用到抽象状态的示例：

- 为所有子状态预提供一个**基url**
- 在父状态中设置`template`属性，子状态对应的模板将插入到父状态模板中的`ui-view(s)`中
- 通过`resolve`属性，为所有子状态提供解决依赖项
- 通过`data`属性，为所有子状态或者事件监听函数提供自定义数据
- 运行`onEnter`或`onExit`函数，这些函数可能在以某种方式修改应用程序。
- 上面场景的任意组合

**请记住：**抽象的状态模板仍然需要`<ui-view/>`，来让自己的子状态模板插入其中。因此，如果您使用抽象状态只是为了预提供**基url**、提供解决依赖项或者自定义data、运行onEnter/Exit函数，你任然需要设置`template: "<ui-view/>"`。

### 抽象状态使用示例： ###

**为子状态提供一个基url，子状态的url是相对父状态的**
``` javascript
$stateProvider
    .state('contacts', {
        abstract: true, 
	url: '/contacts',

        // Note: abstract still needs a ui-view for its children to populate.
        // You can simply add it inline here.
        template: '<ui-view/>'
    })
    .state('contacts.list', {
	// url will become '/contacts/list'
        url: '/list'
	//...more
    })
    .state('contacts.detail', {
	// url will become '/contacts/detail'
        url: '/detail',
	//...more
    })
```

**将之状态模板插入到父状态指定的`ui-view`中**

``` javascript
$stateProvider
    .state('contacts', {
        abstract: true,
        templateURL: 'contacts.html'
    )
    .state('contacts.list', {
        // loaded into ui-view of parent's template
        templateUrl: 'contacts.list.html'
    })
    .state('contacts.detail', {
        // loaded into ui-view of parent's template
        templateUrl: 'contacts.detail.html'
    })
```

``` html
<!-- contacts.html -->
<h1>Contacts Page</h1>
<div ui-view></div>
```

**组合使用示例**

完整示例：http://plnkr.co/edit/gmtcE2?p=preview

``` javascript
$stateProvider
    .state('contacts', {
        abstract: true,
        url: '/contacts',
        templateUrl: 'contacts.html',
        controller: function($scope){
            $scope.contacts = [{ id:0, name: "Alice" }, { id:1, name: "Bob" }];
        }    		
    })
    .state('contacts.list', {
        url: '/list',
        templateUrl: 'contacts.list.html'
    })
    .state('contacts.detail', {
        url: '/:id',
        templateUrl: 'contacts.detail.html',
        controller: function($scope, $stateParams){
          $scope.person = $scope.contacts[$stateParams.id];
        }
    })
```

``` html
<!-- contacts.html -->
<h1>Contacts Page</h1>
<div ui-view></div>
```

``` html
<!-- contacts.list.html -->
<ul>
    <li ng-repeat="person in contacts">
        <a ng-href="#/contacts/{{person.id}}">{{person.name}}</a>
    </li>
</ul>
```

``` html
<!-- contacts.detail.html -->
<h2>{{ person.name }}</h2>
```