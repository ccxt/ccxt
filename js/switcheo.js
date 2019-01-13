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
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
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

    async fetchTime () {
        let response = await this.publicGetExchangeTimestamp ();
        return response['timestamp'];
    }

    async fetchContractHash () {
        let response = await this.publicGetExchangeContracts ();
        return response;
    }

    async fetchMarkets (params = {}) {
        let markets = await this.publicGetExchangePairs (this.extend ({
            'show_details': 1,
        }, params));
        let tokens = await this.publicGetExchangeTokens (this.extend ({
            'show_listing_details': 1,
            'show_inactive': 1,
        }, params));
        let result = [];
        for (let p = 0; p < markets.length; p++) {
            let market = markets[p];
            let id = market['name'];
            let base = market['name'].split ('_')[1];
            let quote = market['name'].split ('_')[0];
            let symbol = base + '/' + quote;
            let active = (tokens[base]['trading_active'] && tokens[quote]['trading_active']);
            let precision = {
                'amount': market['precision'],
                'cost': market['precision'],
                'price': market['precision'],
            };
            let limits = {
                'amount': {
                    'min': tokens[quote]['minimum_quantity'],
                },
                'cost': {
                    'min': tokens[base]['minimum_quantity'],
                },
            };
            result.push (this.extend ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'active': active,
                'precision': precision,
                'limits': limits,
                'info': market,
            }));
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length)
                request += '?' + this.urlencode (query);
        }
        let url = this.urls['api'] + '/' + this.version + request;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
