import bullishRest from '../bullish.js';
import type { Balances, Dict, Int, List, Order, OrderBook, Position, Str, Strings, Ticker, Trade, int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class bullish extends bullishRest {
    describe(): Dict;
    requestId(): int;
    ping(client: Client): Dict;
    handlePong(client: Client, message: Dict): Dict;
    watchPublic(url: string, messageHash: string, request?: {}, params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @name bullish#unsubscribePublic
     * @description sends an unsubscribe command for one public topic and registers the pending unsubscription under the request id
     * @param {string} url path of the public websocket endpoint the subscription was opened on
     * @param {string} topic unified cache topic: trades, orderbook
     * @param {string} messageHash message hash the subscription was opened with
     * @param {string} symbol unified symbol of the market to unsubscribe from
     * @param {object} request exchange-specific topic and symbol of the subscription
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unsubscribePublic(url: string, topic: string, messageHash: string, symbol: string, request?: {}, params?: {}): Promise<any>;
    handleUnSubscription(client: Client, subscription: Dict): void;
    watchPrivate(messageHash: string, subscribeHash: string, request?: {}, params?: {}): Promise<any>;
    /**
     * @ignore
     * @method
     * @name bullish#unsubscribePrivate
     * @description sends an unsubscribe command for one private topic and registers the pending unsubscription under the request id
     * @param {string} topic unified cache topic: orders, myTrades, positions
     * @param {string} subscribeHash hash the subscription was opened with, per-symbol message hashes start with it
     * @param {object} request exchange-specific topic of the subscription
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingAccountId] the trading account id the subscription was opened with
     * @returns {any} status of the unwatch request
     */
    unsubscribePrivate(topic: string, subscribeHash: string, request?: {}, params?: {}): Promise<any>;
    /**
     * @method
     * @name bullish#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--unified-anonymous-trades-websocket-unauthenticated
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name bullish#unWatchTrades
     * @description unsubscribes from the trades channel
     * @see https://docs.exchange.bullish.com/websocket/api/ws-mkt-data-trades/operation-send-unsubscribe
     * @param {string} symbol unified symbol of the market to unsubscribe from
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTrades(symbol: string, params?: Dict): Promise<any>;
    handleTrades(client: Client, message: Dict): void;
    /**
     * @method
     * @name bullish#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--anonymous-market-data-price-tick-unauthenticated
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    handleTicker(client: Client, message: Dict): void;
    /**
     * @method
     * @name bullish#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--multi-orderbook-websocket-unauthenticated
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    watchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name bullish#unWatchOrderBook
     * @description unsubscribes from the orderbook channel
     * @see https://docs.exchange.bullish.com/websocket/api/ws-mkt-data-orderbook/operation-send-unsubscribe
     * @param {string} symbol unified symbol of the market to unsubscribe from
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchOrderBook(symbol: string, params?: Dict): Promise<any>;
    handleOrderBook(client: Client, message: Dict): void;
    separateBidsOrAsks(entry: any[]): List;
    /**
     * @method
     * @name bullish#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingAccountId] the trading account id to fetch entries for
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name bullish#unWatchOrders
     * @description unsubscribes from the orders channel, the subscription is account-wide so all symbols are unsubscribed
     * @see https://docs.exchange.bullish.com/websocket/api/ws-private-data/operation-send-unsubscribe
     * @param {string} [symbol] not used by bullish unWatchOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingAccountId] the trading account id the subscription was opened with
     * @returns {any} status of the unwatch request
     */
    unWatchOrders(symbol?: Str, params?: Dict): Promise<any>;
    handleOrders(client: Client, message: Dict): void;
    /**
     * @method
     * @name bullish#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingAccountId] the trading account id to fetch entries for
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name bullish#unWatchMyTrades
     * @description unsubscribes from the user trades channel, the subscription is account-wide so all symbols are unsubscribed
     * @see https://docs.exchange.bullish.com/websocket/api/ws-private-data/operation-send-unsubscribe
     * @param {string} [symbol] not used by bullish unWatchMyTrades
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingAccountId] the trading account id the subscription was opened with
     * @returns {any} status of the unwatch request
     */
    unWatchMyTrades(symbol?: Str, params?: Dict): Promise<any>;
    handleMyTrades(client: Client, message: Dict): void;
    /**
     * @method
     * @name bullish#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingAccountId] the trading account id to fetch entries for
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    handleBalance(client: Client, message: Dict): void;
    /**
     * @method
     * @name bullish#watchPositions
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--private-data-websocket-authenticated
     * @description watch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/en/latest/manual.html#position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: Dict): Promise<Position[]>;
    /**
     * @method
     * @name bullish#unWatchPositions
     * @description unsubscribes from the positions channel, the subscription is account-wide so all symbols are unsubscribed
     * @see https://docs.exchange.bullish.com/websocket/api/ws-private-data/operation-send-unsubscribe
     * @param {string[]} [symbols] not used by bullish unWatchPositions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingAccountId] the trading account id the subscription was opened with
     * @returns {any} status of the unwatch request
     */
    unWatchPositions(symbols?: Strings, params?: Dict): Promise<any>;
    handlePositions(client: Client, message: Dict): void;
    handleErrorMessage(client: Client, message: Dict): void;
    handleUnSubscriptionError(client: Client, message: Dict): void;
    handleMessage(client: Client, message: Dict): void;
}
