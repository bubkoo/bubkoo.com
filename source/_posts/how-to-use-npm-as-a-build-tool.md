title: 如何将 npm 作为构建工具使用
tags:
  - npm
categories:
  - Tools
photos:
  - http://bubkoo.qiniudn.com/images/npm-logo.png
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

## 自定义变量

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

老实说，我并不喜欢对这种定义和使用变量的方式，而且还有一个缺陷，那就是在 Windows 中引用变量是通过 `%` 加变量名，如果 `scripts` 中定义的是 NodeJS 脚本，并不会有什么问题，然而对于 shell 脚本却不兼容。

## Windows 的问题

继续深入之前，我们先聊一个题外话。npm 依赖操作系统的 shell 作为其脚本运行的环境，Linux、Solaris、BSD 和 Mac OSX 都内置了 Bash 作为他们的默认 shell，而 Windows 却没有，在 Windows 中，npm 将使用 Windows 的命令行工具作为其运行环境。

但这也算不上什么大问题，Bash 和 Windows 中的许多语法都一样：

- `&&` 连续执行多个命令，前面的命令执行成功后才执行后面的命令
- `&` 连续执行多个命令，不管前面命令执行成功没有，后面的命令将继续执行 
- `<` 使命令从文件读入 
- `>` 把命令的输出重定向到文件中
- `|` 把命令的输出重定向到下一个命令

最大的问题在于，某些命令的命名不同（`cp` 和 Windows 中的 `COPY`）和变量的引用方式（Windows 中使用 `%` 引用变量，而 Bash 却是使用 `$`）。但这些问题都是可以解的：

1. 对于某些特殊的命令，我们可以不使用系统内置的命令，而是使用具有相同功能的 npm 模块。例如我们可以使用 [rimraf](https://www.npmjs.org/package/rimraf) 这个模块来替代内置的 `rm` 命令。
2. 只使用那些跨平台兼容的语法，即便是仅仅使用 `&&`，`>`，`|` 和 `<` 这些语法就可以完成很多令人惊讶的功能。环境变量的引用只是冰山一角。


## 如何替换构建工具

现在我们回归正题，如果我们想要替换 Grunt 和 Gulp 这样的构建工具，我们需要实现这些构建工具及其插件的对等功能。我从各种项目和上篇文章的评论中收集了一些最流行的构建任务，下面我将演示如何通过 npm 来实现这些任务。

### 多文件处理

在上一篇文章的评论中有几个人提到：构建工具的一个优势是可以使用 `*.js`， `*.min.css` 或 `assets/*/*` 这样的 **globs** 语法来进行多文件处理。事实上这个特性的灵感来源于 Bash 中的 `glob` 命令。 Shell 会将命令参数（如 `*.js`）中的星号解析为通配符，使用连续两个星号表示跨目录递归查询。如果你正在使用 Mac 或 Linux，你可以在终端中玩一下，比如 `ls *.js`。

现在的问题是，Windows 的命令行并不支持该特性。新运的是，Windows 会将参数（如 `*.js`）逐字完整地传递给命令，这样就可以为 Windows 安装对应的兼容库就可以实现 `glob` 语法。在 npm 中有两个最流行的 `glob` 包 [minimatch](https://www.npmjs.org/package/minimatch) 和 [glob](https://www.npmjs.org/package/glob)，已经被 `1500` 多个项目依赖，包括 JSHint，JSCS，Mocha，Jade，Stylus，Node-Sass...等等，而且这个数量还在增长。

这样你就可以在 `scripts` 中直接使用 `glob` 语法了：

```json
"devDependencies": {
  "jshint": "latest"
},
"scripts": {
  "lint": "jshint *.js"
}
```

### 执行多任务

在 Grunt 和 Gulp 中可以将一些任务组合起来成为一个新的命令，尤其是在构建或测试时非常实用。在 npm 中有两种方式可以解这个问题：一是通过 `pre-` 和 `post-` 钩子，如果在执行某个任务之前需要执行某个任务（如压缩之前合并文件），这是个不错的选择；另外你还可以实用 `&&` 这个命令连接符：

```json
"devDependencies": {
  "jshint": "latest",
  "stylus": "latest",
  "browserify": "latest"
},
"scripts": {
  "lint": "jshint **",
  "build:css": "stylus assets/styles/main.styl > dist/main.css",
  "build:js": "browserify assets/scripts/main.js > dist/main.js",
  "build": "npm run build:css && npm run build:js",
  "prebuild:js": "npm run lint"
}
```

上例中 `build` 包含了 `build:css` 和 `build:js` 两个任务，并且在执行 `build:js` 前将先执行 `lint` 任务。独立执行 `build:css` 或 `build:js` 也是可行的，单独执行 `build:js` 前也会先执行 `lint`。所以我们可以像这样来组合我们的任务，并且这是 Windows 兼容的。

### 使用数据流

Gulp 一个最大的特性是使用流将一个任务的输出 **pipe** 到下一个任务（Grunt 需要频繁地读取和保存文件）。在 Bash 和 Windows 的命令行中都有 `|` 这个管道操作符，可以用来将一个命令的输出（`stdout`）作为下一个命令的输入（`stdin`）。比方说对一个 CSS 文件，你想先通过 [Autoprefixer](https://github.com/postcss/autoprefixer) 处理，然后 [CSSMin](https://github.com/jbleuzen/node-cssmin)，最后保存到文件：

```json
"devDependencies": {
  "autoprefixer": "latest",
  "cssmin": "latest"
},
"scripts": {
  "build:css": "autoprefixer -b 'last 2 versions' < assets/styles/main.css | cssmin > dist/main.css"
}
```

就像你看到的那样，首先通过 `autoprefixer` 为我们的 CSS 添加浏览器厂商前缀，然后将其输出 **pipe** 到 `cssmin` 来压缩我们的 CSS，最后将整个输出保存到 `dist/main.css` 文件。绝大多数工具都支持 `stdin` 和 `stdout`，而且上述代码可以在 Windows，Mac 和 Linux 平台下完美兼容。

### 版本号

版本号管理是 Grunt 和 Gulp 中的一个常见任务，可以方便地将 `package.json` 中的版本号加一，为项目打 Tag 和 Commit。

npm 的一个核心功能就是版本管理，运行 `npm version patch` 就可以增加修订版本号：`1.1.1 -> 1.1.2`，运行 `npm version minor` 可以增加次要版本号：`1.1.1 -> 1.2.0`，运行 `npm version major` 可以增加主版本号：`1.1.1 -> 2.0.0`，这几个命令将自动为你的项目打 Tag 和 Commit，就剩下 `git push` 和 `npm publish` 了。

还可以自定义这几个命令的行为。如果不想为项目打 Tag，你可以在命令后面加上 `--git-tag-version=false`，或者通过 `npm config set git-tag-version false` 将其设置为默认项。如果想自定义提交信息呢？可以这样 `npm version patch -m "Bumped to %s"`，或直接设置为默认项 `npm config set message "Bumped to %s"`。甚至可以通过 `--sign-git-tag=true` 为 Tag 签名，也可以通过 `npm config set sign-git-tag true` 将其设置为默认项。

### 清理

很多构建工具都会有一个 `clean` 任务，用来清理构建过程或构建后生成的文件，在 Bash 中自带了一个清理命令 `rm`，在命令后面加上 `-r` 参数可以递归删除目录。这个命令再简单不过了：

```json
"scripts": {
  "clean": "rm -r dist/*"
}
```

如果想兼容 Windows 可以使用 [rimraf](https://www.npmjs.org/package/rimraf) 这个平台无关的兼容模块：

```json
"devDependencies": {
  "rimraf": "latest"
},
"scripts": {
  "clean": "rimraf dist"
}
```

### 文件名 Hash 化

在 Grunt 和 Gulp 分别有 [grunt-hash](https://www.npmjs.org/package/grunt-hash) 和 [gulp-hash](https://www.npmjs.org/package/gulp-hash) 两个插件，用来根据文件的内容生成一个 hash 化后的文件名。要用已有的命令来实现这个功能还是比较难，我搜索了 npm 模块，也没有找到具有相同功能的模块，所以最后我自己实现了一个 - [hashmark](https://github.com/keithamus/hashmark)。该支持流操作，可以作为某些 Grunt/Gulp 插件的依赖项。继续之前的例子，我们可以将构建结果 **pipe** 到一个具有 hash 值文件名的文件中：

```json
"devDependencies": {
  "autoprefixer": "latest",
  "cssmin": "latest"
},
"scripts": {
  "build:css": "autoprefixer -b '> 5%' < assets/styles/main.css | cssmin | hashmark -l 8 'dist/main.#.css'"
}
```

现在执行 `build:css` 任务将得到一个类似 `dist/main.3ecfca12.css` 这样的文件。

### Watch

这也是 Grunt/Gulp 备受欢迎的原因之一，很多构建工具都支持监视文件系统的变化然后执行相应的构建或刷新任务，这在开发过程中非常实用。这也是在上篇文章中许多开发者关注的问题之一，他们认为如果没有 `watch` 类似的任务就黯然失色了。

好吧，其实很多工具自身就提供了这个选项，可以用于监听复杂的文件系统。比如 [Mocha](https://www.npmjs.org/package/mocha) 就提供了 `-w` 选项，还有 [Stylus](https://www.npmjs.org/package/stylus)、[Node-Sass](https://www.npmjs.org/package/node-sass)、[Jade](https://www.npmjs.org/package/jade) 和 [Karma](https://www.npmjs.org/package/karma) 等等。你可以这样使用：

```json
"devDependencies": {
  "mocha": "latest",
  "stylus": "latest"
},
"scripts": {
  "test": "mocha test/",
  "test:watch": "npm run test -- -w",

  "css": "stylus assets/styles/main.styl > dist/main.css",
  "css:watch": "npm run css -- -w"
}
```

当然，并不是所有工具都提供了该选项，就算都有这个选项，有时候你还希望在文件变化时触发某个任务集合，不用担心，有很多模块可以监视文件变化，并在文件变化是触发某个命令，比如 [watch](https://www.npmjs.org/package/watch)、[onchange](https://www.npmjs.org/package/onchange)、 [dirwatch](https://www.npmjs.org/package/dirwatch) 这些模块，甚至可以用 [nodemon](https://github.com/remy/nodemon)：

```json
"devDependencies": {
  "stylus": "latest",
  "jade": "latest",
  "browserify": "latest",
  "watch": "latest",
},
"scripts": {
  "build:js": "browserify assets/scripts/main.js > dist/main.js",
  "build:css": "stylus assets/styles/main.styl > dist/main.css",
  "build:html": "jade assets/html/index.jade > dist/index.html",
  "build": "npm run build:js && npm run build:css && npm run build:html",
  "build:watch": "watch 'npm run build' .",
}
```

就是这么简单，仅仅 13 行配置就可以监视整个项目文件，当任何文件改变时就自动执行构建 HTML、CSS 和 JS 的任务，直接执行 `npm run build:watch` 就可以开始无痛开发了。使用一个我写的模块 [Parallelshell](https://www.npmjs.org/package/parallelshell)，用于并发执行多个命令，我们还可以做一些优化：

```json
"devDependencies": {
  "stylus": "latest",
  "jade": "latest",
  "browserify": "latest",
  "watch": "latest",
  "parallelshell": "latest"
},
"scripts": {
  "build:js": "browserify assets/scripts/main.js > dist/main.js",
  "watch:js": "watch 'npm run build:js' assets/scripts/",
  "build:css": "stylus assets/styles/main.styl > dist/main.css",
  "watch:css": "watch 'npm run build:css' assets/styles/",
  "build:html": "jade index.jade > dist/index.html",
  "watch:html": "watch 'npm run build:html' assets/html",
  "build": "npm run build:js && npm run build:css && npm run build:html",
  "build:watch": "parallelshell 'npm run watch:js' 'npm run watch:css' 'npm run watch:html'",
}
```

运行 `npm run build:watch` 时将通过 [Parallelshell](https://www.npmjs.org/package/parallelshell) 分别运行独立的监视任务，如果只有 CSS 文件发生了变化，那么将只执行 CSS 构建任务。[Parallelshell](https://www.npmjs.org/package/parallelshell) 将每个任务的输出（`stdout` 和 `stderr`）连接到主进程，并监听了 `exitCode` 来确保构建任务的日志输出（这与 `&` 这个命令连接符不同）。

### LiveReload

LiveReload 也是一个很受欢迎的特性：当文件变化时自动刷新浏览器中的页面，[live-reload](https://www.npmjs.org/package/live-reload) 这个 npm 模块可以实现这个功能，看下面例子：

```json
"devDependencies": {
  "live-reload": "latest",
},
"scripts": {
  "livereload": "live-reload --port 9091 dist/",
}
```

```html
<!-- In your HTML file -->  
<script src="//localhost:9091"></script>  
```

执行 `npm run livereload` 后，`dist/` 目录下的任何改变都将通知到你访问的 HTML 页面，并触发页面自动刷新。

### 自定义脚本

那么如果一个模块并没有提供相应的命令行工具，如 [favicon](https://www.npmjs.org/package/favicons)，该怎么办呢？我们可以自己写一段 JavaScript 脚本来执行相应的功能，这也正是 Grunt/Gulp 插件所做的事情，还可以给模块维护者提交 PullRequest 让他们提供一个命令行工具：

```js
// scripts/favicon.js
var favicons = require('favicons');  
var path = require('path');  
favicons({  
    source: path.resolve('../assets/images/logo.png'),
    dest: path.resolve('../dist/'),
});
```

```json
"devDependencies": {
  "favicons": "latest",
},
"scripts": {
  "build:favicon": "node scripts/favicon.js",
}
```

## 一个相对复杂的例子

在上篇文章的评论中有些人说我忽视构建工具的关键点：构建工具不仅仅是用于执行单个任务，更重要的是它们可以将单个任务连接起来成为复杂的构建流程。所以这里我就将上面演示过的例子组合起来成为一个复杂的构建任务，这和具有上百行代码的 `Gruntfile` 所做的事情一样。在本例中我想完成以下构建任务：

- Lint、Test 和编译 JS 文件，生成对应的 sourcemap，hash 化文件名，最后上传到  S3
- 将 Stylus 编译为一个独立的 Hash 化的 CSS 文件，生成对应的 sourcemap，并上传到  S3
- 为编译后测试添加 watcher
- 启动一个静态服务器，用于浏览和测试编译结果
- 为 CSS 和 JS 文件添加 livereload
- 设计一个与构建环境相关的总任务，将所有相关任务包括进来，这样就可以运行这个简单的命令来完成复杂的构建过程
- 自动打开浏览器并访问我们的测试页面

我将本例的完整代码放在 [npm-scripts-example](https://github.com/keithamus/npm-scripts-example) 这个代码库中，下面是我们最关注的部分：

```json
"scripts": {
    "clean": "rimraf dist/*",

    "prebuild": "npm run clean -s",
    "build": "npm run build:scripts -s && npm run build:styles -s && npm run build:markup -s",
    "build:scripts": "browserify -d assets/scripts/main.js -p [minifyify --compressPath . --map main.js.map --output dist/main.js.map] | hashmark -n dist/main.js -s -l 8 -m assets.json 'dist/{name}{hash}{ext}'",
    "build:styles": "stylus assets/styles/main.styl -m -o dist/ && hashmark -s -l 8 -m assets.json dist/main.css 'dist/{name}{hash}{ext}'",
    "build:markup": "jade assets/markup/index.jade --obj assets.json -o dist",

    "test": "karma start --singleRun",

    "watch": "parallelshell 'npm run watch:test -s' 'npm run watch:build -s'",
    "watch:test": "karma start",
    "watch:build": "nodemon -q -w assets/ --ext '.' --exec 'npm run build'",

    "open:prod": "opener http://example.com",
    "open:stage": "opener http://staging.example.internal",
    "open:dev": "opener http://localhost:9090",

    "deploy:prod": "s3-cli sync ./dist/ s3://example-com/prod-site/",
    "deploy:stage": "s3-cli sync ./dist/ s3://example-com/stage-site/",

    "serve": "http-server -p 9090 dist/",
    "live-reload": "live-reload --port 9091 dist/",

    "dev": "npm run open:dev -s & parallelshell 'npm run live-reload -s' 'npm run serve -s' 'npm run watch -s'"
  }
```

上面的 `-s` 是禁止 npm 输出任何日志信息，你可以尝试删除这个选项来看看有什么不同。

如果用 Grunt 来完成相同的构建任务，则需要上百行的 `Gruntfile` 代码，并且还需要十多个额外的模块。就可读性而言，npm 的 scripts 虽然表面上可读性并不是那么高，但就我而言我可以脚本语言更加容易被理解，每个任务所做的事情也更加清楚。 


## 总结

希望通过本文你了解到了 npm 在构建方面的能力，当需要构建一个项目时 Grunt/Gulp 并不一定是首选工具，或许 npm 就能满足你的需求。

[完]

<p class="j-quote">原文：[How to Use npm as a Build Tool](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/)</p>

## 参考阅读

- [Why we should stop using Grunt & Gulp](http://blog.keithcirkel.co.uk/why-we-should-stop-using-grunt/)