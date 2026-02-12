import Exchange from './abstract/bingx.js';
import type { LeverageTier, TransferEntry, Int, OrderSide, OHLCV, FundingRateHistory, Order, OrderType, OrderRequest, Str, Trade, Balances, Transaction, Ticker, OrderBook, Tickers, Market, Strings, Currency, Position, Dict, Leverage, MarginMode, Num, MarginModification, Currencies, int, TradingFeeInterface, FundingRate, FundingRates, DepositAddress, FundingHistory } from './base/types.js';
/**
 * @class bingx
 * @augments Exchange
 */
export default class bingx extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bingx#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the bingx server
     * @see https://bingx-api.github.io/docs/#/swapV2/base-info.html#Get%20Server%20Time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the bingx server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name bingx#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://bingx-api.github.io/docs/#/common/account-api.html#All%20Coins
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    fetchSpotMarkets(params: any): Promise<Market[]>;
    fetchSwapMarkets(params: any): Promise<import("./base/types.js").MarketInterface[]>;
    fetchInverseSwapMarkets(params: any): Promise<import("./base/types.js").MarketInterface[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name bingx#fetchMarkets
     * @description retrieves data on all markets for bingx
     * @see https://bingx-api.github.io/docs/#/spot/market-api.html#Query%20Symbols
     * @see https://bingx-api.github.io/docs/#/swapV2/market-api.html#Contract%20Information
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Contract%20Information
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name bingx#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://bingx-api.github.io/docs/#/swapV2/market-api.html#K-Line%20Data
     * @see https://bingx-api.github.io/docs/#/spot/market-api.html#Candlestick%20chart%20data
     * @see https://bingx-api.github.io/docs/#/swapV2/market-api.html#%20K-Line%20Data
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#Mark%20Price%20Kline/Candlestick%20Data
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Get%20K-line%20Data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bingx#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://bingx-api.github.io/docs/#/spot/market-api.html#Query%20transaction%20records
     * @see https://bingx-api.github.io/docs/#/swapV2/market-api.html#The%20latest%20Trade%20of%20a%20Trading%20Pair
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bingx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://bingx-api.github.io/docs/#/spot/market-api.html#Query%20depth%20information
     * @see https://bingx-api.github.io/docs/#/swapV2/market-api.html#Get%20Market%20Depth
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Query%20Depth%20Data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name bingx#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://bingx-api.github.io/docs/#/swapV2/market-api.html#Current%20Funding%20Rate
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Price%20&%20Current%20Funding%20Rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name bingx#fetchFundingRates
     * @description fetch the current funding rate for multiple symbols
     * @see https://bingx-api.github.io/docs/#/swapV2/market-api.html#Current%20Funding%20Rate
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name bingx#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://bingx-api.github.io/docs/#/swapV2/market-api.html#Funding%20Rate%20History
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRateHistory(contract: any, market?: Market): {
        info: any;
        symbol: string;
        fundingRate: number;
        timestamp: number;
        datetime: string;
    };
    /**
     * @method
     * @name bingx#fetchFundingHistory
     * @description fetches historical funding received
     * @see https://bingx-api.github.io/docs-v3/#/en/Swap/Account%20Endpoints/Get%20Account%20Profit%20and%20Loss%20Fund%20Flow
     * @param {string} symbol unified symbol of the market to fetch the funding history for
     * @param {int} [since] timestamp in ms of the earliest funding to fetch
     * @param {int} [limit] the maximum amount of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding to fetch
     * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseIncome(income: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number;
        datetime: string;
        id: string;
        amount: number;
        type: string;
    };
    /**
     * @method
     * @name bingx#fetchOpenInterest
     * @description retrieves the open interest of a trading pair
     * @see https://bingx-api.github.io/docs/#/swapV2/market-api.html#Get%20Swap%20Open%20Positions
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Get%20Swap%20Open%20Positions
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name bingx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#Get%20Ticker
     * @see https://bingx-api.github.io/docs/#/en-us/spot/market-api.html#24-hour%20price%20changes
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Query%2024-Hour%20Price%20Change
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bingx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#Get%20Ticker
     * @see https://bingx-api.github.io/docs/#/en-us/spot/market-api.html#24-hour%20price%20changes
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/market-api.html#Query%2024-Hour%20Price%20Change
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bingx#fetchMarkPrice
     * @description fetches mark prices for the market
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#Mark%20Price%20and%20Funding%20Rate
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bingx#fetchMarkPrices
     * @description fetches mark prices for multiple markets
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html#Mark%20Price%20and%20Funding%20Rate
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bingx#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://bingx-api.github.io/docs/#/spot/trade-api.html#Query%20Assets
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/account-api.html#Query%20account%20data
     * @see https://bingx-api.github.io/docs/#/standard/contract-interface.html#Query%20standard%20contract%20balance
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Account%20Assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.standard] whether to fetch standard contract balances
     * @param {string} [params.type] the type of balance to fetch (spot, swap, funding) default is `spot`
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bingx#fetchPositionHistory
     * @description fetches historical positions
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Position%20History
     * @param {string} symbol unified contract symbol
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum amount of records to fetch
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] the latest time in ms to fetch positions for
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositionHistory(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name bingx#fetchPositions
     * @description fetch all open positions
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/account-api.html#Query%20position%20data
     * @see https://bingx-api.github.io/docs/#/en-us/standard/contract-interface.html#position
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20warehouse
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.standard] whether to fetch standard contract positions
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name bingx#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/account-api.html#Query%20position%20data
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20warehouse
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name bingx#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createMarketOrderWithCost(symbol: string, side: OrderSide, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bingx#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bingx#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name bingx#createOrder
     * @description create a trade order
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Trade%20order
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Create%20an%20Order
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Trade%20order
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Place%20TWAP%20Order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {bool} [params.postOnly] true to place a post only order
     * @param {string} [params.timeInForce] spot supports 'PO', 'GTC' and 'IOC', swap supports 'PO', 'GTC', 'IOC' and 'FOK'
     * @param {bool} [params.reduceOnly] *swap only* true or false whether the order is reduce only
     * @param {float} [params.triggerPrice] triggerPrice at which the attached take profit / stop loss order will be triggered
     * @param {float} [params.stopLossPrice] stop loss trigger price
     * @param {float} [params.takeProfitPrice] take profit trigger price
     * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount
     * @param {float} [params.trailingAmount] *swap only* the quote amount to trail away from the current market price
     * @param {float} [params.trailingPercent] *swap only* the percent to trail away from the current market price
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {boolean} [params.test] *swap only* whether to use the test endpoint or not, default is false
     * @param {string} [params.positionSide] *contracts only* "BOTH" for one way mode, "LONG" for buy side of hedged mode, "SHORT" for sell side of hedged mode
     * @param {boolean} [params.hedged] *swap only* whether the order is in hedged mode or one way mode
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bingx#createOrders
     * @description create a list of trade orders
     * @see https://bingx-api.github.io/docs/#/spot/trade-api.html#Batch%20Placing%20Orders
     * @see https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Bulk%20order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.sync] *spot only* if true, multiple orders are ordered serially and all orders do not require the same symbol/side/type
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    parseOrderSide(side: any): string;
    parseOrderType(type: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    /**
     * @method
     * @name bingx#cancelOrder
     * @description cancels an open order
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Cancel%20Order
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Cancel%20Order
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Cancel%20an%20Order
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Cancel%20TWAP%20Order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bingx#cancelAllOrders
     * @description cancel all open orders
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Cancel%20orders%20by%20symbol
     * @see https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Cancel%20All%20Orders
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Cancel%20all%20orders
     * @param {string} [symbol] unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bingx#cancelOrders
     * @description cancel multiple orders
     * @see https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Cancel%20a%20Batch%20of%20Orders
     * @see https://bingx-api.github.io/docs/#/spot/trade-api.html#Cancel%20a%20Batch%20of%20Orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bingx#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Cancel%20all%20orders%20in%20countdown
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Cancel%20all%20orders%20in%20countdown
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap market
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name bingx#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20Order%20details
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Order%20details
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Order
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#TWAP%20Order%20Details
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.twap] if fetching twap order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bingx#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#All%20Orders
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Order%20history (returns less fields than above)
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {int} [params.orderId] Only return subsequent orders, and return the latest order by default
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bingx#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Current%20Open%20Orders
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Current%20All%20Open%20Orders
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20all%20current%20pending%20orders
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20TWAP%20Entrusted%20Order
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.twap] if fetching twap open orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bingx#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20Order%20history
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Order%20history
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#User's%20History%20Orders
     * @see https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order
     * @param {string} symbol unified market symbol of the closed orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of closed orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.standard] whether to fetch standard contract orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bingx#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20Order%20history
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Order%20history
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#User's%20History%20Orders
     * @see https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order
     * @param {string} symbol unified market symbol of the canceled orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of canceled orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.standard] whether to fetch standard contract orders
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bingx#fetchCanceledAndClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20Order%20history
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Order%20history
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#User's%20History%20Orders
     * @see https://bingx-api.github.io/docs/#/standard/contract-interface.html#Historical%20order
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20TWAP%20Historical%20Orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.standard] whether to fetch standard contract orders
     * @param {boolean} [params.twap] if fetching twap orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bingx#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://bingx-api.github.io/docs/#/en-us/common/account-api.html#Asset%20Transfer%20New
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from (spot, swap, futures, or funding)
     * @param {string} toAccount account to transfer to (spot, swap (linear or inverse), future, or funding)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name bingx#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://bingx-api.github.io/docs/#/en-us/common/account-api.html#Asset%20transfer%20records%20new
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve (default 10, max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.fromAccount (mandatory) transfer from (spot, swap (linear or inverse), future, or funding)
     * @param {string} params.toAccount (mandatory) transfer to (spot, swap(linear or inverse), future, or funding)
     * @param {boolean} [params.paginate] whether to paginate the results (default false)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): string;
    /**
     * @method
     * @name bingx#fetchDepositAddressesByNetwork
     * @description fetch the deposit addresses for a currency associated with this account
     * @see https://bingx-api.github.io/docs/#/en-us/common/wallet-api.html#Query%20Main%20Account%20Deposit%20Address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary [address structures]{@link https://docs.ccxt.com/?id=address-structure}, indexed by the network
     */
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    /**
     * @method
     * @name bingx#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://bingx-api.github.io/docs/#/en-us/common/wallet-api.html#Query%20Main%20Account%20Deposit%20Address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] The chain of currency. This only apply for multi-chain currency, and there is no need for single chain currency
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name bingx#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://bingx-api.github.io/docs/#/spot/account-api.html#Deposit%20History(supporting%20network)
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bingx#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://bingx-api.github.io/docs/#/spot/account-api.html#Withdraw%20History%20(supporting%20network)
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: string): string;
    /**
     * @method
     * @name bingx#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Change%20Margin%20Type
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Set%20Margin%20Type
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name bingx#setMargin
     * @description Either adds or reduces margin in an isolated position in order to set the margin to a specific value
     * @see https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Adjust%20isolated%20margin
     * @param {string} symbol unified market symbol of the market to set margin in
     * @param {float} amount the amount to set the margin to
     * @param {object} [params] parameters specific to the bingx api endpoint
     * @returns {object} A [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    setMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name bingx#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Query%20Leverage
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name bingx#setLeverage
     * @description set the level of leverage for a market
     * @see https://bingx-api.github.io/docs/#/swapV2/trade-api.html#Switch%20Leverage
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Modify%20Leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] hedged: ['long' or 'short']. one way: ['both']
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bingx#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20transaction%20details
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20historical%20transaction%20orders
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20historical%20transaction%20details
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Order%20Trade%20Detail
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is undefined
     * @param {string} params.trandingUnit COIN (directly represent assets such as BTC and ETH) or CONT (represents the number of contract sheets)
     * @param {string} params.orderId the order id required for inverse swap
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): Dict;
    /**
     * @method
     * @name bingx#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://bingx-api.github.io/docs/#/common/account-api.html#All%20Coins'%20Information
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name bingx#withdraw
     * @description make a withdrawal
     * @see https://bingx-api.github.io/docs/#/en-us/spot/wallet-api.html#Withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.walletType] 1 fund (funding) account, 2 standard account, 3 perpetual account, 15 spot account
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    parseParams(params: any): any;
    /**
     * @method
     * @name bingx#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://bingx-api.github.io/docs/#/swapV2/trade-api.html#User's%20Force%20Orders
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20force%20orders
     * @param {string} [symbol] unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the bingx api endpoint
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
     */
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): import("./base/types.js").Liquidation;
    /**
     * @method
     * @name bingx#closePosition
     * @description closes open positions for a market
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#One-Click%20Close%20All%20Positions
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Close%20all%20positions%20in%20bulk
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} [side] not used by bingx
     * @param {object} [params] extra parameters specific to the bingx api endpoint
     * @param {string|undefined} [params.positionId] the id of the position you would like to close
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitget#closePositions
     * @description closes open positions for a market
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#One-Click%20Close%20All%20Positions
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Close%20all%20positions%20in%20bulk
     * @param {object} [params] extra parameters specific to the bingx api endpoint
     * @param {string} [params.recvWindow] request valid time window value
     * @returns {object[]} [a list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    closeAllPositions(params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name bingx#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Get%20Position%20Mode
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    fetchPositionMode(symbol?: Str, params?: {}): Promise<{
        info: any;
        hedged: boolean;
    }>;
    /**
     * @method
     * @name bingx#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Set%20Position%20Mode
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by bingx setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bingx#editOrder
     * @description cancels an order and places a new order
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Cancel%20order%20and%20place%20a%20new%20order  // spot
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Cancel%20an%20order%20and%20then%20Place%20a%20new%20order  // swap
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.triggerPrice] Trigger price used for TAKE_STOP_LIMIT, TAKE_STOP_MARKET, TRIGGER_LIMIT, TRIGGER_MARKET order types.
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.cancelClientOrderID] the user-defined id of the order to be canceled, 1-40 characters, different orders cannot use the same clientOrderID, only supports a query range of 2 hours
     * @param {string} [params.cancelRestrictions] cancel orders with specified status, NEW: New order, PENDING: Pending order, PARTIALLY_FILLED: Partially filled
     * @param {string} [params.cancelReplaceMode] STOP_ON_FAILURE - if the cancel order fails, it will not continue to place a new order, ALLOW_FAILURE - regardless of whether the cancel order succeeds or fails, it will continue to place a new order
     * @param {float} [params.quoteOrderQty] order amount
     * @param {string} [params.newClientOrderId] custom order id consisting of letters, numbers, and _, 1-40 characters, different orders cannot use the same newClientOrderId.
     * @param {string} [params.positionSide] *contract only* position direction, required for single position as BOTH, for both long and short positions only LONG or SHORT can be chosen, defaults to LONG if empty
     * @param {string} [params.reduceOnly] *contract only* true or false, default=false for single position mode. this parameter is not accepted for both long and short positions mode
     * @param {float} [params.priceRate] *contract only* for type TRAILING_STOP_Market or TRAILING_TP_SL, Max = 1
     * @param {string} [params.workingType] *contract only* StopPrice trigger price types, MARK_PRICE (default), CONTRACT_PRICE, or INDEX_PRICE
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bingx#fetchMarginMode
     * @description fetches the margin mode of the trading pair
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Query%20Margin%20Type
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Margin%20Type
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    fetchMarginMode(symbol: string, params?: {}): Promise<MarginMode>;
    parseMarginMode(marginMode: Dict, market?: any): MarginMode;
    /**
     * @method
     * @name bingx#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://bingx-api.github.io/docs/#/en-us/spot/trade-api.html#Query%20Trading%20Commission%20Rate
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/account-api.html#Query%20Trading%20Commission%20Rate
     * @see https://bingx-api.github.io/docs/#/en-us/cswap/trade-api.html#Query%20Trade%20Commission%20Rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    customEncode(params: any): any;
    /**
     * @method
     * @name bingx#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, for different trade sizes for a single market
     * @see https://bingx-api.github.io/docs-v3/#/en/Swap/Trades%20Endpoints/Position%20and%20Maintenance%20Margin%20Ratio
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
     */
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    sign(path: any, section?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    nonce(): number;
    setSandboxMode(enable: boolean): void;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
