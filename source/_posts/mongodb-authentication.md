title: MongoDB 用户和身份验证
date: 2014-02-07 14:21:42
updated: 2014-02-07 14:21:42
tags: [MongoDB]
categories: []
keywords:
---
[MongoDB](http://www.mongodb.org/)是一个介于关系数据库和非关系数据库之间的产品，是非关系数据库当中功能最丰富，最像关系数据库的。这里推荐一个快速入门教程 - [8天学通 MongoDB](http://www.cnblogs.com/huangxincheng/category/355399.html)，写的很全面。这里讨论的是 MongoDB 的用户和身份验证。

在默认情况下，MongoDB 不会进行身份验证，也没有账号，只要能连接上服务就可以对数据库进行各种操作，如果你在一个面向公众的服务器上使用它，那么这的确是一个问题。

![http://blog.mongodb.org/](http://bubkoo.qiniudn.com/logo-mongodb-tagline.png)
<!--more-->

作为数据库软件，我们肯定不想谁都可以访问，为了确保数据的安全，MongoDB 也会像其他的数据库软件一样可以采用用户验证的方法，那么该怎么做呢？其实很简单，MongoDB 提供了 addUser 方法，该方法包含三个参数：
- user - 字符串，表示用户名
- password - 字符串，对应的密码
- readOnly - boolean，可选参数，默认值为 `false`，表示是否是只读用户

添加用户：`db.addUser("guest", "pass", true)`

修改用户密码： `db.addUser("guest", "newpass")`

删除用户： `db.removeUser("guest")`

更复杂的使用方式请参考[官方文档](http://docs.mongodb.org/manual/reference/method/db.addUser/)。

可以将 MongoDB 的用户分为两类：超级用户和数据库用户。超级用户拥有最大权限，可以对所有数据库进行任意操作，超级用户储存在 admin 数据库中，刚安装的 MongoDB 中 admin 数据库是空的；数据库用户存储在单个数据库中，只能访问对应的数据库。另外，用户信息保存在 db.system.users 中。

关于用户和权限有以下特性：
1. 数据库是由超级用户来创建的，一个数据库可以包含多个用户，一个用户只能在一个数据库下，不同数据库中的用户可以同名
2. 如果在 admin 数据库中不存在用户，即使 mongod 启动时添加了 --auth 参数，此时不进行任何认证还是可以做任何操作
3. 在 admin 数据库创建的用户具有超级权限，可以对 MongoDB 系统内的任何数据库的数据对象进行操作
4. 特定数据库比如 test1 下的用户 test_user1，不能够访问其他数据库 test2，但是可以访问本数据库下其他用户创建的数据
5. 不同数据库中同名的用户不能够登录其他数据库。比如数据库 test1 和 test2 都有用户 test_user，以 test_user 登录 test1 后,不能够登录到 test2 进行数据库操作

## 实验验证 ##

开始之前，说明以下我的文件目录结构：

``` javascript
 ─mongodb-2.4.8
   ├─bin   // MongoDB 的二进制文件
   ├─data  // MongoDB 数据库存放目录
   └─log   // MongoDB 日志存放目录 
```

首次安装 MongoDB 后，admin 数据库中没有用户，此时不管是否以 --auth 方式启动数据库，其他数据库(比如 test1 数据库)中的用户都可以对另外的数据库(比如 test2 数据库)中的数据进行操作。


以普通的方式启动 MongoDB

``` dos
D:\MongoDB\mongodb-2.4.8>.\bin\mongod --dbpath=.\data --logpath=.\log\log.log
```

打开另一个命令提示符窗口，进入 MongoDB Shell，默认直接连接 test 数据库，并且此时用户拥有超级权限，可以操作任何数据库对象。

``` dos
D:\MongoDB\mongodb-2.4.8\bin>mongo
MongoDB shell version: 2.4.8
connecting to: test
Welcome to the MongoDB shell.
For interactive help, type "help".
For more comprehensive documentation, see
        http://docs.mongodb.org/
Questions? Try the support group
        http://groups.google.com/group/mongodb-user
```

显示所有数据库，默认只有 local 数据库。

``` dos
> show dbs
local   0.078125GB
```

查看 admin 数据库中的用户信息，因为是刚建立的数据库所以 user 为空

``` dos
> use admin
switched to db admin
> db.system.users.find(); # 默认 admin 数据库中不存在用户
```

操作 test 数据库，插入测试数据，并创建用户 test_user，密码为 password

``` dos
> use test
switched to db test
> db.system.users.find(); # 默认 test 数据库中也不存在用户
> db.test_data.insert({"id":1,"info":"I am in test"})
> db.test_data.insert({"id":2,"info":"I am in test"})
> db.test_data.insert({"id":3,"info":"I am in test"})

> db.test_data.find()
{ "_id" : ObjectId("52f5922125d9e18cd51581b6"), "id" : 1, "info" : "I am in test" }
{ "_id" : ObjectId("52f5926d25d9e18cd51581b7"), "id" : 2, "info" : "I am in test" }
{ "_id" : ObjectId("52f5927125d9e18cd51581b8"), "id" : 3, "info" : "I am in test" }

# 创建用户
> db.addUser("test_user","password")
{
        "user" : "test_user",
        "readOnly" : false,
        "pwd" : "bf7a0adf9822a3379d6dfb1ebd38b92e",
        "_id" : ObjectId("52f5928625d9e18cd51581b9")
}
> db.system.users.find()
{ "_id" : ObjectId("52f5928625d9e18cd51581b9"), "user" : "test_user", "readOnly" : false, 
pwd" : "bf7a0adf9822a3379d6dfb1ebd38b92e" }

# 验证函数，验证数据库中是否存在对应的用户
> db.auth("test_user","password")
1
```


创建 test1 数据库，并创建对象 test1_data，插入数据：

``` dos
> use test1
switched to db test1
> db.test1_data.insert({"id":1,"info":"I am in test1"})
> db.test1_data.insert({"id":2,"info":"I am in test1"})
> db.test1_data.insert({"id":3,"info":"I am in test1"})
> db.test1_data.find()
{ "_id" : ObjectId("52f593e925d9e18cd51581ba"), "id" : 1, "info" : "I am in test1" }
{ "_id" : ObjectId("52f593ef25d9e18cd51581bb"), "id" : 2, "info" : "I am in test1" }
{ "_id" : ObjectId("52f593f425d9e18cd51581bc"), "id" : 3, "info" : "I am in test1" }
```

创建 test2 数据库，并创建对象 test2_data，插入数据：

``` dos
> use test2
switched to db test2
> db.test2_data.insert({"id":1,"info":"I am in test2"})
> db.test2_data.insert({"id":2,"info":"I am in test2"})
> db.test2_data.insert({"id":3,"info":"I am in test2"})
> db.test2_data.find()
{ "_id" : ObjectId("52f5947725d9e18cd51581bd"), "id" : 1, "info" : "I am in test2" }
{ "_id" : ObjectId("52f5947c25d9e18cd51581be"), "id" : 2, "info" : "I am in test2" }
{ "_id" : ObjectId("52f5948125d9e18cd51581bf"), "id" : 3, "info" : "I am in test2" }
```

**重新以认证的方式启动数据库**，启动时添加 --auth 参数：

``` dos
D:\MongoDB\mongodb-2.4.8>.\bin\mongod --dbpath=.\data --logpath=.\log\log.log --auth
```

再次登录，虽然在 test 中创建了用户，但是**没有在 admin 数据库中创建用户**，所以以默认方式登录的用户依然具有超级权限

``` dos
D:\MongoDB\mongodb-2.4.8\bin>mongo
MongoDB shell version: 2.4.8
connecting to: test
```

默认具有超级权限，可以进行所有操作

``` dos
> show dbs
admin   (empty)
local   0.078125GB
test    0.203125GB
test1   0.203125GB
test2   0.203125GB

> use test
switched to db test
> db.system.users.find()
{ "_id" : ObjectId("52f5928625d9e18cd51581b9"), "user" : "test_user", "readOnly"
 : false, "pwd" : "bf7a0adf9822a3379d6dfb1ebd38b92e" }

> use test1
switched to db test1
> db.test1_data.find()
{ "_id" : ObjectId("52f593e925d9e18cd51581ba"), "id" : 1, "info" : "I am in test1" }
{ "_id" : ObjectId("52f593ef25d9e18cd51581bb"), "id" : 2, "info" : "I am in test1" }
{ "_id" : ObjectId("52f593f425d9e18cd51581bc"), "id" : 3, "info" : "I am in test1" }

# 插入数据
> db.test1_data.insert({"id":4,"info":"I am in test1"})
> db.test1_data.find()
{ "_id" : ObjectId("52f593e925d9e18cd51581ba"), "id" : 1, "info" : "I am in test1" }
{ "_id" : ObjectId("52f593ef25d9e18cd51581bb"), "id" : 2, "info" : "I am in test1" }
{ "_id" : ObjectId("52f593f425d9e18cd51581bc"), "id" : 3, "info" : "I am in test1" }
{ "_id" : ObjectId("52f5ae44bee8a41e4b495370"), "id" : 4, "info" : "I am in test1" }

# 创建数据库 test3，并插入数据
> use test3
switched to db test3
> db.test3_data.insert({"id":1,"info":"I am in test3"})
> db.test3_data.insert({"id":2,"info":"I am in test3"})
> db.test3_data.insert({"id":3,"info":"I am in test3"})
> db.test3_data.find()
{ "_id" : ObjectId("52f5aee9bee8a41e4b495371"), "id" : 1, "info" : "I am in test3" }
{ "_id" : ObjectId("52f5af28bee8a41e4b495372"), "id" : 2, "info" : "I am in test3" }
{ "_id" : ObjectId("52f5af2cbee8a41e4b495373"), "id" : 3, "info" : "I am in test3" }
```

**使用特定用户登录数据库，也可以访问其他的数据库**。下面的例子中，使用 test 数据库中的用户 test_user 登录，但是由于 admin 数据库中不存在用户，所以任然具有超级权限。

``` dos
D:\MongoDB\mongodb-2.4.8\bin>mongo -utest_user -ppassword
MongoDB shell version: 2.4.8
connecting to: test
> show dbs
admin   (empty)
local   0.078125GB
test    0.203125GB
test1   0.203125GB
test2   0.203125GB
test3   0.203125GB
> use test
switched to db test
> db.test_data.find()
{ "_id" : ObjectId("52f5922125d9e18cd51581b6"), "id" : 1, "info" : "I am in test" }
{ "_id" : ObjectId("52f5926d25d9e18cd51581b7"), "id" : 2, "info" : "I am in test" }
{ "_id" : ObjectId("52f5927125d9e18cd51581b8"), "id" : 3, "info" : "I am in test" }
> use test4
switched to db test4
> db.test4_data.insert({"id":1,"info":"I am in test4"})
> db.test4_data.insert({"id":2,"info":"I am in test4"})
> db.test4_data.insert({"id":3,"info":"I am in test4"})
> db.test4_data.find()
{ "_id" : ObjectId("52f5bce439a90d49d27742d2"), "id" : 1, "info" : "I am in test4" }
{ "_id" : ObjectId("52f5bce839a90d49d27742d3"), "id" : 2, "info" : "I am in test4" }
{ "_id" : ObjectId("52f5bcec39a90d49d27742d4"), "id" : 3, "info" : "I am in test4" }
```

**在 admin.system.users 中添加用户，使 MongoDB 的认证授权服务生效**

``` dos
# 在 admin 数据库中创建用户 supper，密码为 password
> use admin
switched to db admin
> db.addUser("supper","password")
{
        "user" : "supper",
        "readOnly" : false,
        "pwd" : "0d345bf64f4c1e8bc3e3bbb04c46b4d3",
        "_id" : ObjectId("52f5bdf439a90d49d27742d5")
}

# 认证
> db.auth("supper","password")
1
>
```

以默认方式登录，即以无认证用户登录，查询的时候会显示无权限：

``` dos
D:\MongoDB\mongodb-2.4.8\bin>mongo
MongoDB shell version: 2.4.8
connecting to: test
> db.system.users.find()
error: { "$err" : "not authorized for query on test.system.users", "code" : 16550 }
> show dbs
Sat Feb 08 13:20:27.831 listDatabases failed:{ "ok" : 0, "errmsg" : "unauthorized" } at src/mongo/shell/mongo.js:46
```

在 admin 数据库创建用户后，使用认证方式登录，可进行对应数据库的查询操作且仅仅能够查询对应的数据库中的信息，不能够查询其他 MongoDB 系统的其他数据库信息：

``` dos
# 使用 test 数据库中的用户可以查询 test 的数据，但是不能查看其他的数据库的数据
D:\MongoDB\mongodb-2.4.8\bin>mongo -utest_user -ppassword
MongoDB shell version: 2.4.8
connecting to: test
> db.system.users.find()
{ "_id" : ObjectId("52f5928625d9e18cd51581b9"), "user" : "test_user", "readOnly"
 : false, "pwd" : "bf7a0adf9822a3379d6dfb1ebd38b92e" }
> db.test_data.find()
{ "_id" : ObjectId("52f5922125d9e18cd51581b6"), "id" : 1, "info" : "I am in test" }
{ "_id" : ObjectId("52f5926d25d9e18cd51581b7"), "id" : 2, "info" : "I am in test" }
{ "_id" : ObjectId("52f5927125d9e18cd51581b8"), "id" : 3, "info" : "I am in test" }

# 查询系统数据库信息，报错
> show dbs
Sat Feb 08 13:23:03.423 listDatabases failed:{ "ok" : 0, "errmsg" : "unauthorized" } at src/mongo/shell/mongo.js:46

# 查询 test1 数据库，报错
> use test1
switched to db test1
> db.test1_data.find()
error: { "$err" : "not authorized for query on test1.test1_data", "code" : 16550 }

# 查询 test2 数据库，报错
> use test2
switched to db test2
> db.test2_data.find()
error: { "$err" : "not authorized for query on test2.test2_data", "code" : 16550 }
```

使用 supper 用户登录，可以对 MongoDB 系统内的所有数据库进行操作：

``` dos
D:\MongoDB\mongodb-2.4.8\bin>mongo 127.0.0.1/admin -usupper -ppassword
MongoDB shell version: 2.4.8
connecting to: 127.0.0.1/admin

> show dbs
admin   0.203125GB
local   0.078125GB
test    0.203125GB
test1   0.203125GB
test2   0.203125GB
test3   0.203125GB
test4   0.203125GB

> use test
switched to db test
> db.addUser("test_user1","password")
{
        "user" : "test_user1",
        "readOnly" : false,
        "pwd" : "af20fbd43eb73735b7fc7271f0d18ce4",
        "_id" : ObjectId("52f5c0c01caaf8492f79da16")
}
> db.test_data.find()
{ "_id" : ObjectId("52f5922125d9e18cd51581b6"), "id" : 1, "info" : "I am in test" }
{ "_id" : ObjectId("52f5926d25d9e18cd51581b7"), "id" : 2, "info" : "I am in test" }
{ "_id" : ObjectId("52f5927125d9e18cd51581b8"), "id" : 3, "info" : "I am in test" }
> db.test_data.insert({"id":4,"info":"I am in test"})
> db.test_data.find()
{ "_id" : ObjectId("52f5922125d9e18cd51581b6"), "id" : 1, "info" : "I am in test" }
{ "_id" : ObjectId("52f5926d25d9e18cd51581b7"), "id" : 2, "info" : "I am in test" }
{ "_id" : ObjectId("52f5927125d9e18cd51581b8"), "id" : 3, "info" : "I am in test" }
{ "_id" : ObjectId("52f5c10e1caaf8492f79da17"), "id" : 4, "info" : "I am in test" }
```

特定数据库比如 test 下的用户 test_user，是可以访问本数据库下其他用户创建的数据：

用 test_user1 登录 test 数据库，并插入数据

``` dos
D:\MongoDB\mongodb-2.4.8\bin>mongo 127.0.0.1/test -utest_user1 -ppassword
MongoDB shell version: 2.4.8
connecting to: 127.0.0.1/test
> db.test_data.insert({"id":5,"info":"I am created by test_user1"})
> db.test_data.insert({"id":6,"info":"I am created by test_user1"})
> db.test_data.find()
{ "_id" : ObjectId("52f5922125d9e18cd51581b6"), "id" : 1, "info" : "I am in test" }
{ "_id" : ObjectId("52f5926d25d9e18cd51581b7"), "id" : 2, "info" : "I am in test" }
{ "_id" : ObjectId("52f5927125d9e18cd51581b8"), "id" : 3, "info" : "I am in test" }
{ "_id" : ObjectId("52f5c10e1caaf8492f79da17"), "id" : 4, "info" : "I am in test" }
{ "_id" : ObjectId("52f5c1eb15944f80880dfb1f"), "id" : 5, "info" : "I am created by test_user1" }
{ "_id" : ObjectId("52f5c1f015944f80880dfb20"), "id" : 6, "info" : "I am created by test_user1" }
```

用 test_user 重新登录 test 数据库，可以查询到 test_user1 创建的数据：

``` dos
D:\MongoDB\mongodb-2.4.8\bin>mongo 127.0.0.1/test -utest_user -ppassword
MongoDB shell version: 2.4.8
connecting to: 127.0.0.1/test
> db.test_data.find()
{ "_id" : ObjectId("52f5922125d9e18cd51581b6"), "id" : 1, "info" : "I am in test" }
{ "_id" : ObjectId("52f5926d25d9e18cd51581b7"), "id" : 2, "info" : "I am in test" }
{ "_id" : ObjectId("52f5927125d9e18cd51581b8"), "id" : 3, "info" : "I am in test" }
{ "_id" : ObjectId("52f5c10e1caaf8492f79da17"), "id" : 4, "info" : "I am in test" }
{ "_id" : ObjectId("52f5c1eb15944f80880dfb1f"), "id" : 5, "info" : "I am created by test_user1" }
{ "_id" : ObjectId("52f5c1f015944f80880dfb20"), "id" : 6, "info" : "I am created by test_user1" }
```

不同数据库中的用户可以同名，不同数据库中同名的用户不能登录其他数据库。例如 test1 和 test2 中都有 some_user，以 some_user 登录 test1 后，不能够登录到 test2 进行数据库操作

首先，在  test1 和 test2 中创建同名用户 some_user，密码都为 password：

``` dos
# 创建用户需要超级权限，用 supper 用户登录 admin 数据库
D:\MongoDB\mongodb-2.4.8\bin>mongo 127.0.0.1/admin -usupper -ppassword
MongoDB shell version: 2.4.8
connecting to: 127.0.0.1/admin

> use test1
switched to db test1
> db.addUser("some_user","password")
{
        "user" : "some_user",
        "readOnly" : false,
        "pwd" : "ed235c1f49990c04775a33e58ede9f99",
        "_id" : ObjectId("52f5c385daeb9d6bbdf0a741")
}

> use test2
switched to db test2
> db.addUser("some_user","password")
{
        "user" : "some_user",
        "readOnly" : false,
        "pwd" : "ed235c1f49990c04775a33e58ede9f99",
        "_id" : ObjectId("52f5c3a1daeb9d6bbdf0a742")
}
```

然后，以 some_user 登录 test1，并尝试对 test2 进行操作：

``` dos
D:\MongoDB\mongodb-2.4.8\bin>mongo 127.0.0.1/test1 -usome_user -ppassword
MongoDB shell version: 2.4.8
connecting to: 127.0.0.1/test1

# 查询数据库 test2，出错
> use test2
switched to db test2
> db.test2_data.find()
error: { "$err" : "not authorized for query on test2.test2_data", "code" : 16550 }
```

使用 db.auth() 可以对数据库中的用户进行验证，如果验证成功则返回 1，否则返回 0。db.auth() 只能针对登录用户所属的数据库的用户信息进行验证，不能验证其他数据库的用户信息。

``` dos
D:\MongoDB\mongodb-2.4.8\bin>mongo 127.0.0.1/test -utest_user -ppassword
MongoDB shell version: 2.4.8
connecting to: 127.0.0.1/test
> db.auth("test_user1","password")
1
> db.auth("some_user","password")
Error: 18 { code: 18, ok: 0.0, errmsg: "auth fails" }
0
```

## 总结 ##
启用 MongoDB 用户认证的步骤：
1. 在要启用认证的数据库中创建对应的用户
2. 如果 admin 中没有用户，则必须在 admin 中添加用户，否则即使使用 --auth 的方式启动 MongoDB，认证方式也无效，默认会拥有超级权限
3. 以认证方式，即 --auth 参数的方式启动 MongoDB 数据库
4. 用数据库对应的用户登录数据库，比如：mongo 127.0.0.1/test -utest_user -ppasword

