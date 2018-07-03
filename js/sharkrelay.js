'use strict';

const StandardRelayer = require ('./base/StandardRelayer');

module.exports = class sharkrelay extends StandardRelayer {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'sharkrelay',
            'name': 'Shark Relay',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://sharkrelay.com/assets/images/sharklogo.png',
                'api': 'https://api.sharkrelay.com/api/v0',
                'www': 'https://sharkrelay.com/',
                'doc': [
                    'https://0xproject.com/docs/connect',
                    'https://sharkrelay.com/api',
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
            'perPage': 500,
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
