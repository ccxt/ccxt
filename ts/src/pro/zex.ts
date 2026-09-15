//  ---------------------------------------------------------------------------

import zexRest from '../zex.js';
import Client from '../base/ws/Client.js';
import { ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Dict, Int, Order, OrderBook, Str, Trade } from '../base/types.js';

//  ---------------------------------------------------------------------------

export default class zex extends zexRest {
    /**
     * @ignore
     * @method
     * @description generate a unique request id per url
     */
    zexRequestId (url: string): number {
        const options = this.safeDict (this.options, 'zexRequestId', {});
        const newValue = this.sum (this.safeInteger (options, url, 0), 1);
        this.options['zexRequestId'] = this.extend (options, { [url]: newValue });
        return newValue;
    }

    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchMyTrades': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://api-testnet.{hostname}/v1/ws',
                        'private': 'wss://api-testnet.{hostname}/v1/ws',
                    },
                },
            },
            'streaming': {
                'keepAlive': 30000,
            },
            'options': {
                'watchOrderBook': {
                    'snapshotDelay': 0,
                },
            },
        });
    }

    /**
     * @method
     * @name zex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.zex.finance
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const marketId = market['id'];
        const stream = marketId + '@depth';
        const messageHash = 'orderbook:' + symbol;
        const url = this.implodeHostname (this.urls['api']['ws']['public']);
        const subscribeMessage: Dict = {
            'method': 'SUBSCRIBE',
            'params': [ stream ],
            'id': this.zexRequestId (url),
        };
        const watchPromise = this.watch (url, messageHash, subscribeMessage, messageHash);
        if (!(symbol in this.orderbooks)) {
            const snapshot = await this.fetchOrderBook (symbol, limit, params);
            if (!(symbol in this.orderbooks)) {
                const ob = this.orderBook (snapshot);
                this.orderbooks[symbol] = ob;
            }
            const client = this.client (url) as any;
            client.resolve (this.orderbooks[symbol], messageHash);
        }
        const orderbook = await watchPromise;
        return orderbook.limit ();
    }

    /**
     * @method
     * @name zex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.zex.finance
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        const userId = await this.getUserId ();
        const stream = userId.toString () + '@executionReport';
        let messageHash = 'orders';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash = messageHash + ':' + symbol;
        }
        const url = this.implodeHostname (this.urls['api']['ws']['private']);
        const subscribeMessage: Dict = {
            'method': 'SUBSCRIBE',
            'params': [ stream ],
            'id': this.zexRequestId (url),
        };
        const orders = await this.watch (url, messageHash, subscribeMessage, messageHash);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    /**
     * @method
     * @name zex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.zex.finance
     * @param {string} [symbol] unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const userId = await this.getUserId ();
        const stream = userId.toString () + '@executionReport';
        let messageHash = 'myTrades';
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
            messageHash = messageHash + ':' + symbol;
        }
        const url = this.implodeHostname (this.urls['api']['ws']['private']);
        const subscribeMessage: Dict = {
            'method': 'SUBSCRIBE',
            'params': [ stream ],
            'id': this.zexRequestId (url),
        };
        const trades = await this.watch (url, messageHash, subscribeMessage, messageHash);
        if (this.newUpdates) {
            limit = trades.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    /**
     * @ignore
     * @method
     * @description handle incoming depth update messages
     */
    handleOrderBookMessage (client: Client, message) {
        //
        //     {
        //         "e": "depthUpdate",
        //         "E": 1699000000000,
        //         "s": "BTC-USDT",
        //         "U": 100,
        //         "u": 105,
        //         "pu": 99,
        //         "b": [["65000.0", "0.001"]],
        //         "a": [["65001.0", "0.001"]]
        //     }
        //
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeInteger (message, 'E');
        const finalUpdateId = this.safeInteger (message, 'u');
        if (!(symbol in this.orderbooks)) {
            const ob = this.orderBook ({});
            this.orderbooks[symbol] = ob;
        }
        const orderbook = this.orderbooks[symbol];
        if (finalUpdateId <= orderbook['nonce']) {
            return;
        }
        const bids = this.safeList (message, 'b', []);
        const asks = this.safeList (message, 'a', []);
        this.handleDeltas (orderbook['bids'], bids);
        this.handleDeltas (orderbook['asks'], asks);
        orderbook['nonce'] = finalUpdateId;
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        client.resolve (orderbook, messageHash);
    }

    /**
     * @ignore
     * @method
     * @description parse a single [price, amount] orderbook entry
     */
    handleDelta (bookside, delta) {
        const price = this.safeNumber (delta, 0);
        const amount = this.safeNumber (delta, 1);
        bookside.store (price, amount);
    }

    /**
     * @ignore
     * @method
     * @description handle incoming executionReport messages (orders)
     */
    handleOrderMessage (client: Client, message) {
        //
        //     {
        //         "e": "executionReport",
        //         "E": 1699000000000,
        //         "s": "BTC-USDT",
        //         "S": "buy",
        //         "X": "open",
        //         "x": "NEW",
        //         "i": 123,
        //         "q": "0.001",
        //         "p": "65000.0",
        //         "z": "0.0",
        //         "l": "0.0",
        //         "L": "0.0",
        //         "T": 1699000000000
        //     }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const parsedOrder = this.parseWsOrder (message, market);
        orders.append (parsedOrder);
        client.resolve (orders, 'orders');
        client.resolve (orders, 'orders:' + symbol);
    }

    /**
     * @ignore
     * @method
     * @description handle incoming executionReport messages (trades, when x=TRADE)
     */
    handleTradeMessage (client: Client, message) {
        const execType = this.safeString (message, 'x');
        if (execType !== 'TRADE') {
            return;
        }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const trades = this.myTrades;
        const marketId = this.safeString (message, 's');
        const market = this.safeMarket (marketId, undefined, '-');
        const symbol = market['symbol'];
        const parsedTrade = this.parseWsTrade (message, market);
        trades.append (parsedTrade);
        client.resolve (trades, 'myTrades');
        client.resolve (trades, 'myTrades:' + symbol);
    }

    /**
     * @ignore
     * @method
     * @description parse a WS order from executionReport
     */
    parseWsOrder (message, market = undefined) {
        const marketId = this.safeString (message, 's');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.safeInteger (message, 'T');
        const rawStatus = this.safeString (message, 'X');
        const status = this.parseOrderStatus (rawStatus);
        const side = this.safeStringLower (message, 'S');
        return this.safeOrder ({
            'id': this.safeString (message, 'i'),
            'clientOrderId': undefined,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': timestamp,
            'status': status,
            'symbol': symbol,
            'type': 'limit',
            'timeInForce': undefined,
            'postOnly': undefined,
            'side': side,
            'price': this.safeNumber (message, 'p'),
            'stopPrice': undefined,
            'average': undefined,
            'amount': this.safeNumber (message, 'q'),
            'filled': this.safeNumber (message, 'z'),
            'remaining': undefined,
            'cost': undefined,
            'trades': undefined,
            'fee': undefined,
            'info': message,
        }, market);
    }

    /**
     * @ignore
     * @method
     * @description parse a WS trade from executionReport (x=TRADE)
     */
    parseWsTrade (message, market = undefined) {
        const marketId = this.safeString (message, 's');
        const symbol = this.safeSymbol (marketId, market, '-');
        const timestamp = this.safeInteger (message, 'T', this.safeInteger (message, 'E'));
        const side = this.safeStringLower (message, 'S');
        const price = this.safeNumber (message, 'L');
        const amount = this.safeNumber (message, 'l');
        const cost = (price !== undefined && amount !== undefined) ? price * amount : undefined;
        return this.safeTrade ({
            'id': this.safeString (message, 'i'),
            'info': message,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': symbol,
            'order': this.safeString (message, 'i'),
            'type': 'limit',
            'side': side,
            'takerOrMaker': undefined,
            'price': price,
            'amount': amount,
            'cost': cost,
            'fee': undefined,
        }, market);
    }

    /**
     * @ignore
     * @method
     * @description route incoming WS messages to the appropriate handler
     */
    handleMessage (client: Client, message) {
        const stream = this.safeString (message, 'stream');
        if (stream !== undefined) {
            const data = this.safeDict (message, 'data', {});
            const streamEventType = this.safeString (data, 'e');
            if (streamEventType === 'depthUpdate') {
                this.handleOrderBookMessage (client, data);
            } else if (streamEventType === 'executionReport') {
                this.handleOrderMessage (client, data);
                this.handleTradeMessage (client, data);
            }
            return;
        }
        // direct message (no stream wrapper)
        const directEventType = this.safeString (message, 'e');
        if (directEventType === 'depthUpdate') {
            this.handleOrderBookMessage (client, message);
        } else if (directEventType === 'executionReport') {
            this.handleOrderMessage (client, message);
            this.handleTradeMessage (client, message);
        }
    }
}
