title: 常见排序算法 - 桶排序 (Bucket Sort)
date: 2014-01-15 22:27:51
updated: 2014-01-15 22:27:51
tags: [Sort,Algorithm,JavaScript]
categories: []
keywords:
---
## 算法原理 ##
桶排序 (Bucket sort)或所谓的**箱排序**的原理是将数组分到有限数量的桶子里，然后对每个桶子再分别排序（有可能再使用别的排序算法或是以递归方式继续使用桶排序进行排序），最后将各个桶中的数据有序的合并起来。

排序过程：
1. 假设待排序的一组数统一的分布在一个范围中，并将这一范围划分成几个子范围，也就是桶
2. 将待排序的一组数，分档规入这些子桶，并将桶中的数据进行排序
3. 将各个桶中的数据有序的合并起来

[Data Structure Visualizations](http://www.cs.usfca.edu/~galles/visualization/BucketSort.html) 提供了一个桶排序的分步动画演示。
<!--more-->

## 实例分析 ##
设有数组 array = [29, 25, 3, 49, 9, 37, 21, 43]，那么数组中最大数为 49，先设置 5 个桶，那么每个桶可存放数的范围为：0~9、10~19、20~29、30~39、40~49，然后分别将这些数放人自己所属的桶，如下图：

![](http://bubkoo.qiniudn.com/bucket-sort-1.png)

然后，分别对每个桶里面的数进行排序，或者在将数放入桶的同时用插入排序进行排序。最后，将各个桶中的数据有序的合并起来，如下图：

![](http://bubkoo.qiniudn.com/bucket-sort-2.png)

## JavaScript 语言实现 ##
首先用最笨的方法，每一个桶只能放相同的数字，最大桶的数量为数组中的正数最大值加上负数最小值的绝对值。

``` javascript
function bucketSort(array) {
    var bucket = [], // 正数桶
        negativeBucket = [], // 负数桶
        result = [],
        l = array.length,
        i,
        j,
        k,
        abs;

    // 入桶
    for (i = 0; i < l; i++) {
        if (array[i] < 0) {
            abs = Math.abs(array[i]);
            if (!negativeBucket[abs]) {
                negativeBucket[abs] = [];
            }
            negativeBucket[abs].push(array[i]);

        } else {
            if (!bucket[array[i]]) {
                bucket[array[i]] = [];
            }
            bucket[array[i]].push(array[i]);
        }
    }
    // 出桶
    l = negativeBucket.length;
    for (i = l - 1; i >= 0; i--) {
        if (negativeBucket[i]) {
            k = negativeBucket[i].length;
            for (j = 0; j < k; j++) {
                result.push(negativeBucket[i][j]);
            }
        }
    }

    l = bucket.length;
    for (i = 0; i < l; i++) {
        if (bucket[i]) {
            k = bucket[i].length;
            for (j = 0; j < k; j++) {
                result.push(bucket[i][j]);
            }
        }
    }

    return result;
}
```

下面这种方式就是文中举例分析的那样，每个桶存放一定范围的数字，用 step 参数来设置该范围，取 step 为 1 就退化成前一种实现方式。关键部位代码有注释，慢慢看，逻辑稍微有点复杂。

``` javascript
/*
* @array 将要排序的数组
*
* @step 划分桶的步长，比如 step = 5，表示每个桶存放的数字的范围是 5，像 -4~1、0~5、6~11
*/
function bucketSort(array, step) {
    var result = [],
        bucket = [],
        bucketCount,
        l = array.length,
        i,
        j,
        k,
        s,
        max = array[0],
        min = array[0],
        temp;

    for (i = 1; i < l; i++) {
        if (array[i] > max) {
            max = array[i]
        }
        if (array[i] < min) {
            min = array[i];
        }
    }
    min = min - 1;

    bucketCount = Math.ceil((max - min) / step); // 需要桶的数量

    for (i = 0; i < l; i++) {
        temp = array[i];
        for (j = 0; j < bucketCount; j++) {
            if (temp > (min + step * j) && temp <= (min + step * (j + 1))) { // 判断放入哪个桶
                if (!bucket[j]) {
                    bucket[j] = [];
                }
                // 通过插入排序将数字插入到桶中的合适位置
                s = bucket[j].length;
                if (s > 0) {
                    for (k = s - 1; k >= 0; k--) {
                        if (bucket[j][k] > temp) {
                            bucket[j][k + 1] = bucket[j][k];
                        } else {
                            break;
                        }
                    }
                    bucket[j][k + 1] = temp;
                } else {
                    bucket[j].push(temp);
                }
            }
        }
    }

    for (i = 0; i < bucketCount; i++) { // 循环取出桶中数据
        if (bucket[i]) {
            k = bucket[i].length;
            for (j = 0; j < k; j++) {
                result.push(bucket[i][j]);
            }
        }
    }

    return result;
}
```


## 参考文章 ##
- [维基百科，自由的百科全书](http://zh.wikipedia.org/wiki/%E6%A1%B6%E6%8E%92%E5%BA%8F)
- [Programming Contest Central](https://www-927.ibm.com/ibm/cas/hspc/student/algorithms/BucketSort.html)
- [桶排序（Bucket sort）](http://www.roading.org/algorithm/introductiontoalgorithm/%E7%AC%AC%E5%85%AB%E7%AB%A0%EF%BC%884%EF%BC%89-%E6%A1%B6%E6%8E%92%E5%BA%8F%EF%BC%88bucket-sort%EF%BC%89.html)
- [Data Structure Visualizations](http://www.cs.usfca.edu/~galles/visualization/BucketSort.html)
- [箱排序(Bin Sort)](http://student.zjzk.cn/course_ware/data_structure/web/paixu/paixu8.6.1.1.htm)