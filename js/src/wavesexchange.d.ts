import Exchange from './abstract/wavesexchange.js';
import type { Balances, Currency, Dict, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, int, DepositAddress } from './base/types.js';
/**
 * @class wavesexchange
 * @augments Exchange
 */
export default class wavesexchange extends Exchange {
    describe(): any;
    setSandboxMode(enabled: any): void;
    getFeesForAsset(symbol: string, side: any, amount: any, price: any, params?: {}): Promise<any>;
    customCalculateFee(symbol: string, type: any, side: any, amount: any, price: any, takerOrMaker?: string, params?: {}): Promise<{
        type: string;
        currency: string;
        rate: number;
        cost: number;
    }>;
    getQuotes(): Promise<any>;
    /**
     * @method
     * @name wavesexchange#fetchMarkets
     * @description retrieves data on all markets for wavesexchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name wavesexchange#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://matcher.waves.exchange/api-docs/index.html#/markets/getOrderBook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseOrderBookSide(bookSide: any, market?: any, limit?: Int): any[];
    checkRequiredKeys(): void;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    /**
     * @method
     * @name wavesexchange#signIn
     * @description sign in, must be called prior to using other authenticated methods
     * @see https://docs.wx.network/en/api/auth/oauth2-token
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns response from exchange
     */
    signIn(params?: {}): Promise<any>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name wavesexchange#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.wavesplatform.com/v0/docs/#/pairs/getPairsListAll
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name wavesexchange#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name wavesexchange#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.wavesplatform.com/v0/docs/#/candles/getCandles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    filterFutureCandles(ohlcvs: any): any[];
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name wavesexchange#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    getMatcherPublicKey(): Promise<any>;
    getAssetBytes(currencyId: any): Uint8Array;
    getAssetId(currencyId: any): any;
    toRealCurrencyAmount(code: string, amount: number, networkCode?: any): number;
    fromRealCurrencyAmount(code: string, amountString: string): string;
    toRealSymbolPrice(symbol: string, price: number): number;
    fromRealSymbolPrice(symbol: string, priceString: string): string;
    toRealSymbolAmount(symbol: string, amount: number): number;
    fromRealSymbolAmount(symbol: string, amountString: string): string;
    safeGetDynamic(settings: any): any;
    safeGetRates(dynamic: any): any;
    /**
     * @method
     * @name wavesexchange#createOrder
     * @description create a trade order
     * @see https://matcher.waves.exchange/api-docs/index.html#/serialize/serializeOrder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price at which a stop order is triggered at
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name wavesexchange#cancelOrder
     * @description cancels an open order
     * @see https://matcher.waves.exchange/api-docs/index.html#/cancel/cancelOrdersByIdsWithKeyOrSignature
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name wavesexchange#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://matcher.waves.exchange/api-docs/index.html#/status/getOrderStatusByPKAndIdWithSig
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name wavesexchange#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name wavesexchange#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name wavesexchange#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: Str): string;
    getSymbolFromAssetPair(assetPair: any): string;
    parseOrder(order: Dict, market?: Market): Order;
    getWavesAddress(): Promise<any>;
    /**
     * @method
     * @name wavesexchange#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    setUndefinedBalancesToZero(balances: any, key?: string): any;
    /**
     * @method
     * @name wavesexchange#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.wavesplatform.com/v0/docs/#/transactions/searchTxsExchange
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name wavesexchange#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.wavesplatform.com/v0/docs/#/transactions/searchTxsExchange
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    parseDepositWithdrawFees(response: any, codes?: Strings, currencyIdKey?: any): any;
    /**
     * @method
     * @name wavesexchange#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://docs.wx.network/en/api/gateways/deposit/currencies
     * @see https://docs.wx.network/en/api/gateways/withdraw/currencies
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    /**
     * @method
     * @name wavesexchange#withdraw
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
}
