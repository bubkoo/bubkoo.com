title: Git简明教程：开始使用
date: 2014-03-12 16:51:52
updated: 2014-03-12 16:51:52
tags: [Git]
categories: []
keywords:
---
## 安装 ##

Git 可以从各大平台下载到，下面将指导你完成在 Windows 平台上的安装，但最好的方式是从 [Git 官网](http://git-scm.com/)上获取最新消息。

[MsysGit](http://code.google.com/p/msysgit/downloads/list) 是 Windows 平台的安装包。

1. 下载并执行最新版本的安装程序。
2. 在“Adjusting your PATH environment”步骤勾选“Use Git Bash only”
3. 在“Choosing the SSH executable”步骤勾选“Use OpenSSH”
4. 最后，勾选“Checkout Windows-style, commit Unix-style line endings”，点击下一步完成安装

这将安装一个叫做“Git Bash”的命令行程序，使用 Git 时将使用到该程序。

![Git Bash](http://bubkoo.qiniudn.com/screenshot-of-Git-Bash.png)

<!--more-->

## 配置 ##

Git 有一系列的配置选项，包括从你的名字到你最喜欢的合并工具。可以通过 `git config` 命令来配置这些选项，或者手动修改用户目录中的 `.gitconfig` 文件。下面是一些最常见的配置项。

### 用户信息 ###

任何新安装的 Git 需要做的第一件事情是让 Git 知道你是谁。Git 将记住这些信息，当你提交代码或第三方服务（如Github），将通过这些信息来识别你。

```dos
git config --global user.name "John Smith"
git config --global user.email john@example.com
```

`--global` 标志表示将配置信息记录在 `~/.gitconfig` 文件中，使它成为所有仓库的默认配置。

### 编辑器 ###

Git 的命令行的实现依赖于一个文本编辑器的输入，你可以通过 `core.editor` 选项使 Git 使用你指定的编辑器：

```dos
git config --global core. editor gvim
```

### 别名 ###

默认情况下，Git 没有设置任何别名，你可以通过 `alias` 选项来添加自定义的命令别名。如果你有使用 SVN 的经验，或许你会做如下别名设置：

```dos
git config --global alias.st status
git config --global alias.ci commit
git config --global alias.co checkout
git config --global alias.br branch
```

可以在 Git Bash 命令行工具中执行 `git help config` 命令来获取更多的帮助。

## 初始化仓库 ##

Git 设计得尽可能不引人注目，一个普通目录和 Git 仓库之间的唯一区别在于：Git 仓库的根目录中有一个额外的 .git 目录（而不是每一个子目录）。可以通过运行 `git init` 命令来将一个普通的项目目录转化为一个 Git 仓库。

```dos
git init <path>
```
参数 `<path>` 是仓库所在目录的路径（省略该参数表示当前目录），现在你就可以使用 Git 所有的版本控制特性了。

## 克隆 ##

除了 `git init`，你可以如下命令来克隆一个已经存在的仓库：

```dos
git clone ssh://<user>@<host>/path/to/repo.git
```
这将通过 SSH 登录到 `<host>` 并下载 `repo.git` 这个项目，这回下载整个项目，而不是创建一个快捷方式到服务器上的仓库。你拥有独立的版本历史、工作区、暂存区和分支，并且在你提交修改到公共服务器之前，其他开发者看不到你的修改。

>《Git简明教程》是由 [Syncfusion](http://www.syncfusion.com/resources/techportal/ebooks/git?utm_medium=BizDev-Nettutsplus0613) 团队编写的一本免费的电子书，原书可以在[这里](http://www.syncfusion.com/resources/techportal/ebooks/git?utm_medium=BizDev-Nettutsplus0613)找到。