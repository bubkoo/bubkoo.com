title: 理解和解决 IE 内存泄露问题
tags: [Leak, IE, Closures]
categories: [JavaScript]
date: 2015-01-31 00:04:06
keywords:
---

在过去，内存泄漏并没有为 Web 开发人员带来巨大的问题。页面保持着相对简单，并且在页面之间的跳转时可以释放内存资源，即便还存在内存泄露，那也是小到可以被忽略。

现在，新的 Web 应用达到更高的水准，页面可能运行数小时而不跳转，通过 Web 服务动态检索和更新页面。JavaScript 语言特性也被发挥到极致，通过复杂的事件绑定、面向对象和闭包等特性构成了整个 Web 应用。面对这些变化，内存泄露问题变得越来越突出，尤其是之前那些通过刷新（导航）隐藏的内存泄露问题。

庆幸的是，如果你知道如何排查问题，内存泄露可以很轻易地被清除。即便是面对一些最麻烦的问题，如果你知道解决方案，也只需要少量的工作。虽然页面仍可能存在一些小的内存泄露，但是那些最明显的可以轻易地被清除。

![Memory Leaks](http://bubkoo.qiniudn.com/memory-leak.jpg)

<!--more-->

## 内存泄露的形式

下面将讨论内存泄露的几种形式，并为每种形式列举了一些常见的例子。其中一个很好的例子是 JavaScript 的闭包特性，还有一个例子是在事件绑定中使用闭包，当你熟悉本示例后，你可以找到并修复许多内存泄露，同时也可能忽略一些其他和闭包相关的内存泄露问题。

我们先看看内存泄露的形式：

- 循环引用（Circular References） - 当 IE 浏览器的 COM 组件与脚本引擎对象之间相互引用时，将导致内存泄露，这是最常见的形式。
- 闭包（Closures） - 闭包是循环引用的特殊形式，也是目前 Web 架构中使用最多的一种语言特性。闭包很容易被发现，因为它们依赖于特定的语言关键字，可以通过简单的搜索来查找。
- 页面交叉泄露（Cross-Page Leaks） - 页面交叉泄漏其实是一种较小的泄漏，它通常在你浏览过程中，由于内部对象 book-keeping 引起。我们将讨论 DOM 插入顺序问题，在示例中你将发现只需要微小的改动就可以避免 book-keeping 对象的产生。
- 伪泄露（Pseudo-Leaks） — 严格来说并不算真正的内存泄露，不过如果你不了解它，你将会在可用内存越来越少时非常懊恼。为了演示这个问题，我们将通过重写 `script` 元素中的内容来引发大量内存的“泄漏”。

## 循环引用 Circular References

循环引用基本上是所有内存泄漏的根源。通常，脚本引擎通过垃圾回收机制（GC）来处理循环引用，但某些未知的因素可能阻止资源的释放。对于 IE 来说，未知因素可能是，脚本引擎无法得知某些 DOM 的状态，从而无法释放 DOM 所占用的内存。请看下图：

![图 1. 循环引用](http://bubkoo.qiniudn.com/Basic-Circular-Reference-Pattern.gif)

循环引用引起内存泄露的根源在于 COM 的引用计数。脚本引擎将维持对 DOM 对象的引用，直到所有的引用被移除（引用计数为 0）时才回收和清理 DOM 对象。在上面示例中，脚本引擎有两个引用：脚本引擎作用域和 DOM 对象的扩展（expando）属性，当终止脚本引擎时，第一个引用会被释放，DOM 对象引用由于在等待脚本引擎的释放而不会被释放。也许你会认为检测和修复这类问题非常简单，但这个示例只是问题的冰山一角。你可能会在 30 个对象链的末尾发生循环引用，这样的问题排查起来将是一场噩梦。

如果你想知道这种泄露的代码长什么样，请看下面代码：

```html
<html>
    <head>
        <script language="JScript">

        var myGlobalObject;

        function SetupLeak()
        {
            // First set up the script scope to element reference
            myGlobalObject =
                document.getElementById("LeakedDiv");

            // Next set up the element to script scope reference
            document.getElementById("LeakedDiv").expandoProperty =
                myGlobalObject;
        }


        function BreakLeak()
        {
            document.getElementById("LeakedDiv").expandoProperty =
                null;
        }
        </script>
    </head>

    <body onload="SetupLeak()" onunload="BreakLeak()">
        <div id="LeakedDiv"></div>
    </body>
</html>
```

在页面卸载前，将 DOM 对象的扩展属性赋值为 `null`，这样脚本引擎就知道对象之间的引用没有了，并能正常清理引用并释放 DOM 对象。值得一提的是，作为开发人员应该比脚本引擎更加清楚对象之间的引用关系。

这只是一种最基本的情况，循环引用可能还有更多更复杂的表现形式。在面向对象的 JS 中，一个通常用法是通过封装 JS 对象来扩充 DOM 对象，为了方便访问彼此，常常会把 DOM 对象的引用作为 JS 对象的属性，同时也会在 DOM 的扩展属性上保持着对 JS 对象的引用。这是一个非常直观的循环引用问题，但经常容易被忽略。要破坏这样的循环引用可能会更复杂，当然你也可以使用上面介绍的方式。


```html
<html>
    <head>
        <script language="JScript">

        function Encapsulator(element)
        {
            // Set up our element
            this.elementReference = element;

            // Make our circular reference
            element.expandoProperty = this;
        }

        function SetupLeak()
        {
            // The leak happens all at once
            new Encapsulator(document.getElementById("LeakedDiv"));
        }

        function BreakLeak()
        {
            document.getElementById("LeakedDiv").expandoProperty =
                null;
        }
        </script>
    </head>

    <body onload="SetupLeak()" onunload="BreakLeak()">
        <div id="LeakedDiv"></div>
    </body>
</html>
```

针对该问题还有更复杂的解决方案，在对象初始化时记录所有需要手动释放的元素和属性，然后在文档卸载前一并清理掉，但大多数时候你可能会再次造成其他内存泄漏，而问题并没有得到解决。

## 闭包 Closures

由于闭包经常会在不知不觉中创建出循环引用，所以它对内存泄露有不可推卸的责任。在闭包释放前，我们很难判断父函数的参数和局部变量能否被释放。事实上闭包已经成为一种很常见的变成策略，我们也经常会遇到闭包导致内存泄露这类问题，而可用的解决方案却很少。在详细了解闭包背后的问题和导致内存泄露的对象后，我们将结合循环引用的图示，找出那些泄露的对象。

![闭包引起的循环引用](http://bubkoo.qiniudn.com/Circular-References-with-Closures.gif)

通常，循环引用是由两个对象直接相互引用造成的，而闭包是从父函数的作用域带入间接引用。一般情况下，函数的局部变量和参数只能在该函数的生命周期中使用，一旦形成闭包，而闭包可以独立于父函数的生命周期而存在，并且这些变量和参数将会和闭包一同存在。在下面示例中，参数 1 在函数调用结束后会被正常释放。引入闭包后，将形成一个额外的引用，并且该引用在闭包释放前都不会被释放。如果你恰好将闭包函数放入了 DOM 事件的回调函数中，那么在事件回调返回前你必须手动清理该闭包。如果你将闭包作为 DOM 对象的一个扩展（expando）属性，那么你也需要将其设置为 `null` 来清除。

每次触发事件时都会创建出一个闭包，也就是说，当你触发两次事件时，就会得到两个独立的闭包，并且每个闭包都分别拥有对局部变量的引用：

```html
<html>
    <head>
        <script language="JScript">

        function AttachEvents(element)
        {
            // This structure causes element to ref ClickEventHandler
            element.attachEvent("onclick", ClickEventHandler);

            function ClickEventHandler()
            {
                // This closure refs element
            }
        }

        function SetupLeak()
        {
            // The leak happens all at once
            AttachEvents(document.getElementById("LeakedDiv"));
        }

        function BreakLeak()
        {
        }
        </script>
    </head\>

    <body onload="SetupLeak()" onunload="BreakLeak()">
        <div id="LeakedDiv"></div>
    </body>
</html>
```

处理这类问题不像处理一般循环引用那么简单，闭包被创建后，将被当作函数作用域中的一个局部对象，一旦函数执行完成，你将失去对闭包的引用。那么如果通过 `detachEvent` 方法来清除引用呢？在 Scott Isaacs 的 [MSN Spaces](http://spaces.msn.com/members/siteexperts/Blog/cns!1pNcL8JwTfkkjv4gg6LkVCpw!338.entry) 上有一个有趣的办法，将闭包保存在 DOM 对象的扩展属性上，当 `window` 执行 `unload` 事件时，解除事件绑定并清理扩展属性：

```html
<html>
    <head>
        <script language="JScript">

        function AttachEvents(element)
        {
            // In order to remove this we need to put
            // it somewhere. Creates another ref
            element.expandoClick = ClickEventHandler;

            // This structure causes element to ref ClickEventHandler
            element.attachEvent("onclick", element.expandoClick);

            function ClickEventHandler()
            {
                // This closure refs element
            }
        }

        function SetupLeak()
        {
            // The leak happens all at once
            AttachEvents(document.getElementById("LeakedDiv"));
        }

        function BreakLeak()
        {
            document.getElementById("LeakedDiv").detachEvent("onclick",
                document.getElementById("LeakedDiv").expandoClick);
            document.getElementById("LeakedDiv").expandoClick = null;
        }
        </script>
    </head>

    <body onload="SetupLeak()" onunload="BreakLeak()">
        <div id="LeakedDiv"></div>
    </body>
</html>
```

在[这篇文章](http://support.microsoft.com/default.aspx?scid=KB;EN-US;830555)中建议非必要时尽量不要使用闭包。文章中的示例演示了如何避免使用闭包，即把事件回调函数放到全局作用域中，当闭包函数成为普通函数后，它将不再继承其父函数的参数和局部变量，所以我们也就不用担心基于闭包的循环引用了。

## 页面交叉泄露 Cross-Page Leaks

由 DOM 插入顺序导致的内存泄露，大多数是因为创建的中间对象没有被清理干净引起的。将动态创建 DOM 元素插入到页面就是这样的例子，通过创建一个从子元素到父元素的临时作用域对象，将两个动态创建的元素附加在一起，然后将这两个元素添加到文档树中，这两个元素都将继承文档树的作用域对象，这样就导致刚刚创建的临时作用域对象泄露。下图展示了两种将新创建的元素附加到页面的两种方式。第一种方式是，依次将元素先添加到其父元素中，最后将整个子树添加到文档树中，如果同时满足其他条件，这种方式将导致中间对象的泄漏；另一种方式是，从上至下依次将动态创建的元素附加到文档数中，这样每次附加的元素都直接继承了原始文档树德作用域对象，从而不会生成任何中间对象，这种方式避免了潜在的内存泄露。

![图 3. DOM 插入顺序引发的内存泄漏](http://bubkoo.qiniudn.com/DOM-Insertion-Order-Leak-Model.gif)

接下来我们来看一个内存泄漏的例子，该泄漏对大多数内存泄漏探测算法是透明的。因为代码中并没有暴露任何公共的元素，并且泄漏的对象非常小，你可能永远不会注意到该问题。为了引发内存泄露，动态创建的元素必须包含一个内联函数的脚本，当将两个元素附加在一起再插入到页面时，就会导致临时创建的脚本对象泄漏。由于泄漏的内存很小，我们需要重复运行数千次才能看到效果。事实上，这些对象的内存泄漏仅有几 bytes。运行下面的例子，然后导航到一个空白页面，你可以看到两个版本内存消耗的区别。采用第一种方式时，内存消耗稍高。这就是页面交叉内存泄露，这些内存将直到重启 IE 进程才会被销毁。如果采用第二种方式，随便运行示例多少次，内存消耗将不会持续攀升，这样就修复了该内存泄露。

```html
<html>
    <head>
        <script language="JScript">

        function LeakMemory()
        {
            var hostElement = document.getElementById("hostElement");

            // Do it a lot, look at Task Manager for memory response

            for(i = 0; i < 5000; i++)
            {
                var parentDiv =
                    document.createElement("<div onClick='foo()'>");
                var childDiv =
                    document.createElement("<div onClick='foo()'>");

                // This will leak a temporary object
                parentDiv.appendChild(childDiv);
                hostElement.appendChild(parentDiv);
                hostElement.removeChild(parentDiv);
                parentDiv.removeChild(childDiv);
                parentDiv = null;
                childDiv = null;
            }
            hostElement = null;
        }


        function CleanMemory()
        {
            var hostElement = document.getElementById("hostElement");

            // Do it a lot, look at Task Manager for memory response

            for(i = 0; i < 5000; i++)
            {
                var parentDiv =
                    document.createElement("<div onClick='foo()'>");
                var childDiv =
                    document.createElement("<div onClick='foo()'>");

                // Changing the order is important, this won't leak
                hostElement.appendChild(parentDiv);
                parentDiv.appendChild(childDiv);
                hostElement.removeChild(parentDiv);
                parentDiv.removeChild(childDiv);
                parentDiv = null;
                childDiv = null;
            }
            hostElement = null;
        }
        </script>
    </head>

    <body>
        <button onclick="LeakMemory()">Memory Leaking Insert</button>
        <button onclick="CleanMemory()">Clean Insert</button>
        <div id="hostElement"></div>
    </body>
</html>
```

需要澄清的是，这里的解决方案违背了一些最佳实践。引发该泄漏的关键在于，动态创建的 DOM 元素包含内联的脚本。如果我们仍采用第一种方式，但元素上不包含任何脚本，将不会发生内存泄漏。在构建较大子树时，第二种方式效率更高，我们可以得到一个更优的解决方案。在第二种方案中，新创建的元素都没有绑定任何脚本，所以你可以放心地构建出子树，当将子树添加到文档树后，再回来绑定元素的事件，只要记住循环引用和闭包的原则，在你的代码中就不会产生新的内存泄漏。

需要指出的是，并不是所有内存泄漏都容易排查，就像 DOM 插入顺序这样的内存泄漏问题，问题本身非常小，需要通过数千次的迭代才会暴露出来。通常你会认为最佳实践是安全的，但上面示例表明，即便是最佳实践也可能会发生内存泄漏。而我们的解决方案是改进了最佳实践，甚至引入一个新的最佳实践方案来消除内存泄漏。

## 伪泄露 Pseudo-Leaks

## 总结



<p class="j-quote">原文：[Understanding and Solving Internet Explorer Leak Patterns](https://msdn.microsoft.com/en-us/library/bb250448.aspx)</p>