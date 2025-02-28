import Exchange from './abstract/binance.js';
import type { TransferEntry, Int, OrderSide, Balances, OrderType, Trade, OHLCV, Order, FundingRateHistory, OpenInterest, Liquidation, OrderRequest, Str, Transaction, Ticker, OrderBook, Tickers, Market, Greeks, Strings, Currency, MarketInterface, MarginMode, MarginModes, Leverage, Leverages, Num, Option, MarginModification, TradingFeeInterface, Currencies, TradingFees, Conversion, CrossBorrowRate, IsolatedBorrowRates, IsolatedBorrowRate, Dict, LeverageTier, LeverageTiers, int, LedgerEntry, FundingRate, FundingRates, DepositAddress, LongShortRatio, BorrowInterest } from './base/types.js';
/**
 * @class binance
 * @augments Exchange
 */
export default class binance extends Exchange {
    describe(): any;
    isInverse(type: string, subType?: Str): boolean;
    isLinear(type: string, subType?: Str): boolean;
    setSandboxMode(enable: boolean): void;
    createExpiredOptionMarket(symbol: string): MarketInterface;
    market(symbol: string): MarketInterface;
    safeMarket(marketId?: Str, market?: Market, delimiter?: Str, marketType?: Str): MarketInterface;
    costToPrecision(symbol: any, cost: any): string;
    currencyToPrecision(code: any, fee: any, networkCode?: any): string;
    nonce(): number;
    /**
     * @method
     * @name binance#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#check-server-time                            // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Check-Server-Time    // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Check-Server-time             // future
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name binance#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://developers.binance.com/docs/wallet/capital/all-coins-info
     * @see https://developers.binance.com/docs/margin_trading/market-data/Get-All-Margin-Assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name binance#fetchMarkets
     * @description retrieves data on all markets for binance
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#exchange-information                             // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Exchange-Information     // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Exchange-Information              // future
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Exchange-Information                             // option
     * @see https://developers.binance.com/docs/margin_trading/market-data/Get-All-Cross-Margin-Pairs                             // cross margin
     * @see https://developers.binance.com/docs/margin_trading/market-data/Get-All-Isolated-Margin-Symbol                             // isolated margin
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseBalanceHelper(entry: any): import("./base/types.js").BalanceAccount;
    parseBalanceCustom(response: any, type?: any, marginMode?: any, isPortfolioMargin?: boolean): Balances;
    /**
     * @method
     * @name binance#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#account-information-user_data                    // spot
     * @see https://developers.binance.com/docs/margin_trading/account/Query-Cross-Margin-Account-Details                       // cross margin
     * @see https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Account-Info                       // isolated margin
     * @see https://developers.binance.com/docs/wallet/asset/funding-wallet                                                     // funding
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Futures-Account-Balance-V2   // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/Futures-Account-Balance               // future
     * @see https://developers.binance.com/docs/derivatives/option/account/Option-Account-Information                           // option
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Account-Balance                            // portfolio margin
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'future', 'delivery', 'savings', 'funding', or 'spot' or 'papi'
     * @param {string} [params.marginMode] 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
     * @param {string[]|undefined} [params.symbols] unified market symbols, only used in isolated margin mode
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the balance for a portfolio margin account
     * @param {string} [params.subType] 'linear' or 'inverse'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name binance#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#order-book                           // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Order-Book   // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Order-Book            // future
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Order-Book                           // option
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name binance#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://developers.binance.com/docs/wallet/others/system-status
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
     * @name binance#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#24hr-ticker-price-change-statistics                           // spot
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#rolling-window-price-change-statistics                        // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics   // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/24hr-Ticker-Price-Change-Statistics            // future
     * @see https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics                           // option
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.rolling] (spot only) default false, if true, uses the rolling 24 hour ticker endpoint /api/v3/ticker
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name binance#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#symbol-order-book-ticker                         // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Order-Book-Ticker // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Symbol-Order-Book-Ticker          // future
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name binance#fetchLastPrices
     * @description fetches the last price for multiple markets
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#symbol-price-ticker                          // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Symbol-Price-Ticker  // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Symbol-Price-Ticker           // future
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the last prices
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of lastprices structures
     */
    fetchLastPrices(symbols?: Strings, params?: {}): Promise<import("./base/types.js").LastPrices>;
    parseLastPrice(entry: any, market?: Market): {
        symbol: string;
        timestamp: number;
        datetime: string;
        price: number;
        side: any;
        info: any;
    };
    /**
     * @method
     * @name binance#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#24hr-ticker-price-change-statistics                          // spot
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/24hr-Ticker-Price-Change-Statistics  // swap
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/24hr-Ticker-Price-Change-Statistics           // future
     * @see https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics                          // option
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @param {string} [params.type] 'spot', 'option', use params["subType"] for swap and future markets
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name binance#fetchMarkPrice
     * @description fetches mark price for the market
     * @see https://binance-docs.github.io/apidocs/futures/en/#mark-price
     * @see https://binance-docs.github.io/apidocs/delivery/en/#index-price-and-mark-price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name binance#fetchMarkPrices
     * @description fetches mark prices for multiple markets
     * @see https://binance-docs.github.io/apidocs/futures/en/#mark-price
     * @see https://binance-docs.github.io/apidocs/delivery/en/#index-price-and-mark-price
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name binance#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#klinecandlestick-data
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Index-Price-Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price-Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Premium-Index-Kline-Data
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Index-Price-Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Mark-Price-Kline-Candlestick-Data
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Premium-Index-Kline-Data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.price] "mark" or "index" for mark price and index price candles
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name binance#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * Default fetchTradesMethod
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#compressedaggregate-trades-list                          // publicGetAggTrades (spot)
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Compressed-Aggregate-Trades-List // fapiPublicGetAggTrades (swap)
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Compressed-Aggregate-Trades-List          // dapiPublicGetAggTrades (future)
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Recent-Trades-List                                       // eapiPublicGetTrades (option)
     * Other fetchTradesMethod
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#recent-trades-list                                       // publicGetTrades (spot)
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Recent-Trades-List               // fapiPublicGetTrades (swap)
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Recent-Trades-List                        // dapiPublicGetTrades (future)
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#old-trade-lookup                                         // publicGetHistoricalTrades (spot)
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Old-Trades-Lookup                // fapiPublicGetHistoricalTrades (swap)
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Old-Trades-Lookup                         // dapiPublicGetHistoricalTrades (future)
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Old-Trades-Lookup                                        // eapiPublicGetHistoricalTrades (option)
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] only used when fetchTradesMethod is 'publicGetAggTrades', 'fapiPublicGetAggTrades', or 'dapiPublicGetAggTrades'
     * @param {int} [limit] default 500, max 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] only used when fetchTradesMethod is 'publicGetAggTrades', 'fapiPublicGetAggTrades', or 'dapiPublicGetAggTrades'
     * @param {int} [params.fetchTradesMethod] 'publicGetAggTrades' (spot default), 'fapiPublicGetAggTrades' (swap default), 'dapiPublicGetAggTrades' (future default), 'eapiPublicGetTrades' (option default), 'publicGetTrades', 'fapiPublicGetTrades', 'dapiPublicGetTrades', 'publicGetHistoricalTrades', 'fapiPublicGetHistoricalTrades', 'dapiPublicGetHistoricalTrades', 'eapiPublicGetHistoricalTrades'
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.fromId] trade id to fetch from, default gets most recent trades, not used when fetchTradesMethod is 'publicGetTrades', 'fapiPublicGetTrades', 'dapiPublicGetTrades', or 'eapiPublicGetTrades'
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name binance#editSpotOrder
     * @ignore
     * @description edit a trade order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#cancel-an-existing-order-and-send-a-new-order-trade
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editSpotOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    editSpotOrderRequest(id: string, symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    editContractOrderRequest(id: string, symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Dict;
    /**
     * @method
     * @name binance#editContractOrder
     * @description edit a trade order
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Modify-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Modify-UM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Modify-CM-Order
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to edit an order in a portfolio margin account
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editContractOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name binance#editOrder
     * @description edit a trade order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#cancel-an-existing-order-and-send-a-new-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Modify-Order
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name binance#editOrders
     * @description edit a list of trade orders
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Multiple-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Modify-Multiple-Orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name binance#createOrders
     * @description *contract only* create a list of trade orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Place-Multiple-Orders
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Place-Multiple-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Place-Multiple-Orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name binance#createOrder
     * @description create a trade order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/trading-endpoints#new-order-trade
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api/public-api-endpoints#test-new-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/New-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/New-Order
     * @see https://developers.binance.com/docs/derivatives/option/trade/New-Order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#sor
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#test-new-order-using-sor-trade
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-UM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-CM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-Margin-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-UM-Conditional-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/New-CM-Conditional-Order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'STOP_LOSS' or 'STOP_LOSS_LIMIT' or 'TAKE_PROFIT' or 'TAKE_PROFIT_LIMIT' or 'STOP'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.reduceOnly] for swap and future reduceOnly is a string 'true' or 'false' that cant be sent with close position set to true or in hedge mode. For spot margin and option reduceOnly is a boolean.
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @param {boolean} [params.sor] *spot only* whether to use SOR (Smart Order Routing) or not, default is false
     * @param {boolean} [params.test] *spot only* whether to use the test endpoint or not, default is false
     * @param {float} [params.trailingPercent] the percent to trail away from the current market price
     * @param {float} [params.trailingTriggerPrice] the price to trigger a trailing order, default uses the price argument
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at
     * @param {float} [params.stopLossPrice] the price that a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price that a take profit order is triggered at
     * @param {boolean} [params.portfolioMargin] set to true if you would like to create an order in a portfolio margin account
     * @param {string} [params.selfTradePrevention] set unified value for stp (see .features for available values)
     * @param {float} [params.icebergAmount] set iceberg amount for limit orders
     * @param {string} [params.stopLossOrTakeProfit] 'stopLoss' or 'takeProfit', required for spot trailing orders
     * @param {string} [params.positionSide] *swap and portfolio margin only* "BOTH" for one-way mode, "LONG" for buy side of hedged mode, "SHORT" for sell side of hedged mode
     * @param {bool} [params.hedged] *swap and portfolio margin only* true for hedged mode, false for one way mode, default is false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name binance#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#new-order-trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketOrderWithCost(symbol: string, side: OrderSide, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name binance#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#new-order-trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name binance#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#new-order-trade
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name binance#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#query-order-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Query-Order
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Single-Order
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-UM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-CM-Order
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch an order in a portfolio margin account
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name binance#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#all-orders-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/All-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch orders in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name binance#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#current-open-orders-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Current-All-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Current-All-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Current-Open-Option-Orders
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-UM-Open-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-Current-CM-Open-Conditional-Orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch open orders in the portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account conditional orders
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name binance#fetchOpenOrder
     * @description fetch an open order by the id
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Query-Current-Open-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Query-Current-Open-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-UM-Open-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-UM-Open-Conditional-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-CM-Open-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Current-CM-Open-Conditional-Order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.trigger] set to true if you would like to fetch portfolio margin account stop or conditional orders
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch for a portfolio margin account
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name binance#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#all-orders-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/All-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch orders in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name binance#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#all-orders-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/All-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch orders in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#all-orders-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/All-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/All-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Query-Option-Order-History
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-All-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-UM-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-All-CM-Conditional-Orders
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch orders in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to fetch portfolio margin account trigger or conditional orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name binance#cancelOrder
     * @description cancels an open order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#cancel-order-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-Order
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Cancel-Order
     * @see https://developers.binance.com/docs/derivatives/option/trade/Cancel-Option-Order
     * @see https://developers.binance.com/docs/margin_trading/trade/Margin-Account-Cancel-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-UM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-CM-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-UM-Conditional-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-CM-Conditional-Order
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-Margin-Account-Order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to cancel an order in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to cancel a portfolio margin account conditional order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name binance#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#cancel-all-open-orders-on-a-symbol-trade
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-All-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/option/trade/Cancel-all-Option-orders-on-specific-symbol
     * @see https://developers.binance.com/docs/margin_trading/trade/Margin-Account-Cancel-All-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-UM-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-UM-Open-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-CM-Open-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-All-CM-Open-Conditional-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Cancel-Margin-Account-All-Open-Orders-on-a-Symbol
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @param {boolean} [params.portfolioMargin] set to true if you would like to cancel orders in a portfolio margin account
     * @param {boolean} [params.trigger] set to true if you would like to cancel portfolio margin account conditional orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name binance#cancelOrders
     * @description cancel multiple orders
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Cancel-Multiple-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Cancel-Multiple-Orders
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string[]} [params.origClientOrderIdList] max length 10 e.g. ["my_id_1","my_id_2"], encode the double quotes. No space after comma
     * @param {int[]} [params.recvWindow]
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name binance#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#account-trade-list-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Account-Trade-List
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Account-Trade-List
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Trade-List
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name binance#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://developers.binance.com/docs/binance-spot-api-docs/rest-api#account-trade-list-user_data
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Account-Trade-List
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Account-Trade-List
     * @see https://developers.binance.com/docs/margin_trading/trade/Query-Margin-Account-Trade-List
     * @see https://developers.binance.com/docs/derivatives/option/trade/Account-Trade-List
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/UM-Account-Trade-List
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/CM-Account-Trade-List
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch trades for a portfolio margin account
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name binance#fetchMyDustTrades
     * @description fetch all dust trades made by the user
     * @see https://developers.binance.com/docs/wallet/asset/dust-log
     * @param {string} symbol not used by binance fetchMyDustTrades ()
     * @param {int} [since] the earliest time in ms to fetch my dust trades for
     * @param {int} [limit] the maximum number of dust trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'margin', default spot
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyDustTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseDustTrade(trade: any, market?: Market): {
        id: any;
        timestamp: number;
        datetime: string;
        symbol: any;
        order: string;
        type: any;
        takerOrMaker: any;
        side: any;
        amount: number;
        price: number;
        cost: number;
        fee: {
            currency: any;
            cost: number;
        };
        info: any;
    };
    /**
     * @method
     * @name binance#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://developers.binance.com/docs/wallet/capital/deposite-history
     * @see https://developers.binance.com/docs/fiat/rest-api/Get-Fiat-Deposit-Withdraw-History
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.fiat] if true, only fiat deposits will be returned
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name binance#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://developers.binance.com/docs/wallet/capital/withdraw-history
     * @see https://developers.binance.com/docs/fiat/rest-api/Get-Fiat-Deposit-Withdraw-History
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.fiat] if true, only fiat withdrawals will be returned
     * @param {int} [params.until] the latest time in ms to fetch withdrawals for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatusByType(status: any, type?: any): any;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransferStatus(status: Str): Str;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseIncome(income: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number;
        datetime: string;
        id: string;
        amount: number;
    };
    /**
     * @method
     * @name binance#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://developers.binance.com/docs/wallet/asset/user-universal-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] exchange specific transfer type
     * @param {string} [params.symbol] the unified symbol, required for isolated margin transfers
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name binance#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://developers.binance.com/docs/wallet/asset/query-user-universal-transfer
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.internal] default false, when true will fetch pay trade history
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name binance#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://developers.binance.com/docs/wallet/capital/deposite-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] network for fetch deposit address
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(response: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name binance#fetchTransactionFees
     * @deprecated
     * @description please use fetchDepositWithdrawFees instead
     * @see https://developers.binance.com/docs/wallet/capital/all-coins-info
     * @param {string[]|undefined} codes not used by binance fetchTransactionFees ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTransactionFees(codes?: Strings, params?: {}): Promise<{
        withdraw: Dict;
        deposit: {};
        info: any;
    }>;
    /**
     * @method
     * @name binance#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://developers.binance.com/docs/wallet/capital/all-coins-info
     * @param {string[]|undefined} codes not used by binance fetchDepositWithdrawFees ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    /**
     * @method
     * @name binance#withdraw
     * @description make a withdrawal
     * @see https://developers.binance.com/docs/wallet/capital/withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name binance#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://developers.binance.com/docs/wallet/asset/trade-fee
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/User-Commission-Rate
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/User-Commission-Rate
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-User-Commission-Rate-for-UM
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-User-Commission-Rate-for-CM
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch trading fees in a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name binance#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://developers.binance.com/docs/wallet/asset/trade-fee
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/Account-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Config
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name binance#futuresTransfer
     * @ignore
     * @description transfer between futures account
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/New-Future-Account-Transfer
     * @param {string} code unified currency code
     * @param {float} amount the amount to transfer
     * @param {string} type 1 - transfer from spot account to USDT-Ⓜ futures account, 2 - transfer from USDT-Ⓜ futures account to spot account, 3 - transfer from spot account to COIN-Ⓜ futures account, 4 - transfer from COIN-Ⓜ futures account to spot account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} params.recvWindow
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=futures-transfer-structure}
     */
    futuresTransfer(code: string, amount: any, type: any, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name binance#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Index-Price-and-Mark-Price
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name binance#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Rate-History
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Get-Funding-Rate-History-of-Perpetual-Futures
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
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
     * @name binance#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Mark-Price
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Index-Price-and-Mark-Price
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    parseAccountPositions(account: any, filterClosed?: boolean): any[];
    parseAccountPosition(position: any, market?: Market): {
        info: any;
        id: any;
        symbol: string;
        timestamp: number;
        datetime: string;
        initialMargin: number;
        initialMarginPercentage: number;
        maintenanceMargin: number;
        maintenanceMarginPercentage: number;
        entryPrice: number;
        notional: number;
        leverage: number;
        unrealizedPnl: number;
        contracts: number;
        contractSize: any;
        marginRatio: any;
        liquidationPrice: any;
        markPrice: any;
        collateral: number;
        marginMode: any;
        side: any;
        hedged: boolean;
        percentage: any;
    };
    parsePositionRisk(position: any, market?: Market): {
        info: any;
        id: any;
        symbol: string;
        contracts: number;
        contractSize: any;
        unrealizedPnl: number;
        leverage: number;
        liquidationPrice: number;
        collateral: number;
        notional: number;
        markPrice: number;
        entryPrice: number;
        timestamp: number;
        initialMargin: number;
        initialMarginPercentage: number;
        maintenanceMargin: number;
        maintenanceMarginPercentage: number;
        marginRatio: any;
        datetime: string;
        marginMode: string;
        marginType: string;
        side: any;
        hedged: boolean;
        percentage: any;
        stopLossPrice: any;
        takeProfitPrice: any;
    };
    loadLeverageBrackets(reload?: boolean, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Notional-and-Leverage-Brackets
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/Notional-Bracket-for-Symbol
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/UM-Notional-and-Leverage-Brackets
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/CM-Notional-and-Leverage-Brackets
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the leverage tiers for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    /**
     * @method
     * @name binance#fetchPosition
     * @description fetch data on an open position
     * @see https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    /**
     * @method
     * @name binance#fetchOptionPositions
     * @description fetch data on open options positions
     * @see https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchOptionPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: Dict, market?: Market): import("./base/types.js").Position;
    /**
     * @method
     * @name binance#fetchPositions
     * @description fetch all open positions
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/Account-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Position-Information
     * @see https://developers.binance.com/docs/derivatives/option/trade/Option-Position-Information
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] method name to call, "positionRisk", "account" or "option", default is "positionRisk"
     * @param {bool} [params.useV2] set to true if you want to use the obsolete endpoint, where some more additional fields were provided
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    /**
     * @method
     * @name binance#fetchAccountPositions
     * @ignore
     * @description fetch account positions
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/Account-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Position-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V3
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch positions in a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @param {boolean} [params.filterClosed] set to true if you would like to filter out closed positions, default is false
     * @param {boolean} [params.useV2] set to true if you want to use obsolete endpoint, where some more additional fields were provided
     * @returns {object} data on account positions
     */
    fetchAccountPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    /**
     * @method
     * @name binance#fetchPositionsRisk
     * @ignore
     * @description fetch positions risk
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Position-Information
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Query-UM-Position-Information
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Query-CM-Position-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Position-Information-V3
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch positions for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @param {bool} [params.useV2] set to true if you want to use the obsolete endpoint, where some more additional fields were provided
     * @returns {object} data on the positions risk
     */
    fetchPositionsRisk(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    /**
     * @method
     * @name binance#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Income-History
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/Get-Income-History
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Income-History
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Income-History
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding history entry
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the funding history for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").FundingHistory[]>;
    /**
     * @method
     * @name binance#setLeverage
     * @description set the level of leverage for a market
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Initial-Leverage
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Change-Initial-Leverage
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Change-UM-Initial-Leverage
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Change-CM-Initial-Leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to set the leverage for a trading pair in a portfolio margin account
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Margin-Type
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Change-Margin-Type
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Change-Position-Mode
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Change-Position-Mode
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Current-Position-Mode
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Current-Position-Mode
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by binance setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to set the position mode for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#fetchLeverages
     * @description fetch the set leverage for all markets
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/Account-Information
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Account-Detail
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Account-Detail
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverages(symbols?: Strings, params?: {}): Promise<Leverages>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name binance#fetchSettlementHistory
     * @description fetches historical settlement records
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Historical-Exercise-Records
     * @param {string} symbol unified market symbol of the settlement history
     * @param {int} [since] timestamp in ms
     * @param {int} [limit] number of records, default 100, max 100
     * @param {object} [params] exchange specific params
     * @returns {object[]} a list of [settlement history objects]{@link https://docs.ccxt.com/#/?id=settlement-history-structure}
     */
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#fetchMySettlementHistory
     * @description fetches historical settlement records of the user
     * @see https://developers.binance.com/docs/derivatives/option/trade/User-Exercise-Record
     * @param {string} symbol unified market symbol of the settlement history
     * @param {int} [since] timestamp in ms
     * @param {int} [limit] number of records
     * @param {object} [params] exchange specific params
     * @returns {object[]} a list of [settlement history objects]
     */
    fetchMySettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseSettlement(settlement: any, market: any): {
        info: any;
        symbol: string;
        price: number;
        timestamp: number;
        datetime: string;
    };
    parseSettlements(settlements: any, market: any): any[];
    /**
     * @method
     * @name binance#fetchLedgerEntry
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://developers.binance.com/docs/derivatives/option/account/Account-Funding-Flow
     * @param {string} id the identification number of the ledger entry
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedgerEntry(id: string, code?: Str, params?: {}): Promise<LedgerEntry>;
    /**
     * @method
     * @name binance#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://developers.binance.com/docs/derivatives/option/account/Account-Funding-Flow
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Income-History
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/Get-Income-History
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-UM-Income-History
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-CM-Income-History
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the ledger for a portfolio margin account
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: any): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    getExceptionsByUrl(url: string, exactOrBroad: string): import("./base/types.js").Dictionary<any>;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
    request(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any, config?: {}): Promise<any>;
    modifyMarginHelper(symbol: string, amount: any, addOrReduce: any, params?: {}): Promise<any>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name binance#reduceMargin
     * @description remove margin from a position
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Modify-Isolated-Position-Margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name binance#addMargin
     * @description add margin
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Modify-Isolated-Position-Margin
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Modify-Isolated-Position-Margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name binance#fetchCrossBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Query-Margin-Interest-Rate-History
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    fetchCrossBorrowRate(code: string, params?: {}): Promise<CrossBorrowRate>;
    /**
     * @method
     * @name binance#fetchIsolatedBorrowRate
     * @description fetch the rate of interest to borrow a currency for margin trading
     * @see https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Fee-Data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {object} [params.vipLevel] user's current specific margin data will be returned if viplevel is omitted
     * @returns {object} an [isolated borrow rate structure]{@link https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure}
     */
    fetchIsolatedBorrowRate(symbol: string, params?: {}): Promise<IsolatedBorrowRate>;
    /**
     * @method
     * @name binance#fetchIsolatedBorrowRates
     * @description fetch the borrow interest rates of all currencies
     * @see https://developers.binance.com/docs/margin_trading/account/Query-Isolated-Margin-Fee-Data
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.symbol] unified market symbol
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {object} [params.vipLevel] user's current specific margin data will be returned if viplevel is omitted
     * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    fetchIsolatedBorrowRates(params?: {}): Promise<IsolatedBorrowRates>;
    /**
     * @method
     * @name binance#fetchBorrowRateHistory
     * @description retrieves a history of a currencies borrow interest rate at specific time slots
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Query-Margin-Interest-Rate-History
     * @param {string} code unified currency code
     * @param {int} [since] timestamp for the earliest borrow rate
     * @param {int} [limit] the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    fetchBorrowRateHistory(code: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowRate(info: any, currency?: Currency): {
        currency: string;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    parseIsolatedBorrowRate(info: Dict, market?: Market): IsolatedBorrowRate;
    /**
     * @method
     * @name binance#createGiftCode
     * @description create gift code
     * @see https://developers.binance.com/docs/gift_card/market-data/Create-a-single-token-gift-card
     * @param {string} code gift code
     * @param {float} amount amount of currency for the gift
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} The gift code id, code, currency and amount
     */
    createGiftCode(code: string, amount: any, params?: {}): Promise<{
        info: any;
        id: string;
        code: string;
        currency: string;
        amount: any;
    }>;
    /**
     * @method
     * @name binance#redeemGiftCode
     * @description redeem gift code
     * @see https://developers.binance.com/docs/gift_card/market-data/Redeem-a-Binance-Gift-Card
     * @param {string} giftcardCode
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    redeemGiftCode(giftcardCode: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#verifyGiftCode
     * @description verify gift code
     * @see https://developers.binance.com/docs/gift_card/market-data/Verify-Binance-Gift-Card-by-Gift-Card-Number
     * @param {string} id reference number id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    verifyGiftCode(id: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name binance#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Get-Interest-History
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/account/Get-Margin-BorrowLoan-Interest-History
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol when fetch interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch the borrow interest in a portfolio margin account
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name binance#repayCrossMargin
     * @description repay borrowed margin and interest
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Repay
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Repay-Debt
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to repay margin in a portfolio margin account
     * @param {string} [params.repayCrossMarginMethod] *portfolio margin only* 'papiPostRepayLoan' (default), 'papiPostMarginRepayDebt' (alternative)
     * @param {string} [params.specifyRepayAssets] *portfolio margin papiPostMarginRepayDebt only* specific asset list to repay debt
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayCrossMargin(code: string, amount: any, params?: {}): Promise<{
        id: number;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    /**
     * @method
     * @name binance#repayIsolatedMargin
     * @description repay borrowed margin and interest
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
     * @param {string} symbol unified market symbol, required for isolated margin
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayIsolatedMargin(symbol: string, code: string, amount: any, params?: {}): Promise<{
        id: number;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    /**
     * @method
     * @name binance#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Margin-Account-Borrow
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.portfolioMargin] set to true if you would like to borrow margin in a portfolio margin account
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowCrossMargin(code: string, amount: number, params?: {}): Promise<{
        id: number;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    /**
     * @method
     * @name binance#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://developers.binance.com/docs/margin_trading/borrow-and-repay/Margin-Account-Borrow-Repay
     * @param {string} symbol unified market symbol, required for isolated margin
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowIsolatedMargin(symbol: string, code: string, amount: number, params?: {}): Promise<{
        id: number;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: number;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    };
    /**
     * @method
     * @name binance#fetchOpenInterestHistory
     * @description Retrieves the open interest history of a currency
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Open-Interest-Statistics
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Open-Interest-Statistics
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} timeframe "5m","15m","30m","1h","2h","4h","6h","12h", or "1d"
     * @param {int} [since] the time(ms) of the earliest record to retrieve as a unix timestamp
     * @param {int} [limit] default 30, max 500
     * @param {object} [params] exchange specific parameters
     * @param {int} [params.until] the time(ms) of the latest record to retrieve as a unix timestamp
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an array of [open interest structure]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OpenInterest[]>;
    /**
     * @method
     * @name binance#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Open-Interest
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Open-Interest
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Open-Interest
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): OpenInterest;
    /**
     * @method
     * @name binance#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://developers.binance.com/docs/margin_trading/trade/Get-Force-Liquidation-Record
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Users-Force-Orders
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Users-Force-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-UM-Force-Orders
     * @see https://developers.binance.com/docs/derivatives/portfolio-margin/trade/Query-Users-CM-Force-Orders
     * @param {string} [symbol] unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the binance api endpoint
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @param {boolean} [params.paginate] *spot only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {boolean} [params.portfolioMargin] set to true if you would like to fetch liquidations in a portfolio margin account
     * @param {string} [params.type] "spot"
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): Liquidation;
    /**
     * @method
     * @name binance#fetchGreeks
     * @description fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
     * @see https://developers.binance.com/docs/derivatives/option/market-data/Option-Mark-Price
     * @param {string} symbol unified symbol of the market to fetch greeks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
     */
    fetchGreeks(symbol: string, params?: {}): Promise<Greeks>;
    parseGreeks(greeks: Dict, market?: Market): Greeks;
    fetchTradingLimits(symbols?: Strings, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name binance#fetchPositionMode
     * @description fetchs the position mode, hedged or one way, hedged for binance is set identically for all linear markets or all inverse markets
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Get-Current-Position-Mode
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/Get-Current-Position-Mode
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    fetchPositionMode(symbol?: Str, params?: {}): Promise<{
        info: any;
        hedged: boolean;
    }>;
    /**
     * @method
     * @name binance#fetchMarginModes
     * @description fetches margin modes ("isolated" or "cross") that the market for the symbol in in, with symbol=undefined all markets for a subType (linear/inverse) are returned
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/Account-Information
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Account-Information-V2
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    fetchMarginModes(symbols?: Strings, params?: {}): Promise<MarginModes>;
    /**
     * @method
     * @name binance#fetchMarginMode
     * @description fetches the margin mode of a specific symbol
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/account/rest-api/Symbol-Config
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/account/Account-Information
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    fetchMarginMode(symbol: string, params?: {}): Promise<MarginMode>;
    parseMarginMode(marginMode: Dict, market?: any): MarginMode;
    /**
     * @method
     * @name binance#fetchOption
     * @description fetches option data that is commonly found in an option chain
     * @see https://developers.binance.com/docs/derivatives/option/market-data/24hr-Ticker-Price-Change-Statistics
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [option chain structure]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    fetchOption(symbol: string, params?: {}): Promise<Option>;
    parseOption(chain: Dict, currency?: Currency, market?: Market): Option;
    /**
     * @method
     * @name binance#fetchMarginAdjustmentHistory
     * @description fetches the history of margin added or reduced from contract isolated positions
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/trade/rest-api/Get-Position-Margin-Change-History
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/trade/Get-Position-Margin-Change-History
     * @param {string} symbol unified market symbol
     * @param {string} [type] "add" or "reduce"
     * @param {int} [since] timestamp in ms of the earliest change to fetch
     * @param {int} [limit] the maximum amount of changes to fetch
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] timestamp in ms of the latest change to fetch
     * @returns {object[]} a list of [margin structures]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    fetchMarginAdjustmentHistory(symbol?: Str, type?: Str, since?: Num, limit?: Num, params?: {}): Promise<MarginModification[]>;
    /**
     * @method
     * @name binance#fetchConvertCurrencies
     * @description fetches all available currencies that can be converted
     * @see https://developers.binance.com/docs/convert/market-data/Query-order-quantity-precision-per-asset
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchConvertCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name binance#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://developers.binance.com/docs/convert/trade/Send-quote-request
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} amount how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.walletType] either 'SPOT' or 'FUNDING', the default is 'SPOT'
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertQuote(fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name binance#createConvertTrade
     * @description convert from one currency to another
     * @see https://developers.binance.com/docs/convert/trade/Accept-Quote
     * @param {string} id the id of the trade that you want to make
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} [amount] how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    createConvertTrade(id: string, fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name binance#fetchConvertTrade
     * @description fetch the data for a conversion trade
     * @see https://developers.binance.com/docs/convert/trade/Order-Status
     * @param {string} id the id of the trade that you want to fetch
     * @param {string} [code] the unified currency code of the conversion trade
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertTrade(id: string, code?: Str, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name binance#fetchConvertTradeHistory
     * @description fetch the users history of conversion trades
     * @see https://developers.binance.com/docs/convert/trade/Get-Convert-Trade-History
     * @param {string} [code] the unified currency code
     * @param {int} [since] the earliest time in ms to fetch conversions for
     * @param {int} [limit] the maximum number of conversion structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest conversion to fetch
     * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertTradeHistory(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Conversion[]>;
    parseConversion(conversion: Dict, fromCurrency?: Currency, toCurrency?: Currency): Conversion;
    /**
     * @method
     * @name binance#fetchFundingIntervals
     * @description fetch the funding rate interval for multiple markets
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Get-Funding-Info
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Get-Funding-Info
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] "linear" or "inverse"
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingIntervals(symbols?: Strings, params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name binance#fetchLongShortRatioHistory
     * @description fetches the long short ratio history for a unified market symbol
     * @see https://developers.binance.com/docs/derivatives/usds-margined-futures/market-data/rest-api/Long-Short-Ratio
     * @see https://developers.binance.com/docs/derivatives/coin-margined-futures/market-data/Long-Short-Ratio
     * @param {string} symbol unified symbol of the market to fetch the long short ratio for
     * @param {string} [timeframe] the period for the ratio, default is 24 hours
     * @param {int} [since] the earliest time in ms to fetch ratios for
     * @param {int} [limit] the maximum number of long short ratio structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ratio to fetch
     * @returns {object[]} an array of [long short ratio structures]{@link https://docs.ccxt.com/#/?id=long-short-ratio-structure}
     */
    fetchLongShortRatioHistory(symbol?: Str, timeframe?: Str, since?: Int, limit?: Int, params?: {}): Promise<LongShortRatio[]>;
    parseLongShortRatio(info: Dict, market?: Market): LongShortRatio;
}
