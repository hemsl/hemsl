/**
 * @file
 * @author zdying
 */

'use strict';

const path = require('path');
const Args = require('../src');

const args = new Args();

'start stop reload list'.split(' ').forEach(cmd => {
  const cmdFilePath = require(path.join(__dirname, 'commands', cmd));

  args.command(cmdFilePath);
});

args.version('1.1.2').parse(true);
