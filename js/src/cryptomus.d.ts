import Exchange from './abstract/cryptomus.js';
import type { Balances, Currencies, Dict, int, Int, Market, Num, Order, OrderBook, OrderType, OrderSide, Str, Strings, Ticker, Tickers, Trade, TradingFees } from './base/types.js';
/**
 * @class cryptomus
 * @augments Exchange
 */
export default class cryptomus extends Exchange {
    describe(): any;
    /**
     * @method
     * @name cryptomus#fetchMarkets
     * @description retrieves data on all markets for the exchange
     * @see https://doc.cryptomus.com/personal/market-cap/tickers
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name cryptomus#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://doc.cryptomus.com/personal/market-cap/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name cryptomus#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://doc.cryptomus.com/personal/market-cap/tickers
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: any, market?: Market): Ticker;
    /**
     * @method
     * @name cryptomus#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://doc.cryptomus.com/personal/market-cap/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.level] 0 or 1 or 2 or 3 or 4 or 5 - the level of volume
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name cryptomus#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://doc.cryptomus.com/personal/market-cap/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (maximum value is 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name cryptomus#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://doc.cryptomus.com/personal/converts/balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(balance: any): Balances;
    /**
     * @method
     * @name cryptomus#createOrder
     * @description create a trade order
     * @see https://doc.cryptomus.com/personal/exchange/market-order-creation
     * @see https://doc.cryptomus.com/personal/exchange/limit-order-creation
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or for spot
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders (only for limit orders)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {string} [params.clientOrderId] a unique identifier for the order (optional)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name cryptomus#cancelOrder
     * @description cancels an open limit order
     * @see https://doc.cryptomus.com/personal/exchange/limit-order-cancellation
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in (not used in cryptomus)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name cryptomus#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://doc.cryptomus.com/personal/exchange/history-of-completed-orders
     * @param {string} symbol unified market symbol of the market orders were made in (not used in cryptomus)
     * @param {int} [since] the earliest time in ms to fetch orders for (not used in cryptomus)
     * @param {int} [limit] the maximum number of order structures to retrieve (not used in cryptomus)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.direction] order direction 'buy' or 'sell'
     * @param {string} [params.order_id] order id
     * @param {string} [params.client_order_id] client order id
     * @param {string} [params.limit] A special parameter that sets the maximum number of records the request will return
     * @param {string} [params.offset] A special parameter that sets the number of records from the beginning of the list
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name cryptomus#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://doc.cryptomus.com/personal/exchange/list-of-active-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for (not used in cryptomus)
     * @param {int} [limit] the maximum number of  open orders structures to retrieve (not used in cryptomus)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.direction] order direction 'buy' or 'sell'
     * @param {string} [params.order_id] order id
     * @param {string} [params.client_order_id] client order id
     * @param {string} [params.limit] A special parameter that sets the maximum number of records the request will return
     * @param {string} [params.offset] A special parameter that sets the number of records from the beginning of the list
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status?: Str): Str;
    /**
     * @method
     * @name cryptomus#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-fees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseFeeTiers(feeTiers: any, market?: Market): {
        maker: any[];
        taker: any[];
    };
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
