/**
 * @file
 * @author zdying
 */

'use strict';

module.exports = {
    isFullArgName: function(str) {
        return str.indexOf('--') === 0;
    },

    isShortArgName: function(str) {
        return str.indexOf('-') === 0;
    },

    toCamelCase: function(str) {
        if (!str) {
            return str;
        }

        return str.replace(/-(\w)/g, function (match, letter) {
            return letter.toUpperCase();
        })
    }
};