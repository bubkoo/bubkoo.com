title: 说说 tabindex 的那些事儿
tags: [tabindex]
categories: [HTML/CSS]
date: 2015-02-01 17:04:07
keywords:
---

[tabindex](http://www.w3.org/html/wg/drafts/html/master/editing.html#attr-tabindex) 属性用于管理键盘焦点，决定元素是否能被选中，以及按下 `tab` 键过程中被选中的顺序，使用得当能够极大的提高应用的易用性，然而，不恰当地使用时可以键盘用户对应用的可用性。到底如何使用？设置为 `0` 会有什么效果？设置为 `-1` 会有什么效果？本文将为你揭晓。

<!--more-->

要理解为什么 `tabindex` 属性对可用性有如此大的影响，有必要知道一些键盘交互的方式。键盘用户通常会使用 `tab` 键将光标从一个可获取焦点的元素有序地移动到下一个元素。

像链接和 `form` 表单元素默认都是[可获取焦点](http://www.w3.org/html/wg/drafts/html/master/dom.html#interactive-content-0)的，他们的默认焦点顺序取决于他们在源代码中出现的顺序。

```html
<label for="username">Username:</label>
<input type="text" id="username">

<label for="password">Password:</label>
<input type="password" id="password">

<input type="submit" value="Log in">
```

按下 `tab` 键时将依次选中用户名输入框、密码输入框和登录按钮，这三个元素默认就是可获取焦点的，并且焦点顺序与其在源码中的顺序一致。也就是说，对此并不需要显示设置 `tabindex` 属性，浏览器将有效地处理它们。

## tabindex=0

当 `tabindex` 设置为 `0` 时，元素的 tab 键序与其在源码中的顺序一致。默认情况下，如果元素本身是可获取焦点的就没有必要设置 `tabindex` 属性。但，如果你想让一个不能获取焦点的元素，比如 `<span>` 或 `<div>`，也被包含在 `tab` 键序列表中，那么设置 `tabindex = 0` 就可以使这些元素按其在源码中的顺序出现在 tab 键序中。

值得一提的是，那些可获取焦点的元素使用起来比较方便，例如，当你使用 `<button>` 或 `<input type="checkbox">`，键盘焦点和交互由浏览器自动处理。当你使用其他元素来构建自定义组件时，你需要人为地提供键盘焦点和交互支持。 

## tabindex=-1

当 `tabindex` 被设置为像 `-1` 一样的负数时，该元素就变成可由代码获取焦点，但其本身并不在 tab 键序列表中。也就是说，在按下 `tab` 键时，该元素不能获取到焦点，但是可以通过代码来获取到焦点。

请看下面例子，表单返回错误汇总信息时，将通过代码使其获取到焦点，并将其放置在表单的顶部，这样屏幕阅读器或屏幕放大器用户就能得到提示，以便他们能够纠正错误，同时对于键盘用户，这个元素并不会出现在 tab 键序中。

```html
<div role="group" id="errorSummary" aria-labelledby="errorSummaryHeading" tabindex="-1">
    <h2 id="errorSummaryHeading">Your information contains three errors</h2>
    <ul>
    ...
    </ul>
</div>
```

## tabindex=1+

当 `tabindex` 设置为一个正数时，情况就复杂了。它可以使一个元素不按页面顺序来获取焦点。


```html
<label for="username">Username:</label>
<input type="text" id="username" tabindex="3">

<label for="password">Password:</label>
<input type="password" id="password" tabindex="1">

<input type="submit" value="Log in" tabindex="2">
```

在上面例子中，视觉预期的 tab 顺序是：用户名输入框，密码输入框，最后是登陆按钮。然而，这里设置的 `tabindex` 属性，将使其变得不可预期，焦点移动顺序分别是：密码输入框，登陆按钮，最后才是用户名输入框。

当你意识到密码输入框是表单中第一个能获取到焦点的元素时，事情也许已经变糟。不管在密码输入框之前有多少个可获取焦点的元素，`tabindex=1` 就意味着它将是页面上第一个可获得焦点的元素，而与视觉样式和源码顺序无关。

## 总结

`tabindex` 属性很常用，它可以改善或破坏键盘用户对页面的可用性。使用该属性时，请谨记：

- `tabindex=0` 可以使一个元素按自然顺序出现在 tab 键序中，同时，尽量使用默认可获取焦点的元素。
- `tabindex=-1` 可以使一个元素可由代码获取到焦点，但其本身并不在 tab 键序中。
- 避免设置 `tabindex=1+`。


## 参考阅读

- [可交互元素的定义](http://www.w3.org/html/wg/drafts/html/master/dom.html#interactive-content)
- [tabindex 的定义](http://www.w3.org/html/wg/drafts/html/master/editing.html#attr-tabindex)
- ARIA – [providing keyboard focus](http://www.w3.org/WAI/PF/aria-practices/#kbd_focus)

<p class="j-quote">原文：[Using the tabindex attribute](http://www.paciellogroup.com/blog/2014/08/using-the-tabindex-attribute)</p>