'use strict';

const StandardRelayer = require('./base/StandardRelayer');

module.exports = class radarrelay extends StandardRelayer {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'radarrelay',
            'name': 'Radar Relay',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://radarrelay.com/img/radar-logo-beta.svg',
                'api': 'https://api.radarrelay.com/0x/v0/',
                'www': 'https://radarrelay.com',
                'doc': [
                    'https://radarrelay.com/standard-relayer-api/',
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
                'fetchTicker': false,
                'fetchTrades': false,
                'privateAPI': false,
            },
        });
    }

    fetchCurrencies() {
        return this.listedCurrencies();
    }

    fetchOrderBook(symbol, limit = undefined, params = {}) {
        return this.orderbook(symbol);
    }

    fetchMarkets() {
        return this.tokenPairs();
    }
};
