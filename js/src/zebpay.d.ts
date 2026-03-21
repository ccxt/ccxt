import Exchange from './abstract/zebpay.js';
import type { Balances, Currencies, Dict, Int, int, Leverage, Leverages, MarginModification, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees } from './base/types.js';
/**
 * @class
 * @augments Exchange
 */
export default class zebpay extends Exchange {
    describe(): any;
    /**
     * @method
     * @name zebpay#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#system-status
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    /**
     * @method
     * @name zebpayfutures#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the poloniexfutures server
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-server-time
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the poloniexfutures server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name zebpay#fetchMarkets
     * @description retrieves data on all markets for zebpay
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-trading-pairs
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#fetch-markets
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name zebpay#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-coin-settings
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name zebpay#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-exchange-fee
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fee-single-symbol
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.side] side to fetch trading fee
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name zebpay(futures)#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fees-all-symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name zebpay#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-order-book
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name zebpay#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-ticker
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-24hr-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name zebpay#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-all-tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name zebpay#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-klinescandlesticks
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#-get-k-lines-ohlcv-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.endtime] the latest time in ms to fetch orders for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name zebpay#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/public-endpoints.md#get-recent-trades
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-aggregate-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name zebpay#fetchMyTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-trade-history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name zebpatspot#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-order-fills
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name zebpay#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-account-balance
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/wallet.md#get-wallet-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name zebpay#createOrder
     * @description Create an order on the exchange
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#place-new-order
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--create-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {string} [params.formType] The price at which a trigger order is triggered at
     * @param {string} [params.marginAsset] The asset the order creates, default is INR.
     * @param {boolean} [params.takeProfit] Takeprofit flag for the order.
     * @param {boolean} [params.stopLoss] Stop loss flag for the order.
     * @param {string} [params.positionId] PositionId of the order.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    orderRequest(symbol: any, type: any, amount: any, request: any, price?: any, params?: {}): any[];
    /**
     * @method
     * @name zebpay#cancelOrder
     * @description cancels an open order
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-order
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timestamp] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name zebpay#cancelOrders
     * @description cancels all open orders
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#cancel-all-orders
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timestamp] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name zebpay#fetchOpenOrders
     * @description fetches information on multiple open orders made by the user
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-orders
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-open-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name zebpay#fetchOrder
     * @description fetches information on an order made by the user
     * @see [Spot] https://github.com/zebpay/zebpay-api-references/blob/main/spot/api-reference/private-endpoints.md#get-order-details
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-order-details
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel order by client order id
     * @param {string} [params.timestamp] cancel order by client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: Str, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name zebpay#closePosition
     * @description closes open positions for a market
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-close-position
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} side not used by kucoinfutures closePositions
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @param {string} [params.positionId] client order id of the order
     * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name zebpay#fetchLeverages
     * @description fetch the set leverage for all contract and margin markets
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-all-user-leverages
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverages(symbols?: Strings, params?: {}): Promise<Leverages>;
    /**
     * @method
     * @name zebpay#fetchLeverage
     * @description fetch the set leverage for a market
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#get-user-leverage-single-symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name zebpay#setLeverage
     * @description set the level of leverage for a market
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-update-user-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name zebpay#fetchPositions
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--get-positions
     * @description Fetches current contract trading positions
     * @param {string[]} symbols List of unified symbols
     * @param {object} [params] Not used by krakenfutures
     * @returns Parsed exchange response for positions
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    /**
     * @method
     * @name zebpayfutures#addMargin
     * @description add margin
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-add-margin-to-position
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint.
     * @param {string} [params.positionId] PositionId of the order to add margin.
     * @param {string} [params.timestamp] Tiemstamp.
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name zebpayfutures#reduceMargin
     * @description add margin
     * @see [Swap] https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-reduce-margin-from-position
     * @param {string} symbol unified market symbol.
     * @param {float} amount amount of margin to add.
     * @param {object} [params] extra parameters specific to the exchange API endpoint.
     * @param {string} [params.positionId] PositionId of the order to add margin.
     * @param {string} [params.timestamp] Tiemstamp.
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    fetchSpotMarkets(params?: {}): Promise<Market[]>;
    fetchSwapMarkets(params?: {}): Promise<Market[]>;
    parseBalance(response: any): Balances;
    parsePosition(position: Dict, market?: Market): {
        info: Dict;
        symbol: string;
        timestamp: number;
        datetime: string;
        initialMargin: number;
        initialMarginPercentage: any;
        maintenanceMargin: any;
        maintenanceMarginPercentage: any;
        entryPrice: number;
        notional: number;
        leverage: number;
        unrealizedPnl: any;
        contracts: number;
        contractSize: number;
        marginRatio: any;
        liquidationPrice: number;
        markPrice: any;
        collateral: any;
        marginType: string;
        side: string;
        percentage: any;
    };
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseMarginModification(info: any, market?: Market): MarginModification;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
