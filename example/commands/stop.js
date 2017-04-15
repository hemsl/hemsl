/**
 * @file command `reload`
 * @author zdying
 */

'use strict';

module.exports = {
  command: 'stop',
  describe: 'Stop the local http server',
  usage: 'stop',
  fn: function () {
    console.log();
    console.log('Server stopped');
    console.log();
  }
};
