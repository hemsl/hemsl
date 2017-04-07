/**
 * @file
 * @author zdying
 */

'use strict';

function Option(key, config) {
    this.name = key;
    this.config = config;

    var alias = config.alias;

    if(key.length === 1 && alias && alias.length > 1){
        this.name = alias;
        this.config.alias = key;
    }
}

Option.prototype = {
    constructor: Option,

    help: function() {

    }
};

module.exports = Option;