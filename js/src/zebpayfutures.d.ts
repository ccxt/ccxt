import Exchange from './abstract/zebpayfutures.js';
import type { Balances, Dict, Int, int, Leverage, Leverages, MarginModification, Market, Num, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, TradingFeeInterface, TradingFees } from './base/types.js';
/**
 * @class zebpayfutures
 * @augments Exchange
 */
export default class zebpayfutures extends Exchange {
    describe(): any;
    /**
     * @method
     * @name zebpayfutures#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-status
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
    /**
     * @method
     * @name zebpayfutures#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the poloniexfutures server
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/system.md#get-system-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the poloniexfutures server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name zebpayfutures#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fee-single-symbol
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name zebpayfutures#fetchTradingFees
     * @description the latest known information on the availability of the exchange API
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/exchange.md#get-trade-fees-all-symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name zebpayfutures#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name zebpayfutures#fetchMarkets
     * @description retrieves data on all markets for zebpayfutures
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-market-info
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name zebpayfutures#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/public-endpoints/market.md#get-market-info
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name zebpayfutures#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/wallet.md#get-wallet-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name zebpayfutures#createOrder
     * @description Create an order on the exchange
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--create-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {number} [params.leverage] Leverage size of the order
     * @param {string} [params.formType] The price at which a trigger order is triggered at
     * @param {string} [params.marginAsset] The asset the order creates.
     * @param {boolean} [params.takeProfit] Takeprofit flag for the order.
     * @param {boolean} [params.stopLoss] Stop loss flag for the order.
     * @param {string} [params.positionId] PositionId of the order.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name zebpayfutures#cancelOrder
     * @description cancels an open order
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.timestamp] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name zebpayfutures#addMargin
     * @description add margin
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-add-margin-to-position
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint.
     * @param {string} [params.positionId] PositionId of the order to add margin.
     * @param {string} [params.timestamp] Tiemstamp.
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name zebpayfutures#reduceMargin
     * @description add margin
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-reduce-margin-from-position
     * @param {string} symbol unified market symbol.
     * @param {float} amount amount of margin to add.
     * @param {object} [params] extra parameters specific to the exchange API endpoint.
     * @param {string} [params.positionId] PositionId of the order to add margin.
     * @param {string} [params.timestamp] Tiemstamp.
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name zebpayfutures#fetchOrdersByStatus
     * @description fetches a list of orders placed on the exchange
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-open-orders
     * @param {string} status opn orders
     * @param {string} symbol unified symbol for the market to retrieve orders from
     * @param {int} [since] timestamp in ms of the earliest order to retrieve
     * @param {int} [limit] The maximum number of orders to retrieve
     * @param {object} [params] exchange specific parameters
     * @returns An [array of order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name zebpayfutures#fetchOpenOrders
     * @description fetches information on multiple open orders made by the user
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-open-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoinfutures#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-order-details
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel order by client order id
     * @param {string} [params.timestamp] cancel order by client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: Str, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name zebpayfutures#closePosition
     * @description closes open positions for a market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-close-position
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} side not used by kucoinfutures closePositions
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @param {string} [params.positionId] client order id of the order
     * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name zebpayfutures#fetchLeverages
     * @description fetch the set leverage for all contract and margin markets
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-get-all-user-leverages
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverages(symbols?: Strings, params?: {}): Promise<Leverages>;
    /**
     * @method
     * @name zebpayfutures#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#get-user-leverage-single-symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name zebpayfutures#setLeverage
     * @description set the level of leverage for a market
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#-update-user-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name zebpayfutures#fetchPositions
     * @see https://github.com/zebpay/zebpay-api-references/blob/main/futures/api-reference/private-endpoints/trade.md#--get-positions
     * @description Fetches current contract trading positions
     * @param {string[]} symbols List of unified symbols
     * @param {object} [params] Not used by krakenfutures
     * @returns Parsed exchange response for positions
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePositions(response: any, symbols?: Strings, params?: {}): any[];
    parsePosition(position: Dict, market?: Market): {
        info: Dict;
        symbol: string;
        timestamp: number;
        datetime: string;
        initialMargin: any;
        initialMarginPercentage: any;
        maintenanceMargin: any;
        maintenanceMarginPercentage: any;
        entryPrice: number;
        notional: any;
        leverage: number;
        unrealizedPnl: any;
        contracts: number;
        contractSize: number;
        marginRatio: any;
        liquidationPrice: any;
        markPrice: any;
        collateral: any;
        marginType: string;
        side: string;
        percentage: any;
    };
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    parseOrder(order: Dict, market?: Market): Order;
    parseMarginModification(info: any, market?: Market): MarginModification;
    parseBalance(response: any): Balances;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
