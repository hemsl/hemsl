/**
 * @file command `start`
 * @author zdying
 */

'use strict'

module.exports = {
  command: 'start',
  describe: 'Start a local `http` server',
  usage: 'start [port]',
  fn: function (port) {
    var http = require('http')
    var server = http.createServer(function (req, res) {
      console.log('[access]', req.method, req.url)
      res.end(req.url)
    })

    port = port || 8900

    server.listen(port)

    console.log()
    console.log('Server started')
    console.log('Home page url:', 'http://127.0.0.1:' + port)
    console.log('To exit, please press CTRL + C')
    console.log()
  },
  options: {
    'port': {
      alias: 'p',
      validate: /^\d+$/,
      describe: 'server port'
    }
  }
}
