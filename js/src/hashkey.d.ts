import Exchange from './abstract/hashkey.js';
import type { Account, Balances, Currencies, Currency, Dict, FundingRateHistory, LastPrice, LastPrices, Leverage, LeverageTier, LeverageTiers, Int, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction, TransferEntry, LedgerEntry, FundingRate, FundingRates, DepositAddress } from './base/types.js';
/**
 * @class hashkey
 * @augments Exchange
 */
export default class hashkey extends Exchange {
    describe(): any;
    /**
     * @method
     * @name hashkey#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://hashkeyglobal-apidoc.readme.io/reference/check-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name hashkey#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://hashkeyglobal-apidoc.readme.io/reference/test-connectivity
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
     * @name hashkey#fetchMarkets
     * @description retrieves data on all markets for the exchange
     * @see https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] the id of the market to fetch
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name hashkey#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrencyType(type: any): string;
    /**
     * @method
     * @name hashkey#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (maximum value is 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name hashkey#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-recent-trade-list
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (maximum value is 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name hashkey#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-account-trade-list
     * @see https://hashkeyglobal-apidoc.readme.io/reference/query-futures-trades
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-user
     * @param {string} symbol *is mandatory for swap markets* unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch trades for (default 'spot')
     * @param {int} [params.until] the latest time in ms to fetch trades for, only supports the last 30 days timeframe
     * @param {string} [params.fromId] srarting trade id
     * @param {string} [params.toId] ending trade id
     * @param {string} [params.clientOrderId] *spot markets only* filter trades by orderId
     * @param {string} [params.accountId] account id to fetch the orders from
     * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name hashkey#fetchOHLCV
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-kline
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name hashkey#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-24hr-ticker-price-change
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name hashkey#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-24hr-ticker-price-change
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: any, market?: Market): Ticker;
    /**
     * @method
     * @name hashkey#fetchLastPrices
     * @description fetches the last price for multiple markets
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-symbol-price-ticker
     * @param {string[]} [symbols] unified symbols of the markets to fetch the last prices
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] the id of the market to fetch last price for
     * @returns {object} a dictionary of lastprices structures
     */
    fetchLastPrices(symbols?: Strings, params?: {}): Promise<LastPrices>;
    parseLastPrice(entry: any, market?: Market): LastPrice;
    /**
     * @method
     * @name hashkey#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-account-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] account ID, for Master Key only
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch balance for (default 'spot')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(balance: any): Balances;
    parseSwapBalance(balance: any): Balances;
    /**
     * @method
     * @name hashkey#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-deposit-address
     * @param {string} code unified currency code (default is 'USDT')
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] network for fetch deposit address (default is 'ETH')
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name hashkey#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-deposit-history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
     * @param {int} [params.fromId] starting ID (To be released)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name hashkey#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://hashkeyglobal-apidoc.readme.io/reference/withdrawal-records
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name hashkey#withdraw
     * @description make a withdrawal
     * @see https://hashkeyglobal-apidoc.readme.io/reference/withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] network for withdraw
     * @param {string} [params.clientOrderId] client order id
     * @param {string} [params.platform] the platform to withdraw to (hashkey, HashKey HK)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): string;
    /**
     * @method
     * @name hashkey#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://hashkeyglobal-apidoc.readme.io/reference/new-account-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account id to transfer from
     * @param {string} toAccount account id to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the transfer
     * @param {string} [params.remark] a note for the transfer
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: any, currency?: Currency): {
        id: string;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: string;
        info: any;
    };
    /**
     * @method
     * @name hashkey#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://hashkeyglobal-apidoc.readme.io/reference/query-sub-account
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
    parseAccountType(type: any): string;
    encodeAccountType(type: any): number;
    encodeFlowType(type: any): number;
    /**
     * @method
     * @name hashkey#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-account-transaction-list
     * @param {string} [code] unified currency code, default is undefined (not used)
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {int} [params.flowType] trade, fee, transfer, deposit, withdrawal
     * @param {int} [params.accountType] spot, swap, custody
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    /**
     * @method
     * @name hashkey#createOrder
     * @description create a trade order
     * @see https://hashkeyglobal-apidoc.readme.io/reference/test-new-order
     * @see https://hashkeyglobal-apidoc.readme.io/reference/create-order
     * @see https://hashkeyglobal-apidoc.readme.io/reference/create-new-futures-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'LIMIT_MAKER' for spot, 'market' or 'limit' or 'STOP' for swap
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {boolean} [params.test] *spot markets only* whether to use the test endpoint or not, default is false
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string} [params.timeInForce] "GTC" or "IOC" or "PO" for spot, 'GTC' or 'FOK' or 'IOC' or 'LIMIT_MAKER' or 'PO' for swap
     * @param {string} [params.clientOrderId] a unique id for the order - is mandatory for swap
     * @param {float} [params.triggerPrice] *swap markets only* The price at which a trigger order is triggered at
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hashkey#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hashkey#createSpotOrder
     * @description create a trade order on spot market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/test-new-order
     * @see https://hashkeyglobal-apidoc.readme.io/reference/create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'LIMIT_MAKER'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {bool} [params.test] whether to use the test endpoint or not, default is false
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string} [params.timeInForce] 'GTC', 'IOC', or 'PO'
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createSpotOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Dict;
    createSpotOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Dict;
    createSwapOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Dict;
    /**
     * @method
     * @name hashkey#createSwapOrder
     * @description create a trade order on swap market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/create-new-futures-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'STOP'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce only
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {string} [params.timeInForce] 'GTC', 'FOK', 'IOC', 'LIMIT_MAKER' or 'PO'
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createSwapOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hashkey#createOrders
     * @description create a list of trade orders (all orders should be of the same symbol)
     * @see https://hashkeyglobal-apidoc.readme.io/reference/create-multiple-orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/batch-create-new-futures-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name hashkey#cancelOrder
     * @description cancels an open order
     * @see https://hashkeyglobal-apidoc.readme.io/reference/cancel-order
     * @see https://hashkeyglobal-apidoc.readme.io/reference/cancel-futures-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')
     * @param {string} [params.clientOrderId] a unique id for the order that can be used as an alternative for the id
     * @param {bool} [params.trigger] *swap markets only* true for canceling a trigger order (default false)
     * @param {bool} [params.stop] *swap markets only* an alternative for trigger param
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hashkey#cancelAllOrders
     * @description cancel all open orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/cancel-all-open-orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/batch-cancel-futures-order
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] 'buy' or 'sell'
     * @returns {object} response from exchange
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name hashkey#cancelOrders
     * @description cancel multiple orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/cancel-multiple-orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/batch-cancel-futures-order-by-order-id
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol (not used by hashkey)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name hashkey#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://hashkeyglobal-apidoc.readme.io/reference/query-order
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-order
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')
     * @param {string} [params.clientOrderId] a unique id for the order that can be used as an alternative for the id
     * @param {string} [params.accountId] *spot markets only* account id to fetch the order from
     * @param {bool} [params.trigger] *swap markets only* true for fetching a trigger order (default false)
     * @param {bool} [params.stop] *swap markets only* an alternative for trigger param
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hashkey#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-current-open-orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-open-orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/sub
     * @see https://hashkeyglobal-apidoc.readme.io/reference/query-open-futures-orders
     * @param {string} [symbol] unified market symbol of the market orders were made in - is mandatory for swap markets
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve - default 500, maximum 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot')
     * @param {string} [params.orderId] *spot markets only* the id of the order to fetch
     * @param {string} [params.side] *spot markets only* 'buy' or 'sell' - the side of the orders to fetch
     * @param {string} [params.fromOrderId] *swap markets only* the id of the order to start from
     * @param {bool} [params.trigger] *swap markets only* true for fetching trigger orders (default false)
     * @param {bool} [params.stop] *swap markets only* an alternative for trigger param
     * @param {string} [params.accountId] account id to fetch the orders from
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @ignore
     * @name hashkey#fetchOpenSpotOrders
     * @description fetch all unfilled currently open orders for spot markets
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-current-open-orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/sub
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve - default 500, maximum 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.orderId] the id of the order to fetch
     * @param {string} [params.side] 'buy' or 'sell' - the side of the orders to fetch
     * @param {string} [params.accountId] account id to fetch the orders from
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenSpotOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @ignore
     * @name hashkey#fetchOpenSwapOrders
     * @description fetch all unfilled currently open orders for swap markets
     * @see https://hashkeyglobal-apidoc.readme.io/reference/query-open-futures-orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-open-orders
     * @param {string} symbol *is mandatory* unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve - maximum 500
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.fromOrderId] the id of the order to start from
     * @param {bool} [params.trigger] true for fetching trigger orders (default false)
     * @param {bool} [params.stop] an alternative for trigger param
     * @param {string} [params.accountId] account id to fetch the orders from
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenSwapOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name hashkey#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and closed orders made by the user
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-all-orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/query-futures-history-orders
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-sub-account-history-orders
     * @param {string} symbol *is mandatory for swap markets* unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve - default 500, maximum 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for - only supports the last 90 days timeframe
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot')
     * @param {string} [params.orderId] *spot markets only* the id of the order to fetch
     * @param {string} [params.side] *spot markets only* 'buy' or 'sell' - the side of the orders to fetch
     * @param {string} [params.fromOrderId] *swap markets only* the id of the order to start from
     * @param {bool} [params.trigger] *swap markets only* the id of the order to start from true for fetching trigger orders (default false)
     * @param {bool} [params.stop] *swap markets only* the id of the order to start from an alternative for trigger param
     * @param {string} [params.accountId] account id to fetch the orders from
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    checkTypeParam(methodName: any, params: any): void;
    handleTriggerOptionAndParams(params: object, methodName: string, defaultValue?: any): any[];
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderSideAndReduceOnly(unparsed: any): any[];
    parseOrderStatus(status: any): string;
    parseOrderTypeTimeInForceAndPostOnly(type: any, timeInForce: any): any[];
    parseOrderType(type: any): string;
    /**
     * @method
     * @name hashkey#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name hashkey#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-funding-rate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name hashkey#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-history-funding-rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.fromId] the id of the entry to start from
     * @param {int} [params.endId] the id of the entry to end with
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @description fetch open positions for a market
     * @name hashkey#fetchPositions
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-positions
     * @description fetch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] 'LONG' or 'SHORT' - the direction of the position (if not provided, positions for both sides will be returned)
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @description fetch open positions for a single market
     * @name hashkey#fetchPositionsForSymbol
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-positions
     * @description fetch all open positions for specific symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] 'LONG' or 'SHORT' - the direction of the position (if not provided, positions for both sides will be returned)
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionsForSymbol(symbol: string, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name hashkey#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/query-futures-leverage-trade
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name hashkey#setLeverage
     * @description set the level of leverage for a market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/change-futures-leverage-trade
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name hashkey#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @see https://hashkeyglobal-apidoc.readme.io/reference/exchangeinfo
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    /**
     * @method
     * @name hashkey#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://developers.binance.com/docs/wallet/asset/trade-fee // spot
     * @see https://hashkeyglobal-apidoc.readme.io/reference/get-futures-commission-rate-request-weight // swap
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name hashkey#fetchTradingFees
     * @description *for spot markets only* fetch the trading fees for multiple markets
     * @see https://developers.binance.com/docs/wallet/asset/trade-fee
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    customUrlencode(params?: Dict): Str;
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
