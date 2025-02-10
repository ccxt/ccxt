import kucoinfuturesRest from '../kucoinfutures.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, Balances, Position, Strings, Tickers, OHLCV, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class kucoinfutures extends kucoinfuturesRest {
    describe(): any;
    negotiate(privateChannel: any, params?: {}): Promise<any>;
    negotiateHelper(privateChannel: any, params?: {}): Promise<string>;
    requestId(): any;
    subscribe(url: any, messageHash: any, subscriptionHash: any, subscription: any, params?: {}): Promise<any>;
    subscribeMultiple(url: any, messageHashes: any, topic: any, subscriptionHashes: any, subscriptionArgs: any, params?: {}): Promise<any>;
    unSubscribeMultiple(url: any, messageHashes: any, topic: any, subscriptionHashes: any, params?: {}, subscription?: Dict): Promise<any>;
    /**
     * @method
     * @name kucoinfutures#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs/websocket/futures-trading/public-channels/get-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name kucoinfutures#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name kucoinfutures#watchBidsAsks
     * @see https://www.kucoin.com/docs/websocket/futures-trading/public-channels/get-ticker-v2
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    watchMultiRequest(methodName: any, channelName: string, symbols?: Strings, params?: {}): Promise<any>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name kucoinfutures#watchPosition
     * @description watch open positions for a specific symbol
     * @see https://docs.kucoin.com/futures/#position-change-events
     * @param {string|undefined} symbol unified market symbol
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPosition(symbol?: Str, params?: {}): Promise<Position>;
    getCurrentPosition(symbol: any): any;
    setPositionCache(client: Client, symbol: string): void;
    loadPositionSnapshot(client: any, messageHash: any, symbol: any): Promise<void>;
    handlePosition(client: Client, message: any): void;
    /**
     * @method
     * @name kucoinfutures#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.kucoin.com/futures/#execution-data
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kucoinfutures#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @param {string[]} symbols
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kucoinfutures#unWatchTrades
     * @description unWatches trades stream
     * @see https://docs.kucoin.com/futures/#execution-data
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoinfutures#unWatchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @param {string[]} symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTradesForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleTrade(client: Client, message: any): any;
    /**
     * @method
     * @name kucoinfutures#watchOHLCV
     * @see https://www.kucoin.com/docs/websocket/futures-trading/public-channels/klines
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
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
     * @name kucoinfutures#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     *   1. After receiving the websocket Level 2 data flow, cache the data.
     *   2. Initiate a REST request to get the snapshot data of Level 2 order book.
     *   3. Playback the cached Level 2 data flow.
     *   4. Apply the new Level 2 data flow to the local snapshot to ensure that the sequence of the new Level 2 update lines up with the sequence of the previous Level 2 data. Discard all the message prior to that sequence, and then playback the change to snapshot.
     *   5. Update the level2 full data based on sequence according to the size. If the price is 0, ignore the messages and update the sequence. If the size=0, update the sequence and remove the price of which the size is 0 out of level 2. For other cases, please update the price.
     *   6. If the sequence of the newly pushed message does not line up to the sequence of the last message, you could pull through REST Level 2 message request to get the updated messages. Please note that the difference between the start and end parameters cannot exceed 500.
     * @see https://docs.kucoin.com/futures/#level-2-market-data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name kucoinfutures#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.kucoin.com/futures/#level-2-market-data
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name kucoinfutures#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.kucoin.com/futures/#level-2-market-data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoinfutures#unWatchOrderBookForSymbols
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string[]} symbols unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBookForSymbols(symbols: string[], params?: {}): Promise<any>;
    handleDelta(orderbook: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: Client, message: any): void;
    getCacheIndex(orderbook: any, cache: any): any;
    handleSystemStatus(client: Client, message: any): any;
    /**
     * @method
     * @name kucoinfutures#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.kucoin.com/futures/#trade-orders-according-to-the-market
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseWsOrderStatus(status: any): string;
    parseWsOrder(order: any, market?: any): Order;
    handleOrder(client: Client, message: any): void;
    /**
     * @method
     * @name kucoinfutures#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.kucoin.com/futures/#account-balance-events
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    handleBalanceSubscription(client: Client, message: any, subscription: any): void;
    fetchBalanceSnapshot(client: any, message: any): Promise<void>;
    handleSubject(client: Client, message: any): void;
    getMessageHash(elementName: string, symbol?: Str): string;
    ping(client: Client): {
        id: any;
        type: string;
    };
    handlePong(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
}
