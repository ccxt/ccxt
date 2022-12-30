'use strict';

//  ---------------------------------------------------------------------------

const bybitRest = require ('../bybit.js');
const { AuthenticationError, ExchangeError, BadRequest } = require ('../base/errors');
const { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class bybit extends bybitRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': false, // for now
                'watchTrades': true,
                'watchPosition': undefined,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': {
                            'spot': 'wss://stream.{hostname}/spot/public/v3',
                            'inverse': 'wss://stream.{hostname}/contract/inverse/public/v3',
                            'usdt': 'wss://stream.{hostname}/contract/usdt/public/v3',
                            'usdc': {
                                'option': 'wss://stream.{hostname}/option/usdc/public/v3',
                                'swap': 'wss://stream.{hostname}/contract/usdc/public/v3',
                            },
                        },
                        'private': {
                            'spot': 'wss://stream.{hostname}/spot/private/v3',
                            'contract': {
                                'unified': 'wss://stream.{hostname}/unified/private/v3',
                                'nonUnified': 'wss://stream.{hostname}/contract/private/v3',
                            },
                        },
                    },
                },
                'test': {
                    'ws': {
                        'public': {
                            'spot': 'wss://stream-testnet.{hostname}/spot/public/v3',
                            'inverse': 'wss://stream-testnet.{hostname}/contract/inverse/public/v3',
                            'usdt': 'wss://stream-testnet.{hostname}/contract/usdt/public/v3',
                            'usdc': {
                                'option': 'wss://stream-testnet.{hostname}/option/usdc/public/v3',
                                'swap': 'wss://stream-testnet.{hostname}/contract/usdc/public/v3',
                            },
                        },
                        'private': {
                            'spot': 'wss://stream-testnet.{hostname}/spot/private/v3',
                            'contract': {
                                'unified': 'wss://stream-testnet.{hostname}/unified/private/v3',
                                'nonUnified': 'wss://stream-testnet.{hostname}/contract/private/v3',
                            },
                        },
                    },
                },
            },
            'options': {
                'watchTicker': {
                    'name': 'tickers', // 'tickers' for 24hr statistical ticker or 'bookticker' for Best bid price and best ask price
                },
                'spot': {
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
                        '12h': '12h',
                        '1d': '1d',
                        '1w': '1w',
                        '1M': '1M',
                    },
                },
                'contract': {
                    'timeframes': {
                        '1m': '1',
                        '3m': '3',
                        '5m': '5',
                        '15m': '15',
                        '30m': '30',
                        '1h': '60',
                        '2h': '120',
                        '4h': '240',
                        '6h': '360',
                        '12h': '720',
                        '1d': 'D',
                        '1w': 'W',
                        '1M': 'M',
                    },
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 20000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                    },
                },
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    getUrlByMarketType (symbol = undefined, isPrivate = false, isUnifiedMargin = false, method = undefined, params = {}) {
        const accessibility = isPrivate ? 'private' : 'public';
        let isUsdcSettled = undefined;
        let isSpot = undefined;
        let type = undefined;
        let isUsdtSettled = undefined;
        let market = undefined;
        let url = this.urls['api']['ws'];
        if (symbol !== undefined) {
            market = this.market (symbol);
            isUsdcSettled = market['settle'] === 'USDC';
            isUsdtSettled = market['settle'] === 'USDT';
            isSpot = market['spot'];
            type = market['type'];
        } else {
            [ type, params ] = this.handleMarketTypeAndParams (method, undefined, params);
            let defaultSettle = this.safeString (this.options, 'defaultSettle');
            defaultSettle = this.safeString2 (params, 'settle', 'defaultSettle', defaultSettle);
            isUsdcSettled = (defaultSettle === 'USDC');
            isUsdtSettled = (defaultSettle === 'USDT');
            isSpot = (type === 'spot');
        }
        if (isPrivate) {
            if (isSpot) {
                url = url[accessibility]['spot'];
            } else {
                const margin = isUnifiedMargin ? 'unified' : 'nonUnified';
                url = url[accessibility]['contract'][margin];
            }
        } else {
            if (isSpot) {
                url = url[accessibility]['spot'];
            } else if (isUsdcSettled) {
                url = url[accessibility]['usdc'][type];
            } else if (isUsdtSettled) {
                url = url[accessibility]['usdt'];
            } else {
                // inverse
                url = url[accessibility]['inverse'];
            }
        }
        url = this.implodeHostname (url);
        return url;
    }

    cleanParams (params) {
        params = this.omit (params, [ 'type', 'subType', 'settle', 'defaultSettle', 'unifiedMargin' ]);
        return params;
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name bybit#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'ticker:' + market['symbol'];
        const url = this.getUrlByMarketType (symbol, false, false, params);
        params = this.cleanParams (params);
        const options = this.safeValue (this.options, 'watchTicker', {});
        let topic = this.safeString (options, 'name', 'tickers');
        if (!market['spot'] && topic !== 'tickers') {
            throw new BadRequest (this.id + ' watchTicker() only supports name tickers for contract markets');
        }
        topic += '.' + market['id'];
        const topics = [ topic ];
        return await this.watchTopics (url, messageHash, topics, params);
    }

    handleTicker (client, message) {
        //
        //  spot - tickers
        //    {
        //        "data": {
        //            "t": 1661742216005,
        //            "s": "BTCUSDT",
        //            "o": "19820",
        //            "h": "20071.93",
        //            "l": "19365.85",
        //            "c": "19694.27",
        //            "v": "9997.246174",
        //            "qv": "197357775.97621786",
        //            "m": "-0.0063"
        //        },
        //        "type": "delta",
        //        "topic": "tickers.BTCUSDT",
        //        "ts": 1661742216011
        //    }
        //  spot - bookticker
        //    {
        //        "data": {
        //            "s": "BTCUSDT",
        //            "bp": "19693.04",
        //            "bq": "0.913957",
        //            "ap": "19694.27",
        //            "aq": "0.705447",
        //            "t": 1661742216108
        //        },
        //        "type": "delta",
        //        "topic": "bookticker.BTCUSDT",
        //        "ts": 1661742216109
        //    }
        //  swap
        //    {
        //        "topic":"tickers.BTCUSDT",
        //        "type":"snapshot",
        //        "data":{
        //            "symbol":"BTCUSDT",
        //            "tickDirection":"ZeroMinusTick",
        //            "price24hPcnt":"0.032786",
        //            "lastPrice":"22019.00",
        //            "prevPrice24h":"21320.00",
        //            "highPrice24h":"22522.00",
        //            "lowPrice24h":"20745.00",
        //            "prevPrice1h":"22186.50",
        //            "markPrice":"22010.11",
        //            "indexPrice":"22009.01",
        //            "openInterest":"44334.438",
        //            "turnover24h":"4609010554.786498",
        //            "volume24h":"213532.606",
        //            "fundingRate":"0.0001",
        //            "nextFundingTime":"2022-07-18T16:00:00Z",
        //            "bid1Price":"22019.00",
        //            "bid1Size":"41.530",
        //            "ask1Price":"22019.50",
        //            "ask1Size":"7.041",
        //            "basisRate":"0",
        //            "deliveryFeeRate":"0"
        //        },
        //        "cs":14236992078,
        //        "ts":1663203915102
        //    }
        //
        const topic = this.safeString (message, 'topic', '');
        const updateType = this.safeString (message, 'type', '');
        const data = this.safeValue (message, 'data', {});
        const isSpot = this.safeString (data, 's') !== undefined;
        let symbol = undefined;
        let parsed = undefined;
        if ((updateType === 'snapshot') || isSpot) {
            parsed = this.parseTicker (data);
            symbol = parsed['symbol'];
        } else if (updateType === 'delta') {
            const topicParts = topic.split ('.');
            const topicLength = topicParts.length;
            const marketId = this.safeString (topicParts, topicLength - 1);
            const market = this.market (marketId);
            symbol = market['symbol'];
            // update the info in place
            const ticker = this.safeValue (this.tickers, symbol, {});
            const rawTicker = this.safeValue (ticker, 'info', {});
            const merged = this.extend (rawTicker, data);
            parsed = this.parseTicker (merged);
        }
        const timestamp = this.safeInteger (message, 'ts');
        parsed['timestamp'] = timestamp;
        parsed['datetime'] = this.iso8601 (timestamp);
        this.tickers[symbol] = parsed;
        const messageHash = 'ticker:' + symbol;
        client.resolve (this.tickers[symbol], messageHash);
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.getUrlByMarketType (symbol, false, false, params);
        params = this.cleanParams (params);
        let ohlcv = undefined;
        const marketType = market['spot'] ? 'spot' : 'contract';
        const marketOptions = this.safeValue (this.options, marketType, {});
        const timeframes = this.safeValue (marketOptions, 'timeframes', {});
        const timeframeId = this.safeString (timeframes, timeframe, timeframe);
        const topics = [ 'kline.' + timeframeId + '.' + market['id'] ];
        const messageHash = 'kline' + ':' + timeframeId + ':' + symbol;
        ohlcv = await this.watchTopics (url, messageHash, topics, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        // swap
        //    {
        //        "topic":"kline.1.BTCUSDT",
        //        "data":[
        //          {
        //            "start":1658150220000,
        //            "end":1658150279999,
        //            "interval":"1",
        //            "open":"22212",
        //            "close":"22214",
        //            "high":"22214.5",
        //            "low":"22212",
        //            "volume":"5.456",
        //            "turnover":"121193.36",
        //            "confirm":false,
        //            "timestamp":1658150224542
        //          }
        //        ],
        //        "ts":1658150224542,
        //        "type":"snapshot"
        //    }
        //
        // spot
        //    {
        //        "data": {
        //            "t": 1661742000000,
        //            "s": "BTCUSDT",
        //            "c": "19685.55",
        //            "h": "19756.95",
        //            "l": "19674.61",
        //            "o": "19705.38",
        //            "v": "0.232154"
        //        },
        //        "type": "delta",
        //        "topic": "kline.1h.BTCUSDT",
        //        "ts": 1661745259605
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const topic = this.safeString (message, 'topic');
        const topicParts = topic.split ('.');
        const topicLength = topicParts.length;
        const timeframeId = this.safeString (topicParts, 1);
        const marketId = this.safeString (topicParts, topicLength - 1);
        const isSpot = client.url.indexOf ('spot') > -1;
        const marketType = isSpot ? 'spot' : 'contract';
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const ohlcvsByTimeframe = this.safeValue (this.ohlcvs, symbol);
        if (ohlcvsByTimeframe === undefined) {
            this.ohlcvs[symbol] = {};
        }
        let stored = this.safeValue (ohlcvsByTimeframe, timeframeId);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframeId] = stored;
        }
        if (Array.isArray (data)) {
            for (let i = 0; i < data.length; i++) {
                const parsed = this.parseWsContractOHLCV (data[i]);
                stored.append (parsed);
            }
        } else {
            const parsed = this.parseSpotOHLCV (data);
            stored.append (parsed);
        }
        const messageHash = 'kline' + ':' + timeframeId + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsContractOHLCV (ohlcv) {
        //
        //     {
        //         "start": 1670363160000,
        //         "end": 1670363219999,
        //         "interval": "1",
        //         "open": "16987.5",
        //         "close": "16987.5",
        //         "high": "16988",
        //         "low": "16987.5",
        //         "volume": "23.511",
        //         "turnover": "399396.344",
        //         "confirm": false,
        //         "timestamp": 1670363219614
        //     }
        //
        return [
            this.safeInteger (ohlcv, 'timestamp'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber2 (ohlcv, 'volume', 'turnover'),
        ];
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return.
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.getUrlByMarketType (symbol, false, false, params);
        params = this.cleanParams (params);
        const messageHash = 'orderbook' + ':' + symbol;
        if (limit === undefined) {
            if (market['spot']) {
                limit = 40;
            } else {
                limit = 200;
            }
        }
        const topics = [ 'orderbook.' + limit.toString () + '.' + market['id'] ];
        const orderbook = await this.watchTopics (url, messageHash, topics, params);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        // spot snapshot
        //     {
        //         "data": {
        //             "s": "BTCUSDT",
        //             "t": 1661743689733,
        //             "b": [
        //                 [
        //                     "19721.9",
        //                     "0.784806"
        //                 ],
        //                 ...
        //             ],
        //             "a": [
        //                 [
        //                     "19721.91",
        //                     "0.192687"
        //                 ],
        //                 ...
        //             ]
        //         },
        //         "type": "delta", // docs say to ignore, always snapshot
        //         "topic": "orderbook.40.BTCUSDT",
        //         "ts": 1661743689735
        //     }
        //
        // contract
        //    {
        //        "topic": "orderbook.50.BTCUSDT",
        //        "type": "snapshot",
        //        "ts": 1668748553479,
        //        "data": {
        //            "s": "BTCUSDT",
        //            "b": [
        //                [
        //                    "17053.00", //price
        //                    "0.021" //size
        //                ],
        //                ....
        //            ],
        //            "a": [
        //                [
        //                    "17054.00",
        //                    "6.288"
        //                ],
        //                ....
        //            ],
        //            "u": 3083181,
        //            "seq": 7545268447
        //        }
        //    }
        //
        const isSpot = client.url.indexOf ('spot') >= 0;
        const type = this.safeString (message, 'type');
        let isSnapshot = (type === 'snapshot');
        if (isSpot) {
            isSnapshot = true;
        }
        const data = this.safeValue (message, 'data', {});
        const marketId = this.safeString (data, 's');
        const marketType = isSpot ? 'spot' : 'contract';
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (message, 'ts');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        }
        if (isSnapshot) {
            const snapshot = this.parseOrderBook (data, symbol, timestamp, 'b', 'a');
            orderbook.reset (snapshot);
        } else {
            const asks = this.safeValue (data, 'a', []);
            const bids = this.safeValue (data, 'b', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
        }
        const messageHash = 'orderbook' + ':' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 0, 1);
        bookside.storeArray (bidAsk);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#watchTrades
         * @description watches information on multiple trades made in a market
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.getUrlByMarketType (symbol, false, false, params);
        params = this.cleanParams (params);
        const messageHash = 'trade:' + symbol;
        let topic = undefined;
        if (market['spot']) {
            topic = 'trade.' + market['id'];
        } else {
            topic = 'publicTrade.';
            if (market['option']) {
                topic += market['baseId'];
            } else {
                topic += market['id'];
            }
        }
        const trades = await this.watchTopics (url, messageHash, [ topic ], params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        //
        // swap
        //    {
        //        "topic": "publicTrade.BTCUSDT",
        //        "type": "snapshot",
        //        "ts": 1662694953823,
        //        "data": [
        //            {
        //                "T": 1662694953819,
        //                "s": "BTCUSDT",
        //                "S": "Buy",
        //                "v": "0.010",
        //                "p": "19792.50",
        //                "L": "PlusTick",
        //                "i": "5c9ab13e-6010-522c-aecd-02c4d9c8db3d",
        //                "BT": false
        //            }
        //        ]
        //    }
        //
        // spot
        //    {
        //        "data": {
        //            "v": "2100000000001992601",
        //            "t": 1661742109857,
        //            "p": "19706.87",
        //            "q": "0.000158",
        //            "m": true
        //        },
        //        "type": "delta",
        //        "topic": "trade.BTCUSDT",
        //        "ts": 1661742109863
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const topic = this.safeString (message, 'topic');
        let trades = undefined;
        const parts = topic.split ('.');
        const tradeType = this.safeString (parts, 0);
        const marketType = (tradeType === 'trade') ? 'spot' : 'contract';
        const marketId = this.safeString (parts, 1);
        const market = this.safeMarket (marketId, undefined, undefined, marketType);
        if (Array.isArray (data)) {
            // contract markets
            trades = data;
        } else {
            // spot markets
            trades = [ data ];
        }
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let j = 0; j < trades.length; j++) {
            const parsed = this.parseWsTrade (trades[j], market);
            stored.append (parsed);
        }
        const messageHash = 'trade' + ':' + symbol;
        client.resolve (stored, messageHash);
    }

    parseWsTrade (trade, market = undefined) {
        //
        // contract public
        //    {
        //         T: 1670198879981,
        //         s: 'BTCUSDT',
        //         S: 'Buy',
        //         v: '0.001',
        //         p: '17130.00',
        //         L: 'ZeroPlusTick',
        //         i: 'a807f4ee-2e8b-5f21-a02a-3e258ddbfdc9',
        //         BT: false
        //     }
        // contract private
        //
        // parsed by rest implementation
        //    {
        //        "symbol": "BITUSDT",
        //        "execFee": "0.02022",
        //        "execId": "beba036f-9fb4-59a7-84b7-2620e5d13e1c",
        //        "execPrice": "0.674",
        //        "execQty": "50",
        //        "execType": "Trade",
        //        "execValue": "33.7",
        //        "feeRate": "0.0006",
        //        "lastLiquidityInd": "RemovedLiquidity",
        //        "leavesQty": "0",
        //        "orderId": "ddbea432-2bd7-45dd-ab42-52d920b8136d",
        //        "orderLinkId": "b001",
        //        "orderPrice": "0.707",
        //        "orderQty": "50",
        //        "orderType": "Market",
        //        "stopOrderType": "UNKNOWN",
        //        "side": "Buy",
        //        "execTime": "1659057535081",
        //        "closedSize": "0"
        //    }
        //
        // spot public
        //
        //    {
        //      'symbol': 'BTCUSDT', // artificially added
        //       v: '2290000000003002848', // trade id
        //       t: 1652967602261,
        //       p: '29698.82',
        //       q: '0.189531',
        //       m: true
        //     }
        //
        // spot private
        //     {
        //         "e": "ticketInfo",
        //         "E": "1662348310386",
        //         "s": "BTCUSDT",
        //         "q": "0.001007",
        //         "t": "1662348310373",
        //         "p": "19842.02",
        //         "T": "2100000000002220938",
        //         "o": "1238261807653647872",
        //         "c": "spotx008",
        //         "O": "1238225004531834368",
        //         "a": "533287",
        //         "A": "642908",
        //         "m": false,
        //         "S": "BUY"
        //     }
        //
        const id = this.safeStringN (trade, [ 'i', 'T', 'v' ]);
        const isContract = ('BT' in trade);
        const marketType = isContract ? 'contract' : 'spot';
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market, undefined, marketType);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger2 (trade, 't', 'T');
        let side = this.safeStringLower (trade, 'S');
        let takerOrMaker = undefined;
        const m = this.safeValue (trade, 'm');
        if (side === undefined) {
            side = m ? 'buy' : 'sell';
        } else {
            // spot private
            takerOrMaker = m;
        }
        const price = this.safeString (trade, 'p');
        const amount = this.safeString2 (trade, 'q', 'v');
        const orderId = this.safeString (trade, 'o');
        return this.safeTrade ({
            'id': id,
            'info': trade,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': price,
            'amount': amount,
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    getPrivateType (url) {
        if (url.indexOf ('spot') >= 0) {
            return 'spot';
        } else if (url.indexOf ('unified') >= 0) {
            return 'unified';
        } else if (url.indexOf ('contract') >= 0) {
            return 'contract';
        }
    }

    async watchMyTrades (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @param {boolean} params.unifiedMargin use unified margin account
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        const method = 'watchMyTrades';
        let messageHash = 'myTrades';
        await this.loadMarkets ();
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const isUnifiedMargin = await this.isUnifiedMarginEnabled ();
        const url = this.getUrlByMarketType (symbol, true, isUnifiedMargin, method, params);
        await this.authenticate (url);
        const topicByMarket = {
            'spot': 'ticketInfo',
            'contract': 'user.execution.contractAccount',
            'unified': 'user.execution.unifiedAccount',
        };
        const topic = this.safeValue (topicByMarket, this.getPrivateType (url));
        const trades = await this.watchTopics (url, messageHash, [ topic ], params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleMyTrades (client, message) {
        //
        //    {
        //        "type": "snapshot",
        //        "topic": "ticketInfo",
        //        "ts": "1662348310388",
        //        "data": [
        //            {
        //                "e": "ticketInfo",
        //                "E": "1662348310386",
        //                "s": "BTCUSDT",
        //                "q": "0.001007",
        //                "t": "1662348310373",
        //                "p": "19842.02",
        //                "T": "2100000000002220938",
        //                "o": "1238261807653647872",
        //                "c": "spotx008",
        //                "O": "1238225004531834368",
        //                "a": "533287",
        //                "A": "642908",
        //                "m": false,
        //                "S": "BUY"
        //            }
        //        ]
        //    }
        // contract
        //     {
        //         topic: 'user.execution.contractAccount',
        //         data: [
        //           {
        //             symbol: 'BTCUSD',
        //             execFee: '0.00000004',
        //             execId: '7d0f66da-8312-52a9-959b-9fba58a90af0',
        //             execPrice: '17228.00',
        //             execQty: '1',
        //             execType: 'Trade',
        //             execValue: '0.00005804',
        //             feeRate: '0.0006',
        //             lastLiquidityInd: 'RemovedLiquidity',
        //             leavesQty: '0',
        //             orderId: '6111f83d-2c8c-463a-b9a8-77885eae2f57',
        //             orderLinkId: '',
        //             orderPrice: '17744.50',
        //             orderQty: '1',
        //             orderType: 'Market',
        //             stopOrderType: 'UNKNOWN',
        //             side: 'Buy',
        //             execTime: '1670210101997',
        //             closedSize: '0'
        //           }
        //         ]
        //     }
        //
        const topic = this.safeString (message, 'topic');
        const spot = topic === 'ticketInfo';
        let data = this.safeValue (message, 'data', []);
        // unified margin
        data = this.safeValue (data, 'result', data);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        const symbols = {};
        const method = spot ? 'parseWsTrade' : 'parseTrade';
        for (let i = 0; i < data.length; i++) {
            const rawTrade = data[i];
            const parsed = this[method] (rawTrade);
            const symbol = parsed['symbol'];
            symbols[symbol] = true;
            trades.append (parsed);
        }
        const keys = Object.keys (symbols);
        for (let i = 0; i < keys.length; i++) {
            const messageHash = 'myTrades:' + keys[i];
            client.resolve (trades, messageHash);
        }
        // non-symbol specific
        const messageHash = 'myTrades';
        client.resolve (trades, messageHash);
    }

    async watchOrders (symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name bybit#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure
         */
        await this.loadMarkets ();
        const method = 'watchOrders';
        let messageHash = 'orders';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash += ':' + symbol;
        }
        const isUnifiedMargin = await this.isUnifiedMarginEnabled ();
        const url = this.getUrlByMarketType (undefined, true, isUnifiedMargin, method, params);
        await this.authenticate (url);
        const topicsByMarket = {
            'spot': [ 'order', 'stopOrder' ],
            'contract': [ 'user.order.contractAccount' ],
            'unified': [ 'user.order.unifiedAccount' ],
        };
        const topics = this.safeValue (topicsByMarket, this.getPrivateType (url));
        const orders = await this.watchTopics (url, messageHash, topics, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrder (client, message, subscription = undefined) {
        //
        //     spot
        //     {
        //         "type": "snapshot",
        //         "topic": "order",
        //         "ts": "1662348310441",
        //         "data": [
        //             {
        //                 "e": "order",
        //                 "E": "1662348310441",
        //                 "s": "BTCUSDT",
        //                 "c": "spotx008",
        //                 "S": "BUY",
        //                 "o": "MARKET_OF_QUOTE",
        //                 "f": "GTC",
        //                 "q": "20",
        //                 "p": "0",
        //                 "X": "CANCELED",
        //                 "i": "1238261807653647872",
        //                 "M": "1238225004531834368",
        //                 "l": "0.001007",
        //                 "z": "0.001007",
        //                 "L": "19842.02",
        //                 "n": "0",
        //                 "N": "BTC",
        //                 "u": true,
        //                 "w": true,
        //                 "m": false,
        //                 "O": "1662348310368",
        //                 "Z": "19.98091414",
        //                 "A": "0",
        //                 "C": false,
        //                 "v": "0",
        //                 "d": "NO_LIQ",
        //                 "t": "2100000000002220938"
        //             }
        //         ]
        //     }
        //  contract
        //     {
        //         "topic": "user.order.contractAccount",
        //         "data": [
        //             {
        //                 "symbol": "BTCUSD",
        //                 "orderId": "ee013d82-fafc-4504-97b1-d92aca21eedd",
        //                 "side": "Buy",
        //                 "orderType": "Market",
        //                 "stopOrderType": "UNKNOWN",
        //                 "price": "21920.00",
        //                 "qty": "200",
        //                 "timeInForce": "ImmediateOrCancel",
        //                 "orderStatus": "Filled",
        //                 "triggerPrice": "0.00",
        //                 "orderLinkId": "inv001",
        //                 "createdTime": "1661338622771",
        //                 "updatedTime": "1661338622775",
        //                 "takeProfit": "0.00",
        //                 "stopLoss": "0.00",
        //                 "tpTriggerBy": "UNKNOWN",
        //                 "slTriggerBy": "UNKNOWN",
        //                 "triggerBy": "UNKNOWN",
        //                 "reduceOnly": false,
        //                 "closeOnTrigger": false,
        //                 "triggerDirection": 0,
        //                 "leavesQty": "0",
        //                 "lastExecQty": "200",
        //                 "lastExecPrice": "21282.00",
        //                 "cumExecQty": "200",
        //                 "cumExecValue": "0.00939761"
        //             }
        //         ]
        //     }
        // unified
        //     {
        //         "id": "f91080af-5187-4261-a802-7604419771aa",
        //         "topic": "user.order.unifiedAccount",
        //         "ts": 1661932033707,
        //         "data": {
        //             "result": [
        //                 {
        //                     "orderId": "415f8961-4073-4d74-bc3e-df2830e52843",
        //                     "orderLinkId": "",
        //                     "symbol": "BTCUSDT",
        //                     "side": "Buy",
        //                     "orderType": "Limit",
        //                     "price": "17000.00000000",
        //                     "qty": "0.0100",
        //                     "timeInForce": "GoodTillCancel",
        //                     "orderStatus": "New",
        //                     "cumExecQty": "0.0000",
        //                     "cumExecValue": "0.00000000",
        //                     "cumExecFee": "0.00000000",
        //                     "stopOrderType": "UNKNOWN",
        //                     "triggerBy": "UNKNOWN",
        //                     "triggerPrice": "",
        //                     "reduceOnly": true,
        //                     "closeOnTrigger": true,
        //                     "createdTime": 1661932033636,
        //                     "updatedTime": 1661932033644,
        //                     "iv": "",
        //                     "orderIM": "",
        //                     "takeProfit": "",
        //                     "stopLoss": "",
        //                     "tpTriggerBy": "UNKNOWN",
        //                     "slTriggerBy": "UNKNOWN",
        //                     "basePrice": "",
        //                     "blockTradeId": "",
        //                     "leavesQty": "0.0100"
        //                 }
        //             ],
        //             "version": 284
        //         },
        //         "type": "snapshot"
        //     }
        //
        const topic = this.safeString (message, 'topic', '');
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        let rawOrders = [];
        let parser = undefined;
        if (topic === 'order') {
            rawOrders = this.safeValue (message, 'data', []);
            parser = 'parseWsSpotOrder';
        } else {
            parser = 'parseContractOrder';
            rawOrders = this.safeValue (message, 'data', []);
            rawOrders = this.safeValue (rawOrders, 'result', rawOrders);
        }
        const symbols = {};
        for (let i = 0; i < rawOrders.length; i++) {
            const parsed = this[parser] (rawOrders[i]);
            const symbol = parsed['symbol'];
            symbols[symbol] = true;
            orders.append (parsed);
        }
        const symbolsArray = Object.keys (symbols);
        for (let i = 0; i < symbolsArray.length; i++) {
            const messageHash = 'orders:' + symbolsArray[i];
            client.resolve (orders, messageHash);
        }
        const messageHash = 'orders';
        client.resolve (orders, messageHash);
    }

    parseWsSpotOrder (order, market = undefined) {
        //
        //    {
        //        e: 'executionReport',
        //        E: '1653297251061', // timestamp
        //        s: 'LTCUSDT', // symbol
        //        c: '1653297250740', // user id
        //        S: 'SELL', // side
        //        o: 'MARKET_OF_BASE', // order type
        //        f: 'GTC', // time in force
        //        q: '0.16233', // quantity
        //        p: '0', // price
        //        X: 'NEW', // status
        //        i: '1162336018974750208', // order id
        //        M: '0',
        //        l: '0', // last filled
        //        z: '0', // total filled
        //        L: '0', // last traded price
        //        n: '0', // trading fee
        //        N: '', // fee asset
        //        u: true,
        //        w: true,
        //        m: false, // is limit_maker
        //        O: '1653297251042', // order creation
        //        Z: '0', // total filled
        //        A: '0', // account id
        //        C: false, // is close
        //        v: '0', // leverage
        //        d: 'NO_LIQ'
        //    }
        //
        const id = this.safeString (order, 'i');
        const marketId = this.safeString (order, 's');
        const symbol = this.safeSymbol (marketId, market, undefined, 'spot');
        const timestamp = this.safeInteger (order, 'O');
        let price = this.safeString (order, 'p');
        if (price === '0') {
            price = undefined; // market orders
        }
        const filled = this.safeString (order, 'z');
        const status = this.parseOrderStatus (this.safeString (order, 'X'));
        const side = this.safeStringLower (order, 'S');
        const lastTradeTimestamp = this.safeString (order, 'E');
        const timeInForce = this.safeString (order, 'f');
        let amount = undefined;
        const cost = this.safeString (order, 'Z');
        const q = this.safeString (order, 'q');
        let type = this.safeStringLower (order, 'o');
        if (type.indexOf ('quote') >= 0) {
            amount = filled;
        } else {
            amount = q;
        }
        if (type.indexOf ('market') >= 0) {
            type = 'market';
        }
        let fee = undefined;
        const feeCost = this.safeString (order, 'n');
        if (feeCost !== undefined && feeCost !== '0') {
            const feeCurrencyId = this.safeString (order, 'N');
            const feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            fee = {
                'cost': feeCost,
                'currency': feeCurrencyCode,
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': id,
            'clientOrderId': this.safeString (order, 'c'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': undefined,
            'amount': amount,
            'cost': cost,
            'average': undefined,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
        }, market);
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name bybit#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the bybit api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        const method = 'watchBalance';
        const messageHash = 'balances';
        const isUnifiedMargin = await this.isUnifiedMarginEnabled ();
        const url = this.getUrlByMarketType (undefined, true, isUnifiedMargin, method, params);
        await this.authenticate (url);
        const topicByMarket = {
            'spot': 'outboundAccountInfo',
            'contract': 'user.wallet.contractAccount',
            'unified': 'user.wallet.unifiedAccount',
        };
        const topics = [ this.safeValue (topicByMarket, this.getPrivateType (url)) ];
        return await this.watchTopics (url, messageHash, topics, params);
    }

    handleBalance (client, message) {
        //
        // spot
        //    {
        //        "type": "snapshot",
        //        "topic": "outboundAccountInfo",
        //        "ts": "1662107217641",
        //        "data": [
        //            {
        //                "e": "outboundAccountInfo",
        //                "E": "1662107217640",
        //                "T": true,
        //                "W": true,
        //                "D": true,
        //                "B": [
        //                    {
        //                        "a": "USDT",
        //                        "f": "176.81254174",
        //                        "l": "201.575"
        //                    }
        //                ]
        //            }
        //        ]
        //    }
        // contract
        //    {
        //        "topic": "user.wallet.contractAccount",
        //        "data": [
        //            {
        //                "coin": "USDT",
        //                "equity": "610.3984319",
        //                "walletBalance": "609.7384319",
        //                "positionMargin": "4.7582882",
        //                "availableBalance": "604.9801437",
        //                "orderMargin": "0",
        //                "unrealisedPnl": "0.66",
        //                "cumRealisedPnl": "-0.2615681"
        //            }
        //        ]
        //    }
        // unified
        //    {
        //        "id": "46bd0430-1d03-48f7-a503-c6c020d07536",
        //        "topic": "user.wallet.unifiedAccount",
        //        "ts": 1649150852199,
        //        "data": {
        //            "result": {
        //                "accountIMRate": "0.0002",
        //                "accountMMRate": "0.0000",
        //                "totalEquity": "510444.50000000",
        //                "totalWalletBalance": "510444.50000000",
        //                "totalMarginBalance": "510444.50000000",
        //                "totalAvailableBalance": "510333.52491801",
        //                "totalPerpUPL": "0.00000000",
        //                "totalInitialMargin": "110.97508199",
        //                "totalMaintenanceMargin": "9.13733489",
        //                "coin": [{
        //                    "currencyCoin": "USDC",
        //                    "equity": "0.00000000",
        //                    "usdValue": "0.00000000",
        //                    "walletBalance": "0.00000000",
        //                    "marginBalance": "510444.50000000",
        //                    "availableBalance": "510333.52491801",
        //                    "marginBalanceWithoutConvert": "0.00000000",
        //                    "availableBalanceWithoutConvert": "0.00000000",
        //                    "borrowSize": "0.00000000",
        //                    "availableToBorrow": "200000.00000000",
        //                    "accruedInterest": "0.00000000",
        //                    "totalOrderIM": "0.00000000",
        //                    "totalPositionIM": "0.00000000",
        //                    "totalPositionMM": "0.00000000"
        //                }]
        //            },
        //            "version": 19
        //        },
        //        "type": "snapshot"
        //    }
        //
        if (this.balance === undefined) {
            this.balance = {};
        }
        let messageHash = 'balance';
        const topic = this.safeValue (message, 'topic');
        let info = undefined;
        let rawBalances = [];
        if (topic === 'outboundAccountInfo') {
            const data = this.safeValue (message, 'data', []);
            for (let i = 0; i < data.length; i++) {
                const B = this.safeValue (data[i], 'B', []);
                rawBalances = this.arrayConcat (rawBalances, B);
            }
            info = rawBalances;
        }
        if (topic === 'user.wallet.contractAccount') {
            rawBalances = this.safeValue (message, 'data', []);
            info = rawBalances;
        }
        if (topic === 'user.wallet.unifiedAccount') {
            const data = this.safeValue (message, 'data', {});
            const result = this.safeValue (data, 'result', {});
            rawBalances = this.safeValue (result, 'coin', []);
            info = result;
        }
        for (let i = 0; i < rawBalances.length; i++) {
            this.parseWsBalance (rawBalances[i]);
        }
        this.balance['info'] = info;
        const timestamp = this.safeInteger (message, 'ts');
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601 (timestamp);
        this.balance = this.safeBalance (this.balance);
        messageHash = 'balances';
        client.resolve (this.balance, messageHash);
    }

    parseWsBalance (balance) {
        //
        // spot
        //    {
        //        "a": "USDT",
        //        "f": "176.81254174",
        //        "l": "201.575"
        //    }
        // contract
        //    {
        //        "coin": "USDT",
        //        "equity": "610.3984319",
        //        "walletBalance": "609.7384319",
        //        "positionMargin": "4.7582882",
        //        "availableBalance": "604.9801437",
        //        "orderMargin": "0",
        //        "unrealisedPnl": "0.66",
        //        "cumRealisedPnl": "-0.2615681"
        //    }
        // unified
        //    {
        //        "currencyCoin": "USDC",
        //        "equity": "0.00000000",
        //        "usdValue": "0.00000000",
        //        "walletBalance": "0.00000000",
        //        "marginBalance": "510444.50000000",
        //        "availableBalance": "510333.52491801",
        //        "marginBalanceWithoutConvert": "0.00000000",
        //        "availableBalanceWithoutConvert": "0.00000000",
        //        "borrowSize": "0.00000000",
        //        "availableToBorrow": "200000.00000000",
        //        "accruedInterest": "0.00000000",
        //        "totalOrderIM": "0.00000000",
        //        "totalPositionIM": "0.00000000",
        //        "totalPositionMM": "0.00000000"
        //    }
        //
        const account = this.account ();
        const currencyId = this.safeStringN (balance, [ 'a', 'currencyCoin', 'coin' ]);
        const code = this.safeCurrencyCode (currencyId);
        account['free'] = this.safeStringN (balance, [ 'availableBalanceWithoutConvert', 'availableBalance', 'f' ]);
        account['used'] = this.safeString (balance, 'l');
        account['total'] = this.safeString (balance, 'walletBalance');
        this.balance[code] = account;
    }

    async watchTopics (url, messageHash, topics = [], params = {}) {
        const request = {
            'op': 'subscribe',
            'req_id': this.requestId (),
            'args': topics,
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async authenticate (url, params = {}) {
        this.checkRequiredCredentials ();
        const messageHash = 'login';
        const client = this.client (url);
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            future = client.future ('authenticated');
            let expires = this.milliseconds () + 10000;
            expires = expires.toString ();
            const path = 'GET/realtime';
            const auth = path + expires;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), 'sha256', 'hex');
            const request = {
                'op': 'auth',
                'args': [
                    this.apiKey, expires, signature,
                ],
            };
            this.spawn (this.watch, url, messageHash, request, messageHash, future);
        }
        return await future;
    }

    handleErrorMessage (client, message) {
        //
        //   {
        //       success: false,
        //       ret_msg: 'error:invalid op',
        //       conn_id: '5e079fdd-9c7f-404d-9dbf-969d650838b5',
        //       request: { op: '', args: null }
        //   }
        //
        // auth error
        //
        //   {
        //       success: false,
        //       ret_msg: 'error:USVC1111',
        //       conn_id: 'e73770fb-a0dc-45bd-8028-140e20958090',
        //       request: {
        //         op: 'auth',
        //         args: [
        //           '9rFT6uR4uz9Imkw4Wx',
        //           '1653405853543',
        //           '542e71bd85597b4db0290f0ce2d13ed1fd4bb5df3188716c1e9cc69a879f7889'
        //         ]
        //   }
        //
        //   { code: '-10009', desc: 'Invalid period!' }
        //
        const code = this.safeInteger (message, 'code');
        try {
            if (code !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            }
            const success = this.safeValue (message, 'success');
            if (success !== undefined && !success) {
                const ret_msg = this.safeString (message, 'ret_msg');
                const request = this.safeValue (message, 'request', {});
                const op = this.safeString (request, 'op');
                if (op === 'auth') {
                    throw new AuthenticationError ('Authentication failed: ' + ret_msg);
                } else {
                    throw new ExchangeError (this.id + ' ' + ret_msg);
                }
            }
        } catch (e) {
            if (e instanceof AuthenticationError) {
                client.reject (e, 'authenticated');
                const method = 'login';
                if (method in client.subscriptions) {
                    delete client.subscriptions[method];
                }
                return false;
            }
            throw e;
        }
        return message;
    }

    handleMessage (client, message) {
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        // contract pong
        const ret_msg = this.safeString (message, 'ret_msg');
        if (ret_msg === 'pong') {
            this.handlePong (client, message);
            return;
        }
        // spot pong
        const pong = this.safeInteger (message, 'pong');
        if (pong !== undefined) {
            this.handlePong (client, message);
            return;
        }
        // pong
        const op = this.safeString (message, 'op');
        if (op === 'pong') {
            this.handlePong (client, message);
            return;
        }
        const event = this.safeString (message, 'event');
        if (event === 'sub') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const topic = this.safeString (message, 'topic', '');
        const methods = {
            'orderbook': this.handleOrderBook,
            'kline': this.handleOHLCV,
            'order': this.handleOrder,
            'stopOrder': this.handleOrder,
            'ticker': this.handleTicker,
            'trade': this.handleTrades,
            'publicTrade': this.handleTrades,
            'depth': this.handleOrderBook,
            'wallet': this.handleBalance,
            'outboundAccountInfo': this.handleBalance,
            'execution': this.handleMyTrades,
            'ticketInfo': this.handleMyTrades,
        };
        const keys = Object.keys (methods);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (topic.indexOf (keys[i]) >= 0) {
                const method = methods[key];
                method.call (this, client, message);
                return;
            }
        }
        // unified auth acknowledgement
        const type = this.safeString (message, 'type');
        if ((op === 'auth') || (type === 'AUTH_RESP')) {
            this.handleAuthenticate (client, message);
        }
    }

    ping () {
        return {
            'req_id': this.requestId (),
            'op': 'ping',
        };
    }

    handlePong (client, message) {
        //
        //   {
        //       success: true,
        //       ret_msg: 'pong',
        //       conn_id: 'db3158a0-8960-44b9-a9de-ac350ee13158',
        //       request: { op: 'ping', args: null }
        //   }
        //
        //   { pong: 1653296711335 }
        //
        client.lastPong = this.safeInteger (message, 'pong');
        return message;
    }

    handleAuthenticate (client, message) {
        //
        //    {
        //        success: true,
        //        ret_msg: '',
        //        op: 'auth',
        //        conn_id: 'ce3dpomvha7dha97tvp0-2xh'
        //    }
        //
        const success = this.safeValue (message, 'success');
        if (success) {
            client.resolve (message, 'authenticated');
        } else {
            const error = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (error, 'authenticated');
        }
        return message;
    }

    handleSubscriptionStatus (client, message) {
        //
        //    {
        //        topic: 'kline',
        //        event: 'sub',
        //        params: {
        //          symbol: 'LTCUSDT',
        //          binary: 'false',
        //          klineType: '1m',
        //          symbolName: 'LTCUSDT'
        //        },
        //        code: '0',
        //        msg: 'Success'
        //    }
        //
        return message;
    }
};
