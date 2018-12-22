'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, DDoSProtection } = require ('./base/errors');

// ----------------------------------------------------------------------------

module.exports = class coinbase extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'coinbase',
            'name': 'Coinbase',
            'countries': [ 'US' ],
            'rateLimit': 400, // 10k calls per hour
            'version': 'v2',
            'userAgent': this.userAgents['chrome'],
            'headers': {
                'CB-VERSION': '2018-05-30',
            },
            'has': {
                'CORS': true,
                'cancelOrder': false,
                'createDepositAddress': false,
                'createOrder': false,
                'deposit': false,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': false,
                'fetchMarkets': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': false,
                'fetchOrders': false,
                'fetchTicker': true,
                'fetchTickers': false,
                'fetchBidsAsks': false,
                'fetchTrades': false,
                'withdraw': false,
                'fetchTransactions': false,
                'fetchDeposits': true,
                'fetchWithdrawals': true,
                'fetchMySells': true,
                'fetchMyBuys': true,
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/40811661-b6eceae2-653a-11e8-829e-10bfadb078cf.jpg',
                'api': 'https://api.coinbase.com',
                'www': 'https://www.coinbase.com',
                'doc': 'https://developers.coinbase.com/api/v2',
                'fees': 'https://support.coinbase.com/customer/portal/articles/2109597-buy-sell-bank-transfer-fees',
                'referral': 'https://www.coinbase.com/join/58cbe25a355148797479dbd2',
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
                        'prices/{symbol}/buy',
                        'prices/{symbol}/sell',
                        'prices/{symbol}/spot',
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
            'options': {
                'accounts': [
                    'wallet',
                    'fiat',
                    // 'vault',
                ],
            },
        });
    }

    async fetchTime () {
        let response = await this.publicGetTime ();
        let data = response['data'];
        return this.parse8601 (data['iso']);
    }

    async loadAccounts (reload = false) {
        if (reload) {
            this.accounts = await this.fetchAccounts ();
        } else {
            if (this.accounts) {
                return this.accounts;
            } else {
                this.accounts = await this.fetchAccounts ();
                this.accountsById = this.indexBy (this.accounts, 'id');
            }
        }
        return this.accounts;
    }

    async fetchAccounts () {
        await this.loadMarkets ();
        let response = await this.privateGetAccounts ();
        return response['data'];
    }

    async fetchMySells (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // they don't have an endpoint for all historical trades
        const accountId = this.safeString2 (params, 'account_id', 'accountId');
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires an account_id or accountId extra parameter, use fetchAccounts or loadAccounts to get ids of all your accounts.');
        }
        await this.loadMarkets ();
        const query = this.omit (params, [ 'account_id', 'accountId' ]);
        const sells = await this.privateGetAccountsAccountIdSells (this.extend ({
            'account_id': accountId,
        }, query));
        return this.parseTrades (sells['data'], undefined, since, limit);
    }

    async fetchMyBuys (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // they don't have an endpoint for all historical trades
        const accountId = this.safeString2 (params, 'account_id', 'accountId');
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires an account_id or accountId extra parameter, use fetchAccounts or loadAccounts to get ids of all your accounts.');
        }
        await this.loadMarkets ();
        const query = this.omit (params, [ 'account_id', 'accountId' ]);
        const buys = await this.privateGetAccountsAccountIdBuys (this.extend ({
            'account_id': accountId,
        }, query));
        return this.parseTrades (buys['data'], undefined, since, limit);
    }

    async fetchTransactionsWithMethod (method, code = undefined, since = undefined, limit = undefined, params = {}) {
        const accountId = this.safeString2 (params, 'account_id', 'accountId');
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchTransactionsWithMethod requires an account_id or accountId extra parameter, use fetchAccounts or loadAccounts to get ids of all your accounts.');
        }
        await this.loadMarkets ();
        const query = this.omit (params, [ 'account_id', 'accountId' ]);
        const response = await this[method] (this.extend ({
            'account_id': accountId,
        }, query));
        return this.parseTransactions (response['data'], undefined, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsWithMethod ('privateGetAccountsAccountIdWithdrawals', code, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchTransactionsWithMethod ('privateGetAccountsAccountIdDeposits', code, since, limit, params);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'created': 'pending',
            'completed': 'ok',
            'canceled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseTransaction (transaction, market = undefined) {
        //
        //    DEPOSIT
        //        id: '406176b1-92cf-598f-ab6e-7d87e4a6cac1',
        //        status: 'completed',
        //        payment_method: [Object],
        //        transaction: [Object],
        //        user_reference: 'JQKBN85B',
        //        created_at: '2018-10-01T14:58:21Z',
        //        updated_at: '2018-10-01T17:57:27Z',
        //        resource: 'deposit',
        //        resource_path: '/v2/accounts/7702be4f-de96-5f08-b13b-32377c449ecf/deposits/406176b1-92cf-598f-ab6e-7d87e4a6cac1',
        //        committed: true,
        //        payout_at: '2018-10-01T14:58:34Z',
        //        instant: true,
        //        fee: [Object],
        //        amount: [Object],
        //        subtotal: [Object],
        //        hold_until: '2018-10-04T07:00:00Z',
        //        hold_days: 3
        //
        //    WITHDRAWAL
        //       {
        //           "id": "67e0eaec-07d7-54c4-a72c-2e92826897df",
        //           "status": "completed",
        //           "payment_method": {
        //             "id": "83562370-3e5c-51db-87da-752af5ab9559",
        //             "resource": "payment_method",
        //             "resource_path": "/v2/payment-methods/83562370-3e5c-51db-87da-752af5ab9559"
        //           },
        //           "transaction": {
        //             "id": "441b9494-b3f0-5b98-b9b0-4d82c21c252a",
        //             "resource": "transaction",
        //             "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/transactions/441b9494-b3f0-5b98-b9b0-4d82c21c252a"
        //           },
        //           "amount": {
        //             "amount": "10.00",
        //             "currency": "USD"
        //           },
        //           "subtotal": {
        //             "amount": "10.00",
        //             "currency": "USD"
        //           },
        //           "created_at": "2015-01-31T20:49:02Z",
        //           "updated_at": "2015-02-11T16:54:02-08:00",
        //           "resource": "withdrawal",
        //           "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/withdrawals/67e0eaec-07d7-54c4-a72c-2e92826897df",
        //           "committed": true,
        //           "fee": {
        //             "amount": "0.00",
        //             "currency": "USD"
        //           },
        //           "payout_at": "2015-02-18T16:54:00-08:00"
        //         }
        let amountObject = this.safeValue (transaction, 'amount', {});
        let feeObject = this.safeValue (transaction, 'fee', {});
        let id = this.safeString (transaction, 'id');
        let timestamp = this.parse8601 (this.safeValue (transaction, 'created_at'));
        let updated = this.parse8601 (this.safeValue (transaction, 'updated_at'));
        let orderId = undefined;
        let type = this.safeString (transaction, 'resource');
        let amount = this.safeFloat (amountObject, 'amount');
        let currencyId = this.safeString (amountObject, 'currency');
        let currency = this.commonCurrencyCode (currencyId);
        let feeCost = this.safeFloat (feeObject, 'amount');
        let feeCurrencyId = this.safeString (feeObject, 'currency');
        let feeCurrency = this.commonCurrencyCode (feeCurrencyId);
        let fee = {
            'cost': feeCost,
            'currency': feeCurrency,
        };
        let status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        if (status === undefined) {
            let committed = this.safeValue (transaction, 'committed');
            status = committed ? 'ok' : 'pending';
        }
        return {
            'info': transaction,
            'id': id,
            'txid': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'address': undefined,
            'tag': undefined,
            'type': type,
            'amount': amount,
            'currency': currency,
            'status': status,
            'updated': updated,
            'fee': fee,
        };
    }

    parseTrade (trade, market = undefined) {
        //
        //     {
        //       "id": "67e0eaec-07d7-54c4-a72c-2e92826897df",
        //       "status": "completed",
        //       "payment_method": {
        //         "id": "83562370-3e5c-51db-87da-752af5ab9559",
        //         "resource": "payment_method",
        //         "resource_path": "/v2/payment-methods/83562370-3e5c-51db-87da-752af5ab9559"
        //       },
        //       "transaction": {
        //         "id": "441b9494-b3f0-5b98-b9b0-4d82c21c252a",
        //         "resource": "transaction",
        //         "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/transactions/441b9494-b3f0-5b98-b9b0-4d82c21c252a"
        //       },
        //       "amount": {
        //         "amount": "1.00000000",
        //         "currency": "BTC"
        //       },
        //       "total": {
        //         "amount": "10.25",
        //         "currency": "USD"
        //       },
        //       "subtotal": {
        //         "amount": "10.10",
        //         "currency": "USD"
        //       },
        //       "created_at": "2015-01-31T20:49:02Z",
        //       "updated_at": "2015-02-11T16:54:02-08:00",
        //       "resource": "buy",
        //       "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/buys/67e0eaec-07d7-54c4-a72c-2e92826897df",
        //       "committed": true,
        //       "instant": false,
        //       "fee": {
        //         "amount": "0.15",
        //         "currency": "USD"
        //       },
        //       "payout_at": "2015-02-18T16:54:00-08:00"
        //     }
        //
        let symbol = undefined;
        let totalObject = this.safeValue (trade, 'total', {});
        let amountObject = this.safeValue (trade, 'amount', {});
        let subtotalObject = this.safeValue (trade, 'subtotal', {});
        let feeObject = this.safeValue (trade, 'fee', {});
        let id = this.safeString (trade, 'id');
        let timestamp = this.parse8601 (this.safeValue (trade, 'created_at'));
        if (market === undefined) {
            let baseId = this.safeString (totalObject, 'currency');
            let quoteId = this.safeString (amountObject, 'currency');
            if ((baseId !== undefined) && (quoteId !== undefined)) {
                let base = this.commonCurrencyCode (baseId);
                let quote = this.commonCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        let orderId = undefined;
        let side = this.safeString (trade, 'resource');
        let type = undefined;
        let cost = this.safeFloat (subtotalObject, 'amount');
        let amount = this.safeFloat (amountObject, 'amount');
        let price = undefined;
        if (cost !== undefined) {
            if (amount !== undefined) {
                price = cost / amount;
            }
        }
        let feeCost = this.safeFloat (feeObject, 'amount');
        let feeCurrencyId = this.safeString (feeObject, 'currency');
        let feeCurrency = this.commonCurrencyCode (feeCurrencyId);
        let fee = {
            'cost': feeCost,
            'currency': feeCurrency,
        };
        return {
            'info': trade,
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchCurrencies (params = {}) {
        let response = await this.publicGetCurrencies (params);
        let currencies = response['data'];
        let result = {};
        for (let c = 0; c < currencies.length; c++) {
            let currency = currencies[c];
            let id = currency['id'];
            let name = currency['name'];
            let code = this.commonCurrencyCode (id);
            let minimum = this.safeFloat (currency, 'min_size');
            result[code] = {
                'id': id,
                'code': code,
                'info': currency, // the original payload
                'name': name,
                'active': true,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': minimum,
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        let timestamp = this.seconds ();
        let market = this.market (symbol);
        let request = this.extend ({
            'symbol': market['id'],
        }, params);
        let buy = await this.publicGetPricesSymbolBuy (request);
        let sell = await this.publicGetPricesSymbolSell (request);
        let spot = await this.publicGetPricesSymbolSpot (request);
        let ask = this.safeFloat (buy['data'], 'amount');
        let bid = this.safeFloat (sell['data'], 'amount');
        let last = this.safeFloat (spot['data'], 'amount');
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'bid': bid,
            'ask': ask,
            'last': last,
            'high': undefined,
            'low': undefined,
            'bidVolume': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': {
                'buy': buy,
                'sell': sell,
                'spot': spot,
            },
        };
    }

    async fetchBalance (params = {}) {
        let response = await this.privateGetAccounts ();
        let balances = response['data'];
        let accounts = this.safeValue (params, 'type', this.options['accounts']);
        let result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            let balance = balances[b];
            if (this.inArray (balance['type'], accounts)) {
                let currencyId = balance['balance']['currency'];
                let code = currencyId;
                if (currencyId in this.currencies_by_id)
                    code = this.currencies_by_id[currencyId]['code'];
                let total = this.safeFloat (balance['balance'], 'amount');
                let free = total;
                let used = undefined;
                if (code in result) {
                    result[code]['free'] += total;
                    result[code]['total'] += total;
                } else {
                    let account = {
                        'free': free,
                        'used': used,
                        'total': total,
                    };
                    result[code] = account;
                }
            }
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
            let signature = this.hmac (this.encode (what), this.encode (this.secret));
            headers = {
                'CB-ACCESS-KEY': this.apiKey,
                'CB-ACCESS-SIGN': signature,
                'CB-ACCESS-TIMESTAMP': nonce,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response) {
        if (typeof body !== 'string')
            return; // fallback to default error handler
        if (body.length < 2)
            return; // fallback to default error handler
        if ((body[0] === '{') || (body[0] === '[')) {
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
            if (errorCode !== undefined) {
                if (errorCode in exceptions) {
                    throw new exceptions[errorCode] (feedback);
                } else {
                    throw new ExchangeError (feedback);
                }
            }
            let errors = this.safeValue (response, 'errors');
            if (errors !== undefined) {
                if (Array.isArray (errors)) {
                    let numErrors = errors.length;
                    if (numErrors > 0) {
                        errorCode = this.safeString (errors[0], 'id');
                        if (errorCode !== undefined) {
                            if (errorCode in exceptions) {
                                throw new exceptions[errorCode] (feedback);
                            } else {
                                throw new ExchangeError (feedback);
                            }
                        }
                    }
                }
            }
            let data = this.safeValue (response, 'data');
            if (data === undefined)
                throw new ExchangeError (this.id + ' failed due to a malformed response ' + this.json (response));
        }
    }
};

