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

describe('#parse param validate (global option)', function () {
  var args = new Args();

  var hook;
  beforeEach(function () {
    hook = captureStream(process.stdout);
  });
  afterEach(function () {
    hook.unhook();
  });

  args.option('port <port>', {
    describe: 'port',
    validate: /\d{4,}/
  }).option('platform', {
    describe: 'port',
    validate: /^(all|win32|osx|unix)$/
  }).option('age', {
    describe: 'age',
    validate: function (age, result) {
      console.log('age ==>', age, 'sex ===>', result.sex);
      if(result.sex === 'F'){
        return Number(age) <= 16;
      }

      return true;
    }
  });

  it('#1. show error info when param is invalid (use `RegExp`)', function () {
    args.parse(['start', '--port', '81'], false) 

    assert.ok(hook.captured().indexOf('值不正确') !== -1);
  });

  it('#2. show error info when param is invalid (use `RegExp`)', function () {
    args.parse(['start', '--platform', 'windows'], false) 

    assert.ok(hook.captured().indexOf('值不正确') !== -1);
  });

  it('#3. show error info when param is invalid (use `Function`)', function () {
    args.parse(['start', '--age', '18', '--sex', 'F'], false) 

    assert.ok(hook.captured().indexOf('值不正确') !== -1);
  });

  it('show error info when param length is not right', function () {
    args.parse(['start', '--port', '--https'], false) 

    assert.ok(hook.captured().indexOf('参数缺失') !== -1);
  });
});
