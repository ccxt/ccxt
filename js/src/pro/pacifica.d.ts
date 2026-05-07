import pacificaRest from '../pacifica.js';
import Client from '../base/ws/Client.js';
import { Int, Str, Market, OrderBook, Trade, OHLCV, Order, Dict, Strings, Ticker, Tickers, type Num, OrderType, OrderSide, Bool } from '../base/types.js';
export default class pacifica extends pacificaRest {
    describe(): any;
    setupApiKeyHeaders(key?: string): void;
    /**
     * @method
     * @name pacifica#createOrderWs
     * @description create a trade order
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/create-market-order
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/create-limit-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float|undefined} [params.stopLossPrice] the price that a stop loss order is triggered at (optional provide stopLossCloid)
     * @param {float|undefined} [params.takeProfitPrice] the price that a take profit order is triggered at (optional provide takeProfitCloid)
     * @param {string|undefined} [params.timeInForce] "GTC", "IOC", or "PO" or "ALO" or "PO_TOB" (or "TOB" - PO by top of book)
     * @param {bool|undefined} [params.reduceOnly] Ensures that the executed order does not flip the opened position.
     * @param {string|undefined} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use.
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name pacifica#editOrderWs
     * @description edit a trade order
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/edit-order
     * @param {string} id edit order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrderWs(id: string, symbol: string, type: string, side: string, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name pacifica#cancelOrdersWs
     * @description cancel multiple orders
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/batch-order
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/cancel-order
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|string[]} [params.clientOrderId] client order ids, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrdersWs(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name pacifica#cancelOrderWs
     * @description cancels an open order
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool|undefined} [params.stop] necessary if this is to cancel a stop order.
     * @param {string|undefined} [params.clientOrderId] client order id, (optional uuid v4 e.g.: f47ac10b-58cc-4372-a567-0e02b2c3d479)
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name pacifica#cancelAllOrdersWs
     * @description cancel all open orders in a market
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/trading-operations/cancel-all-orders
     * @param {string} symbol (optional) unified market symbol of the market to cancel orders in.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean|undefined} [params.excludeReduceOnly] whether to exclude reduce-only orders
     * @param {int|undefined} [params.expiryWindow] time to live in milliseconds
     * @param {string|undefined} [params.agentAddress] only if agent wallet in use
     * @param {string|undefined} [params.originAddress] only if agent in use. Agent's owner address ( default = credentials walletAddress )
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name pacifica#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.aggLevel] aggregation level for price grouping. Defaults to 1. Can be 1, 10, 100, 1000, 10000
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name pacifica#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int|undefined} [params.aggLevel] aggregation level for price grouping. Defaults to 1. Can be 1, 10, 100, 1000, 10000
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    handleOrderBook(client: any, message: any): void;
    /**
     * @method
     * @name pacifica#watchTicker
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/prices
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name pacifica#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/prices
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name pacifica#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/prices
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name pacifica#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-trades
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to options' walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name pacifica#unWatchMyTrades
     * @description unWatches information on multiple trades made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-trades
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to options' walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    unWatchMyTrades(symbol?: Str, params?: {}): Promise<any>;
    handleWsTickers(client: Client, message: any): boolean;
    parseWsTicker(rawTicker: any, market?: Market): Ticker;
    handleMyTrades(client: Client, message: any): void;
    /**
     * @method
     * @name pacifica#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/trades
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name pacifica#unWatchTrades
     * @description unWatches information on multiple trades made in a market
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/trades
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name pacifica#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/candle
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name pacifica#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/candle
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name pacifica#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-order-updates
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to options' walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name pacifica#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://docs.pacifica.fi/api-documentation/api/websocket/subscriptions/account-order-updates
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} [params.account] will default to options' walletAddress if not provided
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    unWatchOrders(symbol?: Str, params?: {}): Promise<any>;
    handleOrder(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): Bool;
    handleOrderBookUnsubscription(client: Client, subscription: Dict): void;
    handleTradesUnsubscription(client: Client, subscription: Dict): void;
    handleTickersUnsubscription(client: Client, subscription: Dict): void;
    handleOHLCVUnsubscription(client: Client, subscription: Dict): void;
    handleOrderUnsubscription(client: Client, subscription: Dict): void;
    handleMyTradesUnsubscription(client: Client, subscription: Dict): void;
    handleSubscriptionResponse(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    ping(client: Client): {
        method: string;
    };
    handlePong(client: Client, message: any): any;
    requestId(): string;
    wrapAsPostAction(operationType: string, request: Dict): Dict;
    handleWsPost(client: Client, message: Dict): void;
}
