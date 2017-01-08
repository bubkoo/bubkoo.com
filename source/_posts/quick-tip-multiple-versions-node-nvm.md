title: 使用 nvm 管理不同版本的 node 与 npm
tags:
  - nvm
  - Tools
categories:
  - Node
photos:
  - http://bubkoo.qiniudn.com/images/js-dependencies-header.jpg
date: 2017-01-08 23:19:39
updated: 2017-01-08 23:19:39
keywords:
---

在我们的日常开发中经常会遇到这种情况：手上有好几个项目，每个项目的需求不同，进而不同项目必须依赖不同版的 NodeJS 运行环境。如果没有一个合适的工具，这个问题将非常棘手。

[nvm](https://github.com/creationix/nvm) 应运而生，nvm 是 Mac 下的 node 管理工具，有点类似管理 Ruby 的 rvm，如果需要管理 Windows 下的 node，官方推荐使用 [nvmw](https://github.com/hakobera/nvmw) 或 [nvm-windows](https://github.com/coreybutler/nvm-windows)。不过，nvm-windows 并不是 nvm 的简单移植，他们也没有任何关系。但下面介绍的所有命令，都可以在 nvm-windows 中运行。

<!--more-->

## nvm 与 n 的区别

node 版本管理工具还有一个是 TJ大神的 [n](https://github.com/tj/n) 命令，n 命令是作为一个 node 的模块而存在，而 nvm 是一个独立于 node/npm 的外部 shell 脚本，因此 n 命令相比 nvm 更加局限。

由于 npm 安装的模块路径均为 `/usr/local/lib/node_modules`，当使用 n 切换不同的 node 版本时，实际上会共用全局的 node/npm 目录。 因此不能很好的满足『按不同 node 版本使用不同全局 node 模块』的需求。

## 卸载全局安装的 node/npm

在官网下载的 node 安装包，运行后会自动安装在全局目录，使用过程中经常会遇到一些**权限问题**，所以推荐按照以下方法卸载全局安装的 node/npm。

首先，打开你 Finder，按 `shift+command+G`，打开前往文件夹的窗口，分别输入下列目录进去之后删除 `node` 和 `node_modules` 相关的文件和文件夹:

- 打开 `/usr/local/lib`，删除 `node` 和 `node_modules` 相关的文件和文件夹
- 打开 `/usr/local/include`，删除 `node` 和 `node_modules` 相关的文件和文件夹
- 如果你是使用的 `brew install node` 安装的 NodeJS，那么你还需要在终端中执行 `brew uninstall node` 命令来卸载
- 检查你的个人主文件夹下面的所有的 `local`、`lib` 以及 `include` 文件夹，并且删除所有与 `node` 和 `node_modules` 相关的文件以及文件夹
- 打开 `/usr/local/bin` 并删除 `node` 可执行文件

你可能还需要在你的终端中输入一些额外的指令：

```
sudo rm /usr/local/bin/npm
sudo rm /usr/local/share/man/man1/node.1
sudo rm /usr/local/lib/dtrace/node.d
sudo rm -rf ~/.npm
sudo rm -rf ~/.node-gyp
sudo rm /opt/local/bin/node
sudo rm /opt/local/include/node
sudo rm -rf /opt/local/lib/node_modules
```

## Windows 安装

首先最重要的是：一定要卸载已安装的 NodeJS，否则会发生冲突。然后下载 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) 最新安装包，直接安装即可。

## OS X/Linux 安装

与 Windows 不同，我们并不一定要先卸载原有的 NodeJS。当然我们推荐还是先卸载掉比较好。另外，你还需要 C++ 编译器，Linux 发行版一般不用担心，像 Ubuntu 都可以直接用 `build-essential` 套件，OS X 的话，可以用 `X-Code` 的命令行工具。运行这个命令即可：

```shell
xcode-select --install
```

在 Linux 中：（如果是 Debian 发行版）

```shell
sudo apt-get install build-essential
```

然后我们可以使用

```shell
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
```

或者

```shell
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
```

从远程下载 `install.sh` 脚本并执行。注意这个版本年数字 `v0.33.0` 会随着项目开发而变化。随时通过[官方最新安装命令](https://github.com/creationix/nvm#install-script)来检查最新安装版本是有好处的。


## 安装多版本 node/npm

例如，我们要安装4.2.2版本，可以用如下命令：

```shell
nvm install 4.2.2
```

nvm 遵守[语义化版本](http://semver.org/lang/zh-CN/)命名规则。例如，你想安装最新的 `4.2` 系列的最新的一个版本的话，可以运行：

```shell
nvm install 4.2
```

nvm 会寻找 `4.2.x` 中最高的版本来安装。

你可以通过以下命令来列出远程服务器上所有的可用版本：

```shell
nvm ls-remote
```

Windows 的话，就是：

```shell
nvm ls available
```

## 在不同版本间切换

每当我们安装了一个新版本 Node 后，全局环境会自动把这个新版本设置为默认。

nvm 提供了 `nvm use` 命令。这个命令的使用方法和 `install` 命令类似。

例如，切换到 `4.2.2`：

```shell
nvm use 4.2.2
```

切换到最新的 `4.2.x``：

```shell
nvm use 4.2
```

切换到 iojs：

```shell
nvm use iojs-v3.2.0
```

切换到最新版：

```shell
nvm use node
```

每次执行切换的时候，系统都会把 node 的可执行文件链接放到特定版本的文件上。

我们还可以用 nvm 给不同的版本号设置别名：

```shell
nvm alias awesome-version 4.2.2
```

我们给 `4.2.2` 这个版本号起了一个名字叫做 `awesome-version`，然后我们可以运行：

```shell
nvm use awesome-version
```

下面这个命令可以取消别名：

```shell
nvm unalias awesome-version
```

另外，你还可以设置 `default` 这个特殊别名：

```shell
nvm alias default node
```

## 列出已安装实例

```shell
nvm ls
```

![nvm ls](http://bubkoo.qiniudn.com/images/nvm-ls.png)

上面绿色箭头是当前正在使用的版本，下面列出的还有设置过的别名。

## 在项目中使用不同版本的 Node

我们可以通过创建项目目录中的 `.nvmrc` 文件来指定要使用的 Node 版本。之后在项目目录中执行 `nvm use` 即可。`.nvmrc` 文件内容只需要遵守上文提到的语义化版本规则即可。另外还有个工具叫做 [avn](https://github.com/wbyoung/avn)，可以自动化这个过程。


## 在多环境中，npm该如何使用呢？

每个版本的 Node 都会自带一个不同版本的 npm，可以用 `npm -v` 来查看 npm 的版本。全局安装的 npm 包并不会在不同的 Node 环境中共享，因为这会引起兼容问题。它们被放在了不同版本的目录下，例如 `~/.nvm/versions/node/<version>/lib/node_modules</version>` 这样的目录。这刚好也省去我们在 Linux 中使用 `sudo` 的功夫了。因为这是用户的主文件夹，并不会引起权限问题。

但问题来了，我们安装过的 npm 包，都要重新再装一次？幸运的是，我们有个办法来解决我们的问题，运行下面这个命令，可以从特定版本导入到我们将要安装的新版本 Node：

```shell
nvm install v5.0.0 --reinstall-packages-from=4.2
```

## 其他命令

直接运行特定版本的 Node

```shell
nvm run 4.2.2 --version
```

在当前终端的子进程中运行特定版本的 Node

```shell
nvm exec 4.2.2 node --version
```

确认某个版本Node的路径

```shell
nvm which 4.2.2
```

安装 Node 的其他实现，例如 iojs（一个基于 ES6 的 Node 实现，现在已经和 Node 合并）

```shell
nvm install iojs-v3.2.0
```

快捷命令：

- `nvm install node` 安装最新版 Node
- `nvm install iojs` 安装最新版 iojs
- `nvm install unstable` 安装最新不稳定版本的 Node


## 参考资源

- [Quick Tip: Install Multiple Versions of Node.js using nvm](https://www.sitepoint.com/quick-tip-multiple-versions-node-nvm/)
- [How To Completely Uninstall Node.js From Mac OS X](http://benznext.com/completely-uninstall-node-js-from-mac-os-x/)
