
//  ---------------------------------------------------------------------------

import bit2meRest from '../bit2me.js';
import { ArgumentsRequired, AuthenticationError, ExchangeError, NotSupported } from '../base/errors.js';
import { Precise } from '../base/Precise.js';
import { ArrayCache, ArrayCacheBySymbolById } from '../base/ws/Cache.js';
import type { Int, Str, OrderBook, Trade, Order, Balances, Dict, Num, OrderSide, OrderType, Market } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class bit2me extends bit2meRest {
    override describe (): Dict {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'cancelAllOrdersWs': true,
                'cancelOrdersWs': true,
                'cancelOrderWs': true,
                'createOrderWs': true,
                'watchBalance': true,
                'watchMyTrades': true,
                'watchOHLCV': false,
                'watchOrderBook': true,
                'watchOrders': true,
                'watchTicker': false,
                'watchTickers': false,
                'watchTrades': true,
            },
            'urls': {
                'api': {
                    'ws': 'wss://ws.bit2me.com/v1/trading',
                },
            },
            'options': {
                'tradesLimit': 1000,
                'ordersLimit': 1000,
            },
            'streaming': {},
        });
    }

    /**
     * @ignore
     * @method
     * @name bit2me#subscribePublic
     * @description subscribes to a public channel of one market
     * @param {string} name the channel name
     * @param {string} symbol unified market symbol
     * @param {string} messageHash the message hash the subscription resolves
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the resolved value of the subscription
     */
    async subscribePublic (name: string, symbol: string, messageHash: string, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'event': 'subscribe',
            'symbol': market['id'],
            'subscription': {
                'name': name,
            },
        };
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    /**
     * @ignore
     * @method
     * @name bit2me#subscribePrivate
     * @description subscribes to a private channel of the account
     * @param {string} name the channel name
     * @param {string} messageHash the message hash the subscription resolves
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the resolved value of the subscription
     */
    async subscribePrivate (name: string, messageHash: string, params = {}) {
        await this.loadMarkets ();
        await this.authenticate ();
        const url = this.urls['api']['ws'];
        const request: Dict = {
            'event': 'subscribe',
            'subscription': {
                'name': name,
            },
        };
        return await this.watch (url, messageHash, this.extend (request, params), name);
    }

    /**
     * @method
     * @name bit2me#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.bit2me.com/docs/pro/websocket-public
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures](https://docs.ccxt.com/#/?id=order-book-structure) indexed by market symbols
     */
    override async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'orderbook:' + market['symbol'];
        const orderbook = await this.subscribePublic ('order-book', symbol, messageHash, params);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message: Dict) {
        //
        // every message is a full snapshot of the book
        //
        //     {
        //         "event": "order-book",
        //         "symbol": "BTC/USDC",
        //         "data": {
        //             "symbol": "BTC/USDC",
        //             "bids": [ [ 73766.09, 0.96337377 ], [ 73766.08, 0.001 ] ],
        //             "asks": [ [ 73797.26, 0.0015 ], [ 73800, 0.2 ] ],
        //             "nonce": 1794378421058
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const timestamp = this.safeInteger (data, 'nonce');
        const snapshot = this.parseOrderBook (data, symbol, timestamp, 'bids', 'asks', 0, 1);
        snapshot['nonce'] = timestamp;
        if (!(symbol in this.orderbooks)) {
            this.orderbooks[symbol] = this.orderBook ({});
        }
        const orderbook = this.orderbooks[symbol];
        orderbook.reset (snapshot);
        client.resolve (orderbook, 'orderbook:' + symbol);
    }

    /**
     * @method
     * @name bit2me#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.bit2me.com/docs/pro/websocket-public
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    override async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const messageHash = 'trades:' + market['symbol'];
        const trades = await this.subscribePublic ('public-trades', symbol, messageHash, params);
        let finalLimit = limit;
        if (this.newUpdates) {
            finalLimit = trades.getLimit (market['symbol'], limit);
        }
        return this.filterBySinceLimit (trades, since, finalLimit, 'timestamp', true);
    }

    handleTrades (client: Client, message: Dict) {
        //
        //     {
        //         "event": "public-trades",
        //         "symbol": "BTC/USDC",
        //         "data": {
        //             "side": "buy",
        //             "price": 73797.26,
        //             "amount": 0.0015,
        //             "timestamp": 1794378421725
        //         }
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const data = this.safeDict (message, 'data', {});
        const trade = this.parseWsTrade (data, market);
        if (!(symbol in this.trades)) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const tradesArray = this.trades[symbol];
        tradesArray.append (trade);
        client.resolve (tradesArray, 'trades:' + symbol);
    }

    override parseWsTrade (trade: Dict, market: Market = undefined): Trade {
        //
        // public-trades
        //
        //     {
        //         "side": "buy",
        //         "price": 73797.26,
        //         "amount": 0.0015,
        //         "timestamp": 1794378421725
        //     }
        //
        // my-trades
        //
        //     {
        //         "id": "9adb20ae-f673-49a4-b232-75442e3af617",
        //         "userId": "7bd4cc22-7682-4e45-85b3-29386b979d75",
        //         "timestamp": 1665997927993,
        //         "datetime": "2022-10-17T09:12:07.993Z",
        //         "symbol": "B2M/EUR",
        //         "order": "69d3df53-9248-430c-9850-d72ff1f0befa",
        //         "side": "sell",
        //         "price": 0.014,
        //         "amount": 100,
        //         "cost": 1.4,
        //         "fee": { "cost": 0.00224, "currency": "EUR", "rate": 0.16 },
        //         "isMaker": true,
        //         "clientOrderId": "MY-CLIENT-ORDER-ID"
        //     }
        //
        const marketId = this.safeString (trade, 'symbol');
        const resolvedMarket = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (trade, 'timestamp');
        const isMaker = this.safeBool (trade, 'isMaker');
        let takerOrMaker: Str = undefined;
        if (isMaker !== undefined) {
            takerOrMaker = (isMaker) ? 'maker' : 'taker';
        }
        let fee = undefined;
        const rawFee = this.safeDict (trade, 'fee');
        if (rawFee !== undefined) {
            let feeRate: Str = undefined;
            const feePercentage = this.safeString (rawFee, 'rate');
            if (feePercentage !== undefined) {
                feeRate = Precise.stringDiv (feePercentage, '100');
            }
            fee = {
                'cost': this.safeString (rawFee, 'cost'),
                'currency': this.safeCurrencyCode (this.safeString (rawFee, 'currency')),
                'rate': feeRate,
            };
        }
        return this.safeTrade ({
            'info': trade,
            'id': this.safeString (trade, 'id'),
            'symbol': resolvedMarket['symbol'],
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'order': this.safeString (trade, 'order'),
            'type': undefined,
            'side': this.safeStringLower (trade, 'side'),
            'takerOrMaker': takerOrMaker,
            'price': this.safeString (trade, 'price'),
            'amount': this.safeString (trade, 'amount'),
            'cost': this.safeString (trade, 'cost'),
            'fee': fee,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name bit2me#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://api.bit2me.com/docs/pro/websocket-private
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        let messageHash = 'orders';
        let unifiedSymbol: Str = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            unifiedSymbol = market['symbol'];
            messageHash = messageHash + ':' + unifiedSymbol;
        }
        const orders = await this.subscribePrivate ('my-orders', messageHash, params);
        let finalLimit = limit;
        if (this.newUpdates) {
            finalLimit = orders.getLimit (unifiedSymbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, unifiedSymbol, since, finalLimit, true);
    }

    handleOrder (client: Client, message: Dict) {
        //
        //     {
        //         "event": "my-orders",
        //         "symbol": "BTC/USDC",
        //         "data": {
        //             "id": "f0f895d1-f9e0-494c-87b4-40e12ce344a1",
        //             "userId": "7bd4cc22-7682-4e45-85b3-29386b979d75",
        //             "timestamp": 1794378422617,
        //             "datetime": "2026-11-11T06:27:02.617Z",
        //             "side": "buy",
        //             "symbol": "BTC/USDC",
        //             "price": 36000,
        //             "stopPrice": 0,
        //             "amount": 0.0001,
        //             "filled": 0,
        //             "remainingAmount": 0.0001,
        //             "status": "open",
        //             "type": "limit",
        //             "cost": 0,
        //             "clientOrderId": null,
        //             "timeInForce": "GTC",
        //             "cancelationReason": null
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const order = this.parseWsOrder (data);
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const orders = this.orders;
        orders.append (order);
        client.resolve (orders, 'orders');
        client.resolve (orders, 'orders:' + order['symbol']);
    }

    override parseWsOrder (order: Dict, market: Market = undefined): Order {
        //
        //     {
        //         "id": "51002851-2f76-4c10-9b4c-bcc131f27b1d",
        //         "userId": "7bd4cc22-7682-4e45-85b3-29386b979d75",
        //         "timestamp": 1666006194005,
        //         "datetime": "2022-10-17T11:29:54.005Z",
        //         "side": "buy",
        //         "symbol": "B2M/EUR",
        //         "price": 1,
        //         "stopPrice": 0,
        //         "amount": 1000,
        //         "filled": 10,
        //         "remainingAmount": 990,
        //         "dustAmount": 0,
        //         "status": "cancelled",
        //         "type": "limit",
        //         "cost": 0,
        //         "clientOrderId": "MY-CLIENT-ORDER-ID",
        //         "timeInForce": "GTC",
        //         "cancelationReason": "CR-1: User request",
        //         "feeAmount": 23.324123,
        //         "feeCurrency": "B2M"
        //     }
        //
        const marketId = this.safeString (order, 'symbol');
        const resolvedMarket = this.safeMarket (marketId, market);
        const timestamp = this.safeInteger (order, 'timestamp');
        let fee = undefined;
        const feeCost = this.safeNumber (order, 'feeAmount');
        if (feeCost !== undefined) {
            fee = {
                'cost': feeCost,
                'currency': this.safeCurrencyCode (this.safeString (order, 'feeCurrency')),
            };
        }
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': undefined,
            'lastUpdateTimestamp': undefined,
            'symbol': resolvedMarket['symbol'],
            'type': this.parseOrderType (this.safeString (order, 'type')),
            'timeInForce': this.safeString (order, 'timeInForce'),
            'postOnly': undefined,
            'reduceOnly': undefined,
            'side': this.safeStringLower (order, 'side'),
            'price': this.omitZero (this.safeString (order, 'price')),
            'triggerPrice': this.omitZero (this.safeString (order, 'stopPrice')),
            'amount': this.safeString (order, 'amount'),
            'cost': this.safeString (order, 'cost'),
            'average': undefined,
            'filled': this.safeString (order, 'filled'),
            'remaining': this.safeString (order, 'remainingAmount'),
            'status': this.parseOrderStatus (this.safeString (order, 'status')),
            'fee': fee,
            'trades': undefined,
        }, resolvedMarket);
    }

    /**
     * @method
     * @name bit2me#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://api.bit2me.com/docs/pro/websocket-private
     * @param {string} [symbol] unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    override async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        await this.loadMarkets ();
        let messageHash = 'myTrades';
        let unifiedSymbol: Str = undefined;
        if (symbol !== undefined) {
            const market = this.market (symbol);
            unifiedSymbol = market['symbol'];
            messageHash = messageHash + ':' + unifiedSymbol;
        }
        const trades = await this.subscribePrivate ('my-trades', messageHash, params);
        let finalLimit = limit;
        if (this.newUpdates) {
            finalLimit = trades.getLimit (unifiedSymbol, limit);
        }
        return this.filterBySymbolSinceLimit (trades, unifiedSymbol, since, finalLimit, true);
    }

    handleMyTrade (client: Client, message: Dict) {
        //
        //     {
        //         "event": "my-trades",
        //         "symbol": "B2M/EUR",
        //         "data": {
        //             "id": "9adb20ae-f673-49a4-b232-75442e3af617",
        //             "timestamp": 1665997927993,
        //             "datetime": "2022-10-17T09:12:07.993Z",
        //             "symbol": "B2M/EUR",
        //             "order": "69d3df53-9248-430c-9850-d72ff1f0befa",
        //             "side": "sell",
        //             "price": 0.014,
        //             "amount": 100,
        //             "cost": 1.4,
        //             "fee": { "cost": 0.00224, "currency": "EUR", "rate": 0.16 },
        //             "isMaker": true,
        //             "clientOrderId": "MY-CLIENT-ORDER-ID"
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const trade = this.parseWsTrade (data);
        if (this.myTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.myTrades = new ArrayCacheBySymbolById (limit);
        }
        const myTrades = this.myTrades;
        myTrades.append (trade);
        client.resolve (myTrades, 'myTrades');
        client.resolve (myTrades, 'myTrades:' + trade['symbol']);
    }

    /**
     * @method
     * @name bit2me#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.bit2me.com/docs/pro/websocket-private
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    override async watchBalance (params = {}): Promise<Balances> {
        return await this.subscribePrivate ('my-balance', 'balance', params);
    }

    handleBalance (client: Client, message: Dict) {
        //
        //     {
        //         "event": "my-balance",
        //         "data": {
        //             "userId": "7bd4cc22-7682-4e45-85b3-29386b979d75",
        //             "balance": [
        //                 { "currency": "BTC", "balance": 0, "blockedBalance": 0 },
        //                 { "currency": "USDC", "balance": 95.81394348, "blockedBalance": 3.6 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const balances = this.safeList (data, 'balance', []);
        this.balance = this.parseBalanceList (balances);
        client.resolve (this.balance, 'balance');
    }

    /**
     * @method
     * @name bit2me#createOrderWs
     * @description create a trade order over the websocket
     * @see https://api.bit2me.com/docs/pro/websocket-commands
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, required for limit orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint, the same as for createOrder
     * @param {float} [params.triggerPrice] the price at which a stop-limit order is activated, requires a limit price
     * @param {float} [params.cost] for market orders only, the amount to trade in units of the quote currency, overrides amount
     * @param {string} [params.clientOrderId] a unique identifier for the order
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async createOrderWs (symbol: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        const restRequest = this.createOrderRequest (symbol, type, side, amount, price, params);
        const orderType = this.safeString (restRequest, 'orderType');
        if (orderType === 'oco') {
            throw new NotSupported (this.id + ' createOrderWs() does not support oco orders, use createOrder() instead');
        }
        // createOrderRequest always sets a CCXT-<id> clientOrderId, the response is matched by it
        const clientOrderId = this.safeString (restRequest, 'clientOrderId') as string;
        const request = this.omit (restRequest, 'orderType');
        request['event'] = 'add-order';
        request['type'] = orderType;
        request['clientOrderId'] = clientOrderId;
        // the response carries no request id, it is matched by the client order id, and an error only by the symbol
        const pending = this.safeDict (this.options, 'pendingWsOrders', {});
        pending[clientOrderId] = market['id'];
        this.options['pendingWsOrders'] = pending;
        const url = this.urls['api']['ws'];
        const messageHash = 'added-order:' + clientOrderId;
        return await this.watch (url, messageHash, request, messageHash);
    }

    /**
     * @ignore
     * @method
     * @name bit2me#settleRequest
     * @description resolves or rejects a one-shot command and forgets its subscription so the same command can be sent again
     * @param {object} client the websocket client
     * @param {string} messageHash the message hash of the command
     * @param {object} result the value to resolve with
     * @param {object} [error] when set the command is rejected with it instead
     */
    settleRequest (client: Client, messageHash: string, result: any, error: any = undefined) {
        if (messageHash in client.subscriptions) {
            delete client.subscriptions[messageHash];
        }
        if (error !== undefined) {
            client.reject (error, messageHash);
        } else {
            client.resolve (result, messageHash);
        }
    }

    handleCreateOrder (client: Client, message: Dict) {
        //
        //     {
        //         "event": "added-order",
        //         "symbol": "BTC/USDC",
        //         "data": {
        //             "id": "f0f895d1-f9e0-494c-87b4-40e12ce344a1",
        //             "userId": "7bd4cc22-7682-4e45-85b3-29386b979d75",
        //             "side": "buy",
        //             "symbol": "BTC/USDC",
        //             "status": "open",
        //             "orderType": "limit",
        //             "createdAt": "2026-11-11T06:27:02.617Z",
        //             "updatedAt": "2026-11-11T06:27:02.617Z",
        //             "clientOrderId": "c4022a5f-cfb3-46ff-9136-2739e34dd4e6",
        //             "cancelReason": null,
        //             "timeInForce": "GTC",
        //             "feeCurrency": null,
        //             "price": 36000,
        //             "orderAmount": 0.0001,
        //             "filledAmount": 0,
        //             "cost": 0,
        //             "stopPrice": 0,
        //             "feeAmount": 0,
        //             "orderGroupId": null
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const order = this.parseOrder (data);
        const clientOrderId = this.safeString (data, 'clientOrderId');
        if (clientOrderId !== undefined) {
            const pending = this.safeDict (this.options, 'pendingWsOrders', {});
            this.options['pendingWsOrders'] = this.omit (pending, clientOrderId);
            this.settleRequest (client, 'added-order:' + clientOrderId, order);
        }
    }

    /**
     * @method
     * @name bit2me#cancelOrderWs
     * @description cancels an open order over the websocket
     * @see https://api.bit2me.com/docs/pro/websocket-commands
     * @param {string} id order id
     * @param {string} [symbol] not used by bit2me.cancelOrderWs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async cancelOrderWs (id: string, symbol: Str = undefined, params = {}): Promise<Order> {
        await this.loadMarkets ();
        await this.authenticate ();
        const request: Dict = {
            'event': 'cancel-order',
            'orderId': id,
        };
        const url = this.urls['api']['ws'];
        const messageHash = 'canceled-order:' + id;
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    handleCancelOrder (client: Client, message: Dict) {
        //
        //     {
        //         "event": "canceled-order",
        //         "symbol": "BTC/USDC",
        //         "data": {
        //             "orderId": "f0f895d1-f9e0-494c-87b4-40e12ce344a1",
        //             "status": "cancelled"
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const orderId = this.safeString (data, 'orderId');
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const order = this.safeOrder ({
            'info': message,
            'id': orderId,
            'symbol': market['symbol'],
            'status': this.parseOrderStatus (this.safeString (data, 'status')),
        }, market);
        this.settleRequest (client, 'canceled-order:' + orderId, order);
    }

    /**
     * @method
     * @name bit2me#cancelOrdersWs
     * @description cancels multiple orders over the websocket, up to 20 at a time
     * @see https://api.bit2me.com/docs/pro/websocket-commands
     * @param {string[]} ids order ids
     * @param {string} [symbol] not used by bit2me.cancelOrdersWs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure), orders the exchange refused to cancel keep an undefined status and carry the reason in info
     */
    override async cancelOrdersWs (ids: string[], symbol: Str = undefined, params = {}): Promise<Order[]> {
        await this.loadMarkets ();
        await this.authenticate ();
        const request: Dict = {
            'event': 'cancel-orders',
            'ordersId': ids,
        };
        const url = this.urls['api']['ws'];
        const messageHash = 'canceled-orders';
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    handleCancelOrders (client: Client, message: Dict) {
        //
        //     {
        //         "event": "canceled-orders",
        //         "data": {
        //             "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96",
        //             "ordersDeleted": [
        //                 { "id": "cab25117-47ce-4991-98d3-3a334afbc6a0", "status": "cancelled" }
        //             ],
        //             "ordersNotDeletedReasons": [
        //                 {
        //                     "id": "a00ea616-aed4-44eb-9e05-b55c475e39d9",
        //                     "reason": "The order with ID a00ea616-aed4-44eb-9e05-b55c475e39d9 was not found",
        //                     "error": { "code": "ORDER_NOT_FOUND", "message": "The order with ID a00ea616-aed4-44eb-9e05-b55c475e39d9 was not found" }
        //                 }
        //             ]
        //         }
        //     }
        //
        const data = this.safeDict (message, 'data', {});
        const deleted = this.safeList (data, 'ordersDeleted', []);
        const notDeleted = this.safeList (data, 'ordersNotDeletedReasons', []);
        const orders = [];
        for (let i = 0; i < deleted.length; i++) {
            const entry = deleted[i];
            orders.push (this.safeOrder ({
                'info': entry,
                'id': this.safeString (entry, 'id'),
                'status': this.parseOrderStatus (this.safeString (entry, 'status')),
            }));
        }
        for (let i = 0; i < notDeleted.length; i++) {
            const entry = notDeleted[i];
            orders.push (this.safeOrder ({
                'info': entry,
                'id': this.safeString (entry, 'id'),
                'status': undefined,
            }));
        }
        this.settleRequest (client, 'canceled-orders', orders);
    }

    /**
     * @method
     * @name bit2me#cancelAllOrdersWs
     * @description cancels all open orders of a market over the websocket
     * @see https://api.bit2me.com/docs/pro/websocket-commands
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] 'buy' or 'sell', to cancel only that side
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    override async cancelAllOrdersWs (symbol: Str = undefined, params = {}): Promise<Order[]> {
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' cancelAllOrdersWs() requires a symbol argument');
        }
        await this.loadMarkets ();
        await this.authenticate ();
        const market = this.market (symbol);
        const request: Dict = {
            'event': 'cancel-all-orders',
            'symbol': market['id'],
        };
        const url = this.urls['api']['ws'];
        const messageHash = 'canceled-all-orders:' + market['id'];
        return await this.watch (url, messageHash, this.extend (request, params), messageHash);
    }

    handleCancelAllOrders (client: Client, message: Dict) {
        //
        //     {
        //         "event": "canceled-all-orders",
        //         "symbol": "BTC/USDC",
        //         "data": {
        //             "userId": "2bf436fc-43e6-459a-b647-6b446f72ad96",
        //             "cancelledOrders": [ "c5dfb28b-a306-4682-acdd-1271a299ca6b" ]
        //         }
        //     }
        //
        const marketId = this.safeString (message, 'symbol');
        const market = this.safeMarket (marketId);
        const data = this.safeDict (message, 'data', {});
        const ids = this.safeList (data, 'cancelledOrders', []);
        const orders = [];
        for (let i = 0; i < ids.length; i++) {
            orders.push (this.safeOrder ({
                'info': message,
                'id': ids[i],
                'symbol': market['symbol'],
                'status': 'canceled',
            }, market));
        }
        this.settleRequest (client, 'canceled-all-orders:' + marketId, orders);
    }

    /**
     * @ignore
     * @method
     * @name bit2me#authenticate
     * @description authenticates the websocket connection with a short-lived token obtained over REST
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the authentication message
     */
    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const messageHash = 'authenticated';
        const future = client.reusableFuture (messageHash);
        const authenticated = this.safeValue (client.subscriptions, messageHash);
        if (authenticated === undefined) {
            // the token is valid for one minute, it is only used to open the session
            const response = await this.privatePostV1SigninApikey (params);
            //
            //     { "accessToken": { "token": "header.payload.signature", "expirationTime": 1794378427 } }
            //
            const accessToken = this.safeDict (response, 'accessToken', {});
            const request: Dict = {
                'event': 'authenticate',
                'token': this.safeString (accessToken, 'token'),
            };
            this.watch (url, messageHash, request, messageHash);
        }
        return await future;
    }

    handleAuthenticate (client: Client, message: Dict) {
        //
        //     { "event": "authenticate" }
        //     { "event": "authenticate", "error": "jwt expired" }
        //
        const messageHash = 'authenticated';
        const error = this.safeString (message, 'error');
        if (error === undefined) {
            // the future is reusable, every later authenticate() call awaits the same resolved value
            const future = this.safeValue (client.futures, messageHash);
            future.resolve (message);
        } else {
            const exception = new AuthenticationError (this.id + ' ' + this.json (message));
            client.reject (exception, messageHash);
            if (messageHash in client.subscriptions) {
                delete client.subscriptions[messageHash];
            }
        }
    }

    handleSubscriptionStatus (client: Client, message: Dict) {
        //
        //     { "event": "subscribe", "symbol": "BTC/USDC", "subscription": { "name": "order-book" }, "result": "subscribed" }
        //     { "event": "unsubscribe" }
        //
        return message;
    }

    handleErrorMessage (client: Client, message: Dict) {
        //
        //     { "event": "added-order", "symbol": "BTC/USDC", "error": { "code": "PRICE_LOWER_MARKET_MIN", "minPrice": 0.001, "message": "The price can not be lower than 0.001" } }
        //     { "event": "canceled-order", "orderId": "73352609-a885-4dc6-99c4-8a03e5df6bda", "error": { "code": "ORDER_NOT_FOUND", "message": "The order with ID 73352609-a885-4dc6-99c4-8a03e5df6bda was not found" } }
        //
        const event = this.safeString (message, 'event');
        const error = this.safeDict (message, 'error', {});
        const code = this.safeString (error, 'code');
        const errorMessage = this.safeString (error, 'message');
        const feedback = this.id + ' ' + this.json (message);
        let exception = undefined;
        try {
            this.throwExactlyMatchedException (this.exceptions['exact'], code, feedback);
            this.throwBroadlyMatchedException (this.exceptions['broad'], errorMessage, feedback);
            exception = new ExchangeError (feedback);
        } catch (e) {
            exception = e;
        }
        if (event === 'added-order') {
            // the error carries no client order id, reject every order of the symbol still waiting for a response
            const marketId = this.safeString (message, 'symbol');
            const pending = this.safeDict (this.options, 'pendingWsOrders', {});
            const clientOrderIds = Object.keys (pending);
            for (let i = 0; i < clientOrderIds.length; i++) {
                const clientOrderId = clientOrderIds[i];
                if (pending[clientOrderId] === marketId) {
                    this.settleRequest (client, 'added-order:' + clientOrderId, undefined, exception);
                    this.options['pendingWsOrders'] = this.omit (this.options['pendingWsOrders'], clientOrderId);
                }
            }
        } else if (event === 'canceled-order') {
            this.settleRequest (client, 'canceled-order:' + this.safeString (message, 'orderId'), undefined, exception);
        } else if (event === 'canceled-orders') {
            this.settleRequest (client, 'canceled-orders', undefined, exception);
        } else if (event === 'canceled-all-orders') {
            this.settleRequest (client, 'canceled-all-orders:' + this.safeString (message, 'symbol'), undefined, exception);
        } else if (event === 'subscribe') {
            // a refused subscription names the channel and the symbol it was asked for
            const subscription = this.safeDict (message, 'subscription', {});
            const name = this.safeString (subscription, 'name');
            const marketId = this.safeString (message, 'symbol');
            const symbol = this.safeSymbol (marketId);
            const hashes: Dict = {
                'order-book': 'orderbook:' + symbol,
                'public-trades': 'trades:' + symbol,
                'my-orders': 'orders',
                'my-trades': 'myTrades',
                'my-balance': 'balance',
            };
            const messageHash = this.safeString (hashes, name);
            if (messageHash !== undefined) {
                client.reject (exception, messageHash);
                if ((name !== undefined) && (name in client.subscriptions)) {
                    delete client.subscriptions[name];
                }
                if (messageHash in client.subscriptions) {
                    delete client.subscriptions[messageHash];
                }
            }
        }
    }

    override handleMessage (client: Client, message: Dict) {
        const event = this.safeString (message, 'event');
        if (event === 'authenticate') {
            this.handleAuthenticate (client, message);
            return;
        }
        const error = this.safeValue (message, 'error');
        if (error !== undefined) {
            this.handleErrorMessage (client, message);
            return;
        }
        const methods: Dict = {
            'order-book': this.handleOrderBook,
            'public-trades': this.handleTrades,
            'my-orders': this.handleOrder,
            'my-trades': this.handleMyTrade,
            'my-balance': this.handleBalance,
            'added-order': this.handleCreateOrder,
            'canceled-order': this.handleCancelOrder,
            'canceled-orders': this.handleCancelOrders,
            'canceled-all-orders': this.handleCancelAllOrders,
            'subscribe': this.handleSubscriptionStatus,
            'unsubscribe': this.handleSubscriptionStatus,
        };
        const method = this.safeValue (methods, event);
        if (method !== undefined) {
            method.call (this, client, message);
        }
    }
}
