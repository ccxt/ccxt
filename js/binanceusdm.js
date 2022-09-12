'use strict';

//  ---------------------------------------------------------------------------

const binance = require ('./binance.js');

//  ---------------------------------------------------------------------------

module.exports = class binanceusdm extends binance {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'binanceusdm',
            'name': 'Binance USDⓈ-M',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/117738721-668c8d80-b205-11eb-8c49-3fad84c4a07f.jpg',
                'doc': [
                    'https://binance-docs.github.io/apidocs/futures/en/',
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
                'defaultType': 'future',
                // https://www.binance.com/en/support/faq/360033162192
                // tier amount, maintenance margin, initial margin
                'leverageBrackets': undefined,
                'marginTypes': {},
                'marginModes': {},
            },
        });
    }

    async transferIn (code, amount, params = {}) {
        // transfer from spot wallet to usdm futures wallet
        return await this.futuresTransfer (code, amount, 1, params);
    }

    async transferOut (code, amount, params = {}) {
        // transfer from usdm futures wallet to spot wallet
        return await this.futuresTransfer (code, amount, 2, params);
    }
};
