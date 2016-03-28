title: 定制图片加载失败时的样式
tags:
  - Styling
categories:
  - CSS
photos:
date: 2016-03-28 10:36:09
updated: 2016-03-28 10:36:09
keywords:

---


`````html
<img src="http://bubkoo.com/broken.jpg" alt="图片加载失败，默认样式有木有很丑陋？" class="no-fancy">
`````
`````css
.no-fancy{
	margin-top:20px;
}
`````

但也并非一定要如此，我们可以通过 CSS 为加载失败的图片定制样式，提供更好的体验。

<!--more-->

## 关于 img 标签的两个事实

要了解如何为破裂的图片定制样式，需要先搞清楚连个事实：

1. **我们可以为 `<img>` 元素指定字体样式**，这些样式将用于破裂图片的替代文字，不会影响正常显示的图片。
2. **`<img>` 元素实际上是一种[替换元素](https://www.w3.org/TR/CSS21/generate.html#before-after-content)**，其外观和尺寸由外部资源定义，所以通常情况下 `:before` 和 `:after` 这两个伪元素都不起作用，一旦图片加载失败时这两个伪元素将出现。

正是基于以上两点，我们可以为破裂的图片定制样式，而不会影响正常加载的图片。

## 实践

使用下面的无效的图片地址：

```html
<img src="http://bubkoo.com/broken.jpg" alt="图片裂开了" >
```

### 添加一些帮助信息

处理破裂图片的一种方式就是为破裂图片提供更多的帮助信息，以方便用户理解这是一个破裂的图片，使用 `attr()` 表达式我们还可以将破裂图片的地址显示出来。

`````html
<img src="http://bubkoo.com/broken.jpg" alt="图片裂开了" class="no-fancy broken-img">
`````
````css
.broken-img {  
  font-family: 'Helvetica';
  font-weight: 300;
  line-height: 2;  
  text-align: center;

  width: 100%;
  height: auto;
  display: block;
  position: relative;
}

.broken-img:before {  
  content: "We're sorry, the image below is broken :(";
  display: block;
  margin-bottom: 10px;
}

.broken-img:after {  
  content: "(url: " attr(src) ")";
  display: block;
  font-size: 12px;
}
````

### 替换默认的替代文本

我们可以使伪元素盖在破裂的图片元素之上，从而在外观上替换掉默认的替代文本：

`````html
<img src="http://bubkoo.com/broken.jpg" alt="图片裂开了" class="no-fancy broken-img-alt">
`````
````css
.broken-img-alt {  
  font-family: 'Helvetica';
  font-weight: 300;
  line-height: 2;  
  text-align: center;

  width: 100%;
  height: auto;
  display: block;
  position: relative;
}
.broken-img-alt:after {  
  content: "\f016" " " attr(alt);

  font-size: 16px;
  font-family: FontAwesome;
  color: rgb(100, 100, 100);

  display: block;
  position: absolute;
  z-index: 2;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
}
````

### 更丰富的样式

除了定制自定义的提示信息外，我们还可以通过伪元素来提供更丰富的样式。

`````html
<img src="http://bubkoo.com/broken.jpg" alt="图片裂开了" class="no-fancy broken-more">
`````
````css
.broken-more {  
  font-family: 'Helvetica';
  font-weight: 300;
  line-height: 2;  
  text-align: center;

  width: 100%;
  height: auto;
  min-height: 50px;
  display: block;
  position: relative;
}
.broken-more:before {  
  content: " ";
  display: block;

  position: absolute;
  top: -10px;
  left: 0;
  height: calc(100% + 10px);
  width: 100%;
  background-color: rgb(230, 230, 230);
  border: 2px dotted rgb(200, 200, 200);
  border-radius: 5px;
}
.broken-more:after {  
  content: "\f127" " Broken Image ";
  display: block;
  font-size: 16px;
  font-style: normal;
  font-family: FontAwesome;
  color: rgb(100, 100, 100);

  position: absolute;
  top: 5px;
  left: 0;
  width: 100%;
  text-align: center;
}
````

## 浏览器兼容性

不幸的是，这种方案并不兼容所有浏览器。对某些浏览器而言，即便是图片破裂了，伪元素也不会出现。

下面是通过我的测试列举出来的兼容表：

|Browser                                |Alt            |:before:|:after: |
| ------------------------------------- |:-------------:| :-----:| :-----:|
|Chrome (Desktop and Android)           |        ✓      |    ✓   |    ✓   |
|Firefox (Desktop and Android)          |        ✓      |    ✓   |    ✓   |
|Opera (Desktop)                        |        ✓      |    ✓   |    ✓   |
|Opera Mini                             |        ✓ **   |    ✗   |    ✗   |
|Safari (Desktop and iOS)               |        ✓ *    |    ✗   |    ✗   |
|iOS Webview (Chrome, Firefox, others)  |        ✓ *    |    ✗   |    ✗   |

\*\* 不支持定义替代文本的样式
\* 只有当图片的宽度足够包含替换文本时才显示，如果没有为图片指定宽度，那么替代文本可能压根就不显示

对于那些不支持伪元素的浏览器，为伪元素指定的样式也将被忽略，所以不用担心会打乱页面布局。这意味着我们可以为那些兼容的浏览器定制这类样式，为用户提供一个更好的体验。