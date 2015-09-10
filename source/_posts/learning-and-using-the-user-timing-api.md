title: 学习使用 Timing API
date: 2014-03-1 23:53:16
updated: 2014-03-1 23:53:16
tags: 
  - Performance
  - Timing
categories: [JavaScript]
keywords:
---
高性能的 Web 应用是获得伟大用户体验的关键。随着 Web 应用越来越复杂，要想建立吸引人的用户体验，了解性能的影响是至关重要的。在过去的几年中，浏览器中也新增了许多 API 来帮助我们分析网络性能、页面加载时间等。但这些并没有给出详尽的足够灵活的方式，来帮助我们分析具体是什么降低了我们网站的性能。[User Timing API](http://www.w3.org/TR/user-timing/) 提供了一套机制来帮助我们测量我们的应用，从而找到应用中耗时的部分。在本文中，我将介绍这个 API 并提供一些如何使用它的例子。

## 你不能优化那些不能被测量的东西 ##

给运行缓慢的应用提速的第一步是，找到应用中耗时的部位。要想找到这些烫手山药，最理想的方式就是对 JavaScript 代码进行区域性的运行时间测量，这是寻找如何提高网站性能的第一步。幸运的是，可以在代码的不同部位去调用 [User Timing API](http://www.w3.org/TR/user-timing/)，提取到时间的详细数据，来帮助你进行性能优化。

## 高精度时间和`now()` ##
准确测量时间的一个基础是精确度，之前我们是基于毫秒的时间测量，这种方式工作良好，但是对于一个每帧需要在 16ms 内绘制完成的 60FPS 的网站，如果只有毫秒精度的测量，对于网站的分析就缺乏所需要的精度。[High Resolution Time](http://www.w3.org/TR/hr-time/) 是现代浏览器内置的一种新的测量时间的方式，它给我们提供了一个精确到微秒的浮点类型的时间戳，是之前精度的 1000 倍。

可以通过调用 [Performance](http://www.w3.org/TR/navigation-timing/#performance) 对象中的[扩展方法](http://www.w3.org/TR/hr-time/#sec-extenstions-performance-interface) `now()` 来获取当前的时间，就像下面代码这样：
<!--more-->

``` javascript
var myTime = window.performance.now();
```

另一个接口 [PerformanceTiming](http://www.w3.org/TR/navigation-timing/#sec-navigation-timing-interface) 提供了一系列关于页面加载情况的时间。调用 `now()` 返回的时间是当前时间与 [navigationStart](http://www.w3.org/TR/navigation-timing/#dom-performancetiming-navigationstart) 对应时间的差值。

### DOMHighResTimeStamp 类型 ### 

在过去我们通过 `Date.now()` 在网页中测量时间，它的返回是 [DOMTimeStamp](http://www.w3.org/TR/DOM-Level-3-Core/core.html#Core-DOMTimeStamp) 类型，它返回一个整数的毫秒值。为了提高精度，我们需要高分辨率的时间，所以有了 [DOMHighResTimeStamp](http://www.w3.org/TR/hr-time/#sec-DOMHighResTimeStamp) 这个类型，它返回的一个浮点数的毫秒值，由于是浮点数，所以小数部分就能得到千分之一毫秒的精度。

## User Timing 接口 ##

现在我们有了高分辨率的时间戳，我们可以使用 [User Timing 接口](http://www.w3.org/TR/user-timing/)来获取时间信息。

User Timing 接口提供了很多方法，让我们可以在应用中的不同位置去调用这些方法，像《奇幻森林历险记》中的面包屑那样，我们可以跟踪到时间花费在了应用中的哪些位置。

### 使用`mark()`方法 ###
`mark()` 方法是时间分析工具中的主要方法，它的功能就是为我们记录时间，其超级有用之处在于我们可以为我们记录的时间命名，它会将这个名字和时间作为一个独立的单元来记住。

在应用中不同位置调用 `mark()` 方法可以让你知道应用中被标记的位置所花费的时间。

接口调用规范中建议使用一些有意义的或能自我解释的命名方式，例如：“mark_fully_loaded”、“mark_fully_visible”、“mark_above_the_fold”等等。

例如，我们想在页面加载完成之后设置一个标志，可以使用下面这样的代码：

``` javascript
window.performance.mark('mark_fully_loaded');
```

通过在页面中设置一些命名的时间标志，我们可以收集到一大堆时间数据，进而可以分析出来我们的应用在什么时候做了什么。

### 通过`measure()`来计算测量结果 ###

一旦你设置了一系列的时间标志，你就想得到他们之间的运行时间。这可以通过调用 `measure()` 方法来实现。

`measure()` 方法不仅可以计算标志之间的时间，而且也能计算标志和 [PerformanceTiming](http://www.w3.org/TR/navigation-timing/#sec-navigation-timing-interface) 接口中那些已知的事件名之间的时间。

例如，你可以通过下面的代码来获取到 DOM 加载完成到页面 loaded 之间的时间：

``` javascript
window.performance.measure('measure_load_from_dom', 'domComplete', 'mark_fully_loaded');
```

注意：在上面例子中，我们使用了 PerformanceTiming 接口中的事件名：domComplete。

当调用 `measure()` 方法时，它会根据你设置的标志来独立储存计算结果。在应用运行时将时间记录下来，同时保持了应用的可交互性，在应用执行完某些工作之后，再将这些数据转存起来，稍候你就可以对这些数据进行分析。

### 通过`clearMarks()`来清除标记 ###

有时候清除一些你设置的标志也非常有用，比如，你可能在批量运行一些代码，然后想重新开始单独运行。

通过调用 `clearMarks()` 方法可以很简单滴来清除标志。

下面的代码会清除所有你设置的标志，这样你就可以设置新的标志来重新运行。

```javascript
window.performance.clearMarks();
```

当然，也有可能你并不想清除所有的标志，而是想清除某些特定的标志，你只需要给 `clearMarks()` 方法传递你想清除的标志名即可，例如：

```javascript
window.peformance.clearMarks('mark_fully_loaded');
```

上面代码清除了我们之前设置的标志，而保留了其他标志。

也许你还想清除哪些你已经测量的结果，这里有一个对应的 `clearMeasures()` 方法，调用方法与 `clearMarks()` 类似，例如：

```javascript
window.performance.clearMeasures('measure_load_from_dom');
```

上面代码清除了之前我们做的 measure() 示例中的测量结果。如果你想清除所有的测量结果，和 clearMarks() 一样，只需要调用不传参数的 `clearMeasures()` 方法即可。

## 获取时间数据 ##

现在设置标志和测量时间间隔都没有问题了，但通常你需要获取到这些时间数据并进行一些分析。通过 PerformanceTimeline 提供的接口，这也非常简单。

例如，通过调用 `getEntriesByType()` 方法，可以获取到所有的标志和测量的时间间隔，它返回一个数组，我们可以循环这个数组，并对数据进行处理。不错的是，它返回的数据的顺序与你在页面上标记的顺序一样。

下面代码返回页面中所有标记的数组：

```javascript
var items = window.performance.getEntriesByType('mark');
```

下面代码返回所有时间测量的数组：

```javascript
var items = window.performance.getEntriesByType('measure');
```

你也可以获取到特定名字的实体数组，例如：

```javascript
var items = window.performance.getEntriesByName('mark_fully_loaded');
```

## 示例：测量 XHR 的请求时间 ##

现在我们对 User Timing API 有了比较清晰的认识，我们可以借助它来测量一个 [XMLHttpRequests](http://www.w3.org/TR/XMLHttpRequest/) 请求所花费的时间。

首先，我们需要修改 `send()` 方法，在请求发出之前设置一个标志，同时修改我们的 success 回调方法，在回调方法中设置另一个标志。然后，生成一个请求耗时的测量结果。

通常，我们的 XMLHttpRequest 代码像这样：

```javascript
var myReq = new XMLHttpRequest();
myReq.open('GET', url, true);
myReq.onload = function(e) {
  do_something(e.responseText);
}
myReq.send();
```

在我们的代码中，我们将添加一个全局的计数器变量 `reqCount`，表示发送请求的次数，也将用它来储存每次的测量结果，代码如下：

```javascript
var reqCount = 0;

var myReq = new XMLHttpRequest();
myReq.open('GET', url, true);
myReq.onload = function(e) {
  window.performance.mark('mark_end_xhr');
  reqCnt++;
  window.performance.measure('measure_xhr_' + reqCnt, 'mark_start_xhr', 'mark_end_xhr');
  do_something(e.responseText);
}
window.performance.mark('mark_start_xhr');
myReq.send();
```

上面的代码为每次 XMLHttpRequest 请求生成了包含一个唯一名字的测量，我们假设所有请求有序发生 - 要使请求有序发生，需要更复杂的处理，我把这个留给读者练习。

一旦应用完成一系列请求之后，我们就可以将结果输出到控制台：

```javascript
var items = window.performance.getEntriesByType('measure');
for (var i = 0; i < items.length(); ++i) {
  var req = items[i];
  console.log('XHR ' + req.name + ' took ' + req.duration + 'ms');
}
```

## 总结 ##
User Timing API 提供了很多实用的方法，适用于 Web 应用的任何方面。通过在你的应用中设置大量的 API 调用来缩小热点范围，然后通过分析生成的时间数据，就可以清晰地知道时间被花费在了什么地方。但是，如果你的浏览器不支持这些 API 怎么办？没关系，[这里](https://gist.github.com/pmeenan/5902672)有一个强大的模拟 API，而且在 [webpagetest.org](http://www.webpagetest.org/) 应用的非常好。那么你还在等什么呢?立刻在你的应用中使用 User Timing API 吧，你将找到方法如何使你的应用运行的更快，然后你的用户将感激你为他们提供了更好的用户体验。


英文原文：[Alex Danilo](http://www.html5rocks.com/profiles/#alexdanilo)，翻译：[布谷 bubkoo](http://bubkoo.com/)

原文链接：[User Timing API](http://www.html5rocks.com/en/tutorials/webperformance/usertiming/)