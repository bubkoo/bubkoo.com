title: 如何将 npm 作为构建工具使用
tags:
  - npm
categories:
  - Tools
photos:
  - some photos
date: 2016-03-18 15:54:37
updated: 2016-03-18 15:54:37
keywords:
 - npm
 - build tools 
 - grunt
 - gulp

---

上个月，我在这篇文章[《为什么要停止使用 Grunt 和 Gulp》](http://blog.keithcirkel.co.uk/why-we-should-stop-using-grunt/)中建议大家使用 npm 作为替代方案，npm 的 `scripts` [配置](https://www.npmjs.org/doc/misc/npm-scripts.html)可以实现这些构建工具的所有功能，而且更简洁、更优雅和较少的模块依赖和维护开销。本文第一稿大概有 6000 字，深入讲解了如何将 npm 作为替代方案，但那篇文章主要在表达我的观点，而不是作为一篇教程。然而，读者的反馈却很强烈，许多读者告诉我 npm 并不能完全实现这些构建工具提供的特性，甚至有的读者直接给我一个 `Gruntfile`，然后反问我：“怎么用 npm 来实现这样的构建方案”？所以我决定进一步更新本文，将其作为一个新手入门教程，主要分享如何使用 npm 来完成一些常见的构建任务。

npm 是一个很好的工具，提供了一些奇特的功能，也是 NodeJS 的核心，包括我在内的很多人每天都在使用 npm，事实上在我的 Bash 历史记录中，npm 的使用频率仅次于 git。npm 更新也很快，旨在使 npm 成为一个强大的模块管理工具。而且，npm 有一个功能子集，可以通过运行一些任务来维护模块的生命周期，换句话说，它也是一个强大的构建工具。

<!--more-->

## scripts 配置

首先，我们需要搞清楚如何使用 npm 来管理构建脚本。作为核心命令之一的 `npm run-script` 命令（简称 `npm run` ）可以从 `package.json` 中解析出 `scripts` 对象，然后将该对象的键作为 `npm run` 的第一个参数，它会在操作系统的默认终端中执行该键对应的命令，请看下面的 `package.json` 文件：

```json
{
  "name": "myproject",
  "devDependencies": {
    "jshint": "latest",
    "browserify": "latest",
    "mocha": "latest"
  },
  "scripts": {
    "lint": "jshint **.js",
    "test": "mocha test/"
  }
}
```
如果运行 `npm run lint`，npm 将在终端中执行 `jshint **.js`，如果运行 `npm run test`，npm 将在终端中执行 `mocha test/`。执行 `npm run xxx` 时会将 `node_modules/.bin` 加入终端的 `PATH` 环境变量中，这样你就可以直接运行那些作为依赖安装的二进制模块，也就是说你不需要 `"./node_modules/.bin/jshint **.js"` 或 `"$(npm bin)/jshint **.js"` 这样来指定命令的路径。如果执行不带参数的 `npm run` 命令，它将列举出目前可执行的命令：

```
Available scripts in the user-service package:  
  lint
     jshint **.js
  test
    mocha test/
```

## 快捷命令

npm 为一些命令提供了快捷方式：`npm test`，`npm start` 和 `npm stop`，例如 `npm test` 就是 `npm run test` 的快捷命令，快捷命令存在的原因有二：

1. 这些是大多数项目都将使用的通用任务，所以不必每次都需要输入如此之多字符。
2. 更重要的是，这为测试、启动和停止模块提供了对应的标准接口。一些持续集成工具（比如 Travis）就充分利用了这一特性，将 `npm test` 作为 NodeJS 模块的默认命令。这也可以使开发者加入一个新项目更加容易，他们不需要阅读文档就知道可以运行像 `npm test` 这样的命令。

## 钩子

另一个炫酷的特性是，可以在 `scripts` 中为任何可执行的命令指定 `pre-` 和 `post-` 钩子。例如，当运行 `npm run lint` 时，即便是没有在 `scripts` 中定义对应的 `pre-` 命令，npm 也会首先执行 `npm run prelint`，接着才是 `npm run lint`，最后是 `npm run postlint`。

这个规则适用于所有命令，`npm test` 也一样（`npm run pretest`，`npm run test`，`npm run posttest`）。并且这些命令可以感知 `exit-code`，也就是说如果 `pretest` 命令退出时返回了非零的 `exit-code`，那么后续的 `test` 和 `posttest` 命令都不会继续执行。需要注意的是钩子不能嵌套，比如 `prepretest` 这样的命令将被忽略。

npm 也为一些内置命令（`install`，`uninstall`，`publish` 和 `update`）提供了钩子，用户不能重写这些内置命令的行为，但可以通过钩子来影响这些命令的行为：

```json
"scripts": {
    "lint": "jshint **.js",
    "build": "browserify index.js > myproject.min.js",
    "test": "mocha test/",

    "prepublish": "npm run build # also runs npm run prebuild",    
    "prebuild": "npm run test # also runs npm run pretest",
    "pretest": "npm run lint"
  }
```

## 传递参数

npm [2.0.0](http://blog.npmjs.org/post/98131109725/npm-2-0-0) 之后可以为命令传递参数，请看下面例子：

```json
"scripts": {
    "test": "mocha test/",
    "test:xunit": "npm run test -- --reporter xunit"
  }
```

我们可以直接运行 `npm run test` 也就是 `mocha test/`，我们还可以在命令后面加上 `--` 来传递自定义的参数，比如 `npm run test -- anothertest.js` 将运行 `mocha test/ anothertest.js`，一个更实用的例子是 `npm run test -- --grep parser`，将运行 `mocha test/ --grep parser`。这可以让我们将一些命令组合起来使用，并提供一些高级配置项。

## 定义变量

可以在 `package.json` 文件中的 [config](https://www.npmjs.org/doc/misc/npm-config.html#per-package-config-settings) 中指定任意数量的变量，然后我们可以在 `scripts` 中像使用环境变量一样来使用这些变量：

```json
"name": "fooproject",
  "config": {
    "reporter": "xunit"
  },
  "scripts": {
    "test": "mocha test/ --reporter $npm_package_config_reporter",
    "test:dev": "npm run test --fooproject:reporter=spec"
  }
```

在 `config` 中的所有属性都将加上 `npm_package_config_` 前缀暴露到环境变量中，在上面的 `config` 对象中有一个值为 `xunit` 的 `reporter` 属性，所以运行 `npm run test` 时，将执行 `mocha test/ --reporter xunit`。

可以通过如下两种方式来覆盖变量的值：

1. 和上例中的 `test:dev` 一样，可以通过 `--fooproject:reporter=spec` 将  `reporter` 变量的值指定为 `spec`。具体使用时，你需要将 `fooproject` 替换为你自己的项目名，同时将 `reporter` 替换为你需要替换的变量名。
2. 通过用户配置来覆盖，通过运行 `npm config set fooproject:reporter spec` 将会在 `~/.npmrc` 文件中添加 `fooproject:reporter=spec` 项，运行 npm 时将动态读取这些配置并且替换 `npm_package_config_reporter` 变量的值，这意味着运行 `npm run test` 将执行 `mocha test/ --reporter spec`。可以通过运行 `npm config delete fooproject:reporter` 来删除这些个人配置项。比较优雅的方式是在 `package.json` 文件中为变量指定一些默认值，同时用户可以在 `~/.npmrc` 文件中自定义某些变量的值。

老实说，我并不喜欢对这种定义和使用变量的方式，而且还有一个缺陷，那就是在 Windows 中引用变量是通过 `%` 加变量名，如果 `scripts` 中定义的是 NodeJS 脚本，并不会有什么问题，然而对于 shell 脚本却不能兼容。

## Windows 的问题

继续深入之前，我们先聊一个题外话。npm 依赖操作系统的 shell 作为其脚本运行的环境，Linux、Solaris、BSD 和 Mac OSX 都内置了 Bash 作为他们的默认 shell，而 Windows 却没有，在 Windows 中，npm 将使用 Windows 的命令行工具作为其运行环境。

但其实这也算不上什么大问题，在 Bash 中的许多语法可以在 Windows 中使用：

- `&&`
- `&`
- `<`
- `>`
- `|`

两者之间最大的问题在于，某些命令的命名不同（`cp` 和 Windows 中的 `COPY`）和变量的引用方式（Windows 中使用 `%` 引用变量，而 Bash 却是使用 `$`）。

## 替换构建工具

### Using multiple files

多文件

### Running multiple tasks

多任务，

### Streaming to multiple tasks

多任务之间的流

### Version Bumping

版本

### Clean

### Compiling files to unique names

### Watch

### LiveReload

### Running tasks that don't come with binaries

## 一个相对复杂的例子

## 结论

<p class="j-quote">quote</p>
<p class="j-dot">dot</p>
<p class="j-warning">warning</p>
<p class="j-sign">签名，右对齐</p>