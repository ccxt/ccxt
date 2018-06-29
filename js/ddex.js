'use strict';

const ZeroExExchange = require ('./base/StandardRelayer');

module.exports = class ddex extends ZeroExExchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ddex',
            'name': 'DDEX',
            'rateLimit': 2000,
            'urls': {
                'logo': 'https://docs.ddex.io/images/logo.png',
                'api': 'https://api.ddex.io/v2',
                'www': 'https://ddex.io/',
                'doc': [
                    'https://docs.ddex.io/',
                ],
            },
            'has': {
                'cancelInstantTransaction': false,
                'createOrder': false,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchL2OrderBook': false,
                'fetchMarkets': false,
                // 'fetchOrderBook': true,
                // 'fetchTicker': true,
                'fetchTrades': false,
                'privateAPI': false,
                'startInstantTransaction': false,
            },
        });
    }

    // async fetchCurrencies () {
    //     return await ZeroExExchange.tokenRegistry ();
    // }
    //
    // async fetchMarkets () {
    //     return await this.tokenPairs ();
    // }
};
