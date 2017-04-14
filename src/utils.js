/**
 * @file
 * @author zdying
 */

'use strict';

module.exports = {
  getOptionInfo(optionStr) {
    const reg = /^(-{1,2})?(.*?)(?:=(.*))?$/;
    const res = (optionStr || '').match(reg);
    let name;
    let value;
    let dash;
    let dashCount = 0;
    let isShortOption = false;
    let isLongOption = false;
    let isOption = false;

    if (res) {
      dash = res[1] || '';
      name = res[2] || '';
      value = res[3] || '';

      dashCount = dash.length;

      if (dashCount === 1) {
        isShortOption = true;
        isOption = true;
      } else if (dashCount === 2) {
        isLongOption = true;
        isOption = true;
      }

      return {
        dashCount,
        option: name,
        argument: value,
        isShortOption,
        isLongOption,
        isOption
      };
    }
  },

  toCamelCase(str) {
    return (str || '').replace(/-(\w)/g, (match, letter) => {
      return letter.toUpperCase();
    });
  }
};
