import Exchange from './abstract/gate.js';
import type { Int, OrderSide, OrderType, OHLCV, Trade, FundingRateHistory, OpenInterest, Order, Balances, OrderRequest, FundingHistory, Str, Transaction, Ticker, OrderBook, Tickers, Greeks, Strings, Market, Currency, MarketInterface, TransferEntry, Leverage, Leverages, Num, OptionChain, Option, MarginModification, TradingFeeInterface, Currencies, TradingFees, Position, Dict, LeverageTier, LeverageTiers, int, CancellationRequest, LedgerEntry, FundingRate, FundingRates, DepositAddress, BorrowInterest } from './base/types.js';
/**
 * @class gate
 * @augments Exchange
 */
export default class gate extends Exchange {
    describe(): any;
    setSandboxMode(enable: boolean): void;
    /**
     * @method
     * @name gate#loadUnifiedStatus
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @description returns unifiedAccount so the user can check if the unified account is enabled
     * @see https://www.gate.io/docs/developers/apiv4/#get-account-detail
     * @returns {boolean} true or false if the enabled unified account is enabled or not and sets the unifiedAccount option if it is undefined
     */
    loadUnifiedStatus(params?: {}): Promise<any>;
    upgradeUnifiedTradeAccount(params?: {}): Promise<any>;
    /**
     * @method
     * @name gate#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-server-current-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    createExpiredOptionMarket(symbol: string): MarketInterface;
    safeMarket(marketId?: Str, market?: Market, delimiter?: Str, marketType?: Str): MarketInterface;
    /**
     * @method
     * @name gate#fetchMarkets
     * @description retrieves data on all markets for gate
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-currency-pairs-supported                                     // spot
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-supported-currency-pairs-supported-in-margin-trading         // margin
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts                                            // swap
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts-2                                          // future
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-the-contracts-with-specified-underlying-and-expiration-time  // option
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchSpotMarkets(params?: {}): Promise<any[]>;
    fetchContractMarkets(params?: {}): Promise<any[]>;
    parseContractMarket(market: any, settleId: any): {
        id: string;
        symbol: string;
        base: string;
        quote: string;
        settle: string;
        baseId: string;
        quoteId: string;
        settleId: any;
        type: string;
        spot: boolean;
        margin: boolean;
        swap: boolean;
        future: boolean;
        option: boolean;
        active: boolean;
        contract: boolean;
        linear: boolean;
        inverse: boolean;
        taker: number;
        maker: number;
        contractSize: number;
        expiry: number;
        expiryDatetime: string;
        strike: any;
        optionType: any;
        precision: {
            amount: number;
            price: number;
        };
        limits: {
            leverage: {
                min: number;
                max: number;
            };
            amount: {
                min: number;
                max: number;
            };
            price: {
                min: number;
                max: number;
            };
            cost: {
                min: any;
                max: any;
            };
        };
        created: any;
        info: any;
    };
    fetchOptionMarkets(params?: {}): Promise<any[]>;
    fetchOptionUnderlyings(): Promise<any[]>;
    prepareRequest(market?: any, type?: any, params?: {}): Dict[];
    spotOrderPrepareRequest(market?: any, trigger?: boolean, params?: {}): any[];
    multiOrderSpotPrepareRequest(market?: any, trigger?: boolean, params?: {}): any[];
    getMarginMode(trigger: any, params: any): any[];
    getSettlementCurrencies(type: any, method: any): any;
    /**
     * @method
     * @name gate#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-currencies-details
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name gate#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-contract
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name gate#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexed by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    parseFundingInterval(interval: any): string;
    fetchNetworkDepositAddress(code: string, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name gate#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.gate.io/docs/developers/apiv4/en/#generate-currency-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] unified network code (not used directly by gate.io but used by ccxt to filter the response)
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name gate#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-personal-trading-fee
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name gate#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-personal-trading-fee
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseTradingFees(response: any): Dict;
    parseTradingFee(info: any, market?: Market): {
        info: any;
        symbol: string;
        maker: number;
        taker: number;
        percentage: any;
        tierBased: any;
    };
    /**
     * @method
     * @name gate#fetchTransactionFees
     * @deprecated
     * @description please use fetchDepositWithdrawFees instead
     * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-withdrawal-status
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTransactionFees(codes?: Strings, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name gate#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-withdrawal-status
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): Dict;
    /**
     * @method
     * @name gate#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://www.gate.io/docs/developers/apiv4/en/#query-account-book-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#query-account-book-3
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingHistories(response: any, symbol: any, since: any, limit: any): FundingHistory[];
    parseFundingHistory(info: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number;
        datetime: string;
        id: any;
        amount: number;
    };
    /**
     * @method
     * @name gate#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-order-book
     * @see https://www.gate.io/docs/developers/apiv4/en/#futures-order-book
     * @see https://www.gate.io/docs/developers/apiv4/en/#futures-order-book-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#options-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name gate#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-details-of-a-specifc-order
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-tickers-of-options-contracts
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name gate#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-details-of-a-specifc-order
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-tickers-of-options-contracts
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseBalanceHelper(entry: any): import("./base/types.js").BalanceAccount;
    /**
     * @method
     * @name gate#fetchBalance
     * @param {object} [params] exchange specific parameters
     * @param {string} [params.type] spot, margin, swap or future, if not provided this.options['defaultType'] is used
     * @param {string} [params.settle] 'btc' or 'usdt' - settle currency for perpetual swap and future - default="usdt" for swap and "btc" for future
     * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
     * @param {string} [params.symbol] margin only - unified ccxt symbol
     * @param {boolean} [params.unifiedAccount] default false, set to true for fetching the unified account balance
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name gateio#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.gate.io/docs/developers/apiv4/en/#market-candlesticks       // spot
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-futures-candlesticks  // swap
     * @see https://www.gate.io/docs/developers/apiv4/en/#market-candlesticks       // future
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-options-candlesticks  // option
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, limit is conflicted with since and params["until"], If either since and params["until"] is specified, request will be rejected
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.price] "mark" or "index" for mark price and index price candles
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume (units in quote currency)
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchOptionOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name gate#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://www.gate.io/docs/developers/apiv4/en/#funding-rate-history
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name gate#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-market-trades
     * @see https://www.gate.io/docs/developers/apiv4/en/#futures-trading-history
     * @see https://www.gate.io/docs/developers/apiv4/en/#futures-trading-history-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#options-trade-history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name gate#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-3
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-4
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
     * @name gate#fetchMyTrades
     * @description Fetch personal trading history
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-3
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-4
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
     * @param {string} [params.type] 'spot', 'swap', or 'future', if not provided this.options['defaultMarginMode'] is used
     * @param {int} [params.until] The latest timestamp, in ms, that fetched trades were made
     * @param {int} [params.page] *spot only* Page number
     * @param {string} [params.order_id] *spot only* Filter trades with specified order ID. symbol is also required if this field is present
     * @param {string} [params.order] *contract only* Futures order ID, return related data only if specified
     * @param {int} [params.offset] *contract only* list offset, starting from 0
     * @param {string} [params.last_id] *contract only* specify list staring point using the id of last record in previous list-query results
     * @param {int} [params.count_total] *contract only* whether to return total number matched, default to 0(no return)
     * @param {bool} [params.unifiedAccount] set to true for fetching trades in a unified account
     * @param {bool} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name gate#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-deposit-records
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name gate#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-withdrawal-records
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name gate#withdraw
     * @description make a withdrawal
     * @see https://www.gate.io/docs/developers/apiv4/en/#withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: Str): string;
    parseTransactionType(type: any): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name gate#createOrder
     * @description Create an order on the exchange
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-an-order
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-price-triggered-order
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-futures-order
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-price-triggered-order-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-futures-order-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-price-triggered-order-3
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-an-options-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market' *"market" is contract only*
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
     * @param {float} [params.stopLossPrice] The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price at which a take profit order is triggered at
     * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
     * @param {int} [params.iceberg] Amount to display for the iceberg order, Null or 0 for normal orders, Set to -1 to hide the order completely
     * @param {string} [params.text] User defined information
     * @param {string} [params.account] *spot and margin only* "spot", "margin" or "cross_margin"
     * @param {bool} [params.auto_borrow] *margin only* Used in margin or cross margin trading to allow automatic loan of insufficient amount if balance is not enough
     * @param {string} [params.settle] *contract only* Unified Currency Code for settle currency
     * @param {bool} [params.reduceOnly] *contract only* Indicates if this order is to reduce the size of a position
     * @param {bool} [params.close] *contract only* Set as true to close the position, with size set to 0
     * @param {bool} [params.auto_size] *contract only* Set side to close dual-mode position, close_long closes the long side, while close_short the short one, size also needs to be set to 0
     * @param {int} [params.price_type] *contract only* 0 latest deal price, 1 mark price, 2 index price
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {bool} [params.unifiedAccount] set to true for creating an order in the unified account
     * @returns {object|undefined} [An order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createOrdersRequest(orders: OrderRequest[], params?: {}): any[];
    /**
     * @method
     * @name gate#createOrders
     * @description create a list of trade orders
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-batch-of-orders
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-batch-of-futures-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name gate#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-an-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.unifiedAccount] set to true for creating a unified account order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    editOrderRequest(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): any;
    /**
     * @method
     * @name gate#editOrder
     * @description edit a trade order, gate currently only supports the modification of the price or amount fields
     * @see https://www.gate.io/docs/developers/apiv4/en/#amend-an-order
     * @see https://www.gate.io/docs/developers/apiv4/en/#amend-an-order-2
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.unifiedAccount] set to true for editing an order in a unified account
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    fetchOrderRequest(id: string, symbol?: Str, params?: {}): any[];
    /**
     * @method
     * @name gate#fetchOrder
     * @description Retrieves information on an order
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-3
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-4
     * @param {string} id Order id
     * @param {string} symbol Unified market symbol, *required for spot and margin*
     * @param {object} [params] Parameters specified by the exchange api
     * @param {bool} [params.trigger] True if the order being fetched is a trigger order
     * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
     * @param {string} [params.type] 'spot', 'swap', or 'future', if not provided this.options['defaultMarginMode'] is used
     * @param {string} [params.settle] 'btc' or 'usdt' - settle currency for perpetual swap and future - market settle currency is used if symbol !== undefined, default="usdt" for swap and "btc" for future
     * @param {bool} [params.unifiedAccount] set to true for fetching a unified account order
     * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name gate#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-open-orders
     * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-running-auto-order-list
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true for fetching trigger orders
     * @param {string} [params.type] spot, margin, swap or future, if not provided this.options['defaultType'] is used
     * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for type='margin', if not provided this.options['defaultMarginMode'] is used
     * @param {bool} [params.unifiedAccount] set to true for fetching unified account orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name gate#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-orders
     * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-running-auto-order-list
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-orders
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-auto-orders
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-orders-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-auto-orders-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-options-orders
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-orders-by-time-range
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] true for fetching trigger orders
     * @param {string} [params.type] spot, swap or future, if not provided this.options['defaultType'] is used
     * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
     * @param {boolean} [params.historical] *swap only* true for using historical endpoint
     * @param {bool} [params.unifiedAccount] set to true for fetching unified account orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    prepareOrdersByStatusRequest(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): object[];
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name gate#cancelOrder
     * @description Cancels an open order
     * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order
     * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order-3
     * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order-4
     * @param {string} id Order id
     * @param {string} symbol Unified market symbol
     * @param {object} [params] Parameters specified by the exchange api
     * @param {bool} [params.trigger] True if the order to be cancelled is a trigger order
     * @param {bool} [params.unifiedAccount] set to true for canceling unified account orders
     * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name gate#cancelOrders
     * @description cancel multiple orders
     * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-a-batch-of-orders-with-an-id-list
     * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-a-batch-of-orders-with-an-id-list-2
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.unifiedAccount] set to true for canceling unified account orders
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name gate#cancelOrdersForSymbols
     * @description cancel multiple orders for multiple symbols
     * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-a-batch-of-orders-with-an-id-list
     * @param {CancellationRequest[]} orders list of order ids with symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @param {bool} [params.unifiedAccount] set to true for canceling unified account orders
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrdersForSymbols(orders: CancellationRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name gate#cancelAllOrders
     * @description cancel all open orders
     * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-in-specified-currency-pair
     * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-matched
     * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-matched-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-matched-3
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.unifiedAccount] set to true for canceling unified account orders
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name gate#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://www.gate.io/docs/developers/apiv4/en/#transfer-between-trading-accounts
     * @param {string} code unified currency code for currency being transferred
     * @param {float} amount the amount of currency to transfer
     * @param {string} fromAccount the account to transfer currency from
     * @param {string} toAccount the account to transfer currency to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.symbol] Unified market symbol *required for type == margin*
     * @returns A [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name gate#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-leverage
     * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-leverage-2
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name gate#fetchPosition
     * @description fetch data on an open contract position
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-single-position
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-single-position-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-specified-contract-position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name gate#fetchPositions
     * @description fetch all open positions
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-positions-of-a-user
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-positions-of-a-user-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-user-s-positions-of-specified-underlying
     * @param {string[]|undefined} symbols Not used by gate, but parsed internally by CCXT
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.settle] 'btc' or 'usdt' - settle currency for perpetual swap and future - default="usdt" for swap and "btc" for future
     * @param {string} [params.type] swap, future or option, if not provided this.options['defaultType'] is used
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name gate#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts-2
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    /**
     * @method
     * @name gate#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-risk-limit-tiers
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}
     */
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    parseEmulatedLeverageTiers(info: any, market?: any): LeverageTier[];
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    /**
     * @method
     * @name gate#repayMargin
     * @description repay borrowed margin and interest
     * @see https://www.gate.io/docs/apiv4/en/#repay-a-loan
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.mode] 'all' or 'partial' payment mode, extra parameter required for isolated margin
     * @param {string} [params.id] '34267567' loan id, extra parameter required for isolated margin
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayIsolatedMargin(symbol: string, code: string, amount: any, params?: {}): Promise<{
        id: number;
        currency: string;
        amount: number;
        symbol: string;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    /**
     * @method
     * @name gate#repayCrossMargin
     * @description repay cross margin borrowed margin and interest
     * @see https://www.gate.io/docs/developers/apiv4/en/#cross-margin-repayments
     * @see https://www.gate.io/docs/developers/apiv4/en/#borrow-or-repay
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.mode] 'all' or 'partial' payment mode, extra parameter required for isolated margin
     * @param {string} [params.id] '34267567' loan id, extra parameter required for isolated margin
     * @param {boolean} [params.unifiedAccount] set to true for repaying in the unified account
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayCrossMargin(code: string, amount: any, params?: {}): Promise<{
        id: number;
        currency: string;
        amount: number;
        symbol: string;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    /**
     * @method
     * @name gate#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://www.gate.io/docs/developers/apiv4/en/#marginuni
     * @param {string} symbol unified market symbol, required for isolated margin
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.rate] '0.0002' or '0.002' extra parameter required for isolated margin
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowIsolatedMargin(symbol: string, code: string, amount: number, params?: {}): Promise<{
        id: number;
        currency: string;
        amount: number;
        symbol: string;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    /**
     * @method
     * @name gate#borrowMargin
     * @description create a loan to borrow margin
     * @see https://www.gate.io/docs/apiv4/en/#create-a-cross-margin-borrow-loan
     * @see https://www.gate.io/docs/developers/apiv4/en/#borrow-or-repay
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.rate] '0.0002' or '0.002' extra parameter required for isolated margin
     * @param {boolean} [params.unifiedAccount] set to true for borrowing in the unified account
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowCrossMargin(code: string, amount: number, params?: {}): Promise<{
        id: number;
        currency: string;
        amount: number;
        symbol: string;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: number;
        currency: string;
        amount: number;
        symbol: string;
        timestamp: number;
        datetime: string;
        info: any;
    };
    /**
     * @method
     * @name gate#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-interest-records
     * @see https://www.gate.io/docs/developers/apiv4/en/#interest-records-for-the-cross-margin-account
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-interest-records-2
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol when fetching interest in isolated markets
     * @param {int} [since] the earliest time in ms to fetch borrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unifiedAccount] set to true for fetching borrow interest in the unified account
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    nonce(): number;
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    modifyMarginHelper(symbol: string, amount: any, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name gate#reduceMargin
     * @description remove margin from a position
     * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-margin
     * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-margin-2
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name gate#addMargin
     * @description add margin
     * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-margin
     * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-margin-2
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name gate#fetchOpenInterest
     * @description Retrieves the open interest of a currency
     * @see https://www.gate.io/docs/developers/apiv4/en/#futures-stats
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} timeframe "5m", "15m", "30m", "1h", "4h", "1d"
     * @param {int} [since] the time(ms) of the earliest record to retrieve as a unix timestamp
     * @param {int} [limit] default 30
     * @param {object} [params] exchange specific parameters
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
     */
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OpenInterest[]>;
    parseOpenInterest(interest: any, market?: Market): {
        symbol: string;
        openInterestAmount: number;
        openInterestValue: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    /**
     * @method
     * @name gate#fetchSettlementHistory
     * @description fetches historical settlement records
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-settlement-history-2
     * @param {string} symbol unified market symbol of the settlement history, required on gate
     * @param {int} [since] timestamp in ms
     * @param {int} [limit] number of records
     * @param {object} [params] exchange specific params
     * @returns {object[]} a list of [settlement history objects]{@link https://docs.ccxt.com/#/?id=settlement-history-structure}
     */
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name gate#fetchMySettlementHistory
     * @description fetches historical settlement records of the user
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-my-options-settlements
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
     * @name gate#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.gate.io/docs/developers/apiv4/en/#query-account-book
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-margin-account-balance-change-history
     * @see https://www.gate.io/docs/developers/apiv4/en/#query-account-book-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#query-account-book-3
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-account-changing-history
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: any): string;
    /**
     * @method
     * @name gate#setPositionMode
     * @description set dual/hedged mode to true or false for a swap market, make sure all positions are closed and no orders are open before setting dual mode
     * @see https://www.gate.io/docs/developers/apiv4/en/#enable-or-disable-dual-mode
     * @param {bool} hedged set to true to enable dual mode
     * @param {string|undefined} symbol if passed, dual mode is set for all markets with the same settle currency
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {string} params.settle settle currency
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name gate#fetchUnderlyingAssets
     * @description fetches the market ids of underlying assets for a specific contract market type
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-underlyings
     * @param {object} [params] exchange specific params
     * @param {string} [params.type] the contract market type, 'option', 'swap' or 'future', the default is 'option'
     * @returns {object[]} a list of [underlying assets]{@link https://docs.ccxt.com/#/?id=underlying-assets-structure}
     */
    fetchUnderlyingAssets(params?: {}): Promise<any[]>;
    /**
     * @method
     * @name gate#fetchLiquidations
     * @description retrieves the public liquidations of a trading pair
     * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-liquidation-history
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    fetchLiquidations(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    /**
     * @method
     * @name gate#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-liquidation-history
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-liquidation-history-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-user-s-liquidation-history-of-specified-underlying
     * @param {string} symbol unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters for the exchange API endpoint
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
     */
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): import("./base/types.js").Liquidation;
    /**
     * @method
     * @name gate#fetchGreeks
     * @description fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-tickers-of-options-contracts
     * @param {string} symbol unified symbol of the market to fetch greeks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
     */
    fetchGreeks(symbol: string, params?: {}): Promise<Greeks>;
    parseGreeks(greeks: Dict, market?: Market): Greeks;
    /**
     * @method
     * @name gate#closePosition
     * @description closes open positions for a market
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-futures-order
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-futures-order-2
     * @see https://www.gate.io/docs/developers/apiv4/en/#create-an-options-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} side 'buy' or 'sell'
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name gate#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-unified-account-information
     * @see https://www.gate.io/docs/developers/apiv4/en/#get-detail-of-lending-market
     * @see https://www.gate.io/docs/developers/apiv4/en/#query-one-single-margin-currency-pair-deprecated
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unified] default false, set to true for fetching the unified accounts leverage
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name gate#fetchLeverages
     * @description fetch the set leverage for all leverage markets, only spot margin is supported on gate
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-lending-markets
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-supported-currency-pairs-supported-in-margin-trading-deprecated
     * @param {string[]} symbols a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.unified] default false, set to true for fetching unified account leverages
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverages(symbols?: Strings, params?: {}): Promise<Leverages>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name gate#fetchOption
     * @description fetches option data that is commonly found in an option chain
     * @see https://www.gate.io/docs/developers/apiv4/en/#query-specified-contract-detail
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [option chain structure]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    fetchOption(symbol: string, params?: {}): Promise<Option>;
    /**
     * @method
     * @name gate#fetchOptionChain
     * @description fetches data for an underlying asset that is commonly found in an option chain
     * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-the-contracts-with-specified-underlying-and-expiration-time
     * @param {string} code base currency to fetch an option chain for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.underlying] the underlying asset, can be obtained from fetchUnderlyingAssets ()
     * @param {int} [params.expiration] unix timestamp of the expiration time
     * @returns {object} a list of [option chain structures]{@link https://docs.ccxt.com/#/?id=option-chain-structure}
     */
    fetchOptionChain(code: string, params?: {}): Promise<OptionChain>;
    parseOption(chain: Dict, currency?: Currency, market?: Market): Option;
    /**
     * @method
     * @name gate#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://www.gate.io/docs/developers/apiv4/#list-position-close-history
     * @see https://www.gate.io/docs/developers/apiv4/#list-position-close-history-2
     * @param {string[]} symbols unified conract symbols, must all have the same settle currency and the same market type
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum amount of records to fetch, default=1000
     * @param {object} params extra parameters specific to the exchange api endpoint
     * @param {int} [params.until] the latest time in ms to fetch positions for
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.offset] list offset, starting from 0
     * @param {string} [params.side] long or short
     * @param {string} [params.pnl] query profit or loss
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionsHistory(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
