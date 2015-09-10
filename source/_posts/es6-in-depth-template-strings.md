title: 深入解析 ES6：模板字符串
tags:
  - ES6
categories:
  - JavaScript
date: 2015-06-23 04:16:48
updated: 2015-06-23 04:16:48
keywords:
---

在 ES6 中引入了一种新的字符串字面量 -- 模板字符串，除了使用反引号 (`) 表示，它们看上去和普通的字符串没有什么区别。在最简单的情况下，他们就是普通的字符串：

```javascript
context.fillText(`Ceci n'est pas une chaîne.`, x, y);
```

之所以被称为模板字符串，是因为模板字符串为 JS 引入了简单的字符串插值特性，也就是说，可以方便优雅地将 JS 的值插入到字符串中。

<!--more-->

很多地方可以用到模板字符串，看下面这个不起眼的错误提示消息：

```javascript
function authorize(user, action) {
  if (!user.hasPrivilege(action)) {
    throw new Error(
      `User ${user.name} is not authorized to do ${action}.`);
  }
}
```

上面代码中，`${user.name}` 和 `${action}` 被称为*模板占位符*，JavaScript 将把 `user.name` 和 `action` 的值分别插到对应的位置上，然后生成像这样 "User jorendorff is not authorized to do hockey." 的字符串。

现在，我们看到了一个比 `+` 运算符更优雅的语法，下面是一些你期待的特性：

- 模板占位符可以是任何 JavaScript 表达式，所以函数调用和四则运算等都是合法的。（甚至你还可以在一个模板字符串中嵌套另一个模板字符串。）
- 如果一个值不是字符串，它将被转换为字符串。例如，如果 `action` 是一个对象，那么该对象的 `.toString()` 将被调用，来将其转换为字符串。
- 如果你想在模板字符串中使用反引号，你需要使用反斜杠 `\` 将其转义。
- 同样地，如果想在模板字符串中输出 `${`，也需要使用反斜杠将其转义：`\${` 或 `$\{`。

- 模板字符串可以跨越多行：

```javascript
$("#warning").html(`
  <h1>Watch out!</h1>
  <p>Unauthorized hockeying can result in penalties
  of up to ${maxPenalty} minutes.</p>
`);
```

- 模板字符串中所有的空格、换行和缩进，都将被原样输出到结果字符串中。

下面我们来看看模板字符串**做不到的事情**：

- 不会自动转义特殊字符，为了避免[跨站脚本漏洞](http://www.techrepublic.com/blog/it-security/what-is-cross-site-scripting/)，你还是需要小心对待不可信的数据，这一点上与普通字符串一样。
- 不能与国际化库配合使用，不处理特殊语言格式的数字、日期等。
- 不是模板引擎（比如 [Mustache](https://mustache.github.io/) 或 [Nunjucks](https://mozilla.github.io/nunjucks/)）的替代品。模板字符串没有处理循环的语法 -- 不能通过一个数组构建出一个表格（table）。

为了解决这些限制，ES6 为开发者和库设计者提供了另一种模板字符串 -- *标签模板*。

标签模板的语法很简单，只需要在开始的反引号前引入一个标签。看第一个例子：`SaferHTML`，我们要使用这个标签模板来解决上述的第一个限制：自动转义特殊字符。

需要注意的是，`SaferHTML` 方法并不是 ES6 标准库提供的，我们需要自己来实现：

```javascript
var message =
  SaferHTML`<p>${bonk.sender} has sent you a bonk.</p>`;
```

这里的 `SaferHTML` 标签是单个标识符，标签也可以是属性，比如 `SaferHTML.escape`，甚至还可以是方法调用：`SaferHTML.escape({unicodeControlCharacters: false})`。准确地说，任何 ES6 的[成员表达式或调用表达式](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-left-hand-side-expressions)都可以作为标签。

可以看出，模板字符串仅仅是字符串连接的语法糖，而标签模板确是一个完全不同的东西：函数调用。

所以，上面代码等价于：

```javascript
var message =
  SaferHTML(templateData, bonk.sender);
```

其中 `templateData` 是一个不可变的字符串数组，由 JS 引擎基于源模板字符串生成，这里的数组含有两个元素，因为模板字符串被占位符分隔后含有两个字符串，因此，`templateData` 将是这样： ` Object.freeze(["<p>", " has sent you a bonk.</p>"]`

（事实上，`templateData` 上还有另一个属性：`templateData.raw`，本文并深入不讨论该属性。该属性的值也是一个数组，包含了标签模板中所有的字符串部分，但字符串中包含了转义序列，看上去更像源代码中的字符串，比如 `\n`。ES6 的内置标签 [`String.raw`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/raw) 将使用这些字符串。）

这就使得 `SaferHTML` 方法可以随意解析这两个字符串，存在 N 中替换方式。

在继续阅读钱，你可能在苦苦思索如何实现 `SaferHTML` 方法。

下面是一种实现（[gist](https://gist.github.com/jorendorff/1a17f69dbfaafa2304f0)）：

```javascript
function SaferHTML(templateData) {
  var s = templateData[0];
  for (var i = 1; i < arguments.length; i++) {
    var arg = String(arguments[i]);

    // Escape special characters in the substitution.
    s += arg.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    // Don't escape special characters in the template.
    s += templateData[i];
  }
  return s;
}
```

有了上面的方法，即使使用一个恶意的用户名，用户也是安全的。

一个简单的例子并不足以说明标签模板的灵活性，让我们重温一下上面列举的模板字符串的限制，看看我们还可以做些什么。

- 模板字符串不会自动转义特殊字符，但是我们可以通过标签模板来解决这个问题，事实上我们还可以将 `SaferHTML` 这个方法写的更好。
  
  从安全角度来看，这个 `SaferHTML` 非常脆弱。在 HTML 中，不同的地方需要用不同的方式去转义，`SaferHTML` 并没有做到。稍加思考，我们就可以实现一个更加灵活的 `SaferHTML` 方法，能够将 `templateData` 中的任何一个 HTML 转义，知道哪个占位符是纯 HTML；哪个是元素的属性，从而需要对 `'` 和 `"` 转义；哪个是 URL 的 query 字符串，从而需要用 URL 的 escaping 方法，而不是 HTML 的 escaping；等等。
  
  这似乎有些牵强，因为 HTML 转义效率比较低。辛运是的，标签模板的字符串是保持不变的，`SaferHTML` 可以缓存已经转义过的字符串，从而提高效率。
  
- 模板字符串并没有内置的国际化特性，但通过标签模板，我们可以添加该特性。Jack Hsu 的[文章](http://jaysoo.ca/2014/03/20/i18n-with-es6-template-strings/)详细介绍了实现过程，看下面例子：
  
```javascript
i18n`Hello ${name}, you have ${amount}:c(CAD) in your bank account.`
// => Hallo Bob, Sie haben 1.234,56 $CA auf Ihrem Bankkonto.
```



  上面例子中的 `name` 和 `amount` 很好理解，将被 JS 引擎替换为对应的字符串，但是还有一个没有见过的占位符：`:c(CAD)`，这将被 `i18n` 标签处理，从 `i18n` 的文档可知：`:c(CAD)` 表示 `amount` 是加拿大美元货币值。

- 模板字符串不能替代 Mustache 和 Nunjucks 这类模板引擎，部分原因在于模板字符串不支持循环和条件语句。我们可以编写一个标签来实现这类功能：

```javascript
// Purely hypothetical template language based on
// ES6 tagged templates.
var libraryHtml = hashTemplate`
  <ul>
    #for book in ${myBooks}
      <li><i>#{book.title}</i> by #{book.author}</li>
    #end
  </ul>
`;
```

灵活性还不止于此，需要注意的是，标签函数的参数不会自动转换为字符串，参数可以是任何类型，返回值也一样。标签模板甚至可以不需要字符串，你可以使用自定义标签来创建正则表达式、DOM 树、图片、代表整个异步进程的 Promise、JS 数据结构、GL 着色器...

**标签模板允许库设计者创建强大的领域特定语言**。这些语言可能看上去并不像 JS，但他们可以无缝嵌入到 JS 中，并且可以与语言的其余部分进行交互。顺便说一下，我还没有在其他语言中见过类似的特性，我不知道这个特性讲给我们带来些什么，但各种可能性还是非常令人兴奋的。


<p class="j-quote">参考原文：[ES6 In Depth: Template strings](https://hacks.mozilla.org/2015/05/es6-in-depth-template-strings-2/)
原文作者：[Jason Orendorff](https://hacks.mozilla.org/author/jorendorffmozillacom/) 
原文日期：2015-05-14 16:41</p>