import Exchange from './abstract/vertex.js';
import type { Market, Ticker, Tickers, TradingFees, Balances, Int, OrderBook, OHLCV, Str, Order, OrderType, OrderSide, Trade, Strings, Dict, Num, Currencies, FundingRate, FundingRates, Currency, Transaction, OpenInterests, Position } from './base/types.js';
/**
 * @class vertex
 * @augments Exchange
 */
export default class vertex extends Exchange {
    describe(): any;
    setSandboxMode(enabled: any): void;
    convertToX18(num: any): string;
    convertFromX18(num: any): string;
    /**
     * @method
     * @name vertex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.vertexprotocol.com/developer-resources/api/v2/assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseMarket(market: any): Market;
    /**
     * @method
     * @name vertex#fetchMarkets
     * @description retrieves data on all markets for vertex
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name vertex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name vertex#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/status
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
    parseTrade(trade: any, market?: Market): Trade;
    /**
     * @method
     * @name vertex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.vertexprotocol.com/developer-resources/api/v2/trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name vertex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.vertexprotocol.com/developer-resources/api/archive-indexer/matches
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name vertex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.vertexprotocol.com/developer-resources/api/v2/orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name vertex#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/fee-rates
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name vertex#fetchOHLCV
     * @see https://docs.vertexprotocol.com/developer-resources/api/archive-indexer/candlesticks
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] max=1000, max=100 when since is defined and is less than (now - (999 * (timeframe in ms)))
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseFundingRate(ticker: any, market?: Market): FundingRate;
    /**
     * @method
     * @name vertex#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.vertexprotocol.com/developer-resources/api/archive-indexer/funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name vertex#fetchFundingRates
     * @description fetches funding rates for multiple markets
     * @see https://docs.vertexprotocol.com/developer-resources/api/v2/contracts
     * @param {string[]} symbols unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name vertex#fetchOpenInterests
     * @description Retrieves the open interest for a list of symbols
     * @see https://docs.vertexprotocol.com/developer-resources/api/v2/contracts
     * @param {string[]} [symbols] a list of unified CCXT market symbols
     * @param {object} [params] exchange specific parameters
     * @returns {object[]} a list of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterests(symbols?: Strings, params?: {}): Promise<OpenInterests>;
    /**
     * @method
     * @name vertex#fetchOpenInterest
     * @description Retrieves the open interest of a derivative trading pair
     * @see https://docs.vertexprotocol.com/developer-resources/api/v2/contracts
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name vertex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.vertexprotocol.com/developer-resources/api/v2/tickers
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    queryContracts(params?: {}): Promise<Currencies>;
    nonce(): number;
    hashMessage(message: any): string;
    signHash(hash: any, privateKey: any): string;
    signMessage(message: any, privateKey: any): string;
    buildSig(chainId: any, messageTypes: any, message: any, verifyingContractAddress?: string): string;
    buildCreateOrderSig(message: any, chainId: any, verifyingContractAddress: any): string;
    buildListTriggerTxSig(message: any, chainId: any, verifyingContractAddress: any): string;
    buildCancelAllOrdersSig(message: any, chainId: any, verifyingContractAddress: any): string;
    buildCancelOrdersSig(message: any, chainId: any, verifyingContractAddress: any): string;
    buildWithdrawSig(message: any, chainId: any, verifyingContractAddress: any): string;
    convertAddressToSender(address: string): string;
    getNonce(now: any, expiration: any): string;
    getExpiration(now: any, timeInForce: any, postOnly: any, reduceOnly: any): string;
    getAmount(amount: any, side: any): string;
    /**
     * @method
     * @name vertex#createOrder
     * @description create a trade order
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/executes/place-order
     * @see https://docs.vertexprotocol.com/developer-resources/api/trigger/executes/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] ioc, fok
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only, only works for ioc and fok order
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name vertex#editOrder
     * @description edit a trade order
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/executes/cancel-and-place
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] ioc, fok
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only, only works for ioc and fok order
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    parseOrderStatus(status: any): any;
    parseOrder(order: any, market?: Market): Order;
    parseTimeInForce(timeInForce: any): string;
    /**
     * @method
     * @name vertex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/order
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name vertex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/orders
     * @see https://docs.vertexprotocol.com/developer-resources/api/trigger/queries/list-trigger-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name vertex#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.vertexprotocol.com/developer-resources/api/trigger/queries/list-trigger-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name vertex#cancelAllOrders
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/executes/cancel-product-orders
     * @see https://docs.vertexprotocol.com/developer-resources/api/trigger/executes/cancel-product-orders
     * @description cancel all open orders in a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name vertex#cancelOrder
     * @description cancels an open order
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/executes/cancel-orders
     * @see https://docs.vertexprotocol.com/developer-resources/api/trigger/executes/cancel-orders
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name vertex#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/executes/cancel-orders
     * @see https://docs.vertexprotocol.com/developer-resources/api/trigger/executes/cancel-orders
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name vertex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/subaccount-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parsePosition(position: any, market?: Market): Position;
    /**
     * @method
     * @name vertex#fetchPositions
     * @description fetch all open positions
     * @see https://docs.vertexprotocol.com/developer-resources/api/gateway/queries/subaccount-info
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    queryNonces(): Promise<import("./base/types.js").Dictionary<any>>;
    /**
     * @method
     * @name vertex#withdraw
     * @description make a withdrawal
     * @see https://docs.vertexprotocol.com/developer-resources/api/withdrawing-on-chain
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    handlePublicAddress(methodName: string, params: Dict): any[];
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
