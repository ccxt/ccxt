import hitbtcRest from '../hitbtc.js';
import type { Tickers, Int, OHLCV, OrderSide, OrderType, Strings, Num } from '../base/types.js';
import Client from '../base/ws/Client.js';
import { Str, OrderBook, Order, Trade, Ticker, Balances } from '../base/types';
export default class hitbtc extends hitbtcRest {
    describe(): any;
    /**
     * @ignore
     * @method
     * @description authenticates the user to access private web socket channels
     * @see https://api.hitbtc.com/#socket-authentication
     * @returns {object} response from exchange
     */
    authenticate(): Promise<any>;
    /**
     * @ignore
     * @method
     * @param {string} name websocket endpoint name
     * @param {string} messageHashPrefix prefix for the message hash
     * @param {string[]} [symbols] unified CCXT symbol(s)
     * @param {object} [params] extra parameters specific to the hitbtc api
     */
    subscribePublic(name: string, messageHashPrefix: string, symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @param {string} name websocket endpoint name
     * @param {string} [symbol] unified CCXT symbol
     * @param {object} [params] extra parameters specific to the hitbtc api
     */
    subscribePrivate(name: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @param {string} name websocket endpoint name
     * @param {object} [params] extra parameters specific to the hitbtc api
     */
    tradeRequest(name: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name hitbtc#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.hitbtc.com/#subscribe-to-full-order-book
     * @see https://api.hitbtc.com/#subscribe-to-partial-order-book
     * @see https://api.hitbtc.com/#subscribe-to-partial-order-book-in-batches
     * @see https://api.hitbtc.com/#subscribe-to-top-of-book
     * @see https://api.hitbtc.com/#subscribe-to-top-of-book-in-batches
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'orderbook/full', 'orderbook/{depth}/{speed}', 'orderbook/{depth}/{speed}/batch'
     * @param {int} [params.depth] 5 , 10, or 20 (default)
     * @param {int} [params.speed] 100 (default), 500, or 1000
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    /**
     * @method
     * @name hitbtc#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.hitbtc.com/#subscribe-to-ticker
     * @see https://api.hitbtc.com/#subscribe-to-ticker-in-batches
     * @see https://api.hitbtc.com/#subscribe-to-mini-ticker
     * @see https://api.hitbtc.com/#subscribe-to-mini-ticker-in-batches
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'ticker/{speed}' (default), or 'ticker/price/{speed}'
     * @param {string} [params.speed] '1s' (default), or '3s'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name hitbtc#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string[]} [symbols]
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {string} params.method 'ticker/{speed}' ,'ticker/price/{speed}', 'ticker/{speed}/batch' (default), or 'ticker/{speed}/price/batch''
     * @param {string} params.speed '1s' (default), or '3s'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name hitbtc#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://api.hitbtc.com/#subscribe-to-top-of-book
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'orderbook/top/{speed}' or 'orderbook/top/{speed}/batch (default)'
     * @param {string} [params.speed] '100ms' (default) or '500ms' or '1000ms'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name hitbtc#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.hitbtc.com/#subscribe-to-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): any;
    parseWsTrades(trades: any, market?: object, since?: Int, limit?: Int, params?: {}): Trade[];
    parseWsTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name hitbtc#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.hitbtc.com/#subscribe-to-candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents
     * @param {int} [since] not used by hitbtc watchOHLCV
     * @param {int} [limit] 0 – 1000, default value = 0 (no history returned)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): any;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    /**
     * @method
     * @name hitbtc#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://api.hitbtc.com/#subscribe-to-reports
     * @see https://api.hitbtc.com/#subscribe-to-reports-2
     * @see https://api.hitbtc.com/#subscribe-to-reports-3
     * @param {string} [symbol] unified CCXT market symbol
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum amount of orders to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): any;
    handleOrderHelper(client: Client, message: any, order: any): void;
    parseWsOrderTrade(trade: any, market?: any): Trade;
    parseWsOrder(order: any, market?: any): Order;
    /**
     * @method
     * @name hitbtc#watchBalance
     * @description watches balance updates, cannot subscribe to margin account balances
     * @see https://api.hitbtc.com/#subscribe-to-spot-balances
     * @see https://api.hitbtc.com/#subscribe-to-futures-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap', or 'future'
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.mode] 'updates' or 'batches' (default), 'updates' = messages arrive after balance updates, 'batches' = messages arrive at equal intervals if there were any updates
     * @returns {object[]} a list of [balance structures]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name hitbtc#createOrder
     * @description create a trade order
     * @see https://api.hitbtc.com/#create-new-spot-order
     * @see https://api.hitbtc.com/#create-margin-order
     * @see https://api.hitbtc.com/#create-futures-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported for spot-margin, swap supports both, default is 'cross'
     * @param {bool} [params.margin] true for creating a margin order
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", "Day", "GTD"
     * @returns {object} an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hitbtc#cancelOrderWs
     * @see https://api.hitbtc.com/#cancel-spot-order-2
     * @see https://api.hitbtc.com/#cancel-futures-order-2
     * @see https://api.hitbtc.com/#cancel-margin-order-2
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for canceling a margin order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hitbtc#cancelAllOrdersWs
     * @see https://api.hitbtc.com/#cancel-spot-orders
     * @see https://api.hitbtc.com/#cancel-futures-order-3
     * @description cancel all open orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for canceling margin orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name hitbtc#fetchOpenOrdersWs
     * @see https://api.hitbtc.com/#get-active-futures-orders-2
     * @see https://api.hitbtc.com/#get-margin-orders
     * @see https://api.hitbtc.com/#get-active-spot-orders
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for fetching open margin orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleBalance(client: Client, message: any): void;
    handleNotification(client: Client, message: any): any;
    handleOrderRequest(client: Client, message: any): any;
    handleMessage(client: Client, message: any): void;
    handleAuthenticate(client: Client, message: any): any;
    handleError(client: Client, message: any): boolean;
}
