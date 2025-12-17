import Exchange from './abstract/bullish.js';
import { Account, Balances, Currencies, Currency, DepositAddress, Dict, Int, int, FundingRateHistory, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Trade, Transaction, TransferEntry } from './base/types.js';
/**
 * @class bullish
 * @augments Exchange
 */
export default class bullish extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bullish#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name bullish#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name bullish#fetchMarkets
     * @description retrieves data on all markets for ace
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseMarketType(type: string, defaultType?: Str): string;
    /**
     * @method
     * @name bullish#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/orderbook/hybrid
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (not used by bullish)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name bullish#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/trades
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/markets/-symbol-/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bullish#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/trades
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {string} [params.orderId] the order id to fetch trades for
     * @param {string} [params.clientOrderId] the client order id to fetch trades for
     * @param {string} [params.tradingAccountId] the trading account id to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bullish#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/trades
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the client order id to fetch trades for
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bullish#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/tick
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    safeDeterministicCall(method: string, symbol?: Str, since?: Int, limit?: Int, timeframe?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bullish#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/markets/-symbol-/candle
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bullish#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/markets/-symbol-/funding-rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] not sent to exchange api, exchange api always returns the most recent data, only used to filter exchange response
     * @param {int} [limit] the maximum amount of funding rate structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name bullish#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve (5, 25, 50, 100, default is 25)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order to fetch
     * @param {string} [params.tradingAccountId] the trading account id (mandatory parameter)
     * @param {string} [params.orderId] the id of the order to fetch for
     * @param {string} [params.clientOrderId] the client id of the order to fetch for
     * @param {string} [params.status] filter by order status, 'OPEN', 'CANCELLED', 'CLOSED', 'REJECTED'
     * @param {bool} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handlePaginationParams(method: string, since?: Int, params?: Dict): Dict;
    handleSinceAndUntil(since?: Int, params?: Dict, sinceKey?: Str, untilKey?: Str): Dict;
    getClosestLimit(limit: Int): Int;
    /**
     * @method
     * @name bullish#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.tradingAccountId the trading account id (mandatory parameter)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bullish#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders
     * @param {string} symbol unified market symbol of the canceled orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of canceled orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingAccountId] the trading account id (mandatory parameter)
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bullish#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--orders
     * @param {string} symbol unified market symbol of the closed orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of closed orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.tradingAccountId the trading account id (mandatory parameter)
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bullish#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--history
     * @param {string} symbol unified market symbol of the closed orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of closed orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tradingAccountId] the trading account id (mandatory parameter)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bullish#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v2/orders/-orderId-
     * @param {string} id the order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.traidingAccountId] the trading account id (mandatory parameter)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bullish#createOrder
     * @description create a trade order
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/orders
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'STOP_LIMIT' or 'POST_ONLY'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a custom client order id
     * @param {float} [params.triggerPrice] the price at which a stop order is triggered at
     * @param {string} [params.timeInForce] the time in force for the order, either 'GTC' (Good Till Cancelled) or 'IOC' (Immediate or Cancel), default is 'GTC'
     * @param {bool} [params.allowBorrow] if true, the order will be allowed to borrow assets to fulfill the order (default is false)
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately (default is false)
     * @param {string} params.traidingAccountId the trading account id (mandatory parameter)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bullish#editOrder
     * @description edit a trade limit order
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-amend
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market to create an order in
     * @param {string} [type] 'limit' or 'POST_ONLY'
     * @param {string} [side] not used by bullish editOrder
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price for the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.traidingAccountId] the trading account id (mandatory parameter)
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately (default is false)
     * @param {string} [params.clientOrderId] a unique identifier for the order, automatically generated if not sent
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bullish#cancelOrder
     * @description cancels an open order
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-cancellations
     * @param {string} [id] order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.commandType the command type, default is 'V3CancelOrder' (mandatory parameter)
     * @param {string} [params.traidingAccountId] the trading account id (mandatory parameter)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bullish#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v2/command-cancellations
     * @param {string} [symbol] alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.traidingAccountId the trading account id (mandatory parameter)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderType(type: Str): string;
    /**
     * @method
     * @name bullish#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/wallets/transactions
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bullish#withdraw
     * @description make a withdrawal
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v1/wallets/withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.timestamp the timestamp of the withdrawal request (mandatory)
     * @param {string} params.nonce the nonce of the withdrawal request (mandatory)
     * @param {string} params.network network for withdraw (mandatory)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionType(type: any): string;
    parseTransactionStatus(status: Str): string;
    loadAccount(params?: {}): Promise<string>;
    /**
     * @method
     * @name bullish#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#tag--trading-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: Dict): Account;
    /**
     * @method
     * @name bullish#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/wallets/deposit-instructions/crypto/-symbol-
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] network for deposit address
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name bullish#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/accounts/asset
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/accounts/asset/-symbol-
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.tradingAccountId the trading account id (mandatory parameter)
     * @param {string} [params.code] unified currency code, default is undefined
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalanceForSingleCurrency(response: any, code: Str): Balances;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bullish#fetchPositions
     * @description fetch all open positions
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/derivatives-positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.tradingAccountId the trading account id
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    parsePositionSide(side: Str): string;
    /**
     * @method
     * @name bullish#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/transfer
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} params.until the latest time in ms to fetch transfers for (default time now)
     * @param {string} params.tradingAccountId the trading account id
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name bullish#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#post-/v1/command-commandType-V1TransferAsset
     * @param {string} code unified currency codeåå
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account ID to transfer from
     * @param {string} toAccount account ID to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: any, currency?: Currency): {
        id: string;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: number;
        fromAccount: string;
        toAccount: string;
        status: string;
        info: any;
    };
    parseTransferStatus(status: any): string;
    /**
     * @method
     * @name bullish#fetchBorrowRateHistory
     * @description retrieves a history of a currencies borrow interest rate at specific time slots
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#get-/v1/history/borrow-interest
     * @param {string} code unified currency code
     * @param {int} [since] timestamp for the earliest borrow rate
     * @param {int} [limit] the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} params.until the latest time in ms to fetch entries for
     * @param {string} params.tradingAccountId the trading account id
     * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
     */
    fetchBorrowRateHistory(code: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowRate(info: any, currency?: Currency): {
        currency: string;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    getTimestamp(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    /**
     * @method
     * @name bullish#signIn
     * @description sign in, must be called prior to using other authenticated methods
     * @see https://api.exchange.bullish.com/docs/api/rest/trading-api/v2/#overview--add-authenticated-request-header
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns response from exchange
     */
    signIn(params?: {}): Promise<string>;
    handleToken(params?: {}): Promise<string>;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
