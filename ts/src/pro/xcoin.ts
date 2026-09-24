//  ---------------------------------------------------------------------------

import xcoinRest from '../xcoin.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { Balances, Dict, Int, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { ArgumentsRequired, AuthenticationError, ExchangeError } from '../base/errors.js';

// ----------------------------------------------------------------------------

/**
 * @class xcoin
 * @augments Exchange
 * @description XCoin WebSocket API implementation
 */
export default class xcoin extends xcoinRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchOrders': true,
                'watchPositions': true,
                'watchBalance': true,
                'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://stream.xcoin.com/ws/public/v1/market',
                        'private': 'wss://stream.xcoin.com/ws/private/v2/notification',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
                'orderBook': {
                    // full snapshots:
                    //    depthLevels#[100|500|1000]ms#[5|10|20|30]
                    // incremental updates
                    //    depth#[100|500|1000]ms
                    'method': 'depth#100ms',
                },
                'watchTicker': {
                    'channel': 'ticker24hr', // ticker24hr or miniTicker
                },
                'watchTickers': {
                    'channel': 'ticker24hr', // ticker24hr or miniTicker
                },
                'channelsMap': {
                    'spot': 'spot',
                    'swap': 'linear_perpetual',
                    'future': 'linear_futures',
                },
            },
            'streaming': {
                'keepAlive': 25000, // 30 max
                'ping': this.ping,
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
                '1w': '1w',
            },
        });
    }

    marketTypeToBusinessType (marketType: string): string {
        return this.safeString (this.options['channelsMap'], marketType, marketType);
    }

    async watchPublic (unifiedHash: string, exchangeChannel: string, symbolsArray = undefined, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const requestObjects = [];
        const isOHLCV = (unifiedHash === 'ohlcv');
        const isDepth = (exchangeChannel.startsWith ('depth#'));
        let symbols = symbolsArray;
        if (isOHLCV) {
            symbols = this.getListFromObjectValues (symbols, 0);
        }
        symbols = this.marketSymbols (symbols, undefined, true, false);
        const symbolsLength = (symbols === undefined) ? undefined : symbols.length;
        if (symbolsLength === 1) {
            const market = this.market (symbols[0]);
            let messageHash = unifiedHash + '::' + market['symbol'];
            let subscription = undefined;
            if (isOHLCV) {
                const timeframe = symbolsArray[0][1];
                exchangeChannel = exchangeChannel + this.safeString (this.timeframes, timeframe, timeframe);
                messageHash = messageHash + '::' + timeframe;
            } else if (isDepth) {
                subscription = {
                    'id': exchangeChannel + '_' + market['id'],
                    'symbol': market['symbol'],
                    'messageHash': messageHash,
                    'callback': this.spawnFetchOrderBookSnapshot,
                };
            }
            const subscribe = {
                'event': 'subscribe',
                'data': [
                    {
                        'symbol': market['id'],
                        'stream': exchangeChannel,
                        'businessType': this.marketTypeToBusinessType (market['type']),
                    },
                ],
            };
            const request = this.deepExtend (subscribe, params);
            return await this.watch (url, messageHash, request, messageHash, subscription);
        } else {
            const messageHashes = [];
            if (symbolsLength > 1) {
                for (let i = 0; i < symbolsLength; i++) {
                    const market = !isOHLCV ? this.market (symbols[i]) : this.market (symbols[i][0]);
                    let selectedChannel = exchangeChannel;
                    let messageHash = unifiedHash + '::' + market['symbol'];
                    if (isOHLCV) {
                        const timeframe = symbolsArray[i][1];
                        selectedChannel = selectedChannel + this.safeString (this.timeframes, timeframe, timeframe);
                        messageHash = messageHash + '::' + timeframe;
                    }
                    requestObjects.push ({
                        'symbol': market['id'],
                        'stream': selectedChannel,
                        'businessType': this.marketTypeToBusinessType (market['type']),
                    });
                    messageHashes.push (messageHash);
                }
            } else {
                let marketType: Str = undefined;
                const pluralMethods = {
                    'orderBook': 'watchOrderBook',
                    'ticker': 'watchTickers',
                    'ohlcv': 'watchOHLCVForSymbols',
                };
                const callingMethod = this.safeString (pluralMethods, unifiedHash, unifiedHash);
                [ marketType, params ] = this.handleOptionAndParams (params, callingMethod, 'type', 'spot');
                requestObjects.push ({
                    'stream': exchangeChannel,
                    'businessType': this.marketTypeToBusinessType (marketType),
                });
                messageHashes.push (unifiedHash + 's');
            }
            const subscribe = {
                'event': 'subscribe',
                'data': requestObjects,
            };
            const request = this.deepExtend (subscribe, params);
            return await this.watchMultiple (url, messageHashes, request, messageHashes);
        }
    }

    async watchPrivate (unifiedHash: string, exchangeChannel: string, symbols = undefined, params = {}) {
        const url = this.urls['api']['ws']['private'];
        symbols = this.marketSymbols (symbols, undefined, true, false);
        const symbolsLength = (symbols === undefined) ? undefined : symbols.length;
        let marketType: Str = undefined;
        [ marketType, params ] = this.handleOptionAndParams (params, undefined, 'type', 'spot');
        const subs = [];
        const messageHashes = [];
        if (symbolsLength > 0) {
            for (let i = 0; i < symbolsLength; i++) {
                const market = this.market (symbols[i]);
                subs.push ({
                    'symbol': market['id'],
                    'stream': exchangeChannel,
                    'businessType': this.marketTypeToBusinessType (market['type']),
                });
                messageHashes.push (unifiedHash + '::' + market['symbol']);
            }
        } else {
            const req = {
                'stream': exchangeChannel,
            };
            if (!(unifiedHash === 'balance')) {
                req['businessType'] = this.marketTypeToBusinessType (marketType);
            }
            subs.push (req);
            messageHashes.push (unifiedHash);
        }
        const subscribe = {
            'event': 'subscribe',
            'data': subs,
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watchMultiple (url, messageHashes, request, messageHashes);
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws']['private'];
        this.checkRequiredCredentials ();
        const messageHash = 'authenticated';
        const client = this.client (url);
        const future = client.reusableFuture (messageHash);
        if (!(messageHash in client.subscriptions)) {
            const timestamp = this.milliseconds ().toString ();
            const request = {
                'data': {
                    'type': 'Token',
                    'accessKey': this.apiKey,
                    'accessTimestamp': timestamp,
                    // 'accountName': '',
                },
                'event': 'authorization',
            };
            const preHash = timestamp + 'POST' + '/v2/notification' + this.json (request['data']);
            const signature = this.hmac (this.encode (preHash), this.encode (this.secret), sha256, 'hex');
            request['accessSign'] = signature;
            this.watch (url, messageHash, request, messageHash, future);
        }
        return await future;
    }

    handleAuthenticationMessage (client: Client, message: any) {
        //
        // {
        //     "event": "authorization",
        //     "msg": "success",
        //     "code": "0",
        //     "ts": "1732158443301"
        // }
        //
        const messageHash = 'authenticated';
        if (this.safeString (message, 'code') === '0') {
            client.resolve (message, messageHash);
        } else {
            const error = new AuthenticationError (this.id + ' authentication failed: ' + this.safeString (message, 'msg'));
            client.reject (error, messageHash);
        }
    }

    handleMessage (client: Client, message: any) {
        if (message === 'PONG') {
            this.handlePong (client, message);
            return;
        }
        const event = this.safeString (message, 'event');
        if (event === 'subscribe') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        if (event === 'authorization') {
            this.handleAuthenticationMessage (client, message);
            return;
        }
        this.handleErrorMessage (client, message);
        // Handle data messages by stream type
        const stream = this.safeString (message, 'stream');
        if (stream === undefined) {
            return;
        }
        const methods: Dict = {
            'ticker24hr': this.handleTicker,
            'miniTicker': this.handleTicker,
            'trade': this.handleTrade,
            'orderBook': this.handleBidsAsks, // best bid-asks
            'position': this.handlePosition,
            'order': this.handleOrder,
            'trading_account': this.handleBalance,
        };
        const methodMatches = {
            'kline#': this.handleOHLCV,
            'depthlevels#': this.handleOrderBookPartialSnapshot,
            'depth#': this.handleOrderBookIncrementalMessage,
        };
        const method = this.safeValue (methods, stream);
        if (method !== undefined) {
            method.call (this, client, message);
        } else {
            const keys = Object.keys (methodMatches);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (stream.indexOf (key) >= 0) {
                    const methodRegex = methodMatches[key];
                    methodRegex.call (this, client, message);
                    return;
                }
            }
        }
    }

    handleSubscriptionStatus (client: Client, message: any) {
        //
        // successful subscription
        //
        //    {
        //        "event": "subscribe",
        //        "data": [
        //            {
        //                "stream": "trade",
        //                "businessType": "linear_perpetual",
        //                "symbol": "BTC-USDT-PERP",
        //                "message": "成功",
        //                "code": 0
        //            }
        //        ],
        //        "ts": 1762237676412
        //    }
        //
        const datas = this.safeList (message, 'data', []);
        for (let i = 0; i < datas.length; i++) {
            const data = datas[i];
            const code = this.safeInteger (data, 'code');
            if (code !== 0) {
                continue;
            }
            const marketId = this.safeString (data, 'symbol');
            const stream = this.safeString (data, 'stream');
            const id = stream + '_' + marketId;
            this.checkIfSubscriptionCallbackNeeded (client, message, id);
        }
    }

    handlePong (client: Client, message: any) {
        client.lastPong = this.milliseconds ();
    }

    ping (client: Client) {
        //
        // Send ping message to keep connection alive
        //
        return 'PING';
    }

    /**
     * @method
     * @name xcoin#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/trade-channel
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name xcoin#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/trade-channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const trades = await this.watchPublic ('trade', 'trade', symbols, params);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const symbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message: any) {
        //
        //    {
        //        "businessType": "linear_perpetual",
        //        "symbol": "BTC-USDT-PERP",
        //        "stream": "trade",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT-PERP",
        //                "id": "1151458165",
        //                "side": "buy",
        //                "price": "104613.3",
        //                "qty": "0.5435",
        //                "time": "1762238885070"
        //            }
        //        ],
        //        "ts": 1762238885074
        //    }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeList (message, 'data', []);
        if (!(symbol in this.trades)) {
            const options = this.safeDict (this.options, 'ws', {});
            const limit = this.safeInteger (options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const trades = this.trades[symbol];
        for (let i = 0; i < data.length; i++) {
            const trade = this.parseWsTrade (data[i], market);
            trades.append (trade);
        }
        client.resolve (trades, 'trade::' + symbol);
        client.resolve (trades, 'trades');
    }

    parseWsTrade (trade: any, market: any = undefined): Trade {
        //
        // public trade
        //
        //    {
        //        "businessType": "linear_perpetual",
        //        "symbol": "BTC-USDT-PERP",
        //        "stream": "trade",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT-PERP",
        //                "id": "1151486270",
        //                "side": "sell",
        //                "price": "104541.6",
        //                "qty": "0.0009",
        //                "time": "1762239293764"
        //            }
        //        ],
        //        "ts": 1762239293767
        //    }
        //
        // myTrades (from tradeList in order)
        //
        //    {
        //         "fillPrice": "0.5821",
        //         "tradeId": "4503599627842563",
        //         "role": "taker",
        //         "fillQty": "10",
        //         "fillTime": "1762860557866",
        //         "feeCurrency": "ADA",
        //         "fee": "-0.0016",
        //         "eventId": "1",
        //         "clientOrderId": "1437886926220787712",
        //         "orderId": "1437886926220787712",
        //         "businessType": "spot",
        //         "symbol": "ADA-USDT",
        //         "orderType": "market",
        //         "side": "buy",
        //         "lever": "0"
        //     }
        //
        return this.parseTrade (trade, market);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * watches a price ticker, a statistical calculation with the information for a specific market
         * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/24h-ticker-channel
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        let wsChannel: Str = undefined;
        [ wsChannel, params ] = this.handleOptionAndParams (params, 'watchTicker', 'channel', 'ticker24hr');
        return await this.watchPublic ('ticker', wsChannel, [ symbol ], params);
    }

    /**
     * @method
     * @name xcoin#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/24h-ticker-channel
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        await this.loadMarkets ();
        let wsChannel: Str = undefined;
        [ wsChannel, params ] = this.handleOptionAndParams (params, 'watchTickers', 'channel', 'ticker24hr');
        const ticker = await this.watchPublic ('ticker', wsChannel, symbols, params);
        if (this.newUpdates) {
            const tickers: Dict = {};
            const symbol = this.safeString (ticker, 'symbol');
            tickers[symbol] = ticker;
            return tickers;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    handleTicker (client: Client, message: any) {
        //
        //    {
        //        "businessType": "linear_perpetual",
        //        "symbol": "BTC-USDT-PERP",
        //        "stream": "ticker24hr",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT-PERP",
        //                "priceChange": "-2777.3",
        //                "priceChangePercent": "-0.026546295676776173",
        //                "lastPrice": "101843.7",
        //                "highPrice": "104799.9",
        //                "lowPrice": "98889.3",
        //                "fillQty": "155914.9386",
        //                "fillAmount": "15865232612.32784",
        //                "count": "701637"
        //            }
        //        ],
        //        "ts": 1762328284542
        //    }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeList (message, 'data', []);
        const newTickers = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseWsTicker (data[i], market);
            newTickers[symbol] = ticker;
            this.tickers[symbol] = ticker;
            client.resolve (ticker, 'ticker::' + symbol);
        }
        client.resolve (newTickers, 'tickers');
    }

    parseWsTicker (ticker: any, market: any = undefined): Ticker {
        return this.safeTicker ({
            'symbol': this.safeSymbol (this.safeString (ticker, 'symbol'), market),
            'timestamp': undefined,
            'datetime': undefined,
            'high': this.safeString (ticker, 'highPrice'),
            'low': this.safeString (ticker, 'lowPrice'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': undefined,
            'close': this.safeString (ticker, 'lastPrice'),
            'previousClose': undefined,
            'change': this.safeString (ticker, 'priceChange'),
            'percentage': this.safeString (ticker, 'priceChangePercent'),
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'fillQty'),
            'quoteVolume': this.safeString (ticker, 'fillAmount'),
            'info': ticker,
        }, market);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/incremental-depth-channel
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.interval] 100ms or 1000ms, default is 100ms
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        return this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    /**
     * @method
     * @name xcoin#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/incremental-depth-channel
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        let method = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'method', 'depth#100ms');
        const orderbook = await this.watchPublic ('orderBook', method, symbols, params);
        return orderbook.limit ();
    }

    handleOrderBookPartialSnapshot (client: Client, message) {
        //
        //    {
        //        "businessType": "linear_perpetual",
        //        "symbol": "BTC-USDT-PERP",
        //        "stream": "depthlevels#100ms#5#none",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT-PERP",
        //                "lastUpdateId": "1163985053",
        //                "bids": [
        //                    [ "102602.1", "7.5238"],
        //                    ...
        //                ],
        //                "asks": [
        //                    [ "102602.2", "10.1106" ],
        //                    ...
        //                ],
        //                "group": "none"
        //            }
        //        ],
        //        "ts": 1762352597503
        //    }
        //
        const data = this.safeList (message, 'data', []);
        const length = data.length;
        if (length === 0) {
            return;
        }
        for (let i = 0; i < length; i++) {
            const entry = data[i];
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const messageHash = 'orderBook::' + symbol;
            if (!(symbol in this.orderbooks)) {
                const wsOptions = this.safeDict (this.options, 'ws', this.options);
                const obOptions = this.safeDict (wsOptions, 'orderBook', {});
                const limit = this.safeInteger (obOptions, 'limit', 1000);
                this.orderbooks[symbol] = this.orderBook ({}, limit);
            }
            const orderbook = this.orderbooks[symbol];
            const timestamp = this.safeInteger (message, 'ts');
            const snapshot = this.parseOrderBook (entry, symbol, timestamp);
            snapshot['nonce'] = this.safeInteger (entry, 'lastUpdateId');
            orderbook.reset (snapshot);
            client.resolve (orderbook, messageHash);
        }
    }

    handleOrderBookIncrementalMessage (client: Client, message, initialSnapshot = undefined) {
        //
        //    {
        //        "businessType": "linear_perpetual",
        //        "symbol": "BTC-USDT-PERP",
        //        "stream": "depth#100ms",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT-PERP",
        //                "lastUpdateId": "1169874843",
        //                "preUpdateId": "1169874820",
        //                "bids": [
        //                    [ "101744.7", "0"],
        //                    [ "101748.8", "0.0007"],
        //                ],
        //                "asks": [
        //                    [ "101744.8", "0" ],
        //                    [ "101749.7", "13.6903" ]
        //                ]
        //            }
        //        ],
        //        "ts": 1762455386785
        //    }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        let orderbook = this.orderbooks[symbol];
        // if snapshot was not yet received
        if (orderbook['nonce'] === undefined) {
            orderbook.cache.push (message);
            return;
        }
        const data = this.safeList (message, 'data', []);
        const timestamp = this.safeInteger (message, 'ts');
        for (let i = 0; i < data.length; i++) {
            const update = data[i];
            const preUpdateId = this.safeInteger (update, 'preUpdateId');
            // if it's the first call after snapshot
            if (initialSnapshot !== undefined) {
                if (preUpdateId < initialSnapshot['nonce']) {
                    continue;
                }
            }
            const bids = this.safeList (update, 'bids', []);
            const asks = this.safeList (update, 'asks', []);
            if (!(symbol in this.orderbooks)) {
                this.orderbooks[symbol] = this.orderBook ({});
            }
            orderbook = this.orderbooks[symbol];
            this.handleDeltas (orderbook['bids'], bids);
            this.handleDeltas (orderbook['asks'], asks);
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601 (timestamp);
            client.resolve (orderbook, 'orderBook::' + symbol);
        }
    }

    handleDelta (bookside: any, delta: any) {
        const price = this.safeNumber (delta, 0);
        const amount = this.safeNumber (delta, 1);
        bookside.store (price, amount);
    }

    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name xcoin#watchBidsAsks
         * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/limited-depth-levels-channel
         * @param {string[]} symbols unified symbols of the markets to fetch the bids/asks for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, true, false, true);
        const result = await this.watchPublic ('bidask', 'orderBook', symbols, params);
        if (this.newUpdates) {
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    handleBidsAsks (client: Client, message) {
        //
        //    {
        //        "businessType": "spot",
        //        "symbol": "RENDER-USDT",
        //        "stream": "orderBook",
        //        "data": [
        //            {
        //                "symbol": "RENDER-USDT",
        //                "lastUpdateId": "36029273",
        //                "preUpdateId": "36029273",
        //                "bids": [
        //                    [ "1.934", "518.60" ]
        //                ],
        //                "asks": [
        //                    [ "1.936", "874.29" ]
        //                ]
        //            }
        //        ],
        //        "ts": 1762355823004
        //    }
        //
        const timestamp = this.safeInteger (message, 'ts');
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeList (message, 'data', []);
        const newTickers = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = this.parseBidAskCustom (data[i], market);
            ticker['timestamp'] = timestamp;
            ticker['datetime'] = this.iso8601 (timestamp);
            newTickers[symbol] = ticker;
            this.tickers[symbol] = ticker;
            client.resolve (ticker, 'bidask::' + symbol);
        }
        client.resolve (newTickers, 'bidasks');
    }

    parseBidAskCustom (data: any, market: any = undefined): Ticker {
        const bids = this.safeList (data, 'bids', []);
        const asks = this.safeList (data, 'asks', []);
        const firstBid = this.safeList (bids, 0, []);
        const firstAsk = this.safeList (asks, 0, []);
        return this.safeTicker ({
            'symbol': market['symbol'],
            'bid': this.safeNumber (firstBid, 0),
            'ask': this.safeNumber (firstAsk, 0),
            'bidVolume': this.safeNumber (firstBid, 1),
            'askVolume': this.safeNumber (firstAsk, 1),
            'info': data,
        }, market);
    }

    /**
     * @method
     * @name xcoin#watchOHLCV
     * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/kline-channel
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        params['callerMethodName'] = 'watchOHLCV';
        const result = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
        return result[symbol][timeframe];
    }

    /**
     * @method
     * @name xcoin#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://xcoin.com/docs/coinApi/websocket-stream/public-channel/kline-channel
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]");
        }
        await this.loadMarkets ();
        const [ symbol, timeframe, candles ] = await this.watchPublic ('ohlcv', 'kline#', symbolsAndTimeframes, params);
        if (this.newUpdates) {
            limit = candles.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (candles, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
    }

    handleOHLCV (client: Client, message) {
        //
        //    {
        //        "businessType": "linear_perpetual",
        //        "symbol": "BTC-USDT-PERP",
        //        "stream": "kline#1m",
        //        "data": [
        //            {
        //                "symbol": "BTC-USDT-PERP",
        //                "period": "1m",
        //                "openTime": "1762373100000",
        //                "closeTime": "1762373135747",
        //                "openPrice": "104014.2",
        //                "closePrice": "104107.7",
        //                "highPrice": "104134.7",
        //                "lowPrice": "104014.2",
        //                "volume": "38.5526",
        //                "quoteVolume": "4012736.31871",
        //                "count": "163",
        //                "priceChange": "93.5",
        //                "priceChangePercent": "0.000898915724968322"
        //            }
        //        ],
        //        "ts": 1762373135750
        //    }
        //
        const stream = this.safeString (message, 'stream');
        const data = this.safeList (message, 'data');
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = stream.replace ('kline#', '');
        const unifiedTimeframe = this.findTimeframe (interval);
        this.ohlcvs[symbol] = this.safeDict (this.ohlcvs, symbol, {});
        if (!(unifiedTimeframe in this.ohlcvs[symbol])) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][unifiedTimeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][unifiedTimeframe];
        for (let i = 0; i < data.length; i++) {
            const candle = data[i];
            const parsed = this.parseWsOHLCV (candle, market);
            const length = stored.length;
            if (length && parsed[0] === stored[length - 1][0]) {
                // Update the last candle
                stored[length - 1] = parsed;
            } else {
                // Append new candle
                stored.append (parsed);
            }
        }
        const resolveData = [ symbol, unifiedTimeframe, stored ];
        const messageHash = 'ohlcv' + '::' + symbol + '::' + unifiedTimeframe;
        client.resolve (resolveData, messageHash);
    }

    parseWsOHLCV (ohlcv: any, market: any = undefined): OHLCV {
        return [
            this.safeInteger (ohlcv, 'openTime'),
            this.safeNumber (ohlcv, 'openPrice'),
            this.safeNumber (ohlcv, 'highPrice'),
            this.safeNumber (ohlcv, 'lowPrice'),
            this.safeNumber (ohlcv, 'closePrice'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    /**
     * @method
     * @name xcoin#watchBalance
     * @description watches balance and get updates on changes
     * @see https://xcoin.com/docs/coinApi/websocket-stream/private-channel/trading-account-channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        await Promise.all ([ this.loadMarkets (), this.authenticate (params) ]);
        return await this.watchPrivate ('balance', 'trading_account', undefined, params);
    }

    handleBalance (client: Client, message: any) {
        //
        //    {
        //        "stream": "trading_account",
        //        "ts": "1763706018325",
        //        "code": "0",
        //        "data": [
        //            {
        //                "pid": "1981204053820035072",
        //                "totalEquity": "60.751504435633161635",
        //                "totalMarginBalance": "60.232507649629519185",
        //                "totalAvailableBalance": "44.99008595221359324",
        //                "totalPositionValue": "57.532226780412968652",
        //                "totalIm": "15.233218689415925945",
        //                "totalMm": "0.463653335608259372",
        //                "totalOpenLoss": "0.009203008",
        //                "mmr": "0.0076989",
        //                "imr": "0.25294558",
        //                "accountLeverage": "0.95531501",
        //                "totalEffectiveMargin": "60.223304641629519185",
        //                "contractUpl": "-7.23965",
        //                "details": [
        //                    {
        //                        "currency": "USDT",
        //                        "equity": "55.992463516009705795",
        //                        "balance": "63.232113516009705795",
        //                        "borrow": "0",
        //                        "realLiability": "0",
        //                        "potentialLiability": "0",
        //                        "upl": "-7.23965",
        //                        "availableMargin": "40.761930182676372462",
        //                        "liabilityInitialMargin": "0",
        //                        "initialMargin": "15.230533333333333333",
        //                        "frozen": "0",
        //                        "realLiabilityValue": "0",
        //                        "optionUpl": "0"
        //                    }
        //                ]
        //            }
        //        ]
        //    }
        //
        // skip message if there is empty details (no balances)
        const data = this.safeList (message, 'data', []);
        const first = this.safeDict (data, 0, {});
        const details = this.safeList (first, 'details', []);
        if (details.length === 0) {
            return;
        }
        const parsed = this.parseWsBalance (message);
        if (this.balance === undefined) {
            this.balance = this.safeBalance ({});
        }
        this.balance = this.extend (this.balance, parsed);
        client.resolve (this.balance, 'balance');
    }

    parseWsBalance (balance) {
        // same as REST api
        return this.parseBalance (balance);
    }

    /**
     * @method
     * @name xcoin#watchPositions
     * @see https://xcoin.com/docs/coinApi/websocket-stream/private-channel/position-channel
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        await Promise.all ([ this.loadMarkets (), this.authenticate (params) ]);
        const request: Dict = {};
        const newPositions = await this.watchPrivate ('positions', 'position', symbols, this.extend (request, params));
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit, true);
    }

    handlePosition (client: Client, message: any) {
        //
        //    {
        //        "stream": "position",
        //        "ts": "1762786664306",
        //        "code": "0",
        //        "data": [
        //            {
        //                "businessType": "linear_perpetual",
        //                "symbol": "ADA-USDT-PERP",
        //                "positionQty": "50",
        //                "avgPrice": "0.58322",
        //                "upl": "-0.021",
        //                "lever": "5",
        //                "liquidationPrice": "0",
        //                "markPrice": "0.5828",
        //                "im": "5.828",
        //                "indexPrice": "0.5828",
        //                "pnl": "-0.00466576",
        //                "fee": "-0.00466576",
        //                "fundingFee": "0",
        //                "createTime": "1762786498154",
        //                "updateTime": "1762786664301",
        //                "positionId": "4503599627373602",
        //                "pid": "1981204053820035072",
        //                "tradedType": "OPEN"
        //            }
        //        ]
        //    }
        //
        const data = this.safeList (message, 'data', []);
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const positions = this.positions;
        for (let i = 0; i < data.length; i++) {
            const position = this.parseWsPosition (data[i]);
            positions.append (position);
        }
        const messageHash = 'positions';
        client.resolve (positions, messageHash);
    }

    parseWsPosition (position: any, market: any = undefined): Position {
        // almost same as REST response
        return this.parsePosition (position, market);
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * watches information on multiple orders made by the user
         * @see https://xcoin.com/docs/coinApi/websocket-stream/private-channel/order-channel
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await Promise.all ([ this.loadMarkets (), this.authenticate (params) ]);
        const request: Dict = {};
        let symbols = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            symbols = [ symbol ];
        }
        const newOrders = await this.watchPrivate ('orders', 'order', symbols, this.extend (request, params));
        if (this.newUpdates) {
            return newOrders;
        }
        return this.filterBySymbolsSinceLimit (this.orders, symbols, since, limit, true);
    }

    handleOrder (client: Client, message: any) {
        //
        //    {
        //        "stream": "order",
        //        "ts": "1762788970367",
        //        "code": "0",
        //        "data": [
        //            {
        //                "pid": "1981204053820035072",
        //                "uid": "176118985582700",
        //                "businessType": "spot",
        //                "symbol": "ADA-USDT",
        //                "orderId": "1437586666466402304",
        //                "clientOrderId": "1437586666466402304",
        //                "price": "0.618",
        //                "qty": "10",
        //                "orderType": "market",
        //                "side": "buy",
        //                "totalFillQty": "10",
        //                "avgPrice": "0.589",
        //                "status": "filled",
        //                "lever": "0",
        //                "baseFee": "-0.0016",
        //                "source": "api",
        //                "reduceOnly": false,
        //                "createTime": "1762788970359",
        //                "updateTime": "1762788970362",
        //                "cancelUid": "0",
        //                "tradeList": [
        //                    {
        //                        "fillPrice": "0.589",
        //                        "tradeId": "4503599627840140",
        //                        "role": "taker",
        //                        "fillQty": "10",
        //                        "fillTime": "1762788970362",
        //                        "feeCurrency": "ADA",
        //                        "fee": "-0.0016",
        //                        "eventId": "1",
        //                        "clientOrderId": "1437586666466402304",
        //                        "orderId": "1437586666466402304",
        //                        "businessType": "spot",
        //                        "symbol": "ADA-USDT",
        //                        "orderType": "market",
        //                        "side": "buy",
        //                        "lever": "0"
        //                    }
        //                ],
        //                "timeInForce": "ioc",
        //                "parentOrderId": "",
        //                "createType": "order",
        //                "riskReducing": false,
        //                "eventId": "1",
        //                "massQuoteOrder": {
        //                    "quote": false,
        //                    "priceAdjustment": false
        //                }
        //            }
        //        ]
        //    }
        //
        const data = this.safeList (message, 'data', []);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        for (let i = 0; i < data.length; i++) {
            const rawOrder = data[i];
            const order = this.parseWsOrder (rawOrder);
            const symbol = order['symbol'];
            const orders = this.orders;
            orders.append (order);
            client.resolve (orders, 'orders');
            if (symbol !== undefined) {
                client.resolve (orders, 'orders::' + symbol);
            }
            // Handle myTrades
            const trades = this.safeList (order, 'trades');
            if (trades !== undefined) {
                if (this.myTrades === undefined) {
                    const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
                    this.myTrades = new ArrayCacheBySymbolById (limit);
                }
                const myTrades = this.myTrades;
                for (let j = 0; j < trades.length; j++) {
                    const parsedTrade = trades[j];
                    myTrades.append (parsedTrade);
                }
                if (symbol !== undefined) {
                    client.resolve (myTrades, 'myTrades::' + symbol);
                }
                client.resolve (myTrades, 'myTrades');
            }
        }
    }

    parseWsOrder (order: any, market: any = undefined): Order {
        return this.parseOrder (order, market);
    }

    /**
     * @method
     * @name xcoin#watchMyTrades
     * @see https://xcoin.com/docs/coinApi/websocket-stream/private-channel/order-channel
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await Promise.all ([ this.loadMarkets (), this.authenticate (params) ]);
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
        }
        const symbols = (symbol !== undefined) ? [ symbol ] : undefined;
        const trades = await this.watchPrivate ('myTrades', 'order', symbols, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    async spawnFetchOrderBookSnapshot (client: Client, message, subscription) {
        // this method should be triggered when subscription confirmation is arrived in "handleSuscriptionStatus" method
        // so, `message` argument would be skipped here, the derived class should be calling this method deterministically
        const wsOptions = this.safeDict (this.options, 'ws', this.options);
        const obOptions = this.safeDict2 (wsOptions, 'watchOrderBook', 'orderBook', {});
        const defaultLimit = this.safeInteger (obOptions, 'limit', 1000);
        const limit = this.safeInteger (subscription, 'limit', defaultLimit);
        const params = this.safeValue (subscription, 'params');
        const symbol = this.safeString (subscription, 'symbol');
        if (symbol !== undefined) {
            if (symbol in this.orderbooks) {
                delete this.orderbooks[symbol];
            }
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
        const messageHash = this.safeString (subscription, 'messageHash');
        try {
            await this.sleep (0); // yield to the event loop
            const snapshot = await this.fetchRestOrderBookSafe (symbol, limit, params);
            // if the orderbook was dropped while the snapshot was being received
            if (!(symbol in this.orderbooks) || (this.orderbooks[symbol] === undefined)) {
                return;
            }
            const orderbook = this.orderbooks[symbol];
            orderbook.reset (snapshot);
            const collectedMessages = orderbook.cache;
            for (let i = 0; i < collectedMessages.length; i++) {
                const rawMessage = collectedMessages[i];
                this.handleOrderBookIncrementalMessage (client, rawMessage, orderbook);
            }
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        } catch (e) {
            delete client.subscriptions[messageHash];
            client.reject (e, messageHash);
        }
    }

    checkIfSubscriptionCallbackNeeded (client: Client, message: any, subscriptionId: string) {
        const keys = Object.keys (client.subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const subscriptionDict = this.safeDict (client.subscriptions, key, {});
            const id = this.safeString (subscriptionDict, 'id');
            if (id !== undefined && subscriptionId) {
                const method = this.safeValue (subscriptionDict, 'callback');
                if (method !== undefined) {
                    method.call (this, client, message, subscriptionDict);
                }
            }
        }
    }

    handleErrorMessage (client: Client, message: any) {
        //
        //    {
        //        "event": "error",
        //        "code": 1,
        //        "message": "失败"
        //    }
        //
        const code = this.safeString (message, 'code');
        if (code !== undefined && code !== '0') {
            const msg = this.safeString (message, 'message');
            const feedback = this.id + ' ' + msg;
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], msg, feedback);
            throw new ExchangeError (this.id + ' ' + this.json (message));
        }
    }
}
