title: hexo-filter-flowchart
date: 2017-04-24 15:59:50
updated: 2017-04-24 15:59:50
keywords:
---

> Generate flowchart diagrams for Hexo.

## Install

```
npm install --save hexo-filter-flowchart
```

## 示例

```flow
st=>start: Start|past:>http://www.google.com[blank]
e=>end: End:>http://www.google.com
op1=>operation: My Operation|past
op2=>operation: Stuff|current
sub1=>subroutine: My Subroutine|invalid
cond=>condition: Yes
or No?|approved:>http://www.google.com
c2=>condition: Good idea|rejected
io=>inputoutput: catch something...|request

st->op1(right)->cond
cond(yes, right)->c2
cond(no)->sub1(left)->op1
c2(yes)->io->e
c2(no)->op2->e
```

## License

MIT
