title: 常见排序算法 - 鸡尾酒排序 (Cocktail Sort/Shaker Sort)
date: 2014-01-15 20:50:02
updated: 2014-01-15 20:50:02
tags: [Sort,Algorithm,JavaScript]
categories: []
keywords:
---
## 算法原理 ##
为什么叫鸡尾酒排序？其实我也不知道，知道的小伙伴请告诉我。

其实它还有很多**奇怪**的名称，比如双向冒泡排序 (Bidirectional Bubble Sort)、波浪排序 (Ripple Sort)、摇曳排序 (Shuffle Sort)、飞梭排序 (Shuttle Sort) 和欢乐时光排序 (Happy Hour Sort)。本文中就以鸡尾酒排序来称呼它。

鸡尾酒排序是[冒泡排序](/2014/01/12/sort-algorithm/bubble-sort/)的轻微变形。不同的地方在于，鸡尾酒排序是从低到高然后从高到低来回排序，而冒泡排序则仅从低到高去比较序列里的每个元素。他可比冒泡排序的效率稍微好一点，原因是冒泡排序只从一个方向进行比对(由低到高)，每次循环只移动一个项目。

以序列(2,3,4,5,1)为例，鸡尾酒排序只需要访问一次序列就可以完成排序，但如果使用冒泡排序则需要四次。但是在乱数序列状态下，鸡尾酒排序与冒泡排序的效率都很差劲，优点只有原理简单这一点。

排序过程：
1. 先对数组从左到右进行冒泡排序（升序），则最大的元素去到最右端
2. 再对数组从右到左进行冒泡排序（降序），则最小的元素去到最左端
3. 以此类推，依次改变冒泡的方向，并不断缩小未排序元素的范围，直到最后一个元素结束

![图片来自维基百科](http://bubkoo.qiniudn.com/sorting-shaker-sort-anim.gif)

<!--more-->

## 实例分析 ##
以数组 array = [45, 19, 77, 81, 13, 28, 18, 19, 77] 为例，排序过程如下：

从左到右，找到最大的数 81，放到数组末尾：

``` javascript
  ┌─────────────────────────────────────────┐
  │  19   45   77   13   28   18   19   77  │  81
  └─────────────────────────────────────────┘
```

从右到左，找到剩余数组（先框中的部分）中最小的数 ，放到数组开头：

``` javascript
      ┌────────────────────────────────────┐
  13  │  19   45   77   18   28   19   77  │   81
      └────────────────────────────────────┘
```

从左到右，在剩余数组中找到最大数，放在剩余数组的末尾：

``` javascript
      ┌───────────────────────────────┐
  13  │  19   45   18   28   18   77  │   77   81
      └───────────────────────────────┘
```

从右到左

``` javascript
           ┌──────────────────────────┐
  13   18  │  19   45   18   28   77  │   77   81
           └──────────────────────────┘
```

从左到右

``` javascript
           ┌─────────────────────┐
  13   18  │  19   18   28   45  │  77   77   81
           └─────────────────────┘
```

从右到左

``` javascript
                ┌────────────────┐
  13   18   18  │  19   28   45  │  77   77   81
                └────────────────┘
```

从左到右

``` javascript
                ┌───────────┐
  13   18   18  │  19   28  │  45   77   77   81
                └───────────┘
```

从右到左

``` javascript
                     ┌──────┐
  13   18   18   19  │  28  │  45   77   77   81
                     └──────┘
```

## JavaScript 语言实现 ##
惯例，看代码：

``` javascript
function shakerSort(array) {

    function swap(array, i, j) {
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    var length = array.length,
        left = 0,
        right = length - 1,
        lastSwappedLeft = left,
        lastSwappedRight = right,
        i,
        j;

    while (left < right) {
        // 从左到右
        lastSwappedRight = 0;
        for (i = left; i < right; i++) {
            if (array[i] > array[i + 1]) {
                swap(array, i, i + 1);
                lastSwappedRight = i;
            }
        }
        right = lastSwappedRight;
        // 从右到左
        lastSwappedLeft = length - 1;
        for (j = right; left < j; j--) {
            if (array[j - 1] > array[j]) {
                swap(array, j - 1, j)
                lastSwappedLeft = j
            }
        }
        left = lastSwappedLeft;
    }
}
```

## 参考文章 ##
- [维基百科，自由的百科全书](http://zh.wikipedia.org/wiki/%E9%B8%A1%E5%B0%BE%E9%85%92%E6%8E%92%E5%BA%8F)
- [Cocktail Sort Algorithm or Shaker Sort Algorithm](http://www.codingunit.com/cocktail-sort-algorithm-or-shaker-sort-algorithm)
- [Sorting Algorithms: The Cocktail Sort](http://buffered.io/posts/sorting-algorithms-the-cocktail-sort/)
- [[演算法]摇晃排序法(Shaker Sort)](http://notepad.yehyeh.net/Content/Algorithm/Sort/Shaker/Shaker.php)
- [冒泡排序与鸡尾酒排序](http://www.cnblogs.com/wuweiblog/archive/2011/07/11/2103325.html)