import Exchange from './abstract/woo.js';
import type { TransferEntry, Balances, Conversion, Currency, FundingRateHistory, Int, Market, MarginModification, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Dict, Strings, Trade, Transaction, Leverage, Account, Currencies, TradingFees, int, FundingHistory, LedgerEntry, FundingRate, FundingRates, DepositAddress } from './base/types.js';
/**
 * @class woo
 * @augments Exchange
 */
export default class woo extends Exchange {
    describe(): any;
    /**
     * @method
     * @name woo#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.woox.io/#get-system-maintenance-status-public
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
     * @name woo#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.woox.io/#get-system-maintenance-status-public
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<number>;
    /**
     * @method
     * @name woo#fetchMarkets
     * @description retrieves data on all markets for woo
     * @see https://docs.woox.io/#exchange-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name woo#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.woox.io/#market-trades-public
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    parseTokenAndFeeTemp(item: any, feeTokenKey: any, feeAmountKey: any): any;
    /**
     * @method
     * @name woo#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.woox.io/#get-account-information-new
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name woo#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.woox.io/#available-token-public
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name woo#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://docs.woox.io/#send-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name woo#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://docs.woox.io/#send-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name woo#createTrailingAmountOrder
     * @description create a trailing order by providing the symbol, type, side, amount, price and trailingAmount
     * @see https://docs.woox.io/#send-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
     * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
     * @param {float} trailingAmount the quote amount to trail away from the current market price
     * @param {float} trailingTriggerPrice the price to activate a trailing order, default uses the price argument
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createTrailingAmountOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, trailingAmount?: any, trailingTriggerPrice?: any, params?: {}): Promise<Order>;
    /**
     * @method
     * @name woo#createTrailingPercentOrder
     * @description create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
     * @see https://docs.woox.io/#send-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
     * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
     * @param {float} trailingPercent the percent to trail away from the current market price
     * @param {float} trailingTriggerPrice the price to activate a trailing order, default uses the price argument
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createTrailingPercentOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, trailingPercent?: any, trailingTriggerPrice?: any, params?: {}): Promise<Order>;
    /**
     * @method
     * @name woo#createOrder
     * @description create a trade order
     * @see https://docs.woox.io/#send-order
     * @see https://docs.woox.io/#send-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] *for swap markets only* 'cross' or 'isolated', default 'cross'
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.algoType] 'STOP' or 'TRAILING_STOP' or 'OCO' or 'CLOSE_POSITION'
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {string} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {string} [params.trailingPercent] the percent to trail away from the current market price
     * @param {string} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
     * @param {string} [params.position_side] 'SHORT' or 'LONG' - if position mode is HEDGE_MODE and the trading involves futures, then is required, otherwise this parameter is not required
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    encodeMarginMode(mode: any): string;
    /**
     * @method
     * @name woo#editOrder
     * @description edit a trade order
     * @see https://docs.woox.io/#edit-order
     * @see https://docs.woox.io/#edit-order-by-client_order_id
     * @see https://docs.woox.io/#edit-algo-order
     * @see https://docs.woox.io/#edit-algo-order-by-client_order_id
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @param {string} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {string} [params.trailingPercent] the percent to trail away from the current market price
     * @param {string} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name woo#cancelOrder
     * @see https://docs.woox.io/#cancel-algo-order
     * @see https://docs.woox.io/#cancel-order
     * @see https://docs.woox.io/#cancel-order-by-client_order_id
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name woo#cancelAllOrders
     * @see https://docs.woox.io/#cancel-all-pending-orders
     * @see https://docs.woox.io/#cancel-orders
     * @see https://docs.woox.io/#cancel-all-pending-algo-orders
     * @description cancel all open orders in a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name woo#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://docs.woox.io/#cancel-all-after
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name woo#fetchOrder
     * @see https://docs.woox.io/#get-algo-order
     * @see https://docs.woox.io/#get-order
     * @description fetches information on an order made by the user
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name woo#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.woox.io/#get-orders
     * @see https://docs.woox.io/#get-algo-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {boolean} [params.isTriggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name woo#fetchOpenOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.woox.io/#get-orders
     * @see https://docs.woox.io/#get-algo-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {boolean} [params.isTriggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name woo#fetchClosedOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.woox.io/#get-orders
     * @see https://docs.woox.io/#get-algo-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {boolean} [params.isTriggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {boolean} [params.trailing] set to true if you want to fetch trailing orders
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseTimeInForce(timeInForce: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    /**
     * @method
     * @name woo#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.woox.io/#orderbook-snapshot-public
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name woo#fetchOHLCV
     * @see https://docs.woox.io/#kline-public
     * @see https://docs.woox.io/#kline-historical-data-public
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms)))
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name woo#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.woox.io/#get-trades
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
     * @name woo#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.woox.io/#get-trade-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch trades with pagination
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name woo#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://docs.woox.io/#get-assets-of-subaccounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: any): {
        info: any;
        id: string;
        name: string;
        code: any;
        type: string;
    };
    /**
     * @method
     * @name woo#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.woox.io/#get-current-holding-get-balance-new
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name woo#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.woox.io/#get-token-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    getAssetHistoryRows(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name woo#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
     * @see https://docs.woox.io/#get-asset-history
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: any): string;
    getCurrencyFromChaincode(networkizedCode: any, currency: any): any;
    /**
     * @method
     * @name woo#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.woox.io/#get-asset-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name woo#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.woox.io/#get-asset-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name woo#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.woox.io/#get-asset-history
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    /**
     * @method
     * @name woo#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.woox.io/#get-transfer-history
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
     * @name woo#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://docs.woox.io/#get-transfer-history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    /**
     * @method
     * @name woo#withdraw
     * @description make a withdrawal
     * @see https://docs.woox.io/#token-withdraw
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
     * @name woo#repayMargin
     * @description repay borrowed margin and interest
     * @see https://docs.woox.io/#repay-interest
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {string} symbol not used by woo.repayMargin ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayMargin(code: string, amount: number, symbol?: Str, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: any;
        currency: string;
        amount: any;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    };
    nonce(): number;
    sign(path: any, section?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    parseIncome(income: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number;
        datetime: string;
        id: string;
        amount: number;
        rate: number;
    };
    /**
     * @method
     * @name woo#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://docs.woox.io/#get-funding-fee-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingRate(fundingRate: any, market?: Market): FundingRate;
    /**
     * @method
     * @name woo#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://docs.woox.io/#get-predicted-funding-rate-for-one-market-public
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingInterval(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name woo#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.woox.io/#get-predicted-funding-rate-for-one-market-public
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name woo#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://docs.woox.io/#get-predicted-funding-rate-for-all-markets-public
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name woo#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.woox.io/#get-funding-rate-history-for-one-market-public
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name woo#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://docs.woox.io/#update-position-mode
     * @param {bool} hedged set to true to use HEDGE_MODE, false for ONE_WAY
     * @param {string} symbol not used by woo setPositionMode
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name woo#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://docs.woox.io/#get-account-information-new
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] *for swap markets only* 'cross' or 'isolated'
     * @param {string} [params.position_mode] *for swap markets only* 'ONE_WAY' or 'HEDGE_MODE'
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name woo#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.woox.io/#update-leverage-setting
     * @see https://docs.woox.io/#update-futures-leverage-setting
     * @param {float} leverage the rate of leverage (1, 2, 3, 4 or 5 for spot markets, 1, 2, 3, 4, 5, 10, 15, 20 for swap markets)
     * @param {string} [symbol] unified market symbol (is mandatory for swap markets)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] *for swap markets only* 'cross' or 'isolated'
     * @param {string} [params.position_side] *for swap markets only* 'LONG' or 'SHORT' in hedge mode, 'BOTH' in one way mode.
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name woo#addMargin
     * @description add margin
     * @see https://docs.woox.io/#update-isolated-margin-setting
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.position_side] 'LONG' or 'SHORT' in hedge mode, 'BOTH' in one way mode
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name woo#reduceMargin
     * @description remove margin from a position
     * @see https://docs.woox.io/#update-isolated-margin-setting
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.position_side] 'LONG' or 'SHORT' in hedge mode, 'BOTH' in one way mode
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<MarginModification>;
    fetchPosition(symbol?: Str, params?: {}): Promise<import("./base/types.js").Position>;
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: Dict, market?: Market): import("./base/types.js").Position;
    /**
     * @method
     * @name woo#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://docs.woox.io/#get-quote-rfq
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertQuote(fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name woo#createConvertTrade
     * @description convert from one currency to another
     * @see https://docs.woox.io/#send-quote-rft
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    createConvertTrade(id: string, fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name woo#fetchConvertTrade
     * @description fetch the data for a conversion trade
     * @see https://docs.woox.io/#get-quote-trade
     * @param {string} id the id of the trade that you want to fetch
     * @param {string} [code] the unified currency code of the conversion trade
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertTrade(id: string, code?: Str, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name woo#fetchConvertTradeHistory
     * @description fetch the users history of conversion trades
     * @see https://docs.woox.io/#get-quote-trades
     * @param {string} [code] the unified currency code
     * @param {int} [since] the earliest time in ms to fetch conversions for
     * @param {int} [limit] the maximum number of conversion structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest conversion to fetch
     * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertTradeHistory(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Conversion[]>;
    parseConversion(conversion: Dict, fromCurrency?: Currency, toCurrency?: Currency): Conversion;
    /**
     * @method
     * @name woo#fetchConvertCurrencies
     * @description fetches all available currencies that can be converted
     * @see https://docs.woox.io/#get-quote-asset-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchConvertCurrencies(params?: {}): Promise<Currencies>;
    defaultNetworkCodeForCurrency(code: any): any;
    setSandboxMode(enable: boolean): void;
}
