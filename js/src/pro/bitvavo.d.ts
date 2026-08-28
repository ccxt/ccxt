import bitvavoRest from '../bitvavo.js';
import { Int, Str, OrderSide, OrderType, OrderBook, Ticker, Trade, Order, OHLCV, Balances, Num, TradingFees, Dict, Strings, Tickers, Bool, Currencies, Market, Transaction } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bitvavo extends bitvavoRest {
    describe(): any;
    watchPublic(name: any, symbol: any, params?: {}): Promise<any>;
    watchPublicMultiple(methodName: any, channelName: string, symbols: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitvavo#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.bitvavo.com/#tag/Market-data-subscription-WebSocket/paths/~1subscribeTicker24h/post
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bitvavo#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.bitvavo.com/#tag/Market-data-subscription-WebSocket/paths/~1subscribeTicker24h/post
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name bitvavo#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.bitvavo.com/#tag/Market-data-subscription-WebSocket/paths/~1subscribeTicker24h/post
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: Market): Ticker;
    /**
     * @method
     * @name bitvavo#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: Client, message: any): void;
    /**
     * @method
     * @name bitvavo#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://docs.bitvavo.com/docs/websocket-api/trades-subscription/
     * @param {string[]} symbols unified symbols of the markets to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitvavo#unWatchTrades
     * @description stop watching the list of most recent trades for a particular symbol
     * @see https://docs.bitvavo.com/docs/websocket-api/trades-subscription/
     * @param {string} symbol unified symbol of the market to stop watching the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitvavo#unWatchTradesForSymbols
     * @description stop watching the list of most recent trades for a list of symbols
     * @see https://docs.bitvavo.com/docs/websocket-api/trades-subscription/
     * @param {string[]} symbols unified symbols of the markets to stop watching the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    /**
     * @method
     * @name bitvavo#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleFetchOHLCV(client: Client, message: any): void;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name bitvavo#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of multiple markets
     * @see https://docs.bitvavo.com/docs/websocket-api/candles-subscription/
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/EUR', '1m'], ['ETH/EUR', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [symbol, timeframe] keyed arrays of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    /**
     * @method
     * @name bitvavo#unWatchOHLCV
     * @description stop watching historical candlestick data for a market
     * @see https://docs.bitvavo.com/docs/websocket-api/candles-subscription/
     * @param {string} symbol unified symbol of the market to stop watching the candles for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitvavo#unWatchOHLCVForSymbols
     * @description stop watching historical candlestick data for multiple markets
     * @see https://docs.bitvavo.com/docs/websocket-api/candles-subscription/
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to stop watching the candles for, example [['BTC/EUR', '1m'], ['ETH/EUR', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: {}): Promise<any>;
    /**
     * @method
     * @name bitvavo#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name bitvavo#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
     * @see https://docs.bitvavo.com/docs/websocket-api/book-subscription/
     * @param {string[]} symbols unified symbols of the markets to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name bitvavo#unWatchOrderBook
     * @description stop watching the order book for a particular symbol
     * @see https://docs.bitvavo.com/docs/websocket-api/book-subscription/
     * @param {string} symbol unified symbol of the market to stop watching the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitvavo#unWatchOrderBookForSymbols
     * @description stop watching the order book for multiple markets
     * @see https://docs.bitvavo.com/docs/websocket-api/book-subscription/
     * @param {string[]} symbols unified symbols of the markets to stop watching the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    handleOrderBook(client: Client, message: any): void;
    watchOrderBookSnapshot(client: any, message: any, subscription: any): Promise<any>;
    handleOrderBookSnapshot(client: Client, message: any): void;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    handleOrderBookSubscriptions(client: Client, message: any, marketIds: any): void;
    unWatchChannels(topic: string, channels: any[], subMessageHashes: string[], subscriptionArgs: Dict, params?: {}): Promise<any>;
    handleUnsubscriptionStatus(client: Client, message: any): any;
    /**
     * @method
     * @name bitvavo#watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitvavo#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitvavo#createOrderWs
     * @description create a trade order
     * @see https://docs.bitvavo.com/#tag/Orders/paths/~1order/post
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
     * @param {float} [params.stopPrice] The price at which a trigger order is triggered at
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {bool} [params.postOnly] If true, the order will only be posted to the order book and not executed immediately
     * @param {float} [params.stopLossPrice] The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price at which a take profit order is triggered at
     * @param {string} [params.triggerType] "price"
     * @param {string} [params.triggerReference] "lastTrade", "bestBid", "bestAsk", "midPrice" Only for stop orders: Use this to determine which parameter will trigger the order
     * @param {string} [params.selfTradePrevention] "decrementAndCancel", "cancelOldest", "cancelNewest", "cancelBoth"
     * @param {bool} [params.disableMarketProtection] don't cancel if the next fill price is 10% worse than the best fill price
     * @param {bool} [params.responseRequired] Set this to 'false' when only an acknowledgement of success or failure is required, this is faster.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitvavo#editOrderWs
     * @description edit a trade order
     * @see https://docs.bitvavo.com/#tag/Orders/paths/~1order/put
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrderWs(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitvavo#cancelOrderWs
     * @see https://docs.bitvavo.com/#tag/Orders/paths/~1order/delete
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitvavo#cancelAllOrdersWs
     * @see https://docs.bitvavo.com/#tag/Orders/paths/~1orders/delete
     * @description cancel all open orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<Order[]>;
    handleMultipleOrders(client: Client, message: any): void;
    /**
     * @method
     * @name bitvavo#fetchOrderWs
     * @see https://docs.bitvavo.com/#tag/General/paths/~1assets/get
     * @description fetches information on an order made by the user
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitvavo#fetchOrdersWs
     * @see https://docs.bitvavo.com/#tag/Orders/paths/~1orders/get
     * @description fetches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of  orde structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    requestId(): number;
    watchRequest(action: any, request: any): Promise<any>;
    /**
     * @method
     * @name bitvavo#fetchOpenOrdersWs
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrdersWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitvavo#fetchMyTradesWs
     * @see https://docs.bitvavo.com/#tag/Trades
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTradesWs(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any): void;
    /**
     * @method
     * @name bitvavo#withdrawWs
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdrawWs(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    handleWithdraw(client: Client, message: any): void;
    /**
     * @method
     * @name bitvavo#fetchWithdrawalsWs
     * @see https://docs.bitvavo.com/#tag/Account/paths/~1withdrawalHistory/get
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawalsWs(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    handleWithdraws(client: Client, message: any): void;
    /**
     * @method
     * @name bitvavo#fetchOHLCVWs
     * @see https://docs.bitvavo.com/#tag/Market-Data/paths/~1{market}~1candles/get
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCVWs(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name bitvavo#fetchDepositsWs
     * @see https://docs.bitvavo.com/#tag/Account/paths/~1depositHistory/get
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDepositsWs(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    handleDeposits(client: Client, message: any): void;
    /**
     * @method
     * @name bitvavo#fetchTradingFeesWs
     * @see https://docs.bitvavo.com/#tag/Account/paths/~1account/get
     * @description fetch the trading fees for multiple markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFeesWs(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name bitvavo#fetchMarketsWs
     * @see https://docs.bitvavo.com/#tag/General/paths/~1markets/get
     * @description retrieves data on all markets for bitvavo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarketsWs(params?: {}): Promise<any>;
    /**
     * @method
     * @name bitvavo#fetchCurrenciesWs
     * @see https://docs.bitvavo.com/#tag/General/paths/~1assets/get
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrenciesWs(params?: {}): Promise<Currencies>;
    handleFetchCurrencies(client: Client, message: any): void;
    handleTradingFees(client: Client, message: any): void;
    /**
     * @method
     * @name bitvavo#fetchBalanceWs
     * @see https://docs.bitvavo.com/#tag/Account/paths/~1balance/get
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
     */
    fetchBalanceWs(params?: {}): Promise<Balances>;
    handleFetchBalance(client: Client, message: any): void;
    handleSingleOrder(client: Client, message: any): void;
    handleMarkets(client: Client, message: any): void;
    buildMessageHash(action: any, params?: {}): any;
    actionAndMarketMessageHash(action: any, params?: {}): string;
    actionAndOrderIdMessageHash(action: any, params?: {}): string;
    handleOrder(client: Client, message: any): void;
    handleMyTrade(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): any;
    authenticate(params?: {}): Promise<any>;
    handleAuthenticationMessage(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): Bool;
    handleMessage(client: Client, message: any): void;
}
