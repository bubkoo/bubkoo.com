title: 常见排序算法 - 基数排序 (Radix Sort)
date: 2014-01-15 22:38:55
updated: 2014-01-15 22:38:55
tags: [Sort,Algorithm,JavaScript]
categories: []
keywords:
---
## 算法原理 ##
基数排序 (Radix Sort) 是一种非比较型整数排序算法，其原理是将整数按位数切割成不同的数字，然后按每个位数分别比较。基数排序的发明可以追溯到 1887 年[赫尔曼·何乐礼](http://zh.wikipedia.org/wiki/%E8%B5%AB%E7%88%BE%E6%9B%BC%C2%B7%E4%BD%95%E6%A8%82%E7%A6%AE)在[打孔卡片制表机 (Tabulation Machine)](http://zh.wikipedia.org/w/index.php?title=%E6%89%93%E5%AD%94%E5%8D%A1%E7%89%87%E5%88%B6%E8%A1%A8%E6%9C%BA&action=edit&redlink=1)上的贡献。

排序过程：将所有待比较数值（**正整数**）统一为同样的数位长度，数位较短的数前面补零。然后，从最低位开始，依次进行一次排序。这样从最低位排序一直到最高位排序完成以后, 数列就变成一个有序序列。

基数排序法会使用到桶 (Bucket)，顾名思义，通过将要比较的位（个位、十位、百位...），将要排序的元素分配至 0~9 个桶中，借以达到排序的作用，在某些时候，基数排序法的效率高于其它的比较性排序法。

[Data Structure Visualizations](http://www.cs.usfca.edu/~galles/visualization/RadixSort.html) 提供了一个基数排序的分步动画演示。
<!--more-->
## 实例分析 ##
基数排序的方式可以采用 LSD (Least sgnificant digital) 或 MSD (Most sgnificant digital)，LSD 的排序方式由键值的最右边开始，而 MSD 则相反，由键值的最左边开始。 以 LSD 为例，假设原来有一串数值如下所示：

``` javascript
   36   9   0   25   1   49   64   16   81   4
```

首先根据个位数的数值，按照个位置等于桶编号的方式，将它们分配至编号0到9的桶子中：

编号|0|1|2|3|4|5|6|7|8|9
 ---|---|---|---|---|---|---|---|---|---
  |0| 1 |   |   | 64|25 | 36|   |   |9
  | | 81|   |   |  4|   | 16|   |   |49
然后，将这些数字按照桶以及桶内部的排序连接起来：

``` javascript
   0   1   81   64   4   25   36   16   9   49
```

接着按照十位的数值，分别对号入座：

编号|0|1|2|3|4|5|6|7|8|9
 ---|---|---|---|---|---|---|---|---|---
  |0| 16| 25| 36| 49|   | 64|   | 81| 
  |1|   |   |   |   |   |   |   |   | 
  |4|   |   |   |   |   |   |   |   | 
  |9|   |   |   |   |   |   |   |   | 

最后按照次序重现连接，完成排序：

``` javascript
   0   1   4   9   16   25   36   49   64   81
```

## JavaScript 语言实现 ##

暴力上代码：

``` javascript
function radixSort(array) {
    var bucket = [],
        l = array.length,
        loop,
        str,
        i,
        j,
        k,
        t,
        max = array[0];

    for (i = 1; i < l; i++) {
        if (array[i] > max) {
            max = array[i]
        }
    }

    loop = (max + '').length;

    for (i = 0; i < 10; i++) {
        bucket[i] = [];
    }

    for (i = 0; i < loop; i++) {
        for (j = 0; j < l; j++) {
            str = array[j] + '';
            if (str.length >= i + 1) {
                k = parseInt(str[str.length - i - 1]);
                bucket[k].push(array[j]);
            } else { // 高位为 0
                bucket[0].push(array[j]);
            }
        }

        array.splice(0, l);
        for (j = 0; j < 10; j++) {
            t = bucket[j].length;
            for (k = 0; k < t; k++) {
                array.push(bucket[j][k]);
            }
            bucket[j] = [];
        }
    }
    return array;
}
```

## 参考文章 ##
- [维基百科，自由的百科全书](http://zh.wikipedia.org/wiki/%E5%9F%BA%E6%95%B0%E6%8E%92%E5%BA%8F)
- [Data Structure Visualizations](http://www.cs.usfca.edu/~galles/visualization/RadixSort.html)
- [Algorithm Gossip: 基数排序法](http://openhome.cc/Gossip/AlgorithmGossip/RadixSort.htm)
- [Radix Sorting](https://www.cs.auckland.ac.nz/software/AlgAnim/radixsort.html)