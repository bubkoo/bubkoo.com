title: 创建自定义元素的最佳实践
tags: [Custom Elements]
categories: [HTML/CSS]
date: 2015-02-02 11:23:14
keywords:
---

越来越多的文章和讨论都是关于什么是 web 组件，什么是自定义元素，它们有什么好处以及如何使用它们，这些概念也逐渐进入开发人员的视野。如果你还不知道创建自定义元素的概念，请参考阅读[详细介绍自定义元素](http://www.smashingmagazine.com/2014/03/04/introduction-to-custom-elements/)。

尽管这些新概念还没有在开发中大量使用，我认为是时候讨论一下使用它们的最佳实践。本文将通过对比分析两种创建自定义元素方法的优缺点，最后得出创建自定义元素的最佳实践。

<!--more-->

## 方法一：全新的自定义元素

第一种方法是，在 DOM 中注册一个全新的自定义元素。下面例子中，我注册并使用了一个全新的按钮元素，并将其命名为 `new-button`。

```html
//JS file
document.registerElement('new-button');
<!-- HTML file -->
<new-button>Send</new-button>
```
我认为该方法有两个主要的缺点。

第一，如果在用户浏览器 JS 被禁用或由于其他原因没有被运行（运行异常、由于文件太大或网络问题导致 JS 文件还没加载完成），这个按钮将无效，而用户看到的仅仅是元素内部的文字。

第二，这个全新的元素只会继承标准的 [HTMLElement API](https://developer.mozilla.org/en/docs/Web/API/HTMLElement) 接口，为了让其具有按钮的行为，我们还需要手动添加[按钮的方法和属性](https://developer.mozilla.org/en/docs/Web/API/HTMLButtonElement)：所有表单的属性、可访问性、行为特性、有效性方法，当然，还有最基本的提交表单的能力。

## 方法二：扩展现有元素

第二种方法是扩展现有元素，并继承现有元素的所有属性。下面例子中，通过指定 `extends` 选项来使 `new-button` 元素继承自现有按钮，然后通过 `is` 属性来标记该元素扩展出了哪个自定义元素：

```html
//JS file
document.registerElement('new-button', {
  extends: 'button'
});
<!-- HTML file -->
<button is="new-button">Send</button>
```
通过这种方式，`new-button` 元素获得了按钮的所有属性和行为，而不需要像方法一那样人为指定。并且，如果由于某些原因 JS 不能执行，用户仍然可以看到一个常见的按钮，并可以点击按钮来提交表单。

在 [Github](https://github.com/) 上有一个扩展自 `time` 元素的实例：

```html
<time is="relative-time" datetime="…">Jan 27, 2015</time>
```

当 JS 运行正常并且浏览器支持自定义元素时，自定义的 `relative-time` 元素将显示一个相对的时间 (2 hours ago)；否则就是一个标准的 `time` 元素，显示一个绝对时间 (Jan 27, 2015)。


## 最佳实践

显然，方法二比方法一好，事实上，我还找不到方法二的缺点。

[这里](http://jsfiddle.net/stopsatgreen/ru0fqxco/)有一个示例，演示了如何通过方法二来扩展一个自定义按钮，并添加了一个自定义的属性。运行该示例需要 Chrome、Opera 或 Firefox 浏览器，并将 `dom.webcomponents.enabled` 选项打开。

在我看来，创建自定义元素时，应该优先考虑扩展自现有元素。对开发人员来说，自定义元素能够继承和访问那些经过多年测试的属性和方法；对用户来说，如果 JS 运行失败，这些自定义元素也可以回滚为基本元素，保证了页面的可访问性。

该方法唯一的难点在于选择合适的元素来扩展，例如，如果定义一个 `google-maps` 元素，我应该扩展自一个空白的 `div` 元素还是 `img` 元素呢？这是一个重要的选择，你的选择应该保障用户能完成他们的工作，即便是使用一些局限的方式（当自定义元素失效时）。尽管如此，我不认为这是我们使用该最佳实践的障碍。

## 结论

老实说，这并不是一个新的最佳实践（其他语言也有类似的最佳实践）。当使用 JS 创建自定义的 UI 元素时，应充分考虑到元素的可访问性、行为特性和能够在不兼容时回滚为基本的元素。正如 [Roger Johansson](https://twitter.com/rogerjohansson/status/558585728314376194) 所说：

> 当你一定要创建一个自定义的 `select` 元素时，请一定要保证为所有平台复制原生 `select` 元素的所有功能。

## 扩展阅读

- [Custom Elements Specification](http://w3c.github.io/webcomponents/spec/custom/)
- [Custom Elements](http://www.html5rocks.com/zh/tutorials/webcomponents/customelements/)
- [Detailed Introduction To Custom Elements](http://www.smashingmagazine.com/2014/03/04/introduction-to-custom-elements/)
- [Why Web Components Are Ready For Production](http://developer.telerik.com/featured/web-components-ready-production/)
- [Creating a custom icon font using IcoMoon](http://www.broken-links.com/2013/04/04/creating-custom-icon-font-using-icomoon/)
- [CSS Variables: Access Custom Properties with JavaScript](http://www.broken-links.com/2014/08/28/css-variables-updating-custom-properties-javascript/)
- [Removing the whitespace from inline block elements](http://www.broken-links.com/2013/03/25/removing-the-whitespace-from-inline-block-elements/)

<p class="j-quote">参考原文：[Best Practice for Creating Custom Elements](http://www.broken-links.com/2015/01/27/best-practice-creating-custom-elements/)</p>