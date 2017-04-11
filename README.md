# hemsl

hemsl是一个轻量级的命令行参数解析器，也支持命令执行。hemsl能根据定义，自动生成帮助信息。

[![Build Status](https://travis-ci.org/hemsl/hemsl.svg?branch=master)](https://travis-ci.org/hemsl/hemsl)
[![Build status](https://ci.appveyor.com/api/projects/status/hn9f1bhw5mxql8re/branch/master?svg=true)](https://ci.appveyor.com/project/zdying/hemsl/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/hemsl/hemsl/badge.svg?branch=master)](https://coveralls.io/github/hemsl/hemsl?branch=master)
[![npm](https://img.shields.io/npm/v/hemsl.svg)](https://www.npmjs.com/package/hemsl)
[![npm](https://img.shields.io/npm/l/hemsl.svg)](https://raw.githubusercontent.com/hemsl/hemsl/master/LICENSE)

## 安装

```bash
npm install hemsl --save
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
    .bin('example');
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
    });
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
        console.log('Server started at', 'http://' + ip + ':' + port);

        var http = require('http');

        var server = http.createServer(function(req, res){
            console.log(req.method.bold.gray, req.url);
            res.end(req.url);
        });

        server.listen(port, ip);
    }
});
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
});
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

#### .parse(config) => Object

解析参数，返回解析后的参数对象。

#### .execute(config) => Args

执行`argv`中指定的命令。

### Option

### Command

## 其他示例

参考：
* [example 1](./example/index.js)
* [example 2](./example/cmd_global.js)

## TODO

- [x] Command对应Option处理（可能和全局的冲突／alias）
- [x] 支持`--option=argument`格式
- [x] 支持`--`和`-`后的内容不再解析
- [x] 支持Argument校验
- [ ] 支持Option数据类型
- [x] 支持Argument正则表达式/function校验
- [ ] `parse()`方法默认不执行命令，同时添加配置（是否执行）
- [ ] 添加`execute()`方法来手动执行命令
- [x] 修改option,command定义方式，直接使用Object
- [ ] 脚手架生成模板
- [ ] 编写文档
- [ ] 完善测试
