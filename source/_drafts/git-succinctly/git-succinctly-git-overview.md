title: Git简明教程：概述
date: 2014-03-12 16:00:20
updated: 2014-03-12 16:00:20
tags: [Git]
categories: []
keywords:
---
每个 Git 仓库包含四个部分：
- 工作区
- 暂存区
- 版本库
- 分支

从代码提交到协同开发的一切，都是围绕这四个部分展开的。

## 工作区 ##

工作区就是你编码、编译或发布项目的地方，对于这样的目的，你可以将工作区认为是一个普通的文件夹。除此之外，你可以通过 Git 提供的各种命令来记录、改变或者转移文件夹中的内容。

![工作区](http://bubkoo.qiniudn.com/the-working-directory.png)

## 暂存区 ##

暂存区域是工作区和版本库之间的媒介，Git 允许开发人员将修改分组到相关的变更集，而不是强制性提交所有修改，暂存区域中的变更集还还不是版本库的一部分。

![工作区和暂存区](http://bubkoo.qiniudn.com/the-working-directory-and-the-staging-area.png)

<!--more-->

## 版本库 ##

一旦你配置好暂存区中的修改，你可以将它提交到版本库中，这种提交将被认为是一个“安全的”修订。提交是“安全的”，Git永远不会修改他们自己，虽然你可以手动修改项目历史。

![从工作区、暂存区到版本库](http://bubkoo.qiniudn.com/the-working-directory-staged-snapshot-and-committed-history.png)

## 分支 ##

目前为止，我们任然只能建立一个线性的版本库，一个接一个地追加提交。分支可以使开发人员并行开发多个不相关的特征分支。Git 的分支与集中式版本控制系统的分支不同，Git 的分支容易操作、合并简单且易于分享。

![完整流程](http://bubkoo.qiniudn.com/the-complete-Git-workflow-with-a-branched-history.png)

>《Git简明教程》是由 [Syncfusion](http://www.syncfusion.com/resources/techportal/ebooks/git?utm_medium=BizDev-Nettutsplus0613) 团队编写的一本免费的电子书，原书可以在[这里](http://www.syncfusion.com/resources/techportal/ebooks/git?utm_medium=BizDev-Nettutsplus0613)找到。