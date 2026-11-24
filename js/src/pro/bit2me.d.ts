import bit2meRest from '../bit2me.js';
import type { Int, Str, OrderBook, Trade, Order, Balances, Dict, Num, OrderSide, OrderType, Market } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bit2me extends bit2meRest {
    describe(): Dict;
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
    subscribePublic(name: string, symbol: string, messageHash: string, params?: {}): Promise<any>;
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
    subscribePrivate(name: string, messageHash: string, params?: {}): Promise<any>;
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
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: Dict): void;
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
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: Dict): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
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
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: Dict): void;
    parseWsOrder(order: Dict, market?: Market): Order;
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
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrade(client: Client, message: Dict): void;
    /**
     * @method
     * @name bit2me#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.bit2me.com/docs/pro/websocket-private
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure](https://docs.ccxt.com/#/?id=balance-structure)
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: Dict): void;
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
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
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
    settleRequest(client: Client, messageHash: string, result: any, error?: any): void;
    handleCreateOrder(client: Client, message: Dict): void;
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
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    handleCancelOrder(client: Client, message: Dict): void;
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
    cancelOrdersWs(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    handleCancelOrders(client: Client, message: Dict): void;
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
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<Order[]>;
    handleCancelAllOrders(client: Client, message: Dict): void;
    /**
     * @ignore
     * @method
     * @name bit2me#authenticate
     * @description authenticates the websocket connection with a short-lived token obtained over REST
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the authentication message
     */
    authenticate(params?: {}): Promise<any>;
    handleAuthenticate(client: Client, message: Dict): void;
    handleSubscriptionStatus(client: Client, message: Dict): Dict;
    handleErrorMessage(client: Client, message: Dict): boolean;
    handleMessage(client: Client, message: Dict): void;
}
