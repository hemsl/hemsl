/**
 * @file
 * @author zdying
 */

'use strict';

// Test

const Args = require('../src');

const args = new Args();

args
.bin('example')
.version('1.12.150-rc');

// Args.command('publish <ip> <dir>', {
//     describe: '发布模块到npm/github/yarn',
//     usage: 'xxx sync 192.168.1.100 ./',
//     // group: '',
//     fn: function(ip, dir){
//         console.log('同步： ' + dir + ' ==> ' + ip);
//     },
//     options: {
//         'user': {
//             default: '',
//             describe: 'Your user name (nodejs.org)',
//             alias: 'u'
//         },
//         'tag': {
//             default: '',
//             describe: 'Publish branch tag',
//             alias: 't'
//         }
//     }
// })
// .option('private', {
//     default: '',
//     describe: 'Publish for private use',
//     alias: 'P'
// })
// .option('platform', {
//     default: 'all',
//     describe: 'The target platform to publish',
//     alias: 'p'
// });

args.command('start <port> [ip]', {
  describe: '启动本地测试服务',
  usage: 'example start <port> [ip] [options]',
  fn(port, ip) {
    console.log('Server started at', ('http://' + ip + ':' + port).underline.magenta.bold);

        // Var http = require('http');

        // var server = http.createServer(function(req, res){
        //     console.log(req.method.bold.gray, req.url);
        //     res.end(req.url);
        // });

        // server.listen(port, ip);
  },
  options: {
    https: {
      default: true,
      describe: 'start https server',
      alias: 's'
    },
    p: {
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
})
.option('date-format', {
  default: 'yyyy-MM-dd',
  alias: 'R',
  describe: 'date format string'
})
.option('time-format', {
  alias: 'm',
  default: 'HH:mm:ss',
  describe: 'time format string'
});

args.command('sync <ip> <dir>', {
  describe: '同步代码到服务器',
  usage: 'xxx sync 192.168.1.100 ./',
    // Group: '',
  fn(ip, dir) {
    console.log('同步： ' + dir + ' ==> ' + ip);
  },
  options: {
    https: {
      default: true,
      describe: 'start https server',
      alias: 's'
    },
    P: {
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
  'start --help - --no-color --log-time --max=7',
  '--grep something --log-time',
  '--version',
  'start 8901 0.0.0.0 ./publish/',
  'publish -h',
  'start --help',
  '-m h:m:s --hot-reload --port 9999 start 9999 127.0.0.1 --grep info --log-time --time-format h:m:s --date-format',
  '--help'
].forEach(argStr => {
  console.log();
  console.log('$'.bold.bold.magenta, 'example', argStr, '\n');
  const res = args.parse(argStr.split(/\s+/));
  console.log(res);
  console.log('\n');
});
