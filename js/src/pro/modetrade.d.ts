import modetradeRest from '../modetrade.js';
import type { Balances, Bool, Dict, Int, OHLCV, Order, OrderBook, Position, Str, Strings, Ticker, Tickers, Trade, Market } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class modetrade extends modetradeRest {
    describe(): any;
    requestId(url: string): number;
    watchPublic(messageHash: string, message: Dict): Promise<any>;
    /**
     * @method
     * @name modetrade#watchOrderBook
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/public/orderbook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return.
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    handleOrderBook(client: Client, message: Dict): void;
    /**
     * @method
     * @name modetrade#watchTicker
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/public/24-hour-ticker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    parseWsTicker(ticker: Dict, market?: Market): Ticker;
    handleTicker(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name modetrade#watchTickers
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/public/24-hour-tickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    handleTickers(client: Client, message: Dict): void;
    /**
     * @method
     * @name modetrade#watchBidsAsks
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/public/bbos
     * @description watches best bid & ask for symbols
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    handleBidAsk(client: Client, message: Dict): void;
    parseWsBidAsk(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name modetrade#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/public/k-line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: Dict): void;
    /**
     * @method
     * @name modetrade#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/public/trade
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleTrade(client: Client, message: Dict): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    handleAuth(client: Client, message: Dict): void;
    authenticate(params?: Dict): Promise<any>;
    watchPrivate(messageHash: string, message: Dict, params?: Dict): Promise<any>;
    watchPrivateMultiple(messageHashes: string[], message: Dict, params?: Dict): Promise<any>;
    /**
     * @method
     * @name modetrade#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/private/execution-report
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/private/algo-execution-report
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name modetrade#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/private/execution-report
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/private/algo-execution-report
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true if trigger order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseWsOrder(order: Dict, market?: Market): Order;
    handleOrderUpdate(client: Client, message: Dict): void;
    handleOrder(client: Client, message: Dict, topic: Str): void;
    handleMyTrade(client: Client, message: Dict): void;
    /**
     * @method
     * @name modetrade#watchPositions
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/private/position-push
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch
     * @param {int} [limit] the maximum number of positions to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: Dict): Promise<Position[]>;
    setPositionsCache(client: Client, type: any, symbols?: Strings): void;
    loadPositionsSnapshot(client: Client, messageHash: string): Promise<void>;
    handlePositions(client: Client, message: Dict): void;
    parseWsPosition(position: any, market?: Market): Position;
    /**
     * @method
     * @name modetrade#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://orderly.network/docs/build-on-omnichain/websocket-api/private/balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    handleBalance(client: Client, message: Dict): void;
    handleErrorMessage(client: Client, message: any): Bool;
    handleMessage(client: Client, message: Dict): void;
    ping(client: Client): Dict;
    pong(client: Client, message: Dict): Promise<void>;
    handlePing(client: Client, message: Dict): void;
    handlePong(client: Client, message: Dict): Dict;
    handleSubscribe(client: Client, message: Dict): Dict;
}
