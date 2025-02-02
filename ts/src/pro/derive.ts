// ----------------------------------------------------------------------------

import deriveRest from '../derive.js';
import { ExchangeError, AuthenticationError } from '../base/errors.js';
import { ArrayCacheByTimestamp, ArrayCacheBySymbolById, ArrayCache, ArrayCacheBySymbolBySide } from '../base/ws/Cache.js';
import { Precise } from '../base/Precise.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances, Position, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';

// ----------------------------------------------------------------------------

export default class derive extends deriveRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': false,
                'watchBalance': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrders': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchBidsAsks': false,
                'watchTrades': false,
                'watchTradesForSymbols': false,
                'watchPositions': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.lyra.finance/ws',
                },
                'test': {
                    'ws': 'wss://api-demo.lyra.finance/ws',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'requestId': {},
                'watchPositions': {
                    'fetchPositionsSnapshot': true,
                    'awaitPositionsSnapshot': true,
                },
            },
            'streaming': {
                'keepAlive': 9000,
            },
            'exceptions': {
                'ws': {
                    'exact': {},
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

    async watchPublic (messageHash, message, subscription) {
        const url = this.urls['api']['ws'];
        const requestId = this.requestId (url);
        const request = this.extend (message, {
            'id': requestId,
        });
        subscription = this.extend (subscription, {
            'id': requestId,
        });
        return await this.watch (url, messageHash, request, messageHash, subscription);
    }

    /**
     * @method
     * @name derive#watchOrderBook
     * @see https://docs.derive.xyz/reference/orderbook-instrument_name-group-depth
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        if (limit === undefined) {
            limit = 10;
        }
        const market = this.market (symbol);
        const topic = 'orderbook.' + market['id'] + '.10.' + this.numberToString (limit);
        const request: Dict = {
            'method': 'subscribe',
            'params': {
                'channels': [
                    topic,
                ],
            },
        };
        const subscription: Dict = {
            'name': topic,
            'symbol': symbol,
            'limit': limit,
            'params': params,
        };
        const orderbook = await this.watchPublic (topic, request, subscription);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        // {
        //     method: 'subscription',
        //     params: {
        //       channel: 'orderbook.BTC-PERP.10.1',
        //       data: {
        //         timestamp: 1738331231506,
        //         instrument_name: 'BTC-PERP',
        //         publish_id: 628419,
        //         bids: [ [ '104669', '40' ] ],
        //         asks: [ [ '104736', '40' ] ]
        //       }
        //     }
        // }
        //
        const params = this.safeDict (message, 'params');
        const data = this.safeDict (params, 'data');
        const marketId = this.safeString (data, 'instrument_name');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const topic = this.safeString (params, 'channel');
        if (!(symbol in this.orderbooks)) {
            const defaultLimit = this.safeInteger (this.options, 'watchOrderBookLimit', 1000);
            const subscription = client.subscriptions[topic];
            const limit = this.safeInteger (subscription, 'limit', defaultLimit);
            this.orderbooks[symbol] = this.orderBook ({}, limit);
        }
        const orderbook = this.orderbooks[symbol];
        const timestamp = this.safeInteger (data, 'timestamp');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks');
        orderbook.reset (snapshot);
        client.resolve (orderbook, topic);
    }

    handleErrorMessage (client: Client, message) {
        //
        // {
        //     id: '690c6276-0fc6-4121-aafa-f28bf5adedcb',
        //     error: { code: -32600, message: 'Invalid Request' }
        // }
        //
        if (!('error' in message)) {
            return false;
        }
        const error = this.safeDict (message, 'error');
        const errorCode = this.safeString (error, 'code');
        try {
            if (errorCode !== undefined) {
                const feedback = this.id + ' ' + this.json (message);
                this.throwExactlyMatchedException (this.exceptions['exact'], errorCode, feedback);
                throw new ExchangeError (feedback);
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
        const methods: Dict = {
            'orderbook': this.handleOrderBook,
        };
        // call this.handleSubscribe if needed
        // or throw error if event is not subscribe
        // const event = this.safeString (message, 'method');
        // if (event === undefined) {}
        let event = undefined;
        const params = this.safeDict (message, 'params');
        if (params !== undefined) {
            const channel = this.safeString (params, 'channel');
            if (channel !== undefined) {
                const parsedChannel = channel.split ('.');
                event = this.safeString (parsedChannel, 0);
            }
        }
        let method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
            return;
        }
    }

    handleSubscribe (client: Client, message) {
        //
        // {
        //     id: 1,
        //     result: {
        //       status: { 'orderbook.BTC-PERP.10.1': 'ok' },
        //       current_subscriptions: [ 'orderbook.BTC-PERP.10.1' ]
        //     }
        // }
        //
        // const id = this.safeString (message, 'id');
        // const subscriptionsById = this.indexBy (client.subscriptions, 'id');
        // const subscription = this.safeValue (subscriptionsById, id, {});
        // const method = this.safeValue (subscription, 'method');
        // if (method !== undefined) {
        //     method.call (this, client, message, subscription);
        // }
        return message;
    }

    handleAuth (client: Client, message) {
        //
        //     {
        //         "event": "auth",
        //         "success": true,
        //         "ts": 1657463158812
        //     }
        //
        const messageHash = 'authenticated';
        const success = this.safeValue (message, 'success');
        if (success) {
            // client.resolve (message, messageHash);
            const future = this.safeValue (client.futures, 'authenticated');
            future.resolve (true);
        } else {
            const error = new AuthenticationError (this.json (message));
            client.reject (error, messageHash);
            // allows further authentication attempts
            if (messageHash in client.subscriptions) {
                delete client.subscriptions['authenticated'];
            }
        }
    }
}
