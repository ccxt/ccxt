import toobitRest from '../toobit.js';
import type { Int, Str, Ticker, OrderBook, Order, Trade, OHLCV, Dict, Market, Strings, Tickers, Balances, Position, Bool } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class toobit extends toobitRest {
    describe(): any;
    ping(client: Client): {
        ping: number;
    };
    handleMessage(client: Client, message: any): void;
    handleIncomingPong(client: Client, pongTimestamp: Int): void;
    /**
     * @method
     * @name toobit#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#trade-streams
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name toobit#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#trade-streams
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name toobit#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#kline-candlestick-streams
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
     * @name toobit#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#kline-candlestick-streams
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: {}): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    handleOHLCV(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    /**
     * @method
     * @name toobit#watchTicker
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#individual-symbol-ticker-streams
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name toobit#watchTickers
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#individual-symbol-ticker-streams
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTickers(client: Client, message: any): void;
    parseWsTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name toobit#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#partial-book-depth-streams
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name toobit#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#partial-book-depth-streams
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleOrderBookPartialSnapshot(client: Client, message: any): void;
    setOrderBookSnapshot(client: Client, message: any, channel: string): void;
    /**
     * @method
     * @name toobit#watchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#payload-account-update
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    setBalanceCache(client: Client, marketType: any, subscriptionHash?: Str, params?: {}): void;
    handleBalance(client: Client, message: any): void;
    loadBalanceSnapshot(client: any, messageHash: any, marketType: any): Promise<void>;
    /**
     * @method
     * @name toobit#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#payload-order-update
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    /**
     * @method
     * @name toobit#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://toobit-docs.github.io/apidocs/spot/v1/en/#payload-ticket-push
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unifiedMargin] use unified margin account
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrade(client: Client, message: any): void;
    parseMyTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name toobit#watchPositions
     * @see https://toobit-docs.github.io/apidocs/usdt_swap/v1/en/#event-position-update
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client, type: any, symbols?: Strings, isPortfolioMargin?: boolean): void;
    loadPositionsSnapshot(client: any, messageHash: any, type: any): Promise<void>;
    handlePositions(client: any, message: any): void;
    parseWsPosition(position: any, market?: any): Position;
    authenticate(params?: {}): Promise<any>;
    keepAliveListenKey(params?: {}): Promise<void>;
    getUserStreamUrl(): string;
    handleErrorMessage(client: Client, message: any): Bool;
}
