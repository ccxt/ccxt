import type { Balances, Dict, Int, Liquidation, Order, OrderBook, Str, Strings, Ticker, Tickers, Trade, Market, OrderType, OrderSide, Num } from '../base/types.js';
import Client from '../base/ws/Client.js';
import lighterRest from '../lighter.js';
export default class lighter extends lighterRest {
    describe(): any;
    getMessageHash(unifiedChannel: string, symbol?: Str, extra?: Str): string;
    subscribePublic(messageHash: any, params?: {}): Promise<any>;
    subscribePublicMultiple(messageHashes: any, params?: {}): Promise<any>;
    unsubscribe(messageHash: any, params?: {}): Promise<any>;
    subscribePrivate(messageHash: any, params?: Dict): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name lighter#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name lighter#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#order-book
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name lighter#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name lighter#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name lighter#watchTickers
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name lighter#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name lighter#watchMarkPrice
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description watches a mark price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name lighter#watchMarkPrices
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description watches mark prices
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name lighter#unWatchMarkPrice
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description unWatches a mark price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchMarkPrice(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name lighter#unWatchMarkPrices
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#market-stats
     * @description unWatches mark prices
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchMarkPrices(symbols?: Strings, params?: {}): Promise<any>;
    parseWsTrade(trade: any, market?: Market): Trade;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name lighter#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name lighter#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    parseWsOrderTrade(trade: Dict, market?: Market): Trade;
    handleMyTrades(client: Client, message: any): boolean;
    /**
     * @method
     * @name lighter#watchMyTrades
     * @description subscribe to recent trades of an account.
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#account-all-trades
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name lighter#unWatchMyTrades
     * @description unsubscribe from the account trades channel
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#account-all-trades
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    unWatchMyTrades(symbol?: Str, params?: {}): Promise<any>;
    parseWsLiquidation(liquidation: any, market?: Market): Liquidation | undefined;
    handleLiquidation(client: Client, message: any): void;
    /**
     * @method
     * @name lighter#watchLiquidations
     * @description watch the public liquidations of a trading pair
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    /**
     * @method
     * @name lighter#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#account-all-assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', default is 'swap'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): boolean;
    /**
     * @name lighter#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#account-all-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name lighter#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#account-all-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    unWatchOrders(symbol?: Str, params?: {}): Promise<any>;
    requestId(url: string): string;
    /**
     * @method
     * @name lighter#createOrderWs
     * @description create a trade order
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#send-tx
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float|undefined} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] 'GTT' or 'IOC', default is 'GTT'
     * @param {int} [params.clientOrderId] client order id, should be unique for each order, default is a random number
     * @param {string} [params.triggerPrice] trigger price for stop loss or take profit orders, in units of the quote currency
     * @param {boolean} [params.reduceOnly] whether the order is reduce only, default false
     * @param {int} [params.nonce] nonce for the account
     * @param {int} [params.apiKeyIndex] apiKeyIndex
     * @param {int} [params.accountIndex] accountIndex
     * @param {int} [params.orderExpiry] orderExpiry
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name lighter#cancelOrderWs
     * @description cancel multiple orders
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#send-tx
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name lighter#cancelAllOrdersWs
     * @description cancel all open orders in a market
     * @see https://apidocs.lighter.xyz/docs/websocket-reference#send-tx
     * @param {string} [symbol] unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<Order[]>;
    handleWsSendtxApi(client: Client, message: any): void;
    handleOrders(client: Client, message: any): boolean;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleUnSubscription(client: Client, subscription: Dict): void;
    handlePing(client: Client, message: any): void;
    pong(client: Client, message: any): Promise<void>;
}
