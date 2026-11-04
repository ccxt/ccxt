//  ---------------------------------------------------------------------------

import bitsoRest from '../bitso.js';
import { ExchangeError, InvalidNonce } from '../base/errors.js';
import { ArrayCache } from '../base/ws/Cache.js';
import type { Int, Trade, OrderBook, Dict, Market, Str } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class bitso extends bitsoRest {
    override describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
                'watchTradesForSymbols': false,
                'watchMyTrades': false,
                'watchOrders': false,
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.bitso.com',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'watchOrderBook': {
                    // number of diff-orders frames to buffer before requesting the rest snapshot
                    'snapshotDelay': 1,
                    'snapshotMaxRetries': 3,
                },
            },
            'streaming': {
            },
        });
    }

    async subscribePublic (channel: string, symbol: string, messageHash: string, params: Dict = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const subscriptionHash = channel + ':' + market['id'];
        const request: Dict = {
            'action': 'subscribe',
            'book': market['id'],
            'type': channel,
        };
        const subscription: Dict = {
            'symbol': market['symbol'],
            'channel': channel,
        };
        return await this.watch (url, messageHash, this.extend (request, params), subscriptionHash, subscription);
    }

    /**
     * @method
     * @name bitso#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.bitso.com/bitso-api/docs/trades-channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params: Dict = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const unifiedSymbol = market['symbol'];
        const messageHash = 'trades:' + unifiedSymbol;
        const trades = await this.subscribePublic ('trades', unifiedSymbol, messageHash, params);
        let limitResolved: Int = limit;
        if (this.newUpdates) {
            limitResolved = trades.getLimit (unifiedSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limitResolved, 'timestamp', true);
    }

    handleTrades (client: Client, message: Dict) {
        //
        //     {
        //         "book": "usd_mxn",
        //         "sent": 1793817296394,
        //         "payload": [
        //             {
        //                 "a": "10836.15981893",
        //                 "i": 203814319,
        //                 "mo": "Hr1ZOVwYQLOsPFkI",
        //                 "r": "18.562",
        //                 "t": 1,
        //                 "to": "rQNTptaefWI0IorH",
        //                 "v": "201140.79855899",
        //                 "x": 1793817296322
        //             }
        //         ],
        //         "type": "trades"
        //     }
        //
        const rawTrades = this.safeList (message, 'payload');
        if (rawTrades === undefined) {
            return;
        }
        const marketId = this.safeString (message, 'book');
        const market = this.safeMarket (marketId, undefined, '_');
        const symbol = market['symbol'];
        let stored = this.safeValue (this.trades, symbol);
        if (stored === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            stored = new ArrayCache (limit);
            this.trades[symbol] = stored;
        }
        for (let i = 0; i < rawTrades.length; i++) {
            const trade = this.parseWsTrade (rawTrades[i], market);
            stored.append (trade);
        }
        client.resolve (stored, 'trades:' + symbol);
    }

    override parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        //
        //     {
        //         "a": "10836.15981893", // amount
        //         "i": 203814319, // trade id
        //         "mo": "Hr1ZOVwYQLOsPFkI", // maker order id
        //         "r": "18.562", // rate
        //         "t": 1, // taker side, 0 buy, 1 sell
        //         "to": "rQNTptaefWI0IorH", // taker order id
        //         "v": "201140.79855899", // value
        //         "x": 1793817296322 // timestamp
        //     }
        //
        const timestamp = this.safeInteger (trade, 'x');
        // the docs describe "t" as the maker side, but checked against the rest
        // trades endpoint (and against the best bid/ask) it is the taker side
        const takerSide = this.safeInteger (trade, 't');
        let side: Str = undefined;
        if (takerSide === 0) {
            side = 'buy';
        } else if (takerSide === 1) {
            side = 'sell';
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'i'),
            'order': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': this.safeSymbol (undefined, market),
            'type': undefined,
            'side': side,
            'takerOrMaker': undefined,
            'price': this.safeString (trade, 'r'),
            'amount': this.safeString (trade, 'a'),
            'cost': this.safeString (trade, 'v'),
            'fee': undefined,
        }, market);
    }

    /**
     * @method
     * @name bitso#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data, the book is kept in sync from the diff-orders channel and is order-level, every entry is [ price, amount, orderId ]
     * @see https://docs.bitso.com/bitso-api/docs/diff-orders
     * @see https://docs.bitso.com/bitso-api/docs/list-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params: Dict = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const unifiedSymbol = market['symbol'];
        const messageHash = 'orderbook:' + unifiedSymbol;
        const orderbook = await this.subscribePublic ('diff-orders', unifiedSymbol, messageHash, params);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message: Dict) {
        //
        //     {
        //         "payload": [
        //             {
        //                 "a": "0.00776500",
        //                 "d": 1793817233808,
        //                 "o": "GINfN0s2CkquP2wW",
        //                 "r": "1509970",
        //                 "s": "open",
        //                 "t": 1,
        //                 "v": "11724.91705000",
        //                 "z": 0
        //             }
        //         ],
        //         "type": "diff-orders",
        //         "sequence": 4582052162,
        //         "book": "btc_mxn",
        //         "sent": 1793817233829
        //     }
        //
        const marketId = this.safeString (message, 'book');
        const subscriptionHash = 'diff-orders:' + marketId;
        if (!(subscriptionHash in client.subscriptions)) {
            // the subscription was dropped after a failed resynchronization
            return;
        }
        const symbol = this.safeSymbol (marketId, undefined, '_');
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            // the subscription was not confirmed yet
            return;
        }
        const sequence = this.safeInteger (message, 'sequence');
        if (sequence === undefined) {
            return;
        }
        const messageHash = 'orderbook:' + symbol;
        let nonce = this.safeInteger (orderbook, 'nonce');
        if ((nonce !== undefined) && (sequence > (nonce + 1))) {
            // a frame was lost, the book can not be trusted anymore,
            // start buffering again and resynchronize from a fresh snapshot
            orderbook['nonce'] = undefined;
            orderbook.cache = [];
            nonce = undefined;
        }
        if (nonce === undefined) {
            // buffer the deltas until the rest snapshot arrives, the frame is
            // cached before the snapshot request is spawned so that the loader
            // always sees it, even where spawn runs concurrently (go)
            orderbook.cache.push (message);
            const cacheLength = orderbook.cache.length;
            const snapshotDelay = this.handleOption ('watchOrderBook', 'snapshotDelay', 1);
            if (cacheLength === (snapshotDelay + 1)) {
                this.spawn (this.loadIndexedOrderBook, client, messageHash, symbol);
            }
            return;
        }
        if (sequence <= nonce) {
            // already included in the snapshot
            return;
        }
        this.handleBookDelta (orderbook, message);
        client.resolve (orderbook, messageHash);
    }

    override handleBookDelta (orderbook: any, delta: any) {
        const orders = this.safeList (delta, 'payload', []);
        const bids = orderbook['bids'];
        const asks = orderbook['asks'];
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            const orderId = this.safeString (order, 'o');
            const price = this.safeNumber (order, 'r');
            const status = this.safeString (order, 's');
            let amount = this.safeNumber (order, 'a');
            if ((status === 'cancelled') || (status === 'completed')) {
                // a zero amount removes the order from the indexed side
                amount = 0;
            }
            const side = this.safeInteger (order, 't');
            if (side === 0) {
                bids.storeArray ([ price, amount, orderId ]);
            } else if (side === 1) {
                asks.storeArray ([ price, amount, orderId ]);
            }
        }
        const timestamp = this.safeInteger (delta, 'sent');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = this.safeInteger (delta, 'sequence');
    }

    override getCacheIndex (orderbook: any, cache: any): number {
        const nonce = this.safeInteger (orderbook, 'nonce');
        const firstDelta = this.safeDict (cache, 0);
        const firstSequence = this.safeInteger (firstDelta, 'sequence');
        if ((nonce === undefined) || (firstSequence === undefined) || (firstSequence > (nonce + 1))) {
            // the snapshot is older than the oldest buffered delta, there is a gap
            return -1;
        }
        for (let i = 0; i < cache.length; i++) {
            const delta = cache[i];
            const sequence = this.safeInteger (delta, 'sequence');
            if ((sequence !== undefined) && (sequence > nonce)) {
                return i;
            }
        }
        return cache.length;
    }

    /**
     * @ignore
     * @method
     * @name bitso#loadIndexedOrderBook
     * @description fetches the order-level rest snapshot and replays the buffered diff-orders frames on top of it
     * @param {object} client the websocket client
     * @param {string} messageHash the orderbook message hash
     * @param {string} symbol unified market symbol
     */
    async loadIndexedOrderBook (client: Client, messageHash: string, symbol: string) {
        const orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            return;
        }
        const maxRetries = this.handleOption ('watchOrderBook', 'snapshotMaxRetries', 3);
        const market = this.market (symbol);
        let error = undefined;
        let synchronized = false;
        try {
            // no return inside the try block, the go transpiler wraps it in a closure
            let tries = 0;
            while (!synchronized && (tries < maxRetries)) {
                tries = tries + 1;
                const request: Dict = {
                    'book': market['id'],
                    'aggregate': 'false',
                };
                const response = await this.publicGetOrderBook (request);
                //
                //     {
                //         "success": true,
                //         "payload": {
                //             "updated_at": "2026-11-04T18:34:42+00:00",
                //             "sequence": "4582052759",
                //             "bids": [ { "book": "btc_mxn", "price": "1494230", "amount": "0.00597421", "oid": "By3N9CoNDarcbswq" } ],
                //             "asks": [ { "book": "btc_mxn", "price": "1494750", "amount": "0.06204", "oid": "mvVUWkyKgk3dSiUH" } ]
                //         }
                //     }
                //
                const payload = this.safeDict (response, 'payload', {});
                const timestamp = this.parse8601 (this.safeString (payload, 'updated_at'));
                const snapshot = this.parseOrderBookL3 (payload, symbol, timestamp, 'bids', 'asks', 'price', 'amount', 'oid');
                // the rest snapshot labeled with sequence N does not always include
                // the diff-orders frame N yet (seen live: its content sometimes
                // equals the book at N - 1), and every frame carries the full state
                // of the orders it lists, so replaying frame N is always safe
                const sequence = this.safeInteger (payload, 'sequence');
                if (sequence !== undefined) {
                    snapshot['nonce'] = sequence - 1;
                }
                const cache = orderbook.cache;
                const index = this.getCacheIndex (snapshot, cache);
                if (index >= 0) {
                    orderbook.reset (snapshot);
                    const deltas = this.arraySlice (cache, index);
                    for (let i = 0; i < deltas.length; i++) {
                        this.handleBookDelta (orderbook, deltas[i]);
                    }
                    orderbook.cache = [];
                    synchronized = true;
                }
            }
        } catch (e) {
            error = e;
        }
        if (synchronized) {
            client.resolve (orderbook, messageHash);
            return;
        }
        if (error === undefined) {
            error = new InvalidNonce (this.id + ' watchOrderBook() could not synchronize the ' + symbol + ' snapshot with the diff-orders stream after ' + maxRetries.toString () + ' tries');
        }
        // do not retry with the same broken state: drop the subscription so that
        // frames still in flight on this connection are ignored, reject every
        // pending future and forget the client, the next watch call then dials
        // a new connection and resubscribes from a clean book
        const subscriptionHash = 'diff-orders:' + market['id'];
        if (subscriptionHash in client.subscriptions) {
            delete client.subscriptions[subscriptionHash];
        }
        client.reset (error);
        delete this.clients[client.url];
        delete this.orderbooks[symbol];
    }

    handleSubscriptionStatus (client: Client, message: Dict) {
        //
        //     {
        //         "action": "subscribe",
        //         "response": "ok",
        //         "time": 1793817233806,
        //         "type": "diff-orders",
        //         "book": "btc_mxn"
        //     }
        //
        const response = this.safeString (message, 'response');
        const channel = this.safeString (message, 'type');
        const marketId = this.safeString (message, 'book');
        const symbol = this.safeSymbol (marketId, undefined, '_');
        if (response !== 'ok') {
            const error = new ExchangeError (this.id + ' ' + this.json (message));
            if (channel === 'diff-orders') {
                client.reject (error, 'orderbook:' + symbol);
            } else if (channel === 'trades') {
                client.reject (error, 'trades:' + symbol);
            }
            return;
        }
        if (channel === 'diff-orders') {
            // a fresh subscription (or a reconnect) starts a new book
            const orderbook = this.indexedOrderBook ({});
            orderbook.cache = [];
            this.orderbooks[symbol] = orderbook;
        }
    }

    override handleMessage (client: Client, message: any) {
        const type = this.safeString (message, 'type');
        if (type === 'ka') {
            // server keep-alive
            client.lastPong = this.milliseconds ();
            return;
        }
        const action = this.safeString (message, 'action');
        if (action === 'subscribe') {
            this.handleSubscriptionStatus (client, message);
            return;
        }
        if (type === 'trades') {
            this.handleTrades (client, message);
        } else if (type === 'diff-orders') {
            this.handleOrderBook (client, message);
        }
    }
}
