import Exchange from './abstract/bithumb.js';
import type { Balances, Currency, Dict, Int, Market, MarketInterface, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, int } from './base/types.js';
/**
 * @class bithumb
 * @augments Exchange
 */
export default class bithumb extends Exchange {
    describe(): any;
    safeMarket(marketId?: Str, market?: Market, delimiter?: Str, marketType?: Str): MarketInterface;
    amountToPrecision(symbol: any, amount: any): string;
    /**
     * @method
     * @name bithumb#fetchMarkets
     * @description retrieves data on all markets for bithumb
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bithumb#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B3%B4%EC%9C%A0%EC%9E%90%EC%82%B0-%EC%A1%B0%ED%9A%8C
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name bithumb#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%B8%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bithumb#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bithumb#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bithumb#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/candlestick-rest-api
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bithumb#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%B5%9C%EA%B7%BC-%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bithumb#createOrder
     * @description create a trade order
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%A7%80%EC%A0%95%EA%B0%80-%EC%A3%BC%EB%AC%B8%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EC%88%98%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EB%8F%84%ED%95%98%EA%B8%B0
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bithumb#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%83%81%EC%84%B8-%EC%A1%B0%ED%9A%8C
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name bithumb#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bithumb#cancelOrder
     * @description cancels an open order
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C%ED%95%98%EA%B8%B0
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    cancelUnifiedOrder(order: any, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bithumb#withdraw
     * @description make a withdrawal
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%BD%94%EC%9D%B8-%EC%B6%9C%EA%B8%88%ED%95%98%EA%B8%B0-%EA%B0%9C%EC%9D%B8
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    fixCommaNumber(numberStr: any): any;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
