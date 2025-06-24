import Exchange from './abstract/bitopro.js';
import type { Balances, Currencies, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFees, Transaction, int } from './base/types.js';
/**
 * @class bitopro
 * @augments Exchange
 */
export default class bitopro extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bitopro#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_currency_info.md
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name bitopro#fetchMarkets
     * @description retrieves data on all markets for bitopro
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_trading_pair_info.md
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitopro#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_ticker_data.md
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bitopro#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_ticker_data.md
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bitopro#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_orderbook_data.md
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitopro#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_trades_data.md
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitopro#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_limitations_and_fees.md
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bitopro#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_ohlc_data.md
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    insertMissingCandles(candles: any, distance: any, since: any, limit: any): any;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bitopro#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_account_balance.md
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name bitopro#createOrder
     * @description create a trade order
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/create_an_order.md
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.triggerPrice] the price at which a trigger order is triggered at
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitopro#cancelOrder
     * @description cancels an open order
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/cancel_an_order.md
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseCancelOrders(data: any): any[];
    /**
     * @method
     * @name bitopro#cancelOrders
     * @description cancel multiple orders
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/cancel_batch_orders.md
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitopro#cancelAllOrders
     * @description cancel all open orders
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/cancel_all_orders.md
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitopro#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_an_order_data.md
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitopro#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_orders_data.md
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitopro#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_open_orders_data.md
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitopro#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_orders_data.md
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitopro#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_trades_data.md
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name bitopro#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_deposit_invoices_data.md
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bitopro#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_withdraw_invoices_data.md
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bitopro#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/get_an_withdraw_invoice_data.md
     * @param {string} id withdrawal id
     * @param {string} code unified currency code of the currency withdrawn, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name bitopro#withdraw
     * @description make a withdrawal
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/private/create_an_withdraw_invoice.md
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: number;
            percentage: boolean;
        };
        deposit: {
            fee: any;
            percentage: any;
        };
        networks: {};
    };
    /**
     * @method
     * @name bitopro#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://github.com/bitoex/bitopro-offical-api-docs/blob/master/api/v3/public/get_currency_info.md
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
