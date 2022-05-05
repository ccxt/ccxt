'use strict';

//  ---------------------------------------------------------------------------

const fmfwio = require ('./fmfwio.js');

//  ---------------------------------------------------------------------------

module.exports = class bitcoincom extends fmfwio {
    /**
     * @class
     * @name bitcoincom
     * @description exchange class for bitcoincom api
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitcoincom',
            'alias': true,
        });
    }
};
