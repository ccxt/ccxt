import krakenRest from '../kraken.js';
import type { Int, Strings, OrderSide, OrderType, Str, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Num, Dict, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class kraken extends krakenRest {
    describe(): any;
    orderRequestWs(method: string, symbol: string, type: string, request: Dict, amount: Num, price?: Num, params?: {}): Dict[];
    /**
     * @method
     * @name kraken#createOrderWs
     * @description create a trade order
     * @see https://docs.kraken.com/api/docs/websocket-v2/add_order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    handleCreateEditOrder(client: any, message: any): void;
    /**
     * @method
     * @name kraken#editOrderWs
     * @description edit a trade order
     * @see https://docs.kraken.com/api/docs/websocket-v2/amend_order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kraken#cancelOrdersWs
     * @see https://docs.kraken.com/api/docs/websocket-v1/cancelorder
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrdersWs(ids: string[], symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name kraken#cancelOrderWs
     * @see https://docs.kraken.com/api/docs/websocket-v1/cancelorder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    handleCancelOrder(client: any, message: any): void;
    /**
     * @method
     * @name kraken#cancelAllOrdersWs
     * @see https://docs.kraken.com/api/docs/websocket-v1/cancelall
     * @description cancel all open orders
     * @param {string} [symbol] unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<any>;
    handleCancelAllOrders(client: any, message: any): void;
    handleTicker(client: any, message: any, subscription: any): void;
    handleTrades(client: Client, message: any, subscription: any): void;
    handleOHLCV(client: Client, message: any, subscription: any): void;
    requestId(): any;
    watchPublic(name: any, symbol: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name kraken#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.kraken.com/api/docs/websocket-v1/ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name kraken#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.kraken.com/api/docs/websocket-v1/ticker
     * @param {string[]} symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name kraken#watchBidsAsks
     * @see https://docs.kraken.com/api/docs/websocket-v1/spread
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any, subscription: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name kraken#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.kraken.com/api/docs/websocket-v1/trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kraken#watchTradesForSymbols
     * @see https://docs.kraken.com/api/docs/websocket-v1/trade
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kraken#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.kraken.com/api/docs/websocket-v1/book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name kraken#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.kraken.com/api/docs/websocket-v1/book
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name kraken#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.kraken.com/api/docs/websocket-v1/ohlc
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    loadMarkets(reload?: boolean, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").MarketInterface>>;
    watchHeartbeat(params?: {}): Promise<any>;
    handleHeartbeat(client: Client, message: any): void;
    handleOrderBook(client: Client, message: any, subscription: any): void;
    formatNumber(n: any, length: any): string;
    customHandleDeltas(bookside: any, deltas: any, timestamp?: any): any;
    handleSystemStatus(client: Client, message: any): any;
    authenticate(params?: {}): Promise<string>;
    watchPrivate(name: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name kraken#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.kraken.com/api/docs/websocket-v1/owntrades
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any, subscription?: any): void;
    parseWsTrade(trade: any, market?: any): {
        id: string;
        order: string;
        info: any;
        timestamp: number;
        datetime: string;
        symbol: any;
        type: string;
        side: string;
        takerOrMaker: any;
        price: number;
        amount: number;
        cost: any;
        fee: any;
    };
    /**
     * @method
     * @name kraken#watchOrders
     * @see https://docs.kraken.com/api/docs/websocket-v1/openorders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of  orde structures to retrieve
     * @param {object} [params] maximum number of orderic to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any, subscription?: any): void;
    parseWsOrder(order: any, market?: any): Order;
    watchMultiHelper(unifiedName: string, channelName: string, symbols?: Strings, subscriptionArgs?: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name kraken#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.kraken.com/api/docs/websocket-v2/balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    getMessageHash(unifiedElementName: string, subChannelName?: Str, symbol?: Str): string;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
}
