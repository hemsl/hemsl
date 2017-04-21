var assert = require('assert');
var utils = require('../src/utils');

describe('#toCamelCase()', function () {
  it('should not return empty string when `str` is false value', function () {
    assert.equal(utils.toCamelCase(), '');
    assert.equal(utils.toCamelCase(''), '');
    assert.equal(utils.toCamelCase(0), '');    
  });

  it('should return original string when has no `-`', function () {
    assert.equal(utils.toCamelCase('abc'), 'abc');
    assert.equal(utils.toCamelCase('abcDe'), 'abcDe');    
  });

  it('should return camelCase string when has `-`', function () {
    assert.equal(utils.toCamelCase('abc-def'), 'abcDef');
    assert.equal(utils.toCamelCase('abc-def-hij'), 'abcDefHij');    
  });
});

describe('#getOptionInfo()', function () {
  var expectInfo = { 
    dashCount: 2,
    option: 'file',
    argument: '',
    isShortOption: false,
    isLongOption: true,
    isOption: true 
  };

  it('should parse long option correctly', function () {
    var optInfo = utils.getOptionInfo('--file');
    assert.deepEqual(optInfo, expectInfo);
  });

  it('should parse short option correctly', function () {
    var optInfo = utils.getOptionInfo('-file');
    var expectInfoShort = { 
      dashCount: 1,
      option: 'file',
      argument: '',
      isShortOption: true,
      isLongOption: false,
      isOption: true 
    };

    assert.deepEqual(optInfo, expectInfoShort);
  });
  
  it('should ignore content after space', function () {
    var optInfo = utils.getOptionInfo('--file file.json');
    assert.deepEqual(optInfo, expectInfo);
  });
  
  it('should parse option with argument correctly', function () {
    var optInfo = utils.getOptionInfo('--file=file.json');
    var expectInfoArgument = { 
      dashCount: 2,
      option: 'file',
      argument: 'file.json',
      isShortOption: false,
      isLongOption: true,
      isOption: true 
    };

    assert.deepEqual(optInfo, expectInfoArgument);
  });

  it('should parse none-option string correctly', function () {
    var optInfo = utils.getOptionInfo('file');
    var expectInfoArgument = { 
      dashCount: 0,
      option: '',
      argument: '',
      isShortOption: false,
      isLongOption: false,
      isOption: false 
    };

    assert.deepEqual(optInfo, expectInfoArgument);
  });
});
