title: 使用 Developer Tools 进行 JavaScript 性能分析
date: 2014-02-19 01:13:32
updated: 2014-02-19 01:13:32
tags: [Performance]
categories: []
keywords:
---
原文链接：[JavaScript Profiling With The Chrome Developer Tools](http://coding.smashingmagazine.com/2012/06/12/javascript-profiling-chrome-developer-tools/)

现在，让我们来让你的网站跑得更快，网站性能通常包括两个方面：页面加载速度和脚本执行速度，有很多方法可以让网站加载更快，例如，压缩文件和 CND 等，但是要让脚本执行更快就得靠开发人员自己了。

代码很小的改动就可能对性能产生巨大影响，不同位置的几行代码可能就意味着一个快的网站和产生可怕的“无响应脚本”对话框的网站之间的区别。本文展示了使用 Chrome 开发工具来找到这些性能关键点代码的一些方法。

## 建立基准线 ## 

我们来看一个简单的[颜色排序应用](http://zgrossbart.github.io/jsprofarticle/index1.htm)，这个应用展示了一个由各种颜色构成的网格，您可以拖放任意一个颜色点来混淆。每一个颜色点都是一个 div 标签，使用了一些 CSS 来让它们看起来像一个圆点。

![Color Sorter](http://bubkoo.qiniudn.com/color%20sorter.png)

[点击这里](http://zgrossbart.github.io/jsprofarticle/index1.htm)访问该应用。

生成一个这些颜色有点棘手，所以我参考了 [Making Annoying Rainbows in JavaScript](http://krazydad.com/tutorials/makecolors.php) 这篇文章。

<!--more-->

这个页面载入很快，但是仍需要一些时间，是时候来优化它使其运行更快了。

在开始对一个网站进行性能优化之前，我们需要设置一个基准线，从而得知优化效果怎么样，并帮助我们权衡利弊。在本文中，我们将使用 [Chrome 开发者工具](http://code.google.com/chrome/devtools/docs/overview.html)。

性能分析器（profiler）是 Chrome 开发者工具的一部分，通过点击“工具”菜单下的小扳手来打开它。[Firebug](http://getfirebug.com/) 也有性能分析工具，但是，WebKit 内核的浏览器（Chrome 和 Safari）在代码分析和展示时间线方面是最好的。Chrome 还提供了一个很棒的事件跟踪工具，叫 [Speed Tracer](https://developers.google.com/web-toolkit/speedtracer/)。

为了建立我们的基线，首先在“Timeline”选项卡中点击“Record”开始记录，加载页面，然后停止记录，Chrome 非常智能，只有当开始加载页面的时候才开始记录。这里记录了三次，然后取三次的平均值，以防在第一次测试时我的电脑运行的很慢。

![](http://bubkoo.qiniudn.com/Developer%20Tools'%20baseline-1.png)

我的平均基线，也就是从第一次请求页面到页面渲染完成所花费的时间是 1.25 秒，这个并不算慢，但是对于这样的小型应用还不够好。

我想让我的代码运行的更快，但是我还不知道是哪里导致代码运行缓慢的。性能分析工具（profiler）将帮助我找到原因。

## 创建一个 Profile##

通过时间线（timeline）我们知道代码运行了多久，但是我们并不知道代码在运行时具体发生了什么。虽然可以通过修改代码后，再次记录时间线，然后重复这个过程，来找到影响性能的代码，但这太盲目了，很难找到性能瓶颈点。“Profiles”选项卡给我们提供了一个更好的方式，去了解代码的具体执行情况。

“Profiles”选项卡直观地显示了哪个函数占用了大部分执行时间，在Chrome 开发者工具的“Profiles”选项卡中，提供了三种性能分析方式：

1. JavaScript CPU profile，显示我们的 JavaScript 运行时占用了多少 CPU 时间。
2. CSS selector profile，显示处理 CSS 选择器时占用了多少 CPU 时间。
3. Heap snapshot，显示 JavaScript 对象的内存占用情况。

我们想让代码执行更快，所以我们将使用 CPU 性能测试。点击开始分析，刷新页面，加载完成之后停止分析器。

![](http://bubkoo.qiniudn.com/Developer%20Tools'%20baseline-2.png)

从分析结果知道页面上有很多函数在执行。在这个应用中使用了 jQuery 和 jQuery UI 来管理插件和解析正则表达式等工作。同时，我们可以看到我们的这两个函数：`decimalToHex` 和 `makeColorSorter` 位居列表的顶部，这两个函数总共占用了 13.2% 的执行时间，所以他们是很好的性能优化点。

在分析工具中，我们可以点击函数名称左边的小箭头来展开函数的调用堆栈，可以看出，`decimalToHex` 被 `makeColorSorter` 调用，`makeColorSorter` 又被 `$(document).ready` 调用。

代码如下：

``` javascript
$(document).ready(function() {
    makeColorSorter(.05, .05, .05, 0, 2, 4, 128, 127, 121);
    makeSortable();
});
```

从调用来源可以知道 `makeSortable` 方法并不是我们最大的性能问题。通常情况下排序操作会带来一些[性能问题](http://37signals.com/svn/posts/3137-using-event-capturing-to-improve-basecamp-page-load-times)，但是，在我们的代码中添加 DOM 元素花费了比排序还要多的时间。

在开始优化之前，我们首先需要孤立将要优化的代码，页面加载的时候执行的函数太多了，我不想这些影响到我们的性能分析。

## 隔离代码 ##

我编写了[第二个版本](http://zgrossbart.github.com/jsprofarticle/index2.htm)的颜色排序应用，在这个版本中，页面载入的时候并不会执行我们的应用，直到我们点击页面上的一个按钮时，才执行我们的应用。这样就让我们的代码从页面加载过程中隔离出来，当我们优化完成之后再修改回去。

将隔离出来的代码放在一个新函数中，命名为 `testColorSorter` ，然后将其绑定在按钮上：

``` javascript
function testColorSorter() {
    makeColorSorter(.05, .05, .05, 0, 2, 4, 128, 127, 121);
    makeSortable();
}

<button id="clickMe" onclick="testColorSorter();">Click me</button>
```

在我们进行性能分析之前修改代码可能会导致意外的结果。虽然这个改动看起来很安全，但是我还是要重新运行性能分析，来看看我是不是无意中改变了什么。我会开始一次新的性能分析，点击应用中的按钮，等应用加载完成后，点击停止。

![](http://bubkoo.qiniudn.com/Developer%20Tools'%20baseline-3.png)

现在 `decimalToHex` 函数的载入只占用了 4.23% 的时间，这是代码执行花费时间最多的地方。我们需要创建一个新的基线来看看这个方案将会有多大优化。

![](http://bubkoo.qiniudn.com/Developer%20Tools'%20baseline-4.png)

在点击按钮之前有一些事件被触发了，但是我只关心从我点击按钮到浏览器渲染完成“颜色排序器”所花费的时间。鼠标在 390 毫秒的时间点击，渲染事件在 726 毫秒时被触发。726 减去 390 就得到基线值 336 毫秒。同样，我重复了三次，然后取平均值。

此时，我知道在哪里看代码的运行时间了，现在我们可以开始解决性能问题。

## 优化代码 ##

通过性能分析器我们只知道是哪个函数有性能问题，我们还需要查看函数的内部实现，来了解函数具体做了什么。

``` javascript
function decimalToHex(d) {
    var hex = Number(d).toString(16);
    hex = "00".substr(0, 2 - hex.length) + hex; 

    console.log('converting ' + d + ' to ' + hex);
    return hex;
}
```

“颜色排序器”中的每一个颜色点都有一个 [16 进制](http://en.wikipedia.org/wiki/Hexadecimal)的颜色值，例如 `#86F01B` 和 `#2345FE`，这些值分别表示了颜色中红、绿、蓝三原色各自的值。例如背景色是 `#2456FE` 的颜色点，就代表红色的值是 36，绿色的值是 86，蓝色的是 254，每一个数值必须在 0 到 255 之间。

`decimalToHex` 函数就是把这用 RGB 值表示的颜色转化为页面中我们使用的十六进制颜色。

这个函数非常简单，但是我还是留下了一个可以去掉的调试代码 `console.log` 在那里。

由于某些十进制数字对应的十六进制数字只有一位，例如十进制的 10 表示为十六进制后是 C，而三原色中的颜色值需要两位十六进制的数字，所以有必要在 `decimalToHex` 函数中进行补位。为了让这个转换函数执行更加快，我们可以修改里面的补位操作，使其并不那么泛化。由于我们知道需要补位的数字的长度都为 1，所以我们可以这样重构这个函数：

```javascript
function decimalToHex(d) {
    var hex = Number(d).toString(16);
    return hex.length === 1 ? '0' + hex : hex; 
}
```

在[第三个版本](http://zgrossbart.github.com/jsprofarticle/index3.htm)的颜色排序器中，只有在需要补位的时候才会修改字符串，并且不用调用 `substr` 函数。有了这个新函数，我们的运行时间是 137 毫秒，再次对代码进行性能测试，可以发现 `decimalToHex` 函数只占用了总时间的 0.04%，到了性能列表的下部。

![](http://bubkoo.qiniudn.com/Developer%20Tools'%20baseline-5..png)

我们还可以发现占用 CPU 时间最多的函数是 jQuery 的 `e.extend.merge`。我并不知道这个函数的作用，因为 jQuery 代码是被压缩过的。我们可以使用开发版本的 jQuery，但是我发现这个函数是被 `makeColorSorter` 调用的。所以下一步我们先让这个函数执行的更快。

## 减小内容改动 ##

“颜色排序器”中的颜色是用过正弦曲线生成的。在光谱中设置一个中心点，然后以一定的偏移来创建这个曲线，这就把颜色变成了一个“彩虹模型”。我们还可以通过改变红、绿、蓝三原色的频率来改变颜色。

``` javascript
function makeColorSorter(frequency1, frequency2, frequency3,
                         phase1, phase2, phase3,
                         center, width, len) {

    for (var i = 0; i < len; ++i)
    {
       var red = Math.floor(Math.sin(frequency1 * i + phase1) * width + center);
       var green = Math.floor(Math.sin(frequency2 * i + phase2) * width + center);
       var blue = Math.floor(Math.sin(frequency3 * i + phase3) * width + center);

       console.log('red: ' + decimalToHex(red));
       console.log('green: ' + decimalToHex(green));
       console.log('blue: ' + decimalToHex(blue));

       var div = $('<div class="colorBlock"></div>');
       div.css('background-color', '#' + decimalToHex(red) + decimalToHex(green) + decimalToHex(blue));
       $('#colors').append(div);
       
    }
}
```

我们应该去掉 `console.log` 函数。这样调用非常糟糕，因为每次执行都会调用 `decimalToHex` 函数，这意味着 `decimalToHex` 的调用次数将会增加一倍。

这个函数还会频繁地修改 DOM 结构。每次循环，都向 ID 为 `colors` 的 `div` 中添加一个新的 `div`。这就让我怀疑这可能就是 `e.extend.merge` 函数所做的事情。用性能分析器做一个小实验就可以搞清楚。

我想要在循环结束后一次性把所有的 `div` 添加进去，而不是在每个循环中添加都一个新的 `div`，我们需要在循环外创建一个变量来存储这些 `div`，然后在最后一次性添加进去。

``` javascript
function makeColorSorter(frequency1, frequency2, frequency3,
                         phase1, phase2, phase3,
                         center, width, len) {

    var colors = "";
    for (var i = 0; i < len; ++i)
    {
       var red = Math.floor(Math.sin(frequency1 * i + phase1) * width + center);
       var green = Math.floor(Math.sin(frequency2 * i + phase2) * width + center);
       var blue = Math.floor(Math.sin(frequency3 * i + phase3) * width + center);

       colors += '<div class="colorBlock" style="background-color: #' + 
           decimalToHex(red) + decimalToHex(green) + decimalToHex(blue) + '"></div>';
    }

    $('#colors').append(colors);
}
```

这个微小改动意味着在添加所有这些 `div` 的时候，只有一次 DOM 操作。用时间线进行测试，我们发现从点击到渲染只用了 31 毫秒。这个一次性的 DOM 操作，使得[第四个版本](http://zgrossbart.github.com/jsprofarticle/index4.htm)的运行时间降低了 86%。我可以再次打开性能分析器(profiler)，发现 `e.extend.merge` 函数占用了仅很少的时间，在性能列表中已经看不到它了。

我们还可以移除 `decimalToHex` 函数让代码更快一点。因为 [CSS 支持 RGB 颜色值](http://www.w3schools.com/cssref/css_colors.asp)，所以我们不需要把他们转换到十六进制。现在我们可以这样修改 `makeColorSorter` 函数：

``` javascript
function makeColorSorter(frequency1, frequency2, frequency3,
                         phase1, phase2, phase3,
                         center, width, len) {

    var colors = "";
    for (var i = 0; i < len; ++i)
    {
       var red = Math.floor(Math.sin(frequency1 * i + phase1) * width + center);
       var green = Math.floor(Math.sin(frequency2 * i + phase2) * width + center);
       var blue = Math.floor(Math.sin(frequency3 * i + phase3) * width + center);

       colors += '<div class="colorBlock" style="background-color: rgb(' + 
           red + ',' + green + ',' + blue + ')"></div>';
    }

    $('#colors').append(colors);
}
```

[第五个版本](http://zgrossbart.github.com/jsprofarticle/index5.htm)的执行只用了 26 毫秒，而且代码也从 28 行减少到 18 行。

## 在你的应用中进行 Javascript 性能分析 ##

现实环境中的应用要不这里的“颜色排序器”要复杂得多，但是做性能分析都遵循相同的基本步骤：
1. **建立基准线**，这样你就知道从何开始
2. **隔离代码**，将可能有性能问题的代码与其他代码隔离开来
3. **优化代码**，频繁的使用时间线（timelines）和性能分析器（profiles），在可控的条件下进行逐步优化

还有一些性能优化的准则：
1. **从最慢的部分开始**，这样在时间优化上可以得到最大的提升
2. **保持环境统一**，如果你换了电脑或者做了任何大的改动，都要设置新的基线
3. **多次分析**以防电脑的异常而影响了结果的准确性


每个人都想要自己的网站更快，同时还必须开发新的功能，但是新的功能通常会让网站更慢。所以花费时间来做性能优化是有价值的。

性能分析和优化使得[最终版](http://zgrossbart.github.com/jsprofarticle/index6.htm)的“颜色分类器”的执行时间减少了 92%。你的网站可以变快多少？

英文原文：[Zack Grossbart](http://coding.smashingmagazine.com/2012/06/12/javascript-profiling-chrome-developer-tools/)，翻译：[布谷 bubkoo](http://bubkoo.com/)

原文链接：[JavaScript Profiling With The Chrome Developer Tools](http://coding.smashingmagazine.com/2012/06/12/javascript-profiling-chrome-developer-tools/)