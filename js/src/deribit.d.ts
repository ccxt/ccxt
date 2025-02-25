import Exchange from './abstract/deribit.js';
import type { Balances, Currency, FundingRateHistory, Greeks, Int, Liquidation, Market, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, TransferEntry, MarketInterface, Num, Account, Option, OptionChain, Currencies, TradingFees, Dict, int, FundingRate, DepositAddress } from './base/types.js';
/**
 * @class deribit
 * @augments Exchange
 */
export default class deribit extends Exchange {
    describe(): any;
    createExpiredOptionMarket(symbol: string): MarketInterface;
    safeMarket(marketId?: Str, market?: Market, delimiter?: Str, marketType?: Str): MarketInterface;
    /**
     * @method
     * @name deribit#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.deribit.com/#public-get_time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name deribit#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.deribit.com/#public-get_currencies
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    codeFromOptions(methodName: any, params?: {}): any;
    /**
     * @method
     * @name deribit#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.deribit.com/#public-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: number;
        eta: any;
        url: any;
        info: any;
    }>;
    /**
     * @method
     * @name deribit#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://docs.deribit.com/#private-get_subaccounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: any): {
        info: any;
        id: string;
        type: string;
        code: any;
    };
    /**
     * @method
     * @name deribit#fetchMarkets
     * @description retrieves data on all markets for deribit
     * @see https://docs.deribit.com/#public-get_currencies
     * @see https://docs.deribit.com/#public-get_instruments
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseBalance(balance: any): Balances;
    /**
     * @method
     * @name deribit#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.deribit.com/#private-get_account_summary
     * @see https://docs.deribit.com/#private-get_account_summaries
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.code] unified currency code of the currency for the balance, if defined 'privateGetGetAccountSummary' will be used, otherwise 'privateGetGetAccountSummaries' will be used
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name deribit#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.deribit.com/#private-create_deposit_address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        address: string;
        tag: any;
        info: any;
    }>;
    /**
     * @method
     * @name deribit#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.deribit.com/#private-get_current_deposit_address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name deribit#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.deribit.com/#public-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name deribit#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.deribit.com/#public-get_book_summary_by_currency
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.code] *required* the currency code to fetch the tickers for, eg. 'BTC', 'ETH'
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name deribit#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.deribit.com/#public-get_tradingview_chart_data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] whether to paginate the results, set to false by default
     * @param {int} [params.until] the latest time in ms to fetch ohlcv for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name deribit#fetchTrades
     * @see https://docs.deribit.com/#public-get_last_trades_by_instrument
     * @see https://docs.deribit.com/#public-get_last_trades_by_instrument_and_time
     * @description get the list of most recent trades for a particular symbol.
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name deribit#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://docs.deribit.com/#private-get_account_summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    /**
     * @method
     * @name deribit#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.deribit.com/#public-get_order_book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseOrderStatus(status: Str): string;
    parseTimeInForce(timeInForce: Str): string;
    parseOrderType(orderType: any): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name deribit#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.deribit.com/#private-get_order_state
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name deribit#createOrder
     * @description create a trade order
     * @see https://docs.deribit.com/#private-buy
     * @see https://docs.deribit.com/#private-sell
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency. For perpetual and inverse futures the amount is in USD units. For options it is in the underlying assets base currency.
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.trigger] the trigger type 'index_price', 'mark_price', or 'last_price', default is 'last_price'
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name deribit#editOrder
     * @description edit a trade order
     * @see https://docs.deribit.com/#private-edit
     * @param {string} id edit order id
     * @param {string} [symbol] unified symbol of the market to edit an order in
     * @param {string} [type] 'market' or 'limit'
     * @param {string} [side] 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency. For perpetual and inverse futures the amount is in USD units. For options it is in the underlying assets base currency.
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.trailingAmount] the quote amount to trail away from the current market price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name deribit#cancelOrder
     * @description cancels an open order
     * @see https://docs.deribit.com/#private-cancel
     * @param {string} id order id
     * @param {string} symbol not used by deribit cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name deribit#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.deribit.com/#private-cancel_all
     * @see https://docs.deribit.com/#private-cancel_all_by_instrument
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name deribit#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.deribit.com/#private-get_open_orders_by_currency
     * @see https://docs.deribit.com/#private-get_open_orders_by_instrument
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name deribit#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.deribit.com/#private-get_order_history_by_currency
     * @see https://docs.deribit.com/#private-get_order_history_by_instrument
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name deribit#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.deribit.com/#private-get_user_trades_by_order
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
     * @name deribit#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.deribit.com/#private-get_user_trades_by_currency
     * @see https://docs.deribit.com/#private-get_user_trades_by_currency_and_time
     * @see https://docs.deribit.com/#private-get_user_trades_by_instrument
     * @see https://docs.deribit.com/#private-get_user_trades_by_instrument_and_time
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name deribit#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.deribit.com/#private-get_deposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name deribit#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.deribit.com/#private-get_withdrawals
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parsePosition(position: Dict, market?: Market): import("./base/types.js").Position;
    /**
     * @method
     * @name deribit#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://docs.deribit.com/#private-get_position
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<import("./base/types.js").Position>;
    /**
     * @method
     * @name deribit#fetchPositions
     * @description fetch all open positions
     * @see https://docs.deribit.com/#private-get_positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.currency] currency code filter for positions
     * @param {string} [params.kind] market type filter for positions 'future', 'option', 'spot', 'future_combo' or 'option_combo'
     * @param {int} [params.subaccount_id] the user id for the subaccount
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    /**
     * @method
     * @name deribit#fetchVolatilityHistory
     * @description fetch the historical volatility of an option market based on an underlying asset
     * @see https://docs.deribit.com/#public-get_historical_volatility
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [volatility history objects]{@link https://docs.ccxt.com/#/?id=volatility-structure}
     */
    fetchVolatilityHistory(code: string, params?: {}): Promise<any[]>;
    parseVolatilityHistory(volatility: any): any[];
    /**
     * @method
     * @name deribit#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://docs.deribit.com/#private-get_transfers
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of  transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name deribit#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.deribit.com/#private-submit_transfer_to_user
     * @see https://docs.deribit.com/#private-submit_transfer_to_subaccount
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
    /**
     * @method
     * @name deribit#withdraw
     * @description make a withdrawal
     * @see https://docs.deribit.com/#private-withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): {
        info: any;
        withdraw: {
            fee: number;
            percentage: boolean;
        };
        deposit: {
            fee: any;
            percentage: any;
        };
        networks: {};
    };
    /**
     * @method
     * @name deribit#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://docs.deribit.com/#public-get_currencies
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name deribit#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.deribit.com/#public-get_funding_rate_value
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.start_timestamp] fetch funding rate starting from this timestamp
     * @param {int} [params.end_timestamp] fetch funding rate ending at this timestamp
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name deribit#fetchFundingRateHistory
     * @description fetch the current funding rate
     * @see https://docs.deribit.com/#public-get_funding_rate_history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding rate history for
     * @param {int} [limit] the maximum number of entries to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] fetch funding rate ending at this timestamp
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name deribit#fetchLiquidations
     * @description retrieves the public liquidations of a trading pair
     * @see https://docs.deribit.com/#public-get_last_settlements_by_currency
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the deribit api endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    fetchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    addPaginationCursorToResult(cursor: any, data: any): any;
    /**
     * @method
     * @name deribit#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://docs.deribit.com/#private-get_settlement_history_by_instrument
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the deribit api endpoint
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): Liquidation;
    /**
     * @method
     * @name deribit#fetchGreeks
     * @description fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
     * @see https://docs.deribit.com/#public-ticker
     * @param {string} symbol unified symbol of the market to fetch greeks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
     */
    fetchGreeks(symbol: string, params?: {}): Promise<Greeks>;
    parseGreeks(greeks: Dict, market?: Market): Greeks;
    /**
     * @method
     * @name deribit#fetchOption
     * @description fetches option data that is commonly found in an option chain
     * @see https://docs.deribit.com/#public-get_book_summary_by_instrument
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [option chain structure]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    fetchOption(symbol: string, params?: {}): Promise<Option>;
    /**
     * @method
     * @name deribit#fetchOptionChain
     * @description fetches data for an underlying asset that is commonly found in an option chain
     * @see https://docs.deribit.com/#public-get_book_summary_by_currency
     * @param {string} code base currency to fetch an option chain for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [option chain structures]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    fetchOptionChain(code: string, params?: {}): Promise<OptionChain>;
    parseOption(chain: Dict, currency?: Currency, market?: Market): Option;
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
