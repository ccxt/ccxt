'use strict';

var fmfwio = require('./fmfwio.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
// @ts-expect-error
class bitcoincom extends fmfwio {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'bitcoincom',
            'alias': true,
        });
    }
}

module.exports = bitcoincom;
