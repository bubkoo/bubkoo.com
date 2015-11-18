title: Prefetching、Preloading 和 Prebrowsing
tags:
  - performance
  - prefetching
  - preloading
  - prebrowsing
categories:
  - CSS
photos:
  - some photos
date: 2015-11-19 00:29:36
updated: 2015-11-19 00:29:36
keywords:
---

当提到前端性能时，我们首先会联想到文件的合并、压缩，文件缓存和开启服务器端的 gzip 压缩等，这使得页面加载更快，用户可以尽快使用我们的 Web 应用来达到他们的目标。

资源预获取是另一个性能优化技术，我们可以使用该技术来预先告知浏览器某些资源可能在将来会被使用到。

引用 [Patrick Hamann](https://twitter.com/patrickhamann) 的[解释](http://patrickhamann.com/workshops/performance/tasks/2_Critical_Path/2_3.html)：

> 预获取是浏览器对将来可能被使用资源的一种暗示，一些资源可以在当前页面使用到，一些可能在将来的某些页面中被使用。作为开发人员，我们比浏览器更加了解我们的应用，所以我们可以对我们的核心资源使用该技术。

这种做法曾经被称为 *prebrowsing*，但这并不是一项单一的技术，可以细分为几个不同的技术：`dns-prefetch`、`subresource` 和标准的 `prefetch`、`preconnect`、`prerender`。

<!--more-->

## DNS 预解析 DNS-Prefetch

通过 DNS 预解析来告诉浏览器未来我们可能从某个特定的 URL 获取资源，当浏览器真正使用到该域中的某个资源时就可以尽快地完成 DNS 解析。例如，我们将来可能从 `example.com` 获取图片或音频资源，那么可以在文档顶部的 `<head>` 标签中加入以下内容：

```html
<link rel="dns-prefetch" href="//example.com">
```

当我们从该 URL 请求一个资源时，就不再需要等待 DNS 的解析过程。该技术对使用第三方资源特别有用。

在 Harry Roberts 的[文章](http://csswizardry.com/2013/01/front-end-performance-for-web-designers-and-front-end-developers/#section:dns-prefetching)中提到：

> 通过简单的一行代码就可以告知那些兼容的浏览器进行 DNS 预解析，这意味着当浏览器真正请求该域中的某个资源时，DNS 的解析就已经完成了。

这似乎是一个非常微小的性能优化，显得也并非那么重要，但事实并非如此 -- [Chrome 一直都做了类似的优化](https://docs.google.com/presentation/d/18zlAdKAxnc51y_kj-6sWLmnjl6TLnaru_WH0LJTjP-o/present?slide=id.g120f70e9a_041)。当在浏览器的地址栏中输入 URL 的一小段时，Chrome 就自动完成了 DNS 预解析（甚至页面预渲染），从而为每个请求节省了至关重要的时间。


## 预连接 Preconnect

与 DNS 预解析类似，`preconnect` 不仅完成 DNS 预解析，同时还将进行 TCP 握手和建立传输层协议。可以这样使用：

```html
<link rel="preconnect" href="http://example.com">
```

在 Ilya Grigorik 的[文章](https://www.igvita.com/2015/08/17/eliminating-roundtrips-with-preconnect/)中有更详细的介绍：

> 现代浏览器都试着预测网站将来需要哪些连接，然后预先建立 socket 连接，从而消除昂贵的 DNS 查找、TCP 握手和 TLS 往返开销。然而，浏览器还不够聪明，并不能准确预测每个网站的所有预链接目标。好在，在 Firefox 39 和 Chrome 46 中我们可以使用 `preconnect` 告诉浏览器我们需要进行哪些预连接。

## 预获取 Prefetching

如果我们确定某个资源将来一定会被使用到，我们可以让浏览器预先请求该资源并放入浏览器缓存中。例如，一个图片和脚本或任何可以被浏览器缓存的资源：

```html
<link rel="prefetch" href="image.png">
```

与 DNS 预解析不同，预获取真正请求并下载了资源，并储存在缓存中。但预获取还依赖于一些条件，某些预获取可能会被浏览器忽略，例如从一个非常缓慢的网络中获取一个庞大的字体文件。并且，Firefox 只会在[浏览器闲置](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ)时进行资源预获取。

在 Bram Stein 的[帖子](http://www.bramstein.com/writing/preload-hints-for-web-fonts.html)中说到，这对 webfonts 性能提升非常明显。目前，字体文件必须等到 DOM 和 CSS 构建完成之后才开始下载，使用预获取就可以轻松绕过该瓶颈。

**注意：**要测试资源的预获取有点困难，但在 Chrome 和 Firefox 的网络面板中都有资源预获取的记录。还需要记住，预获取的资源没有同源策略的限制。

## Subresources

这是另一个预获取方式，这种方式指定的预获取资源具有最高的优先级，在所有 `prefetch` 项之前进行：

```html
<link rel="subresource" href="styles.css">
```

根据 [Chrome 文档](https://www.chromium.org/spdy/link-headers-and-server-hint/link-rel-subresource)：

> `rel=prefetch` 为将来的页面提供了一种低优先级的资源预加载方式，而 `rel=subresource` 为当前页面提供了一种高优先级的资源预加载。

所以，如果资源是当前页面必须的，或者资源需要尽快可用，那么最好使用 `subresource` 而不是 `prefetch`。


## 预渲染 Prerender

这是一个核武器，因为 `prerender` 可以预先加载文档的所有资源：

```html
<link rel="prerender" href="http://example.com">
```
Steve Souders 在他的[一篇文章](http://www.stevesouders.com/blog/2013/11/07/prebrowsing/)中写到：

> 这类似于在一个隐藏的 tab 页中打开了某个链接 -- 将下载所有资源、创建 DOM 结构、完成页面布局、应用 CSS 样式和执行 JavaScript 脚本等。当用户真正访问该链接时，隐藏的页面就切换为可见，使页面看起来就是瞬间加载完成一样。Google 搜索在其即时搜索页面中已经应用该技术多年了，微软也宣称将在 IE11 中支持该特性。

需要注意的是不要滥用该特性，当你知道用户一定会点击某个链接时才可以进行预渲染，否则浏览器将无条件地下载所有预渲染需要的资源。

更多相关讨论：

> 所有预加载技术都存在一个潜在的风险：对资源预测错误，而预加载的开销（抢占 CPU 资源，消耗电池，浪费带宽等）是高昂的，所以必须谨慎行事。虽然很难确定用户下一步将访问哪些资源，但高可信的场景确实存在：
- 如果用户完成一个带有明显结果的搜索，那么结果页面很可能会被加载
- 如果用户进入到登陆页面，那么登陆成功的页面很可能会被加载
- 如果用户阅读一个多页的文章或访问一个分页的结果集，那么下一页很可能会被加载

最后，使用 [Page Visibility API](http://www.w3.org/TR/page-visibility/) 可以防止页面真正可见前被执行。


## Preload

`preload` 是一个新规范，与 `prefetch` 不同（可能被忽略）的是，浏览器一定会预加载该资源：

```html
<link rel="preload" href="image.png">☄
```

虽然该规范还没有被所有浏览器兼容，但其背后的思想还是非常有意思的。

## 总结

预测用户下一步将访问哪些资源是困难的，需要进行大量的测试，但是这带来的性能提升是明显的。如果我们愿意尝试这些预获取技术，一定会显著提升用户的体验。

## 深入阅读

- [Slides from a talk by Ilya Grigorik called Preconnect, prerender, prefetch](https://docs.google.com/presentation/d/18zlAdKAxnc51y_kj-6sWLmnjl6TLnaru_WH0LJTjP-o/present?slide=id.p19)
- [MDN link prefetching FAQ](https://developer.mozilla.org/en-US/docs/Web/HTTP/Link_prefetching_FAQ)
- [W3C preload spec](https://w3c.github.io/preload/)
- [Harry Roberts on DNS prefetching](http://csswizardry.com/2013/01/front-end-performance-for-web-designers-and-front-end-developers/#section:dns-prefetching)
- [HTML5 prefetch](https://medium.com/@luisvieira_gmr/html5-prefetch-1e54f6dda15d)
- [Preload hints for webfonts](http://www.bramstein.com/writing/preload-hints-for-web-fonts.html)

<p class="j-quote">原文：[Prefetching, preloading, prebrowsing](https://css-tricks.com/prefetching-preloading-prebrowsing)</p>