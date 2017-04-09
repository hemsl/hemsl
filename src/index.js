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

function Args() {
    this._options = {};
    this._cmds = {};

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
        var curr, currValue, next, argName;
        var isFullArg, isShortArg;
        var result = {_: []};

        //TODO 优化算法，支持option参数检测
        for (var i = 0, len = args.length; i < len; i++) {
            curr = args[i];
            next = args[i + 1];

            argName = curr.replace(/^\-{1,2}/, '')

            isFullArg = utils.isFullArgName(curr);
            isShortArg = utils.isShortArgName(curr);

            if (isFullArg || isShortArg) {
                // 如果当前argv是参数
                if (!next || next.indexOf('-') === 0) {
                    // 如果下一个不是当前参数的值
                    currValue = true;
                } else {
                    currValue = next;
                    i++;
                }
            }

            if (isFullArg) {
                result[utils.toCamelCase(argName)] = currValue;
            } else if (isShortArg) {
                argName.split('').forEach(function (_argName, index) {
                    result[_argName] = index === argName.length - 1 ? currValue : true;
                });
            } else {
                result._.push(curr);
            }
        }

        var currentOption, currentAlias;
        for (var option in this._options) {
            currentOption = this._options[option].config;
            currentAlias = currentOption.alias;

            option = utils.toCamelCase(option);
            currentAlias = utils.toCamelCase(currentAlias);

            if (currentAlias) {
                if (option in result) {
                    result[currentAlias] = result[option];
                } else if (currentAlias in result) {
                    result[option] = result[currentAlias];
                }
            }
        }

        var cmdName = result._[0];

        if (cmdName) {
            if (this._cmds[cmdName]) {debugger
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

    option: function (key, opt) {
        var option = new Option(key, opt);
        this._options[option.name] = option;
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
        var usage = (this.binName || '').bold.green + ' <command>'.blue + ' <option>\n'.blue;

        if(cmdName){
            return this._helpCmd(cmdName);
        }

        console.log('  Usage:\n'.bold);
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

            cmdLines.push('    ' + cmd.bold.green + ' $$' + cmdLen + '$$ ' + desc);
        }

        console.log('  Commands:\n'.bold);
        console.log(cmdLines.join('\n').replace(/\$\$(\d+)\$\$/g, function(match, length){
            return new Array(maxLength - length + 1).join(' ');
        }));

        console.log('\n  Options:\n'.bold);
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

        debugger

        console.log('  USAGE:\n'.bold);
        console.log('    ' + usage);

        console.log();
        console.log('  DESCRIBE:\n'.bold);
        console.log('    ' + desc);

        console.log();
        console.log('  OPTIONS:\n'.bold);

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
            var optStr = (alias ? '-' + alias + ', ' : '') + '--' + key;
            var optStrLen = optStr.length;

            if(optStrLen > maxLength){
                maxLength = optStrLen;
            }

            return '    ' + optStr.bold.green + ' $$' + optStrLen + '$$ ' + describe;
        });

        // cmdOptLines.unshift('  -h,--help'.bold.green + ' $$6$$ show help info');

        return cmdOptLines.join('\n').replace(/\$\$(\d+)\$\$/g, function(match, length){
            return new Array(maxLength - length + 1).join(' ');
        });
    }
};

module.exports = Args;