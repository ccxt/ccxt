import cryptocomRest from '../cryptocom.js';
import type { Int, OrderSide, OrderType, Str, Strings, OrderBook, Order, Trade, Ticker, OHLCV, Position, Balances, Num, Dict, Tickers, Market } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class cryptocom extends cryptocomRest {
    describe(): any;
    pong(client: any, message: any): Promise<void>;
    /**
     * @method
     * @name cryptocom#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.bookSubscriptionType] The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates
     * @param {int} [params.bookUpdateFrequency] Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name cryptocom#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.bookSubscriptionType] The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates
     * @param {int} [params.bookUpdateFrequency] Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name cryptocom#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.bookSubscriptionType] The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates
     * @param {int} [params.bookUpdateFrequency] Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name cryptocom#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#book-instrument_name
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is 50
     * @param {string} [params.bookSubscriptionType] The subscription type. Allowed values: SNAPSHOT full snapshot. This is the default if not specified. SNAPSHOT_AND_UPDATE delta updates
     * @param {int} [params.bookUpdateFrequency] Book update interval in ms. Allowed values: 100 for snapshot subscription 10 for delta subscription
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<OrderBook>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name cryptocom#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name cryptocom#unWatchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name cryptocom#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name cryptocom#unWatchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#trade-instrument_name
     * @param {string[]} [symbols] list of unified market symbols to unwatch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name cryptocom#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-trade-instrument_name
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name cryptocom#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name cryptocom#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name cryptocom#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name cryptocom#unWatchTickers
     * @description unWatches a price ticker
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name cryptocom#watchBidsAsks
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#ticker-instrument_name
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name cryptocom#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#candlestick-time_frame-instrument_name
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
     * @name cryptocom#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#candlestick-time_frame-instrument_name
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name cryptocom#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-order-instrument_name
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any, subscription?: any): void;
    /**
     * @method
     * @name cryptocom#watchPositions
     * @description watch all open positions
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-position_balance
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client, type: any, symbols?: Strings): void;
    loadPositionsSnapshot(client: any, messageHash: any): Promise<void>;
    handlePositions(client: any, message: any): void;
    /**
     * @method
     * @name cryptocom#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#user-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    /**
     * @method
     * @name cryptocom#createOrderWs
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrderWs(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    handleOrder(client: Client, message: any): void;
    /**
     * @method
     * @name cryptocom#cancelOrderWs
     * @description cancels an open order
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order
     * @param {string} id the order id of the order to cancel
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrderWs(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name cryptocom#cancelAllOrdersWs
     * @description cancel all open orders
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-all-orders
     * @param {string} symbol unified market symbol of the orders to cancel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} Returns exchange raw message {@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrdersWs(symbol?: Str, params?: {}): Promise<any>;
    handleCancelAllOrders(client: Client, message: any): void;
    watchPublic(messageHash: any, params?: {}): Promise<any>;
    watchPublicMultiple(messageHashes: any, topics: any, params?: {}): Promise<any>;
    unWatchPublicMultiple(topic: string, symbols: string[], messageHashes: string[], subMessageHashes: string[], topics: string[], params?: {}, subExtend?: {}): Promise<any>;
    watchPrivateRequest(nonce: any, params?: {}): Promise<any>;
    watchPrivateSubscribe(messageHash: any, params?: {}): Promise<any>;
    handleErrorMessage(client: Client, message: any): boolean;
    handleSubscribe(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    authenticate(params?: {}): Promise<any>;
    handlePing(client: Client, message: any): void;
    handleAuthenticate(client: Client, message: any): void;
    handleUnsubscribe(client: Client, message: any): void;
}
