// ----------------------------------------------------------------------------

import woofiproRest from '../woofipro.js';
import { ExchangeError, AuthenticationError } from '../base/errors.js';
import { ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCache, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class woofipro extends woofiproRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchMyTrades': false,
                'watchOHLCV': true,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': true,
                'watchTickers': true,
                'watchTrades': true,
                'watchPositions': true,
            },
            'urls': {
                'api': {
                    'ws': {
                        'public': 'wss://ws-evm.orderly.org/ws/stream',
                        'private': 'wss://ws-private-evm.orderly.org/v2/ws/private/stream',
                    },
                },
                'test': {
                    'ws': {
                        'public': 'wss://testnet-ws-evm.orderly.org/ws/stream',
                        'private': 'wss://testnet-ws-private-evm.orderly.org/v2/ws/private/stream',
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
                'uid': true,
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
                'watchPositions': {
                    'fetchPositionsSnapshot': true, // or false
                    'awaitPositionsSnapshot': true, // whether to wait for the positions snapshot before providing updates
                },
            },
            'streaming': {
                'ping': this.ping,
                'keepAlive': 10000,
            },
            'exceptions': {
                'ws': {
                    'exact': {
                        'Auth is needed.': AuthenticationError,
                    },
                },
            },
        });
    }

    requestId (url) {
        const options = this.safeValue (this.options, 'requestId', {});
        const previousValue = this.safeInteger (options, url, 0);
        const newValue = this.sum (previousValue, 1);
        this.options['requestId'][url] = newValue;
        return newValue;
    }

    async watchPublic (messageHash, message) {
        const url = this.urls['api']['ws']['public'] + '/' + this.uid;
        const requestId = this.requestId (url);
        const subscribe = {
            'id': requestId,
        };
        const request = this.extend (subscribe, message);
        return await this.watch (url, messageHash, request, messageHash, subscribe);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name woofipro#watchOrderBook
         * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/orderbook
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return.
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const name = 'orderbook';
        const market = this.market (symbol);
        const topic = market['id'] + '@' + name;
        const request = {
            'event': 'subscribe',
            'topic': topic,
        };
        const message = this.extend (request, params);
        const orderbook = await this.watchPublic (topic, message);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //     {
        //         "topic": "PERP_BTC_USDT@orderbook",
        //         "ts": 1650121915308,
        //         "data": {
        //             "symbol": "PERP_BTC_USDT",
        //             "bids": [
        //                 [
        //                     0.30891,
        //                     2469.98
        //                 ]
        //             ],
        //             "asks": [
        //                 [
        //                     0.31075,
        //                     2379.63
        //                 ]
        //             ]
        //         }
        //     }
        //
        const data = this.safeValue (message, 'data');
        const marketId = this.safeString (data, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const topic = this.safeString (message, 'topic');
        let orderbook = this.safeValue (this.orderbooks, symbol);
        if (orderbook === undefined) {
            orderbook = this.orderBook ({});
        }
        const timestamp = this.safeInteger (message, 'ts');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
        orderbook.reset (snapshot);
        client.resolve (orderbook, topic);
    }

    checkRequiredUid (error = true) {
        if (!this.uid) {
            if (error) {
                throw new AuthenticationError (this.id + ' requires `uid` credential');
            } else {
                return false;
            }
        }
        return true;
    }

    handleErrorMessage (client: Client, message) {
        //
        // {"id":"1","event":"subscribe","success":false,"ts":1710780997216,"errorMsg":"Auth is needed."}
        //
        if (!('success' in message)) {
            return false;
        }
        const success = this.safeBool (message, 'success');
        if (success) {
            return false;
        }
        const errorMessage = this.safeString (message, 'errorMsg');
        try {
            if (errorMessage !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorMessage, feedback);
            }
            return false;
        } catch (error) {
            if (error instanceof AuthenticationError) {
                const messageHash = 'authenticated';
                client.reject (error, messageHash);
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            } else {
                client.reject (error);
            }
            return true;
        }
    }

    handleMessage (client: Client, message) {
        if (this.handleErrorMessage (client, message)) {
            return;
        }
        const methods = {
            'ping': this.handlePing,
            'pong': this.handlePong,
            'subscribe': this.handleSubscribe,
            'orderbook': this.handleOrderBook,
        };
        const event = this.safeString (message, 'event');
        let method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
            return;
        }
        const topic = this.safeString (message, 'topic');
        if (topic !== undefined) {
            method = this.safeValue (methods, topic);
            if (method !== undefined) {
                method.call (this, client, message);
                return;
            }
            const splitTopic = topic.split ('@');
            const splitLength = splitTopic.length;
            if (splitLength === 2) {
                const name = this.safeString (splitTopic, 1);
                method = this.safeValue (methods, name);
                if (method !== undefined) {
                    method.call (this, client, message);
                    return;
                }
                const splitName = name.split ('_');
                const splitNameLength = splitTopic.length;
                if (splitNameLength === 2) {
                    method = this.safeValue (methods, this.safeString (splitName, 0));
                    if (method !== undefined) {
                        method.call (this, client, message);
                    }
                }
            }
        }
    }

    ping (client: Client) {
        return { 'event': 'ping' };
    }

    handlePing (client: Client, message) {
        return { 'event': 'pong' };
    }

    handlePong (client: Client, message) {
        //
        // { event: "pong", ts: 1614667590000 }
        //
        client.lastPong = this.milliseconds ();
        return message;
    }

    handleSubscribe (client: Client, message) {
        //
        //     {
        //         "id": "666888",
        //         "event": "subscribe",
        //         "success": true,
        //         "ts": 1657117712212
        //     }
        //
        return message;
    }
}
