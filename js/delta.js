'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ExchangeError, InsufficientFunds, BadRequest, BadSymbol, InvalidOrder, AuthenticationError, ArgumentsRequired, OrderNotFound, ExchangeNotAvailable } = require ('./base/errors');
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
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchLedger': true,
                'fetchMarkets': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchStatus': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
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
                'logo': 'https://user-images.githubusercontent.com/1294454/99450025-3be60a00-2931-11eb-9302-f4fd8d8589aa.jpg',
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
                        'settings',
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
                        'deposits/address',
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
                    'tiers': {
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
                },
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            'exceptions': {
                'exact': {
                    // Margin required to place order with selected leverage and quantity is insufficient.
                    'insufficient_margin': InsufficientFunds, // {"error":{"code":"insufficient_margin","context":{"available_balance":"0.000000000000000000","required_additional_balance":"1.618626000000000000000000000"}},"success":false}
                    'order_size_exceed_available': InvalidOrder, // The order book doesn't have sufficient liquidity, hence the order couldnt be filled, for example, ioc orders
                    'risk_limits_breached': BadRequest, // orders couldn't be placed as it will breach allowed risk limits.
                    'invalid_contract': BadSymbol, // The contract/product is either doesn't exist or has already expired.
                    'immediate_liquidation': InvalidOrder, // Order will cause immediate liquidation.
                    'out_of_bankruptcy': InvalidOrder, // Order prices are out of position bankruptcy limits.
                    'self_matching_disrupted_post_only': InvalidOrder, // Self matching is not allowed during auction.
                    'immediate_execution_post_only': InvalidOrder, // orders couldn't be placed as it includes post only orders which will be immediately executed
                    'bad_schema': BadRequest, // {"error":{"code":"bad_schema","context":{"schema_errors":[{"code":"validation_error","message":"id is required","param":""}]}},"success":false}
                    'invalid_api_key': AuthenticationError, // {"success":false,"error":{"code":"invalid_api_key"}}
                    'invalid_signature': AuthenticationError, // {"success":false,"error":{"code":"invalid_signature"}}
                    'open_order_not_found': OrderNotFound, // {"error":{"code":"open_order_not_found"},"success":false}
                    'unavailable': ExchangeNotAvailable, // {"error":{"code":"unavailable"},"success":false}
                },
                'broad': {
                },
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetSettings (params);
        //
        //     {
        //         "result":{
        //             "server_time":1605472733766141,
        //             "deto_referral_mining_daily_reward":"25000",
        //             "deto_total_reward_pool":"100000000",
        //             "deto_trade_mining_daily_reward":"75000",
        //             "kyc_deposit_limit":"20",
        //             "kyc_withdrawal_limit":"2",
        //             "under_maintenance":"false"
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.safeIntegerProduct (result, 'server_time', 0.001);
    }

    async fetchStatus (params = {}) {
        const response = await this.publicGetSettings (params);
        const result = this.safeValue (response, 'result', {});
        const underMaintenance = this.safeValue (result, 'under_maintenance');
        const status = (underMaintenance === 'true') ? 'maintenance' : 'ok';
        const updated = this.safeIntegerProduct (result, 'server_time', 0.001);
        this.status = this.extend (this.status, {
            'status': status,
            'updated': updated,
        });
        return this.status;
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
                'fee': this.safeNumber (currency, 'base_withdrawal_fee'),
                'precision': 1 / Math.pow (10, precision),
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'withdraw': {
                        'min': this.safeNumber (currency, 'min_withdrawal_amount'),
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
        const marketsByNumericId = this.safeValue (this.options, 'marketsByNumericId');
        if ((marketsByNumericId === undefined) || reload) {
            this.options['marketsByNumericId'] = this.indexBy (this.markets, 'numericId');
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
                if (id.indexOf ('_') < 0) {
                    symbol = base + '/' + quote;
                }
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
                'price': this.safeNumber (market, 'tick_size'),
            };
            const limits = {
                'amount': {
                    'min': 1.0,
                    'max': this.safeNumber (market, 'position_size_limit'),
                },
                'price': {
                    'min': precision['price'],
                    'max': undefined,
                },
                'cost': {
                    'min': this.safeNumber (market, 'min_size'),
                    'max': undefined,
                },
            };
            const state = this.safeString (market, 'state');
            const active = (state === 'live');
            const maker = this.safeNumber (market, 'maker_commission_rate');
            const taker = this.safeNumber (market, 'taker_commission_rate');
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': type,
                'spot': false,
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
        const last = this.safeNumber (ticker, 'close');
        const open = this.safeNumber (ticker, 'open');
        const baseVolume = this.safeNumber (ticker, 'volume');
        const quoteVolume = this.safeNumber (ticker, 'turnover');
        const vwap = this.vwap (baseVolume, quoteVolume);
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeNumber (ticker, 'high'),
            'low': this.safeNumber (ticker, 'low'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': vwap,
            'open': open,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
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
        return this.parseOrderBook (result, symbol, undefined, 'buy', 'sell', 'price', 'size');
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
        //     {
        //         "commission":"0.008335000000000000",
        //         "created_at":"2020-11-16T19:07:19Z",
        //         "fill_type":"normal",
        //         "id":"e7ff05c233a74245b72381f8dd91d1ce",
        //         "meta_data":{
        //             "effective_commission_rate":"0.0005",
        //             "order_price":"16249",
        //             "order_size":1,
        //             "order_type":"market_order",
        //             "order_unfilled_size":0,
        //             "trading_fee_credits_used":"0"
        //         },
        //         "order_id":"152999629",
        //         "price":"16669",
        //         "product":{
        //             "contract_type":"perpetual_futures",
        //             "contract_unit_currency":"BTC",
        //             "contract_value":"0.001",
        //             "id":139,
        //             "notional_type":"vanilla",
        //             "quoting_asset":{"minimum_precision":2,"precision":6,"symbol":"USDT"},
        //             "settling_asset":{"minimum_precision":2,"precision":6,"symbol":"USDT"},
        //             "symbol":"BTCUSDT",
        //             "tick_size":"0.5",
        //             "underlying_asset":{"minimum_precision":4,"precision":8,"symbol":"BTC"}
        //         },
        //         "product_id":139,
        //         "role":"taker",
        //         "side":"sell",
        //         "size":1
        //     }
        //
        const id = this.safeString (trade, 'id');
        const orderId = this.safeString (trade, 'order_id');
        let timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        timestamp = this.safeIntegerProduct (trade, 'timestamp', 0.001, timestamp);
        const priceString = this.safeString (trade, 'price');
        const amountString = this.safeString (trade, 'size');
        const product = this.safeValue (trade, 'product', {});
        const marketId = this.safeString (product, 'symbol');
        const symbol = this.safeSymbol (marketId, market);
        const sellerRole = this.safeString (trade, 'seller_role');
        let side = this.safeString (trade, 'side');
        if (side === undefined) {
            if (sellerRole === 'taker') {
                side = 'sell';
            } else if (sellerRole === 'maker') {
                side = 'buy';
            }
        }
        const takerOrMaker = this.safeString (trade, 'role');
        const metaData = this.safeValue (trade, 'meta_data', {});
        let type = this.safeString (metaData, 'order_type');
        if (type !== undefined) {
            type = type.replace ('_order', '');
        }
        const feeCostString = this.safeString (trade, 'commission');
        let fee = undefined;
        if (feeCostString !== undefined) {
            const settlingAsset = this.safeValue (product, 'settling_asset', {});
            const feeCurrencyId = this.safeString (settlingAsset, 'symbol');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeTrade ({
            'id': id,
            'order': orderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'takerOrMaker': takerOrMaker,
            'fee': fee,
            'info': trade,
        }, market);
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
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
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
            account['total'] = this.safeString (balance, 'balance');
            account['free'] = this.safeString (balance, 'available_balance');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchPosition (symbol, params = undefined) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_id': market['numericId'],
        };
        const response = await this.privateGetPositions (this.extend (request, params));
        //
        //     {
        //         "result":{
        //             "entry_price":null,
        //             "size":0,
        //             "timestamp":1605454074268079
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return result;
    }

    async fetchPositions (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetPositionsMargined (params);
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "user_id": 0,
        //                 "size": 0,
        //                 "entry_price": "string",
        //                 "margin": "string",
        //                 "liquidation_price": "string",
        //                 "bankruptcy_price": "string",
        //                 "adl_level": 0,
        //                 "product_id": 0
        //             }
        //         ]
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return result;
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            'pending': 'open',
            'closed': 'closed',
            'cancelled': 'canceled',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder, cancelOrder, editOrder, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "average_fill_price":null,
        //         "bracket_order":null,
        //         "bracket_stop_loss_limit_price":null,
        //         "bracket_stop_loss_price":null,
        //         "bracket_take_profit_limit_price":null,
        //         "bracket_take_profit_price":null,
        //         "bracket_trail_amount":null,
        //         "cancellation_reason":null,
        //         "client_order_id":null,
        //         "close_on_trigger":"false",
        //         "commission":"0",
        //         "created_at":"2020-11-16T02:38:26Z",
        //         "id":152870626,
        //         "limit_price":"10000",
        //         "meta_data":{"source":"api"},
        //         "order_type":"limit_order",
        //         "paid_commission":"0",
        //         "product_id":139,
        //         "reduce_only":false,
        //         "side":"buy",
        //         "size":0,
        //         "state":"open",
        //         "stop_order_type":null,
        //         "stop_price":null,
        //         "stop_trigger_method":"mark_price",
        //         "time_in_force":"gtc",
        //         "trail_amount":null,
        //         "unfilled_size":0,
        //         "user_id":22142
        //     }
        //
        const id = this.safeString (order, 'id');
        const clientOrderId = this.safeString (order, 'client_order_id');
        const timestamp = this.parse8601 (this.safeString (order, 'created_at'));
        const marketId = this.safeString (order, 'product_id');
        const marketsByNumericId = this.safeValue (this.options, 'marketsByNumericId', {});
        market = this.safeValue (marketsByNumericId, marketId, market);
        const symbol = (market === undefined) ? marketId : market['symbol'];
        const status = this.parseOrderStatus (this.safeString (order, 'state'));
        const side = this.safeString (order, 'side');
        let type = this.safeString (order, 'order_type');
        type = type.replace ('_order', '');
        const price = this.safeString (order, 'limit_price');
        const amount = this.safeString (order, 'size');
        const remaining = this.safeString (order, 'unfilled_size');
        const average = this.safeString (order, 'average_fill_price');
        let fee = undefined;
        const feeCostString = this.safeString (order, 'paid_commission');
        if (feeCostString !== undefined) {
            let feeCurrencyCode = undefined;
            if (market !== undefined) {
                const settlingAsset = this.safeValue (market['info'], 'settling_asset', {});
                const feeCurrencyId = this.safeString (settlingAsset, 'symbol');
                feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            }
            fee = {
                'cost': feeCostString,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeOrder2 ({
            'info': order,
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'average': average,
            'filled': undefined,
            'remaining': remaining,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const orderType = type + '_order';
        const market = this.market (symbol);
        const request = {
            'product_id': market['numericId'],
            // 'limit_price': this.priceToPrecision (symbol, price),
            'size': this.amountToPrecision (symbol, amount),
            'side': side,
            'order_type': orderType,
            // 'client_order_id': 'string',
            // 'time_in_force': 'gtc', // gtc, ioc, fok
            // 'post_only': 'false', // 'true',
            // 'reduce_only': 'false', // 'true',
        };
        if (type === 'limit') {
            request['limit_price'] = this.priceToPrecision (symbol, price);
        }
        const clientOrderId = this.safeString2 (params, 'clientOrderId', 'client_order_id');
        params = this.omit (params, [ 'clientOrderId', 'client_order_id' ]);
        if (clientOrderId !== undefined) {
            request['client_order_id'] = clientOrderId;
        }
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //     {
        //         "result":{
        //             "average_fill_price":null,
        //             "bracket_order":null,
        //             "bracket_stop_loss_limit_price":null,
        //             "bracket_stop_loss_price":null,
        //             "bracket_take_profit_limit_price":null,
        //             "bracket_take_profit_price":null,
        //             "bracket_trail_amount":null,
        //             "cancellation_reason":null,
        //             "client_order_id":null,
        //             "close_on_trigger":"false",
        //             "commission":"0",
        //             "created_at":"2020-11-16T02:38:26Z",
        //             "id":152870626,
        //             "limit_price":"10000",
        //             "meta_data":{"source":"api"},
        //             "order_type":"limit_order",
        //             "paid_commission":"0",
        //             "product_id":139,
        //             "reduce_only":false,
        //             "side":"buy",
        //             "size":0,
        //             "state":"open",
        //             "stop_order_type":null,
        //             "stop_price":null,
        //             "stop_trigger_method":"mark_price",
        //             "time_in_force":"gtc",
        //             "trail_amount":null,
        //             "unfilled_size":0,
        //             "user_id":22142
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        return this.parseOrder (result, market);
    }

    async editOrder (id, symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': parseInt (id),
            'product_id': market['numericId'],
            // 'limit_price': this.priceToPrecision (symbol, price),
            // 'size': this.amountToPrecision (symbol, amount),
        };
        if (amount !== undefined) {
            request['size'] = parseInt (this.amountToPrecision (symbol, amount));
        }
        if (price !== undefined) {
            request['limit_price'] = this.priceToPrecision (symbol, price);
        }
        const response = await this.privatePutOrders (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": {
        //             "id": "ashb1212",
        //             "product_id": 27,
        //             "limit_price": "9200",
        //             "side": "buy",
        //             "size": 100,
        //             "unfilled_size": 50,
        //             "user_id": 1,
        //             "order_type": "limit_order",
        //             "state": "open",
        //             "created_at": "..."
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrder() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'id': parseInt (id),
            'product_id': market['numericId'],
        };
        const response = await this.privateDeleteOrders (this.extend (request, params));
        //
        //     {
        //         "result":{
        //             "average_fill_price":null,
        //             "bracket_order":null,
        //             "bracket_stop_loss_limit_price":null,
        //             "bracket_stop_loss_price":null,
        //             "bracket_take_profit_limit_price":null,
        //             "bracket_take_profit_price":null,
        //             "bracket_trail_amount":null,
        //             "cancellation_reason":"cancelled_by_user",
        //             "client_order_id":null,
        //             "close_on_trigger":"false",
        //             "commission":"0",
        //             "created_at":"2020-11-16T02:38:26Z",
        //             "id":152870626,
        //             "limit_price":"10000",
        //             "meta_data":{"source":"api"},
        //             "order_type":"limit_order",
        //             "paid_commission":"0",
        //             "product_id":139,
        //             "reduce_only":false,
        //             "side":"buy",
        //             "size":0,
        //             "state":"cancelled",
        //             "stop_order_type":null,
        //             "stop_price":null,
        //             "stop_trigger_method":"mark_price",
        //             "time_in_force":"gtc",
        //             "trail_amount":null,
        //             "unfilled_size":0,
        //             "user_id":22142
        //         },
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'result');
        return this.parseOrder (result, market);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'product_id': market['numericId'],
            // 'cancel_limit_orders': 'true',
            // 'cancel_stop_orders': 'true',
        };
        const response = this.privateDeleteOrdersAll (this.extend (request, params));
        //
        //     {
        //         "result":{},
        //         "success":true
        //     }
        //
        return response;
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersWithMethod ('privateGetOrders', symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        return await this.fetchOrdersWithMethod ('privateGetOrdersHistory', symbol, since, limit, params);
    }

    async fetchOrdersWithMethod (method, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'product_ids': market['id'], // comma-separated
            // 'contract_types': types, // comma-separated, futures, perpetual_futures, call_options, put_options, interest_rate_swaps, move_options, spreads
            // 'order_types': types, // comma-separated, market, limit, stop_market, stop_limit, all_stop
            // 'start_time': since * 1000,
            // 'end_time': this.microseconds (),
            // 'after': string, // after cursor for pagination
            // 'before': string, // before cursor for pagination
            // 'page_size': limit, // number of records per page
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_ids'] = market['numericId']; // accepts a comma-separated list of ids
        }
        if (since !== undefined) {
            request['start_time'] = since.toString () + '000';
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this[method] (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "result": [
        //             {
        //                 "id": "ashb1212",
        //                 "product_id": 27,
        //                 "limit_price": "9200",
        //                 "side": "buy",
        //                 "size": 100,
        //                 "unfilled_size": 50,
        //                 "user_id": 1,
        //                 "order_type": "limit_order",
        //                 "state": "open",
        //                 "created_at": "..."
        //             }
        //         ],
        //         "meta": {
        //             "after": "string",
        //             "before": "string"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseOrders (result, market, since, limit);
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'product_ids': market['id'], // comma-separated
            // 'contract_types': types, // comma-separated, futures, perpetual_futures, call_options, put_options, interest_rate_swaps, move_options, spreads
            // 'start_time': since * 1000,
            // 'end_time': this.microseconds (),
            // 'after': string, // after cursor for pagination
            // 'before': string, // before cursor for pagination
            // 'page_size': limit, // number of records per page
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['product_ids'] = market['numericId']; // accepts a comma-separated list of ids
        }
        if (since !== undefined) {
            request['start_time'] = since.toString () + '000';
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.privateGetFills (this.extend (request, params));
        //
        //     {
        //         "meta":{
        //             "after":null,
        //             "before":null,
        //             "limit":10,
        //             "total_count":2
        //         },
        //         "result":[
        //             {
        //                 "commission":"0.008335000000000000",
        //                 "created_at":"2020-11-16T19:07:19Z",
        //                 "fill_type":"normal",
        //                 "id":"e7ff05c233a74245b72381f8dd91d1ce",
        //                 "meta_data":{
        //                     "effective_commission_rate":"0.0005",
        //                     "order_price":"16249",
        //                     "order_size":1,
        //                     "order_type":"market_order",
        //                     "order_unfilled_size":0,
        //                     "trading_fee_credits_used":"0"
        //                 },
        //                 "order_id":"152999629",
        //                 "price":"16669",
        //                 "product":{
        //                     "contract_type":"perpetual_futures",
        //                     "contract_unit_currency":"BTC",
        //                     "contract_value":"0.001",
        //                     "id":139,
        //                     "notional_type":"vanilla",
        //                     "quoting_asset":{"minimum_precision":2,"precision":6,"symbol":"USDT"},
        //                     "settling_asset":{"minimum_precision":2,"precision":6,"symbol":"USDT"},
        //                     "symbol":"BTCUSDT",
        //                     "tick_size":"0.5",
        //                     "underlying_asset":{"minimum_precision":4,"precision":8,"symbol":"BTC"}
        //                 },
        //                 "product_id":139,
        //                 "role":"taker",
        //                 "side":"sell",
        //                 "size":1
        //             }
        //         ],
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseTrades (result, market, since, limit);
    }

    async fetchLedger (code = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            // 'asset_id': currency['numericId'],
            // 'end_time': this.seconds (),
            // 'after': 'string', // after cursor for pagination
            // 'before': 'string', // before cursor for pagination
            // 'page_size': limit,
        };
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['asset_id'] = currency['numericId'];
        }
        if (limit !== undefined) {
            request['page_size'] = limit;
        }
        const response = await this.privateGetWalletTransactions (this.extend (request, params));
        //
        //     {
        //         "meta":{"after":null,"before":null,"limit":10,"total_count":1},
        //         "result":[
        //             {
        //                 "amount":"29.889184",
        //                 "asset_id":5,
        //                 "balance":"29.889184",
        //                 "created_at":"2020-11-15T21:25:01Z",
        //                 "meta_data":{
        //                     "deposit_id":3884,
        //                     "transaction_id":"0x41a60174849828530abb5008e98fc63c9b598288743ec4ba9620bcce900a3b8d"
        //                 },
        //                 "transaction_type":"deposit",
        //                 "user_id":22142,
        //                 "uuid":"70bb5679da3c4637884e2dc63efaa846"
        //             }
        //         ],
        //         "success":true
        //     }
        //
        const result = this.safeValue (response, 'result', []);
        return this.parseLedger (result, currency, since, limit);
    }

    parseLedgerEntryType (type) {
        const types = {
            'pnl': 'pnl',
            'deposit': 'transaction',
            'withdrawal': 'transaction',
            'commission': 'fee',
            'conversion': 'trade',
            // 'perpetual_futures_funding': 'perpetual_futures_funding',
            // 'withdrawal_cancellation': 'withdrawal_cancellation',
            'referral_bonus': 'referral',
            'commission_rebate': 'rebate',
            // 'promo_credit': 'promo_credit',
        };
        return this.safeString (types, type, type);
    }

    parseLedgerEntry (item, currency = undefined) {
        //
        //     {
        //         "amount":"29.889184",
        //         "asset_id":5,
        //         "balance":"29.889184",
        //         "created_at":"2020-11-15T21:25:01Z",
        //         "meta_data":{
        //             "deposit_id":3884,
        //             "transaction_id":"0x41a60174849828530abb5008e98fc63c9b598288743ec4ba9620bcce900a3b8d"
        //         },
        //         "transaction_type":"deposit",
        //         "user_id":22142,
        //         "uuid":"70bb5679da3c4637884e2dc63efaa846"
        //     }
        //
        const id = this.safeString (item, 'uuid');
        let direction = undefined;
        const account = undefined;
        const metaData = this.safeValue (item, 'meta_data', {});
        const referenceId = this.safeString (metaData, 'transaction_id');
        const referenceAccount = undefined;
        let type = this.safeString (item, 'transaction_type');
        if ((type === 'deposit') || (type === 'commission_rebate') || (type === 'referral_bonus') || (type === 'pnl') || (type === 'withdrawal_cancellation') || (type === 'promo_credit')) {
            direction = 'in';
        } else if ((type === 'withdrawal') || (type === 'commission') || (type === 'conversion') || (type === 'perpetual_futures_funding')) {
            direction = 'out';
        }
        type = this.parseLedgerEntryType (type);
        const currencyId = this.safeInteger (item, 'asset_id');
        const currenciesByNumericId = this.safeValue (this.options, 'currenciesByNumericId');
        currency = this.safeValue (currenciesByNumericId, currencyId, currency);
        const code = (currency === undefined) ? undefined : currency['code'];
        const amount = this.safeNumber (item, 'amount');
        const timestamp = this.parse8601 (this.safeString (item, 'created_at'));
        const after = this.safeNumber (item, 'balance');
        const before = Math.max (0, after - amount);
        const status = 'ok';
        return {
            'info': item,
            'id': id,
            'direction': direction,
            'account': account,
            'referenceId': referenceId,
            'referenceAccount': referenceAccount,
            'type': type,
            'currency': code,
            'amount': amount,
            'before': before,
            'after': after,
            'status': status,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fee': undefined,
        };
    }

    async fetchDepositAddress (code, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'asset_symbol': currency['id'],
        };
        const response = await this.privateGetDepositsAddress (this.extend (request, params));
        //
        //     {
        //         "success":true,
        //         "result":{
        //             "id":19628,
        //             "user_id":22142,
        //             "address":"0x0eda26523397534f814d553a065d8e46b4188e9a",
        //             "status":"active",
        //             "updated_at":"2020-11-15T20:25:53.000Z",
        //             "created_at":"2020-11-15T20:25:53.000Z",
        //             "asset_symbol":"USDT",
        //             "custodian":"onc"
        //         }
        //     }
        //
        const result = this.safeValue (response, 'result', {});
        const address = this.safeString (result, 'address');
        this.checkAddress (address);
        return {
            'currency': code,
            'address': address,
            'tag': undefined,
            'network': undefined,
            'info': response,
        };
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

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        // {"error":{"code":"insufficient_margin","context":{"available_balance":"0.000000000000000000","required_additional_balance":"1.618626000000000000000000000"}},"success":false}
        //
        const error = this.safeValue (response, 'error', {});
        const errorCode = this.safeString (error, 'code');
        if (errorCode !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorCode, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
