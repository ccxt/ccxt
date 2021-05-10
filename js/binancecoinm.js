'use strict';

//  ---------------------------------------------------------------------------

const binance = require ('./binance.js');

//  ---------------------------------------------------------------------------

module.exports = class binancecoinm extends binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binancecoinm',
            'name': 'Binance COIN-M',
            'options': {
                'defaultType': 'delivery',
            },
        });
    }
};

