title: 看看这些题目你会多少？
date: 2014-03-20 10:20:47
updated: 2014-03-20 10:20:47
tags: [Quiz]
categories: [JavaScript]
keywords:
---
最近在 [perfectionkills](http://perfectionkills.com/javascript-quiz/) 上看到几道 JavaScript 题目，这里拿来分享一下，下面列举出来了题目，你可以在这里做题，答案解析可以[到这里](http://www.cnblogs.com/aaronjs/archive/2013/07/05/3172112.html)找到。


![](http://bubkoo.qiniudn.com/some-javascript-quiz-from-perfectionkills.jpg)

<!--more-->

<style>
    .answers {
        margin: 10px;
    }
    .answers li{
        list-style:none;
        line-height: 1.4;
    }
</style>

1.

``` javascript
(function(){
    return typeof arguments;
})();
```

<ul class="answers">
    <li>
        <input type="radio" name="question-1" id="answer-1-1">
        <label for="answer-1-1">"object"</label>
    </li>
    <li>
        <input type="radio" name="question-1" id="answer-1-2">
        <label for="answer-1-2">"array"</label>
    </li>
    <li>
        <input type="radio" name="question-1" id="answer-1-3">
        <label for="answer-1-3">"arguments"</label>
    </li>
    <li>
        <input type="radio" name="question-1" id="answer-1-4">
        <label for="answer-1-4">"undefined"</label>
    </li>
</ul>

2.

``` javascript
var f = function g(){ return 23; };
typeof g();
```

<ul class="answers">
    <li>
        <input type="radio" name="question-2" id="answer-2-1">
        <label for="answer-2-1">"number"</label>
    </li>
    <li>
        <input type="radio" name="question-2" id="answer-2-2">
        <label for="answer-2-2">"undefined"</label>
    </li>
    <li>
        <input type="radio" name="question-2" id="answer-2-3">
        <label for="answer-2-3">"function"</label>
    </li>
    <li>
        <input type="radio" name="question-2" id="answer-2-4">
        <label for="answer-2-4">Error</label>
    </li>
</ul>

3.

``` javascript
(function(x){
    delete x;
    return x;
})(1);
```

<ul class="answers">
    <li>
        <input type="radio" name="question-3" id="answer-3-1">
        <label for="answer-3-1">1</label>
    </li>
    <li>
        <input type="radio" name="question-3" id="answer-3-2">
        <label for="answer-3-2">null</label>
    </li>
    <li>
        <input type="radio" name="question-3" id="answer-3-3">
        <label for="answer-3-3">undefined</label>
    </li>
    <li>
        <input type="radio" name="question-3" id="answer-3-4">
        <label for="answer-3-4">Error</label>
    </li>
</ul>

4.

``` javascript
var y = 1, x = y = typeof x;
x;
```

<ul class="answers">
    <li>
        <input type="radio" name="question-4" id="answer-4-1">
        <label for="answer-4-1">1</label>
    </li>
    <li>
        <input type="radio" name="question-4" id="answer-4-2">
        <label for="answer-4-2">"number"</label>
    </li>
    <li>
        <input type="radio" name="question-4" id="answer-4-3">
        <label for="answer-4-3">undefined</label>
    </li>
    <li>
        <input type="radio" name="question-4" id="answer-4-4">
        <label for="answer-4-4">"undefined"</label>
    </li>
</ul>

5.

``` javascript
(function f(f){
    return typeof f();
})(function(){ return 1; });
```

<ul class="answers">
    <li>
        <input type="radio" name="question-5" id="answer-5-1">
        <label for="answer-5-1">"number"</label>
    </li>
    <li>
        <input type="radio" name="question-5" id="answer-5-2">
        <label for="answer-5-2">"undefined"</label>
    </li>
    <li>
        <input type="radio" name="question-5" id="answer-5-3">
        <label for="answer-5-3">"function"</label>
    </li>
    <li>
        <input type="radio" name="question-5" id="answer-5-4">
        <label for="answer-5-4">Error</label>
    </li>
</ul>

6.

``` javascript
var foo = {
    bar: function() { return this.baz; },
    baz: 1
  };
  (function(){
    return typeof arguments[0]();
})(foo.bar);
```

<ul class="answers">
    <li>
        <input type="radio" name="question-6" id="answer-6-1">
        <label for="answer-6-1">"undefined"</label>
    </li>
    <li>
        <input type="radio" name="question-6" id="answer-6-2">
        <label for="answer-6-2">"object"</label>
    </li>
    <li>
        <input type="radio" name="question-6" id="answer-6-3">
        <label for="answer-6-3">"number"</label>
    </li>
    <li>
        <input type="radio" name="question-6" id="answer-6-4">
        <label for="answer-6-4">"function"</label>
    </li>
</ul>

7.

``` javascript
var foo = {
    bar: function(){ return this.baz; },
    baz: 1
}
typeof (f = foo.bar)();
```

<ul class="answers">
    <li>
        <input type="radio" name="question-7" id="answer-7-1">
        <label for="answer-7-1">"undefined"</label>
    </li>
    <li>
        <input type="radio" name="question-7" id="answer-7-2">
        <label for="answer-7-2">"object"</label>
    </li>
    <li>
        <input type="radio" name="question-7" id="answer-7-3">
        <label for="answer-7-3">"number"</label>
    </li>
    <li>
        <input type="radio" name="question-7" id="answer-7-4">
        <label for="answer-7-4">"function"</label>
    </li>
</ul>

8.

``` javascript
var f = (function f(){ return "1"; }, function g(){ return 2; })();
typeof f;
```

<ul class="answers">
    <li>
        <input type="radio" name="question-8" id="answer-8-1">
        <label for="answer-8-1">"string"</label>
    </li>
    <li>
        <input type="radio" name="question-8" id="answer-8-2">
        <label for="answer-8-2">"number"</label>
    </li>
    <li>
        <input type="radio" name="question-8" id="answer-8-3">
        <label for="answer-8-3">"function"</label>
    </li>
    <li>
        <input type="radio" name="question-8" id="answer-8-4">
        <label for="answer-8-4">"undefined"</label>
    </li>
</ul>

9.

``` javascript
var x = 1;
if (function f(){}) {
    x += typeof f;
}
x;
```

<ul class="answers">
    <li>
        <input type="radio" name="question-9" id="answer-9-1">
        <label for="answer-9-1">1</label>
    </li>
    <li>
        <input type="radio" name="question-9" id="answer-9-2">
        <label for="answer-9-2">"1function"</label>
    </li>
    <li>
        <input type="radio" name="question-9" id="answer-9-3">
        <label for="answer-9-3">"1undefined"</label>
    </li>
    <li>
        <input type="radio" name="question-9" id="answer-9-4">
        <label for="answer-9-4">NaN</label>
    </li>
</ul>

10.

``` javascript
var x = [typeof x, typeof y][1];
typeof typeof x;
```

<ul class="answers">
    <li>
        <input type="radio" name="quiz-10" id="answer-10-1">
        <label for="answer-10-1">"number"</label>
    </li>
    <li>
        <input type="radio" name="quiz-10" id="answer-10-2">
        <label for="answer-10-2">"string"</label>
    </li>
    <li>
        <input type="radio" name="quiz-10" id="answer-10-3">
        <label for="answer-10-3">"undefined"</label>
    </li>
    <li>
        <input type="radio" name="quiz-10" id="answer-10-4">
        <label for="answer-10-4">"object"</label>
    </li>
</ul>

11.

``` javascript
(function(foo){
    return typeof foo.bar;
})({ foo: { bar: 1 } });
```

<ul class="answers">
    <li>
        <input type="radio" name="quiz-11" id="answer-11-1">
        <label for="answer-11-1">"undefined"</label>
    </li>
    <li>
        <input type="radio" name="quiz-11" id="answer-11-2">
        <label for="answer-11-2">"object"</label>
    </li>
    <li>
        <input type="radio" name="quiz-11" id="answer-11-3">
        <label for="answer-11-3">"number"</label>
    </li>
    <li>
        <input type="radio" name="quiz-11" id="answer-11-4">
        <label for="answer-11-4">Error</label>
    </li>
</ul>

12.

``` javascript
(function f(){
    function f(){ return 1; }
    return f();
    function f(){ return 2; }
})();
```

<ul class="answers">
    <li>
        <input type="radio" name="answer-12" id="answer-12-1">
        <label for="answer-12-1">1</label>
    </li>
    <li>
        <input type="radio" name="answer-12" id="answer-12-2">
        <label for="answer-12-2">2</label>
    </li>
    <li>
        <input type="radio" name="answer-12" id="answer-12-3">
        <label for="answer-12-3">Error (e.g. "Too much recursion")</label>
    </li>
    <li>
        <input type="radio" name="answer-12" id="answer-12-4">
        <label for="answer-12-4">undefined</label>
    </li>
</ul>

13.

```javascript
function f(){ return f; }
new f() instanceof f;
```

<ul class="answers">
    <li>
        <input type="radio" name="answer-13" id="answer-13-2">
        <label for="answer-13-2">true</label>
    </li>
    <li>
        <input type="radio" name="answer-13" id="answer-13-1">
        <label for="answer-13-1">false</label>
    </li>
</ul>

14.

```javascript
with (function(x, undefined){}) 
   length;
```

<ul class="answers">
    <li>
        <input type="radio" name="answer-14" id="answer-14-1">
        <label for="answer-14-1">1</label>
    </li>
    <li>
        <input type="radio" name="answer-14" id="answer-14-2">
        <label for="answer-14-2">2</label>
    </li>
    <li>
        <input type="radio" name="answer-14" id="answer-14-3">
        <label for="answer-14-3">undefined</label>
    </li>
    <li>
        <input type="radio" name="answer-14" id="answer-14-4">
        <label for="answer-14-4">Error</label>
    </li>
</ul>


<p class='dot' id='quiz-result'>点击下面按钮提交您的答案</p>
<a href="javascript:;" id="submitter" class="btn btn-blue" style="margin-top:15px;">试试手气</a>


<script type="text/javascript">
    (function () {
        function byId(id) {
            return document.getElementById(id);
        }

        byId('submitter').onclick = function () {

            var wrongAnswers = [ ];

            if (!byId('answer-1-1').checked) {
                wrongAnswers.push(1);
            }
            if (!byId('answer-2-4').checked) {
                wrongAnswers.push(2);
            }
            if (!byId('answer-3-1').checked) {
                wrongAnswers.push(3);
            }
            if (!byId('answer-4-4').checked) {
                wrongAnswers.push(4);
            }
            if (!byId('answer-5-1').checked) {
                wrongAnswers.push(5);
            }
            if (!byId('answer-6-1').checked) {
                wrongAnswers.push(6);
            }
            if (!byId('answer-7-1').checked) {
                wrongAnswers.push(7);
            }
            if (!byId('answer-8-2').checked) {
                wrongAnswers.push(8);
            }
            if (!byId('answer-9-3').checked) {
                wrongAnswers.push(9);
            }
            if (!byId('answer-10-2').checked) {
                wrongAnswers.push(10);
            }
            if (!byId('answer-11-1').checked) {
                wrongAnswers.push(11);
            }
            if (!byId('answer-12-2').checked) {
                wrongAnswers.push(12);
            }
            if (!byId('answer-13-1').checked) {
                wrongAnswers.push(13);
            }
            if (!byId('answer-14-2').checked) {
                wrongAnswers.push(14);
            }

            var message = (wrongAnswers.length === 14) ? '你全部答错了' : '你答错了 <strong>' + wrongAnswers.length + ' </strong>题';

            message += (wrongAnswers.length === 14) ? '' : '<br/>答错的题目：' + wrongAnswers.join(' , ');
            document.getElementById('quiz-result').innerHTML = message;
        };
    })();
</script>