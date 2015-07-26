title: 在 Web 开发中生成几何图形的几种方式
tags:
  - CSS
  - Shapes
categories:
  - CSS
photos:
  - 
date: 2015-07-22 15:16:15
updated: 2015-07-22 15:16:15
keywords:
---

当我们在进行 Web 开发时，很多时候都是在有意或无意地创建一些矩形，深究一下，到底有多少中方式来得到一个几何图形呢？本文将简单介绍几种生成圆形、三角形和多边形的方式，并分析每种方式的优缺点。

下面是可能使用到的方式：

1. [border-radius](https://css-tricks.com/working-with-shapes-in-web-design/#shapes-border-radius)
2. [border](https://css-tricks.com/working-with-shapes-in-web-design/#shapes-border)
3. [rotating shapes with transform](https://css-tricks.com/working-with-shapes-in-web-design/#shapes-transform-rotate)
4. [pseudo elements](https://css-tricks.com/working-with-shapes-in-web-design/#shapes-pseudo-elem)
5. [box-shadow](https://css-tricks.com/working-with-shapes-in-web-design/#shapes-box-shadow)
6. [wrapping text into shapes with shape-outside](https://css-tricks.com/working-with-shapes-in-web-design/#shapes-shape-outside)
7. [clip-path on an element](https://css-tricks.com/working-with-shapes-in-web-design/#shapes-clip-path)
8. [SVG assets](https://css-tricks.com/working-with-shapes-in-web-design/#shapes-svg-assets)
9. [canvas](https://css-tricks.com/working-with-shapes-in-web-design/#shapes-canvas)

<!--more-->

## border-radius

使用 `border-radius` 样式属性是得到圆形的最简单的方式：


```css
.element {
  height: 500px;
  width: 500px;
  border-radius: 50%;
}
```

<p class="fully-content"><iframe src="//codepen.io/css-tricks/embed/LVembR?height=300&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="300"></iframe></p>

`border-radius` 的属性值可以是长度值或百分比。值为 `50%` 和 `100%` 时都可以得到一个圆形，Jessica Eldredge 有篇文章介绍了[为什么要使用 50% 而不是 100%](http://jessica-eldredge.com/2014/09/07/border-radius-50-or-100-percent)。

使用该属性还可以制作出其他形状，如圆角矩形，椭圆形等。

<p class="fully-content"><iframe src="//codepen.io/css-tricks/embed/5dd5c582ec9b79c7d8ac38c350bd3f02?height=490&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="490"></iframe></p>


**优点：**

- 支持现代浏览器；
- 只需要少量的 CSS。

[深入阅读](https://css-tricks.com/almanac/properties/b/border-radius/)

## border

通过设置 CSS 中的 `border` 属性我们可以一些不同的图形，例如，通过将一个元素的三个边框颜色设置为透明，我们可以模拟一个三角形的样子：

```css
.triangle {
  height: 0;
  width: 0;
  border-left: 100px solid red;
  border-right: 100px solid transparent;
  border-bottom: 100px solid transparent;
  border-top: 100px solid transparent;
}
```

<p class="fully-content"><iframe src="//codepen.io/css-tricks/embed/vOpjXZ?height=300&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="300"></iframe></p>

我们可以使三角形指向任何想要的方向，下面是一个动画教程：

<p class="fully-content"><iframe src="//codepen.io/chriscoyier/embed/lotjh?height=350&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="350"></iframe></p>

你可以使用 [CSS 三角形生成器](http://apps.eky.hk/css-triangle-generator/)来帮你自动生成一个三角形，如果你想以编程的方式来实现一个三角形，这里有一个 CSS 的 [Mixin](https://css-tricks.com/snippets/sass/css-triangle-mixin/)。

也可以是使用该技术来得到一个梯形：

<p class="fully-content"><iframe src="//codepen.io/css-tricks/embed/580955e70863188e57c68338d9dfa2ae?height=268&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="268"></iframe></p>


**优点：**

- 浏览器都支持；
- 有现成的工具可用，比如，[CSS 形状生成器](https://coveloping.com/tools/css-shapes-generator)，可以很方便地生成你想要的几何形状。

## transform

可以使用 `transform` 来做出特定的形状，如钻石形状：

```css
.diamond {
  transform: rotate(45deg);
}
```

<p class="fully-content"><iframe src="//codepen.io/css-tricks/embed/a4a12f6351b38e1a41e78676f20f0cf8?height=268&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="268"></iframe></p>

在上面例子中，由于 `transform` 旋转，导致图形溢出了父元素，我们可以通过 `transform-origin` 来调整：


```css
.diamond {
  transform: rotate(45deg);
  transform-origin: 0 100%;
}
```

**优点：**

- 支持现在浏览器。

**缺点：**

- 需要使用 `transform-origin` 来修正元素的位置，这可能会不好调整。

## Pseudo elements

Pseudo elements(伪元素)是利用 CSS 制作几何形状的重要工具，大大提高了可制作形状的数量，如下面的五角形：

<p class="fully-content"><iframe src="//codepen.io/css-tricks/embed/ca0b36c2d7ea75ea7fd5cd982c328006?height=300&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="300"></iframe></p>

使用 `:before` 为元素，我们生成了两个不同的形状，其中一个在另一个的上面，通过上例中的 CSS 可知，为了得到这个形状，对两个形状的位置要求非常严格。这是我对使用 CSS 来制作复杂形状最不满意的地方：越复杂的形状要求越复杂的代码，一旦你得到五边形或六边形后，你会发现这样的代码非常丑陋，在项目中这样的的代码是不可维护的。

**优点：**

- 可以制作任何你想要的形状；
- 不用像图片一样需要额外的 HTTP 请求。
 
**缺点：**

- 在大型项目中，制作复杂形状的代码会变得不可维护，也不是长久之计。

## box-shadow

这也许是使用 CSS 制作形状最奇怪的方式，因为使用 `box-shadow` 可以创造惊人的艺术效果。看下面的 demo：

<p class="fully-content"><iframe src="//codepen.io/zessx/embed/BsfFt?height=500&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="500"></iframe></p>

**优点：**

- 你可以使用 `box-shadow` 制作形状？

**缺点：**

- 如果将来想修改图形，需要精确找到像素位置对应的 `box-shadow` 属性，这是个烦人的工作；
- 得到的形状不可以被第三方软件编辑，比如 Illustrator，Photoshop 或 Sketch。

## 使用 shape-outside 使文字围绕图形

使用 `shape-outside` 属性可以使文字围绕图形（圆、椭圆或多边形）。需要注意的是：目前这个属性只对浮动元素有效。看下面这个简单的例子：

```css
.element {  
  float: left;
  shape-outside: circle(50%);
  width: 200px;
  height: 200px;
}
```

![](http://7b1fai.com1.z0.glb.clouddn.com/images/shape-outside.png)

`shape-outside` 属性对应的方法有：`circle()`， `ellipse()`、`polygon()` 和 `inset()`，下面这个例子使用了 `ellipse()` 方法：

<p class="fully-content"><iframe src="//codepen.io/css-tricks/embed/7fa99015d63597648d5e312c5b73ac25?height=400&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="400"></iframe></p>

```css
.element {
  shape-outside: ellipse(150px 300px at 50% 50%);
}
```

使用 `ellipse()` 方法时需要指定椭圆需要的 x 和 y 半径，其次是椭圆的中心位置。在上例中，椭圆的中心位置就位于元素的中心位置上。

然后，这里有一个需要注意的问题：当使用 `shape-outside` 属性时，并不会影响元素本身的形状，只影响了围绕它的其他元素的形状。如果为该元素这是一个边框和背景，我们将发现该元素仍然是一个矩形：

<p class="fully-content"><iframe src="//codepen.io/css-tricks/embed/5e47a80626dfa27a42dd18a0e2b8450b?height=400&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="400"></iframe></p>

你可以这样来理解：使用了 `shape-outside` 属性的元素只改变了围绕它的其他元素，而元素本身的几何形状并没有改变。为了改变元素自身的形状可以将 `shape-outside` 和 `clip-path()` 结合使用，例如：

<p class="fully-content"><iframe src="//codepen.io/css-tricks/embed/4e5420d8c1a2766b25dd3c98f684bf9c?height=400&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="400"></iframe></p>

还有很多没有涉及到的内容，如果想要深入了解 `shape-outside` 属性，可以参考[这篇文章](https://css-tricks.com/almanac/properties/s/shape-outside/)。


**优点：**

- 可以实现文字环绕形状效果；
- 可以设置形状的 `margin`、`padding` 和 `border` 属性，这可以使我们对元素位置进行精细控制。

**缺点：**

- IE 和 Firefox 不支持该属性；
- 不改变元素的实际形状。

## clip-path

与上面介绍的 `shape-outside` 属性一样，`clip-path` 属性可以使用的方法有：`inset()`、`polygon()` 和 `ellipse()`，看下面这个例子：

```css
.element {
  width: 200px;
  height: 200px;
  clip-path: polygon(0% 100%, 100% 100%, 0% 0%);
}
```
<p class="fully-content"><iframe src="//codepen.io/css-tricks/embed/84ce4f54c0d96b1ba0a2e9a9290876fb?height=400&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="400"></iframe></p>

`clip-path` 属性是完全支持 CSS3 动画的：

<p class="fully-content"><iframe src="//codepen.io/css-tricks/embed/10c03204463e92a72a6756678e6348d1?height=300&default-tab=result" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" height="300"></iframe></p>

可以使用 [Clippy](http://bennettfeely.com/clippy/) 这样的工具来生成你需要的代码：

![Clippy](http://7b1fai.com1.z0.glb.clouddn.com/images/clippy.jpg)

深入阅读可以参考：

- [Almanac entry for clip-path](https://css-tricks.com/almanac/properties/c/clip/) 
- [Clipping and Masking in CSS](https://css-tricks.com/clipping-masking-css/)

**优点：**

- 可以制作复杂的形状，而不需要图片这样的额外资源。

**缺点：**

- 如果想要实现文字环绕图片的效果，需要结合使用 `clip-path` 和 `shape-outside` 这两个属性。

## SVG



## canvas

## 总结

## 参考资源

- [Almanac entry for clip-path](https://css-tricks.com/almanac/properties/c/clip/)
- [More info about clip-path](https://css-tricks.com/clipping-masking-css/)
- [W3C on CSS Shapes](http://www.w3.org/TR/css-shapes/#propdef-shape-outside)
- [The Shapes of CSS](https://css-tricks.com/examples/ShapesOfCSS/)
- [Getting started with CSS Shapes](http://www.html5rocks.com/en/tutorials/shapes/getting-started/)
- [Clippy](http://bennettfeely.com/clippy/)
- [Adobe’s CSS Shapes CodePen collection](http://codepen.io/collection/qFesk/)
- [Clipping and masking in CSS](https://css-tricks.com/clipping-masking-css/)
- [Border-radius: 50% vs 100%](http://jessica-eldredge.com/2014/09/07/border-radius-50-or-100-percent/)
- [How to get started with CSS shapes](http://www.webdesignerdepot.com/2015/03/how-to-get-started-with-css-shapes/)
- [Shapes editor Chrome extension](https://chrome.google.com/webstore/detail/css-shapes-editor/nenndldnbcncjmeacmnondmkkfedmgmp)
- [Canvas tutorial on MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [A compendium of SVG information](https://css-tricks.com/mega-list-svg-information)