import Exchange from './abstract/bitmart.js';
import type { Int, OrderSide, Balances, OrderType, OHLCV, Order, Str, Trade, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Market, TransferEntry, Num, TradingFeeInterface, Currencies, IsolatedBorrowRates, IsolatedBorrowRate, Dict, OrderRequest, int, FundingRate, DepositAddress, BorrowInterest, MarketInterface, FundingRateHistory, FundingHistory, LedgerEntry } from './base/types.js';
/**
 * @class bitmart
 * @augments Exchange
 */
export default class bitmart extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bitmart#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name bitmart#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<{
        status: any;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    fetchSpotMarkets(params?: {}): Promise<MarketInterface[]>;
    fetchContractMarkets(params?: {}): Promise<MarketInterface[]>;
    /**
     * @method
     * @name bitmart#fetchMarkets
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-contract-details
     * @description retrieves data on all markets for bitmart
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name bitmart#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    getCurrencyIdFromCodeAndNetwork(currencyCode: Str, networkCode: Str): Str;
    /**
     * @method
     * @name bitmart#fetchTransactionFee
     * @deprecated
     * @description please use fetchDepositWithdrawFee instead
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the network code of the currency
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTransactionFee(code: string, params?: {}): Promise<{
        info: any;
        withdraw: Dict;
        deposit: {};
    }>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: number;
            percentage: any;
        };
        deposit: {
            fee: any;
            percentage: any;
        };
        networks: {};
    };
    /**
     * @method
     * @name bitmart#fetchDepositWithdrawFee
     * @description fetch the fee for deposits and withdrawals
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the network code of the currency
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFee(code: string, params?: {}): Promise<any>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitmart#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developer-pro.bitmart.com/en/spot/#get-ticker-of-a-trading-pair-v3
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-contract-details
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bitmart#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://developer-pro.bitmart.com/en/spot/#get-ticker-of-all-pairs-v3
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-contract-details
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bitmart#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developer-pro.bitmart.com/en/spot/#get-depth-v3
     * @see https://developer-pro.bitmart.com/en/futures/#get-market-depth
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-market-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitmart#fetchTrades
     * @description get a list of the most recent trades for a particular symbol
     * @see https://developer-pro.bitmart.com/en/spot/#get-recent-trades-v3
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bitmart#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developer-pro.bitmart.com/en/spot/#get-history-k-line-v3
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-k-line
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp of the latest candle in ms
     * @param {boolean} [params.paginate] *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name bitmart#fetchMyTrades
     * @see https://developer-pro.bitmart.com/en/spot/#account-trade-list-v4-signed
     * @see https://developer-pro.bitmart.com/en/futures/#get-order-trade-keyed
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.marginMode] *spot* whether to fetch trades for margin orders or spot orders, defaults to spot orders (only isolated margin orders are supported)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitmart#fetchOrderTrades
     * @see https://developer-pro.bitmart.com/en/spot/#order-trade-list-v4-signed
     * @description fetch all the trades made from a single order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    customParseBalance(response: any, marketType: any): Balances;
    parseBalanceHelper(entry: any): import("./base/types.js").BalanceAccount;
    /**
     * @method
     * @name bitmart#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developer-pro.bitmart.com/en/spot/#get-spot-wallet-balance
     * @see https://developer-pro.bitmart.com/en/futures/#get-contract-assets-detail
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-contract-assets-keyed
     * @see https://developer-pro.bitmart.com/en/spot/#get-account-balance
     * @see https://developer-pro.bitmart.com/en/spot/#get-margin-account-details-isolated
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name bitmart#fetchTradingFee
     * @description fetch the trading fees for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderSide(side: any): string;
    parseOrderStatusByType(type: any, status: any): string;
    /**
     * @method
     * @name bitmart#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://developer-pro.bitmart.com/en/spot/#new-order-v2-signed
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitmart#createOrder
     * @description create a trade order
     * @see https://developer-pro.bitmart.com/en/spot/#new-order-v2-signed
     * @see https://developer-pro.bitmart.com/en/spot/#place-margin-order
     * @see https://developer-pro.bitmart.com/en/futures/#submit-order-signed
     * @see https://developer-pro.bitmart.com/en/futures/#submit-plan-order-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#submit-plan-order-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#submit-tp-or-sl-order-signed
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit' or 'trailing' for swap markets only
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @param {string} [params.leverage] *swap only* leverage level
     * @param {string} [params.clientOrderId] client order id of the order
     * @param {boolean} [params.reduceOnly] *swap only* reduce only
     * @param {boolean} [params.postOnly] make sure the order is posted to the order book and not matched immediately
     * @param {string} [params.triggerPrice] *swap only* the price to trigger a stop order
     * @param {int} [params.price_type] *swap only* 1: last price, 2: fair price, default is 1
     * @param {int} [params.price_way] *swap only* 1: price way long, 2: price way short
     * @param {int} [params.activation_price_type] *swap trailing order only* 1: last price, 2: fair price, default is 1
     * @param {string} [params.trailingPercent] *swap only* the percent to trail away from the current market price, min 0.1 max 5
     * @param {string} [params.trailingTriggerPrice] *swap only* the price to trigger a trailing order, default uses the price argument
     * @param {string} [params.stopLossPrice] *swap only* the price to trigger a stop-loss order
     * @param {string} [params.takeProfitPrice] *swap only* the price to trigger a take-profit order
     * @param {int} [params.plan_category] *swap tp/sl only* 1: tp/sl, 2: position tp/sl, default is 1
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitmart#createOrders
     * @description create a list of trade orders
     * @see https://developer-pro.bitmart.com/en/spot/#new-batch-order-v4-signed
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createSwapOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    createSpotOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name bitmart#cancelOrder
     * @description cancels an open order
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-order-signed
     * @see https://developer-pro.bitmart.com/en/spot/#cancel-order-v3-signed
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-plan-order-signed
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-plan-order-signed
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-order-signed
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-plan-order-signed
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] *spot only* the client order id of the order to cancel
     * @param {boolean} [params.trigger] *swap only* whether the order is a trigger order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitmart#cancelOrders
     * @description cancel multiple orders
     * @see https://developer-pro.bitmart.com/en/spot/#cancel-batch-order-v4-signed
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitmart#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://developer-pro.bitmart.com/en/spot/#cancel-all-orders
     * @see https://developer-pro.bitmart.com/en/spot/#new-batch-order-v4-signed
     * @see https://developer-pro.bitmart.com/en/futures/#cancel-all-orders-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#cancel-all-orders-signed
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] *spot only* 'buy' or 'sell'
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitmart#fetchOpenOrders
     * @see https://developer-pro.bitmart.com/en/spot/#current-open-orders-v4-signed
     * @see https://developer-pro.bitmart.com/en/futures/#get-all-open-orders-keyed
     * @see https://developer-pro.bitmart.com/en/futures/#get-all-current-plan-orders-keyed
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.marginMode] *spot* whether to fetch trades for margin orders or spot orders, defaults to spot orders (only isolated margin orders are supported)
     * @param {int} [params.until] *spot* the latest time in ms to fetch orders for
     * @param {string} [params.type] *swap* order type, 'limit' or 'market'
     * @param {string} [params.order_state] *swap* the order state, 'all' or 'partially_filled', default is 'all'
     * @param {string} [params.orderType] *swap only* 'limit', 'market', or 'trailing'
     * @param {boolean} [params.trailing] *swap only* set to true if you want to fetch trailing orders
     * @param {boolean} [params.trigger] *swap only* set to true if you want to fetch trigger orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitmart#fetchClosedOrders
     * @see https://developer-pro.bitmart.com/en/spot/#account-orders-v4-signed
     * @see https://developer-pro.bitmart.com/en/futures/#get-order-history-keyed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-order-history-keyed
     * @description fetches information on multiple closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry
     * @param {string} [params.marginMode] *spot only* 'cross' or 'isolated', for margin trading
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitmart#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitmart#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://developer-pro.bitmart.com/en/spot/#query-order-by-id-v4-signed
     * @see https://developer-pro.bitmart.com/en/spot/#query-order-by-clientorderid-v4-signed
     * @see https://developer-pro.bitmart.com/en/futures/#get-order-detail-keyed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-order-detail-keyed
     * @param {string} id the id of the order
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] *spot* fetch the order by client order id instead of order id
     * @param {string} [params.orderType] *swap only* 'limit', 'market', 'liquidate', 'bankruptcy', 'adl' or 'trailing'
     * @param {boolean} [params.trailing] *swap only* set to true if you want to fetch a trailing order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitmart#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://developer-pro.bitmart.com/en/spot/#deposit-address-keyed
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: any): DepositAddress;
    /**
     * @method
     * @name bitmart#withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the network name for this withdrawal
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    fetchTransactionsByType(type: any, code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bitmart#fetchDeposit
     * @description fetch information on a deposit
     * @param {string} id deposit id
     * @param {string} code not used by bitmart fetchDeposit ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name bitmart#fetchDeposits
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bitmart#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @param {string} id withdrawal id
     * @param {string} code not used by bitmart.fetchWithdrawal
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name bitmart#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name bitmart#repayIsolatedMargin
     * @description repay borrowed margin and interest
     * @see https://developer-pro.bitmart.com/en/spot/#margin-repay-isolated
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to repay
     * @param {string} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayIsolatedMargin(symbol: string, code: string, amount: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitmart#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://developer-pro.bitmart.com/en/spot/#margin-borrow-isolated
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to borrow
     * @param {string} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowIsolatedMargin(symbol: string, code: string, amount: number, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: string;
        currency: string;
        amount: any;
        symbol: any;
        timestamp: any;
        datetime: any;
        info: any;
    };
    /**
     * @method
     * @name bitmart#fetchIsolatedBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://developer-pro.bitmart.com/en/spot/#get-trading-pair-borrowing-rate-and-amount-keyed
     * @param {string} symbol unified symbol of the market to fetch the borrow rate for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [isolated borrow rate structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#isolated-borrow-rate-structure}
     */
    fetchIsolatedBorrowRate(symbol: string, params?: {}): Promise<IsolatedBorrowRate>;
    parseIsolatedBorrowRate(info: Dict, market?: Market): IsolatedBorrowRate;
    /**
     * @method
     * @name bitmart#fetchIsolatedBorrowRates
     * @description fetch the borrow interest rates of all currencies, currently only works for isolated margin
     * @see https://developer-pro.bitmart.com/en/spot/#get-trading-pair-borrowing-rate-and-amount-keyed
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [isolated borrow rate structures]{@link https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure}
     */
    fetchIsolatedBorrowRates(params?: {}): Promise<IsolatedBorrowRates>;
    /**
     * @method
     * @name bitmart#transfer
     * @description transfer currency internally between wallets on the same account, currently only supports transfer between spot and margin
     * @see https://developer-pro.bitmart.com/en/spot/#margin-asset-transfer-signed
     * @see https://developer-pro.bitmart.com/en/futures/#transfer-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#transfer-signed
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransferStatus(status: Str): Str;
    parseTransferToAccount(type: any): string;
    parseTransferFromAccount(type: any): string;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name bitmart#fetchTransfers
     * @description fetch a history of internal transfers made on an account, only transfers between spot and swap are supported
     * @see https://developer-pro.bitmart.com/en/futures/#get-transfer-list-signed
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.page] the required number of pages, default is 1, max is 1000
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name bitmart#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://developer-pro.bitmart.com/en/spot/#get-borrow-record-isolated
     * @param {string} code unified currency code
     * @param {string} symbol unified market symbol when fetch interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name bitmart#fetchOpenInterest
     * @description Retrieves the open interest of a currency
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-futures-openinterest
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name bitmart#setLeverage
     * @description set the level of leverage for a market
     * @see https://developer-pro.bitmart.com/en/futures/#submit-leverage-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#submit-leverage-signed
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'isolated' or 'cross'
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitmart#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-current-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name bitmart#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] not sent to exchange api, exchange api always returns the most recent data, only used to filter exchange response
     * @param {int} [limit] the maximum amount of funding rate structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name bitmart#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://developer-pro.bitmart.com/en/futures/#get-current-position-keyed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-current-position-risk-details-keyed
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    /**
     * @method
     * @name bitmart#fetchPositions
     * @description fetch all open contract positions
     * @see https://developer-pro.bitmart.com/en/futures/#get-current-position-keyed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-current-position-risk-details-keyed
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: Dict, market?: Market): import("./base/types.js").Position;
    /**
     * @method
     * @name bitmart#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://developer-pro.bitmart.com/en/futures/#get-order-history-keyed
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bitmart api endpoint
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): import("./base/types.js").Liquidation;
    /**
     * @method
     * @name bitmart#editOrder
     * @description edits an open order
     * @see https://developer-pro.bitmart.com/en/futuresv2/#modify-plan-order-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#modify-tp-sl-order-signed
     * @see https://developer-pro.bitmart.com/en/futuresv2/#modify-preset-plan-order-signed
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much you want to trade in units of the base currency
     * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.triggerPrice] *swap only* the price to trigger a stop order
     * @param {string} [params.stopLossPrice] *swap only* the price to trigger a stop-loss order
     * @param {string} [params.takeProfitPrice] *swap only* the price to trigger a take-profit order
     * @param {string} [params.stopLoss.triggerPrice] *swap only* the price to trigger a preset stop-loss order
     * @param {string} [params.takeProfit.triggerPrice] *swap only* the price to trigger a preset take-profit order
     * @param {string} [params.clientOrderId] client order id of the order
     * @param {int} [params.price_type] *swap only* 1: last price, 2: fair price, default is 1
     * @param {int} [params.plan_category] *swap tp/sl only* 1: tp/sl, 2: position tp/sl, default is 1
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitmart#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-transaction-history-keyed
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @returns {object[]} a list of [ledger structures]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: any): string;
    fetchTransactionsRequest(flowType?: Int, symbol?: Str, since?: Int, limit?: Int, params?: {}): any;
    /**
     * @method
     * @name bitmart#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://developer-pro.bitmart.com/en/futuresv2/#get-transaction-history-keyed
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the starting timestamp in milliseconds
     * @param {int} [limit] the number of entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch funding history for
     * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingHistory(contract: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number;
        datetime: string;
        id: string;
        amount: number;
    };
    parseFundingHistories(contracts: any, market?: any, since?: Int, limit?: Int): FundingHistory[];
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
