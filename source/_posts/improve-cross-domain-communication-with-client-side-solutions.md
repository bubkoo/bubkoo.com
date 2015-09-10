title: 前端跨域通信解决方案
date: 2014-04-22 17:45:48
tags: [Cross Domain]
categories: [JavaScript]
keywords:
---

此类文章在社区中一抓一大把，但为什么还要来翻译这篇文章呢？最主要的原因是本章的配图太好了，一看就懂，扯远了。。

原文：[Improve cross-domain communication with client-side solutions](http://www.ibm.com/developerworks/library/wa-crossdomaincomm/)

## 介绍

越来越多的网站需要相互协作。例如，一个在线房屋租赁网站需要谷歌地图的支持，以显示某个出租屋的位置。为了满足这种需求，出现了各种各样的聚合应用（mashup）。聚合应用是一种将来自不同供应商的数据或组件整合在一起，使其更有价值或更加可定制化的 Web 应用。聚合应用或协作能力，被认为是 Web 2.0 的一个重要组成部分

但是，要将异步 AJAX 和聚合应用结合在一起并不是那么容易，由于浏览器的安全限制，页面上不同组件之间的通信也难以做到。传统的解决方案是，在服务器上设置一个代理，但这种方式的伸缩性不大。在本文中，你可以了解到一些客户端的跨域通信和数据传输的解决方案。

## 安全限制

同源策略（SOP）将阻止从一个源加载的脚本去操作另一个源的数据或方法，*同源*要求脚本的域名、协议和端口都相同，你可能会误解同源策略，它不仅仅意味着站点 A 不允许从站点 B 获取信息，你需要知道在同源策略下能做什么和不能做什么。

## 同源策略的限制

例如，A 源中的页面可以：

- 从 B 源获取脚本、样式和图片文件
- 使用 `iframe/frame` 嵌入指向 B 源的页面
- 通过 HTML 元素（如 `iframe` 或 `img`）的 `src` 属性，向 B 源发送信息

A 源中的页面不能：

- 向 B 源发送 AJAX 请求
- 读取或操作通过 `iframe/frame` 嵌入的 B 源页面的内容

为什么会这样？主要是为了保护用户的重要信息。假设，一个用户正在访问某个网站，他不希望提交到该网站的任何信息被泄露给其他网站。这种限制限制了网站之间的合作，但可以保护用户免受潜在的恶意攻击。

接下来的章节将讨论跨域通信和数据传输的客户端解决方案。每一种解决方案都有优缺点，应用场景在很大程度上影响你的选择。
<!--more-->

## 子域名跨域解决方案 Cross-subdomain solution

如果 A 源和 B 源具有相同的父域名，通过设置 `document.domain` 属性，就很容易使其相互通信。在 HTML 规范中 `document.domain` 是一个只读属性，现代浏览器允许将其设置为父域名（不是顶级域名）。例如，一个 URL 是 `www.myapp.com/index.html` 的页面，可以设置为 `myapp.com`，而另一个来自 `sample.myapp.com/index2.html` 的页面也可以设置为 `myapp.com`，图 1 展示了 `document.domain` 的工作原理：

![图 1. document.domain](http://bubkoo.qiniudn.com/cross-subdomain-solution.gif)

通过将不同子域名的 `document.domain` 属性设置为相同的父域名，来实现不同子域名之间的跨域通信，这并不属于同源策略限制的范畴。但是，严格来说，子域名跨域的解决方案最适用于内部应用之间的跨域通信。

## URL.hash 解决方案

一个 URL 由几部分组成，如图 2 所示：

![图 2. Components of a URL](http://bubkoo.qiniudn.com/components-of-a-URL.gif)

一般来说，URL 的任何改变都重新会加载一个新的网页，除了 `hash` 的变化，`hash` 的任何改变都不会导致页面刷新。`hash` 已经被广泛使用在支持局部刷新的 Web 2.0 单页应用中，用来记录用户的访问路径。在跨域解决方案中，`hash` 也非常有用，来自不同源的页面可以相互设置对方的 URL，包括 `hash` 值，但仍被限制获取对方的 `hash` 值。文档之间可以通过 `hash` 来相互通信。如图 3 中的例子：

![图 3. Communication using URL.hash(fragment id)](http://bubkoo.qiniudn.com/communication-using-URL.hash.gif)

在图 3 中，如果 A 想给 B 发送消息，可以通过修改 B 的 `hash` 值，代码如下：

```javascript 通过 url.hash 发送消息
function sendMsg(originURL, msg){
	var data = {from:originURL, msg:msg};
	var src = originURL + “#” + dojo.toJson(data);
	document.getElementById('domainB').src=src;
}
```

B 页面将轮询自身的 `hash` 值，获取到 A 页面发出的消息。B 也可以用同样的方式回复 A，如果 A 也希望能接受到 B 的消息，也需要轮询自身的 `hash` 值。

```javascript 轮询 url.hash 并从其中获取信息
window.oldHash="";
checkMessage = function(){
	var newHash = window.location.hash;
	if(newHash.length > 1){
		newHash = newHash.substring(1,newHash.length);
		if(newHash != oldHash){
 		oldHash = newHash;
 		var msgs = dojo.fromJson(newHash);
 		var origin = msgs.from;
 		var msg = msgs.msg;
 			 sendMessage(origin, "Hello document A");
 		 }
 	}
}
window.setInterval(checkMessage, 1000);
sendMessage = function(target, msg){
	var hash = "msg="+ msg;
	parent.location.href= target + “#” + hash;
}
```

和 JSONP 一样，这种方式发送的消息有长度限制，但它可以更好地处理错误。一些特殊的字符，如问号(?)，是 URL 的保留字符，应该先进行编码：

```javascript
function sendMsg(originURL, msg){
	…
	var src = originURL + “#” + encodeURI (dojo.toJson(data));
	…
}
```

同时，接受到消息时，需要进行解密操作：

```javascript
function checkMsg(){
	…
	var msgs = decodeURI(dojo.fromJson(newHash)); 
	…
}
```

### Cross-fragment 技术

由于许多网站的 `hash` 已经被用于其他用途，对于这样的网站用 `hash` 跨域将非常复杂（需要从 `hash` 中合并和分离出消息）。图 4 是 cross-fragment 的原理：

![图 4. Cross-fragment technique](http://bubkoo.qiniudn.com/cross-fragment-technique.gif)

当 A 想与 `iframe` 中的 B 通信，它首先将在 A 页面中新创建一个 `iframe`，这个 `iframe` 指向一个与 B 同域名的“代理”页面 C，C 页面的 URL 将包含将要发送的数据和 B 所在 `iframe` 的 ID。


```javascript
function sendMsg(msg){
   var frame = document.createElement(“iframe”);
   var baseProxy = “http://www.otherapp.com/proxy.html”;
   var request = {frameName:’otherApp’,data:msg};
   frame.src = baseProxy+”#”+encodeURI (dojo.toJson(request));
   frame.style.display=”none”;
   document.body.appendChild(frame);
}
```

当 C 加载完成后，它将获取到 A 发送的消息，然后调用 B 页面中对应的方法，由于 B 和 C 是相同域名，通过获取到对方的 window对象，他们可以直接调用对方的方法。这样，A 就成功将消息发送至 B，B 也可以以同样的方式回复。

```javascript
window.onLoad = function(){
     var hash = window.location.hash;
     if(hash && hash.length>1){
          var request = hash.substring(1,hash.length);
          var obj = dojo.fromJson(decodeURI (request));
          var data = obj.data;
          //process data
          parent.frames[obj.frameName].getData(…);// getData in a function defined in B
     }
}
```

### 实施 OpenAjax

OpenAjax 提供管理中心模块，以支持基于文档 ID 的跨域通信解决方案，管理中心模块包括管理端和客户端，管理中心包含一个消息中心来储存消息。如果一个组件想要与其他组件通信，首先需要创建一个通信客户端，并相应创建一个与之相连的 `iframe` 容器。容器将代表客户端与管理中心通信。客户端用发布/订阅的机制来发送和接受消息。OpenAjax 的工作流程如图 5 所示。

![图 5. Main workflow for OpenAjax](http://bubkoo.qiniudn.com/main-workflow-for-OpenAjax.gif)

## Window.name 解决方案

`Window.name` 跨域是一个巧妙的解决方案，一般情况下，我们使用 `Window.name` 的情况如下：

- 使用window.frames[windowName]得到一个子窗口
- 将其设置为链接元素的target属性

加载任何页面 `Window.name` 的值始终保持不变。由于 `Window.name` 这个显著的特点，使其适用于在不同源之间进行跨域通信，但这是个不常用的属性。那么怎么在同源策略下使用呢？图 6 显示了如何使用 `window.name` 来跨域通信。

![图 6. window.name and cross-domain communication](http://bubkoo.qiniudn.com/window.name-and-cross-domain-communication.gif)

当页面 A 想要从另一个源获取资源或 Web 服务，首先在自己的页面上创建一个隐藏的 `iframe` B，将 B 指向外部资源或服务，B 加载完成之后，将把响应的数据附加到 `window.name` 上。由于现在 A 和 B 还不同源，A 依旧不能获取到 B 的 `name` 属性。当B 获取到数据之后，再将页面导航到任何一个与 A 同源的页面，这时 A 就可以直接获取到 B 的 `name` 属性值。当 A 获取到数据之后，就可以随时删掉 B。

### 使用 dojox.io.windowName 跨域

Dojo 提供了基于 `window.name` 的跨域支持，唯一的 API 是 `dojox.io.windowName.send(method, args)`，这和 `dojo.xhrGet/dojo.xhrPost` 很相似。`method` 参数可以是 GET 或 POST，`args` 参数则与 `dojo.xhr` 中的类似。例如：

```javascript
var args = {
 url: "http://www.sample.com/testServlet?windowName=true",
 load: function(data){
 alert("You've got the data from server " + data);
    },
error: function(error){
 alert("Error occurred: " + error);
 }
}
dojox.io.windowName.send("GET",args);
```

你可以和使用 `dojo.xhr` 相同的方式来使用 `dojox.io.windowName`。对于服务器端，如果想让资源或服务支持 `windowname` 的方式，建议你检查请求中的 `windowname` 参数，如果含有 `windowname` 参数，服务端应该返回一个 HTML 文档，该文档将把发送到客户端的数据设置到所在的 `window.name` 属性上。例如：

```java testServlet.java:
protected void doGet(HttpServletRequest request,HttpServletResponse response){
 //process request
 String returnData = ...;
 String isWindowNameReq = request.getParameter(“windowName”);
 if(null !=isWindowNameReq && Boolean.parseBoolean(isWindowNameReq)){
	 returnData = getCrossDomainStr(returnData);
}
 response.getOutputStream().print(returnData);
}
private String getCrossDomainStr(String data){
 StringBuffer returnStr = new StringBuffer();
 returnStr.append("<html><head><script type=\"text/javascript\">window.name='");
 returnStr.append(data);
 returnStr.append("'</script></head><body></body></html>");
 return returnStr.toString();
}
```

当导航回同域的任何页面时，需要确保页面是存在的，在 IE 下，如果页面不存在将导致异常，在 Firefox 中，你可以简单使用 `blank.html`。在 Dojo 中，你需要通过 `dojo.dojoBlankHtmlUrl` 属性来指定回滚的页面，默认情况下，是 Dojo 库下面的 `dojo/resources/blank.html` 文件。

使用 `window.name` 传输的数据量要比 `url.hash` 大得多，大多数现代浏览器可以达到 16M+。

## HTML5 新特性

在 HTML5 规范中，新方法 `window.postMessage(message, targetOrigin)` 可以用于安全跨域通信。当该方法被调用时，将分发一个消息事件，如果窗口监听了相应的消息，窗口就可以获取到消息和消息来源。如图 7 所示：

![图 7. Cross-domain communication with HTML5](http://bubkoo.qiniudn.com/cross-domain-communication-with-HTML5.gif)

在 图 7 中，如果 `iframe` 想要通知不同源的父窗口它已经加载完成，可以使用 `window.postMessage` 来发送消息。同时，它也将监听回馈消息：

```javascript
http://www.otherapp.com/index.html
function postMessage(msg){
     var targetWindow = parent.window;
      targetWindow.postMessage(msg,"*");
}
function handleReceive(msg){
 var object = dojo.fromJson(msg);
 if(object.status == “ok”){
	//continue to do other things
	……
 }else{
	//retry sending msg
	……
 }
}
window.addEventListener("message", handleReceive, false);
window.onLoad = function(){
    postMessage("already loaded");
}
```

父窗口监听了消息事件，当消息到达时，它首先检查消息是否是来 `www.otherapp.com`，如果是就发送一个反馈消息。


```javascript
http://www.myapp.com/index.html
function handleReceive(event){ 
    if(event.origin != "http://www.otherapp.com")
        return; 
     //process data
     ……
     var otherAppFrame = document.getElementById(“otherApp”) 
     otherAppFrame.postMessage(“{status:’ok’}”,”http://www.otherapp.com”);
}
window.addEventListener("message", handleReceive, false);
```

上面的代码可以运行在 Firefox 3+、IE8 以上、Google Chrome 2、Opera 9+ 和 Safari 4 上。如果你的页面不想收到任何消息，就不要添加消息监听，进而忽略所有消息。







