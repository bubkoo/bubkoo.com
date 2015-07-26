title: 弹性盒模型指南
tags: 
  - CSS3 
  - Flexbox
categories: 
  - CSS
date: 2015-04-17 13:10:40
photos:
  - http://bubkoo.qiniudn.com/A-Vusial-Guide-to-CSS3-Flexbox-Layout-and-Properties.png
keywords:
---

Flexbox 布局是 CSS3 中一种新的布局模型，被称为[弹性盒模型](http://www.w3.org/TR/css-flexbox/)。该模型是为了改进容器中内容的对齐、方向和排序方式，即使是动态，甚至是未知大小的容器。弹性盒模型的主要特点是，可以在不同屏幕尺寸下以最佳的方式，修改其子项的高度或宽度来填充容器的可用空间。

许多设计师和开发人员认为这种布局使用起来更加简单，弹性盒模型的使元素的定位更加简单，从而某些复杂的布局可以用更少的代码来实现，进而简化了开发过程。Flexbox 布局算法是基于方向的，这与基于垂直和水平的 block 和 inline 布局不同。弹性盒模型可用于小应用或组建的布局，然而对于大型应用应该使用 [Grid 布局](http://www.w3.org/TR/css-grid/)。

本文将用可视化的方式介绍 Flex 如何影响我们的布局。

<!--more-->

## 基础

开始之前，我们先简单介绍一下弹性盒模型。弹性盒模型由一个弹性容器（flex container）和其直接子元素（flex items）构成。

![](http://bubkoo.qiniudn.com/CSS3-Flexbox-Model.jpg)

上图描述了弹性盒模型的构成，更多信息可以参考 [W3C](http://www.w3.org/TR/css-flexbox/#box-model)。

弹性盒模型从 2009 年被提出到现在经过了很多次的迭代和语法修改，为了避免给读者造成困惑，本文只采用最新（2014年2月）的语法规范。如果需要兼容旧浏览器，你可以从[这篇文章](https://css-tricks.com/using-flexbox/)找到一些最佳实践。

**兼容最新规范的浏览器：**

- Chrome 29+
- Firefox 28+
- Internet Explorer 11+
- Opera 17+
- Safari 6.1+（需要 -webkit- 前缀）
- Android 4.4+
- iOS 7.1+（需要 -webkit- 前缀）

[这里](http://caniuse.com/#search=flex)有详细的浏览器兼容和支持列表。


## 使用

在容器上设置 `display` 样式属性，只需要在父容器上设置该属性，其所有的直接子元素将自动成为弹性子项。

```css
.flex-container {
  display: -webkit-flex; /* Safari */
  display: flex;
}
```

如果要显示为行内元素，可以这样：

```css
.flex-container {
  display: -webkit-inline-flex; /* Safari */
  display: inline-flex;
}
```

## 弹性容器属性

### flex-direction

定义子项在容器中的布局方式，水平布局和垂直布局。

**取值：**

- `row` 横向从左到右排列（左对齐），默认的排列方式
- `row-reverse` 反转横向排列（右对齐，从后往前排，最后一项排在最前面）
- `column` 纵向排列
- `column-reverse` 反转纵向排列，从后往前排，最后一项排在最上面

**注意：**`row` 和 `row-reverse` 依赖于书写模式，在 `RTL` 模式下，它们将分别被反转。

```css
.flex-container {
  -webkit-flex-direction: row; /* Safari */
  flex-direction:         row;
}
```

![在 LTR 上下文中，子项从左往右排列](http://bubkoo.qiniudn.com/flexbox-flex-direction-row.jpg)

```css
.flex-container {
  -webkit-flex-direction: row-reverse; /* Safari */
  flex-direction:         row-reverse;
}
```

![在 LTR 上下文中，子项从右往左排列](http://bubkoo.qiniudn.com/flexbox-flex-direction-row-reverse.jpg)

```css
.flex-container {
  -webkit-flex-direction: column; /* Safari */
  flex-direction:         column;
}
```

![从上往下排列](http://bubkoo.qiniudn.com/flexbox-flex-direction-column.jpg)

```css
.flex-container {
  -webkit-flex-direction: column-reverse; /* Safari */
  flex-direction:         column-reverse;
}
```

![从下往上排列](http://bubkoo.qiniudn.com/flexbox-flex-direction-column-reverse.jpg)

### flex-wrap

设置弹性盒模型子元素超出父容器时是否换行。默认值为 `nowrap`。

**取值：**

- `nowrap` 当子元素溢出父容器时不换行
- `wrap` 当子元素溢出父容器时自动换行
- `wrap-reverse` 反转 `wrap` 排列

**注意：**该属性也依赖文档的书写模式，在 `RTL` 模式下行排列的方式将相应地被反转。

```css
.flex-container {
  -webkit-flex-wrap: nowrap; /* Safari */
  flex-wrap:         nowrap;
}
```
![默认情况下，所有子项都不换行，子项将缩小自己来适应容器的大小](http://bubkoo.qiniudn.com/flexbox-flex-wrap-nowrap.jpg)

```css
.flex-container {
  -webkit-flex-wrap: wrap; /* Safari */
  flex-wrap:         wrap;
}
```

![从左到右，从上到下显示为多行](http://bubkoo.qiniudn.com/flexbox-flex-wrap-wrap.jpg)

```css
.flex-container {
  -webkit-flex-wrap: wrap-reverse; /* Safari */
  flex-wrap:         wrap-reverse;
}
```

![从左到右，从下到上显示为多行](http://bubkoo.qiniudn.com/flexbox-flex-wrap-wrap-reverse.jpg)

### flex-flow

该属性是 `flex-direction` 和 `flex-wrap` 的简写。默认值为 `row nowrap`。

```css
.flex-container {
  -webkit-flex-flow: <flex-direction> || <flex-wrap>; /* Safari */
  flex-flow:         <flex-direction> || <flex-wrap>;
}
```



### justify-content

该属性定义了子项的水平对齐方式，默认值为 `flex-start`。当弹性盒里一行上的所有子元素都不能伸缩或已经达到其最大值时，这一属性可协助对多余的空间进行分配。当元素溢出某行时，这一属性同样会在对齐上进行控制。

**取值：**

- `flex-start` 弹性盒子元素将向行起始位置对齐。该行的第一个子元素的主起始位置的边界将与该行的主起始位置的边界对齐，同时所有后续的伸缩盒项目与其前一个项目对齐
- `flex-end` 弹性盒子元素将向行结束位置对齐。该行的第一个子元素的主结束位置的边界将与该行的主结束位置的边界对齐，同时所有后续的伸缩盒项目与其前一个项目对齐
- `center` 弹性盒子元素将向行中间位置对齐。该行的子元素将相互对齐并在行中居中对齐，同时第一个元素与行的主起始位置的边距等同与最后一个元素与行的主结束位置的边距（如果剩余空间是负数，则保持两端相等长度的溢出）
- `space-between` 弹性盒子元素会平均地分布在行里。如果最左边的剩余空间是负数，或该行只有一个子元素，则该值等效于 `flex-start`。在其它情况下，第一个元素的边界与行的主起始位置的边界对齐，同时最后一个元素的边界与行的主结束位置的边距对齐，而剩余的伸缩盒项目则平均分布，并确保两两之间的空白空间相等
- `space-around` 弹性盒子元素会平均地分布在行里，两端保留子元素与子元素之间间距大小的一半。如果最左边的剩余空间是负数，或该行只有一个伸缩盒项目，则该值等效于'center'。在其它情况下，伸缩盒项目则平均分布，并确保两两之间的空白空间相等，同时第一个元素前的空间以及最后一个元素后的空间为其他空白空间的一半

```css
.flex-container {
  -webkit-justify-content: flex-start; /* Safari */
  justify-content:         flex-start;
}
```
![在 LTR 上下文中，子项依次对齐到容器的左边界](http://bubkoo.qiniudn.com/flexbox-justify-content-flex-start.jpg)

```css
.flex-container {
  -webkit-justify-content: flex-end; /* Safari */
  justify-content:         flex-end;
}
```

![在 LTR 上下文中，子项依次对齐到容器的右边界](http://bubkoo.qiniudn.com/flexbox-justify-content-flex-end.jpg)

```css
.flex-container {
  -webkit-justify-content: center; /* Safari */
  justify-content:         center;
}
```

![在容器的中心对齐](http://bubkoo.qiniudn.com/flexbox-justify-content-center.jpg)

```css
.flex-container {
  -webkit-justify-content: space-between; /* Safari */
  justify-content:         space-between;
}
```

![子项以相同间距排列，并对齐到容器的左右边界](http://bubkoo.qiniudn.com/flexbox-justify-content-space-between.jpg)

```css
.flex-container {
  -webkit-justify-content: space-around; /* Safari */
  justify-content:         space-around;
}
```

![每个子项的左右都有相同的间距](http://bubkoo.qiniudn.com/flexbox-justify-content-space-around.jpg)

### align-items

该属性定义了子项的侧轴对齐方式。默认值为 `stretch`。

**取值：**

- `stretch` 如果指定侧轴大小的属性值为 `auto`，则其值会使项目的边距盒的尺寸尽可能接近所在行的尺寸，但同时会遵照 `min/max-width/height` 属性的限制
- `flex-start` 弹性盒子元素的侧轴（纵轴）起始位置的边界紧靠住该行的侧轴起始边界
- `flex-end` 弹性盒子元素的侧轴（纵轴）起始位置的边界紧靠住该行的侧轴结束边界
- `center` 弹性盒子元素在该行的侧轴（纵轴）上居中放置。（如果该行的尺寸小于弹性盒子元素的尺寸，则会向两个方向溢出相同的长度）
- `baseline` 如弹性盒子元素的行内轴与侧轴为同一条，则该值与 `flex-start` 等效。其它情况下，该值将参与基线对齐

```css
.flex-container {
  -webkit-align-items: stretch; /* Safari */
  align-items:         stretch;
}
```
![子项将填充整个高度或宽度](http://bubkoo.qiniudn.com/flexbox-align-items-stretch.jpg)

```css
.flex-container {
  -webkit-align-items: flex-start; /* Safari */
  align-items:         flex-start;
}
```

![子项将紧靠容器的上（左）边缘](http://bubkoo.qiniudn.com/flexbox-align-items-flex-start.jpg)

```css
.flex-container {
  -webkit-align-items: flex-end; /* Safari */
  align-items:         flex-end;
}
```

![子项将紧靠容器的下（右）边缘](http://bubkoo.qiniudn.com/flexbox-align-items-flex-end.jpg)

```css
.flex-container {
  -webkit-align-items: center; /* Safari */
  align-items:         center;
}
```

![](http://bubkoo.qiniudn.com/flexbox-align-items-center.jpg)

```css
.flex-container {
  -webkit-align-items: baseline; /* Safari */
  align-items:         baseline;
}
```

![](http://bubkoo.qiniudn.com/flexbox-align-items-baseline.jpg)

**提示：**[这里](http://www.w3.org/TR/css-flexbox/#flex-baselines)有关于 baseline 计算方式的详细介绍。

### align-content

该属性定义弹性容器中包含多行时，行之间的水平排列方式。默认值为 `stretch`。

**取值：**

- `stretch` 各行将会伸展以占用剩余的空间。如果剩余的空间是负数，该值等效于 `flex-start`。在其它情况下，剩余空间被所有行平分，以扩大它们的侧轴尺寸
- `flex-start` 各行向弹性盒容器的起始位置堆叠。弹性盒容器中第一行的侧轴起始边界紧靠住该弹性盒容器的侧轴起始边界，之后的每一行都紧靠住前面一行
- `flex-end` 各行向弹性盒容器的结束位置堆叠。弹性盒容器中最后一行的侧轴起结束界紧靠住该弹性盒容器的侧轴结束边界，之后的每一行都紧靠住前面一行
- `center` 各行向弹性盒容器的中间位置堆叠。各行两两紧靠住同时在弹性盒容器中居中对齐，保持弹性盒容器的侧轴起始内容边界和第一行之间的距离与该容器的侧轴结束内容边界与第最后一行之间的距离相等。（如果剩下的空间是负数，则各行会向两个方向溢出的相等距离。）
- `space-between` 各行在弹性盒容器中平均分布。如果剩余的空间是负数或弹性盒容器中只有一行，该值等效于 `flex-start`。在其它情况下，第一行的侧轴起始边界紧靠住弹性盒容器的侧轴起始内容边界，最后一行的侧轴结束边界紧靠住弹性盒容器的侧轴结束内容边界，剩余的行则按一定方式在弹性盒窗口中排列，以保持两两之间的空间相等
- `space-around` 各行在弹性盒容器中平均分布，两端保留子元素与子元素之间间距大小的一半。如果剩余的空间是负数或弹性盒容器中只有一行，该值等效于'center'。在其它情况下，各行会按一定方式在弹性盒容器中排列，以保持两两之间的空间相等，同时第一行前面及最后一行后面的空间是其他空间的一半

**注意：**该属性只在弹性容器中包含多行时才有效。

```css
.flex-container {
  -webkit-align-content: stretch; /* Safari */
  align-content:         stretch;
}
```

![每行之后都分配相同的空间](http://bubkoo.qiniudn.com/flexbox-align-content-stretch.jpg)

```css
.flex-container {
  -webkit-align-content: flex-start; /* Safari */
  align-content:         flex-start;
}
```

![](http://bubkoo.qiniudn.com/flexbox-align-content-flex-start.jpg)

```css
.flex-container {
  -webkit-align-content: flex-end; /* Safari */
  align-content:         flex-end;
}
```

![](http://bubkoo.qiniudn.com/flexbox-align-content-flex-end.jpg)

```css
.flex-container {
  -webkit-align-content: center; /* Safari */
  align-content:         center;
}
```

![](http://bubkoo.qiniudn.com/flexbox-align-content-center.jpg)

```css
.flex-container {
  -webkit-align-content: space-between; /* Safari */
  align-content:         space-between;
}
```

![](http://bubkoo.qiniudn.com/flexbox-align-content-space-between.jpg)

```css
.flex-container {
  -webkit-align-content: space-around; /* Safari */
  align-content:         space-around;
}
```

![](http://bubkoo.qiniudn.com/flexbox-align-content-space-around.jpg)

### 注意

- 所有的 `column-*` 属性对弹性容器无效
- `::first-line` 和 `::first-letter` 伪元素也不适用于弹性容器

## 弹性子项属性

### order

该属性规定了弹性子项在容器中的显示顺序，默认情况下子项将按照其在文档流中的顺序显示。数值小的排在前面。可以为负值。默认值为 `0`。

```css
.flex-item {
  -webkit-order: <integer>; /* Safari */
  order:         <integer>;
}
```

![](http://bubkoo.qiniudn.com/flexbox-order.jpg)

### flex-grow

定义子项对父容器剩余空间的划分比例。不允许负值。默认值为`0`，如果没有显示定义该属性，是不会拥有分配剩余空间权利的。

```css
.flex-item {
  -webkit-flex-grow: <number>; /* Safari */
  flex-grow:         <number>;
}
```

![如果子项的 flex-grow 值相同，那么他们将拥有相同的大小](http://bubkoo.qiniudn.com/flexbox-flex-grow-1.jpg)

![第二项将比其他项都大](http://bubkoo.qiniudn.com/flexbox-flex-grow-2.jpg)

### flex-shrink

定义子项对父容器超出空间的消化比例。不允许负值。默认值为 `1`，如果没有显示定义该属性，将会自动按照默认值 `1` 在所有因子相加之后计算比率来进行空间收缩。

```css
.flex-item {
  -webkit-flex-shrink: <number>; /* Safari */
  flex-shrink:         <number>;
}
```

![默认情况下所有子项都将参与消化超出空间，如果某项设置为 0 将不参与消化超出空间的消化，从而保持其本身的大小](http://bubkoo.qiniudn.com/flexbox-flex-shrink.jpg)

### flex-basis

设置子项在划分父容器剩余空间和消化超出空间之前的基准宽度或高度。默认值为 `auto`。

```css
.flex-item {
  -webkit-flex-basis: auto | <width>; /* Safari */
  flex-basis:         auto | <width>;
}
```

![显示指定了第四项的大小](http://bubkoo.qiniudn.com/flexbox-flex-basis.jpg)


### flex

该属性是 `flex-grow`、`flex-shrink` 和 `flex-basis` 的简写。默认值为 `0 1 auto`

```css
.flex-item {
  -webkit-flex: none | auto | [ <flex-grow> <flex-shrink>? || <flex-basis> ]; /* Safari */
  flex:         none | auto | [ <flex-grow> <flex-shrink>? || <flex-basis> ];
}
```


### align-self

设置子项的对其方式。默认值为 `auto`。

**取值：**

- `auto` 如果 `align-self` 的值为 `auto` ，则其计算值为元素的父元素的 `align-items` 值，如果其没有父元素，则计算值为 `stretch`
- `flex-start` 弹性盒子元素的侧轴（纵轴）起始位置的边界紧靠住该行的侧轴起始边界
- `flex-end` 弹性盒子元素的侧轴（纵轴）起始位置的边界紧靠住该行的侧轴结束边界
- `center` 弹性盒子元素在该行的侧轴（纵轴）上居中放置。（如果该行的尺寸小于弹性盒子元素的尺寸，则会向两个方向溢出相同的长度）
- `baseline` 如弹性盒子元素的行内轴与侧轴为同一条，则该值与 `flex-start` 等效。其它情况下，该值将参与基线对齐
- `stretch` 如果指定侧轴大小的属性值为 `auto`，则其值会使项目的边距盒的尺寸尽可能接近所在行的尺寸，但同时会遵照 `min/max-width/height` 属性的限制


```css
.flex-item {
  -webkit-align-self: auto | flex-start | flex-end | center | baseline | stretch; /* Safari */
  align-self:         auto | flex-start | flex-end | center | baseline | stretch;
}
```

![](http://bubkoo.qiniudn.com/flexbox-align-self.jpg)

### 注意

`float`、`clear` 和 `vertical-align` 对弹性子项无效。

## 参考资源

- [A Visual Guide to CSS3 Flexbox Properties](https://scotch.io/tutorials/a-visual-guide-to-css3-flexbox-properties)
- [Dive into Flexbox](http://bocoup.com/weblog/dive-into-flexbox/)
- [CSS 参考手册](http://css.doyoe.com/)
