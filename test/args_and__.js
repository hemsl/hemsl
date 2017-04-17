require('colors');
var assert = require('assert');
var Args = require('../src');

describe('#not parse options after `--` and `-`', function () {
  var args = new Args();

  it('should not parse options after `--`', function () {
    var res = args.parse(['start', '--port', '--', '--age', '18'], false) 

    assert.deepEqual(res._, ['start', '--age', '18']);
  });

  it('should not parse options after `-`', function () {
    var res = args.parse(['start', '--port', '-', '--age', '18'], false) 

    assert.deepEqual(res._, ['start', '--age', '18']);
  });

  var args1 = new Args({__: true});
  it('should not parse options after `-` with `{__: true}`', function () {
    var res = args1.parse(['start', '--port', '-', '--age', '18'], false) 

    assert.deepEqual(res.__, ['--age', '18']);
    assert.deepEqual(res._, ['start']);
  });
});
