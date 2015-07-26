title: 大型 JavaScript 架构中的设计模式
date: 2014-04-21 22:57:24
tags: [Patterns, Architecture]
categories: [JavaScript]
keywords:
---

**今天我们要讨论的是，大型 JavaScript 应用架构中的一些有效设计模式。本文基于我最近发布在 LondonJS 上同名演讲，灵感则来自于 Nicholas Zakas [之前的研究成果](http://yuilibrary.com/theater/nicholas-zakas/zakas-architecture/)。**

## 我是谁以及我为什么要撰写这个主题？

我目前是 AOL 的一名 JavaScript 和 UI 开发人员，负责规划和编写下一代面向用户的应用的前端架构。由于这些应用不仅复杂，而且经常需要一种可扩展和高复用的架构，我的职责之一就是确保实施在这类应用中的设计模式尽可能是可持续的。

我也认为自己是设计模式的狂热者（尽管关于这个主题有许多比我知识渊博的专家）。我之前基于 [Creative Commons](http://wiki.creativecommons.org/Books) 许可写了 '[Essential JavaScript Design Patterns](http://addyosmani.com/resources/essentialjsdesignpatterns/book/)' 一书，现在我正在为此书写更详尽的后续版本。


## 可以用 140 个字概述这篇文章吗？

如果你时间不够，下面是本文的概述，只有一条 tweet 的长度。

<p class="j-warning">应用解耦。架构/模块，外观模式和中介模式。模块发布消息，中介管理发布/订阅，外观处理安全问题。</p>

## 究竟什么是“大型” JavaScript 应用

正式开始之前，我们先尝试为“大型” JavaScript 应用下个定义。对于这个问题，我发现即便是在这个领域有多年开发经验的开发者，他们的答案都可能很主观。

作为实验，我询问了一些中级开发者，让他们试着做一个非正式的定义。一个开发者认为是代码超过 100,000 行的 JavaScript 应用，而另一个则认为是源代码超过 1M 的 JavaScript 应用。虽然是很大胆（如果不是估计吓人）的建议，他们的回答都**不对**，因为代码量的大小不总是和应用的复杂度相关，100,000 行代码也可能是相当琐碎的代码。

我的定义可能会也可能不会被普遍接受，但是我相信更接近大型 JavaScript 应用的本资。

<p class="j-warning">在我看来，大型 JavaScript 应用是那种**非琐碎**，并且需要**大量**开发人员努力维护的应用，最繁重的数据操作和显示处理则应在**浏览器端**。</p>

该定义的最后部分也许才是最重要的。

<!--more-->

## 让我们回顾一下你目前的架构

<p class="j-warning">如果开发一个大型 JavaScript 应用，记得投入**充足的时间**来做基础架构，这才是最有意义的，而且通常比你最初的想象要复杂。</p>

我无法再强调基础架构的重要性了，这非常足够了 - 我见过一些开发者在进入开发大型应用时，都却步说：“好吧，在我上一个中级项目中有一套完善的思路和模式，它们肯定能够适用于稍大的项目，是吧？”虽然这在某种程度上是可行的，但请不要想当然 - **更大的应用通常需要考虑更多的问题**。我即将讨论为什么花费更多的时间来规划应用架构从长远来看是值得的。

大多数 JavaScript 开发人员可能在他们目前的架构中混合使用了如下这些模块：

- 自定义组件 (custom widgets)
- 模型 (models)
- 视图 (views)
- 控制器 (controllers)
- 模板 (templates)
- 库/工具集 (libraries/toolkits)
- 应用程序核心 (an application core)

<p class="j-info">**相关阅读**
- [Rebecca Murphey - Structuring JavaScript Applications](http://blog.rebeccamurphey.com/code-org-take-2-structuring-javascript-applic)
- [Peter Michaux - MVC Architecture For JavaScript Applications](http://michaux.ca/articles/mvc-architecture-for-javascript-applications)
- [StackOverflow - A discussion on modern MVC frameworks](http://stackoverflow.com/questions/5112899/knockout-js-vs-backbone-js-vs)
- [Doug Neiner - Stateful Plugins and the Widget Factory](http://msdn.microsoft.com/en-us/scriptjunkie/ff706600)
</p>

你或许还将你的应用安装功能划分为不同的模块，或应用其他模式，这样做非常好，但是如果这就是你的应用架构的全部，那么你可能会遇到一系列的潜在问题。

**1. 这种架构中有多少是可以立即复用的？**

单个模块可以独立存在吗？他们是自包含的吗？如果让我现在看看你或者你的团队正在编写的大型应用的代码，我会随机选择一个模块，并将其丢在一个新页面中，我可以就这样简单地独立使用这个模块吗？你可能会问为什么要这样做，但是我鼓励你多想想未来的情况。如果你的公司开始构建越来越重要的应用，应用之间又有某些交叉功能，情况会是怎样呢？如果有人说：“我们的用户喜欢邮件客户端的聊天模块，让我们将其添加到我们新的协作编辑套件中吧”，可以不显著修改代码来实现吗？

**2. 在系统中有多少模块依赖于其他模块？**

模块时间是紧耦合的吗？在我深入讨论为什么这是一个问题之前，需要注意的是，在一个系统中一个模块完全不依赖其他模块并不总是可行。在某个粒度级别，可以允许一些模块从其他模块的基础功能扩展而来，但现在的问题是不同功能模块之间的关联度。在你的应用中，应该使这些不同的模块不依赖或加载过多的其它模块。

**3. 如果特定部位崩溃了，应用仍然可用吗？**

如果你正在构建一个类似 GMail 的应用，你的 Web 邮件模块崩溃时，不能阻止其他 UI 操作或阻止用户使用页面中的其他部位，比如聊天应用。同时，按照之前所说，一个模块应该能够脱离当前的应用架构而独立存在。在我的演讲中，我提到了基于用户意图的动态模块加载，例如，在 GMail 的例子中，用户可能默认关闭了聊天应用，页面初始化时就不需要加载相关的核心模块，如果一个用户表达一个意图来使用聊天功能，这时才动态加载关联模块。理想情况下，你需要使这样做不会对应用的其他部分造成负面影响。

**4. 对独立模块的测试容易吗？**

当在一个有相当规模的系统上工作时，有潜在数以百万计的用户（或恶意用户）在使用系统的不同部位，就非常有必要对那些最终可能会被重复使用在不同应用中的模块进行充分的测试。在最初架构中或脱离架构时，对模块的测试都必须是可能的。在我看来，当模块应用在另一个系统时，这样测试为模块不会崩溃提供了最大保证。

## 从长远考虑 Think Long Term

当为你的大型应用设计架构时，做长远考虑很重要，不仅仅是从现在起的一个月或一年，需要考虑的更长远。会有什么改变？当然不可能准确猜到你的应用将如何增长，但肯定有可考虑的空间。读到这里，至少有你的应用的某个特定方面出现在你的脑海里

开发人员经常将 DOM 操作代码和应用的其他代码紧紧地耦合在一起 - 即使他们已经面临将核心逻辑代码独立成模块的问题。想想..如果我们正在做长远考虑，这为什么不是一个好主意。

我的听众之一认为原因是，现在这样严格的架构定义可能不适用于未来。非常正确，然而，还有另一个担忧，就是如果现在不考虑进来，将来可能会耗费更多的成本。

<p class="j-warning">将来，可能由于性能、安全或设计问题，你决定把正在使用的 Dojo、jQuery、Zepto 或 YUI 换成一个完全不同的库。这很可能会演变成一个问题，因为不同库之间不容易互换，并且，如果当前库与你的应用紧密耦合的话，将导致高额的转换成本。</p>

如果你是一个 Dojo 开发人员（比如我演讲会上的某些观众），或许现在没有更好的库给你切换，但是，谁又能说在未来 2-3 年不会出现更好的库，而且你想切换过去呢？

对于较少的代码，这个决定相对容易。但对于大型应用，并有足够灵活的架构作支撑，并不关心模块中使用的是什么库，从经济和节约时间角度来看，都大有益处。

总而言之，如果现在回顾你的架构，你能做到不重写整个应用而完成库转换吗？如果不能，请考虑继续阅读，因为我认为今天介绍的架构可能正是你感兴趣的。

目前为止，对于我所关注的问题，许多有影响力的 JavaScript 开发人员之前就有所涉猎，这里我将分享他们的三个主要观点，引用如下：

<p class="j-warning">“构建大型应用的秘诀在于永远不要构建大型应用，将你的应用分解成小块，然后将这些可测试的、颗粒化的小块组装成你的大型应用” - **Justin Meyer, author JavaScriptMVC**</p>

<p class="j-warning">“关键是要从一开始就承认你不知道你的应用将如何增长，当你承认你不能做到一切时，你就会保守地设计你的系统。你确定可能会改变的关键领域，当你花一点时间在这上面的话，要做到这点往往很容易。举个例子，你应该能想到应用中与其他系统进行通信的部分将可能会改变，因此你需要将它抽象出来。” - **Nicholas Zakas, author 'High-performance JavaScript websites'**</p>

最后但并非最不重要的

<p class="j-warning">“组件之间绑定越紧密，它们就越难以复用，对组件的修改就越困难，因为难免会影响到其他组件。” - **Rebecca Murphey, author of jQuery Fundamentals**</p>

这些原则对于构建经久考验的架构至关重要，应该始终牢记于心。

## 头脑风暴 Brainstorming

让我们先想想我们试图实现什么。

<p class="j-warning">我们想要一个松散耦合的架构，功能被分解为**独立的模块**，模块之间没有依赖。当发生一些有趣的事情时，模块将**告知**应用程序的其他部分，并由一个**中间层**来解析和响应这些消息</p>

例如，如果我们有一个在线面包店的 JavaScript 应用，那么模块中这个“有趣”的消息就可能是“第 42 批次的面包卷已经准备好派送”。

我们使用一个不同的层来解析模块中的消息，这样，a)模块不会直接调用核心模块，b)模块不需要直接调用其他模块或与其他模块进行交互。这有助于防止由于某个模块出错时而导致应用程序崩溃，并给我们提供了一种重启崩溃模块的方式。

另一个则是安全问题。事实上，我们中大多数人不会认为应用程序的内部安全是个问题。我们告诉自己，我们足够聪明，构建应用时，我们清楚地知道哪些是公共的哪些是私有的。

然而，如果你能确定系统中的某个模块允许做什么，这不就很有帮助？例如，在我的系统中，如果我知道公共聊天组件不允许与管理（admin）模块或拥有 DB 写权限的模块发生交互，就可以防止有人利用组件中已知的漏洞来发起 XSS 攻击。模块不应该是能访问一切的。在目前最新的架构中它们可能就是这样（能够访问一切），但它们真的需要这样吗？

用一个中间层来处理权限，确定哪些模块可以访问应用的哪些部分，这样可以增加应用的安全性。这意味着，一个模块最多只能做那些被允许的事情。

## 推荐架构 The Proposed Architecture

我所寻求的架构解决方案是由三个著名的设计模式组合而成：**模块模式**、**外观模式**和**中介模式**。

在传统模式中，模块之间直接相互通信，在这种解耦架构中，模块只会发布感兴趣的事件（理想情况下，一个模块不会感知到其他模块的存在）。中介模式用来订阅模块中的消息，并作出适当的响应。外观模式用于执行模块权限。

我将详细讨论下面这些内容：

- 设计模式
  - 模块化理论
    - [概要](#modtheory)
    - [模块模式](#modpattern)
    - [对象字面量](#objliteral)
    - [CommonJS 模块](#commonjsmods)
  - [外观模式](#facadepattern)
  - [中介模式](#mediatorpattern) 
- 在架构中的应用
  - [应用外观模式 - 抽象的核心](#applyingfacade)
  - [应用中介模式 - 应用程序核心](#applyingmediator)
  - [集成应用](#tyingittogether)   
  
### 模块化理论 Module Theory
<a name="modtheory"></a>

你可能在你现有的架构中使用了一些模块，但是，如果还没有，本节将是一个简短的引子。

<p class="j-warning">模块是任何健壮应用架构中**不可或缺**的一部分，在一个大系统中，模块通常具有单一目的，并且是通用的。</p>

这取决于你如何实现模块，可以为模块定义好依赖关系，并立即自动加载这些依赖项。这种方式更具可伸缩性，不必跟踪模块依赖和手动加载模块或注入 `<script>` 标签。

任何成体系的应用都应该基于模块化的组件来构建。回到 GMail 应用，你可以认为模块是独立存在的功能单元，就像聊天功能模块一样。但是，这取决于功能单元的复杂度，它很可能还依赖于更细粒度的子模块。例如，有一个处理表情符号的模块，可以被共享使用在系统的聊天和邮件应用中。

<p class="j-warning">在现在讨论的架构中，模块**很少感知**系统中的其余部分发生的事情。相反，我们可以通过外观模式将这个任务委托给中介。</p>

这是刻意这样设计的，如果一个模块只关心让系统知道正在发生的事情，而不需要担心其他模块的运行情况，系统就能够支持添加、删除或替换模块，不会因为紧耦合而导致系统中其他模块崩溃。

要想实现这个想法，松散耦合是必要的。在可能的地方移除代码依赖有助于提高模块的可维护性。在我们的例子中，模块不应该依赖其他模块就能正常运行。当松散耦合得到有效实施时，看看系统中一个部位的更改将如何影响其它部位。

在 JavaScript 中，有几种方式来实现模块化，包括著名的模块模式和对象字面量，有经验的开发人员已经熟悉这些，如果你也已经熟悉，请跳到 [CommonJS 模块](#commonjsmods)部分。

### 模块模式 The Module Pattern
<a name="modpattern"></a>

模块模式是一个流行的设计模式，通过闭包来封装“私有”、状态和结构。它提供一种包装公共和私有方法和变量的方式，避免污染全局变量或与其他开发人员的接口发生冲突。这种模式，只返回一些公共的 API，剩下的一切则是私有的。

这提供了一个纯净的解决方案，将逻辑繁重的部分保护在其中，值暴露出接口给应用的其他部位调用。这种模式非常类似于一个立即执行的函数（[IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/)），除了返回的是一个对象，而不是函数。

需要指出的是，在 JavaScript 中并不存在真正意义上的“私有”，因为 JavaScript 不同于一些传统的语言，变量不能被声明为公共或私有的，所以我们使用函数作用域来模拟这一概念。在模块模式中，利用闭包，声明的变量和方法只在模块内部可用，在返回的对象中定义的变量和方法才是随处可用的。

下面你将看到一个用模块模式实现的购物车应用，模块被包含在 `basketModule` 这个全局对象中。模块中的 `basket` 数组是私有的，因此应用的其它部分不能直接读取它，它只存在于模块的闭包中，所以只有那些与它同作用域的方法（例如，`addItem()`, `getItem()` 等等）才能访问到。

```javascript
var basketModule = (function() {
    var basket = []; //private
    return { //exposed to public
        addItem: function(values) {
            basket.push(values);
        },
        getItemCount: function() {
            return basket.length;
        },
        getTotal: function(){
           var q = this.getItemCount(),p=0;
            while(q--){
                p+= basket[q].price; 
            }
            return p;
        }
    }
}());
```

在模块中，我们返回了一个对象，并自动赋给了 `basketModule`，因此，你可以这样来使用它：

```javascript
//basketModule is an object with properties which can also be methods
basketModule.addItem({item:'bread',price:0.5});
basketModule.addItem({item:'butter',price:0.3});
 
console.log(basketModule.getItemCount());
console.log(basketModule.getTotal());
 
//however, the following will not work:
console.log(basketModule.basket);// (undefined as not inside the returned object)
console.log(basket); //(only exists within the scope of the closure)
```

上面的方法被有效地限制在 `basketModule` 命名空间中。

从历史角度来看，模块模式最早在 2003 年由许多人创建，包括 [Richard Cornford](http://groups.google.com/group/comp.lang.javascript/msg/9f58bd11bd67d937)，后来在道格拉斯(Douglas Crockford)的演讲中被推广，并被 Eric Miraglia 在 YUI 的博客中再次介绍。

在具体的工具库或框架中，模块模式是什么样的情况呢？

#### Dojo

Dojo 试图通过 `dojo.declare` 来实现类似于“类”的功能，这个也可用于实现模块模式。例如，如果我们想把 `basket` 定义在 `store` 命名空间下，可以这样来实现：

```javascript
//traditional way
var store = window.store || {};
store.basket = store.basket || {};
 
//using dojo.setObject
dojo.setObject("store.basket.object", (function() {
    var basket = [];
    function privateMethod() {
        console.log(basket);
    }
    return {
        publicMethod: function(){
                privateMethod();
        }
    };
}()));
```

如果混合使用 `dojo.provide` 将变得非常强大。

#### YUI

下面的例子在很大程度上基于由 Eric Miraglia 实现的原始的 YUI 模块模式，代码相对来说比较不言自明。

```javascript
YAHOO.store.basket = function () {
 
    //"private" variables:
    var myPrivateVar = "I can be accessed only within YAHOO.store.basket .";
 
    //"private" method:
    var myPrivateMethod = function () {
            YAHOO.log("I can be accessed only from within YAHOO.store.basket");
        }
 
    return {
        myPublicProperty: "I'm a public property.",
        myPublicMethod: function () {
            YAHOO.log("I'm a public method.");
 
            //Within basket, I can access "private" vars and methods:
            YAHOO.log(myPrivateVar);
            YAHOO.log(myPrivateMethod());
 
            //The native scope of myPublicMethod is store so we can
            //access public members using "this":
            YAHOO.log(this.myPublicProperty);
        }
    };
 
}();
```

#### jQuery

有许多方式可以将 jQuery 代码包装在模块模式中。Ben Cherry 之前提出了一个实现方式，用一个函数将模块定义包装起来，模块定义时处理一些共性事件。

在下面例子中，定义了一个 `library` 函数来创建一个模块，当一个新模块被创建时，自动将 `init` 函数绑定到 `document.ready` 上。

```javascript
function library(module) {
  $(function() {
    if (module.init) {
      module.init();
    }
  });
  return module;
}
 
var myLibrary = library(function() {
   return {
     init: function() {
       /*implementation*/
     }
   };
}());
```

<p class="j-info">**相关阅读**
- [Ben Cherry - The Module Pattern In-Depth](http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth)
- [John Hann - The Future Is Modules, Not Frameworks](http://lanyrd.com/2011/jsconf/sfgdk/)
- [Nathan Smith - A Module pattern aliased window and document gist](https://gist.github.com/274388)
- [David Litmark - An Introduction To The Revealing Module Pattern](http://blog.davidlitmark.com/post/6009004931/an-introduction-to-the-revealing-module-pattern)
</p>


### 对象字面量 Object Literal Notation
<a name="objliteral"></a>

在对象字面量中，一个对象被描述为一组用逗号分隔的键/值对，并用一对 `{}` 包裹起来。对象中的名词可以是字符串或标识符，其后紧跟一个冒号 `:`。在对象的最后一个键/值对后面不能有逗号，因为这可能导致错误。

对象字面量不需要用 `new` 操作符来实例化，但是不能在语句的开始使用，因为 `{` 可能会被解析为语句块的开始。在下面你可以看到，使用对象字面量来定义一个模块，可以使用 `myModule.property = 'someValue'` 的方式来给对象添加新成员。

<p class="j-warning">模块模式在很多情况下很有用，但是，如果你不需要特定的私有属性或方法，那么对象字面量无疑是更合适的代替品。</p>

```javascript
var myModule = {
    myProperty : 'someValue',
    //object literals can contain properties and methods.
    //here, another object is defined for configuration
    //purposes:
    myConfig:{
        useCaching:true,
        language: 'en'   
    },
    //a very basic method
    myMethod: function(){
        console.log('I can haz functionality?');
    },
    //output a value based on current configuration
    myMethod2: function(){
        console.log('Caching is:' + (this.myConfig.useCaching)?'enabled':'disabled');
    },
    //override the current configuration
    myMethod3: function(newConfig){
        if(typeof newConfig == 'object'){
           this.myConfig = newConfig;
           console.log(this.myConfig.language); 
        }
    }
};
 
myModule.myMethod(); //I can haz functionality
myModule.myMethod2(); //outputs enabled
myModule.myMethod3({language:'fr',useCaching:false}); //fr
```

<p class="j-info">**相关阅读**
- [Rebecca Murphey - Using Objects To Organize Your Code](http://blog.rebeccamurphey.com/2009/10/15/using-objects-to-organize-your-code)
- [Stoyan Stefanov - 3 Ways To Define A JavaScript Class ](http://www.phpied.com/3-ways-to-define-a-javascript-class/)
- [Ben Alman - Clarifications On Object Literals (There's no such thing as a JSON Object)](http://benalman.com/news/2010/03/theres-no-such-thing-as-a-json/)
- [John Resig - Simple JavaScript Inheritance](http://ejohn.org/blog/simple-javascript-inheritance/)
</p>

### CommonJS 模块 CommonJS Modules
<a name="commonjsmods"></a>

在过去的一两年，你可能已经听说过 [CommonJS](http://commonjs.org/) - 一个致力于设计、原型化和标准化 JavaScript API 的志愿者工作组。目前，他们已经批准了模块和包的标准，CommonJS AMD 规范定义了一个简单的 API 来声明模块，模块可同时用于浏览器的同步和异步的 `<script>` 标签中。他们的模块模式相对比较清爽，并且我认为它是 ES Harmony（JavaScript 语言的下一个版本）所建议的模块系统的可靠基石。

从结构的角度来看，一个 CommonJS 模块是一段可重用的 JavaScript，它输出特定的对象，以供任何依赖它的代码调用。这种模块格式变得相当普遍，成为 JS 模块格式事实上的标准。有很多关于实现 CommonJS 模块模式的教程，单高度概括起来，都包含两个基本部分：一个 `exports` 对象，包含了对其他模块可用的对象；一个 `require` 函数，用来导入其他模块暴露的对象。

```javascript
/*
Example of achieving compatibility with AMD and standard CommonJS by putting boilerplate around the standard CommonJS module format:
*/

(function(define){
define(function(require,exports){
// module contents
 var dep1 = require("dep1");
 exports.someExportedFunction = function(){...};
 //...
});
})(typeof define=="function"?define:function(factory){factory(require,exports)});
```

有许多强大的库可以处理 CommonJS 模块的加载，但我虽喜欢的是 RequireJS。一个完整的 RequireJS 教程超出了本文的范围，不过我推荐你读一读 James Burke 的博文 [ScriptJunkie](http://msdn.microsoft.com/en-us/scriptjunkie/ff943568)。我知道很多人也喜欢 Yabble。

扯些题外话，RequireJS 提供了一些包装方法，来简化静态模块的创建过程和异步加载。它可以很容易的加载模块以及模块的依赖，然后在模块就绪时执行模块的内容。

有些开发人员声称 CommonJS 模块不太适用于浏览器环境。原因是 CommonJS 模块无法通过 `<script>` 标签加载，除非有服务端协助。我们假设有一个把图片编码为 ASCII 的库，它暴露出一个 `encodeToASCII` 函数。它的模块类似于：

```javascript
var encodeToASCII = require("encoder").encodeToASCII;
exports.encodeSomeSource = function(){
    //process then call encodeToASCII
}
```

在这类情况下，`<script>` 标签将无法正常工作，因为作用域没有被包裹起来，这就意味着 `encodeToASCII` 方法将被绑定到 `window` 对象上，`require` 也不是之前的定义，并且需要为每个模块单独创建 exports。客户端在服务器端的协助下，或通过发送 XHR 请求加载脚本，并使用 `eval()` 函数，可以很容易处理这种情况。

使用 RequireJS，该模块的早期版本可以重写为下面这样：

```javascript
define(function(require, exports, module) {
    var encodeToASCII = require("encoder").encodeToASCII;
    exports.encodeSomeSource = function(){
            //process then call encodeToASCII
    }
});
```

对于不只依赖于静态 JavaScript 的项目来说，CommonJS 是很好的选择，不过先要花一些时间来阅读相关资料。我仅仅涉及到了冰山一角，如果你想深入阅读，CommonJS 的 wikie 和 Sitepen 有着大量资源。

<p class="j-info">**相关阅读**
- [The CommonJS Module Specifications](http://wiki.commonjs.org/wiki/Modules)
- [Alex Young - Demystifying CommonJS Modules](http://dailyjs.com/2010/10/18/modules/)
- [Notes on CommonJS modules with RequireJS](http://requirejs.org/docs/commonjs.html#packages)
</p>

### 外观模式 The Facade Pattern
<a name="facadepattern"></a>

接下来，我们来看看外观模式，在今天定义的架构中扮演着关键角色的设计模式。

当创建一个外观模式时，通常是创建了一个隐藏了不同实现的外在表现。外观模式为大批量代码提供了一个方便的高级接口，隐藏了底层的复杂性，呈现给其他开发人员的是简化的 API。

外观模式是一种结构模式，经常可以在 JavaScript 框架和库中看到，尽管它的实现可能提供能大量行为，但只有一个“外观”或一些有限的抽象方法供客户使用。

这样，我们直接与“外观”交互，而不是隐藏在其后的子系统。

外观模式有趣之处在于，它可以隐藏各个功能模块的内部实现细节，甚至可以在客户不知情的情况下修改其内部实现。

通过维护一个一致性的外观（简化的 API），就不必担心一个模块是否使用了 dojo、jQuery、YUI、zepto 或其他库。只要交互层没有改变，你就可以更换我们的库（如，jQuery 或 Dojo）而不会影响系统的其他部分。

下面是一个非常简单的外观模式的示例，正如你所看到的，在我们的模块内部定义了许多私有方法，然后使用外观模式来为这些方法提供了一个更简单的 API。

```javascript
var module = (function() {
    var _private = {
        i:5,
        get : function() {
            console.log('current value:' + this.i);
        },
        set : function( val ) {
            this.i = val;
        },
        run : function() {
            console.log('running');
        },
        jump: function(){
            console.log('jumping');
        }
    };
    return {
        facade : function( args ) {
            _private.set(args.val);
            _private.get();
            if ( args.run ) {
                _private.run();
            }
        }
    }
}());
 
 
module.facade({run: true, val:10});
//outputs current value: 10, running
```

在将其应用到我们的架构之前，先介绍到这里。接下来，我们将进入激动人心的中介模式，外观模式和中介模式的核心区别在于，外观模式（一种结构模式）只暴露了现有功能，而中介模式（一种行为模式）可以添加功能。

<p class="j-info">**相关阅读**
- [Dustin Diaz, Ross Harmes - Pro JavaScript Design Patterns (Chapter 10, available to read on Google Books)](http://books.google.co.uk/books?id=za3vlnlWxb0C&lpg=PA141&ots=MD5BLTsSzH&dq=javascript%20facade%20pattern&pg=PA141#v=onepage&q=javascript facade pattern&f=false)
</p>


### 中介模式 The Mediator Pattern
<a name="mediatorpattern"></a>

机场交通控制 - 这个简单的比喻最好地诠释了中介模式。航站楼控制着哪个飞机可以起飞或降落，因为所有的沟通都是通过航站楼和飞机之间进行，而不是飞机与飞机之间直接沟通。这个系统成功的关键在于中央控制器，即所谓的中介。

<p class="j-warning">当模块之间通信比较复杂时可以使用中介，单决定权还是在我们自己。如果在你的代码中，模块之间有千丝万缕的关系，就是时候实施一个中央控制器，这就是中介模式的用武之地。</p>

回到我们的讨论，中介模式在不同模块之间的**交互**过程中充当了中介角色，将交互细节都**封装**在了内部。通过阻止对象之间相互引用，这种模式还促进了松散耦合，解决了模块内部依赖问题。

中介模式还有什么其他优势呢？嗯，中介模式允许各个模块的行为独立变化，因此相当灵活。如果你之前使用过观察者模式（发布/订阅模式）来实现模块之间的事件广播，你会发现中介模式相当好理解。

让我们看看模块是如何与中介交互的：

![](http://bubkoo.qiniudn.com/modules-interact-with-a-mediator.jpg)

模块是发布者，中介既是发布者又是订阅者。模块 1 广播一个事件来通知中介需呀做点什么，中介捕获到该事件后，通知模块 2 去完成模块 1 需要的任务，并向中介者广播一个完成事件。同时，模块 3 也被中介启动，记录从中介传来的通知。

注意，任何模块之间都没有**直接通信**，如果作用链中的模块 3 运行失败或意外停止，中介可以假装“暂停”其他模块的任务，停止并重启模块 3，然后继续工作，这对系统而言几乎没有影响。这种层级解耦是中介模式提供的最主要优势之一。

回顾一些，中介者模式的优势如下：

引入中介作为中央控制点来使模块解耦。允许模块监听或广播消息，而不用关心系统的其余部分。消息可以同时被任意数量的模块来处理。

缺点是：

在模块之间添加中介，模块始终必须间接沟通。由于松散耦合的本资，这可能会导致轻微的性能下降，而且很难通过广播消息得知系统将如何响应。如果有一天，紧耦合让你头痛，这也许是一个解决方案。

**示例**：这是中介者模式的一个实现，基于 [@rpflorence](https://github.com/rpflorence) 之前的工作成果。

```javascript
var mediator = (function(){
    var subscribe = function(channel, fn){
        if (!mediator.channels[channel]) mediator.channels[channel] = [];
        mediator.channels[channel].push({ context: this, callback: fn });
        return this;
    },
 
    publish = function(channel){
        if (!mediator.channels[channel]) return false;
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, l = mediator.channels[channel].length; i < l; i++) {
            var subscription = mediator.channels[channel][i];
            subscription.callback.apply(subscription.context, args);
        }
        return this;
    };
 
    return {
        channels: {},
        publish: publish,
        subscribe: subscribe,
        installTo: function(obj){
            obj.subscribe = subscribe;
            obj.publish = publish;
        }
    };
 
}());
```

**示例**：下面是前面实现的两个使用示例，有效管理了发布/订阅。

```javascript
//Pub/sub on a centralized mediator

mediator.name = "tim";
mediator.subscribe('nameChange', function(arg){
        console.log(this.name);
        this.name = arg;
        console.log(this.name);
});

mediator.publish('nameChange', 'david'); //tim, david


//Pub/sub via third party mediator

var obj = { name: 'sam' };
mediator.installTo(obj);
obj.subscribe('nameChange', function(arg){
        console.log(this.name);
        this.name = arg;
        console.log(this.name);
});

obj.publish('nameChange', 'john'); //sam, john
```

<p class="j-info">**相关阅读**
- Stoyan Stefanov - Page 168, JavaScript Patterns
- [HB Stone - JavaScript Design Patterns: Mediator](http://arguments.callee.info/2009/05/18/javascript-design-patterns--mediator/)
- [Vince Huston - The Mediator Pattern (not specific to JavaScript, but a concise)](http://www.vincehuston.org/dp/mediator.html)
</p>

### 应用外观模式 - 抽象的核心
<a name="applyingfacade"></a>

架构建议：

<p class="j-warning">外观模式作为应用程序核心的**抽象**，位于中介和模块之间。理想情况下，它应该是系统中其他部分唯一可以感知到的部分。</p>

抽象的责任包括为模块提供**统一的接口**，并确保任何时候都是可用的。这非常类似于 Nicholas Zakas 首次提出的优秀架构中的沙箱控制器角色。

组件将通过外观与中介通信，所以外观必须是可靠的。需要澄清的是，我所说的“通信”实际上是指与外观进行通信，外观是中介者的抽象，将监听模块的广播消息，然后把广播消息传给中介。

除了为模块提供接口，外观还扮演着保安的角色，确定了一个模块可以访问应用中的哪些部分。组件只能调用自己的方法，对于没有权限的部分，则不能与之交互。例如，一个模块可能广播 `dataValidationCompletedWriteToDB` 消息，这里的安全检查是确保有权限的模块才能请求数据库写操作。我们最好避免让模块视图做一下不被允许的事情。

总之，中介管理发布/订阅，只有通过外观检查的消息才会被传给中介。

### 应用中介者模式 - 应用程序核心
<a name="applyingmediator"></a>

中介扮演的角色是应用程序的核心。我们已经简单介绍了它的一些职责，我们还需要完整的来看看它的左右职责。

中介的主要任务是管理模块的**生命周期**。当中介检查到一个**消息**时，它需要决定应用程序该如何响应 -- 这实际上意味着是否需要**停止**或**启动**一个或一组模块。

<p class="j-warning">理想情况下，模块一旦启动，就应该**自动**执行。模块是否应该在 DOM 就绪时才执行，决定这个的不是中介的职责，架构中应该有足够的空间来让模块自己来决定。</p>

你可能想知道在什么情况下一个模块需要被“停止” -- 如果应用程序侦测到某个模块出现故障或处于严重的错误中，可以决定让阻止模块中的方法继续执行，这时就可以重新启动模块。这样做的目的减少中断，提高用户体验。

此外，中介（应用核心）应该可以**添加或移除**模块，而不破坏任何东西。一个典型的应用场景是，某些功能不是在页面初始化的时候加载，而是基于用户意图动态加载，回到 GMail 的例子，谷歌可以聊天部件默认收起，只有当用户开始使用时才动态加载。从性能优化的角度来看，这是非常有意义的。

错误管理也是由应用程序核心负责。模块除了广播感兴趣的事件之外，还会广播发生的任何错误，然后核心可以做出相应的反馈（例如停止或重启模块）。确保应用有足够的灵活空间，来引入新的或更好的方式来处理错误或向终端用户显示错误，这是解耦架构中的重要环节。通过中介者使用发布/订阅机制，就可以做到这一点。

### 集成应用 Tying It All Together
<a name="tyingittogether"></a>

- **模块**为应用程序提供特定的功能。每当发生了某些事件，它们发布消息来告知应用程序 -- 这是它们的主要关注点。正如我将在 FAQ 中介绍的，模块可以依赖 DOM 工具方法，但是理想情况下不应该依赖系统中的任何其他模块。它们不应该关注：
  - 什么对象或模块将订阅它们发布的消息
  - 这些对象在哪里（是否在客户端或服务器端）
  - 有多少对象订阅了它的消息

  ![](http://bubkoo.qiniudn.com/tying-it-all-together-chart1a.gif)
  
- **外观** 抽象的核心，避免模块之间直接接触。它从模块订阅感兴趣的事件，并说：“太棒了！发生了什么事情？给我细节！”它还通过检查发布消息的模块是否具有相应的权限，来检查模块的安全性。

  ![](http://bubkoo.qiniudn.com/tying-it-all-together-chart2a.gif)

- 中介者（应用程序的核心） 扮演“发布/订阅”管理者的角色。负责管理模块，在需要时启动或停止模块。特别适用于动态依赖加载，并确保失败的模块可以在需要时集中重启。

  ![](http://bubkoo.qiniudn.com/tying-it-all-together-chart3a.gif)

这种架构的结果是，在大多数情况下，模块之间不会相互依赖，这是因为这种解耦架构，模块很容易独立进行测试和维护，可以将模块用于另一个项目，而不需要太多额外的工作。模块可以被动态添加或移除，而不会导致应用程序崩溃。

## 超越(Beyond)发布/订阅：自动事件注册

正如 Michael Mahemoff 之前提到，当考虑大型 JavaScript 应用时，适当利用这门语言的动态特性是有益的。关于详细内容请阅读 Michael [G+](https://plus.google.com/106413090159067280619/posts/hDZkVrDXZR6) 上列举的概念，我最关注一个特别的概念 -- 自动事件注册（AER）。

AER 通过基于命名约定的自动连接模式，解决了从订阅者到发布者的连接问题。例如，如果某个模块发布了 `messageUpdate` 消息，所有与 `messageUpdate` 相关的方法将被自动调用。

这种模式涉及到：注册所有可能订阅事件的模块，注册所有可能被订阅的事件，最后为组件库中的每个订阅者注册方法。对于这篇文章所讨论的架构来说，这是一个非常有趣的方法，但也确实带来一些有趣的挑战。

例如，当动态执行时，对象可以在创建时注册自身。请阅读 Michael 关于 AER 的[文章](http://softwareas.com/automagic-event-registration)，他更深入地讨论了如何处理这类问题。

## 常问问题

**Q: 是否可以完全避免实现一个沙箱或外观？**
A: 虽然前面的介绍中使用了外观来实现安全功能，如果不用外观，完全可以通过中介和发布/订阅机制来做系统中的通信。这种轻量级版本可以提供一定程度的解耦，但是如果这么做，模块就可以直接与应用程序核心（中介者）直接接触。

**Q: 您提到了模块没有任何依赖，这是否包含对第三方库的依赖（如jQuery）?**
A: 这里是指对其他模块的依赖。一些开发人员在架构中选择了一些 DOM 工具库，实际上是对这些 DOM 库的公共抽象。例如，你可以创建一个 DOM 工具类，使用 jQuery 来查询选择器表达式，并返回查找到的 DOM 结果（或者使用 Dojo）。通过这种方式，尽管模块依然会查询 DOM，但不会强依赖于特定的库。有许多方式可以实现这一点，但是理想情况下，核心模块不应该依赖其他模块。

这样做你会发现，有时候很容易就可以让一个完整的模块运行在另一个项目中。需要说清楚的是，我完全同意对模块进行扩展或使用模块的部分功能，但是记住，在某些情况下，想要把这样的模块应用到其他项目会增加工作量。

**Q: 我现在就想开始使用这种架构。是否有可供参考的样板代码？**
A: 如果时间允许的话，我打算为这篇文章发布一个样例程序，但目前你最好的选择是 Andrew Burgees 的超值教程 [Writing Modular JavaScript](http://bit.ly/orGVOL)（在推荐之前需要完全披露的是，这仅仅是一个推荐链接，收到的任何反馈都将有助于完善内容）。Andrew 的样例库包含一张屏幕截屏以及代码，覆盖了这篇文章的的大部分主要观点，但选择把外观称作“沙箱”，就像 Zakas。还有一些讨论是关于如何理想地在这样一个架构中实现 DOM 抽象库———类似于我对第二个问题的回答，Andrew 在实现选择器表达式查询时采用了一些有趣的模式，使得在大多数情况下，用短短几行代码就可以做到切换库。我并不是说它是正确的或最好的实现方式，但是它是一种可能，而且我个人也在使用它。

**Q: 如果模块需要直接与核心通信，这么做可能吗？**
A: 正如 Zakas 之前暗示的，为什么模块不应该访问核心，这在技术上并没有问题，但这是最佳实践，比其他任何事情都重要。如果你想严格地坚持这种架构，你需要遵循定义的这些规则，或者选择一个更松散的结构，就像第一个问题的答案。


<p class="j-quote">原文：[Patterns For Large-Scale JavaScript Application Architecture](http://addyosmani.com/largescalejavascript/) by [@Addy Osmani](http://twitter.com/addyosmani). Technical Review: [@Andrée Hansson](http://twitter.com/peolanha)</p>