title: HTTP cookies 详解
date: 2014-04-21 15:08:49
tags: [Cookies, HTTP]
categories: []
keywords:
---
HTTP cookies，通常称之为“cookie”，已经存在很长时间了，但是仍然没有被充分理解。首要问题是存在许多误解，认为 cookie 是后门程序或病毒，却忽视了其工作原理。第二个问题是，对于 cookie 的操作缺少统一的接口。尽管存在这些问题，cookie 仍旧在 Web 开发中扮演者重要的角色，以至于如果没有出现相应的代替品就消失的话，我们许多喜欢的 Web 应用将变的不可用。

## cookie 的起源

早期的 Web 应用面临的最大问题之一就是如何维持状态。简言之，服务器无法知道两个请求是否来自于同一个浏览器。当时，最简单的办法就是在请求的页面中插入一个 token，然后在下次请求时将这个 token 返回至服务器。这需要在页面的 form 表单中插入一个包含 token 的隐藏域，或者将 token 放在 URL 的 query 字符串中来传递。这两种方法都需要手动操作，而且极易出错。

当时网景通讯的一名员工 [Lou Montulli](http://en.wikipedia.org/wiki/Lou_Montulli)，在 1994 年将 “[magic cookies](http://en.wikipedia.org/wiki/Magic_cookie)” 的概念应用到 Web 通讯中。他试图解决 Web 的第一个购物车应用，现在购物车成了购物网站的支柱。他的[原始说明文档](http://curl.haxx.se/rfc/cookie_spec.html)提供了 cookie 工作原理的基本信息，该文档后来被作为规范纳入到 [RFC 2109](http://tools.ietf.org/html/rfc2109)（大多数浏览器的实现参考文档）中，最终被纳入到 [RFC 2965](http://tools.ietf.org/html/rfc2965) 中。Montulli 也被授予 cookie 的美国[专利](http://v3.espacenet.com/publicationDetails/biblio?CC=US&NR=5774670&KC=&FT=E)。网景浏览器在它的第一个版本中就开始支持 cookie，现在所有 Web 浏览器都支持 cookie。

<!--more-->

## cookie 是什么

简单地说，cookie 就是浏览器储存在用户电脑上的一小段文本文件。cookie 是纯文本格式，不包含任何可执行的代码。一个 Web 页面或服务器告知浏览器按照一定规范来储存这些信息，并在随后的请求中将这些信息发送至服务器，Web 服务器就可以使用这些信息来识别不同的用户。大多数需要登录的网站在用户验证成功之后都会设置一个 cookie，只要这个 cookie 存在并可以，用户就可以自由浏览这个网站的任意页面。再次说明，cookie 只包含数据，就其本身而言并不有害。

## 创建 cookie

Web 服务器通过发送一个称为 `Set-Cookie` 的 HTTP 消息头来创建一个 cookie，`Set-Cookie` 消息头是一个字符串，其格式如下（中括号中的部分是可选的）：

```javascript
Set-Cookie: value[; expires=date][; domain=domain][; path=path][; secure]
```

消息头的第一部分，value 部分，通常是一个 `name=value` 格式的字符串。事实上，这种格式是原始规范中指定的格式，但是浏览器并不会对 cookie 值按照此格式来验证。实际上，你可以指定一个不含等号的字符串，它同样会被存储。然而，最常用的使用方式是按照 `name=value` 格式来指定 cookie 的值（大多数接口只支持该格式）。

当存在一个 cookie，并允许设置可选项，该 cookie 的值会在随后的每次请求中被发送至服务器，cookie 的值被存储在名为 Cookie 的 HTTP 消息头中，并且只包含了 cookie 的值，忽略全部设置选项。例如：        

```javascript
Cookie: value
```

通过 `Set-Cookie` 指定的可选项只会在浏览器端使用，而不会被发送至服务器端。发送至服务器的 cookie 的值与通过 `Set-Cookie` 指定的值完全一样，不会有进一步的解析或转码操作。如果请求中包含多个 cookie，它们将会被分号和空格分开，例如： 

```javascript
Cookie: value1; value2; name1=value1
```

服务器端框架通常包含解析 cookie 的方法，可以通过编程的方式获取 cookie 的值。

## cookie 编码

对于 cookie 的值进行编码一直都存在一些困惑。普遍认为 cookie 的值必须经过 URL 编码，但其实这是一个谬论，尽管通常都这么做。原始规范中明确指出只有三个字符必须进行编码：分号、逗号和空格，规范中还提到可以进行 URL 编码，但并不是必须，在 RFC 中没有提及任何编码。然而，几乎所有的实现都对 cookie 的值进行了一系列的 URL 编码。对于 `name=value` 格式，通常会对 `name` 和 `value` 分别进行编码，而不对等号 `=` 进行编码操作。

## 过期时间选项

紧跟 cookie 值后面的每个选项都以分号和空格分开，每个选择都指定了 cookie 在什么情况下应该被发送至服务器。第一个选项是过期时间（expires），指定了 cookie 何时不会再被发送至服务器，随后浏览器将删除该 cookie。该选项的值是一个 `Wdy, DD-Mon-YYYY HH:MM:SS GMT` 日期格式的值，例如：

```javascript
Set-Cookie: name=Nicholas; expires=Sat, 02 May 2009 23:38:25 GMT
```

没有设置 `expires` 选项时，cookie 的生命周期仅限于当前会话中，关闭浏览器意味着这次会话的结束，所以会话 cookie 仅存在于浏览器打开状态之下。这就是为什么为什么当你登录一个 Web 应用时经常会看到一个复选框，询问你是否记住登录信息：如果你勾选了复选框，那么一个 `expires` 选项会被附加到登录 cookie 中。如果 `expires` 设置了一个过去的时间点，那么这个 cookie 会被立即删掉。

## domain 选项

下一个选项是 `domain`，指定了 cookie 将要被发送至哪个或哪些域中。默认情况下，`domain` 会被设置为创建该 cookie 的页面所在的域名，所以当给相同域名发送请求时该 cookie 会被发送至服务器。例如，本博中 cookie 的默认值将是 `bubkoo.com`。`domain` 选项可用来扩充 cookie 可发送域的数量，例如：

```javascript
Set-Cookie: name=Nicholas; domain=nczonline.net
```

像 Yahoo! 这种大型网站，都会有许多 name.yahoo.com 形式的站点（例如：my.yahoo.com, finance.yahoo.com 等等）。将一个 cookie 的 `domain` 选项设置为 `yahoo.com`，就可以将该 cookie 的值发送至所有这些站点。浏览器会把 `domain` 的值与请求的域名做一个尾部比较（即从字符串的尾部开始比较），并将匹配的 cookie 发送至服务器。

`domain` 选项的值必须是发送 `Set-Cookie` 消息头的主机名的一部分，例如我不能在 google.com 上设置一个 cookie，因为这会产生安全问题。不合法的 `domain` 选择将直接被忽略。

## path 选项

另一个控制 `Cookie` 消息头发送时机的选项是 `path` 选项，和 `domain` 选项类似，`path` 选项指定了请求的资源 URL 中必须存在指定的路径时，才会发送`Cookie` 消息头。这个比较通常是将 `path` 选项的值与请求的 URL 从头开始逐字符比较完成的。如果字符匹配，则发送 `Cookie` 消息头，例如： 

```javascript
Set-Cookie:name=Nicholas;path=/blog
```

在这个例子中，`path` 选项值会与 `/blog`，`/blogrool` 等等相匹配；任何以 `/blog` 开头的选项都是合法的。需要注意的是，只有在 `domain` 选项核实完毕之后才会对 `path` 属性进行比较。`path` 属性的默认值是发送 `Set-Cookie` 消息头所对应的 URL 中的 `path` 部分。

## secure 选项

最后一个选项是 `secure`。不像其它选项，该选项只是一个标记而没有值。只有当一个请求通过 SSL 或 HTTPS 创建时，包含 `secure` 选项的 cookie 才能被发送至服务器。这种 cookie 的内容具有很高的价值，如果以纯文本形式传递很有可能被篡改，例如：

```javascript
Set-Cookie: name=Nicholas; secure
```

事实上，机密且敏感的信息绝不应该在 cookie 中存储或传输，因为 cookie 的整个机制原本都是不安全的。默认情况下，在 HTTPS 链接上传输的 cookie 都会被自动添加上 `secure` 选项。

## Cookie 的维护和生命周期
 
在一个 cookie 中可以指定任意数量的选项，并且这些选项可以是任意顺序，例如：

```javascript
Set-Cookie:name=Nicholas; domain=nczonline.net; path=/blog
```

这个 cookie 有四个标识符：cookie 的 `name`，`domain`，`path`，`secure` 标记。要想改变这个 cookie 的值，需要发送另一个具有相同 cookie `name`，`domain`，`path` 的 `Set-Cookie` 消息头。例如：

```javascript
Set-Cookie: name=Greg; domain=nczonline.net; path=/blog
```

这将覆盖原来 cookie 的值。但是，修改 cookie 选项的任意一项都将创建一个完全不同的新 cookie，例如：

```javascript
Set-Cookie: name=Nicholas; domain=nczonline.net; path=/
```

这个消息头返回之后，会同时存在两个名为 “name” 的不同的 cookie。如果你访问 `www.nczonline.net/blog` 下的一个页面，以下的消息头将被包含进来：

```javascript
Cookie: name=Greg; name=Nicholas
```

在这个消息头中存在了两个名为 “name” 的 cookie，`path` 值越详细则 cookie 越靠前。 按照 `domain-path-secure` 的顺序，设置越详细的 cookie 在字符串中越靠前。假设我在 `ww.nczonline.net/blog` 下用默认选项创建了另一个 cookie：

```javascript
Set-Cookie: name=Mike
```
那么返回的消息头现在则变为：

```javascript
Cookie: name=Mike; name=Greg; name=Nicholas
```

以 “Mike” 作为值的 cookie 使用了域名（`www.nczonline.net`）作为其 `domain` 值并且以全路径（`/blog`）作为其 `path` 值，则它较其它两个 cookie 更加详细。

## 使用失效日期

当 cookie 创建时指定了失效日期，这个失效日期则关联了以 `name-domain-path-secure` 为标识的 cookie。要改变一个 cookie 的失效日期，你必须指定同样的组合。当改变一个 cookie 的值时，你不必每次都设置失效日期，因为它不是 cookie 标识信息的组成部分。例如：

```javascript
Set-Cookie:name=Mike;expires=Sat,03 May 2025 17:44:22 GMT
```

现在已经设置了 cookie 的失效日期，所以下次我想要改变 cookie 的值时，我只需要使用它的名字：

```javascript
Set-Cookie:name=Matt
```

cookie 的失效日期并没有改变，因为 cookie 的标识符是相同的。实际上，只有你手工的改变 cookie 的失效日期，否则其失效日期不会改变。这意味着在同一个会话中，一个会话 cookie 可以变成一个持久化 cookie（一个可以在多个会话中存在的），反之则不可。为了要将一个持久化 cookie 变为一个会话 cookie，你必须删除这个持久化 cookie，这只要设置它的失效日期为过去某个时间之后再创建一个同名的会话 cookie 就可以实现。

需要记得的是失效日期是以浏览器运行的电脑上的系统时间为基准进行核实的。没有任何办法来来验证这个系统时间是否和服务器的时间同步，所以当服务器时间和浏览器所处系统时间存在差异时这样的设置会出现错误。

## cookie 自动删除

cookie 会被浏览器自动删除，通常存在以下几种原因：

- 会话 cooke (Session cookie) 在会话结束时（浏览器关闭）会被删除
- 持久化 cookie（Persistent cookie）在到达失效日期时会被删除
- 如果浏览器中的 cookie 数量达到限制，那么 cookie 会被删除以为新建的 cookie 创建空间。详见我的另外一篇关于 [cookies restrictions](http://www.nczonline.net/blog/2008/05/17/browser-cookie-restrictions/) 的博客

对于自动删除来说，Cookie 管理显得十分重要，因为这些删除都是无意识的。

## Cookie 限制条件

cookie 存在许多限制条件，来阻止 cookie 滥用并保护浏览器和服务器免受一些负面影响。有两种 cookie 限制条件：cookie 的属性和 cookie 的总大小。原始规范中限定每个域名下不超过 20 个 cookie，早期的浏览器都遵循该规范，并且在 IE7 中有更近一步的提升。在微软的一次更新中，他们在 IE7 中增加 cookie 的限制数量到 50 个，与此同时 Opera 限定 cookie 数量为 30 个，Safari 和 Chrome 对与每个域名下的 cookie 个数没有限制。

发向服务器的所有 cookie 的最大数量（空间）仍旧维持原始规范中所指出的：4KB。所有超出该限制的 cookie 都会被截掉并且不会发送至服务器。

## Subcookies

鉴于 cookie 的数量存在限制，开发者提出 subcookies 的观点来增加 cookie 的存储量。Subcookies 是存储在一个 cookie 值中的一些 `name-value` 对，通常与以下格式类似：

```javascript
name=a=b&c=d&e=f&g=h
```

这种方式允许在单个 cookie 中保存多个 `name-value` 对，而不会超出浏览器 cookie 数量的限制。通过这种方式创建 cookie 的负面影响是，需要自定义解析方式来提取这些值，相比较而言 cookie 的格式会更为简单。服务器端框架已开始支持 subcookies 的存储。我编写的 [YUI Cookie utility](http://developer.yahoo.com/yui/cookie/)，支持在 javascript 中读/写 subcookies

## JavaScript 中的 cookie

在 JavaScript 中通过 `document.cookie` 属性，你可以创建、维护和删除 cookie。创建 cookie 时该属性等同于 `Set-Cookie` 消息头，而在读取 cookie 时则等同于 `Cookie` 消息头。在创建一个 cookie 时，你需要使用和 `Set-Cookie` 期望格式相同的字符串：

```javascript
document.cookie="name=Nicholas;domain=nczonline.net;path=/";
```

设置 `document.cookie` 属性的值并不会删除存储在页面中的所有 cookie。它只简单的创建或修改字符串中指定的 cookie。下次发送一个请求到服务器时，通过 `document.cookie` 设置的 cookie 会和其它通过 `Set-Cookie` 消息头设置的 cookie 一并发送至服务器。这些 cookie 并没有什么明确的不同之处。

要使用 JavaScript 提取 cookie 的值，只需要从 `document.cookie` 中读取即可。返回的字符串与 `Cookie` 消息头中的字符串格式相同，所以多个 cookie 会被分号和字符串分割。例如：

```javascript
name1=Greg; name2=Nicholas
```

鉴于此，你需要手工解析这个 cookie 字符串来提取真实的 cookie 数据。当前已有许多描述如何利用 JavaScript 来解析 cookie 的资料，包括我的书，[Professional JavaScript](http://www.amazon.com/gp/product/047022780X?ie=UTF8&tag=nczonline-20&linkCode=as2&camp=1789&creative=390957&creativeASIN=047022780X)，所以在这我就不再说明。通常利用已存在的 JavaScript 库操作 cookie 会更简单，如使用 [YUI Cookie utility](http://developer.yahoo.com/yui/cookie/) 来处理 cookie，而不要手工重新创建这些算法。

通过访问 `document.cookie` 返回的 cookie 遵循发向服务器的 cookie 一样的访问规则。要通过 JavaScript 访问 cookie，该页面和 cookie 必须在相同的域中，有相同的 `path`，有相同的安全级别。

注意：一旦 cookie 通过 JavaScript 设置后便不能提取它的选项，所以你将不能知道 `domain`，`path`，`expires` 日期或 `secure` 标记。

## HTTP-Only cookies

微软的 IE6 SP1 在 cookie 中引入了一个新的选项：`HTTP-only`，`HTTP-Only` 背后的意思是告之浏览器该 cookie 绝不能通过 JavaScript 的 `document.cookie` 属性访问。设计该特征意在提供一个安全措施来帮助阻止通过 JavaScript 发起的跨站脚本攻击 (XSS) 窃取 cookie 的行为（我会在另一篇博客中讨论安全问题，本篇如此已足够）。今天 Firefox2.0.0.5+、Opera9.5+、Chrome 都支持 HTTP-Only cookie。3.2 版本的 Safari 仍不支持。

要创建一个 HTTP-Only cookie，只要向你的 cookie 中添加一个 `HTTP-Only` 标记即可：

```javascript
Set-Cookie: name=Nicholas; HttpOnly
```

一旦设定这个标记，通过 `documen.coookie` 则不能再访问该 cookie。IE 同时更近一步并且不允许通过 `XMLHttpRequest` 的 `getAllResponseHeaders()` 或 `getResponseHeader()` 方法访问 cookie，然而其它浏览器则允许此行为。Firefox 在 3.0.6 中[修复了该漏洞](http://www.mozilla.org/security/announce/2009/mfsa2009-05.html)，然而仍旧有许多[浏览器漏洞](http://manicode.blogspot.com/2009/01/browser-httponly-support-update.html)存在，[complete browser support list](https://www.owasp.org/index.php/HTTPOnly#Browsers_Supporting_HTTPOnly) 列出了这些。

你不能通过 JavaScript 设置 `HTTP-only`，因为你不能再通过 JavaScript 读取这些 cookie，这是情理之中的事情。

## 总结

为了高效的利用 cookie，仍旧有许多要了解和弄明白的东西。对于一项创建于十多年前但仍旧如最初实现的那样被使用至今的技术来说，这是件多不可思议的事。本篇只是提供了一些每个人都应该知道的关于浏览器 cookie 的基本指导，但无论如何，也不是一个完整的参考。对于今天的 Web 来说 cookie 仍旧起着非常重要的作用，并且不恰当的管理 cookie 会导致各种各样的问题，从最糟糕的用户体验到安全漏洞。我希望这篇手册能够激起一些关于 cookie 的不可思议的亮点。




<p class="j-quote">原文：[HTTP cookies explained](http://www.nczonline.net/blog/2009/05/05/http-cookies-explained/)</p>
