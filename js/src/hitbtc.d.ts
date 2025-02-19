import Exchange from './abstract/hitbtc.js';
import type { TransferEntry, Int, OrderSide, OrderType, FundingRateHistory, OHLCV, Ticker, Order, OrderBook, Dict, Position, Str, Trade, Balances, Transaction, MarginMode, Tickers, Strings, Market, Currency, MarginModes, Leverage, Num, MarginModification, TradingFeeInterface, Currencies, TradingFees, int, FundingRate, FundingRates, DepositAddress, OrderBooks, OpenInterests } from './base/types.js';
/**
 * @class hitbtc
 * @augments Exchange
 */
export default class hitbtc extends Exchange {
    describe(): any;
    nonce(): number;
    /**
     * @method
     * @name hitbtc#fetchMarkets
     * @description retrieves data on all markets for hitbtc
     * @see https://api.hitbtc.com/#symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name hitbtc#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api.hitbtc.com/#currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name hitbtc#createDepositAddress
     * @description create a currency deposit address
     * @see https://api.hitbtc.com/#generate-deposit-crypto-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: string;
        network: any;
        info: any;
    }>;
    /**
     * @method
     * @name hitbtc#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://api.hitbtc.com/#get-deposit-crypto-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name hitbtc#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.hitbtc.com/#wallet-balance
     * @see https://api.hitbtc.com/#get-spot-trading-balance
     * @see https://api.hitbtc.com/#get-trading-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name hitbtc#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.hitbtc.com/#tickers
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name hitbtc#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://api.hitbtc.com/#tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name hitbtc#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.hitbtc.com/#trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name hitbtc#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.hitbtc.com/#spot-trades-history
     * @see https://api.hitbtc.com/#futures-trades-history
     * @see https://api.hitbtc.com/#margin-trades-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for fetching margin trades
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    fetchTransactionsHelper(types: any, code: any, since: any, limit: any, params: any): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransactionType(type: any): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name hitbtc#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://api.hitbtc.com/#get-transactions-history
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name hitbtc#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://api.hitbtc.com/#get-transactions-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name hitbtc#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://api.hitbtc.com/#get-transactions-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name hitbtc#fetchOrderBooks
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
     * @see https://api.hitbtc.com/#order-books
     * @param {string[]} [symbols] list of unified market symbols, all symbols fetched if undefined, default is undefined
     * @param {int} [limit] max number of entries per orderbook to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
     */
    fetchOrderBooks(symbols?: Strings, limit?: Int, params?: {}): Promise<OrderBooks>;
    /**
     * @method
     * @name hitbtc#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.hitbtc.com/#order-books
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name hitbtc#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://api.hitbtc.com/#get-trading-commission
     * @see https://api.hitbtc.com/#get-trading-commission-2
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name hitbtc#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://api.hitbtc.com/#get-all-trading-commissions
     * @see https://api.hitbtc.com/#get-all-trading-commissions-2
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name hitbtc#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.hitbtc.com/#candles
     * @see https://api.hitbtc.com/#futures-index-price-candles
     * @see https://api.hitbtc.com/#futures-mark-price-candles
     * @see https://api.hitbtc.com/#futures-premium-index-candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name hitbtc#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://api.hitbtc.com/#spot-orders-history
     * @see https://api.hitbtc.com/#futures-orders-history
     * @see https://api.hitbtc.com/#margin-orders-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for fetching margin orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name hitbtc#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.hitbtc.com/#spot-orders-history
     * @see https://api.hitbtc.com/#futures-orders-history
     * @see https://api.hitbtc.com/#margin-orders-history
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for fetching a margin order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hitbtc#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://api.hitbtc.com/#spot-trades-history
     * @see https://api.hitbtc.com/#futures-trades-history
     * @see https://api.hitbtc.com/#margin-trades-history
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for fetching margin trades
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name hitbtc#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api.hitbtc.com/#get-all-active-spot-orders
     * @see https://api.hitbtc.com/#get-active-futures-orders
     * @see https://api.hitbtc.com/#get-active-margin-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for fetching open margin orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name hitbtc#fetchOpenOrder
     * @description fetch an open order by it's id
     * @see https://api.hitbtc.com/#get-active-spot-order
     * @see https://api.hitbtc.com/#get-active-futures-order
     * @see https://api.hitbtc.com/#get-active-margin-order
     * @param {string} id order id
     * @param {string} symbol unified market symbol, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for fetching an open margin order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hitbtc#cancelAllOrders
     * @description cancel all open orders
     * @see https://api.hitbtc.com/#cancel-all-spot-orders
     * @see https://api.hitbtc.com/#cancel-futures-orders
     * @see https://api.hitbtc.com/#cancel-all-margin-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for canceling margin orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name hitbtc#cancelOrder
     * @description cancels an open order
     * @see https://api.hitbtc.com/#cancel-spot-order
     * @see https://api.hitbtc.com/#cancel-futures-order
     * @see https://api.hitbtc.com/#cancel-margin-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported
     * @param {bool} [params.margin] true for canceling a margin order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hitbtc#createOrder
     * @description create a trade order
     * @see https://api.hitbtc.com/#create-new-spot-order
     * @see https://api.hitbtc.com/#create-margin-order
     * @see https://api.hitbtc.com/#create-futures-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported for spot-margin, swap supports both, default is 'cross'
     * @param {bool} [params.margin] true for creating a margin order
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", "Day", "GTD"
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrderRequest(market: object, marketType: string, type: OrderType, side: OrderSide, amount: number, price?: Num, marginMode?: Str, params?: {}): Dict[];
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name hitbtc#fetchMarginModes
     * @description fetches margin mode of the user
     * @see https://api.hitbtc.com/#get-margin-position-parameters
     * @see https://api.hitbtc.com/#get-futures-position-parameters
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    fetchMarginModes(symbols?: Str[], params?: {}): Promise<MarginModes>;
    parseMarginMode(marginMode: Dict, market?: any): MarginMode;
    /**
     * @method
     * @name hitbtc#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://api.hitbtc.com/#transfer-between-wallet-and-exchange
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    convertCurrencyNetwork(code: string, amount: any, fromNetwork: any, toNetwork: any, params: any): Promise<{
        info: any;
    }>;
    /**
     * @method
     * @name hitbtc#withdraw
     * @description make a withdrawal
     * @see https://api.hitbtc.com/#withdraw-crypto
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
     * @name hitbtc#fetchFundingRates
     * @description fetches funding rates for multiple markets
     * @see https://api.hitbtc.com/#futures-info
     * @param {string[]} symbols unified symbols of the markets to fetch the funding rates for, all market funding rates are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    /**
     * @method
     * @name hitbtc#fetchFundingRateHistory
     * @see https://api.hitbtc.com/#funding-history
     * @description fetches historical funding rate prices
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name hitbtc#fetchPositions
     * @description fetch all open positions
     * @see https://api.hitbtc.com/#get-futures-margin-accounts
     * @see https://api.hitbtc.com/#get-all-margin-accounts
     * @param {string[]|undefined} symbols not used by hitbtc fetchPositions ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported, defaults to spot-margin endpoint if this is set
     * @param {bool} [params.margin] true for fetching spot-margin positions
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name hitbtc#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://api.hitbtc.com/#get-futures-margin-account
     * @see https://api.hitbtc.com/#get-isolated-margin-account
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported, defaults to spot-margin endpoint if this is set
     * @param {bool} [params.margin] true for fetching a spot-margin position
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    parsePosition(position: Dict, market?: Market): Position;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name hitbtc#fetchOpenInterests
     * @description Retrieves the open interest for a list of symbols
     * @see https://api.hitbtc.com/#futures-info
     * @param {string[]} [symbols] a list of unified CCXT market symbols
     * @param {object} [params] exchange specific parameters
     * @returns {object[]} a list of [open interest structures]{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterests(symbols?: Strings, params?: {}): Promise<OpenInterests>;
    /**
     * @method
     * @name hitbtc#fetchOpenInterest
     * @description Retrieves the open interest of a derivative trading pair
     * @see https://api.hitbtc.com/#futures-info
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=interest-history-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    /**
     * @method
     * @name hitbtc#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://api.hitbtc.com/#futures-info
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name hitbtc#reduceMargin
     * @description remove margin from a position
     * @see https://api.hitbtc.com/#create-update-margin-account-2
     * @see https://api.hitbtc.com/#create-update-margin-account
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set
     * @param {bool} [params.margin] true for reducing spot-margin
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name hitbtc#addMargin
     * @description add margin
     * @see https://api.hitbtc.com/#create-update-margin-account-2
     * @see https://api.hitbtc.com/#create-update-margin-account
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set
     * @param {bool} [params.margin] true for adding spot-margin
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name hitbtc#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://api.hitbtc.com/#get-futures-margin-account
     * @see https://api.hitbtc.com/#get-isolated-margin-account
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' only 'isolated' is supported, defaults to the spot-margin endpoint if this is set
     * @param {bool} [params.margin] true for fetching spot-margin leverage
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name hitbtc#setLeverage
     * @description set the level of leverage for a market
     * @see https://api.hitbtc.com/#create-update-margin-account-2
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name hitbtc#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://api.hitbtc.com/#currencies
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [fees structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    /**
     * @method
     * @name hitbtc#closePosition
     * @description closes open positions for a market
     * @see https://api.hitbtc.com/#close-all-futures-margin-positions
     * @param {string} symbol unified ccxt market symbol
     * @param {string} side 'buy' or 'sell'
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @param {string} [params.symbol] *required* unified market symbol
     * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'cross'
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    handleMarginModeAndParams(methodName: any, params?: {}, defaultValue?: any): any[];
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
