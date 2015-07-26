title: Git简明教程：记录变更
date: 2014-03-19 10:55:29
updated: 2014-03-19 10:55:29
tags: [Git]
categories: []
keywords:
---
维护项目的一系列“安全”的变更集是任何版本控制系统的核心功能。Git 通过记录项目“快照”来保存变更集，记录快照之后，你可以查看、回滚到旧版本，或者在旧版本上进行实验，而不用担心会破坏现有版本的功能。

SVN 和 CVS 的用户会注意到这和他们使用的版本控制系统完全不一样，这两个系统记录项目中每个文件的增量修改，而 Git 记录的是项目“快照”，每次提交都包含项目中每个文件的完整版本，这使得 Git 的速度非常快，因为提交时不需要为文件生成文件对应的状态。

![记录完整的快照，而不是差异修正](http://bubkoo.qiniudn.com/recording-complete-snapshots.png)

本章介绍基于工作区，暂存区和版本库（这些是 Git 版本控制的核心组件）来创建快照的基本工作流程。

<!--more-->

## 暂存区 ##

Git 的暂存区提供了一个区域，在将变更添加到版本库之前来暂存你的提交，暂存过程就是将变更从从工作区移到暂存区快照。

![暂存提交](http://bubkoo.qiniudn.com/components-involved-in-staging-a-commit.png)

这可以让你查看和选择工作区中相关的变更，而不是一次性提交所有的变更到暂存区，这意味着你可以创建逻辑快照，而不仅仅是按时间顺序的快照。对开发人员来说，这也是极大的便利，因为我们可以将开发过程和版本控制过程完全独立开来。当你在编写代码时，你完全可以忘记提交代码到独立的区域，当你编码完成之后，你可以将变更分为不同的批次来提交到暂存区。

使用下面命令来将新建的文件或修改的文件从工作区添加到暂存区：
``` dos
git add <file>
```
使用下面的命令，可以将文件从暂存区中删除，但不会删除工作区中的真实文件：
``` dos
git rm --cached <file>
```

## 查看暂存区 ##

查看代码仓库的状态是 Git 中最常用的一个命令，下面命令将输出工作区和暂存区的状态：

``` dos
git status
```
这将输出类似下面的消息（某些部分可能省略，取决于仓库的状态）：
``` dos
# On branch master
# Changes to be committed:
#
#       new file:   foobar.txt
#
# Changes not staged for commit:
#
#       modified:   foo.txt
#
# Untracked files:
#
#       bar.txt
```
“Changes to be committed” 这个部分是已经暂存的文件，如果你这时执行 `git commit` 命令，那么只有这个区域中的文件才会添加到版本库的历史记录中。下一个部分列举了跟踪的文件，当执行提交时这些文件不会被添加到版本库的历史记录中。最后，“Untracked files” 包含了存在于你的工作区，但还没有被添加到代码仓库的文件。

## 变更详情 ##

如果你想查看工作区文件的变更详情，可以使用下面命令：

``` dos
git diff
```
这个命令将输出工作区中那些还没有被提交到暂存区的文件的变更详情，如果想查看暂存区文件的变更详情，请使用下面命令：

``` dos
git diff --cached
```
需要注意的是，`git status` 命令并不会显示项目的提交历史，要显示提交历史请使用 `git log` 命令。

![](http://bubkoo.qiniudn.com/components-in-the-scope-of-git-status.png)

## 提交 ##

提交代表项目每个保存的版本，他们是 Git 版本控制的原子单位，每次提交都包含项目的一个完整快照、用户信息、日期、备注信息和一个 SHA-1 校验码：

``` dos
commit b650e3bd831aba05fa62d6f6d064e7ca02b5ee1b
Author: john <john@example.com>
Date:   Wed Jan 11 00:45:10 2012 -0600
 
    Some commit message
```


这个校验码作为该次提交的惟一的 ID，同时意味着一次提交不会在 Git 管控之外被破坏或意外修改。

既然暂存区已经包含了预期的变更，提交过程就就不会牵涉到工作区中的任何文件。

![](http://bubkoo.qiniudn.com/components-involved-in-committing-a-snapshot.png)

通过下面命令，提交暂存快照并添加到当前分支的版本历史记录中：

``` dos
git commit
```
你将会看到一个文本编辑器，并提示输入“提交信息（commit message）”，提交信息采取以下形式：

``` dos
<commit summary in 50 characters or less.>
<blank line>
<detailed description of changes in this commit.>
```

## 查看提交 ##

和 `git status` 命令一样，查看提交历史也是 Git 中最常用的命令之一，显示当前分支的提交历史：

``` dos
git log
```
现在我们有了两个工具来查看 Git 中的组件。

![](http://bubkoo.qiniudn.com/output-of-git-status-vs-git%20log.png)

将命令可以分组：
- 工作区和暂存区：`git add`，`git rm`，`git status`
- 提交历史：`git commit`，`git log`

### 一些常用的配置 ###
Git 为 `git log` 命令提供了大量的格式化选项，下面将介绍一些。

单行显示提交历史，使用：

``` dos
git log --oneline
```
或者将结果输出到一个指定的文件中：
``` dos
git log --oneline <file>
```
当输出的历史记录超过一屏时，过滤输出也非常有用，你可以使用 `<since>` 和 `<until>` 来过滤，参数可以是 ID，分支名或标签名：
``` dos
git log <since>..<until>
```
最后，你也可以输出每次提交的具体变化，如果想知道每次提交影响的文件，这个命令将非常有用：
``` dos
git log --stat
```
`gitk` 命令以图形化的方式显示历史记录，`gitk` 在 Git 中是一个独立的程序，运行 `git help gitk` 可以查看具体使用方式。

## 标签 ##
标签可以用来标记重要的版本（比如 Release），使用 `git tag` 命令来创建一个新的标签：
```dos
git tag -a v1.0 -m "Stable release"
```
`-a` 选项用来创建一个有注释的标签，允许你记录一个消息（通过 `-m` 选项）。

使用不带参数的命令可以显示所有已经创建的标签：
```dos
git tag
```


>《Git简明教程》是由 [Syncfusion](http://www.syncfusion.com/resources/techportal/ebooks/git?utm_medium=BizDev-Nettutsplus0613) 团队编写的一本免费的电子书，原书可以在[这里](http://www.syncfusion.com/resources/techportal/ebooks/git?utm_medium=BizDev-Nettutsplus0613)找到。