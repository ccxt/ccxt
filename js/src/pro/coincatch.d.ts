import coincatchRest from '../coincatch.js';
import type { Balances, Dict, Int, Market, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class coincatch extends coincatchRest {
    describe(): any;
    getMarketFromArg(entry: any): import("../base/types.js").MarketInterface;
    authenticate(params?: {}): Promise<any>;
    watchPublic(messageHash: any, subscribeHash: any, args: any, params?: {}): Promise<any>;
    unWatchPublic(messageHash: any, args: any, params?: {}): Promise<any>;
    watchPrivate(messageHash: any, subscribeHash: any, args: any, params?: {}): Promise<any>;
    watchPrivateMultiple(messageHashes: any, subscribeHashes: any, args: any, params?: {}): Promise<any>;
    handleAuthenticate(client: Client, message: any): void;
    watchPublicMultiple(messageHashes: any, subscribeHashes: any, argsArray: any, params?: {}): Promise<any>;
    unWatchChannel(symbol: string, channel: string, messageHashTopic: string, params?: {}): Promise<any>;
    getPublicInstTypeAndId(market: Market): any[];
    handleDMCBLMarketByMessageHashes(market: Market, hash: string, client: Client, timeframe?: Str): import("../base/types.js").MarketInterface;
    /**
     * @method
     * @name coincatch#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://coincatch.github.io/github.io/en/spot/#tickers-channel
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.instType] the type of the instrument to fetch the ticker for, 'SP' for spot markets, 'MC' for futures markets (default is 'SP')
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name coincatch#unWatchTicker
     * @description unsubscribe from the ticker channel
     * @see https://coincatch.github.io/github.io/en/mix/#tickers-channel
     * @param {string} symbol unified symbol of the market to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name coincatch#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://coincatch.github.io/github.io/en/mix/#tickers-channel
     * @param {string[]} symbols unified symbol of the market to watch the tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name coincatch#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://coincatch.github.io/github.io/en/spot/#candlesticks-channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch (not including)
     * @param {int} [limit] the maximum amount of candles to fetch (not including)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.instType] the type of the instrument to fetch the OHLCV data for, 'SP' for spot markets, 'MC' for futures markets (default is 'SP')
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name coincatch#unWatchOHLCV
     * @description unsubscribe from the ohlcv channel
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel
     * @param {string} symbol unified symbol of the market to unwatch the ohlcv for
     * @param timeframe
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name coincatch#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://coincatch.github.io/github.io/en/spot/#depth-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name coincatch#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @see https://coincatch.github.io/github.io/en/spot/#depth-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name coincatch#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://coincatch.github.io/github.io/en/spot/#depth-channel
     * @param symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleCheckSumError(client: Client, symbol: string, messageHash: string): Promise<void>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    /**
     * @method
     * @name coincatch#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://coincatch.github.io/github.io/en/spot/#trades-channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coincatch#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://coincatch.github.io/github.io/en/spot/#trades-channel
     * @param symbols
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coincatch#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://coincatch.github.io/github.io/en/spot/#trades-channel
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name coincatch#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://coincatch.github.io/github.io/en/spot/#account-channel
     * @see https://coincatch.github.io/github.io/en/mix/#account-channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {str} [params.type] 'spot' or 'swap' (default is 'spot')
     * @param {string} [params.instType] *swap only* 'umcbl' or 'dmcbl' (default is 'umcbl')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    /**
     * @method
     * @name coincatch#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://coincatch.github.io/github.io/en/spot/#order-channel
     * @see https://coincatch.github.io/github.io/en/mix/#order-channel
     * @see https://coincatch.github.io/github.io/en/mix/#plan-order-channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap'
     * @param {string} [params.instType] *swap only* 'umcbl' or 'dmcbl' (default is 'umcbl')
     * @param {bool} [params.trigger] *swap only* whether to watch trigger orders (default is false)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name coincatch#watchPositions
     * @description watch all open positions
     * @see https://coincatch.github.io/github.io/en/mix/#positions-channel
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param since
     * @param limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    getPrivateInstType(market: Market): "umcbl" | "dmcbl";
    handlePositions(client: Client, message: any): void;
    parseWsPosition(position: any, market?: any): Position;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
    ping(client: Client): string;
    handlePong(client: Client, message: any): any;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleUnSubscriptionStatus(client: Client, message: any): any;
    handleOrderBookUnSubscription(client: Client, message: any): void;
    handleTradesUnSubscription(client: Client, message: any): void;
    handleTickerUnSubscription(client: Client, message: any): void;
    handleOHLCVUnSubscription(client: Client, message: any): void;
}
