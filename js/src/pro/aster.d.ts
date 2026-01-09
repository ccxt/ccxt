import asterRest from '../aster.js';
import type { Strings, Tickers, Dict, Ticker, Int, Market, Trade, OrderBook, OHLCV } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class aster extends asterRest {
    describe(): any;
    getAccountTypeFromSubscriptions(subscriptions: string[]): string;
    /**
     * @method
     * @name aster#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#full-ticker-per-symbol
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-ticker-streams
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name aster#unWatchTicker
     * @description unWatches a price ticker
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#full-ticker-per-symbol
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-ticker-streams
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name aster#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#full-ticker-per-symbol
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-ticker-streams
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name aster#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#full-ticker-per-symbol
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-ticker-streams
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name aster#watchMarkPrice
     * @description watches a mark price for a specific market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#mark-price-stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name aster#unWatchMarkPrice
     * @description unWatches a mark price for a specific market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#mark-price-stream
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchMarkPrice(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name aster#watchMarkPrices
     * @description watches the mark price for all markets
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#mark-price-stream
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name aster#unWatchMarkPrices
     * @description watches the mark price for all markets
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#mark-price-stream
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.use1sFreq] *default is true* if set to true, the mark price will be updated every second, otherwise every 3 seconds
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchMarkPrices(symbols?: Strings, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(message: any, marketType: any): Ticker;
    /**
     * @method
     * @name aster#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#best-order-book-information-by-symbol
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-book-ticker-streams
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name aster#unWatchBidsAsks
     * @description unWatches best bid & ask for symbols
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#best-order-book-information-by-symbol
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#individual-symbol-book-ticker-streams
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchBidsAsks(symbols?: Strings, params?: {}): Promise<any>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(message: any, market?: any): Ticker;
    /**
     * @method
     * @name aster#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#collection-transaction-flow
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#aggregate-trade-streams
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name aster#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#collection-transaction-flow
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#aggregate-trade-streams
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name aster#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#collection-transaction-flow
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#aggregate-trade-streams
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name aster#unWatchTradesForSymbols
     * @description unsubscribe from the trades channel
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#collection-transaction-flow
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#aggregate-trade-streams
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleTrade(client: Client, message: any): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name aster#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#limited-depth-information
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#partial-book-depth-streams
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name aster#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#limited-depth-information
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#partial-book-depth-streams
     * @param {string} symbol symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name aster#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#limited-depth-information
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#partial-book-depth-streams
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name aster#unWatchOrderBookForSymbols
     * @description unsubscribe from the orderbook channel
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#limited-depth-information
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#partial-book-depth-streams
     * @param {string[]} symbols unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name aster#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#k-line-streams
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#klinecandlestick-streams
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
     * @name aster#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#k-line-streams
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#klinecandlestick-streams
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name aster#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#k-line-streams
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#klinecandlestick-streams
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    /**
     * @method
     * @name aster#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-spot-api.md#k-line-streams
     * @see https://github.com/asterdex/api-docs/blob/master/aster-finance-futures-api.md#klinecandlestick-streams
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    handleMessage(client: Client, message: any): void;
}
