/**
 * @file
 * @author zdying
 */

'use strict';

var utils = require('./utils');

function Option (key, config) {
  config = config || {};

  var keyTokens = key.split(/\s+/);
  var optKey = keyTokens[0];
  var params = keyTokens.slice(1);
  var alias = config.alias;
  var validate = config.validate;

  if (params.length > 0) {
    config.params = params;
  }

  // this.name = key;
  // this.config = config;

  if (optKey.length === 1 && alias && alias.length > 1) {
    config.alias = optKey;
    optKey = alias;
  }

  if (validate && typeof validate !== 'function') {
    if (validate instanceof RegExp) {
      config.validate = function (val, result) {
        return validate.test(val);
      };
    }else{
      // 暂时不支持其它的校验类型
      config.validate = null;
    }
  }

  this.name = utils.toCamelCase(optKey);
  this.originName = optKey;
  this.config = config;
}

// Option.prototype = {
//   constructor: Option,

//   help: function () {

//   }
// };

module.exports = Option;
