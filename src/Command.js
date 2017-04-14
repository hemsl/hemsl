/**
 * @file
 * @author zdying
 */

'use strict';

const Option = require('./option');

/**
 * 创建一个命令
 * @param {String} cmd    命令名称
 * @param {Object} config 配置参数
 * @param {String} config.usage     命令使用帮助
 * @param {String} config.describe  命令描述信息
 * @param {Function} config.fn      执行命令时调用的函数
 * @param {Object} config.options   命令支持的选项（option）
 */
function Command(cmd, config) {
  if (typeof cmd !== 'string') {
    throw new TypeError('A command should has a name');
  }

  if (!config || typeof config.fn !== 'function') {
    throw new Error('A command should has a function property called `fn`');
  }

  const cmdArr = cmd.split(/\s+/);
  const cmdName = cmdArr[0];
  const reg = /(<[^>]+>|\[[^\]]+\])/;
  let func = config.fn;
  let paramsLen = 0;
  let paramItems = [];

  if (cmdArr.length > 1) {
    // Cmmand params
    paramItems = cmd.match(reg) || [];
    // Required params
    paramsLen = paramItems.filter(param => {
      return /<\w+>/.test(param);
    }).length;

    func = function () {
      if (arguments.length < paramsLen) {
        console.log('error: 命令`' + cmd + '` 参数个数不对, 期待`' + paramsLen + '`个，实际接收到`' + arguments.length + '`个');
      } else {
        config.fn.apply(this, arguments);
      }
    };
  }

  this.name = cmdName;
  this.describe = config.describe || '';
  this.usage = config.usage || '';
  this.fn = func;
  this.options = {};
  this._aliasCache = {};

  this._initOptions(config.options);

  return this;
}

Command.prototype = {
  constructor: Command,

  /**
   * 为命令创建一个选项
   * @param {String} key 选项名称
   * @param {Object} opt 选项配置
   * @return {Command}
   * @public
   */
  option(key, opt) {
    const option = new Option(key, opt);
    const name = option.name;
    const alias = option.config.alias;

    this.options[name] = option;

    if (alias) {
      this._aliasCache[alias] = name;
      this._aliasCache[name] = alias;
    }
    return this;
  },

  /**
   * 初始化选项
   * @param {Object} config
   * @return {Command}
   * @private
   */
  _initOptions(options) {
    const confOpt = options || {};

    this.option('help', {
      alias: 'h',
      describe: 'show help info'
    });

    Object.keys(confOpt).sort().forEach(opt => {
      this.option(opt, confOpt[opt]);
    });

    return this;
  }
};

module.exports = Command;
