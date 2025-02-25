import Exchange from './abstract/phemex.js';
import type { TransferEntry, Balances, Currency, FundingHistory, FundingRateHistory, Int, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, MarginModification, Currencies, Dict, LeverageTier, LeverageTiers, int, FundingRate, DepositAddress, Conversion } from './base/types.js';
/**
 * @class phemex
 * @augments Exchange
 */
export default class phemex extends Exchange {
    describe(): any;
    parseSafeNumber(value?: any): any;
    parseSwapMarket(market: Dict): import("./base/types.js").MarketInterface;
    parseSpotMarket(market: Dict): import("./base/types.js").MarketInterface;
    /**
     * @method
     * @name phemex#fetchMarkets
     * @description retrieves data on all markets for phemex
     * @see https://phemex-docs.github.io/#query-product-information-3
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name phemex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    customParseBidAsk(bidask: any, priceKey?: number, amountKey?: number, market?: Market): number[];
    customParseOrderBook(orderbook: any, symbol: any, timestamp?: any, bidsKey?: string, asksKey?: string, priceKey?: number, amountKey?: number, market?: Market): any;
    /**
     * @method
     * @name phemex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    toEn(n: any, scale: any): number;
    toEv(amount: any, market?: Market): any;
    toEp(price: any, market?: Market): any;
    fromEn(en: any, scale: any): string;
    fromEp(ep: any, market?: Market): any;
    fromEv(ev: any, market?: Market): any;
    fromEr(er: any, market?: Market): any;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name phemex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#querykline
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-kline
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] *only used for USDT settled contracts, otherwise is emulated and not supported by the exchange* timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] *USDT settled/ linear swaps only* end time in ms
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name phemex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query24hrsticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name phemex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://phemex-docs.github.io/#query-24-hours-ticker-for-all-symbols-2     // spot
     * @see https://phemex-docs.github.io/#query-24-ticker-for-all-symbols             // linear
     * @see https://phemex-docs.github.io/#query-24-hours-ticker-for-all-symbols       // inverse
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name phemex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#querytrades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    parseSpotBalance(response: any): Balances;
    parseSwapBalance(response: any): Balances;
    /**
     * @method
     * @name phemex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://phemex-docs.github.io/#query-wallets
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-account-positions
     * @see https://phemex-docs.github.io/#query-trading-account-and-positions
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap
     * @param {string} [params.code] *swap only* currency code of the balance to query (USD, USDT, etc), default is USDT
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseOrderStatus(status: Str): string;
    parseOrderType(type: Str): string;
    parseTimeInForce(timeInForce: Str): string;
    parseSpotOrder(order: Dict, market?: Market): Order;
    parseOrderSide(side: any): string;
    parseSwapOrder(order: any, market?: Market): Order;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name phemex#createOrder
     * @description create a trade order
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#place-order
     * @see https://phemex-docs.github.io/#place-order-http-put-prefered-3
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.trigger] trigger price for conditional orders
     * @param {object} [params.takeProfit] *swap only* *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *swap only* *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {string} [params.posSide] *swap only* "Merged" for one way mode, "Long" for buy side of hedged mode, "Short" for sell side of hedged mode
     * @param {bool} [params.hedged] *swap only* true for hedged mode, false for one way mode, default is false
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name phemex#editOrder
     * @description edit a trade order
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#amend-order-by-orderid
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.posSide] either 'Merged' or 'Long' or 'Short'
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name phemex#cancelOrder
     * @description cancels an open order
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#cancel-single-order-by-orderid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.posSide] either 'Merged' or 'Long' or 'Short'
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name phemex#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#cancelall
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name phemex#fetchOrder
     * @see https://phemex-docs.github.io/#query-orders-by-ids
     * @description fetches information on an order made by the user
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name phemex#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorder
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name phemex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryopenorder
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#spotListAllOpenOrder
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name phemex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#queryorder
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#queryorder
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedgedd-Perpetual-API.md#query-closed-orders-by-symbol
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#spotDataOrdersByIds
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.settle] the settlement currency to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name phemex#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-user-trade
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-user-trade
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Spot-API-en.md#spotDataTradesHist
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name phemex#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name phemex#fetchDeposits
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
     * @name phemex#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name phemex#fetchPositions
     * @description fetch all open positions
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#query-trading-account-and-positions
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#query-account-positions
     * @see https://phemex-docs.github.io/#query-account-positions-with-unrealized-pnl
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.code] the currency code to fetch positions for, USD, BTC or USDT, USD is the default
     * @param {string} [params.method] *USDT contracts only* 'privateGetGAccountsAccountPositions' or 'privateGetAccountsPositions' default is 'privateGetGAccountsAccountPositions'
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: Dict, market?: Market): import("./base/types.js").Position;
    /**
     * @method
     * @name phemex#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#futureDataFundingFeesHist
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingFeeToPrecision(value: any, market?: Market, currencyCode?: Str): any;
    /**
     * @method
     * @name phemex#fetchFundingRate
     * @description fetch the current funding rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name phemex#setMargin
     * @description Either adds or reduces margin in an isolated position in order to set the margin to a specific value
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Contract-API-en.md#assign-position-balance-in-isolated-marign-mode
     * @param {string} symbol unified market symbol of the market to set margin in
     * @param {float} amount the amount to set the margin to
     * @param {object} [params] parameters specific to the exchange API endpoint
     * @returns {object} A [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    setMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    parseMarginStatus(status: any): string;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name phemex#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://phemex-docs.github.io/#set-leverage
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name phemex#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#switch-position-mode-synchronously
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol not used by binance setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name phemex#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    /**
     * @method
     * @name phemex#setLeverage
     * @description set the level of leverage for a market
     * @see https://github.com/phemex/phemex-api-docs/blob/master/Public-Hedged-Perpetual-API.md#set-leverage
     * @param {float} leverage the rate of leverage, 100 > leverage > -100 excluding numbers between -1 to 1
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.hedged] set to true if hedged position mode is enabled (by default long and short leverage are set to the same value)
     * @param {float} [params.longLeverageRr] *hedged mode only* set the leverage for long positions
     * @param {float} [params.shortLeverageRr] *hedged mode only* set the leverage for short positions
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name phemex#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://phemex-docs.github.io/#transfer-between-spot-and-futures
     * @see https://phemex-docs.github.io/#universal-transfer-main-account-only-transfer-between-sub-to-main-main-to-sub-or-sub-to-sub
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.bizType] for transferring between main and sub-acounts either 'SPOT' or 'PERPETUAL' default is 'SPOT'
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name phemex#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://phemex-docs.github.io/#query-transfer-history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    /**
     * @method
     * @name phemex#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://phemex-docs.github.io/#query-funding-rate-history-2
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name phemex#withdraw
     * @description make a withdrawal
     * @see https://phemex-docs.github.io/#create-withdraw-request
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the phemex api endpoint
     * @param {string} [params.network] unified network code
     * @returns {object} a [transaction structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name phemex#fetchOpenInterest
     * @description retrieves the open interest of a trading pair
     * @see https://phemex-docs.github.io/#query-24-hours-ticker
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name phemex#fetchConvertQuote
     * @description fetch a quote for converting from one currency to another
     * @see https://phemex-docs.github.io/#rfq-quote
     * @param {string} fromCode the currency that you want to sell and convert from
     * @param {string} toCode the currency that you want to buy and convert into
     * @param {float} amount how much you want to trade in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [conversion structure]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertQuote(fromCode: string, toCode: string, amount?: Num, params?: {}): Promise<Conversion>;
    /**
     * @method
     * @name phemex#createConvertTrade
     * @description convert from one currency to another
     * @see https://phemex-docs.github.io/#convert
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
     * @name phemex#fetchConvertTradeHistory
     * @description fetch the users history of conversion trades
     * @see https://phemex-docs.github.io/#query-convert-history
     * @param {string} [code] the unified currency code
     * @param {int} [since] the earliest time in ms to fetch conversions for
     * @param {int} [limit] the maximum number of conversion structures to retrieve, default 20, max 200
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.until] the end time in ms
     * @param {string} [params.fromCurrency] the currency that you sold and converted from
     * @param {string} [params.toCurrency] the currency that you bought and converted into
     * @returns {object[]} a list of [conversion structures]{@link https://docs.ccxt.com/#/?id=conversion-structure}
     */
    fetchConvertTradeHistory(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Conversion[]>;
    parseConversion(conversion: Dict, fromCurrency?: Currency, toCurrency?: Currency): Conversion;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
