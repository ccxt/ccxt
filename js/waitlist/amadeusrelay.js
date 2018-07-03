'use strict';

const StandardRelayer = require ('../base/StandardRelayer');

/**
 * Amadeus relay is currently only live on the test RPC network right now.
 */

module.exports = class amadeusrelay extends StandardRelayer {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'amadeusrelay',
            'name': 'Amadeus Relay',
            'countries': 'USA',
            'version': undefined,
            'userAgent': undefined,
            'rateLimit': 1000,
            'urls': {
                'logo': 'https://amadeusrelay.org/img/logo_branco.svg',
                'api': 'https://kovan.amadeusrelay.org/api/v0',
                'www': 'https://amadeusrelay.org/',
                'doc': [
                    'https://0xproject.com/docs/connect',
                    'https://amadeusrelay.github.io/AmadeusRelayFrontend/',
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
            'perPage': 100,
            'networkId': 42,
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
