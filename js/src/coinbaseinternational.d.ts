import Exchange from './abstract/coinbaseinternational.js';
import type { Int, OrderSide, OrderType, Order, Trade, Ticker, Str, Transaction, Balances, Tickers, Strings, Market, Currency, TransferEntry, Position, FundingRateHistory, Currencies, Dict, int, OHLCV } from './base/types.js';
/**
 * @class coinbaseinternational
 * @augments Exchange
 */
export default class coinbaseinternational extends Exchange {
    describe(): any;
    handlePortfolioAndParams(methodName: string, params?: {}): Promise<any[]>;
    handleNetworkIdAndParams(currencyCode: string, methodName: string, params: any): Promise<any[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://docs.cloud.coinbase.com/intx/reference/getportfolios
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<import("./base/types.js").Account[]>;
    parseAccount(account: any): {
        id: string;
        type: any;
        code: any;
        info: any;
    };
    /**
     * @method
     * @name coinbaseinternational#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.cdp.coinbase.com/intx/reference/getinstrumentcandles
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
    /**
     * @method
     * @name coinbaseinternational#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.cloud.coinbase.com/intx/reference/getinstrumentfunding
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRateHistory(info: any, market?: Market): FundingRateHistory;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: number;
        indexPrice: any;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: number;
        datetime: string;
        fundingRate: number;
        fundingTimestamp: number;
        fundingDatetime: string;
        nextFundingRate: any;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    /**
     * @method
     * @name coinbaseinternational#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://docs.cdp.coinbase.com/intx/reference/gettransfers
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").FundingHistory[]>;
    parseIncome(income: any, market?: Market): {
        info: any;
        symbol: string;
        code: string;
        timestamp: number;
        datetime: string;
        id: string;
        amount: number;
        rate: any;
    };
    /**
     * @method
     * @name coinbaseinternational#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://docs.cdp.coinbase.com/intx/reference/gettransfers
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
     * @name coinbaseinternational#createDepositAddress
     * @description create a currency deposit address
     * @see https://docs.cloud.coinbase.com/intx/reference/createaddress
     * @see https://docs.cloud.coinbase.com/intx/reference/createcounterpartyid
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network_arn_id] Identifies the blockchain network (e.g., networks/ethereum-mainnet/assets/313ef8a9-ae5a-5f2f-8a56-572c0e2a4d5a) if not provided will pick default
     * @param {string} [params.network] unified network code to identify the blockchain network
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<{
        currency: string;
        tag: string;
        address: string;
        info: any;
    }>;
    findDefaultNetwork(networks: any): any;
    loadCurrencyNetworks(code: any, params?: {}): Promise<void>;
    parseNetworks(networks: any, params?: {}): Dict;
    parseNetwork(network: any, params?: {}): {
        info: any;
        id: string;
        name: string;
        network: string;
        active: boolean;
        deposit: boolean;
        withdraw: boolean;
        fee: number;
        precision: number;
        limits: {
            withdraw: {
                min: number;
                max: number;
            };
            deposit: {
                min: number;
                max: number;
            };
        };
    };
    /**
     * @method
     * @name coinbaseinternational#setMargin
     * @description Either adds or reduces margin in order to set the margin to a specific value
     * @see https://docs.cloud.coinbase.com/intx/reference/setportfoliomarginoverride
     * @param {string} symbol unified market symbol of the market to set margin in
     * @param {float} amount the amount to set the margin to
     * @param {object} [params] parameters specific to the exchange API endpoint
     * @returns {object} A [margin structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#add-margin-structure}
     */
    setMargin(symbol: string, amount: number, params?: {}): Promise<any>;
    /**
     * @method
     * @name exchange#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://docs.cloud.coinbase.com/intx/reference/gettransfers
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.portfolios] Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
     * @param {int} [params.until] Only find transfers updated before this time. Use timestamp format
     * @param {string} [params.status] The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
     * @param {string} [params.type] The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchPosition
     * @see https://docs.cloud.coinbase.com/intx/reference/getportfolioposition
     * @description fetch data on an open position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name coinbaseinternational#fetchPositions
     * @see https://docs.cloud.coinbase.com/intx/reference/getportfoliopositions
     * @description fetch all open positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.cloud.coinbase.com/intx/reference/gettransfers
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.portfolios] Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
     * @param {int} [params.until] Only find transfers updated before this time. Use timestamp format
     * @param {string} [params.status] The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
     * @param {string} [params.type] The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchDeposits
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.portfolios] Identifies the portfolios by UUID (e.g., 892e8c7c-e979-4cad-b61b-55a197932cf1) or portfolio ID (e.g., 5189861793641175). Can provide single or multiple portfolios to filter by or fetches transfers for all portfolios if none are provided.
     * @param {int} [params.until] Only find transfers updated before this time. Use timestamp format
     * @param {string} [params.status] The current status of transfer. Possible values: [PROCESSED, NEW, FAILED, STARTED]
     * @param {string} [params.type] The type of transfer Possible values: [DEPOSIT, WITHDRAW, REBATE, STIPEND, INTERNAL, FUNDING]
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name coinbaseinternational#fetchMarkets
     * @see https://docs.cloud.coinbase.com/intx/reference/getinstruments
     * @description retrieves data on all markets for coinbaseinternational
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name coinbaseinternational#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.cloud.coinbase.com/intx/reference/getassets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrency(currency: Dict): Currency;
    /**
     * @method
     * @name coinbaseinternational#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.cloud.coinbase.com/intx/reference/getinstruments
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name coinbaseinternational#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.cloud.coinbase.com/intx/reference/getinstrumentquote
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: object, market?: Market): Ticker;
    /**
     * @method
     * @name coinbaseinternational#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.cloud.coinbase.com/intx/reference/getportfoliobalances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.v3] default false, set true to use v3 api endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name coinbaseinternational#transfer
     * @description Transfer an amount of asset from one portfolio to another.
     * @see https://docs.cloud.coinbase.com/intx/reference/createportfolioassettransfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name coinbaseinternational#createOrder
     * @description create a trade order
     * @see https://docs.cloud.coinbase.com/intx/reference/createorder
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency, quote currency for 'market' 'buy' orders
     * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.stopPrice] alias for triggerPrice
     * @param {float} [params.triggerPrice] price to trigger stop orders
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {bool} [params.postOnly] true or false
     * @param {string} [params.tif] 'GTC', 'IOC', 'GTD' default is 'GTC' for limit orders and 'IOC' for market orders
     * @param {string} [params.expire_time] The expiration time required for orders with the time in force set to GTT. Must not go beyond 30 days of the current time. Uses ISO-8601 format (e.g., 2023-03-16T23:59:53Z)
     * @param {string} [params.stp_mode] Possible values: [NONE, AGGRESSING, BOTH] Specifies the behavior for self match handling. None disables the functionality, new cancels the newest order, and both cancels both orders.
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: number, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderType(type: Str): string;
    /**
     * @method
     * @name coinbaseinternational#cancelOrder
     * @description cancels an open order
     * @see https://docs.cloud.coinbase.com/intx/reference/cancelorder
     * @param {string} id order id
     * @param {string} symbol not used by coinbaseinternational cancelOrder()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbaseinternational#cancelAllOrders
     * @description cancel all open orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: string, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbaseinternational#editOrder
     * @description edit a trade order
     * @see https://docs.cloud.coinbase.com/intx/reference/modifyorder
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.clientOrderId client order id
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: number, price?: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbaseinternational#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.cloud.coinbase.com/intx/reference/modifyorder
     * @param {string} id the order id
     * @param {string} symbol unified market symbol that the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coinbaseinternational#fetchOpenOrders
     * @description fetches information on all currently open orders
     * @see https://docs.cloud.coinbase.com/intx/reference/getorders
     * @param {string} symbol unified market symbol of the orders
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {int} [params.offset] offset
     * @param {string} [params.event_type] The most recent type of event that happened to the order. Allowed values: NEW, TRADE, REPLACED
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coinbaseinternational#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.cloud.coinbase.com/intx/reference/getmultiportfoliofills
     * @param {string} symbol unified market symbol of the trades
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] the maximum number of trade structures to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coinbaseinternational#withdraw
     * @description make a withdrawal
     * @see https://docs.cloud.coinbase.com/intx/reference/withdraw
     * @see https://docs.cloud.coinbase.com/intx/reference/counterpartywithdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag] an optional tag for the withdrawal
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.add_network_fee_to_total] if true, deducts network fee from the portfolio, otherwise deduct fee from the withdrawal
     * @param {string} [params.network_arn_id] Identifies the blockchain network (e.g., networks/ethereum-mainnet/assets/313ef8a9-ae5a-5f2f-8a56-572c0e2a4d5a)
     * @param {string} [params.nonce] a unique integer representing the withdrawal request
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    safeNetwork(network: any): {
        info: any;
        id: string;
        name: string;
        network: string;
        active: boolean;
        deposit: boolean;
        withdraw: boolean;
        fee: number;
        precision: number;
        limits: {
            withdraw: {
                min: number;
                max: number;
            };
            deposit: {
                min: number;
                max: number;
            };
        };
    };
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
