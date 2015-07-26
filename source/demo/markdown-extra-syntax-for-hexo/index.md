title: 扩展 Hexo 的 Markdown 语法示例 
date: 2015-04-23
---

## 注入代码

注入下面 CSS 代码到页面：

````css
#hexo-demo {
   width: 300px;
   padding: 30px;
   background-color: #E84893;
   color: #fff;
   margin: 20px 0;
}
````

注入一个 `div` 到页面：

````html
<div id="hexo-demo">
    点击我
</div>
````

插入一段脚本来监听上面 `div` 的点击事件：

````js
var addEvent = (function () {
    if (document.addEventListener) {
        return function (el, type, fn) {
            el.addEventListener(type, fn, false);
        };
    } else {
        return function (el, type, fn) {
            el.attachEvent('on' + type, function () {
                return fn.call(el, window.event);
            });
        }
    }
})(); 

addEvent(document.getElementById('hexo-demo'), 'click', function (e) {
    e.target.style.backgroundColor = '#1BA1E2';
});
````

## Tag Plugin 的语法糖

### Block Quote

没有提供参数，则只输出普通的 blockquote

~~~
```blockquote
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque hendrerit lacus ut purus iaculis feugiat. Sed nec tempor elit, quis aliquam neque. Curabitur sed diam eget dolor fermentum semper at eu lorem.
```
~~~

```blockquote
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque hendrerit lacus ut purus iaculis feugiat. Sed nec tempor elit, quis aliquam neque. Curabitur sed diam eget dolor fermentum semper at eu lorem.
```

引用书上的句子

~~~
```blockquote David Levithan, Wide Awake
Do not just seek happiness for yourself. Seek happiness for all. Through kindness. Through mercy.
```
~~~

```blockquote David Levithan, Wide Awake
Do not just seek happiness for yourself. Seek happiness for all. Through kindness. Through mercy.
```

引用 Twitter

~~~
```blockquote @DevDocs https://twitter.com/devdocs/status/356095192085962752
NEW: DevDocs now comes with syntax highlighting. http://devdocs.io
```
~~~

```blockquote @DevDocs https://twitter.com/devdocs/status/356095192085962752
NEW: DevDocs now comes with syntax highlighting. http://devdocs.io
```

引用网路上的文章

~~~
```blockquote Seth Godin http://sethgodin.typepad.com/seths_blog/2009/07/welcome-to-island-marketing.html Welcome to Island Marketing
Every interaction is both precious and an opportunity to delight.
```
~~~

```blockquote Seth Godin http://sethgodin.typepad.com/seths_blog/2009/07/welcome-to-island-marketing.html Welcome to Island Marketing
Every interaction is both precious and an opportunity to delight.
```

### Code Block

推荐直接使用 Markdown 原生的 Code Block 法语。


### Pull Quote

在文章中插入 Pull quote。

~~~
```pullquote [class]
content
```
~~~

```pullquote
content
```

### iframe

在文章中插入 iframe。

~~~
```iframe http://hexo.io/ 600 300
```
~~~

```iframe http://hexo.io/ 600 300
```




其他 Tag Plugin 使用类似，不再一一举例。

