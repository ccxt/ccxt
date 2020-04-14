'use strict';

//  ---------------------------------------------------------------------------

const bittrex = require ('./bittrex.js');

//  ---------------------------------------------------------------------------

module.exports = class bittrexglobal extends bittrex {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bittrexglobal',
            'name': 'Bittrex Global',
            'certified': false,
            'hostname': 'global.bittrex.com',
        });
    }
};

