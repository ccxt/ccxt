
//  ---------------------------------------------------------------------------

import hitbtc3Rest from '../hitbtc3.js';
import { ArrayCache } from '../base/ws/Cache.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { Trade, OHLCV } from '../base/types';

//  ---------------------------------------------------------------------------

export default class hitbtc3 extends hitbtc3Rest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchOrderBook': true,
                'watchBalance': false,
                'watchOHLCV': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.hitbtc.com/api/3/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'watchTicker': {
                    'method': 'ticker/1s',  // 'ticker/price/1s', 'ticker/price/3s', 'ticker/1s', 'ticker/3s', ticker/1s/batch, ticker/3s/batch, ticker/1s/price/batch, or ticker/3s/price/batch
                },
                'watchTickers': {
                    'method': 'ticker/1s',  // 'ticker/price/1s', 'ticker/price/3s', 'ticker/1s', 'ticker/3s', ticker/1s/batch, ticker/3s/batch, ticker/1s/price/batch, or ticker/3s/price/batch
                },
                'watchOrderBook': {
                    'method': 'orderbook/full',  // 'orderbook/full', 'orderbook/{depth}/{speed}', 'orderbook/{depth}/{speed}/batch', 'orderbook/top/{speed}', or 'orderbook/top/{speed}/batch'
                },
            },
            'timeframes': {
                '1m': 'M1',
                '3m': 'M3',
                '5m': 'M5',
                '15m': 'M15',
                '30m': 'M30',
                '1h': 'H1',
                '4h': 'H4',
                '1d': 'D1',
                '1w': 'D7',
                '1M': '1M',
            },
            'streaming': {
                'keepAlive': 15000,
                // 'ping': this.ping,
            },
        });
    }

    async watchPublic (name: string, symbol: string = undefined, params = {}) {
        /**
         * @ignore
         * @method
         * @param {string} name websocket endpoint name
         * @param {string|undefined} symbol unified CCXT symbol
         * @param {object} params extra parameters specific to the hitbtc3 api
         * @returns
         */
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        let messageHash = name;
        if (symbol !== undefined) {
            messageHash = messageHash + ':' + symbol;
        }
        const subscribe = {
            'method': 'subscribe',
            'params': params,
            'id': this.nonce (),
            'ch': name,
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://api.hitbtc.com/#subscribe-to-full-order-book
         * @see https://api.hitbtc.com/#subscribe-to-partial-order-book
         * @see https://api.hitbtc.com/#subscribe-to-partial-order-book-in-batches
         * @see https://api.hitbtc.com/#subscribe-to-top-of-book
         * @see https://api.hitbtc.com/#subscribe-to-top-of-book-in-batches
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string|undefined} params.method 'orderbook/full', 'orderbook/{depth}/{speed}', 'orderbook/{depth}/{speed}/batch', 'orderbook/top/{speed}', or 'orderbook/top/{speed}/batch'
         * @param {int|undefined} params.depth 5 (default), 10, or 20
         * @param {int|undefined} params.speed 100 (default), 500, or 1000
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        const options = this.safeValue (this.options, 'watchOrderBook');
        const defaultMethod = this.safeString (options, 'method', 'orderbook/full');
        let name = this.safeString2 (params, 'method', 'defaultMethod', defaultMethod);
        const depth = this.safeString (params, 'depth', '5');
        const speed = this.safeString (params, 'depth', '100');
        if (name === 'orderbook/{depth}/{speed}') {
            name = 'orderbook/D' + depth + '/' + speed + 'ms';
        } else if (name === 'orderbook/{depth}/{speed}/batch') {
            name = 'orderbook/D' + depth + '/' + speed + 'ms/batch';
        } else if (name === 'orderbook/top/{speed}') {
            name = 'orderbook/top/' + speed + 'ms';
        } else if (name === 'orderbook/top/{speed}/batch') {
            name = 'orderbook/top/' + speed + 'ms/batch';
        }
        const market = this.market (symbol);
        const request = {
            'params': {
                'symbols': [ market['id'] ],
            },
        };
        const orderbook = await this.watchPublic (name, symbol, this.deepExtend (request, params));
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //    {
        //        "ch": "orderbook/full",                 // Channel
        //        "snapshot": {
        //            "ETHBTC": {
        //                "t": 1626866578796,             // Timestamp in milliseconds
        //                "s": 27617207,                  // Sequence number
        //                "a": [                          // Asks
        //                    ["0.060506", "0"],
        //                    ["0.060549", "12.6431"],
        //                    ["0.060570", "0"],
        //                    ["0.060612", "0"]
        //                ],
        //                "b": [                          // Bids
        //                    ["0.060439", "4.4095"],
        //                    ["0.060414", "0"],
        //                    ["0.060407", "7.3349"],
        //                    ["0.060390", "0"]
        //                ]
        //            }
        //        }
        //    }
        //
        const data = this.safeValue2 (message, 'snapshot', 'update', {});
        const marketIds = Object.keys (data);
        const channel = this.safeString (message, 'ch');
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const item = data[marketId];
            const messageHash = channel + ':' + symbol;
            if (!(symbol in this.orderbooks)) {
                const subscription = this.safeValue (client.subscriptions, messageHash, {});
                const limit = this.safeInteger (subscription, 'limit');
                this.orderbooks[symbol] = this.orderBook ({}, limit);
            }
            const timestamp = this.safeInteger (item, 't');
            const nonce = this.safeInteger (item, 's');
            const orderbook = this.orderbooks[symbol];
            const asks = this.safeValue (item, 'a', []);
            const bids = this.safeValue (item, 'b', []);
            this.handleDeltas (orderbook['asks'], asks);
            this.handleDeltas (orderbook['bids'], bids);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            orderbook['nonce'] = nonce;
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        }
    }

    handleDelta (bookside, delta) {
        const amount = this.safeNumber (delta, 0);
        const price = this.safeNumber (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name hitbtc3#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://api.hitbtc.com/#subscribe-to-ticker
         * @see https://api.hitbtc.com/#subscribe-to-ticker-in-batches
         * @see https://api.hitbtc.com/#subscribe-to-mini-ticker
         * @see https://api.hitbtc.com/#subscribe-to-mini-ticker-in-batches
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @param {string} params.method 'ticker/1s' (default), 'ticker/3s', 'ticker/price/1s', or 'ticker/price/3s'
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        const options = this.safeValue (this.options, 'watchTicker');
        const defaultMethod = this.safeString (options, 'method', 'ticker/1s');
        const name = this.safeString2 (params, 'method', 'defaultMethod', defaultMethod);
        const market = this.market (symbol);
        const request = {
            'params': {
                'symbols': [ market['id'] ],
            },
        };
        return await this.watchPublic (name, symbol, this.deepExtend (request, params));
    }

    async watchTickers (symbols = undefined, params = {}) {
        /**
         * @method
         * @name poloniex#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the poloniex api endpoint
         * @param {string} params.method 'ticker/price/1s', 'ticker/price/3s', 'ticker/1s', 'ticker/3s', 'ticker/1s/batch', 'ticker/3s/batch', 'ticker/1s/price/batch', or 'ticker/3s/price/batch'
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
         */
        await this.loadMarkets ();
        const options = this.safeValue (this.options, 'watchTicker');
        const defaultMethod = this.safeString (options, 'method', 'ticker/1s');
        const name = this.safeString2 (params, 'method', 'defaultMethod', defaultMethod);
        const marketIds = [];
        if (symbols === undefined) {
            marketIds.push ('*');
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const marketId = this.marketId (symbols[i]);
                marketIds.push (marketId);
            }
        }
        const request = {
            'params': {
                'symbols': marketIds,
            },
        };
        return await this.watchPublic (name, undefined, this.deepExtend (request, params));
    }

    handleTicker (client: Client, message) {
        //
        //    {
        //        "ch": "ticker/1s",
        //        "data": {
        //            "ETHBTC": {
        //                "t": 1614815872000,             // Timestamp in milliseconds
        //                "a": "0.031175",                // Best ask
        //                "A": "0.03329",                 // Best ask quantity
        //                "b": "0.031148",                // Best bid
        //                "B": "0.10565",                 // Best bid quantity
        //                "c": "0.031210",                // Last price
        //                "o": "0.030781",                // Open price
        //                "h": "0.031788",                // High price
        //                "l": "0.030733",                // Low price
        //                "v": "62.587",                  // Base asset volume
        //                "q": "1.951420577",             // Quote asset volume
        //                "p": "0.000429",                // Price change
        //                "P": "1.39",                    // Price change percent
        //                "L": 1182694927                 // Last trade identifier
        //            }
        //        }
        //    }
        //
        //    {
        //        "ch": "ticker/price/1s",
        //        "data": {
        //            "BTCUSDT": {
        //                "t": 1614815872030,
        //                "o": "32636.79",
        //                "c": "32085.51",
        //                "h": "33379.92",
        //                "l": "30683.28",
        //                "v": "11.90667",
        //                "q": "384081.1955629"
        //            }
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const marketIds = Object.keys (data);
        const channel = this.safeString (message, 'ch');
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            const ticker = this.parseTicker (data[symbol], market);
            this.tickers[symbol] = ticker;
            const messageHash = channel + ':' + symbol;
            client.resolve (this.tickers[symbol], messageHash);
        }
        client.resolve (this.tickers, channel);
        return message;
    }

    parseWsTicker (ticker, market = undefined) {
        //
        //    {
        //        "t": 1614815872000,             // Timestamp in milliseconds
        //        "a": "0.031175",                // Best ask
        //        "A": "0.03329",                 // Best ask quantity
        //        "b": "0.031148",                // Best bid
        //        "B": "0.10565",                 // Best bid quantity
        //        "c": "0.031210",                // Last price
        //        "o": "0.030781",                // Open price
        //        "h": "0.031788",                // High price
        //        "l": "0.030733",                // Low price
        //        "v": "62.587",                  // Base asset volume
        //        "q": "1.951420577",             // Quote asset volume
        //        "p": "0.000429",                // Price change
        //        "P": "1.39",                    // Price change percent
        //        "L": 1182694927                 // Last trade identifier
        //    }
        //
        //    {
        //        "t": 1614815872030,
        //        "o": "32636.79",
        //        "c": "32085.51",
        //        "h": "33379.92",
        //        "l": "30683.28",
        //        "v": "11.90667",
        //        "q": "384081.1955629"
        //    }
        //
        const timestamp = this.safeInteger (ticker, 't');
        const symbol = this.safeSymbol (undefined, market);
        const last = this.safeString (ticker, 'c');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': this.safeString (ticker, 'b'),
            'bidVolume': this.safeString (ticker, 'B'),
            'ask': this.safeString (ticker, 'a'),
            'askVolume': this.safeString (ticker, 'A'),
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'q'),
            'info': ticker,
        }, market);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://api.hitbtc.com/#subscribe-to-trades
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since not used by hitbtc3 watchTrades
         * @param {int|undefined} limit 0-1000, Default value = 0 (no history returned)
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'symbols': [ market['id'] ],
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        params = this.deepExtend ({
            'params': request,
        });
        const trades = await this.watchPublic (symbol, 'trades', undefined, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp');
    }

    handleTrades (client: Client, message) {
        //
        //    {
        //        "result": {
        //            "ch": "trades",                           // Channel
        //            "subscriptions": ["ETHBTC", "BTCUSDT"]
        //        },
        //        "id": 123
        //    }
        //
        // Notification snapshot
        //
        //    {
        //        "ch": "trades",                               // Channel
        //        "snapshot": {
        //            "BTCUSDT": [{
        //                "t": 1626861109494,                   // Timestamp in milliseconds
        //                "i": 1555634969,                      // Trade identifier
        //                "p": "30881.96",                      // Price
        //                "q": "12.66828",                      // Quantity
        //                "s": "buy"                            // Side
        //            }]
        //        }
        //    }
        //
        // Notification update
        //
        //    {
        //        "ch": "trades",
        //        "update": {
        //            "BTCUSDT": [{
        //                "t": 1626861123552,
        //                "i": 1555634969,
        //                "p": "30877.68",
        //                "q": "0.00006",
        //                "s": "sell"
        //            }]
        //        }
        //    }
        //
        const data = this.safeValue2 (message, 'snapshot', 'update', {});
        const marketIds = Object.keys (data);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const tradesLimit = this.safeInteger (this.options, 'tradesLimit', 1000);
            const symbol = market['symbol'];
            let stored = this.safeValue (this.trades, symbol);
            if (stored === undefined) {
                stored = new ArrayCache (tradesLimit);
                this.trades[symbol] = stored;
            }
            const trades = this.parseWsTrades (data[marketId], market);
            for (let i = 0; i < trades.length; i++) {
                stored.append (trades[i]);
            }
            const messageHash = 'trades:' + symbol;
            client.resolve (stored, messageHash);
        }
        return message;
    }

    parseWsTrades (trades, market: object = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Trade[] {
        trades = this.toArray (trades);
        let result = [];
        for (let i = 0; i < trades.length; i++) {
            const trade = this.extend (this.parseWsTrade (trades[i], market), params);
            result.push (trade);
        }
        result = this.sortBy2 (result, 'timestamp', 'id');
        const symbol = (market !== undefined) ? market['symbol'] : undefined;
        return this.filterBySymbolSinceLimit (result, symbol, since, limit) as Trade[];
    }

    parseWsTrade (trade, market = undefined) {
        //
        //    {
        //        "t": 1626861123552,       // Timestamp in milliseconds
        //        "i": 1555634969,          // Trade identifier
        //        "p": "30877.68",          // Price
        //        "q": "0.00006",           // Quantity
        //        "s": "sell"               // Side
        //    }
        //
        const timestamp = this.safeInteger (trade, 't');
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'i'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': undefined,
            'type': undefined,
            'side': this.safeString (trade, 'side'),
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'q'),
            'cost': undefined,
            'fee': undefined,
        }, market);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name hitbtc3#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://api.hitbtc.com/#subscribe-to-candles
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since not used by hitbtc3 watchOHLCV
         * @param {int|undefined} limit 0 – 1000, default value = 0 (no history returned)
         * @param {object} params extra parameters specific to the hitbtc3 api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const period = this.safeString (this.timeframes, timeframe, timeframe);
        const name = 'candles/' + period;
        const market = this.market (symbol);
        const request = {
            'params': {
                'symbols': market['id'],
            },
        };
        if (limit !== undefined) {
            request['params']['limit'] = limit;
        }
        params = this.deepExtend (request, params);
        const ohlcv = await this.watchPublic (name, symbol, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0);
    }

    handleOHLCV (client: Client, message) {
        //
        //    {
        //        "ch": "candles/M1",                     // Channel
        //        "snapshot": {
        //            "BTCUSDT": [{
        //                "t": 1626860340000,             // Message timestamp
        //                "o": "30881.95",                // Open price
        //                "c": "30890.96",                // Last price
        //                "h": "30900.8",                 // High price
        //                "l": "30861.27",                // Low price
        //                "v": "1.27852",                 // Base asset volume
        //                "q": "39493.9021811"            // Quote asset volume
        //            }
        //            ...
        //            ]
        //        }
        //    }
        //
        //    {
        //        "ch": "candles/M1",
        //        "update": {
        //            "ETHBTC": [{
        //                "t": 1626860880000,
        //                "o": "0.060711",
        //                "c": "0.060749",
        //                "h": "0.060749",
        //                "l": "0.060711",
        //                "v": "12.2800",
        //                "q": "0.7455339675"
        //          }]
        //        }
        //    }
        //
        const data = this.safeValue2 (message, 'snapshot', 'update', {});
        const marketIds = Object.keys (data);
        const channel = this.safeString (message, 'ch');
        const splitChannel = channel.split ('/');
        const period = this.safeString (splitChannel, 1);
        const timeframe = this.findTimeframe (period);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'];
            let stored = this.safeValue (this.ohlcvs, symbol);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCache (limit);
                this.ohlcvs[symbol][timeframe] = stored;
            }
            const ohlcvs = this.parseWsOHLCVs (data[marketId], market);
            for (let i = 0; i < ohlcvs.length; i++) {
                stored.append (ohlcvs[i]);
            }
            const messageHash = channel + ':' + symbol;
            client.resolve (stored, messageHash);
        }
        return message;
    }

    parseWsOHLCVs (ohlcvs: object[], market: any = undefined, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined): OHLCV[] {
        const results = [];
        for (let i = 0; i < ohlcvs.length; i++) {
            results.push (this.parseWsOHLCV (ohlcvs[i], market));
        }
        const sorted = this.sortBy (results, 0);
        return this.filterBySinceLimit (sorted, since, limit, 0) as any;
    }

    parseWsOHLCV (ohlcv, market = undefined) {
        //
        //    {
        //        "t": 1626860340000,             // Message timestamp
        //        "o": "30881.95",                // Open price
        //        "c": "30890.96",                // Last price
        //        "h": "30900.8",                 // High price
        //        "l": "30861.27",                // Low price
        //        "v": "1.27852",                 // Base asset volume
        //        "q": "39493.9021811"            // Quote asset volume
        //    }
        //
        return [
            this.safeInteger (ohlcv, 't'),
            this.safeNumber (ohlcv, 'o'),
            this.safeNumber (ohlcv, 'h'),
            this.safeNumber (ohlcv, 'l'),
            this.safeNumber (ohlcv, 'c'),
            this.safeNumber (ohlcv, 'v'),
        ];
    }

    handleNotification (client: Client, message) {
        //
        //     { jsonrpc: '2.0', result: true, id: null }
        //
        return message;
    }

    handleMessage (client: Client, message) {
        const methods = {
            'candles/M1': this.handleOHLCV,
            'candles/M3': this.handleOHLCV,
            'candles/M5': this.handleOHLCV,
            'candles/M15': this.handleOHLCV,
            'candles/M30': this.handleOHLCV,
            'candles/H1': this.handleOHLCV,
            'candles/H4': this.handleOHLCV,
            'candles/D1': this.handleOHLCV,
            'candles/D7': this.handleOHLCV,
            'candles/1M': this.handleOHLCV,
            'ticker/price/1s': this.handleTicker,
            'ticker/price/3s': this.handleTicker,
            'ticker/1s': this.handleTicker,
            'ticker/3s': this.handleTicker,
            'ticker/price/1s/batch': this.handleTicker,
            'ticker/price/3s/batch': this.handleTicker,
            'ticker/1s/batch': this.handleTicker,
            'ticker/3s/batch': this.handleTicker,
            'trades': this.handleTrades,
            'ticker': this.handleTicker,
            'updateOrderbook': this.handleOrderBookUpdate,
        };
        const channel = this.safeString (message, 'ch');
        const method = this.safeValue (methods, channel);
        // if (method === undefined) {
        // this.handleNotification (client, message);
        // } else {
        method.call (this, client, message);
        // }
    }
}
