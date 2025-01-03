import kucoin from './abstract/kucoinfutures.js';
import type { TransferEntry, Int, OrderSide, OrderType, OHLCV, Order, Trade, OrderRequest, FundingHistory, Balances, Str, Ticker, Tickers, OrderBook, Transaction, Strings, Market, Currency, Num, MarginModification, TradingFeeInterface, Dict, LeverageTier, MarginMode, Leverage, FundingRate, DepositAddress } from './base/types.js';
/**
 * @class kucoinfutures
 * @augments Exchange
 */
export default class kucoinfutures extends kucoin {
    describe(): any;
    /**
     * @method
     * @name kucoinfutures#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-service-status
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
     * @name kucoinfutures#fetchMarkets
     * @description retrieves data on all markets for kucoinfutures
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-symbols-list
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name kucoinfutures#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<number>;
    /**
     * @method
     * @name kucoinfutures#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name kucoinfutures#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name kucoinfutures#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-part-order-book-level-2
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name kucoinfutures#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name kucoinfutures#fetchMarkPrice
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-current-mark-price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name kucoinfutures#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-symbols-list
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] the method to use, futuresPublicGetAllTickers or futuresPublicGetContractsActive
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name kucoinfutures#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @param {string[]} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name kucoinfutures#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://www.kucoin.com/docs/rest/futures-trading/funding-fees/get-funding-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    /**
     * @method
     * @name kucoinfutures#fetchPosition
     * @see https://docs.kucoin.com/futures/#get-position-details
     * @description fetch data on an open position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    /**
     * @method
     * @name kucoinfutures#fetchPositions
     * @description fetch all open positions
     * @see https://docs.kucoin.com/futures/#get-position-list
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    /**
     * @method
     * @name kucoinfutures#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/get-positions-history
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch position history for
     * @param {int} [limit] the maximum number of entries to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] closing end time
     * @param {int} [params.pageId] page id
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionsHistory(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: Dict, market?: Market): import("./base/types.js").Position;
    /**
     * @method
     * @name kucoinfutures#createOrder
     * @description Create an order on the exchange
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/place-order
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/place-take-profit-and-stop-loss-order#http-request
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @param {bool} [params.reduceOnly] A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
     * @param {string} [params.timeInForce] GTC, GTT, IOC, or FOK, default is GTC, limit orders only
     * @param {string} [params.postOnly] Post only flag, invalid when timeInForce is IOC or FOK
     * @param {float} [params.cost] the cost of the order in units of USDT
     * ----------------- Exchange Specific Parameters -----------------
     * @param {float} [params.leverage] Leverage size of the order (mandatory param in request, default is 1)
     * @param {string} [params.clientOid] client order id, defaults to uuid if not passed
     * @param {string} [params.remark] remark for the order, length cannot exceed 100 utf8 characters
     * @param {string} [params.stop] 'up' or 'down', the direction the triggerPrice is triggered from, requires triggerPrice. down: Triggers when the price reaches or goes below the triggerPrice. up: Triggers when the price reaches or goes above the triggerPrice.
     * @param {string} [params.triggerPriceType] "last", "mark", "index" - defaults to "mark"
     * @param {string} [params.stopPriceType] exchange-specific alternative for triggerPriceType: TP, IP or MP
     * @param {bool} [params.closeOrder] set to true to close position
     * @param {bool} [params.test] set to true to use the test order endpoint (does not submit order, use to validate params)
     * @param {bool} [params.forceHold] A mark to forcely hold the funds for an order, even though it's an order to reduce the position size. This helps the order stay on the order book and not get canceled when the position size changes. Set to false by default.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoinfutures#createOrders
     * @description create a list of trade orders
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/place-multiple-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createContractOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name kucoinfutures#cancelOrder
     * @description cancels an open order
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/cancel-futures-order-by-orderid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel order by client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoinfutures#cancelOrders
     * @description cancel multiple orders
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/batch-cancel-orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoinfutures#cancelAllOrders
     * @description cancel all open orders
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/cancel-multiple-futures-limit-orders
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/cancel-multiple-futures-stop-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.trigger] When true, all the trigger orders will be cancelled
     * @returns Response from the exchange
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoinfutures#addMargin
     * @description add margin
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/add-margin-manually
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    parseMarginModification(info: any, market?: Market): MarginModification;
    /**
     * @method
     * @name kucoinfutures#fetchOrdersByStatus
     * @description fetches a list of orders placed on the exchange
     * @see https://docs.kucoin.com/futures/#get-order-list
     * @see https://docs.kucoin.com/futures/#get-untriggered-stop-order-list
     * @param {string} status 'active' or 'closed', only 'active' is valid for stop orders
     * @param {string} symbol unified symbol for the market to retrieve orders from
     * @param {int} [since] timestamp in ms of the earliest order to retrieve
     * @param {int} [limit] The maximum number of orders to retrieve
     * @param {object} [params] exchange specific parameters
     * @param {bool} [params.trigger] set to true to retrieve untriggered stop orders
     * @param {int} [params.until] End time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit or market
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns An [array of order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoinfutures#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.kucoin.com/futures/#get-order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit, or market
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoinfutures#fetchOpenOrders
     * @description fetches information on multiple open orders made by the user
     * @see https://docs.kucoin.com/futures/#get-order-list
     * @see https://docs.kucoin.com/futures/#get-untriggered-stop-order-list
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit, or market
     * @param {boolean} [params.trigger] set to true to retrieve untriggered stop orders
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoinfutures#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.kucoin.com/futures/#get-details-of-a-single-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id?: Str, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name kucoinfutures#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.kucoin.com/docs/rest/futures-trading/funding-fees/get-current-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name kucoinfutures#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://www.kucoin.com/docs/rest/futures-trading/funding-fees/get-current-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingInterval(symbol: string, params?: {}): Promise<FundingRate>;
    parseFundingRate(data: any, market?: Market): FundingRate;
    parseFundingInterval(interval: any): string;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name kucoinfutures#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.kucoin.com/docs/rest/funding/funding-overview/get-account-detail-futures
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name kucoinfutures#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://www.kucoin.com/docs/rest/funding/transfer/transfer-to-main-or-trade-account
     * @see https://www.kucoin.com/docs/rest/funding/transfer/transfer-to-futures-account
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
    parseTransferType(transferType: Str): Str;
    /**
     * @method
     * @name kucoinfutures#fetchMyTrades
     * @see https://docs.kucoin.com/futures/#get-fills
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] End time in ms
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kucoinfutures#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.kucoin.com/docs/rest/futures-trading/market-data/get-transaction-history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name kucoinfutures#fetchDeposits
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
     * @name kucoinfutures#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name kucoinfutures#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
     * @see https://www.kucoin.com/docs/rest/futures-trading/risk-limit/get-futures-risk-limit-level
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
     */
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    /**
     * @method
     * @name kucoinfutures#fetchFundingRateHistory
     * @see https://www.kucoin.com/docs/rest/futures-trading/funding-fees/get-public-funding-history#request-url
     * @description fetches historical funding rate prices
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] not used by kucuoinfutures
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").FundingRateHistory[]>;
    parseFundingRateHistory(info: any, market?: Market): {
        info: any;
        symbol: string;
        fundingRate: number;
        timestamp: number;
        datetime: string;
    };
    /**
     * @method
     * @name kucoinfutures#closePosition
     * @description closes open positions for a market
     * @see https://www.kucoin.com/docs/rest/futures-trading/orders/place-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} side not used by kucoinfutures closePositions
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @param {string} [params.clientOrderId] client order id of the order
     * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoinfutures#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.kucoin.com/docs/rest/funding/trade-fee/trading-pair-actual-fee-futures
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name kucoinfutures#fetchMarginMode
     * @description fetches the margin mode of a trading pair
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/get-margin-mode
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    fetchMarginMode(symbol: string, params?: {}): Promise<MarginMode>;
    parseMarginMode(marginMode: Dict, market?: any): MarginMode;
    /**
     * @method
     * @name kucoinfutures#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/modify-margin-mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<MarginMode>;
    /**
     * @method
     * @name kucoinfutures#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/get-cross-margin-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name kucoinfutures#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.kucoin.com/docs/rest/futures-trading/positions/modify-cross-margin-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
}
