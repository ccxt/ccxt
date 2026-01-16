import Exchange from './abstract/foxbit.js';
import type { Balances, Currencies, Currency, DepositAddress, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction, int } from './base/types.js';
/**
 * @class foxbit
 * @augments Exchange
 */
export default class foxbit extends Exchange {
    describe(): any;
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name foxbit#fetchMarkets
     * @description Retrieves data on all markets for foxbit.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_index
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name foxbit#fetchTicker
     * @description Get last 24 hours ticker information, in real-time, for given market.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name foxbit#fetchTickers
     * @description Retrieve the ticker data of all markets.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name foxbit#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Member-Info/operation/MembersController_listTradingFees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name foxbit#fetchOrderBook
     * @description Exports a copy of the order book of a specific market.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_findOrderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return, the maximum is 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name foxbit#fetchTrades
     * @description Retrieve the trades of a specific market.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_publicTrades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name foxbit#fetchOHLCV
     * @description Fetch historical candlestick data containing the open, high, low, and close price, and the volume of a market.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Market-Data/operation/MarketsController_findCandlesticks
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name foxbit#fetchBalance
     * @description Query for balance and get the amount of funds available for trading or funds locked in orders.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Account/operation/AccountsController_all
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name foxbit#fetchOpenOrders
     * @description Fetch all unfilled currently open orders.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_listOrders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name foxbit#fetchClosedOrders
     * @description Fetch all currently closed orders.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_listOrders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByStatus(status: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name foxbit#createOrder
     * @description Create an order with the specified characteristics
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_create
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'stop_market', 'stop_limit', 'instant'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "FOK", "IOC", "PO"
     * @param {float} [params.triggerPrice] The time in force for the order. One of GTC, FOK, IOC, PO. See .features or foxbit's doc to see more details.
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {string} [params.clientOrderId] a unique identifier for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name foxbit#createOrders
     * @description create a list of trade orders
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/createBatch
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name foxbit#cancelOrder
     * @description Cancel open orders.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_cancel
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name foxbit#cancelAllOrders
     * @description Cancel all open orders or all open orders for a specific market.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_cancel
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name foxbit#fetchOrder
     * @description Get an order by ID.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_findByOrderId
     * @param id
     * @param {string} symbol it is not used in the foxbit API
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name foxbit#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_listOrders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.state] Enum: ACTIVE, CANCELED, FILLED, PARTIALLY_CANCELED, PARTIALLY_FILLED
     * @param {string} [params.side] Enum: BUY, SELL
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name foxbit#fetchMyTrades
     * @description Trade history queries will only have data available for the last 3 months, in descending order (most recents trades first).
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/TradesController_all
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name foxbit#fetchDepositAddress
     * @description Fetch the deposit address for a currency associated with this account.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Deposit/operation/DepositsController_depositAddress
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.networkCode] the blockchain network to create a deposit address on
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name foxbit#fetchDeposits
     * @description Fetch all deposits made to an account.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Deposit/operation/DepositsController_listOrders
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name foxbit#fetchWithdrawals
     * @description Fetch all withdrawals made from an account.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Withdrawal/operation/WithdrawalsController_listWithdrawals
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name foxbit#fetchTransactions
     * @description Fetch all transactions (deposits and withdrawals) made from an account.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Withdrawal/operation/WithdrawalsController_listWithdrawals
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Deposit/operation/DepositsController_listOrders
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchTransactions(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name foxbit#fetchStatus
     * @description The latest known information on the availability of the exchange API.
     * @see https://status.foxbit.com/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: string;
        eta: any;
        url: any;
        info: any;
    }>;
    /**
     * @method
     * @name foxbit#editOrder
     * @description Simultaneously cancel an existing order and create a new one.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Trading/operation/OrdersController_cancelReplace
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders, used as stop_price on stop market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name foxbit#withdraw
     * @description Make a withdrawal.
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Withdrawal/operation/WithdrawalsController_createWithdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name foxbit#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
     * @see https://docs.foxbit.com.br/rest/v3/#tag/Account/operation/AccountsController_getTransactions
     * @param {string} code unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entrys to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-structure}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").LedgerEntry[]>;
    parseMarket(market: Dict): Market;
    parseTradingFee(entry: Dict, market?: Market): TradingFeeInterface;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    parseTrade(trade: any, market?: any): Trade;
    parseOrderStatus(status: Str): string;
    parseOrder(order: any, market?: any): Order;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        address: string;
        tag: string;
        currency: string;
        network: string;
        info: any;
    };
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: any, currency?: Currency, since?: Int, limit?: Int): Transaction;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): {
        id: string;
        info: Dict;
        timestamp: number;
        datetime: string;
        direction: string;
        account: any;
        referenceId: any;
        referenceAccount: any;
        type: string;
        currency: string;
        amount: number;
        before: number;
        after: number;
        status: string;
        fee: {
            cost: number;
            currency: string;
        };
    };
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
