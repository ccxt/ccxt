import backpackRest from '../backpack.js';
import type { Balances, Bool, Dict, Int, Market, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
import type { WsOrderBook } from '../base/ws/OrderBook.js';
export default class backpack extends backpackRest {
    describe(): any;
    /**
     * @ignore
     * @method
     * @name backpack#prepareWsStockParams
     * @description validates the stock selector before market loading and preserves it locally
     * @param {string} methodName calling method
     * @param {object} params exchange-specific parameters
     * @returns {object} local parameters with the validated stock selector
     */
    prepareWsStockParams(methodName: string, params: Dict): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name backpack#wsVenueMarketId
     * @description rejects undocumented provider and RFQ venue streams
     * @param {string} methodName calling method
     * @param {object} market resolved market
     * @param {object} params local parameters
     * @returns {string} venue market id
     */
    wsVenueMarketId(methodName: string, market: Market, params: Dict): Str;
    /**
     * @ignore
     * @method
     * @name backpack#subscribeWsTickers
     * @description subscribes to venue statistics or stock provider streams with explicit symbol routing
     * @param {string} methodName calling method
     * @param {string[]} [symbols] unified symbols
     * @param {object} [params] local parameters
     * @param {boolean} [bidAsk] whether bid and ask data is requested
     * @param {boolean} [unwatch] whether to unsubscribe
     * @returns {object} unified tickers
     */
    subscribeWsTickers(methodName: string, symbols?: Strings, params?: Dict, bidAsk?: boolean, unwatch?: boolean): Promise<Tickers>;
    watchPublic(topics: string[], messageHashes: string[], params?: Dict, unwatch?: boolean): Promise<any>;
    watchPrivate(topics: string[], messageHashes: string[], params?: Dict, unwatch?: boolean): Promise<any>;
    handleUnsubscriptions(url: string, messageHashes: string[], message: Dict): void;
    /**
     * @method
     * @name backpack#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock data; inferred from symbol when omitted
     * @param {string} [params.source] Venue or External; RFQ ticker symbols default to External
     * @param {string} [params.interval] External ticker interval, must be 1d
     * @param {string} [params.channel] stockPrice or stockIndicativeQuote for quotes instead of statistics
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name backpack#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock data; inferred from symbol when omitted
     * @param {string} [params.source] Venue or External, matching the subscription
     * @param {string} [params.interval] External ticker interval, must be 1d
     * @param {string} [params.channel] stockPrice or stockIndicativeQuote, matching the subscription
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name backpack#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock markets only; inferred from symbols when omitted
     * @param {string} [params.source] Venue or External; RFQ ticker symbols default to External
     * @param {string} [params.interval] External ticker interval, must be 1d
     * @param {string} [params.channel] stockPrice or stockIndicativeQuote for quotes instead of statistics
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name backpack#unWatchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock markets only; inferred from symbols when omitted
     * @param {string} [params.source] Venue or External, matching the subscription
     * @param {string} [params.interval] External ticker interval, must be 1d
     * @param {string} [params.channel] stockPrice or stockIndicativeQuote, matching the subscription
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: Dict): Promise<any>;
    handleTicker(client: Client, message: Dict): void;
    parseWsTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @ignore
     * @method
     * @name backpack#handleStockTicker
     * @description routes provider and indicative stock quotes without treating mid prices as trades
     * @param {object} client websocket client
     * @param {object} message stream envelope
     * @returns {boolean} whether a subscription was updated
     */
    handleStockTicker(client: Client, message: Dict): boolean;
    /**
     * @method
     * @name backpack#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Book-ticker
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock quotes; inferred from symbols when omitted
     * @param {string} [params.source] Venue or External; RFQ quotes default to indicative quotes
     * @param {string} [params.interval] External data interval, must be 1d
     * @param {string} [params.channel] stockPrice or stockIndicativeQuote, unavailable prices remain undefined
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name backpack#unWatchBidsAsks
     * @description unWatches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock markets only; inferred from symbols when omitted
     * @param {string} [params.source] Venue or External, matching the subscription
     * @param {string} [params.interval] External data interval, must be 1d
     * @param {string} [params.channel] stockPrice or stockIndicativeQuote, matching the subscription
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchBidsAsks(symbols?: Strings, params?: Dict): Promise<any>;
    handleBidAsk(client: Client, message: Dict): void;
    parseWsBidAsk(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name backpack#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/K-Line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects stock spot order-book candles, RFQ candles are unsupported
     * @param {string} [params.source] Venue only
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    /**
     * @method
     * @name backpack#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/K-Line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects stock spot order-book candles
     * @param {string} [params.source] Venue only
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name backpack#watchOHLCVForSymbols
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/K-Line
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] requires stock spot order-book markets, not RFQ markets
     * @param {string} [params.source] Venue only
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCVForSymbols(symbolsAndTimeframes: string[][], since?: Int, limit?: Int, params?: Dict): Promise<import("../base/types.js").Dictionary<import("../base/types.js").Dictionary<OHLCV[]>>>;
    /**
     * @method
     * @name backpack#unWatchOHLCVForSymbols
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/K-Line
     * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] requires stock spot order-book markets
     * @param {string} [params.source] Venue only
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCVForSymbols(symbolsAndTimeframes: string[][], params?: Dict): Promise<any>;
    handleOHLCV(client: Client, message: Dict): void;
    parseWsOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name backpack#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Trade
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] requires a stock spot order-book market, RFQ public trades are unsupported
     * @param {string} [params.source] Venue only
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name backpack#unWatchTrades
     * @description unWatches from the stream channel
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Trade
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] requires a stock spot order-book market
     * @param {string} [params.source] Venue only
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name backpack#watchTradesForSymbols
     * @description watches information on multiple trades made in a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Trade
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] requires stock spot order-book markets, not RFQ markets
     * @param {string} [params.source] Venue only
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name backpack#unWatchTradesForSymbols
     * @description unWatches from the stream channel
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Trade
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] requires stock spot order-book markets
     * @param {string} [params.source] Venue only
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    unWatchTradesForSymbols(symbols: string[], params?: Dict): Promise<any>;
    handleTrades(client: Client, message: Dict): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name backpack#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] requires a stock spot order-book market, not an RFQ market
     * @param {string} [params.source] Venue only
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name backpack#watchOrderBookForSymbols
     * @see https://docs.backpack.exchange/#tag/Streams/Public/Depth
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] requires stock spot order-book markets, not RFQ markets
     * @param {string} [params.source] Venue only
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2'
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name backpack#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] requires a stock spot order-book market
     * @param {string} [params.source] Venue only
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    unWatchOrderBook(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name backpack#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] requires stock spot order-book markets
     * @param {string} [params.source] Venue only
     * @param {string} [params.method] either '/market/level2' or '/spotMarket/level2Depth5' or '/spotMarket/level2Depth50' default is '/market/level2'
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: Dict): Promise<any>;
    handleOrderBook(client: Client, message: Dict): void;
    handleBookDelta(orderbook: WsOrderBook, delta: any): void;
    handleBidAsks(bookSide: any, bidAsks: any[]): void;
    getCacheIndex(orderbook: any, cache: any): number;
    /**
     * @method
     * @name backpack#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.backpack.exchange/#tag/Streams/Private/Order-update
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock orders, RFQ markets use account.rfqUpdate
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name backpack#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://docs.backpack.exchange/#tag/Streams/Private/Order-update
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock order subscriptions
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    unWatchOrders(symbol?: Str, params?: Dict): Promise<any>;
    handleOrder(client: Client, message: Dict): void;
    /**
     * @ignore
     * @method
     * @name backpack#parseWsRfqOrder
     * @description maps documented RFQ lifecycle fields to the REST order parser without inventing fills or fees
     * @param {object} data RFQ update payload
     * @param {object} [market] resolved RFQ market
     * @returns {object} unified order
     */
    parseWsRfqOrder(data: Dict, market?: Market): Order;
    /**
     * @method
     * @name backpack#watchBalance
     * @description watches absolute capital-account asset updates accumulated since subscription, without an initial snapshot
     * @see https://docs.backpack.exchange/#tag/Streams/Private/Balance-update
     * @param {object} [params] extra exchange-specific parameters
     * @param {boolean} [params.stock] return tokenized stock assets only; explicit because this method has no symbol
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    /**
     * @method
     * @name backpack#unWatchBalance
     * @description unsubscribes from all capital-account asset updates
     * @see https://docs.backpack.exchange/#tag/Streams/Private/Balance-update
     * @param {object} [params] extra exchange-specific parameters
     * @param {boolean} [params.stock] accepts the tokenized stock view selector; explicit because this method has no symbol
     * @returns {object} unsubscription result
     */
    unWatchBalance(params?: Dict): Promise<any>;
    /**
     * @ignore
     * @method
     * @name backpack#handleBalance
     * @description merges absolute asset balances using the REST capital parser
     * @param {object} client websocket client
     * @param {object} message stream envelope
     * @returns {boolean} whether a balance was updated
     */
    handleBalance(client: Client, message: Dict): boolean;
    parseWsOrder(order: Dict, market?: Market): Order;
    parseWsOrderStatus(status: Str, market?: Market): Str;
    parseWsOrderSide(side: Str): Str;
    /**
     * @method
     * @name backpack#watchPositions
     * @description watch all open positions
     * @see https://docs.backpack.exchange/#tag/Streams/Private/Position-update
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: Dict): Promise<Position[]>;
    /**
     * @method
     * @name backpack#unWatchPositions
     * @description unWatches from the stream channel
     * @see https://docs.backpack.exchange/#tag/Streams/Private/Position-update
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    unWatchPositions(symbols?: Strings, params?: Dict): Promise<any>;
    handlePositions(client: Client, message: Dict): void;
    parseWsPosition(position: Dict, market?: Market): Position;
    handleMessage(client: Client, message: any): void;
    handleErrorMessage(client: Client, message: Dict): Bool;
}
