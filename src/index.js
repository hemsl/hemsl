/**
 * @file 解析参数，执行响应的命令
 * @author zdying
 */

'use strict';
var colors = require('colors');
var utils = require('./utils');

var Command = require('./Command');
var Option = require('./Option');

// http://stackoverflow.com/questions/9725675/is-there-a-standard-format-for-command-line-shell-help-text
// http://docopt.org/

function Args(config) {
    this._options = {};
    this._cmds = {};
    this._aliasCache = {};
    this.config = config || {};

    this.option('version', {
        default: true,
        describe: '显示版本信息',
        alias: 'v'
    });

    this.option('help', {
        default: true,
        describe: '显示帮助信息',
        alias: 'h'
    });
}

Args.prototype = {
    constructor: Args,
    parse: function (_argv) {
        var args = Array.isArray(_argv) ? _argv : process.argv.slice(2);
        var curr, currInfo, currValue, next, nextInfo, optName;
        var isFullArg, isShortArg;
        var result = {_: []};

        //TODO 优化算法，支持option参数检测
        for (var i = 0, len = args.length; i < len; i++) {
            curr = args[i];
            next = args[i + 1];
            currInfo = utils.getOptionInfo(curr);
            nextInfo = utils.getOptionInfo(next);

            optName = currInfo.option;

            if(currInfo.dashCount === curr.length){
                // `--`或者`-`
                if(currInfo.dashCount === 1){
                    result._ = result._.concat(args.slice(index + 1));
                }else{
                    result.__ = args.slice(index + 1);
                }
                break;
            }

            if(currInfo.isOption){
                if(currInfo.argument){
                    currValue = currInfo.argument;
                }else{
                    // 如果当前argv是option
                    if (!next || nextInfo.isOption){
                        // 如果下一个argv是option(不是当前option的argument)
                        currValue = true;
                    }else{
                        // 下一个argv是当前option的argument
                        currValue = next;
                        i++;
                    }
                }

                if(currInfo.isLongOption){
                    // eg: --sub-domains domain.com ==> {subDomans: 'domain.com'}
                    // result[utils.toCamelCase(optName)] = currValue;
                    this._setValue(result, optName, currValue);
                }else if(currInfo.isShortOption){
                    // eg: -Dxo chrome ==> {D: true, x: true, o: 'chrome'}
                    optName.split('').forEach(function (_optName, index) {
                        // result[_optName] = index === optName.length - 1 ? currValue : true;
                        this._setValue(result, _optName, index === optName.length - 1 ? currValue : true);
                    }.bind(this));
                }
            }else{
                result._.push(curr);
            }
        }

        var cmdName = result._[0];

        if (cmdName) {
            if (this._cmds[cmdName]) {
                if (result.help) {
                    this.help(cmdName, this._cmds[cmdName]);
                } else if (typeof this._cmds[cmdName].fn === 'function') {
                    this._cmds[cmdName].fn.apply(result, result._.slice(1))
                }
            } else {
                console.log('\ncommand `' + cmdName + '` not exists\n');
            }
        } else {
            if (result.version) {
                console.log(this._version);
            } else if (result.help) {
                this.help();
            }
        }

        return result
    },
                                                                                                                                                                                                                                                                                                                                                              
    _setValue: function(result, option, value){
        result[utils.toCamelCase(option)] = value;

        var alias = this._aliasCache[option];
        if(alias){
            result[utils.toCamelCase(alias)] = value;
        }
    },

    option: function (key, opt) {
        var option = new Option(key, opt);
        var alias = option.config.alias;
        var name = option.name;
        
        this._options[name] = option;

        if(alias){
            this._aliasCache[name] = alias;
            this._aliasCache[alias] = name;
        }

        return this;
    },

    command: function (cmd, config) {
        var command = new Command(cmd, config);
        var cmdName = command.name;

        this._cmds[cmdName] = command;

        return command;
    },

    help: function (cmdName, cmd) {
        var cmds = this._cmds;
        var options = this._options;
        var usage = (this.binName || '').bold.green + ' [command]'.blue + ' [option]\n'.blue;

        if(cmdName){
            return this._helpCmd(cmdName);
        }

        console.log('  ' + 'Usage:\n'.bold.underline);
        console.log('    ' + usage);
        //commands
        var cmdLines = [];
        var maxLength = 0;
        for(var cmd in cmds){
            var obj = this._cmds[cmd];
            var desc = obj.describe || '';
            var usage = obj.usage;
            var cmdLen = cmd.length;

            if(cmdLen > maxLength){
                maxLength = cmdLen;
            }

            cmdLines.push('    ' + cmd.bold + ' $$' + cmdLen + '$$ ' + desc.gray);
        }

        console.log('  ' + 'Commands:\n'.bold.underline);
        console.log(cmdLines.join('\n').replace(/\$\$(\d+)\$\$/g, function(match, length){
            return new Array(maxLength - length + 1).join(' ');
        }));

        console.log('\n  ' + 'Options:\n'.bold.underline);
        console.log(this._getOptionString(this._options));
    },

    version: function (ver) {
        this._version = ver;
        return this;
    },

    bin: function(binName){
        this.binName = binName;
        return this
    },

    _helpCmd: function(cmdName){
        var cmd = this._cmds[cmdName];
        var usage = cmd.usage || 'no help info found';
        var desc = cmd.describe;

        console.log('  ' + 'USAGE:\n'.bold.underline);
        console.log('    ' + usage.gray);

        console.log();
        console.log('  ' + 'DESCRIBE:\n'.bold.underline);
        console.log('    ' + desc.gray);

        console.log();
        console.log('  ' + 'OPTIONS:\n'.bold.underline);

        console.log(this._getOptionString(cmd.options || {}));
    },

    _getOptionString: function(option){
        var opts = option;
        var maxLength = 0;
        var cmdOptLines = Object.keys(opts).map(function(key){
            var opt = opts[key];
            var conf = opt.config;
            var describe = conf.describe || '';
            var alias = conf.alias;
            var params = conf.params || [];
            var optStr = (alias ? '-' + alias + ', ' : '') + '--' + key;
            var optStrLen = optStr.length + (params.length ? params.join(' ').length : 0);

            if(optStrLen > maxLength){
                maxLength = optStrLen;
            }

            return '    ' + optStr.bold + ' ' + params.join(' ').gray + ' $$' + optStrLen + '$$ ' + describe.gray;
        });

        // cmdOptLines.unshift('  -h,--help'.bold.green + ' $$6$$ show help info');

        return cmdOptLines.join('\n').replace(/\$\$(\d+)\$\$/g, function(match, length){
            return new Array(maxLength - length + 1).join(' ');
        });
    }
};

module.exports = Args;