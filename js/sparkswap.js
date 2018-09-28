'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class sparkswap extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'sparkswap',
            'name': 'sparkswap',
            'countries': [ 'US' ],
            // 10k calls per hour
            'rateLimit': 400,
            'enableRateLimit': true,
            'version': 'v1',
            'userAgent': this.userAgents['chrome'],
            'headers': {},
            'timeout': 10000, // number in milliseconds
            'verbose': false, // boolean, output error details
            'requiredCredentials': {
                'uid': true,
                'password': true,
            },
            'has': {
                // We do not support CORS w/ headers
                'CORS': false,
                // Sparkswap exchange has both private and public APIs
                'private': false,
                'public': false,
                // Methods that we support for sparkswap
                'cancelOrder': 'emulated',
                'createDepositAddress': 'emulated',
                'createOrder': 'emulated',
                'deposit': 'emulated',
                'fetchBalance': 'emulated',
                'fetchMarkets': 'emulated',
                'fetchOrder': 'emulated',
                'fetchOrderBook': 'emulated',
                'fetchOrders': 'emulated',
                'fetchTicker': 'emulated',
                'fetchTrades': 'emulated',
                'withdraw': 'emulated',
                'commit': 'emulated',
                'release': 'emulated',
                // Unsupported methods for sparkswap
                'fetchClosedOrders': false,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchTickers': false,
                'fetchBidsAsks': false,
                'fetchTransactions': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg',
                'www': 'https://www.sparkswap.com',
                'doc': 'https://docs.sparkswap.com',
            },
            'api': {
                'public': {
                    'get': [],
                },
                'private': {
                    'get': [
                        'v1/order/{id}', // grab a single order
                        'v1/wallet/balances', // get balances for a specified wallet
                        'v1/trades', // get all trades for a specific market
                    ],
                    'post': [
                        'v1/order', // create an order
                        'v1/order/cancel', // cancel an order
                        'v1/wallet/address', // generate a wallet address
                        'v1/wallet/commit',
                        'v1/wallet/',
                    ],
                    'put': [],
                    'delete': [],
                },
            },
            'exceptions': {},
            'markets': {},
            'options': {},
        });
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'] + '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            // Once authentication is enabled for CCXT w/ the grpc proxy, we can
            // add the base64 basic auth header to these params.
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        throw new ExchangeError ('Not Implemented');
    }

    async createDepositAddress () {
        throw new ExchangeError ('Not Implemented');
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        throw new ExchangeError ('Not Implemented');
    }

    async deposit () {
        throw new ExchangeError ('Not Implemented');
    }

    async fetchBalance (params = {}) {
        throw new ExchangeError ('Not Implemented');
    }

    async fetchMarkets () {
        throw new ExchangeError ('Not Implemented');
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        return this.privateGetV1OrderId ({ id });
    }

    async fetchOrderBook () {
        throw new ExchangeError ('Not Implemented');
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        throw new ExchangeError ('Not Implemented');
    }

    async fetchTicker () {
        throw new ExchangeError ('Not Implemented');
    }

    async fetchTrades () {
        throw new ExchangeError ('Not Implemented');
    }

    async withdraw () {
        throw new ExchangeError ('Not Implemented');
    }

    async commit () {
        throw new ExchangeError ('Not Implemented');
    }

    async release () {
        throw new ExchangeError ('Not Implemented');
    }
};

