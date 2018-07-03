'use strict';

const StandardRelayer = require ('./base/StandardRelayer');

module.exports = class openrelay extends StandardRelayer {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ercdex',
            'name': 'ERC dEX',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 2000,
            'urls': {
                'logo': 'https://openrelay.xyz/img/profile.png',
                'api': 'https://api.openrelay.xyz/v0',
                'www': 'https://openrelay.xyz/',
                'doc': [
                    'https://0xproject.com/docs/connect',
                    'https://openrelay.xyz/docs/',
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

    // TODO: these imbeciles don't list token pairs on an endpoint.
    // TODO: at some point we'll need to generate them by mapping over the orderbook
    fetchOrderBook (symbol, limit = undefined, params = {}) {
        return this.orderbook (symbol);
    }

    fetchTicker (symbol, params = {}) {
        return this.ticker (symbol);
    }
};
