import Exchange from './abstract/bitfinex2.js';
import type { TransferEntry, Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, OrderBook, Str, Transaction, Ticker, Balances, Tickers, Strings, Currency, Market, OpenInterest, Liquidation, OrderRequest, Num, MarginModification, Currencies, TradingFees, Dict, LedgerEntry, FundingRate, FundingRates, DepositAddress } from './base/types.js';
/**
 * @class bitfinex2
 * @augments Exchange
 */
export default class bitfinex2 extends Exchange {
    describe(): any;
    isFiat(code: any): boolean;
    getCurrencyId(code: any): string;
    getCurrencyName(code: any): any;
    amountToPrecision(symbol: any, amount: any): string;
    priceToPrecision(symbol: any, price: any): string;
    /**
     * @method
     * @name bitfinex2#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.bitfinex.com/reference/rest-public-platform-status
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
     * @name bitfinex2#fetchMarkets
     * @description retrieves data on all markets for bitfinex2
     * @see https://docs.bitfinex.com/reference/rest-public-conf
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name bitfinex2#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.bitfinex.com/reference/rest-public-conf
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name bitfinex2#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.bitfinex.com/reference/rest-auth-wallets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name bitfinex2#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.bitfinex.com/reference/rest-auth-transfer
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
    convertDerivativesId(currency: any, type: any): any;
    /**
     * @method
     * @name bitfinex2#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.bitfinex.com/reference/rest-public-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return, bitfinex only allows 1, 25, or 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitfinex2#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.bitfinex.com/reference/rest-public-tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bitfinex2#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.bitfinex.com/reference/rest-public-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitfinex2#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.bitfinex.com/reference/rest-public-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch, default 120, max 10000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitfinex2#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.bitfinex.com/reference/rest-public-candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, default 100 max 10000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    parseOrderStatus(status: Str): string;
    parseOrderFlags(flags: any): any;
    parseTimeInForce(orderType: any): string;
    parseOrder(order: Dict, market?: Market): Order;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name bitfinex2#createOrder
     * @description create an order on the exchange
     * @see https://docs.bitfinex.com/reference/rest-auth-submit-order
     * @param {string} symbol unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] price of the order
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopPrice] the price that triggers a trigger order
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO"
     * @param {boolean} [params.postOnly] set to true if you want to make a post only order
     * @param {boolean} [params.reduceOnly] indicates that the order is to reduce the size of a position
     * @param {int} [params.flags] additional order parameters: 4096 (Post Only), 1024 (Reduce Only), 16384 (OCO), 64 (Hidden), 512 (Close), 524288 (No Var Rates)
     * @param {int} [params.lev] leverage for a derivative order, supported by derivative symbol orders only. The value should be between 1 and 100 inclusive.
     * @param {string} [params.price_aux_limit] order price for stop limit orders
     * @param {string} [params.price_oco_stop] OCO stop price
     * @param {string} [params.trailingAmount] *swap only* the quote amount to trail away from the current market price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitfinex2#createOrders
     * @description create a list of trade orders
     * @see https://docs.bitfinex.com/reference/rest-auth-order-multi
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitfinex2#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.bitfinex.com/reference/rest-auth-cancel-orders-multiple
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitfinex2#cancelOrder
     * @description cancels an open order
     * @see https://docs.bitfinex.com/reference/rest-auth-cancel-order
     * @param {string} id order id
     * @param {string} symbol Not used by bitfinex2 cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitfinex2#cancelOrders
     * @description cancel multiple orders at the same time
     * @see https://docs.bitfinex.com/reference/rest-auth-cancel-orders-multiple
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitfinex2#fetchOpenOrder
     * @description fetch an open order by it's id
     * @see https://docs.bitfinex.com/reference/rest-auth-retrieve-orders
     * @see https://docs.bitfinex.com/reference/rest-auth-retrieve-orders-by-symbol
     * @param {string} id order id
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitfinex2#fetchClosedOrder
     * @description fetch an open order by it's id
     * @see https://docs.bitfinex.com/reference/rest-auth-retrieve-orders
     * @see https://docs.bitfinex.com/reference/rest-auth-retrieve-orders-by-symbol
     * @param {string} id order id
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrder(id: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name bitfinex2#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.bitfinex.com/reference/rest-auth-retrieve-orders
     * @see https://docs.bitfinex.com/reference/rest-auth-retrieve-orders-by-symbol
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitfinex2#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.bitfinex.com/reference/rest-auth-retrieve-orders
     * @see https://docs.bitfinex.com/reference/rest-auth-retrieve-orders-by-symbol
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
     * @name bitfinex2#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.bitfinex.com/reference/rest-auth-order-trades
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
     * @name bitfinex2#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.bitfinex.com/reference/rest-auth-trades
     * @see https://docs.bitfinex.com/reference/rest-auth-trades-by-symbol
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitfinex2#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.bitfinex.com/reference/rest-auth-deposit-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name bitfinex2#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.bitfinex.com/reference/rest-auth-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name bitfinex2#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.bitfinex.com/reference/rest-auth-summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name bitfinex2#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.bitfinex.com/reference/movement-info
     * @see https://docs.bitfinex.com/reference/rest-auth-movements
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bitfinex2#withdraw
     * @description make a withdrawal
     * @see https://docs.bitfinex.com/reference/rest-auth-withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name bitfinex2#fetchPositions
     * @description fetch all open positions
     * @see https://docs.bitfinex.com/reference/rest-auth-positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: Dict, market?: Market): import("./base/types.js").Position;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(statusCode: any, statusText: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
    parseLedgerEntryType(type: Str): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    /**
     * @method
     * @name bitfinex2#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://docs.bitfinex.com/reference/rest-auth-ledgers
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined, max is 2500
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    /**
     * @method
     * @name bitfinex2#fetchFundingRates
     * @description fetch the current funding rate for multiple symbols
     * @see https://docs.bitfinex.com/reference/rest-public-derivatives-status
     * @param {string[]} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name bitfinex2#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.bitfinex.com/reference/rest-public-derivatives-status-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest funding rate entry
     * @param {int} [limit] max number of funding rate entrys to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    parseFundingRateHistory(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: number;
        indexPrice: number;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: number;
        datetime: string;
        fundingRate: number;
        fundingTimestamp: any;
        fundingDatetime: any;
        nextFundingRate: number;
        nextFundingTimestamp: number;
        nextFundingDatetime: string;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    /**
     * @method
     * @name bitfinex2#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @see https://docs.bitfinex.com/reference/rest-public-derivatives-status
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an [open interest structure]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<OpenInterest>;
    /**
     * @method
     * @name bitfinex2#fetchOpenInterestHistory
     * @description retrieves the open interest history of a currency
     * @see https://docs.bitfinex.com/reference/rest-public-derivatives-status-history
     * @param {string} symbol unified CCXT market symbol
     * @param {string} timeframe the time period of each row of data, not used by bitfinex2
     * @param {int} [since] the time in ms of the earliest record to retrieve as a unix timestamp
     * @param {int} [limit] the number of records in the response
     * @param {object} [params] exchange specific parameters
     * @param {int} [params.until] the time in ms of the latest record to retrieve as a unix timestamp
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns An array of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OpenInterest[]>;
    parseOpenInterest(interest: any, market?: Market): OpenInterest;
    /**
     * @method
     * @name bitfinex2#fetchLiquidations
     * @description retrieves the public liquidations of a trading pair
     * @see https://docs.bitfinex.com/reference/rest-public-liquidations
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    fetchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): Liquidation;
    /**
     * @method
     * @name bitfinex2#setMargin
     * @description either adds or reduces margin in a swap position in order to set the margin to a specific value
     * @see https://docs.bitfinex.com/reference/rest-auth-deriv-pos-collateral-set
     * @param {string} symbol unified market symbol of the market to set margin in
     * @param {float} amount the amount to set the margin to
     * @param {object} [params] parameters specific to the exchange API endpoint
     * @returns {object} A [margin structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#add-margin-structure}
     */
    setMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: any, market?: any): MarginModification;
    /**
     * @method
     * @name bitfinex2#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.bitfinex.com/reference/rest-auth-retrieve-orders
     * @see https://docs.bitfinex.com/reference/rest-auth-retrieve-orders-by-symbol
     * @param {string} id the order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitfinex2#editOrder
     * @description edit a trade order
     * @see https://docs.bitfinex.com/reference/rest-auth-update-order
     * @param {string} id edit order id
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopPrice] the price that triggers a trigger order
     * @param {boolean} [params.postOnly] set to true if you want to make a post only order
     * @param {boolean} [params.reduceOnly] indicates that the order is to reduce the size of a position
     * @param {int} [params.flags] additional order parameters: 4096 (Post Only), 1024 (Reduce Only), 16384 (OCO), 64 (Hidden), 512 (Close), 524288 (No Var Rates)
     * @param {int} [params.leverage] leverage for a derivative order, supported by derivative symbol orders only, the value should be between 1 and 100 inclusive
     * @param {int} [params.clientOrderId] a unique client order id for the order
     * @param {float} [params.trailingAmount] *swap only* the quote amount to trail away from the current market price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
}
