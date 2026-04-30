import Exchange from './abstract/grvt.js';
import type { Balances, Currencies, Currency, Dict, FundingRateHistory, FundingHistory, Int, Leverage, Leverages, MarginMode, MarginModes, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Position, Str, Strings, Ticker, Trade, Transaction, TransferEntry, int } from './base/types.js';
/**
 * @class grvt
 * @augments Exchange
 */
export default class grvt extends Exchange {
    describe(): any;
    eipDefinitions(): {
        EIP712_ORDER_TYPE: {
            Order: {
                name: string;
                type: string;
            }[];
            OrderLeg: {
                name: string;
                type: string;
            }[];
        };
        EIP712_ORDER_WITH_BUILDER_TYPE: {
            OrderWithBuilderFee: {
                name: string;
                type: string;
            }[];
            OrderLeg: {
                name: string;
                type: string;
            }[];
        };
        EIP712_TRANSFER_TYPE: {
            Transfer: {
                name: string;
                type: string;
            }[];
        };
        EIP712_WITHDRAWAL_TYPE: {
            Withdrawal: {
                name: string;
                type: string;
            }[];
        };
        EIP712_BUILDER_APPROVAL_TYPE: {
            AuthorizeBuilder: {
                name: string;
                type: string;
            }[];
        };
        EIP712_WALLETLOGIN_TYPE: {
            WalletLogin: {
                name: string;
                type: string;
            }[];
        };
    };
    usesPrivateKey(): boolean;
    /**
     * @method
     * @name grvt#signIn
     * @description sign in, must be called prior to using other authenticated methods
     * @see https://api-docs.grvt.io/#authentication
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns response from exchange
     */
    signIn(params?: {}): Promise<boolean>;
    signInWithApiKey(params?: {}): Promise<any>;
    signInWithPrivateKey(params?: {}): Promise<any>;
    initializeClient(params?: {}): Promise<boolean>;
    /**
     * @method
     * @name grvt#fetchMarkets
     * @description retrieves data on all markets
     * @see https://api-docs.grvt.io/market_data_api/#get-instrument-prod
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: any): Market;
    /**
     * @method
     * @name grvt#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://api-docs.grvt.io/market_data_api/#get-currency-response
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    parseCurrency(rawCurrency: Dict): Currency;
    /**
     * @method
     * @name grvt#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://api-docs.grvt.io/market_data_api/#ticker_1
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name grvt#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://api-docs.grvt.io/market_data_api/#orderbook-levels
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.loc] crypto location, default: us
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name grvt#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://api-docs.grvt.io/market_data_api/#trade_1
     * @param {string} symbol unified symbol of the market
     * @param {int} [since] timestamp in ms of the earliest item to fetch
     * @param {int} [limit] the maximum amount of items to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name grvt#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://api-docs.grvt.io/market_data_api/#candlestick_1
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest item to fetch
     * @param {int} [limit] the maximum amount of items to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name grvt#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://api-docs.grvt.io/market_data_api/#funding-rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    parseFundingRateHistory(rawItem: any, market?: Market): {
        info: any;
        symbol: string;
        fundingRate: number;
        timestamp: number;
        datetime: string;
    };
    getSubAccountId(params: any): any;
    /**
     * @method
     * @name grvt#fetchBalance
     * @description query for account info
     * @see https://api-docs.grvt.io/trading_api/#sub-account-summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name grvt#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://api-docs.grvt.io/trading_api/#transfer
     * @param {string} [code] unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name grvrt#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_withdrawals
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    internalFetchTransfers(req: any, currency?: any, since?: Int, limit?: Int): Promise<TransferEntry[]>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name grvt#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://api-docs.grvt.io/trading_api/#transfer-history
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve (default 10, max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] whether to paginate the results (default false)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    filterTransfersByType(transfers: any, transferType: string, onlyMainAccount?: boolean): any;
    /**
     * @method
     * @name grvt#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://api-docs.grvt.io/trading_api/#transfer_1
     * @param {string} code unified currency codeåå
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    loadAccountInfos(): Promise<void>;
    /**
     * @method
     * @name grvt#withdraw
     * @description make a withdrawal
     * @see https://api-docs.grvt.io/trading_api/#withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.network the network to withdraw on (mandatory)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name grvt#createOrder
     * @description create a trade order
     * @see https://api-docs.grvt.io/trading_api/#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] The price a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price a take profit order is triggered at
     * @param {string} [params.timeInForce] "GTC", "IOC", or "POST_ONLY"
     * @param {bool} [params.postOnly] true or false
     * @param {bool} [params.reduceOnly] Ensures that the executed order does not flip the opened position.
     * @param {string} [params.clientOrderId] a unique id for the order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    convertToBigIntCustom(x: any): number;
    eipMessageForOrder(order: any, structureType: any): {
        subAccountID: any;
        isMarket: any;
        timeInForce: number;
        postOnly: any;
        reduceOnly: any;
        legs: any[];
        nonce: any;
        expiration: any;
    };
    /**
     * @method
     * @name grvt#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://api-docs.grvt.io/trading_api/#fill-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name grvt#fetchPositions
     * @description fetch all open positions
     * @see https://api-docs.grvt.io/trading_api/#positions-request
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name grvt#fetchLeverages
     * @description fetch the set leverage for all contract markets
     * @see https://api-docs.grvt.io/trading_api/#get-all-initial-leverage
     * @param {string[]} [symbols] a list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [leverage structures]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverages(symbols?: Strings, params?: {}): Promise<Leverages>;
    /**
     * @method
     * @name grvt#setLeverage
     * @description set the level of leverage for a market
     * @see https://api-docs.grvt.io/trading_api/#set-initial-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    /**
     * @method
     * @name grvt#fetchMarginModes
     * @description fetches margin mode of the user
     * @see https://api-docs.grvt.io/trading_api/#get-all-initial-leverage
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [margin mode structures]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    fetchMarginModes(symbols?: Str[], params?: {}): Promise<MarginModes>;
    parseMarginMode(marginMode: Dict, market?: any): MarginMode;
    /**
     * @method
     * @name grvt#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://api-docs.grvt.io/trading_api/#funding-payment-history
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
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
        id: string;
        amount: number;
    };
    /**
     * @method
     * @name grvt#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://api-docs.grvt.io/trading_api/#order-history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest item
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name grvt#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://api-docs.grvt.io/trading_api/#open-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name grvt#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://api-docs.grvt.io/trading_api/#get-order
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    parseTimeInForce(type: Str): Str;
    timeInForceToInt(timeInForce: Str): Int;
    parseOrderStatus(status: Str): string;
    /**
     * @method
     * @name grvt#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://api-docs.grvt.io/trading_api/#cancel-all-orders
     * @param {string} symbol cancel alls open orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name grvt#cancelOrder
     * @description cancels an open order
     * @see https://api-docs.grvt.io/trading_api/#cancel-order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    eipDomainData(): {
        name: string;
        version: string;
        chainId: number;
    };
    feeAmountMultiplier(): number;
    createSignedRequest(request: any, structureType: string, currencyObj?: any, signerAddress?: Str): Dict;
    formatSignatureRS(value: string): string;
    defaultSignature(): {
        signer: string;
        r: string;
        s: string;
        v: number;
        expiration: string;
        nonce: number;
        chain_id: string;
    };
    handleUntilOptionString(key: string, request: any, params: any, multiplier?: number): any[];
    requestId(): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
