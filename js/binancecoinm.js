'use strict';

//  ---------------------------------------------------------------------------

const binance = require ('./binance.js');

//  ---------------------------------------------------------------------------

module.exports = class binancecoinm extends binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binancecoinm',
            'name': 'Binance COIN-M',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg',
                'doc': [
                    'https://binance-docs.github.io/apidocs/delivery/en/',
                    'https://binance-docs.github.io/apidocs/spot/en',
                ],
            },
            'has': {
                'CORS': undefined,
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': undefined,
                'createStopMarketOrder': true,
            },
            'options': {
                'defaultType': 'delivery',
                'leverageBrackets': undefined,
            },
        });
    }

    async transferIn (code, amount, params = {}) {
        // transfer from spot wallet to coinm futures wallet
        return await this.futuresTransfer (code, amount, 3, params);
    }

    async transferOut (code, amount, params = {}) {
        // transfer from coinm futures wallet to spot wallet
        return await this.futuresTransfer (code, amount, 4, params);
    }
};
