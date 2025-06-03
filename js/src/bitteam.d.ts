import Exchange from './abstract/bitteam.js';
import { Balances, Currencies, Currency, Dict, int, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class bitteam
 * @augments Exchange
 */
export default class bitteam extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bitteam#fetchMarkets
     * @description retrieves data on all markets for bitteam
     * @see https://bit.team/trade/api/documentation#/CCXT/getTradeApiCcxtPairs
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name bitteam#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiCurrencies
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name bitteam#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bitteam#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcOrderbookPair
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name bitteam#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of  orde structures to retrieve (default 10)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @param {string} [params.type] the status of the order - 'active', 'closed', 'cancelled', 'all', 'history' (default 'all')
     * @returns {Order[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitteam#fetchOrder
     * @description fetches information on an order
     * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrderId
     * @param {int|string} id order id
     * @param {string} symbol not used by bitteam fetchOrder ()
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} An [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitteam#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve (default 10)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {Order[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitteam#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of closed order structures to retrieve (default 10)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {Order[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitteam#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtOrdersofuser
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of canceled order structures to retrieve (default 10)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitteam#createOrder
     * @description create a trade order
     * @see https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtOrdercreate
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} an [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitteam#cancelOrder
     * @description cancels an open order
     * @see https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtCancelorder
     * @param {string} id order id
     * @param {string} symbol not used by bitteam cancelOrder ()
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} An [order structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitteam#cancelAllOrders
     * @description cancel open orders of market
     * @see https://bit.team/trade/api/documentation#/PRIVATE/postTradeApiCcxtCancelallorder
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderType(status: any): string;
    parseValueToPricision(valueObject: any, valueKey: any, preciseObject: any, precisionKey: any): string;
    /**
     * @method
     * @name bitteam#fetchTickers
     * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
     * @see https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcSummary
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bitteam#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://bit.team/trade/api/documentation#/PUBLIC/getTradeApiPairName
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} a [ticker structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitteam#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://bit.team/trade/api/documentation#/CMC/getTradeApiCmcTradesPair
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitteam#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtTradesofuser
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve (default 10)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name betteam#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiCcxtBalance
     * @param {object} [params] extra parameters specific to the betteam api endpoint
     * @returns {object} a [balance structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bitteam#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals from external wallets and between CoinList Pro trading account and CoinList wallet
     * @see https://bit.team/trade/api/documentation#/PRIVATE/getTradeApiTransactionsofuser
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal
     * @param {int} [limit] max number of deposit/withdrawals to return (default 10)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} a list of [transaction structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionType(type: any): string;
    parseTransactionStatus(status: Str): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
