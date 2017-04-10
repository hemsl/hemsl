/**
 * @file
 * @author zdying
 */

'use strict';

module.exports = {
    getOptionInfo: function(optionStr){
        //TODO 如果多于2个`-`怎么办？
        var reg = /^(\-{1,2})?(.*?)(?:\=(.*))?$/;
        var res = (optionStr || '').match(reg);
        var name, value, dash, dashCount = 0;
        var isShortOption = false, isLongOption = false, isOption = false;

        if(res){
            dash = res[1] || '';
            name = res[2] || '';
            value = res[3] || '';

            dashCount = dash.length;

            if(dashCount === 1){
                isShortOption = isOption = true;
            }else if(dashCount === 2){
                isLongOption = isOption = true;
            }

            return {
                dashCount: dashCount,
                option: name,
                argument: value,
                isShortOption: isShortOption,
                isLongOption: isLongOption,
                isOption: isOption
            }
        }
    },
    isLongOption: function(str) {
        return str.indexOf('--') === 0;
    },

    isShortOption: function(str) {
        return str.indexOf('-') === 0;
    },

    toCamelCase: function(str) {
        return (str || '').replace(/-(\w)/g, function (match, letter) {
            return letter.toUpperCase();
        })
    }
};