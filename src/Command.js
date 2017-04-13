/**
 * @file
 * @author zdying
 */

'use strict'

var Option = require('./Option')

function Command (cmd, config) {
  // TODO 代码优化
  var cmdArr = cmd.split(/\s+/)
  var cmdName = cmdArr[0]

  if (!config || typeof config.fn !== 'function') {
    throw Error('A command should has a function property called `fn`')
  }

  var func = config.fn
  var paramsLen = 0
  var paramItems = []

  if (cmdArr.length > 1) {
    paramItems = cmdArr.slice(1)

    for (var i = 0, len = paramItems.length; i < len; i++) {
      var paramItem = paramItems[i]

      if (/^<[^>]+>$/.test(paramItem)) {
        paramsLen++
      } else {
        break
      }
    }

    func = function () {
      if (arguments.length < paramsLen) {
        console.log('error: 命令`' + cmd + '` ' + '参数个数不对, 期待`' + paramsLen + '`个，实际接收到`' + arguments.length + '`个')
      } else {
        config.fn.apply(this, arguments)
      }
    }
  }

  this.name = cmdName
  this.describe = config.describe || ''
  this.usage = config.usage || ''
  this.fn = func
  this.options = {}
  this._aliasCache = {}

  this._initOptions(config)

  return this
}

Command.prototype = {
  constructor: Command,

  option: function (key, opt) {
    var option = new Option(key, opt)

    var name = option.name
    var alias = option.config.alias

    this.options[name] = option

    if (alias) {
      this._aliasCache[alias] = name
      this._aliasCache[name] = alias
    }
    return this
  },

  help: function () {

  },

  execute: function () {

  },

  _initOptions: function (config) {
    var confOpt = config.options || {}
    var _aliasCache = this._aliasCache
    var options = this.options

    options.help = new Option('help', {
      alias: 'h',
      describe: 'show help info'
    })

    Object.keys(confOpt).sort().forEach(function (opt) {
      var option = new Option(opt, config.options[opt])
      var name = option.name
      var alias = option.config.alias

      options[name] = option

      if (alias) {
        _aliasCache[alias] = name
        _aliasCache[name] = alias
      }
    })
  }
}

module.exports = Command
