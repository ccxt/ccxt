import Exchange from './abstract/extended.js';
import type { Account, Balances, Currencies, Currency, Dict, FundingHistory, FundingRateHistory, Int, int, LedgerEntry, Leverage, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, TradingFees, Transaction, TransferEntry } from './base/types.js';
/**
 * @class extended
 * @augments Exchange
 */
export default class extended extends Exchange {
    describe(): any;
    loadMarkets(reload?: boolean, params?: {}): Promise<import("./base/types.js").Dictionary<import("./base/types.js").MarketInterface>>;
    indexByStringifiedNumericId(input: any): Dict;
    /**
     * @method
     * @name extended#fetchMarkets
     * @description retrieves data on all markets for extended
     * @see https://api.docs.extended.exchange/#get-markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name extended#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api.docs.extended.exchange/#get-assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrency(currency: Dict): Currency;
    /**
     * @method
     * @name extended#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api.docs.extended.exchange/#get-market-statistics
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name extended#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for all markets
     * @see https://api.docs.extended.exchange/#get-markets
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: any, market?: any): Ticker;
    /**
     * @method
     * @name extended#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api.docs.extended.exchange/#get-market-order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name extended#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api.docs.extended.exchange/#get-market-last-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name extended#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api.docs.extended.exchange/#get-trades
     * @param {string} [symbol] unified market symbol of the trades
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name extended#fetchFundingHistory
     * @description fetch the funding payments history
     * @see https://api.docs.extended.exchange/#get-funding-payments
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {FundingHistory[]} a list of [funding history structures]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseFundingHistory(history: any, market?: Market): FundingHistory;
    parseFundingHistories(histories: any, market?: Market, since?: Int, limit?: Int): FundingHistory[];
    parseTrade(trade: any, market?: any): Trade;
    /**
     * @method
     * @name extended#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api.docs.extended.exchange/#get-candles-history
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, default 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.candleType] candle type: 'trades' (default), 'mark-prices', or 'index-prices'
     * @param {string} [params.price] *ignored if params.candleType is set* 'mark' or 'index' for mark price and index price candles
     * @param {int} [params.until] end timestamp in ms for the requested period
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: any): OHLCV;
    /**
     * @method
     * @name extended#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api.docs.extended.exchange/#get-funding-rates-history
     * @param {string} symbol unified symbol of the market to fetch funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of entries to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate to fetch
     * @param {int} [params.endTime] exchange-specific end timestamp in ms of the latest funding rate to fetch
     * @param {int} [params.cursor] offset of the result set
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRateHistory(info: any, market?: Market): FundingRateHistory;
    /**
     * @method
     * @name extended#fetchOpenInterestHistory
     * @description Retrieves the open interest history of a currency
     * @see https://api.docs.extended.exchange/#get-open-interest-history
     * @param {string} symbol unified CCXT market symbol
     * @param {string} timeframe '1h' or '1d'
     * @param {int} [since] the time(ms) of the earliest record to retrieve as a unix timestamp
     * @param {int} [limit] the maximum amount of open interest structures to retrieve
     * @param {object} [params] exchange specific parameters
     * @param {int} [params.until] timestamp in ms of the latest open interest record to fetch
     * @returns {object[]} an array of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterestHistory(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").OpenInterest[]>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name extended#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://api.docs.extended.exchange/#get-spot-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name extended#fetchAccount
     * @description fetch the current authenticated sub-account
     * @see https://api.docs.extended.exchange/#get-account-details
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [account structure]{@link https://docs.ccxt.com/?id=account-structure}
     */
    fetchAccount(params?: {}): Promise<Account>;
    /**
     * @method
     * @name extended#fetchAccounts
     * @description fetch the current authenticated sub-account, extended private endpoints only return records for the authenticated sub-account
     * @see https://api.docs.extended.exchange/#get-sub-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: Dict): Account;
    /**
     * @method
     * @name extended#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [ledger structures]{@link https://docs.ccxt.com/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    /**
     * @method
     * @name extended#fetchTransactions
     * @description fetch history of deposits, withdrawals, and transfers
     * @see https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch transactions for
     * @param {int} [limit] the maximum number of transaction structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Transaction[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchTransactions(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name extended#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposit structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Transaction[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name extended#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawal structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Transaction[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name extended#withdraw
     * @description make a Starknet withdrawal
     * @see https://api.docs.extended.exchange/#withdrawals
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the Starknet address to withdraw to
     * @param {string} tag unused
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.chainId] only STRK is supported
     * @param {int} [params.settlementExpiration] settlement expiration timestamp in seconds, defaults to now + 14 days + 60 seconds
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name extended#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://api.docs.extended.exchange/#get-deposits-withdrawals-transfers-history
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {TransferEntry[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name extended#transfer
     * @description transfer collateral between sub-accounts associated with the same wallet
     * @see https://api.docs.extended.exchange/#create-transfer
     * @param {string} code unified currency code
     * @param {float} amount the amount to transfer
     * @param {string} fromAccount source account id, defaults to the authenticated account id
     * @param {string} toAccount destination account id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.toVault destination account L2 vault
     * @param {string} params.toL2Key destination account L2 public key
     * @param {int} [params.settlementExpiration] settlement expiration timestamp in seconds, defaults to now + 21 days
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    getExtendedCurrencyCodeById(assetId: Str, currency?: Currency): Str;
    parseTransactionStatus(status: Str): Str;
    parseTransactionType(type: Str): Str;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name extended#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://api.docs.extended.exchange/#get-fees
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.builderId] builder client id
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name extended#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://api.docs.extended.exchange/#get-fees
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.market] exchange market id
     * @param {string} [params.builderId] builder client id
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseTradingFee(fee: any, market?: any): TradingFeeInterface;
    /**
     * @method
     * @name extended#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://api.docs.extended.exchange/#get-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name extended#setLeverage
     * @description set the level of leverage for a market
     * @see https://api.docs.extended.exchange/#update-leverage
     * @param {int} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: any, market?: any): Leverage;
    /**
     * @method
     * @name extended#fetchPositions
     * @description fetch all open positions
     * @see https://api.docs.extended.exchange/#get-positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Position[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name extended#fetchPosition
     * @description fetch data on an open position
     * @see https://api.docs.extended.exchange/#get-positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name extended#fetchPositionsHistory
     * @description fetch historical positions
     * @see https://api.docs.extended.exchange/#get-positions-history
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch positions for
     * @param {int} [limit] the maximum number of position structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Position[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositionsHistory(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    parsePosition(position: any, market?: any): Position;
    getExtendedStarkAmount(amount: string, resolution: any, roundUp?: boolean): string;
    fetchExtendedAccount(params?: {}): Promise<any>;
    createOrderSettlementData(isBuy: boolean, amountString: string, priceString: string, params?: {}): {
        starkKey: string;
        collateralPosition: string;
        baseAssetId: string;
        baseAmount: string;
        quoteAssetId: string;
        quoteAmount: string;
        feeAssetId: string;
        feeAmount: string;
        expiration: string;
        salt: number;
    };
    createWithdrawalSettlementData(address: string, amountString: string, currency: Currency, account: Dict, params?: {}): Dict;
    createTransferSettlementData(amountString: string, currency: Currency, account: Dict, toVault: string, toL2Key: string, params?: {}): Dict;
    createExtendedOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: Num, price?: Num, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name extended#createOrder
     * @description create a trade order
     * @see https://api.docs.extended.exchange/#create-or-edit-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, required for all order types
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, sent as the exchange order id
     * @param {string} [params.cancelId] previous external order id to replace
     * @param {string} [params.timeInForce] 'GTT' or 'IOC'
     * @param {boolean} [params.postOnly] true if the order should only make liquidity
     * @param {boolean} [params.reduceOnly] true if the order should only reduce a position
     * @param {string} [params.fee] max fee rate for the order, default is 0.0005
     * @param {int} [params.expiryEpochMillis] order expiration timestamp in milliseconds, default is now + 1 hour
     * @param {float} [params.triggerPrice] *swap only* The price at which a trigger order is triggered at
     * @param {float} [params.stopLossPrice] *swap only* The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] *swap only* The price at which a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] *swap only* take profit trigger price
     * @param {float} [params.takeProfit.price] *swap only* the execution price for a take profit attached to a trigger order
     * @param {string} [params.takeProfit.type] *swap only* the type for a take profit attached to a trigger order, 'LAST', 'MARK' or 'INDEX', default is ''
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] *swap only* stop loss trigger price
     * @param {float} [params.stopLoss.price] *swap only* the execution price for a stop loss attached to a trigger order
     * @param {string} [params.stopLoss.type] *swap only* the type for a stop loss attached to a trigger order, 'LAST', 'MARK' or 'INDEX', default is ''
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name extended#editOrder
     * @description edit a trade order
     * @see https://api.docs.extended.exchange/#create-or-edit-order
     * @param {string} id order id assigned by Extended
     * @param {string} symbol unified symbol of the market to edit an order in
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name extended#cancelOrder
     * @description cancels an open order
     * @see https://api.docs.extended.exchange/#cancel-order-by-id
     * @see https://api.docs.extended.exchange/#cancel-order-by-external-id
     * @param {string} id order id assigned by Extended
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] user-defined order id, cancels by external id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name extended#cancelOrders
     * @description cancel multiple orders by order ids or client order ids
     * @see https://api.docs.extended.exchange/#mass-cancel
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol, only used to populate the returned orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @param {string} [params.clientOrderId] single client order id
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name extended#cancelAllOrders
     * @description cancels all open orders, optionally filtered by symbol
     * @see https://api.docs.extended.exchange/#mass-cancel
     * @param {string} [symbol] unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name extended#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @see https://api.docs.extended.exchange/#mass-auto-cancel-dead-man-39-s-switch
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: {}): Promise<any>;
    /**
     * @method
     * @name extended#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api.docs.extended.exchange/#get-order-by-id
     * @see https://api.docs.extended.exchange/#get-orders-by-external-id
     * @param {string} id order id assigned by Extended
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] user-defined order id, fetches by external id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name extended#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api.docs.extended.exchange/#get-open-orders
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name extended#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api.docs.extended.exchange/#get-orders-history
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name extended#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://api.docs.extended.exchange/#get-orders-history
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name extended#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://api.docs.extended.exchange/#get-orders-history
     * @param {string} [symbol] unified market symbol of the orders
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrderStatus(status: Str): Str;
    parseOrder(order: any, market?: any): Order;
    getExtendedStringToFelt(value: string): bigint;
    getExtendedEncodeI64(value: any): any;
    getExtendedDecimalToBase16(value: any): string;
    getExtendedSignatureHex(signature: any): string;
    getExtendedDomainHash(): bigint;
    getExtendedOrderMsgHash(settlement: Dict): string;
    getExtendedWithdrawalMsgHash(settlement: Dict, starkKey: string): string;
    getExtendedTransferMsgHash(settlement: Dict): string;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
