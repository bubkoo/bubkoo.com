title: 认识 D3 数据绑定的魔法
tags: [D3, Visualizations]
categories: [JavaScript]
date: 2014-10-24 17:19:30
keywords:
---
如果用 [D3](http://d3js.org/) 来构建一个简单的散点图，我们需要创建一些[圆点（circle）](http://www.w3.org/TR/SVG/shapes.html#CircleElement)来展示你的数据。当你发现 D3 并没有提供内置的方法来同时创建多个 DOM 元素时，也许你会感到惊讶，但是，等等，[为什么呢](https://www.destroyallsoftware.com/talks/wat)？

<!--more-->

当然，你可以使用 [append](https://github.com/mbostock/d3/wiki/Selections#wiki-append) 方法来创建单个元素：

```js
svg.append("circle")
    .attr("cx", d.x)
    .attr("cy", d.y)
    .attr("r", 2.5);
```

这仅仅是一个圆点，我们需要的是一系列圆点，每个圆点代表一条数据。当然你可以用 `for` 循环来创建，但开始之前，请看看下面官方例子中的代码：


```js
svg.selectAll("circle")
    .data(data)
  .enter().append("circle")
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", 2.5);
```

对应的数据像下面这样：

```js
[
    {
        "x": 1.0, 
        "y": 1.1
    }, 
    {
        "x": 2.0, 
        "y": 2.5
    }, 
    …
]
```


这段代码正是我们需要的，上面代码为每一条数据创建了一个圆，并使用单条数据的 `x` 和 `y` 属性来定位。天哪，`selectAll("circle")` 都干了什么？为什么为了创建一些新元素需要先选择这些明明都不存在的元素？

这就是 D3 的规范，告诉 D3 你需要什么，而不是告诉它具体怎么做。我们需要圆点来展示我们的数据，每个圆点对应一条数据。所以我们告诉 D3 对 “circle” 的选集应该和我们的数据对应起来，而不是直接告诉 D3 来创建这些圆点。这个概念称为数据连接：


<style>
svg {
    font: 10px sans-serif;
}
circle {
    fill: none;
    fill-opacity: .2;
    stroke: black;
    stroke-width: 1.5px;
}
</style>

<svg width="600" height="265"><g transform="translate(0,150)"><g transform="translate(240)"><circle r="110" style="fill: rgb(49, 130, 189);"></circle></g><text x="240" y="-125" dy=".35em" text-anchor="middle" style="font-weight: bold;">数据集合</text><text x="210" dy=".35em" text-anchor="middle">Enter</text><text x="300" dy=".35em" text-anchor="middle">Update</text><g transform="translate(360)"><circle r="110" style="fill: rgb(230, 85, 13);"></circle></g><text x="360" y="-125" dy=".35em" text-anchor="middle" style="font-weight: bold;">元素集合</text><text x="400" dy=".35em" text-anchor="middle">Exit</text></g></svg>


那些已经和数据绑定的元素构成中间的 *update* 集合；而那些数据集合中存在，但在元素集合中还不存在的部分构成左边的 *enter* 集合，代表那些将被添加的元素；同理，那些在数据集合中不存在，而在元素集合中存在的元素构成了右边的 *exit* 集合，代表那些将被移除的元素。

现在我们可以揭开数据绑定 (data-join) 的神秘面纱：

1. 首先，`svg.selectAll("circle")` 返回一个空选集，因为当前 SVG 还没有任何子元素，该选集的父节点是这个 SVG 容器。
2. 然后将该选集与数据绑定，产生三个新的子选集，分别代表三种可能的状态：*enter*、*update* 和 *exit*。由于当前选集为空，所以 *update* 和 *exit* 子选集也为空，*enter* 子选集就包含了每条数据对应的元素的占位符。
3. *update* 子选集直接通过 [`selection.data`](https://github.com/mbostock/d3/wiki/Selections#wiki-data) 返回，*enter* 和 *exit* 子选集分别通过 `selection.enter` 和 `selection.exit` 返回。
4. 那些缺少的元素通过对 *enter* 子选集调用 `selection.append` 方法来添加到 SVG 中，这样就为每条数据添加了一个新的圆点到 SVG 中。

数据绑定意味着在数据和元素之间建立了一种关系，然后通过 *enter*、*update* 和 *exit* 三个子选集来实现这种关系。

但是为什么要这么麻烦呢？为什么不直接创建这些元素？数据绑定的优点在于更具通用性。上面代码仅仅处理了 *enter* 子选集，这对于静态数据足够了，我们可以方便地扩展上面的代码，只需要对 *update* 和 *exit* 稍作修改，就可以使其支持动态数据可视化。这意味着，我们可以实现[实时数据](http://bost.ocks.org/mike/path/)的可视化。

请看下面操作三个子集的例子：

```js
var circle = svg.selectAll("circle")
    .data(data);

circle.exit().remove();

circle.enter().append("circle")
    .attr("r", 2.5);

circle
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; });
```

上面这段代码将重新计算数据绑定，并维护数据和元素之间的关系。如果新数据集小于旧集合，那些 *exit* 子选集中的多余元素将被移除；如果新数据集大于旧集合，那些 *enter* 子选集中的元素将被添加到 SVG 中；如果新数据集恰好与旧集合同样大小，那么所有这些元素仅仅会更新自身的位置，没有元素被添加或移除。

数据绑定使我们的代码更加清晰，我们只需要处理这三个子选集，而不需要 `if` 语句或 `for` 循环，如果三个子选集都为空，意味着我们不需要进行任何操作。

数据绑定还可以方便我们对某子选集做一些针对性的处理，例如，我们可以在 *enter* 子选集设置元素的一些不变属性（比如，圆的半径 `r`）而不是 *update* 子选集。同时，通过子选集最小化了 DOM 变化，极大提高了渲染性能。我们还可以正对性对某子选集设置动画效果，例如，对添加的元素设置动画：


```js
circle.enter().append("circle")
    .attr("r", 0)
  .transition()
    .attr("r", 2.5);
```

同样，对移除的元素：


```js
circle.exit().transition()
    .attr("r", 0)
    .remove();
```

【全文完】

**下面看一个栗子**

<style>
.enter {
  font: bold 48px monospace;
  fill: green;
}
.update {
  font: bold 48px monospace;
  fill: #333;
}
</style>

<svg id="demo1"></svg>
<script charset="utf-8" src="/js/lib/d3.min.js"></script>
<script>
(function(){
    var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

    var width  = 600,
        height = 500;

    var svg = d3.select("#demo1")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", "translate(10," + (height / 2) + ")");

    function update(data) {

      // DATA JOIN
      // Join new data with old elements, if any.
      var text = svg.selectAll("text")
          .data(data);

      // UPDATE
      // Update old elements as needed.
      text.attr("class", "update");

      // ENTER
      // Create new elements as needed.
      text.enter().append("text")
          .attr("class", "enter")
          .attr("x", function(d, i) { return i * 32; })
          .attr("dy", ".35em");

      // ENTER + UPDATE
      // Appending to the enter selection expands the update selection to include
      // entering elements; so, operations on the update selection after appending to
      // the enter selection will apply to both entering and updating nodes.
      text.text(function(d) { return d; });

      // EXIT
      // Remove old elements as needed.
      text.exit().remove();
    }

    // The initial display.
    update(alphabet);

    // Grab a random sample of letters from the alphabet, in alphabetical order.
    setInterval(function() {
      update(shuffle(alphabet)
          .slice(0, Math.floor(Math.random() * 26))
          .sort());
    }, 1500);

    // Shuffles the input array.
    function shuffle(array) {
      var m = array.length, t, i;
      while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m], array[m] = array[i], array[i] = t;
      }
      return array;
    }

})();
</script>

```css
text {
  font: bold 48px monospace;
}

.enter {
  fill: green;
}

.update {
  fill: #333;
}
```

```js
var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

var width = 960,
    height = 500;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(32," + (height / 2) + ")");

function update(data) {

  // DATA JOIN
  // Join new data with old elements, if any.
  var text = svg.selectAll("text")
      .data(data);

  // UPDATE
  // Update old elements as needed.
  text.attr("class", "update");

  // ENTER
  // Create new elements as needed.
  text.enter().append("text")
      .attr("class", "enter")
      .attr("x", function(d, i) { return i * 32; })
      .attr("dy", ".35em");

  // ENTER + UPDATE
  // Appending to the enter selection expands the update selection to include
  // entering elements; so, operations on the update selection after appending to
  // the enter selection will apply to both entering and updating nodes.
  text.text(function(d) { return d; });

  // EXIT
  // Remove old elements as needed.
  text.exit().remove();
}

// The initial display.
update(alphabet);

// Grab a random sample of letters from the alphabet, in alphabetical order.
setInterval(function() {
  update(shuffle(alphabet)
      .slice(0, Math.floor(Math.random() * 26))
      .sort());
}, 1500);

// Shuffles the input array.
function shuffle(array) {
  var m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m], array[m] = array[i], array[i] = t;
  }
  return array;
}
```