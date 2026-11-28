import interactivebrokersRest from '../interactivebrokers.js';
import type { Balances, Dict, Int, OHLCV, Order, OrderBook, Str, Strings, Ticker, Tickers, Trade } from '../base/types.js';
import Client from '../base/ws/Client.js';
/**
 * @class interactivebrokers
 * @augments interactivebrokersRest
 */
export default class interactivebrokers extends interactivebrokersRest {
    describe(): Dict;
    /**
     * @method
     * @name interactivebrokers#ibkrConnect
     * @description opens (or reuses) the authenticated websocket connection, the brokerage session cookie is obtained via POST /tickle
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/ws/connection-guide
     * @see https://www.interactivebrokers.com/docs/web-api/ws/auth-status
     * @returns {string} the url of the websocket client
     */
    ibkrConnect(): Promise<string>;
    /**
     * @method
     * @name interactivebrokers#ibkrKeepAliveSession
     * @description keeps the brokerage session alive with POST /tickle and refreshes the market data streams, which expire after 15 minutes
     * @ignore
     * @param {object} client the websocket client
     * @returns {undefined}
     */
    ibkrKeepAliveSession(client: Client): Promise<any>;
    /**
     * @method
     * @name interactivebrokers#ibkrSubscribe
     * @description sends a raw subscription message once per subscribe hash, IBKR does not acknowledge subscriptions
     * @ignore
     * @param {object} client the websocket client
     * @param {string} subscribeHash the key of the subscription
     * @param {string} request the raw message, e.g. 'smd+265598+{"fields":["31"]}'
     * @param {object} [subscription] extra data stored with the subscription
     * @returns {undefined}
     */
    ibkrSubscribe(client: Client, subscribeHash: string, request: string, subscription?: Dict): Promise<any>;
    /**
     * @method
     * @name interactivebrokers#ibkrUnsubscribe
     * @description removes the subscriptions and rejects the pending futures of the given hashes, then sends the raw unsubscribe message, IBKR does not acknowledge unsubscriptions
     * @ignore
     * @param {object} client the websocket client
     * @param {string[]} subHashes the message hashes and subscribe hashes to clean
     * @param {string} request the raw unsubscribe message, e.g. 'umd+265598+{}', undefined to only clean
     * @param {object} [subscription] the cache to clean, see cleanCache
     * @returns {boolean} true
     */
    ibkrUnsubscribe(client: Client, subHashes: string[], request: Str, subscription?: Dict): Promise<any>;
    /**
     * @method
     * @name interactivebrokers#ibkrUnsubscribeMarketData
     * @description sends umd for a conid when no ticker, bidask or ohlcv subscription of the market is left
     * @ignore
     * @param {object} client the websocket client
     * @param {string} marketId the conid
     * @returns {undefined}
     */
    ibkrUnsubscribeMarketData(client: Client, marketId: Str): Promise<any>;
    /**
     * @method
     * @name interactivebrokers#ibkrMarketDataRequest
     * @description builds the smd subscription message of a market
     * @ignore
     * @param {string} marketId the conid
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.fields] the market data fields to stream
     * @returns {Array} the raw message and the params without fields
     */
    ibkrMarketDataRequest(marketId: string, params?: Dict): [string, Dict];
    /**
     * @method
     * @name interactivebrokers#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.fields] the market data fields to stream, default options.watchTicker.fields
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name interactivebrokers#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string[]} symbols unified symbols of the markets to fetch the bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name interactivebrokers#ibkrWatchMarketData
     * @description subscribes to the smd streams of the markets
     * @ignore
     * @param {string} topic 'ticker' or 'bidask'
     * @param {string[]} symbols unified symbols of the markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the updated ticker
     */
    ibkrWatchMarketData(topic: string, symbols?: Strings, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name interactivebrokers#unWatchTickers
     * @description unWatches the price tickers of the markets
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string[]} symbols unified symbols of the markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    unWatchTickers(symbols?: Strings, params?: Dict): Promise<any>;
    /**
     * @method
     * @name interactivebrokers#unWatchBidsAsks
     * @description unWatches the best bids & asks of the markets
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string[]} symbols unified symbols of the markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    unWatchBidsAsks(symbols?: Strings, params?: Dict): Promise<any>;
    /**
     * @method
     * @name interactivebrokers#ibkrUnWatchMarketData
     * @description removes the ticker or bidask subscriptions, umd is sent when the market has no other subscription left
     * @ignore
     * @param {string} topic 'ticker' or 'bidask'
     * @param {string[]} symbols unified symbols of the markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    ibkrUnWatchMarketData(topic: string, symbols?: Strings, params?: Dict): Promise<any>;
    handleTicker(client: Client, message: Dict): void;
    /**
     * @method
     * @name interactivebrokers#watchOHLCV
     * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market, the history comes from smh, the last candles are built from the last price of the smd stream
     * @see https://www.interactivebrokers.com/docs/web-api/ws/historical-data
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.source] 'trades' (default), 'midpoint', 'bid_ask', 'bid' or 'ask'
     * @param {boolean} [params.outsideRth] include data outside regular trading hours
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    /**
     * @method
     * @name interactivebrokers#unWatchOHLCV
     * @description unWatches historical candlestick data
     * @see https://www.interactivebrokers.com/docs/web-api/ws/streaming-data
     * @param {string} symbol unified symbol of the market
     * @param {string} timeframe the length of time each candle represents
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    unWatchOHLCV(symbol: string, timeframe?: string, params?: Dict): Promise<any>;
    handleOHLCV(client: Client, message: Dict): void;
    /**
     * @method
     * @name interactivebrokers#ibkrWsPeriod
     * @description builds the smh period, it accepts {1-30}min, {1-8}h, {1-1000}d, {1-792}w, {1-182}m and {1-15}y only, so the period is rounded up to the smallest fitting unit
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/ws/historical-data
     * @param {int} duration the length of one bar in seconds
     * @param {int} limit the number of bars
     * @returns {string} the period, e.g. '2h'
     */
    ibkrWsPeriod(duration: number, limit: number): string;
    /**
     * @method
     * @name interactivebrokers#ibkrCancelHistory
     * @description cancels a historical data request with umh
     * @ignore
     * @param {object} client the websocket client
     * @param {string} serverId the serverId of the smh response
     * @returns {undefined}
     */
    ibkrCancelHistory(client: Client, serverId: string): Promise<any>;
    /**
     * @method
     * @name interactivebrokers#ibkrUpdateOHLCVs
     * @description updates the current candles of the watched timeframes of a market with the last price of a market data delta
     * @ignore
     * @param {object} client the websocket client
     * @param {string} symbol unified market symbol
     * @param {object} delta the raw smd message
     */
    ibkrUpdateOHLCVs(client: Client, symbol: string, delta: Dict): void;
    /**
     * @method
     * @name interactivebrokers#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data, requires a level 2 market data subscription, one price ladder per account
     * @see https://www.interactivebrokers.com/docs/web-api/ws/booktrader
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @param {string} [params.exchange] the deep book exchange, all by default
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name interactivebrokers#unWatchOrderBook
     * @description unWatches the order book of a market, ubd cancels the price ladder of the account
     * @see https://www.interactivebrokers.com/docs/web-api/ws/booktrader
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {boolean} true
     */
    unWatchOrderBook(symbol: string, params?: Dict): Promise<any>;
    handleOrderBook(client: Client, message: Dict): void;
    /**
     * @method
     * @name interactivebrokers#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://www.interactivebrokers.com/docs/web-api/ws/order-updates
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.filters] order status filters, e.g. [ 'Submitted', 'Filled' ]
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-live-orders
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name interactivebrokers#unWatchOrders
     * @description unWatches information on multiple orders made by the user
     * @see https://www.interactivebrokers.com/docs/web-api/ws/order-updates
     * @param {string} [symbol] not used by interactivebrokers.unWatchOrders, all the order streams are cancelled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    unWatchOrders(symbol?: Str, params?: Dict): Promise<any>;
    handleOrders(client: Client, message: Dict): void;
    /**
     * @method
     * @name interactivebrokers#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://www.interactivebrokers.com/docs/web-api/ws/trades
     * @param {string} [symbol] unified market symbol of the market the trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.realtimeUpdatesOnly] return only the executions made after subscribing, default true, false also returns the executions of the last params.days days, the filtering is done client-side
     * @param {int} [params.days] number of days of past executions requested on subscribing, default 1
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name interactivebrokers#unWatchMyTrades
     * @description unWatches information on multiple trades made by the user
     * @see https://www.interactivebrokers.com/docs/web-api/ws/trades
     * @param {string} [symbol] not used by interactivebrokers.unWatchMyTrades, all the trade streams are cancelled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {boolean} true
     */
    unWatchMyTrades(symbol?: Str, params?: Dict): Promise<any>;
    handleMyTrades(client: Client, message: Dict): void;
    /**
     * @method
     * @name interactivebrokers#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders, the cash comes from the account ledger stream, the first call takes a fetchBalance snapshot for the holdings and the locked amounts
     * @see https://www.interactivebrokers.com/docs/web-api/ws/account-ledger
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    /**
     * @method
     * @name interactivebrokers#unWatchBalance
     * @description unWatches the balance of the account
     * @see https://www.interactivebrokers.com/docs/web-api/ws/account-ledger
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {boolean} true
     */
    unWatchBalance(params?: Dict): Promise<any>;
    handleBalance(client: Client, message: Dict): void;
    handleSessionStatus(client: Client, message: Dict): void;
    handleErrorMessage(client: Client, message: Dict): boolean;
    ping(client: Client): string;
    handleTextMessage(client: Client, message: string): void;
    handleMessage(client: Client, message: Dict): void;
}
