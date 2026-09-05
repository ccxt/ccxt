import Exchange from './abstract/bithumb.js';
import type { Balances, Currency, Dict, Int, Market, MarketInterface, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, int, NullableDict, OrderRequest, DepositAddress } from './base/types.js';
/**
 * @class bithumb
 * @augments Exchange
 */
export default class bithumb extends Exchange {
    describe(): any;
    safeMarket(marketId?: Str, market?: Market, delimiter?: Str, marketType?: Str): MarketInterface;
    amountToPrecision(symbol: Str, amount: any): string;
    getGen2MarketId(market: Market): string;
    /**
     * @method
     * @name bithumb#fetchMarkets
     * @description retrieves data on all markets for bithumb
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all
     * @see https://apidocs.bithumb.com/reference/%EA%B1%B0%EB%9E%98-%EB%8C%80%EC%83%81-%EB%AA%A9%EB%A1%9D-%EC%A1%B0%ED%9A%8C
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bithumb#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EB%B3%B4%EC%9C%A0%EC%9E%90%EC%82%B0-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%A0%84%EC%B2%B4-%EC%9E%90%EC%82%B0-%EC%A1%B0%ED%9A%8C
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name bithumb#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%B8%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%ED%98%B8%EA%B0%80-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bithumb#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C-all
     * @see https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A1%B0%ED%9A%8C
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bithumb#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A0%95%EB%B3%B4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%ED%98%84%EC%9E%AC%EA%B0%80-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bithumb#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://apidocs.bithumb.com/v1.2.0/reference/candlestick-rest-api
     * @see https://apidocs.bithumb.com/reference/%EB%B6%84minute-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%9D%BCday-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BCweek-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%9B%94month-%EC%BA%94%EB%93%A4-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bithumb#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%B5%9C%EA%B7%BC-%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD
     * @see https://apidocs.bithumb.com/reference/%EC%B2%B4%EA%B2%B0-%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bithumb#createOrders
     * @description create a list of trade orders, only available for the generation 2 API
     * @see https://apidocs.bithumb.com/reference/%EB%8B%A4%EA%B1%B4-%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] supports 'IOC', 'FOK', and 'PO'
     * @param {bool} [params.postOnly] true or false
     * @param {string} [params.clientOrderId] the clientOrderId of the order
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name bithumb#createOrder
     * @description create a trade order
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%A7%80%EC%A0%95%EA%B0%80-%EC%A3%BC%EB%AC%B8%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EC%88%98%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%8B%9C%EC%9E%A5%EA%B0%80-%EB%A7%A4%EB%8F%84%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] supports 'IOC', 'FOK', and 'PO'
     * @param {bool} [params.postOnly] true or false
     * @param {string} [params.clientOrderId] the clientOrderId of the order
     * @param {string} [params.cost] *generation 2 only* optional cost parameter for market buy orders instead of setting the price, must also set createMarketBuyOrderRequiresPrice to false
     * @param {bool} [params.createMarketBuyOrderRequiresPrice] *generation 2 only* set to false if passing a cost param or using cost in the amount argument, defaults to true
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bithumb#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name bithumb#createTwapOrder
     * @description create a trade order that is executed as a TWAP order over a specified duration.
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8-%EC%9A%94%EC%B2%AD
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency, only required for sale
     * @param {int} duration the duration of the TWAP order in milliseconds
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.frequency required order interval in seconds, 15, 20, 30, 60 or 120
     * @param {string} [params.price] order price, required for purchase
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createTwapOrder(symbol: string, side: OrderSide, amount: number, duration: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bithumb#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%83%81%EC%84%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%A3%BC%EB%AC%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the clientOrderId of the order, alternative to using the order id
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] *generation 2 only* if you want to fetch a generation 2 twap order
     * @param {string} [params.state] *generation 2 only* the order state, either wait, watch, done, or cancel. For twap either progress (default), done, or cancel
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrderStatus(status: Str): Str;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name bithumb#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EA%B1%B0%EB%9E%98-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] *generation 2 only* if you want to fetch generation 2 twap orders
     * @param {string} [params.state] *generation 2 only* the order state, either wait, watch, done, or cancel. For twap either progress (default), done, or cancel
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name bithumb#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] an array of client order ids
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] *generation 2 only* if you want to fetch generation 2 twap orders
     * @param {string} [params.state] *generation 2 only* the order state, either wait, watch, done, or cancel. For twap either progress (default), done, or cancel
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bithumb#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] an array of client order ids
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] if you want to fetch generation 2 twap orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name bithumb#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8%EB%82%B4%EC%97%AD-%EC%A1%B0%ED%9A%8C
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] an array of client order ids
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] if you want to fetch generation 2 twap orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name bithumb#cancelOrder
     * @description cancels an open order
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C%ED%95%98%EA%B8%B0
     * @see https://apidocs.bithumb.com/reference/%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C-%EC%A0%91%EC%88%98
     * @see https://apidocs.bithumb.com/reference/twap-%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the clientOrderId of the order, alternative to using the order id
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @param {bool} [params.twap] if you want to cancel a generation 2 twap order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name bithumb#cancelOrders
     * @description cancel multiple orders
     * @see https://apidocs.bithumb.com/reference/%EB%8B%A4%EA%B1%B4-%EC%A3%BC%EB%AC%B8-%EC%B7%A8%EC%86%8C-%EC%A0%91%EC%88%98
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] alternative to ids, array of client order ids
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    cancelUnifiedOrder(order: Order, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bithumb#withdraw
     * @description make a withdrawal
     * @see https://apidocs.bithumb.com/v1.2.0/reference/%EC%BD%94%EC%9D%B8-%EC%B6%9C%EA%B8%88%ED%95%98%EA%B8%B0-%EA%B0%9C%EC%9D%B8
     * @see https://apidocs.bithumb.com/reference/%EA%B0%80%EC%83%81-%EC%9E%90%EC%82%B0-%EC%B6%9C%EA%B8%88-%EC%9A%94%EC%B2%AD
     * @see https://apidocs.bithumb.com/reference/%EC%9B%90%ED%99%94-%EC%B6%9C%EA%B8%88-%EC%9A%94%EC%B2%AD
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag the secondary withdrawal destination address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] if you want to use the API generation 1 or 2, default is 2
     * @param {string} [params.network] the blockchain network to withdraw on, for example BTC or DASH
     * @param {string} [params.destination] secondary address destination for specific currencies, can alternatively use the tag argument
     * @param {string} [params.exchange_name] withdrawal exchange name
     * @param {string} [params.receiver_type] either personal or corporation
     * @param {string} [params.ko_name] *generation 1 only* the receiver name in korean
     * @param {string} [params.en_name] *generation 1 only* the receiver name in english
     * @param {string} [params.receiver_ko_name] *generation 2 only* the personal receiver name in korean
     * @param {string} [params.receiver_en_name] *generation 2 only* the personal receiver name in english
     * @param {string} [params.receiver_corp_ko_name] *generation 2 only* the corporation receiver name in korean
     * @param {string} [params.receiver_corp_en_name] *generation 2 only* the corporation receiver name in english
     * @param {string} [params.two_factor_type] *generation 2 KRW withdraw only* the two factor type, for example kakao
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatusByType(status: Str, type?: Str): Str;
    /**
     * @method
     * @name bithumb#fetchWithdrawalWhitelist
     * @description fetch a list of allowed withdrawal addresses
     * @see https://apidocs.bithumb.com/reference/%EC%B6%9C%EA%B8%88-%ED%97%88%EC%9A%A9-%EC%A3%BC%EC%86%8C-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object[]} a list response from the exchange
     */
    fetchWithdrawalWhitelist(params?: {}): Promise<any>;
    /**
     * @method
     * @name bithumb#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%B6%9C%EA%B8%88-%EC%A1%B0%ED%9A%8C
     * @param {string} id withdrawal id
     * @param {string} [code] the currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.txid] the transaction id for the withdrawal
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name bithumb#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://apidocs.bithumb.com/reference/%EC%B6%9C%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%9B%90%ED%99%94-%EC%B6%9C%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {int} [params.page] the number of pages to return, default is 1
     * @param {string} [params.state] the withdrawal state, either PROCESSING, DONE or CANCELLED
     * @param {string} [params.order_by] either asc or desc, desc is the default
     * @param {string[]} [params.uuids] an array of uuid strings
     * @param {string[]} [params.txids] an array of txid strings
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bithumb#fetchDeposit
     * @description fetch information on a deposit
     * @see https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%9E%85%EA%B8%88-%EC%A1%B0%ED%9A%8C
     * @param {string} id deposit id
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.txid] the transaction id for the deposit
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposit(id: string, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name bithumb#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://apidocs.bithumb.com/reference/%EC%9E%85%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @see https://apidocs.bithumb.com/reference/%EC%9B%90%ED%99%94-%EC%9E%85%EA%B8%88-%EB%A6%AC%EC%8A%A4%ED%8A%B8-%EC%A1%B0%ED%9A%8C
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {int} [params.page] the number of pages to return, default is 1
     * @param {string} [params.state] the deposit state, for KRW, PROCESSING, ACCEPTED or CANCELLED, for others, DEPOSIT_PROCESSING, DEPOSIT_ACCEPTED, DEPOSIT_CANCELLED
     * @param {string} [params.order_by] either asc or desc, desc is the default
     * @param {string[]} [params.uuids] an array of uuid strings
     * @param {string[]} [params.txids] an array of txid strings
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bithumb#createDepositAddress
     * @description create a currency deposit address
     * @see https://apidocs.bithumb.com/reference/%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%83%9D%EC%84%B1-%EC%9A%94%EC%B2%AD
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {string} [params.network] the blockchain network to create a deposit address on
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name bithumb#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://apidocs.bithumb.com/reference/%EA%B0%9C%EB%B3%84-%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%A1%B0%ED%9A%8C
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @param {string} [params.network] network for fetch deposit address
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name bithumb#fetchDepositAddresses
     * @description fetch deposit addresses for multiple currencies (when available)
     * @see https://apidocs.bithumb.com/reference/%EC%A0%84%EC%B2%B4-%EC%9E%85%EA%B8%88-%EC%A3%BC%EC%86%8C-%EC%A1%B0%ED%9A%8C
     * @param {string[]} [codes] list of unified currency codes, default is undefined (all currencies)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.generation] *only generation 2 is supported* if you want to use the API generation 1 or 2, default is 2
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/?id=address-structure} indexed by currency code
     */
    fetchDepositAddresses(codes?: Strings, params?: {}): Promise<DepositAddress[]>;
    parseDepositAddress(response: any, currency?: Currency): DepositAddress;
    fixCommaNumber(numberStr: any): any;
    nonce(): number;
    urlencodeWithArrayBrackets(query: Dict): string;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: NullableDict, body?: Str): {
        url: string;
        method: string;
        body: Str;
        headers: NullableDict;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
}
