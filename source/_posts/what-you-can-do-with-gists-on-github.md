title: 任何人都可以使用到的 Gist 服务
tags:
  - Gist
  - Github
categories:
  - Tools
photos:
  - http://bubkoo.qiniudn.com/images/what-you-can-do-with-gists-on-github.jpeg
date: 2016-02-24 10:22:25
updated: 2016-02-24 10:22:25
keywords: Gist Github
---

[Github](https://github.com/) 作为代码分享平台在开发者中非常流行。此平台托管了包括游戏、书籍以至于字体在内的一千两百多万个开源项目（现在更多），这使其成为互联网上最大的代码库。Github 还提供另一个非常有用的功能，这就是 [Gist](https://gist.github.com/)。开发人员常常使用 Gist 记录他们的代码片段，但是 Gist 不仅仅是为极客和码农开发的，每个人都可以用到它。如果您听说过类似 Pastebin 或 Pastie 这样的 Web 应用的话，那您就可以看到它们和 Gist 很像，但是 Gist 比它们要更优雅，因为这些免费应用一般含有广告，而且带有很多其他杂七杂八的功能。

如果您不是极客您也可以按照如下方式使用Gist：

<!--more-->

## 匿名张贴

您不需要拥有 Github 账号就可以使用 Gist。用浏览器打开 [http://gist.github.com](http://gist.github.com)，在窗口中写下你想说的就可以创建一个 Gist。您可以发布一个私密的 Gist，也就是说这个 Gist 将不能被他人搜索到而只对直接在浏览器中输入其 URL 的人可见。

## 像 Wiki 一样记录历史

如果您修改了已经发布了的 Gist 的话，之前的所有版本都将被保存。您可以点击 Revisions 按钮按时间浏览，而且您可以通过内置的 diff 引擎查看任意两个版本间的差异。这也可以用于[比较文本文件](http://www.labnol.org/internet/tools/google-docs-free-online-file-comparison-software/2414/)。

![](http://bubkoo.qiniudn.com/images/file-difference.png)

## 发布富文本内容

虽然 Gist 只能用纯文本来写，但是您可以用 [Markdown](https://help.github.com/articles/markdown-basics) 来发布 html 格式的 Gist。您可以添加列表、图片（已有图床上的）和[表格](http://www.labnol.org/software/embed-tables-spreadsheet-data-in-websites/7435/)。当您用 Markdown 的时候不要忘了文件名要以 `.md` 作为后缀名。

![](http://bubkoo.qiniudn.com/images/markdown-gist.png)

## 把 Gist 当作一个写作平台

虽然现在有很多写作引擎，比如 Blogger、Medium、Tumblr，但您还可以用 Gist 来快速发布您的作品。您可以用纯文本或者 Markdown 等文档标记语言些一个 Gist 然后用 [http://roughdraft.io](http://roughdraft.io) 来把它作为一个独立的网页发布。

## 托管单个页面

Bl.ocks 是一个非常有趣的专为 Gist 开发的应用。您可以用纯文本把 HTML、CSS、JavaScript 代码写下来以 index.html 为文件名保存为 Gist，然后用 [http://bl.ocks.org](http://bl.ocks.org/) 把渲染好的结果在浏览器中展示出来。比如，这个 [gist](https://gist.github.com/labnol/122d4de95c6a127b1c9b) 展示出来就是[这样](http://bl.ocks.org/labnol/raw/122d4de95c6a127b1c9b/)。

显然宽带限制是一个问题，但是 [http://bl.ock.org](http://bl.ock.org) 作为一个通过 Gist 托管 HTML 的工具仍然是相当不错的。当然您也可以用 [Google Drive](http://www.labnol.org/internet/host-website-on-google-drive/28178/)。

## 制作任务列表

您可以用 Gist 跟踪待处理任务（举个[栗子](https://gist.github.com/labnol/8e1cdf64cd7b0c1a811e)）。这是用[特殊的](https://github.com/blog/1375%0A-task-lists-in-gfm-issues-pulls-comments)纯文本语法写的但是你可以任意勾选。

```md
- [x] Pick the flowers
- [ ] Call John 9303032332
- [x] Cancel cable subscription
- [ ] Book the flight tickets  
```

您可以勾选或者勾去任意选项，源文本将会自动变更。如果您的 Gist 是公有的的话，任何人都可以看到您的列表，但是只有您（拥有者）可以改变其勾选状态。注意：任务列表也可以在 issue 中建立，所有拥有写权限的人都可以 uncheck/check。

## 作为网页收藏夹

在 Chrome 浏览器您可以找到一个叫 [GistBox](https://chrome.google.com/webstore/detail/cejmhmbmafamjegaebkjhnckhepgmido) 的插件，通过这个插件您可以在浏览网页时选择保存网页内容为 Gist。您甚至可以添加标注或标签以易于以后更容易找到它们。

## 把 Gist 嵌入网页中

用一行 JS 代码就可以把任何一条 Gist 嵌入到网页中。嵌入的 Gist 格式不发生任何变化，而且访问者可以非常方便的把它们 fork 到他们的 Github 中。要嵌入 WordPress 的话有这个[插件](http://wordpress.org/plugins/oembed-gist/)和这个[短代码](http://en.support.wordpress.com/gist/)可以使用。

```html
<script src="https://gist.github.com/username/gist-id.js"></script>
```

## 测量访问量

您可以使用 Google Analytics 查看您的 Gist 的访问量。因为 Gist 纯文本中不允许运行 JS 代码，所以我们可以用 [GA Beacon](https://github.com/igrigorik/ga-beacon) 来记录实时访问 Gist 的情况。

把如下代码添加到 Gist 中，用 Markdown 格式保存，这样就在这个 Gist 中添加了一个透明追踪图像了。

```md
![Analytics](https://ga-beacon.appspot.com/UA-XXXXX-X/gist-id?pixel)  
```

## 在桌面端管理Gist
 
[Gisto](http://www.gistoapp.com/) 是一个能让您在浏览器之外管理 Gist 的桌面应用。您可以对 Gist 进行搜索、编辑、查看历史和分享。 此应用可运行于苹果、微软和 linux 系统。当然您也可以用 [GistBox](http://www.gistboxapp.com/) 这个 Web 应用替代它。

您是不是对Gist有了一个全新的认识呢？

<p class="j-quote">翻译来源：[Github Gist Tutorial](http://www.labnol.org/internet/github-gist-tutorial/28499/)</p>