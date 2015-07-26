title: 【译】IE CSS Bug：图片标签聚焦 Bug
date: 2013-12-23 00:44:07
updated: 2013-12-23 00:44:07
tags:
 - IE
 - HTML
 - CSS
 - Bug
 - 翻译
categories: HTML & CSS
keywords:
---
**影响版本**
IE8、IE7、IE6

**表现**
当点击标签`<label>`里面的`<img>`元素的时候，浏览器不会自动将焦点转移到和标签相关的表单控件上。

**时间**
2009.8.19 15:38:47

**描述**
这个 Bug 是在 [Gérard Talbot 的 IE8 Bug 页面][1]列出的，这还要归功于 [Batiste Bieler][2]。”前段时间我也“有幸在自己做的网站上遇到这个 Bug 了，当然这一点也不好玩。我们一起来看看这个 Bug：

**示例**
示例在[独立的页面][3]<!--more-->

HTML代码
``` html
<form action="">
<ul>
    <li>
        <label for="one"><img src="hl_logo.png" alt=""></label>
        <input type="text" id="one">
    </li>
    <li>
        <label for="two"><img src="hl_logo.png" alt=""></label>
        <textarea cols="10" rows="3" id="two"></textarea>
    </li>
    <li>
        <label for="three"><img src="hl_logo.png" alt=""></label>
        <input type="checkbox" id="three">
    </li>
    <li>
        <label for="four"><img src="hl_logo.png" alt=""></label>
        <input type="radio" name="foo" id="four">
    </li>
    <li>
        <label for="five"><img src="hl_logo.png" alt=""></label>
        <input type="radio" name="foo" id="five">
    </li>
</ul>
</div>
```
CSS代码
``` CSS
li {
    overflow: hidden;
    display: inline-block; /* gives layout for IE float clearing */
}
li { display: block; }

label {
    float: left;
}
```
这个 Demo 代码比较长，是为了更全面地展示实际开发中的`<form>`，而且也能更好说明这个 Bug 的 CMS（Clean Markup Solution）解决方案。

这个bug的本质就是，如果标签<label>元素里面是一个<img>元素，当你点击<img>元素，没有任何触发，浏览器不会像<label>中的普通文本那样，把焦点转移到和标签相关的表单控件上，一切就好像什么都没有发生过一样。

## 解决方案
以下是按照[解决方案类型][4]排序的解决方案：



**解决方案 (Clean Markup Solution)**

 

**解决方案时间**
2009.8.19 15:38:47

**解决浏览器版本**
受影响的全部版本

**描述**
既然是`<img>元素`的问题，那么就要邀请`<span>元素`来帮忙，我们来看看如何去实现:

修复版本示例在[独立的页面][5]

HTML代码
``` HTML
<form action="">
<ul>
    <li>
        <label for="one"><span></span><img src="hl_logo.png" alt=""></label>
        <input type="text" id="one">
    </li>
    <li>
        <label for="two"><span></span><img src="hl_logo.png" alt=""></label>
        <textarea cols="10" rows="3" id="two"></textarea>
    </li>
    <li>
        <label for="three"><span></span><img src="hl_logo.png" alt=""></label>
        <input type="checkbox" id="three">
    </li>
    <li>
        <label for="four"><span></span><img src="hl_logo.png" alt=""></label>
        <input type="radio" name="foo" id="four">
    </li>
    <li>
        <label for="five"><span></span><img src="hl_logo.png" alt=""></label>
        <input type="radio" name="foo" id="five">
    </li>
</ul>
</div>
```
CSS代码
``` CSS
li {
    overflow: hidden;
    display: inline-block; /* gives layout for IE float clearing */
}
li { display: block; }

label {
    float: left;
    position: relative;
    overflow: hidden;
}

label span {
    position: absolute;
    left: 0;
    top: 0;
    width: 500px;
    height: 500px;
    background: url(hl_logo.png) no-repeat -5000px; /* required for IE click bug fix */
}
```
我所做的，就是在每个`<label>`元素中，都在`<img>`前面插入了一个空的`<span>`元素，为了消除`<span`>给`<img>`带来的偏移，我们给`<label>`加了一条`css: {position: relative;}`，然后给`<span>`一个绝对定位并将 top 和 left 设置为 0，确保`<span>`在老版 IE 里不会有令人匪夷所思的偏移。我还设置了足够大 height 和 width 确保它可以覆盖整个`<img>`元素。我还给`<label>`设置了`{overflow: hidden;}`来隐藏`<span>`多余的宽/高。因为`<label>`是浮动的，所以我并没有给它设置明确的维度大小。

现在，最有趣的部分在于`<span>`的`background`属性：这个解决的是在 IE 上`<span>`自己的显示 Bug，我认为这个 Bug跟["Partial Click Bug v2"][6]有关。问题是，我们需要设置`<span>`为透明背景来透过它显示图像，但它还需要一个不透明的背景来阻止 Bug 的发生（这里 Bug 是指单击跨过`<span>`，落到图片，导致聚焦失败）。

我的解决方法是用`<img>`元素中的图片来设置这个背景图片，因为这个图片会被缓存下来，而且给它一个位置偏移让它消失在视野中。当然，你可以设置任何图片背景，甚至可以指定`background: url(#);`或者`background: url(your_css_file.css);`如果这些让代码显得很混乱，你也可以创建一个透明背景的gif图片，把它作为背景。

这个问题解决了，现在`<img>`在受所影响的IE中都可点击了。


[1]: http://www.gtalbot.org/BrowserBugsSection/MSIE8Bugs/
[2]: http://dosimple.ch/
[3]: http://haslayout.net/demos/Image-Label-Focus-Bug-Demo.html
[4]: http://haslayout.net/css/solution-types
[5]: http://haslayout.net/demos/Image-Label-Focus-Bug-Fixed-Demo-CMS.html
[6]: http://haslayout.net/css/Partial-Click-Bug-v2