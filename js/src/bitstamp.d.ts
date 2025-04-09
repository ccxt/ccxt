import Exchange from './abstract/bitstamp.js';
import type { Balances, Currencies, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction, TransferEntry, int, LedgerEntry, DepositAddress } from './base/types.js';
/**
 * @class bitstamp
 * @augments Exchange
 */
export default class bitstamp extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bitstamp#fetchMarkets
     * @description retrieves data on all markets for bitstamp
     * @see https://www.bitstamp.net/api/#tag/Market-info/operation/GetTradingPairsInfo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    constructCurrencyObject(id: any, code: any, name: any, precision: any, minCost: any, originalPayload: any): {
        id: any;
        code: any;
        info: any;
        type: string;
        name: any;
        active: boolean;
        deposit: any;
        withdraw: any;
        fee: number;
        precision: number;
        limits: {
            amount: {
                min: number;
                max: any;
            };
            price: {
                min: number;
                max: any;
            };
            cost: {
                min: any;
                max: any;
            };
            withdraw: {
                min: any;
                max: any;
            };
        };
        networks: {};
    };
    fetchMarketsFromCache(params?: {}): Promise<any>;
    /**
     * @method
     * @name bitstamp#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.bitstamp.net/api/#tag/Market-info/operation/GetTradingPairsInfo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name bitstamp#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.bitstamp.net/api/#tag/Order-book/operation/GetOrderBook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitstamp#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.bitstamp.net/api/#tag/Tickers/operation/GetMarketTicker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bitstamp#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.bitstamp.net/api/#tag/Tickers/operation/GetCurrencyPairTickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    getCurrencyIdFromTransaction(transaction: any): string;
    getMarketFromTrade(trade: any): import("./base/types.js").MarketInterface;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitstamp#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.bitstamp.net/api/#tag/Transactions-public/operation/GetTransactions
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bitstamp#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.bitstamp.net/api/#tag/Market-info/operation/GetOHLCData
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bitstamp#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.bitstamp.net/api/#tag/Account-balances/operation/GetAccountBalances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name bitstamp#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.bitstamp.net/api/#tag/Fees/operation/GetTradingFeesForCurrency
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    parseTradingFees(fees: any): Dict;
    /**
     * @method
     * @name bitstamp#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://www.bitstamp.net/api/#tag/Fees/operation/GetAllTradingFees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name bitstamp#fetchTransactionFees
     * @deprecated
     * @description please use fetchDepositWithdrawFees instead
     * @see https://www.bitstamp.net/api/#tag/Fees
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTransactionFees(codes?: Strings, params?: {}): Promise<Dict>;
    parseTransactionFees(response: any, codes?: any): Dict;
    /**
     * @method
     * @name bitstamp#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://www.bitstamp.net/api/#tag/Fees/operation/GetAllWithdrawalFees
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: any, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: any): any;
    /**
     * @method
     * @name bitstamp#createOrder
     * @description create a trade order
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/OpenInstantBuyOrder
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/OpenMarketBuyOrder
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/OpenLimitBuyOrder
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/OpenInstantSellOrder
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/OpenMarketSellOrder
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/OpenLimitSellOrder
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
     * @name bitstamp#cancelOrder
     * @description cancels an open order
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/CancelOrder
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitstamp#cancelAllOrders
     * @description cancel all open orders
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/CancelAllOrders
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/CancelOrdersForMarket
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: Str): string;
    fetchOrderStatus(id: string, symbol?: Str, params?: {}): Promise<string>;
    /**
     * @method
     * @name bitstamp#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/GetOrderStatus
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitstamp#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactions
     * @see https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactionsForMarket
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitstamp#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactions
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bitstamp#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.bitstamp.net/api/#tag/Withdrawals/operation/GetWithdrawalRequests
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    /**
     * @method
     * @name bitstamp#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.bitstamp.net/api/#tag/Transactions-private/operation/GetUserTransactions
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    /**
     * @method
     * @name bitstamp#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/GetAllOpenOrders
     * @see https://www.bitstamp.net/api/#tag/Orders/operation/GetOpenOrdersForMarket
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    getCurrencyName(code: any): any;
    isFiat(code: any): boolean;
    /**
     * @method
     * @name bitstamp#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.bitstamp.net/api/#tag/Deposits/operation/GetCryptoDepositAddress
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name bitstamp#withdraw
     * @description make a withdrawal
     * @see https://www.bitstamp.net/api/#tag/Withdrawals/operation/RequestFiatWithdrawal
     * @see https://www.bitstamp.net/api/#tag/Withdrawals/operation/RequestCryptoWithdrawal
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
     * @name bitstamp#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://www.bitstamp.net/api/#tag/Sub-account/operation/TransferFromMainToSub
     * @see https://www.bitstamp.net/api/#tag/Sub-account/operation/TransferFromSubToMain
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: any, currency?: any): {
        info: any;
        id: any;
        timestamp: any;
        datetime: any;
        currency: any;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: string;
    };
    parseTransferStatus(status: Str): Str;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
