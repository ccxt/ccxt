'use strict';

const StandardRelayerV2 = require('./base/StandardRelayerV2');

module.exports = class radarrelay extends StandardRelayerV2 {
    describe() {
        return this.deepExtend(super.describe(), {
            'id': 'radarrelay2',
            'name': 'Radar Relay - 0x V2',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 500,
            'urls': {
                'logo': 'https://radarrelay.com/img/radar-logo-beta.svg',
                'api': 'https://api.radarrelay.com/0x/v2',
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
                'fetchCurrencies': false,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchOrderBook': true,
                'fetchTicker': false,
                'fetchTrades': false,
                'privateAPI': false,
                'is0xProtocol': true,
                'needsEthereumNodeEndpoint': true,
                'ethIsWeth': true,
            },
        });
    }
};
