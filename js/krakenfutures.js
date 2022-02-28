'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { TICK_SIZE } = require ('./base/functions/number');
const { ArgumentsRequired, AuthenticationError, BadRequest, BadSymbol, DDoSProtection, DuplicateOrderId, ExchangeError, ExchangeNotAvailable, InsufficientFunds, InvalidNonce, InvalidOrder, NotSupported, OrderImmediatelyFillable, OrderNotFillable, OrderNotFound, RateLimitExceeded } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class krakenfu extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'krakenfutures',
            'name': 'Kraken Futures',
            'countries': [ 'US' ],
            'version': 'v3',
            'userAgent': undefined,
            'rateLimit': 600,
            'has': {
                'spot': false,
                'margin': false,
                'swap': true,
                'future': true,
                'option': false,
                'cancelAllOrders': true,
                'createMarketOrder': false,
                'editOrder': true,
                'fetchFundingRateHistory': true,
                'fetchIndexOHLCV': false,
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyTrades': true,
                'fetchOHLCV': true,
                'fetchOpenOrders': true,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchTickers': true,
            },
            'urls': {
                'test': {
                    'public': 'https://demo-futures.kraken.com/derivatives',
                    'private': 'https://demo-futures.kraken.com/derivatives',
                    'www': 'https://demo-futures.kraken.com',
                },
                'logo': 'https://user-images.githubusercontent.com/24300605/81436764-b22fd580-9172-11ea-9703-742783e6376d.jpg',
                'api': {
                    'charts': 'https://futures.kraken.com/api/charts/',
                    'public': 'https://futures.kraken.com/derivatives/api/',
                    'private': 'https://futures.kraken.com/derivatives/api/',
                },
                'www': 'https://futures.kraken.com/',
                'doc': [
                    'https://support.kraken.com/hc/en-us/categories/360001806372-Futures-API',
                ],
                'fees': 'https://support.kraken.com/hc/en-us/articles/360022835771-Transaction-fees-and-rebates-for-Kraken-Futures',
                'referral': undefined,
            },
            'api': {
                'public': {
                    'get': [
                        'instruments',
                        'orderbook',
                        'tickers',
                        'history',
                        'historicalfundingrates',
                    ],
                },
                'private': {
                    'get': [
                        'openpositions',
                        'notifications',
                        'accounts',
                        'openorders',
                        'recentorders',
                        'fills',
                        'transfers',
                    ],
                    'post': [
                        'sendorder',
                        'editorder',
                        'cancelorder',
                        'transfer',
                        'batchorder',
                        'cancelallorders',
                        'cancelallordersafter',
                        'withdrawal',                              // for futures wallet -> kraken spot wallet
                    ],
                },
                'charts': {
                    'get': [
                        '{price_type}/{symbol}/{interval}',
                    ],
                },
            },
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'maker': -0.0002,
                    'taker': 0.00075,
                },
            },
            'exceptions': {
                'exact': {
                    'apiLimitExceeded': RateLimitExceeded,
                    'marketUnavailable': ExchangeNotAvailable,
                    'requiredArgumentMissing': BadRequest,
                    'unavailable': ExchangeNotAvailable,
                    'authenticationError': AuthenticationError,
                    'accountInactive': ExchangeError,              // When account has no trade history / no order history. Should this error be ignored in some cases?
                    'invalidAccount': BadRequest,                  // the fromAccount or the toAccount are invalid
                    'invalidAmount': BadRequest,
                    'insufficientFunds': InsufficientFunds,
                    'Bad Request': BadRequest,                     // The URL contains invalid characters. (Please encode the json URL parameter)
                    'Unavailable': InsufficientFunds,              // Insufficient funds in Futures account [withdraw]
                },
                'broad': {
                    'invalidArgument': BadRequest,
                    'nonceBelowThreshold': InvalidNonce,
                    'nonceDuplicate': InvalidNonce,
                },
            },
            'precisionMode': TICK_SIZE,
            'options': {
                'symbol': {
                    'quoteIds': [ 'USD', 'XBT' ],
                    'reversed': false,
                },
                'versions': {
                    'public': {
                        'GET': {
                            'historicalfundingrates': 'v4',
                        },
                    },
                    'charts': {
                        'GET': {
                            '{price_type}/{symbol}/{interval}': 'v1',
                        },
                    },
                },
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '12h': '12h',
                '1d': '1d',
                '1w': '1w',
            },
        });
    }

    async fetchMarkets (params = {}) {
        const response = await this.publicGetInstruments (params);
        //
        //    {
        //        "result": "success",
        //        "instruments": [
        //            {
        //                "symbol": "fi_ethusd_180928",
        //                "type": "futures_inverse",                      // futures_vanilla  // spot index
        //                "underlying": "rr_ethusd",
        //                "lastTradingTime": "2018-09-28T15:00:00.000Z",
        //                "tickSize": 0.1,
        //                "contractSize": 1,
        //                "tradeable": true,
        //                "marginLevels": [
        //                    {
        //                        "contracts":0,
        //                        "initialMargin":0.02,
        //                        "maintenanceMargin":0.01
        //                    },
        //                    {
        //                        "contracts":250000,
        //                        "initialMargin":0.04,
        //                        "maintenanceMargin":0.02
        //                    },
        //                    ...
        //                ],
        //                "isin": "GB00JVMLMP88",
        //                "retailMarginLevels": [
        //                    {
        //                        "contracts": 0,
        //                        "initialMargin": 0.5,
        //                        "maintenanceMargin": 0.25
        //                    }
        //                ],
        //                "tags": [],
        //            },
        //            {
        //                "symbol": "in_xbtusd",
        //                "type": "spot index",
        //                "tradeable":false
        //            }
        //        ]
        //        "serverTime": "2018-07-19T11:32:39.433Z"
        //    }
        //
        const instruments = response['instruments'];
        const result = [];
        for (let i = 0; i < instruments.length; i++) {
            const market = instruments[i];
            const id = market['symbol'];
            let type = undefined;
            const index = (market['type'].indexOf (' index') >= 0);
            let linear = undefined;
            let inverse = undefined;
            let expiry = undefined;
            if (!index) {
                linear = (market['type'].indexOf ('_vanilla') >= 0);
                inverse = !linear;
                const settleTime = this.safeString (market, 'lastTradingTime');
                type = (settleTime === undefined) ? 'swap' : 'future';
                expiry = this.parse8601 (settleTime);
            } else {
                type = 'index';
            }
            const swap = (type === 'swap');
            const future = (type === 'future');
            let symbol = id;
            const split = id.split ('_');
            const parsed = this.parseSymbolIdJoined (split[1]);
            const baseId = parsed['baseId'];
            const quoteId = parsed['quoteId'];
            const base = parsed['base'];
            const quote = parsed['quote'];
            // swap == perpetual
            let settle = undefined;
            const contract = (swap || future);
            if (contract) {
                settle = base;
                linear = false;
                inverse = true;
                symbol = base + '/' + quote + ':' + settle;
                if (future) {
                    symbol = symbol + '-' + this.yymmdd (expiry);
                }
            }
            result.push ({
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'settle': settle,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': type,
                'spot': false,
                'margin': false,
                'swap': swap,
                'future': future,
                'option': false,
                'index': index,
                'active': undefined,
                'contract': contract,
                'linear': linear,
                'inverse': inverse,
                'contractSize': this.safeFloat (market, 'contractSize'),
                'maintenanceMarginRate': undefined,
                'expiry': expiry,
                'expiryDatetime': this.iso8601 (expiry),
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': index ? undefined : this.parseNumber ('1'),
                    'price': this.safeFloat (market, 'tickSize'),
                },
                'limits': {
                    'leverage': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'amount': {
                        'min': undefined,
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
                'info': market,
            });
        }
        return result;
    }

    async fetchOrderBook (symbol, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        const response = await this.publicGetOrderbook (this.extend (request, params));
        //
        //    {
        //       "result": "success",
        //       "serverTime": "2016-02-25T09:45:53.818Z",
        //       "orderBook": {
        //          "bids": [
        //                [
        //                    4213,
        //                    2000,
        //                ],
        //                [
        //                    4210,
        //                    4000,
        //                ],
        //                ...
        //            ],
        //            "asks": [
        //                [
        //                    4218,
        //                    4000,
        //                ],
        //                [
        //                    4220,
        //                    5000,
        //                ],
        //                ...
        //            ],
        //        },
        //    }
        //
        const timestamp = this.parse8601 (response['serverTime']);
        return this.parseOrderBook (response['orderBook'], symbol, timestamp);
    }

    async fetchTickers (symbols = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.publicGetTickers (params);
        //
        //    {
        //        result: 'success',
        //        tickers: [
        //          {
        //            tag: 'semiannual',  // 'month', 'quarter', 'perpetual', 'semiannual',
        //            pair: 'ETH:USD',
        //            symbol: 'fi_ethusd_220624',
        //            markPrice: '2925.72',
        //            bid: '2923.8',
        //            bidSize: '16804',
        //            ask: '2928.65',
        //            askSize: '1339',
        //            vol24h: '860493',
        //            openInterest: '3023363.00000000',
        //            open24h: '3021.25',
        //            indexPrice: '2893.71',
        //            last: '2942.25',
        //            lastTime: '2022-02-18T14:08:15.578Z',
        //            lastSize: '151',
        //            suspended: false
        //          },
        //          {
        //            symbol: 'in_xbtusd', // 'rr_xbtusd',
        //            last: '40411',
        //            lastTime: '2022-02-18T14:16:28.000Z'
        //          },
        //          ...
        //        ],
        //        serverTime: '2022-02-18T14:16:29.440Z'
        //    }
        //
        const tickers = this.safeValue (response, 'tickers');
        return this.parseTickers (tickers, symbols);
    }

    parseTicker (ticker, market = undefined) {
        //
        //    {
        //        tag: 'semiannual',  // 'month', 'quarter', 'perpetual', 'semiannual',
        //        pair: 'ETH:USD',
        //        symbol: 'fi_ethusd_220624',
        //        markPrice: '2925.72',
        //        bid: '2923.8',
        //        bidSize: '16804',
        //        ask: '2928.65',
        //        askSize: '1339',
        //        vol24h: '860493',
        //        openInterest: '3023363.00000000',
        //        open24h: '3021.25',
        //        indexPrice: '2893.71',
        //        last: '2942.25',
        //        lastTime: '2022-02-18T14:08:15.578Z',
        //        lastSize: '151',
        //        suspended: false
        //    }
        //
        //    {
        //        symbol: 'in_xbtusd', // 'rr_xbtusd',
        //        last: '40411',
        //        lastTime: '2022-02-18T14:16:28.000Z'
        //    }
        //
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.parse8601 (this.safeString (ticker, 'lastTime'));
        const open = this.safeString (ticker, 'open24h');
        const last = this.safeString (ticker, 'last');
        const change = Precise.stringSub (last, open);
        const percentage = Precise.stringMul (Precise.stringDiv (change, open), '100');
        const average = Precise.stringDiv (Precise.stringAdd (open, last), '2');
        const volume = this.safeFloat (ticker, 'vol24h');
        const baseVolume = (!market['index'] && market['linear']) ? volume : undefined;
        const quoteVolume = (!market['index'] && market['inverse']) ? volume : undefined;
        return {
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': undefined,
            'low': undefined,
            'bid': this.safeFloat (ticker, 'bid'),
            'bidVolume': this.safeFloat (ticker, 'bidSize'),
            'ask': this.safeFloat (ticker, 'ask'),
            'askVolume': this.safeFloat (ticker, 'askSize'),
            'vwap': undefined,
            'open': this.parseNumber (open),
            'close': this.parseNumber (last),
            'last': this.parseNumber (last),
            'previousClose': undefined,
            'change': this.parseNumber (change),
            'percentage': this.parseNumber (percentage),
            'average': this.parseNumber (average),
            'baseVolume': this.parseNumber (baseVolume),
            'quoteVolume': this.parseNumber (quoteVolume),
            'info': ticker,
        };
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
            'price_type': this.safeString (params, 'price', 'trade'),
            'interval': this.timeframes[timeframe],
        };
        params = this.omit (params, 'price');
        if (since !== undefined) {
            const duration = this.parseTimeframe (timeframe);
            request['from'] = parseInt (since / 1000);
            if (limit === undefined) {
                limit = 5000;
            } else if (limit > 5000) {
                throw new BadRequest (this.id + ' fetchOHLCV() limit cannot exceed 5000');
            }
            const toTimestamp = this.sum (request['from'], limit * duration - 1);
            const currentTimestamp = this.seconds ();
            request['to'] = Math.min (toTimestamp, currentTimestamp);
        } else if (limit !== undefined) {
            if (limit > 5000) {
                throw new BadRequest (this.id + ' fetchOHLCV() limit cannot exceed 5000');
            }
            const duration = this.parseTimeframe (timeframe);
            request['to'] = this.seconds ();
            request['from'] = parseInt (request['to'] - (duration * limit));
        }
        const response = await this.chartsGetPriceTypeSymbolInterval (this.extend (request, params));
        //
        //    {
        //        "candles": [
        //            {
        //                "time": 1645198500000,
        //                "open": "309.15000000000",
        //                "high": "309.15000000000",
        //                "low": "308.70000000000",
        //                "close": "308.85000000000",
        //                "volume": 0
        //            }
        //        ],
        //        "more_candles": true
        //    }
        //
        const candles = this.safeValue (response, 'candles');
        return this.parseOHLCVs (candles, market, timeframe, since, limit);
    }

    parseOHLCV (ohlcv, market = undefined) {
        //
        //    {
        //        "time": 1645198500000,
        //        "open": "309.15000000000",
        //        "high": "309.15000000000",
        //        "low": "308.70000000000",
        //        "close": "308.85000000000",
        //        "volume": 0
        //    }
        //
        return [
            this.safeInteger (ohlcv, 'time'),       // unix timestamp in milliseconds
            this.safeNumber (ohlcv, 'open'),        // open price
            this.safeNumber (ohlcv, 'high'),        // highest price
            this.safeNumber (ohlcv, 'low'),         // lowest price
            this.safeNumber (ohlcv, 'close'),       // close price
            this.safeNumber (ohlcv, 'volume'),      // trading volume, undefined for mark or index price
        ];
    }

    async fetchMarkOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        const request = {
            'price': 'mark',
        };
        return await this.fetchOHLCV (symbol, timeframe, since, limit, this.extend (request, params));
    }

    async fetchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbol': market['id'],
        };
        // Returns the last 100 trades from the specified lastTime value
        const response = await this.publicGetHistory (this.extend (request, params));
        return this.parseTrades (response['history'], market, since, limit);
    }

    parseTrade (trade, market = undefined) {
        //
        // fetchTrades (public)
        //
        // {
        //    "time": "2019-02-14T09:25:33.920Z",
        //    "trade_id":100,
        //    "price":3574,
        //    "size":100,
        //    "side": "buy",
        //    "type": "fill"                                          // fill, liquidation, assignment, termination
        //    "uid": "11c3d82c-9e70-4fe9-8115-f643f1b162d4"
        // }
        //
        // fetchMyTrades (private)
        //
        // {
        //    "fillTime": "2016-02-25T09:47:01.000Z",
        //    "order_id": "c18f0c17-9971-40e6-8e5b-10df05d422f0",
        //    "fill_id": "522d4e08-96e7-4b44-9694-bfaea8fe215e",
        //    "cliOrdId": "d427f920-ec55-4c18-ba95-5fe241513b30",     // OPTIONAL
        //    "symbol": "fi_xbtusd_180615",
        //    "side": "buy",
        //    "size":2000,
        //    "price":4255,
        //    "fillType": "maker"                                     // taker, takerAfterEdit, maker, liquidation, assignee
        // },
        //
        // execution report (createOrder, editOrder)
        // {
        //    "executionId": "e1ec9f63-2338-4c44-b40a-43486c6732d7",
        //    "price":7244.5,
        //    "amount":10,
        //    "orderPriorEdit":null,
        //    "orderPriorExecution":{
        //       "orderId": "61ca5732-3478-42fe-8362-abbfd9465294",
        //       "cliOrdId":null,
        //       "type": "lmt",
        //       "symbol": "pi_xbtusd",
        //       "side": "buy",
        //       "quantity":10,
        //       "filled":0,
        //       "limitPrice":7500,
        //       "reduceOnly":false,
        //       "timestamp": "2019-12-11T17:17:33.888Z",
        //       "lastUpdateTimestamp": "2019-12-11T17:17:33.888Z"
        //    },
        //    "takerReducedQuantity":null,
        //    "type": "EXECUTION"
        // }
        const timestamp = this.parse8601 (this.safeString2 (trade, 'time', 'fillTime'));
        const price = this.safeFloat (trade, 'price');
        const amount = this.safeFloat2 (trade, 'size', 'amount', 0.0);
        let id = this.safeString2 (trade, 'uid', 'fill_id');
        if (id === undefined) {
            id = this.safeString (trade, 'executionId');
        }
        let order = this.safeString (trade, 'order_id');
        let symbolId = this.safeString (trade, 'symbol');
        let side = this.safeString (trade, 'side');
        let type = undefined;
        const priorEdit = this.safeValue (trade, 'orderPriorEdit');
        const priorExecution = this.safeValue (trade, 'orderPriorExecution');
        if (priorExecution !== undefined) {
            order = this.safeString (priorExecution, 'orderId');
            symbolId = this.safeString (priorExecution, 'symbol');
            side = this.safeString (priorExecution, 'side');
            type = this.safeString (priorExecution, 'type');
        } else if (priorEdit !== undefined) {
            order = this.safeString (priorEdit, 'orderId');
            symbolId = this.safeString (priorEdit, 'symbol');
            side = this.safeString (priorEdit, 'type');
            type = this.safeString (priorEdit, 'type');
        }
        if (type !== undefined) {
            type = this.parseOrderType (type);
        }
        let symbol = undefined;
        if (symbolId !== undefined) {
            if (symbolId in this.markets_by_id) {
                market = this.markets_by_id[symbolId];
            } else {
                market = undefined;
                symbol = symbolId;
            }
        }
        if (market !== undefined) {
            symbol = market['symbol'];
        }
        let cost = undefined;
        if ((amount !== undefined) && (price !== undefined) && (market !== undefined)) {
            if (market['linear']) {
                cost = amount * price; // in quote
            } else {
                cost = amount / price; // in base
            }
            cost *= market['lotSize'];
        }
        const fee = undefined;
        let takerOrMaker = undefined;
        const fillType = this.safeString (trade, 'fillType');
        if (fillType !== undefined) {
            if (fillType.indexOf ('taker') >= 0) {
                takerOrMaker = 'taker';
            } else if (fillType.indexOf ('maker') >= 0) {
                takerOrMaker = 'maker';
            }
        }
        return {
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'id': id,
            'order': order,
            'type': type,
            'takerOrMaker': takerOrMaker,
            'side': side,
            'price': price,
            'cost': cost,
            'amount': amount,
            'fee': fee,
            'info': trade,
        };
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        /**
            @param {string} symbol: CCXT market symbol
            @param {string} type: One of 'limit', 'market', 'post' (post-only limit order), 'take_profit' (take_profit order)
            @param {string} side: buy or sell
            @param {integer} amount: Contract quantity
            @param {float} price: Limit order price
            @param {float} params.stopPrice: The stop price associated with a stop or take profit order. Required if orderType is stp or take_profit. Must not have more than 2 decimal places. Note that for stop orders, limitPrice denotes the worst price at which the stop or take_profit order can get filled at. If no limitPrice is provided the stop or take_profit order will trigger a market order.
            @param {string} params.triggerSignal: If placing a stp or take_profit, the signal used for trigger. One of: 'mark', 'index', 'last' (market price)
            @param {string} params.cliOrdId: UUID - The order identity that is specified from the user. It must be globally unique.
            @param {boolean} params.reduceOnly: Set as true if you wish the order to only reduce an existing position. Any order which increases an existing position will be rejected. Default false.
        */
        await this.loadMarkets ();
        type = this.safeString (params, 'orderType', type);
        const timeInForce = this.safeString (params, 'timeInForce');
        const stopPrice = this.safeString (params, 'stopPrice');
        if ((type === 'stp' || type === 'take_profit') && stopPrice === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder requires params.stopPrice when type is ' + type);
        }
        if (stopPrice !== undefined) {
            type = 'stp';
        } else if (timeInForce === 'ioc') {
            type = 'ioc';
        } else if (type === 'limit') {
            type = 'lmt';
        } else if (type === 'market') {
            type = 'mkt';
        }
        const request = {
            'orderType': type,
            'symbol': this.marketId (symbol),
            'side': side,
            'size': amount,
        };
        if (price !== undefined) {
            request['limitPrice'] = price;
        }
        const response = await this.privatePostSendorder (this.extend (request, params));
        //
        //    {
        //        "result": "success",
        //        "sendStatus": {
        //            "order_id": "salf320-e337-47ac-b345-30sdfsalj",
        //            "status": "placed",
        //            "receivedTime": "2022-02-28T19:32:17.122Z",
        //            "orderEvents": [
        //                {
        //                    "order": {
        //                        "orderId": "salf320-e337-47ac-b345-30sdfsalj",
        //                        "cliOrdId": null,
        //                        "type": "lmt",
        //                        "symbol": "pi_xrpusd",
        //                        "side": "buy",
        //                        "quantity": 1,
        //                        "filled": 0,
        //                        "limitPrice": 0.7,
        //                        "reduceOnly": false,
        //                        "timestamp": "2022-02-28T19:32:17.122Z",
        //                        "lastUpdateTimestamp": "2022-02-28T19:32:17.122Z"
        //                    },
        //                    "reducedQuantity": null,
        //                    "type": "PLACE"
        //                }
        //            ]
        //        },
        //        "serverTime": "2022-02-28T19:32:17.122Z"
        //    }
        //
        const sendStatus = this.safeValue (response, 'sendStatus');
        const status = this.safeString (sendStatus, 'status');
        this.verifyOrderActionSuccess (status, 'placed', [ 'filled' ]);
        // const id = this.safeString (order, 'id');
        // this.orders[id] = order;
        return this.parseOrder (sendStatus);
    }

    async editOrder (id, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        await this.loadMarkets ();
        const request = {
            'orderId': id,
        };
        if (amount !== undefined) {
            request['size'] = amount;
        }
        if (price !== undefined) {
            request['limitPrice'] = price;
        }
        const response = await this.privatePostEditorder (this.extend (request, params));
        const status = this.safeString (response['editStatus'], 'status');
        this.verifyOrderActionSuccess (status, 'edited', [ 'filled' ]);
        const order = this.parseOrder (response['editStatus']);
        // this.orders[order['id']] = order;
        return this.extend ({ 'info': response }, order);
    }

    async cancelOrder (id, symbol = undefined, params = {}) {
        await this.loadMarkets ();
        const response = await this.privatePostCancelorder (this.extend ({ 'order_id': id }, params));
        const status = this.safeString (this.safeValue (response, 'cancelStatus', {}), 'status');
        this.verifyOrderActionSuccess (status, 'canceled');
        let order = {};
        if ('cancelStatus' in response) {
            order = this.parseOrder (response['cancelStatus']);
            // this.orders[order['id']] = order;
        }
        return this.extend ({ 'info': response }, order);
    }

    async cancelAllOrders (symbol = undefined, params = {}) {
        const request = {};
        if (symbol !== undefined) {
            request['symbol'] = this.marketId (symbol);
        }
        const response = await this.privatePostCancelallorders (this.extend (request, params));
        const cancelStatus = this.safeValue (response, 'cancelStatus', {});
        const cancelledOrders = this.safeValue (cancelStatus, 'cancelledOrders', []);
        for (let i = 0; i < cancelledOrders.length; i++) {
            const id = this.safeString (cancelledOrders[i], 'order_id');
            if (id in this.orders) {
                this.orders[id]['status'] = 'canceled';
                this.orders[id]['remaining'] = 0.0;
            }
        }
        return response;
    }

    async fetchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        // The returned orderEvents are yet again in entirely different format, what a mess
        throw new NotSupported (this.id + ' fetchOrders not supprted yet');
        // await this.loadMarkets ();
        // let market = undefined;
        // const request = {};
        // if (symbol !== undefined) {
        //     market = this.market (symbol);
        //     request['symbol'] = market['id'];
        // }
        // const response = await this.privateGetRecentorders (this.extend (request, params));
        // return this.parseOrders ([ response ], market, since, limit);
    }

    async fetchOpenOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateGetOpenorders (params);
        return this.parseOrders (response['openOrders'], market, since, limit);
    }

    parseOrderType (orderType) {
        const map = {
            'lmt': 'limit',
            'mkt': 'market',
        };
        return this.safeString (map, orderType, orderType);
    }

    verifyOrderActionSuccess (status, action = 'placed/edited/canceled', omit = []) {
        const errors = {
            'invalidOrderType': InvalidOrder,
            'invalidSide': InvalidOrder,
            'invalidSize': InvalidOrder,
            'invalidPrice': InvalidOrder,
            'insufficientAvailableFunds': InsufficientFunds,
            'selfFill': ExchangeError,
            'tooManySmallOrders': ExchangeError,
            'maxPositionViolation': BadRequest,
            'marketSuspended': ExchangeNotAvailable,
            'marketInactive': ExchangeNotAvailable,
            'clientOrderIdAlreadyExist': DuplicateOrderId,
            'clientOrderIdTooLong': BadRequest,
            'outsidePriceCollar': InvalidOrder,
            'postWouldExecute': OrderImmediatelyFillable,  // the unplaced order could actually be parsed (with status = "rejected"), but there is this specific error for this
            'iocWouldNotExecute': OrderNotFillable, // -||-
            'wouldNotReducePosition': ExchangeError,
            'orderForEditNotFound': OrderNotFound,
            'orderForEditNotAStop': InvalidOrder,
            'filled': OrderNotFound,
            'notFound': OrderNotFound,
        };
        if ((status in errors) && !this.inArray (status, omit)) {
            throw new errors[status] (this.id + ' order cannot be ' + action + ': ' + status);
        }
    }

    parseOrderStatus (status) {
        const statuses = {
            'placed': 'open', // the order was placed successfully
            'cancelled': 'canceled', // the order was cancelled successfully
            'invalidOrderType': 'rejected', // the order was not placed because orderType is invalid
            'invalidSide': 'rejected', // the order was not placed because side is invalid
            'invalidSize': 'rejected', // the order was not placed because size is invalid
            'invalidPrice': 'rejected', // the order was not placed because limitPrice and/or stopPrice are invalid
            'insufficientAvailableFunds': 'rejected', // the order was not placed because available funds are insufficient
            'selfFill': 'rejected', // the order was not placed because it would be filled against an existing order belonging to the same account
            'tooManySmallOrders': 'rejected', // the order was not placed because the number of small open orders would exceed the permissible limit
            'maxPositionViolation': 'rejected', // Order would cause you to exceed your maximum position in this contract.
            'marketSuspended': 'rejected', // the order was not placed because the market is suspended
            'marketInactive': 'rejected', // the order was not placed because the market is inactive
            'clientOrderIdAlreadyExist': 'rejected', // the specified client id already exist
            'clientOrderIdTooLong': 'rejected', // the client id is longer than the permissible limit
            'outsidePriceCollar': 'rejected', // the limit order crosses the spread but is an order of magnitude away from the mark price - fat finger control
            // Should the next two be 'expired' ?
            'postWouldExecute': 'rejected', // the post-only order would be filled upon placement, thus is cancelled
            'iocWouldNotExecute': 'rejected', // the immediate-or-cancel order would not execute.
            'wouldNotReducePosition': 'rejected', // the reduce only order would not reduce position.
            'edited': 'open', // the order was edited successfully
            'orderForEditNotFound': 'rejected', // the requested order for edit has not been found
            'orderForEditNotAStop': 'rejected', // the supplied stopPrice cannot be applied because order is not a stop order
            'filled': 'closed', // the order was found completely filled and could not be cancelled
            'notFound': 'rejected', // the order was not found, either because it had already been cancelled or it never existed
            'untouched': 'open', // the entire size of the order is unfilled
            'partiallyFilled': 'open', // the size of the order is partially but not entirely filled
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market = undefined) {
        // "PLACE ORDER"
        //
        // LIMIT
        // {
        //   "order_id": "179f9af8-e45e-469d-b3e9-2fd4675cb7d0",
        //   "status": "placed",
        //   "receivedTime": "2019-09-05T16:33:50.734Z",
        //   "orderEvents":[
        //      {
        //         "order":{
        //            "orderId": "179f9af8-e45e-469d-b3e9-2fd4675cb7d0",
        //            "cliOrdId":null,
        //            "type": "lmt",
        //            "symbol": "pi_xbtusd",
        //            "side": "buy",
        //            "quantity":10000,
        //            "filled":0,
        //            "limitPrice":9400,
        //            "reduceOnly":false,
        //            "timestamp": "2019-09-05T16:33:50.734Z",
        //            "lastUpdateTimestamp": "2019-09-05T16:33:50.734Z"
        //         },
        //         "reducedQuantity":null,
        //         "type": "PLACE"
        //      }
        //   ]
        // }
        //
        // LIMIT REJECTED
        // {
        //   "order_id": "614a5298-0071-450f-83c6-0617ce8c6bc4",
        //   "status": "wouldNotReducePosition",
        //   "receivedTime": "2019-09-05T16:32:54.076Z",
        //   "orderEvents":[
        //      {
        //         "uid": "614a5298-0071-450f-83c6-0617ce8c6bc4",
        //         "order":{
        //            "orderId": "614a5298-0071-450f-83c6-0617ce8c6bc4",
        //            "cliOrdId":null,
        //            "type": "lmt",
        //            "symbol": "pi_xbtusd",
        //            "side": "buy",
        //            "quantity":10000,
        //            "filled":0,
        //            "limitPrice":9400,
        //            "reduceOnly":true,
        //            "timestamp": "2019-09-05T16:32:54.076Z",
        //            "lastUpdateTimestamp": "2019-09-05T16:32:54.076Z"
        //         },
        //         "reason": "WOULD_NOT_REDUCE_POSITION",
        //         "type": "REJECT"
        //      }
        //   ]
        // }
        //
        // CONDITIONAL
        // {
        //   "order_id": "1abfd3c6-af93-4b30-91cc-e4a93797f3f5",
        //   "status": "placed",
        //   "receivedTime": "2019-12-05T10:20:50.701Z",
        //   "orderEvents":[
        //      {
        //         "orderTrigger":{
        //            "uid": "1abfd3c6-af93-4b30-91cc-e4a93797f3f5",
        //            "clientId":null,
        //            "type": "lmt",                                         // "ioc" if stop market
        //            "symbol": "pi_xbtusd",
        //            "side": "buy",
        //            "quantity":10,
        //            "limitPrice":15000,
        //            "triggerPrice":9500,
        //            "triggerSide": "trigger_below",
        //            "triggerSignal": "mark_price",
        //            "reduceOnly":false,
        //            "timestamp": "2019-12-05T10:20:50.701Z",
        //            "lastUpdateTimestamp": "2019-12-05T10:20:50.701Z"
        //         },
        //         "type": "PLACE"
        //      }
        //   ]
        // }
        //
        // EXECUTION
        // {
        //    "order_id": "61ca5732-3478-42fe-8362-abbfd9465294",
        //    "status": "placed",
        //    "receivedTime": "2019-12-11T17:17:33.888Z",
        //    "orderEvents":[
        //       {
        //          "executionId": "e1ec9f63-2338-4c44-b40a-43486c6732d7",
        //          "price":7244.5,
        //          "amount":10,
        //          "orderPriorEdit":null,
        //          "orderPriorExecution":{
        //             "orderId": "61ca5732-3478-42fe-8362-abbfd9465294",
        //             "cliOrdId":null,
        //             "type": "lmt",
        //             "symbol": "pi_xbtusd",
        //             "side": "buy",
        //             "quantity":10,
        //             "filled":0,
        //             "limitPrice":7500,
        //             "reduceOnly":false,
        //             "timestamp": "2019-12-11T17:17:33.888Z",
        //             "lastUpdateTimestamp": "2019-12-11T17:17:33.888Z"
        //          },
        //          "takerReducedQuantity":null,
        //          "type": "EXECUTION"
        //       }
        //    ]
        // }
        //
        // "EDIT ORDER"
        // {
        //    "status": "edited",
        //    "orderId": "022774bc-2c4a-4f26-9317-436c8d85746d",
        //    "receivedTime": "2019-09-05T16:47:47.521Z",
        //    "orderEvents":[
        //       {
        //          "old":{
        //             "orderId": "022774bc-2c4a-4f26-9317-436c8d85746d",
        //             "cliOrdId":null,
        //             "type": "lmt",
        //             "symbol": "pi_xbtusd",
        //             "side": "buy",
        //             "quantity":1000,
        //             "filled":0,
        //             "limitPrice":9400.0,
        //             "reduceOnly":false,
        //             "timestamp": "2019-09-05T16:41:35.173Z",
        //             "lastUpdateTimestamp": "2019-09-05T16:41:35.173Z"
        //          },
        //          "new":{
        //             "orderId": "022774bc-2c4a-4f26-9317-436c8d85746d",
        //             "cliOrdId":null,
        //             "type": "lmt",
        //             "symbol": "pi_xbtusd",
        //             "side": "buy",
        //             "quantity":1501,
        //             "filled":0,
        //             "limitPrice":7200,
        //             "reduceOnly":false,
        //             "timestamp": "2019-09-05T16:41:35.173Z",
        //             "lastUpdateTimestamp": "2019-09-05T16:47:47.519Z"
        //          },
        //          "reducedQuantity":null,
        //          "type": "EDIT"
        //       }
        //    ]
        // }
        //
        // "CANCEL ORDER"
        // {
        //    "status": "cancelled",
        //    "orderEvents":[
        //       {
        //          "uid": "85c40002-3f20-4e87-9302-262626c3531b",
        //          "order":{
        //             "orderId": "85c40002-3f20-4e87-9302-262626c3531b",
        //             "cliOrdId":null,
        //             "type": "lmt",
        //             "symbol": "pi_xbtusd",
        //             "side": "buy",
        //             "quantity":1000,
        //             "filled":0,
        //             "limitPrice":10144,
        //             "stopPrice":null,
        //             "reduceOnly":false,
        //             "timestamp": "2019-08-01T15:26:27.790Z"
        //          },
        //          "type": "CANCEL"
        //       }
        //    ]
        // }
        //
        // "FETCH OPEN ORDERS"
        // {
        //     "order_id": "59302619-41d2-4f0b-941f-7e7914760ad3",
        //     "symbol": "pi_xbtusd",
        //     "side": "sell",
        //     "orderType": "lmt",
        //     "limitPrice":10640,
        //     "unfilledSize":304,
        //     "receivedTime": "2019-09-05T17:01:17.410Z",
        //     "status": "untouched",
        //     "filledSize":0,
        //     "reduceOnly":true,
        //     "lastUpdateTime": "2019-09-05T17:01:17.410Z"
        // }
        //
        const orderEvents = this.safeValue (order, 'orderEvents', []);
        let details = undefined;
        let isPrior = false;
        let fixed = false;
        let statusId = undefined;
        let price = undefined;
        let trades = [];
        if (orderEvents.length > 0) {
            const executions = [];
            for (let i = 0; i < orderEvents.length; i++) {
                const item = orderEvents[i];
                if (this.safeString (item, 'type') === 'EXECUTION') {
                    executions.push (item);
                }
                // Final order (after placement / editing / execution / canceling)
                if (('new' in item) || ('order' in item) || ('orderTrigger' in item)) {
                    details = this.safeValue2 (item, 'new', 'order');
                    if (details === undefined) {
                        details = item['orderTrigger'];
                    }
                    isPrior = false;
                    fixed = true;
                } else if ((('orderPriorEdit' in item) || ('orderPriorExecution' in item)) && (!fixed) && (details === undefined)) {
                    details = this.safeValue2 (item, 'orderPriorExecution', 'orderPriorEdit');
                    if ('orderPriorExecution' in item) {
                        price = this.safeFloat (item['orderPriorExecution'], 'limitPrice');
                    }
                    isPrior = true;
                }
            }
            trades = this.parseTrades (executions);
            statusId = this.safeString (order, 'status');
        }
        if (details === undefined) {
            details = order;
        }
        if (statusId === undefined) {
            statusId = this.safeString (details, 'status');
        }
        // This may be incorrectly marked as "open" if only execution report is given,
        // but will be fixed below
        let status = this.parseOrderStatus (statusId);
        let isClosed = this.inArray (status, [ 'canceled', 'rejected', 'closed' ]);
        let symbol = undefined;
        if (market !== undefined) {
            symbol = market['symbol'];
        } else {
            const marketId = this.safeString (details, 'symbol');
            if (marketId in this.markets_by_id) {
                market = this.markets_by_id[marketId];
                symbol = market['symbol'];
            }
        }
        const timestamp = this.parse8601 (this.safeString2 (details, 'timestamp', 'receivedTime'));
        const lastTradeTimestamp = undefined;
        if (price === undefined) {
            price = this.safeFloat (details, 'limitPrice');
        }
        let amount = this.safeFloat (details, 'quantity');
        let filled = this.safeFloat2 (details, 'filledSize', 'filled', 0.0);
        let remaining = this.safeFloat (details, 'unfilledSize');
        let average = undefined;
        let filled2 = 0.0;
        if (trades.length > 0) {
            let vwapSum = 0.0;
            for (let i = 0; i < trades.length; i++) {
                const trade = trades[i];
                filled2 += trade['amount'];
                vwapSum += trade['amount'] * trade['price'];
            }
            average = vwapSum / filled2;
            if ((amount !== undefined) && (!isClosed) && isPrior && (filled2 >= amount)) {
                status = 'closed';
                isClosed = true;
            }
            if (isPrior) {
                filled = filled + filled2;
            } else {
                filled = Math.max (filled, filled2);
            }
        }
        if (remaining === undefined) {
            if (isPrior) {
                if (amount !== undefined) {
                    // remaining amount before execution minus executed amount
                    remaining = amount - filled2;
                }
            } else {
                remaining = amount;
            }
        }
        // if fetchOpenOrders are parsed
        if ((amount === undefined) && (!isPrior) && (remaining !== undefined)) {
            amount = filled + remaining;
        }
        let cost = undefined;
        if ((filled !== undefined) && (market !== undefined)) {
            const whichPrice = (average !== undefined) ? average : price;
            if (whichPrice !== undefined) {
                if (market['linear']) {
                    cost = filled * whichPrice; // in quote
                } else {
                    cost = filled / whichPrice; // in base
                }
                cost *= market['lotSize'];
            }
        }
        let id = this.safeString2 (order, 'order_id', 'orderId');
        if (id === undefined) {
            id = this.safeString2 (details, 'orderId', 'uid');
        }
        const type = this.parseOrderType (this.safeStringLower2 (details, 'type', 'orderType'));
        const side = this.safeString (details, 'side');
        return {
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'average': average,
            'filled': filled,
            'remaining': remaining,
            'status': status,
            'fee': undefined,
            'trades': trades,
            'info': order,
        };
    }

    async fetchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
        }
        const response = await this.privateGetFills (params);
        // {
        //    "result": "success",
        //    "serverTime": "2016-02-25T09:45:53.818Z",
        //    "fills":[
        //       {
        //          "fillTime": "2016-02-25T09:47:01.000Z",
        //          "order_id": "c18f0c17-9971-40e6-8e5b-10df05d422f0",
        //          "fill_id": "522d4e08-96e7-4b44-9694-bfaea8fe215e",
        //          "cliOrdId": "d427f920-ec55-4c18-ba95-5fe241513b30", // EXTRA
        //          "symbol": "fi_xbtusd_180615",
        //          "side": "buy",
        //          "size":2000,
        //          "price":4255,
        //          "fillType": "maker"
        //       },
        //       ...
        //    ]
        // }
        return this.parseTrades (response['fills'], market, since, limit);
    }

    async fetchBalance (params = {}) {
        await this.loadMarkets ();
        const response = await this.privateGetAccounts (params);
        // {
        //    "result": "success",
        //    "serverTime": "2016-02-25T09:45:53.818Z",
        //    "accounts":{
        //        "cash":{
        //            "type": "cashAccount",
        //            "balances":{
        //                "xbt":141.31756797,
        //                "xrp":52465.1254,
        //            },
        //        },
        //        "fi_xbtusd":{
        //            "type": "marginAccount",
        //            "currency": "xbt",
        //            "balances":{
        //                "fi_xbtusd_171215":50000,
        //                "fi_xbtusd_180615":-15000,
        //                ...,
        //                "xbt":141.31756797,
        //                "xrp":0,
        //            },
        //            "auxiliary":{
        //                "af":100.73891563,
        //                "pnl":12.42134766,
        //                "pv":153.73891563,
        //            },
        //            "marginRequirements":{
        //                "im":52.8,
        //                "mm":23.76,
        //                "lt":39.6,
        //                "tt":15.84,
        //            },
        //            "triggerEstimates":{
        //                "im":3110,
        //                "mm":3000,
        //                "lt":2890,
        //                "tt":2830,
        //            },
        //        },
        //        ...
        //    },
        // }
        const result = { 'info': response };
        const accounts = this.safeValue (response, 'accounts', {});
        const cash = this.safeValue (accounts, 'cash', {});
        const cashBalances = this.safeValue (cash, 'balances', {});
        // This contains the actually usable margin by each market,
        // but ccxt does not support such format
        // const bySymbol = this.omit (accounts, 'cash');
        const currencyIds = Object.keys (cashBalances);
        for (let i = 0; i < currencyIds.length; i++) {
            const currencyId = currencyIds[i];
            const code = this.safeCurrencyCode (currencyId);
            const account = this.account ();
            account['total'] = this.safeFloat (cashBalances, currencyId);
            result[code] = account;
        }
        return this.parseBalance (result);
    }

    async fetchFundingRateHistory (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadRequest (this.id + ' fetchFundingRateHistory() supports swap contracts only');
        }
        const request = {
            'symbol': market['id'].toUpperCase (),
        };
        const response = await this.publicGetHistoricalfundingrates (this.extend (request, params));
        //
        //    {
        //        rates: [
        //          {
        //            timestamp: '2018-08-31T16:00:00.000Z',
        //            fundingRate: '2.18900669884E-7',
        //            relativeFundingRate: '0.000060779960000000'
        //          },
        //          ...
        //        ]
        //    }
        //
        const rates = this.safeValue (response, 'rates');
        const result = [];
        for (let i = 0; i < rates.length; i++) {
            const item = rates[i];
            const datetime = this.safeString (item, 'timestamp');
            result.push ({
                'info': item,
                'symbol': symbol,
                'fundingRate': this.safeNumber (item, 'fundingRate'),
                'timestamp': this.parse8601 (datetime),
                'datetime': datetime,
            });
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return;
        }
        if (code === 429) {
            throw new DDoSProtection (this.id + ' ' + body);
        }
        const message = this.safeString (response, 'error');
        if (message === undefined) {
            return;
        }
        const feedback = this.id + ' ' + body;
        this.throwExactlyMatchedException (this.exceptions['exact'], message, feedback);
        this.throwBroadlyMatchedException (this.exceptions['broad'], message, feedback);
        if (code === 400) {
            throw new BadRequest (feedback);
        }
        throw new ExchangeError (feedback); // unknown message
    }

    parseSymbolIdJoined (symbolId) {
        // Convert by detecting and converting currencies in symbol
        const symbolIdLower = symbolId.toLowerCase ();
        const quoteIds = this.options['symbol']['quoteIds'];
        const reversed = this.options['symbol']['reversed'];
        const method = reversed ? 'startsWith' : 'endsWith';
        let quoteId = undefined;
        let baseId = undefined;
        for (let i = 0; i < quoteIds.length; i++) {
            if (this[method] (symbolIdLower, quoteIds[i].toLowerCase ())) {
                quoteId = quoteIds[i];
                break;
            }
        }
        if (quoteId === undefined) {
            throw new BadSymbol (this.id + ' symbolId could not be parsed: ' + symbolId);
        }
        if (!reversed) {
            const baseIdLength = symbolId.length - quoteId.length;
            baseId = this.sliceString (symbolId, 0, baseIdLength);
            quoteId = this.sliceString (symbolId, baseIdLength);
        } else {
            quoteId = this.sliceString (symbolId, 0, quoteId.length);
            baseId = this.sliceString (symbolId, quoteId.length);
        }
        return {
            'baseId': baseId,
            'quoteId': quoteId,
            'base': this.safeCurrencyCode (baseId),
            'quote': this.safeCurrencyCode (quoteId),
        };
    }

    startsWith (string, x) {
        return this.sliceString (string, 0, x.length) === x;
    }

    endsWith (string, x) {
        const start = Math.max (0, string.length - x.length);
        return this.sliceString (string, start) === x;
    }

    sliceString (string, start = undefined, end = undefined) {
        if (start === undefined) {
            start = 0;
        }
        if (end === undefined) {
            end = string.length;
        }
        return string.slice (start, end);
    }

    nonce () {
        return this.milliseconds ().toString ();
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        const versions = this.safeValue (this.options, 'versions', {});
        const apiVersions = this.safeValue (versions, api, {});
        const methodVersions = this.safeValue (apiVersions, method, {});
        const defaultVersion = this.safeString (methodVersions, path, this.version);
        const version = this.safeString (params, 'version', defaultVersion);
        params = this.omit (params, 'version');
        const endpoint = version + '/' + this.implodeParams (path, params);
        params = this.omit (params, this.extractParams (path));
        let query = endpoint;
        let postData = '';
        if (Object.keys (params).length) {
            postData = this.urlencode (params);
            query += '?' + postData;
        }
        const url = this.urls['api'][api] + query;
        if (api === 'private') {
            const nonce = ''; // this.nonce ();
            const auth = postData + nonce + '/api/' + endpoint; // 1
            const hash = this.hash (this.encode (auth), 'sha256', 'binary'); // 2
            const secret = this.base64ToBinary (this.secret); // 3
            const signature = this.hmac (hash, secret, 'sha512', 'base64'); // 4-5
            headers = {
                'Content-Type': 'application/json',
                'APIKey': this.apiKey,
                'Authent': signature,
            };
            // headers['Nonce'] = nonce;
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }
};
