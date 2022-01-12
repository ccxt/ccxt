'use strict';

//  ---------------------------------------------------------------------------

const bitcoincom = require ('./fmfwio.js');

//  ---------------------------------------------------------------------------

module.exports = class bitcoincom extends fmfwio {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
        });
    }
};
