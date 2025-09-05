import Exchange from './abstract/htx.js';
import type { TransferEntry, Int, OrderSide, OrderType, Order, OHLCV, Trade, FundingRateHistory, Balances, Str, Dict, Transaction, Ticker, OrderBook, Tickers, OrderRequest, Strings, Market, Currency, Num, Account, TradingFeeInterface, Currencies, IsolatedBorrowRates, IsolatedBorrowRate, LeverageTiers, LeverageTier, int, LedgerEntry, FundingRate, FundingRates, DepositAddress, BorrowInterest, OpenInterests, Position } from './base/types.js';
/**
 * @class htx
 * @augments Exchange
 */
export default class htx extends Exchange {
    describe(): any;
    /**
     * @method
     * @name htx#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-system-status
     * @see https://huobiapi.github.io/docs/dm/v1/en/#get-system-status
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-system-status
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#get-system-status
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#query-whether-the-system-is-available  // contractPublicGetHeartbeat
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<{
        status: any;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    /**
     * @method
     * @name htx#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-current-timestamp
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-current-system-timestamp
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name htx#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-current-fee-rate-applied-to-the-user
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    fetchTradingLimits(symbols?: Strings, params?: {}): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name htx#fetchTradingLimitsById
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-current-fee-rate-applied-to-the-user
     * @param {string} id market id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the limits object of a market structure
     */
    fetchTradingLimitsById(id: string, params?: {}): Promise<{
        info: any;
        limits: {
            amount: {
                min: number;
                max: number;
            };
        };
    }>;
    parseTradingLimits(limits: any, symbol?: Str, params?: {}): {
        info: any;
        limits: {
            amount: {
                min: number;
                max: number;
            };
        };
    };
    costToPrecision(symbol: any, cost: any): string;
    /**
     * @method
     * @name htx#fetchMarkets
     * @description retrieves data on all markets for huobi
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-all-supported-trading-symbol-v1-deprecated
     * @see https://huobiapi.github.io/docs/dm/v1/en/#get-contract-info
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-swap-info
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-swap-info
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @ignore
     * @method
     * @name htx#fetchMarketsByTypeAndSubType
     * @description retrieves data on all markets of a certain type and/or subtype
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-all-supported-trading-symbol-v1-deprecated
     * @see https://huobiapi.github.io/docs/dm/v1/en/#get-contract-info
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-swap-info
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-swap-info
     * @param {string} [type] 'spot', 'swap' or 'future'
     * @param {string} [subType] 'linear' or 'inverse'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarketsByTypeAndSubType(type: Str, subType: Str, params?: {}): Promise<any[]>;
    tryGetSymbolFromFutureMarkets(symbolOrMarketId: string): any;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name htx#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-latest-aggregated-ticker
     * @see https://huobiapi.github.io/docs/dm/v1/en/#get-market-data-overview
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-market-data-overview
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-get-market-data-overview
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name htx#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-latest-tickers-for-all-pairs
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-get-a-batch-of-market-data-overview
     * @see https://huobiapi.github.io/docs/dm/v1/en/#get-a-batch-of-market-data-overview
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-a-batch-of-market-data-overview-v2
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name htx#fetchLastPrices
     * @description fetches the last price for multiple markets
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=8cb81024-77b5-11ed-9966-0242ac110003 linear swap & linear future
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=28c2e8fc-77ae-11ed-9966-0242ac110003 inverse future
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=5d517ef5-77b6-11ed-9966-0242ac110003 inverse swap
     * @param {string[]} [symbols] unified symbols of the markets to fetch the last prices
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of lastprices structures
     */
    fetchLastPrices(symbols?: Strings, params?: {}): Promise<import("./base/types.js").LastPrices>;
    parseLastPrice(entry: any, market?: Market): {
        symbol: string;
        timestamp: any;
        datetime: any;
        price: number;
        side: string;
        info: any;
    };
    /**
     * @method
     * @name htx#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-market-depth
     * @see https://huobiapi.github.io/docs/dm/v1/en/#get-market-depth
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-market-depth
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-get-market-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name htx#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-the-match-result-of-an-order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @ignore
     * @method
     * @name htx#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-the-match-result-of-an-order
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchSpotOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name htx#fetchMyTrades
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-get-history-match-results-via-multiple-fields-new
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-get-history-match-results-via-multiple-fields-new
     * @see https://huobiapi.github.io/docs/spot/v1/en/#search-match-results
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name htx#fetchTrades
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-the-most-recent-trades
     * @see https://huobiapi.github.io/docs/dm/v1/en/#query-a-batch-of-trade-records-of-a-contract
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-a-batch-of-trade-records-of-a-contract
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-a-batch-of-trade-records-of-a-contract
     * @description get the list of most recent trades for a particular symbol
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name htx#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-klines-candles
     * @see https://huobiapi.github.io/docs/dm/v1/en/#get-kline-data
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-kline-data
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-get-kline-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.useHistoricalEndpointForSpot] true/false - whether use the historical candles endpoint for spot markets or default klines endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name htx#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-all-accounts-of-the-current-user
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: any): {
        info: any;
        id: string;
        type: any;
        code: any;
    };
    /**
     * @method
     * @name htx#fetchAccountIdByType
     * @description fetch all the accounts by a type and marginModeassociated with a profile
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-all-accounts-of-the-current-user
     * @param {string} type 'spot', 'swap' or 'future
     * @param {string} [marginMode] 'cross' or 'isolated'
     * @param {string} [symbol] unified ccxt market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccountIdByType(type: string, marginMode?: Str, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name htx#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://huobiapi.github.io/docs/spot/v1/en/#apiv2-currency-amp-chains
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    networkIdToCode(networkId?: Str, currencyCode?: Str): string;
    networkCodeToId(networkCode: string, currencyCode?: Str): any;
    /**
     * @method
     * @name htx#fetchBalance
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-account-balance-of-a-specific-account
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec4b429-7773-11ed-9966-0242ac110003
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=10000074-77b7-11ed-9966-0242ac110003
     * @see https://huobiapi.github.io/docs/dm/v1/en/#query-asset-valuation
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-user-s-account-information
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-query-user-s-account-information
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-query-user-39-s-account-information
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.unified] provide this parameter if you have a recent account with unified cross+isolated margin account
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name htx#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-the-order-detail-of-an-order-based-on-client-order-id
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-the-order-detail-of-an-order
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-get-information-of-an-order
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-get-information-of-order
     * @see https://huobiapi.github.io/docs/dm/v1/en/#get-information-of-an-order
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-information-of-an-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseMarginBalanceHelper(balance: any, code: any, result: any): any;
    fetchSpotOrdersByStates(states: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchSpotOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedSpotOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchContractOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchClosedContractOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name htx#fetchOrders
     * @see https://huobiapi.github.io/docs/spot/v1/en/#search-past-orders
     * @see https://huobiapi.github.io/docs/spot/v1/en/#search-historical-orders-within-48-hours
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-get-history-orders-new
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-get-history-orders-new
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-history-orders-new
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-history-orders-via-multiple-fields-new
     * @description fetches information on multiple orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] *contract only* if the orders are trigger trigger orders or not
     * @param {bool} [params.stopLossTakeProfit] *contract only* if the orders are stop-loss or take-profit orders
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.trailing] *contract only* set to true if you want to fetch trailing stop orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name htx#fetchClosedOrders
     * @see https://huobiapi.github.io/docs/spot/v1/en/#search-past-orders
     * @see https://huobiapi.github.io/docs/spot/v1/en/#search-historical-orders-within-48-hours
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-get-history-orders-new
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-get-history-orders-new
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-history-orders-new
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-history-orders-via-multiple-fields-new
     * @description fetches information on multiple closed orders made by the user
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name htx#fetchOpenOrders
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-all-open-orders
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-current-unfilled-order-acquisition
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-current-unfilled-order-acquisition
     * @description fetch all unfilled currently open orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] *contract only* if the orders are trigger trigger orders or not
     * @param {bool} [params.stopLossTakeProfit] *contract only* if the orders are stop-loss or take-profit orders
     * @param {boolean} [params.trailing] *contract only* set to true if you want to fetch trailing stop orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name htx#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec4ee16-7773-11ed-9966-0242ac110003
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name htx#createTrailingPercentOrder
     * @description create a trailing order by providing the symbol, type, side, amount, price and trailingPercent
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency, or number of contracts
     * @param {float} [price] the price for the order to be filled at, in units of the quote currency, ignored in market orders
     * @param {float} trailingPercent the percent to trail away from the current market price
     * @param {float} trailingTriggerPrice the price to activate a trailing order, default uses the price argument
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createTrailingPercentOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, trailingPercent?: any, trailingTriggerPrice?: any, params?: {}): Promise<Order>;
    /**
     * @method
     * @ignore
     * @name htx#createSpotOrderRequest
     * @description helper function to build request
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] supports 'IOC' and 'FOK'
     * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount for market buy orders
     * @returns {object} request to be sent to the exchange
     */
    createSpotOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<any>;
    createContractOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name htx#createOrder
     * @description create a trade order
     * @see https://huobiapi.github.io/docs/spot/v1/en/#place-a-new-order                   // spot, margin
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#place-an-order        // coin-m swap
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#place-trigger-order   // coin-m swap trigger
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-place-an-order           // usdt-m swap cross
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-place-trigger-order      // usdt-m swap cross trigger
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-place-an-order        // usdt-m swap isolated
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-place-trigger-order   // usdt-m swap isolated trigger
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-set-a-take-profit-and-stop-loss-order-for-an-existing-position
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-set-a-take-profit-and-stop-loss-order-for-an-existing-position
     * @see https://huobiapi.github.io/docs/dm/v1/en/#place-an-order                        // coin-m futures
     * @see https://huobiapi.github.io/docs/dm/v1/en/#place-trigger-order                   // coin-m futures contract trigger
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price a trigger order is triggered at
     * @param {string} [params.triggerType] *contract trigger orders only* ge: greater than or equal to, le: less than or equal to
     * @param {float} [params.stopLossPrice] *contract only* the price a stop-loss order is triggered at
     * @param {float} [params.takeProfitPrice] *contract only* the price a take-profit order is triggered at
     * @param {string} [params.operator] *spot and margin only* gte or lte, trigger price condition
     * @param {string} [params.offset] *contract only* 'both' (linear only), 'open', or 'close', required in hedge mode and for inverse markets
     * @param {bool} [params.postOnly] *contract only* true or false
     * @param {int} [params.leverRate] *contract only* required for all contract orders except tpsl, leverage greater than 20x requires prior approval of high-leverage agreement
     * @param {string} [params.timeInForce] supports 'IOC' and 'FOK'
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {float} [params.trailingPercent] *contract only* the percent to trail away from the current market price
     * @param {float} [params.trailingTriggerPrice] *contract only* the price to trigger a trailing order, default uses the price argument
     * @param {bool} [params.hedged] *contract only* true for hedged mode, false for one way mode, default is false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name htx#createOrders
     * @description create a list of trade orders
     * @see https://huobiapi.github.io/docs/spot/v1/en/#place-a-batch-of-orders
     * @see https://huobiapi.github.io/docs/dm/v1/en/#place-a-batch-of-orders
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#place-a-batch-of-orders
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-place-a-batch-of-orders
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-place-a-batch-of-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name htx#cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] *contract only* if the order is a trigger trigger order or not
     * @param {boolean} [params.stopLossTakeProfit] *contract only* if the order is a stop-loss or take-profit order
     * @param {boolean} [params.trailing] *contract only* set to true if you want to cancel a trailing order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name htx#cancelOrders
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] *contract only* if the orders are trigger trigger orders or not
     * @param {bool} [params.stopLossTakeProfit] *contract only* if the orders are stop-loss or take-profit orders
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<any[]>;
    parseCancelOrders(orders: any): any[];
    /**
     * @method
     * @name htx#cancelAllOrders
     * @description cancel all open orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] *contract only* if the orders are trigger trigger orders or not
     * @param {boolean} [params.stopLossTakeProfit] *contract only* if the orders are stop-loss or take-profit orders
     * @param {boolean} [params.trailing] *contract only* set to true if you want to cancel all trailing orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any[]>;
    /**
     * @method
     * @name htx#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://huobiapi.github.io/docs/spot/v1/en/#dead-man-s-switch
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<any>;
    parseDepositAddress(depositAddress: any, currency?: Currency): {
        currency: string;
        address: string;
        tag: string;
        network: string;
        note: string;
        info: any;
    };
    /**
     * @method
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec50029-7773-11ed-9966-0242ac110003
     * @name htx#fetchDepositAddressesByNetwork
     * @description fetch a dictionary of addresses for a currency, indexed by network
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
     */
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    /**
     * @method
     * @name htx#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec50029-7773-11ed-9966-0242ac110003
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    fetchWithdrawAddresses(code: string, note?: any, networkCode?: any, params?: {}): Promise<any[]>;
    /**
     * @method
     * @name htx#fetchDeposits
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec4f050-7773-11ed-9966-0242ac110003
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
     * @name htx#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://huobiapi.github.io/docs/spot/v1/en/#search-for-existed-withdraws-and-deposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    /**
     * @method
     * @name htx#withdraw
     * @see https://www.htx.com/en-us/opend/newApiPages/?id=7ec4cc41-7773-11ed-9966-0242ac110003
     * @description make a withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name htx#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://huobiapi.github.io/docs/dm/v1/en/#transfer-margin-between-spot-account-and-future-account
     * @see https://huobiapi.github.io/docs/spot/v1/en/#transfer-fund-between-spot-account-and-future-contract-account
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-transfer-margin-between-spot-account-and-usdt-margined-contracts-account
     * @see https://huobiapi.github.io/docs/spot/v1/en/#transfer-asset-from-spot-trading-account-to-cross-margin-account-cross
     * @see https://huobiapi.github.io/docs/spot/v1/en/#transfer-asset-from-spot-trading-account-to-isolated-margin-account-isolated
     * @see https://huobiapi.github.io/docs/spot/v1/en/#transfer-asset-from-cross-margin-account-to-spot-trading-account-cross
     * @see https://huobiapi.github.io/docs/spot/v1/en/#transfer-asset-from-isolated-margin-account-to-spot-trading-account-isolated
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from 'spot', 'future', 'swap'
     * @param {string} toAccount account to transfer to 'spot', 'future', 'swap'
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] used for isolated margin transfer
     * @param {string} [params.subType] 'linear' or 'inverse', only used when transfering to/from swap accounts
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name htx#fetchIsolatedBorrowRates
     * @description fetch the borrow interest rates of all currencies
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-loan-interest-rate-and-quota-isolated
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [isolated borrow rate structures]{@link https://docs.ccxt.com/#/?id=isolated-borrow-rate-structure}
     */
    fetchIsolatedBorrowRates(params?: {}): Promise<IsolatedBorrowRates>;
    parseIsolatedBorrowRate(info: Dict, market?: Market): IsolatedBorrowRate;
    /**
     * @method
     * @name htx#fetchFundingRateHistory
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-historical-funding-rate
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-historical-funding-rate
     * @description fetches historical funding rate prices
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] not used by huobi, but filtered internally by ccxt
     * @param {int} [limit] not used by huobi, but filtered internally by ccxt
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    parseFundingInterval(interval: any): string;
    /**
     * @method
     * @name htx#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-funding-rate
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name htx#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-a-batch-of-funding-rate
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-a-batch-of-funding-rate
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name htx#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://huobiapi.github.io/docs/spot/v1/en/#search-past-margin-orders-cross
     * @see https://huobiapi.github.io/docs/spot/v1/en/#search-past-margin-orders-isolated
     * @param {string} code unified currency code
     * @param {string} symbol unified market symbol when fetch interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    /**
     * @method
     * @name htx#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-account-financial-records-via-multiple-fields-new   // linear swaps
     * @see https://huobiapi.github.io/docs/dm/v1/en/#query-financial-records-via-multiple-fields-new                          // coin-m futures
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-financial-records-via-multiple-fields-new          // coin-m swaps
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").FundingHistory[]>;
    /**
     * @method
     * @name htx#setLeverage
     * @description set the level of leverage for a market
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-switch-leverage
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-switch-leverage
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#switch-leverage
     * @see https://huobiapi.github.io/docs/dm/v1/en/#switch-leverage  // Coin-m futures
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    parseIncome(income: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number;
        datetime: string;
        id: string;
        amount: number;
    };
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name htx#fetchPositions
     * @description fetch all open positions
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-query-user-39-s-position-information
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-query-user-s-position-information
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-user-s-position-information
     * @see https://huobiapi.github.io/docs/dm/v1/en/#query-user-s-position-information
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subType] 'linear' or 'inverse'
     * @param {string} [params.type] *inverse only* 'future', or 'swap'
     * @param {string} [params.marginMode] *linear only* 'cross' or 'isolated'
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name htx#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-query-assets-and-positions
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-query-assets-and-positions
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-assets-and-positions
     * @see https://huobiapi.github.io/docs/dm/v1/en/#query-assets-and-positions
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    /**
     * @method
     * @name htx#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-account-history
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    /**
     * @method
     * @name htx#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    /**
     * @method
     * @name htx#fetchOpenInterestHistory
     * @description Retrieves the open interest history of a currency
     * @see https://huobiapi.github.io/docs/dm/v1/en/#query-information-on-open-interest
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-information-on-open-interest
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-information-on-open-interest
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} timeframe '1h', '4h', '12h', or '1d'
     * @param {int} [since] Not used by huobi api, but response parsed by CCXT
     * @param {int} [limit] Default：48，Data Range [1,200]
     * @param {object} [params] Exchange specific parameters
     * @param {int} [params.amount_type] *required* Open interest unit. 1-cont，2-cryptocurrency
     * @param {int} [params.pair] eg BTC-USDT *Only for USDT-M*
     * @returns {object} an array of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").OpenInterest[]>;
    /**
     * @method
     * @name htx#fetchOpenInterests
     * @description Retrieves the open interest for a list of symbols
     * @see https://huobiapi.github.io/docs/dm/v1/en/#get-contract-open-interest-information
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-swap-open-interest-information
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-get-swap-open-interest-information
     * @param {string[]} [symbols] a list of unified CCXT market symbols
     * @param {object} [params] exchange specific parameters
     * @returns {object[]} a list of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterests(symbols?: Strings, params?: {}): Promise<OpenInterests>;
    /**
     * @method
     * @name htx#fetchOpenInterest
     * @description Retrieves the open interest of a currency
     * @see https://huobiapi.github.io/docs/dm/v1/en/#get-contract-open-interest-information
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#get-swap-open-interest-information
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-get-swap-open-interest-information
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name htx#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://huobiapi.github.io/docs/spot/v1/en/#request-a-margin-loan-isolated
     * @see https://huobiapi.github.io/docs/spot/v1/en/#request-a-margin-loan-cross
     * @param {string} symbol unified market symbol, required for isolated margin
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowIsolatedMargin(symbol: string, code: string, amount: number, params?: {}): Promise<any>;
    /**
     * @method
     * @name htx#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://huobiapi.github.io/docs/spot/v1/en/#request-a-margin-loan-isolated
     * @see https://huobiapi.github.io/docs/spot/v1/en/#request-a-margin-loan-cross
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowCrossMargin(code: string, amount: number, params?: {}): Promise<any>;
    /**
     * @method
     * @name htx#repayIsolatedMargin
     * @description repay borrowed margin and interest
     * @see https://huobiapi.github.io/docs/spot/v1/en/#repay-margin-loan-cross-isolated
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayIsolatedMargin(symbol: string, code: string, amount: any, params?: {}): Promise<any>;
    /**
     * @method
     * @name htx#repayCrossMargin
     * @description repay borrowed margin and interest
     * @see https://huobiapi.github.io/docs/spot/v1/en/#repay-margin-loan-cross-isolated
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayCrossMargin(code: string, amount: any, params?: {}): Promise<any>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: string;
        currency: string;
        amount: any;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    };
    /**
     * @method
     * @name htx#fetchSettlementHistory
     * @description Fetches historical settlement records
     * @see https://huobiapi.github.io/docs/dm/v1/en/#query-historical-settlement-records-of-the-platform-interface
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-historical-settlement-records-of-the-platform-interface
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-historical-settlement-records-of-the-platform-interface
     * @param {string} symbol unified symbol of the market to fetch the settlement history for
     * @param {int} [since] timestamp in ms, value range = current time - 90 days，default = current time - 90 days
     * @param {int} [limit] page items, default 20, shall not exceed 50
     * @param {object} [params] exchange specific params
     * @param {int} [params.until] timestamp in ms, value range = start_time -> current time，default = current time
     * @param {int} [params.page_index] page index, default page 1 if not filled
     * @param {int} [params.code] unified currency code, can be used when symbol is undefined
     * @returns {object[]} a list of [settlement history objects]{@link https://docs.ccxt.com/#/?id=settlement-history-structure}
     */
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any[]>;
    /**
     * @method
     * @name htx#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://huobiapi.github.io/docs/spot/v1/en/#get-all-supported-currencies-v2
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    parseSettlements(settlements: any, market: any): any[];
    parseSettlement(settlement: any, market: any): {
        info: any;
        symbol: string;
        price: number;
        timestamp: number;
        datetime: string;
    };
    /**
     * @method
     * @name htx#fetchLiquidations
     * @description retrieves the public liquidations of a trading pair
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#general-query-liquidation-orders-new
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#query-liquidation-orders-new
     * @see https://huobiapi.github.io/docs/dm/v1/en/#query-liquidation-order-information-new
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the huobi api endpoint
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @param {int} [params.tradeType] default 0, linear swap 0: all liquidated orders, 5: liquidated longs; 6: liquidated shorts, inverse swap and future 0: filled liquidated orders, 5: liquidated close orders, 6: liquidated open orders
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    fetchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): import("./base/types.js").Liquidation;
    /**
     * @method
     * @name htx#closePositions
     * @description closes open positions for a contract market, requires 'amount' in params, unlike other exchanges
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-place-lightning-close-order  // USDT-M (isolated)
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-place-lightning-close-position  // USDT-M (cross)
     * @see https://huobiapi.github.io/docs/coin_margined_swap/v1/en/#place-lightning-close-order  // Coin-M swap
     * @see https://huobiapi.github.io/docs/dm/v1/en/#place-flash-close-order                      // Coin-M futures
     * @param {string} symbol unified CCXT market symbol
     * @param {string} side 'buy' or 'sell', the side of the closing order, opposite side as position side
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @param {string} [params.clientOrderId] client needs to provide unique API and have to maintain the API themselves afterwards. [1, 9223372036854775807]
     * @param {object} [params.marginMode] 'cross' or 'isolated', required for linear markets
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {number} [params.amount] order quantity
     * @param {string} [params.order_price_type] 'lightning' by default, 'lightning_fok': lightning fok type, 'lightning_ioc': lightning ioc type 'market' by default, 'market': market order type, 'lightning_fok': lightning
     * @returns {object} [an order structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name htx#setPositionMode
     * @description set hedged to true or false
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#isolated-switch-position-mode
     * @see https://huobiapi.github.io/docs/usdt_swap/v1/en/#cross-switch-position-mode
     * @param {bool} hedged set to true to for hedged mode, must be set separately for each market in isolated margin mode, only valid for linear markets
     * @param {string} [symbol] unified market symbol, required for isolated margin mode
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] "cross" (default) or "isolated"
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
}
