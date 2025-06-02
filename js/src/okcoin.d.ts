import Exchange from './abstract/okcoin.js';
import type { TransferEntry, Balances, Currency, Int, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, Num, Currencies, Dict, int, LedgerEntry, DepositAddress } from './base/types.js';
/**
 * @class okcoin
 * @augments Exchange
 */
export default class okcoin extends Exchange {
    describe(): any;
    /**
     * @method
     * @name okcoin#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name okcoin#fetchMarkets
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-public-data-get-instruments
     * @description retrieves data on all markets for okcoin
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name okcoin#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name okcoin#fetchOrderBook
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-order-book
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name okcoin#fetchTicker
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-ticker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name okcoin#fetchTickers
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-tickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name okcoin#fetchTrades
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-trades
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-trades-history
     * @description get the list of most recent trades for a particular symbol
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
     * @name okcoin#fetchOHLCV
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-candlesticks
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-market-data-get-candlesticks-history
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseAccountBalance(response: any): Balances;
    /**
     * @method
     * @name okcoin#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseTradingBalance(response: any): Balances;
    parseFundingBalance(response: any): Balances;
    /**
     * @method
     * @name okcoin#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name okcoin#createOrder
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-place-order
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-place-algo-order
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-place-multiple-orders
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-advance-algo-order
     * @description create a trade order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} price the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.reduceOnly] MARGIN orders only, or swap/future orders in net mode
     * @param {bool} [params.postOnly] true to place a post only order
     * @param {float} [params.triggerPrice] conditional orders only, the price at which the order is to be triggered
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {float} [params.takeProfit.price] used for take profit limit orders, not used for take profit market price orders
     * @param {string} [params.takeProfit.type] 'market' or 'limit' used to specify the take profit price type
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.stopLoss.price] used for stop loss limit orders, not used for stop loss market price orders
     * @param {string} [params.stopLoss.type] 'market' or 'limit' used to specify the stop loss price type
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name okcoin#cancelOrder
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-order
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-algo-order
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-advance-algo-order
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if cancel trigger or conditional orders
     * @param {bool} [params.advanced] True if canceling advanced orders only
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    parseIds(ids: any): any;
    /**
     * @method
     * @name okcoin#cancelOrders
     * @description cancel multiple orders
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-multiple-orders
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-algo-order
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-cancel-advance-algo-order
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name okcoin#fetchOrder
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-order-details
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-algo-order-list
     * @description fetches information on an order made by the user
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name okcoin#fetchOpenOrders
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-order-list
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-algo-order-list
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if fetching trigger or conditional orders
     * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name okcoin#fetchClosedOrders
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-algo-order-history
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-order-history-last-3-months
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-order-history-last-7-days
     * @description fetches information on multiple closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if fetching trigger or conditional orders
     * @param {string} [params.ordType] "conditional", "oco", "trigger", "move_order_stop", "iceberg", or "twap"
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name okcoin#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name okcoin#fetchDepositAddressesByNetwork
     * @description fetch a dictionary of addresses for a currency, indexed by network
     * @see https://www.okx.com/docs-v5/en/#funding-account-rest-api-get-deposit-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
     */
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    /**
     * @method
     * @name okcoin#transfer
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-funds-transfer
     * @description transfer currency internally between wallets on the same account
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
    /**
     * @method
     * @name okcoin#withdraw
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-withdrawal
     * @description make a withdrawal
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
     * @name okcoin#fetchDeposits
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-get-deposit-history
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
     * @name okcoin#fetchWithdrawals
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-get-withdrawal-history
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
     * @name okcoin#fetchMyTrades
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-transaction-details-last-3-days
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-trade-get-transaction-details-last-3-months
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name okcoin#fetchOrderTrades
     * @description fetch all the trades made from a single order
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
     * @name okcoin#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-funding-asset-bills-details
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-account-get-bills-details-last-7-days
     * @see https://www.okcoin.com/docs-v5/en/#rest-api-account-get-bills-details-last-3-months
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    parseBalanceByType(type: any, response: any): Balances;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
