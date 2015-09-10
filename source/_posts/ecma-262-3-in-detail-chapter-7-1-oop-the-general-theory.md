title: ECMA-262-3 详解 第七章 面向对象(一)：概论
tags: [ECMA-262-3, ECMAScript, OOP, Prototype]
categories: [JavaScript]
date: 2014-06-21 18:57:22
keywords:
---

此文译自 [Dmitry A. Soshnikov](http://dmitrysoshnikov.com/) 的 [ECMA-262-3 in detail. Chapter 7.1. OOP: The general theory](http://dmitrysoshnikov.com/ecmascript/chapter-7-1-oop-general-theory/).

## 概述

本文主要讨论 ECMAScript 中面向对象编程。之前已经有大量的文章讨论过该话题了，但本文与那些文章不同，本文主要从理论方面来解析其内部原理。重点讨论对象创建算法，对象之间的关系（包含最基本的关系 -- 继承）是如何形成的，并给出了明确的定义（我希望这可以消除一些文章中对于 JavaScript 中 OOP 的疑虑和混乱）。

<!--more-->

## 概论、范式和思想

在开始讨论之前，有必要掌握一些 OOP 的基本特征，并弄清楚一些基本概念。

ECMAScript 支持包括结构化、面向对象、函数式、命令式等多重编程方式，某些情况下还支持面向对象的方式。但本文主要讨论面向对象编程，所以先给出 ECMAScript 中面向对象编程的定义：

> ECMAScript 是基于原型的面向对象编程语言。

基于原型和基于静态类的 OOP 有许多直接的差异，下面我们一起来看看这些差异。

### 基于原型和基于类的特征

注意，上一句话提到一个重点 -- 基于*静态类*，“静态”一词说明静态对象和静态类是强类型的（strong typing）。

我们常常在各种文章和论坛中看到，JavaScript 被称为是（和一般的 OOP 相比）“另类”、“不同的”，其主要原因就是“类 vs. 原型”。然而，在一些实现中（比如，基于动态类的 Python 和 Ruby）这区别并不是那么重要了（而且除了一些情况外，JavaScript 也不是如此地“另类”，尽管在一定的思想特性上区别确实存在）。但是更基本的是下面这对区别“静态 + 类 vs. 动态 + 原型”。的确，基于静态类的实现（比如C++，Java）以及它们相关的属性/方法解析的机制与基于动态原型的实现相比有着明显的不同。

让我们来看一下这些范式的基本理论和关键概念。

#### 基于静态类的模式

在基于类的模式中，有一个类（class）的概念，以及一个属于这个类的实例（instance）的概念。一个类的实例也常常被称为对象（objects）或范例（exemplars）。

##### 类和对象

类是实例（即对象）的一般性特征的抽象的集合。

"集合"是更数学化的说法，也可以称它为类型（type）或者类别（classification）。

示例：（这里和下面的那些例子将使用伪代码）

```js
C = Class {a, b, c} // class C, 拥有a,b,c三个特征
```

实例的特征是：属性（properties，对象的描述）和方法(methods，对象的行为)。

这些特征本身也可以被看作是对象：比如，一个属性是否可写，是否可配置，是否可设置（getter / setter），等等。

也就是说，对象储存的是一个*状态*（一个类中描述的所有属性的具体的值），而类定义的是它的实例的*严格不可改变的结构*（即存在的是这些还是另一些属性）和*严格不可改变的行为*（即存在的是这些还是另一些方法）。

```js
C = Class {a, b, c, method1, method2}
 
c1 = {a: 10, b: 20, c: 30} // 类C是实例：对象с1
c2 = {a: 50, b: 60, c: 70} // 类C是实例：对象с2，拥有自己的状态（也就是属性值）
```

##### 层次继承

为了提高代码重用率，一个类能扩展（extend）别的类，从而引入额外的属性。这种机制被称为（分层）继承 。

```js
D = Class extends C = {d, e} // {a, b, c, d, e}
d1 = {a: 10, b: 20, c: 30, d: 40, e: 50}
```

当实例调用方法时，通常会先在自身的类中查找该方法，如果没找到就到直接父类去查找，如果还没找到，就到父类的父类去查找，如果查到继承的顶部还没查到，那结果就是：该对象没有类似的行为，也没办法获取结果。

```js
d1.method1() // D.method1 (no) -> C.method1 (yes)
d1.method5() // D.method5 (no) -> C.method5 (no) -> no result
```

方法在继承中不会复制到子类中而是通过继承层次查找，而属性在继承中总是复制的。我们在上面类 `C` 的子类 `D` 的例子中能看到这一现象：类 `C` 的属性 `a`，`b`，`c` 被复制到 `D` 上，而使得 `D` 的结构是 `{a, b, c, d, e}`。然而方法 `{method1, method2}` 没有被复制，而是继承。因此，在这方面的内存的占用是和继承层次成正比的。其主要缺陷是，即使当前对象不需要父类类中的某些属性，它仍然将全部拥有它们。

##### 基于类的关键概念

因此，我们可以得到基于类模式的关键概念：

- 要创建一个对象，首先需要定义它的类
- 即对象根据它自己的”形象和相似性“分类（结构和行为）而创建
- 方法的解析是通过一条严格的直接的不可改变的继承链来处理的
- 子孙类（以及根据它们创建的对象）包含继承链中的所有属性（即使其中的一些属性对于它们而言是不必要的）
- 类在创建后不能改变（根据静态的模式）它的实例的任何特征（无论是属性还是方法）
- 实例（还是由于静态的模式）不能拥有与它的类结构和行为不同的，任何额外的行为或属性


#### 基于原型的模式

这里的基本概念是动态可变对象。

变动性（不只是值，还包括所有的特性）是和语言的动态性直接相关的。

对象能够独立储存它们全部的特性（属性和方法），而不需要类。

```js
object = {a: 10, b: 20, c: 30, method: fn};
object.a; // 10
object.c; // 30
object.method();
```

而且，由于动态性，它们可以简单地改变它们的特性（增加，删除，修改）：

```js
object.method5 = function () {...}; // 添加新方法
object.d = 40;   // 添加新属性 "d"
delete object.c; // 删除属性 "с"
object.a = 100;  // 修改属性 "а"
 
// 结果是: object: {a: 100, b: 20, d: 40, method: fn, method5: fn};
```

就是说，在赋值时，如果对象中不存在这个特性，那么特性被创建并初始化为传入值；如果特性已存在，则只是更新它的值。

在这种情况下，代码重用不是通过扩展类来实现的，（请注意，我们没有说类没办法改变，因为这里根本没有类的概念），而是通过原型来实现的。

> 原型是一个对象，它是用来作为其他对象的原始拷贝，或者作为辅助对象，以便当其他对象它们没有所需要的特性而原型对象中已有时，委托（delegate）原型中这些特性。

##### 基于委托的模式

任何对象都可以作为其他对象的原型，并且由于动态特性，对象可以在运行时动态地改变它的原型。

注意，现在我们考虑的是一般理论，而不涉及到具体的实现。当我们讨论到具体实现时（这里指 ECMAScript），我们会看到实现的一些独有特征。

实例（伪代码）：

```js
x = {a: 10, b: 20};
y = {a: 40, c: 50};
y.[[Prototype]] = x; // x是y的原型
 
y.a; // 40, 自身特性
y.c; // 50, 也是自身特性
y.b; // 20 – 从原型中获取: y.b (no) -> y.[[Prototype]].b (yes): 20
 
delete y.a; // 删除自身的"а"
y.a; // 10 – 从原型中获取
 
z = {a: 100, e: 50}
y.[[Prototype]] = z; // 将y的原型修改为z
y.a; // 100 – 从原型z中获取
y.e // 50, 也是从从原型z中获取
 
z.q = 200 // 添加新属性到原型上
y.q // 修改也适用于y
```

这个例子展示了和原型相关的重要特性和机制：当它作为辅助对象时，它的属性在其他对象中缺少相同属性时可以被委托使用。

这个机制被称为委托，并且基于它的原型模型是一个委托的原型（或基于委托的原型 ）。

引用的机制在这里称为发送一个消息给一个对象，当这个对象自身不能响应这个消息时，它委托它的原型（请求它应答这个消息）。

这个情况中的代码重用被称为基于委托的继承或者基于原型的继承。

由于任何对象都可以作为原型，这意味着原型也可以有它们自己的原型。这种原型间的连接组合被称为原型链。和静态类相似，原型链也是分级的（hierarchical），然而由于动态性，它可以很容易地重新排列，从而改变层级和结构。

```js
x = {a: 10}
 
y = {b: 20}
y.[[Prototype]] = x
 
z = {c: 30}
z.[[Prototype]] = y
 
z.a // 10
 
// z.a 在原型链里查到:
// z.a (no) ->
// z.[[Prototype]].a (no) ->
// z.[[Prototype]].[[Prototype]].a (yes): 10
```

如果一个对象和它的原型链不能响应发出的消息，对象能够激活一个相应的系统信号来处理它是否能够继续调度和委派给另一条链。

许多实现都有这个系统信号，包括基于动态类的系统：SmallTalk 中的 `#doesNotUnderstand`；Ruby 中的 `method_missing`；Python 中的 `__getattr__`；PHP 中的 `__call`；某种 ECMAScript 实现中的 `__noSuchMethod__`，等等。

示例（SpiderMonkey 的 ECMAScript 的实现）：

```js
var object = {
 
  // catch住不能响应消息的系统信号
  __noSuchMethod__: function (name, args) {
    alert([name, args]);
    if (name == 'test') {
      return '.test() method is handled';
    }
    return delegate[name].apply(this, args);
  }
 
};
 
var delegate = {
  square: function (a) {
    return a * a;
  }
};
 
alert(object.square(10)); // 100
alert(object.test()); // .test() method is handled
```

也就是说，和基于静态类的实现不同，当无法响应消息时，其结论是：目前的对象不具有所要求的特性，但是如果尝试从原型链里获取，依然可能得到结果，或者该对象经过一系列变化以后拥有该特性。

对于 ECMAScript，具体的实现就是：使用基于委托的原型。然而，正如我们将从规范和实现里看到的，他们也有自身的特性。

##### 串联模式

有必要说明几个符合定义的（即原型作为其他对象复制的原始对象）但没有在 ECMAScript 中使用的其他情况。

在这种情况下，当对象创建时，代码重用并不是通过委托（delegation），而是通过一个原型的实际拷贝。

这种使用原型的方式称为串联式原型。

当一个对象复制了它原型的所有特性之后，它可以像原型一样完全更改它的属性和方法（并且不像基于委托的原型模式中的修改原型特性那样，它的修改不会影响到现存的对象）。这种模式的优点是减少了调度和委托的时间，而缺点则是更多的内存占用。

##### “鸭子”类型

回到动态性上，与基于静态类的模式不同，在弱类型和动态对象模式中，某个对象是否具有完成某项工作的能力不是和它是哪个类型（类）相关，而是和它是否能响应某条消息相关（通过测试来确定它是否具有某种能力）。

示例：

```js
// 在基于静态来的模型里
if (object instanceof SomeClass) {
  // 一些行为是运行的
}
 
// 在动态实现里
// 对象在此时是什么类型并不重要
// 因为突变、类型、特性可以自由重复的转变。
// 重要的对象是否可以响应test消息 
if (isFunction(object.test)) // ECMAScript
 
if object.respond_to?(:test) // Ruby
 
if hasattr(object, 'test'): // Python
```

行话中，这被称为“鸭子类型（duck typing）”。就是说，我们可以通过检查对象在某一时刻所拥有的特性集合来识别它，而不是通过看它在层级中的位置或它属于哪种具体类型。（译注：“当我们看到一只鸟走起来像鸭子、游泳起来像鸭子、叫起来也像鸭子，那么这只鸟就可以被称为是鸭子”）。

##### 基于原型的模式的主要概念

那么，让我们来看下这个模式的主要特点：

- 基本概念是对象（而不用先定义它的类）
- 对象是完全动态和可变的（并且，理论上可以完全从一种类型变成另一种类型）
- 对象没有严格的类来描述它们的结构和行为，对象不需要类
- 然而，虽然没有类，但是对象可以有原型，以便于当它们自身不能应答消息时委托原型
- 对象的原型可以在运行时的任何时刻改变
- 在基于委托的模式中，改变原型的特性将会影响到和这个原型相关的所有对象
- 在串联式原型模式中，原型是对象克隆的原始拷贝，因此变得完全独立，改变原型的特性不会影响到根据它克隆出的对象
- 如果不能响应一个消息，可以发信号给调用者，以便于采取额外的措施（比如改变调度）
- 对象的识别可以不通过它们的层级位置或者它们属于哪个具体的类型，而是通过对当前拥有的特性（鸭子模型）

然而，我们还需要提到另一个模式。

#### 基于动态类的模式

上面例子里展示的区别“类 vs. 原型 ”在这个基于动态类的模型中不是那么重要（尤其当原型链不变的时候，为了更准确地区分，它就应当被看做是一种静态的（statics）类）。可以用 Python 或 Ruby（或其他类似的语言）为例。这两种语言都使用了基于动态类的范式。然而在某些方面，又能看到基于原型的实现的特征。

在下面的例子中我们能够看到，就像在基于委托的原型中那样，我们能增加一个类（原型），然后它将影响到和它相关的对象，我们也能在运行时动态地改变对象的类（提供一个新的委托对象），等等。

```Python
# Python
 
class A(object):
 
    def __init__(self, a):
        self.a = a
 
    def square(self):
        return self.a * self.a
 
a = A(10) # 创建实例
print(a.a) # 10
 
A.b = 20 # 为类提供一个新属性
print(a.b) # 20 – 可以在"a"实例里访问到
 
a.b = 30 # 创建a自身的属性
print(a.b) # 30
 
del a.b # 删除自身的属性
print(a.b) # 20 - 再次从类里获取（原型）
 
# 就像基于原型的模型
# 可以在运行时改变对象的原型
 
class B(object): # 空类B
    pass
 
b = B() # B的实例
 
b.__class__ = A # 动态改变类（原型）
 
b.a = 10 # 创建新属性
print(b.square()) # 100 - A类的方法这时候可用
 
# 可以显示删除类上的引用
del A
del B
 
# 但对象依然有隐式的引用，并且这些方法依然可用
print(b.square()) # 100
 
# 但这时候不能再改变类了
# 这是实现的特性
b.__class__ = dict # error
```

在 Ruby 中的情况也是类似的：使用的同样是完全动态的类（顺便说一句，与 ECMAScript 和 Ruby 不同，在当前版本的 Python 中，不能够增加内建的类/原型），我们能完全更改对象和类的特性（如果在类中增加属性或方法，这些改变将影响到现存的对象）；然而，它不能够动态地改变一个对象的类。

当然，由于这篇文章不是讲述 Python 和 Ruby 的，因此我们结束这些对比，然后开始讨论 ECMAScript。
 
但在这之前，我们仍需要来看一下一些 OOP 的实现中提供的附加的“语法糖”，因为相关的问题常常出现在 JavaScript 的文章中。

这一节主要用来让我们注意到下面说法是不正确的：“JavaScript 和 OOP 是不同的，它没有类，而只有原型”。我们有必要理解，并不是所有的基于类的实现都完全不同。并且，即使我们说“JavaScript 不同”，也有必要考虑到除了“类”的概念之外的其他相关特性。


### 各种OOP实现中的附加特性

在这一节中我们将快速浏览一下各种 OOP 实现中的附加特性以及代码重用的方式，和 ECMAScript 的 OOP 实现作一个对比。其原因是，在目前的一些 JavaScript 的文章中，OOP 的概念被局限在了一些习惯的实现方式上，而忽略了其他可能的不同实现方式；而这里的目的就是为了从语法和思路上证明这些被忽略的部分。当在某种（习惯的）实现方式上没有找到类似的“语法糖”时就草率地认为JavaScript 不是一个纯 OOP 语言，这是不正确的。

##### 多态 Polymorphism

ECMAScript 中的对象在一些意义上是多态的。

例如，一个函数可以应用于不同的对象，就像原生对象的特性（因为这个值在进入执行上下文时确定的）：

```js
function test() {
  alert([this.a, this.b]);
}
 
test.call({a: 10, b: 20}); // 10, 20
test.call({a: 100, b: 200}); // 100, 200
 
var a = 1;
var b = 2;
 
test(); // 1, 2
```

不过，也有例外：`Date.prototype.getTime()` 方法，根据标准这个值总是应该有一个日期对象，否则就会抛出异常。

```js
alert(Date.prototype.getTime.call(new Date())); // time
alert(Date.prototype.getTime.call(new String(''))); // TypeError
```

或者，参数多态性，即函数可以接受多态性参数（比如数组的 `.sort` 方法和它的参数 —— 各种排序函数），顺便说一句，上面的例子也可以认为是一种参数多态性。

或者，原型里方法可以被定义为空，所有创建的对象应重新定义（实现）该方法（即“一个接口（签名），多个实现”）。

多态和我们上面提到的“鸭子”类型是有关的：即对象的类型和在层次结构中的位置不是那么重要，如果它拥有所有必要的特征，它就可以被接受（即通用接口很重要，实现则可以多种多样）。

##### 封装 Encapsulation

关于封装，往往会有错误的看法。本节我们将讨论一些 OOP 实现里的语法糖 —— 也就是众所周知的修饰符：`private`, `protected` 和 `public`（*对象的访问级别*或*访问修饰符*）。

在这里我要提醒一下封装的主要目的：封装是一个抽象的增加，而不是选拔个直接往你的类里写入一些东西的隐藏“恶意黑客”。

这里有一个很大的错误：为了隐藏使用隐藏。

一些 OOP 实现中提供的访问等级（`private`, `protected`, `public`），最主要的是为了方便编程者（并且确实很方便）去更抽象地描述和构建系统。

这一点在一些实现中（比如上面提到过的 Python 和 Ruby）可以看到。一方面（在 Python 中），有 `__private` 和 `_protected` 属性（通过下划线的命名约定）可以用来禁止外部访问。另一方面，Python 又可以通过特殊的规则简单地重命名这些域（`_ClassName__field_name`），并通过这样的命名使得外部可以访问到。（译注：因此，封装的意义是为了抽象，而不是强制隐藏）

```Python
class A(object):
 
    def __init__(self):
      self.public = 10
      self.__private = 20
 
    def get_private(self):
        return self.__private
 
# outside:
 
a = A() # A的实例
 
print(a.public) # OK, 30
print(a.get_private()) # OK, 20
print(a.__private) # 失败，因为只能在A里可用
 
# 但在Python里，可以通过特殊规则来访问
 
print(a._A__private) # OK, 20
```

在 Ruby 中：一方面，可以定义私有和保护域的特性；另一方面，也有特殊的方法（比如`instance_variable_get`, `instance_variable_set`，等）来允许访问封装的数据。

```Ruby
class A
 
  def initialize
    @a = 10
  end
 
  def public_method
    private_method(20)
  end
 
private
 
  def private_method(b)
    return @a + b
  end
 
end
 
a = A.new # 新实例
 
a.public_method # OK, 30
 
a.a # 失败, @a - 是私有的实例变量
 
# "private_method"是私有的，只能在A类里访问
 
a.private_method # 错误
 
# 但是有特殊的元数据方法名，可以获取到数据
 
a.send(:private_method, 20) # OK, 30
a.instance_variable_get(:@a) # OK, 10
```

主要原因是：程序员本身希望访问到封装的（注意，这里我使用的词不是“隐藏的”）数据。并且如果这些数据被不正确地更改或者出现任何错误 —— 那完全是程序员的责任，而不是一个简单的“输入错误”或“有人随意改变了某些域”。但如果这样的情况（即访问封装的数据）频繁发生，那么我们可能还是需要注意到，这是一种*坏的编程习惯和风格*，因为通常而言最好只通过公共的 API 来和对象“交谈”。

重申一下，封装的基本目的，是将辅助的数据从用户端抽象出，而不是一种“创建防黑客的安全对象的方式”。在软件安全方面使用的是远比 `private` 修饰符更严格的措施。

通过封装辅助（局部）对象，我们为之后公共接口的行为改变提供了最小开支的可能性，将这些改变局部化并预测它们的位置。而这正是封装的主要目的。

同样，一个 `setter` 方法的主要目的是为了抽象那些复杂的计算。例如，`element.innerHTML setter` —— 我们简单地把语句抽象成 —— “现在，这个语句的 HTML 如下”，而在这个 `setter` 函数内部对 `innerHTML` 属性所做的将是复杂的运算和检查。这个情况下的问题主要是关于抽象，但是作为抽象度增加的封装过程也发生了。

封装的概念不仅和 OOP 相关。例如，它也可以是指一个简单的函数，封装了各种计算过程，而使得它能被抽象地使用（例如，对于用户来说不需要知道 `Math.round` 函数的内部实现，而只是简单地调用它）。这就是一个封装，并且注意，我并没有说到任何“私有、保护或者公共的”。

ECMAScript 在目前版本的规范中并没有定义 `private`，`protected`，`public` 修饰符。

然而，在实际中我们可能会看到一些“在 JS 中模拟封装”的说法。通常，使用封闭上下文来实现这个目的。但不幸的是，在实现这些“模拟”时，程序员们常常会生产出完全不抽象的 `getter`/`setter`（重复一下，这是不正确地理解封装）：

```js
unction A() {
 
  var _a; // "private" a
 
  this.getA = function _getA() {
    return _a;
  };
 
  this.setA = function _setA(a) {
    _a = a;
  };
 
}
 
var a = new A();
 
a.setA(10);
alert(a._a); // undefined, "private"
alert(a.getA()); // 10
```

这里，我们很容易理解，每一个创建的对象都会创建一对 `getA`/`setA` 方法，从而使得内存占用的问题直接和创建的对象数量成正比（如果方法定义在原型中则相反）。虽然，理论上可以通过联合对象来优化。

同样关于上面的方法，在一些关于 JavaScript 的文章中称为“特权方法”。为了澄清，注意，ECMAScript-262-3 中并没有定义任何“特权方法”的概念。

然而，它可以作为在构造函数中创建方法的一般方式，因为它符合这门语言的思路 —— 对象是完全可变的，并且拥有独立的特性（在构造函数中，可以通过条件语句来让一些对象获得某些方法而另一些对象没有，等等）。

此外，在 JavaScript 中，这种“隐藏”、“私有”的变量并非那么隐蔽（如果封装还是被误解为防止“恶意黑客”直接在某些域中写入值，而不是使用一个 `setter` 方法）。在一些实现器中（SpiderMonkey 1.7之前的版本），可以通过在 `eval` 函数中传入调用上下文来访问所需要的作用域链（并从而访问到其中的变量对象）：

```js
eval('_a = 100', a.getA); // 或者a.setA,因为"_a"两个方法的[[Scope]]上
a.getA(); // 100
```

或者，在某些实现器中允许直接访问活动对象（比如 Rhino），就可以通过访问活动对象上的相应属性来改变内部变量的值：

```js
// Rhino
var foo = (function () {
  var x = 10; // "private"
  return function () {
    print(x);
  };
})();
foo(); // 10
foo.__parent__.x = 20;
foo(); // 20
```

有时候，作为一种组织方式（也可以被视为一种封装）， JavaScript 中 `private` 和 `protected` 的数据通过一个前置的下划线来标识（但和 Python 中不同，这里只是为了命名上的方便）：

```js
var _myPrivateData = 'testString';
```

对于括号括住执行上下文是经常使用，但对于真正的辅助数据，则和对象没有直接关联，只是方便从外部的API抽象出来：

```js
(function () {
 
  // 初始化上下文
 
})();
```

##### 多重继承 Multiple inheritance

多重继承是提高代码重用率的一个方便的特性（如果我们能继承一个类，为什么不一次继承十个？）。然而，它有一些缺点，因此在实现中并不流行。

ECMAScript 不支持多重继承（换句话说，只有一个对象可以用作直接原型），虽然它的祖先 Self 编程语言是有这个特性的。不过，在一些实现器中，比如 SpiderMonkey 中，通过使用 `__noSuchMethod__`，可以管理调度和委派到另一条可选的原型链中。

##### 混入 Mixins

[混入（Mixins）](http://en.wikipedia.org/wiki/Mixin)也是代码重用的一种方便的方式。混入已经被建议作为多重继承的替代。独立的元素可以混入到其他任何对象，从而扩展它们的功能（就是说对象可以混入多个对象）。ECMAScript-262-3 规范中没有定义“混入”的概念，然而根据混入的定义，并且由于 ECMAScript 中的对象是动态可变的，因此没有任何东西阻止对象混入其他对象，而是简单地增加它的特性：

```js
// helper for augmentation
Object.extend = function (destination, source) {
  for (property in source) if (source.hasOwnProperty(property)) {
    destination[property] = source[property];
  }
  return destination;
};
 
var X = {a: 10, b: 20};
var Y = {c: 30, d: 40};
 
Object.extend(X, Y); // mix Y into X
alert([X.a, X.b, X.c, X.d]); 10, 20, 30, 40
```

注意，我们在定义“混入”上加引号是因为我们提到过 ECMA-262-3 中没有这样一个概念，而且事实上并不是一个混入，而是为一个对象扩展了新的特性（相反，比如在 Ruby 中，存在正式的混入概念，混入创建了相关模块的引用（换句话说，事实上创建了用于委托的额外的对象（原型）），而不只是简单地将模块中的所有属性复制到对象上）。

##### 性状 Traits

[性状（Traits）](http://en.wikipedia.org/wiki/Trait_(computer_science))和 Mixins 相似，然而有一些自身的特性（其中最根本的是，根据定义，Traits 和 Mixins 不同，它不能有状态，而后者可能引起命名冲突）。在 ECMAScript 中，Traits
也可以通过和 Mixins
一样的方式模拟，而标准中并没有定义“Traits”的概念。


##### 接口 Interfaces

和 Mixins 以及 Traits 一样，接口也是在一些 OOP 实现中提供的。然而，和 Mixins 以及 Traits 不同的是，接口要求（实现它们的）类完全实现接口中方法签名的行为。

接口可以被看作是完全抽象类。但是，和抽象类(可以自己实现部分方法，然后把其他的定义为签名)不同，一个类只能单一继承，但是可以实现多个接口；由于这一点，接口（和 Mixins 一样）可以作为多种继承的替代。

ECMAScript-262-3 标准中既没有定义“接口”，也没有定义“抽象类”。然而，作为模拟，可以为对象添加“空”方法（或者在方法中抛出一个异常，以表示这个方法应该被实现）。

##### 对象组合 Object composition

[对象组合（Object composition）](http://en.wikipedia.org/wiki/Object_composition)也是动态代码重用的一种技术。和继承不同，对象组合拥有更多的灵活性，并且实现了对动态可变代表的委托。而这一点反过来又成为基于委托的原型的基础。在动态可变原型中，对象可以聚集（其结果是创建了一个组合（composition）或者说，一个聚合（aggregation））其他对象以便于委托，然后当传递消息给对象时，委托这些对象。可以有多个委托，并且由于可变性，可以在运行时改变它们。

上面已经提到过的 `__noSuchMethod__` 方法可以作为一个例子，但是这里我们用另一个示例来说明如何准确使用委托：

```js
var _delegate = {
  foo: function () {
    alert('_delegate.foo');
  }
};
 
var agregate = {
 
  delegate: _delegate,
 
  foo: function () {
    return this.delegate.foo.call(this);
  }
 
};
 
agregate.foo(); // delegate.foo
 
agregate.delegate = {
  foo: function () {
    alert('foo from new delegate');
  }
};
 
agregate.foo(); // foo from new delegate
```

对象之间的这种关系被称为"has-a"，也就是说，是“内部包含”的关系而不是像继承那种“is-a”的关系。

明确组合的缺点（与继承相比的灵活性）是中间代码的增加。

AOP 特性 AOP features

[面向侧面编程（aspect-oriented programming）](http://en.wikipedia.org/wiki/Aspect-oriented_programming)的其中一个特性是函数修饰符。ECMA-262-3 中没有明确定义“函数修饰符”的概念（相反的，Python 中有正式的定义）。不过，拥有函数式参数的函数在某些方面是可以装饰和激活的（通过应用所谓的建议）：

最简单的装饰者例子：

```js
function checkDecorator(originalFunction) {
  return function () {
    if (fooBar != 'test') {
      alert('wrong parameter');
      return false;
    }
    return originalFunction();
  };
}
 
function test() {
  alert('test function');
}
 
var testWithCheck = checkDecorator(test);
var fooBar = false;
 
test(); // 'test function'
testWithCheck(); // 'wrong parameter'
 
fooBar = 'test';
test(); // 'test function'
testWithCheck(); // 'test function'
```

## 总结

在这篇文章，我们理清了 OOP 的概论（我希望这些资料已经对你有用了），下一章节我们将继续面向对象编程之 ECMAScript 的实现 。


## 扩展阅读

- [Using Prototypical Objects to Implement Shared Behavior in Object Oriented Systems (by Henry Lieberman)][ref1]
- [Prototype-based programming][ref2]
- [Class][ref3]
- [Object-oriented programming][ref4]
- [Abstraction][ref5]
- [Encapsulation][ref6]
- [Polymorphism][ref7]
- [Inheritance][ref8]
- [Multiple inheritance][ref9]
- [Mixin][ref10]
- [Trait][ref11]
- [Interface][ref12]
- [Abstract class][ref13]
- [Object composition][ref14]
- [Aspect-oriented programming][ref15]
- [Dynamic programming language][ref16]

[ref1]: http://web.media.mit.edu/~lieber/Lieberary/OOP/Delegation/Delegation.html\
[ref2]: http://en.wikipedia.org/wiki/Prototype-based_programming
[ref3]: http://en.wikipedia.org/wiki/Class_(computer_science)
[ref4]: http://en.wikipedia.org/wiki/Object-oriented_programming
[ref5]: http://en.wikipedia.org/wiki/Abstraction_(computer_science)
[ref6]: http://en.wikipedia.org/wiki/Encapsulation_(computer_science)
[ref7]: http://en.wikipedia.org/wiki/Type_polymorphism
[ref8]: http://en.wikipedia.org/wiki/Inheritance_(object-oriented_programming)
[ref9]: http://en.wikipedia.org/wiki/Multiple_inheritance
[ref10]: http://en.wikipedia.org/wiki/Mixin
[ref11]: http://en.wikipedia.org/wiki/Trait_(computer_science)
[ref12]: http://en.wikipedia.org/wiki/Interface_(computer_science)
[ref13]: http://en.wikipedia.org/wiki/Abstract_type
[ref14]: http://en.wikipedia.org/wiki/Object_composition
[ref15]: http://en.wikipedia.org/wiki/Aspect-oriented_programming
[ref16]: http://en.wikipedia.org/wiki/Dynamic_programming_language

<p class="j-dot">**Translated by:** Dmitry A. Soshnikov, with help of Juriy “kangax” Zaytsev.
**Published on:** 2010-03-04

**Originally written by:** Dmitry A. Soshnikov [ru, [read »](http://dmitrysoshnikov.com/ecmascript/ru-chapter-7-1-oop-general-theory/)]
**Originally published on:** 2009-09-12 [ru]</p>