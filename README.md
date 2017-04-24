# hemsl

hemsl是一个轻量级的命令行参数解析器，也支持命令执行。hemsl能根据定义，自动生成帮助信息。

[![Build Status](https://travis-ci.org/hemsl/hemsl.svg?branch=master)](https://travis-ci.org/hemsl/hemsl)
[![Build status](https://ci.appveyor.com/api/projects/status/hn9f1bhw5mxql8re/branch/master?svg=true)](https://ci.appveyor.com/project/zdying/hemsl/branch/master)
[![codecov](https://codecov.io/gh/hemsl/hemsl/branch/master/graph/badge.svg)](https://codecov.io/gh/hemsl/hemsl)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)
[![npm](https://img.shields.io/npm/v/hemsl.svg)](https://www.npmjs.com/package/hemsl)
[![npm](https://img.shields.io/npm/l/hemsl.svg)](https://raw.githubusercontent.com/hemsl/hemsl/master/LICENSE)

<img src='https://github.com/hemsl/hemsl/raw/master/logo.jpeg' width='300px'/>

> White flowers Komatsu, scientific name: Villadia batesii (Hemsl.) Baehni & Macbride, Sedum, Tulian perennial multi-meat plants, flowering generally 4 to 5 months. White flowers Komatsu leaves more beautiful, there is a certain ornamental value; potted plants can be placed on the TV, the computer can absorb radiation, can also be planted in the room to absorb formaldehyde and other substances, purify the air.


## Install

### Use `npm`

```bash
$ npm install hemsl --save
```

### Use `yarn`

```bash
$ yarn add hemsl
```

## Usages

### Create an instance

```js
var Args = require('hemsl');
var args = new Args();
```

### Set app version and bin name

```js
args
  .version('1.1.0')
  .bin('example');
```

### Add global option

```js
args
  .option(, {
    option: 'debug',
    default: true,
    describe: 'Print debug log (global option)',
    alias: 'd'
  })
  .option({
    option: 'grep <expression>',
    default: true,
    describe: 'Debug log filter (global option)',
    alias: 'g'
  });
```

### Add command

```js
args.command({
  command: 'start <port> [ip]',
  describe: 'Start a local server',
  usage: 'example start <port> [ip] [options]',
  /**
    * The `start` command handle
    * Start a local server
    */
  fn: function(port, ip){
    console.log('Server started at', 'http://' + ip + ':' + port);

    var http = require('http');

    var server = http.createServer(function(req, res){
        console.log(req.method.bold.gray, req.url);
        res.end(req.url);
    })

    server.listen(port, ip);
  }
})
```

### Add option to command

There are two ways to add an option to a command:

- Method 1: Call the `args.command()` method and set the configuration field `options`
- Method 2: Call the `args.command().option()` method

#### Method 1

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

#### Method 2

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

## Other Example

-   [example 1](./example/index.js)
-   [example 2](./example/cmd_global.js)

## API

## Classes

<dl>
<dt><a href="#Args">Args</a></dt>
<dd></dd>
<dt><a href="#Command">Command</a></dt>
<dd></dd>
</dl>

<a name="Args"></a>

## Args
**Kind**: global class  

* [Args](#Args)
    * [new Args(config)](#new_Args_new)
    * [.parse([argv], [execute])](#Args+parse) ⇒ <code>Object</code>
    * [.execute()](#Args+execute) ⇒ <code>[Args](#Args)</code>
    * [.option(key, config)](#Args+option) ⇒ <code>[Args](#Args)</code>
    * [.command(cmd, config)](#Args+command) ⇒ <code>[Command](#Command)</code>
    * [.help([cmdName])](#Args+help) ⇒ <code>[Args](#Args)</code>
    * [.version(ver)](#Args+version) ⇒ <code>[Args](#Args)</code>
    * [.bin(binName)](#Args+bin) ⇒ <code>[Args](#Args)</code>

<a name="new_Args_new"></a>

### new Args(config)
参数解析


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | 配置对象 |

<a name="Args+parse"></a>

### args.parse([argv], [execute]) ⇒ <code>Object</code>
解析参数，返回解析后的参数对象。如果参数`execute`为`true`，自动执行argv中的命令

**Kind**: instance method of <code>[Args](#Args)</code>  
**Returns**: <code>Object</code> - 解析后的对象  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [argv] | <code>Array</code> | <code>process.argv.slice(2)</code> | 要解析的参数数组 |
| [execute] | <code>Boolean</code> | <code>false</code> | 是否自动执行参数中的命令 |

<a name="Args+execute"></a>

### args.execute() ⇒ <code>[Args](#Args)</code>
执行命令

**Kind**: instance method of <code>[Args](#Args)</code>  
**Access**: public  
<a name="Args+option"></a>

### args.option(key, config) ⇒ <code>[Args](#Args)</code>
添加全局选项

**Kind**: instance method of <code>[Args](#Args)</code>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | 选项名称 |
| config | <code>Object</code> | 选项配置 |

<a name="Args+command"></a>

### args.command(cmd, config) ⇒ <code>[Command](#Command)</code>
添加命令

**Kind**: instance method of <code>[Args](#Args)</code>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>String</code> | 命令名称 |
| config | <code>Object</code> | 命令配置 |

<a name="Args+help"></a>

### args.help([cmdName]) ⇒ <code>[Args](#Args)</code>
显示自动生成的帮助信息，如果指定了命令名称，则显示对应命令的帮助信息

**Kind**: instance method of <code>[Args](#Args)</code>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| [cmdName] | <code>String</code> | 命令名称 |

<a name="Args+version"></a>

### args.version(ver) ⇒ <code>[Args](#Args)</code>
设置App版本号，默认值为1.0.0。这个版本号会在全局-v/--version的时候显示

**Kind**: instance method of <code>[Args](#Args)</code>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| ver | <code>String</code> | 版本号 |

<a name="Args+bin"></a>

### args.bin(binName) ⇒ <code>[Args](#Args)</code>
设置App的命令名称

**Kind**: instance method of <code>[Args](#Args)</code>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| binName | <code>String</code> | 名称 |

<a name="Command"></a>

## Command
**Kind**: global class  

* [Command](#Command)
    * [new Command(cmd, config)](#new_Command_new)
    * [.option(key, opt)](#Command+option) ⇒ <code>[Command](#Command)</code>

<a name="new_Command_new"></a>

### new Command(cmd, config)
创建命令


| Param | Type | Description |
| --- | --- | --- |
| cmd | <code>String</code> | 命令名称 |
| config | <code>Object</code> | 配置参数 |
| config.usage | <code>String</code> | 命令使用帮助 |
| config.describe | <code>String</code> | 命令描述信息 |
| config.fn | <code>function</code> | 执行命令时调用的函数 |
| config.options | <code>Object</code> | 命令支持的选项（option） |

<a name="Command+option"></a>

### command.option(key, opt) ⇒ <code>[Command](#Command)</code>
为命令创建一个选项

**Kind**: instance method of <code>[Command](#Command)</code>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>String</code> | 选项名称 |
| opt | <code>Object</code> | 选项配置 |

