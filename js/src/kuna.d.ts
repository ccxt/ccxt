import Exchange from './abstract/kuna.js';
import type { Balances, Currencies, Currency, Dict, Int, Market, Num, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, int, DepositAddress } from './base/types.js';
/**
 * @class kuna
 * @augments Exchange
 * @description Use the public-key as your apiKey
 */
export default class kuna extends Exchange {
    describe(): any;
    /**
     * @method
     * @name kuna#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.kuna.io/docs/get-time-on-the-server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name kuna#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.kuna.io/docs/get-information-about-available-currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrency(currency: Dict): Currency;
    /**
     * @method
     * @name kuna#fetchMarkets
     * @description retrieves data on all markets for kuna
     * @see https://docs.kuna.io/docs/get-all-traded-markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name kuna#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.kuna.io/docs/get-public-orders-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] 5, 10, 20, 50, 100, 500, or 1000 (default)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name kuna#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market. The average is not returned in the response, but the median can be accessed via response['info']['price']
     * @see https://docs.kuna.io/docs/get-market-info-by-tickers
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name kuna#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.kuna.io/docs/get-market-info-by-tickers
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * TODO: double check
     * @method
     * @name kuna#fetchL3OrderBook
     * @description fetches level 3 information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified market symbol
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/#/?id=order-book-structure}
     */
    fetchL3OrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name kuna#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.kuna.io/docs/get-public-trades-book
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] between 1 and 100, 25 by default
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name kuna#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name kuna#createOrder
     * @description create a trade order
     * @see https://docs.kuna.io/docs/create-a-new-order-private
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.id] id must be a UUID format, if you do not specify id, it will be generated automatically.
     * @param {float} [params.quoteQuantity] the max quantity of the quote asset to use for selling/buying
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kuna#cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kuna#cancelOrders
     * @description cancels an open order
     * @param {string} ids order ids
     * @param {string} symbol not used by kuna cancelOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name kuna#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.kuna.io/docs/get-order-details-by-id
     * @param {string} id order id
     * @param {string} symbol not used by kuna fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {boolean} [params.withTrades] default == true, specify if the response should include trades associated with the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kuna#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.kuna.io/docs/get-active-client-orders-private
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] 1-100, the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest timestamp (ms) to fetch orders for
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.sort] asc (oldest-on-top) or desc (newest-on-top)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kuna#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.kuna.io/docs/get-private-orders-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.sort] asc (oldest-on-top) or desc (newest-on-top)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kuna#fetchOrdersByStatus
     * @description fetch a list of orders
     * @see https://docs.kuna.io/docs/get-private-orders-history
     * @param {string} status canceled, closed, expired, open, pending, rejected, or waitStop
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] 1-100, the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest timestamp (ms) to fetch orders for
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.sort] asc (oldest-on-top) or desc (newest-on-top)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kuna#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.kuna.io/docs/get-private-trades-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] not used by kuna fetchMyTrades
     * @param {int} [limit] not used by kuna fetchMyTrades
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.orderId] UUID of an order, to receive trades for this order only
     * @param {string} [params.sort] asc (oldest-on-top) or desc (newest-on-top)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kuna#withdraw
     * @description make a withdrawal
     * @see https://docs.kuna.io/docs/create-a-withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.chain] the chain to withdraw to
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.id] id must be a uuid format, if you do not specify id, it will be generated automatically
     * @param {boolean} [params.withdrawAll] this field says that the amount should also include a fee
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name kuna#fetchWithdrawals
     * @description fetch all withdrawals made to an account
     * @see https://docs.kuna.io/docs/get-withdraw-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch deposits for
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.status] Created, Canceled, PartiallyProcessed, Processing, Processed, WaitForConfirmation, Pending, AmlChecking
     * @param {string} [params.sortField] amount (sorting by time), createdAt (sorting by date)
     * @param {string} [params.sortOrder] asc (oldest-on-top), or desc (newest-on-top, default)
     * @param {int} [params.skip] 0 - ... Select the number of transactions to skip
     * @param {string} [params.address]
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name kuna#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://docs.kuna.io/docs/get-withdraw-details-by-id
     * @param {string} id withdrawal id
     * @param {string} code not used by kuna.fetchWithdrawal
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name kuna#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.kuna.io/docs/generate-a-constant-crypto-address-for-deposit
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name kuna#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.kuna.io/docs/find-crypto-address-for-deposit
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    parseTransactionStatus(status: Str): string;
    /**
     * @method
     * @name kuna#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.kuna.io/docs/get-deposit-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch deposits for
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.status] Created, Canceled, PartiallyProcessed, Processing, Processed, WaitForConfirmation, Pending, AmlChecking
     * @param {string} [params.sortField] amount (sorting by time), createdAt (sorting by date)
     * @param {string} [params.sortOrder] asc (oldest-on-top), or desc (newest-on-top, default)
     * @param {int} [params.skip] 0 - ... Select the number of transactions to skip
     * @param {string} [params.address]
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name kuna#fetchDeposit
     * @description fetch data on a currency deposit via the deposit id
     * @see https://docs.kuna.io/docs/get-deposit-details-by-id
     * @param {string} id deposit id
     * @param {string} code filter by currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    nonce(): number;
    encodeParams(params: any): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
