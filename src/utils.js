/**
 * @file
 * @author zdying
 */

'use strict';

module.exports = {
  getOptionInfo: function (optionStr) {
    // TODO 如果多于2个`-`怎么办？
    var reg = /^(-{1,2})?(.*?)(?:=(.*))?$/;
    var res = (optionStr || '').split(/\s+/)[0].match(reg);
    var dashCount = 0;
    var isShortOption = false;
    var isLongOption = false;
    var isOption = false;

    var dash = res[1] || '';
    var name = res[2] || '';
    var value = res[3] || '';

    dashCount = dash.length;

    if (dashCount === 1) {
      isShortOption = isOption = true;
    } else if (dashCount === 2) {
      isLongOption = isOption = true;
    }

    return {
      dashCount: dashCount,
      option: isOption ? name : '',
      argument: value,
      isShortOption: isShortOption,
      isLongOption: isLongOption,
      isOption: isOption
    };
  },

  toCamelCase: function (str) {
    return (str || '').replace(/-(\w)/g, function (match, letter) {
      return letter.toUpperCase();
    });
  }
};
