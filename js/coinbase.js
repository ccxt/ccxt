'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class coinbase extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinbase',
            'name': 'coinbase',
            'countries': 'US',
            'rateLimit': 1000,
            'userAgent': this.userAgents['chrome'],
            'has': {
                'CORS': true,
                'cancelOrder': false,
                'createDepositAddress': false,
                'createOrder': false,
                'deposit': false,
                'fetchBalance': true,
                'fetchClosedOrders': false,
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
                'fetchBidsAsks': false,
                'fetchTrades': false,
                'withdraw': false,
                'fetchTransactions': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/27766527-b1be41c6-5edb-11e7-95f6-5b496c469e2c.jpg',
                'api': 'https://api.coinbase.com/v2',
                'www': 'https://www.coinbase.com',
                'doc': 'https://developers.coinbase.com/api/v2',
                'fees': [
                    'https://support.coinbase.com/customer/portal/articles/2109597-buy-sell-bank-transfer-fees',
                ],
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'version': 'v2',
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'time',
                        'exchange-rates',
                        'users/{userId}',
                        'prices/{symbol}/buy',
                        'prices/{symbol}/sell',
                        'prices/{symbol}/spot',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/{accountId}',
                        'accounts/{accountId}/addresses',
                        'accounts/{accountId}/addresses/{address_id}',
                        'accounts/{accountId}/addresses/{address_id}/transactions',
                        'accounts/{accountId}/transactions',
                        'accounts/{accountId}/transactions/{transaction_id}',
                        'accounts/{accountId}/buys',
                        'accounts/{accountId}/buys/{buyId}',
                        'accounts/{accountId}/sells',
                        'accounts/{accountId}/sells/{sellId}',
                        'accounts/{accountId}/deposits',
                        'accounts/{accountId}/deposits/{depositId}',
                        'accounts/{accountId}/withdrawals',
                        'accounts/{accountId}/withdrawals/{withdrawalId}',
                        'payment-methods',
                        'payment-methods/{methodId}',
                        'user',
                        'user/auth',
                    ],
                    'post': [
                        'accounts',
                        'accounts/{accountId}/primary',
                        'accounts/{accountId}/addresses',
                        'accounts/{accountId}/transactions',
                        'accounts/{accountId}/transactions/{transactionId}/complete',
                        'accounts/{accountId}/transactions/{transactionId}/resend',
                        'accounts/{accountId}/buys',
                        'accounts/{accountId}/buys/{buyId}/commit',
                        'accounts/{accountId}/sells',
                        'accounts/{accountId}/sells/{sellId}/commit',
                        'accounts/{accountId}/deposists',
                        'accounts/{accountId}/deposists/{depositId}/commit',
                        'accounts/{accountId}/withdrawals',
                        'accounts/{accountId}/withdrawals/{withdrawalId}/commit',
                    ],
                    'put': [
                        'accounts/{accountId}',
                        'user',
                    ],
                    'delete': [
                        'accounts/{id}',
                        'accounts/{accountId}/transactions/{transactionId}',
                    ],
                },
            },
            'markets': {
                'BTC/USD': { 'id': 'btc-usd', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD' },
                'LTC/USD': { 'id': 'ltc-usd', 'symbol': 'LTC/USD', 'base': 'LTC', 'quote': 'USD' },
                'ETH/USD': { 'id': 'eth-usd', 'symbol': 'ETH/USD', 'base': 'ETH', 'quote': 'USD' },
                'BCH/USD': { 'id': 'bch-usd', 'symbol': 'BCH/USD', 'base': 'BCH', 'quote': 'USD' },
            },
        });
    }

    async fetchTime () {
        let response = await this.publicGetTime ();
        return this.parse8601 (response['data']['iso']);
    }

    async fetchBalance (params = {}) {
        let balances = await this.privateGetAccounts ();
        let result = { 'info': balances };
        for (let b = 0; b < balances.data.length; b++) {
            let balance = balances.data[b];
            let currency = balance['balance']['currency'];
            let account = {
                'free': this.safeFloat (balance['balance'], 'amount'),
                'used': null,
                'total': this.safeFloat (balance['balance'], 'amount'),
            };
            result[currency] = account;
        }
        return this.parseBalance (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let request = '/' + this.implodeParams (path, params);
        let query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length)
                request += '?' + this.urlencode (query);
        }
        let url = this.urls['api'] + request;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            let nonce = this.nonce ().toString ();
            let payload = '';
            if (method !== 'GET') {
                if (Object.keys (query).length) {
                    body = this.json (query);
                    payload = body;
                }
            }
            let what = nonce + method + '/v2' + request + payload;
            let signature = this.hmac (this.encode (what), this.secret);
            headers = {
                'CB-ACCESS-KEY': this.apiKey,
                'CB-ACCESS-SIGN': this.decode (signature),
                'CB-ACCESS-TIMESTAMP': nonce,
                'CB-VERSION': '2018-05-30',
                'Content-Type': 'application/json',
            };
        }
        if (!headers) {
            headers = {
                'CB-VERSION': '2018-05-30',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body) {
        if ((code === 400) || (code === 404) || (code === 401)) {
            if (body[0] === '{') {
                let response = JSON.parse (body);
                let message = response['errors'][0]['message'];
                let error = this.id + ' ' + message;
                if (message === 'invalid api key') {
                    throw new AuthenticationError (error);
                }
                throw new ExchangeError (this.id + ' ' + message);
            }
            throw new ExchangeError (this.id + ' ' + body);
        }
    }

    async request (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let response = await this.fetch2 (path, api, method, params, headers, body);
        if ('message' in response) {
            throw new ExchangeError (this.id + ' ' + this.json (response));
        }
        return response;
    }
};
