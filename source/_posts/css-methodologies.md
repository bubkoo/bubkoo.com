title: 介绍几个 CSS 方法论
tags:
  - CSS
  - Methodology
categories:
  - JavaScript
photos:
  - null
date: 2015-06-25 10:52:08
updated: 2015-06-25 10:52:08
keywords:
---

在大型、复杂和快速迭代的系统中，CSS 将非常难以维护。原因之一就是 CSS 没有作用域的概念，每个 CSS 都是全局的，这意味着对 CSS 的任何修改就可能导致一些 UI 的级联改变。

CSS 的扩展语言 -- [CSS 预处理器](http://sixrevisions.com/elsewhere-on-the-web/the-best-css-preprocessors-right-now/)，比如 Sass、Less 和 Stylus，使我们编写 CSS 更加容易，但在我看来，这些 CSS 的扩展语言并没有真正解决可扩展性问题。

在 CSS 支持作用域机制之前，我们需要一种机制，使我们的样式只与特定的 HTML 部分关联，这就是 CSS 方法论。本文将讨论如下的 CSS 方法论：

- Object-Oriented CSS (OOCSS)
- Block, Element, Modifier (BEM)
- Scalable and Modular Architecture for CSS (SMACSS)
- SUIT CSS
- Systematic CSS

CSS 方法论是正式的，文档化的 CSS 编写方法，使我们能够将 CSS 作为一些小的独立的模块来开发和维护，而不是一个庞大的不可分割的一坨代码。采用一种 CSS 方法论 -- 即便这是你自己创建的 -- 它将使你在 Web 开发中更加得心应手。

相关文章：[CSS Development at Large-Scale Websites](http://sixrevisions.com/css/css-development-at-large-sites/)

每个 CSS 方法论都为可扩展性和可维护性提供了一套解决方案，一个 CSS 方法论通常会定义：

- CSS 和 HTML 的最佳实践
- Class 和 ID 的命名约定
- 有序的、分组的 CSS 样式
- 代码格式

没有“最好”的 CSS 方法论，不同的个人/团队/项目适合于不同的方法论。希望通过本文你可以找到一个适合你的方法论，或者激发你创建一个你自己的。

<!--more-->

## [Object-Oriented CSS (OOCSS)](http://oocss.org/)

Object-Oriented CSS 简称为 OOCSS，发布于 2009 年，这是第一个被广泛采用的 CSS 方法论，直到今天仍有很大的影响力。

OOCSS 主张结构与样式分离，明确区分内容和它的容器。在 OOCSS 中，样式规则使用相互独立的 CSS 选择器来界定。

### 案例分析

例如，一个按钮元素可以通过两个样式来设定：

- `.button` -- 提供按钮的基本样式
- `.grey-btn` -- 应用颜色和其他可视化属性


**HTML**

```html
<button class="button grey-btn">
```

**CSS**

```css
.button {
  box-sizing: border-box;
  height: 50px;
  width: 100%;
}
.grey-btn {
  background: #EEE;
  border: 1px solid #DDD;
  box-shadow: rgba(0, 0, 0, 0.5) 1px 1px 3px;
  color: #555;
}
```

OOCSS 方法论的目标之一是减少样式规则中相同属性的重复率。该方法论试图通过许多小的、模块化的、专有功能的 CSS 类来实现这一目标。很少通过类型选择器（比如：h1，div 和 body）来指定其样式。

注意：在 OOCSS 方法论中，不鼓励使用后代选择器：

**CSS**

```css
/* 在 OOCSS 中，不鼓励使用后代选择器 */
.wrapper .blog-post .button {
  ...
}
```

避免使用后代选择器，这样 HTML 的呈现就不依赖于特定的 HTML 结构（样式与结构分离）。

OOCSS 鼓励大家尽量复用已有样式，通过扩展现有的样式规则来创建新的样式类，而不要修改或覆盖已有的 CSS 属性。

下面我们想让无序列表的第一项的颜色突出一些，先看看不好的方式：

**HTML**

```html
<!-- 反例 -->
<ul class="to-do">
  <li>Combine my CSS files</li>
  <li>Run CSS Lint</li>
  <li>Minify my stylesheet</li>
</ul>
```

**CSS**


```css
/* 反例 */
.to-do {
  color: #FFF;
  background-color: #000;
}
.to-do li:first-child {
  color: #FF0000;
 }
```

为了使我们的 CSS 更加模块化和更具可维护性，并且避免使用后代选择器，看下面更好的写法：

**HTML**

```html
<!-- OOCSS -->
<ul class="to-do">
  <li class="first-to-do-item">Combine my CSS files</li>
  <li>Run CSS Lint</li>
  <li>Minify my stylesheet</li>
</ul>
```

**CSS**

```css
/* OOCSS */
.to-do {
  color: #FFF;
  background-color: #000;
}
.first-to-do-item {
  color: #FF0000;
}
```

### 小结

OOCSS 的主要缺陷是将产生大量的 CSS 类，这将非常难以维护。在我看来，面向对象编程的理念并不是非常适合 CSS。但这并不是说 OOCSS 的原则不实用，相反，OOCSS 是一个最基础的方法论，它给大规模的 CSS 带来了福音。



## [Block, Element, Modifier (BEM)](https://en.bem.info/)

Block, Element, Modifier 通常被称为 BEM，由俄罗斯的 Google 团队设计。BEM 的主要设计理念是用不同的角色来区分不同的 CSS 类，也就是说用角色来命名 CSS 类。BEM 补充了 OOCSS 的不足，因为 OOCSS 并没有任何的命名约定。

在 BEM 方法论中，**block** 是一个独立的模块化的 UI 组件，一个 block 可以由多个 HTML 元素组成，甚至可以由多个 block 组成，例如导航菜单或搜索表单。**element** 是 block 的组成部分，服务于一个单一的目的，例如，在一个导航中，element 就是导航菜单中的链接，在实际中就是一个 `li` 元素和一个 `a` 元素。**modifier** 用于改变 block 和 element 的默认样式。

下面是 BEM 的命名规范：

- .block
- .block--modifier
- .block__element
- .block__element--modifier

### 案例分析

看下面的登录表单：

```html
<form>
  <label>Username <input type="text" name="username" /></label>
  <label>Password <input type="password" name="password" /></label>
  <button>Sign in</button>
</form>
```

用 BEM 方法论将如下实现：

```html
<form class="loginform loginform--errors">
  <label class="loginform__username loginform__username--error">
    Username <input type="text" name="username" />
  </label>
  <label class="loginform__password">
    Password <input type="password" name="password" />
  </label>
  <button class="loginform__btn loginform__btn--inactive">
    Sign in
  </button>
</form>
```

`.loginform` 类就是 block。

`.loginform` 由下面三个 element 组成

- `.loginform__username` 用户名
- `.loginform__password` 密码
- `.loginform__btn` 登录按钮

还有三个 modifier 分别是：

- `.loginform__username--error` 使用户名元素呈现为一个错误提醒的样式
- `.loginform__btn--inactive` 使登录按钮元素呈现为不可用的样式
- `.loginform--errors` 使整个登录表单呈现为错误提醒的样式

BEM 的命名约定有助于 CSS 作者遵循 OOCSS 的扁平化设计原则，避免了使用深层次的后代选择器。例如下面的 CSS 选择器：


```css
.loginform .username .error {
  ...
}
```

可以使用单一一个 CSS 类来实现：

```css
.loginform__username--error {
  ...
}
```

### 小结

BEM 是一个非常健壮的命名约定，可以方便地区分不同 CSS 类的目的，而且在 HTML 中也可以很方便地识别 CSS 类之间的关系。

BEM 的反对者主要有以下两类：

- CSS 类名太长太丑
- 命名约定对不熟练的开发者不友好


## [Scalable and Modular Architecture for CSS (SMACSS)](https://smacss.com/)

Jonathan Snook 在 2011 年出版了《Scalable and Modular Architecture for CSS》这本书，简称为 SMACSS，发音是 [smacks]。

该方法论的核心思路是如何为 CSS 样式分类。Snook 提出了一下五类：

- **Base** 为单个 HTML 元素设置默认样式，通常是标签选择器：
  
```javascript
h1 {
 font-size: 32px;
}
div {
  margin: 0 auto;
}
a {
  color: blue;
}
```

- **Layout**  与网页布局相关的样式，样式名通常以 `layout-` 或 `l-` 开头：
  
```javascript
.layout-sidebar {
  width: 320px;
}
.l-comments {
  width: 640px;
}
```
 
- **Modules** 模块和可复用的组件：
  
```javascript
.call-to-action-button {
  text-transform: uppercase;
  color: #FFF200;
}
.search-form {
  display: inline-block;
  background-color: E1E1E1;
}
```

- **State**  指定界面特定状态的样式规则：
  
```javascript
.is-hidden {
  display: none;
}
.is-highlighted {
  color: #FF0000;
  background-color: #F4F0BB;
  border: 1px solid #CBBD15;
}
```

- **Themes** 影响整体布局和模块的样式，由用户设置触发。

SMACSS 提供了一个比 BEM 更简单的命名约定。基础样式（base）没有 CSS 类名，因为他们都是标签选择器（h1, p, a 等），模块（module）有一个唯一的样式名，子模块用父模块名作为前缀。


看下面布局，在 `.l-footer` 中，有一个搜索模块，并且搜索表单至少被用户提交过一次：


```html
<section class="l-footer">
  <form class="search is-submitted">
    <input type="search" />
    <input type="button" value="Search">
  </form>
</section>
```


SMACSS 也不推荐使用后代选择器，Jonathan Snook 还介绍了 [CSS 的最佳实用深度](https://smacss.com/book/applicability)理论，该理论的核心思想是通过类名来精确控制目标元素的样式，从而减少 HTML 结构对样式的影响。

## [SUIT CSS](http://suitcss.github.io/)

Nicolas Gallagher 提出的 SUIT CSS 发布于 2014年，他通过 CSS 预处理器定义了一套类似 BEM 命名规范，SUIT CSS 的命名方式有如下五种：

- u-utilityName
- ComponentName
- ComponentName--modifierName
- ComponentName-elementName
- ComponentName.is-stateOfName

该命名约定突出的区分了：

- General utility classes
- Standalone/modular UI components
- Individual elements
- Modifiers


看下面的登录表单：


```html
<form class="LoginForm LoginForm--errors">
  <label class="LoginForm-username is-required">
    Username <input type="text" name="username" />
  </label>
  <label class="LoginForm-password">
    Password <input type="password" name="password" />
  </label>
  <button class="LoginForm-button is-inactive">Sign in</button>
</form>
```

## [Systematic CSS](http://www.systematiccss.com/)

Systematic CSS 是原文作者最近才提出来的一个方法论，借鉴了许多 OOCSS、BEM、SMACSS、SUIT CSS 和其他一些 CSS 方法论的原理和思路。Systematic CSS 可以作为现有 CSS 方法论的简单的替代方案，只需要记住少许几个命名约定，并且命名也更加直观。

在 Systematic CSS 方法论中，一个页面被分为一下四个部分：

- Layout
- Elements
- Widgets
- Modifiers

首先，使用 `section` 或 `div` 元素来创建一个页面布局：

```html
<div class="CONTAINER">
  <header class="BANNER"></header>
  <nav class="NAVIGATION_PRIMARY"></nav>
  <nav class="NAVIGATION_SECONDARY"></nav>
  <main class="MAIN"></main>
  <aside class="ADVERTS"></aside>
  <footer class="FOOTER">
    <nav class="SITEMAP"></nav>
    <div class="LEGAL"></div>
  </footer>
</div>
```

其次，为内容和交互元素建立默认样式，比如，标题（`h1`, `h2`, `h3`）、段落（`p`）、列表（`ul` 和 `ol`）、表格（`table`）、表单（`form`）等。

然后，确定页面中那些重复的部分，将这些重复的部分提取为一个个独立的模块。在 Systematic CSS 中这些模块被称为 **widget**。看下面两个 widget：

```html
<!-- navigation bar -->
<div class="NavBar">
  <ul>
    <li><a href="./">Home</a></li>
    <li><a href="about.html">About</a></li>
    <li><a href="learn/">Learn</a></li>
    <li><a href="extend/">Extend</a></li>
    <li><a href="share/">Share</a></li>
  </ul>
</div>
<!-- search form -->
<div class="SearchBox">
  <form action="search.html" method="get">
    <label for="input-search">Search</label>
    <input name="q" type="search" id="input-search" />
    <button type="submit">Search</button>
  </form>
</div>
```

最后，为一些默认样式添加修饰（modifier）类。

看下面例子，`navbar-primary` 修饰类改变了 `NavBar` 的默认样式，`navbar-selected` 修饰类标记了当前的选中项：

```html
<div class="NavBar navbar-primary">
  <ul>
    <li><a href="./">Home</a></li>
    <li><a href="about.html" class="navbar-selected">About</a></li>
    <li><a href="learn/">Learn</a></li>
    <li><a href="extend/">Extend</a></li>
    <li><a href="share/">Share</a></li>
  </ul>
</div>
```

在 Systematic CSS 中，一个 CSS 类可以是：

- 布局（layout）名称
- 组件（widget）名称
- 修饰符

一个 CSS 类只能是以上三种的一种，不能将以上三种结合使用。它们分别有不同的命名约定：

- Layout - 全大写
- Widget - 大驼峰
- Modifier - 全小写加连接符

这个命名约定的优点是，类的层次结构由它们的名字来代表。

布局的类名采用全大写的形式，非常显眼，例如：`.NAVIGATION`，`.SIDEBAR`，`.FOOTER`。

组件的类名采用大驼峰的形式，比较显眼，例如：`.MainMenu`，`.ImageGrid`，`.BlogPost`。

修饰类是最不重要的类，因为它们修饰一些默认样式，不是默认样式的必要部分，所以它们采用全小写的形式，也最不显眼，例如：`.is-highlighted`，`.has-errors`，`.hidden`。


## 其他 CSS 方法论

- [Atomic Design](http://bradfrost.com/blog/post/atomic-web-design/)
- [DoCSSa](http://docssa.info/)
- [csstyle](http://www.csstyle.io/)

## 相关文章

- [A Look at Some CSS Methodologies](http://sixrevisions.com/css/css-methodologies)
- [5 Standardized Methods for Writing CSS](http://sixrevisions.com/css/standardized-methods-for-css/)
- [Are You Using CSS3 Appropriately?](http://sixrevisions.com/css/using-css3-appropriately/)
- [A List of CSS Styles Guides for Inspiration](http://sixrevisions.com/css/css-style-guides/)