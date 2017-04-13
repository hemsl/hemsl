# hemsl

hemsl是一个轻量级的命令行参数解析器，也支持命令执行。hemsl能根据定义，自动生成帮助信息。

[![Build Status](https://travis-ci.org/hemsl/hemsl.svg?branch=master)](https://travis-ci.org/hemsl/hemsl)
[![Build status](https://ci.appveyor.com/api/projects/status/hn9f1bhw5mxql8re/branch/master?svg=true)](https://ci.appveyor.com/project/zdying/hemsl/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/hemsl/hemsl/badge.svg?branch=master)](https://coveralls.io/github/hemsl/hemsl?branch=master)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![npm](https://img.shields.io/npm/v/hemsl.svg)](https://www.npmjs.com/package/hemsl)
[![npm](https://img.shields.io/npm/l/hemsl.svg)](https://raw.githubusercontent.com/hemsl/hemsl/master/LICENSE)


<img src='logo.jpeg' width='300px'/>

> 白花小松，学名：Villadia batesii （Hemsl.）Baehni & Macbride，景天科、塔莲属多年生多肉植物，花期一般4～5月份。白花小松的叶形叶色较美，有一定的观赏价值；盆栽可放置于电视、电脑旁，可吸收辐射，亦可栽植于室内以吸收甲醛等物质，净化空气。

## 安装

### 使用`npm`

```bash
npm install hemsl --save
```

### 使用`yarn`
```bash
yarn add hemsl
```

## 使用

### 创建实例

```js
var Args = require('hemsl');
var args = new Args();
```

### 设定App版本和命令名称
```js
args
  .version('1.1.0')
  .bin('example')
```

### 添加全局选项(option)
```js
args
  .option(, {
    option: 'debug',
    default: true,
    describe: '显示调试信息（全局配置）',
    alias: 'd'
  })
  .option({
    option: 'grep <expression>',
    default: true,
    describe: '日志内容过滤（全局配置）',
    alias: 'g'
  })
```

### 添加命令(command)
```js
args.command({
  command: 'start <port> [ip]',
  describe: '启动本地测试服务',
  usage: 'example start <port> [ip] [options]',
  /**
    * 处理命令`start`的function
    * 启动一个服务
    */
  fn: function(port, ip){
    console.log('Server started at', 'http://' + ip + ':' + port)

    var http = require('http')

    var server = http.createServer(function(req, res){
        console.log(req.method.bold.gray, req.url);
        res.end(req.url)
    })

    server.listen(port, ip)
  }
})
```

### 给命令添加选项(option)

给命令添加选项，有两种方式：

* 方法一：调用`args.command()`方法是，设置配置字段`options`
* 方法二：调用`args.command()`返回对象的`option()`方法

#### 方法一
```js
args.command({
  command: 'start <port> [ip]',
  describe: '...',
  usage: '...',
  fn: function(port, ip){
      //...
  },
  options: {
    'p': {
      default: '',
      describe: 'service port',
      alias: 'port',
      usage: ''
    },
    'hot-reload': {
      alias: 'H',
      describe: 'enable hot reload'
    }
  }
});
```

#### 方法二

```js
args.command({
  command: 'start <port> [ip]', 
  // ...
})
.option({
  option: 'date-format', 
  default: 'yyyy-MM-dd',
  alias: 'R',
  describe: 'date format string'
})
.option({
  option: 'time-format',  
  alias: 'm',
  default: 'HH:mm:ss',
  describe: 'time format string'
})
```

## API

### Args

#### .version(ver='1.0.0') => Args

设置App版本号，默认值为`1.0.0`。这个版本号会在全局`-v`/`--version`的时候显示。

#### .bin(binName) => Args

设置App的命令名称。

#### .option(config) => Args

添加全局选项。

#### .command(config) => Command

添加命令。

#### .parse([argv,] execute=false) => Object

解析参数，返回解析后的参数对象。如果参数`execute`为`true`，自动执行`argv`中的命令。

#### .execute(config) => Args

执行`argv`中指定的命令。

### Option

### Command

## 其他示例

参考：
* [example 1](./example/index.js)
* [example 2](./example/cmd_global.js)
