import Exchange from './abstract/derive.js';
import type { Dict, List, Currencies, Transaction, Currency, CurrencyInterface, FundingHistory, Market, Str, Strings, Ticker, Int, int, Trade, OrderType, OrderSide, Num, FundingRateHistory, FundingRate, Balances, Order, Position, NullableDict, OHLCV, OpenInterest, Account, TransferEntry, Greeks, Option, BorrowInterest } from './base/types.js';
/**
 * @class derive
 * @augments Exchange
 */
export default class derive extends Exchange {
    describe(): any;
    setSandboxMode(enable: boolean): void;
    /**
     * @method
     * @name derive#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.derive.xyz/api-reference/system/publicget_time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: Dict): Promise<Int>;
    /**
     * @method
     * @name derive#fetchAccounts
     * @description fetch all the subaccounts associated with the wallet
     * @see https://docs.derive.xyz/api-reference/subaccounts/privateget_subaccounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
     */
    fetchAccounts(params?: Dict): Promise<Account[]>;
    /**
     * @method
     * @name derive#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_all_currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: Dict): Promise<Currencies>;
    parseCurrency(rawCurrency: Dict): CurrencyInterface;
    /**
     * @method
     * @name derive#fetchMarkets
     * @description retrieves data on all markets for derive
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_all_instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: Dict): Promise<Market[]>;
    fetchSpotMarkets(params?: Dict): Promise<Market[]>;
    fetchSwapMarkets(params?: Dict): Promise<Market[]>;
    fetchOptionMarkets(params?: Dict): Promise<Market[]>;
    /**
     * @method
     * @ignore
     * @name derive#getMarketsPaginated
     * @description fetches every page of public/get_all_instruments for the given filter and parses the instruments; v3 paginates the endpoint, options alone exceed 5000 entries
     * @param {object} request the base request with the instrument_type filter
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of raw instrument entries
     */
    getMarketsPaginated(request: Dict, params?: Dict): Promise<Dict[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name derive#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: Dict): Promise<Ticker>;
    /**
     * @method
     * @name derive#fetchOpenInterest
     * @description retrieves the open interest of a contract market
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_ticker
     * @param {string} symbol unified symbol of the market to fetch the open interest for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: Dict): Promise<OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): OpenInterest;
    /**
     * @method
     * @name derive#fetchGreeks
     * @description fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_ticker
     * @param {string} symbol unified symbol of the market to fetch greeks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/?id=greeks-structure}
     */
    fetchGreeks(symbol: string, params?: Dict): Promise<Greeks>;
    parseGreeks(greeks: Dict, market?: Market): Greeks;
    /**
     * @method
     * @name derive#fetchOption
     * @description fetches option data that is commonly found in an option chain
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_ticker
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [option structure]{@link https://docs.ccxt.com/?id=option-structure}
     */
    fetchOption(symbol: string, params?: Dict): Promise<Option>;
    parseOption(chain: Dict, currency?: Currency, market?: Market): Option;
    /**
     * @method
     * @name derive#fetchSettlementHistory
     * @description fetches historical settlement records, the venue publishes one underlying settlement price per currency and expiry rather than per option instrument, so the records carry no symbol
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_option_settlement_prices
     * @param {string} symbol unified market symbol of any market of the underlying currency to fetch the settlement history for
     * @param {int} [since] timestamp in ms of the earliest settlement to fetch
     * @param {int} [limit] the maximum number of settlements to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [settlement history objects]{@link https://docs.ccxt.com/?id=settlement-history-structure}
     */
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Dict[]>;
    /**
     * @method
     * @name derive#fetchMySettlementHistory
     * @description fetches historical settlement records of the user
     * @see https://docs.derive.xyz/api-reference/history/privateget_option_settlement_history
     * @param {string} [symbol] unified market symbol of the settlement history to fetch
     * @param {int} [since] timestamp in ms of the earliest settlement to fetch
     * @param {int} [limit] the maximum number of settlements to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [settlement history objects]{@link https://docs.ccxt.com/?id=settlement-history-structure}
     */
    fetchMySettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Dict[]>;
    parseSettlement(settlement: Dict, market?: Market): Dict;
    parseSettlements(settlements: any[], market?: Market): List;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name derive#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_trade_history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch; limits above ~500 cannot be filled in a single request because the venue caps pages at 1000 raw rows (two per match), use params.paginate instead
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseTrades(trades: List, market?: Market, since?: Int, limit?: Int, params?: Dict): Trade[];
    /**
     * @method
     * @name derive#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_tradingview_chart_data      // trade candles
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_index_chart_data           // params.price = 'index'
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch; a single request covers at most 5000 candles from since, use params.paginate for wider ranges
     * @param {int} [limit] the maximum amount of candles to fetch, also sizes the request window when since is not provided
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {string} [params.price] "index" to fetch candles of the index price instead of trades, their volume is undefined
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name derive#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_funding_rate_history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name derive#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_funding_rate_history
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: Dict): Promise<FundingRate>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    hashOrderMessage(order: any): string;
    signOrder(order: any, privateKey: string): string;
    /**
     * @method
     * @ignore
     * @name derive#nonceString
     * @description returns a unique nanosecond-scale action nonce as a decimal string; v3 requires UTC timestamps in nanoseconds (~19 digits), which overflow double precision, so the millisecond timestamp from incrementingNonce is concatenated with a random 6-digit suffix (the venue accepts string nonces)
     * @returns {string} a nanosecond-scale nonce as a decimal string
     */
    nonceString(): string;
    hashMessage(message: any): string;
    signHash(hash: string, privateKey: string): string;
    signMessage(message: any, privateKey: string): string;
    parseUnits(num: string, dec?: string): Str;
    /**
     * @method
     * @name derive#createOrder
     * @description create a trade order
     * @see https://docs.derive.xyz/api-reference/orderbook/privateorder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @param {float} [params.triggerPrice] the price a standalone trigger (stop) order is triggered at
     * @param {float} [params.stopLossPrice] the price a standalone stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] the price a standalone take profit order is triggered at
     * @param {string} [params.trigger_price_type] the price type the trigger watches, only 'mark' is supported by the venue (default)
     * @param {bool} [params.postOnly] true makes the order post only
     * @param {bool} [params.reduceOnly] true reduces the position only, not available with post only
     * @param {float} [params.max_fee] *required* the maximum fee you are willing to pay for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name derive#editOrder
     * @description edit a trade order
     * @see https://docs.derive.xyz/api-reference/orderbook/privatereplace
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name derive#cancelOrder
     * @see https://docs.derive.xyz/api-reference/orderbook/privatecancel
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] whether the order is a trigger/algo order
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name derive#cancelAllOrders
     * @see https://docs.derive.xyz/api-reference/orderbook/privatecancel_by_instrument
     * @see https://docs.derive.xyz/api-reference/orderbook/privatecancel_all
     * @description cancel all open orders in a market
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name derive#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and closed orders made by the user; only orders in a terminal state (filled, cancelled, expired) are returned, use fetchOpenOrders for orders resting on the order book
     * @see https://docs.derive.xyz/api-reference/history/privateget_order_history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name derive#fetchOrder
     * @description fetches information on an order made by the user, a standalone trigger order is not visible here until it triggers, list those through fetchOpenOrders with params.trigger instead
     * @see https://docs.derive.xyz/api-reference/orderbook/privateget_order
     * @param {string} id the order id
     * @param {string} [symbol] not used by derive.fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name derive#fetchOpenOrders
     * @description fetches information on all currently open orders of the user resting on the order book
     * @see https://docs.derive.xyz/api-reference/orderbook/privateget_open_orders
     * @see https://docs.derive.xyz/api-reference/orderbook/privateget_trigger_orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] when true fetches the pending trigger orders that have not fired yet instead of the orders resting on the order book
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name derive#fetchClosedOrders
     * @description fetches information on multiple closed (fully filled) orders made by the user
     * @see https://docs.derive.xyz/api-reference/history/privateget_order_history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch orders with pagination
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name derive#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://docs.derive.xyz/api-reference/history/privateget_order_history
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    parseTimeInForce(timeInForce: Str): Str;
    parseOrderStatus(status: Str): string | undefined;
    parseOrder(rawOrder: Dict, market?: Market): Order;
    /**
     * @method
     * @name derive#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.derive.xyz/api-reference/history/privateget_trade_history
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name derive#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.derive.xyz/api-reference/history/privateget_trade_history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] set to true if you want to fetch trades with pagination
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name derive#fetchPositions
     * @description fetch all open positions
     * @see https://docs.derive.xyz/api-reference/subaccounts/privateget_positions
     * @param {string[]} [symbols] not used by fetchPositions ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: Dict): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name derive#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://docs.derive.xyz/api-reference/history/privateget_funding_history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch funding history for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<FundingHistory[]>;
    parseIncome(income: Dict, market?: Market): Dict;
    /**
     * @method
     * @name derive#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.derive.xyz/api-reference/subaccounts/privateget_all_portfolios     // whole wallet
     * @see https://docs.derive.xyz/api-reference/subaccounts/privateget_subaccount        // params.subaccount_id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.subaccount_id] scope the balance to a single subaccount instead of the whole wallet
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: Dict): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name derive#transfer
     * @description transfer a spot asset between subaccounts belonging to the same wallet
     * @see https://docs.derive.xyz/api-reference/transfers-&-withdrawals/privatetransfer_spot
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount the subaccount id to transfer from
     * @param {string} toAccount the subaccount id to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.max_fee_usd] the maximum accepted fee in usd, default 0: transfers between existing subaccounts are free
     * @param {int} [params.new_subaccount_manager] a manager id creates a fresh subaccount under the sender wallet as the destination instead of toAccount, the creation charges a fee so max_fee_usd must cover it
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: Dict): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name derive#fetchTransfers
     * @description fetch the spot transfer history of a subaccount
     * @see https://docs.derive.xyz/api-reference/history/privateget_erc20_transfer_history
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest transfer to fetch
     * @param {int} [limit] the maximum number of transfers to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest transfer to fetch
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<TransferEntry[]>;
    /**
     * @method
     * @name derive#fetchBorrowRateHistory
     * @description retrieves a history of a currencies borrow interest rate at specific time slots
     * @see https://docs.derive.xyz/api-reference/market-data/publicget_interest_rate_history
     * @param {string} code unified currency code
     * @param {int} [since] timestamp in ms of the earliest rate to fetch
     * @param {int} [limit] the maximum number of rates to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest rate to fetch
     * @param {int} [params.risk_universe_id] the risk universe to read the rates from, default 1: without the filter the venue interleaves every universe with duplicate timestamps
     * @param {int} [params.period] the bucket size in seconds, default hourly
     * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
     */
    fetchBorrowRateHistory(code: string, since?: Int, limit?: Int, params?: Dict): Promise<Dict[]>;
    parseBorrowRate(info: any, currency?: Currency): Dict;
    /**
     * @method
     * @name derive#fetchBorrowInterest
     * @description fetches the interest accrued on the cash balance of a subaccount, the venue charges or pays it on the settlement currency only
     * @see https://docs.derive.xyz/api-reference/history/privateget_interest_history
     * @param {string} [code] unified currency code
     * @param {string} [symbol] not used by derive.fetchBorrowInterest
     * @param {int} [since] timestamp in ms of the earliest interest event to fetch
     * @param {int} [limit] the maximum number of interest events to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest interest event to fetch
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name derive#withdraw
     * @description make a withdrawal to an L1 address, the payout defaults to the owner wallet and a session key may only pay out to the owner wallet or a whitelisted recipient
     * @see https://docs.derive.xyz/api-reference/transfers-&-withdrawals/privatewithdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the L1 address to withdraw to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.max_fee_usd] the maximum accepted fee in usd, default 1, or 10 with force_batch
     * @param {bool} [params.force_batch] pay the higher fee to have the withdrawal batch proven immediately
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, params?: Dict): Promise<Transaction>;
    /**
     * @method
     * @name derive#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.derive.xyz/api-reference/history/privateget_deposit_history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Transaction[]>;
    /**
     * @method
     * @name derive#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.derive.xyz/api-reference/history/privateget_withdrawal_history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subaccount_id] *required* the subaccount id
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Transaction[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): Str;
    handleDeriveSubaccountId(methodName: string, params: Dict): [any, Dict];
    handleDeriveWalletAddress(methodName: string, params: Dict): [Str, Dict];
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
    nonce(): number;
    sign(path: string, api?: string, method?: string, params?: Dict, headers?: NullableDict, body?: Str): Dict;
}
