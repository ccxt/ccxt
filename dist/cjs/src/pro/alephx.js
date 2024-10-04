'use strict';

var alephx$1 = require('../alephx.js');
var errors = require('../base/errors.js');
var Cache = require('../base/ws/Cache.js');
var sha256 = require('../static_dependencies/noble-hashes/sha256.js');

//  ---------------------------------------------------------------------------
//  ---------------------------------------------------------------------------
class alephx extends alephx$1 {
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'ws': true,
                'cancelAllOrdersWs': false,
                'cancelOrdersWs': false,
                'cancelOrderWs': false,
                'createOrderWs': false,
                'editOrderWs': false,
                'fetchBalanceWs': false,
                'fetchOpenOrdersWs': false,
                'fetchOrderWs': false,
                'fetchTradesWs': false,
                'watchBalance': false,
                'watchMyTrades': true,
                'watchOHLCV': false,
                'watchOrderBook': false,
                'watchOrderBookForSymbols': false,
                'watchOrders': true,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': false,
                'watchTradesForSymbols': false,
            },
            'urls': {
                'api': {
                    'ws': 'wss://api.alephx.xyz/websocket',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
                'myTradesLimit': 1000,
                'sides': {
                    'bid': 'bids',
                    'offer': 'asks',
                },
            },
        });
    }
    async subscribe(name, isPrivate, symbol = undefined, params = {}) {
        /**
         * @ignore
         * @method
         * @description subscribes to a websocket channel
         * @see https://api.alephx.xyz/websocket
         * @param {string} name the name of the channel
         * @param {string|string[]} [symbol] unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} subscription to a websocket channel
         */
        let url = this.urls['api']['ws'];
        let messageHash = name;
        if (isPrivate) {
            const auth = this.createWSAuth();
            url = url + '?api_key=' + auth['api_key'] + '&timestamp=' + auth['timestamp'] + '&signature=' + auth['signature'];
            messageHash = messageHash + ':' + auth['api_key'];
        }
        const subscribe = {
            'event': 'phx_join',
            'topic': messageHash,
            'payload': {},
            'ref': messageHash,
            'join_ref': messageHash,
        };
        return await this.watch(url, messageHash, subscribe, messageHash);
    }
    createWSAuth() {
        const subscribe = {};
        const timestamp = this.numberToString(this.seconds());
        this.checkRequiredCredentials();
        const auth = timestamp;
        subscribe['api_key'] = this.apiKey;
        subscribe['timestamp'] = timestamp;
        subscribe['signature'] = this.hmac(this.encode(auth), this.encode(this.secret), sha256.sha256);
        return subscribe;
    }
    async watchMyTrades(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name alephx#watchMyTrades
         * @description watches information on multiple trades made by the user
         * @see trades channel
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        const name = 'trades';
        const trades = await this.subscribe(name, true, symbol, params);
        if (this.newUpdates) {
            limit = trades.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(trades, since, limit, 'timestamp', true);
    }
    async watchOrders(symbol = undefined, since = undefined, limit = undefined, params = {}) {
        /**
         * @method
         * @name alephx#watchOrders
         * @description watches information on multiple orders made by the user
         * @see orders channel
         * @param {string} [symbol] unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        const name = 'orders';
        const orders = await this.subscribe(name, true, symbol, params);
        if (this.newUpdates) {
            limit = orders.getLimit(symbol, limit);
        }
        return this.filterBySinceLimit(orders, since, limit, 'timestamp', true);
    }
    handleTrade(client, message) {
        // {
        //     ref: null,
        //     payload: {
        //       timestamp: '2024-10-04T03:11:30.111216Z',
        //       channel: 'trades',
        //       trade: {
        //         symbol: 'CLEO-ALEO',
        //         price: '1.1',
        //         base_quantity: '0.1',
        //         quote_quantity: '0.11',
        //         buy_order_id: 'ad2066e6-a47c-449d-99be-79ac82e7d163',
        //         sell_order_id: '1676786b-145f-4dcf-adde-74e5cce9ebc3',
        //         status: 'unsettled',
        //         aggressor_side: 'sell',
        //         id: 'e0b8354a-d71a-4577-bee5-ce52d8fabcf5',
        //         fee: null,
        //         fee_asset: null
        //       }
        //     },
        //     topic: 'trades:cb77b9ab-f94d-4013-85b7-644b0b9ba9a9',
        //     event: 'trades'
        //   }
        if (this.myTrades === undefined) {
            const limit = this.safeInteger(this.options, 'tradesLimit', 1000);
            this.myTrades = new Cache.ArrayCacheBySymbolById(limit);
        }
        const payload = this.safeDict(message, 'payload');
        const trade = this.safeDict(payload, 'trade');
        const parsed = this.parseWsTrade(trade);
        this.myTrades.append(parsed);
        const messageHash = this.safeString(message, 'topic');
        client.resolve(this.myTrades, messageHash);
        return message;
    }
    parseWsTrade(trade, market = undefined) {
        //      {
        //         symbol: 'CLEO-ALEO',
        //         price: '1.1',
        //         base_quantity: '0.1',
        //         quote_quantity: '0.11',
        //         buy_order_id: 'ad2066e6-a47c-449d-99be-79ac82e7d163',
        //         sell_order_id: '1676786b-145f-4dcf-adde-74e5cce9ebc3',
        //         status: 'unsettled',
        //         aggressor_side: 'sell',
        //         id: 'e0b8354a-d71a-4577-bee5-ce52d8fabcf5',
        //         fee: null,
        //         fee_asset: null
        //       }
        const createdDateTime = this.safeString(trade, 'inserted_at');
        const traderSide = this.safeString(trade, 'side');
        const traderOrderId = traderSide === 'buy' ? this.safeString(trade, 'buy_order_id') : this.safeString(trade, 'sell_order_id');
        return this.safeTrade({
            'id': this.safeString(trade, 'id'),
            'order': traderOrderId,
            'info': trade,
            'timestamp': this.parse8601(createdDateTime),
            'datetime': createdDateTime,
            'symbol': this.safeString(trade, 'symbol'),
            'type': 'gtc',
            'side': traderSide,
            'takerOrMaker': undefined,
            'price': this.safeString(trade, 'price'),
            'amount': this.safeString(trade, 'base_quantity'),
            'cost': this.safeString(trade, 'quote_quantity'),
            'fee': {
                'cost': this.safeString(trade, 'fee'),
                'currency': this.safeString(trade, 'fee_asset'),
            },
        }, market);
    }
    handleOrder(client, message) {
        // {
        //     ref: null,
        //     payload: {
        //       timestamp: '2024-10-04T02:29:36.263148Z',
        //       channel: 'orders',
        //       order: {
        //         id: 'eed7ce96-f34b-483d-8d87-925eef6f0702',
        //         status: 'new',
        //         type: 'limit',
        //         symbol: 'CLEO-ALEO',
        //         inserted_at: '2024-10-04T02:29:35.693172Z',
        //         account_id: 'cb77b9ab-f94d-4013-85b7-644b0b9ba9a9',
        //         updated_at: '2024-10-04T02:29:36.254349Z',
        //         filled_quantity: '0',
        //         base_quantity: '0.1',
        //         idempotency_key: '99888999-93ef-9831-9829-820a082bfcf8',
        //         price: '1.1',
        //         remained_quantity: '0.1',
        //         side: 'buy',
        //         time_in_force: 'gtc',
        //         canceled_at: null,
        //         average_filled_price: null,
        //         canceled_quantity: '0',
        //         cumulative_fee: '0',
        //         fee_asset: null,
        //         filled_at: null,
        //         filled_value: '0',
        //         lock_version: 3,
        //         quote_quantity: null,
        //         sequence_id: 187,
        //         settled_quantity: '0'
        //       }
        //     },
        //     topic: 'orders:cb77b9ab-f94d-4013-85b7-644b0b9ba9a9',
        //     event: 'orders'
        //   }
        if (this.orders === undefined) {
            const limit = this.safeInteger(this.options, 'ordersLimit', 1000);
            this.orders = new Cache.ArrayCacheBySymbolById(limit);
        }
        const payload = this.safeDict(message, 'payload');
        const order = this.safeDict(payload, 'order');
        const parsed = this.parseWsOrder(order);
        this.orders.append(parsed);
        const messageHash = this.safeString(message, 'topic');
        client.resolve(this.orders, messageHash);
        return message;
    }
    parseWsOrder(order, market = undefined) {
        //      {
        //         id: 'eed7ce96-f34b-483d-8d87-925eef6f0702',
        //         status: 'new',
        //         type: 'limit',
        //         symbol: 'CLEO-ALEO',
        //         inserted_at: '2024-10-04T02:29:35.693172Z',
        //         account_id: 'cb77b9ab-f94d-4013-85b7-644b0b9ba9a9',
        //         updated_at: '2024-10-04T02:29:36.254349Z',
        //         filled_quantity: '0',
        //         base_quantity: '0.1',
        //         idempotency_key: '99888999-93ef-9831-9829-820a082bfcf8',
        //         price: '1.1',
        //         remained_quantity: '0.1',
        //         side: 'buy',
        //         time_in_force: 'gtc',
        //         canceled_at: null,
        //         average_filled_price: null,
        //         canceled_quantity: '0',
        //         cumulative_fee: '0',
        //         fee_asset: null,
        //         filled_at: null,
        //         filled_value: '0',
        //         lock_version: 3,
        //         quote_quantity: null,
        //         sequence_id: 187,
        //         settled_quantity: '0'
        //       }
        const id = this.safeString(order, 'id');
        const clientOrderId = this.safeString(order, 'idempotency_key');
        const createdDateTime = this.safeString(order, 'inserted_at');
        const filledDateTime = this.safeString(order, 'filled_at');
        const updatedDateTime = this.safeString(order, 'updated_at');
        return this.safeOrder({
            'info': order,
            'symbol': this.safeString(order, 'symbol'),
            'id': id,
            'clientOrderId': clientOrderId,
            'timestamp': this.parse8601(createdDateTime),
            'datetime': createdDateTime,
            'lastTradeTimestamp': filledDateTime ? this.parse8601(filledDateTime) : undefined,
            'type': this.safeString(order, 'type'),
            'timeInForce': this.safeString(order, 'time_in_force', 'gtc'),
            'postOnly': true,
            'side': this.safeString(order, 'side'),
            'price': this.safeString(order, 'price'),
            'stopPrice': undefined,
            'triggerPrice': undefined,
            'amount': this.safeString(order, 'base_quantity'),
            'cost': undefined,
            'average': this.safeString(order, 'average_filled_price'),
            'filled': this.safeString(order, 'filled_quantity'),
            'remaining': this.safeString(order, 'remained_quantity'),
            'status': this.safeStringLower(order, 'status'),
            'fee': {
                'amount': this.safeString(order, 'cumulative_fee'),
                'currency': this.safeString(market, 'fee_asset'),
            },
            'trades': undefined,
            'lastUpdatedTimestamp': updatedDateTime ? this.parse8601(updatedDateTime) : undefined,
        });
    }
    handleSubscriptionStatus(client, message) {
        //
        //     {
        //         "type": "subscriptions",
        //         "channels": [
        //             {
        //                 "name": "level2",
        //                 "product_ids": [ "ETH-BTC" ]
        //             }
        //         ]
        //     }
        //
        return message;
    }
    handleHeartbeats(client, message) {
        // although the subscription takes a product_ids parameter (i.e. symbol),
        // there is no (clear) way of mapping the message back to the symbol.
        //
        //     {
        //         "channel": "heartbeats",
        //         "client_id": "",
        //         "timestamp": "2023-06-23T20:31:26.122969572Z",
        //         "sequence_num": 0,
        //         "events": [
        //           {
        //               "current_time": "2023-06-23 20:31:56.121961769 +0000 UTC m=+91717.525857105",
        //               "heartbeat_counter": "3049"
        //           }
        //         ]
        //     }
        //
        return message;
    }
    handleMessage(client, message) {
        const channel = this.safeString(this.safeDict(message, 'payload'), 'channel');
        const methods = {
            // 'subscriptions': this.handleSubscriptionStatus,
            'trades': this.handleTrade,
            'orders': this.handleOrder,
            // 'heartbeats': this.handleHeartbeats,
        };
        const type = this.safeString(message, 'type');
        if (type === 'error') {
            const errorMessage = this.safeString(message, 'message');
            throw new errors.ExchangeError(errorMessage);
        }
        const method = this.safeValue(methods, channel);
        if (method) {
            method.call(this, client, message);
        }
    }
}

module.exports = alephx;
