title: ECMA-262-3 详解 第八章 求值策略
tags: [ECMA-262-3, ECMAScript, Evaluation strategy]
categories: [JavaScript]
date: 2014-07-13 23:22:39
keywords:
---

此文译自 [Dmitry A. Soshnikov](http://dmitrysoshnikov.com/) 的 [ECMA-262-3 in detail. Chapter 8. Evaluation strategy](http://dmitrysoshnikov.com/ecmascript/chapter-8-evaluation-strategy/).

## 概述

本文将讨论在 ECMAScript 中向函数传递参数的策略。

计算机科学里对这种策略一般称为“evaluation strategy”，即在编程语言中求解或计算某些表达式的值的一系列规则。将参数传递给函数是其中的一个案例。

写这篇文章的原因是因为论坛上有一些类似的讨论，大家都呼吁给出 ECMAScript 中参数传递策略的最精确的说明。本文给出了相应的定义，希望对大家有所帮助。

很多程序员都确信在 JavaScript 中（甚至其它一些语言)，对象是按引用传参，而原始值类型按值传参，此外，很多文章和书籍都说到这个“事实”，但有多人真正理解这个术语，而且又有多少是正确的？我们本篇讲逐一讲解。

<!--more-->

## 概论

需要注意的是，一般有 2 中赋值策略：严格，意思是说参数在进入程序之前是经过计算过的；非严格，意思是参数的计算是根据计算要求才去计算（也就是相当于延迟计算）。

然而，我们这里讨论的是基本的函数传参策略，从 ECMAScript 出发点来说是非常重要的。

首先需要知道，在 ECMAScript 中（甚至其他语言，诸如  C，JAVA，Python 和 Ruby 中）都是用了严格的参数传递策略。

另外，参数的计算顺序也是非常重要的，在 ECMAScript 中是从左到右的，而在其他一些语言的实现是从右自左的。

严格的传参策略也分为几种子策略，其中最重要的一些策略我们在本章详细讨论。

下面讨论的策略不是全部都用在 ECMAScript 中，所以在讨论这些策略的具体行为的时候，我们使用了伪代码来展示。

### 按值传递

很多开发人员知道这种策略。参数的值是调用者（caller）传递的对象值的拷贝，函数内部改变参数的值不会影响到函数外部的对象。一般来说，通过重新分配内存（这里不关注重新分配内存是如何实现的 -- 可以是堆栈或动态内存分配的方式），将外部对象的值拷贝到新分配的内存，并用于函数内部的计算。

```js
bar = 10
 
procedure foo(barArg):
  barArg = 20;
end
 
foo(bar)
 
// foo内部改变值不会影响内部的bar的值
print(bar) // 10
```

但是，如果参数不是原始值，而是一个负复杂的对象，将带来很大的性能问题，C++就有这个问题，将结构作为值传进函数的时候 —— 就是完整的拷贝。

我们来给一个一般的例子，假设一个函数接受两个参数，第一个是对象的值，第二个是一个布尔标志，用来标记是否完全（给对象重新赋值）修改传入的对象，还是只修改对象中的某些属性。

```js
// 注：以下都是伪代码，不是JS实现
bar = {
  x: 10,
  y: 20
}
 
procedure foo(barArg, isFullChange):
 
  if isFullChange:
    barArg = {z: 1, q: 2}
    exit
  end
 
  barArg.x = 100
  barArg.y = 200
 
end
 
foo(bar)
 
// 按值传递，外部的对象不被改变
print(bar) // {x: 10, y: 20}
 
// 完全改变对象（赋新值）
foo(bar, true)
 
//也没有改变
print(bar) // {x: 10, y: 20}, 而不是{z: 1, q: 2}
```

### 按引用传递

按引用传递接收的不是值的拷贝，而是对象的隐式引用，也就是该对象在外部的直接引用地址。函数内部对参数的任何改变都是影响该对象在函数外部的值，因为两者引用的是同一个对象，也就是说：这时候参数就相当于外部对象的一个别名。

伪代码：

```js
procedure foo(barArg, isFullChange):
 
  if isFullChange:
    barArg = {z: 1, q: 2}
    exit
  end
 
  barArg.x = 100
  barArg.y = 200
 
end
 
// 使用和上例相同的对象
bar = {
  x: 10,
  y: 20
}
 
// 按引用调用的结果如下： 
foo(bar)
 
// 对象的属性值已经被改变了
print(bar) // {x: 100, y: 200}
 
// 重新赋新值也影响到了该对象
foo(bar, true)
 
// 此刻该对象已经是一个新对象了
print(bar) // {z: 1, q: 2}
```

该策略可以更有效地传递复杂对象，例如带有大量属性的大结构对象。

### 按共享传递

大家都熟知上面两个策略，而这个策略可能大家不太了解（确切地讲，它是学术上的策略）。但是，就像我们很快就会看到的那样，这正是在 ECMAScript 参数传递策略中起着关键作用的策略。

这个策略还有一些代名词：“按对象传递”或“按对象共享传递”。

该策略是 1974 年由 Barbara Liskov 为 CLU 编程语言提出的。

该策略的要点是：函数接收的是对象引用的拷贝，该引用拷贝和形参以及其值相关联。

这里出现的引用，我们不能称之为“按引用传递”，因为函数接收的参数不是直接的对象别名，而是该引用地址的拷贝。

最重要的区别就是：函数内部给参数重新赋新值不会影响到外部的对象（按引用传递会改变）。但是，由于形参拥有地址拷贝，和外部指向同一个对象（也就是说，外部对象并不是像按值传递那样完整拷贝），改变参数对象的*属性值*将会影响到外部的对象。

```js
procedure foo(barArg, isFullChange):
 
  if isFullChange:
    barArg = {z: 1, q: 2}
    exit
  end
 
  barArg.x = 100
  barArg.y = 200
 
end

//还是使用这个对象结构
bar = {
  x: 10,
  y: 20
}
 
// 按共享传递会影响对象 
foo(bar)
 
// 对象的属性被修改了
print(bar) // {x: 100, y: 200}
 
// 重新赋值没有起作用
foo(bar, true)
 
// 依然是上面的值
print(bar) // {x: 100, y: 200}
```

这个策略假定参数是对象而不是原始值。

<p class="j-quote">可以在 [Lexical Environments](http://dmitrysoshnikov.com/ecmascript/es5-chapter-3-1-lexical-environments-common-theory/) 这篇文章的 [Name binding](http://dmitrysoshnikov.com/ecmascript/es5-chapter-3-1-lexical-environments-common-theory/#name-binding) 获取更多关于该策略的细节。 </p>

#### 按共享传递是按值传递的特例

按共享传递的策略在很多语言中都是用到了，比如 Java，ECMAScript，Python，Ruby，Visual Basic 等。

此外，Python 已经使用该策略。至于其他语言也可以用这个术语，因为其他的名称往往会让大家感觉到混乱。

大多数情况下，例如在 Java，ECMAScript 或 Visual Basic 中，这一策略也称之为按值传递 —— 意味着：特殊值 —— 引用拷贝（副本）。

一方面，传递给函数内部用的参数仅仅是绑定值（引用地址）的一个名称，并不会影响外部的对象。

另一方面，如果不深入研究，这些术语真的容易被误解，因为很多论坛都在说如何将对象传递给 JavaScript 函数。

一般理论确实有按值传递的说法：但这时候这个值就是我们所说的地址拷贝（副本），因此并没有破坏规则。

在 Ruby 中，这个策略称为按引用传递。再说一下：它不是按照结构的拷贝来传递（例如，不是按值传递)，而另一方面，我们没有处理原始对象的引用，并且不能修改它；因此，这个跨术语的概念可能更会造成混乱。

一般理论中没有按引用传递的特例的描述，而有按值传递的特例的。

然而，有必要理解上述提到的所有语言（Java，ECMAScript，Python，Ruby，其他）中所使用的术语，实际上都是*按共享传递*的策略。

#### 按共享策略与指针

对于 С/С++，这个策略在思想上和按指针值传递是一样的，但有一个重要的区别 —— 该策略可以取消引用指针以及完全改变对象。但在一般情况下，分配一个值（地址）指针到新的内存块（即之前引用的内存块保持不变）；通过指针改变对象属性的话会影响到外部对象。

因此，和指针类别，我们可以明显看到，这是按地址值传递。 在这种情况下，按共享传递只是“语法糖”，像指针赋值行为一样（但不能取消引用），或者像引用一样修改属性（不需要取消引用操作），有时候，它可以被命名为“安全指针”。

然而，С/С+ +如果在没有明显指针的解引用的情况下，引用对象属性的时候，还具有特殊的语法糖：

```cplus
obj->x instead of (*obj).x
```

和 C++ 关系最为紧密的这种意识形态可以从“智能指针”的实现中看到，例如，在 `boost::shared_ptr` 里，重载了赋值操作符以及拷贝构造函数，而且还使用了对象的引用计数器，通过 GC 删除对象。这种数据类型，甚至有类似的名字 -- 共享 _ptr。


## ECMAScript 实现

现在我们知道了 ECMAScript 中将对象作为参数传递的策略了 —— 按共享传递：修改参数的属性将会影响到外部，而重新赋值将不会影响到外部对象。但是，正如我们上面提到的，其中的 ECMAScript 开发人员一般都称之为是：按值传递，只不过该值是引用地址的拷贝。

JavaScript 发明人布伦丹·艾希也写到了：传递的是引用的拷贝（地址副本）。所以论坛里大家曾说的按值传递，在这种解释下，也是对的。

更确切地说，这种行为可以理解为简单的赋值，我们可以看到，内部是完全不同的对象，只不过引用的是相同的值 —— 也就是地址副本。

ECMAScript 代码：

```js
var foo = {x: 10, y: 20};
var bar = foo;
 
alert(bar === foo); // true
 
bar.x = 100;
bar.y = 200;
 
alert([foo.x, foo.y]); // [100, 200]
```

即两个标识符（名称绑定）绑定到内存中的同一个对象， 共享这个对象：

```js
foo value: addr(0xFF) => {x: 100, y: 200} (address 0xFF) <= bar value: addr(0xFF)
```

而重新赋值分配，绑定是新的对象标识符（新地址），而不影响已经先前绑定的对象 ：

```js
bar = {z: 1, q: 2};
 
alert([foo.x, foo.y]); // [100, 200] – 没改变
alert([bar.z, bar.q]); // [1, 2] – 但现在引用的是新对象
```

即现在 `foo` 和 `bar`，有不同的值和不同的地址：

```js
foo value: addr(0xFF) => {x: 100, y: 200} (address 0xFF)
bar value: addr(0xFA) => {z: 1, q: 2} (address 0xFA)
```

再强调一下，这里所说对象的值是地址，而不是对象结构本身，将变量赋值给另外一个变量 —— 是赋值值的引用。因此两个变量引用的是同一个内存地址。下一个赋值却是新地址，是解析与旧对象的地址绑定，然后绑定到新对象的地址上，这就是和按引用传递的最重要区别。

此外，如果只考虑 ECMA-262 标准所提供的抽象层次，我们在算法里看到的只有“值”这个概念，实现传递的“值”（可以是原始值，也可以是对象），但是按照我们上面的定义，也可以完全称之为“按值传递”，因为引用地址也是值。

然而，为了避免误解（为什么外部对象的属性可以在函数内部改变），这里依然需要考虑实现层面的细节 —— 我们看到的按共享传递，或者换句话讲 —— 按安全指针传递，而安全指针不可能去解除引用和改变对象的，但可以去修改该对象的属性值。


## 术语版本

让我们来定义 ECMAScript 中该策略的术语版本。

可以称之为“按值传递” —— 这里所说的值是一个特殊的值，也就是该值是地址副本。从这个层面我们可以说：ECMAScript 中除了异常之外的对象都是按值传递的，这实际上是 ECMAScript 抽象的层面。

分为如下两种情况时，可专门称之为“按共享传递”。1：原始值按值传递；2：对象按共享传递。通过这个正好可以看到传统的按值传递和按引用传递的区别。


## 总结

希望本文有助于大家对传值策略有个宏观的了解，并讨论了 ECMAScript 的传值策略。一如既往，如果有任何问题，欢迎讨论。

## 扩展阅读

External articles:

- [Evaluation strategy](http://en.wikipedia.org/wiki/Evaluation_strategy)
- [Call by value](http://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_value)
- [Call by reference](http://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_reference)
- [Call by sharing](http://en.wikipedia.org/wiki/Evaluation_strategy#Call_by_sharing)

ECMA-262-5 in detail:

- [Name binding](http://dmitrysoshnikov.com/ecmascript/es5-chapter-3-1-lexical-environments-common-theory/#name-binding) section of the [Lexical Environments](http://dmitrysoshnikov.com/ecmascript/es5-chapter-3-1-lexical-environments-common-theory/) chapter


<p class="j-dot">**Translated by:** Dmitry A. Soshnikov.
**Published on:** 2010-04-10

**Originally written by:** Dmitry A. Soshnikov [ru, [read »](http://dmitrysoshnikov.com/ecmascript/ru-chapter-8-evaluation-strategy/)]
**With additions by:** Zeroglif

**Originally published on:** 2009-08-11</p>
