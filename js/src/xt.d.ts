import Exchange from './abstract/xt.js';
import { Currencies, Currency, Dict, FundingHistory, FundingRateHistory, Int, LeverageTier, MarginModification, Market, Num, OHLCV, Order, OrderSide, OrderType, Str, Tickers, Transaction, TransferEntry, LedgerEntry, FundingRate, DepositAddress, LeverageTiers } from './base/types.js';
/**
 * @class xt
 * @augments Exchange
 */
export default class xt extends Exchange {
    describe(): any;
    nonce(): number;
    /**
     * @method
     * @name xt#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the xt server
     * @see https://doc.xt.com/#market1serverInfo
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {int} the current integer timestamp in milliseconds from the xt server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name xt#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://doc.xt.com/#deposit_withdrawalsupportedCurrenciesGet
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name xt#fetchMarkets
     * @description retrieves data on all markets for xt
     * @see https://doc.xt.com/#market2symbol
     * @see https://doc.xt.com/#futures_quotesgetSymbols
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchSpotMarkets(params?: {}): Promise<any[]>;
    fetchSwapAndFutureMarkets(params?: {}): Promise<any[]>;
    parseMarkets(markets: any): any[];
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name xt#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://doc.xt.com/#market4kline
     * @see https://doc.xt.com/#futures_quotesgetKLine
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name xt#fetchOrderBook
     * @see https://doc.xt.com/#market3depth
     * @see https://doc.xt.com/#futures_quotesgetDepth
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified market symbol to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    /**
     * @method
     * @name xt#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://doc.xt.com/#market10ticker24h
     * @see https://doc.xt.com/#futures_quotesgetAggTicker
     * @param {string} symbol unified market symbol to fetch the ticker for
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<import("./base/types.js").Ticker>;
    /**
     * @method
     * @name xt#fetchTickers
     * @description fetches price tickers for multiple markets, statistical calculations with the information calculated over the past 24 hours each market
     * @see https://doc.xt.com/#market10ticker24h
     * @see https://doc.xt.com/#futures_quotesgetAggTickers
     * @param {string} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} an array of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
     */
    fetchTickers(symbols?: string[], params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name xt#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://doc.xt.com/#market9tickerBook
     * @param {string} [symbols] unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/en/latest/manual.html#ticker-structure}
     */
    fetchBidsAsks(symbols?: string[], params?: {}): Promise<Tickers>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    /**
     * @method
     * @name xt#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://doc.xt.com/#market5tradeRecent
     * @see https://doc.xt.com/#futures_quotesgetDeal
     * @param {string} symbol unified market symbol to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    /**
     * @method
     * @name xt#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://doc.xt.com/#tradetradeGet
     * @see https://doc.xt.com/#futures_ordergetTrades
     * @param {string} [symbol] unified market symbol to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/en/latest/manual.html?#public-trades}
     */
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    /**
     * @method
     * @name xt#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://doc.xt.com/#balancebalancesGet
     * @see https://doc.xt.com/#futures_usergetBalances
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/en/latest/manual.html?#balance-structure}
     */
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    parseBalance(response: any): import("./base/types.js").Balances;
    /**
     * @method
     * @name xt#createMarketBuyOrderWithCost
     * @see https://doc.xt.com/#orderorderPost
     * @description create a market buy order by providing the symbol and cost
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name xt#createOrder
     * @description create a trade order
     * @see https://doc.xt.com/#orderorderPost
     * @see https://doc.xt.com/#futures_ordercreate
     * @see https://doc.xt.com/#futures_entrustcreatePlan
     * @see https://doc.xt.com/#futures_entrustcreateProfit
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price to fulfill the order, in units of the quote currency, can be ignored in market orders
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK' or 'GTX'
     * @param {string} [params.entrustType] 'TAKE_PROFIT', 'STOP', 'TAKE_PROFIT_MARKET', 'STOP_MARKET', 'TRAILING_STOP_MARKET', required if stopPrice is defined, currently isn't functioning on xt's side
     * @param {string} [params.triggerPriceType] 'INDEX_PRICE', 'MARK_PRICE', 'LATEST_PRICE', required if stopPrice is defined
     * @param {float} [params.triggerPrice] price to trigger a stop order
     * @param {float} [params.stopPrice] alias for triggerPrice
     * @param {float} [params.stopLoss] price to set a stop-loss on an open position
     * @param {float} [params.takeProfit] price to set a take-profit on an open position
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createSpotOrder(symbol: string, type: any, side: any, amount: any, price?: any, params?: {}): Promise<Order>;
    createContractOrder(symbol: string, type: any, side: any, amount: any, price?: any, params?: {}): Promise<Order>;
    /**
     * @method
     * @name xt#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://doc.xt.com/#orderorderGet
     * @see https://doc.xt.com/#futures_ordergetById
     * @see https://doc.xt.com/#futures_entrustgetPlanById
     * @see https://doc.xt.com/#futures_entrustgetProfitById
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {bool} [params.trigger] if the order is a trigger order or not
     * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    /**
     * @method
     * @name xt#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://doc.xt.com/#orderhistoryOrderGet
     * @see https://doc.xt.com/#futures_ordergetHistory
     * @see https://doc.xt.com/#futures_entrustgetPlanHistory
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {bool} [params.trigger] if the order is a trigger order or not
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    fetchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    fetchOrdersByStatus(status: any, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name xt#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://doc.xt.com/#orderopenOrderGet
     * @see https://doc.xt.com/#futures_ordergetOrders
     * @see https://doc.xt.com/#futures_entrustgetPlan
     * @see https://doc.xt.com/#futures_entrustgetProfit
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {bool} [params.trigger] if the order is a trigger order or not
     * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name xt#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://doc.xt.com/#orderhistoryOrderGet
     * @see https://doc.xt.com/#futures_ordergetOrders
     * @see https://doc.xt.com/#futures_entrustgetPlan
     * @see https://doc.xt.com/#futures_entrustgetProfit
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {bool} [params.trigger] if the order is a trigger order or not
     * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    fetchClosedOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name xt#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://doc.xt.com/#orderhistoryOrderGet
     * @see https://doc.xt.com/#futures_ordergetOrders
     * @see https://doc.xt.com/#futures_entrustgetPlan
     * @see https://doc.xt.com/#futures_entrustgetProfit
     * @param {string} [symbol] unified market symbol of the market the orders were made in
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {bool} [params.trigger] if the order is a trigger order or not
     * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    fetchCanceledOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name xt#cancelOrder
     * @description cancels an open order
     * @see https://doc.xt.com/#orderorderDel
     * @see https://doc.xt.com/#futures_ordercancel
     * @see https://doc.xt.com/#futures_entrustcancelPlan
     * @see https://doc.xt.com/#futures_entrustcancelProfit
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {bool} [params.trigger] if the order is a trigger order or not
     * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<Order>;
    /**
     * @method
     * @name xt#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://doc.xt.com/#orderopenOrderDel
     * @see https://doc.xt.com/#futures_ordercancelBatch
     * @see https://doc.xt.com/#futures_entrustcancelPlanBatch
     * @see https://doc.xt.com/#futures_entrustcancelProfitBatch
     * @param {string} [symbol] unified market symbol of the market to cancel orders in
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {bool} [params.trigger] if the order is a trigger order or not
     * @param {bool} [params.stopLossTakeProfit] if the order is a stop-loss or take-profit order
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    cancelAllOrders(symbol?: string, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name xt#cancelOrders
     * @description cancel multiple orders
     * @see https://doc.xt.com/#orderbatchOrderDel
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol of the market to cancel orders in
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/en/latest/manual.html#order-structure}
     */
    cancelOrders(ids: string[], symbol?: string, params?: {}): Promise<Order[]>;
    parseOrder(order: any, market?: any): Order;
    parseOrderStatus(status: any): string;
    /**
     * @method
     * @name xt#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://doc.xt.com/#futures_usergetBalanceBill
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/en/latest/manual.html#ledger-structure}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: any, currency?: any): LedgerEntry;
    parseLedgerEntryType(type: any): string;
    /**
     * @method
     * @name xt#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://doc.xt.com/#deposit_withdrawaldepositAddressGet
     * @param {string} code unified currency code
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {string} params.network required network id
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/en/latest/manual.html#address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: any): DepositAddress;
    /**
     * @method
     * @name xt#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://doc.xt.com/#deposit_withdrawalhistoryDepositGet
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name xt#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://doc.xt.com/#deposit_withdrawalwithdrawHistory
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name xt#withdraw
     * @description make a withdrawal
     * @see https://doc.xt.com/#deposit_withdrawalwithdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag]
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/en/latest/manual.html#transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: any): string;
    /**
     * @method
     * @name xt#setLeverage
     * @description set the level of leverage for a market
     * @see https://doc.xt.com/#futures_useradjustLeverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {string} params.positionSide 'LONG' or 'SHORT'
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: string, params?: {}): Promise<any>;
    /**
     * @method
     * @name xt#addMargin
     * @description add margin to a position
     * @see https://doc.xt.com/#futures_useradjustMargin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {string} params.positionSide 'LONG' or 'SHORT'
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name xt#reduceMargin
     * @description remove margin from a position
     * @see https://doc.xt.com/#futures_useradjustMargin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} params extra parameters specific to the xt api endpoint
     * @param {string} params.positionSide 'LONG' or 'SHORT'
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    modifyMarginHelper(symbol: string, amount: any, addOrReduce: any, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: any, market?: any): MarginModification;
    /**
     * @method
     * @name xt#fetchLeverageTiers
     * @description retrieve information on the maximum leverage for different trade sizes
     * @see https://doc.xt.com/#futures_quotesgetLeverageBrackets
     * @param {string} [symbols] a list of unified market symbols
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
     */
    fetchLeverageTiers(symbols?: string[], params?: {}): Promise<LeverageTiers>;
    parseLeverageTiers(response: any, symbols?: any, marketIdKey?: any): LeverageTiers;
    /**
     * @method
     * @name xt#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage for different trade sizes of a single market
     * @see https://doc.xt.com/#futures_quotesgetLeverageBracket
     * @param {string} symbol unified market symbol
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
     */
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    parseMarketLeverageTiers(info: any, market?: any): LeverageTier[];
    /**
     * @method
     * @name xt#fetchFundingRateHistory
     * @description fetches historical funding rates
     * @see https://doc.xt.com/#futures_quotesgetFundingRateRecord
     * @param {string} [symbol] unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures] to fetch
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/en/latest/manual.html?#funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name xt#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://doc.xt.com/#futures_quotesgetFundingRate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingInterval(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name xt#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://doc.xt.com/#futures_quotesgetFundingRate
     * @param {string} symbol unified market symbol
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    parseFundingRate(contract: any, market?: any): FundingRate;
    /**
     * @method
     * @name xt#fetchFundingHistory
     * @description fetch the funding history
     * @see https://doc.xt.com/#futures_usergetFunding
     * @param {string} symbol unified market symbol
     * @param {int} [since] the starting timestamp in milliseconds
     * @param {int} [limit] the number of entries to return
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} a list of [funding history structures]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingHistory(contract: any, market?: any): {
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
     * @name xt#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://doc.xt.com/#futures_usergetPosition
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    /**
     * @method
     * @name xt#fetchPositions
     * @description fetch all open positions
     * @see https://doc.xt.com/#futures_usergetPosition
     * @param {string} [symbols] list of unified market symbols, not supported with xt
     * @param {object} params extra parameters specific to the xt api endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: string[], params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: any): import("./base/types.js").Position;
    /**
     * @method
     * @name xt#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://doc.xt.com/#transfersubTransferPost
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from -  spot, swap, leverage, finance
     * @param {string} toAccount account to transfer to - spot, swap, leverage, finance
     * @param {object} params extra parameters specific to the whitebit api endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: any, currency?: any): {
        info: any;
        id: string;
        timestamp: any;
        datetime: any;
        currency: any;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: any;
    };
    /**
     * @method
     * @name xt#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://doc.xt.com/#futures_userchangePositionType
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} [symbol] required
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionSide] *required* "long" or "short"
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
}
