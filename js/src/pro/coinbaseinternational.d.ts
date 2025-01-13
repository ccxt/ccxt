import coinbaseinternationalRest from '../coinbaseinternational.js';
import { Ticker, Int, Trade, OrderBook, Market, Dict, Strings, FundingRate, FundingRates, Tickers, OHLCV } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class coinbaseinternational extends coinbaseinternationalRest {
    describe(): any;
    /**
     * @ignore
     * @method
     * @description subscribes to a websocket channel
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-overview#subscribe
     * @param {string} name the name of the channel
     * @param {string[]} [symbols] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} subscription to a websocket channel
     */
    subscribe(name: string, symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @description subscribes to a websocket channel using watchMultiple
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-overview#subscribe
     * @param {string} name the name of the channel
     * @param {string|string[]} [symbols] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} subscription to a websocket channel
     */
    subscribeMultiple(name: string, symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name coinbaseinternational#watchFundingRate
     * @description watch the current funding rate
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#funding-channel
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    watchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name coinbaseinternational#watchFundingRates
     * @description watch the funding rate for multiple markets
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#funding-channel
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
     */
    watchFundingRates(symbols: string[], params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name coinbaseinternational#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#instruments-channel
     * @param {string} [symbol] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to watch, 'LEVEL1' or 'INSTRUMENTS', default is 'LEVEL1'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    getActiveSymbols(): any[];
    /**
     * @method
     * @name coinbaseinternational#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#instruments-channel
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.channel] the channel to watch, 'LEVEL1' or 'INSTRUMENTS', default is 'INSTLEVEL1UMENTS'
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleInstrument(client: Client, message: any): void;
    parseWsInstrument(ticker: Dict, market?: any): Ticker;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: object, market?: Market): Ticker;
    /**
     * @method
     * @name coinbaseinternational#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.cdp.coinbase.com/intx/docs/websocket-channels#candles-channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): void;
    /**
     * @method
     * @name coinbaseinternational#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#match-channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinbaseinternational#watchTradesForSymbols
     * @description get the list of most recent trades for a list of symbols
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: any, message: any): any;
    parseWsTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name coinbaseinternational#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#level2-channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name coinbaseinternational#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.cloud.coinbase.com/intx/docs/websocket-channels#level2-channel
     * @param {string[]} symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: any, message: any): void;
    handleDelta(orderbook: any, delta: any): void;
    handleDeltas(orderbook: any, deltas: any): void;
    handleSubscriptionStatus(client: any, message: any): any;
    handleFundingRate(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: any, message: any): void;
}
