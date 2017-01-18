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
