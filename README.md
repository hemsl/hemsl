# hemsl
Node.js command line argv parser

[![Build Status](https://travis-ci.org/hemsl/hemsl.svg?branch=master)](https://travis-ci.org/hemsl/hemsl)
[![Coverage Status](https://coveralls.io/repos/github/hemsl/hemsl/badge.svg?branch=master)](https://coveralls.io/github/hemsl/hemsl?branch=master)
[![npm](https://img.shields.io/npm/v/hemsl.svg)](https://www.npmjs.com/package/hemsl)
[![npm](https://img.shields.io/npm/l/hemsl.svg)](https://raw.githubusercontent.com/hemsl/hemsl/master/LICENSE)

# Example

```javascript
var Args = require('hemsl');
var args = new Args();

args
.bin('example')
.version('1.12.150-rc');

args
.command('publish <ip> <dir>', {
    describe: '发布模块到npm/github/yarn',
    usage: 'xxx sync 192.168.1.100 ./',
    // group: '',
    fn: function(ip, dir){
        console.log('同步： ' + dir + ' ==> ' + ip);
    },
    options: {
        'user': {
            default: '',
            describe: 'Your user name (nodejs.org)',
            alias: 'u'
        },
        'tag': {
            default: '',
            describe: 'Publish branch tag',
            alias: 't'
        }
    }
})
.option('private', {
    default: '',
    describe: 'Publish for private use',
    alias: 'P'
})
.option('platform', {
    default: 'all',
    describe: 'The target platform to publish',
    alias: 'p'
});
```

## TODO

- [x] Command对应Option处理（可能和全局的冲突／alias）
- [x] 支持`--option=argument`格式
- [x] 支持`--`和`-`后的内容不再解析
- [x] 支持Argument校验
- [ ] 支持Option数据类型
- [x] 支持Argument正则表达式/function校验
- [ ] 修改option,command定义方式，直接使用Object
- [ ] 脚手架生成模板
- [ ] 编写文档
- [ ] 完善测试
