title: 【译】编写快速、高效的 JavaScript
date: 2014-02-13 13:35:27
updated: 2014-02-13 13:35:27
tags: [Performance]
categories: []
photos:
  - http://bubkoo.qiniudn.com/fast_memory.jpg
keywords:
---

原文连接：[Writing Fast, Memory-Efficient JavaScript](http://coding.smashingmagazine.com/2012/11/05/writing-fast-memory-efficient-javascript/) 

许多 JavaScript 引擎都是为了快速执行的大型 JavaScript 应用程序设计而特别设计，如 Google [V8](http://code.google.com/p/v8/) 引擎（正被 Chrome 和 [NodeJS](http://nodejs.org/) 使用）。在开发过程中，如果你关心内存使用情况和页面性能，你应该了解户浏览器的 JavaScript 引擎的内部运作原理。

无论是V8、[SpiderMonkey](https://developer.mozilla.org/en-US/docs/SpiderMonkey)（Firefox）、[Carakan](http://my.opera.com/ODIN/blog/carakan-faq)（Opera）、[Chakra](http://en.wikipedia.org/wiki/Chakra_(JScript_engine))（IE）或其他 JavaScript  引擎，了解引擎背后的一些运行机制可以帮助你**更好地优化你的应用程序**。但，这并不是说应该专门为某一浏览器或引擎进行程序的优化，而且，永远不要这样做。

你应该先问自己下面几个问题：
- 我可以做些什么来让我的代码更加高效
- 主流的 JavaScript 引擎都做了哪些优化
- 什么是引擎无法优化的，垃圾回收器是不是按照我预想的那样，回收了我不需要的内存空间

在我们编写高效、快速的代码的时候，有许多常见的陷阱，本文将讨论一些经过验证的、更好的编写代码的方式。
<!--more-->

## 那么，JavaScript 在 V8 中是如何工作的呢？ ##
虽然在没有彻底了解J avaScript 引擎的情况下，也可以开发出大型应用，就好比会开车的人不都看过车盖下的引擎一样。Chrome 作为我的首选浏览器，所以我将简单聊一下它的 JavaScript 引擎的工作机制，V8 引擎由以下几个核心部分组成：

- **基本编译器（base compiler）**，在你的代码运行之前，它会分析你的 JavaScript 代码并生成本地机器码，而不是执行字节码或简单地解释它。这种机器码起初是没有被高度优化的。
- V8 将对象解析为**对象模型（object model）**。对象是在 JavaScript 中是以关联数组的方式呈现的，但是在 V8 引擎中，它们是通过隐藏类（[hidden classes](https://developers.google.com/v8/design)）的方式来表示的。这是一种可以优化查找的内部类型机制。
- **一个运行时分析器（runtime profiler）**，它监视正在运行的系统，并标识 “hot” 函数，也就是那些最后会花费大量运行时间的代码。
- **一个优化编译器（optimizing compiler）**，它重新编译和优化那些被运行时分析器标识为 “hot” 的代码，并进行 “内联” 等优化（例如，在函数被调用的地方用函数主体去取代）。
- V8支持**逆优化（deoptimization）**，这意味着，如果优化编译器发现在某些假定的情况下，把一些已经优化的代码进行了过度的优化，它会舍弃优化后的代码。
- **垃圾回收器**，理解它的运作原理和理解如何优化你的JavaScript代码同等重要。

## 垃圾回收 ##

垃圾回收是**内存管理的一种机制**，垃圾回收器的概念是，它将试图回收那些不再被使用的对象所占据的内存，在像 JavaScript 这种支持垃圾回收的语言中，如果程序中仍然存在指向一个对象的引用，那么该对象将不会被回收。

在大多数情况下，我们没有必要去手动得解除对象的引用（de-referencing）。只需要简单滴将变量放在需要它们的位置（在理想的情况下，尽可能使用局部变量，也就是说，在它们被使用的函数中声明它们，而不是在更外层的作用域），垃圾就能正确地被回收。

在 JavaScript 中，强制进行垃圾回收是不可能的，而且你也不应该尝试这样做，因为垃圾回收是由运行时控制，并且它通常知道垃圾回收的最佳时机。

![](http://bubkoo.qiniudn.com/robot-cleaner.jpg)

## 删除引用的误解 ##

在网上不少关于 JavaScript 内存回收问题的讨论中，`delete` 操作符频繁被提及，虽然它可以用来删除对象（map）的属性（key），但是一些开发者认为它可以用来强制删除引用。在可能的情况下，尽量避免使用 `delete`，在下面例子中 `delete o.x` 的弊大于利，因为它改变了 `o` 的“隐藏类”，并使它成为一个“慢对象”。

``` javascript
var o = { x: 1 }; 
delete o.x; // true 
o.x; // undefined
```

尽管如此，你肯定会发在许多流行的 JavaScript 库中使用了 delete - 这有它语言目的。这里的主旨是，避免在运行时修改 "hot" 对象的结构，JavaScript 引擎可以检测到这些 "hot" 的对象，并尝试对其进行优化。如果在对象的生命期中没有遇到重大的结构改变，引擎的检测和优化过程会来得更加容易，而使用 `delete` 则会触发对象结构上的这种改变。

不少人对 `null` 的使用上也存在误解。将一个对象引用设置为 `null`，并不是意味着“清空”该对象，只是将它的引用指向 `null`。使用 `o.x = null` 比使用 `delete` 会更好些，但这甚至可能也是不必要的。

``` javascript
var o = { x: 1 }; 
o = null;
o; // null
o.x // TypeError
```

如果此引用是当前对象的最后引用，那么该对象就满足了垃圾回收的资格。如果此引用不是当前对象的最后引用，则该对象是可访问的，而不会被垃圾回收。

另外需要注意的是，全局变量在页面的生命周期中是不会被垃圾回收器清理的。只要页面保持打开状态，全局对象就会常驻在内存当中。

``` javascript
var myGlobalNamespace = {};
```

只有当刷新页面、导航到其他页面、关闭标签页或退出浏览器时，全局变量才会被清理。函数作用域的变量超出作用域范围时，它就会被清理。当函数完全结束，并且再没有任何引用指向其中的变量，函数中的变量会被清理。

## 经验法则 ##

为了使垃圾回收器尽早回收尽可能多的对象，**请不要保留（hold on）不再需要的对象**。这里有几点需要谨记：

- 就像之前所说的那样，比手动删除变量引用更好的方式是，在恰当的作用域中使用变量，例如，尽量在函数作用域中声明变量，而尽可能不要声明不会被回收的全局变量，这将意味着更干净更省心的代码。
- 确保解绑那些不再需要的事件监听器，尤其是那些即将被移除的 DOM 对象所绑定的事件。
- 如果你正在使用数据缓存，确保手动清理缓存或者使用衰老机制，避免缓存中储存大量不会被重用的数据。


## 函数 ##
接下来，我们讨论一下函数。正如我们前面所说，垃圾回收是通过回收那些不会再被使用的内存块（对象）来工作的。更好的说明这个问题，我们来看几个例子：

``` javascript
function foo() {
    var bar = new LargeObject();
    bar.someCall();
}
```

当 `foo` 返回时，变量 `bar` 所指向的对象将被垃圾回收，因为已经没有任何引用指向该对象了。

对比一下下面代码：

``` javascript
function foo() {
    var bar = new LargeObject();
    bar.someCall();
    return bar;
}

// somewhere else
var b = foo();
```

现在有一个指向 `bar` 对象的引用，当 `foo` 调用结束后，`bar` 对象不会被回收，直到到给变量 `b` 分配其他引用（或者 `b` 超出了作用域范围）。

## 闭包 ##

在一个外部函数中返回一个内部的函数，在内部函数中含有对外部函数作用域中变量的引用，当外部函数返回时，外部函数作用域中的变量不会被垃圾回收器回收，这样就构成了一个[闭包](http://robertnyman.com/2008/10/09/explaining-javascript-scope-and-closures/)。看下面例子：

``` javascript
function sum (x) {
    function sumIt(y) {
        return x + y;
    };
    return sumIt;
}

// Usage
var sumA = sum(4);
var sumB = sumA(3);
console.log(sumB); // Returns 7
```

在 `sum` 调用上下文中生成的函数对象 `sumIt` 是无法被回收的，它被全局变量 `sumA` 所引用，并且可以通过 `sumA(n)` 来执行。


请看另外一个例子，可以访问变量 `largeStr` 吗？

``` javascript
var a = function () {
    var largeStr = new Array(1000000).join('x');
    return function () {
        return largeStr;
    };
}();
```
 
答案是肯定的，我们可以通过调用 `a()` 访问 `largeStr`，所以它不会被回收。那下面这个呢？

``` javascript
var a = function () {
    var smallStr = 'x';
    var largeStr = new Array(1000000).join('x');
    return function (n) {
        return smallStr;
    };
}();
```

我们不能再访问 `largeStr` 了，因为内部函数并没有将其返回，它会成为垃圾回收的候选对象。

## 定时器 ##

最糟的内存泄漏之一是在循环或 `setTimeout/setInterval` 中，但这相当常见。

思考下面的例子：

``` javascript
var myObj = {
    callMeMaybe: function () {
        var myRef = this;
        var val = setTimeout(function () { 
            console.log('Time is running out!'); 
            myRef.callMeMaybe();
        }, 1000);
    }
};
```

当我们调用 `callMeMaybe` 来启动定时器：

``` javascript
myObj.callMeMaybe();
```

在 console 控制台中，每秒输出 "Time is running out!" 。

如果接着运行：

``` javascript
myObj = null
```

定时器仍然会被触发，由于闭包将 `myObj` 传递给 `setTimeout` ，这样 `myObj` 指向的对象就无法被回收，通过 `myRef` 保持着对 `myObj` 的引用。如果我们把该闭包函数传入其他任何的函数，同样的事情一样会发生，函数中仍然会存在指向对象的引用。

同样值得牢记的是，`setTimeout/setInterval` 调用(如函数)中的引用，在运行完成之前是不会被垃圾回收的。

## 当心性能陷阱 ##

很重要的一点是，除非你真正需要，否则没有必要优化你的代码，这个怎么强调都不为过。现在经常可以看到一些基准测试，显示 N 比 M 在 V8 中更为优化，但是如果在真实的代码模型或者在真正的应用程序中进行测试，**这些优化真正的效果比你期望的要小的多**。

![做的过多还不如什么都不做](http://bubkoo.qiniudn.com/speed-trap.jpg)

假设我们想要创建一个这个的模块：

- 需要一个本地的数据源，每项数据包含数字 ID
- 绘制一个包含这些数据的表格
- 添加事件处理程序，当用户点击的任何单元格时切换单元格的 class

对于这个模块需要注意几个问题，虽然这些问题很容易解决。如何存储这些数据？如何高效地绘制表格并将它添加到 DOM 中？如何更优地处理表格事件？

第一个（也是幼稚的）的方案可能是将每块数据存储在一个对象数中，然后把所有数据对象放到一个数组中。有人也许会使用 jQuery 去循环访问数组，生成表格内容，然后把它添加到 DOM 中，最后使用事件绑定我们期望地点击行为。

**注意：你千万不要这样做**

``` javascript
var moduleA = function () {

    return {

        data: dataArrayObject,

        init: function () {
            this.addTable();
            this.addEvents();
        },

        addTable: function () {

            for (var i = 0; i < rows; i++) {
                $tr = $('<tr></tr>');
                for (var j = 0; j < this.data.length; j++) {
                    $tr.append('<td>' + this.data[j]['id'] + '</td>');
                }
                $tr.appendTo($tbody);
            }

        },
        addEvents: function () {
            $('table td').on('click', function () {
                $(this).toggleClass('active');
            });
        }

    };
}();
```

代码虽简单，但也完成了我们需要的功能。

然而，在这种情况下我们需要迭代的唯一数据是数值类型的 ID，可以直接用标准数组来储存这些数据。有趣的是，在生成表格时，直接使用 `DocumentFragment` 对象和原生操作 DOM 的方法要比使用 jQuery 更优。同时，使用事件代理比为每个 `td` 都进行事件绑定会有更好的性能。

细心的同学会想： jQuery 内部也使用 `DocumentFragment` 进行了优化啊，但在我们的例子中，代码中在循环中调用 `append()`，每一次调用都要进行额外的操作，因此在这里起到的优化作用不大。希望这不会是一个痛点，但是一定要用基准测试来确保自己的代码没有问题。

对于我们的例子，添加以上这些优化会带来一些不错（预期）的性能提升。相对于简单的绑定，事件委托提供了相当好的改进，且选择用 `documentFragment` 会是一个真正的[性能助推器](http://jsperf.com/first-pass)。

``` javascript
var moduleD = function () {

    return {

        data: dataArray,

        init: function () {
            this.addTable();
            this.addEvents();
        },
        addTable: function () {
            var td, tr;
            var frag = document.createDocumentFragment();
            var frag2 = document.createDocumentFragment();

            for (var i = 0; i < rows; i++) {
                tr = document.createElement('tr');
                for (var j = 0; j < this.data.length; j++) {
                    td = document.createElement('td');
                    td.appendChild(document.createTextNode(this.data[j]));

                    frag2.appendChild(td);
                }
                tr.appendChild(frag2);
                frag.appendChild(tr);
            }
            tbody.appendChild(frag);
        },
        addEvents: function () {
            $('table').on('click', 'td', function () {
                $(this).toggleClass('active');
            });
        }

    };

}();
```

我们可能还会寻找其他的方案来提高性能。你也许曾经在其他地方读到过使用**原型模式**比**模块模式**更加优化（我们不久前已经证明了事实并非如此），或听说过使用 JavaScript 模版框架性能更好。有时确实如此，不过使用它们其实是为了让代码更具可读性，同时，还有预编译！让我们测试一下，实际上这有多少是能带来真正优化的。

``` javascript
moduleG = function () {};
 
moduleG.prototype.data = dataArray;
moduleG.prototype.init = function () {
    this.addTable();
    this.addEvents();
};
moduleG.prototype.addTable = function () {
    var template = _.template($('#template').text());
    var html = template({'data' : this.data});
    $tbody.append(html);
};
moduleG.prototype.addEvents = function () {
   $('table').on('click', 'td', function () {
       $(this).toggleClass('active');
   });
};
 
var modG = new moduleG();
```

事实证明，在这种情况下的带来的性能提升可以忽略不计。[选择模板和原型](http://jsperf.com/second-pass)不会真正带来多大的性能提升。据说，性能并不是现代开发者使用它们的真正原因，给代码带来可读性、继承模型和可维护性才是真正的原因。

更复杂的问题包括如何[高效地在 canvas 上绘制图片](http://jsperf.com/canvas-drawimage-vs-webgl-drawarrays/6)和使用或不使用[类型数组](http://jsperf.com/typed-arrays-for-pixel-manipulation)去[操作像素数据](http://jsperf.com/canvas-pixel-manipulation/30)。

在将一些方法用在你自己的应用之前，一定要多了解这些方案的基准测试。也许有人还记得 [JavaScript 模版的 shoot-off](http://jsperf.com/dom-vs-innerhtml-based-templating/473) 和[随后的扩展版](http://jsperf.com/javascript-templating-shootoff-extended/26)。如果你想确保测试不会被现实的应用程序的中你看不到的约束所影响，请在真实的代码中和优化一起测试。

## V8 优化技巧 ##

详细的介绍每一个 V8 引擎的每一种优化点显然超出了本文的讨论范围，其中有许多特定的优化技巧值得注意，记住这些技巧你就能减少写出那些性能低下的代码的可能性。

- 特定的模式会导致 V8 放弃优化。例如使用 try-catch，就会导致这种情况的发生。如果想要了解跟多关于什么函数可以被优化，什么函数不可以，你可以在 V8 引擎中附带的 D8shell 中使用 –trace-optfile.js 命令。
- 如果你关心运行速度，尽量使你的函数职责单一，即确保变量（包括属性，数组，函数参数）只使用相同隐藏类包含的对象。举个例子，永远不要干这种事：

``` javascript
function add(x, y) { 
   return x+y;
} 
 
add(1, 2); 
add('a','b'); 
add(my_custom_object, undefined);
```

- 不要从未初始化的或已经被删除的元素上加载内容。如果这么做也不会出现什么错误，但是它会使得程序运行得更慢。
- 不要使函数体过大，这样会使得优化更加困难。


如果想知道更多的优化技巧，可以观看 Daniel Clifford 在 Google I/O 大会上的演讲 [Breaking the JavaScript Speed Limit with V8](http://www.youtube.com/watch?v=UJPdhx5zTaw)，它同时也涵盖了上面我们所说的优化技巧。 [Optimizing For V8 — A Series](http://floitsch.blogspot.co.uk/2012/03/optimizing-for-v8-introduction.html) 也非常值得一读。

### 对象 VS 数组：我应该用哪个？ ###

- 如果你想存储一串数字，或者一些相同类型的对象，使用一个数组。
- 如果你语义上需要的是一堆对象的属性（不同类型），使用一个对象和属性。这在内存方面非常高效，速度也相当快。
- 整数索引的元素，无论存储在一个数组或对象中，都要[比遍历对象的属性快得多](http://jsperf.com/performance-of-array-vs-object/3)。
- 对象的属性比较复杂：它们可以被 setter 创建，具有不同的枚举性和可写性。数组中则不具有如此的定制性，而只存在有和无这两种状态，在引擎层面，这允许更多存储结构方面的优化，特别是当数组中存放数字时。例如，当你需要向量时，不用定义具有 x，y，z 属性的类，只用数组就可以了。

JavaScript 中对象和数组之间只有一个的主要区别，那就是数组神奇的 length 属性。如果你自己来维护这个属性，那么 V8 中对象和数组的速度是一样快。

### 使用对象的提示 ###

- **使用一个构造函数来创建对象**。这将确保它创建的所有对象具有相同的隐藏类，并有助于避免更改这些类。有一个额外的好处就是，它也略快于 `Object.create()`。
- 在程序中，对象属性的数量和其复杂度并没有限制，但请注意，长原型链往往是有害的，并且只有一些极少数属性的小对象比大对象会快一点。对于 “hot” 对象，尽量保持短原型链，并且少属性。

### 对象克隆 ###

对象克隆对于应用开发者来说是一种常见的问题。虽然各种基准测试可以证明 V8 对这个问题处理得很好，但仍要小心。当复制较大的对象时通常很会慢，因此，尽量不要这么做。JavaScript 中的 `for..in` 循环尤其糟糕，因为它有着恶魔般的规范，并且无论是在哪个引擎对于哪个对象，都不可能快得起来。

当你不得不要在一些关键性能代码中复制对象时，使用数组或一个自定义的“拷贝构造函数”来明确地复制每个属性。这可能是最快的方式：

``` javascript
function clone(original) {
  this.foo = original.foo;
  this.bar = original.bar;
}
var copy = new clone(original);
```

### 模块模式中缓存函数 ###

使用模块模式时缓存函数，可能会带来性能方面的提升。参阅下面的例子，因为它总是创建成员函数的新副本，你看到的变化可能会比较慢。

另外请注意，使用这种方法明显更优，不仅仅是依靠原型模式（经过jsPerf测试确认）。

![使用模块模式或原型模式时的性能提升](http://bubkoo.qiniudn.com/test%20of%20prototype%20versus%20module%20pattern%20performance.png)

这是一个[原型模式与模块模式的性能对比测试](http://jsperf.com/prototypal-performance/12)：

``` javascript
// 原型模式
  Klass1 = function () {}
  Klass1.prototype.foo = function () {
      log('foo');
  }
  Klass1.prototype.bar = function () {
      log('bar');
  }

  // 模块模式
  Klass2 = function () {
      var foo = function () {
          log('foo');
      },
      bar = function () {
          log('bar');
      };

      return {
          foo: foo,
          bar: bar
      }
  }


  // 模块模式和缓存函数
  var FooFunction = function () {
      log('foo');
  };
  var BarFunction = function () {
      log('bar');
  };

  Klass3 = function () {
      return {
          foo: FooFunction,
          bar: BarFunction
      }
  }


  // 下面是基准测试

  // 原型模式
  var i = 1000,
      objs = [];
  while (i--) {
      var o = new Klass1()
      objs.push(new Klass1());
      o.bar;
      o.foo;
  }

  // 模块模式
  var i = 1000,
      objs = [];
  while (i--) {
      var o = Klass2()
      objs.push(Klass2());
      o.bar;
      o.foo;
  }

  // 模块模式和缓存函数
  var i = 1000,
      objs = [];
  while (i--) {
      var o = Klass3()
      objs.push(Klass3());
      o.bar;
      o.foo;
  }
// See the test for full details
```

**注意**：如果你不需要一个类，那就不要麻烦地去创建。这里有一个示例，演示了如何通过移除类开销来获得性能的提升。

[http://jsperf.com/prototypal-performance/54](http://jsperf.com/prototypal-performance/54)

### 使用数组的技巧 ###

接下来说说数组相关的技巧。在一般情况下，**不要删除数组元素**，这样将使数组过渡到较慢的内部表示。当索引变得稀疏，V8 将会使元素转为更慢的字典模式。

**数组字面量**

数组字面量非常有用，它可以暗示数组的大小和类型。它通常用在体积不大的数组中。

``` javascript
// V8 知道你需要一个长度为 4 并且储存数字的数组：
var a = [1, 2, 3, 4];

// 不要这样做：
a = []; // V8 将对数组一无所知
for(var i = 1; i <= 4; i++) {
     a.push(i);
}
```

**存储单一类型 VS 多类型**

将混合类型（比如数字、字符串、undefined、true/false）的数据存在数组中绝不是一个好想法。例如 `var arr = [1, “1”, undefined, true, “true”]`。

[类型推断的性能测试](http://jsperf.com/type-inference-performance/2)

正如我们所看到的结果，整数的数组是最快的。

**稀疏数组 VS 满数组**

当你使用稀疏数组时，要注意访问元素将远远慢于满数组。因为 V8 不会分配一整块空间给只用到部分空间的数组。取而代之的是，它被管理在字典中，既节约了空间，但花费访问的时间。

[稀疏数组与满数组的测试](http://jsperf.com/sparse-arrays-vs-full-arrays)

**预分配空间 VS 动态分配**

不要预分配大数组（如大于 64K 的元素），其最大的大小，而应该动态分配。在我们这篇文章的性能测试之前，请记住这只适用部分 JavaScript 引擎。

![空字面量与预分配数组在不同的浏览器进行测试](http://bubkoo.qiniudn.com/Test%20of%20pre-allocated%20arrays.jpg)

Nitro (Safari) 对预分配的数组更有利。而在其他引擎（V8，SpiderMonkey）中，预先分配并不是高效的。

[预分配数组测试](http://jsperf.com/pre-allocated-arrays)

``` javascript
// Empty array
var arr = [];
for (var i = 0; i < 1000000; i++) {
    arr[i] = i;
}

// Pre-allocated array
var arr = new Array(1000000);
for (var i = 0; i < 1000000; i++) {
    arr[i] = i;
}
```

## 优化你的应用 ##

在 Web 应用的世界中，**速度就是一切**。没有用户希望用一个要花几秒钟计算某列总数或花几分钟汇总信息的表格应用。这是为什么你要在代码中压榨每一点性能的重要原因。

![](http://bubkoo.qiniudn.com/improving-apps.jpg)

理解和提高应用程序的性能是非常有用的同时，它也是困难的。我推荐以下的步骤来解决性能的痛点：
- 测量：在您的应用程序中找到慢的地方（约45％）
- 理解：找出实际的问题是什么（约45％）
- 修复它！ （约10％）

下面推荐的一些工具和技术可以协助你。

### 基准化（BENCHMARKING） ###

有很多方式来测试 JavaScript 代码片段的性能，一般情况是，简单地比较两个时间戳。这中模式被 [jsPerf](http://jsperf.com/) 团队指出，并在 [SunSpider](http://www.webkit.org/perf/sunspider/sunspider.html) 和 [Kraken](http://krakenbenchmark.mozilla.org/) 的基准套件中使用：

``` javascript
var totalTime,
    start = new Date,
    iterations = 1000;
while (iterations--) {
  // Code snippet goes here
}
// totalTime → the number of milliseconds taken 
// to execute the code snippet 1000 times
totalTime = new Date - start;
```

在这里，要测试的代码被放置在一个循环中，并运行一个设定的次数（例如6次）。在此之后，开始日期减去结束日期，就得出在循环中执行操作所花费的时间。

然而，这种基准测试做的事情过于简单了，特别是如果你想运行在多个浏览器和环境的基准。垃圾收集器本身对结果是有一定影响的。即使你使用 `window.performance` 这样的解决方案，也必须考虑到这些缺陷。

不管你是否只运行基准部分的代码，编写一个测试套件或编码基准库，JavaScript 基准其实比你想象的要复杂。如需更详细的指南基准，我强烈建议你阅读由 Mathias Bynens 和 John-David Dalton 提供的 [Javascript 基准测试](http://mathiasbynens.be/notes/javascript-benchmarking)。

### 分析（PROFILING） ###

Chrome 开发者工具为 JavaScript 分析有很好的支持。可以使用此功能检测哪些函数占用了大部分时间，这样你就可以去优化它们。这很重要，即使是代码很小的改变会对整体表现产生重要的影响。

![Chrome 开发者工具的分析面板](http://bubkoo.qiniudn.com/Profiles%20Panel%20in%20Chrome%20Developer%20Tools.jpg)

分析过程开始获取代码性能基线，然后以时间线的形式体现。这将告诉我们代码需要多长时间运行。“Profiles”选项卡给了我们一个更好的视角来了解应用程序中发生了什么。JavaScript CPU 分析展示了多少 CPU 时间被用于我们的代码，CSS 选择器分析文件展示了多少时间花费在处理选择器上，堆快照显示多少内存正被用于我们的对象。

利用这些工具，我们可以分离、调整和重新分析来衡量我们的功能或操作对性能优化是否真的起到了效果。

![“Profile”选项卡展示了代码性能信息](http://bubkoo.qiniudn.com/Profile%20tab%20gives%20you%20information%20about%20your%20code's%20performance.jpg)

一个很好的分析介绍，阅读 Zack Grossbart 的 [JavaScript Profiling With The Chrome Developer Tools](http://coding.smashingmagazine.com/2012/06/12/javascript-profiling-chrome-developer-tools/)。

提示：在理想情况下，若想确保你的分析并未受到已安装的应用程序或扩展的影响，可以使用 --user-data-dir <empty_directory> 标志来启动 Chrome。在大多数情况下，这种方法优化测试应该是足够的，但也需要你更多的时间。这是 V8 标志能有所帮助的。

### 避免内存泄漏 —— 3快照技术 ###

在谷歌内部，Chrome 开发者工具被 Gmail 等团队大量使用，用来帮助发现和排除内存泄漏。

![Chrome 开发者工具中的内存统计](http://bubkoo.qiniudn.com/Memory%20statistics%20in%20Chrome%20Developer%20Tools.jpg)

内存统计出我们团队所关心的私有内存使用、JavaScript 堆的大小、DOM 节点数量、存储清理、事件监听计数器和垃圾收集器正要回收的东西。推荐阅读 Loreena Lee 的 [3 snapshot](https://docs.google.com/presentation/d/1wUVmf78gG-ra5aOxvTfYdiLkdGaR9OhXRnOlIcEmu2s/pub?start=false&loop=false&delayms=3000#slide=id.g1d65bdf6_0_0)。该技术的要点是，在你的应用程序中记录一些行为，强制垃圾回收，检查 DOM 节点的数量有没有恢复到预期的基线，然后分析三个堆的快照来确定是否有内存泄漏。

### 单页面应用的内存管理 ###

单页面应用程序（例如AngularJS，Backbone，Ember）的内存管理是非常重要的，它们几乎永远不会刷新页面，这意味着内存泄漏可能相当明显。移动终端上的单页面应用充满了陷阱，因为设备的内存有限，并在长期运行 Email 客户端或社交网络等应用程序。**能力愈大责任愈重**。

有很多办法解决这个问题。在 Backbone 中，确保使用 `dispose()` 来处理旧视图和引用（目前在 [Backbone(Edge)](https://github.com/documentcloud/backbone/blob/master/backbone.js#L1234) 中可用）。这个函数是最近加上的，移除添加到视图 `event` 对象中的处理函数，以及通过传给 view 的第三个参数（回调上下文）的 model 或 collection 的事件监听器。`dispose()` 也会被视图的 `remove()` 调用，处理当元素被移除时的主要清理工作。Ember 等其他的库当检测到元素被移除时，会清理监听器以避免内存泄漏。

Derick Bailey 的一些明智的建议：

> 与其了解事件与引用是如何工作的，不如遵循的标准规则来管理 JavaScript 中的内存。如果你想加载数据到的一个存满用户对象的 Backbone 集合中，你要清空这个集合使它不再占用内存，那必须清除这个集合的所有引用以及集合内对象的引用。一旦清除了所用的引用，资源就会被回收。这就是标准的 JavaScript 垃圾回收规则。

在文章中，Derick 涵盖了许多使用 Backbone.js 时的常见[内存缺陷](http://lostechies.com/derickbailey/2012/03/19/backbone-js-and-javascript-garbage-collection/)，以及如何解决这些问题。

Felix Geisendörfer 的[在 Node 中调试内存泄漏](https://github.com/felixge/node-memory-leak-tutorial)的教程也值得一读，尤其是当它形成了更广泛 SPA 堆栈的一部分。

### 减少回流（REFLOWS） ###

当浏览器重新渲染文档中的元素时需要重新计算它们的位置和几何形状时，我们称之为[回流](https://www.youtube.com/watch?feature=player_embedded&v=ZHxbs5WEQzE)。回流会阻塞用户在浏览器中的操作，因此理解提升回流时间是非常有帮助的。

![回流时间图表](http://bubkoo.qiniudn.com/Chart%20of%20reflow%20time.jpg)

你应该批量地触发回流或重绘，但是要有节制地使用这些方法，尽量不处理 DOM 也很重要。可以使用 `DocumentFragment`，一个轻量级的文档对象。你可以把它作为一种方法来提取文档树的一部分，或创建一个新的文档“片段”。与其不断地添加 DOM 节点，不如使用文档片段后只执行一次 DOM 插入操作，以避免过多的回流。

例如，我们写一个函数给一个元素添加 20 个 `div` 。如果只是简单地每次 append 一个 `div` 到元素中，这会触发 20 次回流。

``` javascript
function addDivs(element) {
  var div;
  for (var i = 0; i < 20; i ++) {
    div = document.createElement('div');
    div.innerHTML = 'Heya!';
    element.appendChild(div);
  }
}
```

要解决这个问题，可以使用 `DocumentFragment` 来代替，我们可以每次添加一个新的 `div` 到里面。完成后将 `DocumentFragment` 添加到 DOM 中只会触发一次回流。

``` javascript
function addDivs(element) {
  var div; 
  // Creates a new empty DocumentFragment.
  var fragment = document.createDocumentFragment();
  for (var i = 0; i < 20; i ++) {
    div = document.createElement('a');
    div.innerHTML = 'Heya!';
    fragment.appendChild(div);
  }
  element.appendChild(fragment);
}
```

可以参阅 [Make the Web Faster](https://developers.google.com/speed/articles/javascript-dom)，[JavaScript Memory Optimization](http://blog.tojicode.com/2012/03/javascript-memory-optimization-and.html) 和 [Finding Memory Leaks](http://gent.ilcore.com/2011/08/finding-memory-leaks.html)。

### JavaScript 内存泄漏探测器 ###

为了帮助发现 JavaScript 内存泄漏，谷歌的开发人员（Marja Hölttä 和 Jochen Eisinger）开发了一种工具，它与 Chrome 开发人员工具结合使用，检索堆的快照并检测出是什么对象导致了内存泄漏。

![一个 JavaScript 内存泄漏检测工具](http://bubkoo.qiniudn.com/tool%20for%20detecting%20JavaScript%20memory%20leaks.jpg)

有完整的文章介绍了[如何使用这个工具](http://google-opensource.blogspot.de/2012/08/leak-finder-new-tool-for-javascript.html)，建议你自己到[内存泄漏探测器项目页面](http://code.google.com/p/leak-finder-for-javascript/)看看。

如果你想知道为什么这样的工具还没集成到我们的开发工具，是因为它最初是在 Closure 库中帮助我们捕捉一些特定的内存场景，它更适合作为一个外部工具。

### V8 优化调试和垃圾回收的标志位 ###

Chrome 支持直接通过传递一些标志给 V8，以获得更详细的引擎优化输出结果。例如，这样可以追踪 V8 的优化：

``` javascript
"/Applications/Google Chrome/Google Chrome" --js-flags="--trace-opt --trace-deopt"
```

Windows 用户可以这样运行 `chrome.exe –js-flags=”–trace-opt –trace-deopt”`
，在开发应用程序时，下面的 V8 标志都可以使用。

- trace-opt —— 记录优化函数的名称，并显示跳过的代码，因为优化器不知道如何优化。
- trace-deopt —— 记录运行时将要“去优化”的代码。
- trace-gc —— 记录每次的垃圾回收。

V8 的处理脚本用 `*` 标识优化过的函数，用 `~` 表示未优化的函数。

如果有想了解更多关于 V8 的标志和 V8 的内部是如何工作的，强烈建议阅读 Vyacheslav Egorov 的 [excellent post on V8 internals](http://mrale.ph/blog/2011/12/18/v8-optimization-checklist.html)。

### 高精度时间和导航计时 API ###

[高精度时间](http://www.w3.org/TR/hr-time/)（HRT）是一个提供不受系统时间和用户调整影响的亚毫秒级高精度时间接口，可以把它当做是比 `new Date` 和 `Date.now()` 更精准的度量方法。这对我们编写基准测试帮助很大。

![高精度时间（HRT）提供了当前亚毫秒级的时间精度](http://bubkoo.qiniudn.com/High%20Resolution%20Time.jpg)

目前 HRT 在 Chrome（稳定版）中是以 `window.performance.webkitNow()` 方式使用，但在 Chrome Canary 中前缀被丢弃了，这使得它可以通过 `window.performance.now()` 方式调用。Paul Irish 在 HTML5Rocks 上有[更多关于 HRT](http://updates.html5rocks.com/2012/08/When-milliseconds-are-not-enough-performance-now)的文章。

现在我们知道当前的精准时间，那有可以准确测量页面性能的 API 吗？好吧，现在有个 Navigation Timing API 可以使用，这个 API 提供了一种简单的方式，来获取网页在加载呈现给用户时，精确和详细的时间测量记录。可以在 console 中使用 `window.performance.timing` 来获取时间信息：

![显示在控制台中的时间信息](http://bubkoo.qiniudn.com/Timing%20information%20is%20shown%20in%20the%20console.jpg)

我们可以从上面的数据获取很多有用的信息，例如网络延时为 `responseEnd – fetchStart`，页面加载时间为 `loadEventEnd – responseEnd`，处理导航和页面加载的时间为 `loadEventEnd – navigationStart`。

正如你所看到的，`perfomance.memory` 的属性也能显示 JavaScript 的内存数据使用情况，如总的堆大小。

更多 Navigation Timing API 的细节，阅读 Sam Dutton 的 [Measuring Page Load Speed With Navigation Timing](http://www.html5rocks.com/en/tutorials/webperformance/basics/)。

### ABOUT:MEMORY 和 ABOUT:TRACING ###

Chrome 中的 `about:tracing` 提供了浏览器的性能视图，记录了 Chrome 的所有线程、tab 页和进程。

![About:Tracing提供了浏览器的性能视图](http://bubkoo.qiniudn.com/About-Tracing.jpg)

这个工具的真正用处是允许你捕获 Chrome 的运行数据，这样你就可以适当地调整 JavaScript 执行，或优化资源加载。

Lilli Thompson 有一篇[写给游戏开发者](http://www.html5rocks.com/en/tutorials/games/abouttracing/)的使用 about:tracing 分析 WebGL 游戏的文章，同时也适合 JavaScript 的开发者。

在 Chrome 的导航栏里可以输入 about:memory，同样十分实用，可以获得每个 tab 页的内存使用情况，对定位内存泄漏很有帮助。

## 总结 ##

我们看到，JavaScript 的世界中有很多隐藏的陷阱，而且并没有提升性能的银弹。只有把一些优化方案综合使用到（现实世界）测试环境，才能获得最大的性能收益。即便如此，了解引擎是如何解释和优化代码，可以帮助你调整应用程序。

**测量**，**理解**，**修复**。不断重复这个过程。

![](http://bubkoo.qiniudn.com/barometer.jpg)

谨记关注优化，但为了便利也可以舍弃一些很小的优化。例如，有些开发者选择 `forEach` 和 `Object.keys` 代替 `for` 和 `for..in` 循环，尽管这会更慢但使用起来更方便。要保持清醒的头脑，知道什么优化是需要的，什么优化是不需要的。

同时注意，虽然 JavaScript 引擎越来越快，但下一个真正的瓶颈是 DOM。回流和重绘的减少也是重要的，所以必要时再去操作 DOM。还有就是要关注网络，HTTP 请求是珍贵的，特别是移动终端上，因此要使用 HTTP 的缓存去减少资源的加载。

记住以上这几点，你就已经获取了本文的大部分信息，希望对你有所帮助！