'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired } = require ('./base/errors');
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
                'fetchBalance': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                'fetchOHLCV': true,
                'fetchOrderBook': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTrades': true,
            },
            'timeframes': {
                '1m': '1m',
                '3m': '3m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '2h': '2h',
                '4h': '4h',
                '6h': '6h',
                '1d': '1d',
                '7d': '7d',
                '1w': '1w',
                '2w': '2w',
                '1M': '30d',
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
                'referral': 'https://www.delta.exchange/app/signup/?code=IULYNB',
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
        const currencies = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'symbol');
            const numericId = this.safeInteger (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const depositStatus = this.safeString (currency, 'deposit_status');
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

    async loadMarkets (reload = false, params = {}) {
        const markets = await super.loadMarkets (reload, params);
        const currenciesByNumericId = this.safeValue (this.options, 'currenciesByNumericId');
        if ((currenciesByNumericId === undefined) || reload) {
            this.options['currenciesByNumericId'] = this.indexBy (this.currencies, 'numericId');
        }
        return markets;
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
                'amount': 1.0, // number of contracts
                'price': this.safeFloat (market, 'tick_size'),
            };
            const limits = {
                'amount': {
                    'min': 1.0,
                    'max': this.safeFloat (market, 'position_size_limit'),
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

    parseTicker (ticker, market = undefined) {
        //
        // fetchTicker, fetchTickers
        //
        //     {
        //         "close":15837.5,
        //         "high":16354,
        //         "low":15751.5,
        //         "mark_price":"15820.100867",
        //         "open":16140.5,
        //         "product_id":139,
        //         "size":640552,
        //         "spot_price":"15827.050000000001",
        //         "symbol":"BTCUSDT",
        //         "timestamp":1605373550208262,
        //         "turnover":10298630.3735,
        //         "turnover_symbol":"USDT",
        //         "turnover_usd":10298630.3735,
        //         "volume":640.5520000000001
        //     }
        //
        const timestamp = this.safeIntegerProduct (ticker, 'timestamp', 0.001);
        const marketId = this.safeString (ticker, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const last = this.safeFloat (ticker, 'close');
        const open = this.safeFloat (ticker, 'open');
        let change = undefined;
        let average = undefined;
        let percentage = undefined;
        if ((open !== undefined) && (last !== undefined)) {
            change = last - open;
            average = this.sum (last, open) / 2;
            if (open !== 0.0) {
                percentage = (change / open) * 100;
            }
        }
        const baseVolume = this.safeFloat (ticker, 'volume');
        const quoteVolume = this.safeFloat (ticker, 'turnover');
        const vwap = this.vwap (baseVolume, quoteVolume);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat (ticker, 'high'),
            'low': this.safeFloat (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': change,
            'percentage': percentage,
            'average': average,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        };
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

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        //
        //     {
        //         "result":[
        //             {
        //                 "close":0.003966,
        //                 "high":0.004032,
        //                 "low":0.003606,
        //                 "mark_price":"0.00396328",
        //                 "open":0.003996,
        //                 "product_id":1327,
        //                 "size":6242,
        //                 "spot_price":"0.0039555",
        //                 "symbol":"AAVEBTC",
        //                 "timestamp":1605374143864107,
        //                 "turnover":23.997904999999996,
        //                 "turnover_symbol":"BTC",
        //                 "turnover_usd":387957.4544782897,
        //                 "volume":6242
        //             },
        //         ],
        //         "success":true
        //     }
        //
        const tickers = this.safeValue (response, 'result', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'symbol': this.marketId (symbol),
        };
        if (limit !== undefined) {
            request['depth'] = limit;
        }
        const response = await this.publicGetL2orderbookSymbol (this.extend (request, params));
        //
        //     {
        //         "result":{
        //             "buy":[
        //                 {"price":"15814.0","size":912},
        //                 {"price":"15813.5","size":1279},
        //                 {"price":"15813.0","size":1634},
        //             ],
        //             "sell":[
        //                 {"price":"15814.5","size":625},
        //                 {"price":"15815.0","size":982},
        //                 {"price":"15815.5","size":1328},
        //             ],
        //             "symbol":"BTCUSDT"
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrderBook (result, undefined, 'buy', 'sell', 'price', 'size');
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades
        //
        //     {
        //         "buyer_role":"maker",
        //         "price":"15896.5",
        //         "seller_role":"taker",
        //         "size":241,
        //         "symbol":"BTCUSDT",
        //         "timestamp":1605376684714595
        //     }
        //
        // private fetchMyTrades
        //
        //     ...
        //
        const timestamp = this.safeIntegerProduct (trade, 'timestamp', 0.001);
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat (trade, 'size');
        let cost = undefined;
        if ((amount !== undefined) && (price !== undefined)) {
            cost = amount * price;
        }
        const marketId = this.safeString (trade, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const sellerRole = this.safeString (trade, 'seller_role');
        let side = undefined;
        if (sellerRole === 'taker') {
            side = 'sell';
        } else if (sellerRole === 'maker') {
            side = 'buy';
        }
        return {
            'id': undefined,
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': undefined,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'takerOrMaker': undefined,
            'fee': undefined,
            'info': trade,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetTradesSymbol (this.extend (request, params));
        //
        //     {
        //         "result":[
        //             {
        //                 "buyer_role":"maker",
        //                 "price":"15896.5",
        //                 "seller_role":"taker",
        //                 "size":241,
        //                 "symbol":"BTCUSDT",
        //                 "timestamp":1605376684714595
        //             }
        //         ],
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //     {
        //         "time":1605393120,
        //         "open":15989,
        //         "high":15989,
        //         "low":15987.5,
        //         "close":15987.5,
        //         "volume":565
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'time'),
            this.safeFloat (ohlcv, 'open'),
            this.safeFloat (ohlcv, 'high'),
            this.safeFloat (ohlcv, 'low'),
            this.safeFloat (ohlcv, 'close'),
            this.safeFloat (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'resolution': this.timeframes[timeframe],
        };
        const duration = this.parseTimeframe (timeframe);
        limit = limit ? limit : 2000; // max 2000
        if (since === undefined) {
            const end = this.seconds ();
            request['end'] = end;
            request['start'] = end - limit * duration;
        } else {
            const start = parseInt (since / 1000);
            request['start'] = start;
            request['end'] = this.sum (start, limit * duration);
        }
        const response = await this.publicGetHistoryCandles (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":[
        //             {"time":1605393120,"open":15989,"high":15989,"low":15987.5,"close":15987.5,"volume":565},
        //             {"time":1605393180,"open":15966,"high":15966,"low":15959,"close":15959,"volume":24},
        //             {"time":1605393300,"open":15973,"high":15973,"low":15973,"close":15973,"volume":1288},
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOHLCVs (result, market, timeframe, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWalletBalances (params);
        //
        //     {
        //         "result":[
        //             {
        //                 "asset_id":1,
        //                 "available_balance":"0",
        //                 "balance":"0",
        //                 "commission":"0",
        //                 "id":154883,
        //                 "interest_credit":"0",
        //                 "order_margin":"0",
        //                 "pending_referral_bonus":"0",
        //                 "pending_trading_fee_credit":"0",
        //                 "position_margin":"0",
        //                 "trading_fee_credit":"0",
        //                 "user_id":22142
        //             },
        //         ],
        //         "success":true
        //     }
        //
        const balances = this.safeValue (response, 'result', []);
        const result = { 'info': response };
        const currenciesByNumericId = this.safeValue (this.options, 'currenciesByNumericId', {});
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const currencyId = this.safeString (balance, 'asset_id');
            const currency = this.safeValue (currenciesByNumericId, currencyId);
            const code = (currency === undefined) ? currencyId : currency['code'];
            const account = this.account ();
            account['total'] = this.safeFloat (balance, 'balance');
            account['free'] = this.safeFloat (balance, 'available_balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const requestPath = '/' + this.version + '/' + this.implodeParams (path, params);
        let url = this.urls['api'][api] + requestPath;
        const query = this.omit (params, this.extractParams (path));
        if (api === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else if (api === 'private') {
            this.checkRequiredCredentials ();
            const timestamp = this.seconds ().toString ();
            headers = {
                'api-key': this.apiKey,
                'timestamp': timestamp,
            };
            let auth = method + timestamp + requestPath;
            if ((method === 'GET') || (method === 'DELETE')) {
                if (Object.keys (query).length) {
                    const queryString = '?' + this.urlencode (query);
                    auth += queryString;
                    url += queryString;
                }
            } else {
                body = this.json (query);
                auth += body;
                headers['Content-Type'] = 'application/json';
            }
            const signature = this.hmac (this.encode (auth), this.encode (this.secret));
            headers['signature'] = signature;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
