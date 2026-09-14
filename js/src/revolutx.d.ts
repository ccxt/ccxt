import Exchange from './abstract/revolutx.js';
import type { Balances, Currencies, Currency, Dict, Int, int, Market, MarketInterface, NullableDict, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade } from './base/types.js';
/**
 * @class revolutx
 * @augments Exchange
 */
export default class revolutx extends Exchange {
    describe(): any;
    sign(path: any, api?: any, method?: string, params?: Dict, headers?: NullableDict, body?: Str): Dict;
    /**
     * @method
     * @name revolutx#parseMarket
     * @description parses a market from the exchange's market data
     * @ignore
     * @param {object} market the raw market data from the exchange
     * @returns {object} a [market structure]{@link https://docs.ccxt.com/?id=market-structure}
     */
    parseMarket(market: Dict): MarketInterface;
    /**
     * @method
     * @name revolutx#fetchMarkets
     * @description retrieves all available markets on the exchange
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.region] the region to filter markets by (e.g. EEA, UK)
     * @returns {object[]} an array of [market structures]{@link https://docs.ccxt.com/?id=market-structure}
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name revolutx#parseCurrency
     * @description parses a currency from the exchange's currency data
     * @ignore
     * @param {object} currency the raw currency data from the exchange
     * @returns {object} a [currency structure]{@link https://docs.ccxt.com/?id=currency-structure}
     */
    parseCurrency(currency: Dict): Currency;
    /**
     * @method
     * @name revolutx#fetchCurrencies
     * @description fetches all available currencies on the exchange
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.region] the region to filter currencies by
     * @returns {object} a dictionary of [currency structures]{@link https://docs.ccxt.com/?id=currency-structure}
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name revolutx#parseTicker
     * @description parses a ticker from the exchange's ticker data
     * @ignore
     * @param {object} ticker the raw ticker data from the exchange
     * @param {object} [market] the market the ticker is for
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name revolutx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.region] the region to fetch tickers for (e.g. EEA, UK)
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name revolutx#fetchTicker
     * @description fetches a price ticker for a given market symbol
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.region] the region to fetch the ticker for
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name revolutx#fetchOrderBook
     * @description fetches the current order book snapshot for a given market symbol
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum number of orders to return (1-50, default 50)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.region] the region to fetch the order book for
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name revolutx#parseOHLCV
     * @description parses an OHLCV candle from the exchange's candle data
     * @ignore
     * @param {object} ohlcv the raw candle data from the exchange
     * @param {object} [market] the market the candle is for
     * @returns {int[]} an [OHLCV structure]{@link https://docs.ccxt.com/?id=ohlcv-structure}
     */
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name revolutx#fetchOHLCV
     * @description fetches historical candlestick data for a given market symbol
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents (e.g. 1m, 5m, 1h, 1d)
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {string} [params.region] the region to fetch candles for
     * @returns {int[][]} a list of [OHLCV structures]{@link https://docs.ccxt.com/?id=ohlcv-structure}
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name revolutx#parseTrade
     * @description parses a trade from the exchange's public trade data
     * @ignore
     * @param {object} trade the raw trade data from the exchange
     * @param {object} [market] the market the trade was executed in
     * @returns {object} a [trade structure]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name revolutx#fetchTrades
     * @description fetches the public trade history for a given market symbol
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-public-market-data
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to return (1-1900, default 1900)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @param {string} [params.cursor] pagination cursor from the previous response
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name revolutx#fetchBalance
     * @description fetches the current balance for the authenticated user
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name revolutx#parseOrderStatus
     * @description parses the order status from the exchange's status to the unified ccxt status
     * @ignore
     * @param {string} status the exchange-specific order status
     * @returns {string|undefined} the unified order status
     */
    parseOrderStatus(status: Str): Str;
    /**
     * @method
     * @name revolutx#parseOrder
     * @description parses an order from the exchange's order data
     * @ignore
     * @param {object} order the raw order data from the exchange
     * @param {object} [market] the market the order was placed in
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name revolutx#createOrder
     * @description create a trade order
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the base currency you want to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a custom client order id (UUID)
     * @param {float} [params.cost] the order cost in units of the quote currency (alternative to amount)
     * @param {string} [params.timeInForce] 'gtc' or 'ioc' for limit orders
     * @param {string[]} [params.executionInstructions] limit order instructions, e.g. ['post_only'] or ['allow_taker']
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name revolutx#cancelOrder
     * @description cancels an open order by its id
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading
     * @param {string} id the order id (venue order id)
     * @param {string} symbol not used by this exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name revolutx#cancelAllOrders
     * @description cancels all open orders
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading
     * @param {string} [symbol] not used by this exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an empty [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name revolutx#fetchOrder
     * @description fetches an order by its id
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {string} id the order id (venue order id)
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name revolutx#fetchOpenOrders
     * @description fetches all open orders for the authenticated user
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {string|undefined} symbol unified symbol of the market to fetch open orders for
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to return (1-300, default 300)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.cursor] pagination cursor from the previous response
     * @param {string[]} [params.orderStates] filter by order states, e.g. ['new', 'partially_filled']
     * @param {string[]} [params.orderTypes] filter by order types, e.g. ['limit', 'market']
     * @param {string} [params.side] filter by side, 'buy' or 'sell'
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name revolutx#fetchOrders
     * @description fetches historical orders for the authenticated user
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {string|undefined} symbol unified symbol of the market to fetch orders for
     * @param {int} [since] timestamp in ms of the earliest order to fetch, the lookup window is limited to 30 days
     * @param {int} [limit] the maximum number of orders to return (1-1900, default 1900)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order to fetch
     * @param {string} [params.cursor] pagination cursor from the previous response
     * @param {string[]} [params.orderStates] filter by order states, e.g. ['filled', 'cancelled', 'rejected']
     * @param {string[]} [params.orderTypes] filter by order types, e.g. ['limit', 'market']
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name revolutx#fetchClosedOrders
     * @description fetches closed (filled, cancelled, rejected) orders for the authenticated user
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {string|undefined} symbol unified symbol of the market to fetch orders for
     * @param {int} [since] timestamp in ms of the earliest order to fetch, the lookup window is limited to 30 days
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name revolutx#parseMyTrade
     * @description parses a trade from the exchange's private trade format
     * @ignore
     * @param {object} trade the raw trade data from the exchange
     * @param {object} [market] the market the trade was executed in
     * @returns {object} a [trade structure]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    parseMyTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name revolutx#fetchMyTrades
     * @description fetches the trade history for the authenticated user
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-account-data
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch, the lookup window is limited to 30 days
     * @param {int} [limit] the maximum number of trades to return (1-1900, default 1900)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @param {string} [params.cursor] pagination cursor from the previous response
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name revolutx#editOrder
     * @description replaces an existing order
     * @see https://developer.revolut.com/docs/api/revolut-x-crypto-exchange#tag-trading
     * @param {string} id the order id (venue order id) to replace
     * @param {string} symbol unified symbol of the market
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the new amount
     * @param {float} [price] the new price
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a custom client order id (UUID)
     * @param {float} [params.cost] the new order cost in units of the quote currency
     * @param {string} [params.timeInForce] e.g. gtc
     * @param {string[]} [params.executionInstructions] e.g. ['post_only']
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
}
