import Exchange from './abstract/kraken.js';
import type { IndexType, Int, OrderSide, OrderType, OHLCV, Trade, Order, Balances, Str, Dict, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Market, TransferEntry, Num, TradingFeeInterface, Currencies, int, LedgerEntry, DepositAddress, Position } from './base/types.js';
/**
 * @class kraken
 * @augments Exchange
 * @description Set rateLimit to 1000 if fully verified
 */
export default class kraken extends Exchange {
    describe(): any;
    feeToPrecision(symbol: any, fee: any): string;
    /**
     * @method
     * @name kraken#fetchMarkets
     * @description retrieves data on all markets for kraken
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getTradableAssetPairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name kraken#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.kraken.com/api/docs/rest-api/get-system-status/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    /**
     * @method
     * @name kraken#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getAssetInfo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    safeCurrencyCode(currencyId: Str, currency?: Currency): Str;
    /**
     * @method
     * @name kraken#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getTradeVolume
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    parseTradingFee(response: any, market: any): {
        info: any;
        symbol: any;
        maker: number;
        taker: number;
        percentage: boolean;
        tierBased: boolean;
    };
    parseBidAsk(bidask: any, priceKey?: IndexType, amountKey?: IndexType, countOrIdKey?: IndexType): number[];
    /**
     * @method
     * @name kraken#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getOrderBook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name kraken#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getTickerInformation
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name kraken#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getTickerInformation
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name kraken#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.kraken.com/api/docs/rest-api/get-ohlc-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    /**
     * @method
     * @name kraken#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getLedgers
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @param {int} [params.end] timestamp in seconds of the latest ledger entry
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    fetchLedgerEntriesByIds(ids: any, code?: Str, params?: {}): Promise<LedgerEntry[]>;
    fetchLedgerEntry(id: string, code?: Str, params?: {}): Promise<LedgerEntry>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name kraken#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getRecentTrades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name kraken#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getExtendedBalance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name kraken#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @see https://docs.kraken.com/rest/#tag/Spot-Trading/operation/addOrder
     * @param {string} symbol unified symbol of the market to create an order in (only USD markets are supported)
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketOrderWithCost(symbol: string, side: OrderSide, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kraken#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol, side and cost
     * @see https://docs.kraken.com/rest/#tag/Spot-Trading/operation/addOrder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kraken#createOrder
     * @description create a trade order
     * @see https://docs.kraken.com/api/docs/rest-api/add-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {bool} [params.reduceOnly] *margin only* indicates if this order is to reduce the size of a position
     * @param {float} [params.stopLossPrice] *margin only* the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] *margin only* the price that a take profit order is triggered at
     * @param {string} [params.trailingAmount] *margin only* the quote amount to trail away from the current market price
     * @param {string} [params.trailingPercent] *margin only* the percent to trail away from the current market price
     * @param {string} [params.trailingLimitAmount] *margin only* the quote amount away from the trailingAmount
     * @param {string} [params.trailingLimitPercent] *margin only* the percent away from the trailingAmount
     * @param {string} [params.offset] *margin only* '+' or '-' whether you want the trailingLimitAmount value to be positive or negative, default is negative '-'
     * @param {string} [params.trigger] *margin only* the activation price type, 'last' or 'index', default is 'last'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    findMarketByAltnameOrId(id: any): any;
    getDelistedMarketById(id: any): any;
    parseOrderStatus(status: Str): string;
    parseOrderType(status: any): string;
    parseOrder(order: Dict, market?: Market): Order;
    orderRequest(method: string, symbol: string, type: string, request: Dict, amount: Num, price?: Num, params?: {}): Dict[];
    /**
     * @method
     * @name kraken#editOrder
     * @description edit a trade order
     * @see https://docs.kraken.com/api/docs/rest-api/amend-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {string} [params.trailingPercent] the percent to trail away from the current market price
     * @param {string} [params.trailingLimitAmount] the quote amount away from the trailingAmount
     * @param {string} [params.trailingLimitPercent] the percent away from the trailingAmount
     * @param {string} [params.offset] '+' or '-' whether you want the trailingLimitAmount value to be positive or negative
     * @param {boolean} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string} [params.clientOrderId] the orders client order id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kraken#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getOrdersInfo
     * @param {string} id order id
     * @param {string} symbol not used by kraken fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kraken#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getTradesInfo
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kraken#fetchOrdersByIds
     * @description fetch orders by the list of order id
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getClosedOrders
     * @param {string[]} [ids] list of order id
     * @param {string} [symbol] unified ccxt market symbol
     * @param {object} [params] extra parameters specific to the kraken api endpoint
     * @returns {object[]} a list of [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrdersByIds(ids: any, symbol?: Str, params?: {}): Promise<any[]>;
    /**
     * @method
     * @name kraken#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.kraken.com/api/docs/rest-api/get-trade-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade entry
     * @param {int} [params.end] timestamp in seconds of the latest trade entry
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kraken#cancelOrder
     * @description cancels an open order
     * @see https://docs.kraken.com/api/docs/rest-api/cancel-order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the orders client order id
     * @param {int} [params.userref] the orders user reference id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kraken#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.kraken.com/rest/#tag/Spot-Trading/operation/cancelOrderBatch
     * @param {string[]} ids open orders transaction ID (txid) or user reference (userref)
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kraken#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.kraken.com/rest/#tag/Spot-Trading/operation/cancelAllOrders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kraken#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://docs.kraken.com/rest/#tag/Spot-Trading/operation/cancelAllOrdersAfter
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name kraken#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.kraken.com/api/docs/rest-api/get-open-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the orders client order id
     * @param {int} [params.userref] the orders user reference id
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kraken#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.kraken.com/api/docs/rest-api/get-closed-orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @param {string} [params.clientOrderId] the orders client order id
     * @param {int} [params.userref] the orders user reference id
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseTransactionStatus(status: Str): string;
    parseNetwork(network: any): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionsByType(type: any, transactions: any, code?: Str, since?: Int, limit?: Int): any;
    /**
     * @method
     * @name kraken#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/getStatusRecentDeposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest transaction entry
     * @param {int} [params.end] timestamp in seconds of the latest transaction entry
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name kraken#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.kraken.com/rest/#tag/Spot-Market-Data/operation/getServerTime
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name kraken#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/getStatusRecentWithdrawals
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest transaction entry
     * @param {int} [params.end] timestamp in seconds of the latest transaction entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    addPaginationCursorToResult(result: any): any;
    /**
     * @method
     * @name kraken#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/getDepositAddresses
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name kraken#fetchDepositMethods
     * @description fetch deposit methods for a currency associated with this account
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/getDepositMethods
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the kraken api endpoint
     * @returns {object} of deposit methods
     */
    fetchDepositMethods(code: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name kraken#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/getDepositAddresses
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name kraken#withdraw
     * @description make a withdrawal
     * @see https://docs.kraken.com/rest/#tag/Funding/operation/withdrawFunds
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to, not required can be '' or undefined/none/null
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name kraken#fetchPositions
     * @description fetch all open positions
     * @see https://docs.kraken.com/rest/#tag/Account-Data/operation/getOpenPositions
     * @param {string[]} [symbols] not used by kraken fetchPositions ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    parseAccountType(account: any): string;
    /**
     * @method
     * @name kraken#transferOut
     * @description transfer from spot wallet to futures wallet
     * @see https://docs.kraken.com/rest/#tag/User-Funding/operation/walletTransfer
     * @param {str} code Unified currency code
     * @param {float} amount Size of the transfer
     * @param {dict} [params] Exchange specific parameters
     * @returns a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transferOut(code: string, amount: any, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name kraken#transfer
     * @see https://docs.kraken.com/rest/#tag/User-Funding/operation/walletTransfer
     * @description transfers currencies between sub-accounts (only spot->swap direction is supported)
     * @param {string} code Unified currency code
     * @param {float} amount Size of the transfer
     * @param {string} fromAccount 'spot' or 'Spot Wallet'
     * @param {string} toAccount 'swap' or 'Futures Wallet'
     * @param {object} [params] Exchange specific parameters
     * @returns a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    nonce(): number;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
