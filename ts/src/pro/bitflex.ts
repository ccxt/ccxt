//  ---------------------------------------------------------------------------

import bitflexRest from '../bitflex.js';
import type { Int, OrderBook } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------
export default class bitflex extends bitflexRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': false,
                'watchMyTrades': false,
                'watchOrders': false,
                'watchOrderBook': true,
                'watchOHLCV': false,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://wsapi.bitflex.com/openapi/quote/ws/v2',
                        'private': 'wss://wsapi.bitflex.com/openapi/ws',
                    },
                },
            },
            'exceptions': {
                'exact': {
                    // { code: '-100003', desc: 'Symbol required!' }
                },
                'broad': {
                },
            },
        });
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name bitflex#watchOrderBook
         * @see https://docs.bitflex.com/websocket-v2
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        // todo should we use limit?
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'book:' + symbol;
        const request = {
            'topic': 'depth',
            'event': 'sub',
            'params': {
                'binary': false,
                'symbol': market['id'],
            },
        };
        const url = this.urls['api']['ws']['public'];
        const orderbook = await this.watch (url, messageHash, this.extend (request, params), messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         topic: 'depth',
        //         params: { symbol: 'ETHUSDT', binary: 'false', symbolName: 'ETHUSDT' },
        //         data: {
        //             s: 'ETHUSDT',
        //             t: 1713864203648,
        //             v: '32619510_2',
        //             b: [
        //                 [ '3172.74', '0.12' ],
        //                  ...
        //             ],
        //             a: [
        //                 [ '3172.74', '0.12' ],
        //                  ...
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const params = this.safeDict (message, 'params', {});
        const marketId = this.safeString (params, 'symbol');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (data, 't');
        const messageHash = 'book:' + symbol;
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        const orderbook = this.orderbooks[symbol];
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'b', 'a');
        orderbook.reset (snapshot);
        const nonceString = this.safeString (data, 'v');
        const parts = nonceString.split ('_');
        orderbook['nonce'] = this.parseToInt (parts[0]); // todo check
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleMessage (client: Client, message) {
        //
        //     {
        //         topic: 'depth',
        //         event: 'sub',
        //         params: { symbol: 'ETHUSDT', binary: 'false', symbolName: 'ETHUSDT' },
        //         code: '0',
        //         msg: 'Success'
        //     }
        //
        //     {
        //         topic: 'depth',
        //         params: { symbol: 'ETHUSDT', binary: 'false', symbolName: 'ETHUSDT' },
        //         data: {
        //             s: 'ETHUSDT',
        //             t: 1713864203648,
        //             v: '32619510_2',
        //             b: [
        //                 [Array], ...
        //             ],
        //             a: [
        //                 [Array], ...
        //             ]
        //         }
        //     }
        //
        const topic = this.safeString (message, 'topic', '');
        const data = this.safeDict (message, 'data');
        if (data !== undefined) {
            if (topic === 'depth') {
                this.handleOrderBook (client, message);
            }
        }
    }
}
