'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { AuthenticationError, ArgumentsRequired, ExchangeError, InvalidOrder, BadRequest, OrderNotFound, DDoSProtection, BadSymbol } = require ('./base/errors');
const { ROUND, TICK_SIZE } = require ('./base/functions/number');

//  ---------------------------------------------------------------------------

module.exports = class bitmart extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'bitmart',
            'name': 'BitMart',
            'countries': [ 'US', 'CN', 'HK', 'KR' ],
            'rateLimit': 1000,
            'version': 'v1',
            'has': {
                // 'CORS': true,
                // 'cancelAllOrders': true,
                // 'cancelOrder': true,
                // 'createMarketOrder': false,
                // 'createOrder': true,
                // 'fetchBalance': true,
                // 'fetchCanceledOrders': true,
                // 'fetchClosedOrders': true,
                'fetchCurrencies': true,
                'fetchMarkets': true,
                // 'fetchMyTrades': true,
                'fetchOHLCV': true,
                // 'fetchOpenOrders': true,
                // 'fetchOrder': true,
                'fetchOrderBook': true,
                // 'fetchOrders': false,
                // 'fetchOrderTrades': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': true,
                'fetchTrades': true,
            },
            'hostname': 'bitmart.com', // bitmart.info for Hong Kong users
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/61835713-a2662f80-ae85-11e9-9d00-6442919701fd.jpg',
                'api': 'https://api-cloud.{hostname}', // bitmart.info for Hong Kong users
                'www': 'https://www.bitmart.com/',
                'doc': 'https://github.com/bitmartexchange/bitmart-official-api-docs',
                'referral': 'http://www.bitmart.com/?r=rQCFLh',
                'fees': 'https://www.bitmart.com/fee/en',
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'api': {
                'public': {
                    'system': {
                        'get': [
                            'time', // https://api-cloud.bitmart.com/system/time
                            'service', // https://api-cloud.bitmart.com/system/service
                        ],
                    },
                    'account': {
                        'get': [
                            'currencies', // https://api-cloud.bitmart.com/account/v1/currencies
                        ],
                    },
                    'spot': {
                        'get': [
                            'currencies',
                            'symbols',
                            'symbols/details',
                            'ticker', // ?symbol=BTC_USDT
                            'steps', // ?symbol=BMX_ETH
                            'symbols/kline', // ?symbol=BMX_ETH&step=15&from=1525760116&to=1525769116
                            'symbols/book', // ?symbol=BMX_ETH&precision=6
                            'symbols/trades', // ?symbol=BMX_ETH
                        ],
                    },
                    'contract': {
                        'get': [
                            'contracts', // https://api-cloud.bitmart.com/contract/v1/ifcontract/contracts
                            'pnls',
                            'indexes',
                            'tickers',
                            'quote',
                            'indexquote',
                            'trades',
                            'depth',
                            'fundingrate',
                        ],
                    },
                },
                'private': {
                    'account': {
                        'get': [
                            'wallet', // ?account_type=1
                            'deposit/address', // ?currency=USDT-TRC20
                            'withdraw/charge', // ?currency=BTC
                            'deposit-withdraw/history', // ?limit=10&offset=1&operationType=withdraw
                            'deposit-withdraw/detail', // ?id=1679952
                        ],
                        'post': [
                            'withdraw/apply',
                        ],
                    },
                    'spot': {
                        'get': [
                            'wallet',
                            'order_detail',
                            'orders',
                            'trades',
                        ],
                        'post': [
                            'submit_order', // https://api-cloud.bitmart.com/spot/v1/submit_order
                            'cancel_order', // https://api-cloud.bitmart.com/spot/v2/cancel_order
                            'cancel_orders',
                        ],
                    },
                    'contract': {
                        'get': [
                            'userOrders',
                            'userOrderInfo',
                            'userTrades',
                            'orderTrades',
                            'accounts',
                            'userPositions',
                            'userLiqRecords',
                            'positionFee',
                        ],
                        'post': [
                            'batchOrders',
                            'submitOrder',
                            'cancelOrders',
                            'marginOper',
                        ],
                    },
                },
                //
                // ----------------------------------------------------------------------------
                //
                // 'token': {
                //     'post': [
                //         'authentication',
                //     ],
                // },
                // 'public': {
                //     'get': [
                //         'currencies',
                //         'ping',
                //         'steps',
                //         'symbols',
                //         'symbols_details',
                //         'symbols/{symbol}/kline',
                //         'symbols/{symbol}/orders',
                //         'symbols/{symbol}/trades',
                //         'ticker',
                //         'time',
                //     ],
                // },
                // 'private': {
                //     'get': [
                //         'orders',
                //         'orders/{id}',
                //         'trades',
                //         'wallet',
                //     ],
                //     'post': [
                //         'orders',
                //     ],
                //     'delete': [
                //         'orders',
                //         'orders/{id}',
                //     ],
                // },
            },
            'timeframes': {
                '1m': 1,
                '3m': 3,
                '5m': 5,
                '15m': 15,
                '30m': 30,
                '45m': 45,
                '1h': 60,
                '2h': 120,
                '3h': 180,
                '4h': 240,
                '1d': 1440,
                '1w': 10080,
                '1M': 43200,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'taker': 0.002,
                    'maker': 0.001,
                    'tiers': {
                        'taker': [
                            [0, 0.20 / 100],
                            [10, 0.18 / 100],
                            [50, 0.16 / 100],
                            [250, 0.14 / 100],
                            [1000, 0.12 / 100],
                            [5000, 0.10 / 100],
                            [25000, 0.08 / 100],
                            [50000, 0.06 / 100],
                        ],
                        'maker': [
                            [0, 0.1 / 100],
                            [10, 0.09 / 100],
                            [50, 0.08 / 100],
                            [250, 0.07 / 100],
                            [1000, 0.06 / 100],
                            [5000, 0.05 / 100],
                            [25000, 0.04 / 100],
                            [50000, 0.03 / 100],
                        ],
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                'exact': {
                    'Place order error': InvalidOrder, // {"message":"Place order error"}
                    'Not found': OrderNotFound, // {"message":"Not found"}
                    'Visit too often, please try again later': DDoSProtection, // {"code":-30,"msg":"Visit too often, please try again later","subMsg":"","data":{}}
                    'Unknown symbol': BadSymbol, // {"message":"Unknown symbol"}
                    'Unauthorized': AuthenticationError,
                },
                'broad': {
                    'Invalid limit. limit must be in the range': InvalidOrder,
                    'Maximum price is': InvalidOrder, // {"message":"Maximum price is 0.112695"}
                    // {"message":"Required Integer parameter 'status' is not present"}
                    // {"message":"Required String parameter 'symbol' is not present"}
                    // {"message":"Required Integer parameter 'offset' is not present"}
                    // {"message":"Required Integer parameter 'limit' is not present"}
                    // {"message":"Required Long parameter 'from' is not present"}
                    // {"message":"Required Long parameter 'to' is not present"}
                    'is not present': BadRequest,
                },
            },
            'commonCurrencies': {
                'ONE': 'Menlo One',
                'PLA': 'Plair',
            },
        });
    }

    async fetchTime (params = {}) {
        const response = await this.publicGetTime (params);
        //
        //     {
        //         "server_time": 1527777538000
        //     }
        //
        return this.safeInteger (response, 'server_time');
    }

    async fetchSpotMarkets (params = {}) {
        const response = await this.publicSpotGetSymbolsDetails (params);
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"a67c9146-086d-4d3f-9897-5636a9bb26e1",
        //         "data":{
        //             "symbols":[
        //                 {
        //                     "symbol":"PRQ_BTC",
        //                     "symbol_id":1232,
        //                     "base_currency":"PRQ",
        //                     "quote_currency":"BTC",
        //                     "quote_increment":"1.0000000000",
        //                     "base_min_size":"1.0000000000",
        //                     "base_max_size":"10000000.0000000000",
        //                     "price_min_precision":8,
        //                     "price_max_precision":10,
        //                     "expiration":"NA",
        //                     "min_buy_amount":"0.0001000000",
        //                     "min_sell_amount":"0.0001000000"
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const symbols = this.safeValue (data, 'symbols', []);
        const result = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = symbols[i];
            const id = this.safeString (market, 'symbol');
            const numericId = this.safeInteger (market, 'symbol_id');
            const baseId = this.safeString (market, 'base_currency');
            const quoteId = this.safeString (market, 'quote_currency');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            //
            // https://github.com/bitmartexchange/bitmart-official-api-docs/blob/master/rest/public/symbols_details.md#response-details
            // from the above API doc:
            // quote_increment Minimum order price as well as the price increment
            // price_min_precision Minimum price precision (digit) used to query price and kline
            // price_max_precision Maximum price precision (digit) used to query price and kline
            //
            // the docs are wrong: https://github.com/ccxt/ccxt/issues/5612
            //
            const pricePrecision = this.safeInteger (market, 'price_max_precision');
            const precision = {
                'amount': this.safeFloat (market, 'quote_increment'),
                'price': parseFloat (this.decimalToPrecision (Math.pow (10, -pricePrecision), ROUND, 10)),
            };
            const minBuyCost = this.safeFloat (market, 'min_buy_amount');
            const minSellCost = this.safeFloat (market, 'min_sell_amount');
            const minCost = Math.max (minBuyCost, minSellCost);
            const limits = {
                'amount': {
                    'min': this.safeFloat (market, 'base_min_size'),
                    'max': this.safeFloat (market, 'base_max_size'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': minCost,
                    'max': undefined,
                },
            };
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
                'future': false,
                'swap': false,
                'precision': precision,
                'limits': limits,
                'info': market,
                'active': undefined,
            });
        }
        return result;
    }

    async fetchContractMarkets (params = {}) {
        const response = await this.publicContractGetContracts (params);
        //
        //     {
        //         "errno":"OK",
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"7fcedfb5-a660-4780-8a7a-b36a9e2159f7",
        //         "data":{
        //             "contracts":[
        //                 {
        //                     "contract":{
        //                         "contract_id":1,
        //                         "index_id":1,
        //                         "name":"BTCUSDT",
        //                         "display_name":"BTCUSDT永续合约",
        //                         "display_name_en":"BTCUSDT_SWAP",
        //                         "contract_type":1,
        //                         "base_coin":"BTC",
        //                         "quote_coin":"USDT",
        //                         "price_coin":"BTC",
        //                         "exchange":"*",
        //                         "contract_size":"0.0001",
        //                         "begin_at":"2018-08-17T04:00:00Z",
        //                         "delive_at":"2020-08-15T12:00:00Z",
        //                         "delivery_cycle":28800,
        //                         "min_leverage":"1",
        //                         "max_leverage":"100",
        //                         "price_unit":"0.1",
        //                         "vol_unit":"1",
        //                         "value_unit":"0.0001",
        //                         "min_vol":"1",
        //                         "max_vol":"300000",
        //                         "liquidation_warn_ratio":"0.85",
        //                         "fast_liquidation_ratio":"0.8",
        //                         "settgle_type":1,
        //                         "open_type":3,
        //                         "compensate_type":1,
        //                         "status":3,
        //                         "block":1,
        //                         "rank":1,
        //                         "created_at":"2018-07-12T19:16:57Z",
        //                         "depth_bord":"1.001",
        //                         "base_coin_zh":"比特币",
        //                         "base_coin_en":"Bitcoin",
        //                         "max_rate":"0.00375",
        //                         "min_rate":"-0.00375"
        //                     },
        //                     "risk_limit":{"contract_id":1,"base_limit":"1000000","step":"500000","maintenance_margin":"0.005","initial_margin":"0.01"},
        //                     "fee_config":{"contract_id":1,"maker_fee":"-0.0003","taker_fee":"0.001","settlement_fee":"0","created_at":"2018-07-12T20:47:22Z"},
        //                     "plan_order_config":{"contract_id":0,"min_scope":"0.001","max_scope":"2","max_count":10,"min_life_cycle":24,"max_life_cycle":168}
        //                 },
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const contracts = this.safeValue (data, 'contracts', []);
        const result = [];
        for (let i = 0; i < contracts.length; i++) {
            const market = contracts[i];
            const contract = this.safeValue (market, 'contract', {});
            const id = this.safeString (contract, 'contract_id');
            const numericId = this.safeInteger (contract, 'contract_id');
            const baseId = this.safeString (contract, 'base_coin');
            const quoteId = this.safeString (contract, 'quote_coin');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = this.safeString (contract, 'name');
            //
            // https://github.com/bitmartexchange/bitmart-official-api-docs/blob/master/rest/public/symbols_details.md#response-details
            // from the above API doc:
            // quote_increment Minimum order price as well as the price increment
            // price_min_precision Minimum price precision (digit) used to query price and kline
            // price_max_precision Maximum price precision (digit) used to query price and kline
            //
            // the docs are wrong: https://github.com/ccxt/ccxt/issues/5612
            //
            const amountPrecision = this.safeFloat (contract, 'vol_unit');
            const pricePrecision = this.safeFloat (contract, 'price_unit');
            const precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
            };
            const limits = {
                'amount': {
                    'min': this.safeFloat (contract, 'min_vol'),
                    'max': this.safeFloat (contract, 'max_vol'),
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            const contractType = this.safeValue (contract, 'contract_type');
            let future = false;
            let swap = false;
            let type = 'contract';
            if (contractType === 1) {
                type = 'swap';
                swap = true;
            } else if (contractType === 2) {
                type = 'future';
                future = true;
            }
            const feeConfig = this.safeValue (market, 'fee_config', {});
            const maker = this.safeFloat (feeConfig, 'maker_fee');
            const taker = this.safeFloat (feeConfig, 'taker_fee');
            result.push ({
                'id': id,
                'numericId': numericId,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'maker': maker,
                'taker': taker,
                'type': type,
                'spot': false,
                'future': future,
                'swap': swap,
                'precision': precision,
                'limits': limits,
                'info': market,
                'active': undefined,
            });
        }
        return result;
    }

    async fetchMarkets (params = {}) {
        const spotMarkets = await this.fetchSpotMarkets ();
        const contractMarkets = await this.fetchContractMarkets ();
        const allMarkets = this.arrayConcat (spotMarkets, contractMarkets);
        return allMarkets;
    }

    parseTicker (ticker, market = undefined) {
        //
        // spot
        //
        //     {
        //         "symbol":"ETH_BTC",
        //         "last_price":"0.036037",
        //         "quote_volume_24h":"4380.6660000000",
        //         "base_volume_24h":"159.3582006712",
        //         "high_24h":"0.036972",
        //         "low_24h":"0.035524",
        //         "open_24h":"0.036561",
        //         "close_24h":"0.036037",
        //         "best_ask":"0.036077",
        //         "best_ask_size":"9.9500",
        //         "best_bid":"0.035983",
        //         "best_bid_size":"4.2792",
        //         "fluctuation":"-0.0143",
        //         "url":"https://www.bitmart.com/trade?symbol=ETH_BTC"
        //     }
        //
        // contract
        //
        //     {
        //         "last_price":"422.2",
        //         "open":"430.5",
        //         "close":"422.2",
        //         "low":"421.9",
        //         "high":"436.9",
        //         "avg_price":"430.8569900089815372072",
        //         "volume":"2720",
        //         "total_volume":"18912248",
        //         "timestamp":1597631495,
        //         "rise_fall_rate":"-0.0192799070847851336",
        //         "rise_fall_value":"-8.3",
        //         "contract_id":2,
        //         "position_size":"3067404",
        //         "volume_day":"9557384",
        //         "amount24":"80995537.0919999999999974153",
        //         "base_coin_volume":"189122.48",
        //         "quote_coin_volume":"81484742.475833810590837937856",
        //         "pps":"1274350547",
        //         "index_price":"422.135",
        //         "fair_price":"422.147253318507",
        //         "depth_price":{"bid_price":"421.9","ask_price":"422","mid_price":"421.95"},
        //         "fair_basis":"0.000029027013",
        //         "fair_value":"0.012253318507",
        //         "rate":{"quote_rate":"0.0006","base_rate":"0.0003","interest_rate":"0.000099999999"},
        //         "premium_index":"0.000045851604",
        //         "funding_rate":"0.000158",
        //         "next_funding_rate":"0.000099999999",
        //         "next_funding_at":"2020-08-17T04:00:00Z"
        //     }
        //
        const timestamp = this.safeTimestamp (ticker, 'timestamp', this.milliseconds ());
        const marketId = this.safeString2 (ticker, 'symbol', 'contract_id');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else if (marketId !== undefined) {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const last = this.safeFloat2 (ticker, 'close_24h', 'last_price');
        let percentage = this.safeFloat (ticker, 'fluctuation', 'rise_fall_rate');
        if (percentage !== undefined) {
            percentage *= 100;
        }
        // bitmart base/quote reversed
        const baseVolume = this.safeFloat2 (ticker, 'quote_volume_24h', 'base_coin_volume');
        const quoteVolume = this.safeFloat2 (ticker, 'base_volume_24h', 'quote_coin_volume');
        let vwap = undefined;
        if ((quoteVolume !== undefined) && (baseVolume !== undefined) && (baseVolume !== 0)) {
            vwap = quoteVolume / baseVolume;
        }
        const open = this.safeFloat2 (ticker, 'open_24h', 'open');
        let average = undefined;
        if ((last !== undefined) && (open !== undefined)) {
            average = this.sum (last, open) / 2;
        }
        average = this.safeFloat (ticker, 'avg_price', average);
        const price = this.safeValue (ticker, 'depth_price', ticker);
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeFloat2 (ticker, 'high', 'high_24h'),
            'low': this.safeFloat2 (ticker, 'low', 'low_24h'),
            'bid': this.safeFloat (price, 'best_bid', 'bid_price'),
            'bidVolume': this.safeFloat (ticker, 'best_bid_size'),
            'ask': this.safeFloat (price, 'best_ask','ask_price'),
            'askVolume': this.safeFloat (ticker, 'best_ask_size'),
            'vwap': vwap,
            'open': this.safeFloat (ticker, 'open_24h'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
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
        const request = {};
        let method = undefined;
        if (market['swap'] || market['future']) {
            method = 'publicContractGetTickers';
            request['contractID'] = market['id'];
        } else if (market['spot']) {
            method = 'publicSpotGetTicker';
            request['symbol'] = market['id'];
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"6aa5b923-2f57-46e3-876d-feca190e0b82",
        //         "data":{
        //             "tickers":[
        //                 {
        //                     "symbol":"ETH_BTC",
        //                     "last_price":"0.036037",
        //                     "quote_volume_24h":"4380.6660000000",
        //                     "base_volume_24h":"159.3582006712",
        //                     "high_24h":"0.036972",
        //                     "low_24h":"0.035524",
        //                     "open_24h":"0.036561",
        //                     "close_24h":"0.036037",
        //                     "best_ask":"0.036077",
        //                     "best_ask_size":"9.9500",
        //                     "best_bid":"0.035983",
        //                     "best_bid_size":"4.2792",
        //                     "fluctuation":"-0.0143",
        //                     "url":"https://www.bitmart.com/trade?symbol=ETH_BTC"
        //                 }
        //             ]
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "errno":"OK",
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"d09b57c4-d99b-4a13-91a8-2df98f889909",
        //         "data":{
        //             "tickers":[
        //                 {
        //                     "last_price":"422.2",
        //                     "open":"430.5",
        //                     "close":"422.2",
        //                     "low":"421.9",
        //                     "high":"436.9",
        //                     "avg_price":"430.8569900089815372072",
        //                     "volume":"2720",
        //                     "total_volume":"18912248",
        //                     "timestamp":1597631495,
        //                     "rise_fall_rate":"-0.0192799070847851336",
        //                     "rise_fall_value":"-8.3",
        //                     "contract_id":2,
        //                     "position_size":"3067404",
        //                     "volume_day":"9557384",
        //                     "amount24":"80995537.0919999999999974153",
        //                     "base_coin_volume":"189122.48",
        //                     "quote_coin_volume":"81484742.475833810590837937856",
        //                     "pps":"1274350547",
        //                     "index_price":"422.135",
        //                     "fair_price":"422.147253318507",
        //                     "depth_price":{"bid_price":"421.9","ask_price":"422","mid_price":"421.95"},
        //                     "fair_basis":"0.000029027013",
        //                     "fair_value":"0.012253318507",
        //                     "rate":{"quote_rate":"0.0006","base_rate":"0.0003","interest_rate":"0.000099999999"},
        //                     "premium_index":"0.000045851604",
        //                     "funding_rate":"0.000158",
        //                     "next_funding_rate":"0.000099999999",
        //                     "next_funding_at":"2020-08-17T04:00:00Z"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const tickers = this.safeValue (data, 'tickers', []);
        const tickersById = this.indexBy (tickers, 'symbol');
        const ticker = this.safeValue (tickersById, market['id']);
        return this.parseTicker (ticker, market);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const defaultType = this.safeString (this.options, 'defaultType', 'spot');
        const type = this.safeString (params, 'type', defaultType);
        params = this.omit (params, 'type');
        let method = undefined;
        if ((type === 'swap') || (type === 'future')) {
            method = 'publicContractGetTickers';
        } else if (type === 'spot') {
            method = 'publicSpotGetTicker';
        }
        const response = await this[method] (params);
        const data = this.safeValue (response, 'data', {});
        const tickers = this.safeValue (data, 'tickers', []);
        const result = {};
        for (let i = 0; i < tickers.length; i++) {
            const ticker = this.parseTicker (tickers[i]);
            const symbol = ticker['symbol'];
            result[symbol] = ticker;
        }
        return this.filterByArray (result, 'symbol', symbols);
    }

    async fetchCurrencies (params = {}) {
        const response = await this.publicAccountGetCurrencies (params);
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"8c768b3c-025f-413f-bec5-6d6411d46883",
        //         "data":{
        //             "currencies":[
        //                 {"currency":"MATIC","name":"Matic Network","withdraw_enabled":true,"deposit_enabled":true},
        //                 {"currency":"KTN","name":"Kasoutuuka News","withdraw_enabled":true,"deposit_enabled":false},
        //                 {"currency":"BRT","name":"Berith","withdraw_enabled":true,"deposit_enabled":true},
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const currencies = this.safeValue (data, 'currencies', []);
        const result = {};
        for (let i = 0; i < currencies.length; i++) {
            const currency = currencies[i];
            const id = this.safeString (currency, 'id');
            const code = this.safeCurrencyCode (id);
            const name = this.safeString (currency, 'name');
            const withdrawEnabled = this.safeValue (currency, 'withdraw_enabled');
            const depositEnabled = this.safeValue (currency, 'deposit_enabled');
            const active = withdrawEnabled && depositEnabled;
            result[code] = {
                'id': id,
                'code': code,
                'name': name,
                'info': currency, // the original payload
                'active': active,
                'fee': undefined,
                'precision': undefined,
                'limits': {
                    'amount': { 'min': undefined, 'max': undefined },
                    'price': { 'min': undefined, 'max': undefined },
                    'cost': { 'min': undefined, 'max': undefined },
                    'withdraw': { 'min': undefined, 'max': undefined },
                },
            };
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {};
        let method = undefined;
        if (market['spot']) {
            method = 'publicSpotGetSymbolsBook';
            request['symbol'] = market['id'];
            // request['precision'] = 4; // optional price precision / depth level whose range is defined in symbol details
        } else if (market['swap'] || market['future']) {
            method = 'publicContractGetDepth';
            request['contractID'] = market['id'];
            if (limit !== undefined) {
                request['count'] = limit; // returns all records if size is omitted
            }
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"8254f8fc-431d-404f-ad9a-e716339f66c7",
        //         "data":{
        //             "buys":[
        //                 {"amount":"4.7091","total":"4.71","price":"0.034047","count":"1"},
        //                 {"amount":"5.7439","total":"10.45","price":"0.034039","count":"1"},
        //                 {"amount":"2.5249","total":"12.98","price":"0.032937","count":"1"},
        //             ],
        //             "sells":[
        //                 {"amount":"41.4365","total":"41.44","price":"0.034174","count":"1"},
        //                 {"amount":"4.2317","total":"45.67","price":"0.034183","count":"1"},
        //                 {"amount":"0.3000","total":"45.97","price":"0.034240","count":"1"},
        //             ]
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "errno":"OK",
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"c330dfca-ca5b-4f15-b350-9fef3f049b4f",
        //         "data":{
        //             "sells":[
        //                 {"price":"347.6","vol":"6678"},
        //                 {"price":"347.7","vol":"3452"},
        //                 {"price":"347.8","vol":"6331"},
        //             ],
        //             "buys":[
        //                 {"price":"347.5","vol":"6222"},
        //                 {"price":"347.4","vol":"20979"},
        //                 {"price":"347.3","vol":"15179"},
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        if (market['spot']) {
            return this.parseOrderBook (data, undefined, 'buys', 'sells', 'price', 'amount');
        } else if (market['swap'] || market['future']) {
            return this.parseOrderBook (data, undefined, 'buys', 'sells', 'price', 'vol');
        }
    }

    parseTrade (trade, market = undefined) {
        //
        // public fetchTrades spot
        //
        //     {
        //         "amount":"0.005703",
        //         "order_time":1599652045394,
        //         "price":"0.034029",
        //         "count":"0.1676",
        //         "type":"sell"
        //     }
        //
        // public fetchTrades contract
        //
        //     {
        //         "order_id":109159616160,
        //         "trade_id":109159616197,
        //         "contract_id":2,
        //         "deal_price":"347.6",
        //         "deal_vol":"5623",
        //         "make_fee":"-5.8636644",
        //         "take_fee":"9.772774",
        //         "created_at":"2020-09-09T11:49:50.749170536Z",
        //         "way":1,
        //         "fluctuation":"0"
        //     }
        //
        // private fetchMyTrades
        //
        //     ...
        //
        const id = this.safeString (trade, 'trade_id');
        let timestamp = this.safeInteger2 (trade, 'order_time');
        if (timestamp === undefined) {
            timestamp = this.parse8601 (this.safeString (trade, 'created_at'));
        }
        const type = undefined;
        const way = this.safeInteger (trade, 'way');
        let side = this.safeStringLower (trade, 'type');
        if ((side === undefined) && (way !== undefined)) {
            if (way < 5) {
                side = 'buy;'
            } else {
                side = 'sell';
            }
        }
        const price = this.safeFloat2 (trade, 'price', 'deal_price');
        const amount = this.safeFloat2 (trade, 'amount', 'deal_vol');
        let cost = this.safeFloat (trade, 'count');
        if ((cost === undefined) && (price !== undefined) && (amount !== undefined)) {
            cost = amount * price;
        }
        const orderId = this.safeInteger (trade, 'order_id');
        const marketId = this.safeString (trade, 'contract_id');
        let symbol = undefined;
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if (symbol === undefined) {
            if (market !== undefined) {
                symbol = market['symbol'];
            }
        }
        const feeCost = this.safeFloat (trade, 'fees');
        let fee = undefined;
        if (feeCost !== undefined) {
            let feeCurrencyCode = undefined;
            if (market !== undefined) {
                feeCurrencyCode = (side === 'buy') ? market['base'] : market['quote'];
            }
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
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
            'takerOrMaker': undefined,
            'fee': fee,
        };
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        let method = undefined;
        if (market['spot']) {
            request['symbol'] = market['id'];
            method = 'publicSpotGetSymbolsTrades';
        } else if (market['swap'] || market['future']) {
            method = 'publicContractGetTrades';
            request['contractID'] = market['id'];
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"222d74c0-8f6d-49d9-8e1b-98118c50eeba",
        //         "data":{
        //             "trades":[
        //                 {
        //                     "amount":"0.005703",
        //                     "order_time":1599652045394,
        //                     "price":"0.034029",
        //                     "count":"0.1676",
        //                     "type":"sell"
        //                 },
        //             ]
        //         }
        //     }
        //
        // contract
        //
        //     {
        //         "errno":"OK",
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"782bc746-b86e-43bf-8d1a-c68b479c9bdd",
        //         "data":{
        //             "trades":[
        //                 {
        //                     "order_id":109159616160,
        //                     "trade_id":109159616197,
        //                     "contract_id":2,
        //                     "deal_price":"347.6",
        //                     "deal_vol":"5623",
        //                     "make_fee":"-5.8636644",
        //                     "take_fee":"9.772774",
        //                     "created_at":"2020-09-09T11:49:50.749170536Z",
        //                     "way":1,
        //                     "fluctuation":"0"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        const trades = this.safeValue (data, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        // spot
        //
        //     {
        //         "last_price":"0.034987",
        //         "timestamp":1598787420,
        //         "volume":"1.0198",
        //         "open":"0.035007",
        //         "close":"0.034987",
        //         "high":"0.035007",
        //         "low":"0.034986"
        //     }
        //
        // contract
        //
        //     {
        //         "low":"404.4",
        //         "high":"404.4",
        //         "open":"404.4",
        //         "close":"404.4",
        //         "last_price":"404.4",
        //         "avg_price":"404.4",
        //         "volume":"7670",
        //         "timestamp":1598758441,
        //         "rise_fall_rate":"0",
        //         "rise_fall_value":"0",
        //         "base_coin_volume":"76.7",
        //         "quote_coin_volume":"31017.48"
        //     }
        //
        return [
            this.safeTimestamp (ohlcv, 'timestamp'),
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
        const type = market['type'];
        let method = undefined;
        const request = {};
        const duration = this.parseTimeframe (timeframe);
        if (type === 'spot') {
            method = 'publicSpotGetSymbolsKline';
            request['symbol'] = market['id'];
            request['step'] = this.timeframes[timeframe];
            // the exchange will return an empty array if more than 500 candles is requested
            const maxLimit = 500;
            if (limit === undefined) {
                limit = maxLimit;
            }
            limit = Math.min (maxLimit, limit);
            if (since === undefined) {
                const end = parseInt (this.milliseconds () / 1000);
                const start = end - limit * duration;
                request['from'] = start;
                request['to'] = end;
            } else {
                const start = parseInt (since / 1000);
                const end = this.sum (start, limit * duration);
                request['from'] = start;
                request['to'] = end;
            }
        } else if ((type === 'swap') || (type === 'future')) {
            method = 'publicContractGetQuote';
            request['contractID'] = market['id'];
            const defaultLimit = 500;
            if (limit === undefined) {
                limit = defaultLimit;
            }
            if (since === undefined) {
                const end = parseInt (this.milliseconds () / 1000);
                const start = end - limit * duration;
                request['startTime'] = start;
                request['endTime'] = end;
            } else {
                const start = parseInt (since / 1000);
                const end = this.sum (start, limit * duration);
                request['startTime'] = start;
                request['endTime'] = end;
            }
            request['unit'] = this.timeframes[timeframe];
            request['resolution'] = 'M';
        }
        const response = await this[method] (this.extend (request, params));
        //
        // spot
        //
        //     {
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"80d86378-ab4e-4c70-819e-b42146cf87ad",
        //         "data":{
        //             "klines":[
        //                 {"last_price":"0.034987","timestamp":1598787420,"volume":"1.0198","open":"0.035007","close":"0.034987","high":"0.035007","low":"0.034986"},
        //                 {"last_price":"0.034986","timestamp":1598787480,"volume":"0.3959","open":"0.034982","close":"0.034986","high":"0.034986","low":"0.034980"},
        //                 {"last_price":"0.034978","timestamp":1598787540,"volume":"0.3259","open":"0.034987","close":"0.034978","high":"0.034987","low":"0.034977"},
        //             ]
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         "errno":"OK",
        //         "message":"OK",
        //         "code":1000,
        //         "trace":"32965074-5804-4655-b693-e953e36026a0",
        //         "data":[
        //             {"low":"404.4","high":"404.4","open":"404.4","close":"404.4","last_price":"404.4","avg_price":"404.4","volume":"7670","timestamp":1598758441,"rise_fall_rate":"0","rise_fall_value":"0","base_coin_volume":"76.7","quote_coin_volume":"31017.48"},
        //             {"low":"404.1","high":"404.4","open":"404.4","close":"404.1","last_price":"404.1","avg_price":"404.15881086","volume":"12076","timestamp":1598758501,"rise_fall_rate":"-0.000741839762611276","rise_fall_value":"-0.3","base_coin_volume":"120.76","quote_coin_volume":"48806.2179994536"},
        //             {"low":"404","high":"404.3","open":"404.1","close":"404","last_price":"404","avg_price":"404.08918918","volume":"740","timestamp":1598758561,"rise_fall_rate":"-0.000247463499133878","rise_fall_value":"-0.1","base_coin_volume":"7.4","quote_coin_volume":"2990.259999932"},
        //         ]
        //     }
        //
        const data = this.safeValue (response, 'data', {});
        if (Array.isArray (data)) {
            return this.parseOHLCVs (data, market, timeframe, since, limit);
        } else {
            const klines = this.safeValue (data, 'klines', []);
            return this.parseOHLCVs (klines, market, timeframe, since, limit);
        }
    }




    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        // limit is required, must be in the range (0, 50)
        const maxLimit = 50;
        limit = (limit === undefined) ? maxLimit : Math.min (limit, maxLimit);
        const request = {
            'symbol': market['id'],
            'offset': 0, // current page, starts from 0
            'limit': limit, // required
        };
        const response = await this.privateGetTrades (this.extend (request, params));
        //
        //     {
        //         "total_trades": 216,
        //         "total_pages": 22,
        //         "current_page": 0,
        //         "trades": [
        //             {
        //                 "symbol": "BMX_ETH",
        //                 "amount": "1.0",
        //                 "fees": "0.0005000000",
        //                 "trade_id": 2734956,
        //                 "price": "0.00013737",
        //                 "active": true,
        //                 "entrust_id": 5576623,
        //                 "timestamp": 1545292334000
        //             },
        //         ]
        //     }
        //
        const trades = this.safeValue (response, 'trades', []);
        return this.parseTrades (trades, market, since, limit);
    }

    async fetchOrderTrades (id, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'entrust_id': id,
        };
        return await this.fetchMyTrades (symbol, since, limit, this.extend (request, params));
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetWallet (params);
        //
        //     [
        //         {
        //             "name":"Bitcoin",
        //             "available":"0.0000000000",
        //             "frozen":"0.0000000000",
        //             "id":"BTC"
        //         }
        //     ]
        //
        const result = { 'info': response };
        for (let i = 0; i < response.length; i++) {
            const balance = response[i];
            const currencyId = this.safeString (balance, 'id');
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['free'] = this.safeFloat (balance, 'available');
            account['used'] = this.safeFloat (balance, 'frozen');
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    parseOrder (order, market = undefined) {
        //
        // createOrder
        //
        //     {
        //         "entrust_id":1223181
        //     }
        //
        // cancelOrder
        //
        //     {}
        //
        // fetchOrder, fetchOrdersByStatus, fetchOpenOrders, fetchClosedOrders
        //
        //     {
        //         "entrust_id":1223181,
        //         "symbol":"BMX_ETH",
        //         "timestamp":1528060666000,
        //         "side":"buy",
        //         "price":"1.000000",
        //         "fees":"0.1",
        //         "original_amount":"1",
        //         "executed_amount":"1",
        //         "remaining_amount":"0",
        //         "status":3
        //     }
        //
        const id = this.safeString (order, 'entrust_id');
        const timestamp = this.safeInteger (order, 'timestamp', this.milliseconds ());
        const status = this.parseOrderStatus (this.safeString (order, 'status'));
        let symbol = undefined;
        const marketId = this.safeString (order, 'symbol');
        if (marketId !== undefined) {
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
            } else {
                const [ baseId, quoteId ] = marketId.split ('_');
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                symbol = base + '/' + quote;
            }
        }
        if ((symbol === undefined) && (market !== undefined)) {
            symbol = market['symbol'];
        }
        const price = this.safeFloat (order, 'price');
        const amount = this.safeFloat (order, 'original_amount');
        let cost = undefined;
        let filled = this.safeFloat (order, 'executed_amount');
        let remaining = this.safeFloat (order, 'remaining_amount');
        if (amount !== undefined) {
            if (remaining !== undefined) {
                if (filled === undefined) {
                    filled = Math.max (0, amount - remaining);
                }
            }
            if (filled !== undefined) {
                if (remaining === undefined) {
                    remaining = Math.max (0, amount - filled);
                }
                if (cost === undefined) {
                    if (price !== undefined) {
                        cost = price * filled;
                    }
                }
            }
        }
        const side = this.safeString (order, 'side');
        const type = undefined;
        return {
            'id': id,
            'clientOrderId': undefined,
            'info': order,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': undefined,
        };
    }

    parseOrderStatus (status) {
        const statuses = {
            '0': 'all',
            '1': 'open',
            '2': 'open',
            '3': 'closed',
            '4': 'canceled',
            '5': 'open',
            '6': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        if (type !== 'limit') {
            throw new ExchangeError (this.id + ' allows limit orders only');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'side': side.toLowerCase (),
            'amount': this.amountToPrecision (symbol, amount),
            'price': this.priceToPrecision (symbol, price),
        };
        const response = await this.privatePostOrders (this.extend (request, params));
        //
        //     {
        //         "entrust_id":1223181
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const intId = parseInt (id);
        const request = {
            'id': intId,
            'entrust_id': intId,
        };
        const response = await this.privateDeleteOrdersId (this.extend (request, params));
        //
        // responds with an empty object {}
        //
        return this.parseOrder (response);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrders requires a symbol argument');
        }
        const side = this.safeString (params, 'side');
        if (side === undefined) {
            throw new ArgumentsRequired (this.id + " cancelAllOrders requires a `side` parameter ('buy' or 'sell')");
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'side': side, // 'buy' or 'sell'
        };
        const response = await this.privateDeleteOrders (this.extend (request, params));
        //
        // responds with an empty object {}
        //
        return response;
    }

    async fetchOrdersByStatus (status, symbol = undefined, since = undefined, limit = undefined, params = {}) {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrdersByStatus requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (limit === undefined) {
            limit = 500; // default 500, max 1000
        }
        const request = {
            'symbol': market['id'],
            'status': status,
            'offset': 0, // current page, starts from 0
            'limit': limit,
        };
        const response = await this.privateGetOrders (this.extend (request, params));
        //
        //     {
        //         "orders":[
        //             {
        //                 "entrust_id":1223181,
        //                 "symbol":"BMX_ETH",
        //                 "timestamp":1528060666000,
        //                 "side":"buy",
        //                 "price":"1.000000",
        //                 "fees":"0.1",
        //                 "original_amount":"1",
        //                 "executed_amount":"1",
        //                 "remaining_amount":"0",
        //                 "status":3
        //             }
        //         ],
        //         "total_pages":1,
        //         "total_orders":1,
        //         "current_page":0,
        //     }
        //
        const orders = this.safeValue (response, 'orders', []);
        return this.parseOrders (orders, market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // 5 = pending & partially filled orders
        return await this.fetchOrdersByStatus (5, symbol, since, limit, params);
    }

    async fetchClosedOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // 3 = closed orders
        return await this.fetchOrdersByStatus (3, symbol, since, limit, params);
    }

    async fetchCanceledOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // 4 = canceled orders
        return await this.fetchOrdersByStatus (4, symbol, since, limit, params);
    }

    async fetchOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'id': id,
        };
        const response = await this.privateGetOrdersId (this.extend (request, params));
        //
        //     {
        //         "entrust_id":1223181,
        //         "symbol":"BMX_ETH",
        //         "timestamp":1528060666000,
        //         "side":"buy",
        //         "price":"1.000000",
        //         "fees":"0.1",
        //         "original_amount":"1",
        //         "executed_amount":"1",
        //         "remaining_amount":"0",
        //         "status":3
        //     }
        //
        return this.parseOrder (response);
    }

    nonce () {
        return this.milliseconds ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const baseUrl = this.implodeParams (this.urls['api'], { 'hostname': this.hostname });
        const access = this.safeString (api, 0);
        const type = this.safeString (api, 1);
        let url = baseUrl + '/' + type + '/' + this.version;
        if (type === 'contract') {
            url += '/' + 'ifcontract';
        }
        url += '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        if (access === 'public') {
            if (Object.keys (query).length) {
                // console.log (query);
                url += '?' + this.urlencode (query);
            }
        }
        // else if (api === 'token') {
        //     this.checkRequiredCredentials ();
        //     body = this.urlencode (query);
        //     headers = {
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //     };
        // } else {
        //     const nonce = this.nonce ();
        //     this.checkRequiredCredentials ();
        //     const token = this.safeString (this.options, 'accessToken');
        //     if (token === undefined) {
        //         throw new AuthenticationError (this.id + ' ' + path + ' endpoint requires an accessToken option or a prior call to signIn() method');
        //     }
        //     const expires = this.safeInteger (this.options, 'expires');
        //     if (expires !== undefined) {
        //         if (nonce >= expires) {
        //             throw new AuthenticationError (this.id + ' accessToken expired, supply a new accessToken or call the signIn() method');
        //         }
        //     }
        //     if (Object.keys (query).length) {
        //         url += '?' + this.urlencode (query);
        //     }
        //     headers = {
        //         'Content-Type': 'application/json',
        //         'X-BM-TIMESTAMP': nonce.toString (),
        //         'X-BM-AUTHORIZATION': 'Bearer ' + token,
        //     };
        //     if (method !== 'GET') {
        //         query = this.keysort (query);
        //         body = this.json (query);
        //         const message = this.urlencode (query);
        //         headers['X-BM-SIGNATURE'] = this.hmac (this.encode (message), this.encode (this.secret), 'sha256');
        //     }
        // }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        //
        // spot
        //
        //     {"message":"Bad Request [to is empty]","code":50000,"trace":"f9d46e1b-4edb-4d07-a06e-4895fb2fc8fc","data":{}}
        //     {"message":"Bad Request [from is empty]","code":50000,"trace":"579986f7-c93a-4559-926b-06ba9fa79d76","data":{}}
        //     {"message":"Kline size over 500","code":50004,"trace":"d625caa8-e8ca-4bd2-b77c-958776965819","data":{}}
        //
        // contract
        //
        //     {"errno":"OK","message":"INVALID_PARAMETER","code":49998,"trace":"eb5ebb54-23cd-4de2-9064-e090b6c3b2e3","data":null}
        //
        const feedback = this.id + ' ' + body;
        const message = this.safeString2 (response, 'message', 'msg');
        if ((message !== undefined) && (message !== 'OK')) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback); // unknown message
        }
    }
};
