import bitgetRest from '../bitget.js';
import type { Int, OHLCV, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, Position, Balances, Dict, Bool, Market } from '../base/types.js';
import Client from '../base/ws/Client.js';
/**
 * @class bitget
 * @augments Exchange
 * @description watching delivery future markets is not yet implemented (perpertual future & swap is implemented)
 */
export default class bitget extends bitgetRest {
    describe(): any;
    getInstType(methodName: Str, market: Market, uta?: boolean, params?: Dict): [Str, Dict];
    /**
     * @method
     * @name bitget#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/public/Tickers-Channel
     * @param {string} symbol unified symbol of the market to watch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name bitget#unWatchTicker
     * @description unsubscribe from the ticker channel
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
     * @param {string} symbol unified symbol of the market to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTicker(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name bitget#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/public/Tickers-Channel
     * @param {string[]} symbols unified symbol of the market to watch the tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    handleTicker(client: Client, message: Dict): void;
    parseWsTicker(message: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitget#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Tickers-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Tickers-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/public/Tickers-Channel
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    handleBidAsk(client: Client, message: Dict): void;
    parseWsBidAsk(message: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitget#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, close price, and the volume of a market
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Candlesticks-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/public/Candlesticks-Channel
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    /**
     * @method
     * @name bitget#unWatchOHLCV
     * @description unsubscribe from the ohlcv channel
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Candlesticks-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Candlesticks-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/public/Candlesticks-Channel
     * @param {string} symbol unified symbol of the market to unwatch the ohlcv for
     * @param {string} [timeframe] the period for the ratio, default is 1 minute
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: Dict): Promise<any>;
    handleOHLCV(client: Client, message: Dict): void;
    parseWsOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bitget#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/public/Order-Book-Channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name bitget#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/public/Order-Book-Channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    unWatchOrderBook(symbol: string, params?: Dict): Promise<any>;
    unWatchChannel(symbol: string, channel: string, messageHashTopic: string, methodName: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name bitget#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Depth-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/Order-Book-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/public/Order-Book-Channel
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: Dict): Promise<OrderBook>;
    handleOrderBook(client: Client, message: Dict): void;
    handleCheckSumError(client: Client, symbol: string, messageHash: string): Promise<void>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    /**
     * @method
     * @name bitget#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/public/New-Trades-Channel
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name bitget#watchTradesForSymbols
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/public/New-Trades-Channel
     * @param {string[]} symbols unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name bitget#unWatchTrades
     * @description unsubscribe from the trades channel
     * @see https://www.bitget.com/api-doc/spot/websocket/public/Trades-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/public/New-Trades-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/public/New-Trades-Channel
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {any} status of the unwatch request
     */
    unWatchTrades(symbol: string, params?: Dict): Promise<any>;
    handleTrades(client: Client, message: Dict): void;
    parseWsTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitget#watchPositions
     * @description watch all open positions
     * @see https://www.bitget.com/api-doc/contract/websocket/private/Positions-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/private/Positions-Channel
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {string} [params.instType] one of 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES', default is 'USDT-FUTURES'
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: Dict): Promise<Position[]>;
    handlePositions(client: Client, message: Dict): void;
    parseWsPosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name bitget#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.bitget.com/api-doc/spot/websocket/private/Order-Channel
     * @see https://www.bitget.com/api-doc/spot/websocket/private/Plan-Order-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/private/Order-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/private/Plan-Order-Channel
     * @see https://www.bitget.com/api-doc/margin/cross/websocket/private/Cross-Orders
     * @see https://www.bitget.com/api-doc/margin/isolated/websocket/private/Isolate-Orders
     * @see https://www.bitget.com/api-doc/uta/websocket/private/Order-Channel
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] *contract only* set to true for watching trigger orders
     * @param {string} [params.marginMode] 'isolated' or 'cross' for watching spot margin orders]
     * @param {string} [params.type] 'spot', 'swap'
     * @param {string} [params.subType] 'linear', 'inverse'
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    handleOrder(client: Client, message: Dict): void;
    parseWsOrder(order: Dict, market?: Market): Order;
    parseWsOrderStatus(status: Str): Str;
    /**
     * @method
     * @name bitget#watchMyTrades
     * @description watches trades made by the user
     * @see https://www.bitget.com/api-doc/contract/websocket/private/Fill-Channel
     * @see https://www.bitget.com/api-doc/uta/websocket/private/Fill-Channel
     * @param {str} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleMyTrades(client: Client, message: Dict): void;
    /**
     * @method
     * @name bitget#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.bitget.com/api-doc/spot/websocket/private/Account-Channel
     * @see https://www.bitget.com/api-doc/contract/websocket/private/Account-Channel
     * @see https://www.bitget.com/api-doc/margin/cross/websocket/private/Margin-Cross-Account-Assets
     * @see https://www.bitget.com/api-doc/margin/isolated/websocket/private/Margin-isolated-account-assets
     * @see https://www.bitget.com/api-doc/uta/websocket/private/Account-Channel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {str} [params.type] spot or contract if not provided this.options['defaultType'] is used
     * @param {string} [params.instType] one of 'SPOT', 'MARGIN', 'USDT-FUTURES', 'USDC-FUTURES', 'COIN-FUTURES', 'SUSDT-FUTURES', 'SUSDC-FUTURES' or 'SCOIN-FUTURES'
     * @param {string} [params.marginMode] 'isolated' or 'cross' for watching spot margin balances
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    handleBalance(client: Client, message: Dict): void;
    watchPublic(uta: boolean, messageHash: string, args: Dict, params?: Dict): Promise<any>;
    unWatchPublic(uta: boolean, messageHash: string, args: Dict, params?: Dict): Promise<any>;
    watchPublicMultiple(uta: boolean, messageHashes: string[], argsArray: any[], params?: Dict): Promise<any>;
    authenticate(params?: Dict): Promise<any>;
    watchPrivate(uta: boolean, messageHash: string, subscriptionHash: string, args: Dict, params?: Dict): Promise<any>;
    handleAuthenticate(client: Client, message: Dict): void;
    handleErrorMessage(client: Client, message: Dict): Bool;
    handleMessage(client: Client, message: any): void;
    ping(client: Client): string;
    handlePong(client: Client, message: Dict): Dict;
    handleSubscriptionStatus(client: Client, message: Dict): Dict;
    handleOrderBookUnSubscription(client: Client, message: Dict): void;
    handleTradesUnSubscription(client: Client, message: Dict): void;
    handleTickerUnSubscription(client: Client, message: Dict): void;
    handleOHLCVUnSubscription(client: Client, message: Dict): void;
    handleUnSubscriptionStatus(client: Client, message: Dict): Dict;
}
