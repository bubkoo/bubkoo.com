title: 【译】Javascript 基准测试
date: 2014-02-18 20:51:29
updated: 2014-02-18 20:51:29
tags: [Performance]
categories: []
keywords:
---
原文发表在 [Performance Calendar](http://calendar.perfplanet.com/) 上，作为其 2010 年系列文章的一部分。在[上一篇](http://bubkoo.com/2014/02/13/writing-fast-memory-efficient-javascript/)翻译的文章中，作者推荐了这篇文章，译者阅读之后觉得有一定的价值，而且网络上没有这篇文章的中文翻译，权当学习就在此翻译成了中文，水平有限，如果有表达不恰当或者表达有误的地方，请直接在评论中指出。

原文链接：[Bulletproof JavaScript benchmarks](http://calendar.perfplanet.com/2010/bulletproof-javascript-benchmarks/)，下面开始翻译正文。


编写 JavaScript 基准测试并不是想象的那么容易，撇开潜在的跨浏览器兼容问题不说，还将面临很多陷阱（甚至诡雷）。

这也是我创建 [jsPerf](http://jsperf.com/) 的一部分原因，jsPerf 提供了一个非常简单的 Web 接口，您可以非常轻松地创建和分享不同代码片段的性能测试用例。您不需要考虑其他问题，只需要输入你想做基准测试的代码，jsPerf 就会为您创建一个运行在不同的浏览器和设备上测试用例。

其实，jsPerf 最开始使用的是一个基于 [JSLitmus](https://github.com/broofa/jslitmus) 的基准测试库 - [Benchmark.js](https://github.com/mathiasbynens/benchmark.js)
。后来添加了很多新功能，最近，[John-David Dalton](http://allyoucanleet.com/)
 又从头开始完全重写了该代码，Benchmark.js 也变得越来越完善。

本文将阐明编写和运行 JavaScript 基准测试的各种陷阱。
<!--more-->

## 基准测试的方式 ##

目前，有很多方法可以对 JavaScript 代码片段进行性能基准测试。最常见的模式如下：

### 方式 A ###

``` javascript
var totalTime,
    start = new Date,
    iterations = 6;
while (iterations--) {
  // 您的 JavaScript 代码片段
}
// totalTime → 代码片段的总共执行时间
// 代码片段循环了 6 次
totalTime = new Date - start;
```

将要测试的代码片段放在一个循环中，并使其执行预定义的次数（这里是 6 次），然后，用结束时间减去开始时间就可以得到整个代码的执行时间。方式 A 被 [SlickSpeed](https://github.com/kamicane/slickspeed/)、[Taskspeed](https://github.com/phiggins42/taskspeed)、[SunSpider](http://www2.webkit.org/perf/sunspider/sunspider.html) 和 [Kraken](http://krakenbenchmark.mozilla.org/) 这样一些流行的基准测试组件采纳。

### 方式 A 的问题 ###

由于浏览器和设备变得越来越快，方式 A 的测试很大可能会得到 0ms，这使得测试结果不可用。

### 方式 B ###

另一种方法是计算在指定时间段内可以执行多少次操作，这种方式的优点是不需要您指定一个迭代次数。

``` javascript
var hz,
    period,
    startTime = new Date,
    runs = 0;
do {
  // 您的代码片段
  runs++;
  totalTime = new Date - startTime;
} while (totalTime < 1000);

// 将毫秒转换成秒
totalTime /= 1000;

// period → 执行每个操作需要的时间
period = totalTime / runs;

// hz → 每秒可以执行多少个操作
hz = 1 / period;

// 可以简写为
// hz = (runs * 1000) / totalTime;
```

这里的代码片段大约执行了 1 秒钟，方式 B 被使用在 [Dromaeo](http://dromaeo.com/) 和  [V8 基准测试组件](http://code.google.com/apis/v8/benchmarks.html)中。

### 方式 B 的问题 ###

在进行这种基准测试时，由于垃圾回收机制、引擎优化和其他后台进程的影响，测试结果会有所不同。由于这种差异，就需要运行数次基准测试代码来取得平均结果。然而，在 V8 中每个基准测试只会运行 1 次，Dromaeo 也仅仅只会运行 5 次。我们可以通过运行更多次来减少误差幅度，方法之一是通过减少每次基准测试运行的时间，例如从 1000ms 减少到 50ms，这样在相同的时间内就可以运行更多次数的基准测试。

### 方式 C ###

[JSLitmus](http://www.broofa.com/Tools/JSLitmus/) 是基于上面这两种方式来构建的，它使用方式 A 来将一个测试运行 n 次，同时使用方式 B 来动态增加 n 来保持测试运行，直到达到最小测试时间。

### 方式 C 的问题 ###

JSLitmus 避免了方式 A 的问题，但仍有方式 B 的问题。为了提高结果的准确性，JSLitmus 通过获取三次空测试中最快的那个时间，然后将每次基准测试的时间减去这个最快时间，来校准测试结果。不幸的是，这种方法混淆了最终结果，因为“获取 3 个空测试中的最快时间”不是一个统计上有效的方法。虽然 JSLitmus 运行基准测试数次，并且从基准测试的平均结果中减去了校验平均值，还是增加了最终结果的误差幅度，也吞噬了增加准确性的希望。

### 方式 D ###

方式 A、B 和 C 的缺点可以通过编译函数和展开循环来避免。

``` javascript
function test() {
  x == y;
}

while (iterations--) {
  test();
}

// ...would compile to →
var hz,
    startTime = new Date;

x == y;
x == y;
x == y;
x == y;
x == y;
// ...

hz = (runs * 1000) / (new Date - startTime);
```

### 方式 D 的问题 ###

然而，这也有它的短板。编译函数会大大增加内存使用量和减慢您的CPU，当您重复运行测试几百万次时，基本上就等于创建了一个非常大的字符串和编译了一个庞大的函数。

使用展开循环的另一个警告是，`return` 语句可以使测试提前退出。花了很大成本去编译一个有数百万行代码的函数，然而这个函数在执行到第 3 行就返回了，这非常没有意义。有必要进行早期退出检测，如果有早期退出就回到使用 while 循环的模式，并在需要时通过循环校准。

### 提取函数体 ###

Benchmark.js 使用了稍微有些不同的方法，可以说它使用了前面四种方式中的最好的部分。因为内存问题，我们不展开循环，为了减少可能会使结果不准确的因素，并允许测试访问本地方法和变量，我们在每个测试中提取出函数体。例如，当测试这样的代码时：

``` javascript
var x = 1,
    y = "1";

function test() {
  x == y;
}

while (iterations--) {
  test();
}

// ...would compile to →

var x = 1,
    y = "1";
while (iterations--) {
  x == y;
}
```

然后，Benchmark.js 使用了和 JSLitmus 类似的方法：将提取的函数体放在一个 while 循环中运行（方式 A），重复运作直到达到最小的运行次数（方式 B），并将整个过程重复数次，来得到有统计意义的结果。

## 需要考虑的问题 ##

### 不准确的毫秒计时器 ###

在一些浏览器/操作系统中，由于[各种各样](http://www.microsoft.com/whdc/system/sysinternals/mm-timer.mspx#EQB)的[因素](http://alivebutsleepy.srnet.cz/unreliable-system-nanotime/)，计时器可能是不准确的。

例如：
> 当 Windows XP 启动后，典型的默认时钟中断期是 10 毫秒，尽管在一些系统使用的是 15 毫秒。这意味着，每 10 毫秒，操作系统就接收来自系统定时器硬件中断通知。

一些老的浏览器（IE，Firefox 2）依靠内部操作系统的定时器，这意味着每次调用 `new Date().getTime()` 都是直接从操作系统中获取。很明显，如果内部定时器每 10 或 15毫秒才更新，是的测试结果的准确性大大降低。我们需要解决这个问题。

幸运的是，可以使用 JavaScript 来[获得最小测量单位](http://mathiasbynens.be/demo/javascript-timers)，然后，通过一个[数学方法](http://spiff.rit.edu/classes/phys273/uncert/uncert.html)来使我们的测试结果的不确定度减少到 1% 。要做到这一点，我们需要将测量的最小单位除以 2 来得到的不确定度。假如我们正在 Windows XP 上使用 IE6，最小测量单位是 15 毫秒，那么不确定度就是 15ms / 2 = 7.5ms，然后将其除以 0.01（1%），这样就得到了我们所需的最小测试时间是：7.5ms / 0.01 = 750ms。

### 替代计时器 ###

当使用 `--enable-benchmarking` 标志来启动 Chrome 时，Chrome 将暴露 `chrome.Interval` 方法，这个可以用作一个高精度微秒计时器。

回到我们的 Benchmark.js，John-David Dalton 偶然发现了 [Java 中的纳秒计时器](http://download.oracle.com/javase/1.5.0/docs/api/java/lang/System.html#nanoTime)，并通过一个[微小的 Java 应用](https://github.com/mathiasbynens/benchmark.js/blob/master/nano.java#files)提供给 JavaScript 使用。

使用高精度计时器可以将测试时间分类，它允许更大的样本大小，减小了结果的误差幅度。

### Firebug 会禁用 Firefox 的 JIT ###

开启 Firebug 插件会禁用 Firefox 所有的高性能实时（JIT）本地代码编译功能，这意味着你会在解释器运行这些测试，也就是说，您的测试将运行得非常缓慢。你应该永远记住，在 Firefox 下进行基准测试时要禁用 Firebug 插件。

虽然这个影响似乎要小得多，这同样也适用于有 inspector 工具的其他浏览器，比如 WebKit 的 Web Inspector 或 Opera 的 Dragonfly。在进行基准测试时避免这些打开这些工具，因为它可能会影响结果。

### 浏览器 bug 和特性 ###

基准测试中某些形式的循环机制容易受到浏览器一些怪癖的影响，比如最近 IE9 的 [dead-code-removal](http://www.zdnet.com/blog/bott/ie9-takes-top-benchmark-prize-no-cheating-involved/2671) 的演示，Mozilla 浏览器的 [TraceMonkey engine bug](https://bugzilla.mozilla.org/show_bug.cgi?id=509069)，还有 Opera 的 [caching of qSA results](http://jsperf.com/jquery-css3-not-vs-not) 也将导致基准测试结果的不准确。当创建基准测试时，记住这些非常重要。

### 统计学意义 ###

大多数基准测试产生的结果没都有统计学意义，John Resig 在他的文章（[JavaScript benchmark quality](http://ejohn.org/blog/javascript-benchmark-quality/)）中讨论过这个问题。总之，有必要考虑每个结果的误差幅度，并尽可能减少。使用更大的样本量，并沉着等待测试完成，有助于减少误差幅度。

### 跨浏览器测试 ###

如果你想在不同的浏览器下运行基准测试并得到可靠的结果，一定要在真正的浏览器环境中进行测试。不要信任 IE 的兼容模式 - 这些都[不同于实际的浏览器版本](http://jsperf.com/join-concat#comments)。

同时，请注意这一事实，IE（IE8 及其以下）将脚本的最大指令数限制为 500 万，而不是像其他浏览器一样，限制一个脚本的执行时间。在现代的硬件环境下，一个密集型 CPU 可以在半秒内触发这个脚本，如果你有一个相当快的系统，在 IE 中你可能会遇到“脚本警告”对话框，在这种情况下，最好的解决方案是修改您的 Windows 注册表，增加指令的数量。幸运的是，微软提供了一个简单的方法来做这个，所有你需要做的就是运行一个简单的“修复”向导，更好的是，在 IE9 中删除了这个愚蠢的限制。

## 结论 ##

不管您只是运行一些基准测试，还是编写自己的测试套件，甚至是编写您自己的基准测试库，都比您在本文中看到的要复杂得多。Benchmark.js 和 jsPerf [每周更新一次](https://github.com/mathiasbynens/benchmark.js/commits/master)，伴随着 bug 的修复、新的特性和一些提高测试结果的准确性的小技巧。如果您只想在当前流行的浏览器下做一些基准测试，那就不要重复造轮子。。。