'use strict';

const StandardRelayer = require ('../base/StandardRelayer');

/**
 * This does not work as advertised. It uses the same routes as the Standard Relayer spec
 * but has renamed some of the field keys, rendering it useless.
 */

module.exports = class theocean extends StandardRelayer {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'theocean',
            'name': 'The Ocean',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://theocean.trade/assets/images/the-ocean-x-logo.svg',
                'api': 'https://kovan.theoceanx.com/api/v0',
                'www': 'https://theocean.trade/',
                'doc': [
                    'https://0xproject.com/docs/connect',
                    'https://docs.theocean.trade/',
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
            'baseTokenSym': 'baseToken',
            'quoteTokenSym': 'quoteToken',
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
