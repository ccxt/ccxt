
//  ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import umxRest from '../umx.js';
import { AuthenticationError, BadRequest, ExchangeError } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Balances, Dict, Int, Market, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class umx extends umxRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchBidsAsks': true,
                'unWatchBidsAsks': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'unWatchOHLCV': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'unWatchOrderBook': true,
                'unWatchOrderBookForSymbols': true,
                'watchOrders': true,
                'watchPositions': true,
                'watchTicker': true,
                'watchTickers': true,
                'unWatchTicker': true,
                'unWatchTickers': true,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'unWatchTrades': true,
                'unWatchTradesForSymbols': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://stream.umx.com/ws/public/v1/market',
                        'private': 'wss://stream.umx.com/ws/private/v2/notification',
                    },
                },
            },
            'options': {
                'tradesLimit': 1000,
                'watchOrderBook': {
                    'intervals': [ '100ms', '500ms', '1000ms' ],
                    'levels': [ 5, 10, 20, 30 ],
                },
            },
            'streaming': {
                // the venue probes an idle connection with a text PING after thirty
                // seconds of silence, the client side ping keeps the line busy instead
                'keepAlive': 15000,
            },
        });
    }

    /**
     * @method
     * @name umx#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/trade-channel
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    /**
     * @method
     * @name umx#watchTradesForSymbols
     * @description watches information on multiple trades made in multiple markets
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/trade-channel
     * @param {string[]} symbols unified market symbols of the markets trades were made in
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    override async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const messageHash = 'trade::' + symbol;
            if (!this.inArray (messageHash, messageHashes)) {
                messageHashes.push (messageHash);
                topics.push (this.subscriptionTopic ('trade', symbol));
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'subscribe',
            'data': topics,
        };
        const trades = await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    /**
     * @method
     * @name umx#unWatchTrades
     * @description unsubscribes from the trades channel of a market
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/trade-channel
     * @param {string} symbol unified market symbol of the market to stop watching the trades of
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchTrades (symbol: string, params: Dict = {}): Promise<any> {
        return await this.unWatchTradesForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name umx#unWatchTradesForSymbols
     * @description unsubscribes from the trades channel of multiple markets
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/trade-channel
     * @param {string[]} symbols unified market symbols of the markets to stop watching the trades of
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchTradesForSymbols (symbols: string[], params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        const subMessageHashes = [];
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const subMessageHash = 'trade::' + symbol;
            if (!this.inArray (subMessageHash, subMessageHashes)) {
                subMessageHashes.push (subMessageHash);
                messageHashes.push ('unsubscribe::trade::' + symbol);
                topics.push (this.subscriptionTopic ('trade', symbol));
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'unsubscribe',
            'data': topics,
        };
        const subscription: Dict = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': messageHashes,
            'subMessageHashes': subMessageHashes,
            'topic': 'trades',
        };
        return await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes, subscription);
    }

    /**
     * @method
     * @name umx#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/depth-channel
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/limited-order-book-snapshot-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] leave it out for the full incremental book, or 5, 10, 20 or 30 for the snapshot flavour that pushes only the top of the book
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.interval] the push frequency, "100ms" (default), "500ms" or "1000ms"
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    /**
     * @method
     * @name umx#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/depth-channel
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/limited-order-book-snapshot-channel
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] leave it out for the full incremental book, or 5, 10, 20 or 30 for the snapshot flavour that pushes only the top of the book
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.interval] the push frequency, "100ms" (default), "500ms" or "1000ms"
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    override async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'interval', '100ms');
        const stream = this.orderBookStream (limit, interval);
        const messageHashes = [];
        const topics = [];
        const uniqueSymbols = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const messageHash = 'orderbook::' + symbol;
            if (!this.inArray (messageHash, messageHashes)) {
                messageHashes.push (messageHash);
                uniqueSymbols.push (symbol);
                const topic = this.subscriptionTopic (stream, symbol);
                if (limit !== undefined) {
                    topic['levels'] = limit;
                }
                topics.push (topic);
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'subscribe',
            'data': topics,
        };
        const subscription: Dict = {
            'symbols': uniqueSymbols,
            'limit': limit,
            'params': params,
        };
        if (limit === undefined) {
            // the incremental flavour carries no snapshot of its own, one is fetched over
            // rest as soon as the venue acknowledges the subscription, binance style
            subscription['method'] = this.handleOrderBookSubscription;
        }
        const orderbook = await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes, subscription);
        return orderbook.limit ();
    }

    /**
     * @method
     * @name umx#unWatchOrderBook
     * @description unsubscribes from the order book channel of a market
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/depth-channel
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] the levels of the snapshot flavour the subscription was opened with, leave it out for the incremental flavour
     * @param {string} [params.interval] the push frequency the subscription was opened with
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchOrderBook (symbol: string, params: Dict = {}): Promise<any> {
        return await this.unWatchOrderBookForSymbols ([ symbol ], params);
    }

    /**
     * @method
     * @name umx#unWatchOrderBookForSymbols
     * @description unsubscribes from the order book channel of multiple markets
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/depth-channel
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] the levels of the snapshot flavour the subscription was opened with, leave it out for the incremental flavour
     * @param {string} [params.interval] the push frequency the subscription was opened with
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchOrderBookForSymbols (symbols: string[], params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols, undefined, false);
        let limit: Int = undefined;
        [ limit, params ] = this.handleOptionAndParams (params, 'unWatchOrderBook', 'limit');
        let interval: Str = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchOrderBook', 'interval', '100ms');
        const stream = this.orderBookStream (limit, interval);
        const subMessageHashes = [];
        const messageHashes = [];
        const topics = [];
        const uniqueSymbols = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const subMessageHash = 'orderbook::' + symbol;
            if (!this.inArray (subMessageHash, subMessageHashes)) {
                subMessageHashes.push (subMessageHash);
                messageHashes.push ('unsubscribe::orderbook::' + symbol);
                uniqueSymbols.push (symbol);
                const topic = this.subscriptionTopic (stream, symbol);
                if (limit !== undefined) {
                    topic['levels'] = limit;
                }
                topics.push (topic);
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'unsubscribe',
            'data': topics,
        };
        const subscription: Dict = {
            'unsubscribe': true,
            'symbols': uniqueSymbols,
            'messageHashes': messageHashes,
            'subMessageHashes': subMessageHashes,
            'topic': 'orderbook',
        };
        return await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes, subscription);
    }

    /**
     * @ignore
     * @method
     * @name umx#orderBookStream
     * @description build the order book stream name from the flavour and the push interval
     * @param {int} [limit] undefined selects the incremental depth channel, a number the snapshot flavour
     * @param {string} [interval] the push frequency
     * @returns {string} the stream name
     */
    orderBookStream (limit: Int = undefined, interval: Str = undefined): string {
        const options = this.safeDict (this.options, 'watchOrderBook', {});
        const intervals = this.safeList (options, 'intervals', []);
        if (!this.inArray (interval, intervals)) {
            throw new BadRequest (this.id + ' watchOrderBook() interval must be one of ' + this.json (intervals));
        }
        if (limit === undefined) {
            return 'depth#' + interval;
        }
        const levels = this.safeList (options, 'levels', []);
        if (!this.inArray (limit, levels)) {
            throw new BadRequest (this.id + ' watchOrderBook() limit must be one of ' + this.json (levels));
        }
        return 'depthlevels#' + interval;
    }

    handleOrderBookSubscription (client: Client, message: Dict, subscription: Dict) {
        const symbol = this.safeString (subscription, 'symbol') as string;
        if (symbol in this.orderbooks) {
            // reset the book in place instead of replacing it, a consumer can hold a
            // reference to it across resubscriptions, see the kraken issue 26773 class
            const orderbook = this.orderbooks[symbol];
            orderbook.reset ({});
            orderbook.cache = [];
        } else {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        this.spawn (this.fetchOrderBookSnapshot, client, message, subscription);
    }

    async fetchOrderBookSnapshot (client: Client, message: Dict, subscription: Dict) {
        const symbol = this.safeString (subscription, 'symbol') as string;
        const messageHash = 'orderbook::' + symbol;
        try {
            const params = this.safeDict (subscription, 'params', {});
            const snapshot = await this.fetchRestOrderBookSafe (symbol, undefined, params);
            if (this.safeValue (this.orderbooks, symbol) === undefined) {
                // the orderbook was dropped before the snapshot arrived
                return;
            }
            const orderbook = this.orderbooks[symbol];
            orderbook.reset (snapshot);
            // unroll the buffered deltas onto the snapshot
            const messages = orderbook.cache;
            orderbook.cache = [];
            for (let i = 0; i < messages.length; i++) {
                this.handleOrderBookUpdate (client, messages[i], orderbook, symbol);
                const nonce = this.safeInteger (orderbook, 'nonce');
                if (nonce === undefined) {
                    // a gap was hit in the middle of the unroll, the book was reset in place
                    // and a fresh snapshot is on its way, hand the remaining deltas over to
                    // the new cycle instead of resolving an unhealed book
                    orderbook.cache = this.arrayConcat (orderbook.cache, this.arraySlice (messages, i + 1));
                    return;
                }
            }
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        } catch (e) {
            delete client.subscriptions[messageHash];
            client.reject (e, messageHash);
        }
    }

    handleOrderBookSnapshot (client: Client, message: Dict, symbol: string, timestamp: Int) {
        // every push of the depthlevels flavour is a full snapshot of the top of the book
        const data = this.safeList (message, 'data', []);
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        const orderbook = this.orderbooks[symbol];
        const dataLength = data.length;
        const row = this.safeDict (data, dataLength - 1, {});
        const snapshot = this.parseOrderBook (row, symbol, timestamp);
        snapshot['nonce'] = this.safeInteger (row, 'lastUpdateId');
        orderbook.reset (snapshot);
        client.resolve (orderbook, 'orderbook::' + symbol);
    }

    handleOrderBookUpdate (client: Client, update: Dict, orderbook: any, symbol: string) {
        //
        //     {
        //         "symbol": "ETH-USDT-PERP",
        //         "lastUpdateId": "12479869385",
        //         "preUpdateId": "12479869374",
        //         "bids": [ [ "2614.8", "0.001" ] ],
        //         "asks": [ [ "2641.4", "215.821" ], [ "2707", "0.002" ] ]
        //     }
        //
        const nonce = this.safeInteger (orderbook, 'nonce');
        if (nonce === undefined) {
            orderbook.cache.push (update);
            return;
        }
        const lastUpdateId = this.safeInteger (update, 'lastUpdateId');
        const preUpdateId = this.safeInteger (update, 'preUpdateId');
        if ((lastUpdateId === undefined) || (preUpdateId === undefined)) {
            return;
        }
        if (lastUpdateId <= nonce) {
            // the update predates the snapshot
            return;
        }
        if ((preUpdateId <= (nonce + 1)) && ((nonce + 1) <= lastUpdateId)) {
            // the venue rule, an update applies when preUpdateId <= nonce + 1 <= lastUpdateId
            this.handleDeltas (orderbook['asks'], this.safeList (update, 'asks', []));
            this.handleDeltas (orderbook['bids'], this.safeList (update, 'bids', []));
            orderbook['nonce'] = lastUpdateId;
            client.resolve (orderbook, 'orderbook::' + symbol);
        } else {
            // a gap in the sequence, the venue asks for a fresh snapshot in that case,
            // the book is reset in place to keep its identity for the held references
            orderbook.reset ({});
            orderbook.cache = [ update ];
            const resubscription: Dict = {
                'symbol': symbol,
                'params': {},
            };
            const emptyMessage: Dict = {};
            this.spawn (this.fetchOrderBookSnapshot, client, emptyMessage, resubscription);
        }
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

    handleOrderBook (client: Client, message: Dict) {
        //
        // incremental flavour, deltas only, see handleOrderBookUpdate for a row
        // snapshot flavour, a full book every push:
        //
        //     {
        //         "businessType": "linear_perpetual",
        //         "symbol": "ETH-USDT-PERP",
        //         "stream": "depthlevels#100ms#5#none",
        //         "data": [
        //             {
        //                 "symbol": "ETH-USDT-PERP",
        //                 "lastUpdateId": "12479875811",
        //                 "bids": [ [ "2641.62", "93.017" ] ],
        //                 "asks": [ [ "2641.81", "44.501" ] ],
        //                 "group": "none"
        //             }
        //         ],
        //         "ts": 1790254308446
        //     }
        //
        const stream = this.safeString (message, 'stream', '');
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (message, 'ts');
        const data = this.safeList (message, 'data', []);
        if (stream.startsWith ('depthlevels')) {
            this.handleOrderBookSnapshot (client, message, symbol, timestamp);
            return;
        }
        if (!(symbol in this.orderbooks)) {
            // the first deltas can beat the subscription acknowledgement, at that point the
            // orderbook is not initialized yet and the messages are safe to drop
            return;
        }
        const orderbook = this.orderbooks[symbol];
        for (let i = 0; i < data.length; i++) {
            const update = this.safeDict (data, i, {});
            const nonce = this.safeInteger (orderbook, 'nonce');
            if (nonce === undefined) {
                // buffer the deltas until the rest snapshot arrives
                orderbook.cache.push (update);
            } else {
                orderbook['timestamp'] = timestamp;
                orderbook['datetime'] = this.iso8601 (timestamp);
                this.handleOrderBookUpdate (client, update, orderbook, symbol);
            }
        }
    }

    /**
     * @method
     * @name umx#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a market
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/24h-ticker-channel
     * @param {string} symbol unified symbol of the market to watch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchTicker (symbol: string, params: Dict = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'ticker::' + symbol;
        const message: Dict = {
            'event': 'subscribe',
            'data': [ this.subscriptionTopic ('ticker24hr', symbol) ],
        };
        return await this.watch (url, messageHash, this.deepExtend (message, params), messageHash);
    }

    /**
     * @method
     * @name umx#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/24h-ticker-channel
     * @param {string[]} [symbols] unified symbols of the markets to watch the tickers for, every spot, perpetual and dated futures market is streamed when left out, the venue accepts no options subscription on this channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const messageHashes = [];
        const topics = [];
        if (symbols === undefined) {
            // without a symbol the venue streams every pair of an instrument type
            messageHashes.push ('tickers');
            const businessTypes = [ 'spot', 'linear_perpetual', 'linear_futures' ];
            for (let i = 0; i < businessTypes.length; i++) {
                topics.push ({
                    'stream': 'ticker24hr',
                    'businessType': businessTypes[i],
                });
            }
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const messageHash = 'ticker::' + symbol;
                if (!this.inArray (messageHash, messageHashes)) {
                    messageHashes.push (messageHash);
                    topics.push (this.subscriptionTopic ('ticker24hr', symbol));
                }
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'subscribe',
            'data': topics,
        };
        const newTicker = await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes);
        if (this.newUpdates) {
            const result: Dict = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray (this.tickers, 'symbol', symbols);
    }

    /**
     * @method
     * @name umx#unWatchTicker
     * @description unsubscribes from the ticker channel of a market
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/24h-ticker-channel
     * @param {string} symbol unified symbol of the market to stop watching the ticker of
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchTicker (symbol: string, params: Dict = {}): Promise<any> {
        return await this.unWatchTickers ([ symbol ], params);
    }

    /**
     * @method
     * @name umx#unWatchTickers
     * @description unsubscribes from the ticker channel of multiple markets
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/24h-ticker-channel
     * @param {string[]} [symbols] unified symbols of the markets to stop watching the tickers of, the all pairs subscriptions are dropped when left out
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchTickers (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const subMessageHashes = [];
        const messageHashes = [];
        const topics = [];
        if (symbols === undefined) {
            subMessageHashes.push ('tickers');
            messageHashes.push ('unsubscribe::tickers');
            const businessTypes = [ 'spot', 'linear_perpetual', 'linear_futures' ];
            for (let i = 0; i < businessTypes.length; i++) {
                topics.push ({
                    'stream': 'ticker24hr',
                    'businessType': businessTypes[i],
                });
            }
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const subMessageHash = 'ticker::' + symbol;
                if (!this.inArray (subMessageHash, subMessageHashes)) {
                    subMessageHashes.push (subMessageHash);
                    messageHashes.push ('unsubscribe::ticker::' + symbol);
                    topics.push (this.subscriptionTopic ('ticker24hr', symbol));
                }
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'unsubscribe',
            'data': topics,
        };
        const subscription: Dict = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': messageHashes,
            'subMessageHashes': subMessageHashes,
            'topic': 'ticker',
        };
        return await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes, subscription);
    }

    handleTicker (client: Client, message: Dict) {
        //
        //     {
        //         "businessType": "linear_perpetual",
        //         "symbol": "ETH-USDT-PERP",
        //         "stream": "ticker24hr",
        //         "data": [
        //             {
        //                 "count": "28518",
        //                 "fillAmount": "16162801.0027",
        //                 "fillQty": "6056.488",
        //                 "highPrice": "2722.8",
        //                 "lastPrice": "2654.44",
        //                 "lowPrice": "2627.22",
        //                 "priceChange": "-56.15",
        //                 "priceChangePercent": "-0.0207",
        //                 "symbol": "ETH-USDT-PERP"
        //             }
        //         ],
        //         "ts": 1790255461823
        //     }
        //
        const ts = this.safeInteger (message, 'ts');
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const row = this.safeDict (data, i, {});
            // the row carries no timestamp of its own, the envelope does
            const extended = this.extend (row, { 'ts': ts });
            const ticker = this.parseTicker (extended);
            const symbol = ticker['symbol'] as string;
            this.tickers[symbol] = ticker;
            client.resolve (ticker, 'ticker::' + symbol);
            client.resolve (ticker, 'tickers');
        }
    }

    /**
     * @method
     * @name umx#watchBidsAsks
     * @description watches the best bid and ask prices and volumes of multiple markets
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/best-bid-and-offer-channel
     * @param {string[]} [symbols] unified symbols of the markets to watch, every spot, perpetual and dated futures market is streamed when left out, the venue accepts no options subscription on this channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    override async watchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<Tickers> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const messageHashes = [];
        const topics = [];
        if (symbols === undefined) {
            messageHashes.push ('bidasks');
            const businessTypes = [ 'spot', 'linear_perpetual', 'linear_futures' ];
            for (let i = 0; i < businessTypes.length; i++) {
                topics.push ({
                    'stream': 'orderBook',
                    'businessType': businessTypes[i],
                });
            }
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const messageHash = 'bidask::' + symbol;
                if (!this.inArray (messageHash, messageHashes)) {
                    messageHashes.push (messageHash);
                    topics.push (this.subscriptionTopic ('orderBook', symbol));
                }
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'subscribe',
            'data': topics,
        };
        const newTicker = await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes);
        if (this.newUpdates) {
            const result: Dict = {};
            result[newTicker['symbol']] = newTicker;
            return result;
        }
        return this.filterByArray (this.bidsasks, 'symbol', symbols);
    }

    /**
     * @method
     * @name umx#unWatchBidsAsks
     * @description unsubscribes from the best bid and ask channel of multiple markets
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/best-bid-and-offer-channel
     * @param {string[]} [symbols] unified symbols of the markets to stop watching, the all pairs subscriptions are dropped when left out
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchBidsAsks (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const subMessageHashes = [];
        const messageHashes = [];
        const topics = [];
        if (symbols === undefined) {
            subMessageHashes.push ('bidasks');
            messageHashes.push ('unsubscribe::bidasks');
            const businessTypes = [ 'spot', 'linear_perpetual', 'linear_futures' ];
            for (let i = 0; i < businessTypes.length; i++) {
                topics.push ({
                    'stream': 'orderBook',
                    'businessType': businessTypes[i],
                });
            }
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const subMessageHash = 'bidask::' + symbol;
                if (!this.inArray (subMessageHash, subMessageHashes)) {
                    subMessageHashes.push (subMessageHash);
                    messageHashes.push ('unsubscribe::bidask::' + symbol);
                    topics.push (this.subscriptionTopic ('orderBook', symbol));
                }
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'unsubscribe',
            'data': topics,
        };
        const subscription: Dict = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': messageHashes,
            'subMessageHashes': subMessageHashes,
            'topic': 'bidsasks',
        };
        return await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes, subscription);
    }

    handleBidsAsks (client: Client, message: Dict) {
        //
        //     {
        //         "businessType": "linear_perpetual",
        //         "symbol": "ETH-USDT-PERP",
        //         "stream": "orderBook",
        //         "data": [
        //             {
        //                 "symbol": "ETH-USDT-PERP",
        //                 "lastUpdateId": "12480866377",
        //                 "preUpdateId": "12480866375",
        //                 "bids": [ [ "2666.67", "90.948" ] ],
        //                 "asks": [ [ "2666.85", "40.5" ] ]
        //             }
        //         ],
        //         "ts": 1790257010431
        //     }
        //
        const ts = this.safeInteger (message, 'ts');
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const row = this.safeDict (data, i, {});
            const marketId = this.safeString (row, 'symbol');
            const market = this.safeMarket (marketId);
            const symbol = market['symbol'] as string;
            const bids = this.safeList (row, 'bids', []);
            const asks = this.safeList (row, 'asks', []);
            const bestBid = this.safeList (bids, 0, []);
            const bestAsk = this.safeList (asks, 0, []);
            const ticker = this.safeTicker ({
                'symbol': symbol,
                'timestamp': ts,
                'datetime': this.iso8601 (ts),
                'bid': this.safeString (bestBid, 0),
                'bidVolume': this.safeString (bestBid, 1),
                'ask': this.safeString (bestAsk, 0),
                'askVolume': this.safeString (bestAsk, 1),
                'info': row,
            }, market);
            this.bidsasks[symbol] = ticker;
            client.resolve (ticker, 'bidask::' + symbol);
            client.resolve (ticker, 'bidasks');
        }
    }

    /**
     * @method
     * @name umx#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low and close price and the volume of a market
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/kline-channel
     * @param {string} symbol unified symbol of the market to watch the ohlcv for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    override async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<OHLCV[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const url = this.urls['api']['ws']['public'];
        const messageHash = 'ohlcv::' + symbol + '::' + timeframe;
        const message: Dict = {
            'event': 'subscribe',
            'data': [ this.subscriptionTopic ('kline#' + interval, symbol) ],
        };
        const ohlcv = await this.watch (url, messageHash, this.deepExtend (message, params), messageHash);
        if (this.newUpdates) {
            limit = ohlcv.getLimit (symbol, limit);
        }
        return this.filterBySinceLimit (ohlcv, since, limit, 0, true);
    }

    /**
     * @method
     * @name umx#unWatchOHLCV
     * @description unsubscribes from the candles channel of a market
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/kline-channel
     * @param {string} symbol unified symbol of the market to stop watching the candles of
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchOHLCV (symbol: string, timeframe = '1m', params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const interval = this.safeString (this.timeframes, timeframe, timeframe);
        const url = this.urls['api']['ws']['public'];
        const subMessageHash = 'ohlcv::' + symbol + '::' + timeframe;
        const messageHash = 'unsubscribe::' + subMessageHash;
        const message: Dict = {
            'event': 'unsubscribe',
            'data': [ this.subscriptionTopic ('kline#' + interval, symbol) ],
        };
        const subscription: Dict = {
            'unsubscribe': true,
            'symbolsAndTimeframes': [ [ symbol, timeframe ] ],
            'messageHashes': [ messageHash ],
            'subMessageHashes': [ subMessageHash ],
            'topic': 'ohlcv',
        };
        return await this.watch (url, messageHash, this.deepExtend (message, params), messageHash, subscription);
    }

    handleOHLCV (client: Client, message: Dict) {
        //
        //     {
        //         "businessType": "spot",
        //         "symbol": "ETH-USDT",
        //         "stream": "kline#1m",
        //         "data": [
        //             {
        //                 "symbol": "ETH-USDT",
        //                 "period": "1m",
        //                 "openTime": "1790256960000",
        //                 "closeTime": "1790257012114",
        //                 "openPrice": "2666.13",
        //                 "closePrice": "2667.66",
        //                 "highPrice": "2668.38",
        //                 "lowPrice": "2665.03",
        //                 "volume": "0.0582",
        //                 "quoteVolume": "155.191325",
        //                 "count": "15",
        //                 "priceChange": "1.53",
        //                 "priceChangePercent": "0.0005"
        //             }
        //         ],
        //         "ts": 1790257012121
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'] as string;
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const row = this.safeDict (data, i, {});
            const interval = this.safeString (row, 'period');
            const timeframe = this.findTimeframe (interval) as string;
            if (!(symbol in this.ohlcvs)) {
                this.ohlcvs[symbol] = {};
            }
            if (!(timeframe in this.ohlcvs[symbol])) {
                const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
                this.ohlcvs[symbol][timeframe] = new ArrayCacheByTimestamp (limit);
            }
            const stored = this.ohlcvs[symbol][timeframe];
            const parsed = this.parseWsOHLCV (row, market);
            stored.append (parsed);
            client.resolve (stored, 'ohlcv::' + symbol + '::' + timeframe);
        }
    }

    override parseWsOHLCV (ohlcv: any, market: Market = undefined): OHLCV {
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
     * @ignore
     * @method
     * @name umx#authenticate
     * @description authenticate the private websocket connection, required before any private subscription
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/private-channel/user-authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} resolves once the venue confirms the authorization
     */
    async authenticate (params: Dict = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws']['private'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.future (messageHash);
        const isAuthenticated = this.safeValue (client.subscriptions, messageHash);
        if (isAuthenticated === undefined) {
            const timestamp = this.numberToString (this.milliseconds ());
            const request: Dict = {
                'type': 'Token',
                'accessKey': this.apiKey,
                'accessTimestamp': timestamp,
            };
            // the venue signs the json of the data object appended to the same prehash the
            // rest api uses, with an empty query string, and the field order above is fixed
            const payload = timestamp + 'POST' + '/v2/notification' + this.json (request);
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
            const message: Dict = {
                'data': request,
                'accessSign': signature,
                'event': 'authorization',
            };
            this.watch (url, messageHash, this.extend (message, params), messageHash);
        }
        return await future;
    }

    handleAuthenticate (client: Client, message: Dict) {
        //
        //     { "event": "authorization", "data": "", "code": 0, "message": "...", "ts": 1790000000000 }
        //
        const code = this.safeString (message, 'code');
        const future = this.safeValue (client.futures, 'authenticated');
        if ((code === undefined) || (code === '0')) {
            future.resolve (true);
        } else {
            const error = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (error, 'authenticated');
            if ('authenticated' in client.subscriptions) {
                delete client.subscriptions['authenticated'];
            }
        }
    }

    /**
     * @ignore
     * @method
     * @name umx#privateTopics
     * @description build the subscription topics of a private channel, one per instrument type when no symbol narrows it
     * @param {string} stream the venue channel name
     * @param {string} [symbol] unified market symbol
     * @param {string[]} businessTypes the instrument types the symbolless subscription covers
     * @returns {object[]} the topic objects
     */
    privateTopics (stream: string, symbol: Str = undefined, businessTypes: string[] = []): Dict[] {
        if (symbol !== undefined) {
            return [ this.subscriptionTopic (stream, symbol) ];
        }
        const topics = [];
        for (let i = 0; i < businessTypes.length; i++) {
            topics.push ({
                'stream': stream,
                'businessType': businessTypes[i],
            });
        }
        return topics;
    }

    /**
     * @method
     * @name umx#watchOrders
     * @description watches information on the orders made by the user
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/private-channel/order-channel
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum amount of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        await this.authenticate ();
        let messageHash = 'orders';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = 'orders::' + symbol;
        }
        const topics = this.privateTopics ('order', symbol, [ 'spot', 'linear_perpetual', 'linear_futures' ]);
        const url = this.urls['api']['ws']['private'];
        const message: Dict = {
            'event': 'subscribe',
            'data': topics,
        };
        const orders = await this.watch (url, messageHash, this.deepExtend (message, params), messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client: Client, message: Dict) {
        //
        //     {
        //         "businessType": "linear_perpetual",
        //         "symbol": "ETH-USDT-PERP",
        //         "stream": "order",
        //         "data": [ { ... a rest style order row with a tradeList ... } ],
        //         "ts": 1790000000000
        //     }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.orders;
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const row = this.safeDict (data, i, {});
            const order = this.parseOrder (row);
            stored.append (order);
            client.resolve (stored, 'orders::' + order['symbol']);
        }
        client.resolve (stored, 'orders');
    }

    /**
     * @method
     * @name umx#watchMyTrades
     * @description watches information on the trades made by the user
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/private-channel/account-trade-channel
     * @param {string} [symbol] unified market symbol of the market the trades were made in
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        await this.authenticate ();
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = 'myTrades::' + symbol;
        }
        const topics = this.privateTopics ('trade', symbol, [ 'spot', 'linear_perpetual', 'linear_futures' ]);
        const url = this.urls['api']['ws']['private'];
        const message: Dict = {
            'event': 'subscribe',
            'data': topics,
        };
        const trades = await this.watch (url, messageHash, this.deepExtend (message, params), messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client: Client, message: Dict) {
        //
        //     {
        //         "businessType": "linear_perpetual",
        //         "symbol": "ETH-USDT-PERP",
        //         "stream": "trade",
        //         "data": [ { ... a rest style fill row ... } ],
        //         "ts": 1790000000000
        //     }
        //
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const stored = this.myTrades;
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const row = this.safeDict (data, i, {});
            const trade = this.parseTrade (row);
            stored.append (trade);
            client.resolve (stored, 'myTrades::' + trade['symbol']);
        }
        client.resolve (stored, 'myTrades');
    }

    /**
     * @method
     * @name umx#watchBalance
     * @description watches the changes of the trading account balance, the venue streams no funding account channel
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/private-channel/trading-account-channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    override async watchBalance (params: Dict = {}): Promise<Balances> {
        await this.loadMarkets ();
        await this.authenticate ();
        const messageHash = 'balance';
        const url = this.urls['api']['ws']['private'];
        const message: Dict = {
            'event': 'subscribe',
            'data': [
                {
                    'stream': 'trading_account',
                },
            ],
        };
        return await this.watch (url, messageHash, this.deepExtend (message, params), messageHash);
    }

    handleBalance (client: Client, message: Dict) {
        //
        //     {
        //         "stream": "trading_account",
        //         "data": [ { ... the rest style trading account snapshot with a details list ... } ],
        //         "ts": 1790000000000
        //     }
        //
        const data = this.safeList (message, 'data', []);
        const dataLength = data.length;
        const row = this.safeDict (data, dataLength - 1, {});
        // the rest parser expects the http envelope, whose data member is the account object
        const restLike: Dict = {
            'data': row,
            'ts': this.safeInteger (message, 'ts'),
        };
        const parsed = this.parseBalance (restLike);
        // merge into the existing object in place, a consumer can hold a reference to it
        // across the updates, see the object identity issue class of ccxt#30595
        const keys = Object.keys (parsed);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.balance[key] = parsed[key];
        }
        client.resolve (this.balance, 'balance');
    }

    /**
     * @method
     * @name umx#watchPositions
     * @description watches information on multiple contract positions
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/private-channel/position-channel
     * @param {string[]} [symbols] list of unified market symbols, every perpetual and dated futures market is streamed when left out
     * @param {int} [since] timestamp in ms of the earliest position update to fetch
     * @param {int} [limit] the maximum amount of position updates to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async watchPositions (symbols: Strings = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Position[]> {
        await this.loadMarkets ();
        await this.authenticate ();
        symbols = this.marketSymbols (symbols);
        const messageHashes = [];
        let topics = [];
        if (symbols === undefined) {
            messageHashes.push ('positions');
            topics = this.privateTopics ('position', undefined, [ 'linear_perpetual', 'linear_futures' ]);
        } else {
            for (let i = 0; i < symbols.length; i++) {
                const symbol = symbols[i];
                const messageHash = 'positions::' + symbol;
                if (!this.inArray (messageHash, messageHashes)) {
                    messageHashes.push (messageHash);
                    topics.push (this.subscriptionTopic ('position', symbol));
                }
            }
        }
        const url = this.urls['api']['ws']['private'];
        const message: Dict = {
            'event': 'subscribe',
            'data': topics,
        };
        const newPositions = await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes);
        if (this.newUpdates) {
            return newPositions;
        }
        return this.filterBySymbolsSinceLimit (this.positions, symbols, since, limit, true);
    }

    handlePositions (client: Client, message: Dict) {
        //
        //     {
        //         "businessType": "linear_perpetual",
        //         "symbol": "ETH-USDT-PERP",
        //         "stream": "position",
        //         "data": [ { ... a rest style position row ... } ],
        //         "ts": 1790000000000
        //     }
        //
        if (this.positions === undefined) {
            this.positions = new ArrayCacheBySymbolBySide ();
        }
        const cache = this.positions;
        const data = this.safeList (message, 'data', []);
        const newPositions = [];
        for (let i = 0; i < data.length; i++) {
            const row = this.safeDict (data, i, {});
            const position = this.parsePosition (row);
            newPositions.push (position);
            cache.append (position);
            client.resolve ([ position ], 'positions::' + position['symbol']);
        }
        client.resolve (newPositions, 'positions');
    }

    /**
     * @ignore
     * @method
     * @name umx#subscriptionTopic
     * @description build one entry of the data list of a subscription request
     * @param {string} stream the venue channel name, e.g. "trade"
     * @param {string} symbol unified market symbol
     * @returns {object} the topic object with the stream, businessType and venue symbol
     */
    subscriptionTopic (stream: string, symbol: string): Dict {
        const market = this.market (symbol);
        const businessTypes = this.safeDict (this.options, 'businessTypes', {});
        const businessType = this.safeString (businessTypes, market['type'], market['type']);
        return {
            'stream': stream,
            'businessType': businessType,
            'symbol': market['id'],
        };
    }

    handleTrades (client: Client, message: Dict) {
        //
        //     {
        //         "businessType": "spot",
        //         "symbol": "BTC-USDT",
        //         "stream": "trade",
        //         "data": [
        //             {
        //                 "symbol": "BTC-USDT",
        //                 "id": "1384528849",
        //                 "side": "buy",
        //                 "price": "70759.2",
        //                 "qty": "0.64353",
        //                 "time": "1773138337236"
        //             }
        //         ],
        //         "ts": 1773138337239
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const tradesArray = this.trades[symbol];
        const data = this.safeList (message, 'data', []);
        const newTrades = [];
        for (let i = 0; i < data.length; i++) {
            const rawTrade = this.safeDict (data, i, {});
            const trade = this.parseTrade (rawTrade, market);
            newTrades.push (trade);
        }
        const sorted = this.sortBy (newTrades, 'timestamp');
        for (let j = 0; j < sorted.length; j++) {
            tradesArray.append (sorted[j]);
        }
        this.trades[symbol] = tradesArray;
        client.resolve (tradesArray, 'trade::' + symbol);
    }

    handleSubscriptionStatus (client: Client, message: Dict) {
        //
        //     {
        //         "event": "subscribe",
        //         "data": [
        //             {
        //                 "businessType": "spot",
        //                 "symbol": "BTC-USDT",
        //                 "stream": "trade",
        //                 "message": "...",
        //                 "code": 0
        //             }
        //         ],
        //         "ts": 1773138335728
        //     }
        //
        const event = this.safeString (message, 'event');
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            const stream = this.safeString (entry, 'stream', '');
            const marketId = this.safeString (entry, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const parts = stream.split ('#');
            const streamName = this.safeString (parts, 0, '');
            let channel = streamName;
            if (streamName.startsWith ('depth')) {
                channel = 'orderbook';
            } else if (streamName === 'ticker24hr') {
                channel = 'ticker';
            } else if (streamName === 'orderBook') {
                channel = 'bidask';
            } else if (streamName === 'kline') {
                channel = 'ohlcv';
            }
            // some channels accept a subscription without a symbol
            let messageHash = channel + 's';
            if (marketId !== undefined) {
                messageHash = channel + '::' + symbol;
                if (streamName === 'kline') {
                    const interval = this.safeString (parts, 1, '');
                    const timeframe = this.findTimeframe (interval);
                    messageHash = messageHash + '::' + timeframe;
                }
            }
            const code = this.safeString (entry, 'code');
            if ((code !== undefined) && (code !== '0')) {
                const feedback = this.id + ' ' + this.json (entry);
                const error = new ExchangeError (feedback);
                client.reject (error, messageHash);
                client.reject (error, 'unsubscribe::' + messageHash);
            } else if (event === 'subscribe') {
                const subscription = this.safeDict (client.subscriptions, messageHash);
                if (subscription !== undefined) {
                    const method = this.safeValue (subscription, 'method');
                    if (method !== undefined) {
                        const methodSubscription = this.extend (subscription, { 'symbol': symbol });
                        method.call (this, client, message, methodSubscription);
                    }
                }
            } else if (event === 'unsubscribe') {
                const unsubHash = 'unsubscribe::' + messageHash;
                const subscription = this.safeDict (client.subscriptions, unsubHash);
                if (subscription !== undefined) {
                    this.cleanCache (subscription);
                }
                this.cleanUnsubscription (client, messageHash, unsubHash);
            }
        }
    }

    async pong (client: Client, message: any) {
        // the venue speaks a text based heartbeat, see the streaming block in describe
        try {
            await client.send ('PONG');
        } catch (e) {
            this.onError (client, e);
        }
    }

    override ping (client: Client): any {
        return 'PING';
    }

    override handleMessage (client: Client, message: any) {
        if (message === 'PING') {
            this.spawn (this.pong, client, message);
            return;
        }
        if (message === 'PONG') {
            client.lastPong = this.milliseconds ();
            return;
        }
        const event = this.safeString (message, 'event');
        if (event === 'authorization') {
            this.handleAuthenticate (client, message);
            return;
        }
        if ((event === 'subscribe') || (event === 'unsubscribe')) {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const stream = this.safeString (message, 'stream', '');
        const isPrivate = (client.url === this.urls['api']['ws']['private']);
        if (isPrivate) {
            if (stream === 'order') {
                this.handleOrders (client, message);
            } else if (stream === 'trade') {
                this.handleMyTrades (client, message);
            } else if (stream === 'trading_account') {
                this.handleBalance (client, message);
            } else if (stream === 'position') {
                this.handlePositions (client, message);
            }
            return;
        }
        if (stream === 'trade') {
            this.handleTrades (client, message);
        } else if (stream.startsWith ('depth')) {
            this.handleOrderBook (client, message);
        } else if (stream === 'ticker24hr') {
            this.handleTicker (client, message);
        } else if (stream === 'orderBook') {
            this.handleBidsAsks (client, message);
        } else if (stream.startsWith ('kline')) {
            this.handleOHLCV (client, message);
        }
    }
}
