title: React 框架新轮子：Mickey
tags:
  - React
  - Framework
  - Mickey
categories:
  - JavaScript
date: 2017-09-21 12:30:42
updated: 2017-09-21 12:30:42
keywords:
---

[Mickey](https://github.com/mickeyjsx/mickey) 是一款基于 [react](https://facebook.github.io/react/)、[redux](https://github.com/reactjs/redux)、[redux-saga](https://github.com/yelouafi/redux-saga) 和 [react-router](https://github.com/ReactTraining/react-router) 的轻量前端框架，其大部分思路借鉴了 [dva](https://github.com/dvajs/dva)，提供了更方便的 model 设计思路和更简单的 [actions](http://redux.js.org/docs/basics/Actions.html) 管理方案。

<!--more-->

## 为什么

基于 redux 的应用避免不了大量的[样板代码](https://github.com/reactjs/redux/blob/master/docs/recipes/ReducingBoilerplate.md)，还要维护大量的 action-type [常量字符串](http://redux.js.org/docs/basics/Actions.html)，这些都是低效和重复的劳动。[dva](https://github.com/dvajs/dva) 基于 elm 概念，通过 `reducers`, `effects` 和 `subscriptions` 来组织 model，在减少样本代码层面前进了一大步：

```js
{
  namespace: 'xxx',  // 命名空间，规定了 store 的结构
  subscriptions:{},  // 事件订阅，将在 model 被加载时调用
  state: {},         // 初始状态
  effects: {},       // 处理异步 action
  reducers: {},      // 处理同步 action
}
```

看一个更接近实际的例子：

```js
{
  namespace: 'users',
  
  state: {
    items: [],
    loading: false,
  },
 
  effects: {
    *query ({ payload = {} }, { call, put }) {
      const { response, error } = yield call(queryUser, payload); 
      if (response) {
        yield put({
          type: 'querySuccess',
          payload: response.data,
        })
      } else {
	  	yield put({
          type: 'queryFailed',
        })
	  }
    },
  },

  reducers: {
    query: (state) => ({ ...state, loading: true }),
    queryFailed: (state) => ({ ...state, loading: false }),
    querySuccess: (state, { payload }) => ({
      ...state,
	  items: payload,
	  loading: false,
	}),
  },
}
```

仔细看上面代码，对一个异步 action 处理通常会经历以下几步：

1. 在 `effects` 中设计异步 action 处理方法：`*query`
2. 在 `reducers` 中设计对应的同步 action 处理方法：`query`，这里我们将 UI 状态置为 loading
3. 异步接口调用成功后通常会分成功和失败两种情况分别触发 `querySuccess` 和 `queryFailed` 两个同步的 action


实际项目中 model 可能会更[复杂](https://github.com/zuiidea/antd-admin/blob/master/src/models/user.js) ，需要在 model 的 `effects` 和 `reducers` 两个大结构中**跳转编辑**才能完成对一个异步 action 的处理，也就是说，我们需要先在 `effects` 完成 `*query()` 的逻辑，然后在 `reducers` 中完成 `query()`、`querySuccess()` 和 `queryFailed()` 三个同步 reducer。这样的跳转使编写代码、阅读代码和排查问题都非常不便。

### 就近原则

我们都知道，相同逻辑或者相关的代码放在一起是模块化思路之一。同理，对于一个异步 action 的所有处理属于强相关代码，在 Mickey 中可以这样来实现上面的 model：

```js
{
  namespace: 'users',
  state: { },
  query: {
    * effect() { }, // 处理 query 的异步逻辑
    prepare() { },  // 异步请求前的准备工作，如置 loading
    success() { },  // 请求成功
    failed() { },   // 请求失败
  },
}
```

对上面 `query` 的结构有几点说明：
- 包含不超过 1 个异步处理方法，**方法名随意**
- 可以包含任意个同步处理处理方法，`prepare` 这个方法名固定
- `dispatch({type: 'users/query'})` 时，将同时触发 `*effect` 和 `prepare`，所以这两个方法需要在上面的结构中**至少出现一个**
- 除 `effect` 和 `prepare` 其他两个方法 `success` 和 `failed` 可以统称为**回调方法**，回调方法的方法名和数量都随意

### 不修改原生API

dva 对 saga 的 `put` 方法和 store 的 `dispatch` 方法做了重新封装，封装的思路是自动判断和添加 `namespace`，如上面示例中的 `put({type: 'querySuccess'})`。

如果没有这层封装会不会更好呢？一方面不会给开发者带去理解上的困难，另一方面也保证的原生 API 的纯净。但是，如果没有这层封装每次在 model 内部调用 `put` 或 `dispatch` 就非常麻烦，必须指定完整的命名空间。

在上一节中提到，在 model 中除了 `*effect` 和 `prepare` 之外的方法我们统称为回调，这些回调方法通常会在异步请求完成之后之后通过 `put` 一个 action 来触发，既然这样我们何不直接将这些回调方法的名称作为 `*effect` 的参数，在 `*effect` 内部就可以直接调用：

```js
{
  namespace: 'users',
  state: { 
  	items: [],
	loading: false,
  },
  query: {
    * effect(payload, { call }, { success, failed }) { 
      const { response, error } = yield call(queryUser, payload); 
	  if (response) {
		yield success(response.data);
	  } else {
		yield failed();
	  }	
    }, 
    prepare: (state) => ({ ...state, loading: true }),
    failed: (state) => ({ ...state,, loading: false }),
    success: (state, payload) => ({ ...state, items: payload, loading: false }),
  },
}
```

通过在 `*effect` 方法中注入回调函数，不仅不需要修改原生 `dispatch` 和 `put` 的行为，同时不再需要关心和维护 action-type [常量字符串](http://redux.js.org/docs/basics/Actions.html)。

在 Mickey 中 `*effect` 方法的完整签名：

```js
*effect (payload, sagaEffects, callbacks, innerActions, actions) { }
```

同步 action 处理方法签名：

```js
someName(state, payload) { return newState }
```

对比原生 reducer 方法：
```js
someName(state, action) { return newState }
```

区别在于方法的第二个参数，正是由于我们不再需要关心和维护 action-type 字符串，所以在 mickey 中直接使用了 `payload` 作为第二个参数。

## 完整示例

看下面计数器的例子：

```jsx
import React from 'react'
import createApp, {connect, injectActions} from 'mickey'

// 1. Initialize
const app = createApp()

// 2. Model
app.model({
  namespace: 'counter',
  state: {
    count: 0,
    loading: false,
  },
  increment: state => ({ ...state, count: state.count + 1 }),
  decrement: state => ({ ...state, count: state.count - 1 }),
  incrementAsync: {
    * effect(payload, { call }, { succeed }) {
      const delay = timeout => new Promise((resolve) => {
        setTimeout(resolve, timeout)
      })
      yield call(delay, 2000)
      yield succeed()
    },
    prepare: state => ({ ...state, loading: true }),
    succeed: state => ({ ...state, count: state.count + 1, loading: false }),
  },
})

// 3. Component
const Comp = (props) => (
  <div>
    <h1>{props.counter.count}</h1>
    <button onClick={() => props.actions.counter.decrement()}>-</button>
    <button onClick={() => props.actions.counter.increment()}>+</button>
    <button onClick={() => props.actions.counter.incrementAsync()}>+ Async</button>
  </div>
)

// 4. Connect state with component and inject `actions`
const App = injectActions(
    connect(state => ({ counter: state.counter })(Comp)
)

// 5. View
app.render(<App />, document.getElementById('root'))
```

## 更多示例

- [Counter](https://github.com/mickeyjsx/mickey/blob/master/examples/counter)：简单的计数器
- [Counter-Persist](https://github.com/mickeyjsx/mickey/blob/master/examples/counter-persist)：搭配 [redux-persist](https://github.com/rt2zz/redux-persist) 使用
- [Counter-Immutable](https://github.com/mickeyjsx/mickey/blob/master/examples/counter-immutable)：搭配 [ImmutableJS](https://github.com/facebook/immutable-js/) 使用
- [Counter-Persist-Immutable](https://github.com/mickeyjsx/mickey/blob/master/examples/counter-persist-immutable)：搭配 [redux-persist](https://github.com/rt2zz/redux-persist) 和 [ImmutableJS](https://github.com/facebook/immutable-js/) 使用
- [Counter-Undo](https://github.com/mickeyjsx/mickey/blob/master/examples/counter-undo)：搭配 [redux-undo](https://github.com/omnidan/redux-undo) 使用
- [Simple-Router](https://github.com/mickeyjsx/mickey/blob/master/docs/zh-CN/examples/simple-router)：基于 [react-router@4.x](https://reacttraining.com/react-router/)
- [mickey-todo](https://github.com/mickeyjsx/mickey-todo) ([demo](https://mickeyjsx.github.io/todo)): 简单的 TODO 应用
- [mickey-vstar](https://github.com/mickeyjsx/mickey-vstar) ([demo](http://mickeyjsx.github.io/vstar))：查询指定 Github 账号中被加星项目并按加星数排序
