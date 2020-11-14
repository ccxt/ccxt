'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');

//  ---------------------------------------------------------------------------

module.exports = class delta extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'delta',
            'name': 'Delta Exchange',
            'countries': [ 'VC' ], // Saint Vincent and the Grenadines
            'rateLimit': 300,
            'version': 'v2',
            // new metainfo interface
            'has': {
                'fetchCurrencies': true,
            },
            'timeframes': {
            },
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/51840849/87591171-9a377d80-c6f0-11ea-94ac-97a126eac3bc.jpg',
                'test': {
                    'public': 'https://testnet-api.delta.exchange',
                    'private': 'https://testnet-api.delta.exchange',
                },
                'api': {
                    'public': 'https://api.delta.exchange',
                    'private': 'https://api.delta.exchange',
                },
                'www': 'https://www.delta.exchange',
                'doc': [
                    'https://docs.delta.exchange',
                ],
                'fees': 'https://www.delta.exchange/fees',
            },
            'api': {
                'public': {
                    'get': [
                        'assets',
                        'indices',
                        'products',
                        'tickers',
                        'tickers/{symbol}',
                        'l2orderbook/{symbol}',
                        'trades/{symbol}',
                        'history/candles',
                        'history/sparklines',
                    ],
                },
                'private': {
                    'get': [
                        'orders',
                        'orders/leverage',
                        'positions',
                        'positions/margined',
                        'orders/history',
                        'fills',
                        'fills/history/download/csv',
                        'wallet/balances',
                        'wallet/transactions',
                        'wallet/transactions/download',
                    ],
                    'post': [
                        'orders',
                        'orders/batch',
                        'orders/leverage',
                        'positions/change_margin',
                    ],
                    'put': [
                        'orders',
                        'orders/batch',
                    ],
                    'delete': [
                        'orders',
                        'orders/all',
                        'orders/batch',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.15 / 100,
                    'maker': 0.10 / 100,
                    'tiers': [
                        // volume in BTC
                        {
                            'taker': [
                                [0, 0.15 / 100],
                                [100, 0.13 / 100],
                                [250, 0.13 / 100],
                                [1000, 0.1 / 100],
                                [5000, 0.09 / 100],
                                [10000, 0.075 / 100],
                                [20000, 0.065 / 100],
                            ],
                            'maker': [
                                [0, 0.1 / 100],
                                [100, 0.1 / 100],
                                [250, 0.09 / 100],
                                [1000, 0.075 / 100],
                                [5000, 0.06 / 100],
                                [10000, 0.05 / 100],
                                [20000, 0.05 / 100],
                            ],
                        },
                    ],
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'exceptions': {
                'exact': {
                },
                'broad': {
                },
            },
            'markets': {},
        });
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicGetAssets (params);
        //
        //     {
        //         "result":[
        //             {
        //                 "base_withdrawal_fee":"0.0005",
        //                 "deposit_status":"enabled",
        //                 "id":2,
        //                 "interest_credit":true,
        //                 "interest_slabs":[
        //                     {"limit":"0.1","rate":"0"},
        //                     {"limit":"1","rate":"0.05"},
        //                     {"limit":"5","rate":"0.075"},
        //                     {"limit":"10","rate":"0.1"},
        //                     {"limit":"9999999999999999","rate":"0"}
        //                 ],
        //                 "kyc_deposit_limit":"10",
        //                 "kyc_withdrawal_limit":"2",
        //                 "min_withdrawal_amount":"0.001",
        //                 "minimum_precision":4,
        //                 "name":"Bitcoin",
        //                 "precision":8,
        //                 "sort_priority":1,
        //                 "symbol":"BTC",
        //                 "variable_withdrawal_fee":"0",
        //                 "withdrawal_status":"enabled"
        //             },
        //         ],
        //         "success":true
        //     }
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const currency = response[i];
            const id = this.safeString (currency, 'symbol');
            const numericId = this.safeInteger (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const depositStatus = this.safeString (currency, 'depositl_status');
            const withdrawalStatus = this.safeString (currency, 'withdrawal_status');
            const depositsEnabled = (depositStatus === 'enabled');
            const withdrawalsEnabled = (withdrawalStatus === 'enabled');
            const active = depositsEnabled && withdrawalsEnabled;
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'name': this.safeString (currency, 'name'),
                'info': currency, // the original payload
                'active': active,
                'fee': this.safeFloat (currency, 'base_withdrawal_fee'),
                'precision': this.safeInteger (currency, 'precision'),
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': {
                        'min': this.safeFloat (currency, 'min_withdrawal_amount'),
                        'max': undefined,
                    },
                },
            };
        }
        return result;
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.version + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            // headers = {
            //     'Accept': 'application/json',
            //     'Authorization': 'Bearer ' + this.apiKey,
            // };
            // if (method === 'POST') {
            //     body = this.json (query);
            //     headers['Content-Type'] = 'application/json';
            // } else {
            //     if (Object.keys (query).length) {
            //         url += '?' + this.urlencode (query);
            //     }
            // }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
