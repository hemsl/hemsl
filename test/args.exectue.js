require('colors');
var assert = require('assert');
var Args = require('../src');

function captureStream (stream) {
  var oldWrite = stream.write;
  var buf = '';
  stream.write = function (chunk, encoding, callback) {
    buf += chunk.toString(); // chunk is a String or Buffer
    oldWrite.apply(stream, arguments);
  };

  return {
    unhook: function unhook () {
      stream.write = oldWrite;
    },
    captured: function () {
      return buf;
    }
  };
}

describe('#execute:', function () {
  describe('#exec callback', function () {
    var args = new Args();
    var startRes = '';
    var startContext = '';
    var startArguments = [];

    args.bin('example-test').version('10.100.1000');

    args
      .command('start', {
        fn: function () {
          startRes = 'ok';
          startContext = this;
          startArguments = arguments;
        },
        describe: 'start server',
        usage: 'example start -p 9900 --https'
      }).option('port <port>', {
        alias: 'p',
        describe: 'server port'
      });

    var argv =
      'start ' +
      'subcmd ' +
      '--https ' +
      '--port 5525 ' +
      'subcmd1 '
      '--middle-man-port 10010';

    var _args = args.parse(argv.split(' '), true);

    it('正确执行 callback', function () {
      assert.equal('ok', startRes);
    });

    it('传入正确的参数', function () {
      console.log(startArguments);
      assert.ok(
        startArguments.length >= 2 &&
        startArguments[0] === 'subcmd' &&
        startArguments[1] === 'subcmd1'
      );
    });

    it('设置正确的上下文(this)', function () {
      assert.ok(startContext === _args);
    });
  });

  describe('#exec callback', function () {
    var args = new Args();
    var argv = 'start --port';
    var exectued = false;

    args.bin('example-test').version('10.100.1000');

    args
      .command('start', {
        fn: function () {
          exectued = true;
        }
      }).option('port <port>', {});
    var _args = args.parse(argv.split(' '), false);
    var _args1 = args.parse(argv.split(' '), true);
    
    it('参数不对，返回的结果包含错误信息', function () {
      assert.notEqual('', _args.__error__);
    });

    it('参数不对，不应该执行命令', function () {
      assert.notEqual('', _args1.__error__);
      assert.equal(false, exectued);
    });
  });
});
