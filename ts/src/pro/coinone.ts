
//  ---------------------------------------------------------------------------

import coinoneRest from '../coinone.js';
import { AuthenticationError } from '../base/errors.js';
import type { Int, OrderBook } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class coinone extends coinoneRest {
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
                    'ws': 'wss://stream.coinone.co.kr',
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
            'streaming': {
                'ping': this.ping,
                'keepAlive': 20000,
            },
        });
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name coinone#watchOrderBook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.coinone.co.kr/reference/public-websocket-orderbook
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
            'request_type': 'SUBSCRIBE',
            'channel': 'ORDERBOOK',
            'topic': {
                'quote_currency': market['quote'],
                'target_currency': market['base'],
            },
        };
        const message = this.extend (request, params);
        const orderbook = await this.watch (url, messageHash, message, messageHash);
        return orderbook.limit ();
    }

    handleOrderBook (client, message) {
        //
        //     {
        //         "response_type": "DATA",
        //         "channel": "ORDERBOOK",
        //         "data": {
        //             "quote_currency": "KRW",
        //             "target_currency": "BTC",
        //             "timestamp": 1705288918649,
        //             "id": "1705288918649001",
        //             "asks": [
        //                 {
        //                     "price": "58412000",
        //                     "qty": "0.59919807"
        //                 }
        //             ],
        //             "bids": [
        //                 {
        //                     "price": "58292000",
        //                     "qty": "0.1045"
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data', {});
        const baseId = this.safeStringUpper (data, 'target_currency');
        const quoteId = this.safeStringUpper (data, 'quote_currency');
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const symbol = this.symbol (base + '/' + quote);
        const timestamp = this.safeInteger (data, 'timestamp');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ();
        }
        orderbook['symbol'] = symbol;
        const asks = this.safeValue (data, 'asks', []);
        const bids = this.safeValue (data, 'bids', []);
        this.handleDeltas (orderbook['asks'], asks);
        this.handleDeltas (orderbook['bids'], bids);
        orderbook['timestamp'] = timestamp;
        orderbook['datetime'] = this.iso8601 (timestamp);
        const messageHash = 'orderbook:' + symbol;
        this.orderbooks[symbol] = orderbook;
        client.resolve (orderbook, messageHash);
    }

    handleDelta (bookside, delta) {
        const bidAsk = this.parseBidAsk (delta, 'price', 'qty');
        bookside.storeArray (bidAsk);
    }

    handleErrorMessage (client: Client, message) {
        //
        //     {
        //         "response_type": "ERROR",
        //         "error_code": 160012,
        //         "message": "Invalid Topic"
        //     }
        //
        const type = this.safeString (message, 'response_type', '');
        if (type === 'ERROR') {
            return true;
        }
        return false;
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const type = this.safeString (message, 'response_type');
        if (type === 'PONG') {
            this.handlePong (client, message);
            return;
        }
        if (type === 'DATA') {
            const topic = this.safeString (message, 'channel', '');
            const methods = {
                'ORDERBOOK': this.handleOrderBook,
            };
            const exacMethod = this.safeValue (methods, topic);
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

    ping (client) {
        return {
            'request_type': 'PING',
        };
    }

    handlePong (client: Client, message) {
        //
        //     {
        //         "response_type":"PONG"
        //     }
        //
        client.lastPong = this.nonce ();
        return message;
    }
}
