/**
 * @file 解析参数，执行响应的命令
 * @author zdying
 */

'use strict';
var colors = require('colors');
var utils = require('./utils');

var Command = require('./Command');

function Args() {}
Args.prototype = {
    constructor: Args,
    _options: {
        'version': {
            default: true,
            describe: '显示版本信息',
            alias: 'v'
            // usage: 'hiproxy --version',
            // arg: ''
        },
        'help': {
            default: true,
            describe: '显示帮助信息',
            alias: 'h'
            // usage: 'hiproxy [cmd] --help',
            // arg: ''
        }
    },
    _cmds : {},
    parse: function (_argv) {
        var args = Array.isArray(_argv) ? _argv : process.argv.slice(2);
        var curr, currValue, next, argName;
        var isFullArg, isShortArg;
        var result = {_: []};

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
            currentOption = this._options[option];
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
            if (this._cmds[cmdName]) {
                if (result.help) {
                    // var usage = this._cmds[cmdName].usage || 'no help info found';
                    // console.log('Usage: \n\n' + usage + '\n');
                    this.help(cmdName, this._cmds[cmdName]);
                } else if (typeof this._cmds[cmdName].fn === 'function') {
                    this._cmds[cmdName].fn.apply(result, result._.slice(1))
                }
            } else {
                console.log('\n⚠️ 命令`' + cmdName + '`不存在\n');
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
        this._options[key] = opt || {};
        return this;
    },

    command: function (cmd, config) {
        var command = new Command(cmd, config);
        var cmdName = command.name;

        this._cmds[cmdName] = command;

        return this;
    },

    help: function (cmdName, cmd) {
        var cmds = this._cmds;
        var options = this._options;
        var usage = '  xxx'.bold.green + ' <command>'.blue + ' <option>\n'.blue;
        // if(cmdName){
        //     cmds = {};
        //     cmds[cmdName] = this._cmds[cmdName];
        //     usage = cmd.usage || 'no help info found';
        // }

        debugger

        if(cmdName){
            return this._helpCmd(cmdName);
        }

        console.log('Usage:\n'.bold);
        console.log('  ' + usage);
        //commands
        var cmdLines = [];
        for(var cmd in cmds){
            var obj = this._cmds[cmd];
            var desc = obj.describe;
            var usage = obj.usage;
            var opts = obj.options || [];
            var maxLength = 0;

            if(desc){
                cmdLines.push('  ' + cmd.bold.green + '\t' + desc);
            }

            // var cmdOptLines = opts.map(function(opt){
            //     var conf = opt.config;
            //     var describe = conf.describe;
            //     var alias = conf.alias;
            //     var optStr = (alias ? '-' + alias + ', ' : '') + '--' + opt;
            //     var optStrLen = optStr.length;
            //
            //     if(optStrLen > maxLength){
            //         maxLength = optStrLen;
            //     }
            //
            //     return '      ' + optStr.bold.green + ' $$' + optStrLen + '$$ ' + describe;
            // });

            // console.log('Command:\n'.bold);
            // console.log(cmdLines.join('\n'));

            // console.log('\n');
            // console.log('  Options:\n'.bold);
            // console.log(cmdOptLines.join('\n').replace(/\$\$(\d+)\$\$/g, function(match, length){
            //     return new Array(maxLength - length + 1).join(' ');
            // }));
        }

        console.log('Commands:\n'.bold);
        console.log(cmdLines.join('\n'));
    },

    version: function (ver) {
        this._version = ver;
    },

    _helpCmd: function(cmdName){
        var cmd = this._cmds[cmdName];
        var usage = cmd.usage || 'no help info found';
        var desc = cmd.describe;

        console.log('USAGE:\n'.bold);
        console.log('  ' + usage);

        console.log();
        console.log('DESCRIBE:\n'.bold);
        console.log('  ' + desc);

        console.log();
        console.log('OPTIONS:\n'.bold);
        console.log('  -h, --help\t' + 'show help info');
        console.log();
    }
};

module.exports = Args;

// test

var args = new module.exports();

args.version('1.12.150-rc');

// args
//     .command('help', 'show help info', function () {
//         console.log('======= help =======');
//     }, 'xxx help')
//     .command('version', 'show version info', function () {
//         console.log('v1.1.2');
//     }, 'xxx --version')
//     .command('start', 'start hiproxy server', function () {
//         console.log('start server:', this);
//     }, 'xxx start --debug -D -p 8900')
//     .command('init <name> <type>', 'init a new project', function (name) {
//         console.log('init new project, name:', name);
//     })
//     .command('pack <env> [min]', 'init a new project', function (env, min) {
//         console.log('pack project, env, min ==> ', env, min);
//     });

args.command('publish <ip> <dir>', {
    describe: '同步代码到服务器',
    usage: 'xxx sync 192.168.1.100 ./',
    // group: '',
    fn: function(ip, dir){
        console.log('同步： ' + dir + ' ==> ' + ip);
    },
    options: {
        'https': {
            default: true,
            describe: 'start https server',
            alias: 's'
        },
        'P': {
            default: '',
            describe: 'output path',
            alias: 'output-path',
            usage: 'output-path <path>'
        }
    }
});

args.command('sync <ip> <dir>', {
    describe: '同步代码到服务器',
    usage: 'xxx sync 192.168.1.100 ./',
    // group: '',
    fn: function(ip, dir){
        console.log('同步： ' + dir + ' ==> ' + ip);
    },
    options: {
        'https': {
            default: true,
            describe: 'start https server',
            alias: 's'
        },
        'P': {
            default: '',
            describe: 'output path',
            alias: 'output-path',
            usage: 'output-path <path>'
        }
    }
});

args
    .option('https', {
        default: true,
        describe: 'start https server',
        alias: 's'
    })
    .option('open', {
        default: 'chrome',
        describe: 'open browser',
        alias: 'o',
        usage: 'open [browser]'
    })
    .option('sub-domains', {
        default: '',
        describe: 'sub domains',
        alias: 'd',
        usage: 'sub-domains [domains...]'
    })
    .option('P', {
        default: '',
        describe: 'output path',
        alias: 'output-path',
        usage: 'output-path <path>'
    });


[
    // 'init --help',
    // 'init hello -xo --debug -OP',
    // 'init hello react -xo --debug -OP',
    // 'init -xo --debug -OP',
    // 'pack --debug',
    // 'pack dev --debug',
    // 'pack dev true --debug',
    // '--version',
    'start --help',
    '--help'
].forEach(function(argStr){
    // console.log('parse:: [[', argStr, ']]\n');
    var res = args.parse(argStr.split(/\s+/));
    // console.log(res);
    console.log('\n\n');
});