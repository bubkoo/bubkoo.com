title: JavaScript Source Map 介绍
date: 2014/1/5 16:56:36
updated: 2014/1/5 16:56:39
tags: [Source Map,JavaScript,Debug]
categories: []
keywords:
---
翻译自：[Introduction to JavaScript Source Maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/?redirect_from_locale=zh)

水平有限，有表达错误和不准确的地方，可以在回复中直接指出来，英语水平高的同学可以直接看上面的原文。

下面开始正文。

你有没有希望保持你的客户端代码可读性，更重要的是可调式性，即使你合并和压缩过代码，同时又不影响性能？现在你可以通过 [Source Maps][1] 的魔力来实现。

从根本上说，这是一种将合并/压缩后的文件映射回未构建状态的方式。当构建产品，合并和压缩你的 JavaScript 文件的同时，生成一个包含源文件信息的 Source Maps 文件。当你查询生成后的文件中某一行号和列号的位置时，你可以通过 Source Maps 来返回它所对应的原始位置。开发人员工具（WebKit 最新版，Google Chrome，Firefox 23+）可以自动解析 Source Maps，使得看起来好像你在运行未压缩和合并的文件。

[Demo: Get original location](http://www.thecssninja.com/demo/source_mapping/)

打开上面示例的连接，在包含生成后文件的文本区域的任何地方点击鼠标右键，选择 "Get original location"，将通过生成后的文件的行号和列号查询 Source Maps，并返回原始代码的位置。确保你的控制台是打开的，这样你就可以看到输出。

![](http://bubkoo.qiniudn.com/source-map-demo.png)
<!--more-->
## 真实环境 ##
在查看下面真实环境中 Source Maps 的执行情况之前，确保你的 Chrome 或 WebKit 浏览器已经开启了 Source Maps 功能，可以通过点击开发人员工具面板中的设置此轮，并且选中 "Enable source maps" 选项，如下图：

![](http://bubkoo.qiniudn.com/enable-source-maps.png)

Firefox 23 以及以上的版本的开发人员工具中默认开启了 Source Maps 功能，请看下面图片。

![](http://bubkoo.qiniudn.com/enable-source-maps_ff.png)

上面例子中 Source Maps 查询演示的确非常酷，但实际用例呢？在 Chrome Canary， WebKit nightly 或 Firefox 23+ 中打开 [dev.fontdragr.com](http://dev.fontdragr.com/)，确保已经开启了 Source Maps 功能，您会注意到 JavaScript 并不是编译后的，并且可以查看到所有单独的 JavaScript 文件引用。这就利用了 Source Maps 功能，但实际上在幕后运行的是编译后的代码。任何错误、日志和断点将映射到的开发版代码，非常方便调试！实际上它会让你产生你在运行开发版的网站的错觉。

[Demo: View scripts panel (with source maps) on fontdragr.com](http://dev.fontdragr.com/)

## 为什么我要关心 Source Maps ##

目前，Source Maps 只支持将合并/压缩后的 JavaScript 文件映射回未合并/压缩的文件，但对于 CoffeeScript 这种编译为 JavaScript 的语言，甚至像 SASS 和 LESS 这种 CSS 预编译语言来说，前景是光明的。

在未来我们可以很容易地使用几乎任何语言的 Source Maps 功能，仿佛它是浏览器原生支持的一样：

- CoffeeScript
- ECMAScript 6 以及以上
- SASS/LESS 和其他
- 几乎可以编译成 JavaScript 的任何语言

下面视频（来自YouTube，自行翻墙）演示了如何在 Firefox 控制台中调试 CoffeeScript 代码。

<iframe width="609" height="339" src="http://www.youtube.com/embed/2aQw1dSIYko?start=625" frameborder="0" allowfullscreen=""></iframe>

Google Web Toolkit (GWT) 最近增加了 Source Maps 支持，GWT 团队中的 Ray Cromwell 录制了一个视频（来自YouTube，自行翻墙）来展示在 GWT 中使用 Source Maps 功能。

<iframe width="640" height="360" src="//www.youtube.com/embed/-xJl22Kvgjg?feature=player_embedded" frameborder="0" allowfullscreen></iframe>

另一个例子我结合谷歌 Traceur 库，该库允许你编写 ES6(ECMAScript 6 或下)然后将其编译成 ES3 的兼容代码。Traceur 库也生成了一个 Source Map。请看这个[示例](http://www.thecssninja.com/demo/source_mapping/ES6/)，ES6 的特性和类的使用就像浏览器原生支持的一样，这要感谢 Source Map。在示例中的文本框中，容许你书写 ES6 特性的代码，然后被动态编译成与 ES3 等价的代码，同时也会生成一个 Source Map。

![](http://bubkoo.qiniudn.com/source-map-es6.png)

[Demo: Write ES6, debug it, view source mapping in action](http://www.thecssninja.com/demo/source_mapping/ES6/)

## Source Map 是如何工作的呢？ ##

由于 Source Map 是由 [Closure compiler][2]（本文后面将解释怎么样使用该编译器）生成的，所以，目前仅支持合并/压缩的 JavaScript。一旦你合并/压缩 JavaScript 代码，与它将存在一个 sourcemap 文件。目前，编译器并不会在合并/压缩的文件末尾添加注释来让浏览器开发者工具知道有 可用的 source map，该注释如下：

``` javascript
//# sourceMappingURL=/path/to/file.js.map
```

这使开发人员工具可以将调用映射回他们在原始文件中的位置。之前，注释是这样写的：`//@`，但由于一些问题和 IE 条件注释（和 IE 条件注释什么关系，不懂~~），最终决定修改为 `//#`。目前，Chrome Canary、 WebKit Nightly 和 Firefox 24+ 都支持新的注释语法，这个语法的改变也影响到了 sourceURL。

如果你不喜欢这样奇怪的注释，你可以选择使用设置一个特殊的文件头在你编译的 JavaScript 文件中：

``` javascript
X-SourceMap: /path/to/file.js.map
```

就像注释中的内容那样，这将告诉 Source Map 的使用者到哪里去寻找和一个 JavaScript 文件关联的 Source Map 文件。使用文件头的方式也解决了那些不支持注释的语言引用 Source Map 文件的问题。

![](http://bubkoo.qiniudn.com/sourcemap-on-off.png)

只有当你打开开发者工具并且开启了 Source Map 功能时 source map 文件才会被下载。你还需要上传你的原始文件到你的web服务器，开发工具才可以应用，并在必要时显示它们。

## 如何生成 Source Map 文件 ##

就像我在上面提到过的那样，你需要使用 [Closure compiler][2] 来合并、压缩并为你的 JavaScript 文件生成一个 Source Map 文件。代码如下：

``` java
java -jar compiler.jar \
     --js script.js \
     --create_source_map ./script-min.js.map \
     --source_map_format=V3 \
     --js_output_file script-min.js
```

两个重要的命令标志：`--create_source_map` 和 `--source_map_format`。`--source_map_format`的默认值是 V2，这里我们设置为 V3。

## Source Map 文件剖析 ##
为了更好地理解 Source Map 文件，我将举一个小例子，在例子中我将用 [Closure compiler][2] 来生成一个 Source Map 文件，并深入分析“映射”部分是如何工作的。下面示例是从官方 [V3 spec](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?hl=en_US&pli=1&pli=1) 示例微小改变来的：

``` javascript
{
    version : 3,
    file: "out.js",
    sourceRoot : "",
    sources: ["foo.js", "bar.js"],
    names: ["src", "maps", "are", "fun"],
    mappings: "AAgBC,SAAQ,CAAEA"
}
```

从上面可以看出，Source Map 文件是一个包含大量信息的字面量对象：
- version： Source Map 版本号
- file：生成后的文件名称（合并/压缩后的文件名）
- sourceRoot：转换前的文件所在的目录 - 这是一种减少文件大小的技术
- sources：所有被合并的文件
- names：包含所有转换前在代码中出现过的变量和方法名
- mappings：使用 Base64 VLQ 值，这正是神奇的地方，真正的减少文件大小是在这里完成。

## 使用 Base64 VLQ 编码来减小 Source Map 文件的大小 ##
最初 Source Map 规范对所有映射有一个非常详细的输出，结果导致 Source Map 文件是生成的代码文件大小的10倍左右，版本 2 降低了 50%，版本 3 又在版本 2 的基础上再降了 50%，所以对于一个 133kb 的文件最终将生成一个大约 300kb 的 Source Map 文件。那么，他们是如何减少文件大小，同时仍然维持复杂的映射呢？

使用 [VLQ](http://en.wikipedia.org/wiki/Variable-length_quantity) (Variable Length Quantity)编码 和 Base64 编码一起来编码。mappings 属性是一个超级大的字符串，字符串中的分号（;）对应转换后源码的一行，字符串中的逗号（,）对应转换后源码的一个位置，字符串中的每一个部分是 1、4 或 5 的可变长度字段。有些可能会很长，但是包含连续位，每一个部分都是基于前一个部分生成的，这有助于减少文件大小，因为每个位都是相对于其先前的部分。

![](http://bubkoo.qiniudn.com/source-map-segment.png)

正如前面我提到的那样，每一段可以1、4或5可变长度，上图中是可变长度的四位与一个连续位（g），我将拆分这个段，然后向你展示 Source Map 如何映射回原始位置。上面所示的值是纯粹的 Base64 解码值，需要进一步处理才能得到它的真实值，每一个段落通常包含 5 个位置信息：
- 生成后的代码的第几列
- 该段对应的原始文件
- 转换前代码的第几行
- 转换前代码的第几列
- 如果存在的话，属于 names 属性中的哪一个变量

并不是每一段都有对应的变量名或者方法名，所以段的长度就是 4 位或者 5 位。上图中的 g 位就是所谓的连续位，这允许在Base64 和 VLQ 解码阶段进行进一步优化，连续位是基于一个段来构建的，这样就可以用来储存一个大数值而不必真正储存大数值本身，这是一个起源于 midi 格式，非常聪明的节约储存空间的技术。

上图中的 `AAgBC` 经过进一步的处理将返回 `0, 0, 32, 16, 1` ，`"32"`就是连续位，帮助生成后面一位的值`"16"`，B 经过 Base64 解码是 1，所以将使用的重要值是：`0, 0, 16, 1`，这样我们就知道，生成后的文件的第 0 列，对应于第 0 个原始文件中的第 16 行的第 1 列。

为了演示解码过程，我将引用 Mozilla 的 [Source Map JavaScript library](https://github.com/mozilla/source-map/)，你也可以看看 WebKit 开发人员工具 [Source Map 代码](http://code.google.com/codesearch#OAMlx_jo-ck/src/third_party/WebKit/Source/WebCore/inspector/front-end/CompilerSourceMapping.js)，也是用 JavaScript 编写的。

为了正确理解我们如何从 B 得到值 16，我们需要对位操作符和映射规范的原理有一个基本的了解。通过使用按位与(&)算子与 32 和 [VLQ_CONTINUATION_BIT](https://github.com/mozilla/source-map/blob/master/lib/source-map/base64-vlq.js#L32)(二进制的 100000 或 32)进行对比，将前面的数字 g 标记为连续位。

``` javascript
32 & 32 = 32
// or
100000
|
|
V
100000
```

如果按位与的两个位都是 1 将返回 1，所以 Base64 解码 33 & 32 将返回 32。这就为每一个继续位通过位移运算，增加 5 位，上面例子中只移动了一次 5 位，像下面这样：

``` javascript
1 << 5 // 32

// Shift the bit by 5 spots
______
|    |
V    V
100001 = 100000 = 32
```

然后将该值进行转换，通过将其将 VLQ 签名的值右移一位：

``` javascript
32 >> 1 // 16
//or
100000
|
 |
 V
010000 = 16
```

这就将 1 转换到了 16，这似乎是一个复杂的过程，但是一旦转换的数开始数量更大的时候就更有意义。

## 潜在的 XSSI 问题 ##
规范中提到使用 Source Map 可能带来跨站脚本问题。为了减小这个问题，建议在 Source Map 文件的第一行前面加上`")]}"`来故意使 JavaScript 抛出一个语法错误。WebKit 开发人员工具已经可以处理这个问题了。

``` javascript
if (response.slice(0, 3) === ")]}") {
    response = response.substring(response.indexOf('\n'));
}
```

像上面这样，如果 Source Map 文件中有语法错误，并且首行以`")]}"`三个字符开始，则将首行中`\n`前面所有的字符删去。

## sourceURL and displayName in action: Eval and anonymous functions ##
以下两个预定，虽然不是 Source Map 规范的一部分，但是对于处理 Eval 和匿名函数非常方便。

第一个约定看起来非常像 sourceMappingURL 属性中的 `"//#"`，事实上这个约定在 Source Map V3 规范中也有提及。通过在你的代码中加入以下特殊注释，注释中的内容将被执行，你可以给 eval 命名使他们以更加有意义的名称出现在你的开发者工具中。请看以下用 CoffeeScript 编译的示例：
[Demo: See `eval()`'d code show as a script via sourceURL](http://www.thecssninja.com/demo/source_mapping/compile.html)

``` javascript
//# sourceURL=sqrt.coffee
```

![](http://bubkoo.qiniudn.com/source-map-source-url.png)

另一个约定可以让你对匿名函数命名，通过在当前匿名函数的上下文中使用 displayName 属性。看下面的示例中可以看到 displayName 属性是如何工作的。

[Demo: Named anon functions via displayName (Webkit Nightly only)](http://www.thecssninja.com/demo/source_mapping/displayName.html)

``` javascript
btns[0].addEventListener("click", function(e) {
    var fn = function() {
        console.log("You clicked button number: 1");
    };

    fn.displayName = "Anonymous function of button 1";

    return fn();
}, false);
```

![](http://bubkoo.qiniudn.com/source-map-display-name.png)

当在开发人员工具中分析你的代码，displayName 属性将显示，而不是像显示一个 anonymous。然而 Chrome 中 displayName 属性将不会显示，但并不是所有的希望都破灭了，已经有一个被称为 [debugName](http://code.google.com/p/chromium/issues/detail?id=116220) 的更好的建议。

因此，eval 命名是在 Firefox 和 WebKit 浏览器中有效，displayName 属性只在 WebKit nightlies 中有效。

## Let's rally together ##
目前，有非常多的讨论关于 Source Map 已经支持 CoffeeScript，去看看这个讨论并对你的 CoffeeScript 编译器添加 Source Map 支持，这对 CoffeeScript 及其拥趸将是一个巨大的胜利。

UglifyJS 也有一些关于 [Source Map 的问题](https://github.com/mishoo/UglifyJS/issues/315)，你也应该去看看。

很多的[工具](https://github.com/ryanseddon/source-map/wiki/Source-maps%3A-languages,-tools-and-other-info)生成 Source Map，包括coffeescript编译器。我现在认为这是一个有争议的问题。

更多的工具可以生成 Source Map，对我们来说意味着更好，所以赶紧去给你的开源项目加上 Source Map 支持吧。

## Source Map 并不完美（It's not perfect） ##
目前，Source Maps 对于表达式的支持并不是那么好。问题在于，在当前执行上下文中检查一个参数或变量名将不会返回任何值，因为它并不存在。这需要某种反向映射机制来查询你想检查的参数/变量的真实名称，而不是直接使用编译后的 JavaScript 文件中的参数/变量名。

这当然是一个可以解决的问题，更多的关注关于 Source Map，我们可以开始看到一些惊人的特性和更好的稳定性。

## 问题 Issues ##

最近，[jQuery 1.9](http://blog.jquery.com/2013/01/15/jquery-1-9-final-jquery-2-0-beta-migrate-final-released/) 添加了对 Source Map 的支持，并且支出了在 IE 中的一个[奇怪错误](http://bugs.jquery.com/ticket/13274#comment:6)，IE 会在 jQuery 加载完成之前编译其中的注释(`//@cc_on`)。已经有[提议](https://github.com/jquery/jquery/commit/487b703521e63188102c73e8ce6ce203d28f260b)使用多行注释来包裹 sourceMappingURL 属性来减少这个错误的发生。可以学习使用不用条件注释的方式。

关于语法改变为`//#`可以到[这里](https://groups.google.com/forum/#!topic/mozilla.dev.js-sourcemap/4uo7Z5nTfUY)查看。

## 工具和资源 ##
这里有更多的资源和工具，你可以看看：
- Nick Fitzgerald 有一个分支的 [UglifyJS](https://github.com/fitzgen/UglifyJS/tree/source-maps) 已经支持 Source Map
- Paul Irish 有一个[小例子](http://dl.dropbox.com/u/39519/sourcemapapp/index.html)来演示 Source Map
- 查看 WebKit 的[变更集](http://trac.webkit.org/changeset/103541)
- 变更集中有一个 [layout test](http://trac.webkit.org/export/105549/trunk/LayoutTests/http/tests/inspector/compiler-source-mapping-debug.html)，这也是本文开始提到的那个例子
- Mozilla 有一个 [bug](https://bugzilla.mozilla.org/show_bug.cgi?id=670002)，你应该在控制台中跟踪 Source Map 的状态
- Conrad Irwin 为所有 Ruby 用户写了一个超级有用的 [source map gem](https://github.com/ConradIrwin/ruby-source_map)
- 进一步阅读关于 [eval naming](http://blog.getfirebug.com/2009/08/11/give-your-eval-a-name-with-sourceurl/) 和 [displayName property](http://www.alertdebugging.com/2009/04/29/building-a-better-javascript-profiler-with-webkit/)
- 关于创建 Source Map，你可以阅读 [Closure Compilers source](http://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/SourceMapGeneratorV3.java)
- 这里有一些截图和支持关于 [GWT source maps](https://plus.google.com/110412141990454266397/posts/iqXo5AyHkyd)

Source Map 在开发人员工具中是一个非常有用的工具。它是超级有用的，能够让您的 Web 应用程序的瘦小但也容易调试。对新的开发人员来说，这也是一个非常强大的学习工具，来查看有经验的开发者的程序结构和写他们的应用程序代码，而无需通过阅读压缩/合并后的这样可读性不高的代码。你还在等什么？开始给你的应用添加 Source Map 支持吧。

[1]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?hl=en_US&pli=1&pli=1#heading=h.1ce2c87bpj24
[2]: https://developers.google.com/closure/compiler/




