import Exchange from './abstract/cryptocom.js';
import type { Int, OrderSide, OrderType, Trade, OHLCV, Order, FundingRateHistory, Str, Ticker, OrderRequest, Balances, Transaction, OrderBook, Tickers, Strings, Currency, Currencies, Market, Num, Account, CancellationRequest, Dict, int, TradingFeeInterface, TradingFees, LedgerEntry, DepositAddress, Position } from './base/types.js';
/**
 * @class cryptocom
 * @augments Exchange
 */
export default class cryptocom extends Exchange {
    describe(): any;
    /**
     * @method
     * @name cryptocom#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-currency-networks
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name cryptocom#fetchMarkets
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-instruments
     * @description retrieves data on all markets for cryptocom
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name cryptocom#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-tickers
     * @see https://exchange-docs.crypto.com/derivatives/index.html#public-get-tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name cryptocom#fetchTicker
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-tickers
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name cryptocom#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-order-history
     * @param {string} symbol unified market symbol of the market the orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for, max date range is one day
     * @param {int} [limit] the maximum number of order structures to retrieve, default 100 max 100
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name cryptocom#fetchTrades
     * @description get a list of the most recent trades for a particular symbol
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch, maximum date range is one day
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name cryptocom#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-candlestick
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name cryptocom#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-book
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the number of order book entries to return, max 50
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name cryptocom#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-user-balance
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name cryptocom#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-order-detail
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name cryptocom#createOrder
     * @description create a trade order
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market', 'limit', 'stop_loss', 'stop_limit', 'take_profit', 'take_profit_limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK' or 'PO'
     * @param {string} [params.ref_price_type] 'MARK_PRICE', 'INDEX_PRICE', 'LAST_PRICE' which trigger price type to use, default is MARK_PRICE
     * @param {float} [params.triggerPrice] price to trigger a trigger order
     * @param {float} [params.stopLossPrice] price to trigger a stop-loss trigger order
     * @param {float} [params.takeProfitPrice] price to trigger a take-profit trigger order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name cryptocom#createOrders
     * @description create a list of trade orders
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order-list-list
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-order-list-oco
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createAdvancedOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name cryptocom#editOrder
     * @description edit a trade order
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-amend-order
     * @param {string} id order id
     * @param {string} symbol unified market symbol of the order to edit
     * @param {string} [type] not used by cryptocom editOrder
     * @param {string} [side] not used by cryptocom editOrder
     * @param {float} amount (mandatory) how much of the currency you want to trade in units of the base currency
     * @param {float} price (mandatory) the price for the order, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] the original client order id of the order to edit, required if id is not provided
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    editOrderRequest(id: string, symbol: string, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name cryptocom#cancelAllOrders
     * @description cancel all open orders
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-all-orders
     * @param {string} symbol unified market symbol of the orders to cancel
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} Returns exchange raw message{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name cryptocom#cancelOrder
     * @description cancels an open order
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order
     * @param {string} id the order id of the order to cancel
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name cryptocom#cancelOrders
     * @description cancel multiple orders
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order-list-list
     * @param {string[]} ids order ids
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: any, symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name cryptocom#cancelOrdersForSymbols
     * @description cancel multiple orders for multiple symbols
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-cancel-order-list-list
     * @param {CancellationRequest[]} orders each order should contain the parameters required by cancelOrder namely id and symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrdersForSymbols(orders: CancellationRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name cryptocom#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-open-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name cryptocom#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-trades
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for, maximum date range is one day
     * @param {int} [limit] the maximum number of trade structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseAddress(addressString: any): any[];
    /**
     * @method
     * @name cryptocom#withdraw
     * @description make a withdrawal
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-create-withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name cryptocom#fetchDepositAddressesByNetwork
     * @description fetch a dictionary of addresses for a currency, indexed by network
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure} indexed by the network
     */
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    /**
     * @method
     * @name cryptocom#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name cryptocom#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-deposit-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name cryptocom#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-withdrawal-history
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseTrade(trade: Dict, market?: Market): Trade;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    parseOrderStatus(status: Str): string;
    parseTimeInForce(timeInForce: Str): string;
    parseOrder(order: Dict, market?: Market): Order;
    parseDepositStatus(status: any): string;
    parseWithdrawalStatus(status: any): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    customHandleMarginModeAndParams(methodName: any, params?: {}): any[];
    parseDepositWithdrawFee(fee: any, currency?: Currency): Dict;
    /**
     * @method
     * @name cryptocom#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-currency-networks
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name cryptocom#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-transactions
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: any): string;
    /**
     * @method
     * @name cryptocom#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    parseAccount(account: any): {
        id: string;
        type: string;
        code: any;
        info: any;
    };
    /**
     * @method
     * @name cryptocom#fetchSettlementHistory
     * @description fetches historical settlement records
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-expired-settlement-price
     * @param {string} symbol unified market symbol of the settlement history
     * @param {int} [since] timestamp in ms
     * @param {int} [limit] number of records
     * @param {object} [params] exchange specific params
     * @param {int} [params.type] 'future', 'option'
     * @returns {object[]} a list of [settlement history objects]{@link https://docs.ccxt.com/#/?id=settlement-history-structure}
     */
    fetchSettlementHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any>;
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
     * @name cryptocom#fetchFundingRateHistory
     * @description fetches historical funding rates
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#public-get-valuations
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures] to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms for the ending date filter, default is the current time
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name cryptocom#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-positions
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name cryptocom#fetchPositions
     * @description fetch all open positions
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    nonce(): number;
    paramsToString(object: any, level: any): any;
    /**
     * @method
     * @name cryptocom#closePositions
     * @description closes open positions for a market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-close-position
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} [side] not used by cryptocom.closePositions
     * @param {object} [params] extra parameters specific to the okx api endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.type] LIMIT or MARKET
     * @param {number} [params.price] for limit orders only
     * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name cryptocom#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-instrument-fee-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name cryptocom#fetchTradingFees
     * @see https://exchange-docs.crypto.com/exchange/v1/rest-ws/index.html#private-get-fee-rate
     * @description fetch the trading fees for multiple markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    parseTradingFees(response: any): Dict;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
