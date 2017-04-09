/**
 * @file
 * @author zdying
 */

'use strict';

function Option(key, config) {
    config = config || {};
    
    var keyTokens = key.split(/\s+/);
    var optKey = keyTokens[0];
    var params = keyTokens.slice(1);
    var optAlias = config.alias;

    if(params.length > 0){
        config.params = params;
    }

    // this.name = key;
    //this.config = config;

    var alias = config.alias;

    if(optKey.length === 1 && alias && alias.length > 1){
        config.alias = optKey;        
        optKey = alias;
    }

    this.name = optKey;
    this.config = config;
}

Option.prototype = {
    constructor: Option,

    help: function() {

    }
};

module.exports = Option;