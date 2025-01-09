'use strict';

var okx = require('./okx.js');

// ----------------------------------------------------------------------------
// ---------------------------------------------------------------------------
class myokx extends okx {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'myokx',
            'name': 'MyOKX',
            'urls': {
                'api': {
                    'ws': 'wss://wseea.okx.com:8443/ws/v5',
                },
                'test': {
                    'ws': 'wss://wseeapap.okx.com:8443/ws/v5',
                },
            },
            'has': {
                'swap': false,
                'future': false,
                'option': false,
            },
        });
    }
}

module.exports = myokx;
