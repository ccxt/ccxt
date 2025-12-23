import Exchange from './abstract/hibachi.js';
import type { Balances, Currencies, Dict, Market, Str, Ticker, Trade, Int, Num, OrderSide, OrderType, OrderBook, TradingFees, Transaction, DepositAddress, OHLCV, Order, LedgerEntry, Currency, int, Position, Strings, FundingRate, FundingRateHistory, OrderRequest } from './base/types.js';
/**
 * @class hibachi
 * @augments Exchange
 */
export default class hibachi extends Exchange {
    describe(): any;
    getAccountId(): number;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name hibachi#fetchMarkets
     * @description retrieves data on all markets for hibachi
     * @see https://api-doc.hibachi.xyz/#183981da-8df5-40a0-a155-da15015dd536
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    hardcodedCurrencies(): Currencies;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name hibachi#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name hibachi#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-doc.hibachi.xyz/#86a53bc1-d3bb-4b93-8a11-7034d4698caa
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (maximum value is 100)
     * @param {object} [params] extra parameters specific to the hibachi api endpoint
     * @returns {object[]} a list of recent [trade structures]
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name hibachi#fetchTicker
     * @see https://api-doc.hibachi.xyz/#4abb30c4-e5c7-4b0f-9ade-790111dbfa47
     * @description fetches a price ticker and the related information for the past 24h
     * @param {string} symbol unified symbol of the market
     * @param {object} [params] extra parameters specific to the hibachi api endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: Str, params?: {}): Promise<Ticker>;
    parseOrderStatus(status: string): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name hibachi#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-doc.hibachi.xyz/#096a8854-b918-4de8-8731-b2a28d26b96d
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hibachi#fetchTradingFees
     * @description fetch the trading fee
     * @param params extra parameters
     * @returns {object} a map of market symbols to [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    orderMessage(market: any, nonce: number, feeRate: number, type: OrderType, side: OrderSide, amount: number, price?: Num): Uint8Array;
    createOrderRequest(nonce: number, symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name hibachi#createOrder
     * @description create a trade order
     * @see https://api-doc.hibachi.xyz/#00f6d5ad-5275-41cb-a1a8-19ed5d142124
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hibachi#createOrders
     * @description *contract only* create a list of trade orders
     * @see https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    editOrderRequest(nonce: number, id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): any;
    /**
     * @method
     * @name hibachi#editOrder
     * @description edit a limit order that is not matched
     * @see https://api-doc.hibachi.xyz/#94d2cdaf-1c71-440f-a981-da1112824810
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type must be 'limit'
     * @param {string} side 'buy' or 'sell', should stay the same with original side
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hibachi#editOrders
     * @description edit a list of trade orders
     * @see https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4
     * @param {Array} orders list of orders to edit, each object should contain the parameters required by editOrder, namely id, symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    cancelOrderRequest(id: string): {
        orderId: string;
        signature: any;
    };
    /**
     * @method
     * @name hibachi#cancelOrder
     * @see https://api-doc.hibachi.xyz/#e99c4f48-e610-4b7c-b7f6-1b4bb7af0271
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol is unused
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hibachi#cancelOrders
     * @description cancel multiple orders
     * @see https://api-doc.hibachi.xyz/#c2840b9b-f02c-44ed-937d-dc2819f135b4
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol, unused
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name hibachi#cancelAllOrders
     * @see https://api-doc.hibachi.xyz/#8ed24695-016e-49b2-a72d-7511ca921fee
     * @description cancel all open orders in a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    encodeWithdrawMessage(amount: number, maxFees: number, address: string): Uint8Array;
    /**
     * @method
     * @name hibachi#withdraw
     * @description make a withdrawal
     * @see https://api-doc.hibachi.xyz/#6421625d-3e45-45fa-be9b-d2a0e780c090
     * @param {string} code unified currency code, only support USDT
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    nonce(): number;
    signMessage(message: any, privateKey: any): any;
    /**
     * @method
     * @name hibachi#fetchOrderBook
     * @description fetches the state of the open orders on the orderbook
     * @see https://api-doc.hibachi.xyz/#4abb30c4-e5c7-4b0f-9ade-790111dbfa47
     * @param {string} symbol unified symbol of the market
     * @param {int} [limit] currently unused
     * @param {object} [params] extra parameters to be passed -- see documentation link above
     * @returns {object} A dictionary containg [orderbook information]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name hibachi#fetchMyTrades
     * @see https://api-doc.hibachi.xyz/#0adbf143-189f-40e0-afdc-88af4cba3c79
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name hibachi#fetchOpenOrders
     * @description fetches all current open orders
     * @see https://api-doc.hibachi.xyz/#3243f8a0-086c-44c5-ab8a-71bbb7bab403
     * @param {string} [symbol] unified market symbol to filter by
     * @param {int} [since] milisecond timestamp of the earliest order
     * @param {int} [limit] the maximum number of open orders to return
     * @param {object} [params] extra parameters
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @name hibachi#fetchOHLCV
     * @see  https://api-doc.hibachi.xyz/#4f0eacec-c61e-4d51-afb3-23c51c2c6bac
     * @description fetches historical candlestick data containing the close, high, low, open prices, interval and the volumeNotional
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name hibachi#fetchPositions
     * @description fetch all open positions
     * @see https://api-doc.hibachi.xyz/#69aafedb-8274-4e21-bbaf-91dace8b8f31
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    parseTransactionType(type: any): string;
    parseTransactionStatus(status: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    /**
     * @method
     * @name hibachi#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    /**
     * @method
     * @name hibachi#fetchDepositAddress
     * @description fetch deposit address for given currency and chain. currently, we have a single EVM address across multiple EVM chains. Note: This method is currently only supported for trustless accounts
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters for API
     * @param {string} [params.publicKey] your public key, you can get it from UI after creating API key
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name hibachi#fetchDeposits
     * @description fetch deposits made to account
     * @see https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020
     * @param {string} [code] unified currency code
     * @param {int} [since] filter by earliest timestamp (ms)
     * @param {int} [limit] maximum number of deposits to be returned
     * @param {object} [params] extra parameters to be passed to API
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name hibachi#fetchWithdrawals
     * @description fetch withdrawals made from account
     * @see https://api-doc.hibachi.xyz/#35125e3f-d154-4bfd-8276-a48bb1c62020
     * @param {string} [code] unified currency code
     * @param {int} [since] filter by earliest timestamp (ms)
     * @param {int} [limit] maximum number of deposits to be returned
     * @param {object} [params] extra parameters to be passed to API
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name hibachi#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see http://api-doc.hibachi.xyz/#b5c6a3bc-243d-4d35-b6d4-a74c92495434
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name hibachi#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://api-doc.hibachi.xyz/#bc34e8ae-e094-4802-8d56-3efe3a7bad49
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    /**
     * @method
     * @name hibachi#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://api-doc.hibachi.xyz/#bca696ca-b9b2-4072-8864-5d6b8c09807e
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name hibachi#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api-doc.hibachi.xyz/#4abb30c4-e5c7-4b0f-9ade-790111dbfa47
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
}
