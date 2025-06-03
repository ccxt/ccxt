import Exchange from './abstract/bitrue.js';
import type { Balances, Currencies, Currency, Dict, Int, MarginModification, Market, Num, OHLCV, Order, OrderBook, OrderSide, OrderType, Str, Strings, Ticker, Tickers, Trade, Transaction, TransferEntry, int } from './base/types.js';
/**
 * @class bitrue
 * @augments Exchange
 */
export default class bitrue extends Exchange {
    describe(): any;
    nonce(): number;
    /**
     * @method
     * @name bitrue#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#test-connectivity
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/#/?id=exchange-status-structure}
     */
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    /**
     * @method
     * @name bitrue#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#check-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name bitrue#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name bitrue#fetchMarkets
     * @description retrieves data on all markets for bitrue
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#exchangeInfo_endpoint
     * @see https://www.bitrue.com/api-docs#current-open-contract
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#current-open-contract
     * @param {object} [params] extra parameters specific to the exchange api endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name bitrue#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#account-information-user_data
     * @see https://www.bitrue.com/api-docs#account-information-v2-user_data-hmac-sha256
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#account-information-v2-user_data-hmac-sha256
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'future', 'delivery', 'spot', 'swap'
     * @param {string} [params.subType] 'linear', 'inverse'
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name bitrue#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#order-book
     * @see https://www.bitrue.com/api-docs#order-book
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#order-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name bitrue#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#24hr-ticker-price-change-statistics
     * @see https://www.bitrue.com/api-docs#ticker
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name bitrue#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.bitrue.com/api_docs_includes_file/spot/index.html#kline-data
     * @see https://www.bitrue.com/api_docs_includes_file/futures/index.html#kline-candlestick-data
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name bitrue#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#symbol-order-book-ticker
     * @see https://www.bitrue.com/api-docs#ticker
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the bids and asks for, all markets are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchBidsAsks(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name bitrue#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#24hr-ticker-price-change-statistics
     * @see https://www.bitrue.com/api-docs#ticker
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#ticker
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name bitrue#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#recent-trades-list
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
     * @name bitrue#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.bitrue.com/api-docs#new-order-trade-hmac-sha256
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#new-order-trade-hmac-sha256
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitrue#createOrder
     * @description create a trade order
     * @see https://www.bitrue.com/api_docs_includes_file/spot/index.html#new-order-trade
     * @see https://www.bitrue.com/api_docs_includes_file/futures/index.html#new-order-trade-hmac-sha256
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] *spot only* the price at which a trigger order is triggered at
     * @param {string} [params.clientOrderId] a unique id for the order, automatically generated if not sent
     * @param {decimal} [params.leverage] in future order, the leverage value of the order should consistent with the user contract configuration, default is 1
     * @param {string} [params.timeInForce] 'fok', 'ioc' or 'po'
     * @param {bool} [params.postOnly] default false
     * @param {bool} [params.reduceOnly] default false
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {decimal} [params.icebergQty]
     * @param {long} [params.recvWindow]
     * @param {float} [params.cost] *swap market buy only* the quote quantity that can be used as an alternative for the amount
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitrue#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.bitrue.com/api_docs_includes_file/spot/index.html#query-order-user_data
     * @see https://www.bitrue.com/api_docs_includes_file/futures/index.html#query-order-user_data-hmac-sha256
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitrue#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.bitrue.com/api_docs_includes_file/spot/index.html#all-orders-user_data
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitrue#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.bitrue.com/api_docs_includes_file/spot/index.html#current-open-orders-user_data
     * @see https://www.bitrue.com/api_docs_includes_file/futures/index.html#cancel-all-open-orders-trade-hmac-sha256
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitrue#cancelOrder
     * @description cancels an open order
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#cancel-order-trade
     * @see https://www.bitrue.com/api-docs#cancel-order-trade-hmac-sha256
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#cancel-order-trade-hmac-sha256
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name bitrue#cancelAllOrders
     * @description cancel all open orders in a market
     * @see https://www.bitrue.com/api-docs#cancel-all-open-orders-trade-hmac-sha256
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#cancel-all-open-orders-trade-hmac-sha256
     * @param {string} symbol unified market symbol of the market to cancel orders in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated', for spot margin trading
     * @returns {object[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name bitrue#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://www.bitrue.com/api_docs_includes_file/spot/index.html#account-trade-list-user_data
     * @see https://www.bitrue.com/api_docs_includes_file/futures/index.html#account-trade-list-user_data-hmac-sha256
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name bitrue#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#deposit-history--withdraw_data
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name bitrue#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#withdraw-history--withdraw_data
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTransactionStatusByType(status: any, type?: any): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name bitrue#withdraw
     * @description make a withdrawal
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#withdraw-commit--withdraw_data
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): Dict;
    /**
     * @method
     * @name bitrue#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://github.com/Bitrue-exchange/Spot-official-api-docs#exchangeInfo_endpoint
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseTransfer(transfer: any, currency?: any): {
        info: any;
        id: any;
        timestamp: number;
        datetime: string;
        currency: string;
        amount: number;
        fromAccount: any;
        toAccount: any;
        status: string;
    };
    /**
     * @method
     * @name bitrue#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://www.bitrue.com/api-docs#get-future-account-transfer-history-list-user_data-hmac-sha256
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#get-future-account-transfer-history-list-user_data-hmac-sha256
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfers structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @param {string} [params.type] transfer type wallet_to_contract or contract_to_wallet
     * @returns {object[]} a list of [transfer structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name bitrue#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://www.bitrue.com/api-docs#new-future-account-transfer-user_data-hmac-sha256
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#user-commission-rate-user_data-hmac-sha256
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
     * @name bitrue#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.bitrue.com/api-docs#change-initial-leverage-trade-hmac-sha256
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#change-initial-leverage-trade-hmac-sha256
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    parseMarginModification(data: any, market?: any): MarginModification;
    /**
     * @method
     * @name bitrue#setMargin
     * @description Either adds or reduces margin in an isolated position in order to set the margin to a specific value
     * @see https://www.bitrue.com/api-docs#modify-isolated-position-margin-trade-hmac-sha256
     * @see https://www.bitrue.com/api_docs_includes_file/delivery.html#modify-isolated-position-margin-trade-hmac-sha256
     * @param {string} symbol unified market symbol of the market to set margin in
     * @param {float} amount the amount to set the margin to
     * @param {object} [params] parameters specific to the exchange API endpoint
     * @returns {object} A [margin structure]{@link https://github.com/ccxt/ccxt/wiki/Manual#add-margin-structure}
     */
    setMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
}
