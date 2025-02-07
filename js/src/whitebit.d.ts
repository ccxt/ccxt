import Exchange from './abstract/whitebit.js';
import type { TransferEntry, Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, Currencies, TradingFees, Dict, int, FundingRate, FundingRates, DepositAddress, BorrowInterest } from './base/types.js';
/**
 * @class whitebit
 * @augments Exchange
 */
export default class whitebit extends Exchange {
    describe(): any;
    /**
     * @method
     * @name whitebit#fetchMarkets
     * @description retrieves data on all markets for whitebit
     * @see https://docs.whitebit.com/public/http-v4/#market-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name whitebit#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.whitebit.com/public/http-v4/#asset-status-list
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name whitebit#fetchTransactionFees
     * @deprecated
     * @description please use fetchDepositWithdrawFees instead
     * @see https://docs.whitebit.com/public/http-v4/#fee
     * @param {string[]|undefined} codes not used by fetchTransactionFees ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTransactionFees(codes?: Strings, params?: {}): Promise<{
        withdraw: Dict;
        deposit: Dict;
        info: any;
    }>;
    /**
     * @method
     * @name whitebit#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://docs.whitebit.com/public/http-v4/#fee
     * @param {string[]|undefined} codes not used by fetchDepositWithdrawFees ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<Dict>;
    parseDepositWithdrawFees(response: any, codes?: any, currencyIdKey?: any): Dict;
    /**
     * @method
     * @name whitebit#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.whitebit.com/public/http-v4/#asset-status-list
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name whitebit#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.whitebit.com/public/http-v4/#market-activity
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name whitebit#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.whitebit.com/public/http-v4/#market-activity
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] either v2PublicGetTicker or v4PublicGetTicker default is v4PublicGetTicker
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name whitebit#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.whitebit.com/public/http-v4/#orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name whitebit#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.whitebit.com/public/http-v4/#recent-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name whitebit#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.whitebit.com/private/http-trade-v4/#query-executed-order-history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name whitebit#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.whitebit.com/public/http-v1/#kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name whitebit#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.whitebit.com/public/http-v4/#server-status
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
     * @name whitebit#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.whitebit.com/public/http-v4/#server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<number>;
    /**
     * @method
     * @name whitebit#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketOrderWithCost(symbol: string, side: OrderSide, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name whitebit#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name whitebit#createOrder
     * @description create a trade order
     * @see https://docs.whitebit.com/private/http-trade-v4/#create-limit-order
     * @see https://docs.whitebit.com/private/http-trade-v4/#create-market-order
     * @see https://docs.whitebit.com/private/http-trade-v4/#create-buy-stock-market-order
     * @see https://docs.whitebit.com/private/http-trade-v4/#create-stop-limit-order
     * @see https://docs.whitebit.com/private/http-trade-v4/#create-stop-market-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *market orders only* the cost of the order in units of the base currency
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name whitebit#editOrder
     * @description edit a trade order
     * @see https://docs.whitebit.com/private/http-trade-v4/#modify-order
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name whitebit#cancelOrder
     * @description cancels an open order
     * @see https://docs.whitebit.com/private/http-trade-v4/#cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name whitebit#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.whitebit.com/private/http-trade-v4/#cancel-all-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] market type, ['swap', 'spot']
     * @param {boolean} [params.isMargin] cancel all margin orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name whitebit#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://docs.whitebit.com/private/http-trade-v4/#sync-kill-switch-timer
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.types] Order types value. Example: "spot", "margin", "futures" or null
     * @param {string} [params.symbol] symbol unified symbol of the market the order was made in
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<any>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name whitebit#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.whitebit.com/private/http-main-v4/#main-balance
     * @see https://docs.whitebit.com/private/http-trade-v4/#trading-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name whitebit#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.whitebit.com/private/http-trade-v4/#query-unexecutedactive-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name whitebit#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.whitebit.com/private/http-trade-v4/#query-executed-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderType(type: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name whitebit#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.whitebit.com/private/http-trade-v4/#query-executed-order-deals
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
     * @name whitebit#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.whitebit.com/private/http-main-v4/#get-fiat-deposit-address
     * @see https://docs.whitebit.com/private/http-main-v4/#get-cryptocurrency-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name whitebit#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.whitebit.com/private/http-trade-v4/#change-collateral-account-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name whitebit#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.whitebit.com/private/http-main-v4/#transfer-between-main-and-trade-balances
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from - main, spot, collateral
     * @param {string} toAccount account to transfer to - main, spot, collateral
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name whitebit#withdraw
     * @description make a withdrawal
     * @see https://docs.whitebit.com/private/http-main-v4/#create-withdraw-request
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    /**
     * @method
     * @name whitebit#fetchDeposit
     * @description fetch information on a deposit
     * @see https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history
     * @param {string} id deposit id
     * @param {string} code not used by whitebit fetchDeposit ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name whitebit#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.whitebit.com/private/http-main-v4/#get-depositwithdraw-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name whitebit#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://docs.whitebit.com/private/http-trade-v4/#open-positions
     * @param {string} code unified currency code
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name whitebit#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.whitebit.com/public/http-v4/#available-futures-markets-list
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name whitebit#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://docs.whitebit.com/public/http-v4/#available-futures-markets-list
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name whitebit#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://github.com/whitebit-exchange/api-docs/blob/main/pages/private/http-main-v4.md#get-depositwithdraw-history
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default = 50, Min: 1, Max: 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {number} [params.transactionMethod] Method. Example: 1 to display deposits / 2 to display withdraws. Do not send this parameter in order to receive both deposits and withdraws.
     * @param {string} [params.address] Can be used for filtering transactions by specific address or memo.
     * @param {string[]} [params.addresses] Can be used for filtering transactions by specific addresses or memos (max: 20).
     * @param {string} [params.uniqueId] Can be used for filtering transactions by specific unique id
     * @param {int} [params.offset] If you want the request to return entries starting from a particular line, you can use OFFSET clause to tell it where it should start. Default: 0, Min: 0, Max: 10000
     * @param {string[]} [params.status] Can be used for filtering transactions by status codes. Caution: You must use this parameter with appropriate transactionMethod and use valid status codes for this method. You can find them below. Example: "status": [3,7]
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    isFiat(currency: string): boolean;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
