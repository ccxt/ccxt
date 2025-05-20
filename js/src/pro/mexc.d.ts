import mexcRest from '../mexc.js';
import type { Int, OHLCV, Str, OrderBook, Order, Trade, Ticker, Balances, Tickers, Strings } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class mexc extends mexcRest {
    describe(): any;
    /**
     * @method
     * @name mexc#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#individual-symbol-book-ticker-streams
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#miniticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.miniTicker] set to true for using the miniTicker endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): void;
    /**
     * @method
     * @name mexc#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#individual-symbol-book-ticker-streams
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#minitickers
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.miniTicker] set to true for using the miniTicker endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTickers(client: Client, message: any): void;
    parseWsTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name mexc#watchBidsAsks
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#individual-symbol-book-ticker-streams
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    watchSpotPublic(channel: any, messageHash: any, params?: {}): Promise<any>;
    watchSpotPrivate(channel: any, messageHash: any, params?: {}): Promise<any>;
    watchSwapPublic(channel: any, messageHash: any, requestParams: any, params?: {}): Promise<any>;
    watchSwapPrivate(messageHash: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name mexc#watchOHLCV
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#kline-streams
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
    parseWsOHLCV(ohlcv: any, market?: any): OHLCV;
    /**
     * @method
     * @name mexc#watchOrderBook
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#diff-depth-stream
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBookSubscription(client: Client, message: any): void;
    getCacheIndex(orderbook: any, cache: any): any;
    handleOrderBook(client: Client, message: any): void;
    handleBooksideDelta(bookside: any, bidasks: any): void;
    handleDelta(orderbook: any, delta: any): void;
    /**
     * @method
     * @name mexc#watchTrades
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#trade-streams
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#public-channels
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    /**
     * @method
     * @name mexc#watchMyTrades
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#spot-account-deals
     * @see https://mexcdevelop.github.io/apidocs/contract_v1_en/#private-channels
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrade(client: Client, message: any, subscription?: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name mexc#watchOrders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#spot-account-orders
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#margin-account-orders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|undefined} params.type the type of orders to retrieve, can be 'spot' or 'margin'
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    parseWsOrderStatus(status: any, market?: any): string;
    parseWsOrderType(type: any): string;
    parseWsTimeInForce(timeInForce: any): string;
    /**
     * @method
     * @name mexc#watchBalance
     * @see https://mexcdevelop.github.io/apidocs/spot_v3_en/#spot-account-upadte
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    /**
     * @method
     * @name mexc#unWatchTicker
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTicker(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name mexc#unWatchTickers
     * @description unWatches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchTickers(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name mexc#unWatchBidsAsks
     * @description unWatches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    unWatchBidsAsks(symbols?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name mexc#unWatchOHLCV
     * @description unWatches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timezone] if provided, kline intervals are interpreted in that timezone instead of UTC, example '+08:00'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name mexc#unWatchOrderBook
     * @description unWatches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified array of symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    unWatchOrderBook(symbol: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name mexc#unWatchTrades
     * @description unsubscribes from the trades channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.name] the name of the method to call, 'trade' or 'aggTrade', default is 'trade'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    unWatchTrades(symbol: string, params?: {}): Promise<any>;
    handleUnsubscriptions(client: Client, messageHashes: string[]): void;
    authenticate(subscriptionHash: any, params?: {}): Promise<string>;
    keepAliveListenKey(listenKey: any, params?: {}): Promise<void>;
    handlePong(client: Client, message: any): any;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleMessage(client: Client, message: any): void;
    ping(client: Client): {
        method: string;
    };
}
