import Exchange from './abstract/ascendex.js';
import type { TransferEntry, FundingHistory, Int, OHLCV, Order, OrderSide, OrderType, OrderRequest, Str, Trade, Balances, Transaction, Ticker, OrderBook, Tickers, Strings, Num, Currency, Market, Leverage, Leverages, Account, MarginModes, MarginMode, MarginModification, Currencies, TradingFees, Dict, LeverageTier, LeverageTiers, int, FundingRate, FundingRates, DepositAddress, Position } from './base/types.js';
/**
 * @class ascendex
 * @augments Exchange
 */
export default class ascendex extends Exchange {
    describe(): any;
    getAccount(params?: {}): string;
    /**
     * @method
     * @name ascendex#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name ascendex#fetchMarkets
     * @description retrieves data on all markets for ascendex
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchSpotMarkets(params?: {}): Promise<Market[]>;
    fetchContractMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name ascendex#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the ascendex server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the ascendex server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name ascendex#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseBalance(response: any): Balances;
    parseMarginBalance(response: any): Balances;
    parseSwapBalance(response: any): Balances;
    /**
     * @method
     * @name ascendex#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://ascendex.github.io/ascendex-pro-api/#cash-account-balance
     * @see https://ascendex.github.io/ascendex-pro-api/#margin-account-balance
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#position
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] wallet type, 'spot', 'margin', or 'swap'
     * @param {string} [params.marginMode] 'cross' or undefined, for spot margin trading, value of 'isolated' is invalid
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name ascendex#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name ascendex#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name ascendex#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://ascendex.github.io/ascendex-pro-api/#ticker
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name ascendex#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name ascendex#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://ascendex.github.io/ascendex-pro-api/#market-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseOrderStatus(status: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name ascendex#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name ascendex#createOrder
     * @description create a trade order on the exchange
     * @see https://ascendex.github.io/ascendex-pro-api/#place-order
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#new-order
     * @param {string} symbol unified CCXT market symbol
     * @param {string} type "limit" or "market"
     * @param {string} side "buy" or "sell"
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO"
     * @param {bool} [params.postOnly] true or false
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice that the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] *swap only* take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice that the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] *swap only* stop loss trigger price
     * @returns [An order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name ascendex#createOrders
     * @description create a list of trade orders
     * @see https://ascendex.github.io/ascendex-pro-api/#place-batch-orders
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#place-batch-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] "GTC", "IOC", "FOK", or "PO"
     * @param {bool} [params.postOnly] true or false
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name ascendex#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://ascendex.github.io/ascendex-pro-api/#query-order
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#query-order-by-id
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name ascendex#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://ascendex.github.io/ascendex-pro-api/#list-open-orders
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#list-open-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name ascendex#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://ascendex.github.io/ascendex-pro-api/#list-history-orders-v2
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#list-current-history-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name ascendex#cancelOrder
     * @description cancels an open order
     * @see https://ascendex.github.io/ascendex-pro-api/#cancel-order
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#cancel-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name ascendex#cancelAllOrders
     * @description cancel all open orders
     * @see https://ascendex.github.io/ascendex-pro-api/#cancel-all-orders
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#cancel-all-open-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list with a single [order structure]{@link https://docs.ccxt.com/#/?id=order-structure} with the response assigned to the info property
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name ascendex#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://ascendex.github.io/ascendex-pro-api/#query-deposit-addresses
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] unified network code for deposit chain
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name ascendex#fetchDeposits
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
     * @name ascendex#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name ascendex#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name ascendex#fetchPositions
     * @description fetch all open positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name ascendex#fetchFundingRates
     * @description fetch the funding rate for multiple markets
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name ascendex#reduceMargin
     * @description remove margin from a position
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name ascendex#addMargin
     * @description add margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name ascendex#setLeverage
     * @description set the level of leverage for a market
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#change-contract-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name ascendex#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#change-margin-type
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name ascendex#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    parseDepositWithdrawFee(fee: any, currency?: Currency): Dict;
    /**
     * @method
     * @name ascendex#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://ascendex.github.io/ascendex-pro-api/#list-all-assets
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name ascendex#transfer
     * @description transfer currency internally between wallets on the same account
     * @param {string} code unified currency codeåå
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
     * @name ascendex#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#funding-payment-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    parseIncome(income: any, market?: Market): {
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
     * @name ascendex#fetchMarginModes
     * @description fetches the set margin mode of the user
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#position
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    fetchMarginModes(symbols?: Strings, params?: {}): Promise<MarginModes>;
    parseMarginMode(marginMode: Dict, market?: any): MarginMode;
    /**
     * @method
     * @name ascendex#fetchLeverages
     * @description fetch the set leverage for all contract markets
     * @see https://ascendex.github.io/ascendex-futures-pro-api-v2/#position
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverages(symbols?: Strings, params?: {}): Promise<Leverages>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
