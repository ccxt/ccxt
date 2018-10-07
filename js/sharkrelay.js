'use strict';

const StandardRelayerV2 = require('./base/StandardRelayerV2');

module.exports = class sharkrelay extends StandardRelayerV2 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'sharkrelay2',
            'name': 'Shark Relay',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://sharkrelay.com/assets/images/sharklogo.png',
                'api': 'https://api.sharkrelay.com/sra/v2',
                'www': 'https://sharkrelay.com/',
            },
            'has': {
                'createOrder': false,
                'createMarketOrder': false,
                'createLimitOrder': false,
                'fetchBalance': false,
                'fetchCurrencies': false,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTicker': false,
                'fetchTrades': false,
                'privateAPI': false,
            },
            'perPage': 500,
        });
    }
};
