import Exchange from './abstract/lbank.js';
import type { Balances, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction, int, DepositAddress, FundingRates, FundingRate } from './base/types.js';
/**
 * @class lbank
 * @augments Exchange
 */
export default class lbank extends Exchange {
    describe(): any;
    /**
     * @method
     * @name lbank#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.lbank.com/en-US/docs/index.html#get-timestamp
     * @see https://www.lbank.com/en-US/docs/contract.html#get-the-current-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<number>;
    /**
     * @method
     * @name lbank#fetchMarkets
     * @description retrieves data on all markets for lbank
     * @see https://www.lbank.com/en-US/docs/index.html#trading-pairs
     * @see https://www.lbank.com/en-US/docs/contract.html#query-contract-information-list
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchSpotMarkets(params?: {}): Promise<any[]>;
    fetchSwapMarkets(params?: {}): Promise<any[]>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name lbank#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.lbank.com/en-US/docs/index.html#query-current-market-data-new
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name lbank#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.lbank.com/en-US/docs/index.html#query-current-market-data-new
     * @see https://www.lbank.com/en-US/docs/contract.html#query-contract-market-list
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name lbank#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.lbank.com/en-US/docs/index.html#query-market-depth
     * @see https://www.lbank.com/en-US/docs/contract.html#get-handicap
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name lbank#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.lbank.com/en-US/docs/index.html#query-historical-transactions
     * @see https://www.lbank.com/en-US/docs/index.html#recent-transactions-list
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
     * @name lbank#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.lbank.com/en-US/docs/index.html#query-k-bar-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    parseFundingRate(ticker: any, market?: Market): FundingRate;
    /**
     * @method
     * @name lbank#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.lbank.com/en-US/docs/contract.html#query-contract-market-list
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name lbank#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://www.lbank.com/en-US/docs/contract.html#query-contract-market-list
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name lbank#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.lbank.com/en-US/docs/index.html#asset-information
     * @see https://www.lbank.com/en-US/docs/index.html#account-information
     * @see https://www.lbank.com/en-US/docs/index.html#get-all-coins-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name lbank#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.lbank.com/en-US/docs/index.html#transaction-fee-rate-query
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name lbank#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://www.lbank.com/en-US/docs/index.html#transaction-fee-rate-query
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name lbank#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.lbank.com/en-US/docs/index.html#place-order
     * @see https://www.lbank.com/en-US/docs/index.html#place-an-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name lbank#createOrder
     * @description create a trade order
     * @see https://www.lbank.com/en-US/docs/index.html#place-order
     * @see https://www.lbank.com/en-US/docs/index.html#place-an-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name lbank#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.lbank.com/en-US/docs/index.html#query-order
     * @see https://www.lbank.com/en-US/docs/index.html#query-order-new
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderSupplement(id: string, symbol?: Str, params?: {}): Promise<Order>;
    fetchOrderDefault(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name lbank#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://www.lbank.com/en-US/docs/index.html#past-transaction-details
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name lbank#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://www.lbank.com/en-US/docs/index.html#query-all-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name lbank#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.lbank.com/en-US/docs/index.html#current-pending-order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name lbank#cancelOrder
     * @description cancels an open order
     * @see https://www.lbank.com/en-US/docs/index.html#cancel-order-new
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name lbank#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://www.lbank.com/en-US/docs/index.html#cancel-all-pending-orders-for-a-single-trading-pair
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    getNetworkCodeForCurrency(currencyCode: any, params: any): string;
    /**
     * @method
     * @name lbank#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.lbank.com/en-US/docs/index.html#get-deposit-address
     * @see https://www.lbank.com/en-US/docs/index.html#the-user-obtains-the-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    fetchDepositAddressDefault(code: string, params?: {}): Promise<DepositAddress>;
    fetchDepositAddressSupplement(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name lbank#withdraw
     * @description make a withdrawal
     * @see https://www.lbank.com/en-US/docs/index.html#withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: any, type: any): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name lbank#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.lbank.com/en-US/docs/index.html#get-recharge-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name lbank#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.lbank.com/en-US/docs/index.html#get-withdrawal-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name lbank#fetchTransactionFees
     * @deprecated
     * @description please use fetchDepositWithdrawFees instead
     * @param {string[]|undefined} codes not used by lbank fetchTransactionFees ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTransactionFees(codes?: Strings, params?: {}): Promise<any>;
    fetchPrivateTransactionFees(params?: {}): Promise<{
        withdraw: Dict;
        deposit: {};
        info: any;
    }>;
    fetchPublicTransactionFees(params?: {}): Promise<{
        withdraw: Dict;
        deposit: {};
        info: any;
    }>;
    /**
     * @method
     * @name lbank#fetchDepositWithdrawFees
     * @description when using private endpoint, only returns information for currencies with non-zero balance, use public method by specifying this.options['fetchDepositWithdrawFees']['method'] = 'fetchPublicDepositWithdrawFees'
     * @see https://www.lbank.com/en-US/docs/index.html#get-all-coins-information
     * @see https://www.lbank.com/en-US/docs/index.html#withdrawal-configurations
     * @param {string[]} [codes] array of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    fetchPrivateDepositWithdrawFees(codes?: any, params?: {}): Promise<any>;
    fetchPublicDepositWithdrawFees(codes?: any, params?: {}): Promise<Dict>;
    parsePublicDepositWithdrawFees(response: any, codes?: any): Dict;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    convertSecretToPem(secret: any): string;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
