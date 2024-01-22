
//  ---------------------------------------------------------------------------

import coinmateRest from '../coinmate.js';
import { AuthenticationError } from '../base/errors.js';
import type { Int, OrderBook } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class coinmate extends coinmateRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTrades': false,
                'watchOHLCV': false,
                'watchTicker': false,
                'watchTickers': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://coinmate.io/api/websocket',
                },
            },
            'options': {
                'expiresIn': '',
                'userId': '',
                'wsSessionToken': '',
                'watchOrderBook': {
                    'snapshotDelay': 6,
                    'snapshotMaxRetries': 3,
                },
                'tradesLimit': 1000,
                'OHLCVLimit': 1000,
            },
            'exceptions': {
                'exact': {
                    '4009': AuthenticationError,
                },
            },
        });
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coinmate#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://coinmate.docs.apiary.io/#introduction/public-channels/order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'orderbook:' + market['symbol'];
        const url = this.urls['api']['ws'];
        const request = {
            'event': 'subscribe',
            'data': {
                'channel': 'order_book-' + market['id'],
            },
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         "channel": "order_book-BTC_EUR",
        //         "payload": {
        //             "bids": [
        //                 {
        //                     "price": 37875.8,
        //                     "amount": 0.0002894
        //                 }
        //             ],
        //             "asks": [
        //                 {
        //                     "price": 37914.7,
        //                     "amount": 0.44199852
        //                 }
        //             ]
        //         },
        //         "event": "data"
        //     }
        //
        const data = this.safeValue (message, 'payload', {});
        const topic = this.safeString (message, 'channel');
        const part = topic.split ('-');
        const symbol = this.symbol (this.safeString (part, 1));
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        } else {
            orderbook.reset ();
        }
        orderbook['symbol'] = symbol;
        const asks = this.safeValue (data, 'asks', []);
        const bids = this.safeValue (data, 'bids', []);
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        const messageHash = 'orderbook:' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 'price', 'amount');
        bookside.storeArray (bidAsk);
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         "message": "Websocket error",
        //         "event": "error"
        //     }
        //
        const type = this.safeString (message, 'event', '');
        if (type === 'error') {
            return true;
        }
        return false;
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const event = this.safeString (message, 'event');
        if (event === 'data') {
            const topic = this.safeString (message, 'channel', '');
            // trades-{CURRENCY_PAIR}
            // order_book-{CURRENCY_PAIR}
            // statistics-{CURRENCY_PAIR}
            // private-open_orders-{ACCOUNT_ID}-{CURRENCY_PAIR}
            // private-open_orders-{ACCOUNT_ID}
            // private-user_balances-{ACCOUNT_ID}
            // private-user-trades-{ACCOUNT_ID}-{CURRENCY_PAIR}
            // private-user-trades-{ACCOUNT_ID}
            // private-user-transfers-{ACCOUNT_ID}
            const channelSplit = topic.split ('-');
            const methods = {
                'order_book': this.handleOrderBook,
            };
            const exacMethod = this.safeValue (methods, this.safeString (channelSplit, 0));
            if (exacMethod !== undefined) {
                exacMethod.call (this, client, message);
                return;
            }
            const keys = Object.keys (methods);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (topic.indexOf (keys[i]) >= 0) {
                    const method = methods[key];
                    method.call (this, client, message);
                    return;
                }
            }
        }
    }
}
