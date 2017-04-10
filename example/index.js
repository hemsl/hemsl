/**
 * @file
 * @author zdying
 */

'use strict';

console.log(require('minimist')('one two three -- four five --six'.split(' '), { '--': true }))
console.log(require('minimist')('one two three -- four five --six --seven=7'.split(' ')));

// test

var Args = require('../src');

var args = new Args();

args
.bin('example')
.version('1.12.150-rc');

args.command('publish <ip> <dir>', {
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
})

args.command('start <port> [ip]', {
    describe: '启动本地测试服务',
    usage: 'example start <port> [ip] [options]',
    fn: function(port, ip){
        console.log('Server started at', ('http://' + ip + ':' + port).underline.magenta.bold);

        // var http = require('http');

        // var server = http.createServer(function(req, res){
        //     console.log(req.method.bold.gray, req.url);
        //     res.end(req.url);
        // });

        // server.listen(port, ip);
    },
    options: {
        'https': {
            default: true,
            describe: 'start https server',
            alias: 's'
        },
        'p': {
            default: '',
            describe: 'output path',
            alias: 'port',
            usage: ''
        },
        'hot-reload': {
            alias: 'H',
            describe: 'enable hot reload'
        }
    }
});

args.command('sync <ip> <dir>', {
    describe: '同步代码到服务器',
    usage: 'xxx sync 192.168.1.100 ./',
    // group: '',
    fn: function(ip, dir){
        console.log('同步： ' + dir + ' ==> ' + ip);
    },
    options: {
        'https': {
            default: true,
            describe: 'start https server',
            alias: 's'
        },
        'P': {
            default: '',
            describe: 'output path',
            alias: 'output-path',
            usage: 'output-path <path>'
        }
    }
});

args
    .option('debug', {
        default: true,
        describe: '显示调试信息（全局配置）',
        alias: 'd'
    })
    .option('detail', {
        default: true,
        describe: '显示详细的调试信息（全局配置）',
        alias: 'D'
    })
    .option('log-time', {
        default: true,
        describe: '显示详日志打印时间（全局配置）',
        alias: 'T'
    })
    .option('grep <expression>', {
        default: true,
        describe: '日志内容过滤（全局配置）',
        alias: 'g'
    });


[
    // 'init --help',
    // 'init hello -xo --debug -OP',
    // 'init hello react -xo --debug -OP',
    // 'init -xo --debug -OP',
    // 'pack --debug',
    // 'pack dev --debug',
    // 'pack dev true --debug',
    '--grep something --log-time',
    '--version',
    'start 8901 0.0.0.0 ./publish/',
    'publish -h',
    'start --help',
    '--help',
].forEach(function(argStr){
    console.log();
    console.log('$'.bold.bold.magenta, 'example', argStr, '\n');
    var res = args.parse(argStr.split(/\s+/));
    console.log(res);
    console.log('\n');
});