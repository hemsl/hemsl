/**
 * @file 解析参数，执行相应的命令
 * @author zdying
 */

'use strict';

require('colors');
var utils = require('./utils');

var Command = require('./command');
var Option = require('./option');

var DEFAULT_VALUE = '__default_value__';

/**
 * 参数解析
 * @param {Object} config 配置对象
 * @param {Boolean} [config.__=false] 是否停止解析`--`后面的内容
 * @param {Object}  [config.colors] 文本颜色配置
 * @param {String}  [config.colors.title='white'] 标题文本颜色
 * @param {String}  [config.colors.command='white'] 命令名称文本颜色
 * @param {String}  [config.colors.paragraph='gray'] 段落文本颜色
 * @param {String}  [config.colors.parameter='gray'] 参数文本颜色
 * @constructor
 */
function Args (config) {
  this._options = {};
  this._cmds = {};
  this._aliasCache = {};
  this.result = {};
  this.config = config || {};
  this._version = '';
  this.binName = '';

  this._initColors();

  this.option('version', {
    default: true,
    describe: 'Display version information',
    alias: 'v'
  });

  this.option('help', {
    default: true,
    describe: 'Display help information',
    alias: 'h'
  });
}

Args.prototype = {
  constructor: Args,
  /**
   * 解析参数，返回解析后的参数对象。如果参数`execute`为`true`，自动执行argv中的命令
   * @param {Array}   [argv=process.argv.slice(2)] 要解析的参数数组
   * @param {Boolean} [execute=false] 是否自动执行参数中的命令
   * @return {Object} 解析后的对象
   * @public
   */
  parse: function (argv, execute) {
    var args = Array.isArray(argv) ? argv : process.argv.slice(2);
    var result = this.result = this._parse(args);
    var error = this._checkOption(result);

    if (error) {
      console.log(error);
      result.__error__ = error;
    } else if (argv === true || execute === true) {
      this._execute(result);
    }

    return result;
  },

  /**
   * 执行命令
   * @return {Args}
   * @public
   */
  execute: function () {
    this._execute(this.result);
    return this;
  },

  /**
   * 添加全局选项
   * @param {String} key    选项名称
   * @param {Object} config 选项配置
   * @return {Args}
   * @public
   */
  option: function (key, config) {
    if (typeof key === 'object') {
      config = key;
      key = config.option;
    }

    var option = new Option(key, config);
    var alias = option.config.alias;
    var name = option.name;

    this._options[name] = option;

    if (alias) {
      this._aliasCache[name] = alias;
      this._aliasCache[alias] = name;
    }

    return this;
  },

  /**
   * 添加命令
   * @param {String} cmd    命令名称
   * @param {Object} config 命令配置
   * @return {Command}
   * @public
   */
  command: function (cmd, config) {
    if (typeof cmd === 'object') {
      config = cmd;
      cmd = config.command;
    }

    var command = new Command(cmd, config);
    var cmdName = command.name;

    this._cmds[cmdName] = command;

    return command;
  },

  /**
   * 显示自动生成的帮助信息，如果指定了命令名称，则显示对应命令的帮助信息
   * @param {String} [cmdName] 命令名称
   * @return {Args}
   * @public
   */
  help: function (cmdName) {
    var cmds = this._cmds;
    var usage = this.binName.bold.green + ' [command]'.blue + ' [option]\n'.blue;
    var helpStr;

    if (cmdName) {
      return this._helpCmd(cmdName);
    }

    console.log();
    console.log('  ' + 'Usage:\n'.bold.underline);
    console.log('    ' + usage);
    // commands
    var cmdLines = [];
    var maxLength = 0;
    for (var cmd in cmds) {
      var obj = this._cmds[cmd];
      var desc = obj.describe || '';
      var cmdLen = cmd.length;

      if (cmdLen > maxLength) {
        maxLength = cmdLen;
      }

      cmdLines.push('    ' + cmd.bold[this.commandColor] + ' $$' + cmdLen + '$$ ' + desc[this.parameterColor]);
    }

    helpStr = cmdLines.join('\n').replace(/\$\$(\d+)\$\$/g, function (match, length) {
      return new Array(maxLength - length + 1).join(' ');
    });

    console.log('  ' + 'Commands:\n'.bold.underline);
    console.log(helpStr);

    console.log('\n  ' + 'Options:\n'.bold.underline);
    console.log(this._getOptionString(this._options));
    console.log();

    return this;
  },

  /**
   * 设置App版本号，默认值为1.0.0。这个版本号会在全局-v/--version的时候显示
   * @param {String} ver 版本号
   * @return {Args}
   * @public
   */
  version: function (ver) {
    this._version = ver;
    return this;
  },

  /**
   * 设置App的命令名称
   * @param {String} binName 名称
   * @return {Args}
   * @public
   */
  bin: function (binName) {
    this.binName = binName || '';
    return this;
  },

  _initColors: function () {
    var self = this;
    'command title paragraph parameter'.split(' ').forEach(function (key) {
      self[key + 'Color'] = self.getColor(key);
    });
  },

  getColor: function (type) {
    var config = this.config || {};
    var colors = config.colors || {};
    var defaultColors = {
      command: 'white',  // 命令名称
      title: 'white',       // 标题文本
      paragraph: 'gray',    // 段落文本颜色
      parameter: 'gray'     // 参数文本颜色
    };

    return colors[type] || defaultColors[type] || 'white';
  },

  /**
   * 解析参数，将数组转化成key-value对象
   * 比如：
   *    输入：['start', '--file=./package.json', '-xo', 'some', 'thing']
   *    输出：{
   *       _: ['start', 'some', 'thing'],
   *       start: true,
   *       file: './package.json',
   *       x: true,
   *       o: true
   *    }
   * @param {Array}   [args] 要解析的参数数组
   * @return {Object} 解析后的对象
   * @private
   */
  _parse: function (args) {
    var curr, currInfo, currValue, next, nextInfo, optName;
    var result = {_: []};
    var self = this;

    for (var i = 0, len = args.length; i < len; i++) {
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
          // eg: --sub-domains domain.com ==> {'sub-domans': 'domain.com'}
          self._setOptionValue(result, utils.toCamelCase(optName), currValue);
        } else if (currInfo.isShortOption) {
          // eg: -Dxo chrome ==> {D: true, x: true, o: 'chrome'}
          optName.split('').forEach(function (_optName, index) {
            self._setOptionValue(result, _optName, index === optName.length - 1 ? currValue : true);
          });
        }
      } else {
        result._.push(curr);
      }
    }

    return result;
  },

  _setOptionValue: function (result, key, value) {
    var oldValue = result[key];
    if (oldValue == null) {
      result[key] = value;
    } else if (Array.isArray(oldValue)) {
      result[key].push(value);
    } else {
      result[key] = [oldValue, value];
    }
  },

  /**
   * 在解析后的参数中，获取指定的选项对象
   * @param {Object}  result 解析后的参数
   * @param {String}  optName 选项名称
   * @return {Object} 参数对象
   * @private
   */
  _getOption: function (result, optName) {
    var cmdName = result._[0];
    var cmd = this._cmds[cmdName] || {};
    var cmdOptions = cmd.options || {};
    var globalOptions = this._options;
    var cmdAliasCache = (cmd._aliasCache || {})[optName];
    var globalAliasCache = this._aliasCache[optName];
    var optDefine = cmdOptions[cmdAliasCache] || cmdOptions[optName];
    var globalDefine = globalOptions[globalAliasCache] || globalOptions[optName];

    return optDefine || globalDefine;
  },

  /**
   * 获取指定选项的别名，如果这个选项没有别名，返回这个选项名称自身
   * 如果指定了命令名称，查找过程：
   *    1. 查找`cmdName`对应的指令中的选项
   *    2. 如果没有再查找全局中的选项
   * 如果没有指定命令名称，直接去查找全局选项
   * @param {String} [cmdName]  命令名称
   * @param {String} optName    选项名称
   * @return {String} 别名名称
   * @private
   */
  _getAlias: function (cmdName, optName) {
    var cmdAlias = '';
    if (cmdName && cmdName in this._cmds) {
      cmdAlias = this._cmds[cmdName]._aliasCache[optName];
    }
    return cmdAlias || this._aliasCache[optName];
  },

  /**
   * 校验选项参数，给默认值赋值
   * @param {Object} result 解析后的参数对象
   * @return {String} 错误字符串，如果选项参数有误，返回错误信息
   * @private
   */
  _checkOption: function (result) {
    var error = '';

    for (var optName in result) {
      if (!/^_{1,2}$/.test(optName)) {
        var optValue = result[optName];
        var optDefine = this._getOption(result, optName);
        var params = optDefine && optDefine.config.params;
        var alias = this._getAlias(result._[0], optName);
        var requiredParams = Array.isArray(params) && params.filter(function (p) {
          return /^<.*>$/.test(p);
        });

        // 校验参数个数是否正确
        if (Array.isArray(requiredParams) && requiredParams.length > 0 && optValue === DEFAULT_VALUE) {
          error = 'Error: The parameter of `' + (optName + (Array.isArray(params) ? ' ' + params.join(' ') : '')) + '` is missing';
            // break;
        }

        // 设置默认值
        if (optValue === DEFAULT_VALUE) {
          result[optName] = (optDefine && ('default' in optDefine.config)) ? optDefine.config.default : true;
        } else if (optDefine) {
          if (optDefine.config.validate) {
            if (optDefine.config.validate(optValue, result) === false) {
              error = ['Error: The value of parameter `' + optName + (Array.isArray(params) ? ' ' + params.join(' ') : '') + '` is incorrect'].join(' ');
              // break;
            }
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
   * 执行解析后的参数对象中存在的命令
   * @param {Object} result 解析后的参数对象
   * @return {Args}
   * @private
   */
  _execute: function (result) {
    var cmdName = this.result._[0];

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
    } else {
      if (result.version) {
        console.log(this._version || '1.0.0');
      } else if (result.help) {
        this.help();
      }
    }

    return this;
  },

  /**
   * 显示对应命令的帮助信息
   * @param {String} cmdName 命令名称
   * @return {Args}
   * @private
   */
  _helpCmd: function (cmdName) {
    var cmd = this._cmds[cmdName];
    var usage = cmd.usage || 'no help info found';
    var desc = cmd.describe;
    var titleColor = this.titleColor;
    var descColor = this.paragraphColor;

    console.log();
    console.log('  ' + 'USAGE:\n'.bold.underline[titleColor]);
    console.log('    ' + usage[descColor]);

    console.log();
    console.log('  ' + 'DESCRIBE:\n'.bold.underline[titleColor]);
    console.log('    ' + desc[descColor]);

    console.log();
    console.log('  ' + 'OPTIONS:\n'.bold.underline[titleColor]);

    console.log(this._getOptionString(cmd.options || {}));
    console.log();

    return this;
  },

  /**
   * 获取选项的帮助信息字符串
   * @param {Object} option 选项对象
   * @return {String}
   * @private
   */
  _getOptionString: function (option) {
    var opts = option;
    var maxLength = 0;
    var res = '';
    var cmdOptLines = Object.keys(opts).map(function (key) {
      var opt = opts[key];
      var conf = opt.config;
      var describe = conf.describe || '';
      var alias = conf.alias;
      var params = conf.params || [];
      var optStr = (alias ? '-' + alias + ', ' : '') + '--' + opt.originName;
      var optStrLen = optStr.length + (params.length ? params.join(' ').length : 0);

      if (optStrLen > maxLength) {
        maxLength = optStrLen;
      }

      return '    ' + optStr.bold + ' ' + params.join(' ')[this.paragraphColor] + ' $$' + optStrLen + '$$ ' + describe[this.paragraphColor];
    }.bind(this));

    // cmdOptLines.unshift('  -h,--help'.bold.green + ' $$6$$ show help info');
    res = cmdOptLines.join('\n').replace(/\$\$(\d+)\$\$/g, function (match, length) {
      return new Array(maxLength - length + 1).join(' ');
    });

    return res;
  }
};

module.exports = Args;
