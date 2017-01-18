title: 实例解析防抖和节流函数
tags:
  - Debounce
  - Throttle
categories:
  - JavaScript
photos:
  - http://bubkoo.qiniudn.com/images/Subaru-STI-Performance-Concept-Gauges.png
date: 2017-01-18 15:52:45
updated: 2017-01-18 15:52:45
keywords:
---

防抖（**Debounce**）和节流（**Throttle**）都是用来控制某个函数在一定时间内执行多少次的技巧，两者即相似又不同。

我们无法直接控制 DOM 事件触发频率，但我们可以在事件绑定和函数执行之间加一个控制层，所以当我们绑定 DOM 事件的时候，加上防抖或节流的函数变得特别有用。

<!--more-->

看下面滚动事件的例子：

<iframe src="//codepen.io/dcorb/embed/PZOZgB?height=320&theme-id=1&slug-hash=PZOZgB&default-tab=result&user=dcorb" scrolling="no" frameborder="0" width="100%" height="320" allowtransparency="true"></iframe>

当使用触控板，滚动滚轮，或者拖拽滚动条的时候，一秒就可以触发 `30` 次事件。经测试，在移动设备上轻轻滚动一下，一秒可以触发 `100` 次之多。这么高的执行频率是你期待的吗？

早在 2011 年，Twitter 就出现了一个问题：当向下滚动页面的时候，页面会变得很卡顿。John Resig 发表了[一篇博客](http://ejohn.org/blog/learning-from-twitter)解释这个问题，文中指出了问题的根源在于绑定的 `onScroll` 事件回调开销巨大。John 建议的解决方案是，在 `onScroll` 回调中，每间隔 `250ms` 才执行一次。就这样一个简单的优化，避免了影响用户体验。

## 防抖 Debounce

防抖技术可以把多个调用合并成一次。

想象一下，当电梯门快要关闭的时候，突然有人准备上来，此时电梯并没有改变楼层，而是再次打开电梯门，电梯延迟了改变楼层的功能，但是优化了资源。

直观感受一下面的例子：

<iframe src="//codepen.io/dcorb/embed/KVxGqN?height=360&theme-id=1&slug-hash=KVxGqN&default-tab=result&user=dcorb" scrolling="no" frameborder="0" width="100%" height="360" allowtransparency="true"></iframe>

### 提前触发

在前面例子中，debounce 回调都是在事件停止频繁触发一定时间后才执行：

![](http://bubkoo.qiniudn.com/images/debounce.png)

我们可以使回调在第一次触发事件的时候就执行，直到停止频繁触发并等待一定时间后才可能执行下一次回调，在类似不小心点了提交按钮两下而提交了两次的情况下很有用：

![](http://bubkoo.qiniudn.com/images/debounce-leading.png)

在 underscore 中，对应的选项叫 `immediate`：

<iframe src="//codepen.io/dcorb/embed/GZWqNV?height=360&theme-id=1&slug-hash=GZWqNV&default-tab=result&user=dcorb" scrolling="no" frameborder="0" width="100%" height="360" allowtransparency="true"></iframe>

### 调整窗口大小

调整桌面浏览器窗口大小的时候，会触发很多次 `resize` 事件：

<iframe src="//codepen.io/dcorb/embed/XXPjpd?height=300&theme-id=1&slug-hash=XXPjpd&default-tab=result&user=dcorb" scrolling="no" frameborder="0" width="100%" height="300" allowtransparency="true"></iframe>

### 通过 keypress 触发的自动完成功能

直到用户输入完成之后，才向服务器发送一次 AJAX 请求，相似的使用场景还有，直到用户输完，才验证输入的正确性，显示错误信息等。

<iframe src="//codepen.io/dcorb/embed/mVGVOL?height=200&theme-id=1&slug-hash=mVGVOL&default-tab=result&user=dcorb" scrolling="no" frameborder="0" width="100%" height="200" allowtransparency="true"></iframe>

## 节流（Throttle）

只允许一个函数在 `x` 毫秒内执行一次，跟 debounce 主要的不同在于，throttle 保证 `x` 毫秒内至少执行一次。

例如，我们需要在用户向下滚动滚动页面时，检查滚动位置距底部多远，当邻近底部时就需要发送 AJAX 请求获取更多的数据插入到页面中。此时，debounce 就不适用了，因为只有当用户停止滚动的时候它才会触发。使用 throttle 可以保证我们不断检查距离底部有多远。

<iframe src="//codepen.io/dcorb/embed/eJLMxa?height=607&theme-id=1&slug-hash=eJLMxa&default-tab=result&user=dcorb" scrolling="no" frameborder="0" width="100%" height="607" allowtransparency="true"></iframe>

## 使用 debounce 和 throttle 以及常见的坑

自己造一个 debounce/throttle 的轮子看起来很诱人，或者随便找个博文复制过来。我是建议直接使用 underscore 或 lodash 。如果仅需要 `_.debounce` 或 `_.throttle` 方法，可以使用 lodash 的自定义构建工具，生成一个 `2KB` 的压缩库。使用以下的简单命令即可：

```shell
npm i -g lodash-cli
lodash-cli include=debounce,throttle
```

常见的坑是，不止一次地调用 `_.debounce` 方法：

```js
// 错误
$(window).on('scroll', function() {
   _.debounce(doSomething, 300); 
});

// 正确
$(window).on('scroll', _.debounce(doSomething, 200));
```

取消执行：

```js
var debounced_version = _.debounce(doSomething, 200);
$(window).on('scroll', debounced_version);

// 如果需要的话
debounced_version.cancel();
```


## requestAnimationFrame

requestAnimationFrame 是另一种限速（节流）方式，与 `_.throttle(dosomething, 16)` 等价，可以使用 rAF API 替换 throttle 方法，对比一下优缺点：

**优点：**

- 动画保持 60fps（每一帧 16 ms），浏览器内部决定渲染的最佳时机
- 简洁标准的 API，后期维护成本低

**缺点：**

- 动画的开始/取消需要开发者自己控制，不像`_.debounce`或`_.throttle`由函数内部处理
- 页面所在的浏览器 Tab 未激活时，一切都不会执行
- 尽管所有的现代浏览器都[支持 rAF](http://caniuse.com/#feat=requestanimationframe)，IE9，Opera Mini 和 老的 Android 还是需要[打补丁](http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/)
- NodeJS 不支持，无法在服务器端用于文件系统事件


下面示例的灵感来自于 [Paul Lewis 的文章](http://www.html5rocks.com/en/tutorials/speed/animations/)，我们用 requestAnimationFrame 控制 scroll，然后与`16ms`的`_.throttle`做对比；两者性能相仿，对于更复杂的场景，rAF 可能效果更佳。

<iframe src="//codepen.io/dcorb/embed/pgOKKw?height=330&theme-id=1&slug-hash=pgOKKw&default-tab=result&user=dcorb" scrolling="no" frameborder="0" width="100%" height="330" allowtransparency="true"></iframe>

## 结论

使用 debounce，throttle 和 requestAnimationFrame 都可以优化事件处理：

- **debounce** 把触发非常频繁的事件（比如按键）合并成一次执行
- **throttle** 保证每`x`毫秒恒定的执行次数，比如每`200ms`检查下滚动位置，并触发页面加载
- **requestAnimationFrame** 可替代 throttle，函数需要重新计算和渲染屏幕上的元素时，想保证动画或变化的平滑性，可以用它。注意：IE9 不支持

<p class="j-quote">
原文：[Debouncing and Throttling Explained Through Examples](https://css-tricks.com/debouncing-throttling-explained-examples/)
</p>
