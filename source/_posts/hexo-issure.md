title: 关于 Hexo 的若干问题
date: 2013-12-16 19:02:24
updated: 2013-12-17 11:58:24
tags: [Hexo]
categories: []
keywords:
---
这几天折腾了一下[Hexo][1]，遇到一些问题，解决方案大都来自Google和[Hexo官方文档][2]，现在把这些问题汇总在这里，并附上解决方案，或者抛出自己遇到的问题，渴求解决方案。

后续会陆续更新我在使用过程中遇到的问题和使用心得。

注：这里不涉及Hexo的安装方法，具体的安装和使用可以参照下面教程：

- [Hexo系列教程 - Zippera's blog][3]
- [hexo你的博客 - ibruce][10]
- [使用hexo搭建静态博客 - Jim Liu's Blog][11]
- [使用Github Pages建独立博客 - BeiYuu][4]
- [使用hexo搭建博客 - Alimon's blog][5]
- [用Hexo快速打造静态博客 - iShgo 团队博客][6]
- [hexo教程 - Sys.La][7]
- [Hexo主题制作 - youxiachai][8]

## 给文章添加多个tag或category
第一次写Hexo的时候发现，如果这样写`tags:前端,Hexo,HTML,JavaScript`，tag显示不是按照逗号分隔的方式显示，而是整个显示为一个tag，这显然不是我们需要的，经过研究可以采用如下两种方式给文章添加多tag，对于添加category同样适用。<!--more-->

方式一：仿照Hexo配置文件中的写法

``` md
title: page title
date: page date
tag:
  - 前端
  - Hexo
  - HTML
  - JavaScript
categories: Hexo
---
page content
```

方式二：**伪**JavaScript数组写法

``` md
title: page title
date: page date
tag: [前端,Hexo,HTML,JavaScript]
categories: Hexo
---
page content
```

## 给Hexo添加“上一篇”、“下一篇”导航
我使用的是Hexo的默认主题light，该主题的文章页面没有提供“上一篇”和“下一篇”导航功能，而我又非常喜欢默认主题的清爽简洁，只能自己折腾了。

在[Hexo官方文档][2]中[变量说明][9]部分我们可以知道，在 Article (post, page, …) 中`page.prev`和`page.next`分别代表上一篇和下一篇文章，这两个变量都是一个page对象，所以通过`page.prev.path`和`page.prev.title`就可以获取到上一篇文章的相对路径和标题，然后通过修改`/themes/light/layout/`文件夹中的文件来实现我们的功能。

首先，在`/themes/light/layout/_partial/post/`文件夹中新建`prev_next.ejs`文件。

``` ejs prev_next.ejs
<% if (page.prev || page.next){ %>
<div class="prev_next clearfix">
  <% if (page.prev){ %>
    <a href="<%- config.root %><%- page.prev.path %>" class="alignleft prev" title="<%= page.prev.title %>"><%= page.prev.title %></a>
  <% } %>
  <% if (page.next){ %>
    <a href="<%- config.root %><%- page.next.path %>" class="alignright next" title="<%= page.next.title %>"><%= page.next.title %></a>
  <% } %>
</div>
<% } %>
```

然后，修改`/themes/light/layout/_partial/article.ejs`文章模板，找到需要加入“上一篇”和“下一篇”导航功能的位置，加上`<%- partial('post/prev_next') %>`，比如这样：

``` ejs
      <% } else { %>
        <%- partial('post/category') %>
        <%- partial('post/tag') %>
        <%- partial('post/share') %>
        <%- partial('post/prev_next') %>
      <% } %>
      <div class="clearfix"></div>
    </footer>
  </div>
</article>

<%- partial('comment') %>
```

最后，在`/themes/light/source/css/_partial/article.styl`文件末尾添加上相应的CSS。

``` css
.prev_next
  margin 1em 0
  clear both
  overflow hidden
  a
    display block
    float left
    width 50%
    background #dbdbdb
    text-align center
    padding 0.4em 0
    color #1ba1e2
    transition background .45s color .45s
    &:hover
      color #fafafa
      background #717171
    &.prev::before
      content "上一篇："
      padding-right 0.5em
    &.next::before
      content "下一篇："
      padding-right 0.5em
```

## 给博客和文章添加keywords
默认情况下博客和文章是没有关键字的，可以安装如下方法修改。

首先，在博客配置文件`/Hexo/_config.yml`中添加`keywords:`字段，关键字以英文`,`分割，如下:

``` yml
# Site
title: typeof this  #站点名
subtitle:    # 副标题
description: # 站点描述，搜索引擎
author: typeof
email: JeffreyPee@163.com
language: zh-CN
keywords: Web,前端,JavaScript,html5,css3 # 博客关键字
```

然后，修改模板文件，我用的是light模板，修改`/themes/light/layout/_partial/head.ejs`

``` ejs
#删除下面这行
<% if (page.keywords){ %><meta name="keywords" content="<%= page.keywords %>"><% } %>
#增加以下内容
<% if (page.keywords){ %>
<meta name="keywords" content="<%= page.keywords %>,<%= config.keywords %>">
<% } else if (config.keywords){ %>
<meta name="keywords" content="<%= config.keywords %>">
<%} %>
```

简单说明一下：如果页面有关键字，则用页面的关键字加上配置文件里面的关键字，如果没有关键字，则用配置文件的关键字。

要给文章添加关键字，只需要在文章里面加入`keywords:`即可。也可以直接修改创建文章的模板`/scaffolds/post.md`，在最下面添加`keywords:`，如下：

``` yml
title: {{ title }}
date: {{ date }}
updated: {{ date }}
tags:
categories:
keywords:
---
```


## 添加自定义widget
添加widget的方法很简单，首先在`/themes/light/layout/_widget/`文件夹中创建widget文件`your_widget.ejs`，然后在主题配置文件中加载你的widget，下面通过创建一个友情链的widget来看看具体操作。

友情链接包含`连接名称`和`连接地址`两个属性，看到有的[教程中](http://zipperary.com/2013/05/30/hexo-guide-4/)把友情连接直接静态地写在widget中，修改起来不方便，所以要借助主题配置文件`_config.yml`和Hexo提供的访问配置文件的对象`theme`。

首先，在`/themes/flight/_config.yml`文件中添加如下节。

``` yml
blogrolls: #友情链接
  - Hexo: http://zespia.tw/hexo/
  - Hexo Document: http://zespia.tw/hexo/docs/
  - github: https://github.com/
  - jQuery: http://jquery.com/
```

然后，在`/themes/light/layout/_widget/`文件夹中创建友情连接widget文件`blogroll.ejs`，内容可以这样：

``` ejs
<% if (theme.blogrolls && theme.blogrolls.length > 0) { %>
<div class="widget tag">
  <h3 class="title"><%= __('blogroll') %></h3>
  <ul class="entry">
  <% theme.blogrolls.forEach(function(item){ %>
    <%
      var description, linkURL
      for (var tmp in item) {
        description = tmp;
        linkURL = item[tmp];
      }
    %>
    <li><a href="<%- linkURL %>" target="_blank"><%= description %></a></li>
  <% }); %>
  </ul>
</div>
<% } %>
```

最后，修改主题配置文件`/themes/flight/_config.yml`，在`widgets`下增加`blogroll`。如下：

``` yml
widgets:
  - category
  - tag
  - recent_posts
  - blogroll
```

友情连接widget就创建好了，`hexo server`，在本地`http://localhost:4000/`查看效果吧！同样，我们可以使用此方法添加`个人说明`，`微博秀`等widget。

## 添加最新评论widget

首先需要声明的是本屌用的是多说评论系统，所以最新评论widget也是利用多说提供的API来实现，上一节已经分享了怎么创建自定义的widget，现在我们按照上面的方法来一步一步实现该widget。

在`/themes/light/layout/_widget/`文件夹下创建最新评论小挂件`recent_comments.ejs`，内容如下：

``` ejs
<% if (theme.duoshuo){ %>
<div class="widget recent_comments">
  <h3 class="title"><%= __('recent_comments') %></h3>
  <ul class="entry ds-recent-comments" data-num-items="5" data-show-avatars="0" data-show-title="1" data-show-time="1"></ul>
  <script type="text/javascript">
  if(typeof duoshuoQuery === 'undefined'){
    var duoshuoQuery = {short_name:"<%- theme.duoshuo %>"};
    (function() {
      var ds = document.createElement('script');
      ds.type = 'text/javascript';ds.async = true;
      ds.src = 'http://static.duoshuo.com/embed.js';
      ds.charset = 'UTF-8';
      (document.getElementsByTagName('head')[0]
      || document.getElementsByTagName('body')[0]).appendChild(ds);
    })();
  }
  </script>
</div>
<% } %>
```

简单说明，在每个页面中，如果使用多个多说控件，只需要添加一次多说js，所以这里有这样的判断`if(typeof duoshuoQuery==='undefined')`，在需要用到多说的位置都加上这个判断，避免多次加载js文件；另外多说评论相关的参数：`data-num-items`显示的评论条数，`data-show-avatars`是否显示用户头像，`data-show-title`是否显示文章标题，`data-show-time`是否显示评论时间，具体参数说明可以参考多说[官方说明文档](http://dev.duoshuo.com/docs/4ff28d95552860f21f000010)，按照官方文档还可以添加多说[最近访客](http://dev.duoshuo.com/docs/4ff28d6f552860f21f00000c)小部件和[热评文章](http://dev.duoshuo.com/threads/5020f288e759c1107f00000c)小部件。


[1]: http://zespia.tw/hexo/
[2]: http://zespia.tw/hexo/docs/
[3]: http://zipperary.com/categories/hexo/
[4]: http://beiyuu.com/github-pages/
[5]: http://yangjian.me/workspace/building-blog-with-hexo/
[6]: http://blog.ishgo.cn/2013/09/15/ishgohexo%E5%9B%A2%E9%98%9F%E5%8D%9A%E5%AE%A2%E4%B8%BB%E9%A2%98/
[7]: http://sys.la/2013/09/07/hexo/
[8]: http://blog.gfdsa.net/2013/04/09/hexo/hexolessontwo/
[9]: http://zespia.tw/hexo/docs/variables.html
[10]: http://ibruce.info/2013/11/22/hexo-your-blog/
[11]: http://blog.jimliu.net/2013/09/08/%E4%BD%BF%E7%94%A8hexo%E6%90%AD%E5%BB%BA%E9%9D%99%E6%80%81%E5%8D%9A%E5%AE%A2/