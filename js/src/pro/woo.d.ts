import wooRest from '../woo.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances, Position, Dict, Bool, FundingRate, Market } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class woo extends wooRest {
    describe(): any;
    requestId(url: string): number;
    watchPublic(messageHash: string, message: Dict): Promise<any>;
    unwatchPublic(subHash: string, symbol: Str, topic: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name woo#watchOrderBook
     * @see https://docs.woox.io/#orderbookupdate
     * @see https://docs.woox.io/#orderbook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either (default) 'orderbook' or 'orderbookupdate', default is 'orderbook'
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name woo#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.woox.io/#orderbookupdate
     * @see https://docs.woox.io/#orderbook
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: Dict): void;
    handleOrderBookSubscription(client: Client, message: Dict, subscription: Dict): void;
    fetchOrderBookSnapshot(client: Client, message: Dict, subscription: Dict): Promise<void>;
    handleOrderBookMessage(client: Client, message: Dict, orderbook: any): any;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    /**
     * @method
     * @name woo#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name woo#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    parseWsTicker(ticker: Dict, market?: Market): Ticker;
    handleTicker(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name woo#watchTickers
     * @see https://docs.woox.io/#24h-tickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name woo#unWatchTickers
     * @see https://docs.woox.io/#24h-tickers
     * @description stops watching a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to stop fetching the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: Dict): Promise<any>;
    handleTickers(client: Client, message: Dict): void;
    /**
     * @method
     * @name woo#watchBidsAsks
     * @see https://docs.woox.io/#bbos
     * @description watches best bid & ask for symbols
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name woo#unWatchBidsAsks
     * @see https://docs.woox.io/#bbos
     * @description unWatches best bid & ask for symbols
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for (not used by woo)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchBidsAsks(symbols?: Strings, params?: {}): Promise<any>;
    handleBidAsk(client: Client, message: Dict): void;
    parseWsBidAsk(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name woo#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.woox.io/#k-line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    /**
     * @method
     * @name woo#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.woox.io/#k-line
     * @param {string} symbol unified symbol of the market
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: Dict): Promise<any>;
    handleOHLCV(client: Client, message: Dict): void;
    /**
     * @method
     * @name woo#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.woox.io/#trade
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name woo#unWatchTrades
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.woox.io/#trade
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    handleTrade(client: Client, message: Dict): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    checkRequiredUid(error?: boolean): boolean;
    authenticate(params?: Dict): Promise<any>;
    watchPrivate(messageHash: string, message: Dict, params?: Dict): Promise<any>;
    watchPrivateMultiple(messageHashes: string[], message: Dict, params?: Dict): Promise<any>;
    /**
     * @method
     * @name woo#watchOrders
     * @see https://docs.woox.io/#executionreport
     * @see https://docs.woox.io/#algoexecutionreportv2
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name woo#watchMyTrades
     * @see https://docs.woox.io/#executionreport
     * @see https://docs.woox.io/#algoexecutionreportv2
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseWsOrder(order: Dict, market?: Market): Order;
    handleOrderUpdate(client: Client, message: Dict): void;
    handleOrder(client: Client, message: Dict, topic: Str): void;
    handleMyTrade(client: Client, message: Dict): void;
    /**
     * @method
     * @name woo#watchPositions
     * @see https://docs.woox.io/#position-push
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch
     * @param {int} [limit] the maximum number of positions to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: Dict): Promise<Position[]>;
    setPositionsCache(client: Client, type: any, symbols?: Strings): void;
    loadPositionsSnapshot(client: Client, messageHash: string): Promise<void>;
    handlePositions(client: Client, message: Dict): void;
    /**
     * @method
     * @see https://docs.woox.io/#balance
     * @name woo#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    handleBalance(client: Client, message: Dict): void;
    /**
     * @method
     * @name woo#watchFundingRate
     * @description watch the current funding rate
     * @see https://docs.woox.io/#estfundingrate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    watchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    handleFundingRate(client: Client, message: Dict): void;
    handleErrorMessage(client: Client, message: Dict): Bool;
    handleUnSubscription(client: Client, message: Dict): void;
    handleMessage(client: Client, message: Dict): void;
    ping(client: Client): Dict;
    pong(client: Client, message: Dict): Promise<void>;
    handlePing(client: Client, message: Dict): void;
    handlePong(client: Client, message: Dict): Dict;
    handleSubscribe(client: Client, message: Dict): Dict;
    handleAuth(client: Client, message: Dict): void;
}
