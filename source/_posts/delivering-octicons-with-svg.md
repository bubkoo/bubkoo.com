title: 使用 SVG 输出 Octicon
tags:
  - SVG
categories:
  - HTML
photos:
  - http://bubkoo.qiniudn.com/images/80-mini-icons-psd-icon-font.jpg
date: 2016-03-26 00:08:32
updated: 2016-03-26 00:08:32
keywords:
---

[GitHub](github.com) 不再使用字体来输出图标了。我们把代码中所有的 [Octicon](http://octicons.github.com/) 替换成了 SVG 版本。虽然这些改动并不那么明显，但马上你就能体会到 SVG 图标的优点。

![左侧放大后的字体版本和右侧清晰的 SVG 版本](http://bubkoo.qiniudn.com/images/svg-vs-iconfont.png)

切换到 SVG 以后，图标会作为图片渲染而非文字，这使其在任何分辨率下都能很好地以各种像素值显示。

<!--more-->

## 为何使用 SVG？

### 图标字体渲染问题

图标字体从一开始就是一种 Hack。将图标作为 Unicode 符号生成一个自定义字体，并通过打包后的 CSS 来引入图标，这样只需要在任意元素上添加一个 class，图标就可以显示出来，然后我们通过 CSS 就能即时改变图标的尺寸和颜色。

然而，虽然这些图标是矢量图形，但在 `1x` 显示屏下的渲染效果并不理想。在基于 WebKit 的浏览器下，图标可能会在某些窗口宽度下变得模糊，因为此时图标是作为文本输出的，本来用于提高文本可读性的次像素渲染技术反而使图标看起来糟糕许多。

### 对页面渲染的改进

因为我们直接将 SVG 注入 HTML（这也是我们选择这种方式的主要原因），所以不会再出现图标字体下载 -> 缓存 -> 渲染过程中出现的样式闪动问题。

![页面闪动](http://bubkoo.qiniudn.com/images/iconfont-flash.gif)

### 可访问性

就像在[《图标字体已死》](https://speakerdeck.com/ninjanails/death-to-icon-fonts)一文中所述，有些用户会选择覆盖掉 GitHub 的字体，而对于患有读写障碍的用户，某些特定字体却是更加容易阅读。对于选择修改字体的用户来说，基于字体的图标就被渲染成了空白方框，这搞乱了页面布局，而且也不提供任何信息。而不管字体覆盖与否，SVG 都可以正常显示，并且对于读屏器用户来说，可以选择是否读出 SVG 的 `alt` 属性。

### 图形尺寸更合适

我们目前对每个图标在所有尺寸下提供对应的图形。因为站点的加载依赖了图标字体的下载，我们曾被迫把图标限制在最重要的 `16px` 尺寸下，这使每个符号在视觉上做出一些让步，当在新页面上缩放这些图标时，显示的还是 `16px` 版本。而 SVG 可以方便地 fork 全部的图标集，在指定的每个尺寸提供更合适的图形。当然图标字体也可以这么做，但这样用户需要下载两倍数据量，甚至更多。

### 便于维护

打包自定义字体相当繁琐。一些 Web 应用也因此而生，我们内部也搞了一个。而使用 SVG 的话，添加一个新图标只需要将 SVG 文件放入相应的目录即可。


### 可添加动画效果

动画并非必要，但使用 SVG 就有了添加动画的可能性，而且 SVG 动画也的确在某些地方有实际应用，例如这个[预加载动画](http://codepen.io/aaronshekey/pen/wMZBgK)。

## 实现方案

### 我们的方案

Octicon 在整个 GitHub 的代码中出现了约 `2500` 次。在用 SVG 之前，我们使用 `<span class="octicon octicon-alert"></span>` 这种简单的标签来引入。要切换到 SVG，我们添加了一个往 HTML 内直接注入 SVG 路径的辅助方法：

```
<%= octicon(:symbol => "plus") %>
```

输出：

```html
<svg aria-hidden="true" class="octicon octicon-plus" width="12" height="16" role="img" version="1.1" viewBox="0 0 12 16">
    <path d="M12 9H7v5H5V9H0V7h5V2h2v5h5v2z"></path>
</svg>
```

就如上面那样，我们最终的方案是往页面 HTML 中直接注入 SVG，这样就可以灵活通过 CSS 的 `fill:` 属性来调整修改图标的颜色。


我们将所有的 SVG 图形放在一个的目录而不是一个图标字体中，然后将里面这些图形的路径通过辅助方法直接注入到 HTML 里。比如，通过 `<%= octicon(:symbol => "alert") %>` 就可以得到一个警告图标。

我们也尝试了如下好几种在页面中添加 SVG 图标的方法，但有些由于受到 GitHub 生产环境的限制而失败了。

1. 最开始我们尝试提供一个单一的“SVG 仓库”，然后用 `<use>` 元素来引入 SVG 拼图中的单个图形。在我们当前的跨域安全策略和资源管道条件下，使用外部提供 SVG 拼图很难做到。
2. SVG 背景，这种方式无法实时调整图标的颜色。
3. 用 `<img>` 的 `src` 属性来引入 SVG，这种方式无法实时调整图标的颜色。
4. 将“SVG 仓库”整个嵌入到每个页面，然后使用 `<use>` 把每个 SVG 都嵌入到整个 GitHub 的每个单页，但是想想就不对，特别是有时候这个页面一个图标都没用到。

### 性能

在切换到 SVG 以后，我们还没发现[页面加载和性能](https://cloud.githubusercontent.com/assets/54012/13176951/eedb1330-d6e3-11e5-8dfb-99932ff7ee25.png)上有任何不良影响。我们之前曾预计渲染时间会大幅下降，但往往性能和人的感知更相关。由于 SVG 图标被渲染为了指定宽高的图像，页面也不再会像之前那样[闪动](http://jankfree.org/)了。

同时由于我们不再输出字体相关的 CSS，我们还能[干掉一些多余的 CSS 代码](https://cloud.githubusercontent.com/assets/54012/13176888/70d42346-d6e3-11e5-88eb-0ca0a393392c.png)。

### 缺点和坑

- Firefox 对 SVG 仍然有像素值计算的问题，虽然图标字体也有相同的问题。
- 如果你需要 SVG 有背景色，你可能需要在外面包一层额外的 `div`。
- 由于 SVG 是作为图片提供的，某些 CSS 的覆盖问题也需要重新考量。如果你看到我们的页面布局有任何奇怪的地方，请告知。
- IE 浏览器下，需要对 SVG 元素指定宽高属性，才能正常显示大小。
- 在技术方案升级过程中，我们层同时输出 SVG 和图标字体。在我们仍然为每个 SVG 图标指定 `font-family` 时会导致 IE 崩溃。在完全转用 SVG 以后，这个问题就解决了。


## 总结

通过换掉图标字体，我们能更方便、更快速、更有可访问性地提供图标了。而且它们看起来也更棒了。享受吧。

[完]

<p class="j-quote">原文：[Delivering Octicons with SVG](https://github.com/blog/2112-delivering-octicons-with-svg)</p>

## 更多阅读

- [Death to Icon Fonts](https://speakerdeck.com/ninjanails/death-to-icon-fonts)
- [Inline SVG Icons](https://kartikprabhu.com/articles/inline-svg-icons)
- [Inline SVG vs Icon Fonts](https://css-tricks.com/icon-fonts-vs-svg/)
- [Web 设计新趋势: 使用 SVG 代替 Web Icon Font](http://www.w3cways.com/1733.html)