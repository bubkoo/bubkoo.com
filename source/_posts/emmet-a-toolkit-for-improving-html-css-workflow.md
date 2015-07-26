title: HTML/CSS 速写神器：Emmet
date: 2014/1/4 13:21:12 
updated: 2014/1/4 13:21:16 
tags: [HTML,CSS]
categories: [前端工具]
photos:
  - http://bubkoo.qiniudn.com/emmet-demo.gif
keywords:
---
在前端开发的过程中，一个最繁琐的工作就是写 HTML、CSS 代码。数量繁多的标签、属性、尖括号、标签闭合等，让前端们甚是苦恼。于是，我向大家推荐 [Emmet][1]，它提供了一套非常简单的语法规则，书写起来非常爽快，然后只需要敲一个快捷键就立刻生成对应的 HTML 或 CSS 代码，极大提高了代码书写效率。

<!--more-->
[Emmet][1] 的前身是大名鼎鼎的 **Zen coding**，它是一个编辑器插件，需要基于指定的编辑器使用，官方网站提供[多编辑器支持][2]，目前它支持的编辑器如下：

- [Sublime Text][4]
- [Eclipse/Aptana][5]
- [TextMate][6]
- [Coda][7]
- [Espresso][8]
- [Chocolat][9]
- [Komodo Edit][10]
- [Notepad++][11]
- [PSPad][12]
- [textarea][13]
- [CodeMirror][14]
- [Brackets][15]
- [NetBeans][16]
- [Adobe Dreamweaver][17]

请参照上面列表安装对应的编辑器插件，我一般使用 [Sublime Text 3][3]，下面就以 [Sublime Text 3 插件][4] 为例，讲解 Emmet 的安装、基础语法。

## 在 Sublime text 3 中安装 Emmet ##

目前，Emmet 已经可以通过 Package Control 安装了。如果你的 Sublime Text 3 还没有安装 Package Control，请参照以下方法安装，已经安装的童鞋请自行跳过。

**为 Sublime Text 3 安装 Package Control 组件：**

1. 按 Ctrl + ` 打开控制台，粘贴以下代码到底部命令行并回车：

``` python
import urllib.request,os; pf = 'Package Control.sublime-package'; ipp =   sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); open(os.path.join(ipp, pf), 'wb').write(urllib.request.urlopen( 'http://sublime.wbond.net/' + pf.replace(' ','%20')).read())
```

2. 重启 Sublime Text 3
3. 在 Perferences->Package Settings 中看到 Package Control，则表示安装成功

**使用 Package Control 安装 Emmet 插件：**
1. 在 Package Control 中选择 Install package 或者按 Ctrl+Shift+P，打开命令板
2. 输入 pci 然后选择 Install Package
3. 搜索输入 emmet 找到 Emmet Css Snippets，点击就可以自动完成安装。

## 快速体验 Emmet ##

Emmet 可以快速的编写 HTML、CSS 以及实现其他的功能。它根据当前文件的**解析模式**来判断要使用 HTML 语法还是 CSS 语法来解析。例如当前文件的后缀为 .html 那 Sublime text 3 就会用 HTML 的解析模式来解析高亮这个文件，Emmet 遇到里面的指令就会根据 HTML 的语法把它编译成 HTML 结构。如果是在一个 .c 的 C 语言文件中，你写出来的用于编译 HTML 指令就不会被 Emmet 识别编译。

此外，在没有后缀的文件中，你可以按下`shift + ctrl + p`呼出面板，输入`seth`就可以设置当前文件的解析模式为 HTML 。了解这些之后，下面我们来见证强大的 Emmet。

如果让你编写下面的这个 HTML 结构，你需要多长时间？

``` html
<div id="page">
    <div class="logo"></div>
    <ul id="navigation">
        <li><a href="">Item 1</a></li>
        <li><a href="">Item 2</a></li>
        <li><a href="">Item 3</a></li>
        <li><a href="">Item 4</a></li>
        <li><a href="">Item 5</a></li>
    </ul>
</div>
```

然而，这一切你只需要编写下面这一句按照 Emmet 语法写出来的语句，然后用 Emmet 编译一下，就可以生成了！


``` html
#page>div.logo+ul#navigation>li*5>a{Item $}
```

我们把它复制到 Sublime text 3 中已经打开的 HTML 文件中，这时候紧跟着敲击一下 TAB 键，见证奇迹的时刻到来了。

怎么样？很神奇吧，仅仅写一行代码，就可以生成这么一个复杂的 HTML 结构，而且还可以生成对应的 class 、id 和有序号的内容。而且 Emmet 的语法很简单，虽然你现在可能还看不懂，后面的系列教程会详细讲解它的语法，你现在只需要知道 Emmet 的工作流程：

> **打开 HTML 或 CSS 文件->按语法编写指令->按下 TAB 键->生成**

## 快速编写HTML代码 ##

### **生成 HTML 文档初始结构** ###

HTML文档需要包含一些固定的标签，比如 doctype、html、head、body 以及 meta 等等，现在你只需要1秒钟就可以输入这些标签。比如输入`!`或`html:5`，然后按 Tab 键： 

``` html
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    < title>Document</title>
</head>
<body>

</body>
</html>
```

这就是一个 HTML5 的标准结构，也是默认的 HTML 结构。如果你想生成 HTML4 的过渡型结构，那么输入指令 html:xt 即可生成如下结构：

``` html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=UTF-8">
    < title>Document</title>
</head>
<body>

</body>
</html>
```

Emmet 会自动把 doctype 给你补全了，怎么样，这样的功能会不会让你动心？

简单总结一下常用的 HTML 结构指令：

- **html:5** 或者 **!** 生成 HTML5 结构
- **html:xt** 生成 HTML4 过渡型
- **html:4s** 生成 HTML4 严格型

### **生成带有 id 、class 的 HTML 标签** ###

Emmet 默认的标签为 div，如果我们不给出标签名称的话，默认就生成 div 标签。生成 id 为 page 的 div 标签，我们只需要编写下面指令：

``` html
div#page
```

或者使用默认标签的方式：

``` html
#page
```

如果编写一个 class 为 content 的 p 标签，我们需要编写下面指令：

``` html
p.content
```

同时指定标签的 id 和 class，如生成 id 为 navigation，class 为 nav 的 ul 标签：

``` html
ul#navigation.nav
```

指定多个 class，如上例中还需要给 ul 指定一个 class 为 dropdown：

``` html
ul#navigation.nav.dropdown
```

生成的 HTML 结构如下：

``` html
<ul id="navigation" class="nav dropdown">
	
</ul>
```

### **兄弟：+** ###

生成标签的兄弟标签，即平级元素，使用指令** + **，例如下面指令：

``` html
div+ul+bq
```

生成的 HTML 结构如下：

``` html
<div></div>
<ul></ul>
<blockquote></blockquote>
```

### **后代：>** ###
**>** 表示后面要生成的内容是当前标签的后代。例如我要生成一个无序列表，而且被 class 为 nav 的 div 包裹，那么可以使用下面指令：

``` html
div.nav>ul>li
```

生成的 HTML 结构如下：

``` html
<div class="nav">
    <ul>
        <li></li>
    </ul>
</div>
```

### **上级元素：^** ###

上级 （Climb-up）元素是什么意思呢？前面咱们说过了生成下级元素的符号**">"**，当使用 `div>ul>li` 的指令之后，再继续写下去，那么后续内容都是在 li 下级的。如果我想编写一个跟 ul 平级的 span 标签，那么我需要先用 **"^"** 提升一下层次。例如：

``` html
div.nav>ul>li^span
```

就会生成如下结构：

``` html
<div  class="nav">
    <ul>
        <li></li>
    </ul>
    <span></span>
</div>
```

如果我想相对与 div 生成一个平级元素，那么就再上升一个层次，多用一个 **"^"** 符号：

``` html
div.nav>ul>li^^span
```

结果如下：

``` html
<div  class="nav">
    <ul>
        <li></li>
    </ul>    
</div>
<span></span>
```

### **重复多份：* ** ###
特别是一个无序列表，ul 下面的 li 肯定不只是一份，通常要生成很多个 li 标签。那么我们可以直接在 li 后面 * 上一些数字：

``` html
ul>li*5
```

这样就直接生成五个项目的无序列表了。如果想要生成多份其他结构，方法类似。

### **分组：()** ###
用括号进行分组，表示一个代码块，分组内部的嵌套和层级关系和分组外部无关，例如：

``` html
div>(header>ul>li*2>a)+footer>p
```

生成结构如下：

``` html
<div>
    <header>
        <ul>
            <li><a href=""></a></li>
            <li><a href=""></a></li>
        </ul>
    </header>
    <footer>
        <p></p>
    </footer>
</div>
```

可以看出整个分组成为 div 的后代，并且分组与 footer 平级。此外，分组还可以很方便的结合上面说的 **"*"** 符号生成重复结构：

``` html
(div>dl>(dt+dd)*3)+footer>p
```

生成结构如下：

``` html
<div>
    <dl>
        <dt></dt>
        <dd></dd>
        <dt></dt>
        <dd></dd>
        <dt></dt>
        <dd></dd>
    </dl>
</div>
<footer>
    <p></p>
</footer>
```

### **属性：[attr]** ###
a 标签中往往需要附带 href 属性和 title 属性，如果我们想生成一个 href 为 “http://bubkoo.com” ，title 为“bubkoo's blog”的 a 标签，可以这样写：

``` html
a[href="http://bubkoo.com" title="bubkoo's blog"]
```

此外，也可以生成一些自定义属性：

``` html
div[data-title="bubkoo's blog" data-content="CUCKOO USHERS SPRING IN"]
```

就会生成：

``` html
<div data-title="bubkoo's blog" data-content="CUCKOO USHERS SPRING IN">
	
</div>
```

### **编号：$** ###
例如无序列表，我想为五个个 li 增加一个 class 属性值 item1 ，然后依次递增从 1-5，那么就需要使用 **$** 符号：

``` html
ul>li.item$*5
```

结构是：

``` html
<ul>
 <li class="item1"></li>
 <li class="item2"></li>
 <li class="item3"></li>
 <li class="item4"></li>
 <li class="item5"></li>
</ul>
```

**$ **表示一位数字，只出现一个的话，就从 1 开始，如果出现多个，就从 0 开始。
如果我想生成三位数的序号，那么要写三个** $**：

``` html
ul>li.item$$$*5
```

输出：

``` html
<ul>
    <li class="item001"></li>
    <li class="item002"></li>
    <li class="item003"></li>
    <li class="item004"></li>
    <li class="item005"></li>
</ul>
```

此外，也可以在** $ **后面增加** @- **来实现倒序排列：

``` html
ul>li.item$@-*5
```

输出：

``` html
<ul>
    <li class="item5"></li>
    <li class="item4"></li>
    <li class="item3"></li>
    <li class="item2"></li>
    <li class="item1"></li>
</ul>
```

同时，还可以使用 @N 指定开始的序号：

``` html
ul>li.item$@3*5
```

那么输出：

``` html
<ul>
    <li class="item3"></li>
    <li class="item4"></li>
    <li class="item5"></li>
    <li class="item6"></li>
    <li class="item7"></li>
</ul>
```

配合上面倒序输出，可以这样写：

``` html
ul>li.item$@-3*5
```

就可以生成以 3 为底倒序列表：

``` html
<ul>
    <li class="item7"></li>
    <li class="item6"></li>
    <li class="item5"></li>
    <li class="item4"></li>
    <li class="item3"></li>
</ul>
```

### **文本内容：{}** ###
生成超链接一般要加上可点击的文本内容，如上面的连接：

``` html
a[href="http://bubkoo.com" title="bubkoo's blog"]{猛击这里}
```

就会生成

``` html
<a href="http://bubkoo.com" title="bubkoo's blog">猛击这里</a>
```

另外，在生成内容的时候，特别要注意前后的符号关系，虽然 a>{Click me} 和 a{Click me} 生成的结构是相同的，但是加上其他的内容就不一定了，例如：

``` html
<!-- a{click}+b{here} -->
<a href="">click</a><b>here</b>

<!-- a>{click}+b{here} -->
<a href="">click<b>here</b></a>
```


### **隐式标签** ###
隐式标签表示 Emmet 可以省略某些标签名，例如，声明一个带类的div，只需输入`.item`，就会生成`<div class="item"></div>`。另外，Emmet 还会根据父标签进行判定，例如，在中输入`ul>.item$*5`，就可以生成：

``` html
<ul>
	<li class="item1"></li>
	<li class="item2"></li>
	<li class="item3"></li>
	<li class="item4"></li>
	<li class="item5"></li>
</ul>
```

下面是所有的隐式标签名称：

- li：用于 ul 和 ol 中
- tr：用于 table、tbody、thead 和 tfoot 中
- td：用于 tr 中
- option：用于 select 和 optgroup 中

### **不要有空格** ###
在写指令的时候，你可能为了代码的可读性，使用一些空格什么的排版一下。这就会导致代码无法使用。例如下面这句：

``` html
<!-- a{click}+b{here} -->
(header > ul.nav > li*5) + footer
```

执行结果会不是你所希望的那样，所以，**指令之间不要有空格**。

### **HTML 简写规则简单总结** ###
　　1. E 代表HTML标签。
　　2. E#id 代表id属性。
　　3. E.class 代表class属性。
　　4. E[attr=foo] 代表某一个特定属性。
　　5. E{foo} 代表标签包含的内容是foo。
　　6. E>N 代表N是E的子元素。
　　7. E+N 代表N是E的同级元素。
　　8. E^N 代表N是E的上级元素。

## 飞一般的 CSS 书写 ##
首先，[Sublime Text 3][3] 已经提供了比较强大的 CSS 样式所写方法来提高 CSS 编写效率。例如编写 position: absolute; 这一个属性，我们只需要输入 posa 这四个字母即可。可以在平时书写过程中，留意一下 ST3 提供了哪些属性的缩写方法，这样就可以提高一定的效率了。但是 Emmet 提供了更多的功能，请往下看。

### **简写属性和属性值** ###
比如要定义元素的宽度，只需输入w100，即可生成：

``` css
width: 100px;  
```

Emmet 的默认设置 w 是 width 的缩写，后面紧跟的数字就是属性值。默认的属性值单位是 px ，你可以在值的后面紧跟字符生成单位，可以是任意字符。例如，w100foo 会生成：

``` css
width:100foo;  
```

同样也可以简写属性单位，如果你紧跟属性值后面的字符是 p，那么将会生成：

``` css
width:100%;
```

下面是单位别名列表：
- p 表示%
- e 表示 em
- x 表示 ex

像 margin 这样的属性，可能并不是一个属性值，生成多个属性值需要用横杠（-）连接两个属性值，因为 Emmet 的指令中是不允许空格的。例如使用 m10-20 可以生成：

``` css
margin: 10px 20px;
```

如果你想生成负值，多加一条横杠即可。例如：m10--20 可以生成：

``` css
margin: 10px -20px;
```

需要注意的是，如果你对每个属性都指定了单位，那么不需要使用横杠分割。例如使用 m10e20e 可以生成：

``` css
margin: 10em 20em;
```

如果使用了横杠分割，那么属性值就变成负值了。例如使用 m10e-20e 就生成：

``` css
margin: 10em -20em;
```

如果你想一次生成多条语句，可以使用 **"+"** 连接两条语句，例如使用 h10p+m5e 可以生成：

``` css
height: 10%;
margin: 5em;
```

颜色值也是可以快速生成的，例如 `c#3` 生成 `color: #333;`，更复杂一点的，使用 `bd5#0s` 可以生成 `border: 5px #000 solid;`。

下面是颜色值生成规则：
- '#1' → #111111
- '#e0' → #e0e0e0
- '#fc0' → #ffcc00

生成 `!important` 这条语句也当然很简单，只需要一个 **"!"** 就可以了。

### **附加属性** ###
使用 @f 即可生成 CSS3 中的 font-face 的代码结构：

``` css
@font-face {
	font-family:;
	src:url();
}
```

但是这个结构太简单，不包含一些其他的 font-face 的属性，诸如 background-image、 border-radius、 font、@font-face、 text-outline、 text-shadow 等属性，我们可以在生成的时候输入 **"+"** 生成增强的结构，例如我们可以输入 `@f+` 命令，即可输出选项增强版的 font-face 结构：

``` css
@font-face {
	font-family: 'FontName';
	src: url('FileName.eot');
	src: url('FileName.eot?#iefix') format('embedded-opentype'),
		 url('FileName.woff') format('woff'),
		 url('FileName.ttf') format('truetype'),
		 url('FileName.svg#FontName') format('svg');
	font-style: normal;
	font-weight: normal;
}
```

### **模糊匹配** ###
如果有些缩写你拿不准，Emmet 会根据你的输入内容匹配最接近的语法，比如输入 ov:h、ov-h、ovh 和 oh，生成的代码是相同的： 

``` css
overflow: hidden;  
```

### **供应商前缀** ###
CSS3 等现在还没有出正式的 W3C 规范，但是很多浏览器已经实现了对应的功能，仅作为测试只用，所以在属性前面加上自己独特的供应商前缀，不同的浏览器只会识别带有自己规定前缀的样式。然而为了实现兼容性，我们不得不编写大量的冗余代码，而且要加上对应的前缀。使用 Emmet 可以快速生成带有前缀的 CSS3 属性。

在任意字符前面加上一条横杠（-），即可生成该属性的带前缀代码，例如输入 -foo-css，会生成：

``` css
-webkit-foo-css: ;
-moz-foo-css: ;
-ms-foo-css: ;
-o-foo-css: ;
foo-css: ; 
```

虽然 foo-css 并不是什么属性，但是照样可以生成。此外，你还可以详细的控制具体生成哪几个浏览器前缀或者先后顺序，使用 -wm-trf 即可生成：

``` css
-webkit-transform: ;
-moz-transform: ;
transform: ;
```

可想而知，w 就是 webkit 前缀的缩写，m 是 moz 前缀缩写，s 是 ms 前缀缩写，o 就是 opera 浏览器前缀的缩写。如果使用 -osmw-abc 即可生成：

``` css
-o-abc: ;
-ms-abc: ;
-moz-abc: ;
-webkit-abc: ;
abc: ;
```

### **渐变背景** ###
CSS3 中新增加了一条属性 linear-gradient 使用这个属性可以直接制作出渐变的效果。但是这个属性的参数比较复杂，而且需要添加实验性前缀，无疑需要生成大量代码。而在 Emmet 中使用 lg() 指令即可快速生成，例如：使用 lg(left, #fff 50%, #000) 可以直接生成：

``` css
background-image: -webkit-gradient(linear, 0 0, 100% 0, color-stop(0.5, #fff), to(#000));
background-image: -webkit-linear-gradient(left, #fff 50%, #000);
background-image: -moz-linear-gradient(left, #fff 50%, #000);
background-image: -o-linear-gradient(left, #fff 50%, #000);
background-image: linear-gradient(left, #fff 50%, #000);
```

## 附加功能 ##
### **生成Lorem ipsum文本** ### 
Lorem ipsum 指一篇常用于排版设计领域的拉丁文文章，主要目的是测试文章或文字在不同字型、版型下看起来的效果。通过 Emmet，你只需输入 **lorem** 或 **lipsum** 即可生成这些文字。还可以指定文字的个数，比如 **lorem10**，将生成： 
``` css

Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo, esse, provident, nihil laudantium vitae quam natus a earum assumenda ex vel consectetur fugiat eveniet minima veritatis blanditiis molestiae harum est!

```
### **定制** ###
你还可以定制Emmet插件：

- 添加新缩写或更新现有缩写，可修改 [snippets.json](http://docs.emmet.io/customization/snippets/) 文件
- 更改Emmet过滤器和操作的行为，可修改 [preferences.json](http://docs.emmet.io/customization/preferences/) 文件
- 定义如何生成HTML或XML代码，可修改 [syntaxProfiles.json](http://docs.emmet.io/customization/syntax-profiles/) 文件

### 快捷键 ###

- Ctrl+,
  展开缩写

- Ctrl+M
  匹配对

- Ctrl+H
  使用缩写包括

- Shift+Ctrl+M
  合并行

- Ctrl+Shift+?
  上一个编辑点

- Ctrl+Shift+?
  下一个编辑点

- Ctrl+Shift+?
  定位匹配对

## 最后 ##
Emmet 的官方 API 列表[在这里](http://docs.emmet.io/cheat-sheet/)，有一个图片版本可以【[点此下载](http://bubkoo.qiniudn.com/emmet-api.jpg)】

[1]: http://emmet.io/
[2]: http://emmet.io/download/
[3]: http://www.sublimetext.com/
[4]: https://github.com/sergeche/emmet-sublime#readme
[5]: https://github.com/emmetio/emmet-eclipse#readme
[6]: https://github.com/emmetio/Emmet.tmplugin#readme
[7]: https://github.com/emmetio/Emmet.codaplugin#readme
[8]: https://github.com/emmetio/Emmet.sugar#readme
[9]: https://github.com/sergeche/emmet.chocmixin#readme
[10]: http://community.activestate.com/xpi/zen-coding
[11]: https://github.com/emmetio/npp#readme
[12]: https://github.com/emmetio/pspad
[13]: https://github.com/emmetio/textarea
[14]: https://github.com/emmetio/codemirror#readme
[15]: https://github.com/emmetio/brackets-emmet#readme
[16]: https://github.com/emmetio/netbeans#readme
[17]: https://github.com/emmetio/dreamweaver#readme