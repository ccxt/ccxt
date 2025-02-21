import Exchange from './abstract/latoken.js';
import type { TransferEntry, Balances, Currency, Int, Market, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, TradingFeeInterface, Currencies, Dict, int } from './base/types.js';
/**
 * @class latoken
 * @augments Exchange
 */
export default class latoken extends Exchange {
    describe(): any;
    nonce(): number;
    /**
     * @method
     * @name latoken#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api.latoken.com/doc/v2/#tag/Time/operation/currentTime
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name latoken#fetchMarkets
     * @description retrieves data on all markets for latoken
     * @see https://api.latoken.com/doc/v2/#tag/Pair/operation/getActivePairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchCurrenciesFromCache(params?: {}): Promise<any>;
    /**
     * @method
     * @name latoken#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name latoken#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.latoken.com/doc/v2/#tag/Account/operation/getBalancesByUser
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name latoken#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.latoken.com/doc/v2/#tag/Order-Book/operation/getOrderBook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name latoken#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.latoken.com/doc/v2/#tag/Ticker/operation/getTicker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name latoken#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api.latoken.com/doc/v2/#tag/Ticker/operation/getAllTickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name latoken#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.latoken.com/doc/v2/#tag/Trade/operation/getTradesByPair
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name latoken#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://api.latoken.com/doc/v2/#tag/Trade/operation/getFeeByPair
     * @see https://api.latoken.com/doc/v2/#tag/Trade/operation/getAuthFeeByPair
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    fetchPublicTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        maker: number;
        taker: number;
        percentage: any;
        tierBased: any;
    }>;
    fetchPrivateTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: string;
        maker: number;
        taker: number;
        percentage: any;
        tierBased: any;
    }>;
    /**
     * @method
     * @name latoken#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.latoken.com/doc/v2/#tag/Trade/operation/getTradesByTrader
     * @see https://api.latoken.com/doc/v2/#tag/Trade/operation/getTradesByAssetAndTrader
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOrderStatus(status: Str): string;
    parseOrderType(status: any): string;
    parseTimeInForce(timeInForce: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name latoken#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api.latoken.com/doc/v2/#tag/Order/operation/getMyActiveOrdersByPair
     * @see https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getMyActiveStopOrdersByPair  // stop
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if fetching trigger orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name latoken#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api.latoken.com/doc/v2/#tag/Order/operation/getMyOrders
     * @see https://api.latoken.com/doc/v2/#tag/Order/operation/getMyOrdersByPair
     * @see https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getMyStopOrders       // stop
     * @see https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getMyStopOrdersByPair // stop
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if fetching trigger orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name latoken#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.latoken.com/doc/v2/#tag/Order/operation/getOrderById
     * @see https://api.latoken.com/doc/v2/#tag/StopOrder/operation/getStopOrderById
     * @param {string} id order id
     * @param {string} [symbol] not used by latoken fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if fetching a trigger order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name latoken#createOrder
     * @description create a trade order
     * @see https://api.latoken.com/doc/v2/#tag/Order/operation/placeOrder
     * @see https://api.latoken.com/doc/v2/#tag/StopOrder/operation/placeStopOrder  // stop
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.condition] "GTC", "IOC", or  "FOK"
     * @param {string} [params.clientOrderId] [ 0 .. 50 ] characters, client's custom order id (free field for your convenience)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name latoken#cancelOrder
     * @description cancels an open order
     * @see https://api.latoken.com/doc/v2/#tag/Order/operation/cancelOrder
     * @see https://api.latoken.com/doc/v2/#tag/StopOrder/operation/cancelStopOrder  // stop
     * @param {string} id order id
     * @param {string} symbol not used by latoken cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if cancelling a trigger order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name latoken#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api.latoken.com/doc/v2/#tag/Order/operation/cancelAllOrders
     * @see https://api.latoken.com/doc/v2/#tag/Order/operation/cancelAllOrdersByPair
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if cancelling trigger orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name latoken#fetchTransactions
     * @deprecated
     * @description use fetchDepositsWithdrawals instead
     * @see https://api.latoken.com/doc/v2/#tag/Transaction/operation/getUserTransactions
     * @param {string} code unified currency code for the currency of the transactions, default is undefined
     * @param {int} [since] timestamp in ms of the earliest transaction, default is undefined
     * @param {int} [limit] max number of transactions to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchTransactions(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    parseTransactionType(type: any): string;
    /**
     * @method
     * @name latoken#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://api.latoken.com/doc/v2/#tag/Transfer/operation/getUsersTransfers
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name latoken#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://api.latoken.com/doc/v2/#tag/Transfer/operation/transferByEmail
     * @see https://api.latoken.com/doc/v2/#tag/Transfer/operation/transferById
     * @see https://api.latoken.com/doc/v2/#tag/Transfer/operation/transferByPhone
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    sign(path: any, api?: string, method?: string, params?: any, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
