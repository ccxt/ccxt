import coinexRest from '../coinex.js';
import type { Int, Str, Strings, OrderBook, Order, Trade, Ticker, Tickers, Balances, Dict, int } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class coinex extends coinexRest {
    describe(): any;
    requestId(): any;
    handleTicker(client: Client, message: any): void;
    parseWSTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name coinex#watchBalance
     * @description watch balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.coinex.com/api/v2/assets/balance/ws/spot_balance
     * @see https://docs.coinex.com/api/v2/assets/balance/ws/futures_balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    parseWsBalance(balance: any, accountType?: any): void;
    /**
     * @method
     * @name coinex#watchMyTrades
     * @description watches information on multiple trades made by the user
     * @see https://docs.coinex.com/api/v2/spot/deal/ws/user-deals
     * @see https://docs.coinex.com/api/v2/futures/deal/ws/user-deals
     * @param {string} [symbol] unified symbol of the market the trades were made in
     * @param {int} [since] the earliest time in ms to watch trades
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    watchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleMyTrades(client: Client, message: any): void;
    handleTrades(client: Client, message: any): void;
    parseWsTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name coinex#watchTicker
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.coinex.com/api/v2/spot/market/ws/market
     * @see https://docs.coinex.com/api/v2/futures/market/ws/market-state
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name coinex#watchTickers
     * @description watches a price ticker, a statistical calculation with the information calculated over the past 24 hours for all markets of a specific list
     * @see https://docs.coinex.com/api/v2/spot/market/ws/market
     * @see https://docs.coinex.com/api/v2/futures/market/ws/market-state
     * @param {string[]} symbols unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name coinex#watchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.coinex.com/api/v2/spot/market/ws/market-deals
     * @see https://docs.coinex.com/api/v2/futures/market/ws/market-deals
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinex#watchTradesForSymbols
     * @description watch the most recent trades for a list of symbols
     * @see https://docs.coinex.com/api/v2/spot/market/ws/market-deals
     * @see https://docs.coinex.com/api/v2/futures/market/ws/market-deals
     * @param {string[]} symbols unified symbols of the markets to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinex#watchOrderBookForSymbols
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.coinex.com/api/v2/spot/market/ws/market-depth
     * @see https://docs.coinex.com/api/v2/futures/market/ws/market-depth
     * @param {string[]} symbols unified array of symbols
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name coinex#watchOrderBook
     * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.coinex.com/api/v2/spot/market/ws/market-depth
     * @see https://docs.coinex.com/api/v2/futures/market/ws/market-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: Client, message: any): void;
    /**
     * @method
     * @name coinex#watchOrders
     * @description watches information on multiple orders made by the user
     * @see https://docs.coinex.com/api/v2/spot/order/ws/user-order
     * @see https://docs.coinex.com/api/v2/futures/order/ws/user-order
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] if the orders to watch are trigger orders or not
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrders(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    parseWsOrderStatus(status: any): string;
    /**
     * @method
     * @name coinex#watchBidsAsks
     * @description watches best bid & ask for symbols
     * @see https://docs.coinex.com/api/v2/spot/market/ws/market-bbo
     * @see https://docs.coinex.com/api/v2/futures/market/ws/market-bbo
     * @param {string[]} [symbols] unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    watchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    handleBidAsk(client: Client, message: any): void;
    parseWsBidAsk(ticker: any, market?: any): Ticker;
    handleMessage(client: Client, message: any): void;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    handleAuthenticationMessage(client: Client, message: any): void;
    handleSubscriptionStatus(client: Client, message: any): void;
    authenticate(type: string): Promise<any>;
}
