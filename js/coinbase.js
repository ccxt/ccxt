'use strict';

// ----------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, ArgumentsRequired, AuthenticationError, RateLimitExceeded, InvalidNonce } = require ('./base/errors');
const Precise = require ('./base/Precise');

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
                'cancelOrder': undefined,
                'CORS': true,
                'createDepositAddress': true,
                'createOrder': undefined,
                'deposit': undefined,
                'fetchAccounts': true,
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchBorrowRate': false,
                'fetchBorrowRates': false,
                'fetchClosedOrders': undefined,
                'fetchCurrencies': true,
                'fetchDepositAddress': undefined,
                'fetchDeposits': true,
                'fetchIndexOHLCV': false,
                'fetchL2OrderBook': false,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyBuys': true,
                'fetchMySells': true,
                'fetchMyTrades': undefined,
                'fetchOHLCV': false,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': false,
                'fetchOrders': undefined,
                'fetchPremiumIndexOHLCV': false,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': undefined,
                'fetchTransactions': undefined,
                'fetchWithdrawals': true,
                'withdraw': undefined,
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
                'exact': {
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
                    'invalid_authentication_method': AuthenticationError, // 401 API access is blocked for deleted users.
                    'invalid_token': AuthenticationError, // 401 Invalid Oauth token
                    'revoked_token': AuthenticationError, // 401 Revoked Oauth token
                    'expired_token': AuthenticationError, // 401 Expired Oauth token
                    'invalid_scope': AuthenticationError, // 403 User hasn’t authenticated necessary scope
                    'not_found': ExchangeError, // 404 Resource not found
                    'rate_limit_exceeded': RateLimitExceeded, // 429 Rate limit exceeded
                    'internal_server_error': ExchangeError, // 500 Internal server error
                },
                'broad': {
                    'request timestamp expired': InvalidNonce, // {"errors":[{"id":"authentication_error","message":"request timestamp expired"}]}
                },
            },
            'commonCurrencies': {
                'CGLD': 'CELO',
            },
            'options': {
                'fetchCurrencies': {
                    'expires': 5000,
                },
                'accounts': [
                    'wallet',
                    'fiat',
                    // 'vault',
                ],
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     {
        //         "data": {
        //             "epoch": 1589295679,
        //             "iso": "2020-05-12T15:01:19Z"
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        return this.safeTimestamp (data, 'epoch');
    }

    async fetchAccounts (params = {}) {
        await this.loadMarkets ();
        const request = {
            'limit': 100,
        };
        const response = await this.privateGetAccounts (this.extend (request, params));
        //
        //     {
        //         "id": "XLM",
        //         "name": "XLM Wallet",
        //         "primary": false,
        //         "type": "wallet",
        //         "currency": {
        //             "code": "XLM",
        //             "name": "Stellar Lumens",
        //             "color": "#000000",
        //             "sort_index": 127,
        //             "exponent": 7,
        //             "type": "crypto",
        //             "address_regex": "^G[A-Z2-7]{55}$",
        //             "asset_id": "13b83335-5ede-595b-821e-5bcdfa80560f",
        //             "destination_tag_name": "XLM Memo ID",
        //             "destination_tag_regex": "^[ -~]{1,28}$"
        //         },
        //         "balance": {
        //             "amount": "0.0000000",
        //             "currency": "XLM"
        //         },
        //         "created_at": null,
        //         "updated_at": null,
        //         "resource": "account",
        //         "resource_path": "/v2/accounts/XLM",
        //         "allow_deposits": true,
        //         "allow_withdrawals": true
        //     }
        //
        const data = this.safeValue (response, 'data', []);
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const account = data[i];
            const currency = this.safeValue (account, 'currency', {});
            const currencyId = this.safeString (currency, 'code');
            const code = this.safeCurrencyCode (currencyId);
            result.push ({
                'id': this.safeString (account, 'id'),
                'type': this.safeString (account, 'type'),
                'code': code,
                'info': account,
            });
        }
        return result;
    }

    async createDepositAddress (code, params = {}) {
        let accountId = this.safeString (params, 'account_id');
        params = this.omit (params, 'account_id');
        if (accountId === undefined) {
            await this.loadAccounts ();
            for (let i = 0; i < this.accounts.length; i++) {
                const account = this.accounts[i];
                if (account['code'] === code && account['type'] === 'wallet') {
                    accountId = account['id'];
                    break;
                }
            }
        }
        if (accountId === undefined) {
            throw new ExchangeError (this.id + ' createDepositAddress could not find the account with matching currency code, specify an `account_id` extra param');
        }
        const request = {
            'account_id': accountId,
        };
        const response = await this.privatePostAccountsAccountIdAddresses (this.extend (request, params));
        //
        //     {
        //         "data": {
        //             "id": "05b1ebbf-9438-5dd4-b297-2ddedc98d0e4",
        //             "address": "coinbasebase",
        //             "address_info": {
        //                 "address": "coinbasebase",
        //                 "destination_tag": "287594668"
        //             },
        //             "name": null,
        //             "created_at": "2019-07-01T14:39:29Z",
        //             "updated_at": "2019-07-01T14:39:29Z",
        //             "network": "eosio",
        //             "uri_scheme": "eosio",
        //             "resource": "address",
        //             "resource_path": "/v2/accounts/14cfc769-e852-52f3-b831-711c104d194c/addresses/05b1ebbf-9438-5dd4-b297-2ddedc98d0e4",
        //             "warnings": [
        //                 {
        //                     "title": "Only send EOS (EOS) to this address",
        //                     "details": "Sending any other cryptocurrency will result in permanent loss.",
        //                     "image_url": "https://dynamic-assets.coinbase.com/deaca3d47b10ed4a91a872e9618706eec34081127762d88f2476ac8e99ada4b48525a9565cf2206d18c04053f278f693434af4d4629ca084a9d01b7a286a7e26/asset_icons/1f8489bb280fb0a0fd643c1161312ba49655040e9aaaced5f9ad3eeaf868eadc.png"
        //                 },
        //                 {
        //                     "title": "Both an address and EOS memo are required to receive EOS",
        //                     "details": "If you send funds without an EOS memo or with an incorrect EOS memo, your funds cannot be credited to your account.",
        //                     "image_url": "https://www.coinbase.com/assets/receive-warning-2f3269d83547a7748fb39d6e0c1c393aee26669bfea6b9f12718094a1abff155.png"
        //                 }
        //             ],
        //             "warning_title": "Only send EOS (EOS) to this address",
        //             "warning_details": "Sending any other cryptocurrency will result in permanent loss.",
        //             "destination_tag": "287594668",
        //             "deposit_uri": "eosio:coinbasebase?dt=287594668",
        //             "callback_url": null
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const tag = this.safeString (data, 'destination_tag');
        const address = this.safeString (data, 'address');
        return {
            'currency': code,
            'tag': tag,
            'address': address,
            'info': response,
        };
    }

    async fetchMySells (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // they don't have an endpoint for all historical trades
        const request = await this.prepareAccountRequest (limit, params);
        await this.loadMarkets ();
        const query = this.omit (params, [ 'account_id', 'accountId' ]);
        const sells = await this.privateGetAccountsAccountIdSells (this.extend (request, query));
        return this.parseTrades (sells['data'], undefined, since, limit);
    }

    async fetchMyBuys (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // they don't have an endpoint for all historical trades
        const request = await this.prepareAccountRequest (limit, params);
        await this.loadMarkets ();
        const query = this.omit (params, [ 'account_id', 'accountId' ]);
        const buys = await this.privateGetAccountsAccountIdBuys (this.extend (request, query));
        return this.parseTrades (buys['data'], undefined, since, limit);
    }

    async fetchTransactionsWithMethod (method, code = undefined, since = undefined, limit = undefined, params = {}) {
        const request = await this.prepareAccountRequestWithCurrencyCode (code, limit, params);
        await this.loadMarkets ();
        const query = this.omit (params, [ 'account_id', 'accountId' ]);
        const response = await this[method] (this.extend (request, query));
        return this.parseTransactions (response['data'], undefined, since, limit);
    }

    async fetchWithdrawals (code = undefined, since = undefined, limit = undefined, params = {}) {
        // fiat only, for crypto transactions use fetchLedger
        return await this.fetchTransactionsWithMethod ('privateGetAccountsAccountIdWithdrawals', code, since, limit, params);
    }

    async fetchDeposits (code = undefined, since = undefined, limit = undefined, params = {}) {
        // fiat only, for crypto transactions use fetchLedger
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
        // fiat deposit
        //
        //     {
        //         "id": "f34c19f3-b730-5e3d-9f72",
        //         "status": "completed",
        //         "payment_method": {
        //             "id": "a022b31d-f9c7-5043-98f2",
        //             "resource": "payment_method",
        //             "resource_path": "/v2/payment-methods/a022b31d-f9c7-5043-98f2"
        //         },
        //         "transaction": {
        //             "id": "04ed4113-3732-5b0c-af86-b1d2146977d0",
        //             "resource": "transaction",
        //             "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/transactions/04ed4113-3732-5b0c-af86"
        //         },
        //         "user_reference": "2VTYTH",
        //         "created_at": "2017-02-09T07:01:18Z",
        //         "updated_at": "2017-02-09T07:01:26Z",
        //         "resource": "deposit",
        //         "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/deposits/f34c19f3-b730-5e3d-9f72",
        //         "committed": true,
        //         "payout_at": "2017-02-12T07:01:17Z",
        //         "instant": false,
        //         "fee": { "amount": "0.00", "currency": "EUR" },
        //         "amount": { "amount": "114.02", "currency": "EUR" },
        //         "subtotal": { "amount": "114.02", "currency": "EUR" },
        //         "hold_until": null,
        //         "hold_days": 0,
        //         "hold_business_days": 0,
        //         "next_step": null
        //     }
        //
        // fiat_withdrawal
        //
        //     {
        //         "id": "cfcc3b4a-eeb6-5e8c-8058",
        //         "status": "completed",
        //         "payment_method": {
        //             "id": "8b94cfa4-f7fd-5a12-a76a",
        //             "resource": "payment_method",
        //             "resource_path": "/v2/payment-methods/8b94cfa4-f7fd-5a12-a76a"
        //         },
        //         "transaction": {
        //             "id": "fcc2550b-5104-5f83-a444",
        //             "resource": "transaction",
        //             "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/transactions/fcc2550b-5104-5f83-a444"
        //         },
        //         "user_reference": "MEUGK",
        //         "created_at": "2018-07-26T08:55:12Z",
        //         "updated_at": "2018-07-26T08:58:18Z",
        //         "resource": "withdrawal",
        //         "resource_path": "/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/withdrawals/cfcc3b4a-eeb6-5e8c-8058",
        //         "committed": true,
        //         "payout_at": "2018-07-31T08:55:12Z",
        //         "instant": false,
        //         "fee": { "amount": "0.15", "currency": "EUR" },
        //         "amount": { "amount": "13130.69", "currency": "EUR" },
        //         "subtotal": { "amount": "13130.84", "currency": "EUR" },
        //         "idem": "e549dee5-63ed-4e79-8a96",
        //         "next_step": null
        //     }
        //
        const subtotalObject = this.safeValue (transaction, 'subtotal', {});
        const feeObject = this.safeValue (transaction, 'fee', {});
        const id = this.safeString (transaction, 'id');
        const timestamp = this.parse8601 (this.safeValue (transaction, 'created_at'));
        const updated = this.parse8601 (this.safeValue (transaction, 'updated_at'));
        const type = this.safeString (transaction, 'resource');
        const amount = this.safeNumber (subtotalObject, 'amount');
        const currencyId = this.safeString (subtotalObject, 'currency');
        const currency = this.safeCurrencyCode (currencyId);
        const feeCost = this.safeNumber (feeObject, 'amount');
        const feeCurrencyId = this.safeString (feeObject, 'currency');
        const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        const fee = {
            'cost': feeCost,
            'currency': feeCurrency,
        };
        let status = this.parseTransactionStatus (this.safeString (transaction, 'status'));
        if (status === undefined) {
            const committed = this.safeValue (transaction, 'committed');
            status = committed ? 'ok' : 'pending';
        }
        return {
            'info': transaction,
            'id': id,
            'txid': id,
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
        //         "id": "67e0eaec-07d7-54c4-a72c-2e92826897df",
        //         "status": "completed",
        //         "payment_method": {
        //             "id": "83562370-3e5c-51db-87da-752af5ab9559",
        //             "resource": "payment_method",
        //             "resource_path": "/v2/payment-methods/83562370-3e5c-51db-87da-752af5ab9559"
        //         },
        //         "transaction": {
        //             "id": "441b9494-b3f0-5b98-b9b0-4d82c21c252a",
        //             "resource": "transaction",
        //             "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/transactions/441b9494-b3f0-5b98-b9b0-4d82c21c252a"
        //         },
        //         "amount": { "amount": "1.00000000", "currency": "BTC" },
        //         "total": { "amount": "10.25", "currency": "USD" },
        //         "subtotal": { "amount": "10.10", "currency": "USD" },
        //         "created_at": "2015-01-31T20:49:02Z",
        //         "updated_at": "2015-02-11T16:54:02-08:00",
        //         "resource": "buy",
        //         "resource_path": "/v2/accounts/2bbf394c-193b-5b2a-9155-3b4732659ede/buys/67e0eaec-07d7-54c4-a72c-2e92826897df",
        //         "committed": true,
        //         "instant": false,
        //         "fee": { "amount": "0.15", "currency": "USD" },
        //         "payout_at": "2015-02-18T16:54:00-08:00"
        //     }
        //
        let symbol = undefined;
        const totalObject = this.safeValue (trade, 'total', {});
        const amountObject = this.safeValue (trade, 'amount', {});
        const subtotalObject = this.safeValue (trade, 'subtotal', {});
        const feeObject = this.safeValue (trade, 'fee', {});
        const id = this.safeString (trade, 'id');
        const timestamp = this.parse8601 (this.safeValue (trade, 'created_at'));
        if (market === undefined) {
            const baseId = this.safeString (amountObject, 'currency');
            const quoteId = this.safeString (totalObject, 'currency');
            if ((baseId !== undefined) && (quoteId !== undefined)) {
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        const orderId = undefined;
        const side = this.safeString (trade, 'resource');
        const type = undefined;
        const costString = this.safeString (subtotalObject, 'amount');
        const amountString = this.safeString (amountObject, 'amount');
        const cost = this.parseNumber (costString);
        const amount = this.parseNumber (amountString);
        const price = this.parseNumber (Precise.stringDiv (costString, amountString));
        const feeCost = this.safeNumber (feeObject, 'amount');
        const feeCurrencyId = this.safeString (feeObject, 'currency');
        const feeCurrency = this.safeCurrencyCode (feeCurrencyId);
        const fee = {
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
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': fee,
        };
    }

    async fetchMarkets (params = {}) {
        const response = await this.fetchCurrenciesFromCache (params);
        const currencies = this.safeValue (response, 'currencies', {});
        const exchangeRates = this.safeValue (response, 'exchangeRates', {});
        const data = this.safeValue (currencies, 'data', []);
        const dataById = this.indexBy (data, 'id');
        const rates = this.safeValue (this.safeValue (exchangeRates, 'data', {}), 'rates', {});
        const baseIds = Object.keys (rates);
        const result = [];
        for (let i = 0; i < baseIds.length; i++) {
            const baseId = baseIds[i];
            const base = this.safeCurrencyCode (baseId);
            const type = (baseId in dataById) ? 'fiat' : 'crypto';
            // https://github.com/ccxt/ccxt/issues/6066
            if (type === 'crypto') {
                for (let j = 0; j < data.length; j++) {
                    const quoteCurrency = data[j];
                    const quoteId = this.safeString (quoteCurrency, 'id');
                    const quote = this.safeCurrencyCode (quoteId);
                    const symbol = base + '/' + quote;
                    const id = baseId + '-' + quoteId;
                    result.push ({
                        'id': id,
                        'symbol': symbol,
                        'base': base,
                        'quote': quote,
                        'baseId': baseId,
                        'quoteId': quoteId,
                        'type': 'spot',
                        'spot': true,
                        'active': undefined,
                        'info': quoteCurrency,
                        'precision': {
                            'amount': undefined,
                            'price': undefined,
                        },
                        'limits': {
                            'amount': {
                                'min': undefined,
                                'max': undefined,
                            },
                            'price': {
                                'min': undefined,
                                'max': undefined,
                            },
                            'cost': {
                                'min': this.safeNumber (quoteCurrency, 'min_size'),
                                'max': undefined,
                            },
                            'leverage': {
                                'max': 1,
                            },
                        },
                    });
                }
            }
        }
        return result;
    }

    async fetchCurrenciesFromCache (params = {}) {
        const options = this.safeValue (this.options, 'fetchCurrencies', {});
        const timestamp = this.safeInteger (options, 'timestamp');
        const expires = this.safeInteger (options, 'expires', 1000);
        const now = this.milliseconds ();
        if ((timestamp === undefined) || ((now - timestamp) > expires)) {
            const currencies = await this.publicGetCurrencies (params);
            const exchangeRates = await this.publicGetExchangeRates (params);
            this.options['fetchCurrencies'] = this.extend (options, {
                'currencies': currencies,
                'exchangeRates': exchangeRates,
                'timestamp': now,
            });
        }
        return this.safeValue (this.options, 'fetchCurrencies', {});
    }

    async fetchCurrencies (params = {}) {
        const response = await this.fetchCurrenciesFromCache (params);
        const currencies = this.safeValue (response, 'currencies', {});
        //
        //     {
        //         "data":[
        //             {"id":"AED","name":"United Arab Emirates Dirham","min_size":"0.01000000"},
        //             {"id":"AFN","name":"Afghan Afghani","min_size":"0.01000000"},
        //             {"id":"ALL","name":"Albanian Lek","min_size":"0.01000000"},
        //             {"id":"AMD","name":"Armenian Dram","min_size":"0.01000000"},
        //             {"id":"ANG","name":"Netherlands Antillean Gulden","min_size":"0.01000000"},
        //             // ...
        //         ],
        //     }
        //
        const exchangeRates = this.safeValue (response, 'exchangeRates', {});
        //
        //     {
        //         "data":{
        //             "currency":"USD",
        //             "rates":{
        //                 "AED":"3.67",
        //                 "AFN":"78.21",
        //                 "ALL":"110.42",
        //                 "AMD":"474.18",
        //                 "ANG":"1.75",
        //                 // ...
        //             },
        //         }
        //     }
        //
        const data = this.safeValue (currencies, 'data', []);
        const dataById = this.indexBy (data, 'id');
        const rates = this.safeValue (this.safeValue (exchangeRates, 'data', {}), 'rates', {});
        const keys = Object.keys (rates);
        const result = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const type = (key in dataById) ? 'fiat' : 'crypto';
            const currency = this.safeValue (dataById, key, {});
            const id = this.safeString (currency, 'id', key);
            const name = this.safeString (currency, 'name');
            const code = this.safeCurrencyCode (id);
            result[code] = {
                'id': id,
                'code': code,
                'info': currency, // the original payload
                'type': type,
                'name': name,
                'active': true,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': {
                        'min': this.safeNumber (currency, 'min_size'),
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

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'currency': 'USD',
        };
        const response = await this.publicGetExchangeRates (this.extend (request, params));
        //
        //     {
        //         "data":{
        //             "currency":"USD",
        //             "rates":{
        //                 "AED":"3.6731",
        //                 "AFN":"103.163942",
        //                 "ALL":"106.973038",
        //             }
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const rates = this.safeValue (data, 'rates', {});
        const quoteId = this.safeString (data, 'currency');
        const result = {};
        const baseIds = Object.keys (rates);
        const delimiter = '-';
        for (let i = 0; i < baseIds.length; i++) {
            const baseId = baseIds[i];
            const marketId = baseId + delimiter + quoteId;
            const market = this.safeMarket (marketId, undefined, delimiter);
            const symbol = market['symbol'];
            result[symbol] = this.parseTicker (rates[baseId], market);
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = this.extend ({
            'symbol': market['id'],
        }, params);
        const spot = await this.publicGetPricesSymbolSpot (request);
        //
        //     {"data":{"base":"BTC","currency":"USD","amount":"48691.23"}}
        //
        const buy = await this.publicGetPricesSymbolBuy (request);
        //
        //     {"data":{"base":"BTC","currency":"USD","amount":"48691.23"}}
        //
        const sell = await this.publicGetPricesSymbolSell (request);
        //
        //     {"data":{"base":"BTC","currency":"USD","amount":"48691.23"}}
        //
        return this.parseTicker ([ spot, buy, sell ], market);
    }

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker
        //
        //     [
        //         "48691.23", // spot
        //         "48691.23", // buy
        //         "48691.23",  // sell
        //     ]
        //
        // fetchTickers
        //
        //     "48691.23"
        //
        const symbol = this.safeSymbol (undefined, market);
        let ask = undefined;
        let bid = undefined;
        let last = undefined;
        const timestamp = this.milliseconds ();
        if (typeof ticker === 'string') {
            const inverted = Precise.stringDiv ('1', ticker); // the currency requested, USD or other, is the base currency
            last = this.parseNumber (inverted);
        } else {
            const [ spot, buy, sell ] = ticker;
            const spotData = this.safeValue (spot, 'data', {});
            const buyData = this.safeValue (buy, 'data', {});
            const sellData = this.safeValue (sell, 'data', {});
            last = this.safeNumber (spotData, 'amount');
            bid = this.safeNumber (buyData, 'amount');
            ask = this.safeNumber (sellData, 'amount');
        }
        return this.safeTicker ({
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
            'close': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': undefined,
            'quoteVolume': undefined,
            'info': ticker,
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const request = {
            'limit': 100,
        };
        const response = await this.privateGetAccounts (this.extend (request, params));
        const balances = this.safeValue (response, 'data');
        const accounts = this.safeValue (params, 'type', this.options['accounts']);
        const result = { 'info': response };
        for (let b = 0; b < balances.length; b++) {
            const balance = balances[b];
            const type = this.safeString (balance, 'type');
            if (this.inArray (type, accounts)) {
                const value = this.safeValue (balance, 'balance');
                if (value !== undefined) {
                    const currencyId = this.safeString (value, 'currency');
                    const code = this.safeCurrencyCode (currencyId);
                    const total = this.safeString (value, 'amount');
                    const free = total;
                    let account = this.safeValue (result, code);
                    if (account === undefined) {
                        account = this.account ();
                        account['free'] = free;
                        account['total'] = total;
                    } else {
                        account['free'] = Precise.stringAdd (account['free'], total);
                        account['total'] = Precise.stringAdd (account['total'], total);
                    }
                    result[code] = account;
                }
            }
        }
        return this.parseBalance (result);
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
        }
        const request = await this.prepareAccountRequestWithCurrencyCode (code, limit, params);
        const query = this.omit (params, ['account_id', 'accountId']);
        // for pagination use parameter 'starting_after'
        // the value for the next page can be obtained from the result of the previous call in the 'pagination' field
        // eg: instance.last_json_response.pagination.next_starting_after
        const response = await this.privateGetAccountsAccountIdTransactions (this.extend (request, query));
        return this.parseLedger (response['data'], currency, since, limit);
    }

    parseLedgerEntryStatus (status) {
        const types = {
            'completed': 'ok',
        };
        return this.safeString (types, status, status);
    }

    parseLedgerEntryType (type) {
        const types = {
            'buy': 'trade',
            'sell': 'trade',
            'fiat_deposit': 'transaction',
            'fiat_withdrawal': 'transaction',
            'exchange_deposit': 'transaction', // fiat withdrawal (from coinbase to coinbasepro)
            'exchange_withdrawal': 'transaction', // fiat deposit (to coinbase from coinbasepro)
            'send': 'transaction', // crypto deposit OR withdrawal
            'pro_deposit': 'transaction', // crypto withdrawal (from coinbase to coinbasepro)
            'pro_withdrawal': 'transaction', // crypto deposit (to coinbase from coinbasepro)
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        // crypto deposit transaction
        //
        //     {
        //         id: '34e4816b-4c8c-5323-a01c-35a9fa26e490',
        //         type: 'send',
        //         status: 'completed',
        //         amount: { amount: '28.31976528', currency: 'BCH' },
        //         native_amount: { amount: '2799.65', currency: 'GBP' },
        //         description: null,
        //         created_at: '2019-02-28T12:35:20Z',
        //         updated_at: '2019-02-28T12:43:24Z',
        //         resource: 'transaction',
        //         resource_path: '/v2/accounts/c01d7364-edd7-5f3a-bd1d-de53d4cbb25e/transactions/34e4816b-4c8c-5323-a01c-35a9fa26e490',
        //         instant_exchange: false,
        //         network: {
        //             status: 'confirmed',
        //             hash: '56222d865dae83774fccb2efbd9829cf08c75c94ce135bfe4276f3fb46d49701',
        //             transaction_url: 'https://bch.btc.com/56222d865dae83774fccb2efbd9829cf08c75c94ce135bfe4276f3fb46d49701'
        //         },
        //         from: { resource: 'bitcoin_cash_network', currency: 'BCH' },
        //         details: { title: 'Received Bitcoin Cash', subtitle: 'From Bitcoin Cash address' }
        //     }
        //
        // crypto withdrawal transaction
        //
        //     {
        //         id: '459aad99-2c41-5698-ac71-b6b81a05196c',
        //         type: 'send',
        //         status: 'completed',
        //         amount: { amount: '-0.36775642', currency: 'BTC' },
        //         native_amount: { amount: '-1111.65', currency: 'GBP' },
        //         description: null,
        //         created_at: '2019-03-20T08:37:07Z',
        //         updated_at: '2019-03-20T08:49:33Z',
        //         resource: 'transaction',
        //         resource_path: '/v2/accounts/c6afbd34-4bd0-501e-8616-4862c193cd84/transactions/459aad99-2c41-5698-ac71-b6b81a05196c',
        //         instant_exchange: false,
        //         network: {
        //             status: 'confirmed',
        //             hash: '2732bbcf35c69217c47b36dce64933d103895277fe25738ffb9284092701e05b',
        //             transaction_url: 'https://blockchain.info/tx/2732bbcf35c69217c47b36dce64933d103895277fe25738ffb9284092701e05b',
        //             transaction_fee: { amount: '0.00000000', currency: 'BTC' },
        //             transaction_amount: { amount: '0.36775642', currency: 'BTC' },
        //             confirmations: 15682
        //         },
        //         to: {
        //             resource: 'bitcoin_address',
        //             address: '1AHnhqbvbYx3rnZx8uC7NbFZaTe4tafFHX',
        //             currency: 'BTC',
        //             address_info: { address: '1AHnhqbvbYx3rnZx8uC7NbFZaTe4tafFHX' }
        //         },
        //         idem: 'da0a2f14-a2af-4c5a-a37e-d4484caf582bsend',
        //         application: {
        //             id: '5756ab6e-836b-553b-8950-5e389451225d',
        //             resource: 'application',
        //             resource_path: '/v2/applications/5756ab6e-836b-553b-8950-5e389451225d'
        //         },
        //         details: { title: 'Sent Bitcoin', subtitle: 'To Bitcoin address' }
        //     }
        //
        // withdrawal transaction from coinbase to coinbasepro
        //
        //     {
        //         id: '5b1b9fb8-5007-5393-b923-02903b973fdc',
        //         type: 'pro_deposit',
        //         status: 'completed',
        //         amount: { amount: '-0.00001111', currency: 'BCH' },
        //         native_amount: { amount: '0.00', currency: 'GBP' },
        //         description: null,
        //         created_at: '2019-02-28T13:31:58Z',
        //         updated_at: '2019-02-28T13:31:58Z',
        //         resource: 'transaction',
        //         resource_path: '/v2/accounts/c01d7364-edd7-5f3a-bd1d-de53d4cbb25e/transactions/5b1b9fb8-5007-5393-b923-02903b973fdc',
        //         instant_exchange: false,
        //         application: {
        //             id: '5756ab6e-836b-553b-8950-5e389451225d',
        //             resource: 'application',
        //             resource_path: '/v2/applications/5756ab6e-836b-553b-8950-5e389451225d'
        //         },
        //         details: { title: 'Transferred Bitcoin Cash', subtitle: 'To Coinbase Pro' }
        //     }
        //
        // withdrawal transaction from coinbase to gdax
        //
        //     {
        //         id: 'badb7313-a9d3-5c07-abd0-00f8b44199b1',
        //         type: 'exchange_deposit',
        //         status: 'completed',
        //         amount: { amount: '-0.43704149', currency: 'BCH' },
        //         native_amount: { amount: '-51.90', currency: 'GBP' },
        //         description: null,
        //         created_at: '2019-03-19T10:30:40Z',
        //         updated_at: '2019-03-19T10:30:40Z',
        //         resource: 'transaction',
        //         resource_path: '/v2/accounts/c01d7364-edd7-5f3a-bd1d-de53d4cbb25e/transactions/badb7313-a9d3-5c07-abd0-00f8b44199b1',
        //         instant_exchange: false,
        //         details: { title: 'Transferred Bitcoin Cash', subtitle: 'To GDAX' }
        //     }
        //
        // deposit transaction from gdax to coinbase
        //
        //     {
        //         id: '9c4b642c-8688-58bf-8962-13cef64097de',
        //         type: 'exchange_withdrawal',
        //         status: 'completed',
        //         amount: { amount: '0.57729420', currency: 'BTC' },
        //         native_amount: { amount: '4418.72', currency: 'GBP' },
        //         description: null,
        //         created_at: '2018-02-17T11:33:33Z',
        //         updated_at: '2018-02-17T11:33:33Z',
        //         resource: 'transaction',
        //         resource_path: '/v2/accounts/c6afbd34-4bd0-501e-8616-4862c193cd84/transactions/9c4b642c-8688-58bf-8962-13cef64097de',
        //         instant_exchange: false,
        //         details: { title: 'Transferred Bitcoin', subtitle: 'From GDAX' }
        //     }
        //
        // deposit transaction from coinbasepro to coinbase
        //
        //     {
        //         id: '8d6dd0b9-3416-568a-889d-8f112fae9e81',
        //         type: 'pro_withdrawal',
        //         status: 'completed',
        //         amount: { amount: '0.40555386', currency: 'BTC' },
        //         native_amount: { amount: '1140.27', currency: 'GBP' },
        //         description: null,
        //         created_at: '2019-03-04T19:41:58Z',
        //         updated_at: '2019-03-04T19:41:58Z',
        //         resource: 'transaction',
        //         resource_path: '/v2/accounts/c6afbd34-4bd0-501e-8616-4862c193cd84/transactions/8d6dd0b9-3416-568a-889d-8f112fae9e81',
        //         instant_exchange: false,
        //         application: {
        //             id: '5756ab6e-836b-553b-8950-5e389451225d',
        //             resource: 'application',
        //             resource_path: '/v2/applications/5756ab6e-836b-553b-8950-5e389451225d'
        //         },
        //         details: { title: 'Transferred Bitcoin', subtitle: 'From Coinbase Pro' }
        //     }
        //
        // sell trade
        //
        //     {
        //         id: 'a9409207-df64-585b-97ab-a50780d2149e',
        //         type: 'sell',
        //         status: 'completed',
        //         amount: { amount: '-9.09922880', currency: 'BTC' },
        //         native_amount: { amount: '-7285.73', currency: 'GBP' },
        //         description: null,
        //         created_at: '2017-03-27T15:38:34Z',
        //         updated_at: '2017-03-27T15:38:34Z',
        //         resource: 'transaction',
        //         resource_path: '/v2/accounts/c6afbd34-4bd0-501e-8616-4862c193cd84/transactions/a9409207-df64-585b-97ab-a50780d2149e',
        //         instant_exchange: false,
        //         sell: {
        //             id: 'e3550b4d-8ae6-5de3-95fe-1fb01ba83051',
        //             resource: 'sell',
        //             resource_path: '/v2/accounts/c6afbd34-4bd0-501e-8616-4862c193cd84/sells/e3550b4d-8ae6-5de3-95fe-1fb01ba83051'
        //         },
        //         details: {
        //             title: 'Sold Bitcoin',
        //             subtitle: 'Using EUR Wallet',
        //             payment_method_name: 'EUR Wallet'
        //         }
        //     }
        //
        // buy trade
        //
        //     {
        //         id: '63eeed67-9396-5912-86e9-73c4f10fe147',
        //         type: 'buy',
        //         status: 'completed',
        //         amount: { amount: '2.39605772', currency: 'ETH' },
        //         native_amount: { amount: '98.31', currency: 'GBP' },
        //         description: null,
        //         created_at: '2017-03-27T09:07:56Z',
        //         updated_at: '2017-03-27T09:07:57Z',
        //         resource: 'transaction',
        //         resource_path: '/v2/accounts/8902f85d-4a69-5d74-82fe-8e390201bda7/transactions/63eeed67-9396-5912-86e9-73c4f10fe147',
        //         instant_exchange: false,
        //         buy: {
        //             id: '20b25b36-76c6-5353-aa57-b06a29a39d82',
        //             resource: 'buy',
        //             resource_path: '/v2/accounts/8902f85d-4a69-5d74-82fe-8e390201bda7/buys/20b25b36-76c6-5353-aa57-b06a29a39d82'
        //         },
        //         details: {
        //             title: 'Bought Ethereum',
        //             subtitle: 'Using EUR Wallet',
        //             payment_method_name: 'EUR Wallet'
        //         }
        //     }
        //
        // fiat deposit transaction
        //
        //     {
        //         id: '04ed4113-3732-5b0c-af86-b1d2146977d0',
        //         type: 'fiat_deposit',
        //         status: 'completed',
        //         amount: { amount: '114.02', currency: 'EUR' },
        //         native_amount: { amount: '97.23', currency: 'GBP' },
        //         description: null,
        //         created_at: '2017-02-09T07:01:21Z',
        //         updated_at: '2017-02-09T07:01:22Z',
        //         resource: 'transaction',
        //         resource_path: '/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/transactions/04ed4113-3732-5b0c-af86-b1d2146977d0',
        //         instant_exchange: false,
        //         fiat_deposit: {
        //             id: 'f34c19f3-b730-5e3d-9f72-96520448677a',
        //             resource: 'fiat_deposit',
        //             resource_path: '/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/deposits/f34c19f3-b730-5e3d-9f72-96520448677a'
        //         },
        //         details: {
        //             title: 'Deposited funds',
        //             subtitle: 'From SEPA Transfer (GB47 BARC 20..., reference CBADVI)',
        //             payment_method_name: 'SEPA Transfer (GB47 BARC 20..., reference CBADVI)'
        //         }
        //     }
        //
        // fiat withdrawal transaction
        //
        //     {
        //         id: '957d98e2-f80e-5e2f-a28e-02945aa93079',
        //         type: 'fiat_withdrawal',
        //         status: 'completed',
        //         amount: { amount: '-11000.00', currency: 'EUR' },
        //         native_amount: { amount: '-9698.22', currency: 'GBP' },
        //         description: null,
        //         created_at: '2017-12-06T13:19:19Z',
        //         updated_at: '2017-12-06T13:19:19Z',
        //         resource: 'transaction',
        //         resource_path: '/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/transactions/957d98e2-f80e-5e2f-a28e-02945aa93079',
        //         instant_exchange: false,
        //         fiat_withdrawal: {
        //             id: 'f4bf1fd9-ab3b-5de7-906d-ed3e23f7a4e7',
        //             resource: 'fiat_withdrawal',
        //             resource_path: '/v2/accounts/91cd2d36-3a91-55b6-a5d4-0124cf105483/withdrawals/f4bf1fd9-ab3b-5de7-906d-ed3e23f7a4e7'
        //         },
        //         details: {
        //             title: 'Withdrew funds',
        //             subtitle: 'To HSBC BANK PLC (GB74 MIDL...)',
        //             payment_method_name: 'HSBC BANK PLC (GB74 MIDL...)'
        //         }
        //     }
        //
        const amountInfo = this.safeValue (item, 'amount', {});
        let amount = this.safeNumber (amountInfo, 'amount');
        let direction = undefined;
        if (amount < 0) {
            direction = 'out';
            amount = -amount;
        } else {
            direction = 'in';
        }
        const currencyId = this.safeString (amountInfo, 'currency');
        const code = this.safeCurrencyCode (currencyId, currency);
        //
        // the address and txid do not belong to the unified ledger structure
        //
        //     let address = undefined;
        //     if (item['to']) {
        //         address = this.safeString (item['to'], 'address');
        //     }
        //     let txid = undefined;
        //
        let fee = undefined;
        const networkInfo = this.safeValue (item, 'network', {});
        // txid = network['hash']; // txid does not belong to the unified ledger structure
        const feeInfo = this.safeValue (networkInfo, 'transaction_fee');
        if (feeInfo !== undefined) {
            const feeCurrencyId = this.safeString (feeInfo, 'currency');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId, currency);
            const feeAmount = this.safeNumber (feeInfo, 'amount');
            fee = {
                'cost': feeAmount,
                'currency': feeCurrencyCode,
            };
        }
        const timestamp = this.parse8601 (this.safeValue (item, 'created_at'));
        const id = this.safeString (item, 'id');
        const type = this.parseLedgerEntryType (this.safeString (item, 'type'));
        const status = this.parseLedgerEntryStatus (this.safeString (item, 'status'));
        const path = this.safeString (item, 'resource_path');
        let accountId = undefined;
        if (path !== undefined) {
            const parts = path.split ('/');
            const numParts = parts.length;
            if (numParts > 3) {
                accountId = parts[3];
            }
        }
        return {
            'info': item,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'direction': direction,
            'account': accountId,
            'referenceId': undefined,
            'referenceAccount': undefined,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': undefined,
            'after': undefined,
            'status': status,
            'fee': fee,
        };
    }

    async findAccountId (code) {
        await this.loadMarkets ();
        await this.loadAccounts ();
        for (let i = 0; i < this.accounts.length; i++) {
            const account = this.accounts[i];
            if (account['code'] === code) {
                return account['id'];
            }
        }
        return undefined;
    }

    prepareAccountRequest (limit = undefined, params = {}) {
        const accountId = this.safeString2 (params, 'account_id', 'accountId');
        if (accountId === undefined) {
            throw new ArgumentsRequired (this.id + ' method requires an account_id (or accountId) parameter');
        }
        const request = {
            'account_id': accountId,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        return request;
    }

    async prepareAccountRequestWithCurrencyCode (code = undefined, limit = undefined, params = {}) {
        let accountId = this.safeString2 (params, 'account_id', 'accountId');
        if (accountId === undefined) {
            if (code === undefined) {
                throw new ArgumentsRequired (this.id + ' method requires an account_id (or accountId) parameter OR a currency code argument');
            }
            accountId = await this.findAccountId (code);
            if (accountId === undefined) {
                throw new ExchangeError (this.id + ' could not find account id for ' + code);
            }
        }
        const request = {
            'account_id': accountId,
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        return request;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let fullPath = '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (method === 'GET') {
            if (Object.keys (query).length) {
                fullPath += '?' + this.urlencode (query);
            }
        }
        const url = this.urls['api'] + fullPath;
        if (api === 'private') {
            const authorization = this.safeString (this.headers, 'Authorization');
            if (authorization !== undefined) {
                headers = {
                    'Authorization': authorization,
                    'Content-Type': 'application/json',
                };
            } else if (this.token) {
                headers = {
                    'Authorization': 'Bearer ' + this.token,
                    'Content-Type': 'application/json',
                };
            } else {
                this.checkRequiredCredentials ();
                const nonce = this.nonce ().toString ();
                let payload = '';
                if (method !== 'GET') {
                    if (Object.keys (query).length) {
                        body = this.json (query);
                        payload = body;
                    }
                }
                const auth = nonce + method + fullPath + payload;
                const signature = this.hmac (this.encode (auth), this.encode (this.secret));
                headers = {
                    'CB-ACCESS-KEY': this.apiKey,
                    'CB-ACCESS-SIGN': signature,
                    'CB-ACCESS-TIMESTAMP': nonce,
                    'Content-Type': 'application/json',
                };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return; // fallback to default error handler
        }
        const feedback = this.id + ' ' + body;
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
        let errorCode = this.safeString (response, 'error');
        if (errorCode !== undefined) {
            const errorMessage = this.safeString (response, 'error_description');
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            throw new ExchangeError (feedback);
        }
        const errors = this.safeValue (response, 'errors');
        if (errors !== undefined) {
            if (Array.isArray (errors)) {
                const numErrors = errors.length;
                if (numErrors > 0) {
                    errorCode = this.safeString (errors[0], 'id');
                    const errorMessage = this.safeString (errors[0], 'message');
                    if (errorCode !== undefined) {
                        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                        this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
                        throw new ExchangeError (feedback);
                    }
                }
            }
        }
        const data = this.safeValue (response, 'data');
        if (data === undefined) {
            throw new ExchangeError (this.id + ' failed due to a malformed response ' + this.json (response));
        }
    }
};
