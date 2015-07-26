title: 那些年我使用过的 Sublime Text 3 插件
date: 2014-01-04 18:56:32
updated: 2014-01-04 18:56:32
tags: [Sublime Text, Tools]
categories: []
keywords:
---
其实，我最开始接触到的是 Sublime Text 2，被其轻量、简洁以及漂亮的配色所瞬间征服，后来升级为 [Sublime Text 3][1]，使用过程中有一些需要设置的地方，还有一些常用插件的安装和设置技巧等，有时候会忘记某些设置方法或者快捷键，然后不得不上网查。恰逢周末，其中的一些东西记录下来，一方面加深自己的印象，同时方便查阅。

![](http://bubkoo.qiniudn.com/sublime-text-2-logo.jpg)
<!--more-->
## 安装 Sublime Text 3 插件的方法 ##

**1. 直接安装**

安装 Sublime text 3 插件很方便，可以直接下载安装包解压缩到 Packages 目录（菜单->Preferences->Packages）。

**2. 使用 Package Control 组件安装**

新安装的 Sublime text 3 默认没有  Package Control 组件，怎么样安装呢？可以按照以下步骤：

1. 按 Ctrl + ` 打开控制台，粘贴以下代码到底部命令行并回车：

``` python
import urllib.request,os; pf = 'Package Control.sublime-package'; ipp =   sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); open(os.path.join(ipp, pf), 'wb').write(urllib.request.urlopen( 'http://sublime.wbond.net/' + pf.replace(' ','%20')).read())
```

2. 重启 Sublime Text 3
3. 在 Perferences->Package Settings 中看到 Package Control，则表示安装成功

**用Package Control安装插件的方法：**
1. 在 Package Control 中选择 Install package 或者按 Ctrl+Shift+P，打开命令板
2. 输入 pci 然后选择 Install Package
3. 搜索需要的插件名称，点击就可以自动完成安装。

## 那些插件 ##

按照我的插件安装列表的顺序

### Alignment 等号对齐 ###

按 **Ctrl+Alt+A**，可以将凌乱的代码以等号为准左右对其，网上说这个插件适合有代码洁癖的同学，好吧，我确实有代码洁癖，因为我经常使用。

![](http://bubkoo.qiniudn.com/sublime-plugin-alignment.gif)

插件下载：https://github.com/kevinsperrine/sublime_alignment/tree/python3

### BracketHighlighter 高亮显示匹配的括号、引号和标签 ###

BracketHighlighter 这个插件能在左侧高亮显示匹配的括号、引号和标签，能匹配的 [], (), {}, "", '',  <tag></tag> 等甚至是自定义的标签，当看到密密麻麻的代码分不清标签之间包容嵌套的关系时，这款插件就能很好地帮你理清楚代码结构，快速定位括号，引号和标签内的范围。

![](http://bubkoo.qiniudn.com/sublime-plugin-brackethighlighter.png)

插件下载：https://github.com/facelessuser/BracketHighlighter/tree/BH2ST3

### Emmet html/CSS快速编辑（原名Zen Coding） ###

Zen Coding估计大家都不会陌生，前不久改名为Emmet了，虽然用Emmet编辑html很快，但是要用好用快它需要付出不小的学习成本，[这里](emmet-a-toolkit-for-improving-html-css-workflow)有我的一篇学习教程，可以作为参考。

![](http://bubkoo.qiniudn.com/sublime-plugin-emmet.png)

插件下载：https://github.com/sergeche/emmet-sublime

### JsFormat JavaScript格式化 ###

按快捷键 **Ctrl+Alt+F** 即可格式化当前的 js 文件。平时书写代码用的非常多，或者下载格式化别人压缩过的代码。

插件下载：https://github.com/jdc0589/JsFormat

### SublimeTmpl 快速生成文件模板 ###
SublimeTmpl 能新建 html、css、javascript、php、python、ruby 六种类型的文件模板，所有的文件模板都在插件目录的templates文件夹里，可以自定义编辑文件模板。

SublimeTmpl默认的快捷键

- ctrl+alt+h → html
- ctrl+alt+j → javascript
- ctrl+alt+c → css
- ctrl+alt+p → php
- ctrl+alt+r → ruby
- ctrl+alt+shift+p → python

如果想要新建其他类型的文件模板的话，先自定义文件模板方在 templates 文件夹里，再分别打开 Default (Windows).sublime-keymap、Default.sublime-commands、Main.sublime-menu、SublimeTmpl.sublime-settings 这四个文件照着里面的格式自定义想要新建的类型~

插件下载：https://github.com/kairyou/SublimeTmpl

### Tag Html格式化 ###

右键菜单 Auto-Format Tags on Ducument，或者选中需要格式化的部分，使用快捷键 **Ctrl+Alt+F**。

插件下载：https://github.com/kairyou/SublimeTmpl

### TrailingSpacer 高亮显示多余的空格和 Tab ###

我有代码洁癖，我爱 TrailingSpacer，TrailingSpacer这款插件能高亮显示多余的空格和Tab，并可以一键删除它们。

![](http://bubkoo.qiniudn.com/sublime-plugin-trailingspacer.jpg)

注意，在 github 上下载的插件缺少了一个设置快捷键的文件，可以新建一个名字和后缀为 Default (Windows).sublime-keymap 的文件，添加以下代码，即可设置“删除多余空格”和“是否开启TrailingSpacer ”的快捷键。

``` javascript
[
    { "keys": ["ctrl+alt+d"], "command": "delete_trailing_spaces" },
 
    { "keys": ["ctrl+alt+o"], "command": "toggle_trailing_spaces" }
]
```

插件下载：https://github.com/SublimeText/TrailingSpaces

### CSScomb CSS属性排序 ###
CSScomb 可以按照一定的 CSS 属性排序规则，将杂乱无章的 CSS 属性进行重新排序。选中要排序的 CSS 代码，按 Ctrl+Shift+C，即可对 CSS 属性重新排序了，代码从此简洁有序易维护，如果不款选代码则插件将排序文件中所有的 CSS 属性。当然，可以自己自定义 CSS 属性排序规则，打开插件目录里的 CSScomb.sublime-settings 文件，更改里面的 CSS 属性顺序就行了。因为这个插件使用 PHP 写的，要使他工作需要在环境变量中添加 PHP 的路径，具体请看 [github](https://github.com/csscomb/CSScomb/wiki/Requirements) 上的说明。

![](http://bubkoo.qiniudn.com/sublime-plugin-csscomb.jpg)

插件下载：https://github.com/csscomb/CSScomb-for-Sublime

## 快捷键 ##
Ctrl+Shift+P：打开命令面板
Ctrl+P：搜索项目中的文件
Ctrl+G：跳转到第几行
Ctrl+W：关闭当前打开文件
Ctrl+Shift+W：关闭所有打开文件
Ctrl+Shift+V：粘贴并格式化
Ctrl+D：选择单词，重复可增加选择下一个相同的单词
Ctrl+L：选择行，重复可依次增加选择下一行
Ctrl+Shift+L：选择多行
Ctrl+Shift+Enter：在当前行前插入新行
Ctrl+X：删除当前行
Ctrl+M：跳转到对应括号
Ctrl+U：软撤销，撤销光标位置
Ctrl+J：选择标签内容
Ctrl+F：查找内容
Ctrl+Shift+F：查找并替换
Ctrl+H：替换
Ctrl+R：前往 method
Ctrl+N：新建窗口
Ctrl+K+B：开关侧栏
Ctrl+Shift+M：选中当前括号内容，重复可选着括号本身
Ctrl+F2：设置/删除标记
Ctrl+/：注释当前行
Ctrl+Shift+/：当前位置插入注释
Ctrl+Alt+/：块注释，并Focus到首行，写注释说明用的
Ctrl+Shift+A：选择当前标签前后，修改标签用的
F11：全屏
Shift+F11：全屏免打扰模式，只编辑当前文件
Alt+F3：选择所有相同的词
Alt+.：闭合标签
Alt+Shift+数字：分屏显示
Alt+数字：切换打开第N个文件
Shift+右键拖动：光标多不，用来更改或插入列内容
Ctrl+依次左键点击或选取，可需要编辑的多个位置
Ctrl+Shift+上下键：替换行

## 参考文章 ##
- [Sublime Text 3 能用支持的插件推荐](http://dengo.org/archives/923)
- [Sublime Text 3 如何安装 Package Control 办法](http://dengo.org/archives/594)
- [Sublime Text 3 介绍与常用插件推荐](http://www.opcnz.com/kai-fa-gong-ju/332.shtml)
- [Sublime Text 2 非常强大的跨平台编辑器](http://www.appinn.com/sublime-text-2/)
- [一些必不可少的 Sublime Text 2 插件](http://www.qianduan.net/essential-to-sublime-the-text-2-plugins.html)
- [Sublime Text 2 入门及技巧](http://lucifr.com/139225/sublime-text-2-tricks-and-tips/)
- [Zen Coding – 超快地写网页代码](http://www.appinn.com/zen-coding/)





[1]: http://www.sublimetext.com/