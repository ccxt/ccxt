import defxRest from '../defx.js';
import type { Int, OHLCV, Ticker, Trade, OrderBook, Strings, Tickers, Balances, Str, Order, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class defx extends defxRest {
    describe(): any;
    watchPublic(topics: any, messageHashes: any, params?: {}): Promise<any>;
    unWatchPublic(topics: any, messageHashes: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name defx#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
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
     * @name defx#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name defx#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    /**
     * @method
     * @name defx#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name defx#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name defx#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to subscribe to, tickers by default. Can be tickers, sprd-tickers, index-tickers, block-tickers
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name defx#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name defx#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name defx#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name defx#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name defx#unWatchTradesForSymbols
     * @description unWatches from the stream channel
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name defx#watchTradesForSymbols
     * @description watches information on multiple trades made in a market
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name defx#unWatchTradesForSymbols
     * @description unWatches from the stream channel
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name defx#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name defx#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name defx#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name defx#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.postman.com/defxcode/defx-public-apis/collection/667939a1b5d8069c13d614e9
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    keepAliveListenKey(params?: {}): Promise<void>;
    authenticate(params?: {}): Promise<void>;
    /**
     * @method
     * @name defx#watchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.postman.com/defxcode/defx-public-apis/ws-raw-request/667939b2f00f79161bb47809
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    /**
     * @method
     * @name defx#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.postman.com/defxcode/defx-public-apis/ws-raw-request/667939b2f00f79161bb47809
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    /**
     * @method
     * @name defx#watchPositions
     * @description watch all open positions
     * @see https://www.postman.com/defxcode/defx-public-apis/ws-raw-request/667939b2f00f79161bb47809
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {number} [since] since timestamp
     * @param {number} [limit] limit
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handlePositions(client: any, message: any): void;
    handleMessage(client: Client, message: any): void;
}
