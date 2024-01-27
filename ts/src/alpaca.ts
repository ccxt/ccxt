//  ---------------------------------------------------------------------------

import Exchange from './abstract/alpaca.js';
import { ExchangeError, BadRequest, PermissionDenied, BadSymbol, NotSupported, InsufficientFunds, InvalidOrder, RateLimitExceeded } from './base/errors.js';
import { TICK_SIZE } from './base/functions/number.js';
import type { Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Trade } from './base/types.js';

//  ---------------------------------------------------------------------------xs
/**
 * @class alpaca
 * @augments Exchange
 */
export default class alpaca extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'alpaca',
            'name': 'Alpaca',
            'countries': [ 'US' ],
            // 3 req/s for free
            // 150 req/s for subscribers: https://alpaca.markets/data
            // for brokers: https://alpaca.markets/docs/api-references/broker-api/#authentication-and-rate-limit
            'rateLimit': 333,
            'hostname': 'alpaca.markets',
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/187234005-b864db3d-f1e3-447a-aaf9-a9fc7b955d07.jpg',
                'www': 'https://alpaca.markets',
                'api': {
                    'broker': 'https://broker-api.{hostname}',
                    'trader': 'https://api.{hostname}',
                    'market': 'https://data.{hostname}',
                },
                'test': {
                    'broker': 'https://broker-api.sandbox.{hostname}',
                    'trader': 'https://paper-api.{hostname}',
                    'market': 'https://data.sandbox.{hostname}',
                },
                'doc': 'https://alpaca.markets/docs/',
                'fees': 'https://docs.alpaca.markets/docs/crypto-fees',
            },
            'has': {
                'CORS': false,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'closeAllPositions': false,
                'closePosition': false,
                'createOrder': true,
                'fetchBalance': false,
                'fetchBidsAsks': false,
                'fetchClosedOrders': true,
                'fetchCurrencies': false,
                'fetchDepositAddress': false,
                'fetchDepositAddressesByNetwork': false,
                'fetchDeposits': false,
                'fetchDepositsWithdrawals': false,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchL1OrderBook': true,
                'fetchL2OrderBook': false,
                'fetchMarkets': true,
                'fetchMyTrades': false,
                'fetchOHLCV': true,
                'fetchOpenOrder': false,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchOrders': true,
                'fetchPositions': false,
                'fetchStatus': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchTime': true,
                'fetchTrades': true,
                'fetchTradingFee': false,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchTransactions': false,
                'fetchTransfers': false,
                'fetchWithdrawals': false,
                'setLeverage': false,
                'setMarginMode': false,
                'transfer': false,
                'withdraw': false,
            },
            'api': {
                'broker': {
                },
                'trader': {
                    'private': {
                        'get': [
                            'v2/account',
                            'v2/orders',
                            'v2/orders/{order_id}',
                            'v2/positions',
                            'v2/positions/{symbol_or_asset_id}',
                            'v2/account/portfolio/history',
                            'v2/watchlists',
                            'v2/watchlists/{watchlist_id}',
                            'v2/watchlists:by_name',
                            'v2/account/configurations',
                            'v2/account/activities',
                            'v2/account/activities/{activity_type}',
                            'v2/calendar',
                            'v2/clock',
                            'v2/assets',
                            'v2/assets/{symbol_or_asset_id}',
                            'v2/corporate_actions/announcements/{id}',
                            'v2/corporate_actions/announcements',
                        ],
                        'post': [
                            'v2/orders',
                            'v2/watchlists',
                            'v2/watchlists/{watchlist_id}',
                            'v2/watchlists:by_name',
                        ],
                        'put': [
                            'v2/watchlists/{watchlist_id}',
                            'v2/watchlists:by_name',
                        ],
                        'patch': [
                            'v2/orders/{order_id}',
                            'v2/account/configurations',
                        ],
                        'delete': [
                            'v2/orders',
                            'v2/orders/{order_id}',
                            'v2/positions',
                            'v2/positions/{symbol_or_asset_id}',
                            'v2/watchlists/{watchlist_id}',
                            'v2/watchlists:by_name',
                            'v2/watchlists/{watchlist_id}/{symbol}',
                        ],
                    },
                },
                'market': {
                    'public': {
                        'get': [
                            'v1beta3/crypto/{loc}/bars',
                            'v1beta3/crypto/{loc}/latest/bars',
                            'v1beta3/crypto/{loc}/latest/orderbooks',
                            'v1beta3/crypto/{loc}/latest/quotes',
                            'v1beta3/crypto/{loc}/latest/trades',
                            'v1beta3/crypto/{loc}/quotes',
                            'v1beta3/crypto/{loc}/snapshots',
                            'v1beta3/crypto/{loc}/trades',
                        ],
                    },
                    'private': {
                        'get': [
                            'v1beta1/corporate-actions',
                            'v1beta1/forex/latest/rates',
                            'v1beta1/forex/rates',
                            'v1beta1/logos/{symbol}',
                            'v1beta1/news',
                            'v1beta1/screener/stocks/most-actives',
                            'v1beta1/screener/{market_type}/movers',
                            'v2/stocks/auctions',
                            'v2/stocks/bars',
                            'v2/stocks/bars/latest',
                            'v2/stocks/meta/conditions/{ticktype}',
                            'v2/stocks/meta/exchanges',
                            'v2/stocks/quotes',
                            'v2/stocks/quotes/latest',
                            'v2/stocks/snapshots',
                            'v2/stocks/trades',
                            'v2/stocks/trades/latest',
                            'v2/stocks/{symbol}/auctions',
                            'v2/stocks/{symbol}/bars',
                            'v2/stocks/{symbol}/bars/latest',
                            'v2/stocks/{symbol}/quotes',
                            'v2/stocks/{symbol}/quotes/latest',
                            'v2/stocks/{symbol}/snapshot',
                            'v2/stocks/{symbol}/trades',
                            'v2/stocks/{symbol}/trades/latest',
                        ],
                    },
                },
            },
            'timeframes': {
                '1m': '1min',
                '3m': '3min',
                '5m': '5min',
                '15m': '15min',
                '30m': '30min',
                '1h': '1H',
                '2h': '2H',
                '4h': '4H',
                '6h': '6H',
                '8h': '8H',
                '12h': '12H',
                '1d': '1D',
                '3d': '3D',
                '1w': '1W',
                '1M': '1M',
            },
            'precisionMode': TICK_SIZE,
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'fees': {
                'trading': {
                    'tierBased': true,
                    'percentage': true,
                    'maker': this.parseNumber ('0.0015'),
                    'taker': this.parseNumber ('0.0025'),
                    'tiers': {
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0025') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0022') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.0020') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0018') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0015') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.0013') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.001') ],
                        ],
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0015') ],
                            [ this.parseNumber ('100000'), this.parseNumber ('0.0012') ],
                            [ this.parseNumber ('500000'), this.parseNumber ('0.001') ],
                            [ this.parseNumber ('1000000'), this.parseNumber ('0.0008') ],
                            [ this.parseNumber ('10000000'), this.parseNumber ('0.0005') ],
                            [ this.parseNumber ('25000000'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('50000000'), this.parseNumber ('0.0002') ],
                            [ this.parseNumber ('100000000'), this.parseNumber ('0.00') ],
                        ],
                    },
                },
            },
            'headers': {
                'APCA-PARTNER-ID': 'ccxt',
            },
            'options': {
                'defaultExchange': 'CBSE',
                'exchanges': [
                    'CBSE', // Coinbase
                    'FTX', // FTXUS
                    'GNSS', // Genesis
                    'ERSX', // ErisX
                ],
                'defaultTimeInForce': 'gtc', // fok, gtc, ioc
                'clientOrderId': 'ccxt_{id}',
            },
            'exceptions': {
                'exact': {
                    'forbidden.': PermissionDenied, // {"message": "forbidden."}
                    '40410000': InvalidOrder, // { "code": 40410000, "message": "order is not found."}
                    '40010001': BadRequest, // {"code":40010001,"message":"invalid order type for crypto order"}
                    '40110000': PermissionDenied, // { "code": 40110000, "message": "request is not authorized"}
                    '40310000': InsufficientFunds, // {"available":"0","balance":"0","code":40310000,"message":"insufficient balance for USDT (requested: 221.63, available: 0)","symbol":"USDT"}
                    '42910000': RateLimitExceeded, // {"code":42910000,"message":"rate limit exceeded"}
                },
                'broad': {
                    'Invalid format for parameter': BadRequest, // {"message":"Invalid format for parameter start: error parsing '0' as RFC3339 or 2006-01-02 time: parsing time \"0\" as \"2006-01-02\": cannot parse \"0\" as \"2006\""}
                    'Invalid symbol': BadSymbol, // {"message":"Invalid symbol(s): BTC/USDdsda does not match ^[A-Z]+/[A-Z]+$"}
                },
            },
        });
    }

    async fetchTime (params = {}) {
        /**
         * @method
         * @name alpaca#fetchTime
         * @description fetches the current integer timestamp in milliseconds from the exchange server
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int} the current integer timestamp in milliseconds from the exchange server
         */
        const response = await this.traderPrivateGetV2Clock (params);
        //
        //     {
        //         timestamp: '2023-11-22T08:07:57.654738097-05:00',
        //         is_open: false,
        //         next_open: '2023-11-22T09:30:00-05:00',
        //         next_close: '2023-11-22T16:00:00-05:00'
        //     }
        //
        const timestamp = this.safeString (response, 'timestamp');
        const localTime = timestamp.slice (0, 23);
        const jetlagStrStart = timestamp.length - 6;
        const jetlagStrEnd = timestamp.length - 3;
        const jetlag = timestamp.slice (jetlagStrStart, jetlagStrEnd);
        const iso = this.parse8601 (localTime) - this.parseToNumeric (jetlag) * 3600 * 1000;
        return iso;
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name alpaca#fetchMarkets
         * @description retrieves data on all markets for alpaca
         * @see https://docs.alpaca.markets/reference/get-v2-assets
         * @param {object} [params] extra parameters specific to the exchange api endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const request = {
            'asset_class': 'crypto',
            'status': 'active',
        };
        const assets = await this.traderPrivateGetV2Assets (this.extend (request, params));
        //
        //     [
        //         {
        //             "id": "c150e086-1e75-44e6-9c2c-093bb1e93139",
        //             "class": "crypto",
        //             "exchange": "CRYPTO",
        //             "symbol": "BTC/USDT",
        //             "name": "Bitcoin / USD Tether",
        //             "status": "active",
        //             "tradable": true,
        //             "marginable": false,
        //             "maintenance_margin_requirement": 100,
        //             "shortable": false,
        //             "easy_to_borrow": false,
        //             "fractionable": true,
        //             "attributes": [],
        //             "min_order_size": "0.000026873",
        //             "min_trade_increment": "0.000000001",
        //             "price_increment": "1"
        //         }
        //     ]
        //
        return this.parseMarkets (assets);
    }

    parseMarket (asset): Market {
        //
        //     {
        //         "id": "c150e086-1e75-44e6-9c2c-093bb1e93139",
        //         "class": "crypto",
        //         "exchange": "CRYPTO",
        //         "symbol": "BTC/USDT",
        //         "name": "Bitcoin / USD Tether",
        //         "status": "active",
        //         "tradable": true,
        //         "marginable": false,
        //         "maintenance_margin_requirement": 100,
        //         "shortable": false,
        //         "easy_to_borrow": false,
        //         "fractionable": true,
        //         "attributes": [],
        //         "min_order_size": "0.000026873",
        //         "min_trade_increment": "0.000000001",
        //         "price_increment": "1"
        //     }
        //
        const marketId = this.safeString (asset, 'symbol');
        const parts = marketId.split ('/');
        const assetClass = this.safeString (asset, 'class');
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const base = this.safeCurrencyCode (baseId);
        let quote = this.safeCurrencyCode (quoteId);
        // Us equity markets do not include quote in symbol.
        // We can safely coerce us_equity quote to USD
        if (quote === undefined && assetClass === 'us_equity') {
            quote = 'USD';
        }
        const symbol = base + '/' + quote;
        const status = this.safeString (asset, 'status');
        const active = (status === 'active');
        const minAmount = this.safeNumber (asset, 'min_order_size');
        const amount = this.safeNumber (asset, 'min_trade_increment');
        const price = this.safeNumber (asset, 'price_increment');
        return {
            'id': marketId,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': undefined,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': undefined,
            'type': 'spot',
            'spot': true,
            'margin': undefined,
            'swap': false,
            'future': false,
            'option': false,
            'active': active,
            'contract': false,
            'linear': undefined,
            'inverse': undefined,
            'contractSize': undefined,
            'expiry': undefined,
            'expiryDatetime': undefined,
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': amount,
                'price': price,
            },
            'limits': {
                'leverage': {
                    'min': undefined,
                    'max': undefined,
                },
                'amount': {
                    'min': minAmount,
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
            },
            'created': undefined,
            'info': asset,
        };
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name alpaca#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.alpaca.markets/reference/cryptotrades
         * @see https://docs.alpaca.markets/reference/cryptolatesttrades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.loc] crypto location, default: us
         * @param {string} [params.method] method, default: marketPublicGetV1beta3CryptoLocTrades
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const loc = this.safeString (params, 'loc', 'us');
        const method = this.safeString (params, 'method', 'marketPublicGetV1beta3CryptoLocTrades');
        const request = {
            'symbols': marketId,
            'loc': loc,
        };
        params = this.omit (params, [ 'loc', 'method' ]);
        let response = undefined;
        if (method === 'marketPublicGetV1beta3CryptoLocTrades') {
            if (since !== undefined) {
                request['start'] = this.iso8601 (since);
            }
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            response = await this.marketPublicGetV1beta3CryptoLocTrades (this.extend (request, params));
        } else if (method === 'marketPublicGetV1beta3CryptoLocLatestTrades') {
            response = await this.marketPublicGetV1beta3CryptoLocLatestTrades (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchTrades() does not support ' + method + ', marketPublicGetV1beta3CryptoLocTrades and marketPublicGetV1beta3CryptoLocLatestTrades are supported');
        }
        //
        // {
        //     "next_page_token":null,
        //     "trades":{
        //        "BTC/USD":[
        //           {
        //              "i":36440704,
        //              "p":22625,
        //              "s":0.0001,
        //              "t":"2022-07-21T11:47:31.073391Z",
        //              "tks":"B"
        //           }
        //        ]
        //     }
        // }
        //
        // {
        //     "trades":{
        //        "BTC/USD":{
        //           "i":36440704,
        //           "p":22625,
        //           "s":0.0001,
        //           "t":"2022-07-21T11:47:31.073391Z",
        //           "tks":"B"
        //        }
        //     }
        // }
        //
        const trades = this.safeValue (response, 'trades', {});
        let symbolTrades = this.safeValue (trades, marketId, {});
        if (!Array.isArray (symbolTrades)) {
            symbolTrades = [ symbolTrades ];
        }
        return this.parseTrades (symbolTrades, market, since, limit);
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name alpaca#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.alpaca.markets/reference/cryptolatestorderbooks
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.loc] crypto location, default: us
         * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const loc = this.safeString (params, 'loc', 'us');
        const request = {
            'symbols': id,
            'loc': loc,
        };
        const response = await this.marketPublicGetV1beta3CryptoLocLatestOrderbooks (this.extend (request, params));
        //
        //   {
        //       "orderbooks":{
        //          "BTC/USD":{
        //             "a":[
        //                {
        //                   "p":22208,
        //                   "s":0.0051
        //                },
        //                {
        //                   "p":22209,
        //                   "s":0.1123
        //                },
        //                {
        //                   "p":22210,
        //                   "s":0.2465
        //                }
        //             ],
        //             "b":[
        //                {
        //                   "p":22203,
        //                   "s":0.395
        //                },
        //                {
        //                   "p":22202,
        //                   "s":0.2465
        //                },
        //                {
        //                   "p":22201,
        //                   "s":0.6455
        //                }
        //             ],
        //             "t":"2022-07-19T13:41:55.13210112Z"
        //          }
        //       }
        //   }
        //
        const orderbooks = this.safeValue (response, 'orderbooks', {});
        const rawOrderbook = this.safeValue (orderbooks, id, {});
        const timestamp = this.parse8601 (this.safeString (rawOrderbook, 't'));
        return this.parseOrderBook (rawOrderbook, market['symbol'], timestamp, 'b', 'a', 'p', 's');
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name alpaca#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.alpaca.markets/reference/cryptobars
         * @see https://docs.alpaca.markets/reference/cryptolatestbars
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the alpha api endpoint
         * @param {string} [params.loc] crypto location, default: us
         * @param {string} [params.method] method, default: marketPublicGetV1beta3CryptoLocBars
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const marketId = market['id'];
        const loc = this.safeString (params, 'loc', 'us');
        const method = this.safeString (params, 'method', 'marketPublicGetV1beta3CryptoLocBars');
        const request = {
            'symbols': marketId,
            'loc': loc,
        };
        params = this.omit (params, [ 'loc', 'method' ]);
        let response = undefined;
        if (method === 'marketPublicGetV1beta3CryptoLocBars') {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            if (since !== undefined) {
                request['start'] = this.yyyymmdd (since);
            }
            request['timeframe'] = this.safeString (this.timeframes, timeframe, timeframe);
            response = await this.marketPublicGetV1beta3CryptoLocBars (this.extend (request, params));
        } else if (method === 'marketPublicGetV1beta3CryptoLocLatestBars') {
            response = await this.marketPublicGetV1beta3CryptoLocLatestBars (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchOHLCV() does not support ' + method + ', marketPublicGetV1beta3CryptoLocBars and marketPublicGetV1beta3CryptoLocLatestBars are supported');
        }
        //
        //    {
        //        "bars":{
        //           "BTC/USD":[
        //              {
        //                 "c":22887,
        //                 "h":22888,
        //                 "l":22873,
        //                 "n":11,
        //                 "o":22883,
        //                 "t":"2022-07-21T05:00:00Z",
        //                 "v":1.1138,
        //                 "vw":22883.0155324116
        //              },
        //              {
        //                 "c":22895,
        //                 "h":22895,
        //                 "l":22884,
        //                 "n":6,
        //                 "o":22884,
        //                 "t":"2022-07-21T05:01:00Z",
        //                 "v":0.001,
        //                 "vw":22889.5
        //              }
        //           ]
        //        },
        //        "next_page_token":"QlRDL1VTRHxNfDIwMjItMDctMjFUMDU6MDE6MDAuMDAwMDAwMDAwWg=="
        //     }
        //
        //    {
        //        "bars":{
        //           "BTC/USD":{
        //              "c":22887,
        //              "h":22888,
        //              "l":22873,
        //              "n":11,
        //              "o":22883,
        //              "t":"2022-07-21T05:00:00Z",
        //              "v":1.1138,
        //              "vw":22883.0155324116
        //           }
        //        }
        //     }
        //
        const bars = this.safeValue (response, 'bars', {});
        let ohlcvs = this.safeValue (bars, marketId, {});
        if (!Array.isArray (ohlcvs)) {
            ohlcvs = [ ohlcvs ];
        }
        return this.parseOHLCVs (ohlcvs, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        //     {
        //        "c":22895,
        //        "h":22895,
        //        "l":22884,
        //        "n":6,
        //        "o":22884,
        //        "t":"2022-07-21T05:01:00Z",
        //        "v":0.001,
        //        "vw":22889.5
        //     }
        //
        const datetime = this.safeString (ohlcv, 't');
        const timestamp = this.parse8601 (datetime);
        return [
            timestamp, // timestamp
            this.safeNumber (ohlcv, 'o'), // open
            this.safeNumber (ohlcv, 'h'), // high
            this.safeNumber (ohlcv, 'l'), // low
            this.safeNumber (ohlcv, 'c'), // close
            this.safeNumber (ohlcv, 'v'), // volume
        ];
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name alpaca#createOrder
         * @description create a trade order
         * @see https://docs.alpaca.markets/reference/postorder
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market', 'limit' or 'stop_limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of currency you want to trade in units of base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const id = market['id'];
        const request = {
            'symbol': id,
            'qty': this.amountToPrecision (symbol, amount),
            'side': side,
            'type': type, // market, limit, stop_limit
        };
        const triggerPrice = this.safeStringN (params, [ 'triggerPrice', 'stop_price' ]);
        if (triggerPrice !== undefined) {
            let newType = undefined;
            if (type.indexOf ('limit') >= 0) {
                newType = 'stop_limit';
            } else {
                throw new NotSupported (this.id + ' createOrder() does not support stop orders for ' + type + ' orders, only stop_limit orders are supported');
            }
            request['stop_price'] = this.priceToPrecision (symbol, triggerPrice);
            request['type'] = newType;
        }
        if (type.indexOf ('limit') >= 0) {
            request['limit_price'] = this.priceToPrecision (symbol, price);
        }
        const defaultTIF = this.safeString (this.options, 'defaultTimeInForce');
        request['time_in_force'] = this.safeString (params, 'timeInForce', defaultTIF);
        params = this.omit (params, [ 'timeInForce', 'triggerPrice' ]);
        const clientOrderIdprefix = this.safeString (this.options, 'clientOrderId');
        const uuid = this.uuid ();
        const parts = uuid.split ('-');
        const random_id = parts.join ('');
        const defaultClientId = this.implodeParams (clientOrderIdprefix, { 'id': random_id });
        const clientOrderId = this.safeString (params, 'clientOrderId', defaultClientId);
        request['client_order_id'] = clientOrderId;
        params = this.omit (params, [ 'clientOrderId' ]);
        const order = await this.traderPrivatePostV2Orders (this.extend (request, params));
        //
        //   {
        //      "id": "61e69015-8549-4bfd-b9c3-01e75843f47d",
        //      "client_order_id": "eb9e2aaa-f71a-4f51-b5b4-52a6c565dad4",
        //      "created_at": "2021-03-16T18:38:01.942282Z",
        //      "updated_at": "2021-03-16T18:38:01.942282Z",
        //      "submitted_at": "2021-03-16T18:38:01.937734Z",
        //      "filled_at": null,
        //      "expired_at": null,
        //      "canceled_at": null,
        //      "failed_at": null,
        //      "replaced_at": null,
        //      "replaced_by": null,
        //      "replaces": null,
        //      "asset_id": "b0b6dd9d-8b9b-48a9-ba46-b9d54906e415",
        //      "symbol": "AAPL",
        //      "asset_class": "us_equity",
        //      "notional": "500",
        //      "qty": null,
        //      "filled_qty": "0",
        //      "filled_avg_price": null,
        //      "order_class": "",
        //      "order_type": "market",
        //      "type": "market",
        //      "side": "buy",
        //      "time_in_force": "day",
        //      "limit_price": null,
        //      "stop_price": null,
        //      "status": "accepted",
        //      "extended_hours": false,
        //      "legs": null,
        //      "trail_percent": null,
        //      "trail_price": null,
        //      "hwm": null
        //   }
        //
        return this.parseOrder (order, market);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name alpaca#cancelOrder
         * @description cancels an open order
         * @see https://docs.alpaca.markets/reference/deleteorderbyorderid
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'order_id': id,
        };
        const response = await this.traderPrivateDeleteV2OrdersOrderId (this.extend (request, params));
        //
        //   {
        //       "code": 40410000,
        //       "message": "order is not found."
        //   }
        //
        return this.safeValue (response, 'message', {});
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name alpaca#cancelAllOrders
         * @description cancel all open orders in a market
         * @see https://docs.alpaca.markets/reference/deleteallorders
         * @param {string} symbol alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const response = await this.traderPrivateDeleteV2Orders (params);
        if (Array.isArray (response)) {
            return this.parseOrders (response, undefined);
        } else {
            return response;
        }
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name alpaca#fetchOrder
         * @description fetches information on an order made by the user
         * @see https://docs.alpaca.markets/reference/getorderbyorderid
         * @param {string} symbol unified symbol of the market the order was made in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'order_id': id,
        };
        const order = await this.traderPrivateGetV2OrdersOrderId (this.extend (request, params));
        const marketId = this.safeString (order, 'symbol');
        const market = this.safeMarket (marketId);
        return this.parseOrder (order, market);
    }

    async fetchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name alpaca#fetchOrders
         * @description fetches information on multiple orders made by the user
         * @see https://docs.alpaca.markets/reference/getallorders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const request = {
            'status': 'all',
        };
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            request['symbols'] = market['id'];
        }
        const until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            params = this.omit (params, 'until');
            request['endTime'] = until;
        }
        if (since !== undefined) {
            request['after'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.traderPrivateGetV2Orders (this.extend (request, params));
        //
        //     [
        //         {
        //           "id": "cbaf12d7-69b8-49c0-a31b-b46af35c755c",
        //           "client_order_id": "ccxt_b36156ae6fd44d098ac9c179bab33efd",
        //           "created_at": "2023-11-17T04:21:42.234579Z",
        //           "updated_at": "2023-11-17T04:22:34.442765Z",
        //           "submitted_at": "2023-11-17T04:21:42.233357Z",
        //           "filled_at": null,
        //           "expired_at": null,
        //           "canceled_at": "2023-11-17T04:22:34.399019Z",
        //           "failed_at": null,
        //           "replaced_at": null,
        //           "replaced_by": null,
        //           "replaces": null,
        //           "asset_id": "77c6f47f-0939-4b23-b41e-47b4469c4bc8",
        //           "symbol": "LTC/USDT",
        //           "asset_class": "crypto",
        //           "notional": null,
        //           "qty": "0.001",
        //           "filled_qty": "0",
        //           "filled_avg_price": null,
        //           "order_class": "",
        //           "order_type": "limit",
        //           "type": "limit",
        //           "side": "sell",
        //           "time_in_force": "gtc",
        //           "limit_price": "1000",
        //           "stop_price": null,
        //           "status": "canceled",
        //           "extended_hours": false,
        //           "legs": null,
        //           "trail_percent": null,
        //           "trail_price": null,
        //           "hwm": null,
        //           "subtag": null,
        //           "source": "access_key"
        //         }
        //     ]
        //
        return this.parseOrders (response, market, since, limit);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name alpaca#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://docs.alpaca.markets/reference/getallorders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'status': 'open',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name alpaca#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://docs.alpaca.markets/reference/getallorders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] the latest time in ms to fetch orders for
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const request = {
            'status': 'closed',
        };
        return await this.fetchOrders (symbol, since, limit, this.extend (request, params));
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        //    {
        //        "id":"6ecfcc34-4bed-4b53-83ba-c564aa832a81",
        //        "client_order_id":"ccxt_1c6ceab0b5e84727b2f1c0394ba17560",
        //        "created_at":"2022-06-14T13:59:30.224037068Z",
        //        "updated_at":"2022-06-14T13:59:30.224037068Z",
        //        "submitted_at":"2022-06-14T13:59:30.221856828Z",
        //        "filled_at":null,
        //        "expired_at":null,
        //        "canceled_at":null,
        //        "failed_at":null,
        //        "replaced_at":null,
        //        "replaced_by":null,
        //        "replaces":null,
        //        "asset_id":"64bbff51-59d6-4b3c-9351-13ad85e3c752",
        //        "symbol":"BTCUSD",
        //        "asset_class":"crypto",
        //        "notional":null,
        //        "qty":"0.01",
        //        "filled_qty":"0",
        //        "filled_avg_price":null,
        //        "order_class":"",
        //        "order_type":"limit",
        //        "type":"limit",
        //        "side":"buy",
        //        "time_in_force":"day",
        //        "limit_price":"14000",
        //        "stop_price":null,
        //        "status":"accepted",
        //        "extended_hours":false,
        //        "legs":null,
        //        "trail_percent":null,
        //        "trail_price":null,
        //        "hwm":null,
        //        "commission":"0.42",
        //        "source":null
        //    }
        //
        const marketId = this.safeString (order, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const alpacaStatus = this.safeString (order, 'status');
        const status = this.parseOrderStatus (alpacaStatus);
        const feeValue = this.safeString (order, 'commission');
        let fee = undefined;
        if (feeValue !== undefined) {
            fee = {
                'cost': feeValue,
                'currency': 'USD',
            };
        }
        let orderType = this.safeString (order, 'order_type');
        if (orderType !== undefined) {
            if (orderType.indexOf ('limit') >= 0) {
                // might be limit or stop-limit
                orderType = 'limit';
            }
        }
        const datetime = this.safeString (order, 'submitted_at');
        const timestamp = this.parse8601 (datetime);
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'client_order_id'),
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimeStamp': undefined,
            'status': status,
            'symbol': symbol,
            'type': orderType,
            'timeInForce': this.parseTimeInForce (this.safeString (order, 'time_in_force')),
            'postOnly': undefined,
            'side': this.safeString (order, 'side'),
            'price': this.safeNumber (order, 'limit_price'),
            'stopPrice': this.safeNumber (order, 'stop_price'),
            'triggerPrice': this.safeNumber (order, 'stop_price'),
            'cost': undefined,
            'average': this.safeNumber (order, 'filled_avg_price'),
            'amount': this.safeNumber (order, 'qty'),
            'filled': this.safeNumber (order, 'filled_qty'),
            'remaining': undefined,
            'trades': undefined,
            'fee': fee,
            'info': order,
        }, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'pending_new': 'open',
            'accepted': 'open',
            'new': 'open',
            'partially_filled': 'open',
            'activated': 'open',
            'filled': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseTimeInForce (timeInForce) {
        const timeInForces = {
            'day': 'Day',
        };
        return this.safeString (timeInForces, timeInForce, timeInForce);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        //
        //   {
        //       "t":"2022-06-14T05:00:00.027869Z",
        //       "x":"CBSE",
        //       "p":"21942.15",
        //       "s":"0.0001",
        //       "tks":"S",
        //       "i":"355681339"
        //   }
        //
        const marketId = this.safeString (trade, 'S');
        const symbol = this.safeSymbol (marketId, market);
        const datetime = this.safeString (trade, 't');
        const timestamp = this.parse8601 (datetime);
        const alpacaSide = this.safeString (trade, 'tks');
        let side: string;
        if (alpacaSide === 'B') {
            side = 'buy';
        } else if (alpacaSide === 'S') {
            side = 'sell';
        }
        const priceString = this.safeString (trade, 'p');
        const amountString = this.safeString (trade, 's');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'i'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': undefined,
            'type': undefined,
            'side': side,
            'takerOrMaker': 'taker',
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let endpoint = '/' + this.implodeParams (path, params);
        let url = this.implodeHostname (this.urls['api'][api[0]]);
        headers = (headers !== undefined) ? headers : {};
        if (api[1] === 'private') {
            headers['APCA-API-KEY-ID'] = this.apiKey;
            headers['APCA-API-SECRET-KEY'] = this.secret;
        }
        const query = this.omit (params, this.extractParams (path));
        if (Object.keys (query).length) {
            if ((method === 'GET') || (method === 'DELETE')) {
                endpoint += '?' + this.urlencode (query);
            } else {
                body = this.json (query);
                headers['Content-Type'] = 'application/json';
            }
        }
        url = url + endpoint;
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined; // default error handler
        }
        // {
        //     "code": 40110000,
        //     "message": "request is not authorized"
        // }
        const feedback = this.id + ' ' + body;
        const errorCode = this.safeString (response, 'code');
        if (code !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        }
        const message = this.safeValue (response, 'message', undefined);
        if (message !== undefined) {
            this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
