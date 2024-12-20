import Exchange from './abstract/bitfinex1.js';
import type { TransferEntry, Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, TradingFees, Dict, int, DepositAddress } from './base/types.js';
/**
 * @class bitfinex1
 * @augments Exchange
 */
export default class bitfinex1 extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bitfinex#fetchTransactionFees
     * @deprecated
     * @description please use fetchDepositWithdrawFees instead
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-fees
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTransactionFees(codes?: Strings, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name bitfinex#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-fees
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        withdraw: {
            fee: number;
            percentage: any;
        };
        deposit: {
            fee: any;
            percentage: any;
        };
        networks: {};
        info: any;
    };
    /**
     * @method
     * @name bitfinex#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name bitfinex#fetchMarkets
     * @description retrieves data on all markets for bitfinex
     * @see https://docs.bitfinex.com/v1/reference/rest-public-symbols
     * @see https://docs.bitfinex.com/v1/reference/rest-public-symbol-details
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    amountToPrecision(symbol: any, amount: any): string;
    priceToPrecision(symbol: any, price: any): string;
    /**
     * @method
     * @name bitfinex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-wallet-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name bitfinex#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-transfer-between-wallets
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    convertDerivativesId(currencyId: any, type: any): any;
    /**
     * @method
     * @name bitfinex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.bitfinex.com/v1/reference/rest-public-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name bitfinex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bitfinex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.bitfinex.com/v1/reference/rest-public-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitfinex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.bitfinex.com/v1/reference/rest-public-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitfinex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-past-trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitfinex#createOrder
     * @description create a trade order
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-new-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitfinex#cancelOrder
     * @description cancels an open order
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-cancel-order
     * @param {string} id order id
     * @param {string} symbol not used by bitfinex cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitfinex#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-cancel-all-orders
     * @param {string} symbol not used by bitfinex cancelAllOrders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from exchange
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name bitfinex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-active-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitfinex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-orders-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitfinex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-order-status
     * @param {string} id the order id
     * @param {string} symbol not used by bitfinex fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bitfinex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.bitfinex.com/reference/rest-public-candles#aggregate-funding-currency-candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    getCurrencyName(code: any): any;
    /**
     * @method
     * @name bitfinex#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-deposit
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name bitfinex#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-deposit
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name bitfinex#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-deposit-withdrawal-history
     * @param {string} code unified currency code for the currency of the deposit/withdrawals
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
     * @name bitfinex#withdraw
     * @description make a withdrawal
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-withdrawal
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
     * @name bitfinex#fetchPositions
     * @description fetch all open positions
     * @see https://docs.bitfinex.com/v1/reference/rest-auth-active-positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<any>;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
