// ----------------------------------------------------------------------------

import wooRest from '../woo.js';
import { ArgumentsRequired, ExchangeError, AuthenticationError } from '../base/errors.js';
import { ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCache, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances, Position, Dict, Fee, List, Bool, FundingRate, Market } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class woo extends wooRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchFundingRate': true,
                'watchFundingRates': false,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchBidsAsks': true,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchPositions': true,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'unWatchBidsAsks': true,
                'unWatchOrderBook': true,
                'unWatchOHLCV': true,
                'unWatchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://wss.woox.io/v3/public',
                        'private': 'wss://wss.woox.io/v3/private',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://wss.staging.woox.io/v3/public',
                        'private': 'wss://wss.staging.woox.io/v3/private',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
                'watchPositions': {
                    'fetchPositionsSnapshot': true, // or false
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 9000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Auth is needed.': AuthenticationError,
                    },
                },
            },
        });
    }

    requestId (url: any) {
        const options = this.safeValue (this.options, 'requestId', {});
        const previousValue = this.safeInteger (options, url, 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }

    async watchPublic (messageHash: string, topic: string, params = {}) {
        const url = this.urls['api']['ws']['public'];
        const requestId = this.requestId (url);
        const request: Dict = {
            'id': requestId.toString (),
            'cmd': 'SUBSCRIBE',
            'params': [ topic ],
        };
        const subscription: Dict = {
            'id': requestId.toString (),
        };
        return await this.watch (url, messageHash, this.extend (request, params), topic, subscription);
    }

    async watchPublicMultiple (messageHashes: string[], topics: string[], params = {}) {
        const url = this.urls['api']['ws']['public'];
        const requestId = this.requestId (url);
        const request: Dict = {
            'id': requestId.toString (),
            'cmd': 'SUBSCRIBE',
            'params': topics,
        };
        const subscription: Dict = {
            'id': requestId.toString (),
        };
        return await this.watchMultiple (url, messageHashes, this.extend (request, params), topics, subscription);
    }

    async unwatchPublic (topics: string[], cacheTopic: string, symbols: Strings = undefined, params = {}): Promise<any> {
        const url = this.urls['api']['ws']['public'];
        const requestId = this.requestId (url);
        const unsubMessageHashes = [];
        for (let i = 0; i < topics.length; i++) {
            unsubMessageHashes.push ('unsubscribe::' + topics[i]);
        }
        const message: Dict = {
            'id': requestId.toString (),
            'cmd': 'UN_SUBSCRIBE',
            'params': topics,
        };
        const subscription: Dict = {
            'id': requestId.toString (),
            'unsubscribe': true,
            'symbols': symbols,
            'topic': cacheTopic,
            'subMessageHashes': topics,
            'unsubMessageHashes': unsubMessageHashes,
        };
        const symbolsAndTimeframes = this.safeList (params, 'symbolsAndTimeframes');
        if (symbolsAndTimeframes !== undefined) {
            subscription['symbolsAndTimeframes'] = symbolsAndTimeframes;
            params = this.omit (params, 'symbolsAndTimeframes');
        }
        return await this.watchMultiple (url, unsubMessageHashes, this.extend (message, params), unsubMessageHashes, subscription);
    }

    /**
     * @method
     * @name woo#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developer.woox.io/api-reference/endpoint/websocket/Orderbook_update
     * @see https://developer.woox.io/api-reference/endpoint/websocket/ORDERBOOK10
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'orderbookupdate' (default for swap markets) or 'orderbook10' (default for spot markets, the exchange does not push orderbookupdate deltas for spot symbols)
     * @param {int} [params.depth] the depth of the incremental 'orderbookupdate' stream, one of 50, 200 or 500, default is derived from limit, or 50
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const defaultMethod = (market['spot']) ? 'orderbook10' : 'orderbookupdate';
        let method: Str = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'method', defaultMethod);
        let topic: Str = undefined;
        let depth: Str = undefined;
        if (method === 'orderbookupdate') {
            depth = this.safeString (params, 'depth');
            params = this.omit (params, 'depth');
            if (depth === undefined) {
                if ((limit === undefined) || (limit <= 50)) {
                    depth = '50';
                } else if (limit <= 200) {
                    depth = '200';
                } else {
                    depth = '500';
                }
            }
            topic = 'orderbookupdate@' + market['id'] + '@' + depth;
        } else {
            topic = 'orderbook10@' + market['id'];
        }
        const url = this.urls['api']['ws']['public'];
        const requestId = this.requestId (url);
        const request: Dict = {
            'id': requestId.toString (),
            'cmd': 'SUBSCRIBE',
            'params': [ topic ],
        };
        const subscription: Dict = {
            'id': requestId.toString (),
            'name': method,
            'topic': topic,
            'depth': depth,
            'symbol': market['symbol'],
            'limit': limit,
            'params': params,
        };
        if (method === 'orderbookupdate') {
            subscription['method'] = this.handleOrderBookSubscription;
        }
        const orderbook = await this.watch (url, topic, this.extend (request, params), topic, subscription);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name woo#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developer.woox.io/api-reference/endpoint/websocket/Unsubscribe
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'orderbookupdate' (default for swap markets) or 'orderbook10' (default for spot markets), must match the subscription
     * @param {int} [params.depth] the depth used when subscribing, one of 50, 200 or 500, when omitted the depth of the active subscription is used
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    override async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const defaultMethod = (market['spot']) ? 'orderbook10' : 'orderbookupdate';
        let method: Str = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'method', defaultMethod);
        let subHash: Str = undefined;
        if (method === 'orderbookupdate') {
            const depth = this.safeString (params, 'depth');
            params = this.omit (params, 'depth');
            if (depth !== undefined) {
                subHash = 'orderbookupdate@' + market['id'] + '@' + depth;
            } else {
                // recover the exact topic from the active subscription instead
                // of guessing, watchOrderBook stores the topic and the depth
                // that it derived from the limit argument on the subscription
                const url = this.urls['api']['ws']['public'];
                const client = this.safeValue (this.clients, url);
                if (client !== undefined) {
                    const subscriptionHashes = Object.keys (client.subscriptions);
                    for (let i = 0; i < subscriptionHashes.length; i++) {
                        const subscriptionHash = subscriptionHashes[i];
                        const subscription = this.safeDict (client.subscriptions, subscriptionHash, {});
                        const subscriptionName = this.safeString (subscription, 'name');
                        const subscriptionSymbol = this.safeString (subscription, 'symbol');
                        if ((subscriptionName === 'orderbookupdate') && (subscriptionSymbol === market['symbol'])) {
                            subHash = this.safeString (subscription, 'topic');
                        }
                    }
                }
                if (subHash === undefined) {
                    subHash = 'orderbookupdate@' + market['id'] + '@50';
                }
            }
        } else {
            subHash = 'orderbook10@' + market['id'];
        }
        return await this.unwatchPublic ([ subHash ], 'orderbook', [ market['symbol'] ], params);
    }

    handleOrderBook (client: Client, message: any) {
        //
        // orderbookupdate
        //
        //     {
        //         "topic": "orderbookupdate@SPOT_BTC_USDT@50",
        //         "ts": 1722500373999,
        //         "data": {
        //             "s": "SPOT_BTC_USDT",
        //             "prevTs": 1722500373799,
        //             "ts": 1722500373899,
        //             "bids": [
        //                 [ "0.30891", "2469.98" ]
        //             ],
        //             "asks": [
        //                 [ "0.31075", "2379.63" ]
        //             ]
        //         }
        //     }
        //
        // orderbook10
        //
        //     {
        //         "topic": "orderbook10@PERP_SOL_USDT",
        //         "ts": 1762308368653,
        //         "data": {
        //             "ts": 1762308368647,
        //             "bids": [
        //                 [ "155.31", "216.24" ]
        //             ],
        //             "asks": [
        //                 [ "155.32", "310.66" ]
        //             ],
        //             "s": "PERP_SOL_USDT"
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data');
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const topic = this.safeString (message, 'topic');
        if (topic === undefined) {
            return;
        }
        const name = this.safeString (topic.split ('@'), 0);
        if (name === 'orderbookupdate') {
            if (!(symbol in this.orderbooks)) {
                return;
            }
            const orderbook = this.orderbooks[symbol];
            const timestamp = this.safeInteger (orderbook, 'timestamp');
            if (timestamp === undefined) {
                orderbook.cache.push (message);
            } else {
                try {
                    const ts = this.safeInteger (data, 'ts');
                    if (ts === undefined) {
                        return;
                    }
                    if (ts > timestamp) {
                        this.handleOrderBookMessage (client, message, orderbook);
                        client.resolve (orderbook, topic);
                    }
                } catch (e) {
                    delete this.orderbooks[symbol];
                    delete client.subscriptions[topic];
                    client.reject (e, topic);
                }
            }
        } else {
            if (!(symbol in this.orderbooks)) {
                const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
                const subscription = this.safeValue (client.subscriptions, topic);
                const limit = this.safeInteger (subscription, 'limit', defaultLimit);
                this.orderbooks[symbol] = this.orderBook ({}, limit);
            }
            const orderbook = this.orderbooks[symbol];
            const timestamp = this.safeInteger (data, 'ts');
            const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
            orderbook.reset (snapshot);
            client.resolve (orderbook, topic);
        }
    }

    handleOrderBookSubscription (client: Client, message: any, subscription: any) {
        const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
        const limit = this.safeInteger (subscription, 'limit', defaultLimit);
        const symbol = this.safeString (subscription, 'symbol'); // watchOrderBook
        if (symbol === undefined) {
            return;
        }
        if (symbol in this.orderbooks) {
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({}, limit);
        this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
    }

    async fetchOrderBookSnapshot (client: Client, message: any, subscription: any) {
        const symbol = this.safeString (subscription, 'symbol');
        // the v3 subscribe confirmation does not carry the topic, take it from the subscription
        const messageHash = this.safeString (subscription, 'topic');
        try {
            const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            const params = this.safeDict (subscription, 'params');
            const snapshot = await this.fetchRestOrderBookSafe (symbol, limit, params);
            if (this.safeValue (this.orderbooks, symbol) === undefined) {
                // if the orderbook is dropped before the snapshot is received
                return;
            }
            const orderbook = this.safeValue (this.orderbooks, symbol);
            orderbook.reset (snapshot);
            const messages = orderbook.cache;
            for (let i = 0; i < messages.length; i++) {
                const messageItem = messages[i];
                const itemData = this.safeDict (messageItem, 'data');
                const ts = this.safeInteger (itemData, 'ts');
                if (ts === undefined) {
                    continue;
                }
                if (ts <= orderbook['timestamp']) {
                    continue;
                } else {
                    this.handleOrderBookMessage (client, messageItem, orderbook);
                }
            }
            if (symbol !== undefined) {
                this.orderbooks[symbol] = orderbook;
            }
            client.resolve (orderbook, messageHash);
        } catch (e) {
            if (messageHash !== undefined) {
                delete client.subscriptions[messageHash];
            }
            client.reject (e, messageHash);
        }
    }

    handleOrderBookMessage (client: Client, message: any, orderbook: any) {
        const data = this.safeDict (message, 'data');
        this.handleDeltas (orderbook['asks'], this.safeList (data, 'asks', []));
        this.handleDeltas (orderbook['bids'], this.safeList (data, 'bids', []));
        const timestamp = this.safeInteger (data, 'ts');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    override handleDelta (bookside: any, delta: any) {
        const price = this.safeFloat (delta, 0);
        const amount = this.safeFloat (delta, 1);
        bookside.store (price, amount);
    }

    override handleDeltas (bookside: any, deltas: any) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    /**
     * @method
     * @name woo#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developer.woox.io/api-reference/endpoint/websocket/TICKER
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = 'ticker@' + market['id'];
        return await this.watchPublic (topic, topic, params);
    }

    /**
     * @method
     * @name woo#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developer.woox.io/api-reference/endpoint/websocket/Unsubscribe
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async unWatchTicker (symbol: string, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const subHash = 'ticker@' + market['id'];
        return await this.unwatchPublic ([ subHash ], 'ticker', [ market['symbol'] ], params);
    }

    parseWsTicker (ticker: Dict, market: Market = undefined) {
        //
        //     {
        //         "s": "SPOT_WOO_USDT",
        //         "o": "0.16112",
        //         "c": "0.32206",
        //         "h": "0.33000",
        //         "l": "0.14251",
        //         "v": "89040821.98",
        //         "a": "22493062.21",
        //         "q": "89040821.98",
        //         "u": "22493062.21",
        //         "cnt": 15442,
        //         "ts": 1614152260000,
        //         "tts": 1614152250000
        //     }
        //
        const timestamp = this.safeInteger (ticker, 'ts');
        return this.safeTicker ({
            'symbol': this.safeSymbol (this.safeString (ticker, 's'), market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString (ticker, 'h'),
            'low': this.safeString (ticker, 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString (ticker, 'o'),
            'close': this.safeString (ticker, 'c'),
            'last': this.safeString (ticker, 'c'),
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString (ticker, 'v'),
            'quoteVolume': this.safeString (ticker, 'a'),
            'info': ticker,
        }, market);
    }

    handleTicker (client: Client, message: any) {
        //
        //     {
        //         "topic": "ticker@SPOT_WOO_USDT",
        //         "ts": 1614152270000,
        //         "data": {
        //             "s": "SPOT_WOO_USDT",
        //             "o": "0.16112",
        //             "c": "0.32206",
        //             "h": "0.33000",
        //             "l": "0.14251",
        //             "v": "89040821.98",
        //             "a": "22493062.21",
        //             "cnt": 15442,
        //             "ts": 1614152260000
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const topic = this.safeString (message, 'topic');
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        // the envelope timestamp is only a fallback, the payload carries its own
        const ticker = this.parseWsTicker (this.extend ({ 'ts': this.safeInteger (message, 'ts') }, data), market);
        this.tickers[market['symbol']] = ticker;
        client.resolve (ticker, topic);
        return message;
    }

    /**
     * @method
     * @name woo#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developer.woox.io/api-reference/endpoint/websocket/TICKER
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for, required, maximum 20 symbols per call
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols);
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchTickers() requires a symbols argument, the woox v3 websocket api does not support watching all tickers at once');
        }
        const symbolsLength = symbols.length;
        if (symbolsLength > 20) {
            throw new ArgumentsRequired (this.id + ' watchTickers() supports a maximum of 20 symbols per call');
        }
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            topics.push ('ticker@' + market['id']);
        }
        const ticker = await this.watchPublicMultiple (topics, topics, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name woo#unWatchTickers
     * @description stops watching a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://developer.woox.io/api-reference/endpoint/websocket/Unsubscribe
     * @param {string[]} symbols unified symbols of the markets to stop fetching the ticker for, required
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols);
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' unWatchTickers() requires a symbols argument');
        }
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            topics.push ('ticker@' + market['id']);
        }
        return await this.unwatchPublic (topics, 'ticker', symbols, params);
    }

    /**
     * @method
     * @name woo#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://developer.woox.io/api-reference/endpoint/websocket/BBO
     * @param {string[]} symbols unified symbols of the markets to fetch the bid ask for, required, maximum 20 symbols per call
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols);
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' watchBidsAsks() requires a symbols argument, the woox v3 websocket api does not support watching all bids and asks at once');
        }
        const symbolsLength = symbols.length;
        if (symbolsLength > 20) {
            throw new ArgumentsRequired (this.id + ' watchBidsAsks() supports a maximum of 20 symbols per call');
        }
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            topics.push ('bbo@' + market['id']);
        }
        const ticker = await this.watchPublicMultiple (topics, topics, params);
        if (this.newUpdates) {
            const result: Dict = {};
            result[ticker['symbol']] = ticker;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    /**
     * @method
     * @name woo#unWatchBidsAsks
     * @description unWatches best bid & ask for symbols
     * @see https://developer.woox.io/api-reference/endpoint/websocket/Unsubscribe
     * @param {string[]} symbols unified symbols of the markets to stop fetching the bid ask for, required
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    override async unWatchBidsAsks (symbols: Strings = undefined, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols);
        if (symbols === undefined) {
            throw new ArgumentsRequired (this.id + ' unWatchBidsAsks() requires a symbols argument');
        }
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const market = this.market (symbols[i]);
            topics.push ('bbo@' + market['id']);
        }
        return await this.unwatchPublic (topics, 'bidsasks', symbols, params);
    }

    handleBidAsk (client: Client, message: any) {
        //
        //     {
        //         "topic": "bbo@SPOT_BTC_USDT",
        //         "ts": 1618820361552,
        //         "data": {
        //             "s": "SPOT_BTC_USDT",
        //             "ap": "42598.2",
        //             "aq": "1.05",
        //             "bp": "42598.1",
        //             "bq": "2.01",
        //             "ts": 1618820361540
        //         }
        //     }
        //
        const topic = this.safeString (message, 'topic');
        const data = this.safeDict (message, 'data', {});
        // the envelope timestamp is only a fallback, the payload carries its own
        const parsedTicker = this.parseWsBidAsk (this.extend ({ 'ts': this.safeInteger (message, 'ts') }, data));
        const symbol = parsedTicker['symbol'];
        if (symbol === undefined) {
            return;
        }
        this.bidsasks[symbol] = parsedTicker;
        client.resolve (parsedTicker, topic);
    }

    parseWsBidAsk (ticker: any, market: Market = undefined) {
        const marketId = this.safeString (ticker, 's');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.safeInteger (ticker, 'ts');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': this.safeString (ticker, 'ap'),
            'askVolume': this.safeString (ticker, 'aq'),
            'bid': this.safeString (ticker, 'bp'),
            'bidVolume': this.safeString (ticker, 'bq'),
            'info': ticker,
        }, market);
    }

    /**
     * @method
     * @name woo#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developer.woox.io/api-reference/endpoint/websocket/KLINE
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const supportedTimeframes = [ '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '3d', '1w', '1M' ];
        if (!this.inArray (timeframe, supportedTimeframes)) {
            throw new ExchangeError (this.id + ' watchOHLCV timeframe argument must be 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 12h, 1d, 3d, 1w or 1M');
        }
        const market = this.market (symbol);
        const topic = 'kline@' + market['id'] + '@' + timeframe;
        const ohlcv = await this.watchPublic (topic, topic, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    /**
     * @method
     * @name woo#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developer.woox.io/api-reference/endpoint/websocket/Unsubscribe
     * @param {string} symbol unified symbol of the market
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async unWatchOHLCV (symbol: string, timeframe: string = '1m', params: Dict = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const subHash = 'kline@' + market['id'] + '@' + timeframe;
        params['symbolsAndTimeframes'] = [ [ market['symbol'], timeframe ] ];
        return await this.unwatchPublic ([ subHash ], 'ohlcv', [ market['symbol'] ], params);
    }

    handleOHLCV (client: Client, message: any) {
        //
        //     {
        //         "topic": "kline@SPOT_BTC_USDT@1m",
        //         "ts": 1618822432146,
        //         "data": {
        //             "s": "SPOT_BTC_USDT",
        //             "t": "1m",
        //             "o": "56948.97",
        //             "c": "56891.76",
        //             "h": "56948.97",
        //             "l": "56889.06",
        //             "v": "44.00947568",
        //             "a": "2504584.9",
        //             "st": 1618822380000,
        //             "et": 1618822440000,
        //             "ts": 1614152260000
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const topic = this.safeString (message, 'topic');
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const interval = this.safeString (data, 't');
        let timeframe = this.findTimeframe (interval);
        if (timeframe === undefined) {
            timeframe = interval;
        }
        const parsed = [
            this.safeInteger (data, 'st'),
            this.safeFloat (data, 'o'),
            this.safeFloat (data, 'h'),
            this.safeFloat (data, 'l'),
            this.safeFloat (data, 'c'),
            this.safeFloat (data, 'v'),
        ];
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.safeValue (this.ohlcvs, symbol), timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            if (symbol !== undefined && timeframe !== undefined) {
                this.ohlcvs[symbol][timeframe] = stored;
            }
        }
        stored.append (parsed);
        client.resolve (stored, topic);
    }

    /**
     * @method
     * @name woo#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://developer.woox.io/api-reference/endpoint/websocket/TRADE
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = 'trade@' + market['id'];
        const trades = await this.watchPublic (topic, topic, params);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    /**
     * @method
     * @name woo#unWatchTrades
     * @description unWatches information on multiple trades made in a market
     * @see https://developer.woox.io/api-reference/endpoint/websocket/Unsubscribe
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async unWatchTrades (symbol: string, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const subHash = 'trade@' + market['id'];
        return await this.unwatchPublic ([ subHash ], 'trades', [ market['symbol'] ], params);
    }

    handleTrade (client: Client, message: any) {
        //
        //     {
        //         "topic": "trade@SPOT_ADA_USDT",
        //         "ts": 1618820361552,
        //         "data": {
        //             "s": "SPOT_ADA_USDT",
        //             "px": "1.27988",
        //             "sx": "300",
        //             "sd": "BUY",
        //             "src": 0,
        //             "rpi": false,
        //             "ts": 1618820361540
        //         }
        //     }
        //
        const topic = this.safeString (message, 'topic');
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        // the envelope timestamp is only a fallback, the payload carries its own
        const trade = this.parseWsTrade (this.extend ({ 'ts': this.safeInteger (message, 'ts') }, data), market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
        }
        tradesArray.append (trade);
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, topic);
    }

    override parseWsTrade (trade: any, market: Market = undefined) {
        //
        // public trade
        //
        //     {
        //         "s": "SPOT_ADA_USDT",
        //         "px": "1.27988",
        //         "sx": "300",
        //         "sd": "BUY",
        //         "src": 0,
        //         "rpi": false,
        //         "ts": 1618820361540
        //     }
        //
        // private executionreport
        //
        //     {
        //         "mt": 0,
        //         "s": "SPOT_BTC_USDT",
        //         "cid": "0",
        //         "oid": 54774393,
        //         "t": "MARKET",
        //         "sd": "BUY",
        //         "ps": "BOTH",
        //         "sx": "0.0",
        //         "px": "0.0",
        //         "tid": 56201985,
        //         "esx": "0.00040791",
        //         "epx": "23534.06",
        //         "f": "2.1E-7",
        //         "fa": "BTC",
        //         "tesx": "0.00040791",
        //         "aepx": "23534.06",
        //         "ss": "FILLED",
        //         "rs": "",
        //         "tg": "default",
        //         "tf": "2.1E-7",
        //         "tfc": "BTC",
        //         "vsx": "0.0",
        //         "ts": 1675406261689,
        //         "ro": false,
        //         "mk": false
        //     }
        //
        const marketId = this.safeString (trade, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const price = this.safeString2 (trade, 'epx', 'px');
        const amount = this.safeString2 (trade, 'esx', 'sx');
        const cost = Precise.stringMul (price, amount);
        const side = this.safeStringLower (trade, 'sd');
        const timestamp = this.safeInteger (trade, 'ts');
        const maker = this.safeBool2 (trade, 'mk', 'im'); // algo reports spell it 'im'
        let takerOrMaker: Str = undefined;
        if (maker !== undefined) {
            takerOrMaker = (maker) ? 'maker' : 'taker';
        }
        const type = this.safeStringLower (trade, 't');
        let fee: Fee = undefined;
        const feeCost = this.safeNumber (trade, 'f');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString2 (trade, 'fa', 'tfc')),
            };
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'tid'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': this.safeString2 (trade, 'oid', 'aid'), // algo reports carry the algo order id
            'takerOrMaker': takerOrMaker,
            'type': type,
            'fee': fee,
            'info': trade,
        }, market);
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const now = this.milliseconds ();
        const expires = this.safeInteger (this.options, 'listenKeyExpires', 0);
        let listenKey = this.safeString (this.options, 'listenKey');
        if ((listenKey !== undefined) && (now < expires)) {
            return listenKey;
        }
        const request: Dict = {
            'type': 'WEBSOCKET',
        };
        const response = await this.v3PrivatePostAccountListenKey (this.extend (request, params));
        //
        //     {
        //         "success": true,
        //         "timestamp": 1754400000000,
        //         "data": {
        //             "authKey": "l2sfBIAWDzPYaLXAGSyu6EqSMSlnholsm3aYYq0P0RIJLmNPBOVBjm2vDvYPFEjA",
        //             "expiredTime": 1754486400000
        //         }
        //     }
        //
        const data = this.safeDict (response, 'data', {});
        listenKey = this.safeString (data, 'authKey');
        this.options['listenKey'] = listenKey;
        // creating a new listen key immediately expires the previous one,
        // and there is no keep-alive endpoint, so reuse this key until its
        // real expiry and only mint a new one after that or after an
        // authentication failure
        const expiredTime = this.safeInteger (data, 'expiredTime'); // in milliseconds, now + 24 hours
        if (expiredTime !== undefined) {
            this.options['listenKeyExpires'] = expiredTime - 60000; // 1 minute of safety margin
        } else {
            this.options['listenKeyExpires'] = now + 86340000; // 24 hours minus 1 minute of safety margin
        }
        return listenKey;
    }

    async watchPrivate (messageHash: any, topic: string, params = {}) {
        const listenKey = await this.authenticate ();
        const url = this.urls['api']['ws']['private'] + '?key=' + listenKey;
        const requestId = this.requestId (url);
        const request: Dict = {
            'id': requestId.toString (),
            'cmd': 'SUBSCRIBE',
            'params': [ topic ],
        };
        const subscription: Dict = {
            'id': requestId.toString (),
        };
        return await this.watch (url, messageHash, this.extend (request, params), topic, subscription);
    }

    async watchPrivateMultiple (messageHashes: any, topics: string[], params = {}) {
        const listenKey = await this.authenticate ();
        const url = this.urls['api']['ws']['private'] + '?key=' + listenKey;
        const requestId = this.requestId (url);
        const request: Dict = {
            'id': requestId.toString (),
            'cmd': 'SUBSCRIBE',
            'params': topics,
        };
        const subscription: Dict = {
            'id': requestId.toString (),
        };
        return await this.watchMultiple (url, messageHashes, this.extend (request, params), topics, subscription);
    }

    /**
     * @method
     * @name woo#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://developer.woox.io/api-reference/endpoint/websocket/private/Execution_report
     * @see https://developer.woox.io/api-reference/endpoint/websocket/private/Algo_execution_report
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const trigger = this.safeBool2 (params, 'stop', 'trigger', false);
        const topic = (trigger) ? 'algoexecutionreport' : 'executionreport';
        params = this.omit (params, [ 'stop', 'trigger' ]);
        let messageHash = topic;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        const orders = await this.watchPrivate (messageHash, topic, params);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    /**
     * @method
     * @name woo#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://developer.woox.io/api-reference/endpoint/websocket/private/Execution_report
     * @see https://developer.woox.io/api-reference/endpoint/websocket/private/Algo_execution_report
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const trigger = this.safeBool2 (params, 'stop', 'trigger', false);
        const topic = (trigger) ? 'algoexecutionreport' : 'executionreport';
        params = this.omit (params, [ 'stop', 'trigger' ]);
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        const trades = await this.watchPrivate (messageHash, topic, params);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    override parseWsOrder (order: any, market: Market = undefined) {
        //
        // executionreport
        //
        //     {
        //         "mt": 0,
        //         "s": "PERP_BTC_USDT",
        //         "cid": "0",
        //         "oid": 52952826,
        //         "t": "LIMIT",
        //         "sd": "SELL",
        //         "ps": "BOTH",
        //         "sx": "0.01",
        //         "px": "22000",
        //         "tid": 0,
        //         "esx": "0",
        //         "epx": "0",
        //         "f": "0",
        //         "fa": "USDT",
        //         "tesx": "0",
        //         "aepx": "0",
        //         "ss": "NEW",
        //         "rs": "",
        //         "tg": "default",
        //         "tf": "0",
        //         "tfc": "USDT",
        //         "vsx": "0.01",
        //         "ts": 1657515556798,
        //         "ro": false,
        //         "mk": false,
        //         "lv": 10,
        //         "m": "CROSS"
        //     }
        //
        // algoexecutionreport (single item)
        //
        //     {
        //         "s": "SPOT_BTC_USDT",
        //         "raid": 2573778,
        //         "paid": 0,
        //         "aid": 2573778,
        //         "caid": "0",
        //         "tg": "default",
        //         "at": "STOP_LOSS",
        //         "sd": "SELL",
        //         "sx": "0.00011",
        //         "trp": "98566.67",
        //         "tss": "USELESS",
        //         "px": "0",
        //         "t": "MARKET",
        //         "tpx": "0",
        //         "tt": 0,
        //         "tid": 0,
        //         "epx": "0",
        //         "esx": "0",
        //         "f": "0",
        //         "rs": "",
        //         "fa": "",
        //         "tesx": "0",
        //         "aepx": "0",
        //         "tf": "0",
        //         "ts": 1761030467426,
        //         "vsx": "0",
        //         "ro": false,
        //         "trpt": "MARKET_PRICE",
        //         "ps": "BOTH",
        //         "tfc": "",
        //         "it": false,
        //         "im": false,
        //         "ia": false,
        //         "ras": "NEW",
        //         "as": "NEW"
        //     }
        //
        const orderId = this.safeString2 (order, 'oid', 'aid');
        const marketId = this.safeString (order, 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (order, 'ts');
        const fee = {
            'cost': this.safeString (order, 'tf'),
            'currency': this.safeCurrencyCode (this.safeString2 (order, 'tfc', 'fa')),
        };
        const priceString = this.safeString (order, 'px');
        let price = this.safeNumber (order, 'px');
        const avgPrice = this.omitZero (this.safeString (order, 'aepx'));
        if (Precise.stringEq (priceString, '0') && (avgPrice !== undefined)) {
            price = this.parseNumber (avgPrice);
        }
        const amount = this.safeString (order, 'sx');
        const side = this.safeStringLower (order, 'sd');
        const type = this.safeStringLower (order, 't');
        const filled = this.safeString (order, 'tesx');
        const rawStatus = this.safeString2 (order, 'ss', 'as');
        const status = this.parseOrderStatus (rawStatus);
        const clientOrderId = this.omitZero (this.safeString2 (order, 'cid', 'caid'));
        const triggerPrice = this.safeNumber (order, 'trp');
        let postOnly: Bool = undefined;
        if (type !== undefined) {
            postOnly = (type === 'post_only');
        }
        return this.safeOrder ({
            'info': order,
            'symbol': symbol,
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': timestamp,
            'type': type,
            'timeInForce': this.parseTimeInForce (type),
            'postOnly': postOnly,
            'side': side,
            'price': price,
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'reduceOnly': this.safeBool (order, 'ro'),
            'amount': amount,
            'cost': undefined,
            'average': avgPrice,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': undefined,
        }, market);
    }

    handleOrderUpdate (client: Client, message: any) {
        //
        //     {
        //         "topic": "executionreport",
        //         "ts": 1657515556799,
        //         "data": {
        //             "mt": 0,
        //             "s": "PERP_BTC_USDT",
        //             "cid": "0",
        //             "oid": 52952826,
        //             "t": "LIMIT",
        //             "sd": "SELL",
        //             "sx": "0.01",
        //             "px": "22000",
        //             "tid": 0,
        //             "esx": "0",
        //             "epx": "0",
        //             "f": "0",
        //             "fa": "USDT",
        //             "tesx": "0",
        //             "ss": "NEW",
        //             "ts": 1657515556799,
        //             "ro": false,
        //             "mk": false
        //         }
        //     }
        //
        // algoexecutionreport pushes an array of reports in "data"
        //
        const topic = this.safeString (message, 'topic');
        const data = this.safeValue (message, 'data');
        if (Array.isArray (data)) {
            // algoexecutionreport
            for (let i = 0; i < data.length; i++) {
                const order = data[i];
                const tradeId = this.omitZero (this.safeString (order, 'tid'));
                if (tradeId !== undefined) {
                    this.handleMyTrade (client, order);
                }
                this.handleOrder (client, order, topic);
            }
        } else {
            // executionreport
            const messageType = this.safeInteger (data, 'mt', 0);
            if (messageType !== 0) {
                // 1, 2 and 3 are edit-reject, cancel-reject and cancel-all-reject notices
                return;
            }
            const tradeId = this.omitZero (this.safeString (data, 'tid'));
            if (tradeId !== undefined) {
                this.handleMyTrade (client, data);
            }
            this.handleOrder (client, data, topic);
        }
    }

    handleOrder (client: Client, message: any, topic: any) {
        const parsed = this.parseWsOrder (message);
        const symbol = this.safeString (parsed, 'symbol');
        const orderId = this.safeString (parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeDict (cachedOrders.hashmap, symbol, {});
            const order = this.safeDict (orders, orderId);
            if (order !== undefined) {
                const fee = this.safeValue (order, 'fee'); // assigned into the typed Fee field
                if (fee !== undefined) {
                    parsed['fee'] = fee;
                }
                const fees = this.safeList (order, 'fees');
                if (fees !== undefined) {
                    (parsed as Dict)['fees'] = fees;
                }
                parsed['trades'] = this.safeValue (order, 'trades'); // assigned into the typed Trade[] field
                parsed['timestamp'] = this.safeInteger (order, 'timestamp');
                parsed['datetime'] = this.safeString (order, 'datetime');
            }
            cachedOrders.append (parsed);
            client.resolve (this.orders, topic);
            const messageHashSymbol = topic + ':' + symbol;
            client.resolve (this.orders, messageHashSymbol);
        }
    }

    handleMyTrade (client: Client, message: any) {
        //
        //     {
        //         "mt": 0,
        //         "s": "SPOT_BTC_USDT",
        //         "cid": "0",
        //         "oid": 54774393,
        //         "t": "MARKET",
        //         "sd": "BUY",
        //         "sx": "0.0",
        //         "px": "0.0",
        //         "tid": 56201985,
        //         "esx": "0.00040791",
        //         "epx": "23534.06",
        //         "f": "2.1E-7",
        //         "fa": "BTC",
        //         "tesx": "0.00040791",
        //         "aepx": "23534.06",
        //         "ss": "FILLED",
        //         "tf": "2.1E-7",
        //         "tfc": "BTC",
        //         "ts": 1675406261689,
        //         "ro": false,
        //         "mk": false
        //     }
        //
        let myTrades = this.myTrades;
        if (myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trade = this.parseWsTrade (message);
        myTrades.append (trade);
        this.myTrades = myTrades;
        let messageHash = 'myTrades:' + trade['symbol'];
        client.resolve (myTrades, messageHash);
        messageHash = 'myTrades';
        client.resolve (myTrades, messageHash);
    }

    /**
     * @method
     * @name woo#watchPositions
     * @description watch all open positions
     * @see https://developer.woox.io/api-reference/endpoint/websocket/private/Position
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch
     * @param {int} [limit] the maximum number of positions to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const messageHashes: string[] = [];
        symbols = this.marketSymbols (symbols);
        if ((symbols !== undefined) && !this.isEmpty (symbols)) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push ('positions::' + symbol);
            }
        } else {
            messageHashes.push ('positions');
        }
        const listenKey = await this.authenticate ();
        const url = this.urls['api']['ws']['private'] + '?key=' + listenKey;
        const client = this.client (url);
        this.setPositionsCache (client, symbols);
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption ('watchPositions', 'awaitPositionsSnapshot', true);
        if (fetchPositionsSnapshot && awaitPositionsSnapshot && this.positions === undefined) {
            const snapshot = await client.future ('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit (snapshot, symbols, since, limit, true);
        }
        const topics = [ 'position' ];
        const newPositions = await this.watchPrivateMultiple (messageHashes, topics, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit, true);
    }

    setPositionsCache (client: Client, symbols: Strings = undefined) {
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', false);
        if (fetchPositionsSnapshot) {
            const messageHash = 'fetchPositionsSnapshot';
            if (!(messageHash in client.futures)) {
                client.future (messageHash);
                this.spawn (this.loadPositionsSnapshot, client, messageHash);
            }
        } else {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
    }

    async loadPositionsSnapshot (client: Client, messageHash: any) {
        const positions = await this.fetchPositions ();
        this.positions = new ArrayCacheBySymbolBySide ();
        const cache = this.positions;
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const contracts = this.safeNumber (position, 'contracts', 0);
            if ((contracts !== undefined) && (contracts > 0)) {
                cache.append (position);
            }
        }
        // don't remove the future from the .futures cache
        if (messageHash in client.futures) {
            const future = client.futures[messageHash];
            future.resolve (cache);
            client.resolve (cache, 'positions');
        }
    }

    parseWsPosition (position: Dict, market: Market = undefined) {
        //
        //     {
        //         "s": "PERP_BTC_USDT",
        //         "h": "1",
        //         "plq": "0.0002",
        //         "psq": "0.0",
        //         "aop": "50100.0",
        //         "pnl": "-1.55902",
        //         "roi": "-0.0054",
        //         "fee": "0.218",
        //         "sp": "49000",
        //         "mp": "50000",
        //         "ot": 1677814653001,
        //         "aq": 1,
        //         "lv": 10,
        //         "m": "ISOLATED",
        //         "ps": "BOTH",
        //         "it": "USDT",
        //         "ia": "1000",
        //         "il": "10",
        //         "is": "10",
        //         "ver": 93454,
        //         "ts": 1677814653001
        //     }
        //
        const marketId = this.safeString (position, 's');
        market = this.safeMarket (marketId, market);
        let size = this.safeString (position, 'h');
        let side: Str = undefined;
        if (Precise.stringGt (size, '0')) {
            side = 'long';
        } else {
            side = 'short';
        }
        const markPrice = this.safeString (position, 'mp');
        const entryPrice = this.safeString (position, 'aop');
        const priceDifference = Precise.stringSub (markPrice, entryPrice);
        const unrealisedPnl = Precise.stringMul (priceDifference, size);
        size = Precise.stringAbs (size);
        const notional = Precise.stringMul (size, markPrice);
        const timestamp = this.safeInteger (position, 'ts');
        const positionSide = this.safeString (position, 'ps'); // 'SHORT' or 'LONG' for hedged, 'BOTH' for non-hedged
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastUpdateTimestamp': undefined,
            'initialMargin': undefined,
            'initialMarginPercentage': undefined,
            'maintenanceMargin': undefined,
            'maintenanceMarginPercentage': undefined,
            'entryPrice': this.parseNumber (entryPrice),
            'notional': this.parseNumber (notional),
            'leverage': this.safeNumber (position, 'lv'),
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'contracts': this.parseNumber (size),
            'contractSize': this.safeNumber (market, 'contractSize'),
            'marginRatio': undefined,
            'liquidationPrice': undefined,
            'markPrice': this.parseNumber (markPrice),
            'lastPrice': undefined,
            'collateral': undefined,
            'marginMode': this.safeStringLower (position, 'm'),
            'side': side,
            'percentage': undefined,
            'hedged': positionSide !== 'BOTH',
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    handlePositions (client: any, message: any) {
        //
        //     {
        //         "topic": "position",
        //         "ts": 1677814655101,
        //         "data": {
        //             "positions": [
        //                 {
        //                     "s": "PERP_BTC_USDT",
        //                     "h": "1",
        //                     "plq": "0.0002",
        //                     "psq": "0.0",
        //                     "aop": "50100.0",
        //                     "pnl": "-1.55902",
        //                     "mp": "50000",
        //                     "ot": 1677814653001,
        //                     "aq": 1,
        //                     "lv": 10,
        //                     "m": "ISOLATED",
        //                     "ps": "BOTH",
        //                     "ver": 93454,
        //                     "ts": 1677814653001
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const rawPositions = this.safeList (data, 'positions', []);
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const cache = this.positions;
        const newPositions: List = [];
        for (let i = 0; i < rawPositions.length; i++) {
            const rawPosition = rawPositions[i];
            const position = this.parseWsPosition (rawPosition);
            newPositions.push (position);
            cache.append (position);
            const messageHash = 'positions::' + position['symbol'];
            client.resolve (position, messageHash);
        }
        client.resolve (newPositions, 'positions');
    }

    /**
     * @method
     * @name woo#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developer.woox.io/api-reference/endpoint/websocket/private/Balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    override async watchBalance (params = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const topic = 'balance';
        return await this.watchPrivate (topic, topic, params);
    }

    handleBalance (client: any, message: any) {
        //
        //     {
        //         "topic": "balance",
        //         "ts": 1695716888789,
        //         "data": {
        //             "balances": [
        //                 {
        //                     "t": "USDT",
        //                     "h": "266.56059176",
        //                     "f": "0",
        //                     "i": "0",
        //                     "psq": "0",
        //                     "plq": "0",
        //                     "s": "0",
        //                     "u": "0",
        //                     "v": "0",
        //                     "aop": "0",
        //                     "pnl": "0",
        //                     "fee": "0",
        //                     "mp": "1",
        //                     "ver": 37,
        //                     "ts": 1695716888789
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const balances = this.safeList (data, 'balances', []);
        const ts = this.safeInteger (message, 'ts');
        this.balance['info'] = data;
        this.balance['timestamp'] = ts;
        this.balance['datetime'] = this.iso8601 (ts);
        for (let i = 0; i < balances.length; i++) {
            const balance = balances[i];
            const code = this.safeCurrencyCode (this.safeString (balance, 't'));
            let account = this.account ();
            if ((code !== undefined) && (code in this.balance)) {
                account = this.balance[code];
            }
            const total = this.safeString (balance, 'h');
            const used = this.safeString (balance, 'f');
            account['total'] = total;
            account['used'] = used;
            account['free'] = Precise.stringSub (total, used);
            if (code !== undefined) {
                this.balance[code] = account;
            }
        }
        this.balance = this.safeBalance (this.balance);
        client.resolve (this.balance, 'balance');
    }

    /**
     * @method
     * @name woo#watchFundingRate
     * @description watch the current funding rate
     * @see https://developer.woox.io/api-reference/endpoint/websocket/FUNDING_RATE
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    override async watchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = 'estfundingrate@' + market['id'];
        return await this.watchPublic (topic, topic, params);
    }

    parseWsFundingRate (fundingRate: any, market: Market = undefined): FundingRate {
        //
        //     {
        //         "s": "PERP_BTC_USDT",
        //         "r": "0.0001",
        //         "ft": 1618820360000,
        //         "ts": 1618820200000
        //     }
        //
        const marketId = this.safeString (fundingRate, 's');
        market = this.safeMarket (marketId, market);
        const nextFundingTimestamp = this.safeInteger (fundingRate, 'ft');
        const timestamp = this.safeInteger (fundingRate, 'ts');
        return {
            'info': fundingRate,
            'symbol': market['symbol'],
            'markPrice': undefined,
            'indexPrice': undefined,
            'interestRate': this.parseNumber ('0'),
            'estimatedSettlePrice': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'fundingRate': this.safeNumber (fundingRate, 'r'),
            'fundingTimestamp': nextFundingTimestamp,
            'fundingDatetime': this.iso8601 (nextFundingTimestamp),
            'nextFundingRate': undefined,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
            'interval': undefined,
        } as FundingRate;
    }

    handleFundingRate (client: Client, message: any) {
        //
        //     {
        //         "topic": "estfundingrate@PERP_BTC_USDT",
        //         "ts": 1618820361552,
        //         "data": {
        //             "s": "PERP_BTC_USDT",
        //             "r": "0.0001",
        //             "ft": 1618820360000,
        //             "ts": 1618820200000
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const fundingRate = this.parseWsFundingRate (data);
        const symbol = fundingRate['symbol'];
        if (symbol !== undefined) {
            this.fundingRates[symbol] = fundingRate;
        }
        const messageHash = this.safeString (message, 'topic');
        client.resolve (fundingRate, messageHash);
    }

    handleErrorMessage (client: Client, message: any): Bool {
        //
        //     {
        //         "id": "1",
        //         "cmd": "SUBSCRIBE",
        //         "success": false,
        //         "time": 1710780997216,
        //         "message": "Auth is needed."
        //     }
        //
        if (!('success' in message)) {
            return false;
        }
        const success = this.safeBool (message, 'success');
        if (success) {
            return false;
        }
        const errorMessage = this.safeString2 (message, 'message', 'errorMsg');
        try {
            const feedback = this.id + ' ' + this.json (message);
            if (errorMessage !== undefined) {
                this.throwExactlyMatchedException (this.exceptions['ws']['exact'], errorMessage, feedback);
            }
            throw new ExchangeError (feedback);
        } catch (error) {
            if (error instanceof AuthenticationError) {
                // the cached listen key is dead or expired, drop it so that
                // the next watchPrivate call mints a fresh one
                this.options['listenKey'] = undefined;
                this.options['listenKeyExpires'] = 0;
            }
            client.reject (error);
            return true;
        }
    }

    handleUnSubscription (client: Client, message: any) {
        //
        //     {
        //         "id": "2",
        //         "cmd": "UN_SUBSCRIBE",
        //         "success": true,
        //         "time": 1759568478343,
        //         "data": [ "orderbook10@SPOT_BTC_USDT" ]
        //     }
        //
        const topics = this.safeList (message, 'data', []);
        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            const unsubHash = 'unsubscribe::' + topic;
            const subscription = this.safeDict (client.subscriptions, unsubHash);
            if (subscription === undefined) {
                continue;
            }
            const subMessageHashes = this.safeList (subscription, 'subMessageHashes', []);
            const unsubMessageHashes = this.safeList (subscription, 'unsubMessageHashes', []);
            for (let j = 0; j < unsubMessageHashes.length; j++) {
                if (unsubMessageHashes[j] === unsubHash) {
                    this.cleanUnsubscription (client, subMessageHashes[j], unsubHash);
                }
            }
            this.cleanCache (subscription);
        }
    }

    override handleMessage (client: Client, message: any) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const cmd = this.safeString (message, 'cmd');
        if (cmd !== undefined) {
            if (cmd === 'PING') {
                this.handlePing (client, message);
            } else if (cmd === 'PONG') {
                this.handlePong (client, message);
            } else if (cmd === 'SUBSCRIBE') {
                this.handleSubscribe (client, message);
            } else if (cmd === 'UN_SUBSCRIBE') {
                this.handleUnSubscription (client, message);
            }
            return;
        }
        const topic = this.safeString (message, 'topic');
        if (topic !== undefined) {
            const methods: Dict = {
                'ticker': this.handleTicker,
                'orderbook10': this.handleOrderBook,
                'orderbookupdate': this.handleOrderBook,
                'kline': this.handleOHLCV,
                'trade': this.handleTrade,
                'bbo': this.handleBidAsk,
                'estfundingrate': this.handleFundingRate,
                'executionreport': this.handleOrderUpdate,
                'algoexecutionreport': this.handleOrderUpdate,
                'balance': this.handleBalance,
                'position': this.handlePositions,
            };
            const name = this.safeString (topic.split ('@'), 0);
            const method = this.safeValue (methods, name);
            if (method !== undefined) {
                method.call (this, client, message);
            }
        }
    }

    override ping (client: Client) {
        return { 'cmd': 'PING', 'ts': this.milliseconds () };
    }

    async pong (client: Client, message: any) {
        //
        //     { "cmd": "PING", "ts": 1750641291182 }
        //
        await client.send ({ 'cmd': 'PONG', 'ts': this.milliseconds () });
    }

    handlePing (client: Client, message: any) {
        this.spawn (this.pong, client, message);
    }

    handlePong (client: Client, message: any) {
        //
        //     { "cmd": "PONG", "success": true, "time": 1750641291322 }
        //
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleSubscribe (client: Client, message: any) {
        //
        //     {
        //         "id": "666888",
        //         "cmd": "SUBSCRIBE",
        //         "success": true,
        //         "time": 1657117712212,
        //         "data": [ "orderbookupdate@SPOT_BTC_USDT@50" ]
        //     }
        //
        const id = this.safeString (message, 'id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeValue (subscriptionsById, id, {});
        const method = this.safeValue (subscription, 'method');
        if (method !== undefined) {
            method.call (this, client, message, subscription);
        }
        return message;
    }
}
