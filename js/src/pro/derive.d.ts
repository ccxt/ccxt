import deriveRest from '../derive.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, Balances, Position, Dict } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class derive extends deriveRest {
    describe(): Dict;
    requestId(url: string): number;
    watchPublic(messageHash: string, message: Dict, subscription: Dict): Promise<any>;
    /**
     * @method
     * @name derive#watchOrderBook
     * @see https://docs.derive.xyz/api-reference/channels/orderbook
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
     * @name derive#watchTicker
     * @see https://docs.derive.xyz/api-reference/channels/tickerslim
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name derive#unWatchTicker
     * @description unsubscribe from the ticker channel; note that the bid ask feed of the same symbol shares the channel and stops as well
     * @see https://docs.derive.xyz/api-reference/channels/tickerslim
     * @param {string} symbol unified symbol of the market to unwatch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTicker(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name derive#watchBidsAsks
     * @description watches best bid & ask for symbols; the data is sourced from the same ticker_slim channel the ticker uses
     * @see https://docs.derive.xyz/api-reference/channels/tickerslim
     * @param {string[]} symbols unified symbols of the markets to fetch the bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    handleTicker(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name derive#unWatchOrderBook
     * @description unsubscribe from the orderbook channel
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.limit] orderbook limit, default is undefined
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    unWatchOrderBook(symbol: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name derive#unWatchTrades
     * @description unsubscribe from the trades channel
     * @param {string} symbol unified symbol of the market to unwatch the trades for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {any} status of the unwatch request
     */
    unWatchTrades(symbol: string, params?: Dict): Promise<any>;
    unWatchPublic(messageHash: string, message: Dict, subscription: Dict): Promise<any>;
    handleOrderBookUnSubscription(client: Client, topic: string): void;
    handleTradesUnSubscription(client: Client, topic: string): void;
    handleTickerUnSubscription(client: Client, topic: string): void;
    handleOrdersUnSubscription(client: Client, topic: string): void;
    handleMyTradesUnSubscription(client: Client, topic: string): void;
    handleUnSubscribe(client: Client, message: Dict): Dict;
    /**
     * @method
     * @name derive#watchTrades
     * @description watches information on multiple trades made in a market
     * @see https://docs.derive.xyz/api-reference/channels/tradesbyinstrument
     * @param {string} symbol unified market symbol of the market trades were made in
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleTrade(client: Client, message: Dict): void;
    authenticate(params?: Dict): Promise<any>;
    watchPrivate(messageHash: string, message: Dict, subscription: Dict): Promise<any>;
    /**
     * @method
     * @name derive#watchOrders
     * @see https://docs.derive.xyz/api-reference/channels/subaccountorders
     * @description watches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    handleOrder(client: Client, message: Dict): void;
    /**
     * @method
     * @name derive#unWatchOrders
     * @description unsubscribe from the orders channel
     * @see https://docs.derive.xyz/api-reference/channels/subaccountorders
     * @param {string} [symbol] not used by derive unWatchOrders, the whole subaccount channel is unsubscribed
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {any} status of the unwatch request
     */
    unWatchOrders(symbol?: Str, params?: Dict): Promise<any>;
    /**
     * @method
     * @name derive#watchMyTrades
     * @see https://docs.derive.xyz/api-reference/channels/subaccounttrades
     * @description watches information on multiple trades made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    handleMyTrade(client: Client, message: Dict): void;
    /**
     * @method
     * @name derive#unWatchMyTrades
     * @description unsubscribe from the my trades channel
     * @see https://docs.derive.xyz/api-reference/channels/subaccounttrades
     * @param {string} [symbol] not used by derive unWatchMyTrades, the whole subaccount channel is unsubscribed
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {any} status of the unwatch request
     */
    unWatchMyTrades(symbol?: Str, params?: Dict): Promise<any>;
    /**
     * @method
     * @name derive#watchBalance
     * @description watches balance updates for a single subaccount, the returned structure is scoped to the watched subaccount
     * @see https://docs.derive.xyz/api-reference/channels/subaccountbalances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @param {boolean} [params.fetchBalanceSnapshot] default true, the channel only streams changed totals, so an initial snapshot is loaded over rest before subscribing
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    watchBalance(params?: Dict): Promise<Balances>;
    /**
     * @method
     * @name derive#watchPositions
     * @description watch all open positions; the sizes stream over the balances channel, while entry price, pnl and margin fields stay from the rest snapshot until the next one
     * @see https://docs.derive.xyz/api-reference/channels/subaccountbalances
     * @param {string[]} [symbols] list of unified market symbols to watch positions for
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of positions to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @param {boolean} [params.fetchPositionsSnapshot] default true, the channel only streams size changes, so an initial snapshot is loaded over rest before subscribing
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    watchPositions(symbols?: Strings, since?: Int, limit?: Int, params?: Dict): Promise<Position[]>;
    handlePositionDelta(subaccountIdKey: string, entry: Dict): Position;
    handleBalance(client: Client, message: Dict): void;
    handleErrorMessage(client: Client, message: Dict): boolean;
    handleMessage(client: Client, message: Dict): void;
    handleAuth(client: Client, message: Dict): void;
}
