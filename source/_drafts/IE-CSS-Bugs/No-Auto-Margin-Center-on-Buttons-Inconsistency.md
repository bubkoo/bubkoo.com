title: 【译】IE CSS Bug：IE8中按钮使用Auto-Margin居中失效
date: 2013-12-23 01:39:03
updated: 2013-12-23 01:39:03
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
IE8

**表现**
当按钮类元素应用样式`{display: block; margin-left: auto; margin-right: auto;}`，并且没有详细设置 width 值之时，按钮类元素不居中。

**时间**
2009.8.19 10:22:23

**描述**
这是我在[Gérard Talbot的IE8 Bug集合](http://www.gtalbot.org/BrowserBugsSection/MSIE8Bugs/)里面找到的 Bug，不过我要更正说明一下：这个 Bug 不会在所有的`inline元素`发生，而仅仅会出现在按钮（例如`<button>`和`type=”button”`、`type=”submit”`的`<input>`元素）。进一步说，考虑到规范一致性的话，这甚至连一个bug都算不上，因为在w3c标准里面说明：“css 2.1不会定义表单控件和框架的属性应用，也不会定义怎样用css去进行样式化。客户端自己可能会对这些元素应用css属性。”（http://www.w3.org/TR/CSS21/conform.html#conformance）。 但是，这个 Bug 并不会在更早版本的 IE 上出现，正常的浏览器也会将按钮居中，所以让我们来看一下具体情况：

**示例**
示例在[独立的页面][1]<!--more-->

HTML代码
``` html
<form action="">
<div>
    <button>This button should be centered</button>
    <input type="button" value="This button should be centered">
    <input type="text">
    <input type="checkbox">
    <input type="radio">
    <input type="submit" value="This button should be centered">
    <input type="file">
    <select><option>test</option></select>
</div>
</form>
```
CSS代码
``` CSS
button, select, input {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: auto;
}
```
在这个示例中，正常浏览器和 IE6、IE7 中的`<button>`元素以及`<input>`按钮控件(`type=”submit”` 、`type=”button”`)都和其他表单控件一样被居中。但是到了 IE8 这里这种方法却被认为是错误的，尽管设置`margin-left`和`margin-right`的值为 auto 和`display`属性设置为 block（按钮被替换，因此按钮有内在尺寸），但按钮依然左对齐。

## 解决方案
以下是按照[解决方案类型](http://haslayout.net/css/solution-types)排序的解决方案：



**解决方案 (Clean Solution)**


**解决方案时间**
200908.19 10:43:21

**解决浏览器版本**
所有受影响的版本

**描述**
这只能算是一种头痛医头的方法，但是这的确能解决上述的 Bug，假如你只有几个按钮的话也能算是一种可行的解决方法，让我们来看看：

修复版本示例在[独立的页面][2]

HTML代码
``` HTML
<form action="">
<div>
    <button>This button should be centered</button>
    <input type="button" value="This button should be centered">
    <input type="text">
    <input type="checkbox">
    <input type="radio">
    <input type="submit" value="This button should be centered">
    <input type="file">
    <select><option>test</option></select>
</div>
</form>
```
CSS代码
``` CSS
button, select, input {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: auto;
}
 
button,
input[type="submit"],
input[type="button"] {
    width: 20em;
}
```
标记部分保持不变，我只是简单地在 CSS 里面定义了按钮表单控件的 width。如果你不喜欢这种使得其他浏览器里面的按钮宽度被定义的方式，可以通过条件注释的方法来使用。

这种方法的缺点在于你需要考虑到每个按钮的宽度——在我的示例里面，三个按钮的文字都一样，所以我对所有按钮都应用了同样的宽度。

**解决方案 (JavaScript Solution)**


**解决方案时间**
2009.8.19 11:17:13

**解决浏览器版本**
所有受影响的版本

**描述**
如果你有成千上万的个按钮及其他方法的不适用的话，你可以考虑一下 Javascript 的方法。注意：我很清楚把 JS 代码放进 IE 私有的`expression()`和保留在 CSS 文件的话同样也是同一种方法；但是，同时执行上千次的话会弊大于利——这只是一个提醒，只需要做你认为合适的就好。让我们来看看这个示例。

修复版本示例在[独立的页面][3]

HTML代码
``` HTML
<form action="">
<div>
    <button>This button should be centered</button>
    <input type="button" value="This button should be centered">
    <input type="text">
    <input type="checkbox">
    <input type="radio">
    <input type="submit" value="This button should be centered">
    <input type="file">
    <select><option>test</option></select>
</div>
</form>
```
CSS代码
``` CSS
button, select, input {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: auto;
}
```
JavaScript代码
``` JavaScript
<script type="text/javascript">
    var buttons = document.getElementsByTagName('button');
    for ( var i = 0; i < buttons.length; i++ ) {
        buttons[i].style.width = buttons[i].offsetWidth + 'px';
    }
 
    var inputs  = document.getElementsByTagName('input');
    for ( var i = 0; i < inputs.length; i++ ) {
        if ( inputs[i].type == 'button' || inputs[i].type == 'submit' ) {
            inputs[i].style.width = inputs[i].offsetWidth + 'px';
        }
    }
</script>
```
HTML和CSS保持不变。这段JS代码的作用在于找到按钮表单控件，判断它们的宽度，并将这宽度作为CSS样式。很简单。

**解决方案 ()**


**解决方案时间**
2009.8.19 10:22:41

**解决浏览器版本**
所有受影响的版本 

**描述**
这个方法可能会打破你对按钮设置`{display: block; margin: 0 auto;}`的原因，尽管如此，它还是带来了曙光。让我们来看看。

修复版本示例在[独立的页面][4]

HTML代码
``` HTML
<form action="">
<div>
    <button>This button should be centered</button>
    <div class="ie_fix">
        <input type="button" value="This button should be centered">
    </div>
    <input type="text">
    <input type="checkbox">
    <input type="radio">
    <div class="ie_fix">
        <input type="submit" value="This button should be centered">
    </div>
    <input type="file">
    <select><option>test</option></select>
</div>
</form>
```
CSS代码
``` CSS
button, select, input {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: auto;
}
 
.ie_fix {
    text-align: center;
}
.ie_fix input[type="submit"],
.ie_fix input[type="button"] {
    display: inline-block;
}
```
条件注释代码
``` HTML
<!--[if IE 8]>
<style type="text/css">
    button { display: table; }
</style>
<![endif]-->
```
我们来分析一下这个方法。首先，我们对`<input>`、`type=”button”` 和 `type=”submit”`的修改同样可以用于`<button>`；我对`<button>`展示另外一种方法是因为它不需要额外的标记，不过该方法对其他 Bug 不起作用。

在`<button>`上我设置其 display 属性为 table 。这可以让它居中，不过同时这也破坏了在 Opera 中的居中，这也是为什么这个方法要用在以 IE8 为目标的条件注释里面。

按钮`<input>`的解决就更为复杂了，我在每一个按钮都用额外的`<div>`来包围，把该`<div>`设为居中，同时将这些被`<div>`定位的`<input>`设为`{display: inline-block;}`。这样你仍然可以在你需要的时候改变它们的宽度，同时也使它们可以对对齐方式进行响应。

[1]: http://haslayout.net/demos/No-Auto-Margin-Center-on-Buttons-Inconsistency-Demo.html
[2]: http://haslayout.net/demos/No-Auto-Margin-Center-on-Buttons-Inconsistency-Fixed-Demo-CS.html
[3]: http://haslayout.net/demos/No-Auto-Margin-Center-on-Buttons-Inconsistency-Fixed-Demo-JS.html
[4]: http://haslayout.net/demos/No-Auto-Margin-Center-on-Buttons-Inconsistency-Fixed-Demo.html