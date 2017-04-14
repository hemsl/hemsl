/**
 * @file 解析参数，执行响应的命令
 * @author zdying
 */

'use strict';

require('colors');
const utils = require('./utils');

const Command = require('./command');
const Option = require('./option');

const DEFAULT_VALUE = '__default_value__';

function Args(config) {
  this._options = {};
  this._cmds = {};
  this._aliasCache = {};
  this.result = {};
  this.config = config || {};
  this._version = '1.0.0';

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

  parse(_argv, execute) {
    const args = Array.isArray(_argv) ? _argv : process.argv.slice(2);
    const result = this._parse(args);
    const error = this._checkOption(result);

    this.result = result;

    if (!error && (_argv === true || execute === true)) {
      this._execute(result);
    } else {
      console.log(error);
    }

    return result;
  },

  execute() {
    this._execute(this.result);
    return this;
  },

  _parse(args) {
    let curr, currInfo, currValue, next, nextInfo, optName;
    const result = {_: []};

    for (let i = 0, len = args.length; i < len; i++) {
      curr = args[i];
      next = args[i + 1];
      currInfo = utils.getOptionInfo(curr);
      nextInfo = utils.getOptionInfo(next);

      optName = currInfo.option;

      if (currInfo.dashCount === curr.length) {
        // `--`或者`-`
        if (this.config.__ !== true) {
          result._ = result._.concat(args.slice(i + 1));
        } else {
          result.__ = args.slice(i + 1);
        }
        break;
      }

      if (currInfo.isOption) {
        if (currInfo.argument) {
          currValue = currInfo.argument;
        } else {
          // 如果当前argv是option
          if (!next || nextInfo.isOption) {
            // 如果下一个argv是option(不是当前option的argument)
            currValue = DEFAULT_VALUE;
          } else {
            // 下一个argv是当前option的argument
            currValue = next;
            i++;
          }
        }

        if (currInfo.isLongOption) {
          // Eg: --sub-domains domain.com ==> {'sub-domans': 'domain.com'}
          result[utils.toCamelCase(optName)] = currValue;
        } else if (currInfo.isShortOption) {
          // Eg: -Dxo chrome ==> {D: true, x: true, o: 'chrome'}
          optName.split('').forEach((_optName, index) => {
            result[_optName] = index === optName.length - 1 ? currValue : true;
          });
        }
      } else {
        result._.push(curr);
      }
    }

    return result;
  },

  _getOption(result, optName) {
    const cmdName = result._[0];
    const cmd = this._cmds[cmdName] || {};
    const cmdOptions = cmd.options || {};
    const globalOptions = this._options;
    const cmdAliasCache = (cmd._aliasCache || {})[optName];
    const globalAliasCache = this._aliasCache[optName];
    const optDefine = cmdOptions[cmdAliasCache] || cmdOptions[optName];
    const globalDefine = globalOptions[globalAliasCache] || globalOptions[optName];

    return optDefine || globalDefine;
  },

  _getAlias(cmdName, optName) {
    let cmdAlias = '';
    if (cmdName && cmdName in this._cmds) {
      cmdAlias = this._cmds[cmdName]._aliasCache[optName];
    }
    return cmdAlias || this._aliasCache[optName];
  },

  /**
   * 校验option参数
   */
  _checkOption(result) {
    let error = '';

    for (const optName in result) {
      if (!/^_{1,2}$/.test(optName)) {
        const optValue = result[optName];
        const optDefine = this._getOption(result, optName);
        const params = optDefine && optDefine.config.params;
        const alias = this._getAlias(result._[0], optName);

        // 校验参数个数是否正确
        if (Array.isArray(params) && params.length > 0 && optValue === DEFAULT_VALUE) {
          error = ['Error: 选项', optName, params.join(' '), '的参数缺失'].join(' ');
            // Break;
        }

        // 设置默认值
        if (optValue === DEFAULT_VALUE) {
          result[optName] = (optDefine && ('default' in optDefine.config)) ? optDefine.config.default : true;
        } else if (optDefine) {
          if (optDefine.config.validate && optDefine.config.validate(optValue, result) === false) {
            error = ['Error: 选项', optName, (params || []).join(' '), '的值不正确'].join(' ');
          }
        }

        // 处理alias
        if (alias) {
          result[utils.toCamelCase(alias)] = result[optName];
        }
      }
    }
    return error;
  },

  /**
   * 执行命令
   */
  _execute(result) {
    const cmdName = this.result._[0];

    if (cmdName) {
      if (this._cmds[cmdName]) {
        if (result.help) {
          this.help(cmdName, this._cmds[cmdName]);
        } else if (typeof this._cmds[cmdName].fn === 'function') {
          this._cmds[cmdName].fn.apply(result, result._.slice(1));
        }
      } else {
        console.log('\ncommand `' + cmdName + '` not exists\n');
      }
    } else if (result.version) {
      console.log(this._version);
    } else if (result.help) {
      this.help();
    }

    return this;
  },

  option(key, opt) {
    if (typeof key === 'object') {
      opt = key;
      key = opt.option;
    }

    const option = new Option(key, opt);
    const alias = option.config.alias;
    const name = option.name;

    this._options[name] = option;

    if (alias) {
      this._aliasCache[name] = alias;
      this._aliasCache[alias] = name;
    }

    return this;
  },

  command(cmd, config) {
    if (typeof cmd === 'object') {
      config = cmd;
      cmd = config.command;
    }

    const command = new Command(cmd, config);
    const cmdName = command.name;

    this._cmds[cmdName] = command;

    return command;
  },

  help(cmdName) {
    const cmds = this._cmds;
    const usage = (this.binName || '').bold.green + ' [command]'.blue + ' [option]\n'.blue;
    let helpStr;

    if (cmdName) {
      return this._helpCmd(cmdName);
    }

    console.log('  ' + 'Usage:\n'.bold.underline);
    console.log('    ' + usage);
    // Commands
    const cmdLines = [];
    let maxLength = 0;
    for (const cmd in cmds) {
      const obj = this._cmds[cmd];
      const desc = obj.describe || '';
      const cmdLen = cmd.length;

      if (cmdLen > maxLength) {
        maxLength = cmdLen;
      }

      cmdLines.push('    ' + cmd.bold + ' $$' + cmdLen + '$$ ' + desc.gray);
    }

    helpStr = cmdLines.join('\n').replace(/\$\$(\d+)\$\$/g, (match, length) => {
      return new Array(maxLength - length + 1).join(' ');
    });

    console.log('  ' + 'Commands:\n'.bold.underline);
    console.log(helpStr);

    console.log('\n  ' + 'Options:\n'.bold.underline);
    console.log(this._getOptionString(this._options));
  },

  version(ver) {
    this._version = ver;
    return this;
  },

  bin(binName) {
    this.binName = binName;
    return this;
  },

  _helpCmd(cmdName) {
    const cmd = this._cmds[cmdName];
    const usage = cmd.usage || 'no help info found';
    const desc = cmd.describe;

    console.log('  ' + 'USAGE:\n'.bold.underline);
    console.log('    ' + usage.gray);

    console.log();
    console.log('  ' + 'DESCRIBE:\n'.bold.underline);
    console.log('    ' + desc.gray);

    console.log();
    console.log('  ' + 'OPTIONS:\n'.bold.underline);

    console.log(this._getOptionString(cmd.options || {}));
  },

  _getOptionString(option) {
    const opts = option;
    let maxLength = 0;
    const cmdOptLines = Object.keys(opts).map(key => {
      const opt = opts[key];
      const conf = opt.config;
      const describe = conf.describe || '';
      const alias = conf.alias;
      const params = conf.params || [];
      const optStr = (alias ? '-' + alias + ', ' : '') + '--' + opt.originName;
      const optStrLen = optStr.length + (params.length ? params.join(' ').length : 0);

      if (optStrLen > maxLength) {
        maxLength = optStrLen;
      }

      return '    ' + optStr.bold + ' ' + params.join(' ').gray + ' $$' + optStrLen + '$$ ' + describe.gray;
    });

    // CmdOptLines.unshift('  -h,--help'.bold.green + ' $$6$$ show help info');

    return cmdOptLines.join('\n').replace(/\$\$(\d+)\$\$/g, (match, length) => {
      return new Array(maxLength - length + 1).join(' ');
    });
  }
};

module.exports = Args;
