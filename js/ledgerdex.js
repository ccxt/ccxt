'use strict';

const StandardRelayerV2 = require('./base/StandardRelayerV2');

module.exports = class ledgerdex extends StandardRelayerV2 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'ledgerdex',
            'name': 'LedgerDex',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 2000,
            'urls': {
                'logo': 'https://app.ledgerdex.com/ledgerdex.png',
                'api': 'https://api-v2.ledgerdex.com/sra/v2/',
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
            'perPage': 99,
        });
    }
};
