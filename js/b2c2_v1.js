'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class b2c2 extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'b2c2',
            'name': 'B2C2',
            'countries': [ 'GB' ],
            'has': {
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchFundingFees': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchTransactions': true,
                'fetchWithdrawals': true,
                'withdraw': true
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/37808081-b87f2d9c-2e59-11e8-894d-c1900b7584fe.jpg',
                'api': {
                    'private': 'https://api.uat.b2c2.net',
                },
                'www': 'https://b2c2.com',
                'doc': 'https://docs.b2c2.net',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'api': {
                'public': {
                    'get': [
                    ],
                },
                'private': {
                    'get': [
                        'balance',
                        'currency',
                        'funding_rates',
                        'instruments',
                        'trade',
                        'order',
                        'order/{client_order_id}',
                        'ledger',
                        'withdrawal'
                    ],
                    'post': [
                        'withdrawal'
                    ],
                },
            },
            'markets': {
                'BTCUSD.SPOT': { 'id': 'btc', 'symbol': 'BTCUSD.SPOT', 'base': 'BTC', 'quote': 'USD', 'baseId': 'btc', 'quoteId': 'usd' },
            },
            'exceptions': {
                '400': ExchangeError, // At least one parameter wasn't set
            },
        });
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetBalance (params);
        // {
        //     "USD": "0",
        //     "BTC": "0",
        //     "JPY": "0",
        //     "GBP": "0",
        //     "ETH": "0",
        //     "EUR": "0",
        //     "CAD": "0",
        //     "LTC": "0",
        //     "XRP": "0",
        //     "BCH": "0"
        // }
        const result = {
            'info': response,
            'timestamp': this.timestamp,
            'datetime': undefined,
        };
        const assets = response;
        const keys = Object.keys (assets);
        for (let i = 0; i < keys.length; i++) {
            const balance = assets[keys[i]];
            const code = keys[i];
            const account = this.account ();
            account['free'] = balance;
            account['used'] = 0;
            account['total'] = balance;
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    // GET https://api.uat.b2c2.net/currency/
    async fetchCurrencies (params = {}) {
        const response = await this.privateGetBalance (params);
        // {
        //     "BTC": {
        //         "stable_coin": false,
        //         "is_crypto": true,
        //         "currency_type": "crypto",
        //         "readable_name": "Bitcoin",
        //         "long_only": false,
        //         "minimum_trade_size": 0.001
        //     },
        //     "USD": {
        //         "stable_coin": false,
        //         "is_crypto": false,
        //         "currency_type": "fiat",
        //         "readable_name": "",
        //         "long_only": false,
        //         "minimum_trade_size": 0.01
        //     },
        //     "XAU": {
        //         "stable_coin": false,
        //         "is_crypto": false,
        //         "currency_type": "synthetic",
        //         "readable_name": "XAU",
        //         "long_only": false,
        //         "minimum_trade_size": 1
        //     }
        // }
        const result = {};
        const currencies = response;
        const keys = Object.keys (currencies);
        for (let i = 0; i < keys.length; i++) {
            const entry = assets[keys[i]];
            const id = keys[i];
            const code = this.safeCurrencyCode (id);
            const precision = undefined;
            const active = undefined;
            const fee = undefined;
            const fees = undefined;
            const limits = undefined;


            result[code] = {
                'id': id,
                'name': name,
                'code': code,
                'precision': precision,
                'info': entry,
                'active': active,
                'fee': fee,
                'fees': fees,
                'limits': limits,
            };
        }
    }

    // GET https://api.uat.b2c2.net/funding_rates/
    async fetchFundingFees (params = {}) {
        const response = await this.privateGetFundingRates (params);
        // [
        //     {
        //         "rate_date": "2021-02-07",
        //         "rate_in_bps": 100,
        //         "currency": "BCH"
        //     },
        //     {
        //         "rate_date": "2021-02-07",
        //         "rate_in_bps": 100,
        //         "currency": "BTC"
        //     },
        //     {
        //         "rate_date": "2021-02-07",
        //         "rate_in_bps": 100,
        //         "currency": "ETH"
        //     }
        // ]
        const withdrawFees = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            withdrawFees[code] = this.safeNumber(entry, 'rate_in_bps');
        }
        return {
            'withdraw': withdrawFees,
            'deposit': {},
            'info': response,
        };
    }

    // GET https://api.uat.b2c2.net/instruments/
    async fetchMarkets (params = {}) {
        const response = await this.privateGetInstruments (params);
        // [
        //     {
        //         "name": "BTCUSD.CFD"
        //     },
        //     {
        //         "name": "BTCUSD.SPOT"
        //     },
        //     {
        //         "name": "BTCEUR.SPOT"
        //     },
        //     {
        //         "name": "BTCGBP.SPOT"
        //     },
        //     {
        //         "name": "ETHBTC.SPOT"
        //     },
        //     {
        //         "name": "ETHUSD.SPOT"
        //     },
        //     {
        //         "name": "LTCUSD.SPOT"
        //     },
        //     {
        //         "name": "XRPUSD.SPOT"
        //     },
        //     {
        //         "name": "BCHUSD.SPOT"
        //     }
        // ]
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];

            // NOTE: TODO, I've no idea what is going on here, leaving it for now, need help from Adam

            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'active': true,
                'precision': precision,
                'limits': limits,
                'info': market,
            });
        }
    }

    // GET https://api.uat.b2c2.net/trade/
    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        const response = await this.privateGetTrade (params);
        // [
        //     {
        //         "created": "2016-09-27T11:27:46.599039Z",
        //         "trade_id": "2ff83945-63f0-45bc-959b-ece69eb72636",
        //         "origin": "rest",
        //         "quantity": "20.0000000000",
        //         "order": "42b97b9a-e417-4973-aee0-6f1528c3035c",
        //         "side": "buy",
        //         "instrument": "BTCUSD.SPOT",
        //         "price": "700.00000000",
        //         "user": "user@b2c2.com",
        //         "executing_unit": "risk-adding-strategy"
        //     },
        //     {
        //         "created": "2016-09-27T11:27:49.599039Z",
        //         "trade_id": "049fb5d2-7d87-403z-a59e-49612b8aec92",
        //         "origin": "rest",
        //         "quantity": "100.0000000000",
        //         "order": "42b97b9a-e417-4973-aee0-6f1528c3035c",
        //         "cfd_contract": "945bac72-4d88-401b-9a7f-27bc328a125f",
        //         "side": "sell",
        //         "instrument": "ETHUSD.CFD",
        //         "price": "15.00000000",
        //         "user": "user@b2c2.com",
        //         "executing_unit": ""
        //     }
        // ]

        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
        }

    }

    // GET https://api.uat.b2c2.net/order/
    async fetchOpenOrders(params = {}) {
        const response = await this.privateGetOrder (params);
        // [
        //     {
        //         "order_id": "20b28114-0031-4d3c-9bd9-5d8172688574",
        //         "client_order_id": "d4a1a710-8466-4e6b-816d-7d51ff3294dd",
        //         "instrument": "BTCUSD.CFD",
        //         "price": null,
        //         "executed_price": "15871.00000000",
        //         "quantity": "1.0000000000",
        //         "side": "buy",
        //         "order_type": "MKT",
        //         "created": "2020-11-11T17:27:32.160497Z",
        //         "executing_unit": "example"
        //     }
        // ]
    }

    // GET https://api.uat.b2c2.net/order/:client_order_id:/
    async fetchOrder(id, params = {}) {
        const response = await this.privateGetOrderClientOrderId (params);
        // [
        //     {
        //         "order_id": "d4e41399-e7a1-4576-9b46-349420040e1a",
        //         "client_order_id": "d4e41399-e7a1-4576-9b46-349420040e1a",
        //         "quantity": "3.0000000000",
        //         "side": "buy",
        //         "instrument": "BTCUSD.SPOT",
        //         "price": "11000.00000000",
        //         "executed_price": "10457.651100000",
        //         "executing_unit": "risk-adding-strategy",
        //         "trades": [
        //             {
        //                 "instrument": "BTCUSD.SPOT",
        //                 "trade_id": "b2c50b72-92d4-499f-b0a3-dee6b37378be",
        //                 "origin": "rest",
        //                 "rfq_id": null,
        //                 "created": "2018-02-26T14:27:53.675962Z",
        //                 "price": "10457.65110000",
        //                 "quantity": "3.0000000000",
        //                 "order": "d4e41399-e7a1-4576-9b46-349420040e1a",
        //                 "side": "buy",
        //                 "executing_unit": "risk-adding-strategy"
        //             }
        //         ],
        //         "created": "2018-02-06T16:07:50.122206Z"
        //     }
        // ]

    }

    // https://api.uat.b2c2.net/ledger/
    async fetchTransactions(params = {}) {
        const response = await this.privateGetLedger (params);
        // [
        //     {
        //         "transaction_id": "ef69dz9f-5ade-4aa4-87c2-e2eaef37d8bc",
        //         "created": "2016-12-14T14:17:03Z",
        //         "reference": "2ff83923-63f0-45bd-959b-ece69eb72636",
        //         "currency": "BTC",
        //         "amount": "1.00000000",
        //         "type": "trade",
        //         "group": "trading"
        //     },
        //     {
        //         "transaction_id": "393f9373-8a9a-478b-8669-6fc443a36780",
        //         "created": "2017-03-10T17:17:56Z",
        //         "reference": "Example",
        //         "currency": "EUR",
        //         "amount": "100000.00000000",
        //         "type": "transfer",
        //         "group": "trading"
        //     },
        //     {
        //         "transaction_id": "4526d8e5z-8a9a-478b-8669-6fc443a36936",
        //         "created": "2018-01-10T17:17:56Z",
        //         "reference": "Example",
        //         "currency": "USD",
        //         "amount": "15000.00000000",
        //         "type": "realised_pnl",
        //         "group": "trading"
        //     }
        // ]
    }

    // GET https://api.uat.b2c2.net/withdrawal/
    async fetchWithdrawals(params = {}) {
        const response = await this.privateGetWithdrawal (params);
        // [
        //     {
        //         "amount": "2.00000000",
        //         "currency": "BTC",
        //         "destination_address": "0xC323E80eF4deC2195G239F4f1e830417D294F841",
        //         "destination_bank_account": null,
        //         "reference": "",
        //         "settled": false,
        //         "created": "2021-06-09T09:46:00.162599Z",
        //         "withdrawal_id": "ed846746-f7e0-4af9-85bb-36732e60d6d8"
        //     },
        //     {
        //         "amount": "10.00000000",
        //         "currency": "BTC",
        //         "destination_address": null,
        //         "destination_bank_account": "EUR BA",
        //         "reference": "",
        //         "settled": true,
        //         "created": "2021-06-09T09:46:00.162599Z",
        //         "withdrawal_id": "b4426ff2-19c6-48ca-8b07-2c344dc34ecb"
        //     }
        // ]
    }

    // TODO: Do this next, after you are finished with GET endpoints
    // POST https://api.uat.b2c2.net/withdrawal/
    async withdraw(params = {}) {
        // const response = await this.privatePostWithdrawal (params);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const query = this.omit (params, this.extractParams (path));
        let url = this.implodeHostname (this.urls['api'][api]) + '/' + path;
        if ((api === 'public') || (api === 'markets')) {
            url += this.implodeParams (path, params);
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            headers = {
                'Authorization': 'Token ' + this.apiKey,
            };
            if (method === 'GET') {
                if (Object.keys (query).length) {
                    url += '?' + this.urlencode (query);
                }
            } else if (method === 'POST') {
                headers['Content-Type'] = 'application/json';
                body = this.json (query);
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
