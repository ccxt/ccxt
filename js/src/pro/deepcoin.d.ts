import deepcoinRest from '../deepcoin.js';
import type { Dict, Int, Market, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class deepcoin extends deepcoinRest {
    describe(): any;
    ping(client: Client): string;
    handlePong(client: Client, message: any): any;
    requestId(): any;
    createPublicRequest(market: Market, requestId: number, topicID: string, suffix?: string, unWatch?: boolean): {
        sendTopicAction: {
            Action: string;
            FilterValue: string;
            LocalNo: number;
            ResumeNo: number;
            TopicID: string;
        };
    };
    watchPublic(market: Market, messageHash: string, topicID: string, params?: Dict, suffix?: string): Promise<any>;
    unWatchPublic(market: Market, messageHash: string, topicID: string, params?: Dict, subscription?: Dict, suffix?: string): Promise<any>;
    watchPrivate(messageHash: string, params?: Dict): Promise<any>;
    authenticate(params?: {}): Promise<string>;
    /**
     * @method
     * @name deepcoin#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.deepcoin.com/docs/publicWS/latestMarketData
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name deepcoin#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.deepcoin.com/docs/publicWS/latestMarketData
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    handleTicker(client: Client, message: any): void;
    parseWsTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name deepcoin#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://www.deepcoin.com/docs/publicWS/lastTransactions
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name deepcoin#unWatchTrades
     * @description unWatches the list of most recent trades for a particular symbol
     * @see https://www.deepcoin.com/docs/publicWS/lastTransactions
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    parseTradeSide(direction: Str): Str;
    handleTakerOrMaker(matchRole: Str): Str;
    /**
     * @method
     * @name deepcoin#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.deepcoin.com/docs/publicWS/KLines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name deepcoin#unWatchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Streams/Public/K-Line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} [timeframe] the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    handleOHLCV(client: Client, message: any): void;
    parseWsOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name deepcoin#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.deepcoin.com/docs/publicWS/25LevelIncrementalMarketData
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name deepcoin#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.deepcoin.com/docs/publicWS/25LevelIncrementalMarketData
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    handleOrderBook(client: Client, message: any): void;
    handleOrderBookSnapshot(client: Client, message: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): void;
    handleDelta(orderbook: any, entry: any): void;
    /**
     * @method
     * @name deepcoin#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://www.deepcoin.com/docs/privateWS/Trade
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrade(client: Client, message: any): void;
    /**
     * @method
     * @name deepcoin#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.deepcoin.com/docs/privateWS/order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: Market): Order;
    parseWsOrderStatus(status: Str): Str;
    /**
     * @method
     * @name deepcoin#watchPositions
     * @description watch all open positions
     * @see https://www.deepcoin.com/docs/privateWS/Position
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handlePosition(client: Client, message: any): void;
    parseWsPosition(position: any, market?: Market): Position;
    parsePositionSide(direction: Str): Str;
    parseWsMarginMode(marginMode: Str): Str;
    handleMessage(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleUnSubscription(client: Client, subscription: Dict): void;
    handleErrorMessage(client: Client, message: any): void;
}
