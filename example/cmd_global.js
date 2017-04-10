/**
 * @file
 * @author zdying
 */

'use strict';

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
.option('platform <os>', {
    default: 'all',
    describe: 'The target platform to publish(for cmd: `publish`)',
    alias: 'p'
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
    })
    .option('platform <os>', {
        default: 'all',
        describe: 'The target platform to publish(global)',
        alias: 'p',
        validate: /^(all|osx|win32|unix)$/i
    })
    .option('tag <tag>', {
        default: 'all',
        describe: 'The target platform to publish(global)',
        alias: 'p',
        validate: function(val, result){
            if(val === 'all' || val.indexOf('beta-') === 0 || val.indexOf('dev-') === 0){
                return true;
            }else{
                return false;
            }
        }
    });

[
    // 'start --help - --no-color --log-time --max=7',
    // '--grep something --log-time',
    // '--version',
    // 'start 8901 0.0.0.0 ./publish/',
    // 'publish -h',
    // 'start --help',
    '--help',
    'publish --help -abc',
    'publish 127.0.0.1 ./ --platform osx',
    'publish 127.0.0.1 ./ -p',
    '--platform',
    '--platform windows',
    '--platform osx',
    '--tag',
    '--tag all',
    '--tag beta-1',
    '--tag dev-1',
    '--tag latest'
].forEach(function(argStr){
    console.log();
    console.log('$'.bold.bold.magenta, 'example', argStr.bold.magenta, '\n');
    var res = args.parse(argStr.split(/\s+/));
    // console.log(res);
    console.log('\n');
});