/**
 * @file
 * @author zdying
 */

'use strict';

const utils = require('./utils');

function Option(key, config) {
  config = config || {};

  const keyTokens = key.split(/\s+/);
  let optKey = keyTokens[0];
  const params = keyTokens.slice(1);
  const alias = config.alias;
  const validate = config.validate;

  if (params.length > 0) {
    config.params = params;
  }

  // This.name = key;
  // this.config = config;

  if (optKey.length === 1 && alias && alias.length > 1) {
    config.alias = optKey;
    optKey = alias;
  }

  if (validate && typeof validate !== 'function') {
    if (validate instanceof RegExp) {
      config.validate = function (val) {
        return validate.test(val);
      };
    }
  }

  this.name = utils.toCamelCase(optKey);
  this.originName = optKey;
  this.config = config;
}

Option.prototype = {
  constructor: Option,

  help() {

  }
};

module.exports = Option;
