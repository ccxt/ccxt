import Exchange from './abstract/bigone.js';
import type { TransferEntry, Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, Currencies, Dict, int, DepositAddress } from './base/types.js';
/**
 * @class bigone
 * @augments Exchange
 */
export default class bigone extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bigone#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {dict} [params] extra parameters specific to the exchange API endpoint
     * @returns {dict} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name bigone#fetchMarkets
     * @description retrieves data on all markets for bigone
     * @see https://open.big.one/docs/spot_asset_pair.html
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bigone#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://open.big.one/docs/spot_tickers.html
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bigone#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://open.big.one/docs/spot_tickers.html
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bigone#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://open.big.one/docs/spot_ping.html
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<number>;
    /**
     * @method
     * @name bigone#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://open.big.one/docs/contract_misc.html#get-orderbook-snapshot
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseContractBidsAsks(bidsAsks: any): any[];
    parseContractOrderBook(orderbook: object, symbol: string, limit?: Int): OrderBook;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bigone#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://open.big.one/docs/spot_asset_pair_trade.html
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
     * @name bigone#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://open.big.one/docs/spot_asset_pair_candle.html
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bigone#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://open.big.one/docs/fund_accounts.html
     * @see https://open.big.one/docs/spot_accounts.html
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseType(type: string): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name bigone#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://open.big.one/docs/spot_orders.html#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bigone#createOrder
     * @description create a trade order
     * @see https://open.big.one/docs/spot_orders.html#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.operator] *stop order only* GTE or LTE (default)
     * @param {string} [params.client_order_id] must match ^[a-zA-Z0-9-_]{1,36}$ this regex. client_order_id is unique in 24 hours, If created 24 hours later and the order closed, it will be released and can be reused
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bigone#cancelOrder
     * @description cancels an open order
     * @see https://open.big.one/docs/spot_orders.html#cancel-order
     * @param {string} id order id
     * @param {string} symbol Not used by bigone cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bigone#cancelAllOrders
     * @description cancel all open orders
     * @see https://open.big.one/docs/spot_orders.html#cancel-all-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any[]>;
    /**
     * @method
     * @name bigone#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://open.big.one/docs/spot_orders.html#get-one-order
     * @param {string} id the order id
     * @param {string} symbol not used by bigone fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bigone#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://open.big.one/docs/spot_orders.html#get-user-orders-in-one-asset-pair
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bigone#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://open.big.one/docs/spot_trade.html#trades-of-user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOrderStatus(status: Str): string;
    /**
     * @method
     * @name bigone#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://open.big.one/docs/spot_orders.html#get-user-orders-in-one-asset-pair
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bigone#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://open.big.one/docs/spot_orders.html#get-user-orders-in-one-asset-pair
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    nonce(): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    /**
     * @method
     * @name bigone#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://open.big.one/docs/spot_deposit.html#get-deposite-address-of-one-asset-of-user
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name bigone#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://open.big.one/docs/spot_deposit.html#deposit-of-user
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bigone#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://open.big.one/docs/spot_withdrawal.html#get-withdrawals-of-user
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bigone#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://open.big.one/docs/spot_transfer.html#transfer-of-user
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'SPOT', 'FUND', or 'CONTRACT'
     * @param {string} toAccount 'SPOT', 'FUND', or 'CONTRACT'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    /**
     * @method
     * @name bigone#withdraw
     * @description make a withdrawal
     * @see https://open.big.one/docs/spot_withdrawal.html#create-withdrawal-of-user
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
