title: 白色小鸟 - 代码质量和代码分析
date: 2014-04-14 17:11:47
updated: 2014-04-14 17:11:47
tags: [Architecture,Linting,Analysis]
categories: [JavaScript]
keywords:
---
![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-white-bird-linting.jpg)

## 介绍
一群恶魔的猪从无辜的小鸟那里偷走了所有的前端架构，现在它们要夺回来。一对特工英雄（愤怒的小鸟）将攻击那些卑鄙的猪，直到夺回属于他们的前端架构。（译者注：本系列是关乎前端架构的讨论，作者借用当前最风靡的游戏 - 愤怒的小鸟，为我们揭开了前端架构的真实面目。）

小鸟们最终能取得胜利吗？它们会战胜那些满身培根味的敌人吗？让我们一起来揭示 JavaScript 之愤怒的小鸟系列的另一个扣人心弦的章节！

> 阅读本系列的[介绍文章](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-series/)，查看所有小鸟以及它们的进攻力量。

## 战况

- [红色大鸟 - 立即调用的函数表达式](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-red-bird-iife/)
- [蓝色小鸟 - 事件](http://bubkoo.com/2014/03/28/angry-birds-of-javascript-blue-bird-events/)
- [黄色小鸟 - 模块化、依赖管理、性能优化](http://bubkoo.com/2014/03/29/angry-birds-of-javascript-yellow-bird-requirejs/)
- [黑色小鸟 - 前端分层架构](http://bubkoo.com/2014/03/29/angry-birds-of-javascript-black-bird-backbone/)

## 白色小鸟的攻击力

![white bird](http://bubkoo.qiniudn.com/angry-birds-white-bird.png)

本篇文章我将介绍白色小鸟，它看似没有什么攻击力，但当它们拿出严格的代码风格和质量检查时，小猪们都惊呆了。渐渐的，小鸟们将一个接一个地夺回属于他们的东西。

<!--more-->

## 小猪偷走了什么

小鸟们尝试学习用一种不同的方式编写代码，有的是自学，有的则是去计算机科学相关的大学学习。即使这群小鸟中有大量经验丰富和才华横溢之辈，当它们聚在一起来开发一个大型应用时就会酿成一场灾难，它们都认为自己的编码标准才是正确的方式，这就会导致了一些问题。一天，一只白色小鸟走过来，并建议他们遵循一个通用的编码风格，此外，还带来了一些工具，来帮助他们形成统一的标准和解决冲突，并提前关注一些潜在的问题。

不幸的是，在小猪的进攻过程中，它们的代码规范文档和代码质量工具被偷走了。现在，一只白色小鸟接到任务去夺回来，它将使用不可抗拒的代码质量的威力，来夺回属于它们的东西。

## JavaScript 编码规范

目前有许多编码规范可供选择，最重要的是选择其中一个并坚持遵循这个规范。如果你在一个团队中，他们也应该同意一些规范，如果你们不能达成一致，那么选择一个最接近的规范，并允许一些例外。

这样做你将发现...

- 开发人员将更快理解团队中其他人写的代码
- 代码库合并不会那么可怕
- 拥有确实能够减少缺陷的标准
- 代码看上去更加统一
- 关于谁才是正确的分歧将减少
- ...还有哪些呢？等着你来发现...

这里列举了一些我知道的代码规范：

- Douglas Crockford's [Code Conventions for the JavaScript Programming Language](http://javascript.crockford.com/code.html)
- Rich Waldron's ([@rwaldron](http://twitter.com/rwaldron)) [Idiomatic.js - Principles of Writing Consistent, Idiomatic JavaScript](https://github.com/rwldrn/idiomatic.js) ← Recommended
- jQuery's [JavaScript Style Guide](http://contribute.jquery.org/style-guide/js/?rdfrom=http%3A%2F%2Fdocs.jquery.com%2Fmw%2Findex.php%3Ftitle%3DJQuery_Core_Style_Guidelines%26redirect%3Dno) ← Recommended
- Google's [JavaScript Style Guide](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)

Addy Osmani ([@addyosmani](http://twitter.com/addyosmani)) 有一篇写的很好的文章 [JavaScript Style Guides And Beautifiers](http://addyosmani.com/blog/javascript-style-guides-and-beautifiers/)，深入解释了各种代码风格，并用实例演示了如果遵循上面提到的这些代码风格标准。

## JavaScript 代码检查

代码检查工具可以帮助你找到代码错误和潜在的问题，通常还能帮助你实施代码规范，无论你选择以上代码规范的哪一种。

有几种代码检查工具可供选择，但是我最喜欢 Anton Kovalyov ([@valueof](http://twitter.com/valueof)) 创建的 [JSHint](http://jshint.com/)。JSHint 是社区共同努力的结果，前身是广受欢迎的 JSLint 库。我见证了这个项目成长过程，JSHint 包含很多选项，你可以选择开启或禁用，最后找到最适合你的团队的配置。

JSHint 可以执行的标准检查包括...

- 使用 `===` 代替 `==` 
- 使用没有被预先定义的变量
- 声明从未被使用的变量
- 在循环内部声明函数
- 还有更多选项...

完整的选项列表请参阅 [JSHint 文档](http://jshint.com/docs/)。

我很喜欢最近增加的一些选项：

- `maxcomplexity` - 最大循环复杂度（参见后面引用的维基百科）
- `maxstatements` - 函数允许的语句条数最大值
- `maxparams` - 函数中允许的变量数最大值
- `maxdepth` - 函数允许的最大深度
- `maxlen` - 单行代码的最大长度

> “最大循环复杂度是一段代码中线性独立路径数” -- http://en.wikipedia.org/wiki/Cyclomatic_complexity

```javascript
/*jshint maxparams:3, maxdepth:2, maxstatements:5, maxcomplexity:3, maxlen:80 */
/*global console:false */
 
(function( undefined ) {
    "use strict";
 
    function test1( arg1, arg2, arg3, arg4 ) {
        console.log( "too many parameters!" );
        if ( arg1 === 1 ) {
            console.log( arg1 );
            if ( arg2 === 2 ) {
                console.log( arg2 );
                if( arg3 === 3 ) {
                    console.log( "too much nesting!" ); console.log( arg3 ); console.log( arg4 );
                }
            }
        }
        console.log( "too many statements!" );
    }
 
    test1( 1, 2, 3, 4 );
}());
```

用 JSHint 对上述代码片段进行检查之后，生成如下错误：

![](http://bubkoo.qiniudn.com/angry-birds-of-javascript-white-bird-linting-error.png)

辛运的是，你不需要每次都在 JSHint 的网站来检查你的代码，可以将 JSHint 集成到代码编辑器中：

- VIM Plugin ([jshint.vim](https://github.com/walm/jshint.vim))
- Sublime Text 2 Extension ([Sublime Linter](https://github.com/Kronuz/SublimeLinter))
- TextMate Bundle ([JSHint TextMate Bundle](http://fgnass.posterous.com/jslint-in-textmate))
- Visual Studio [Web Essentials](http://vswebessentials.com/)
- Eclipse IDE ([JSHint Integration](http://github.eclipsesource.com/jshint-eclipse/))

> 在神鹰一文中，我们将讨论如何在命令行中使用 JSHint，已经如何实现自动化。

## JavaScript 代码分析

代码检查很不错，但是有时我们希望得到我们代码的全局概览，然后再深入分析代码的某些部分。

辛运的是，[Plato](https://github.com/jsoverson/plato) 这个工具可以分析你的代码，并提供一个可视化的报表，通过报表你可以知道应用的复杂度。这个工具需要在 Node 环境下执行，可以通过 `npm install plato -g` 命令来安装。

安装 Plato 之后，可以在命令行中运行 `plato -r -d report myDirectory`，这将递归分析 `myDirectory` 文件夹中的代码，并将分析结果导出到 `report` 文件夹中。

如果你使用 Plato 对 jQuery 源码进行分析，将得到类似下面的报告。正如你所见，代码行数随着时间减少，这个非常好，并且可维护性还不错，然后用柱状图详细列出了每个JavaScript 文件的可维护性。再往下的柱状图列出了每个文件的代码行数、每个文件的预计错误数，以及每个文件的 JSLint 错误数。

![JavaScript Analysis](http://bubkoo.qiniudn.com/angry-birds-of-javascript-white-bird-javaScript-analysis.png)

如果深入分析某个文件，你将看到下面的报告。这份报告最棒的地方是用一种容易理解的方式展示了每个函数的复杂度和代码行数。通过该工具标识出的关注点，你可以快速定位到文件的不同部分进行审查。

![JavaScript Analysis](http://bubkoo.qiniudn.com/angry-birds-of-javascript-white-bird-javaScript-analysis-details.png)

你可以到 Plato 的 GitHub 上查看上面的 [jQuery 报告](http://jsoverson.github.com/plato/examples/jquery/)。

## 进攻

下面是一个用 [boxbox](http://incompl.github.com/boxbox/) 构建的简易版 Angry Birds，boxbox 是一个用于 [box2dweb](https://code.google.com/p/box2dweb/) 的物理学框架，由 [Bocoup](http://bocoup.com/) 的 [Greg Smith](http://twitter.com/_gsmith) 编写。

> 按下空格键来发射白色小鸟，你也可以使用方向键。

![](http://bubkoo.qiniudn.com/angry-birds-white-bird-attack.png)

## 结论

前端 web 应用很容易就变得复杂，如果开发人员不能达成共识，项目就很可能会分崩离析，尤其是在大型项目中。有一个统一的代码标准，并借助一些工具来帮助我们找到潜在的问题，将大大有助于项目的成功。

还有很多其他的前端架构技术也被猪偷走了。接下来，另一只愤怒的小鸟将继续复仇！Dun, dun, daaaaaaa!

<p class="j-quote">原文：[Angry Birds of JavaScript- White Bird: Linting](http://www.elijahmanor.com/angry-birds-of-javascript-white-bird-linting/)</p>

