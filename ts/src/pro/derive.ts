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
                'watchOrderBook': true,
                'watchOrders': false,
                'watchTicker': true,
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

    /**
     * @method
     * @name derive#watchTicker
     * @see https://docs.derive.xyz/reference/ticker-instrument_name-interval
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const topic = 'ticker.' + market['id'] + '.100';
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
            'params': params,
        };
        return await this.watchPublic (topic, request, subscription);
    }

    handleTicker (client: Client, message) {
        //
        // {
        //     method: 'subscription',
        //     params: {
        //       channel: 'ticker.BTC-PERP.100',
        //       data: {
        //         timestamp: 1738485104439,
        //         instrument_ticker: {
        //           instrument_type: 'perp',
        //           instrument_name: 'BTC-PERP',
        //           scheduled_activation: 1701840228,
        //           scheduled_deactivation: '9223372036854775807',
        //           is_active: true,
        //           tick_size: '0.1',
        //           minimum_amount: '0.01',
        //           maximum_amount: '10000',
        //           amount_step: '0.001',
        //           mark_price_fee_rate_cap: '0',
        //           maker_fee_rate: '0.0001',
        //           taker_fee_rate: '0.0003',
        //           base_fee: '0.1',
        //           base_currency: 'BTC',
        //           quote_currency: 'USD',
        //           option_details: null,
        //           perp_details: {
        //             index: 'BTC-USD',
        //             max_rate_per_hour: '0.004',
        //             min_rate_per_hour: '-0.004',
        //             static_interest_rate: '0.0000125',
        //             aggregate_funding: '10581.779418721074588722',
        //             funding_rate: '0.000024792239208858'
        //           },
        //           erc20_details: null,
        //           base_asset_address: '0xDBa83C0C654DB1cd914FA2710bA743e925B53086',
        //           base_asset_sub_id: '0',
        //           pro_rata_fraction: '0',
        //           fifo_min_allocation: '0',
        //           pro_rata_amount_step: '0.1',
        //           best_ask_amount: '0.131',
        //           best_ask_price: '99898.6',
        //           best_bid_amount: '0.056',
        //           best_bid_price: '99889.1',
        //           five_percent_bid_depth: '11.817',
        //           five_percent_ask_depth: '9.116',
        //           option_pricing: null,
        //           index_price: '99883.8',
        //           mark_price: '99897.52408421244763303548098',
        //           stats: {
        //             contract_volume: '92.395',
        //             num_trades: '2924',
        //             open_interest: '33.743468027373780786',
        //             high: '102320.4',
        //             low: '99064.3',
        //             percent_change: '-0.021356',
        //             usd_change: '-2178'
        //           },
        //           timestamp: 1738485165881,
        //           min_price: '97939.1',
        //           max_price: '101895.2'
        //         }
        //       }
        //     }
        // }
        //
        const params = this.safeDict (message, 'params');
        const rawData = this.safeDict (params, 'data');
        const data = this.safeDict (rawData, 'instrument_ticker');
        const topic = this.safeValue (params, 'channel');
        const ticker = this.parseTicker (data);
        this.tickers[ticker['symbol']] = ticker;
        client.resolve (ticker, topic);
        return message;
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
            'ticker': this.handleTicker,
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
