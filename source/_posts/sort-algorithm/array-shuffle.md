title: JavaScript 随机打乱数组 - 洗牌算法
date: 2014-01-12 19:38:36
updated: 2014-01-12 19:38:36
tags: [Shuffle,Algorithm,JavaScript]
categories: []
keywords:
---
在学习排序算法的时候，经常要用到随机数组，于是就写了一个生成随机数组的方法。算法来自网络，只是修改成了 JavaScript 版本。

基本原理是洗牌算法，首先从所有元素中随机选取一个与第一个元素进行交换，然后在第二个之后选择一个元素与第二个交换，直到最后一个元素。这样能确保每个元素在每个位置的概率都是1/n。

具体代码如下：

``` javascript
/**
 *
 * 生成从 1 到 length 之间的随机数组
 *
 * @length 随机数组的长度，如果未传递该参数，那么 length 为默认值 9
 *
 */
function randomArray(length) {
    var i,
        index,
        temp,
        arr = [length];
    length = typeof(length) === 'undefined' ? 9 : length;
    for (i = 1; i <= length; i++) {
        arr[i - 1] = i;
    }
    // 打乱数组
    for (i = 1; i <= length; i++) {
        // 产生从 i 到 length 之间的随机数
        index = parseInt(Math.random() * (length - i)) + i;
        if (index != i) {
            temp = arr[i];
            arr[i] = arr[index];
            arr[index] = temp;
        }
    }
    return arr;
}
```