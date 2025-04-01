import Exchange from './abstract/coinmate.js';
import type { Balances, Currency, Dict, Int, Market, Num, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, Transaction, int } from './base/types.js';
/**
 * @class coinmate
 * @augments Exchange
 */
export default class coinmate extends Exchange {
    describe(): any;
    /**
     * @method
     * @name coinmate#fetchMarkets
     * @description retrieves data on all markets for coinmate
     * @see https://coinmate.docs.apiary.io/#reference/trading-pairs/get-trading-pairs/get
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name coinmate#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://coinmate.docs.apiary.io/#reference/balance/get-balances/post
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name coinmate#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://coinmate.docs.apiary.io/#reference/order-book/get-order-book/get
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name coinmate#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://coinmate.docs.apiary.io/#reference/ticker/get-ticker/get
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name coinmate#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://coinmate.docs.apiary.io/#reference/ticker/get-ticker-all/get
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name coinmate#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://coinmate.docs.apiary.io/#reference/transfers/get-transfer-history/post
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name coinmate#withdraw
     * @description make a withdrawal
     * @see https://coinmate.docs.apiary.io/#reference/bitcoin-withdrawal-and-deposit/withdraw-bitcoins/post
     * @see https://coinmate.docs.apiary.io/#reference/litecoin-withdrawal-and-deposit/withdraw-litecoins/post
     * @see https://coinmate.docs.apiary.io/#reference/ethereum-withdrawal-and-deposit/withdraw-ethereum/post
     * @see https://coinmate.docs.apiary.io/#reference/ripple-withdrawal-and-deposit/withdraw-ripple/post
     * @see https://coinmate.docs.apiary.io/#reference/cardano-withdrawal-and-deposit/withdraw-cardano/post
     * @see https://coinmate.docs.apiary.io/#reference/solana-withdrawal-and-deposit/withdraw-solana/post
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name coinmate#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://coinmate.docs.apiary.io/#reference/trade-history/get-trade-history/post
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name coinmate#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://coinmate.docs.apiary.io/#reference/transactions/transactions/get
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinmate#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://coinmate.docs.apiary.io/#reference/trader-fees/get-trading-fees/post
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name coinmate#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://coinmate.docs.apiary.io/#reference/order/get-open-orders/post
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinmate#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://coinmate.docs.apiary.io/#reference/order/order-history/post
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: Str): string;
    parseOrderType(type: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name coinmate#createOrder
     * @description create a trade order
     * @see https://coinmate.docs.apiary.io/#reference/order/buy-limit-order/post
     * @see https://coinmate.docs.apiary.io/#reference/order/sell-limit-order/post
     * @see https://coinmate.docs.apiary.io/#reference/order/buy-instant-order/post
     * @see https://coinmate.docs.apiary.io/#reference/order/sell-instant-order/post
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
     * @name coinmate#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://coinmate.docs.apiary.io/#reference/order/get-order-by-orderid/post
     * @see https://coinmate.docs.apiary.io/#reference/order/get-order-by-clientorderid/post
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinmate#cancelOrder
     * @description cancels an open order
     * @see https://coinmate.docs.apiary.io/#reference/order/cancel-order/post
     * @param {string} id order id
     * @param {string} symbol not used by coinmate cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
