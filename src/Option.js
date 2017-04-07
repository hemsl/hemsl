/**
 * @file
 * @author zdying
 */

'use strict';

function Option(key, config) {
    this.key = key;
    this.config = config;
}

Option.prototype = {
    constructor: Option,

    help: function() {

    }
};

module.exports = Option;