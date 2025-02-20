import Exchange from './abstract/coinlist.js';
import type { Account, Balances, Currencies, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction, TransferEntry, int, LedgerEntry } from './base/types.js';
/**
 * @class coinlist
 * @augments Exchange
 */
export default class coinlist extends Exchange {
    describe(): any;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): number;
    /**
     * @method
     * @name coinlist#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-system-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name coinlist#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-supported-assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name coinlist#fetchMarkets
     * @description retrieves data on all markets for coinlist
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name coinlist#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-symbol-summaries
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name coinlist#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-market-summary
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name coinlist#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-order-book-level-2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name coinlist#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name coinlist#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-auctions
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name coinlist#fetchTradingFees
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
    /**
     * @method
     * @name coinlist#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
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
     * @name coinlist#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name coinlist#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-fills
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinlist#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-fills
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
     * @name coinlist#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {string|string[]} [params.status] the status of the order - 'accepted', 'done', 'canceled', 'rejected', 'pending' (default [ 'accepted', 'done', 'canceled', 'rejected', 'pending' ])
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinlist#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-specific-order-by-id
     * @param {int|string} id order id
     * @param {string} symbol not used by coinlist fetchOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinlist#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinlist#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of closed order structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinlist#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of canceled order structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinlist#cancelAllOrders
     * @description cancel open orders of market
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#cancel-all-orders
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinlist#cancelOrder
     * @description cancels an open order
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#cancel-specific-order-by-id
     * @param {string} id order id
     * @param {string} symbol not used by coinlist cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinlist#cancelOrders
     * @description cancel multiple orders
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#cancel-specific-orders
     * @param {string[]} ids order ids
     * @param {string} symbol not used by coinlist cancelOrders ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<any[]>;
    /**
     * @method
     * @name coinlist#createOrder
     * @description create a trade order
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#create-new-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'stop_market' or 'stop_limit' or 'take_market' or 'take_limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately (default false)
     * @param {float} [params.triggerPrice] only for the 'stop_market', 'stop_limit', 'take_market' or 'take_limit' orders (the price at which an order is triggered)
     * @param {string} [params.clientOrderId] client order id (default undefined)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinlist#editOrder
     * @description create a trade order
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#modify-existing-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'stop_market' or 'stop_limit' or 'take_market' or 'take_limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderType(status: any): string;
    /**
     * @method
     * @name coinlist#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#transfer-funds-between-entities
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#transfer-funds-from-wallet-to-pro
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#transfer-funds-from-pro-to-wallet
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name coinlist#fetchTransfers
     * @description fetch a history of internal transfers between CoinList.co and CoinList Pro. It does not return external deposits or withdrawals
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#list-transfers
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    /**
     * @method
     * @name coinlist#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals from external wallets and between CoinList Pro trading account and CoinList wallet
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-coinlist-wallet-ledger
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal
     * @param {int} [limit] max number of deposit/withdrawals to return (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name coinlist#withdraw
     * @description request a withdrawal from CoinList wallet. (Disabled by default. Contact CoinList to apply for an exception.)
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#request-withdrawal-from-wallet
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionType(type: any): string;
    /**
     * @method
     * @name coinlist#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://trade-docs.coinlist.co/?javascript--nodejs#get-account-history
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: any): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
