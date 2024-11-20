import woofiproRest from '../woofipro.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, OHLCV, Balances, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class woofipro extends woofiproRest {
    describe(): any;
    requestId(url: any): any;
    watchPublic(messageHash: any, message: any): Promise<any>;
    /**
     * @method
     * @name woofipro#watchOrderBook
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/orderbook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name woofipro#watchTicker
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/24-hour-ticker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseWsTicker(ticker: any, market?: any): Ticker;
    handleTicker(client: Client, message: any): any;
    /**
     * @method
     * @name woofipro#watchTickers
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/24-hour-tickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleTickers(client: Client, message: any): void;
    /**
     * @method
     * @name woofipro#watchBidsAsks
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/bbos
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name woofipro#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/k-line
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
     * @name woofipro#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/public/trade
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    handleAuth(client: Client, message: any): void;
    authenticate(params?: {}): Promise<any>;
    watchPrivate(messageHash: any, message: any, params?: {}): Promise<any>;
    watchPrivateMultiple(messageHashes: any, message: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name woofipro#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/execution-report
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/algo-execution-report
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name woofipro#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/execution-report
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/algo-execution-report
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseWsOrder(order: any, market?: any): Order;
    handleOrderUpdate(client: Client, message: any): void;
    handleOrder(client: Client, message: any, topic: any): void;
    handleMyTrade(client: Client, message: any): void;
    /**
     * @method
     * @name woofipro#watchPositions
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/position-push
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param since timestamp in ms of the earliest position to fetch
     * @param limit the maximum number of positions to fetch
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    setPositionsCache(client: Client, type: any, symbols?: Strings): void;
    loadPositionsSnapshot(client: any, messageHash: any): Promise<void>;
    handlePositions(client: any, message: any): void;
    parseWsPosition(position: any, market?: any): Position;
    /**
     * @method
     * @name woofipro#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/websocket-api/private/balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: any, message: any): void;
    handleErrorMessage(client: Client, message: any): boolean;
    handleMessage(client: Client, message: any): void;
    ping(client: Client): {
        event: string;
    };
    handlePing(client: Client, message: any): {
        event: string;
    };
    handlePong(client: Client, message: any): any;
    handleSubscribe(client: Client, message: any): any;
}
