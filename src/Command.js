/**
 * @file
 * @author zdying
 */

'use strict'

var Option = require('./Option')

function Command (cmd, config) {
  if (typeof cmd !== 'string') {
    throw Error('A command should has a name')
  }

  if (!config || typeof config.fn !== 'function') {
    throw Error('A command should has a function property called `fn`')
  }

  var cmdArr = cmd.split(/\s+/)
  var cmdName = cmdArr[0]
  var func = config.fn
  var paramsLen = 0
  var reg = /(<[^>]+>|\[[^\]]+\])/
  var paramItems = []

  if (cmdArr.length > 1) {
    // cmmand params
    paramItems = cmd.match(reg) || []
    // required params
    paramsLen = paramItems.filter(function (param) {
      return /<\w+>/.test(param)
    }).length


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

  _initOptions: function (config) {
    var confOpt = config.options || {}

    this.option('help', {
      alias: 'h',
      describe: 'show help info'
    })

    Object.keys(confOpt).sort().forEach(function (opt) {
      this.option(opt, confOpt[opt])
    }.bind(this))
  }
}

module.exports = Command
