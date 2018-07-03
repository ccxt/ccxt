'use strict';

const StandardRelayer = require ('../base/StandardRelayer');

/**
 * This API is inconsistent and seems to hang half the time. Rife with 502 errors...
 */

module.exports = class bamboorelay extends StandardRelayer {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bamboorelay',
            'name': 'Bamboo Relay',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://sra.bamboorelay.com/logo-stacked.svg',
                'api': 'https://sra.bamboorelay.com/main/v0/',
                'www': 'https://bamboorelay.com/',
                'doc': [
                    'https://0xproject.com/docs/connect',
                    'https://sra.bamboorelay.com/',
                ],
            },
            'has': {
                'createOrder': false,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTrades': false,
                'privateAPI': false,
            },
            'perPage': 99,
        });
    }

    fetchCurrencies () {
        return this.listedCurrencies ();
    }

    fetchMarkets () {
        return this.tokenPairs ();
    }

    fetchOrderBook (symbol, limit = undefined, params = {}) {
        return this.orderbook (symbol);
    }

    fetchTicker (symbol, params = {}) {
        return this.ticker (symbol);
    }
};
