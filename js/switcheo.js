'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, DDoSProtection } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class switcheo extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'switcheo',
            'name': 'Switcheo',
            'countries': [ 'SG' ],
            'rateLimit': 3000,
            'version': 'v2',
            'userAgent': this.userAgents['chrome'],
            'certified': false,
            'parseJsonResponse': true,
            'requiresWeb3': true,
            'has': {
                'CORS': false,
                'cancelOrder': false,
                'createDepositAddress': false,
                'createOrder': false,
                'deposit': false,
                'fetchBalance': false,
                'fetchClosedOrders': false,
                'fetchContractHash': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchMarkets': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': false,
                'fetchBidsAsks': false,
                'fetchTrades': false,
                'withdraw': false,
                'fetchTransactions': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchMySells': false,
                'fetchMyBuys': false,
            },
            'urls': {
                'logo': 'https://docs.switcheo.network/images/logo.png',
                'api': 'https://api.switcheo.network',
                'www': 'https://switcheo.exchange',
                'doc': 'https://docs.switcheo.network',
                'fees': 'https://intercom.help/switcheonetwork/trading-on-switcheo-exchange/how-to-trade-on-switcheo-exchange/trading-fees',
            },
            'api': {
                'public': {
                    'get': [
                        'exchange/timestamp',
                        'exchange/contracts',
                        'exchange/pairs',
                        'exchange/tokens',
                        'fees',
                        'exchange/announcement_message',
                        'tickers/candlesticks',
                        'tickers/last_24_hours',
                        'tickers/last_price',
                        'offers',
                        'offers/book',
                        'trades',
                        'trades/recent',
                        'balances',
                    ],
                },
            },
            'exceptions': {
                'param_required': ExchangeError, // 400 Missing parameter
                'validation_error': ExchangeError, // 400 Unable to validate POST/PUT
                'invalid_request': ExchangeError, // 400 Invalid request
                'authentication_error': AuthenticationError, // 401 Invalid auth (generic)
                'invalid_scope': AuthenticationError, // 403 User hasn’t authenticated necessary scope
                'not_found': ExchangeError, // 404 Resource not found
                'rate_limit_exceeded': DDoSProtection, // 429 Rate limit exceeded
                'internal_server_error': ExchangeError, // 500 Internal server error
            },
        });
    }
};
