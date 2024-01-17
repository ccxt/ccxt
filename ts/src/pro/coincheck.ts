
//  ---------------------------------------------------------------------------

import coincheckRest from '../coincheck.js';
import { AuthenticationError } from '../base/errors.js';
import type { Int, OrderBook } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class coincheck extends coincheckRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchTrades': false,
                'watchOHLCV': false,
                'watchTicker': false,
                'watchTickers': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws-api.coincheck.com/',
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
         * @name coincheck#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://coincheck.com/documents/exchange/api#websocket-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'orderbook:' + symbol;
        const url = this.urls['api']['ws'];
        const request = {
            'type': 'subscribe',
            'channel': market['id'] + '-orderbook',
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        //     [
        //         "btc_jpy",
        //         {
        //             "bids": [
        //                 [
        //                     "6288279.0",
        //                     "0"
        //                 ]
        //             ],
        //             "asks": [
        //                 [
        //                     "6290314.0",
        //                     "0"
        //                 ]
        //             ],
        //             "last_update_at": "1705396097"
        //         }
        //     ]
        //
        const symbol = this.symbol (this.safeString (message, 0));
        const data = this.safeValue (message, 1, {});
        const timestamp = this.safeTimestamp (data, 'last_update_at');
        const snapshot = this.parseOrderBook (data, symbol, timestamp);
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook (snapshot);
            this.orderbooks[symbol] = orderbook;
        } else {
            orderbook = this.orderbooks[symbol];
            orderbook.reset (snapshot);
        }
        const messageHash = 'orderbook:' + symbol;
        client.resolve (orderbook, messageHash);
    }

    handleMessage (client: Client, message) {
        const data = this.safeValue (message, 0);
        if (!Array.isArray (data)) {
            this.handleOrderBook.call (this, client, message);
        }
    }
}
