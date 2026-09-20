import Exchange from './abstract/btse.js';
import type { Balances, Dict, FundingRate, FundingRateHistory, FundingRates, int, Int, Leverage, LeverageTier, LeverageTiers, MarginMode, Market, Num, OHLCV, OpenInterests, Order, OrderBook, OrderSide, OrderType, Position, PositionModeInfo, Str, Strings, Ticker, Tickers, Trade, TradingFees, TradingFeeInterface, Transaction, Currency, LedgerEntry } from './base/types.js';
/**
 * @class btse
 * @augments Exchange
 */
export default class btse extends Exchange {
    describe(): any;
    /**
     * @method
     * @name btse#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name btse#fetchMarkets
     * @description retrieves data on all markets for btse
     * @see https://docs.btse.com/markets/rest/get-markets/
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name btse#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.btse.com/markets/rest/get-klines/
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default and max 300)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name btse#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.btse.com/markets/rest/get-orderbook/
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name btse#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.btse.com/markets/rest/get-funding-rate-history/
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch, used to select the requested period and then applied client-side
     * @param {int} [limit] the maximum amount of entries to fetch, applied client-side
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.period] the funding rate history period, one of '7D', '2W' or '1M', selected from since by default
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch, applied client-side
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRateHistory(contract: any, market?: Market): {
        info: any;
        symbol: string;
        fundingRate: Num;
        timestamp: Int;
        datetime: string | undefined;
    };
    /**
     * @method
     * @name btse#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.btse.com/wallet/rest/get-user-assets/
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-wallet-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] wallet type, spot or swap, default is spot
     * @param {string} [params.wallet] futures wallet name, CROSS@ by default, or ISOLATED@ followed by the market id with -USDT appended
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name btse#fetchLeverageTiers
     * @see https://docs.btse.com/markets/rest/get-market-risk-limits/
     * @description retrieve information on the maximum leverage, for different trade sizes
     * @param {string[]|undefined} symbols a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    /**
     * @method
     * @name btse#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, for different trade sizes for a single market
     * @see https://docs.btse.com/markets/rest/get-market-risk-limits/
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
     */
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    /**
     * @method
     * @name btse#fetchTickers
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name btse#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name btse#fetchOpenInterest
     * @description Retrieves the open interest of a derivative trading pair
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=interest-history-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    /**
     * @method
     * @name btse#fetchOpenInterests
     * @description Retrieves the open interest for a list of symbols
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @param {string[]} [symbols] a list of unified CCXT market symbols
     * @param {object} [params] exchange specific parameters
     * @returns {object[]} a list of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterests(symbols?: Strings, params?: {}): Promise<OpenInterests>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name btse#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name btse#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://docs.btse.com/markets/rest/get-24-hr-ticker/
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rates structures]{@link https://docs.ccxt.com/?id=funding-rates-structure}, indexe by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name btse#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.btse.com/markets/rest/get-trades/
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch, applied client-side to the most recent trades window
     * @param {int} [limit] the maximum amount of trades to fetch (max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry to fetch, applied client-side to the most recent trades window
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name btse#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.btse.com/spot/rest/get-trade-history/
     * @see https://docs.btse.com/futures/rest/get-trade-history/
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is undefined
     * @param {string} [params.type] 'spot' or 'swap' or 'future', default is 'spot'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name btse#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://btsecom.github.io/docs/spotV3_3/en/#query-user-trades-fills
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-trades-fills-2
     * @param {string} id order id
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, could be used instead of the order id
     * @param {string} [params.type] 'spot' or 'swap' or 'future', default is 'spot'
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name btse#createOrder
     * @description create a trade order
     * @see https://btsecom.github.io/docs/spotV3_3/en/#create-new-order
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#create-new-order
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#create-new-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately (default is false)
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', 'PO', 'HALFMIN', 'FIVEMIN', 'HOUR', 'TWELVEHOUR', 'DAY', 'WEEK' or 'MONTH'
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at (same as takeProfitPrice)
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.triggerPriceType] 'INDEX_PRICE' or 'LAST_PRICE', default is 'LAST_PRICE'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {float} [params.deviation] *PEG orders only* How much should the order price deviate from index price. Value is in percentage and can range from -10 to 10
     * @param {float} [params.stealth] *PEG orders only*  How many percent of the order is to be displayed on the orderbook
     * @param {float} [params.stopPrice] *NB - It is NOT stopLossPrice or triggerPrice!!! OCO orders only* Mandatory when creating an OCO order. Indicates the stop price
     * @param {bool} [params.hedged] *contract markets only* true for hedged mode, false for one way mode, default is false
     * @param {string} [params.marginMode] *contract markets only* 'cross' or 'isolated' (default is 'cross') - the exchange does not have cross/isolated margin modes but instead has 'ONE_WAY', 'HEDGE' and 'ISOLATED' position modes, so this param will be converted to the appropriate position mode
     * @param {string} [params.positionMode] *contract markets only* 'ONE_WAY (default) or 'HEDGE or 'ISOLATED' (if not provided, it will be derived from marginMode and hedged params)
     * @param {object} [params.takeProfit] *contract markets only* *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] *contract markets only* take profit trigger price
     * @param {string} [params.takeProfit.priceType] *contract markets only* 'markPrice' or 'lastPrice', default is 'markPrice'
     * @param {object} [params.stopLoss] *contract markets only* *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] *contract markets only* stop loss trigger price
     * @param {string} [params.stopLoss.priceType] *contract markets only* 'markPrice' or 'lastPrice', default is 'markPrice'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name btse#createSpotOrder
     * @description create a trade order on spot market
     * @see https://docs.btse.com/spot/rest/place-order
     * @see https://docs.btse.com/spot/rest/place-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'OCO', 'PEG', 'TWAP' or 'TRAILING'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately, default is false
     * @param {string} [params.timeInForce] 'GTC', 'IOC' or 'FOK'
     * @param {float} [params.cost] *market buy and trailing buy orders only* the quote quantity that can be used as an alternative for the amount
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at, same as takeProfitPrice
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.triggerPriceType] 'last', 'mark' or 'index', default is 'last'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {float} [params.trailingPercent] the percent to trail away from the current market price
     * @param {float} [params.deviation] *PEG orders only* how much should the order price deviate from the pegged price, in percent from -10 to 10
     * @param {float} [params.stealth] *PEG orders only* how many percent of the order is to be displayed on the orderbook, from 1 to 100
     * @param {float} [params.stopPrice] *NB - It is NOT stopLossPrice or triggerPrice!!! OCO orders only* the limit price of the stop loss leg
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createSpotOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name btse#createContractOrder
     * @description create a trade order on contract market
     * @see https://docs.btse.com/futures/rest/place-order
     * @see https://docs.btse.com/futures/rest/place-algo-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'OCO', 'PEG', 'TWAP' or 'TRAILING'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately, default is false
     * @param {bool} [params.reduceOnly] if true, the order will only reduce a current position, not increase it, default is false
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK', 'PO', 'HALFSEC', 'HALFMIN', 'FIVEMIN', 'HOUR', 'TWELVEHOUR', 'DAY', 'WEEK' or 'MONTH'
     * @param {bool} [params.hedged] true for hedged mode, false for one way mode, default is false
     * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'cross' - the exchange does not have cross/isolated margin modes but instead has 'ONE_WAY', 'HEDGE' and 'ISOLATED' position modes, so this param will be converted to the appropriate position mode
     * @param {string} [params.positionMode] 'ONE_WAY', 'HEDGE' or 'ISOLATED' - if not provided, it will be derived from the marginMode and hedged params
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at, same as takeProfitPrice
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {string} [params.triggerPriceType] 'last', 'mark' or 'index', default is 'mark'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @param {float} [params.trailingPercent] the percent to trail away from the current market price
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {string} [params.takeProfit.priceType] 'last', 'mark' or 'index', default is 'mark'
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.stopLoss.priceType] 'last', 'mark' or 'index', default is 'mark'
     * @param {float} [params.deviation] *PEG orders only* the offset applied to the pegged reference price
     * @param {float} [params.stealth] *PEG orders only* the portion of the order size displayed on the book
     * @param {float} [params.stopPrice] *NB - It is NOT the stopLossPrice!!! OCO orders only* the limit price of the stop loss leg
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createContractOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    encodeTriggerPriceType(priceType: Str): Str;
    /**
     * @method
     * @name btse#fetchOpenOrder
     * @description fetches information on an open order made by the user
     * @see https://docs.btse.com/spot/rest/get-order
     * @see https://docs.btse.com/futures/rest/get-orders
     * @param {string} id the order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {string} [params.type] 'spot', 'swap' or 'future', default is 'spot'
     * @param {bool} [params.includeCancelled] *contract markets only* if true, cancelled orders are included in the lookup
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name btse#editOrder
     * @description edit a trade order
     * @see https://docs.btse.com/spot/rest/amend-order
     * @see https://docs.btse.com/futures/rest/amend-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' (not used by btse)
     * @param {string} side 'buy' or 'sell' (not used by btse)
     * @param {float} [amount] how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order, required if id is not provided
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at
     * @param {bool} [params.totalAmountMode] if true, the amount is treated as the new total order quantity including the already filled portion, default is false
     * @param {bool} [params.slide] *contract markets only* if true and only the price is amended, the price slides to the best available price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name btse#cancelOrder
     * @see https://docs.btse.com/spot/rest/cancel-order
     * @see https://docs.btse.com/futures/rest/cancel-order
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order, required if id is not provided
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name btse#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://docs.btse.com/spot/rest/cancel-all-orders
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#cancel-order
     * @param {string} [symbol] unified market symbol of the market to cancel orders in, on spot markets omit it to cancel every open order across all pairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap' or 'future', default is 'spot', used when the symbol is omitted
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name btse#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://docs.btse.com/spot/rest/cancel-all-after
     * @see https://docs.btse.com/futures/rest/cancel-all-after
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap' or 'future', default is 'spot'
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name btse#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.btse.com/spot/rest/get-orders
     * @see https://docs.btse.com/futures/rest/get-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for, filtered client-side
     * @param {int} [limit] the maximum number of open orders structures to retrieve, filtered client-side
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap' or 'future', default is 'spot'
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): Str;
    parseOrderType(type: Str): Str;
    parseTimeInForce(timeInForce: Str): Str;
    /**
     * @method
     * @name btse#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.btse.com/spot/rest/get-fees
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-account-fee
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot', 'swap' or 'future' (default is 'spot')
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    requestWalletHistoryRows(methodName: string, historyTypes: string[], code?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name btse#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.btse.com/wallet/rest/get-user-wallet-history
     * @param {string} [code] unified currency code, required for the default spot wallet
     * @param {int} [since] the earliest time in ms to fetch transactions for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transactions for, excluded
     * @param {string} [params.walletType] wallet to query, SPOT by default, ISOLATED requires params.walletName
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name btse#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.btse.com/wallet/rest/get-user-wallet-history
     * @param {string} [code] unified currency code, required for the default spot wallet
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch deposits for, excluded
     * @param {string} [params.walletType] wallet to query, SPOT by default, ISOLATED requires params.walletName
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name btse#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.btse.com/wallet/rest/get-user-wallet-history
     * @param {string} [code] unified currency code, required for the default spot wallet
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch withdrawals for, excluded
     * @param {string} [params.walletType] wallet to query, SPOT by default, ISOLATED requires params.walletName
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionType(type: Str): Str;
    parseTransactionStatus(status: Str): Str;
    /**
     * @method
     * @name btse#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://docs.btse.com/wallet/rest/get-user-wallet-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch ledger entries for
     * @param {int} [limit] the maximum number of ledger entry structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch ledger entries for, excluded
     * @param {string} [params.walletType] wallet to query, SPOT by default, ISOLATED requires params.walletName
     * @returns {object[]} a list of [ledger structures]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: Str): Str;
    parseLedgerEntryDirection(type: Str): Str;
    /**
     * @method
     * @name btse#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://docs.btse.com/spot/rest/get-fees
     * @see https://btsecom.github.io/docs/futuresV2_3/en/#query-account-fee
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name btse#fetchPositions
     * @description fetch all open positions
     * @see https://docs.btse.com/futures/rest/get-positions/
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name btse#fetchPositionsForSymbol
     * @description fetch open positions for a single market
     * @see https://docs.btse.com/futures/rest/get-positions/
     * @description fetch all open positions for specific symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositionsForSymbol(symbol: string, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    parseMarginModeType(marginMode: Str): Str;
    parsePositionSide(side: Str): Str;
    /**
     * @method
     * @name btse#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for btse is set identically for all linear markets or all inverse markets
     * @see https://docs.btse.com/futures/rest/get-position-mode
     * @param {string} symbol unified symbol of the market to fetch entry for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    fetchPositionMode(symbol?: Str, params?: {}): Promise<PositionModeInfo>;
    /**
     * @method
     * @name btse#setPositionMode
     * @description NB!!! This method also sets margin mode to cross on btse. Set hedged to true or false for a cross-margin market.
     * @see https://docs.btse.com/futures/rest/change-position-mode
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol unified symbol of the market to set position mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name btse#fetchMarginMode
     * @description fetches the margin mode of a specific symbol
     * @see https://docs.btse.com/futures/rest/get-leverage
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    fetchMarginMode(symbol: string, params?: {}): Promise<MarginMode>;
    parseMarginMode(marginMode: Dict, market?: Market): MarginMode;
    /**
     * @method
     * @name btse#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://docs.btse.com/futures/rest/change-position-mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.hedged] set to true to use dualSidePosition, required for setting marginMode to cross on btse
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name btse#closePosition
     * @description closes an open position for a market
     * @see https://docs.btse.com/futures/rest/close-position/
     * @param {string} symbol unified CCXT market symbol
     * @param {string} [side] not used by btse
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionId] the id of the position to close, mandatory
     * @param {string} [params.type] 'limit' or 'market' (default is 'market')
     * @param {float} [params.price] required if params.type is 'limit'
     * @param {bool} [params.postOnly] true if the order should be post only
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name btse#fetchLeverage
     * @description fetch the leverage for a market
     * @see https://docs.btse.com/futures/rest/get-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name btse#setLeverage
     * @description set the level of leverage for a market
     * @see https://docs.btse.com/futures/rest/change-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionMode] ONE_WAY or HEDGE, defaults to ONE_WAY on the exchange side when omitted
     * @param {string} [params.positionDirection] LONG or SHORT, identifies the side to update in hedge mode
     * @param {string} [params.positionId] existing position id to update, disambiguates the target position in hedge mode
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<Dict>;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    futuresRequestId(market: any): string;
    cleanPath(path: string): string;
    nonce(): number;
}
