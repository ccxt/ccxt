import Exchange from './abstract/currencycom.js';
import type { Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Leverage, Num, Account, Currencies, TradingFees, Dict, int, LedgerEntry, DepositAddress } from './base/types.js';
/**
 * @class currencycom
 * @augments Exchange
 */
export default class currencycom extends Exchange {
    describe(): any;
    nonce(): number;
    /**
     * @method
     * @name currencycom#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/timeUsingGET
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name currencycom#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/getCurrenciesUsingGET
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name currencycom#fetchMarkets
     * @description retrieves data on all markets for currencycom
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/exchangeInfoUsingGET
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name currencycom#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/accountUsingGET
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    /**
     * @method
     * @name currencycom#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/accountUsingGET
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseBalance(response: any, type?: any): Balances;
    /**
     * @method
     * @name currencycom#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/accountUsingGET
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name currencycom#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/depthUsingGET
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name currencycom#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/ticker_24hrUsingGET
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name currencycom#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/ticker_24hrUsingGET
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name currencycom#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/klinesUsingGET
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
     * @name currencycom#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/aggTradesUsingGET
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderType(status: any): string;
    parseOrderTimeInForce(status: any): string;
    parseOrderSide(status: any): string;
    /**
     * @method
     * @name currencycom#createOrder
     * @description create a trade order
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/orderUsingPOST
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
     * @name currencycom#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/getOrderUsingGET
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name currencycom#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/openOrdersUsingGET
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name currencycom#cancelOrder
     * @description cancels an open order
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/cancelOrderUsingDELETE
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name currencycom#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/myTradesUsingGET
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name currencycom#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/getDepositsUsingGET
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name currencycom#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/getWithdrawalsUsingGET
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name currencycom#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/getTransactionsUsingGET
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchTransactionsByMethod(method: any, code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    parseTransactionType(type: any): string;
    /**
     * @method
     * @name currencycom#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/getLedgerUsingGET
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryStatus(status: any): string;
    parseLedgerEntryType(type: any): string;
    /**
     * @method
     * @name currencycom#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/leverageSettingsUsingGET
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name currencycom#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/getDepositAddressUsingGET
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    /**
     * @method
     * @name currencycom#fetchPositions
     * @description fetch all open positions
     * @see https://apitradedoc.currency.com/swagger-ui.html#/rest-api/tradingPositionsUsingGET
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: Dict, market?: Market): import("./base/types.js").Position;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
