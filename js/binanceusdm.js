'use strict';

//  ---------------------------------------------------------------------------

const binance = require ('./binance.js');

//  ---------------------------------------------------------------------------

module.exports = class binanceusdm extends binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binanceusdm',
            'name': 'Binance USDⓈ-M',
            'options': {
                'defaultType': 'future',
            },
        });
    }
};

