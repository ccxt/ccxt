
//  ---------------------------------------------------------------------------

import umxRest from '../umx.js';
import { BadRequest, ExchangeError } from '../base/errors.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Dict, Int, OrderBook, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class umx extends umxRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchBidsAsks': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'unWatchOrderBook': true,
                'unWatchOrderBookForSymbols': true,
                'watchOrders': false,
                'watchPositions': false,
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
            delete this.orderbooks[symbol];
        }
        this.orderbooks[symbol] = this.orderBook ({});
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
            }
            this.orderbooks[symbol] = orderbook;
            client.resolve (orderbook, messageHash);
        } catch (e) {
            delete client.subscriptions[messageHash];
            client.reject (e, messageHash);
        }
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
            // a gap in the sequence, the venue asks for a fresh snapshot in that case
            this.orderbooks[symbol] = this.orderBook ({});
            this.orderbooks[symbol].cache.push (update);
            const resubscription: Dict = {
                'symbol': symbol,
                'params': {},
            };
            this.spawn (this.fetchOrderBookSnapshot, client, {}, resubscription);
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
            // every push is a full snapshot of the top of the book
            if (!(symbol in this.orderbooks)) {
                this.orderbooks[symbol] = this.orderBook ({});
            }
            const book = this.orderbooks[symbol];
            const dataLength = data.length;
            const row = this.safeDict (data, dataLength - 1, {});
            const snapshot = this.parseOrderBook (row, symbol, timestamp);
            snapshot['nonce'] = this.safeInteger (row, 'lastUpdateId');
            book.reset (snapshot);
            client.resolve (book, 'orderbook::' + symbol);
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
     * @param {string[]} [symbols] unified symbols of the markets to watch the tickers for, every market of every instrument type is streamed when left out
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
            let channel = stream;
            if (stream.startsWith ('depth')) {
                channel = 'orderbook';
            } else if (stream === 'ticker24hr') {
                channel = 'ticker';
            }
            // the ticker channel accepts a subscription without a symbol
            let messageHash = channel + 's';
            if (marketId !== undefined) {
                messageHash = channel + '::' + symbol;
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
                        method.call (this, client, message, this.extend (subscription, { 'symbol': symbol }));
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
        if ((event === 'subscribe') || (event === 'unsubscribe')) {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        const stream = this.safeString (message, 'stream', '');
        if (stream === 'trade') {
            this.handleTrades (client, message);
        } else if (stream.startsWith ('depth')) {
            this.handleOrderBook (client, message);
        } else if (stream === 'ticker24hr') {
            this.handleTicker (client, message);
        }
    }
}
