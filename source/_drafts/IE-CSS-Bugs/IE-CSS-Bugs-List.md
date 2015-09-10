title: 【译】IE CSS Bug 集合
date: 2013-12-22 21:55:38
updated: 2013-12-22 21:55:38
tags:
 - IE
 - HTML
 - CSS
 - Bug
 - 翻译
categories: HTML & CSS
keywords:
---
作为一名前端，我们每天都在跟浏览器打交道，我们今天要讨论的是浏览器中的另类（至少大多数前端的这么认为的）— IE，本文所提及的CSS Bug均来自[haslayout.net][1]，如果您觉得英文原文看起来比较爽，[请猛点这里查看原文][1]。

同时，由于自己翻译和前端水平有限，有些理解和表达不当，以及出现一些错误在所难免，还请大家指正。谢谢。
## 概述
IE 以不支持大量的 CSS 属性而出名，同时其支持的 CSS 属性中存在大量的 Bug。本站列举了 IE 下的一些问题、实例和一些我们已知的解决方案。尽管我已经尽力按照它们的特性对它们进行分类，仍有许多 Bug 可以被划分在好几个分类之下，这种情况下，我将会将此 Bug 分在“普通 Bug(General Bugs) ”这个分类下。

## 统计
目前为止，本站收录了46个“普通 Bug(General Bugs)”，5个“hasLayout Bugs”，6个“不支持 Bug(No Support Workarounds)”和1个“崩溃 Bug(Crash Bugs)”。总共有58个 Bug，70个解决方法。<!--more-->

本站最后更新于2009年8月19日 15:38:47 星期三。

本站包含44个 IE6 bug，28个 IE7 bug以及19个 IE8 bug。
## 注意版本
在本文中你会看到诸如“Affected: IE8 and all below”或“Fixes: all versions”。这里的“all”意思是 IE6、IE7 和 IE8。IE5 和 IE5.5 已经太历史了，本站没有考虑这些版本的 Bug 和解决方案。
## 普通 Bug (General Bugs)
此部分包含的是那些不能恰当定位为其他部分或是可以同时归类到两部分或更多部分的 Bug。<style>article .entry {word-break: normal;}</style>
Bug 名称|影响版本|示例|描述
-------|------|-----|-----
[图片标签聚焦 Bug][b1]|IE8 IE7 IE6|[bug][d1]<br/>[fixed][s1]|当img标签包含在label标签中，点击img标签时，无法触发form元素选中事件
[按钮使用Auto-Margin居中失效][b2]|IE8|[bug][d2]<br/>[fixed][s2]|当按钮类元素应用样式{display: block; margin-left: auto; margin-right: auto;}，并且没有详细设置width值之时，按钮类元素不居中





[1]: http://haslayout.net/css/

[b1]: /2013/12/23/IE-CSS-Bugs/Image-Label-Focus-Bug/
[d1]: http://haslayout.net/demos/Image-Label-Focus-Bug-Demo.html
[s1]: http://haslayout.net/demos/Image-Label-Focus-Bug-Fixed-Demo-CMS.html

[b2]: /2013/12/23/IE-CSS-Bugs/No-Auto-Margin-Center-on-Buttons-Inconsistency
[d2]: http://haslayout.net/demos/No-Auto-Margin-Center-on-Buttons-Inconsistency-Demo.html
[s2]: http://haslayout.net/demos/No-Auto-Margin-Center-on-Buttons-Inconsistency-Fixed-Demo-CS.html