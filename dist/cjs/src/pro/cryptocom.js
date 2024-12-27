'use strict';

var cryptocom$1 = require('../cryptocom.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class cryptocom extends cryptocom$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchMyTrades': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchOHLCV': true,
                'watchPositions': true,
                'createOrderWs': true,
                'cancelOrderWs': true,
                'cancelAllOrders': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://stream.crypto.com/exchange/v1/market',
                        'private': 'wss://stream.crypto.com/exchange/v1/user',
                    },
                },
                'test': {
                    'public': 'wss://uat-stream.3ona.co/exchange/v1/market',
                    'private': 'wss://uat-stream.3ona.co/exchange/v1/user',
                },
            },
            'options': {
                'watchPositions': {
                    'fetchPositionsSnapshot': true,
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
                'watchOrderBook': {
                    'checksum': true,
                },
            },
            'streaming': {},
        });
    }
    async pong(client, message) {
        // {
        //     "id": 1587523073344,
        //     "method": "public/heartbeat",
        //     "code": 0
        // }
        try {
            await client.send({ 'id': this.safeInteger(message, 'id'), 'method': 'public/respond-heartbeat' });
        }
        catch (e) {
            const error = new errors.NetworkError(this.id + ' pong failed with error ' + this.json(e));
            client.reset(error);
        }
    }
    /**
     * @method
     * @name cryptocom#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.bookSubscriptionType] The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates
     * @param {int} [params.bookUpdateFrequency] Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook(symbol, limit = undefined, params = {}) {
        return await this.watchOrderBookForSymbols([symbol], limit, params);
    }
    /**
     * @method
     * @name cryptocom#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.bookSubscriptionType] The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates
     * @param {int} [params.bookUpdateFrequency] Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook(symbol, params = {}) {
        return await this.unWatchOrderBookForSymbols([symbol], params);
    }
    /**
     * @method
     * @name cryptocom#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.bookSubscriptionType] The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates
     * @param {int} [params.bookUpdateFrequency] Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBookForSymbols(symbols, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const topics = [];
        const messageHashes = [];
        if (!limit) {
            limit = 50;
        }
        const topicParams = this.safeValue(params, 'params');
        if (topicParams === undefined) {
            params['params'] = {};
        }
        let bookSubscriptionType = undefined;
        let bookSubscriptionType2 = undefined;
        [bookSubscriptionType, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'bookSubscriptionType', 'SNAPSHOT_AND_UPDATE');
        [bookSubscriptionType2, params] = this.handleOptionAndParams(params, 'watchOrderBookForSymbols', 'bookSubscriptionType', bookSubscriptionType);
        params['params']['bookSubscriptionType'] = bookSubscriptionType2;
        let bookUpdateFrequency = undefined;
        let bookUpdateFrequency2 = undefined;
        [bookUpdateFrequency, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'bookUpdateFrequency');
        [bookUpdateFrequency2, params] = this.handleOptionAndParams(params, 'watchOrderBookForSymbols', 'bookUpdateFrequency', bookUpdateFrequency);
        if (bookUpdateFrequency2 !== undefined) {
            params['params']['bookSubscriptionType'] = bookUpdateFrequency2;
        }
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const currentTopic = 'book' + '.' + market['id'] + '.' + limit.toString();
            const messageHash = 'orderbook:' + market['symbol'];
            messageHashes.push(messageHash);
            topics.push(currentTopic);
        }
        const orderbook = await this.watchPublicMultiple(messageHashes, topics, params);
        return orderbook.limit();
    }
    /**
     * @method
     * @name cryptocom#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is 50
     * @param {string} [params.bookSubscriptionType] The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates
     * @param {int} [params.bookUpdateFrequency] Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBookForSymbols(symbols, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const topics = [];
        const subMessageHashes = [];
        const messageHashes = [];
        const limit = this.safeInteger(params, 'limit', 50);
        const topicParams = this.safeValue(params, 'params');
        if (topicParams === undefined) {
            params['params'] = {};
        }
        let bookSubscriptionType = undefined;
        let bookSubscriptionType2 = undefined;
        [bookSubscriptionType, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'bookSubscriptionType', 'SNAPSHOT_AND_UPDATE');
        [bookSubscriptionType2, params] = this.handleOptionAndParams(params, 'watchOrderBookForSymbols', 'bookSubscriptionType', bookSubscriptionType);
        params['params']['bookSubscriptionType'] = bookSubscriptionType2;
        let bookUpdateFrequency = undefined;
        let bookUpdateFrequency2 = undefined;
        [bookUpdateFrequency, params] = this.handleOptionAndParams(params, 'watchOrderBook', 'bookUpdateFrequency');
        [bookUpdateFrequency2, params] = this.handleOptionAndParams(params, 'watchOrderBookForSymbols', 'bookUpdateFrequency', bookUpdateFrequency);
        if (bookUpdateFrequency2 !== undefined) {
            params['params']['bookSubscriptionType'] = bookUpdateFrequency2;
        }
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const currentTopic = 'book' + '.' + market['id'] + '.' + limit.toString();
            const messageHash = 'orderbook:' + market['symbol'];
            subMessageHashes.push(messageHash);
            messageHashes.push('unsubscribe:' + messageHash);
            topics.push(currentTopic);
        }
        return await this.unWatchPublicMultiple('orderbook', symbols, messageHashes, subMessageHashes, topics, params);
    }
    handleDelta(bookside, delta) {
        const price = this.safeFloat(delta, 0);
        const amount = this.safeFloat(delta, 1);
        const count = this.safeInteger(delta, 2);
        bookside.storeArray([price, amount, count]);
    }
    handleDeltas(bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta(bookside, deltas[i]);
        }
    }
    handleOrderBook(client, message) {
        //
        // snapshot
        //    {
        //        "instrument_name":"LTC_USDT",
        //        "subscription":"book.LTC_USDT.150",
        //        "channel":"book",
        //        "depth":150,
        //        "data": [
        //             {
        //                 "bids": [
        //                     [122.21, 0.74041, 4]
        //                 ],
        //                 "asks": [
        //                     [122.29, 0.00002, 1]
        //                 ]
        //                 "t": 1648123943803,
        //                 "s":754560122
        //             }
        //         ]
        //    }
        //  update
        //    {
        //        "instrument_name":"BTC_USDT",
        //        "subscription":"book.BTC_USDT.50",
        //        "channel":"book.update",
        //        "depth":50,
        //        "data":[
        //           {
        //              "update":{
        //                 "asks":[
        //                    [
        //                       "43755.46",
        //                       "0.10000",
        //                       "1"
        //                    ],
        //                    ...
        //                 ],
        //                 "bids":[
        //                    [
        //                       "43737.46",
        //                       "0.14096",
        //                       "1"
        //                    ],
        //                    ...
        //                 ]
        //              },
        //              "t":1704484068898,
        //              "tt":1704484068892,
        //              "u":78795598253024,
        //              "pu":78795598162080,
        //              "cs":-781431132
        //           }
        //        ]
        //    }
        //
        const marketId = this.safeString(message, 'instrument_name');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let data = this.safeValue(message, 'data');
        data = this.safeValue(data, 0);
        const timestamp = this.safeInteger(data, 't');
        if (!(symbol in this.orderbooks)) {
            const limit = this.safeInteger(message, 'depth');
            this.orderbooks[symbol] = this.countedOrderBook({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        const channel = this.safeString(message, 'channel');
        const nonce = this.safeInteger2(data, 'u', 's');
        let books = data;
        if (channel === 'book') { // snapshot
            orderbook.reset({});
            orderbook['symbol'] = symbol;
            orderbook['timestamp'] = timestamp;
            orderbook['datetime'] = this.iso8601(timestamp);
            orderbook['nonce'] = nonce;
        }
        else {
            books = this.safeValue(data, 'update', {});
            const previousNonce = this.safeInteger(data, 'pu');
            const currentNonce = orderbook['nonce'];
            if (currentNonce !== previousNonce) {
                const checksum = this.handleOption('watchOrderBook', 'checksum', true);
                if (checksum) {
                    throw new errors.ChecksumError(this.id + ' ' + this.orderbookChecksumMessage(symbol));
                }
            }
        }
        this.handleDeltas(orderbook['asks'], this.safeValue(books, 'asks', []));
        this.handleDeltas(orderbook['bids'], this.safeValue(books, 'bids', []));
        orderbook['nonce'] = nonce;
        this.orderbooks[symbol] = orderbook;
        const messageHash = 'orderbook:' + symbol;
        client.resolve(orderbook, messageHash);
    }
    /**
     * @method
     * @name cryptocom#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTrades(symbol, since = undefined, limit = undefined, params = {}) {
        return await this.watchTradesForSymbols([symbol], since, limit, params);
    }
    /**
     * @method
     * @name cryptocom#unWatchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTrades(symbol, params = {}) {
        return await this.unWatchTradesForSymbols([symbol], params);
    }
    /**
     * @method
     * @name cryptocom#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async watchTradesForSymbols(symbols, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const currentTopic = 'trade' + '.' + market['id'];
            topics.push(currentTopic);
        }
        const trades = await this.watchPublicMultiple(topics, topics, params);
        if (this.newUpdates) {
            const first = this.safeValue(trades, 0);
            const tradeSymbol = this.safeString(first, 'symbol');
            limit = trades.getLimit(tradeSymbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    /**
     * @method
     * @name cryptocom#unWatchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name
     * @param {string[]} [symbols] list of unified market symbols to unwatch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    async unWatchTradesForSymbols(symbols, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols);
        const topics = [];
        const messageHashes = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const market = this.market(symbol);
            const currentTopic = 'trade' + '.' + market['id'];
            messageHashes.push('unsubscribe:trades:' + market['symbol']);
            topics.push(currentTopic);
        }
        return await this.unWatchPublicMultiple('trades', symbols, messageHashes, topics, topics, params);
    }
    handleTrades(client, message) {
        //
        // {
        //     "code": 0,
        //     "method": "subscribe",
        //     "result": {
        //       "instrument_name": "BTC_USDT",
        //       "subscription": "trade.BTC_USDT",
        //       "channel": "trade",
        //       "data": [
        //             {
        //                 "dataTime":1648122434405,
        //                 "d":"2358394540212355488",
        //                 "s":"SELL",
        //                 "p":42980.85,
        //                 "q":0.002325,
        //                 "t":1648122434404,
        //                 "i":"BTC_USDT"
        //              }
        //              (...)
        //       ]
        // }
        //
        const channel = this.safeString(message, 'channel');
        const marketId = this.safeString(message, 'instrument_name');
        const symbolSpecificMessageHash = this.safeString(message, 'subscription');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        let stored = this.safeValue(this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            stored = new Cache.ArrayCache(limit);
            this.trades[symbol] = stored;
        }
        const data = this.safeValue(message, 'data', []);
        const dataLength = data.length;
        if (dataLength === 0) {
            return;
        }
        const parsedTrades = this.parseTrades(data, market);
        for (let j = 0; j < parsedTrades.length; j++) {
            stored.append(parsedTrades[j]);
        }
        const channelReplaced = channel.replace('.' + marketId, '');
        client.resolve(stored, symbolSpecificMessageHash);
        client.resolve(stored, channelReplaced);
    }
    /**
     * @method
     * @name cryptocom#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-trade-instrument_name
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        let messageHash = 'user.trade';
        messageHash = (market !== undefined) ? (messageHash + '.' + market['id']) : messageHash;
        const trades = await this.watchPrivateSubscribe(messageHash, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(trades, symbol, since, limit, true);
    }
    /**
     * @method
     * @name cryptocom#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const messageHash = 'ticker' + '.' + market['id'];
        return await this.watchPublic(messageHash, params);
    }
    /**
     * @method
     * @name cryptocom#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTicker(symbol, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        const subMessageHash = 'ticker' + '.' + market['id'];
        const messageHash = 'unsubscribe:ticker:' + market['symbol'];
        return await this.unWatchPublicMultiple('ticker', [market['symbol']], [messageHash], [subMessageHash], [subMessageHash], params);
    }
    /**
     * @method
     * @name cryptocom#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const messageHashes = [];
        const marketIds = this.marketIds(symbols);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            messageHashes.push('ticker.' + marketId);
        }
        const url = this.urls['api']['ws']['public'];
        const id = this.nonce();
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': messageHashes,
            },
            'nonce': id,
        };
        const ticker = await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes);
        if (this.newUpdates) {
            const result = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray(this.tickers, 'symbol', symbols);
    }
    /**
     * @method
     * @name cryptocom#unWatchTickers
     * @description unWatches a price ticker
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async unWatchTickers(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const messageHashes = [];
        const subMessageHashes = [];
        const marketIds = this.marketIds(symbols);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            const symbol = symbols[i];
            subMessageHashes.push('ticker.' + marketId);
            messageHashes.push('unsubscribe:ticker:' + symbol);
        }
        return await this.unWatchPublicMultiple('ticker', symbols, messageHashes, subMessageHashes, subMessageHashes, params);
    }
    handleTicker(client, message) {
        //
        //     {
        //       "instrument_name": "ETHUSD-PERP",
        //       "subscription": "ticker.ETHUSD-PERP",
        //       "channel": "ticker",
        //       "data": [
        //         {
        //           "h": "2400.20",
        //           "l": "2277.10",
        //           "a": "2335.25",
        //           "c": "-0.0022",
        //           "b": "2335.10",
        //           "bs": "5.4000",
        //           "k": "2335.16",
        //           "ks": "1.9970",
        //           "i": "ETHUSD-PERP",
        //           "v": "1305697.6462",
        //           "vv": "3058704939.17",
        //           "oi": "161646.3614",
        //           "t": 1726069647560
        //         }
        //       ]
        //     }
        //
        this.handleBidAsk(client, message);
        const messageHash = this.safeString(message, 'subscription');
        const marketId = this.safeString(message, 'instrument_name');
        const market = this.safeMarket(marketId);
        const data = this.safeValue(message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const ticker = data[i];
            const parsed = this.parseWsTicker(ticker, market);
            const symbol = parsed['symbol'];
            this.tickers[symbol] = parsed;
            client.resolve(parsed, messageHash);
        }
    }
    parseWsTicker(ticker, market = undefined) {
        //
        //     {
        //       "h": "2400.20",
        //       "l": "2277.10",
        //       "a": "2335.25",
        //       "c": "-0.0022",
        //       "b": "2335.10",
        //       "bs": "5.4000",
        //       "k": "2335.16",
        //       "ks": "1.9970",
        //       "i": "ETHUSD-PERP",
        //       "v": "1305697.6462",
        //       "vv": "3058704939.17",
        //       "oi": "161646.3614",
        //       "t": 1726069647560
        //     }
        //
        const timestamp = this.safeInteger(ticker, 't');
        const marketId = this.safeString(ticker, 'i');
        market = this.safeMarket(marketId, market, '_');
        const quote = this.safeString(market, 'quote');
        const last = this.safeString(ticker, 'a');
        return this.safeTicker({
            'symbol': market['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'high': this.safeNumber(ticker, 'h'),
            'low': this.safeNumber(ticker, 'l'),
            'bid': this.safeNumber(ticker, 'b'),
            'bidVolume': this.safeNumber(ticker, 'bs'),
            'ask': this.safeNumber(ticker, 'k'),
            'askVolume': this.safeNumber(ticker, 'ks'),
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': this.safeString(ticker, 'c'),
            'average': undefined,
            'baseVolume': this.safeString(ticker, 'v'),
            'quoteVolume': (quote === 'USD') ? this.safeString(ticker, 'vv') : undefined,
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name cryptocom#watchBidsAsks
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchBidsAsks(symbols = undefined, params = {}) {
        await this.loadMarkets();
        symbols = this.marketSymbols(symbols, undefined, false);
        const messageHashes = [];
        const topics = [];
        const marketIds = this.marketIds(symbols);
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = marketIds[i];
            messageHashes.push('bidask.' + symbols[i]);
            topics.push('ticker.' + marketId);
        }
        const url = this.urls['api']['ws']['public'];
        const id = this.nonce();
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': topics,
            },
            'nonce': id,
        };
        const newTickers = await this.watchMultiple(url, messageHashes, this.extend(request, params), messageHashes);
        if (this.newUpdates) {
            const tickers = {};
            tickers[newTickers['symbol']] = newTickers;
            return tickers;
        }
        return this.filterByArray(this.bidsasks, 'symbol', symbols);
    }
    handleBidAsk(client, message) {
        const data = this.safeList(message, 'data', []);
        const ticker = this.safeDict(data, 0, {});
        const parsedTicker = this.parseWsBidAsk(ticker);
        const symbol = parsedTicker['symbol'];
        this.bidsasks[symbol] = parsedTicker;
        const messageHash = 'bidask.' + symbol;
        client.resolve(parsedTicker, messageHash);
    }
    parseWsBidAsk(ticker, market = undefined) {
        const marketId = this.safeString(ticker, 'i');
        market = this.safeMarket(marketId, market);
        const symbol = this.safeString(market, 'symbol');
        const timestamp = this.safeInteger(ticker, 't');
        return this.safeTicker({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601(timestamp),
            'ask': this.safeString(ticker, 'k'),
            'askVolume': this.safeString(ticker, 'ks'),
            'bid': this.safeString(ticker, 'b'),
            'bidVolume': this.safeString(ticker, 'bs'),
            'info': ticker,
        }, market);
    }
    /**
     * @method
     * @name cryptocom#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#candlestick-time_frame-instrument_name
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async watchOHLCV(symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const messageHash = 'candlestick' + '.' + interval + '.' + market['id'];
        const ohlcv = await this.watchPublic(messageHash, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(ohlcv, since, limit, 0, true);
    }
    /**
     * @method
     * @name cryptocom#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#candlestick-time_frame-instrument_name
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    async unWatchOHLCV(symbol, timeframe = '1m', params = {}) {
        await this.loadMarkets();
        const market = this.market(symbol);
        symbol = market['symbol'];
        const interval = this.safeString(this.timeframes, timeframe, timeframe);
        const subMessageHash = 'candlestick' + '.' + interval + '.' + market['id'];
        const messageHash = 'unsubscribe:ohlcv:' + market['symbol'] + ':' + timeframe;
        const subExtend = {
            'symbolsAndTimeframes': [[market['symbol'], timeframe]],
        };
        return await this.unWatchPublicMultiple('ohlcv', [market['symbol']], [messageHash], [subMessageHash], [subMessageHash], params, subExtend);
    }
    handleOHLCV(client, message) {
        //
        //  {
        //       "instrument_name": "BTC_USDT",
        //       "subscription": "candlestick.1m.BTC_USDT",
        //       "channel": "candlestick",
        //       "depth": 300,
        //       "interval": "1m",
        //       "data": [ [Object] ]
        //   }
        //
        const messageHash = this.safeString(message, 'subscription');
        const marketId = this.safeString(message, 'instrument_name');
        const market = this.safeMarket(marketId);
        const symbol = market['symbol'];
        const interval = this.safeString(message, 'interval');
        const timeframe = this.findTimeframe(interval);
        this.ohlcvs[symbol] = this.safeValue(this.ohlcvs, symbol, {});
        let stored = this.safeValue(this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger(this.options, 'OHLCVLimit', 1000);
            stored = new Cache.ArrayCacheByTimestamp(limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        const data = this.safeValue(message, 'data');
        for (let i = 0; i < data.length; i++) {
            const tick = data[i];
            const parsed = this.parseOHLCV(tick, market);
            stored.append(parsed);
        }
        client.resolve(stored, messageHash);
    }
    /**
     * @method
     * @name cryptocom#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-order-instrument_name
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market(symbol);
            symbol = market['symbol'];
        }
        let messageHash = 'user.order';
        messageHash = (market !== undefined) ? (messageHash + '.' + market['id']) : messageHash;
        const orders = await this.watchPrivateSubscribe(messageHash, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySymbolSinceLimit(orders, symbol, since, limit, true);
    }
    handleOrders(client, message, subscription = undefined) {
        //
        //    {
        //        "method": "subscribe",
        //        "result": {
        //          "instrument_name": "ETH_CRO",
        //          "subscription": "user.order.ETH_CRO",
        //          "channel": "user.order",
        //          "data": [
        //            {
        //              "status": "ACTIVE",
        //              "side": "BUY",
        //              "price": 1,
        //              "quantity": 1,
        //              "order_id": "366455245775097673",
        //              "client_oid": "my_order_0002",
        //              "create_time": 1588758017375,
        //              "update_time": 1588758017411,
        //              "type": "LIMIT",
        //              "instrument_name": "ETH_CRO",
        //              "cumulative_quantity": 0,
        //              "cumulative_value": 0,
        //              "avg_price": 0,
        //              "fee_currency": "CRO",
        //              "time_in_force":"GOOD_TILL_CANCEL"
        //            }
        //          ],
        //          "channel": "user.order.ETH_CRO"
        //        }
        //    }
        //
        const channel = this.safeString(message, 'channel');
        const symbolSpecificMessageHash = this.safeString(message, 'subscription');
        const orders = this.safeValue(message, 'data', []);
        const ordersLength = orders.length;
        if (ordersLength > 0) {
            if (this.orders === undefined) {
                const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
                this.orders = new Cache.ArrayCacheBySymbolById(limit);
            }
            const stored = this.orders;
            const parsed = this.parseOrders(orders);
            for (let i = 0; i < parsed.length; i++) {
                stored.append(parsed[i]);
            }
            client.resolve(stored, symbolSpecificMessageHash);
            // non-symbol specific
            client.resolve(stored, channel); // channel might have a symbol-specific suffix
            client.resolve(stored, 'user.order');
        }
    }
    /**
     * @method
     * @name cryptocom#watchPositions
     * @description watch all open positions
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-position_balance
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions(symbols = undefined, since = undefined, limit = undefined, params = {}) {
        await this.loadMarkets();
        await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const id = this.nonce();
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': ['user.position_balance'],
            },
            'nonce': id,
        };
        let messageHash = 'positions';
        symbols = this.marketSymbols(symbols);
        if (!this.isEmpty(symbols)) {
            messageHash = '::' + symbols.join(',');
        }
        const client = this.client(url);
        this.setPositionsCache(client, symbols);
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption('watchPositions', 'awaitPositionsSnapshot', true);
        if (fetchPositionsSnapshot && awaitPositionsSnapshot && this.positions === undefined) {
            const snapshot = await client.future('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit(snapshot, symbols, since, limit, true);
        }
        const newPositions = await this.watch(url, messageHash, this.extend(request, params));
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit(this.positions, symbols, since, limit, true);
    }
    setPositionsCache(client, type, symbols = undefined) {
        const fetchPositionsSnapshot = this.handleOption('watchPositions', 'fetchPositionsSnapshot', false);
        if (fetchPositionsSnapshot) {
            const messageHash = 'fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future(messageHash);
                this.spawn(this.loadPositionsSnapshot, client, messageHash);
            }
        }
        else {
            this.positions = new Cache.ArrayCacheBySymbolBySide();
        }
    }
    async loadPositionsSnapshot(client, messageHash) {
        const positions = await this.fetchPositions();
        this.positions = new Cache.ArrayCacheBySymbolBySide();
        const cache = this.positions;
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const contracts = this.safeNumber(position, 'contracts', 0);
            if (contracts > 0) {
                cache.append(position);
            }
        }
        // don't remove the future from the .futures cache
        const future = client.futures[messageHash];
        future.resolve(cache);
        client.resolve(cache, 'positions');
    }
    handlePositions(client, message) {
        //
        //    {
        //        "subscription": "user.position_balance",
        //        "channel": "user.position_balance",
        //        "data": [{
        //            "balances": [{
        //                "instrument_name": "USD",
        //                "quantity": "8.9979961950886",
        //                "update_timestamp_ms": 1695598760597,
        //            }],
        //            "positions": [{
        //                "account_id": "96a0edb1-afb5-4c7c-af89-5cb610319e2c",
        //                "instrument_name": "LTCUSD-PERP",
        //                "type": "PERPETUAL_SWAP",
        //                "quantity": "1.8",
        //                "cost": "114.766",
        //                "open_position_pnl": "-0.0216206",
        //                "session_pnl": "0.00962994",
        //                "update_timestamp_ms": 1695598760597,
        //                "open_pos_cost": "114.766",
        //            }],
        //        }],
        //    }
        //
        // each account is connected to a different endpoint
        // and has exactly one subscriptionhash which is the account type
        const data = this.safeValue(message, 'data', []);
        const firstData = this.safeValue(data, 0, {});
        const rawPositions = this.safeValue(firstData, 'positions', []);
        if (this.positions === undefined) {
            this.positions = new Cache.ArrayCacheBySymbolBySide();
        }
        const cache = this.positions;
        const newPositions = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const position = this.parsePosition(rawPosition);
            newPositions.push(position);
            cache.append(position);
        }
        const messageHashes = this.findMessageHashes(client, 'positions::');
        for (let i = 0; i < messageHashes.length; i++) {
            const messageHash = messageHashes[i];
            const parts = messageHash.split('::');
            const symbolsString = parts[1];
            const symbols = symbolsString.split(',');
            const positions = this.filterByArray(newPositions, 'symbol', symbols, false);
            if (!this.isEmpty(positions)) {
                client.resolve(positions, messageHash);
            }
        }
        client.resolve(newPositions, 'positions');
    }
    /**
     * @method
     * @name cryptocom#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    async watchBalance(params = {}) {
        const messageHash = 'user.balance';
        return await this.watchPrivateSubscribe(messageHash, params);
    }
    handleBalance(client, message) {
        //
        //     {
        //         "id": 1,
        //         "method": "subscribe",
        //         "code": 0,
        //         "result": {
        //             "subscription": "user.balance",
        //             "channel": "user.balance",
        //             "data": [
        //                 {
        //                     "total_available_balance": "5.84684368",
        //                     "total_margin_balance": "5.84684368",
        //                     "total_initial_margin": "0",
        //                     "total_maintenance_margin": "0",
        //                     "total_position_cost": "0",
        //                     "total_cash_balance": "6.44412101",
        //                     "total_collateral_value": "5.846843685",
        //                     "total_session_unrealized_pnl": "0",
        //                     "instrument_name": "USD",
        //                     "total_session_realized_pnl": "0",
        //                     "position_balances": [
        //                         {
        //                             "quantity": "0.0002119875",
        //                             "reserved_qty": "0",
        //                             "collateral_weight": "0.9",
        //                             "collateral_amount": "5.37549592",
        //                             "market_value": "5.97277325",
        //                             "max_withdrawal_balance": "0.00021198",
        //                             "instrument_name": "BTC",
        //                             "hourly_interest_rate": "0"
        //                         },
        //                     ],
        //                     "total_effective_leverage": "0",
        //                     "position_limit": "3000000",
        //                     "used_position_limit": "0",
        //                     "total_borrow": "0",
        //                     "margin_score": "0",
        //                     "is_liquidating": false,
        //                     "has_risk": false,
        //                     "terminatable": true
        //                 }
        //             ]
        //         }
        //     }
        //
        const messageHash = this.safeString(message, 'subscription');
        const data = this.safeValue(message, 'data', []);
        const positionBalances = this.safeValue(data[0], 'position_balances', []);
        this.balance['info'] = data;
        for (let i = 0; i < positionBalances.length; i++) {
            const balance = positionBalances[i];
            const currencyId = this.safeString(balance, 'instrument_name');
            const code = this.safeCurrencyCode(currencyId);
            const account = this.account();
            account['total'] = this.safeString(balance, 'quantity');
            account['used'] = this.safeString(balance, 'reserved_qty');
            this.balance[code] = account;
            this.balance = this.safeBalance(this.balance);
        }
        client.resolve(this.balance, messageHash);
        const messageHashRequest = this.safeString(message, 'id');
        client.resolve(this.balance, messageHashRequest);
    }
    /**
     * @method
     * @name cryptocom#createOrderWs
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async createOrderWs(symbol, type, side, amount, price = undefined, params = {}) {
        await this.loadMarkets();
        params = this.createOrderRequest(symbol, type, side, amount, price, params);
        const request = {
            'method': 'private/create-order',
            'params': params,
        };
        const messageHash = this.nonce();
        return await this.watchPrivateRequest(messageHash, request);
    }
    handleOrder(client, message) {
        //
        //    {
        //        "id": 1,
        //        "method": "private/create-order",
        //        "code": 0,
        //        "result": {
        //            "client_oid": "c5f682ed-7108-4f1c-b755-972fcdca0f02",
        //            "order_id": "18342311"
        //        }
        //    }
        //
        const messageHash = this.safeString(message, 'id');
        const rawOrder = this.safeValue(message, 'result', {});
        const order = this.parseOrder(rawOrder);
        client.resolve(order, messageHash);
    }
    /**
     * @method
     * @name cryptocom#cancelOrder
     * @description cancels an open order
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order
     * @param {string} id the order id of the order to cancel
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelOrderWs(id, symbol = undefined, params = {}) {
        await this.loadMarkets();
        params = this.extend({
            'order_id': id,
        }, params);
        const request = {
            'method': 'private/cancel-order',
            'params': params,
        };
        const messageHash = this.nonce();
        return await this.watchPrivateRequest(messageHash, request);
    }
    /**
     * @method
     * @name cryptocom#cancelAllOrdersWs
     * @description cancel all open orders
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-all-orders
     * @param {string} symbol unified market symbol of the orders to cancel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} Returns exchange raw message {@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async cancelAllOrdersWs(symbol = undefined, params = {}) {
        await this.loadMarkets();
        let market = undefined;
        const request = {
            'method': 'private/cancel-all-orders',
            'params': this.extend({}, params),
        };
        if (symbol !== undefined) {
            market = this.market(symbol);
            request['params']['instrument_name'] = market['id'];
        }
        const messageHash = this.nonce();
        return await this.watchPrivateRequest(messageHash, request);
    }
    handleCancelAllOrders(client, message) {
        //
        //    {
        //        "id": 1688914586647,
        //        "method": "private/cancel-all-orders",
        //        "code": 0
        //    }
        //
        const messageHash = this.safeString(message, 'id');
        client.resolve(message, messageHash);
    }
    async watchPublic(messageHash, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const id = this.nonce();
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [messageHash],
            },
            'nonce': id,
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash);
    }
    async watchPublicMultiple(messageHashes, topics, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const id = this.nonce();
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': topics,
            },
            'nonce': id,
        };
        const message = this.deepExtend(request, params);
        return await this.watchMultiple(url, messageHashes, message, messageHashes);
    }
    async unWatchPublicMultiple(topic, symbols, messageHashes, subMessageHashes, topics, params = {}, subExtend = {}) {
        const url = this.urls['api']['ws']['public'];
        const id = this.nonce();
        const request = {
            'method': 'unsubscribe',
            'params': {
                'channels': topics,
            },
            'nonce': id,
            'id': id.toString(),
        };
        const subscription = {
            'id': id.toString(),
            'topic': topic,
            'symbols': symbols,
            'subMessageHashes': subMessageHashes,
            'messageHashes': messageHashes,
        };
        const message = this.deepExtend(request, params);
        return await this.watchMultiple(url, messageHashes, message, messageHashes, this.extend(subscription, subExtend));
    }
    async watchPrivateRequest(nonce, params = {}) {
        await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const request = {
            'id': nonce,
            'nonce': nonce,
        };
        const message = this.extend(request, params);
        return await this.watch(url, nonce.toString(), message, true);
    }
    async watchPrivateSubscribe(messageHash, params = {}) {
        await this.authenticate();
        const url = this.urls['api']['ws']['private'];
        const id = this.nonce();
        const request = {
            'method': 'subscribe',
            'params': {
                'channels': [messageHash],
            },
            'nonce': id,
        };
        const message = this.extend(request, params);
        return await this.watch(url, messageHash, message, messageHash);
    }
    handleErrorMessage(client, message) {
        //
        //    {
        //        "id": 0,
        //        "code": 10004,
        //        "method": "subscribe",
        //        "message": "invalid channel {"channels":["trade.BTCUSD-PERP"]}"
        //    }
        //
        const id = this.safeString(message, 'id');
        const errorCode = this.safeString(message, 'code');
        try {
            if (errorCode && errorCode !== '0') {
                const feedback = this.id + ' ' + this.json(message);
                this.throwExactlyMatchedException(this.exceptions['exact'], errorCode, feedback);
                const messageString = this.safeValue(message, 'message');
                if (messageString !== undefined) {
                    this.throwBroadlyMatchedException(this.exceptions['broad'], messageString, feedback);
                }
                throw new errors.ExchangeError(feedback);
            }
            return false;
        }
        catch (e) {
            if (e instanceof errors.AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject(e, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
            else {
                client.reject(e, id);
            }
            return true;
        }
    }
    handleSubscribe(client, message) {
        const methods = {
            'candlestick': this.handleOHLCV,
            'ticker': this.handleTicker,
            'trade': this.handleTrades,
            'book': this.handleOrderBook,
            'book.update': this.handleOrderBook,
            'user.order': this.handleOrders,
            'user.trade': this.handleTrades,
            'user.balance': this.handleBalance,
            'user.position_balance': this.handlePositions,
        };
        const result = this.safeValue2(message, 'result', 'info');
        const channel = this.safeString(result, 'channel');
        if ((channel !== undefined) && channel.indexOf('user.trade') > -1) {
            // channel might be user.trade.BTC_USDT
            this.handleTrades(client, result);
        }
        if ((channel !== undefined) && channel.startsWith('user.order')) {
            // channel might be user.order.BTC_USDT
            this.handleOrders(client, result);
        }
        const method = this.safeValue(methods, channel);
        if (method !== undefined) {
            method.call(this, client, result);
        }
    }
    handleMessage(client, message) {
        //
        // ping
        //    {
        //        "id": 1587523073344,
        //        "method": "public/heartbeat",
        //        "code": 0
        //    }
        // auth
        //     { id: 1648132625434, method: "public/auth", code: 0 }
        // ohlcv
        //    {
        //        "code": 0,
        //        "method": "subscribe",
        //        "result": {
        //          "instrument_name": "BTC_USDT",
        //          "subscription": "candlestick.1m.BTC_USDT",
        //          "channel": "candlestick",
        //          "depth": 300,
        //          "interval": "1m",
        //          "data": [ [Object] ]
        //        }
        //      }
        // ticker
        //    {
        //        "info":{
        //           "instrument_name":"BTC_USDT",
        //           "subscription":"ticker.BTC_USDT",
        //           "channel":"ticker",
        //           "data":[ { } ]
        //
        // handle unsubscribe
        // {"id":1725448572836,"method":"unsubscribe","code":0}
        //
        if (this.handleErrorMessage(client, message)) {
            return;
        }
        const method = this.safeString(message, 'method');
        const methods = {
            '': this.handlePing,
            'public/heartbeat': this.handlePing,
            'public/auth': this.handleAuthenticate,
            'private/create-order': this.handleOrder,
            'private/cancel-order': this.handleOrder,
            'private/cancel-all-orders': this.handleCancelAllOrders,
            'private/close-position': this.handleOrder,
            'subscribe': this.handleSubscribe,
            'unsubscribe': this.handleUnsubscribe,
        };
        const callMethod = this.safeValue(methods, method);
        if (callMethod !== undefined) {
            callMethod.call(this, client, message);
        }
    }
    async authenticate(params = {}) {
        this.checkRequiredCredentials();
        const url = this.urls['api']['ws']['private'];
        const client = this.client(url);
        const messageHash = 'authenticated';
        const future = client.future(messageHash);
        const authenticated = this.safeValue(client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const method = 'public/auth';
            const nonce = this.nonce().toString();
            const auth = method + nonce + this.apiKey + nonce;
            const signature = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
            const request = {
                'id': nonce,
                'nonce': nonce,
                'method': method,
                'api_key': this.apiKey,
                'sig': signature,
            };
            const message = this.extend(request, params);
            this.watch(url, messageHash, message, messageHash);
        }
        return await future;
    }
    handlePing(client, message) {
        this.spawn(this.pong, client, message);
    }
    handleAuthenticate(client, message) {
        //
        //  { id: 1648132625434, method: "public/auth", code: 0 }
        //
        const future = this.safeValue(client.futures, 'authenticated');
        future.resolve(true);
    }
    handleUnsubscribe(client, message) {
        const id = this.safeString(message, 'id');
        const keys = Object.keys(client.subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const messageHash = keys[i];
            if (!(messageHash in client.subscriptions)) {
                continue;
                // the previous iteration can have deleted the messageHash from the subscriptions
            }
            if (messageHash.startsWith('unsubscribe')) {
                const subscription = client.subscriptions[messageHash];
                const subId = this.safeString(subscription, 'id');
                if (id !== subId) {
                    continue;
                }
                const messageHashes = this.safeList(subscription, 'messageHashes', []);
                const subMessageHashes = this.safeList(subscription, 'subMessageHashes', []);
                for (let j = 0; j < messageHashes.length; j++) {
                    const unsubHash = messageHashes[j];
                    const subHash = subMessageHashes[j];
                    this.cleanUnsubscription(client, subHash, unsubHash);
                }
                this.cleanCache(subscription);
            }
        }
    }
}

module.exports = cryptocom;
