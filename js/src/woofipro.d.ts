import Exchange from './abstract/woofipro.js';
import type { Balances, Currency, FundingRateHistory, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Trade, Transaction, Leverage, Currencies, TradingFees, OrderRequest, Dict, int, LedgerEntry, FundingRate, FundingRates, Position } from './base/types.js';
/**
 * @class woofipro
 * @augments Exchange
 */
export default class woofipro extends Exchange {
    describe(): any;
    setSandboxMode(enable: boolean): void;
    /**
     * @method
     * @name woofipro#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-system-maintenance-status
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
     * @name woofipro#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-system-maintenance-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name woofipro#fetchMarkets
     * @description retrieves data on all markets for woofipro
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-available-symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name woofipro#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-token-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseTokenAndFeeTemp(item: any, feeTokenKey: any, feeAmountKey: any): any;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name woofipro#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-market-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseFundingRate(fundingRate: any, market?: Market): FundingRate;
    parseFundingInterval(interval: any): string;
    /**
     * @method
     * @name woofipro#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-predicted-funding-rate-for-one-market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingInterval(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name woofipro#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-predicted-funding-rate-for-one-market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name woofipro#fetchFundingRates
     * @description fetch the current funding rate for multiple markets
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-predicted-funding-rates-for-all-markets
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name woofipro#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/public/get-funding-rate-history-for-one-market
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
     * @name woofipro#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-account-information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name woofipro#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/orderbook-snapshot
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name woofipro#fetchOHLCV
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-kline
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms)))
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseTimeInForce(timeInForce: Str): string;
    parseOrderStatus(status: Str): string;
    parseOrderType(type: Str): string;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name woofipro#createOrder
     * @description create a trade order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/create-order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/create-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.algoType] 'STOP'or 'TP_SL' or 'POSITIONAL_TP_SL'
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name woofipro#createOrders
     * @description *contract only* create a list of trade orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/batch-create-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name woofipro#editOrder
     * @description edit a trade order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/edit-order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/edit-algo-order
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
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name woofipro#cancelOrder
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-order-by-client_order_id
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-algo-order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-algo-order-by-client_order_id
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name woofipro#cancelOrders
     * @description cancel multiple orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/batch-cancel-orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/batch-cancel-orders-by-client_order_id
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.client_order_ids] max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name woofipro#cancelAllOrders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-all-pending-algo-orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/cancel-orders-in-bulk
     * @description cancel all open orders in a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<{
        info: any;
    }[]>;
    /**
     * @method
     * @name woofipro#fetchOrder
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-order-by-order_id
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-order-by-client_order_id
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-algo-order-by-order_id
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-algo-order-by-client_order_id
     * @description fetches information on an order made by the user
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name woofipro#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-algo-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @param {boolean} [params.is_triggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @param {int} params.until timestamp in ms of the latest order to fetch
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name woofipro#fetchOpenOrders
     * @description fetches information on multiple orders made by the user
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-algo-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @param {boolean} [params.is_triggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {int} params.until timestamp in ms of the latest order to fetch
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name woofipro#fetchClosedOrders
     * @description fetches information on multiple orders made by the user
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-algo-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a stop/algo order
     * @param {boolean} [params.is_triggered] whether the order has been triggered (false by default)
     * @param {string} [params.side] 'buy' or 'sell'
     * @param {int} params.until timestamp in ms of the latest order to fetch
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name woofipro#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-all-trades-of-specific-order
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
     * @name woofipro#fetchMyTrades
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-trades
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch trades with pagination
     * @param {int} params.until timestamp in ms of the latest trade to fetch
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name woofipro#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-current-holding
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    getAssetHistoryRows(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: any): string;
    /**
     * @method
     * @name woofipro#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-asset-history
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    /**
     * @method
     * @name woofipro#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-asset-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name woofipro#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-asset-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name woofipro#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-asset-history
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    getWithdrawNonce(params?: {}): Promise<number>;
    hashMessage(message: any): string;
    signHash(hash: any, privateKey: any): string;
    signMessage(message: any, privateKey: any): string;
    /**
     * @method
     * @name woofipro#withdraw
     * @description make a withdrawal
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/create-withdraw-request
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseLeverage(leverage: any, market?: any): Leverage;
    /**
     * @method
     * @name woofipro#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-account-information
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name woofipro#setLeverage
     * @description set the level of leverage for a market
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/update-leverage-setting
     * @param {int} [leverage] the rate of leverage
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name woofipro#fetchPosition
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-one-position-info
     * @description fetch data on an open position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: Str, params?: {}): Promise<Position>;
    /**
     * @method
     * @name woofipro#fetchPositions
     * @description fetch all open positions
     * @see https://orderly.network/docs/build-on-evm/evm-api/restful-api/private/get-all-positions-info
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    nonce(): number;
    sign(path: any, section?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
