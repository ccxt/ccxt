// ----------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import wooRest from '../woo.js';
import { ExchangeError, AuthenticationError, ArgumentsRequired, BadRequest } from '../base/errors.js';
import { ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCache, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances, Position, Dict, NullableDict, List, Bool, FundingRate, Market } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class woo extends wooRest {
    describe (): any {
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
                'unWatchOrderBook': true,
                'unWatchOHLCV': true,
                'unWatchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://wss.woox.io/ws/stream',
                        'private': 'wss://wss.woox.io/v2/ws/private/stream',
                        'publicV3': 'wss://wss.woox.io/v3/public',
                        'privateV3': 'wss://wss.woox.io/v3/private',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://wss.staging.woox.io/ws/stream',
                        'private': 'wss://wss.staging.woox.io/v2/ws/private/stream',
                        'publicV3': 'wss://wss.staging.woox.io/v3/public',
                        'privateV3': 'wss://wss.staging.woox.io/v3/private',
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
                'watchOrderBook': {
                    'snapshotDelay': 10,
                    'snapshotMaxRetries': 20,
                },
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

    requestId (url) {
        const options = this.safeValue (this.options, 'requestId', {});
        const previousValue = this.safeInteger (options, url, 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }

    async watchPublic (messageHash, message) {
        const urlUid = (this.uid) ? '/' + this.uid : '';
        const url = this.urls['api']['ws']['public'] + urlUid;
        const requestId = this.requestId (url);
        const subscribe: Dict = {
            'id': requestId,
        };
        const request = this.extend (subscribe, message);
        return await this.watch (url, messageHash, request, messageHash, subscribe);
    }

    async subscribePublicV3 (messageHash: string, topic: string, params = {}, subscription = {}) {
        const url = this.urls['api']['ws']['publicV3'];
        const requestId = this.requestId (url);
        const request: Dict = {
            'id': requestId,
            'cmd': 'SUBSCRIBE',
            'params': [ topic ],
        };
        const subscriptionRequest: Dict = this.extend ({
            'id': requestId.toString (),
            'version': 'v3',
            'topic': topic,
        }, subscription);
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscriptionRequest);
    }

    async subscribePublicMultipleV3 (messageHashes: string[], topics: string[], params = {}, subscription = {}) {
        const url = this.urls['api']['ws']['publicV3'];
        const requestId = this.requestId (url);
        const request: Dict = {
            'id': requestId,
            'cmd': 'SUBSCRIBE',
            'params': topics,
        };
        const subscriptionRequest: Dict = this.extend ({
            'id': requestId.toString (),
            'version': 'v3',
            'topics': topics,
        }, subscription);
        return await this.watchMultiple (url, messageHashes, this.extend (request, params), messageHashes, subscriptionRequest);
    }

    async unwatchPublic (subHash: string, symbol: string, topic: string, params = {}): Promise<any> {
        const urlUid = (this.uid) ? '/' + this.uid : '';
        const url = this.urls['api']['ws']['public'] + urlUid;
        const requestId = this.requestId (url);
        const unsubHash = 'unsubscribe::' + subHash;
        const message: Dict = {
            'id': requestId,
            'event': 'unsubscribe',
            'topic': subHash,
        };
        const subscription: Dict = {
            'id': requestId.toString (),
            'unsubscribe': true,
            'symbols': [ symbol ],
            'topic': topic,
            'subMessageHashes': [ subHash ],
            'unsubMessageHashes': [ unsubHash ],
        };
        const symbolsAndTimeframes = this.safeList (params, 'symbolsAndTimeframes');
        if (symbolsAndTimeframes !== undefined) {
            subscription['symbolsAndTimeframes'] = symbolsAndTimeframes;
            params = this.omit (params, 'symbolsAndTimeframes');
        }
        return await this.watch (url, unsubHash, this.extend (message, params), unsubHash, subscription);
    }

    async unwatchPublicV3 (subHash: string, symbol: string, topic: string, params = {}): Promise<Bool> {
        const url = this.urls['api']['ws']['publicV3'];
        const requestId = this.requestId (url);
        const unsubHash = 'unsubscribe::' + subHash;
        const message: Dict = {
            'id': requestId,
            'cmd': 'UN_SUBSCRIBE',
            'params': [ subHash ],
        };
        const subscription: Dict = {
            'id': requestId.toString (),
            'version': 'v3',
            'unsubscribe': true,
            'symbols': [ symbol ],
            'topic': topic,
            'subMessageHashes': [ subHash ],
            'unsubMessageHashes': [ unsubHash ],
        };
        const symbolsAndTimeframes = this.safeList (params, 'symbolsAndTimeframes');
        if (symbolsAndTimeframes !== undefined) {
            subscription['symbolsAndTimeframes'] = symbolsAndTimeframes;
            params = this.omit (params, 'symbolsAndTimeframes');
        }
        return await this.watch (url, unsubHash, this.extend (message, params), unsubHash, subscription);
    }

    async unwatchPublicMultipleV3 (subHashes: string[], symbols: string[], topic: string, params = {}): Promise<Bool> {
        const subHashesLength = subHashes.length;
        const url = this.urls['api']['ws']['publicV3'];
        const requestId = this.requestId (url);
        const unsubMessageHashes: string[] = [];
        for (let i = 0; i < subHashesLength; i++) {
            unsubMessageHashes.push ('unsubscribe::' + subHashes[i]);
        }
        const message: Dict = {
            'id': requestId,
            'cmd': 'UN_SUBSCRIBE',
            'params': subHashes,
        };
        const subscription: Dict = {
            'id': requestId.toString (),
            'version': 'v3',
            'unsubscribe': true,
            'symbols': symbols,
            'topic': topic,
            'subMessageHashes': subHashes,
            'unsubMessageHashes': unsubMessageHashes,
        };
        return await this.watchMultiple (url, unsubMessageHashes, this.extend (message, params), unsubMessageHashes, subscription);
    }

    /**
     * @method
     * @name woo#watchOrderBook
     * @see https://developer.woox.io/api-reference/endpoint/websocket/ORDERBOOK10
     * @see https://developer.woox.io/api-reference/endpoint/websocket/Orderbook_update
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either (default) 'orderbook' for a 10 level snapshot or 'orderbookupdate' for a delta feed, default is 'orderbook'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let method: Str = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'method', 'orderbook');
        const market = this.market (symbol);
        let topic: Str = undefined;
        const subscription: Dict = {
            'name': method,
            'symbol': market['symbol'],
            'limit': limit,
            'params': params,
        };
        if (method === 'orderbookupdate') {
            let depth = 500;
            if ((limit !== undefined) && (limit <= 50)) {
                depth = 50;
            } else if ((limit !== undefined) && (limit <= 200)) {
                depth = 200;
            }
            topic = method + '@' + market['id'] + '@' + depth.toString ();
            subscription['depth'] = depth;
            subscription['method'] = this.handleOrderBookSubscription;
            subscription['snapshotLoaded'] = false;
            subscription['snapshotLoading'] = false;
            const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 10);
            subscription['snapshotRetryCacheLength'] = snapshotDelay;
            subscription['snapshotRetries'] = 0;
            const url = this.urls['api']['ws']['publicV3'];
            const client = this.client (url);
            if (!(topic in client.subscriptions)) {
                if (market['symbol'] in this.orderbooks) {
                    delete this.orderbooks[market['symbol']];
                }
                const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
                const orderbookLimit = (limit === undefined) ? defaultLimit : limit;
                this.orderbooks[market['symbol']] = this.orderBook ({}, orderbookLimit);
            }
        } else if (method === 'orderbook') {
            topic = 'orderbook10@' + market['id'];
        } else {
            throw new ExchangeError (this.id + ' watchOrderBook() does not support method ' + method);
        }
        const orderbook = await this.subscribePublicV3 (topic, topic, params, subscription);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name woo#unWatchOrderBook
     * @description stops watching information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developer.woox.io/api-reference/endpoint/websocket/ORDERBOOK10
     * @see https://developer.woox.io/api-reference/endpoint/websocket/Orderbook_update
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either (default) 'orderbook' for a 10 level snapshot or 'orderbookupdate' for a delta feed
     * @param {int} [params.limit] order book depth, used only when no active subscription can be found
     * @returns {bool} true on successful unsubscribe
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let method: Str = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'method', 'orderbook');
        const market = this.market (symbol);
        const url = this.urls['api']['ws']['publicV3'];
        const client = this.client (url);
        const subscriptionHashes = Object.keys (client.subscriptions);
        let subHash: Str = undefined;
        for (let i = 0; i < subscriptionHashes.length; i++) {
            const subscriptionHash = subscriptionHashes[i];
            const subscription = this.safeDict (client.subscriptions, subscriptionHash, {});
            const subscriptionSymbol = this.safeString (subscription, 'symbol');
            const subscriptionName = this.safeString (subscription, 'name');
            if ((subscriptionSymbol === market['symbol']) && (subscriptionName === method)) {
                subHash = subscriptionHash;
                break;
            }
        }
        if (subHash === undefined) {
            if (method === 'orderbookupdate') {
                const limit = this.safeInteger (params, 'limit');
                params = this.omit (params, 'limit');
                let depth = 500;
                if ((limit !== undefined) && (limit <= 50)) {
                    depth = 50;
                } else if ((limit !== undefined) && (limit <= 200)) {
                    depth = 200;
                }
                subHash = method + '@' + market['id'] + '@' + depth.toString ();
            } else if (method === 'orderbook') {
                subHash = 'orderbook10@' + market['id'];
            } else {
                throw new ExchangeError (this.id + ' unWatchOrderBook() does not support method ' + method);
            }
        }
        const topic = 'orderbook';
        return await this.unwatchPublicV3 (subHash, market['symbol'], topic, params);
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "topic": "orderbookupdate@PERP_BTC_USDT@50",
        //         "ts": 1722500373999,
        //         "data": {
        //             "s": "PERP_BTC_USDT",
        //             "prevTs": 1722500373799,
        //             "bids": [
        //                 [
        //                     "0.30891",
        //                     "2469.98"
        //                 ]
        //             ],
        //             "asks": [
        //                 [
        //                     "0.31075",
        //                     "2379.63"
        //                 ]
        //             ],
        //             "ts": 1722500373989
        //         }
        //     }
        //
        //     {
        //         "topic": "orderbook10@PERP_SOL_USDT",
        //         "ts": 1762308368653,
        //         "data": {
        //             "ts": 1762308368647,
        //             "bids": [
        //                 [ "154.36", "731.000" ]
        //             ],
        //             "asks": [
        //                 [ "154.44", "230.000" ]
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
        const method = this.safeString (topic.split ('@'), 0);
        if (method === 'orderbookupdate') {
            if (!(symbol in this.orderbooks)) {
                return;
            }
            const orderbook = this.orderbooks[symbol];
            const subscription = this.safeDict (client.subscriptions, topic, {});
            const snapshotLoaded = this.safeBool (subscription, 'snapshotLoaded', false);
            if (!snapshotLoaded) {
                orderbook.cache.push (message);
                const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 10);
                const cacheLength = orderbook.cache.length;
                const retryCacheLength = this.safeInteger (subscription, 'snapshotRetryCacheLength', snapshotDelay);
                const snapshotLoading = this.safeBool (subscription, 'snapshotLoading', false);
                if (!snapshotLoading && (cacheLength >= retryCacheLength)) {
                    subscription['snapshotLoading'] = true;
                    this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
                }
            } else {
                try {
                    const timestamp = this.safeInteger (orderbook, 'timestamp');
                    const ts = this.safeInteger (data, 'ts');
                    if (ts > timestamp) {
                        this.handleOrderBookMessage (client, message, orderbook);
                        client.resolve (orderbook, topic);
                    }
                } catch (e) {
                    subscription['snapshotLoaded'] = false;
                    subscription['snapshotLoading'] = false;
                    subscription['snapshotRetries'] = 0;
                    orderbook.cache.push (message);
                    const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 10);
                    subscription['snapshotRetryCacheLength'] = this.sum (orderbook.cache.length, snapshotDelay);
                }
            }
        } else {
            if (!(symbol in this.orderbooks)) {
                const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
                const subscription = client.subscriptions[topic];
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

    handleOrderBookSubscription (client: Client, message, subscription) {
        const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
        const limit = this.safeInteger (subscription, 'limit', defaultLimit);
        const symbol = this.safeString (subscription, 'symbol'); // watchOrderBook
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
        subscription['snapshotLoaded'] = false;
        subscription['snapshotLoading'] = false;
        const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 10);
        subscription['snapshotRetryCacheLength'] = snapshotDelay;
        subscription['snapshotRetries'] = 0;
    }

    async fetchOrderBookSnapshot (client, message, subscription): Promise<any> {
        const symbol = this.safeString (subscription, 'symbol');
        const messageHash = this.safeString (subscription, 'topic');
        const depth = this.safeInteger (subscription, 'depth', 500);
        let params = this.safeDict (subscription, 'params', {});
        params = this.omit (params, 'maxLevel');
        const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 10);
        const maxRetries = this.handleOption ('watchOrderBook', 'snapshotMaxRetries', 20);
        let snapshotError = undefined;
        try {
            const snapshot = await this.fetchRestOrderBookSafe (symbol, depth, params);
            if (!(symbol in this.orderbooks)) {
                // if the orderbook is dropped before the snapshot is received
                return undefined;
            }
            const orderbook = this.orderbooks[symbol];
            orderbook.reset (snapshot);
            const messages = orderbook.cache;
            let synchronized = true;
            for (let i = 0; i < messages.length; i++) {
                const messageItem = messages[i];
                const data = this.safeDict (messageItem, 'data');
                const previousTimestamp = this.safeInteger (data, 'prevTs');
                if (previousTimestamp < orderbook['timestamp']) {
                    continue;
                } else if (previousTimestamp > orderbook['timestamp']) {
                    synchronized = false;
                    snapshotError = new ExchangeError (this.id + ' order book state is behind the cache');
                    break;
                } else {
                    this.handleOrderBookMessage (client, messageItem, orderbook);
                }
            }
            if (synchronized) {
                orderbook.cache = [];
                subscription['snapshotLoaded'] = true;
                subscription['snapshotLoading'] = false;
                subscription['snapshotRetryCacheLength'] = snapshotDelay;
                subscription['snapshotRetries'] = 0;
                this.orderbooks[symbol] = orderbook;
                client.resolve (orderbook, messageHash);
                return undefined;
            }
        } catch (e) {
            snapshotError = e;
        }
        if (!(symbol in this.orderbooks)) {
            return undefined;
        }
        const retries = this.sum (this.safeInteger (subscription, 'snapshotRetries', 0), 1);
        subscription['snapshotLoading'] = false;
        subscription['snapshotRetries'] = retries;
        if (retries >= maxRetries) {
            delete this.orderbooks[symbol];
            delete client.subscriptions[messageHash];
            client.reject (snapshotError, messageHash);
        } else {
            const orderbook = this.orderbooks[symbol];
            subscription['snapshotRetryCacheLength'] = this.sum (orderbook.cache.length, snapshotDelay);
        }
        return undefined;
    }

    handleOrderBookMessage (client: Client, message, orderbook) {
        const data = this.safeDict (message, 'data');
        const previousTimestamp = this.safeInteger (data, 'prevTs');
        if (previousTimestamp !== orderbook['timestamp']) {
            throw new ExchangeError (this.id + ' order book update has an invalid sequence');
        }
        this.handleDeltas (orderbook['asks'], this.safeValue (data, 'asks', []));
        this.handleDeltas (orderbook['bids'], this.safeValue (data, 'bids', []));
        const timestamp = this.safeInteger (data, 'ts');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat2 (delta, 'price', 0);
        const amount = this.safeFloat2 (delta, 'quantity', 1);
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    /**
     * @method
     * @name woo#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const name = 'ticker';
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = market['id'] + '@' + name;
        const request: Dict = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        return await this.watchPublic (topic, message);
    }

    /**
     * @method
     * @name woo#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTicker (symbol: string, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        let method: Str = undefined;
        [ method, params ] = this.handleOptionAndParams (params, 'watchTicker', 'method', 'ticker');
        const market = this.market (symbol);
        const subHash = market['id'] + '@' + method;
        const topic = 'ticker';
        return await this.unwatchPublic (subHash, market['symbol'], topic, params);
    }

    parseWsTicker (ticker, market: Market = undefined) {
        //
        //     {
        //         "symbol": "PERP_BTC_USDT",
        //         "open": 19441.5,
        //         "close": 20147.07,
        //         "high": 20761.87,
        //         "low": 19320.54,
        //         "volume": 2481.103,
        //         "amount": 50037935.0286,
        //         "count": 3689
        //     }
        //
        const timestamp = this.safeInteger2 (ticker, 'ts', 'date');
        return this.safeTicker ({
            'symbol': this.safeSymbol (undefined, market),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': this.safeString2 (ticker, 'high', 'h'),
            'low': this.safeString2 (ticker, 'low', 'l'),
            'bid': undefined,
            'bidVolume': undefined,
            'ask': undefined,
            'askVolume': undefined,
            'vwap': undefined,
            'open': this.safeString2 (ticker, 'open', 'o'),
            'close': this.safeString2 (ticker, 'close', 'c'),
            'last': undefined,
            'previousClose': undefined,
            'change': undefined,
            'percentage': undefined,
            'average': undefined,
            'baseVolume': this.safeString2 (ticker, 'volume', 'v'),
            'quoteVolume': this.safeString2 (ticker, 'amount', 'a'),
            'info': ticker,
        }, market);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "topic": "PERP_BTC_USDT@ticker",
        //         "ts": 1657120017000,
        //         "data": {
        //             "symbol": "PERP_BTC_USDT",
        //             "open": 19441.5,
        //             "close": 20147.07,
        //             "high": 20761.87,
        //             "low": 19320.54,
        //             "volume": 2481.103,
        //             "amount": 50037935.0286,
        //             "count": 3689
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const topic = this.safeString (message, 'topic');
        const marketId = this.safeString2 (data, 'symbol', 's');
        const market = this.safeMarket (marketId);
        if (!('ts' in data)) {
            data['date'] = this.safeInteger (message, 'ts');
        }
        const ticker = this.parseWsTicker (data, market);
        ticker['symbol'] = market['symbol'];
        this.tickers[market['symbol']] = ticker;
        client.resolve (ticker, topic);
        return message;
    }

    /**
     * @method
     * @name woo#watchTickers
     * @see https://docs.woox.io/#24h-tickers
     * @see https://developer.woox.io/api-reference/endpoint/websocket/TICKER
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsDefined = (symbols !== undefined);
        symbols = this.marketSymbols (symbols);
        if (symbolsDefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 0) {
                throw new ArgumentsRequired (this.id + ' watchTickers() requires a non-empty symbols array');
            }
            if (symbolsLength > 20) {
                throw new BadRequest (this.id + ' watchTickers() accepts 20 symbols at most per V3 subscription request');
            }
            const topics: string[] = [];
            for (let i = 0; i < symbolsLength; i++) {
                const market = this.market (symbols[i]);
                topics.push ('ticker@' + market['id']);
            }
            const ticker = await this.subscribePublicMultipleV3 (topics, topics, params, {
                'symbols': symbols,
                'topic': 'ticker',
            });
            if (this.newUpdates) {
                const newTickers: Dict = {};
                newTickers[ticker['symbol']] = ticker;
                return newTickers;
            }
            return this.filterByArray (this.tickers, 'symbol', symbols);
        }
        const name = 'tickers';
        const topic = name;
        const request: Dict = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const tickers = await this.watchPublic (topic, message);
        return this.filterByArray (tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name woo#unWatchTickers
     * @see https://docs.woox.io/#24h-tickers
     * @see https://developer.woox.io/api-reference/endpoint/websocket/TICKER
     * @description stops watching a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to stop fetching the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchTickers (symbols: Strings = undefined, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const symbolsDefined = (symbols !== undefined);
        symbols = this.marketSymbols (symbols);
        if (symbolsDefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength === 0) {
                throw new ArgumentsRequired (this.id + ' unWatchTickers() requires a non-empty symbols array');
            }
            if (symbolsLength > 20) {
                throw new BadRequest (this.id + ' unWatchTickers() accepts 20 symbols at most per V3 unsubscription request');
            }
            const subHashes: string[] = [];
            for (let i = 0; i < symbolsLength; i++) {
                const market = this.market (symbols[i]);
                subHashes.push ('ticker@' + market['id']);
            }
            return await this.unwatchPublicMultipleV3 (subHashes, symbols, 'ticker', params);
        }
        const topic = 'ticker';
        const subHash = 'tickers';
        return await this.unwatchPublic (subHash, undefined, topic, params);
    }

    handleTickers (client: Client, message) {
        //
        //     {
        //         "topic":"tickers",
        //         "ts":1618820615000,
        //         "data":[
        //             {
        //                 "symbol":"SPOT_OKB_USDT",
        //                 "open":16.297,
        //                 "close":17.183,
        //                 "high":24.707,
        //                 "low":11.997,
        //                 "volume":0,
        //                 "amount":0,
        //                 "count":0
        //             },
        //             {
        //                 "symbol":"SPOT_XRP_USDT",
        //                 "open":1.3515,
        //                 "close":1.43794,
        //                 "high":1.96674,
        //                 "low":0.39264,
        //                 "volume":750127.1,
        //                 "amount":985440.5122,
        //                 "count":396
        //             },
        //         ...
        //         ]
        //     }
        //
        const topic = this.safeValue (message, 'topic');
        const data = this.safeValue (message, 'data');
        const timestamp = this.safeInteger (message, 'ts');
        const result: List = [];
        for (let i = 0; i < data.length; i++) {
            const marketId = this.safeString (data[i], 'symbol');
            const market = this.safeMarket (marketId);
            const ticker = this.parseWsTicker (this.extend (data[i], { 'date': timestamp }), market);
            this.tickers[market['symbol']] = ticker;
            result.push (ticker);
        }
        client.resolve (result, topic);
    }

    /**
     * @method
     * @name woo#watchBidsAsks
     * @see https://docs.woox.io/#bbos
     * @description watches best bid & ask for symbols
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async watchBidsAsks (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        symbols = this.marketSymbols (symbols);
        const name = 'bbos';
        const topic = name;
        const request: Dict = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const bidsasks = await this.watchPublic (topic, message);
        if (this.newUpdates) {
            return bidsasks;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    /**
     * @method
     * @name woo#unWatchBidsAsks
     * @see https://docs.woox.io/#bbos
     * @description unWatches best bid & ask for symbols
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for (not used by woo)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    async unWatchBidsAsks (symbols: Strings = undefined, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        if (symbols !== undefined) {
            throw new NotSupported (this.id + ' unWatchBidsAsks() does not support a symbols argument. Only unwatch all bidsAsks at once');
        }
        const subHash = 'bbos';
        const topic = 'bidsasks';
        return await this.unwatchPublic (subHash, undefined, topic, params);
    }

    handleBidAsk (client: Client, message) {
        //
        //     {
        //         "topic": "bbos",
        //         "ts": 1618822376000,
        //         "data": [
        //             {
        //                 "symbol": "SPOT_FIL_USDT",
        //                 "ask": 159.0318,
        //                 "askSize": 370.43,
        //                 "bid": 158.9158,
        //                 "bidSize": 16
        //             }
        //         ]
        //     }
        //
        const topic = this.safeString (message, 'topic');
        const data = this.safeList (message, 'data', []);
        const timestamp = this.safeInteger (message, 'ts');
        const result: Dict = {};
        for (let i = 0; i < data.length; i++) {
            const ticker = this.safeDict (data, i);
            ticker['ts'] = timestamp;
            const parsedTicker = this.parseWsBidAsk (ticker);
            const symbol = parsedTicker['symbol'];
            this.bidsasks[symbol] = parsedTicker;
            result[symbol] = parsedTicker;
        }
        client.resolve (result, topic);
    }

    parseWsBidAsk (ticker, market: Market = undefined) {
        const marketId = this.safeString (ticker, 'symbol');
        market = this.safeMarket (marketId, market);
        const symbol = this.safeString (market, 'symbol');
        const timestamp = this.safeInteger (ticker, 'ts');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'ask': this.safeString (ticker, 'ask'),
            'askVolume': this.safeString (ticker, 'askSize'),
            'bid': this.safeString (ticker, 'bid'),
            'bidVolume': this.safeString (ticker, 'bidSize'),
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
    async watchOHLCV (symbol: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const timeframes = [ '1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d', '3d', '1w', '1M' ];
        if (!this.inArray (timeframe, timeframes)) {
            throw new ExchangeError (this.id + ' watchOHLCV() does not support the specified interval ' + timeframe);
        }
        const market = this.market (symbol);
        const topic = 'kline@' + market['id'] + '@' + timeframe;
        const ohlcv = await this.subscribePublicV3 (topic, topic, params);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    /**
     * @method
     * @name woo#unWatchOHLCV
     * @description stops watching historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developer.woox.io/api-reference/endpoint/websocket/KLINE
     * @param {string} symbol unified symbol of the market
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {bool} true on successful unsubscribe
     */
    async unWatchOHLCV (symbol: string, timeframe: string = '1m', params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const topic = 'ohlcv';
        const subHash = 'kline@' + market['id'] + '@' + timeframe;
        params['symbolsAndTimeframes'] = [ [ market['symbol'], timeframe ] ];
        return await this.unwatchPublicV3 (subHash, market['symbol'], topic, params);
    }

    handleOHLCV (client: Client, message) {
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
        //             "ts": 1614152260000,
        //             "tts": 1614152250000
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data');
        const topic = this.safeString (message, 'topic');
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timeframe = this.safeString (data, 't');
        const parsed = [
            this.safeInteger (data, 'st'),
            this.safeFloat (data, 'o'),
            this.safeFloat (data, 'h'),
            this.safeFloat (data, 'l'),
            this.safeFloat (data, 'c'),
            this.safeFloat (data, 'v'),
        ];
        this.ohlcvs[symbol] = this.safeValue (this.ohlcvs, symbol, {});
        let stored = this.safeValue (this.ohlcvs[symbol], timeframe);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            stored = new ArrayCacheByTimestamp (limit);
            this.ohlcvs[symbol][timeframe] = stored;
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
    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = 'trade@' + market['id'];
        const trades = await this.subscribePublicV3 (topic, topic, params);
        if (this.newUpdates) {
            limit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    /**
     * @method
     * @name woo#unWatchTrades
     * @description stops watching information on multiple trades made in a market
     * @see https://developer.woox.io/api-reference/endpoint/websocket/TRADE
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {bool} true on successful unsubscribe
     */
    async unWatchTrades (symbol: string, params = {}): Promise<any> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        const topic = 'trades';
        const subHash = 'trade@' + market['id'];
        return await this.unwatchPublicV3 (subHash, market['symbol'], topic, params);
    }

    handleTrade (client: Client, message) {
        //
        //     {
        //         "topic": "trade@SPOT_BTC_USDT",
        //         "ts": 1618820361552,
        //         "data": {
        //             "s": "SPOT_BTC_USDT",
        //             "px": "42598.27",
        //             "sx": "300",
        //             "sd": "BUY",
        //             "src": 0,
        //             "rpi": false,
        //             "ts": 1618820361540
        //         }
        //     }
        //
        const topic = this.safeString (message, 'topic');
        const data = this.safeDict (message, 'data');
        const marketId = this.safeString (data, 's');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const trade = this.parseWsTrade (data, market);
        let tradesArray = this.safeValue (this.trades, symbol);
        if (tradesArray === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            tradesArray = new ArrayCache (limit);
        }
        tradesArray.append (trade);
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, topic);
    }

    parseWsTrade (trade, market: Market = undefined) {
        //
        //     {
        //         "s": "SPOT_BTC_USDT",
        //         "px": "42598.27",
        //         "sx": "300",
        //         "sd": "BUY",
        //         "src": 0,
        //         "rpi": false,
        //         "ts": 1618820361540
        //     }
        // private trade
        //    {
        //     "msgType": 0,  // execution report
        //     "symbol": "SPOT_BTC_USDT",
        //     "clientOrderId": 0,
        //     "orderId": 54774393,
        //     "type": "MARKET",
        //     "side": "BUY",
        //     "quantity": 0.0,
        //     "price": 0.0,
        //     "tradeId": 56201985,
        //     "executedPrice": 23534.06,
        //     "executedQuantity": 0.00040791,
        //     "fee": 2.1E-7,
        //     "feeAsset": "BTC",
        //     "totalExecutedQuantity": 0.00040791,
        //     "avgPrice": 23534.06,
        //     "status": "FILLED",
        //     "reason": "",
        //     "orderTag": "default",
        //     "totalFee": 2.1E-7,
        //     "feeCurrency": "BTC",
        //     "totalRebate": 0,
        //     "rebateCurrency": "USDT",
        //     "visible": 0.0,
        //     "timestamp": 1675406261689,
        //     "reduceOnly": false,
        //     "maker": false
        //   }
        //
        const marketId = this.safeString2 (trade, 'symbol', 's');
        market = this.safeMarket (marketId, market);
        const symbol = market['symbol'];
        let price = this.safeString2 (trade, 'executedPrice', 'price');
        price = this.safeString (trade, 'px', price);
        let amount = this.safeString2 (trade, 'executedQuantity', 'size');
        amount = this.safeString (trade, 'sx', amount);
        const cost = Precise.stringMul (price, amount);
        const side = this.safeStringLower2 (trade, 'side', 'sd');
        const timestamp = this.safeInteger2 (trade, 'timestamp', 'ts');
        const maker = this.safeBool (trade, 'maker');
        let takerOrMaker: Str = undefined;
        if (maker !== undefined) {
            takerOrMaker = maker ? 'maker' : 'taker';
        }
        const type = this.safeStringLower (trade, 'type');
        let fee: NullableDict = undefined;
        const feeCost = this.safeNumber (trade, 'fee');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString (trade, 'feeCurrency')),
            };
        }
        return this.safeTrade ({
            'id': this.safeString (trade, 'tradeId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'side': side,
            'price': price,
            'amount': amount,
            'cost': cost,
            'order': this.safeString (trade, 'orderId'),
            'takerOrMaker': takerOrMaker,
            'type': type,
            'fee': fee,
            'info': trade,
        }, market);
    }

    checkRequiredUid (error = true) {
        if (!this.uid) {
            if (error) {
                throw new AuthenticationError (this.id + ' requires `uid` credential (woox calls it `application_id`)');
            } else {
                return false;
            }
        }
        return true;
    }

    async authenticate (params = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws']['private'] + '/' + this.uid;
        const client = this.client (url);
        const messageHash = 'authenticated';
        const event = 'auth';
        const future = client.reusableFuture (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            const ts = this.nonce ().toString ();
            const auth = '|' + ts;
            const signature = this.hmac (this.encode (auth), this.encode (this.secret), sha256);
            const request: Dict = {
                'event': event,
                'params': {
                    'apikey': this.apiKey,
                    'sign': signature,
                    'timestamp': ts,
                },
            };
            const message = this.extend (request, params);
            this.watch (url, messageHash, message, messageHash, message);
        }
        return await future;
    }

    async watchPrivate (messageHash, message, params = {}) {
        await this.authenticate (params);
        const url = this.urls['api']['ws']['private'] + '/' + this.uid;
        const requestId = this.requestId (url);
        const subscribe: Dict = {
            'id': requestId,
        };
        const request = this.extend (subscribe, message);
        return await this.watch (url, messageHash, request, messageHash, subscribe);
    }

    async watchPrivateMultiple (messageHashes, message, params = {}) {
        await this.authenticate (params);
        const url = this.urls['api']['ws']['private'] + '/' + this.uid;
        const requestId = this.requestId (url);
        const subscribe: Dict = {
            'id': requestId,
        };
        const request = this.extend (subscribe, message);
        return await this.watchMultiple (url, messageHashes, request, messageHashes, subscribe);
    }

    /**
     * @method
     * @name woo#watchOrders
     * @see https://docs.woox.io/#executionreport
     * @see https://docs.woox.io/#algoexecutionreportv2
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const trigger = this.safeBool2 (params, 'stop', 'trigger', false);
        const topic = (trigger) ? 'algoexecutionreportv2' : 'executionreport';
        params = this.omit (params, [ 'stop', 'trigger' ]);
        let messageHash = topic;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        const request: Dict = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const orders = await this.watchPrivate (messageHash, message);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    /**
     * @method
     * @name woo#watchMyTrades
     * @see https://docs.woox.io/#executionreport
     * @see https://docs.woox.io/#algoexecutionreportv2
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const trigger = this.safeBool2 (params, 'stop', 'trigger', false);
        const topic = (trigger) ? 'algoexecutionreportv2' : 'executionreport';
        params = this.omit (params, [ 'stop', 'trigger' ]);
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash += ':' + symbol;
        }
        const request: Dict = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const trades = await this.watchPrivate (messageHash, message);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    parseWsOrder (order, market: Market = undefined) {
        //
        //     {
        //         "symbol": "PERP_BTC_USDT",
        //         "clientOrderId": 0,
        //         "orderId": 52952826,
        //         "type": "LIMIT",
        //         "side": "SELL",
        //         "quantity": 0.01,
        //         "price": 22000,
        //         "tradeId": 0,
        //         "executedPrice": 0,
        //         "executedQuantity": 0,
        //         "fee": 0,
        //         "feeAsset": "USDT",
        //         "totalExecutedQuantity": 0,
        //         "status": "NEW",
        //         "reason": '',
        //         "orderTag": "default",
        //         "totalFee": 0,
        //         "visible": 0.01,
        //         "timestamp": 1657515556798,
        //         "reduceOnly": false,
        //         "maker": false
        //     }
        //     {
        //      "symbol": "SPOT_BTC_USDT",
        //      "rootAlgoOrderId": 2573778,
        //      "parentAlgoOrderId": 0,
        //      "algoOrderId": 2573778,
        //      "clientOrderId": 0,
        //      "orderTag": "default",
        //      "algoType": "STOP_LOSS",
        //      "side": "SELL",
        //      "quantity": 0.00011,
        //      "triggerPrice": 98566.67,
        //      "triggerStatus": "USELESS",
        //      "price": 0,
        //      "type": "MARKET",
        //      "triggerTradePrice": 0,
        //      "triggerTime": 0,
        //      "tradeId": 0,
        //      "executedPrice": 0,
        //      "executedQuantity": 0,
        //      "fee": 0,
        //      "reason": "",
        //      "feeAsset": "",
        //      "totalExecutedQuantity": 0,
        //      "averageExecutedPrice": 0,
        //      "totalFee": 0,
        //      "timestamp": 1761030467426,
        //      "visibleQuantity": 0,
        //      "reduceOnly": false,
        //      "triggerPriceType": "MARKET_PRICE",
        //      "positionSide": "BOTH",
        //      "feeCurrency": "",
        //      "totalRebate": 0.0,
        //      "rebateCurrency": "",
        //      "triggered": false,
        //      "maker": false,
        //      "activated": false,
        //      "isTriggered": false,
        //      "isMaker": false,
        //      "isActivated": false,
        //      "rootAlgoStatus": "NEW",
        //      "algoStatus": "NEW"
        // }
        //
        const orderId = this.safeString2 (order, 'orderId', 'algoOrderId');
        const marketId = this.safeString (order, 'symbol');
        market = this.market (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (order, 'timestamp');
        const fee = {
            'cost': this.safeString (order, 'totalFee'),
            'currency': this.safeString (order, 'feeAsset'),
        };
        const priceString = this.safeString (order, 'price');
        let price = this.safeNumber (order, 'price');
        const avgPrice = this.safeNumber (order, 'avgPrice');
        if (Precise.stringEq (priceString, '0') && (avgPrice !== undefined)) {
            price = avgPrice;
        }
        const amount = this.safeString (order, 'quantity');
        const side = this.safeStringLower (order, 'side');
        const type = this.safeStringLower (order, 'type');
        const filled = this.safeString2 (order, 'totalExecutedQuantity', 'executed');
        const rawStatus = this.safeString2 (order, 'status', 'algoStatus');
        const status = this.parseOrderStatus (rawStatus);
        const trades = undefined;
        const clientOrderId = this.safeString (order, 'clientOrderId');
        const triggerPrice = this.safeString (order, 'triggerPrice');
        return this.safeOrder ({
            'info': order,
            'symbol': symbol,
            'id': orderId,
            'clientOrderId': clientOrderId,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': timestamp,
            'type': type,
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': price,
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'reduceOnly': this.safeBool (order, 'reduceOnly'),
            'amount': amount,
            'cost': undefined,
            'average': avgPrice,
            'filled': filled,
            'remaining': undefined,
            'status': status,
            'fee': fee,
            'trades': trades,
        });
    }

    handleOrderUpdate (client: Client, message) {
        //
        //     {
        //         "topic": "executionreport",
        //         "ts": 1657515556799,
        //         "data": {
        //             "symbol": "PERP_BTC_USDT",
        //             "clientOrderId": 0,
        //             "orderId": 52952826,
        //             "type": "LIMIT",
        //             "side": "SELL",
        //             "quantity": 0.01,
        //             "price": 22000,
        //             "tradeId": 0,
        //             "executedPrice": 0,
        //             "executedQuantity": 0,
        //             "fee": 0,
        //             "feeAsset": "USDT",
        //             "totalExecutedQuantity": 0,
        //             "status": "NEW",
        //             "reason": '',
        //             "orderTag": "default",
        //             "totalFee": 0,
        //             "visible": 0.01,
        //             "timestamp": 1657515556799,
        //             "reduceOnly": false,
        //             "maker": false
        //         }
        //     }
        //
        const topic = this.safeString (message, 'topic');
        const data = this.safeValue (message, 'data');
        if (Array.isArray (data)) {
            // algoexecutionreportv2
            for (let i = 0; i < data.length; i++) {
                const order = data[i];
                const tradeId = this.omitZero (this.safeString (data, 'tradeId'));
                if (tradeId !== undefined) {
                    this.handleMyTrade (client, order);
                }
                this.handleOrder (client, order, topic);
            }
        } else {
            // executionreport
            const tradeId = this.omitZero (this.safeString (data, 'tradeId'));
            if (tradeId !== undefined) {
                this.handleMyTrade (client, data);
            }
            this.handleOrder (client, data, topic);
        }
    }

    handleOrder (client: Client, message, topic) {
        const parsed = this.parseWsOrder (message);
        const symbol = this.safeString (parsed, 'symbol');
        const orderId = this.safeString (parsed, 'id');
        if (symbol !== undefined) {
            if (this.orders === undefined) {
                const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
                this.orders = new ArrayCacheBySymbolById (limit);
            }
            const cachedOrders = this.orders;
            const orders = this.safeValue (cachedOrders.hashmap, symbol, {});
            const order = this.safeValue (orders, orderId);
            if (order !== undefined) {
                const fee = this.safeValue (order, 'fee');
                if (fee !== undefined) {
                    parsed['fee'] = fee;
                }
                const fees = this.safeValue (order, 'fees');
                if (fees !== undefined) {
                    parsed['fees'] = fees;
                }
                parsed['trades'] = this.safeValue (order, 'trades');
                parsed['timestamp'] = this.safeInteger (order, 'timestamp');
                parsed['datetime'] = this.safeString (order, 'datetime');
            }
            cachedOrders.append (parsed);
            client.resolve (this.orders, topic);
            const messageHashSymbol = topic + ':' + symbol;
            client.resolve (this.orders, messageHashSymbol);
        }
    }

    handleMyTrade (client: Client, message) {
        //
        //    {
        //     "msgType": 0,  // execution report
        //     "symbol": "SPOT_BTC_USDT",
        //     "clientOrderId": 0,
        //     "orderId": 54774393,
        //     "type": "MARKET",
        //     "side": "BUY",
        //     "quantity": 0.0,
        //     "price": 0.0,
        //     "tradeId": 56201985,
        //     "executedPrice": 23534.06,
        //     "executedQuantity": 0.00040791,
        //     "fee": 2.1E-7,
        //     "feeAsset": "BTC",
        //     "totalExecutedQuantity": 0.00040791,
        //     "avgPrice": 23534.06,
        //     "status": "FILLED",
        //     "reason": "",
        //     "orderTag": "default",
        //     "totalFee": 2.1E-7,
        //     "feeCurrency": "BTC",
        //     "totalRebate": 0,
        //     "rebateCurrency": "USDT",
        //     "visible": 0.0,
        //     "timestamp": 1675406261689,
        //     "reduceOnly": false,
        //     "maker": false
        //   }
        //
        let myTrades = this.myTrades;
        if (myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trade = this.parseWsTrade (message);
        myTrades.append (trade);
        let messageHash = 'myTrades:' + trade['symbol'];
        client.resolve (myTrades, messageHash);
        messageHash = 'myTrades';
        client.resolve (myTrades, messageHash);
    }

    /**
     * @method
     * @name woo#watchPositions
     * @see https://docs.woox.io/#position-push
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch
     * @param {int} [limit] the maximum number of positions to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Position[]> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const messageHashes: string[] = [];
        symbols = this.marketSymbols (symbols);
        if (!this.isEmpty (symbols)) {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                messageHashes.push ('positions::' + symbol);
            }
        } else {
            messageHashes.push ('positions');
        }
        const url = this.urls['api']['ws']['private'] + '/' + this.uid;
        const client = this.client (url);
        this.setPositionsCache (client, symbols);
        const fetchPositionsSnapshot = this.handleOption ('watchPositions', 'fetchPositionsSnapshot', true);
        const awaitPositionsSnapshot = this.handleOption ('watchPositions', 'awaitPositionsSnapshot', true);
        if (fetchPositionsSnapshot && awaitPositionsSnapshot && this.positions === undefined) {
            const snapshot = await client.future ('fetchPositionsSnapshot');
            return this.filterBySymbolsSinceLimit (snapshot, symbols, since, limit, true);
        }
        const request: Dict = {
            'event': 'subscribe',
            'topic': 'position',
        };
        const newPositions = await this.watchPrivateMultiple (messageHashes, request, params);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit, true);
    }

    setPositionsCache (client: Client, type, symbols: Strings = undefined) {
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

    async loadPositionsSnapshot (client, messageHash) {
        const positions = await this.fetchPositions ();
        this.positions = new ArrayCacheBySymbolBySide ();
        const cache = this.positions;
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i];
            const contracts = this.safeNumber (position, 'contracts', 0);
            if (contracts > 0) {
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

    handlePositions (client, message) {
        //
        //    {
        //        "topic":"position",
        //        "ts":1705292345255,
        //        "data":{
        //           "positions":{
        //              "PERP_LTC_USDT":{
        //                 "holding":1,
        //                 "pendingLongQty":0,
        //                 "pendingShortQty":0,
        //                 "averageOpenPrice":71.53,
        //                 "pnl24H":0,
        //                 "fee24H":0.07153,
        //                 "settlePrice":71.53,
        //                 "markPrice":71.32098452065145,
        //                 "version":7886,
        //                 "openingTime":1705292304267,
        //                 "pnl24HPercentage":0,
        //                 "adlQuantile":1,
        //                 "positionSide":"BOTH"
        //              }
        //           }
        //        }
        //    }
        //
        const data = this.safeValue (message, 'data', {});
        const rawPositions = this.safeValue (data, 'positions', {});
        const postitionsIds = Object.keys (rawPositions);
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const cache = this.positions;
        const newPositions: List = [];
        for (let i = 0; i < postitionsIds.length; i++) {
            const marketId = postitionsIds[i];
            const market = this.safeMarket (marketId);
            const rawPosition = rawPositions[marketId];
            const position = this.parsePosition (rawPosition, market);
            newPositions.push (position);
            cache.append (position);
            const messageHash = 'positions::' + market['symbol'];
            client.resolve (position, messageHash);
        }
        client.resolve (newPositions, 'positions');
    }

    /**
     * @method
     * @see https://docs.woox.io/#balance
     * @name woo#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    async watchBalance (params = {}): Promise<Balances> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const topic = 'balance';
        const messageHash = topic;
        const request: Dict = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        return await this.watchPrivate (messageHash, message);
    }

    handleBalance (client, message) {
        //
        //   {
        //       "topic": "balance",
        //       "ts": 1695716888789,
        //       "data": {
        //          "balances": {
        //             "USDT": {
        //                "holding": 266.56059176,
        //                "frozen": 0,
        //                "interest": 0,
        //                "pendingShortQty": 0,
        //                "pendingExposure": 0,
        //                "pendingLongQty": 0,
        //                "pendingLongExposure": 0,
        //                "version": 37,
        //                "staked": 0,
        //                "unbonding": 0,
        //                "vault": 0,
        //                "averageOpenPrice": 0,
        //                "pnl24H": 0,
        //                "fee24H": 0,
        //                "markPrice": 1,
        //                "pnl24HPercentage": 0
        //             }
        //          }
        //
        //    }
        //
        const data = this.safeValue (message, 'data');
        const balances = this.safeValue (data, 'balances');
        const keys = Object.keys (balances);
        const ts = this.safeInteger (message, 'ts');
        this.balance['info'] = data;
        this.balance['timestamp'] = ts;
        this.balance['datetime'] = this.iso8601 (ts);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = balances[key];
            const code = this.safeCurrencyCode (key);
            const account = (code in this.balance) ? this.balance[code] : this.account ();
            const total = this.safeString (value, 'holding');
            const used = this.safeString (value, 'frozen');
            account['total'] = total;
            account['used'] = used;
            account['free'] = Precise.stringSub (total, used);
            this.balance[code] = account;
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
    async watchFundingRate (symbol: string, params = {}): Promise<FundingRate> {
        if (this.markets === undefined) {
            await this.loadMarkets ();
        }
        const market = this.market (symbol);
        symbol = market['symbol'];
        const topic = 'estfundingrate@' + market['id'];
        return await this.subscribePublicV3 (topic, topic, params);
    }

    handleFundingRate (client: Client, message) {
        //
        //     {
        //         "topic": "estfundingrate@PERP_BTC_USDT",
        //         "ts": 1618820361552,
        //         "data": {
        //             "s": "PERP_BTC_USDT",
        //             "r": "1.27988",
        //             "ft": 1618820360000,
        //             "ts": 1618820200000
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString2 (data, 's', 'symbol');
        const normalized: Dict = {
            'symbol': marketId,
            'fundingRate': this.safeString2 (data, 'r', 'fundingRate'),
            'fundingTs': this.safeInteger2 (data, 'ft', 'fundingTs'),
            'estFundingRateTimestamp': this.safeInteger2 (data, 'ts', 'estFundingRateTimestamp'),
        };
        const fundingRate = this.parseFundingRate (normalized);
        fundingRate['info'] = data;
        const symbol = fundingRate['symbol'];
        this.fundingRates[symbol] = fundingRate;
        const messageHash = this.safeString (message, 'topic');
        client.resolve (fundingRate, messageHash);
    }

    handleErrorMessage (client: Client, message): Bool {
        //
        // {"id":"1","event":"subscribe","success":false,"ts":1710780997216,"errorMsg":"Auth is needed."}
        //
        if (!('success' in message)) {
            return false;
        }
        const success = this.safeBool (message, 'success');
        if (success) {
            return false;
        }
        const errorMessage = this.safeString (message, 'errorMsg');
        try {
            if (errorMessage !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorMessage, feedback);
            }
            return false;
        } catch (error) {
            if (error instanceof AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject (error, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            } else {
                client.reject (error);
            }
            return true;
        }
    }

    handleUnSubscription (client: Client, message) {
        //
        // legacy
        //
        //     {
        //         "id": "2",
        //         "event": "unsubscribe",
        //         "success": true,
        //         "ts": 1759568478343,
        //         "data": "SPOT_BTC_USDT@orderbook"
        //     }
        //
        // v3
        //
        //     {
        //         "id": "1",
        //         "cmd": "UN_SUBSCRIBE",
        //         "success": true,
        //         "time": 1759568478343,
        //         "data": [ "estfundingrate@PERP_BTC_USDT" ]
        //     }
        //
        let subscribeHashes = this.safeList (message, 'data');
        if (subscribeHashes === undefined) {
            subscribeHashes = [ this.safeString (message, 'data') ];
        }
        for (let i = 0; i < subscribeHashes.length; i++) {
            const subscribeHash = subscribeHashes[i];
            const unsubscribeHash = 'unsubscribe::' + subscribeHash;
            const subscription = this.safeDict (client.subscriptions, unsubscribeHash, {});
            const subMessageHashes = this.safeList (subscription, 'subMessageHashes', []);
            const unsubMessageHashes = this.safeList (subscription, 'unsubMessageHashes', []);
            for (let j = 0; j < subMessageHashes.length; j++) {
                const subHash = subMessageHashes[j];
                const unsubHash = unsubMessageHashes[j];
                this.cleanUnsubscription (client, subHash, unsubHash);
            }
            this.cleanCache (subscription);
        }
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const methods: Dict = {
            'ping': this.handlePing,
            'pong': this.handlePong,
            'subscribe': this.handleSubscribe,
            'unsubscribe': this.handleUnSubscription,
            'un_subscribe': this.handleUnSubscription,
            'orderbook10': this.handleOrderBook,
            'orderbook': this.handleOrderBook,
            'orderbookupdate': this.handleOrderBook,
            'ticker': this.handleTicker,
            'tickers': this.handleTickers,
            'kline': this.handleOHLCV,
            'auth': this.handleAuth,
            'executionreport': this.handleOrderUpdate,
            'algoexecutionreportv2': this.handleOrderUpdate,
            'trade': this.handleTrade,
            'balance': this.handleBalance,
            'position': this.handlePositions,
            'bbos': this.handleBidAsk,
            'estfundingrate': this.handleFundingRate,
        };
        let event = this.safeString (message, 'event');
        if (event === undefined) {
            event = this.safeStringLower (message, 'cmd');
        }
        let method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
            return;
        }
        const topic = this.safeString (message, 'topic');
        if (topic !== undefined) {
            method = this.safeValue (methods, topic);
            if (method !== undefined) {
                method.call (this, client, message);
                return;
            }
            const splitTopic = topic.split ('@');
            const splitLength = splitTopic.length;
            if (splitLength >= 2) {
                const firstName = this.safeString (splitTopic, 0);
                method = this.safeValue (methods, firstName);
                if (method !== undefined) {
                    method.call (this, client, message);
                    return;
                }
                const name = this.safeString (splitTopic, 1);
                method = this.safeValue (methods, name);
                if (method !== undefined) {
                    method.call (this, client, message);
                    return;
                }
                const splitName = name.split ('_');
                const splitNameLength = splitTopic.length;
                if (splitNameLength === 2) {
                    method = this.safeValue (methods, this.safeString (splitName, 0));
                    if (method !== undefined) {
                        method.call (this, client, message);
                    }
                }
            }
        }
    }

    ping (client: Client) {
        if (client.url.indexOf ('/v3/') >= 0) {
            return {
                'cmd': 'PING',
                'ts': this.milliseconds (),
            };
        }
        return { 'event': 'ping' };
    }

    async pong (client: Client, message) {
        await client.send ({ 'event': 'pong' });
    }

    handlePing (client: Client, message) {
        this.spawn (this.pong, client, message);
    }

    handlePong (client: Client, message) {
        //
        // { event: "pong", ts: 1657117026090 }
        //
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleSubscribe (client: Client, message) {
        //
        //     {
        //         "id": "666888",
        //         "event": "subscribe",
        //         "success": true,
        //         "ts": 1657117712212
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

    handleAuth (client: Client, message) {
        //
        //     {
        //         "event": "auth",
        //         "success": true,
        //         "ts": 1657463158812
        //     }
        //
        const messageHash = 'authenticated';
        const success = this.safeValue (message, 'success');
        if (success) {
            // client.resolve (message, messageHash);
            const future = this.safeValue (client.futures, 'authenticated');
            future.resolve (true);
        } else {
            const error = new AuthenticationError (this.json (message));
            client.reject (error, messageHash);
            // allows further authentication attempts
            if (messageHash in client.subscriptions) {
                delete client.subscriptions['authenticated'];
            }
        }
    }
}
