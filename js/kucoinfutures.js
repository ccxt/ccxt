'use strict';

//  ---------------------------------------------------------------------------

const kucoin = require ('./kucoin.js');

//  ---------------------------------------------------------------------------

module.exports = class kucoinfutures extends kucoin {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'kucoinfutures',
            'name': 'Kucoin Futures',
            'urls': {
                'logo': 'https://docs.kucoin.com/futures/images/logo_en.svg',
                'doc': [
                    'https://docs.kucoin.com/futures',
                    'https://docs.kucoin.com',
                ],
                'www': 'https://futures.kucoin.com/',
            },
            'options': {
                'defaultType': 'swap',
                'marginTypes': {},
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
