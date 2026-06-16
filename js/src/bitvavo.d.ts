import Exchange from './abstract/bitvavo.js';
import type { Account, Balances, Currencies, Currency, Dict, Int, LedgerEntry, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction, TransferEntry, int, DepositAddress } from './base/types.js';
/**
 * @class bitvavo
 * @augments Exchange
 */
export default class bitvavo extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bitvavo#fetchTime
     * @see https://docs.bitvavo.com/docs/rest-api/get-server-time/
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name bitvavo#fetchMarkets
     * @see https://docs.bitvavo.com/docs/rest-api/get-markets/
     * @description retrieves data on all markets for bitvavo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarkets(markets: any): any[];
    /**
     * @method
     * @name bitvavo#fetchCurrencies
     * @see https://docs.bitvavo.com/docs/rest-api/get-asset-data/
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrency(rawCurrency: Dict): Currency;
    /**
     * @method
     * @name bitvavo#fetchTicker
     * @see https://docs.bitvavo.com/docs/rest-api/get-candlestick-data-24-h/
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitvavo#fetchTickers
     * @see https://docs.bitvavo.com/docs/rest-api/get-candlestick-data-24-h/
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bitvavo#fetchTrades
     * @see https://docs.bitvavo.com/docs/rest-api/get-trades/
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitvavo#fetchTradingFees
     * @see https://docs.bitvavo.com/docs/rest-api/get-account-fees/
     * @description fetch the trading fees for multiple markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseTradingFees(fees: any, market?: any): Dict;
    /**
     * @method
     * @name bitvavo#fetchTradingFee
     * @see https://docs.bitvavo.com/docs/rest-api/get-market-fees/
     * @description fetch the trading fees for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name bitvavo#fetchOrderBook
     * @see https://docs.bitvavo.com/docs/rest-api/get-order-book/
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    fetchOHLCVRequest(symbol: Str, timeframe?: string, since?: Int, limit?: Int, params?: {}): any;
    /**
     * @method
     * @name bitvavo#fetchOHLCV
     * @see https://docs.bitvavo.com/docs/rest-api/get-candlestick-data/
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: Str, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bitvavo#fetchBalance
     * @see https://docs.bitvavo.com/docs/rest-api/get-account-balance/
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name bitvavo#fetchAccounts
     * @see https://docs.bitvavo.com/docs/institutional-api/get-subaccounts/
     * @description fetch all the accounts associated with a profile
     * @param {object} [params] extra parameters specific to the bitvavo api endpoint
     * @returns {object[]} a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: Dict): Account;
    /**
     * @method
     * @name bitvavo#transfer
     * @see https://docs.bitvavo.com/docs/institutional-api/create-transfer/
     * @description transfer currency internally between the master account and a subaccount
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from, either 'master' or the subaccount id
     * @param {string} toAccount account to transfer to, either 'master' or the subaccount id
     * @param {object} [params] extra parameters specific to the bitvavo api endpoint
     * @param {string} [params.subaccountId] the unique identifier for the subaccount
     * @param {string} [params.clientRequestId] client defined unique id
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name bitvavo#fetchTransfers
     * @see https://docs.bitvavo.com/docs/institutional-api/get-transfers/
     * @description fetch a history of internal transfers made on an account
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the bitvavo api endpoint
     * @param {string} [params.subaccountId] the unique identifier for the subaccount
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name bitvavo#fetchTransfer
     * @see https://docs.bitvavo.com/docs/institutional-api/get-transfer/
     * @description fetches a transfer
     * @param {string} id transfer id
     * @param {string} [code] unified currency code of the currency transferred
     * @param {object} [params] extra parameters specific to the bitvavo api endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfer(id: string, code?: Str, params?: {}): Promise<TransferEntry>;
    parseTransferStatus(status: Str): Str;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name bitvavo#fetchDepositAddress
     * @see https://docs.bitvavo.com/docs/rest-api/get-deposit-data/
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    createOrderRequest(symbol: Str, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name bitvavo#createOrder
     * @description create a trade order
     * @see https://docs.bitvavo.com/docs/rest-api/create-order/
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the bitvavo api endpoint
     * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
     * @param {float} [params.stopPrice] Alias for triggerPrice
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {bool} [params.postOnly] If true, the order will only be posted to the order book and not executed immediately
     * @param {float} [params.stopLossPrice] The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price at which a take profit order is triggered at
     * @param {string} [params.triggerType] "price"
     * @param {string} [params.triggerReference] "lastTrade", "bestBid", "bestAsk", "midPrice" Only for stop orders: Use this to determine which parameter will trigger the order
     * @param {string} [params.selfTradePrevention] one of EXPIRE_BOTH, cancelOldest, cancelNewest or decrementAndCancel
     * @param {bool} [params.disableMarketProtection] don't cancel if the next fill price is 10% worse than the best fill price
     * @param {bool} [params.responseRequired] Set this to 'false' when only an acknowledgement of success or failure is required, this is faster.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: Str, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    editOrderRequest(id: string, symbol: any, type: any, side: any, amount?: any, price?: any, params?: {}): Dict;
    /**
     * @method
     * @name bitvavo#editOrder
     * @description edit a trade order
     * @see https://docs.bitvavo.com/docs/rest-api/update-order/
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the bitvavo api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    cancelOrderRequest(id: Str, symbol?: Str, params?: {}): any;
    /**
     * @method
     * @name bitvavo#cancelOrder
     * @description cancels an open order
     * @see https://docs.bitvavo.com/docs/rest-api/cancel-order/
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitvavo#cancelAllOrders
     * @see https://docs.bitvavo.com/docs/rest-api/cancel-orders/
     * @description cancel all open orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitvavo#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://docs.bitvavo.com/docs/rest-api/cancel-orders-after/
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.codGroupId] your identifier for a group of orders, default is 1
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitvavo#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.bitvavo.com/docs/rest-api/get-order/
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrdersRequest(symbol?: Str, since?: Int, limit?: Int, params?: {}): any;
    /**
     * @method
     * @name bitvavo#fetchOrders
     * @see https://docs.bitvavo.com/docs/rest-api/get-orders/
     * @description fetches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitvavo#fetchOpenOrders
     * @see https://docs.bitvavo.com/docs/rest-api/get-open-orders/
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    fetchMyTradesRequest(symbol?: Str, since?: Int, limit?: Int, params?: {}): any;
    /**
     * @method
     * @name bitvavo#fetchMyTrades
     * @see https://docs.bitvavo.com/docs/rest-api/get-trade-history/
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitvavo#fetchLedger
     * @see https://docs.bitvavo.com/docs/rest-api/get-transaction-history/
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the bitvavo api endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @param {int} [params.page] the page number for the transaction history
     * @returns {object[]} a list of [ledger structures]{@link https://docs.ccxt.com/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntryType(type: Str): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    withdrawRequest(code: Str, amount: any, address: any, tag?: any, params?: {}): any;
    /**
     * @method
     * @name bitvavo#withdraw
     * @see https://docs.bitvavo.com/docs/rest-api/withdraw-assets/
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    fetchWithdrawalsRequest(code?: Str, since?: Int, limit?: Int, params?: {}): any;
    /**
     * @method
     * @name bitvavo#fetchWithdrawals
     * @see https://docs.bitvavo.com/docs/rest-api/get-withdrawal-history/
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the bitvavo api endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchDepositsRequest(code?: Str, since?: Int, limit?: Int, params?: {}): any;
    /**
     * @method
     * @name bitvavo#fetchDeposits
     * @see https://docs.bitvavo.com/docs/rest-api/get-deposit-history/
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the bitvavo api endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseDepositWithdrawFee(fee: any, currency?: Currency): Dict;
    /**
     * @method
     * @name bitvavo#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://docs.bitvavo.com/docs/rest-api/get-asset-data/
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
}
