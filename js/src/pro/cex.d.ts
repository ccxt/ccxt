import cexRest from '../cex.js';
import type { Int, OrderSide, OrderType, Strings, Str, OrderBook, Trade, Ticker, Tickers, OHLCV, Order, Balances, Num } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class cex extends cexRest {
    describe(): any;
    requestId(): any;
    /**
     * @method
     * @name cex#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://cex.io/websocket-api#get-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    /**
     * @method
     * @name cex#watchTrades
     * @description get the list of most recent trades for a particular symbol. Note: can only watch one symbol at a time.
     * @see https://cex.io/websocket-api#old-pair-room
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTradesSnapshot(client: Client, message: any): void;
    parseWsOldTrade(trade: any, market?: any): Trade;
    handleTrade(client: Client, message: any): void;
    /**
     * @method
     * @name cex#watchTicker
     * @see https://cex.io/websocket-api#ticker-subscription
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] public or private
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name cex#watchTickers
     * @see https://cex.io/websocket-api#ticker-subscription
     * @description watches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name cex#fetchTickerWs
     * @see https://docs.cex.io/#ws-api-ticker-deprecated
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickerWs(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name cex#fetchBalanceWs
     * @see https://docs.cex.io/#ws-api-get-balance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalanceWs(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name cex#watchOrders
     * @description get the list of orders associated with the user. Note: In CEX.IO system, orders can be present in trade engine or in archive database. There can be time periods (~2 seconds or more), when order is done/canceled, but still not moved to archive database. That means, you cannot see it using calls: archived-orders/open-orders.
     * @see https://docs.cex.io/#ws-api-open-orders
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name cex#watchMyTrades
     * @description get the list of trades associated with the user. Note: In CEX.IO system, orders can be present in trade engine or in archive database. There can be time periods (~2 seconds or more), when order is done/canceled, but still not moved to archive database. That means, you cannot see it using calls: archived-orders/open-orders.
     * @see https://docs.cex.io/#ws-api-open-orders
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTransaction(client: Client, message: any): void;
    handleMyTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    handleOrderUpdate(client: Client, message: any): void;
    parseWsOrderUpdate(order: any, market?: any): Order;
    fromPrecision(amount: any, scale: any): string;
    currencyFromPrecision(currency: any, amount: any): string;
    handleOrdersSnapshot(client: Client, message: any): void;
    /**
     * @method
     * @name cex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://cex.io/websocket-api#orderbook-subscribe
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBookSnapshot(client: Client, message: any): void;
    pairToSymbol(pair: any): string;
    handleOrderBookUpdate(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    /**
     * @method
     * @name cex#watchOHLCV
     * @see https://cex.io/websocket-api#minute-data
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market. It will return the last 120 minutes with the selected timeframe and then 1m candle updates after that.
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents.
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleInitOHLCV(client: Client, message: any): void;
    handleOHLCV24(client: Client, message: any): any;
    handleOHLCV1m(client: Client, message: any): void;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name cex#fetchOrderWs
     * @description fetches information on an order made by the user
     * @see https://docs.cex.io/#ws-api-get-order
     * @param {string} id the order id
     * @param {string} symbol not used by cex fetchOrder
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name cex#fetchOpenOrdersWs
     * @see https://docs.cex.io/#ws-api-open-orders
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name cex#createOrderWs
     * @see https://docs.cex.io/#ws-api-order-placement
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the kraken api endpoint
     * @param {boolean} [params.maker_only] Optional, maker only places an order only if offers best sell (<= max) or buy(>= max) price for this pair, if not order placement will be rejected with an error - "Order is not maker"
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name cex#editOrderWs
     * @description edit a trade order
     * @see https://docs.cex.io/#ws-api-cancel-replace
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name cex#cancelOrderWs
     * @see https://docs.cex.io/#ws-api-order-cancel
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol not used by cex cancelOrder ()
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name cex#cancelOrdersWs
     * @description cancel multiple orders
     * @see https://docs.cex.io/#ws-api-mass-cancel-place
     * @param {string[]} ids order ids
     * @param {string} symbol not used by cex cancelOrders()
     * @param {object} [params] extra parameters specific to the cex api endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrdersWs(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    resolveData(client: Client, message: any): void;
    handleConnected(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    handleAuthenticationMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<any>;
}
