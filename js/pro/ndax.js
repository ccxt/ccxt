'use strict';

//  ---------------------------------------------------------------------------

const ndaxRest = require ('../ndax.js');
const { ArrayCache } = require ('./base/Cache');

//  ---------------------------------------------------------------------------

module.exports = class ndax extends ndaxRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchTicker': true,
                'watchOHLCV': true,
            },
            'urls': {
                'test': {
                    'ws': 'wss://ndaxmarginstaging.cdnhop.net:10456/WSAdminGatewa/',
                },
                'api': {
                    'ws': 'wss://api.ndax.io/WSGateway',
                },
            },
            // 'options': {
            //     'tradesLimit': 1000,
            //     'ordersLimit': 1000,
            //     'OHLCVLimit': 1000,
            // },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    async watchTicker (symbol, params = {}) {
        /**
         * @method
         * @name ndax#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        const market = this.market (symbol);
        const name = 'SubscribeLevel1';
        const messageHash = name + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const payload = {
            'OMSId': omsId,
            'InstrumentId': parseInt (market['id']), // conditionally optional
            // 'Symbol': market['info']['symbol'], // conditionally optional
        };
        const request = {
            'm': 0, // message type, 0 request, 1 reply, 2 subscribe, 3 event, unsubscribe, 5 error
            'i': requestId, // sequence number identifies an individual request or request-and-response pair, to your application
            'n': name, // function name is the name of the function being called or that the server is responding to, the server echoes your call
            'o': this.json (payload), // JSON-formatted string containing the data being sent with the message
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    handleTicker (client, message) {
        const payload = this.safeValue (message, 'o', {});
        //
        //     {
        //         "OMSId": 1,
        //         "InstrumentId": 1,
        //         "BestBid": 6423.57,
        //         "BestOffer": 6436.53,
        //         "LastTradedPx": 6423.57,
        //         "LastTradedQty": 0.96183964,
        //         "LastTradeTime": 1534862990343,
        //         "SessionOpen": 6249.64,
        //         "SessionHigh": 11111,
        //         "SessionLow": 4433,
        //         "SessionClose": 6249.64,
        //         "Volume": 0.96183964,
        //         "CurrentDayVolume": 3516.31668185,
        //         "CurrentDayNumTrades": 8529,
        //         "CurrentDayPxChange": 173.93,
        //         "CurrentNotional": 0.0,
        //         "Rolling24HrNotional": 0.0,
        //         "Rolling24HrVolume": 4319.63870783,
        //         "Rolling24NumTrades": 10585,
        //         "Rolling24HrPxChange": -0.4165607307408487,
        //         "TimeStamp": "1534862990358"
        //     }
        //
        const ticker = this.parseTicker (payload);
        const symbol = ticker['symbol'];
        const market = this.market (symbol);
        this.tickers[symbol] = ticker;
        const name = 'SubscribeLevel1';
        const messageHash = name + ':' + market['id'];
        client.resolve (ticker, messageHash);
    }

    async watchTrades (symbol, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const name = 'SubscribeTrades';
        const messageHash = name + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const payload = {
            'OMSId': omsId,
            'InstrumentId': parseInt (market['id']), // conditionally optional
            'IncludeLastCount': 100, // the number of previous trades to retrieve in the immediate snapshot, 100 by default
        };
        const request = {
            'm': 0, // message type, 0 request, 1 reply, 2 subscribe, 3 event, unsubscribe, 5 error
            'i': requestId, // sequence number identifies an individual request or request-and-response pair, to your application
            'n': name, // function name is the name of the function being called or that the server is responding to, the server echoes your call
            'o': this.json (payload), // JSON-formatted string containing the data being sent with the message
        };
        const message = this.extend (request, params);
        const trades = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client, message) {
        const payload = this.safeValue (message, 'o', []);
        //
        // initial snapshot
        //
        //     [
        //         [
        //             6913253,       //  0 TradeId
        //             8,             //  1 ProductPairCode
        //             0.03340802,    //  2 Quantity
        //             19116.08,      //  3 Price
        //             2543425077,    //  4 Order1
        //             2543425482,    //  5 Order2
        //             1606935922416, //  6 Tradetime
        //             0,             //  7 Direction
        //             1,             //  8 TakerSide
        //             0,             //  9 BlockTrade
        //             0,             // 10 Either Order1ClientId or Order2ClientId
        //         ]
        //     ]
        //
        const name = 'SubscribeTrades';
        const updates = {};
        for (let i = 0; i < payload.length; i++) {
            const trade = this.parseTrade (payload[i]);
            const symbol = trade['symbol'];
            let tradesArray = this.safeValue (this.trades, symbol);
            if (tradesArray === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                tradesArray = new ArrayCache (limit);
            }
            tradesArray.append (trade);
            this.trades[symbol] = tradesArray;
            updates[symbol] = true;
        }
        const symbols = Object.keys (updates);
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market (symbol);
            const messageHash = name + ':' + market['id'];
            const tradesArray = this.safeValue (this.trades, symbol);
            client.resolve (tradesArray, messageHash);
        }
    }

    async watchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const name = 'SubscribeTicker';
        const messageHash = name + ':' + timeframe + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        const payload = {
            'OMSId': omsId,
            'InstrumentId': parseInt (market['id']), // conditionally optional
            'Interval': parseInt (this.timeframes[timeframe]),
            'IncludeLastCount': 100, // the number of previous candles to retrieve in the immediate snapshot, 100 by default
        };
        const request = {
            'm': 0, // message type, 0 request, 1 reply, 2 subscribe, 3 event, unsubscribe, 5 error
            'i': requestId, // sequence number identifies an individual request or request-and-response pair, to your application
            'n': name, // function name is the name of the function being called or that the server is responding to, the server echoes your call
            'o': this.json (payload), // JSON-formatted string containing the data being sent with the message
        };
        const message = this.extend (request, params);
        const ohlcv = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client, message) {
        //
        //     {
        //         m: 1,
        //         i: 1,
        //         n: 'SubscribeTicker',
        //         o: [[1608284160000,23113.52,23070.88,23075.76,23075.39,162.44964300,23075.38,23075.39,8,1608284100000]],
        //     }
        //
        const payload = this.safeValue (message, 'o', []);
        //
        //     [
        //         [
        //             1501603632000,      // 0 DateTime
        //             2700.33,            // 1 High
        //             2687.01,            // 2 Low
        //             2687.01,            // 3 Open
        //             2687.01,            // 4 Close
        //             24.86100992,        // 5 Volume
        //             0,                  // 6 Inside Bid Price
        //             2870.95,            // 7 Inside Ask Price
        //             1                   // 8 InstrumentId
        //             1608290188062.7678, // 9 candle timestamp
        //         ]
        //     ]
        //
        const updates = {};
        for (let i = 0; i < payload.length; i++) {
            const ohlcv = payload[i];
            const marketId = this.safeString (ohlcv, 8);
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            updates[marketId] = {};
            this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
            const keys = Object.keys (this.timeframes);
            for (let j = 0; j < keys.length; j++) {
                const timeframe = keys[j];
                const interval = this.timeframes[timeframe];
                const duration = parseInt (interval) * 1000;
                const timestamp = this.safeInteger (ohlcv, 0);
                const parsed = [
                    parseInt (timestamp / duration) * duration,
                    this.safeFloat (ohlcv, 3),
                    this.safeFloat (ohlcv, 1),
                    this.safeFloat (ohlcv, 2),
                    this.safeFloat (ohlcv, 4),
                    this.safeFloat (ohlcv, 5),
                ];
                const stored = this.safeValue (this.ohlcvs[symbol], timeframe, []);
                const length = stored.length;
                if (length && (parsed[0] === stored[length - 1][0])) {
                    const previous = stored[length - 1];
                    stored[length - 1] = [
                        parsed[0],
                        previous[1],
                        Math.max (parsed[1], previous[1]),
                        Math.min (parsed[2], previous[2]),
                        parsed[4],
                        this.sum (parsed[5], previous[5]),
                    ];
                    updates[marketId][timeframe] = true;
                } else {
                    if (length && (parsed[0] < stored[length - 1][0])) {
                        continue;
                    } else {
                        stored.push (parsed);
                        const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                        if (length >= limit) {
                            stored.shift ();
                        }
                        updates[marketId][timeframe] = true;
                    }
                }
                this.ohlcvs[symbol][timeframe] = stored;
            }
        }
        const name = 'SubscribeTicker';
        const marketIds = Object.keys (updates);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const timeframes = Object.keys (updates[marketId]);
            for (let j = 0; j < timeframes.length; j++) {
                const timeframe = timeframes[j];
                const messageHash = name + ':' + timeframe + ':' + marketId;
                const market = this.safeMarket (marketId);
                const symbol = market['symbol'];
                const stored = this.safeValue (this.ohlcvs[symbol], timeframe, []);
                client.resolve (stored, messageHash);
            }
        }
    }

    async watchOrderBook (symbol, limit = undefined, params = {}) {
        /**
         * @method
         * @name ndax#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the ndax api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
         */
        const omsId = this.safeInteger (this.options, 'omsId', 1);
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const name = 'SubscribeLevel2';
        const messageHash = name + ':' + market['id'];
        const url = this.urls['api']['ws'];
        const requestId = this.requestId ();
        limit = (limit === undefined) ? 100 : limit;
        const payload = {
            'OMSId': omsId,
            'InstrumentId': parseInt (market['id']), // conditionally optional
            // 'Symbol': market['info']['symbol'], // conditionally optional
            'Depth': limit, // default 100
        };
        const request = {
            'm': 0, // message type, 0 request, 1 reply, 2 subscribe, 3 event, unsubscribe, 5 error
            'i': requestId, // sequence number identifies an individual request or request-and-response pair, to your application
            'n': name, // function name is the name of the function being called or that the server is responding to, the server echoes your call
            'o': this.json (payload), // JSON-formatted string containing the data being sent with the message
        };
        const subscription = {
            'id': requestId,
            'messageHash': messageHash,
            'name': name,
            'symbol': symbol,
            'marketId': market['id'],
            'method': this.handleOrderBookSubscription,
            'limit': limit,
            'params': params,
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash, subscription);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         m: 3,
        //         i: 2,
        //         n: 'Level2UpdateEvent',
        //         o: [[2,1,1608208308265,0,20782.49,1,25000,8,1,1]]
        //     }
        //
        const payload = this.safeValue (message, 'o', []);
        //
        //     [
        //         0,   // 0 MDUpdateId
        //         1,   // 1 Number of Unique Accounts
        //         123, // 2 ActionDateTime in Posix format X 1000
        //         0,   // 3 ActionType 0 (New), 1 (Update), 2(Delete)
        //         0.0, // 4 LastTradePrice
        //         0,   // 5 Number of Orders
        //         0.0, // 6 Price
        //         0,   // 7 ProductPairCode
        //         0.0, // 8 Quantity
        //         0,   // 9 Side
        //     ],
        //
        const firstBidAsk = this.safeValue (payload, 0, []);
        const marketId = this.safeString (firstBidAsk, 7);
        if (marketId === undefined) {
            return message;
        }
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            return message;
        }
        let timestamp = undefined;
        let nonce = undefined;
        for (let i = 0; i < payload.length; i++) {
            const bidask = payload[i];
            if (timestamp === undefined) {
                timestamp = this.safeInteger (bidask, 2);
            } else {
                const newTimestamp = this.safeInteger (bidask, 2);
                timestamp = Math.max (timestamp, newTimestamp);
            }
            if (nonce === undefined) {
                nonce = this.safeInteger (bidask, 0);
            } else {
                const newNonce = this.safeInteger (bidask, 0);
                nonce = Math.max (nonce, newNonce);
            }
            // 0 new, 1 update, 2 remove
            const type = this.safeInteger (bidask, 3);
            const price = this.safeFloat (bidask, 6);
            const amount = this.safeFloat (bidask, 8);
            const side = this.safeInteger (bidask, 9);
            // 0 buy, 1 sell, 2 short reserved for future use, 3 unknown
            const orderbookSide = (side === 0) ? orderbook['bids'] : orderbook['asks'];
            // 0 new, 1 update, 2 remove
            if (type === 0) {
                orderbookSide.store (price, amount);
            } else if (type === 1) {
                orderbookSide.store (price, amount);
            } else if (type === 2) {
                orderbookSide.store (price, 0);
            }
        }
        orderbook['nonce'] = nonce;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        const name = 'SubscribeLevel2';
        const messageHash = name + ':' + marketId;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleOrderBookSubscription (client, message, subscription) {
        //
        //     {
        //         m: 1,
        //         i: 1,
        //         n: 'SubscribeLevel2',
        //         o: [[1,1,1608204295901,0,20782.49,1,18200,8,1,0]]
        //     }
        //
        const payload = this.safeValue (message, 'o', []);
        //
        //     [
        //         [
        //             0,   // 0 MDUpdateId
        //             1,   // 1 Number of Unique Accounts
        //             123, // 2 ActionDateTime in Posix format X 1000
        //             0,   // 3 ActionType 0 (New), 1 (Update), 2(Delete)
        //             0.0, // 4 LastTradePrice
        //             0,   // 5 Number of Orders
        //             0.0, // 6 Price
        //             0,   // 7 ProductPairCode
        //             0.0, // 8 Quantity
        //             0,   // 9 Side
        //         ],
        //     ]
        //
        const symbol = this.safeString (subscription, 'symbol');
        const snapshot = this.parseOrderBook (payload, symbol);
        const limit = this.safeInteger (subscription, 'limit');
        const orderbook = this.orderBook (snapshot, limit);
        this.orderbooks[symbol] = orderbook;
        const messageHash = this.safeString (subscription, 'messageHash');
        client.resolve (orderbook, messageHash);
    }

    handleSubscriptionStatus (client, message) {
        //
        //     {
        //         m: 1,
        //         i: 1,
        //         n: 'SubscribeLevel2',
        //         o: '[[1,1,1608204295901,0,20782.49,1,18200,8,1,0]]'
        //     }
        //
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const id = this.safeInteger (message, 'i');
        const subscription = this.safeValue (subscriptionsById, id);
        if (subscription !== undefined) {
            const method = this.safeValue (subscription, 'method');
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message, subscription);
            }
        }
    }

    handleMessage (client, message) {
        //
        //     {
        //         "m": 0, // message type, 0 request, 1 reply, 2 subscribe, 3 event, unsubscribe, 5 error
        //         "i": 0, // sequence number identifies an individual request or request-and-response pair, to your application
        //         "n":"function name", // function name is the name of the function being called or that the server is responding to, the server echoes your call
        //         "o":"payload", // JSON-formatted string containing the data being sent with the message
        //     }
        //
        //     {
        //         m: 1,
        //         i: 1,
        //         n: 'SubscribeLevel2',
        //         o: '[[1,1,1608204295901,0,20782.49,1,18200,8,1,0]]'
        //     }
        //
        //     {
        //         m: 3,
        //         i: 2,
        //         n: 'Level2UpdateEvent',
        //         o: '[[2,1,1608208308265,0,20782.49,1,25000,8,1,1]]'
        //     }
        //
        const payload = this.safeString (message, 'o');
        if (payload === undefined) {
            return message;
        }
        message['o'] = JSON.parse (payload);
        const methods = {
            'SubscribeLevel2': this.handleSubscriptionStatus,
            'SubscribeLevel1': this.handleTicker,
            'Level2UpdateEvent': this.handleOrderBook,
            'Level1UpdateEvent': this.handleTicker,
            'SubscribeTrades': this.handleTrades,
            'TradeDataUpdateEvent': this.handleTrades,
            'SubscribeTicker': this.handleOHLCV,
            'TickerDataUpdateEvent': this.handleOHLCV,
        };
        const event = this.safeString (message, 'n');
        const method = this.safeValue (methods, event);
        if (method === undefined) {
            return message;
        } else {
            return method.call (this, client, message);
        }
    }
};
