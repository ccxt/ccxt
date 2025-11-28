import Exchange from './abstract/backpack.js';
import type { Balances, Currencies, Currency, DepositAddress, Dict, FundingRate, FundingRateHistory, int, Int, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderType, OrderSide, Position, Str, Strings, Ticker, Tickers, Trade, Transaction } from './base/types.js';
/**
 * @class backpack
 * @augments Exchange
 */
export default class backpack extends Exchange {
    describe(): any;
    /**
     * @method
     * @name backpack#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.backpack.exchange/#tag/Assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name backpack#fetchMarkets
     * @description retrieves data on all markets for bitbank
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseMarketType(type: any): string;
    /**
     * @method
     * @name backpack#fetchTickers
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_tickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name backpack#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name backpack#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_depth
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (default 100, max 200)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name backpack#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in seconds of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 100)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name backpack#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_mark_prices
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    parseFundingRate(contract: any, market?: Market): FundingRate;
    /**
     * @method
     * @name backpack#fetchOpenInterest
     * @description Retrieves the open interest of a derivative trading pair
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_open_interest
     * @param {string} symbol Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=interest-history-structure}
     */
    fetchOpenInterest(symbol: string, params?: {}): Promise<import("./base/types.js").OpenInterest>;
    parseOpenInterest(interest: any, market?: Market): import("./base/types.js").OpenInterest;
    /**
     * @method
     * @name backpack#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://docs.backpack.exchange/#tag/Markets/operation/get_funding_interval_rates
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of funding rate structures
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name backpack#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://docs.backpack.exchange/#tag/Trades/operation/get_recent_trades
     * @see https://docs.backpack.exchange/#tag/Trades/operation/get_historical_trades
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.offset] the number of trades to skip, default is 0
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name backpack#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.backpack.exchange/#tag/History/operation/get_fills
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch trades for
     * @param {string} [params.fillType] 'User' (default) 'BookLiquidation' or 'Adl' or 'Backstop' or 'Liquidation' or 'AllLiquidation' or 'CollateralConversion' or 'CollateralConversionAndSpotLiquidation'
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name backpack#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.backpack.exchange/#tag/System/operation/get_status
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
     * @name backpack#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://developer-pro.bitmart.com/en/spot/#get-system-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name backpack#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_balances
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name backpack#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_deposits
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name backpack#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_withdrawals
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name backpack#withdraw
     * @description make a withdrawal
     * @see https://docs.backpack.exchange/#tag/Capital/operation/request_withdrawal
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.network the network to withdraw on (mandatory)
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    parseTransactionStatus(status: Str): string;
    /**
     * @method
     * @name backpack#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.backpack.exchange/#tag/Capital/operation/get_deposit_address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.networkCode] the network to fetch the deposit address (mandatory)
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name backpack#createOrder
     * @description create a trade order
     * @see https://docs.backpack.exchange/#tag/Order/operation/execute_order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fullfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *market orders only* the cost of the order in units of the quote currency (could be used instead of amount)
     * @param {int} [params.clientOrderId] a unique id for the order
     * @param {boolean} [params.postOnly] true to place a post only order
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK' or 'PO'
     * @param {bool} [params.reduceOnly] *contract only* Indicates if this order is to reduce the size of a position
     * @param {string} [params.selfTradePrevention] one of EXPIRE_MAKER, EXPIRE_TAKER or EXPIRE_BOTH
     * @param {bool} [params.autoLend] *spot margin only* if true then the order can lend
     * @param {bool} [params.autoLendRedeem] *spot margin only* if true then the order can redeem a lend if required
     * @param {bool} [params.autoBorrow] *spot margin only* if true then the order can borrow
     * @param {bool} [params.autoBorrowRepay] *spot margin only* if true then the order can repay a borrow
     * @param {float} [params.triggerPrice] the price that a trigger order is triggered at
     * @param {object} [params.takeProfit] *swap markets only - takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {float} [params.takeProfit.price] take profit order price (if not provided the order will be a market order)
     * @param {object} [params.stopLoss] *swap markets only - stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @param {float} [params.stopLoss.price] stop loss order price (if not provided the order will be a market order)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name backpack#createOrders
     * @description create a list of trade orders
     * @see https://docs.backpack.exchange/#tag/Order/operation/execute_order_batch
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    encodeOrderSide(side: any): string;
    /**
     * @method
     * @name backpack#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.backpack.exchange/#tag/Order/operation/get_open_orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name backpack#fetchOpenOrder
     * @description fetch an open order by it's id
     * @see https://docs.backpack.exchange/#tag/Order/operation/get_order
     * @param {string} id order id
     * @param {string} symbol not used by hollaex fetchOpenOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name backpack#cancelOrder
     * @description cancels an open order
     * @see https://docs.backpack.exchange/#tag/Order/operation/cancel_order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name backpack#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.backpack.exchange/#tag/Order/operation/cancel_open_orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name backpack#fetchOrders
     * @description fetches information on multiple orders made by the user
     * @see https://docs.backpack.exchange/#tag/History/operation/get_order_history
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of  orde structures to retrieve (default 100, max 1000)
     * @param {object} [params] extra parameters specific to the bitteam api endpoint
     * @returns {Order[]} a list of [order structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): string;
    parseOrderSide(side: Str): string;
    /**
     * @method
     * @name backpack#fetchPositions
     * @description fetch all open positions
     * @see https://docs.backpack.exchange/#tag/Futures/operation/get_positions
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name backpack#fetchFundingHistory
     * @description fetches the history of funding payments
     * @see https://docs.backpack.exchange/#tag/History/operation/get_funding_payments
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
        code: any;
        timestamp: number;
        datetime: string;
        id: string;
        amount: number;
        rate: number;
    };
    nonce(): number;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    generateBatchPayload(params: any, ts: any, recvWindow: any, instruction: any): string;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
