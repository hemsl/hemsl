/**
 * @file
 * @author zdying
 */

'use strict';
var Option = require('./Option');

function Command(cmd, config) {
    var cmdArr = cmd.split(/\s+/);
    var cmdName = cmdArr[0];

    var func = config.fn || noop;
    var paramsLen = 0;
    var paramItems = [];

    if (cmdArr.length > 1) {
        paramItems = cmdArr.slice(1);

        for (var i = 0, len = paramItems.length; i < len; i++) {
            var paramItem = paramItems[i];

            if (/^<[^>]+>$/.test(paramItem)) {
                paramsLen++
            } else {
                break;
            }
        }
        func = function () {
            if (arguments.length < paramsLen) {
                console.log("参数个数不对, 期待`" + paramsLen + "`个，实际接收到`" + arguments.length + "`个")
            } else {
                fn.apply(this, arguments)
            }
        }
    }

    this.name = cmdName;
    this.describe = config.describe || '';
    this.usage = config.usage || '';
    this.fn = func;
    this.options = Object.keys(config.options || {}).map(function(opt){
        return new Option(opt, config.options[opt])
    });

    return this;
}

Command.prototype = {
    constructor: Command,

    help: function() {

    },

    execute: function(){

    }
};

function noop(){}

module.exports = Command;