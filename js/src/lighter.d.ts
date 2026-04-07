import Exchange from './abstract/lighter.js';
import type { Dict, FundingRate, FundingRates, Int, int, Market, OHLCV, OrderBook, Strings, Ticker, Tickers, OrderType, OrderSide, Num, Order, Balances, Position, Str, TransferEntry, Currency, Currencies, Transaction, Trade, Account, MarginModification } from './base/types.js';
/**
 * @class lighter
 * @augments Exchange
 */
export default class lighter extends Exchange {
    describe(): any;
    loadAccount(chainId: any, privateKey: any, apiKeyIndex: any, accountIndex: any, params?: {}): Promise<import("./base/types.js").Dictionary<any>>;
    /**
     * @method
     * @name lighter#preLoadLighterLibrary
     * @description if the required credentials are available in options, it will pre-load the lighter Signer to avoid delaying sensitive calls like createOrder the first time they're executed
     * @param params
     * @returns {boolean} true if the signer was loaded, false otherwise
     */
    preLoadLighterLibrary(params?: {}): Promise<boolean>;
    handleAccountIndex(params: object, methodName1: string, optionName1: string, optionName2: string, defaultValue?: any): Promise<(number | object)[]>;
    createSubAccount(name: string, params?: {}): Promise<any>;
    createAuth(params?: {}): string;
    pow(n: string, m: string): string;
    setSandboxMode(enable: boolean): void;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any[];
    fetchNonce(accountIndex: any, apiKeyIndex: any, params?: {}): Promise<number>;
    /**
     * @method
     * @name lighter#createOrder
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] 'GTT' or 'IOC', default is 'GTT'
     * @param {int} [params.clientOrderId] client order id, should be unique for each order, default is a random number
     * @param {string} [params.triggerPrice] trigger price for stop loss or take profit orders, in units of the quote currency
     * @param {boolean} [params.reduceOnly] whether the order is reduce only, default false
     * @param {int} [params.nonce] nonce for the account
     * @param {int} [params.apiKeyIndex] apiKeyIndex
     * @param {int} [params.accountIndex] accountIndex
     * @param {int} [params.orderExpiry] orderExpiry
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name lighter#editOrder
     * @description cancels an order and places a new order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name lighter#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://apidocs.lighter.xyz/reference/status
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
     * @name lighter#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://apidocs.lighter.xyz/reference/status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name lighter#fetchMarkets
     * @description retrieves data on all markets for lighter
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name lighter#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://apidocs.lighter.xyz/reference/assetdetails
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name lighter#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.lighter.xyz/reference/orderbookorders
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name lighter#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name lighter#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://apidocs.lighter.xyz/reference/orderbookdetails
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name lighter#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://apidocs.lighter.xyz/reference/candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name lighter#fetchFundingRates
     * @description fetch the current funding rate for multiple symbols
     * @see https://apidocs.lighter.xyz/reference/funding-rates
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name ligher#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.lighter.xyz/reference/account-1
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.by] fetch balance by 'index' or 'l1_address', defaults to 'index'
     * @param {string} [params.value] fetch balance value, account index or l1 address
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name lighter#fetchPosition
     * @description fetch data on an open position
     * @see https://apidocs.lighter.xyz/reference/account-1
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.by] fetch balance by 'index' or 'l1_address', defaults to 'index'
     * @param {string} [params.value] fetch balance value, account index or l1 address
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name lighter#fetchPositions
     * @description fetch all open positions
     * @see https://apidocs.lighter.xyz/reference/account-1
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.by] fetch balance by 'index' or 'l1_address', defaults to 'index'
     * @param {string} [params.value] fetch balance value, account index or l1 address
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name lighter#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://apidocs.lighter.xyz/reference/account-1
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.by] fetch balance by 'index' or 'l1_address', defaults to 'index'
     * @param {string} [params.value] fetch balance value, account index or l1 address
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/?id=accounts-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: any): {
        id: string;
        type: string;
        code: any;
        info: any;
    };
    /**
     * @method
     * @name lighter#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://apidocs.lighter.xyz/reference/accountactiveorders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name lighter#fetchClosedOrders
     * @description fetch all unfilled currently closed orders
     * @see https://apidocs.lighter.xyz/reference/accountinactiveorders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderType(status: any): string;
    parseOrderTimeInForeces(tif: any): string;
    /**
     * @method
     * @name lighter#transfer
     * @description transfer currency internally between wallets on the same account
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from (spot, perp)
     * @param {string} toAccount account to transfer to (spot, perp)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.toAccountIndex] to account index, defaults to fromAccountIndex
     * @param {string} [params.apiKeyIndex] api key index
     * @param {string} [params.memo] hex encoding memo
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name lighter#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://apidocs.lighter.xyz/reference/transfer_history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name lighter#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://apidocs.lighter.xyz/reference/deposit_history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.address] l1_address
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name lighter#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://apidocs.lighter.xyz/reference/withdraw_history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    /**
     * @method
     * @name lighter#withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @param {int} [params.routeType] wallet type, 0: perp, 1: spot, default is 0
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name lighter#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://apidocs.lighter.xyz/reference/trades
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name lighter#setLeverage
     * @description set the level of leverage for a market
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @param {string} [params.marginMode] margin mode, 'cross' or 'isolated'
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name lighter#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @param {int} [params.leverage] required leverage
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    modifyLeverageAndMarginMode(leverage: int, marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name lighter#cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name lighter#cancelAllOrders
     * @description cancel all open orders
     * @param {string} [symbol] unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name lighter#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name lighter#addMargin
     * @description add margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name lighter#reduceMargin
     * @description remove margin from a position
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name lighter#setMargin
     * @description Either adds or reduces margin in an isolated position in order to set the margin to a specific value
     * @param {string} symbol unified market symbol of the market to set margin in
     * @param {float} amount the amount to set the margin to
     * @param {object} [params] parameters specific to the bingx api endpoint
     * @param {string} [params.accountIndex] account index
     * @param {string} [params.apiKeyIndex] api key index
     * @returns {object} A [margin structure]{@link https://docs.ccxt.com/?id=add-margin-structure}
     */
    setMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
