'use strict';

var fmfwio = require('./fmfwio.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class bitcoincom extends fmfwio {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bitcoincom',
            'name': 'Bitcoin.com',
            'alias': true,
        });
    }
}

module.exports = bitcoincom;
