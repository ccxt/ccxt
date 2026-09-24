
//  ---------------------------------------------------------------------------

import { sha256 } from '@noble/hashes/sha2.js';
import umxRest from '../umx.js';
import { ArgumentsRequired, AuthenticationError, BadRequest, ExchangeError, NotSupported } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheBySymbolBySide, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import type { Balances, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class umx extends umxRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'cancelOrderWs': true,
                'createOrderWs': true,
                'watchBalance': true,
                'watchBidsAsks': true,
                'unWatchBidsAsks': true,
                'watchMyTrades': true,
                'watchOHLCV': true,
                'unWatchOHLCV': true,
                'watchOHLCVForSymbols': true,
                'unWatchOHLCVForSymbols': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'unWatchOrderBook': true,
                'unWatchOrderBookForSymbols': true,
                'watchOrders': true,
                'unWatchOrders': true,
                'unWatchMyTrades': true,
                'unWatchBalance': true,
                'watchPosition': true,
                'watchPositions': true,
                'unWatchPositions': true,
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
                        'trade': 'wss://stream.umx.com/ws/private/trade/v2/trade',
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
            // reference to it across resubscriptions
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
        const result = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
        return result[symbol][timeframe];
    }

    /**
     * @method
     * @name umx#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low and close price and the volume of multiple markets
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/kline-channel
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to watch, e.g. [ [ 'BTC/USDT', '1m' ], [ 'ETH/USDT:USDT', '5m' ] ]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of candles indexed by symbol and timeframe, the candles of the market that updated
     */
    override async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params: Dict = {}) {
        await this.loadMarkets ();
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const entry = this.safeList (symbolsAndTimeframes, i, []);
            const market = this.market (this.safeString (entry, 0));
            const entrySymbol = market['symbol'];
            const entryTimeframe = this.safeString (entry, 1, '1m');
            const interval = this.safeString (this.timeframes, entryTimeframe, entryTimeframe);
            const messageHash = 'ohlcv::' + entrySymbol + '::' + entryTimeframe;
            if (!this.inArray (messageHash, messageHashes)) {
                messageHashes.push (messageHash);
                topics.push (this.subscriptionTopic ('kline#' + interval, entrySymbol));
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'subscribe',
            'data': topics,
        };
        const res = await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes);
        const [ symbol, timeframe, candles ] = res;
        if (this.newUpdates) {
            limit = candles.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (candles, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
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
        return await this.unWatchOHLCVForSymbols ([ [ symbol, timeframe ] ], params);
    }

    /**
     * @method
     * @name umx#unWatchOHLCVForSymbols
     * @description unsubscribes from the candles channel of multiple markets
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/public-channel/kline-channel
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to stop watching, e.g. [ [ 'BTC/USDT', '1m' ], [ 'ETH/USDT:USDT', '5m' ] ]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchOHLCVForSymbols (symbolsAndTimeframes: string[][], params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        const subMessageHashes = [];
        const messageHashes = [];
        const topics = [];
        const unified = [];
        for (let i = 0; i < symbolsAndTimeframes.length; i++) {
            const entry = this.safeList (symbolsAndTimeframes, i, []);
            const market = this.market (this.safeString (entry, 0));
            const entrySymbol = market['symbol'];
            const entryTimeframe = this.safeString (entry, 1, '1m');
            const interval = this.safeString (this.timeframes, entryTimeframe, entryTimeframe);
            const subMessageHash = 'ohlcv::' + entrySymbol + '::' + entryTimeframe;
            if (!this.inArray (subMessageHash, subMessageHashes)) {
                subMessageHashes.push (subMessageHash);
                messageHashes.push ('unsubscribe::' + subMessageHash);
                topics.push (this.subscriptionTopic ('kline#' + interval, entrySymbol));
                unified.push ([ entrySymbol, entryTimeframe ]);
            }
        }
        const url = this.urls['api']['ws']['public'];
        const message: Dict = {
            'event': 'unsubscribe',
            'data': topics,
        };
        const subscription: Dict = {
            'unsubscribe': true,
            'symbolsAndTimeframes': unified,
            'messageHashes': messageHashes,
            'subMessageHashes': subMessageHashes,
            'topic': 'ohlcv',
        };
        return await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes, subscription);
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
            const resolveData = [ symbol, timeframe, stored ];
            client.resolve (resolveData, 'ohlcv::' + symbol + '::' + timeframe);
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
        const future = client.reusableFuture (messageHash);
        const isAuthenticated = this.safeValue (client.subscriptions, messageHash);
        if (isAuthenticated === undefined) {
            const timestamp = this.numberToString (this.nonce ());
            const request: Dict = {
                'type': 'Token',
                'accessKey': this.apiKey,
                'accessTimestamp': timestamp,
            };
            // the venue signs the json of the data object appended to the same prehash the rest
            // api uses, with an empty query string, and requires the field order type, accessKey,
            // accessTimestamp, the signed body is spelled out because the maps of some ports
            // (go, java) do not keep the insertion order when serialized
            // a closing brace followed by a quote would be read by the php transpiler as the end
            // of an array, so it is cut out of a literal padded with a space
            const openBrace = '{';
            let closeBrace = '} ';
            closeBrace = closeBrace.slice (0, 1);
            const signedData = openBrace + '"type":"Token","accessKey":"' + this.apiKey + '","accessTimestamp":"' + timestamp + '"' + closeBrace;
            const payload = timestamp + 'POST' + '/v2/notification' + signedData;
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
        //     {
        //         "event": "authorization",
        //         "code": 0,
        //         "message": "成功"
        //     }
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
        const businessTypesLength = businessTypes.length;
        if (businessTypesLength === 0) {
            const bareTopic: Dict = {
                'stream': stream,
            };
            return [ bareTopic ];
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
     * @param {boolean} [params.trigger] true watches the take profit and stop loss complex orders on the oco_order stream, the venue pushes nothing for the plain trigger orders, those surface on the regular stream once they fire
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Order[]> {
        await this.loadMarkets ();
        await this.authenticate ();
        let isTrigger = false;
        [ isTrigger, params ] = this.handleOptionAndParams2 (params, 'watchOrders', 'trigger', 'stop', false);
        const channel = isTrigger ? 'triggerOrders' : 'orders';
        let messageHash = channel;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            messageHash = channel + '::' + symbol;
        }
        let topics = [];
        if (isTrigger) {
            // the oco_order stream takes a subscription without an instrument type for every
            // market, a single symbol needs the businessType, the venue answers 70110 otherwise
            topics = this.privateTopics ('oco_order', symbol, []);
        } else {
            topics = this.privateTopics ('order', symbol, [ 'spot', 'linear_perpetual', 'linear_futures' ]);
        }
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
        //         "stream": "order",
        //         "ts": "1790258800584",
        //         "code": "0",
        //         "data": [
        //             {
        //                 "avgPrice": "2670.96",
        //                 "businessType": "linear_perpetual",
        //                 "clientOrderId": "3538205804946128896",
        //                 "createTime": "1790258800576",
        //                 "createType": "order",
        //                 "eventId": "1",
        //                 "isLeverage": "",
        //                 "lever": "10",
        //                 "marketUnit": "baseCoin",
        //                 "massQuoteOrder": {
        //                     "priceAdjustment": false,
        //                     "quote": false
        //                 },
        //                 "orderId": "3538205804946128896",
        //                 "orderType": "market",
        //                 "pid": "1000000000000000000",
        //                 "pnl": "0",
        //                 "price": "2710.61",
        //                 "qty": "0.001",
        //                 "quoteFee": "-0.00133548",
        //                 "reduceOnly": false,
        //                 "riskReducing": false,
        //                 "side": "buy",
        //                 "source": "api",
        //                 "status": "filled",
        //                 "symbol": "ETH-USDT-PERP",
        //                 "timeInForce": "ioc",
        //                 "totalFillQty": "0.001",
        //                 "tradeList": [
        //                     {
        //                         "businessType": "linear_perpetual",
        //                         "clientOrderId": "3538205804946128896",
        //                         "eventId": "1",
        //                         "fee": "-0.00133548",
        //                         "feeCurrency": "USDT",
        //                         "fillPrice": "2670.96",
        //                         "fillQty": "0.001",
        //                         "fillTime": "1790258800577",
        //                         "lever": "10",
        //                         "matchId": "12521655192",
        //                         "orderId": "3538205804946128896",
        //                         "orderType": "market",
        //                         "pnl": "0",
        //                         "postAvgPrice": "2670.96",
        //                         "postPositionQty": "0.001",
        //                         "preAvgPrice": "0",
        //                         "prePositionQty": "0",
        //                         "role": "taker",
        //                         "side": "buy",
        //                         "symbol": "ETH-USDT-PERP",
        //                         "tradeId": "3538205804946149378"
        //                     }
        //                 ],
        //                 "uid": "100000000000001",
        //                 "updateTime": "1790258800577",
        //                 "username": "John Doe"
        //             }
        //         ]
        //     }
        //
        // a take profit and stop loss complex order, its qty counts contracts
        //
        //     {
        //         "stream": "oco_order",
        //         "ts": "1790266180092",
        //         "code": "0",
        //         "data": [
        //             {
        //                 "accountName": "1000000000000000000",
        //                 "businessType": "linear_perpetual",
        //                 "complexClOrdId": "1552834423439298560",
        //                 "complexOId": "1552834423439298560",
        //                 "complexType": "tpsl",
        //                 "createTime": "1790266176000",
        //                 "parentOrderId": "3538236743072002048",
        //                 "pid": "1000000000000000000",
        //                 "positionId": "3538236743072018432",
        //                 "qty": "1",
        //                 "side": "sell",
        //                 "status": "untrigger",
        //                 "symbol": "ETH-USDT-PERP",
        //                 "tpslOrder": {
        //                     "slOrderInfo": {
        //                         "id": 2788340,
        //                         "slOrderType": "market",
        //                         "stopLoss": "1500.00",
        //                         "stopLossType": "last_price"
        //                     },
        //                     "tpOrderInfo": {
        //                         "id": 2788339,
        //                         "takeProfit": "5000.00",
        //                         "takeProfitType": "last_price",
        //                         "tpOrderType": "market"
        //                     },
        //                     "tpslClOrdId": "1552834423439298560",
        //                     "tpslMode": "partially_position"
        //                 },
        //                 "uid": "100000000000001",
        //                 "updateTime": "1790266180000"
        //             }
        //         ]
        //     }
        //
        const isTrigger = (this.safeString (message, 'stream') === 'oco_order');
        const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
        if (isTrigger && (this.triggerOrders === undefined)) {
            this.triggerOrders = new ArrayCacheBySymbolById (limit);
        }
        if (!isTrigger && (this.orders === undefined)) {
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        let stored = this.orders as ArrayCache;
        if (isTrigger) {
            stored = this.triggerOrders;
        }
        const channel = isTrigger ? 'triggerOrders' : 'orders';
        const data = this.safeList (message, 'data', []);
        for (let i = 0; i < data.length; i++) {
            const row = this.safeDict (data, i, {});
            const order = this.parseOrder (row);
            stored.append (order);
            client.resolve (stored, channel + '::' + order['symbol']);
        }
        client.resolve (stored, channel);
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
        //         "stream": "trade",
        //         "ts": "1790258800579",
        //         "code": "0",
        //         "data": [
        //             {
        //                 "orderId": "3538205804946128896",
        //                 "symbol": "ETH-USDT-PERP",
        //                 "clientOrderId": "3538205804946128896",
        //                 "fillPrice": "2670.960000000000000000",
        //                 "fillQty": "0.001000000000000000000",
        //                 "side": "buy",
        //                 "fillTime": "1790258800577",
        //                 "matchId": "12521655192",
        //                 "role": "taker",
        //                 "businessType": "linear_perpetual",
        //                 "pid": "1000000000000000000"
        //             }
        //         ]
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
        //         "ts": "1790258800584",
        //         "code": "0",
        //         "data": [
        //             {
        //                 "accountLeverage": "0.08977743",
        //                 "contractUpl": "-0.0004",
        //                 "details": [
        //                     {
        //                         "availableMargin": "29.484931015",
        //                         "balance": "29.485331015",
        //                         "borrow": "0",
        //                         "currency": "USDT",
        //                         "equity": "29.484931015",
        //                         "fixedBalance": "0",
        //                         "frozen": "0",
        //                         "initialMargin": "0.267056",
        //                         "intLiability": "0",
        //                         "liabilityInitialMargin": "0",
        //                         "optionUpl": "0",
        //                         "potentialLiability": "0",
        //                         "realLiability": "0",
        //                         "realLiabilityValue": "0",
        //                         "upl": "-0.0004"
        //                     }
        //                 ],
        //                 "imr": "0.00897774",
        //                 "mmr": "0.00053866",
        //                 "pid": "1000000000000000000",
        //                 "totalAvailableBalance": "29.479395285",
        //                 "totalEffectiveMargin": "29.746451285",
        //                 "totalEquity": "29.746451285",
        //                 "totalIm": "0.267056",
        //                 "totalMarginBalance": "29.746451285",
        //                 "totalMm": "0.01602336",
        //                 "totalOpenLoss": "0",
        //                 "totalPositionValue": "2.67056"
        //             }
        //         ]
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
        // across the updates
        const keys = Object.keys (parsed);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.balance[key] = parsed[key];
        }
        client.resolve (this.balance, 'balance');
    }

    /**
     * @method
     * @name umx#watchPosition
     * @description watches the position of a contract market
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/private-channel/position-channel
     * @param {string} symbol unified market symbol of a perpetual or dated futures market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    override async watchPosition (symbol: Str = undefined, params: Dict = {}): Promise<Position> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' watchPosition() requires a symbol argument');
        }
        const positions = await this.watchPositions ([ symbol ], undefined, undefined, params);
        const positionsLength = positions.length;
        return positions[positionsLength - 1];
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
                const market = this.market (symbol);
                if ((market['swap'] !== true) && (market['future'] !== true)) {
                    // the venue streams positions of perpetual and dated futures markets only
                    throw new NotSupported (this.id + ' watchPositions() supports swap and future markets only, ' + symbol + ' is not one');
                }
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
        //         "stream": "position",
        //         "ts": "1790258800584",
        //         "code": "0",
        //         "data": [
        //             {
        //                 "avgPrice": "2670.96",
        //                 "businessType": "linear_perpetual",
        //                 "createTime": "1790258800577",
        //                 "delta": "0.001",
        //                 "fee": "-0.00133548",
        //                 "fundingFee": "0",
        //                 "im": "0.267056",
        //                 "indexPrice": "2671.3",
        //                 "lever": "10",
        //                 "liquidationPrice": "0",
        //                 "markPrice": "2670.56",
        //                 "pid": "1000000000000000000",
        //                 "pnl": "-0.00133548",
        //                 "positionId": "3538205804946149376",
        //                 "positionQty": "0.001",
        //                 "symbol": "ETH-USDT-PERP",
        //                 "tradedType": "OPEN",
        //                 "updateTime": "1790258800577",
        //                 "upl": "-0.0004"
        //             }
        //         ]
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
     * @method
     * @name umx#unWatchOrders
     * @description unsubscribes from the orders channel
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/private-channel/order-channel
     * @param {string} [symbol] unified market symbol, the subscription opened for it by watchOrders is dropped, the all markets one when left out
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true drops the take profit and stop loss subscription opened by watchOrders with the same flag
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchOrders (symbol: Str = undefined, params: Dict = {}): Promise<any> {
        let isTrigger = false;
        [ isTrigger, params ] = this.handleOptionAndParams2 (params, 'unWatchOrders', 'trigger', 'stop', false);
        if (isTrigger) {
            return await this.unWatchPrivate ('oco_order', 'triggerOrders', symbol, [], params);
        }
        return await this.unWatchPrivate ('order', 'orders', symbol, [ 'spot', 'linear_perpetual', 'linear_futures' ], params);
    }

    /**
     * @method
     * @name umx#unWatchMyTrades
     * @description unsubscribes from the trades channel of the account
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/private-channel/account-trade-channel
     * @param {string} [symbol] unified market symbol, the subscription opened for it by watchMyTrades is dropped, the all markets one when left out
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchMyTrades (symbol: Str = undefined, params: Dict = {}): Promise<any> {
        return await this.unWatchPrivate ('trade', 'myTrades', symbol, [ 'spot', 'linear_perpetual', 'linear_futures' ], params);
    }

    /**
     * @method
     * @name umx#unWatchBalance
     * @description unsubscribes from the trading account balance channel
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/private-channel/trading-account-channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    async unWatchBalance (params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        await this.authenticate ();
        const url = this.urls['api']['ws']['private'];
        const messageHash = 'unsubscribe::balance';
        const message: Dict = {
            'event': 'unsubscribe',
            'data': [
                {
                    'stream': 'trading_account',
                },
            ],
        };
        const subscription: Dict = {
            'unsubscribe': true,
            'messageHashes': [ messageHash ],
            'subMessageHashes': [ 'balance' ],
            'topic': 'balance',
        };
        return await this.watch (url, messageHash, this.deepExtend (message, params), messageHash, subscription);
    }

    /**
     * @method
     * @name umx#unWatchPositions
     * @description unsubscribes from the positions channel
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/private-channel/position-channel
     * @param {string[]} [symbols] unified market symbols, the subscriptions opened for them by watchPositions are dropped, the all markets one when left out
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    override async unWatchPositions (symbols: Strings = undefined, params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        if (symbols === undefined) {
            return await this.unWatchPrivate ('position', 'positions', undefined, [ 'linear_perpetual', 'linear_futures' ], params);
        }
        await this.authenticate ();
        const subMessageHashes = [];
        const messageHashes = [];
        const topics = [];
        for (let i = 0; i < symbols.length; i++) {
            const symbol = symbols[i];
            const subMessageHash = 'positions::' + symbol;
            if (!this.inArray (subMessageHash, subMessageHashes)) {
                subMessageHashes.push (subMessageHash);
                messageHashes.push ('unsubscribe::' + subMessageHash);
                topics.push (this.subscriptionTopic ('position', symbol));
            }
        }
        const url = this.urls['api']['ws']['private'];
        const message: Dict = {
            'event': 'unsubscribe',
            'data': topics,
        };
        const subscription: Dict = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': messageHashes,
            'subMessageHashes': subMessageHashes,
            'topic': 'positions',
        };
        return await this.watchMultiple (url, messageHashes, this.deepExtend (message, params), messageHashes, subscription);
    }

    /**
     * @ignore
     * @method
     * @name umx#unWatchPrivate
     * @description unsubscribes from a private channel opened for one market or for every market of the given instrument types
     * @param {string} stream the venue channel name
     * @param {string} channel the prefix of the watcher message hashes
     * @param {string} [symbol] unified market symbol
     * @param {string[]} businessTypes the instrument types the symbolless subscription covered
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} the result of the unwatch operation
     */
    async unWatchPrivate (stream: string, channel: string, symbol: Str = undefined, businessTypes: string[] = [], params: Dict = {}): Promise<any> {
        await this.loadMarkets ();
        await this.authenticate ();
        let subMessageHash = channel;
        const symbols = [];
        if (symbol !== undefined) {
            const market = this.market (symbol);
            symbol = market['symbol'];
            subMessageHash = channel + '::' + symbol;
            symbols.push (symbol);
        }
        const messageHash = 'unsubscribe::' + subMessageHash;
        const url = this.urls['api']['ws']['private'];
        const message: Dict = {
            'event': 'unsubscribe',
            'data': this.privateTopics (stream, symbol, businessTypes),
        };
        const subscription: Dict = {
            'unsubscribe': true,
            'symbols': symbols,
            'messageHashes': [ messageHash ],
            'subMessageHashes': [ subMessageHash ],
            'topic': channel,
        };
        return await this.watch (url, messageHash, this.deepExtend (message, params), messageHash, subscription);
    }

    /**
     * @ignore
     * @method
     * @name umx#cleanPrivateCache
     * @description drop the cache a private channel fills once no subscription of that channel is left, the cache is shared by every market
     * @param {object} client the private websocket client
     * @param {string} channel the prefix of the watcher message hashes
     */
    cleanPrivateCache (client: Client, channel: string) {
        const keys = Object.keys (client.subscriptions);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if ((key === channel) || key.startsWith (channel + '::')) {
                // another watcher of the channel is still subscribed and reads the cache
                return;
            }
        }
        if (channel === 'triggerOrders') {
            // the base class types this cache as always present, so it is swapped for an empty one
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.triggerOrders = new ArrayCacheBySymbolById (limit);
        } else if (channel === 'balance') {
            // emptied in place, a consumer can hold a reference to the balance object
            const balanceKeys = Object.keys (this.balance);
            for (let i = 0; i < balanceKeys.length; i++) {
                delete this.balance[balanceKeys[i]];
            }
        } else {
            const everyMarket: Dict = {
                'topic': channel,
                'symbols': [],
            };
            this.cleanCache (everyMarket);
        }
    }

    /**
     * @ignore
     * @method
     * @name umx#requestId
     * @description the next id to match a request of the trading socket with its answer
     * @returns {string} the request id
     */
    requestId () {
        this.lockId ();
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        this.unlockId ();
        return this.numberToString (requestId);
    }

    /**
     * @ignore
     * @method
     * @name umx#authenticateTrade
     * @description authenticate the trading websocket connection, required before placing or canceling orders on it
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/trading-channel/user-authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} resolves once the venue confirms the authorization
     */
    async authenticateTrade (params: Dict = {}) {
        this.checkRequiredCredentials ();
        const url = this.urls['api']['ws']['trade'];
        const client = this.client (url);
        const messageHash = 'tradeAuthenticated';
        const future = client.reusableFuture (messageHash);
        const isAuthenticated = this.safeValue (client.subscriptions, messageHash);
        if (isAuthenticated === undefined) {
            const timestamp = this.numberToString (this.nonce ());
            // signed like the notification socket, over the same path, but the signature travels
            // inside the body and the body is signed without it, the key order is required, the
            // closing brace is built as in authenticate
            const openBrace = '{';
            let closeBrace = '} ';
            closeBrace = closeBrace.slice (0, 1);
            const signedData = openBrace + '"type":"Token","accessKey":"' + this.apiKey + '","accessTimestamp":"' + timestamp + '"' + closeBrace;
            const payload = timestamp + 'POST' + '/v2/notification' + signedData;
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha256, 'hex');
            const body: Dict = {
                'type': 'Token',
                'accessKey': this.apiKey,
                'accessTimestamp': timestamp,
                'accessSign': signature,
            };
            const message: Dict = {
                'body': body,
                'op': 'authorization',
                'reqId': this.requestId (),
            };
            this.watch (url, messageHash, this.extend (message, params), messageHash);
        }
        return await future;
    }

    /**
     * @method
     * @name umx#createOrderWs
     * @description create a trade order through the trading websocket
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/trading-channel/order-placement-channel
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit' or 'post_only'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the base currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint, the same as createOrder takes, except the trigger and the attached take profit and stop loss ones, which the socket does not accept
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    override async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params: Dict = {}): Promise<Order> {
        await this.loadMarkets ();
        await this.authenticateTrade ();
        const market = this.market (symbol);
        const request = this.createOrderRequest (symbol, type, side, amount, price, params);
        if ('complexType' in request) {
            throw new NotSupported (this.id + ' createOrderWs() does not support trigger orders, the trading socket places regular orders only');
        }
        if ('tpslOrder' in request) {
            throw new NotSupported (this.id + ' createOrderWs() does not support an attached take profit or stop loss');
        }
        const url = this.urls['api']['ws']['trade'];
        const reqId = this.requestId ();
        const message: Dict = {
            'reqId': reqId,
            'op': 'order',
            'body': request,
        };
        const subscription: Dict = {
            'symbol': market['id'],
        };
        return await this.watch (url, reqId, message, reqId, subscription);
    }

    /**
     * @method
     * @name umx#cancelOrderWs
     * @description cancel an open order through the trading websocket
     * @see https://www.umx.com/docs/coin-apis/websocket-stream/trading-channel/cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel by the client order id instead of the id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}, the venue only acknowledges the request, fetch the order to confirm the cancelation
     */
    override async cancelOrderWs (id: string, symbol: Str = undefined, params: Dict = {}): Promise<Order> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelOrderWs() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticateTrade ();
        let isTrigger = false;
        [ isTrigger, params ] = this.handleOptionAndParams2 (params, 'cancelOrderWs', 'trigger', 'stop', false);
        if (isTrigger) {
            throw new NotSupported (this.id + ' cancelOrderWs() does not support trigger orders, the trading socket cancels regular orders only');
        }
        const market = this.market (symbol);
        const clientOrderId = this.safeString (params, 'clientOrderId');
        params = this.omit (params, 'clientOrderId');
        const body: Dict = {
            'symbol': market['id'],
        };
        if (clientOrderId !== undefined) {
            body['clientOrderId'] = clientOrderId;
        } else {
            body['orderId'] = id;
        }
        const url = this.urls['api']['ws']['trade'];
        const reqId = this.requestId ();
        const message: Dict = {
            'reqId': reqId,
            'op': 'cancelOrder',
            'body': this.extend (body, params),
        };
        const subscription: Dict = {
            'symbol': market['id'],
        };
        return await this.watch (url, reqId, message, reqId, subscription);
    }

    handleTradeMessage (client: Client, message: Dict) {
        //
        //     {
        //         "reqId": "2",
        //         "op": "order",
        //         "code": 0,
        //         "ts": "1790266865350",
        //         "data": {
        //             "orderId": "3538239631034830848",
        //             "clientOrderId": "3538239631034830848"
        //         }
        //     }
        //
        //     {
        //         "reqId": "4",
        //         "op": "cancelOrder",
        //         "code": 50026,
        //         "msg": "Order already completed, cancelation failed",
        //         "ts": "1790266867542"
        //     }
        //
        const op = this.safeString (message, 'op');
        const reqId = this.safeString (message, 'reqId', '');
        if (op === 'pong') {
            client.lastPong = this.milliseconds ();
            return;
        }
        if (op === 'ping') {
            this.spawn (this.pongTrade, client, message);
            return;
        }
        let messageHash = reqId;
        if (op === 'authorization') {
            messageHash = 'tradeAuthenticated';
        }
        const code = this.safeString (message, 'code');
        if ((code !== undefined) && (code !== '0')) {
            const feedback = this.id + ' ' + this.json (message);
            if (op === 'authorization') {
                const error = new AuthenticationError (feedback);
                client.reject (error, messageHash);
            } else {
                try {
                    this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                    this.throwBroadlyMatchedException (this.exceptions['broad'], this.safeString (message, 'msg'), feedback);
                    throw new ExchangeError (feedback);
                } catch (e) {
                    client.reject (e, messageHash);
                }
            }
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
            return;
        }
        if (op === 'authorization') {
            const future = this.safeValue (client.futures, messageHash);
            future.resolve (true);
            return;
        }
        if ((op === 'order') || (op === 'cancelOrder')) {
            // the answer carries the ids only, the symbol is taken from the request
            const subscription = this.safeDict (client.subscriptions, messageHash, {});
            const data = this.safeDict (message, 'data', {});
            const row = this.extend (data, {
                'symbol': this.safeString (subscription, 'symbol'),
                'ts': this.safeInteger (message, 'ts'),
            });
            const order = this.parseOrder (row);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
            client.resolve (order, messageHash);
        }
    }

    async pongTrade (client: Client, message: Dict) {
        const reqId = this.safeString (message, 'reqId');
        const pong: Dict = {
            'op': 'pong',
        };
        if (reqId !== undefined) {
            pong['reqId'] = reqId;
        }
        try {
            await client.send (pong);
        } catch (e) {
            this.onError (client, e);
        }
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
        //                 "businessType": "linear_perpetual",
        //                 "stream": "order",
        //                 "message": "成功",
        //                 "code": 0
        //             }
        //         ],
        //         "ts": 1790258794977
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
            // some channels accept a subscription without a symbol
            let symbollessHash = channel + 's';
            const isPrivate = (client.url === this.urls['api']['ws']['private']);
            if (isPrivate) {
                // the private streams are named after the venue channels, the watchers after the
                // unified methods, and the private fill stream shares its name with the public one
                const privateChannels: Dict = {
                    'order': 'orders',
                    'oco_order': 'triggerOrders',
                    'trade': 'myTrades',
                    'trading_account': 'balance',
                    'position': 'positions',
                };
                channel = this.safeString (privateChannels, streamName, streamName);
                symbollessHash = channel;
            } else if (streamName.startsWith ('depth')) {
                channel = 'orderbook';
                symbollessHash = channel + 's';
            } else if (streamName === 'ticker24hr') {
                channel = 'ticker';
                symbollessHash = channel + 's';
            } else if (streamName === 'orderBook') {
                channel = 'bidask';
                symbollessHash = channel + 's';
            } else if (streamName === 'kline') {
                channel = 'ohlcv';
                symbollessHash = channel + 's';
            }
            let messageHash = symbollessHash;
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
                if (isPrivate) {
                    this.cleanUnsubscription (client, messageHash, unsubHash);
                    this.cleanPrivateCache (client, channel);
                } else {
                    if (subscription !== undefined) {
                        this.cleanCache (subscription);
                    }
                    this.cleanUnsubscription (client, messageHash, unsubHash);
                }
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
        if (client.url === this.urls['api']['ws']['trade']) {
            // the trading socket speaks json and answers a ping only when it carries a reqId
            return {
                'reqId': this.requestId (),
                'op': 'ping',
            };
        }
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
        if (client.url === this.urls['api']['ws']['trade']) {
            this.handleTradeMessage (client, message);
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
            if ((stream === 'order') || (stream === 'oco_order')) {
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
