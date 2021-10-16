'use strict';

//  ---------------------------------------------------------------------------

const gateio = require ('./gateio.js');

//  ---------------------------------------------------------------------------

module.exports = class gateioperp extends gateio {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gateioperp',
            'name': 'Gateio Perpetual Futures',
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg',
                'doc': [
                    'https://www.gate.io/docs/developers/apiv4/en/#futures',
                ],
            },
            'options': {
                'defaultType': 'future',
                'networks': {
                    'TRC20': 'TRX',
                    'ERC20': 'ETH',
                    'BEP20': 'BSC',
                },
                'accountsByType': {
                    'spot': 'spot',
                    'margin': 'margin',
                    'futures': 'futures',
                    'delivery': 'delivery',
                },
                'future': {
                    'fetchMarkets': {
                        'settlementCurrencies': [ 'usdt', 'btc' ],
                    },
                },
                'delivery': {
                    'fetchMarkets': {
                        'settlementCurrencies': [ 'usdt', 'btc' ],
                    },
                },
            },
        });
    }

    // TODO: Uncomment once implemented
    // async transferIn (code, amount, params = {}) {
    //     // transfer from spot wallet to usdm futures wallet
    //     return await this.futuresTransfer (code, amount, 1, params);
    // }

    // async transferOut (code, amount, params = {}) {
    //     // transfer from usdm futures wallet to spot wallet
    //     return await this.futuresTransfer (code, amount, 2, params);
    // }
};
