//  ---------------------------------------------------------------------------

import type { Dict, Int, OrderBook, Str } from '../base/types.js';
import Client from '../base/ws/Client.js';
import lighterRest from '../lighter.js';

//  ---------------------------------------------------------------------------

export default class lighter extends lighterRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchTicker': false,
                'watchMarkPrice': false,
                'watchMarkPrices': false,
                'watchTickers': false,
                'watchBidsAsks': false,
                'watchOrderBook': true,
                'watchTrades': false,
                'watchTradesForSymbols': false,
                'watchOrderBookForSymbols': false,
                'watchBalance': false,
                'watchLiquidations': false,
                'watchLiquidationsForSymbols': false,
                'watchMyLiquidations': false,
                'watchMyLiquidationsForSymbols': false,
                'watchOHLCV': false,
                'watchOHLCVForSymbols': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchPositions': false,
                'watchFundingRate': false,
                'watchFundingRates': false,
                'unWatchOrderBook': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://mainnet.zklighter.elliot.ai/stream',
                },
                'test': {
                    'ws': 'wss://testnet.zklighter.elliot.ai/stream',
                },
            },
            'options': {},
        });
    }

    getMessageHash (unifiedChannel: string, symbol: Str = undefined, extra: Str = undefined) {
        let hash = unifiedChannel;
        if (symbol !== undefined) {
            hash += '::' + symbol;
        } else {
            hash += 's'; // tickers, orderbooks, ohlcvs ...
        }
        if (extra !== undefined) {
            hash += '::' + extra;
        }
        return hash;
    }

    async subscribePublic (messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'type': 'subscribe',
        };
        const subscription: Dict = {
            'messageHash': messageHash,
            'params': params,
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
    }

    async unsubscribePublic (messageHash, params = {}) {
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'type': 'unsubscribe',
        };
        const subscription: Dict = {
            'messageHash': messageHash,
            'params': params,
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash, subscription);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 'price');
        const amount = this.safeFloat (delta, 'size');
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleOrderBookMessage (client: Client, message, orderbook) {
        const data = this.safeDict (message, 'order_book', {});
        this.handleDeltas (orderbook['asks'], this.safeValue (data, 'asks', []));
        this.handleDeltas (orderbook['bids'], this.safeValue (data, 'bids', []));
        orderbook['nonce'] = this.safeInteger (data, 'offset');
        const timestamp = this.safeInteger (message, 'timestamp');
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        return orderbook;
    }

    handleOrderBook (client: Client, message) {
        //
        // {
        //     "channel": "order_book:0",
        //     "offset": 11413309,
        //     "order_book": {
        //         "code": 0,
        //         "asks": [
        //             {
        //                 "price": "2979.64",
        //                 "size": "61.9487"
        //             }
        //         ],
        //         "bids": [
        //             {
        //                 "price": "2979.36",
        //                 "size": "0.0000"
        //             }
        //         ],
        //         "offset": 11413309,
        //         "nonce": 3107818665
        //     },
        //     "timestamp": 1763448665923,
        //     "type": "update/order_book"
        // }
        //
        const data = this.safeDict (message, 'order_book', {});
        const channel = this.safeString (message, 'channel', '');
        const parts = channel.split (':');
        const marketId = parts[1];
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (message, 'timestamp');
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ();
        }
        const orderbook = this.orderbooks[symbol];
        const type = this.safeString (message, 'type', '');
        if (type === 'subscribed/order_book') {
            const parsed = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 'price', 'size');
            parsed['nonce'] = this.safeInteger (data, 'offset');
            orderbook.reset (parsed);
        } else if (type === 'update/order_book') {
            this.handleOrderBookMessage (client, message, orderbook);
        }
        const messageHash = this.getMessageHash ('orderbook', symbol);
        client.resolve (orderbook, messageHash);
    }

    /**
     * @method
     * @name lighter#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'channel': 'order_book/' + market['id'],
        };
        const messageHash = this.getMessageHash ('orderbook', symbol);
        const orderbook = await this.subscribePublic (messageHash, this.extend (request, params));
        return orderbook.limit ();
    }

    /**
     * @method
     * @name lighter#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#order-book
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async unWatchOrderBook (symbol: string, params = {}): Promise<any> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request: Dict = {
            'channel': 'order_book/' + market['id'],
        };
        const messageHash = this.getMessageHash ('unsubscribe', symbol);
        return await this.unsubscribePublic (messageHash, this.extend (request, params));
    }

    handleErrorMessage (client, message) {
        //
        //     {
        //         "error": {
        //             "code": 30005,
        //             "message": "Invalid Channel:  (marketId)"
        //         }
        //     }
        //
        const error = this.safeDict (message, 'error');
        try {
            if (error !== undefined) {
                const code = this.safeString (message, 'code');
                if (code !== undefined) {
                    const feedback = this.id + ' ' + this.json (message);
                    this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
                }
            }
        } catch (e) {
            client.reject (e);
        }
        return true;
    }

    handleMessage (client: Client, message) {
        if (!this.handleErrorMessage (client, message)) {
            return;
        }
        const channel = this.safeString (message, 'channel', '');
        if (channel.indexOf ('order_book:') >= 0) {
            this.handleOrderBook (client, message);
            return;
        }
        if (channel === '') {
            this.handleSubscriptionStatus (client, message);
        }
    }

    handleSubscriptionStatus (client: Client, message) {
        //
        //     {
        //         "session_id": "8d354239-80e0-4b77-8763-87b6fef2f768",
        //         "type": "connected"
        //     }
        //
        //     {
        //         "type": "unsubscribed",
        //         "channel": "order_book:0"
        //     }
        //
        const type = this.safeString (message, 'type', '');
        const id = this.safeString (message, 'session_id');
        const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        const subscription = this.safeDict (subscriptionsById, id, {});
        if (type === 'unsubscribed') {
            this.handleUnSubscription (client, subscription);
        }
        return message;
    }

    handleUnSubscription (client: Client, subscription: Dict) {
        const messageHashes = this.safeList (subscription, 'messageHashes', []);
        const subMessageHashes = this.safeList (subscription, 'subMessageHashes', []);
        for (let i = 0; i < messageHashes.length; i++) {
            const unsubHash = messageHashes[i];
            const subHash = subMessageHashes[i];
            this.cleanUnsubscription (client, subHash, unsubHash);
        }
        this.cleanCache (subscription);
    }
}
