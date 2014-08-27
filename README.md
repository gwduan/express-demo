# express-demo

A web demo using Express framework, with MongoDB and Redis support.

这是一个基于[Express](http://expressjs.com/)框架构建的应用demo，后台数据库使用[MongoDB](http://www.mongodb.org)，并使用[Redis](http://redis.io)存储session和一些统计数据。

## API列表

| 功能 | URL | Mode |
|------|:-----|------|
| 注册 | /users/register | POST |
| 登录 | /users/login    | POST |
| 登出 | /users/logout   | POST |
| 修改密码 | /users/passwd   | POST |
| 上传文件 | /users/uploads   | POST |

输入数据通过form表单提交，返回数据均为json。

在public/test/目录下有如下的测试表单，除了用于测试外，也可看出具体的数据通讯协议：
* register.html
* login.html
* logout.html
* passwd.html
* uploads.html

## 环境

### Node.js

需要事先安装好Node.js，并设置好$PATH等。

### MongoDB

在settings.js中设置MongoDB参数，如：

```
mongodb: {
  name: 'express-demo',
  host: '127.0.0.1',
  port: 27017,
  serverOptions: {auto_reconnect: true},
},
```

如果是复制集，则如下设置：
```
mongodb: {
  name: 'express-demo',
  servers: [
    {host: '10.10.0.61', port: 27017, serverOptions: {auto_reconnect:true}},
    {host: '10.10.0.62', port: 27017, serverOptions: {auto_reconnect:true}},
    {host: '10.10.0.63', port: 27017, serverOptions: {auto_reconnect:true}},
  ],
  rsOptions: {rs_name: 'rs0'},
},
```

### Redis

在settings.js中设置Redis参数，涉及两个地方，一个是sess，一个是cache，两者可以不同：

```
sess: {
  host: '127.0.0.1',
  port: 6379,
},
cache: {
  host: '127.0.0.1',
  port: 6379,
  pass: 'express-demo',
},
```

## 运行

进入代码目录，安装依赖包：
```
$ cd express-demo/
$ npm install
```

完毕运行（调试模式）：

```
$ DEBUG=express-demo ./bin/www
```
