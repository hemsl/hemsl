/**
 * @file
 * @author zdying
 */

'use strict';
var Option = require('./Option');

function Command(cmd, config) {
    var cmdArr = cmd.split(/\s+/);
    var cmdName = cmdArr[0];

    if(!config || typeof config.fn !== 'function'){
        throw 'A command should has a function property called `fn`';
    }

    var func = config.fn;
    var paramsLen = 0;
    var paramItems = [];
    var options = {};

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
                config.fn.apply(this, arguments)
            }
        }
    }

    this.name = cmdName;
    this.describe = config.describe || '';
    this.usage = config.usage || '';
    this.fn = func;
    this.options = options;

    var confOpt = config.options || {};

    options.help = new Option('help', {
        alias: 'h',
        describe: 'show help info'
    });
    
    Object.keys(confOpt).sort().forEach(function(opt){
         var option = new Option(opt, config.options[opt]);
         options[option.name] = option;
    });

    return this;
}

Command.prototype = {
    constructor: Command,

    option: function(key, opt){
        this.options[key] = new Option(key, opt);
        return this;
    },

    help: function() {

    },

    execute: function(){

    }
};

function noop(){}

module.exports = Command;