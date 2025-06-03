import Exchange from './abstract/alpaca.js';
import type { Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Trade, int, Strings, Ticker, Tickers, Currency, DepositAddress, Transaction, Balances } from './base/types.js';
/**
 * @class alpaca
 * @augments Exchange
 */
export default class alpaca extends Exchange {
    describe(): any;
    /**
     * @method
     * @name alpaca#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name alpaca#fetchMarkets
     * @description retrieves data on all markets for alpaca
     * @see https://docs.alpaca.markets/reference/get-v2-assets
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(asset: any): Market;
    /**
     * @method
     * @name alpaca#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.alpaca.markets/reference/cryptotrades
     * @see https://docs.alpaca.markets/reference/cryptolatesttrades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @param {string} [params.method] method, default: marketPublicGetV1beta3CryptoLocTrades
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name alpaca#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.alpaca.markets/reference/cryptolatestorderbooks
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name alpaca#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.alpaca.markets/reference/cryptobars
     * @see https://docs.alpaca.markets/reference/cryptolatestbars
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the alpha api endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @param {string} [params.method] method, default: marketPublicGetV1beta3CryptoLocBars
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name alpaca#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.alpaca.markets/reference/cryptosnapshots-1
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name alpaca#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.alpaca.markets/reference/cryptosnapshots-1
     * @param {string[]} symbols unified symbols of the markets to fetch tickers for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    generateClientOrderId(params: any): string;
    /**
     * @method
     * @name alpaca#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @see https://docs.alpaca.markets/reference/postorder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketOrderWithCost(symbol: string, side: OrderSide, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name alpaca#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://docs.alpaca.markets/reference/postorder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name alpaca#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://docs.alpaca.markets/reference/postorder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name alpaca#createOrder
     * @description create a trade order
     * @see https://docs.alpaca.markets/reference/postorder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit' or 'stop_limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {float} [params.cost] *market orders only* the cost of the order in units of the quote currency
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name alpaca#cancelOrder
     * @description cancels an open order
     * @see https://docs.alpaca.markets/reference/deleteorderbyorderid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name alpaca#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://docs.alpaca.markets/reference/deleteallorders
     * @param {string} symbol alpaca cancelAllOrders cannot setting symbol, it will cancel all open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name alpaca#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.alpaca.markets/reference/getorderbyorderid
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name alpaca#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.alpaca.markets/reference/getallorders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name alpaca#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.alpaca.markets/reference/getallorders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name alpaca#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.alpaca.markets/reference/getallorders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name alpaca#editOrder
     * @description edit a trade order
     * @see https://docs.alpaca.markets/reference/patchorderbyorderid-1
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market to create an order in
     * @param {string} [type] 'market', 'limit' or 'stop_limit'
     * @param {string} [side] 'buy' or 'sell'
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price for the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.triggerPrice] the price to trigger a stop order
     * @param {string} [params.timeInForce] for crypto trading either 'gtc' or 'ioc' can be used
     * @param {string} [params.clientOrderId] a unique identifier for the order, automatically generated if not sent
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseTimeInForce(timeInForce: Str): string;
    /**
     * @method
     * @name alpaca#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.alpaca.markets/reference/getaccountactivitiesbyactivitytype-1
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {string} [params.page_token] page_token - used for paging
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name alpaca#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.alpaca.markets/reference/listcryptofundingwallets
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name alpaca#withdraw
     * @description make a withdrawal
     * @see https://docs.alpaca.markets/reference/createcryptotransferforaccount
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag a memo for the transaction
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    fetchTransactionsHelper(type: any, code: any, since: any, limit: any, params: any): Promise<Transaction[]>;
    /**
     * @method
     * @name alpaca#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.alpaca.markets/reference/listcryptofundingtransfers
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name alpaca#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.alpaca.markets/reference/listcryptofundingtransfers
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name alpaca#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.alpaca.markets/reference/listcryptofundingtransfers
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    parseTransactionType(type: any): string;
    /**
     * @method
     * @name alpaca#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.alpaca.markets/reference/getaccount-1
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
