// ----------------------------------------------------------------------------

import extendedRest from '../extended.js';
import { ExchangeError, InvalidNonce } from '../base/errors.js';
import type { Bool, Int, OrderBook } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class extended extends extendedRest {
    describe (): any {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchOrderBook': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.starknet.extended.exchange/stream.extended.exchange/v1',
                },
                'test': {
                    'ws': 'wss://starknet.sepolia.extended.exchange/stream.extended.exchange/v1',
                },
            },
            'options': {
                'ws': {
                    'options': {
                        'headers': {
                            'User-Agent': this.userAgents['chrome'],
                        },
                    },
                },
            },
        });
    }

    /**
     * @method
     * @name extended#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.docs.extended.exchange/#order-book-stream
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.depth] set to '1' to receive best bid and ask snapshots only
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const query = this.urlencode (params);
        let url = this.urls['api']['ws'] + '/orderbooks/' + market['id'];
        if (query.length > 0) {
            url += '?' + query;
        }
        const orderbook = await this.watch (url, messageHash, undefined, messageHash, {
            'symbol': symbol,
            'limit': limit,
        });
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "ts": 1701563440000,
        //         "type": "SNAPSHOT",
        //         "data": {
        //             "m": "BTC-USD",
        //             "b": [
        //                 { "p": "25670", "q": "0.1" }
        //             ],
        //             "a": [
        //                 { "p": "25770", "q": "0.1" }
        //             ]
        //         },
        //         "seq": 1
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (data, 'm');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const messageHash = 'orderbook:' + symbol;
        const timestamp = this.safeInteger (message, 'ts');
        const nonce = this.safeInteger (message, 'seq');
        const type = this.safeString (message, 'type', this.safeString (data, 't'));
        if (!(symbol in this.orderbooks)) {
            const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            const subscription = this.safeDict (client.subscriptions, messageHash, {});
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        if (type === 'SNAPSHOT') {
            const snapshot = this.parseOrderBook (data, symbol, timestamp, 'b', 'a', 'p', 'q');
            snapshot['nonce'] = nonce;
            orderbook.reset (snapshot);
            client.resolve (orderbook, messageHash);
            return;
        }
        const previousNonce = this.safeInteger (orderbook, 'nonce');
        if ((previousNonce !== undefined) && (nonce !== previousNonce + 1)) {
            delete client.subscriptions[messageHash];
            delete this.orderbooks[symbol];
            client.reject (new InvalidNonce (this.id + ' watchOrderBook received invalid nonce'), messageHash);
            return;
        }
        this.handleDeltas (orderbook['bids'], this.safeList (data, 'b', []));
        this.handleDeltas (orderbook['asks'], this.safeList (data, 'a', []));
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        orderbook['nonce'] = nonce;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        const price = this.safeFloat (delta, 'p');
        const amount = this.safeFloat2 (delta, 'c', 'q');
        bookside.store (price, amount);
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    handleErrorMessage (client: Client, message): Bool {
        //
        //     { "status": "ERROR", "error": { "code": 1001, "message": "Market not found." } }
        //
        const error = this.safeValue (message, 'error');
        if (error === undefined) {
            return false;
        }
        const feedback = this.id + ' ' + this.json (message);
        const errorCode = this.safeString (error, 'code');
        this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
        const errorMessage = this.safeString (error, 'message');
        this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
        throw new ExchangeError (feedback);
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const data = this.safeDict (message, 'data');
        const marketId = this.safeString (data, 'm');
        if (marketId !== undefined) {
            this.handleOrderBook (client, message);
        }
    }
}
