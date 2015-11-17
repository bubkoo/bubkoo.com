title: 收集一些实用的 CSS 写法
tags:
  - Collection
categories:
  - CSS
photos:
  - http://bubkoo.qiniudn.com/images/a-collection-of-useful-css-protips.jpeg
date: 2015-10-09 15:59:50
updated: 2015-10-09 15:59:50
keywords:
---

记录一些在文章中看到或已经使用到的 CSS。

<!--more-->

## 使用 `:not()` 来设置/取消边框

之前的做法是：

```css
.nav li {
  border-right: 1px solid #666;
}
.nav li:last-child {
  border-right: none;
}
```

使用 `:not()` 来实现，代码更简单，可读性更强：

```css
.nav li:not(:last-child) {
  border-right: 1px solid #666;
}
```

类似，使用 `~` 选择器可以实现左边线效果：

```css
.nav li:first-child ~ li {
  border-left: 1px solid #666;
}
```

## 使用负的 `nth-child` 来选择前几项

```css
li {
  display: none;
}

/* select items 1 through 3 and display them */
li:nth-child(-n+3) {
  display: block;
}
```

## 文字显示优化

有时，字体不是在所有设备上的显示都会被优化，所以请明确告知浏览器：

```css
html {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

## 让空连接显示连接地址


```css
a[href^="http"]:empty::before {
  content: attr(href);
}
```

## 参考文章

- https://github.com/AllThingsSmitty/css-protips