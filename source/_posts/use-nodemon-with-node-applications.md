title: 在 Express 开发中使用 nodemon
tags: [nodemon, nodejs, Express]
categories: [NodeJS]
date: 2014-12-02 03:28:38
keywords:
---

![nodemon](https://camo.githubusercontent.com/fd1ea21338ceeef34920e44e97d099f3c47a78c3/687474703a2f2f6e6f64656d6f6e2e696f2f6e6f64656d6f6e2e737667)

[nodemon](http://nodemon.io/) 是一款非常实用的工具，用来监控 NodeJS 源代码的任何变化和自动重启你的服务器，这样我们只需要刷新页面就能看到你的改动。这里还有个一个工具 [supervisor](http://supervisord.org/) 也能实现同样的功能，但相比起来 nodemon 更加灵活轻量，内存占用更少。

<!--more-->

## 安装

使用 npm 将 nodemon 安装到全局：

```shell
npm install -g nodemon
```

## 使用

nodemon 会将你输入的启动命令包裹起来，所以你可以使用任何可以使用的启动参数

```shell
nodemon [your node app]
```

使用 `-h` 或者 `--help` 来查看完整的帮助：

```shell
nodemon -h
```

使用 nodemon 非常简单，如果我们的应用接受 host 和 port 两个参数，那么我们可以这样来启动我们的应用：

```shell
nodemon ./server.js localhost 8080
```
nodemon 同样能监视和运行 [coffee-script](http://jashkenas.github.com/coffee-script/) 应用：


```shell
nodemon server.coffee
```

如果没有指定启动脚本，nodemon 将检查 `package.json` 文件，并运行 `main` 属性指定的文件，如果没有发现 `main` 属性，nodemon 将检查 `scripts.start` 属性指定的启动命令。因此如果同时指定了 `mian` 和 `scripts.start` 属性，那么 nodemon 将使用 `main` 属性指定的文件作为启动脚本。

你也可以传递 debug 标志给 nodemon：

```shell
nodemon --debug ./server.js 80
```

## 手动重启

当 nodemon 运行时，如果你想手动重启你的应用，除了可以停止并重启 nodemon 之外，你还可以简单滴敲入 `rs` 并回车，然后 nodemon 将重启你的服务。

## 配置文件

nodemon 支持本地和全局配置文件。配置文件名为 `nodemon.json`，可以将其放在当前工作目录或者你的 `home` 目录。

配置文件可以接受任何命令行中支持的参数，启动 nodemon 时命令行中的参数将覆盖配置文件的设置，一个配置文件示例如下：

```json
{
  "verbose": true,
  "ignore": ["*.test.js", "fixtures/*"],
  "execMap": {
    "rb": "ruby",
    "pde": "processing --sketch={{pwd}} --run"
  }
}
```

上面的 `nodemon.json` 配置文件是我的全局配置文件，因为配置文件中配置了支持运行 `ruby` 文件 和 `processing` 文件，然后我可以运行 `nodemon demo.pde` 来启动。

我的本地配置文件如下，注意 `json` 文件不支持注释，我这里仅仅为了作一些说明，如果你想直接复制过去使用，请记得移除文件中的注释：

```js
{
    // 手动重启对应的命令，默认为 rs，你可以按照自己的习惯做对应的修改，
    // 比如修改为 rb，那么 rb 将作为新的手动重启命令。
    "restartable": "rs",
    "verbose": false,
    "env": {
        "NODE_ENV": "development",
        // 端口
        "PORT": "4000" 
    },
    // 后缀名和对应的运行命令
    "execMap": {
        // 空后缀名是为了支持 ./bin/www 这样无后缀的文件。
        "": "node --debug", 
        // js 文件的启动命令
        "js": "node --debug"
    },
    // 监视的文件和文件夹
    "watch": [
        "app/",
        "bin/",
        "routes/",
        "views/",
        "app.js"
    ],
    // 忽略的文件和文件夹
    "ignore": [
        ".git",
        ".idea",
        "node_modules"
    ],
    // 监视指定后缀名的文件
    "ext": "js jade"
}
```

完整的配置说明可以使用 `nodemon --help config` 来查看，或者看[这里](https://github.com/remy/nodemon/blob/master/doc/cli/config.txt)。

## Chrome 调试

1. 安装 node-inspector：`npm install -g node-inspector`；
2. 启动项目：`nodemon --debug xxx.js`，新开一个命令窗口，启动 node-inspector：`node-inspector`；
3. http://127.0.0.1:8080/debug?port=5858 访问 debug 页面，就可以开始 debug 了。