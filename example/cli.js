/**
 * @file
 * @author zdying
 */

'use strict';

var path = require('path');

var Args = require('../src');
var args = new Args();

'start stop reload list'.split(' ').forEach(function(cmd){
    var cmdFilePath = require(path.join(__dirname, 'commands', cmd));

    args.command(cmdFilePath);
});

args.version('1.1.2').parse(true);
