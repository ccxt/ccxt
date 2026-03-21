import Exchange from './abstract/bydfi.js';
import type { Balances, Currency, Dict, FundingRate, FundingRateHistory, Int, int, Leverage, MarginMode, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Position, Str, Strings, Trade, Transaction, TransferEntry, Ticker, Tickers } from './base/types.js';
/**
 * @class bydfi
 * @augments Exchange
 */
export default class bydfi extends Exchange {
    describe(): any;
    /**
     * @method
     * @name bydfi#fetchMarkets
     * @description retrieves data on all markets for bydfi
     * @see https://developers.bydfi.com/en/swap/market#fetching-trading-rules-and-pairs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name bydfi#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.bydfi.com/en/swap/market#depth-information
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return, could be 5, 10, 20, 50, 100, 500 or 1000 (default 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    getClosestLimit(limit: Int): Int;
    /**
     * @method
     * @name bydfi#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://developers.bydfi.com/en/swap/market#recent-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch (default 500, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.fromId] retrieve from which trade ID to start. Default to retrieve the most recent trade records
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bydfi#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://developers.bydfi.com/en/swap/trade#historical-trades-query
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet
     * @param {string} [params.orderType] order type ('LIMIT', 'MARKET', 'LIQ', 'LIMIT_CLOSE', 'MARKET_CLOSE', 'STOP', 'TAKE_PROFIT', 'STOP_MARKET', 'TAKE_PROFIT_MARKET' or 'TRAILING_STOP_MARKET')
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    parseTradeType(type: Str): Str;
    /**
     * @method
     * @name bydfi#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.bydfi.com/en/swap/market#candlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (max 500)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bydfi#fetchTickers
     * @see https://developers.bydfi.com/en/swap/market#24hr-price-change-statistics
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bydfi#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developers.bydfi.com/en/swap/market#24hr-price-change-statistics
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bydfi#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://developers.bydfi.com/en/swap/market#recent-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name bydfi#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://developers.bydfi.com/en/swap/market#historical-funding-rates
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
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
     * @name bydfi#createOrder
     * @description create a trade order
     * @see https://developers.bydfi.com/en/swap/trade#placing-an-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @param {bool} [params.hedged] true for hedged mode, false for one way mode, default is false
     * @param {string} [params.clientOrderId] Custom order ID, must be unique for open orders
     * @param {string} [params.timeInForce] 'GTC' (Good Till Cancelled), 'FOK' (Fill Or Kill), 'IOC' (Immediate Or Cancel), 'PO' (Post Only)
     * @param {bool} [params.postOnly] true or false, whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false, true or false whether the order is reduce-only
     * @param {float} [params.stopLossPrice] The price a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price a take profit order is triggered at
     * @param {float} [params.trailingTriggerPrice] the price to activate a trailing order, default uses the price argument or market price if price is not provided
     * @param {float} [params.trailingPercent] the percent to trail away from the current market price
     * @param {string} [params.triggerPriceType] 'MARK_PRICE' or 'CONTRACT_PRICE', default is 'CONTRACT_PRICE', the price type used to trigger stop orders
     * @param {bool} [params.closePosition] true or false, whether to close all positions after triggering, only supported in STOP_MARKET and TAKE_PROFIT_MARKET; not used with quantity;
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    encodeWorkingType(workingType: Str): Str;
    /**
     * @method
     * @name bydfi#createOrders
     * @description create a list of trade orders
     * @see https://developers.bydfi.com/en/swap/trade#batch-order-placement
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bydfi#editOrder
     * @description edit a trade order
     * @see https://developers.bydfi.com/en/swap/trade#order-modification
     * @param {string} id order id (mandatory if params.clientOrderId is not provided)
     * @param {string} [symbol] unified symbol of the market to create an order in
     * @param {string} [type] not used by bydfi editOrder
     * @param {string} [side] 'buy' or 'sell'
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price for the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique identifier for the order (could be alternative to id)
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bydfi#editOrders
     * @description edit a list of trade orders
     * @see https://developers.bydfi.com/en/swap/trade#batch-order-modification
     * @param {Array} orders list of orders to edit, each object should contain the parameters required by editOrder, namely id, symbol, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createEditOrderRequest(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): any;
    /**
     * @method
     * @name bydfi#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://developers.bydfi.com/en/swap/trade#complete-order-cancellation
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bydfi#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://developers.bydfi.com/en/swap/trade#pending-order-query
     * @see https://developers.bydfi.com/en/swap/trade#planned-order-query
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true or false, whether to fetch conditional orders only
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bydfi#fetchOpenOrder
     * @description fetch an open order by the id
     * @see https://developers.bydfi.com/en/swap/trade#pending-order-query
     * @see https://developers.bydfi.com/en/swap/trade#planned-order-query
     * @param {string} id order id (mandatory if params.clientOrderId is not provided)
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true or false, whether to fetch conditional orders only
     * @param {string} [params.clientOrderId] a unique identifier for the order (could be alternative to id)
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bydfi#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and closed orders made by the user
     * @see https://developers.bydfi.com/en/swap/trade#historical-orders-query
     * @param {string} symbol unified market symbol of the closed orders
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the max number of closed orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest order
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet
     * @param {string} [params.orderType] order type ('LIMIT', 'MARKET', 'LIQ', 'LIMIT_CLOSE', 'MARKET_CLOSE', 'STOP', 'TAKE_PROFIT', 'STOP_MARKET', 'TAKE_PROFIT_MARKET' or 'TRAILING_STOP_MARKET')
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleSinceAndUntil(methodName: string, since?: Int, params?: {}): Dict;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderType(type: Str): Str;
    parseOrderTimeInForce(timeInForce: Str): Str;
    parseOrderStatus(status: Str): Str;
    /**
     * @method
     * @name bydfi#setLeverage
     * @description set the level of leverage for a market
     * @see https://developers.bydfi.com/en/swap/trade#set-leverage-for-single-trading-pair
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<import("./base/types.js").Dictionary<any>>;
    /**
     * @method
     * @name bydfi#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://developers.bydfi.com/en/swap/trade#get-leverage-for-single-trading-pair
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name bydfi#fetchPositions
     * @description fetch all open positions
     * @see https://developers.bydfi.com/en/swap/trade#positions-query
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.settleCoin] the settlement currency (USDT or USDC or USD)
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name bydfi#fetchPositionsForSymbol
     * @description fetch open positions for a single market
     * @see https://developers.bydfi.com/en/swap/trade#positions-query
     * @description fetch all open positions for specific symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositionsForSymbol(symbol: string, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    parsePositionSide(side: Str): Str;
    /**
     * @method
     * @name bydfi#fetchPositionHistory
     * @description fetches historical positions
     * @see https://developers.bydfi.com/en/swap/trade#query-historical-position-profit-and-loss-records
     * @param {string} symbol a unified market symbol
     * @param {int} [since] timestamp in ms of the earliest position to fetch , params["until"] - since <= 7 days
     * @param {int} [limit] the maximum amount of records to fetch (default 500, max 500)
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest position to fetch , params["until"] - since <= 7 days
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositionHistory(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name bydfi#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://developers.bydfi.com/en/swap/trade#query-historical-position-profit-and-loss-records
     * @param {string[]} symbols a list of unified market symbols
     * @param {int} [since] timestamp in ms of the earliest position to fetch , params["until"] - since <= 7 days
     * @param {int} [limit] the maximum amount of records to fetch (default 500, max 500)
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest position to fetch , params["until"] - since <= 7 days
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositionsHistory(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name bydfi#fetchMarginMode
     * @description fetches the margin mode of a trading pair
     * @see https://developers.bydfi.com/en/swap/user#margin-mode-query
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    fetchMarginMode(symbol: string, params?: {}): Promise<MarginMode>;
    parseMarginMode(marginMode: Dict, market?: Market): MarginMode;
    /**
     * @method
     * @name bydfi#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://developers.bydfi.com/en/swap/user#change-margin-type-cross-margin
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bydfi#setPositionMode
     * @description set hedged to true or false for a market, hedged for bydfi is set identically for all markets with same settle currency
     * @see https://developers.bydfi.com/en/swap/user#change-position-mode-dual
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} [symbol] not used by bydfi setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @param {string} [params.settleCoin] The settlement currency - USDT or USDC or USD (default is USDT)
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bydfi#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for bydfi is set identically for all markets with same settle currency
     * @see https://developers.bydfi.com/en/swap/user#get-position-mode
     * @param {string} [symbol] unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.contractType] FUTURE or DELIVERY, default is FUTURE
     * @param {string} [params.wallet] The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @param {string} [params.settleCoin] The settlement currency - USDT or USDC or USD (default is USDT or settle currency of the market if market is provided)
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    fetchPositionMode(symbol?: Str, params?: {}): Promise<{
        info: any;
        hedged: boolean;
    }>;
    /**
     * @method
     * @name bydfi#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developers.bydfi.com/en/account#asset-inquiry
     * @see https://developers.bydfi.com/en/swap/user#asset-query
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountType] the type of account to fetch the balance for, either 'spot' or 'swap'  or 'funding' (default is 'spot')
     * @param {string} [params.wallet] *swap only* The unique code of a sub-wallet. W001 is the default wallet and the main wallet code of the contract
     * @param {string} [params.asset] currency id for the balance to fetch
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name budfi#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://developers.bydfi.com/en/account#asset-transfer-between-accounts
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'spot', 'funding', or 'swap'
     * @param {string} toAccount 'spot', 'funding', or 'swap'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name bydfi#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://developers.bydfi.com/en/account#query-wallet-transfer-records
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve (default 10)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    paraseTransferStatus(status: Str): Str;
    /**
     * @method
     * @name bydfi#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://developers.bydfi.com/en/spot/account#query-deposit-records
     * @param {string} code unified currency code (mandatory)
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bydfi#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://developers.bydfi.com/en/spot/account#query-withdrawal-records
     * @param {string} code unified currency code (mandatory)
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    fetchTransactionsHelper(type: any, code: any, since: any, limit: any, params: any): Promise<any[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): Str;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
