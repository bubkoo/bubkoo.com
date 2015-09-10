title: fetch API 简介
tags:
  - fetch
categories:
  - JavaScript
photos:
  - http://bubkoo.qiniudn.com/images/introduction-to-fetch-small.png
date: 2015-05-08 11:39:23
updated: 2015-05-08 11:39:23
keywords:
---

十多年来，我们一直使用 XMLHttpRequest（XHR）来发送异步请求，XHR 很实用，但并不是一个设计优良的 API，在设计上并不符合职责分离原则，输入、输出以及状态都杂糅在同一对象中，并用事件机制来跟踪状态变化。并且，基于事件的模型与最近流行的 Promise 和 generator 异步编程模型不太友好。

[Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 旨在修正上述缺陷，它提供了与 HTTP 语义相同的 JS 语法，简单来说，它引入了 `fetch()` 这个实用的方法来获取网络资源。

在 [Fetch 规范](https://fetch.spec.whatwg.org/)中对 API 进行了定义，它结合 ServiceWorkers，尝试做到如下优化：

1. 改善离线体验
2. 保持可扩展性

写这篇文章时，Fetch API 已被 Firefox 39（Nightly）以及 Chrome 42（dev）支持。在 github 上有相应的 [polyfill](https://github.com/github/fetch)。


<!--more-->

## 特征检查

可以通过检查 `Headers`、`Request`、`Response` 或 `fetch` 在 window 或 worker 作用域中是否存在，来检查是否支持 Fetch API。

## 简单示例

Fetch API 中最常用的是 `fetch()` 方法，该方法最简单的形式是，接受一个 URL 参数并返回以一个 promise 对象：

```javascript
fetch("/data.json").then(function(res) {
  // res instanceof Response == true.
  if (res.ok) {
    res.json().then(function(data) {
      console.log(data.entries);
    });
  } else {
    console.log("Looks like the response wasn't perfect, got status", res.status);
  }
}, function(e) {
  console.log("Fetch failed!", e);
});
```

如果是提交一个POST请求，代码如下：

```javascript
fetch("http://www.example.org/submit.php", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded"
  },
  body: "firstName=Nikhil&favColor=blue&password=easytoguess"
}).then(function(res) {
  if (res.ok) {
    alert("Perfect! Your settings are saved.");
  } else if (res.status == 401) {
    alert("Oops! You are not authorized.");
  }
}, function(e) {
  alert("Error submitting form!");
});
```

`fetch()` 方法的参数和 `Request()` 构造函数的参数完全一致，所以你可以传任意复杂的参数来实现更强大的 `fetch()`，下面将详细介绍。

## Headers

Fetch 引入了 3 个接口，分别是 `Headers`，`Request` 和 `Response`。他们直接对应于的 HTTP 中相应的概念，但是基于隐私和安全考虑，也有些区别，例如支持 CORS 规则以及保证 cookies 不能被第三方获取。

 [Headers 接口](https://fetch.spec.whatwg.org/#headers-class)是一个简单的键值对：

```javascript
var content = "Hello World";
var reqHeaders = new Headers();
reqHeaders.append("Content-Type", "text/plain"
reqHeaders.append("Content-Length", content.length.toString());
reqHeaders.append("X-Custom-Header", "ProcessThisImmediately");
```
也可以给构造函数传一个多维数组或 JS 字面量对象：


```javascript
reqHeaders = new Headers({
  "Content-Type": "text/plain",
  "Content-Length": content.length.toString(),
  "X-Custom-Header": "ProcessThisImmediately",
});
```

Headers 的内容可被检索：


```javascript
console.log(reqHeaders.has("Content-Type")); // true
console.log(reqHeaders.has("Set-Cookie")); // false
reqHeaders.set("Content-Type", "text/html");
reqHeaders.append("X-Custom-Header", "AnotherValue");
 
console.log(reqHeaders.get("Content-Length")); // 11
console.log(reqHeaders.getAll("X-Custom-Header")); // ["ProcessThisImmediately", "AnotherValue"]
 
reqHeaders.delete("X-Custom-Header");
console.log(reqHeaders.getAll("X-Custom-Header")); // []
```

一些操作只在 ServiceWorkers 中可用，但这些 API 使得操作 header 更为方便。

由于 header 可以在发送请求时被发送或在收到响应时被接收，并规定了那些参数可写，所以在 `Headers` 对象中有个一 `guard` 属性，来指定哪些参数可以被改变。

可能的值如下：

- `"none"`：默认值
- `"request"`：`Request.headers` 对象只读
- `"request-no-cors"`：在 `no-cors` 模式下，`Request.headers` 对象只读
- `"response"`：`Response.headers` 对象只读
- `"immutable"`：通常在 ServiceWorkers 中使用，所有 Header 对象都为只读

在[规范](https://fetch.spec.whatwg.org/)中对每个 `guard` 属性值有更详细的描述。例如，当 `guard` 为 `request` 时，你将不能添加或修改header 的 `Content-Length` 属性。

如果使用了一个不合法的 [HTTP Header 名](https://fetch.spec.whatwg.org/#concept-header-name)，那么 Headers 的方法通常都抛出 TypeError 异常。如果不小心写入了一个只读属性，也会抛出一个 TypeError 异常。除此以外，失败了将不抛出任何异常。例如：


```javascript
var res = Response.error();
try {
  res.headers.set("Origin", "http://mybank.com");
} catch(e) {
  console.log("Cannot pretend to be a bank!");
}
```

## Request

通过构造一个 `Request` 对象来获取网络资源，构造函数需要 `URL`、`method` 和 `headers` 参数，同时也可以提供请求体（body）、请求模式（mode）、`credentials` 和 `cache hints` 等参数。

最简单的形式如下：

```javascript
var req = new Request("/index.html");
console.log(req.method); // "GET"
console.log(req.url); // "http://example.com/index.html"
```

也可以将一个 `Request` 对象传给构造函数，这将返回该对象的一个副本（这与 `clone()` 方法不同，后面将介绍）。


```javascript
var copy = new Request(req);
console.log(copy.method); // "GET"
console.log(copy.url); // "http://example.com/index.html"
```

同时，这种形式通常只在 ServiceWorkers 中使用。

除 `URL` 之外的参数只能通过第二个参数传递，该参数是一个键值对：


```javascript
var uploadReq = new Request("/uploadImage", {
  method: "POST",
  headers: {
    "Content-Type": "image/png",
  },
  body: "image data"
});
```

`mode` 参数用来决定是否允许跨域请求，以及哪些 `response` 属性可读。可选的 `mode` 值为 `"same-origin"`、`"no-cors"`（默认）以及 `"cors"`。

### same-origin

该模式很简单，如果一个请求是跨域的，那么将返回一个 `error`，这样确保所有的请求遵守同源策略。


```javascript
var arbitraryUrl = document.getElementById("url-input").value;
fetch(arbitraryUrl, { mode: "same-origin" }).then(function(res) {
  console.log("Response succeeded?", res.ok);
}, function(e) {
  console.log("Please enter a same-origin URL!");
});
```

### no-cors 

该模式允许来自 CDN 的脚本、其他域的图片和其他一些跨域资源，但是首先有个前提条件，就是请求的 method 只能是`HEAD`、`GET` 或 `POST`。此外，如果 ServiceWorkers 拦截了这些请求，它不能随意添加或者修改除[这些](https://fetch.spec.whatwg.org/#simple-header)之外 Header 属性。第三，JS 不能访问 Response 对象中的任何属性，这确保了跨域时 ServiceWorkers 的安全和隐私信息泄漏问题。

### cors

该模式通常用于跨域请求，用来从第三方提供的 API 获取数据。该模式遵守 [CORS 协议](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS)，并只有有限的一些 Header 被暴露给 Response 对象，但是 body 是可读的。例如，获取一个 Flickr [最感兴趣](https://www.flickr.com/services/api/flickr.interestingness.getList.html)的照片的清单：


```javascript
var u = new URLSearchParams();
u.append('method', 'flickr.interestingness.getList');
u.append('api_key', '<insert api key here>');
u.append('format', 'json');
u.append('nojsoncallback', '1');
 
var apiCall = fetch('https://api.flickr.com/services/rest?' + u);
 
apiCall.then(function(response) {
  return response.json().then(function(json) {
    // photo is a list of photos.
    return json.photos.photo;
  });
}).then(function(photos) {
  photos.forEach(function(photo) {
    console.log(photo.title);
  });
});
```

你将无法从 Headers 中读取 `Date` 属性，因为 Flickr 在 `Access-Control-Expose-Headers` 中设置了不允许读取它。


```javascript
response.headers.get("Date"); // null
```

另外，`credentials` 属性决定了是否可以跨域访问 cookie 。该属性与 XHR 的
`withCredentials` 标志相同，但是只有三个值，分别是 `omit`（默认）、`same-origin` 和 `include`。


Request 对象也提供了客户端缓存机制（caching hints）。这个属性还在安全复审阶段。Firefox 提供了这个属性，但目前还不起作用。

Request 对象还有两个与 ServiceWorks 拦截有关的只读属性。其中一个是`referrer`，表示该 Request 的来源，可能为空。另外一个是 `context`，是一个非常大的[枚举集合](https://fetch.spec.whatwg.org/#requestcredentials)，定义了获得的资源的种类，它可能是 `image` 当请求来自于 `img` 标签时，可能是 `worker` 如果是一个 Worker 脚本，等等。如果使用 `fetch()` 函数，这个值是 `fetch`。

## Response

Response 对象通常在 `fetch()` 的回调中获得，也可以通过 JS 构造，不过这通常只在 ServiceWorkers 中使用。

Response 对象中最常见的属性是 `status`（整数，默认值是 `200`）和`statusText`（默认值是 `"OK"`）。还有一个 `ok` 属性，这是 `status` 值为 `200~299` 时的语法糖。


另外，还有一个 `type` 属性，它的值可能是 `"basic"`、`"cors"`、`"default"`、`"error"` 或 `"opaque"`。

- `"basic"`：同域的响应，除 `Set-Cookie` 和 `Set-Cookie2` 之外的所有 Header 可用
- `"cors"`：Response 从一个合法的跨域请求获得，[某些](https://fetch.spec.whatwg.org/#concept-filtered-response-cors) Header 和 body 可读
- `"error"`：网络错误。Response 对象的 `status` 属性为 `0`，`headers` 属性为空并且不可写。当 Response 对象从 `Response.error()` 中得到时，就是这种类型
- `"opaque"`：在 `"no-cors"` 模式下请求了跨域资源。依靠[服务端来做限制](https://fetch.spec.whatwg.org/#concept-filtered-response-opaque)

当 `type` 属性值为 `"error"` 时会导致 `fetch()` 方法的 Promise 被 reject，reject 回调的参数为 TypeError 对象。


还有一些属性只在 ServerWorker 下有效。在 ServerWorker 下返回一个 Response 的正确方式为：

```javascript
addEventListener('fetch', function(event) {
  event.respondWith(new Response("Response body", {
    headers: { "Content-Type" : "text/plain" }
  });
});
```

如你所见，Response 构造函数接收两个参数：返回的 body 和一个键值对对象，通过该对象来设置 `status`、`statusText` 和 `headers` 属性。

静态方法 `Response.error()` 将返回一个错误响应，`Response.redirect(url, status)` 将返回一个跳转响应。

## 处理 body

在 Request 和 Response 对象中都可能有 `body` 属性，并且 `body` 可以是各种类型，比较复杂，所以前面我们故意先跳过它，在这里单独拿出来讲解。

`body` 可以是以下任何一种类型的实例：

- [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)
- [ArrayBufferView](https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView) (Uint8Array and friends)
- [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)/[File](https://developer.mozilla.org/en-US/docs/Web/API/File)
- string
- [URLSearchParams](https://url.spec.whatwg.org/#interface-urlsearchparams)
- [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData) —— 目前不被 Gecko 和 Blink 支持，Firefox 预计在版本 39 和 Fetch 的其他部分一起推出

此外，Request 和 Response 都为操作 `body` 提供了以下方法，这些方法都返回一个使用实际内容 resolve 的 Promise 对象。

- arrayBuffer()
- blob()
- json()
- text()
- formData()

所以，在处理非文本的数据方面，Fetch API 比 XHR 更为便利。

设置请求体：


```javascript
var form = new FormData(document.getElementById('login-form'));
fetch("/login", {
  method: "POST",
  body: form
})
```


Responses 构造函数的第一个参数是响应体：

                       
```javascript
var res = new Response(new File(["chunk", "chunk"], "archive.zip",
{type: "application/zip"})                  	
);
```

Request 和 Response（扩展的 `fetch()` 方法）都能够[自动识别](https://fetch.spec.whatwg.org/#concept-bodyinit-extract)自己的内容类型，Request 还可以自动设置 `Content-Type` 头，如果开发者没有设置它的话。


## 流和克隆


非常重要的一点是，Request 和 Response 的 body 只能被读取一次！它们有一个属性叫 `bodyUsed`，读取一次之后设置为 `true`，之后就不能再被读取了。


```javascript
var res = new Response("one time use");
console.log(res.bodyUsed); // false
res.text().then(function(v) {
  console.log(res.bodyUsed); // true
});
console.log(res.bodyUsed); // true
 
res.text().catch(function(e) {
  console.log("Tried to read already consumed Response");
});
```

这样设计的目的是为了之后兼容[基于流](https://streams.spec.whatwg.org/)的 API，我们的目的是当数据到达时就进行相应的处理，这样就使得 JavaScript 可以处理大文件例如视频，并且可以支持实时压缩和编辑。

有时候，我们希望能多次访问 body，例如，你可能想使用即将支持的 [Cache API](http://slightlyoff.github.io/ServiceWorker/spec/service_worker/index.html#cache-objects) 来缓存 Request 和 Response，以便于可以离线使用，Cache 要求 body 能被再次读取。

那么，如何让 body 能被多次读取呢？API 为这两个对象提供了一个 `clone()` 方法。调用这个方法可以得到一个克隆对象，对象中包含全新的 body。不过要记得，`clone()` 必须要在使用 body 之前调用，也就是先 `clone()` 再读使用。


```javascript
addEventListener('fetch', function(evt) {
  var sheep = new Response("Dolly");
  console.log(sheep.bodyUsed); // false
  var clone = sheep.clone();
  console.log(clone.bodyUsed); // false
 
  clone.text();
  console.log(sheep.bodyUsed); // false
  console.log(clone.bodyUsed); // true
 
  evt.respondWith(cache.add(sheep.clone()).then(function(e) {
    return sheep;
  });
});
```

## 未来的改进

为了支持流，Fetch 最终将提供可以中断执行和得到读取进度的 API。这些在 XHR 中有，但是想要实现基于 Promise 的 Fetch API 有些麻烦。

你可以加入 [WHATWG 的邮件组](https://whatwg.org/mailing-list)参与 [Fetch](https://www.w3.org/Bugs/Public/buglist.cgi?product=WHATWG&component=Fetch&resolution=---) 和 [ServiceWorker](https://github.com/slightlyoff/ServiceWorker/issues) 的讨论，为改进 API 贡献自己的力量。

为了创造更好的互联网而努力！

*感谢 Andrea Marchesini, Anne van Kesteren 和 Ben Kelly 感谢他们对规范和实现所做的努力。*

```div j-quote
**参考资源：**

- [This API is so Fetching!](https://hacks.mozilla.org/2015/03/this-api-is-so-fetching/)
- [Introduction to fetch()](http://updates.html5rocks.com/2015/03/introduction-to-fetch)
- [【翻译】这个API很“迷人”——(新的Fetch API)](http://www.w3ctech.com/topic/854)
```