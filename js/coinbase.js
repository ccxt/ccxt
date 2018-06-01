'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, AuthenticationError, DDoSProtection } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class coinbase extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinbase',
            'name': 'coinbase',
            'countries': 'US',
            'rateLimit': 1000,
            'version': 'v2',
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
                'logo': 'https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg',
                'api': 'https://api.coinbase.com',
                'www': 'https://www.coinbase.com',
                'doc': 'https://developers.coinbase.com/api/v2',
                'fees': 'https://support.coinbase.com/customer/portal/articles/2109597-buy-sell-bank-transfer-fees',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'api': {
                'public': {
                    'get': [
                        'currencies',
                        'time',
                        'exchange-rates',
                        'users/{user_id}',
                        'prices/{currency_pair}/buy',
                        'prices/{currency_pair}/sell',
                        'prices/{currency_pair}/spot',
                    ],
                },
                'private': {
                    'get': [
                        'accounts',
                        'accounts/{account_id}',
                        'accounts/{account_id}/addresses',
                        'accounts/{account_id}/addresses/{address_id}',
                        'accounts/{account_id}/addresses/{address_id}/transactions',
                        'accounts/{account_id}/transactions',
                        'accounts/{account_id}/transactions/{transaction_id}',
                        'accounts/{account_id}/buys',
                        'accounts/{account_id}/buys/{buy_id}',
                        'accounts/{account_id}/sells',
                        'accounts/{account_id}/sells/{sell_id}',
                        'accounts/{account_id}/deposits',
                        'accounts/{account_id}/deposits/{deposit_id}',
                        'accounts/{account_id}/withdrawals',
                        'accounts/{account_id}/withdrawals/{withdrawal_id}',
                        'payment-methods',
                        'payment-methods/{payment_method_id}',
                        'user',
                        'user/auth',
                    ],
                    'post': [
                        'accounts',
                        'accounts/{account_id}/primary',
                        'accounts/{account_id}/addresses',
                        'accounts/{account_id}/transactions',
                        'accounts/{account_id}/transactions/{transaction_id}/complete',
                        'accounts/{account_id}/transactions/{transaction_id}/resend',
                        'accounts/{account_id}/buys',
                        'accounts/{account_id}/buys/{buy_id}/commit',
                        'accounts/{account_id}/sells',
                        'accounts/{account_id}/sells/{sell_id}/commit',
                        'accounts/{account_id}/deposists',
                        'accounts/{account_id}/deposists/{deposit_id}/commit',
                        'accounts/{account_id}/withdrawals',
                        'accounts/{account_id}/withdrawals/{withdrawal_id}/commit',
                    ],
                    'put': [
                        'accounts/{account_id}',
                        'user',
                    ],
                    'delete': [
                        'accounts/{id}',
                        'accounts/{account_id}/transactions/{transaction_id}',
                    ],
                },
            },
            'exceptions': {
                'two_factor_required': AuthenticationError, // 402 When sending money over 2fa limit
                'param_required': ExchangeError, // 400 Missing parameter
                'validation_error': ExchangeError, // 400 Unable to validate POST/PUT
                'invalid_request': ExchangeError, // 400 Invalid request
                'personal_details_required': AuthenticationError, // 400 User’s personal detail required to complete this request
                'identity_verification_required': AuthenticationError, // 400 Identity verification is required to complete this request
                'jumio_verification_required': AuthenticationError, // 400 Document verification is required to complete this request
                'jumio_face_match_verification_required': AuthenticationError, // 400 Document verification including face match is required to complete this request
                'unverified_email': AuthenticationError, // 400 User has not verified their email
                'authentication_error': AuthenticationError, // 401 Invalid auth (generic)
                'invalid_token': AuthenticationError, // 401 Invalid Oauth token
                'revoked_token': AuthenticationError, // 401 Revoked Oauth token
                'expired_token': AuthenticationError, // 401 Expired Oauth token
                'invalid_scope': AuthenticationError, // 403 User hasn’t authenticated necessary scope
                'not_found': ExchangeError, // 404 Resource not found
                'rate_limit_exceeded': DDoSProtection, // 429 Rate limit exceeded
                'internal_server_error': ExchangeError, // 500 Internal server error
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
                'used': undefined,
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
        let url = this.urls['api'] + '/' + this.version + request;
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
            let what = nonce + method + '/' + this.version + request + payload;
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
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
            let response = JSON.parse (body);
            let feedback = this.id + ' ' + body;
            //
            //    {"error": "invalid_request", "error_description": "The request is missing a required parameter, includes an unsupported parameter value, or is otherwise malformed."}
            //
            // or
            //
            //    {
            //      "errors": [
            //        {
            //          "id": "not_found",
            //          "message": "Not found"
            //        }
            //      ]
            //    }
            //
            let exceptions = this.exceptions;
            let errorCode = this.safeString (response, 'error');
            if (typeof errorCode !== 'undefined') {
                if (errorCode in exceptions) {
                    throw new exceptions[errorCode] (feedback);
                } else {
                    throw new ExchangeError (feedback);
                }
            }
            let errors = this.safeValue (response, 'errors');
            if (typeof errors !== 'undefined') {
                if (Array.isArray (errors)) {
                    let numErrors = errors.length;
                    if (numErrors > 0) {
                        errorCode = this.safeString (errors[0], 'id');
                        if (typeof errorCode !== 'undefined') {
                            if (errorCode in exceptions) {
                                throw new exceptions[errorCode] (feedback);
                            } else {
                                throw new ExchangeError (feedback);
                            }
                        }
                    }
                }
            }
        }
    }
};
