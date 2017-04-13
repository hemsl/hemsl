/**
 * @file command `reload`
 * @author zdying
 */

'use strict';

module.exports = {
    command: 'reload',
    describe: 'Reload the local http server',
    usage: 'reload [option]',
    fn: function(){
        console.log();
        console.log('Server reloaded');
        console.log();
    }
}
