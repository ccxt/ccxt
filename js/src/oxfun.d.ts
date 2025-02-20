import Exchange from './abstract/oxfun.js';
import type { Account, Balances, Currencies, Currency, Int, Market, Num, OHLCV, Order, OrderBook, OrderType, OrderSide, OrderRequest, Str, Strings, Ticker, Tickers, Trade, Transaction, TransferEntry, FundingRate, FundingRates, DepositAddress, LeverageTier, LeverageTiers } from './base/types.js';
/**
 * @class oxfun
 * @augments Exchange
 */
export default class oxfun extends Exchange {
    describe(): any;
    /**
     * @method
     * @name oxfun#fetchMarkets
     * @description retrieves data on all markets for bitmex
     * @see https://docs.ox.fun/?json#get-v3-markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarkets(markets: any): Market[];
    parseMarket(market: any): Market;
    /**
     * @method
     * @name oxfun#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.ox.fun/?json#get-v3-assets
     * @param {dict} [params] extra parameters specific to the exchange API endpoint
     * @returns {dict} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name oxfun#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.ox.fun/?json#get-v3-tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name oxfun#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.ox.fun/?json#get-v3-tickers
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: any, market?: Market): Ticker;
    /**
     * @method
     * @name oxfun#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.ox.fun/?json#get-v3-candles
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch (default 24 hours ago)
     * @param {int} [limit] the maximum amount of candles to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch (default now)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name oxfun#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.ox.fun/?json#get-v3-depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 5, max 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name oxfun#fetchFundingRates
     * @description fetch the current funding rates for multiple markets
     * @see https://docs.ox.fun/?json#get-v3-funding-estimates
     * @param {string[]} symbols unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} an array of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRates(symbols?: Strings, params?: {}): Promise<FundingRates>;
    parseFundingRate(fundingRate: any, market?: Market): FundingRate;
    /**
     * @method
     * @name oxfun#fetchFundingRateHistory
     * @description Fetches the history of funding rates
     * @see https://docs.ox.fun/?json#get-v3-funding-rates
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch (default 24 hours ago)
     * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").FundingRateHistory[]>;
    parseFundingRateHistory(info: any, market?: Market): {
        info: any;
        symbol: string;
        fundingRate: number;
        timestamp: number;
        datetime: string;
    };
    /**
     * @method
     * @name oxfun#fetchFundingHistory
     * @description fetches the history of funding payments
     * @see https://docs.ox.fun/?json#get-v3-funding
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch (default 24 hours ago)
     * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
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
        rate: number;
    };
    /**
     * @method
     * @name oxfun#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes, if a market has a leverage tier of 0, then the leverage tiers cannot be obtained for this market
     * @see https://docs.ox.fun/?json#get-v3-leverage-tiers
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    /**
     * @method
     * @name oxfun#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.ox.fun/?json#get-v3-exchange-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch (default 24 hours ago)
     * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name oxfun#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.ox.fun/?json#get-v3-trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum amount of trades to fetch (default 200, max 500)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade to fetch (default now)
     * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: any, market?: Market): Trade;
    /**
     * @method
     * @name oxfun#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.ox.fun/?json#get-v3-balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.asset] currency id, if empty the exchange returns info about all currencies
     * @param {string} [params.subAcc] Name of sub account. If no subAcc is given, then the response contains only the account linked to the API-Key.
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(balance: any): Balances;
    /**
     * @method
     * @name oxfun#fetchAccounts
     * @description fetch subaccounts associated with a profile
     * @see https://docs.ox.fun/?json#get-v3-account-names
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: any): {
        id: string;
        type: any;
        code: any;
        info: any;
    };
    /**
     * @method
     * @name oxfun#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://docs.ox.fun/?json#post-v3-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account id to transfer from
     * @param {string} toAccount account id to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    /**
     * @method
     * @name oxfun#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://docs.ox.fun/?json#get-v3-transfer
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    parseTransfer(transfer: any, currency?: Currency): {
        id: string;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: number;
        fromAccount: string;
        toAccount: string;
        status: string;
        info: any;
    };
    parseTransferStatus(status: any): string;
    /**
     * @method
     * @name oxfun#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.ox.fun/?json#get-v3-deposit-addresses
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] network for fetch deposit address
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name oxfun#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.ox.fun/?json#get-v3-deposit
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name oxfun#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.ox.fun/?json#get-v3-withdrawal
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactions(transactions: any, currency?: Currency, since?: Int, limit?: Int, params?: {}): Transaction[];
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseDepositStatus(status: any): string;
    parseWithdrawalStatus(status: any): string;
    /**
     * @method
     * @name oxfun#withdraw
     * @description make a withdrawal
     * @see https://docs.ox.fun/?json#post-v3-withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] network for withdraw
     * @param {bool} [params.externalFee] if false, then the fee is taken from the quantity, also with the burn fee for asset SOLO
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.tfaType] GOOGLE, or AUTHY_SECRET, or YUBIKEY, for 2FA
     * @param {string} [params.code] 2FA code
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name oxfun#fetchPositions
     * @description fetch all open positions
     * @see https://docs.ox.fun/?json#get-v3-positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.subAcc]
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<import("./base/types.js").Position[]>;
    parsePosition(position: any, market?: Market): import("./base/types.js").Position;
    /**
     * @method
     * @name oxfun#createOrder
     * @description create a trade order
     * @see https://docs.ox.fun/?json#post-v3-orders-place
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'STOP_LIMIT' or 'STOP_MARKET'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.clientOrderId] a unique id for the order
     * @param {int} [params.timestamp] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected.
     * @param {int} [params.recvWindow] in milliseconds. If an order reaches the matching engine and the current timestamp exceeds timestamp + recvWindow, then the order will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used.
     * @param {string} [params.responseType] FULL or ACK
     * @param {float} [params.cost] the quote quantity that can be used as an alternative for the amount for market buy orders
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {float} [params.limitPrice] Limit price for the STOP_LIMIT order
     * @param {bool} [params.postOnly] if true, the order will only be posted if it will be a maker order
     * @param {string} [params.timeInForce] GTC (default), IOC, FOK, PO, MAKER_ONLY or MAKER_ONLY_REPRICE (reprices order to the best maker only price if the specified price were to lead to a taker trade)
     * @param {string} [params.selfTradePreventionMode] NONE, EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH for more info check here {@link https://docs.ox.fun/?json#self-trade-prevention-modes}
     * @param {string} [params.displayQuantity] for an iceberg order, pass both quantity and displayQuantity fields in the order request
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name oxfun#createOrders
     * @description create a list of trade orders
     * @see https://docs.ox.fun/?json#post-v3-orders-place
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.timestamp] *for all orders* in milliseconds. If orders reach the matching engine and the current timestamp exceeds timestamp + recvWindow, then all orders will be rejected.
     * @param {int} [params.recvWindow] *for all orders* in milliseconds. If orders reach the matching engine and the current timestamp exceeds timestamp + recvWindow, then all orders will be rejected. If timestamp is provided without recvWindow, then a default recvWindow of 1000ms is used.
     * @param {string} [params.responseType] *for all orders* FULL or ACK
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createOrderRequest(symbol: string, type: string, side: string, amount: any, price?: any, params?: {}): any;
    /**
     * @method
     * @name oxfun#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://open.big.one/docs/spot_orders.html#create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name oxfun#fetchOrder
     * @see https://docs.ox.fun/?json#get-v3-orders-status
     * @description fetches information on an order made by the user
     * @param {string} id a unique id for the order
     * @param {string} [symbol] not used by oxfun fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.clientOrderId] the client order id of the order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name oxfun#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.ox.fun/?json#get-v3-orders-working
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.orderId] a unique id for the order
     * @param {int} [params.clientOrderId] the client order id of the order
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name oxfun#cancelOrder
     * @description cancels an open order
     * @see https://docs.ox.fun/?json#delete-v3-orders-cancel
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.clientOrderId] a unique id for the order
     * @param {int} [params.timestamp] in milliseconds
     * @param {int} [params.recvWindow] in milliseconds
     * @param {string} [params.responseType] 'FULL' or 'ACK'
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name oxfun#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.ox.fun/?json#delete-v3-orders-cancel-all
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from exchange
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name oxfun#cancelOrders
     * @description cancel multiple orders
     * @see https://docs.ox.fun/?json#delete-v3-orders-cancel
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.timestamp] in milliseconds
     * @param {int} [params.recvWindow] in milliseconds
     * @param {string} [params.responseType] 'FULL' or 'ACK'
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    parseOrder(order: any, market?: Market): Order;
    parseOrderStatus(status: any): string;
    parseOrderType(type: any): string;
    parseOrderTimeInForce(type: any): string;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: any, reason: any, url: any, method: any, headers: any, body: any, response: any, requestHeaders: any, requestBody: any): any;
}
