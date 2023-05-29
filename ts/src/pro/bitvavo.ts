
//  ---------------------------------------------------------------------------

import bitvavoRest from '../bitvavo.js';
import { AuthenticationError, ArgumentsRequired } from '../base/errors.js';
import { ArrayCache, ArrayCacheByTimestamp, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import { Int } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class bitvavo extends bitvavoRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchTrades': true,
                'watchTicker': true,
                'watchOHLCV': true,
                'watchOrders': true,
                'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.bitvavo.com/v2',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'OHLCVLimit': 1000,
            },
        });
    }

    async watchPublic (name, symbol, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = name + '@' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [
                        market['id'],
                    ],
                },
            ],
        };
        const message = this.extend (request, params);
        return await this.watch (url, messageHash, message, messageHash);
    }

    async watchTicker (symbol: string, params = {}) {
        /**
         * @method
         * @name bitvavo#watchTicker
         * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        return await this.watchPublic ('ticker24h', symbol, params);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         event: 'ticker24h',
        //         data: [
        //             {
        //                 market: 'ETH-EUR',
        //                 open: '193.5',
        //                 high: '202.72',
        //                 low: '192.46',
        //                 last: '199.01',
        //                 volume: '3587.05020246',
        //                 volumeQuote: '708030.17',
        //                 bid: '199.56',
        //                 bidSize: '4.14730803',
        //                 ask: '199.57',
        //                 askSize: '6.13642074',
        //                 timestamp: 1590770885217
        //             }
        //         ]
        //     }
        //
        const event = this.safeString (message, 'event');
        const tickers = this.safeValue (message, 'data', []);
        for (let i = 0; i < tickers.length; i++) {
            const data = tickers[i];
            const marketId = this.safeString (data, 'market');
            const market = this.safeMarket (marketId, undefined, '-');
            const messageHash = event + '@' + marketId;
            const ticker = this.parseTicker (data, market);
            const symbol = ticker['symbol'];
            this.tickers[symbol] = ticker;
            client.resolve (ticker, messageHash);
        }
        return message;
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int|undefined} since timestamp in ms of the earliest trade to fetch
         * @param {int|undefined} limit the maximum amount of trades to fetch
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[object]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const trades = await this.watchPublic ('trades', symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrade (client: Client, message) {
        //
        //     {
        //         event: 'trade',
        //         timestamp: 1590779594547,
        //         market: 'ETH-EUR',
        //         id: '450c3298-f082-4461-9e2c-a0262cc7cc2e',
        //         amount: '0.05026233',
        //         price: '198.46',
        //         side: 'buy'
        //     }
        //
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const name = 'trades';
        const messageHash = name + '@' + marketId;
        const trade = this.parseTrade (message, market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
        }
        tradesArray.append (trade);
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, messageHash);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#watchOHLCV
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int|undefined} since timestamp in ms of the earliest candle to fetch
         * @param {int|undefined} limit the maximum amount of candles to fetch
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[[int]]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const name = 'candles';
        const marketId = market['id'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const messageHash = name + '@' + marketId + '_' + interval;
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': 'candles',
                    'interval': [ interval ],
                    'markets': [ marketId ],
                },
            ],
        };
        const message = this.extend (request, params);
        const ohlcv = await this.watch (url, messageHash, message, messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         event: 'candle',
        //         market: 'BTC-EUR',
        //         interval: '1m',
        //         candle: [
        //             [
        //                 1590797160000,
        //                 '8480.9',
        //                 '8480.9',
        //                 '8480.9',
        //                 '8480.9',
        //                 '0.01038628'
        //             ]
        //         ]
        //     }
        //
        const name = 'candles';
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const interval = this.safeString (message, 'interval');
        // use a reverse lookup in a static map instead
        const timeframe = this.findTimeframe (interval);
        const messageHash = name + '@' + marketId + '_' + interval;
        const candles = this.safeValue (message, 'candle');
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
        }
        for (let i = 0; i < candles.length; i++) {
            const candle = candles[i];
            const parsed = this.parseOHLCV (candle, market);
            stored.append (parsed);
        }
        client.resolve (stored, messageHash);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int|undefined} limit the maximum amount of order book entries to return
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const name = 'book';
        const messageHash = name + '@' + market['id'];
        const url = this.urls['api']['ws'];
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [
                        market['id'],
                    ],
                },
            ],
        };
        const subscription = {
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

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBookMessage (client: Client, message, orderbook) {
        //
        //     {
        //         event: 'book',
        //         market: 'BTC-EUR',
        //         nonce: 36947383,
        //         bids: [
        //             [ '8477.8', '0' ]
        //         ],
        //         asks: [
        //             [ '8550.9', '0' ]
        //         ]
        //     }
        //
        const nonce = this.safeInteger (message, 'nonce');
        if (nonce > orderbook['nonce']) {
            this.handleDeltas (orderbook['asks'], this.safeValue (message, 'asks', []));
            this.handleDeltas (orderbook['bids'], this.safeValue (message, 'bids', []));
            orderbook['nonce'] = nonce;
        }
        return orderbook;
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         event: 'book',
        //         market: 'BTC-EUR',
        //         nonce: 36729561,
        //         bids: [
        //             [ '8513.3', '0' ],
        //             [ '8518.8', '0.64236203' ],
        //             [ '8513.6', '0.32435481' ],
        //         ],
        //         asks: []
        //     }
        //
        const event = this.safeString (message, 'event');
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const messageHash = event + '@' + market['id'];
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            return;
        }
        if (orderbook['nonce'] === undefined) {
            const subscription = this.safeValue (client.subscriptions, messageHash, {});
            const watchingOrderBookSnapshot = this.safeValue (subscription, 'watchingOrderBookSnapshot');
            if (watchingOrderBookSnapshot === undefined) {
                subscription['watchingOrderBookSnapshot'] = true;
                client.subscriptions[messageHash] = subscription;
                const options = this.safeValue (this.options, 'watchOrderBookSnapshot', {});
                const delay = this.safeInteger (options, 'delay', this.rateLimit);
                // fetch the snapshot in a separate async call after a warmup delay
                this.delay (delay, this.watchOrderBookSnapshot, client, message, subscription);
            }
            orderbook.cache.push (message);
        } else {
            this.handleOrderBookMessage (client, message, orderbook);
            client.resolve (orderbook, messageHash);
        }
    }

    async watchOrderBookSnapshot (client, message, subscription) {
        const params = this.safeValue (subscription, 'params');
        const marketId = this.safeString (subscription, 'marketId');
        const name = 'getBook';
        const messageHash = name + '@' + marketId;
        const url = this.urls['api']['ws'];
        const request = {
            'action': name,
            'market': marketId,
        };
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
        return orderbook.limit ();
    }

    handleOrderBookSnapshot (client: Client, message) {
        //
        //     {
        //         action: 'getBook',
        //         response: {
        //             market: 'BTC-EUR',
        //             nonce: 36946120,
        //             bids: [
        //                 [ '8494.9', '0.24399521' ],
        //                 [ '8494.8', '0.34884085' ],
        //                 [ '8493.9', '0.14535128' ],
        //             ],
        //             asks: [
        //                 [ '8495', '0.46982463' ],
        //                 [ '8495.1', '0.12178267' ],
        //                 [ '8496.2', '0.21924143' ],
        //             ]
        //         }
        //     }
        //
        const response = this.safeValue (message, 'response');
        if (response === undefined) {
            return message;
        }
        const marketId = this.safeString (response, 'market');
        const symbol = this.safeSymbol (marketId, undefined, '-');
        const name = 'book';
        const messageHash = name + '@' + marketId;
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (response, symbol);
        snapshot['nonce'] = this.safeInteger (response, 'nonce');
        orderbook.reset (snapshot);
        // unroll the accumulated deltas
        const messages = orderbook.cache;
        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            this.handleOrderBookMessage (client, message, orderbook);
        }
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleOrderBookSubscription (client: Client, message, subscription) {
        const symbol = this.safeString (subscription, 'symbol');
        const limit = this.safeInteger (subscription, 'limit');
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
    }

    handleOrderBookSubscriptions (client: Client, message, marketIds) {
        const name = 'book';
        for (let i = 0; i < marketIds.length; i++) {
            const marketId = this.safeString (marketIds, i);
            const symbol = this.safeSymbol (marketId, undefined, '-');
            const messageHash = name + '@' + marketId;
            if (!(symbol in this.orderbooks)) {
                const subscription = this.safeValue (client.subscriptions, messageHash);
                const method = this.safeValue (subscription, 'method');
                if (method !== undefined) {
                    method.call (this, client, message, subscription);
                }
            }
        }
    }

    async watchOrders (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#watchOrders
         * @description watches information on multiple orders made by the user
         * @param {string|undefined} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchOrders requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        const name = 'account';
        const messageHash = 'order:' + symbol;
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [ marketId ],
                },
            ],
        };
        const orders = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async watchMyTrades (symbol: string = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name bitvavo#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int|undefined} since the earliest time in ms to fetch orders for
         * @param {int|undefined} limit the maximum number of  orde structures to retrieve
         * @param {object} params extra parameters specific to the bitvavo api endpoint
         * @returns {[object]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchMyTrades requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const url = this.urls['api']['ws'];
        const name = 'account';
        const messageHash = 'myTrades:' + symbol;
        const request = {
            'action': 'subscribe',
            'channels': [
                {
                    'name': name,
                    'markets': [ marketId ],
                },
            ],
        };
        const trades = await this.watch (url, messageHash, request, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleOrder (client: Client, message) {
        //
        //     {
        //         event: 'order',
        //         orderId: 'f0e5180f-9497-4d05-9dc2-7056e8a2de9b',
        //         market: 'ETH-EUR',
        //         created: 1590948500319,
        //         updated: 1590948500319,
        //         status: 'new',
        //         side: 'sell',
        //         orderType: 'limit',
        //         amount: '0.1',
        //         amountRemaining: '0.1',
        //         price: '300',
        //         onHold: '0.1',
        //         onHoldCurrency: 'ETH',
        //         selfTradePrevention: 'decrementAndCancel',
        //         visible: true,
        //         timeInForce: 'GTC',
        //         postOnly: false
        //     }
        //
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const messageHash = 'order:' + symbol;
        const order = this.parseOrder (message, market);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        client.resolve (this.orders, messageHash);
    }

    handleMyTrade (client: Client, message) {
        //
        //     {
        //         event: 'fill',
        //         timestamp: 1590964470132,
        //         market: 'ETH-EUR',
        //         orderId: '85d082e1-eda4-4209-9580-248281a29a9a',
        //         fillId: '861d2da5-aa93-475c-8d9a-dce431bd4211',
        //         side: 'sell',
        //         amount: '0.1',
        //         price: '211.46',
        //         taker: true,
        //         fee: '0.056',
        //         feeCurrency: 'EUR'
        //     }
        //
        const marketId = this.safeString (message, 'market');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const messageHash = 'myTrades:' + symbol;
        const trade = this.parseTrade (message, market);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCache (limit);
        }
        const tradesArray = this.myTrades;
        tradesArray.append (trade);
        client.resolve (tradesArray, messageHash);
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     {
        //         event: 'subscribed',
        //         subscriptions: {
        //             book: [ 'BTC-EUR' ]
        //         }
        //     }
        //
        const subscriptions = this.safeValue (message, 'subscriptions', {});
        const methods = {
            'book': this.handleOrderBookSubscriptions,
        };
        const names = Object.keys (subscriptions);
        for (let i = 0; i < names.length; i++) {
            const name = names[i];
            const method = this.safeValue (methods, name);
            if (method !== undefined) {
                const subscription = this.safeValue (subscriptions, name);
                method.call (this, client, message, subscription);
            }
        }
        return message;
    }

    authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            const timestamp = this.milliseconds ();
            const stringTimestamp = timestamp.toString ();
            const auth = stringTimestamp + 'GET/' + this.version + '/websocket';
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            const action = 'authenticate';
            const request = {
                'action': action,
                'key': this.apiKey,
                'signature': signature,
                'timestamp': timestamp,
            };
            const message = this.extend (request, params);
            future = this.watch (url, messageHash, message);
            client.subscriptions[messageHash] = future;
        }
        return future;
    }

    handleAuthenticationMessage (client: Client, message) {
        //
        //     {
        //         event: 'authenticate',
        //         authenticated: true
        //     }
        //
        const messageHash = 'authenticated';
        const authenticated = this.safeValue (message, 'authenticated', false);
        if (authenticated) {
            // we resolve the future here permanently so authentication only happens once
            client.resolve (message, messageHash);
        } else {
            const error = new AuthenticationError (this.json (message));
            client.reject (error, messageHash);
            // allows further authentication attempts
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
    }

    handleMessage (client: Client, message) {
        //
        //     {
        //         event: 'subscribed',
        //         subscriptions: {
        //             book: [ 'BTC-EUR' ]
        //         }
        //     }
        //
        //
        //     {
        //         event: 'book',
        //         market: 'BTC-EUR',
        //         nonce: 36729561,
        //         bids: [
        //             [ '8513.3', '0' ],
        //             [ '8518.8', '0.64236203' ],
        //             [ '8513.6', '0.32435481' ],
        //         ],
        //         asks: []
        //     }
        //
        //     {
        //         action: 'getBook',
        //         response: {
        //             market: 'BTC-EUR',
        //             nonce: 36946120,
        //             bids: [
        //                 [ '8494.9', '0.24399521' ],
        //                 [ '8494.8', '0.34884085' ],
        //                 [ '8493.9', '0.14535128' ],
        //             ],
        //             asks: [
        //                 [ '8495', '0.46982463' ],
        //                 [ '8495.1', '0.12178267' ],
        //                 [ '8496.2', '0.21924143' ],
        //             ]
        //         }
        //     }
        //
        //     {
        //         event: 'authenticate',
        //         authenticated: true
        //     }
        //
        const methods = {
            'subscribed': this.handleSubscriptionStatus,
            'book': this.handleOrderBook,
            'getBook': this.handleOrderBookSnapshot,
            'trade': this.handleTrade,
            'candle': this.handleOHLCV,
            'ticker24h': this.handleTicker,
            'authenticate': this.handleAuthenticationMessage,
            'order': this.handleOrder,
            'fill': this.handleMyTrade,
        };
        const event = this.safeString (message, 'event');
        let method = this.safeValue (methods, event);
        if (method === undefined) {
            const action = this.safeString (message, 'action');
            method = this.safeValue (methods, action);
            if (method === undefined) {
                return message;
            } else {
                return method.call (this, client, message);
            }
        } else {
            return method.call (this, client, message);
        }
    }
}
