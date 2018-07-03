'use strict';

const StandardRelayer = require ('./base/StandardRelayer');

module.exports = class ercdex extends StandardRelayer {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'ercdex',
            'name': 'ERC dEX',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://pbs.twimg.com/profile_images/941139790916861953/Q7GLIM7D_400x400.jpg',
                'api': 'https://api.ercdex.com/api/standard/1/v0',
                'www': 'https://ercdex.com',
                'doc': [
                    'https://0xproject.com/docs/connect',
                    'https://aqueduct.ercdex.com/rest.html',
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
