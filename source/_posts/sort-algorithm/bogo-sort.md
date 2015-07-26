title: 常见排序算法 - 猴子排序 (Bogo Sort)
date: 2014-01-15 22:04:22
updated: 2014-01-15 22:04:22
tags: [Sort,Algorithm,JavaScript]
categories: []
keywords:
---
## 算法原理 ##
猴子排序 (Bogo Sort) 是个既不实用又原始的排序算法，其原理等同将一堆卡片抛起，落在桌上后检查卡片是否已整齐排列好，若非就再抛一次。其名字源自 Quantum bogodynamics，又称 bozo sort、blort sort 或猴子排序（参见[无限猴子定理](http://zh.wikipedia.org/wiki/%E7%84%A1%E9%99%90%E7%8C%B4%E5%AD%90%E5%AE%9A%E7%90%86)）。并且在最坏的情况下所需时间是无限的。

伪代码：

``` javascript
while not InOrder(list) do
   Shuffle(list)
done
```

<!--more-->

这个排序方法没有办法给出实例分析，下面直接看代码。

## JavaScript 语言实现 ##

``` javascript
function bogoSort(array) {

    function swap(array, i, j) {
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    // 随机交换顺序
    function shuffle(array) {
        var i,
            l = array.length;
        for (var i = 0; i < l; i++) {
            var j = Math.floor(Math.random() * l)
            swap(array, i, j)
        }
    }
    // 判断是否已经排好序
    function isSorted(array) {
        var i,
            l = array.length;
        for (var i = 1; i < l; i++) {
            if (array[i - 1] > array[i]) {
                return false;
            }
        }
        return true;
    }

    var sorted = false;
    while (sorted == false) { // 效率低下的位置
        v = shuffle(array);
        sorted = isSorted(array);
    }
    return array;
}
```

## 参考文章 ##
- [维基百科，自由的百科全书](http://zh.wikipedia.org/wiki/Bogo%E6%8E%92%E5%BA%8F)
- [Sorting algorithms/Bogosort](http://rosettacode.org/wiki/Sorting_algorithms/Bogosort)