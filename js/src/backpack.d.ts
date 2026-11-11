import Exchange from './abstract/backpack.js';
import type { Balances, Currencies, Currency, CurrencyInterface, DepositAddress, Dict, FundingRate, FundingRateHistory, int, Int, List, Market, MarketInterface, Num, OHLCV, Order, OrderBook, OrderRequest, OrderType, OrderSide, Position, Str, Strings, Ticker, Tickers, Trade, Transaction, NullableDict, Status, FundingHistory, OpenInterest, Conversion } from './base/types.js';
/**
 * @class backpack
 * @augments Exchange
 */
export default class backpack extends Exchange {
    describe(): Dict;
    /**
     * @method
     * @name backpack#fetchCurrencies
     * @description fetches available crypto and tokenized stock currencies from the assets endpoint
     * @see https://docs.backpack.exchange/#tag/Assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] return tokenized stock assets only
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: Dict): Promise<Currencies>;
    parseCurrency(rawCurrency: Dict): CurrencyInterface;
    /**
     * @method
     * @name backpack#fetchMarkets
     * @description retrieves venue markets and tokenized stock RFQ markets discovered from securities
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_markets
     * @see https://docs.backpack.exchange/#tag/Stocks/operation/get_securities
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] return tokenized stock markets only
     * @param {string|string[]} [params.marketType] market types to discover: spot, swap or stock
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: Dict): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @ignore
     * @method
     * @name backpack#handleStockParams
     * @description resolves the stock market filter
     * @param {string} methodName calling method
     * @param {object} params exchange-specific parameters
     * @param {object} [market] resolved market
     * @returns {Array} stock flag and remaining parameters
     */
    handleStockParams(methodName: string, params: Dict, market?: Market): List;
    /**
     * @ignore
     * @method
     * @name backpack#fetchSecurities
     * @description fetches stock security metadata and session-specific share quantity constraints
     * @see https://docs.backpack.exchange/#tag/Stocks/operation/get_securities
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} security metadata, not account holdings or proof of equity ownership
     */
    fetchSecurities(params?: Dict): Promise<Dict[]>;
    /**
     * @ignore
     * @method
     * @name backpack#fetchStockIndicativeQuote
     * @description fetches a size-specific indicative stock quote without submitting or accepting an RFQ
     * @see https://docs.backpack.exchange/#tag/Stocks/operation/get_stock_indicative_quote
     * @param {string} symbol unified stock market symbol
     * @param {string} side buy or sell
     * @param {float} amount number of base shares
     * @param {object} [params] extra exchange-specific parameters
     * @param {boolean} [params.stock] selects tokenized stock data; inferred from symbol when omitted
     * @returns {object} indicative quote with availability, session constraints and non-guaranteed prices
     */
    fetchStockIndicativeQuote(symbol: string, side: OrderSide, amount: number, params?: Dict): Promise<Dict>;
    /**
     * @ignore
     * @method
     * @name backpack#rfqConversionMarket
     * @description resolves a stock RFQ market for a currency conversion pair
     * @param {string} fromCode source currency code
     * @param {string} toCode destination currency code
     * @returns {object} resolved stock RFQ market
     */
    rfqConversionMarket(fromCode: string, toCode: string): MarketInterface;
    /**
     * @ignore
     * @method
     * @name backpack#parseConversion
     * @description converts a submitted or accepted RFQ order into a conversion structure
     * @param {object} order parsed RFQ order
     * @param {object} [fromCurrency] source currency
     * @param {object} [toCurrency] destination currency
     * @returns {object} unified conversion structure
     */
    parseConversion(order: Dict, fromCurrency?: Currency, toCurrency?: Currency): Conversion;
    /**
     * @method
     * @name backpack#fetchConvertQuote
     * @description fetches an indicative quote for converting between a tokenized stock and its quote currency
     * @see https://docs.backpack.exchange/#tag/Stocks/operation/get_stock_indicative_quote
     * @param {string} fromCode the currency to convert from
     * @param {string} toCode the currency to convert to
     * @param {float} amount amount in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.price] optional limit price when converting quote currency to stock
     * @returns {object} indicative conversion estimate; the price is a bound and is not guaranteed
     */
    fetchConvertQuote(fromCode: string, toCode: string, amount?: Num, params?: Dict): Promise<Conversion>;
    /**
     * @method
     * @name backpack#createConvertTrade
     * @description converts between a tokenized stock and its quote currency through a bounded RFQ
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/submit_rfq
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/accept_quote
     * @param {string} id RFQ identifier when accepting a quote, or a numeric client identifier for a new RFQ
     * @param {string} fromCode the currency to convert from
     * @param {string} toCode the currency to convert to
     * @param {float} [amount] amount in units of the from currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.quoteId] accept this quote for RFQ id supplied as id
     * @param {float} [params.price] price bound from fetchConvertQuote; required when buying stock
     * @param {float} [params.baseAmount] stock quantity when converting quote currency to stock
     * @param {int} [params.clientOrderId] requester client identifier for a newly submitted RFQ
     * @returns {object} conversion result; RFQ submission may remain open and is not necessarily a fill
     */
    createConvertTrade(id: string, fromCode: string, toCode: string, amount?: Num, params?: Dict): Promise<Conversion>;
    /**
     * @ignore
     * @method
     * @name backpack#stockDataRequest
     * @description resolves venue or external stock statistics without treating RFQs as an order book
     * @param {string} methodName calling method
     * @param {object} params exchange-specific parameters
     * @param {object} [market] resolved market
     * @returns {object} market data parameters
     */
    stockDataRequest(methodName: string, params: Dict, market?: Market): Dict;
    /**
     * @ignore
     * @method
     * @name backpack#filterStockStructures
     * @description filters parsed account structures by securities metadata, never by RFQ execution alone
     * @param {Array} entries parsed trades or orders
     * @returns {Array} tokenized stock structures
     */
    filterStockStructures(entries: List): List;
    parseMarketType(type: Str): Str;
    /**
     * @method
     * @name backpack#fetchTickers
     * @description fetches venue or external provider statistics, not executable RFQ prices
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] return tokenized stock tickers only; inferred from requested symbols when omitted
     * @param {string} [params.source] Venue or External; RFQ symbols default to External, other symbols default to Venue
     * @param {string} [params.interval] ticker interval, External requires 1d
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name backpack#fetchTicker
     * @description fetches underlying venue or external stock statistics, not an executable RFQ quote
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock data; inferred from symbol when omitted
     * @param {string} [params.source] Venue or External; RFQ symbols default to External
     * @param {string} [params.interval] ticker interval, External requires 1d
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name backpack#fetchOrderBook
     * @description fetches venue order-book depth, RFQ and external provider depth are not supported
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects a tokenized stock spot order book; inferred from symbol when omitted
     * @param {string} [params.source] Venue, External provider depth is not supported
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name backpack#fetchOHLCV
     * @description fetches venue or external stock candlestick data for the underlying market
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in milliseconds of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock data; inferred from symbol when omitted
     * @param {string} [params.source] Venue or External; RFQ symbols default to External
     * @param {string} [params.price] last, mark or index, External requires last
     * @param {string} [params.priceType] Last, Mark or Index, External requires Last
     * @param {int} [params.until] latest candle timestamp in milliseconds
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name backpack#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_mark_prices
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: Dict): Promise<FundingRate>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name backpack#fetchOpenInterest
     * @description Retrieves the open interest of a derivative trading pair
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_open_interest
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=interest-history-structure}
     */
    fetchOpenInterest(symbol: string, params?: Dict): Promise<OpenInterest>;
    parseOpenInterest(interest: NullableDict, market?: Market): OpenInterest;
    /**
     * @method
     * @name backpack#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_funding_interval_rates
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name backpack#fetchTrades
     * @description gets recent venue order-book trades, not public RFQ or external provider fills
     * @see https://docs.backpack.exchange/#tag/Trades/operation/get_recent_trades
     * @see https://docs.backpack.exchange/#tag/Trades/operation/get_historical_trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.offset] the number of trades to skip, default is 0
     * @param {boolean} [params.stock] selects tokenized stock spot trades; inferred from symbol when omitted
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name backpack#fetchMyTrades
     * @description fetches venue fills or requester RFQ fills, combining stock records when no symbol is supplied
     * @see https://docs.backpack.exchange/#tag/History/operation/get_fills
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/get_rfq_fill_history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for, locally filtered for RFQ history pages
     * @param {int} [limit] the maximum number of trades structures to retrieve (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for, locally filtered for RFQ history pages
     * @param {boolean} [params.stock] selects tokenized stock fills; inferred from symbol when omitted
     * @param {boolean} [params.rfq] selects requester RFQ fills only, inferred from RFQ symbols
     * @param {int} [params.offset] exchange history pagination offset
     * @param {string} [params.sortDirection] Asc or Desc
     * @param {boolean} [params.deferredSettlement] selects deferred or immediate RFQ settlement records
     * @param {string} [params.fillType] User or CollateralConversion for RFQs, additional exchange-specific types for venue fills
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name backpack#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.backpack.exchange/#tag/System/operation/get_status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    fetchStatus(params?: Dict): Promise<Status>;
    /**
     * @method
     * @name backpack#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://developer-pro.bitmart.com/en/spot/#get-system-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: Dict): Promise<Int>;
    /**
     * @method
     * @name backpack#fetchBalance
     * @description queries the capital account, optionally filtering tokenized stock assets locally
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] return tokenized stock holdings only, without quote-currency cash
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: Dict): Promise<Balances>;
    parseBalance(response: Dict): Balances;
    /**
     * @method
     * @name backpack#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_deposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Transaction[]>;
    /**
     * @method
     * @name backpack#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_withdrawals
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Transaction[]>;
    /**
     * @method
     * @name backpack#withdraw
     * @description make a withdrawal
     * @see https://docs.backpack.exchange/#tag/Capital/operation/request_withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tag] memo / destination tag, required for currencies in options['withdrawTagRequiredCurrencies']
     * @param {string} params.network the network to withdraw on (mandatory)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, params?: Dict): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): Str;
    /**
     * @method
     * @name backpack#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_deposit_address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.networkCode] the network to fetch the deposit address (mandatory)
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: Dict): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: Dict, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name backpack#createOrder
     * @description creates a venue order or bounded requester RFQ for a tokenized stock
     * @see https://docs.backpack.exchange/#tag/Order/operation/execute_order
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/submit_rfq
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount quantity in base currency, RFQs require base quantity
     * @param {float} [price] limit price, ignored for venue market orders but an optional execution bound for market RFQs
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] venue market orders only, quote-currency cost instead of amount
     * @param {boolean} [params.stock] selects tokenized stock spot or RFQ execution; inferred from symbol when omitted
     * @param {string} [params.executionMode] RFQ only, Immediate (default) or AwaitAccept for manually accepted limit RFQs
     * @param {int} [params.orderExpiryTime] RFQ only, resting Immediate RFQ expiry in milliseconds
     * @param {int} [params.clientOrderId] a unique id for the order
     * @param {boolean} [params.postOnly] venue orders only, true to place a post only order
     * @param {string} [params.timeInForce] venue orders only, GTC, IOC, FOK or PO
     * @param {bool} [params.reduceOnly] contracts only, reduces a position
     * @param {string} [params.selfTradePrevention] venue orders only, EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH
     * @param {bool} [params.autoLend] lend if required
     * @param {bool} [params.autoLendRedeem] redeem a lend if required
     * @param {bool} [params.autoBorrow] borrow if required
     * @param {bool} [params.autoBorrowRepay] repay a borrow if required
     * @param {float} [params.triggerPrice] venue orders only, trigger price
     * @param {object} [params.takeProfit] swap markets only, attached take profit order
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {float} [params.takeProfit.price] take profit limit price, omitted for a market order
     * @param {object} [params.stopLoss] swap markets only, attached stop loss order
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.stopLoss.price] stop loss limit price, omitted for a market order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @ignore
     * @method
     * @name backpack#createRfqOrder
     * @description submits a base-quantity RFQ, with explicit market orders using an indicative execution bound
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/submit_rfq
     * @param {string} symbol unified RFQ market symbol
     * @param {string} type market or limit
     * @param {string} side buy or sell
     * @param {float} amount base quantity
     * @param {float} [price] required limit price, or optional market execution bound
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.executionMode] Immediate (default and required) to enforce the execution price bound
     * @param {int} [params.orderExpiryTime] exchange-specific resting RFQ expiry in milliseconds
     * @param {int} [params.clientOrderId] requester client identifier
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    createRfqOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @ignore
     * @method
     * @name backpack#acceptRfqQuote
     * @description explicitly accepts a selected current best quote, which may bind funds before settlement
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/accept_quote
     * @param {string} id requester RFQ identifier
     * @param {string} quoteId selected quote identifier
     * @param {string} symbol unified RFQ market symbol
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    acceptRfqQuote(id: string, quoteId: string, symbol: string, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name backpack#createOrders
     * @description creates venue order-book orders, RFQ batches are not supported
     * @see https://docs.backpack.exchange/#tag/Order/operation/execute_order_batch
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock spot execution for all orders, otherwise inferred per symbol
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: Dict): Promise<Order[]>;
    /**
     * @ignore
     * @method
     * @name backpack#createOrderRequest
     * @description builds a venue order-book request and rejects RFQ batch execution
     * @param {string} symbol unified market symbol
     * @param {string} type order type
     * @param {string} side order side
     * @param {float} amount base quantity
     * @param {float} [price] limit price
     * @param {object} [params] exchange-specific order parameters
     * @returns {object} venue order payload
     */
    createOrderRequest(symbol: Str, type: Str, side: Str, amount: Num, price?: Num, params?: Dict): Dict;
    encodeOrderSide(side: Str): Str;
    /**
     * @method
     * @name backpack#fetchOpenOrders
     * @description fetches open venue orders or RFQs with their candidate quotes
     * @see https://docs.backpack.exchange/#tag/Order/operation/get_open_orders
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/get_open_rfqs
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock orders; inferred from symbol when provided, otherwise selects both venue/RFQ records
     * @param {boolean} [params.rfq] selects requester RFQs only, inferred from RFQ symbols
     * @param {boolean} [params.deferredSettlement] selects deferred or immediate RFQ records
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name backpack#fetchOpenOrder
     * @description fetches an open venue order or requester RFQ by identifier
     * @see https://docs.backpack.exchange/#tag/Order/operation/get_order
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/get_open_rfqs
     * @param {string} id order or requester RFQ identifier
     * @param {string} symbol unified market symbol, required
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock orders; inferred from symbol when omitted
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name backpack#fetchOrder
     * @description fetches an order from filtered history with an open-order fallback
     * @see https://docs.backpack.exchange/#tag/History
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/get_rfq_history
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/get_open_rfqs
     * @param {string} id order or requester RFQ identifier
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra exchange-specific parameters
     * @param {boolean} [params.stock] selects tokenized stock orders; inferred from symbol when omitted
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name backpack#cancelOrder
     * @description cancels a venue order or requests RFQ cancellation without assuming immediate cancellation
     * @see https://docs.backpack.exchange/#tag/Order/operation/cancel_order
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/cancel_rfq
     * @param {string} id order or requester RFQ identifier
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock orders; inferred from symbol when omitted
     * @param {int} [params.clientOrderId] RFQ client identifier instead of id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name backpack#cancelAllOrders
     * @description cancels venue orders, bulk RFQ cancellation is not supported
     * @see https://docs.backpack.exchange/#tag/Order/operation/cancel_open_orders
     * @see https://docs.backpack.exchange/#tag/RFQ
     * @param {string} symbol unified market symbol, required
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock orders; inferred from symbol when omitted
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name backpack#fetchOrders
     * @description fetches venue or requester RFQ order history
     * @see https://docs.backpack.exchange/#tag/History/operation/get_order_history
     * @see https://docs.backpack.exchange/#tag/RFQ/operation/get_rfq_history
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for, locally filtered on retrieved pages
     * @param {int} [limit] the maximum number of order structures to retrieve (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.stock] selects tokenized stock orders; inferred from symbol when provided, otherwise selects both venue/RFQ records
     * @param {boolean} [params.rfq] selects requester RFQ history only, inferred from RFQ symbols
     * @param {int} [params.offset] exchange history pagination offset
     * @param {string} [params.sortDirection] Asc or Desc
     * @param {boolean} [params.deferredSettlement] selects deferred or immediate RFQ history
     * @returns {Order[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): Str;
    parseOrderSide(side: Str): Str;
    /**
     * @method
     * @name backpack#fetchPositions
     * @description fetches derivative positions
     * @see https://docs.backpack.exchange/#tag/Futures/operation/get_positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: Dict): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name backpack#fetchFundingHistory
     * @description fetches the history of funding payments
     * @see https://docs.backpack.exchange/#tag/History/operation/get_funding_payments
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch (default 24 hours ago)
     * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<FundingHistory[]>;
    parseIncome(income: Dict, market?: Market): object;
    nonce(): int;
    sign(path: string, api?: string[], method?: string, params?: Dict): Dict;
    generateBatchPayload(params: any, ts: string, recvWindow: string, instruction: string): string;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: NullableDict, requestBody: Str): undefined;
}
