'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError } = require ('./base/errors');
const { TICK_SIZE } = require ('./base/functions/number');

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
                'fetchMarkets': true,
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
            'precisionMode': TICK_SIZE,
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
            const precision = this.safeInteger (currency, 'precision');
            result[code] = {
                'id': id,
                'numericId': numericId,
                'code': code,
                'name': this.safeString (currency, 'name'),
                'info': currency, // the original payload
                'active': active,
                'fee': this.safeFloat (currency, 'base_withdrawal_fee'),
                'precision': 1 / Math.pow (10, precision),
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

    async fetchMarkets (params = {}) {
        const response = await this.publicGetProducts (params);
        //
        //     {
        //         "meta":{
        //             "after":null,
        //             "before":null,
        //             "limit":100,
        //             "total_count":81
        //         },
        //         "result":[
        //             {
        //                 "annualized_funding":"5.475000000000000000",
        //                 "is_quanto":false,
        //                 "ui_config":{
        //                     "default_trading_view_candle":"15",
        //                     "leverage_slider_values":[1,3,5,10,25,50],
        //                     "price_clubbing_values":[0.001,0.005,0.05,0.1,0.5,1,5],
        //                     "show_bracket_orders":false,
        //                     "sort_priority":29,
        //                     "tags":[]
        //                 },
        //                 "basis_factor_max_limit":"0.15",
        //                 "symbol":"P-LINK-D-151120",
        //                 "id":1584,
        //                 "default_leverage":"5.000000000000000000",
        //                 "maker_commission_rate":"0.0005",
        //                 "contract_unit_currency":"LINK",
        //                 "strike_price":"12.507948",
        //                 "settling_asset":{
        //                     // asset structure
        //                 },
        //                 "auction_start_time":null,
        //                 "auction_finish_time":null,
        //                 "settlement_time":"2020-11-15T12:00:00Z",
        //                 "launch_time":"2020-11-14T11:55:05Z",
        //                 "spot_index":{
        //                     // index structure
        //                 },
        //                 "trading_status":"operational",
        //                 "tick_size":"0.001",
        //                 "position_size_limit":100000,
        //                 "notional_type":"vanilla", // vanilla, inverse
        //                 "price_band":"0.4",
        //                 "barrier_price":null,
        //                 "description":"Daily LINK PUT options quoted in USDT and settled in USDT",
        //                 "insurance_fund_margin_contribution":"1",
        //                 "quoting_asset":{
        //                     // asset structure
        //                 },
        //                 "liquidation_penalty_factor":"0.2",
        //                 "product_specs":{"max_volatility":3,"min_volatility":0.3,"spot_price_band":"0.40"},
        //                 "initial_margin_scaling_factor":"0.0001",
        //                 "underlying_asset":{
        //                     // asset structure
        //                 },
        //                 "state":"live",
        //                 "contract_value":"1",
        //                 "initial_margin":"2",
        //                 "impact_size":5000,
        //                 "settlement_price":null,
        //                 "contract_type":"put_options", // put_options, call_options, move_options, perpetual_futures, interest_rate_swaps, futures, spreads
        //                 "taker_commission_rate":"0.0005",
        //                 "maintenance_margin":"1",
        //                 "short_description":"LINK Daily PUT Options",
        //                 "maintenance_margin_scaling_factor":"0.00005",
        //                 "funding_method":"mark_price",
        //                 "max_leverage_notional":"20000"
        //             },
        //         ],
        //         "success":true
        //     }
        //
        const markets = this.safeValue (response, 'result', []);
        const result = [];
        for (let i = 0; i < markets.length; i++) {
            const market = markets[i];
            let type = this.safeString (market, 'contract_type');
            // const settlingAsset = this.safeValue (market, 'settling_asset', {});
            const quotingAsset = this.safeValue (market, 'quoting_asset', {});
            const underlyingAsset = this.safeValue (market, 'underlying_asset', {});
            const baseId = this.safeString (underlyingAsset, 'symbol');
            const quoteId = this.safeString (quotingAsset, 'symbol');
            const id = this.safeString (market, 'symbol');
            const numericId = this.safeInteger (market, 'id');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            let symbol = id;
            let swap = false;
            let future = false;
            let option = false;
            if (type === 'perpetual_futures') {
                type = 'swap';
                swap = true;
                future = false;
                option = false;
                symbol = base + '/' + quote;
            } else if ((type === 'call_options') || (type === 'put_options') || (type === 'move_options')) {
                type = 'option';
                swap = false;
                option = true;
                future = false;
            } else if (type === 'futures') {
                type = 'future';
                swap = false;
                option = false;
                future = true;
            }
            const precision = {
                'amount': 1, // number of contracts
                'price': this.safeFloat (market, 'tick_size'),
            };
            const limits = {
                'amount': {
                    'min': 1,
                    'max': undefined,
                },
                'price': {
                    'min': precision['price'],
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeFloat (market, 'min_size'),
                    'max': undefined,
                },
            };
            const state = this.safeString (market, 'state');
            const active = (state === 'live');
            const maker = this.safeFloat (market, 'maker_commission_rate');
            const taker = this.safeFloat (market, 'taker_commission_rate');
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': type,
                'option': option,
                'swap': swap,
                'future': future,
                'maker': maker,
                'taker': taker,
                'precision': precision,
                'limits': limits,
                'info': market,
                'active': active,
            });
        }
        return result;
    }

    async fetchTicker (symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTickersSymbol (this.extend (request, params));
        //
        //     {
        //         "result":{
        //             "close":15837.5,
        //             "high":16354,
        //             "low":15751.5,
        //             "mark_price":"15820.100867",
        //             "open":16140.5,
        //             "product_id":139,
        //             "size":640552,
        //             "spot_price":"15827.050000000001",
        //             "symbol":"BTCUSDT",
        //             "timestamp":1605373550208262,
        //             "turnover":10298630.3735,
        //             "turnover_symbol":"USDT",
        //             "turnover_usd":10298630.3735,
        //             "volume":640.5520000000001
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseTicker (result, market);
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
