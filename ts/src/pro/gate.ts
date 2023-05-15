
//  ---------------------------------------------------------------------------

import gateRest from '../gate.js';
import { AuthenticationError, BadRequest, ArgumentsRequired, InvalidNonce } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { sha512 } from '../static_dependencies/noble-hashes/sha512.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class gate extends gateRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTicker': true,
                'watchTickers': true, // for now
                'watchTrades': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchBalance': true,
                'watchOrders': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.gate.io/v4',
                    'spot': 'wss://api.gateio.ws/ws/v4/',
                    'swap': {
                        'usdt': 'wss://fx-ws.gateio.ws/v4/ws/usdt',
                        'btc': 'wss://fx-ws.gateio.ws/v4/ws/btc',
                    },
                    'future': {
                        'usdt': 'wss://fx-ws.gateio.ws/v4/ws/delivery/usdt',
                        'btc': 'wss://fx-ws.gateio.ws/v4/ws/delivery/btc',
                    },
                    'option': 'wss://op-ws.gateio.live/v4/ws',
                },
                'test': {
                    'swap': {
                        'usdt': 'wss://fx-ws-testnet.gateio.ws/v4/ws/usdt',
                        'btc': 'wss://fx-ws-testnet.gateio.ws/v4/ws/btc',
                    },
                    'future': {
                        'usdt': 'wss://fx-ws-testnet.gateio.ws/v4/ws/usdt',
                        'btc': 'wss://fx-ws-testnet.gateio.ws/v4/ws/btc',
                    },
                    'option': 'wss://op-ws-testnet.gateio.live/v4/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
                'watchTradesSubscriptions': {},
                'watchTickerSubscriptions': {},
                'watchOrderBookSubscriptions': {},
                'watchTicker': {
                    'name': 'tickers', // or book_ticker
                },
                'watchOrderBook': {
                    'interval': '100ms',
                    'snapshotDelay': 10, // how many deltas to cache before fetching a snapshot
                    'maxRetries': 3,
                },
                'watchBalance': {
                    'settle': 'usdt', // or btc
                    'spot': 'spot.balances', // spot.margin_balances, spot.funding_balances or spot.cross_balances
                },
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        '2': BadRequest,
                        '4': AuthenticationError,
                        '6': AuthenticationError,
                        '11': AuthenticationError,
                    },
                },
            },
        });
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const [ interval, query ] = this.handleOptionAndParams (params, 'watchOrderBook', 'interval', '100ms');
        const messageType = this.getTypeByMarket (market);
        const channel = messageType + '.order_book_update';
        const messageHash = 'orderbook' + ':' + symbol;
        const url = this.getUrlByMarket (market);
        const payload = [ marketId, interval ];
        if (limit === undefined) {
            limit = 100;
        }
        if (market['contract']) {
            const stringLimit = limit.toString ();
            payload.push (stringLimit);
        }
        const subscription = {
            'symbol': symbol,
            'limit': limit,
        };
        const orderbook = await this.subscribePublic (url, messageHash, payload, channel, query, subscription);
        return orderbook.limit ();
    }

    handleOrderBookSubscription (client: Client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        this.orderbooks[symbol] = this.orderBook ({}, limit);
    }

    handleOrderBook (client: Client, message) {
        //
        // spot
        //
        //     {
        //         time: 1650189272,
        //         channel: 'spot.order_book_update',
        //         event: 'update',
        //         result: {
        //             t: 1650189272515,
        //             e: 'depthUpdate',
        //             E: 1650189272,
        //             s: 'GMT_USDT',
        //             U: 140595902,
        //             u: 140595902,
        //             b: [
        //                 [ '2.51518', '228.119' ],
        //                 [ '2.50587', '1510.11' ],
        //                 [ '2.49944', '67.6' ],
        //             ],
        //             a: [
        //                 [ '2.5182', '4.199' ],
        //                 [ '2.51926', '1874' ],
        //                 [ '2.53528', '96.529' ],
        //             ]
        //         }
        //     }
        //
        // swap
        //
        //     {
        //         id: null,
        //         time: 1650188898,
        //         channel: 'futures.order_book_update',
        //         event: 'update',
        //         error: null,
        //         result: {
        //             t: 1650188898938,
        //             s: 'GMT_USDT',
        //             U: 1577718307,
        //             u: 1577719254,
        //             b: [
        //                 { p: '2.5178', s: 0 },
        //                 { p: '2.5179', s: 0 },
        //                 { p: '2.518', s: 0 },
        //             ],
        //             a: [
        //                 { p: '2.52', s: 0 },
        //                 { p: '2.5201', s: 0 },
        //                 { p: '2.5203', s: 0 },
        //             ]
        //         }
        //     }
        //
        const channel = this.safeString (message, 'channel');
        const channelParts = channel.split ('.');
        const rawMarketType = this.safeString (channelParts, 0);
        const isSpot = rawMarketType === 'spot';
        const marketType = isSpot ? 'spot' : 'contract';
        const delta = this.safeValue (message, 'result');
        const deltaStart = this.safeInteger (delta, 'U');
        const deltaEnd = this.safeInteger (delta, 'u');
        const marketId = this.safeString (delta, 's');
        const symbol = this.safeSymbol (marketId, undefined, '_', marketType);
        const messageHash = 'orderbook:' + symbol;
        const storedOrderBook = this.safeValue (this.orderbooks, symbol, this.orderBook ({}));
        const nonce = this.safeInteger (storedOrderBook, 'nonce');
        if (nonce === undefined) {
            let cacheLength = 0;
            if (storedOrderBook !== undefined) {
                cacheLength = storedOrderBook.cache.length;
            }
            const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 10);
            const waitAmount = isSpot ? snapshotDelay : 0;
            if (cacheLength === waitAmount) {
                // max limit is 100
                const subscription = client.subscriptions[messageHash];
                const limit = this.safeInteger (subscription, 'limit');
                this.spawn (this.loadOrderBook, client, messageHash, symbol, limit);
            }
            storedOrderBook.cache.push (delta);
            return;
        } else if (nonce >= deltaEnd) {
            return;
        } else if (nonce >= deltaStart - 1) {
            this.handleDelta (storedOrderBook, delta);
        } else {
            const error = new InvalidNonce (this.id + ' orderbook update has a nonce bigger than u');
            delete client.subscriptions[messageHash];
            delete this.orderbooks[symbol];
            client.reject (error, messageHash);
        }
        client.resolve (storedOrderBook, messageHash);
    }

    getCacheIndex (orderBook, cache) {
        const nonce = this.safeInteger (orderBook, 'nonce');
        const firstDelta = cache[0];
        const firstDeltaStart = this.safeInteger (firstDelta, 'U');
        if (nonce < firstDeltaStart) {
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const deltaStart = this.safeInteger (delta, 'U');
            const deltaEnd = this.safeInteger (delta, 'u');
            if ((nonce >= deltaStart - 1) && (nonce < deltaEnd)) {
                return i;
            }
        }
        return cache.length;
    }

    handleBidAsks (bookSide, bidAsks) {
        for (let i = 0; i < bidAsks.length; i++) {
            const bidAsk = bidAsks[i];
            if (Array.isArray (bidAsk)) {
                bookSide.storeArray (this.parseBidAsk (bidAsk));
            } else {
                const price = this.safeFloat (bidAsk, 'p');
                const amount = this.safeFloat (bidAsk, 's');
                bookSide.store (price, amount);
            }
        }
    }

    handleDelta (orderbook, delta) {
        const timestamp = this.safeInteger (delta, 't');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = this.safeInteger (delta, 'u');
        const bids = this.safeValue (delta, 'b', []);
        const asks = this.safeValue (delta, 'a', []);
        const storedBids = orderbook['bids'];
        const storedAsks = orderbook['asks'];
        this.handleBidAsks (storedBids, bids);
        this.handleBidAsks (storedAsks, asks);
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name gate#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const url = this.getUrlByMarket (market);
        const messageType = this.getTypeByMarket (market);
        const [ topic, query ] = this.handleOptionAndParams (params, 'watchTicker', 'method', 'tickers');
        const channel = messageType + '.' + topic;
        const messageHash = 'ticker:' + symbol;
        const payload = [ marketId ];
        return await this.subscribePublic (url, messageHash, payload, channel, query);
    }

    async watchTickers (symbols: string[] = undefined, params = {}) {
        /**
         * @method
         * @name gate#watchTickers
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
         * @param {[string]} symbols unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTickers requires symbols');
        }
        const market = this.market (symbols[0]);
        const messageType = this.getTypeByMarket (market);
        const marketIds = this.marketIds (symbols);
        const [ topic, query ] = this.handleOptionAndParams (params, 'watchTicker', 'method', 'tickers');
        const channel = messageType + '.' + topic;
        const messageHash = 'tickers';
        const url = this.getUrlByMarket (market);
        const ticker = await this.subscribePublic (url, messageHash, marketIds, channel, query);
        let result = {};
        if (this.newUpdates) {
            result[ticker['symbol']] = ticker;
        } else {
            result = this.tickers;
        }
        return this.filterByArray (result, 'symbol', symbols, true);
    }

    handleTicker (client: Client, message) {
        //
        //    {
        //        time: 1649326221,
        //        channel: 'spot.tickers',
        //        event: 'update',
        //        result: {
        //          currency_pair: 'BTC_USDT',
        //          last: '43444.82',
        //          lowest_ask: '43444.82',
        //          highest_bid: '43444.81',
        //          change_percentage: '-4.0036',
        //          base_volume: '5182.5412425462',
        //          quote_volume: '227267634.93123952',
        //          high_24h: '47698',
        //          low_24h: '42721.03'
        //        }
        //    }
        //    {
        //        time: 1671363004,
        //        time_ms: 1671363004235,
        //        channel: 'spot.book_ticker',
        //        event: 'update',
        //        result: {
        //          t: 1671363004228,
        //          u: 9793320464,
        //          s: 'BTC_USDT',
        //          b: '16716.8',
        //          B: '0.0134',
        //          a: '16716.9',
        //          A: '0.0353'
        //        }
        //    }
        //
        const channel = this.safeString (message, 'channel');
        const parts = channel.split ('.');
        const rawMarketType = this.safeString (parts, 0);
        const marketType = (rawMarketType === 'futures') ? 'contract' : 'spot';
        let result = this.safeValue (message, 'result');
        if (!Array.isArray (result)) {
            result = [ result ];
        }
        for (let i = 0; i < result.length; i++) {
            const ticker = result[i];
            const marketId = this.safeString (ticker, 's');
            const market = this.safeMarket (marketId, undefined, '_', marketType);
            const parsed = this.parseTicker (ticker, market);
            const symbol = parsed['symbol'];
            this.tickers[symbol] = parsed;
            const messageHash = 'ticker:' + symbol;
            client.resolve (parsed, messageHash);
            client.resolve (parsed, 'tickers');
        }
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const messageType = this.getTypeByMarket (market);
        const channel = messageType + '.trades';
        const messageHash = 'trades:' + symbol;
        const url = this.getUrlByMarket (market);
        const payload = [ marketId ];
        const trades = await this.subscribePublic (url, messageHash, payload, channel, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp');
    }

    handleTrades (client: Client, message) {
        //
        // {
        //     time: 1648725035,
        //     channel: 'spot.trades',
        //     event: 'update',
        //     result: [{
        //       id: 3130257995,
        //       create_time: 1648725035,
        //       create_time_ms: '1648725035923.0',
        //       side: 'sell',
        //       currency_pair: 'LTC_USDT',
        //       amount: '0.0116',
        //       price: '130.11'
        //     }]
        // }
        //
        let result = this.safeValue (message, 'result');
        if (!Array.isArray (result)) {
            result = [ result ];
        }
        const parsedTrades = this.parseTrades (result);
        for (let i = 0; i < parsedTrades.length; i++) {
            const trade = parsedTrades[i];
            const symbol = trade['symbol'];
            let cachedTrades = this.safeValue (this.trades, symbol);
            if (cachedTrades === undefined) {
                const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                cachedTrades = new ArrayCache (limit);
                this.trades[symbol] = cachedTrades;
            }
            cachedTrades.append (trade);
            const hash = 'trades:' + symbol;
            client.resolve (cachedTrades, hash);
        }
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const messageType = this.getTypeByMarket (market);
        const channel = messageType + '.candlesticks';
        const messageHash = 'candles:' + interval + ':' + market['symbol'];
        const url = this.getUrlByMarket (market);
        const payload = [ interval, marketId ];
        const ohlcv = await this.subscribePublic (url, messageHash, payload, channel, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0);
    }

    handleOHLCV (client: Client, message) {
        //
        // {
        //     "time": 1606292600,
        //     "channel": "spot.candlesticks",
        //     "event": "update",
        //     "result": {
        //       "t": "1606292580", // total volume
        //       "v": "2362.32035", // volume
        //       "c": "19128.1", // close
        //       "h": "19128.1", // high
        //       "l": "19128.1", // low
        //       "o": "19128.1", // open
        //       "n": "1m_BTC_USDT" // sub
        //     }
        //   }
        //
        const channel = this.safeString (message, 'channel');
        const channelParts = channel.split ('.');
        const rawMarketType = this.safeString (channelParts, 0);
        const marketType = (rawMarketType === 'spot') ? 'spot' : 'contract';
        let result = this.safeValue (message, 'result');
        if (!Array.isArray (result)) {
            result = [ result ];
        }
        const marketIds = {};
        for (let i = 0; i < result.length; i++) {
            const ohlcv = result[i];
            const subscription = this.safeString (ohlcv, 'n', '');
            const parts = subscription.split ('_');
            const timeframe = this.safeString (parts, 0);
            const prefix = timeframe + '_';
            const marketId = subscription.replace (prefix, '');
            const symbol = this.safeSymbol (marketId, undefined, '_', marketType);
            const parsed = this.parseOHLCV (ohlcv);
            let stored = this.safeValue (this.ohlcvs, symbol);
            if (stored === undefined) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                stored = new ArrayCacheByTimestamp (limit);
                this.ohlcvs[symbol] = stored;
            }
            stored.append (parsed);
            marketIds[symbol] = timeframe;
        }
        const keys = Object.keys (marketIds);
        for (let i = 0; i < keys.length; i++) {
            const symbol = keys[i];
            const timeframe = marketIds[symbol];
            const interval = this.findTimeframe (timeframe);
            const hash = 'candles' + ':' + interval + ':' + symbol;
            const stored = this.safeValue (this.ohlcvs, symbol);
            client.resolve (stored, hash);
        }
    }

    async watchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets ();
        let subType = undefined;
        let type = undefined;
        let marketId = '!' + 'all';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            marketId = market['id'];
        }
        [ type, params ] = this.handleMarketTypeAndParams ('watchMyTrades', market, params);
        [ subType, params ] = this.handleSubTypeAndParams ('watchMyTrades', market, params);
        const messageType = this.getSupportedMapping (type, {
            'spot': 'spot',
            'margin': 'spot',
            'future': 'futures',
            'swap': 'futures',
            'option': 'options',
        });
        const channel = messageType + '.usertrades';
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            messageHash += ':' + symbol;
        }
        const isInverse = (subType === 'inverse');
        const url = this.getUrlByMarketType (type, isInverse);
        const payload = [ marketId ];
        // uid required for non spot markets
        const requiresUid = (type !== 'spot');
        const trades = await this.subscribePrivate (url, messageHash, payload, channel, params, requiresUid);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit);
    }

    handleMyTrades (client: Client, message) {
        //
        // {
        //     "time": 1543205083,
        //     "channel": "futures.usertrades",
        //     "event": "update",
        //     "error": null,
        //     "result": [
        //       {
        //         "id": "3335259",
        //         "create_time": 1628736848,
        //         "create_time_ms": 1628736848321,
        //         "contract": "BTC_USD",
        //         "order_id": "4872460",
        //         "size": 1,
        //         "price": "40000.4",
        //         "role": "maker"
        //       }
        //     ]
        // }
        //
        const result = this.safeValue (message, 'result', []);
        const tradesLength = result.length;
        if (tradesLength === 0) {
            return;
        }
        let cachedTrades = this.myTrades;
        if (cachedTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            cachedTrades = new ArrayCacheBySymbolById (limit);
            this.myTrades = cachedTrades;
        }
        const parsed = this.parseTrades (result);
        const marketIds = {};
        for (let i = 0; i < parsed.length; i++) {
            const trade = parsed[i];
            cachedTrades.append (trade);
            const symbol = trade['symbol'];
            marketIds[symbol] = true;
        }
        const keys = Object.keys (marketIds);
        for (let i = 0; i < keys.length; i++) {
            const market = keys[i];
            const hash = 'myTrades:' + market;
            client.resolve (cachedTrades, hash);
        }
        client.resolve (cachedTrades, 'myTrades');
    }

    async watchBalance (params = {}) {
        /**
         * @method
         * @name gate#watchBalance
         * @description query for balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} params extra parameters specific to the gate api endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
         */
        await this.loadMarkets ();
        let type = undefined;
        let subType = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('watchBalance', undefined, params);
        [ subType, params ] = this.handleSubTypeAndParams ('watchBalance', undefined, params);
        const isInverse = (subType === 'inverse');
        const url = this.getUrlByMarketType (type, isInverse);
        const requiresUid = (type !== 'spot');
        const channelType = this.getSupportedMapping (type, {
            'spot': 'spot',
            'margin': 'spot',
            'future': 'futures',
            'swap': 'futures',
            'option': 'options',
        });
        const channel = channelType + '.balances';
        const messageHash = type + '.balance';
        return await this.subscribePrivate (url, messageHash, undefined, channel, params, requiresUid);
    }

    handleBalance (client: Client, message) {
        //
        // spot order fill
        //   {
        //       time: 1653664351,
        //       channel: 'spot.balances',
        //       event: 'update',
        //       result: [
        //         {
        //           timestamp: '1653664351',
        //           timestamp_ms: '1653664351017',
        //           user: '10406147',
        //           currency: 'LTC',
        //           change: '-0.0002000000000000',
        //           total: '0.09986000000000000000',
        //           available: '0.09986000000000000000'
        //         }
        //       ]
        //   }
        //
        // account transfer
        //
        //    {
        //        id: null,
        //        time: 1653665088,
        //        channel: 'futures.balances',
        //        event: 'update',
        //        error: null,
        //        result: [
        //          {
        //            balance: 25.035008537,
        //            change: 25,
        //            text: '-',
        //            time: 1653665088,
        //            time_ms: 1653665088286,
        //            type: 'dnw',
        //            user: '10406147'
        //          }
        //        ]
        //   }
        //
        // swap order fill
        //   {
        //       id: null,
        //       time: 1653665311,
        //       channel: 'futures.balances',
        //       event: 'update',
        //       error: null,
        //       result: [
        //         {
        //           balance: 20.031873037,
        //           change: -0.0031355,
        //           text: 'LTC_USDT:165551103273',
        //           time: 1653665311,
        //           time_ms: 1653665311437,
        //           type: 'fee',
        //           user: '10406147'
        //         }
        //       ]
        //   }
        //
        const result = this.safeValue (message, 'result', []);
        const timestamp = this.safeInteger (message, 'time');
        this.balance['info'] = result;
        this.balance['timestamp'] = timestamp;
        this.balance['datetime'] = this.iso8601 (timestamp);
        for (let i = 0; i < result.length; i++) {
            const rawBalance = result[i];
            const account = this.account ();
            const currencyId = this.safeString (rawBalance, 'currency', 'USDT'); // when not present it is USDT
            const code = this.safeCurrencyCode (currencyId);
            account['free'] = this.safeString (rawBalance, 'available');
            account['total'] = this.safeString2 (rawBalance, 'total', 'balance');
            this.balance[code] = account;
        }
        const channel = this.safeString (message, 'channel');
        const parts = channel.split ('.');
        const rawType = this.safeString (parts, 0);
        const channelType = this.getSupportedMapping (rawType, {
            'spot': 'spot',
            'futures': 'swap',
            'options': 'option',
        });
        const messageHash = channelType + '.balance';
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, messageHash);
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the gate api endpoint
         * @param {string} params.type spot, margin, swap, future, or option. Required if listening to all symbols.
         * @param {boolean} params.isInverse if future, listen to inverse or linear contracts
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        let type = undefined;
        let query = undefined;
        [ type, query ] = this.handleMarketTypeAndParams ('watchOrders', market, params);
        const typeId = this.getSupportedMapping (type, {
            'spot': 'spot',
            'margin': 'spot',
            'future': 'futures',
            'swap': 'futures',
            'option': 'options',
        });
        const channel = typeId + '.orders';
        let messageHash = 'orders';
        let payload = [ '!' + 'all' ];
        if (symbol !== undefined) {
            messageHash += ':' + market['id'];
            payload = [ market['id'] ];
        }
        let subType = undefined;
        [ subType, query ] = this.handleSubTypeAndParams ('watchOrders', market, query);
        const isInverse = (subType === 'inverse');
        const url = this.getUrlByMarketType (type, isInverse);
        // uid required for non spot markets
        const requiresUid = (type !== 'spot');
        const orders = await this.subscribePrivate (url, messageHash, payload, channel, query, requiresUid);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (orders, since, limit, 'timestamp');
    }

    handleOrder (client: Client, message) {
        //
        // {
        //     "time": 1605175506,
        //     "channel": "spot.orders",
        //     "event": "update",
        //     "result": [
        //       {
        //         "id": "30784435",
        //         "user": 123456,
        //         "text": "t-abc",
        //         "create_time": "1605175506",
        //         "create_time_ms": "1605175506123",
        //         "update_time": "1605175506",
        //         "update_time_ms": "1605175506123",
        //         "event": "put",
        //         "currency_pair": "BTC_USDT",
        //         "type": "limit",
        //         "account": "spot",
        //         "side": "sell",
        //         "amount": "1",
        //         "price": "10001",
        //         "time_in_force": "gtc",
        //         "left": "1",
        //         "filled_total": "0",
        //         "fee": "0",
        //         "fee_currency": "USDT",
        //         "point_fee": "0",
        //         "gt_fee": "0",
        //         "gt_discount": true,
        //         "rebated_fee": "0",
        //         "rebated_fee_currency": "USDT"
        //       }
        //     ]
        // }
        //
        const orders = this.safeValue (message, 'result', []);
        const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
        if (this.orders === undefined) {
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        const marketIds = {};
        const parsedOrders = this.parseOrders (orders);
        for (let i = 0; i < parsedOrders.length; i++) {
            const parsed = parsedOrders[i];
            // inject order status
            const info = this.safeValue (parsed, 'info');
            const event = this.safeString (info, 'event');
            if (event === 'put' || event === ' update') {
                parsed['status'] = 'open';
            } else if (event === 'finish') {
                const left = this.safeNumber (info, 'left');
                parsed['status'] = (left === 0) ? 'closed' : 'canceled';
            }
            stored.append (parsed);
            const symbol = parsed['symbol'];
            const market = this.market (symbol);
            marketIds[market['id']] = true;
        }
        const keys = Object.keys (marketIds);
        for (let i = 0; i < keys.length; i++) {
            const messageHash = 'orders:' + keys[i];
            client.resolve (this.orders, messageHash);
        }
        client.resolve (this.orders, 'orders');
    }

    handleErrorMessage (client: Client, message) {
        // {
        //     time: 1647274664,
        //     channel: 'futures.orders',
        //     event: 'subscribe',
        //     error: { code: 2, message: 'unknown contract BTC_USDT_20220318' },
        // }
        // {
        //     time: 1647276473,
        //     channel: 'futures.orders',
        //     event: 'subscribe',
        //     error: {
        //       code: 4,
        //       message: '{"label":"INVALID_KEY","message":"Invalid key provided"}\n'
        //     },
        //     result: null
        //   }
        const error = this.safeValue (message, 'error');
        const code = this.safeInteger (error, 'code');
        const id = this.safeString (message, 'id');
        if (id === undefined) {
            return false;
        }
        if (code !== undefined) {
            const messageHash = this.safeString (client.subscriptions, id);
            if (messageHash !== undefined) {
                try {
                    this.throwExactlyMatchedException (this.exceptions['ws']['exact'], code, this.json (message));
                } catch (e) {
                    client.reject (e, messageHash);
                    if (messageHash in client.subscriptions) {
                        delete client.subscriptions[messageHash];
                    }
                }
            }
            delete client.subscriptions[id];
            return true;
        }
        return false;
    }

    handleBalanceSubscription (client: Client, message, subscription = undefined) {
        this.balance = {};
    }

    handleSubscriptionStatus (client: Client, message) {
        const channel = this.safeString (message, 'channel');
        const methods = {
            'balance': this.handleBalanceSubscription,
            'spot.order_book_update': this.handleOrderBookSubscription,
            'futures.order_book_update': this.handleOrderBookSubscription,
        };
        const id = this.safeString (message, 'id');
        if (channel in methods) {
            const subscriptionHash = this.safeString (client.subscriptions, id);
            const subscription = this.safeValue (client.subscriptions, subscriptionHash);
            const method = methods[channel];
            method.call (this, client, message, subscription);
        }
        if (id in client.subscriptions) {
            delete client.subscriptions[id];
        }
    }

    handleMessage (client: Client, message) {
        //
        // subscribe
        //    {
        //        time: 1649062304,
        //        id: 1649062303,
        //        channel: 'spot.candlesticks',
        //        event: 'subscribe',
        //        result: { status: 'success' }
        //    }
        //
        // candlestick
        //    {
        //        time: 1649063328,
        //        channel: 'spot.candlesticks',
        //        event: 'update',
        //        result: {
        //          t: '1649063280',
        //          v: '58932.23174896',
        //          c: '45966.47',
        //          h: '45997.24',
        //          l: '45966.47',
        //          o: '45975.18',
        //          n: '1m_BTC_USDT',
        //          a: '1.281699'
        //        }
        //     }
        //
        //  orders
        //   {
        //       "time": 1630654851,
        //       "channel": "options.orders", or futures.orders or spot.orders
        //       "event": "update",
        //       "result": [
        //          {
        //             "contract": "BTC_USDT-20211130-65000-C",
        //             "create_time": 1637897000,
        //               (...)
        //       ]
        //   }
        // orderbook
        //   {
        //       time: 1649770525,
        //       channel: 'spot.order_book_update',
        //       event: 'update',
        //       result: {
        //         t: 1649770525653,
        //         e: 'depthUpdate',
        //         E: 1649770525,
        //         s: 'LTC_USDT',
        //         U: 2622525645,
        //         u: 2622525665,
        //         b: [
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array]
        //         ],
        //         a: [
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array], [Array],
        //           [Array]
        //         ]
        //       }
        //     }
        //
        // balance update
        //
        //    {
        //        time: 1653664351,
        //        channel: 'spot.balances',
        //        event: 'update',
        //        result: [
        //          {
        //            timestamp: '1653664351',
        //            timestamp_ms: '1653664351017',
        //            user: '10406147',
        //            currency: 'LTC',
        //            change: '-0.0002000000000000',
        //            total: '0.09986000000000000000',
        //            available: '0.09986000000000000000'
        //          }
        //        ]
        //    }
        //
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const event = this.safeString (message, 'event');
        if (event === 'subscribe') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const channel = this.safeString (message, 'channel', '');
        const channelParts = channel.split ('.');
        const channelType = this.safeValue (channelParts, 1);
        const v4Methods = {
            'usertrades': this.handleMyTrades,
            'candlesticks': this.handleOHLCV,
            'orders': this.handleOrder,
            'tickers': this.handleTicker,
            'book_ticker': this.handleTicker,
            'trades': this.handleTrades,
            'order_book_update': this.handleOrderBook,
            'balances': this.handleBalance,
        };
        const method = this.safeValue (v4Methods, channelType);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }

    getUrlByMarket (market) {
        const baseUrl = this.urls['api'][market['type']];
        if (market['contract']) {
            return market['linear'] ? baseUrl['usdt'] : baseUrl['btc'];
        } else {
            return baseUrl;
        }
    }

    getTypeByMarket (market) {
        if (market['spot']) {
            return 'spot';
        } else if (market['option']) {
            return 'options';
        } else {
            return 'futures';
        }
    }

    getUrlByMarketType (type, isInverse = false) {
        const api = this.urls['api'];
        const url = api[type];
        if ((type === 'swap') || (type === 'future')) {
            return isInverse ? url['btc'] : url['usdt'];
        } else {
            return url;
        }
    }

    requestId () {
        // their support said that reqid must be an int32, not documented
        const reqid = this.sum (this.safeInteger (this.options, 'reqid', 0), 1);
        this.options['reqid'] = reqid;
        return reqid;
    }

    async subscribePublic (url, messageHash, payload, channel, params = {}, subscription = undefined) {
        const requestId = this.requestId ();
        const time = this.seconds ();
        const request = {
            'id': requestId,
            'time': time,
            'channel': channel,
            'event': 'subscribe',
            'payload': payload,
        };
        if (subscription !== undefined) {
            const client = this.client (url);
            if (!(messageHash in client.subscriptions)) {
                const tempSubscriptionHash = requestId.toString ();
                client.subscriptions[tempSubscriptionHash] = messageHash;
            }
        }
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash, subscription);
    }

    async subscribePrivate (url, messageHash, payload, channel, params, requiresUid = false) {
        this.checkRequiredCredentials ();
        // uid is required for some subscriptions only so it's not a part of required credentials
        if (requiresUid) {
            if (this.uid === undefined || this.uid.length === 0) {
                throw new ArgumentsRequired (this.id + ' requires uid to subscribe');
            }
            const idArray = [ this.uid ];
            if (payload === undefined) {
                payload = idArray;
            } else {
                payload = this.arrayConcat (idArray, payload);
            }
        }
        const time = this.seconds ();
        const event = 'subscribe';
        const signaturePayload = 'channel=' + channel + '&' + 'event=' + event + '&' + 'time=' + time.toString ();
        const signature = this.hmac (this.encode (signaturePayload), this.encode (this.secret), sha512, 'hex');
        const auth = {
            'method': 'api_key',
            'KEY': this.apiKey,
            'SIGN': signature,
        };
        const requestId = this.requestId ();
        const request = {
            'id': requestId,
            'time': time,
            'channel': channel,
            'event': 'subscribe',
            'auth': auth,
        };
        if (payload !== undefined) {
            request['payload'] = payload;
        }
        const client = this.client (url);
        if (!(messageHash in client.subscriptions)) {
            const tempSubscriptionHash = requestId.toString ();
            // in case of authenticationError we will throw
            client.subscriptions[tempSubscriptionHash] = messageHash;
        }
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }
}
