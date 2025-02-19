import Exchange from './abstract/coincatch.js';
import type { Balances, Bool, Currency, Currencies, DepositAddress, Dict, FundingRate, FundingRateHistory, int, Int, LedgerEntry, Leverage, MarginMode, MarginModification, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, Transaction, TransferEntry } from './base/types.js';
/**
 * @class coincatch
 * @augments Exchange
 */
export default class coincatch extends Exchange {
    describe(): any;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): number;
    /**
     * @method
     * @name coincatch#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://coincatch.github.io/github.io/en/spot/#get-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name coincatch#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://coincatch.github.io/github.io/en/spot/#get-coin-list
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name coincatch#fetchMarkets
     * @description retrieves data on all markets for the exchange
     * @see https://coincatch.github.io/github.io/en/spot/#get-all-tickers
     * @see https://coincatch.github.io/github.io/en/mix/#get-all-symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    parseSpotMarketId(marketId: any): Dict;
    /**
     * @method
     * @name coincatch#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://coincatch.github.io/github.io/en/spot/#get-single-ticker
     * @see https://coincatch.github.io/github.io/en/mix/#get-single-symbol-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name coincatch#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://coincatch.github.io/github.io/en/spot/#get-all-tickers
     * @see https://coincatch.github.io/github.io/en/mix/#get-all-symbol-ticker
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' (default 'spot')
     * @param {string} [params.productType] 'umcbl' or 'dmcbl' (default 'umcbl') - USDT perpetual contract or Universal margin perpetual contract
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    parseTicker(ticker: any, market?: Market): Ticker;
    /**
     * @method
     * @name coincatch#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://coincatch.github.io/github.io/en/spot/#get-merged-depth-data
     * @see https://coincatch.github.io/github.io/en/mix/#get-merged-depth-data
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return (maximum and default value is 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.precision] 'scale0' (default), 'scale1', 'scale2' or 'scale3' - price accuracy, according to the selected accuracy as the step size to return the cumulative depth
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name coincatch#fetchOHLCV
     * @see https://coincatch.github.io/github.io/en/spot/#get-candle-data
     * @see https://coincatch.github.io/github.io/en/mix/#get-candle-data
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch (default 100)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @param {string} [params.price] "mark" for mark price candles
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name coincatch#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://coincatch.github.io/github.io/en/spot/#get-recent-trades
     * @see https://coincatch.github.io/github.io/en/mix/#get-fills
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest entry to fetch
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name coincatch#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://coincatch.github.io/github.io/en/mix/#get-current-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    parseFundingRate(contract: any, market?: Market): {
        info: any;
        symbol: string;
        markPrice: any;
        indexPrice: any;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: any;
        datetime: any;
        fundingRate: number;
        fundingTimestamp: any;
        fundingDatetime: any;
        nextFundingRate: any;
        nextFundingTimestamp: any;
        nextFundingDatetime: any;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    handleOptionParamsAndRequest(params: object, methodName: string, optionName: string, request: object, requestProperty: string, defaultValue?: any): any[];
    /**
     * @method
     * @name coincatch#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://coincatch.github.io/github.io/en/mix/#get-history-funding-rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of entries to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.pageNo] the page number to fetch
     * @param {bool} [params.nextPage] whether to query the next page (default false)
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingRateHistory[]>;
    /**
     * @method
     * @name coincatch#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://coincatch.github.io/github.io/en/spot/#get-account-assets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch balance for (default 'spot')
     * @param {string} [params.productType] *swap only* 'umcbl' or 'dmcbl' (default 'umcbl')
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    parseBalance(balances: any): Balances;
    /**
     * @method
     * @name coincatch#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://coincatch.github.io/github.io/en/spot/#transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount 'spot' or 'swap' or 'mix_usdt' or 'mix_usd' - account to transfer from
     * @param {string} toAccount 'spot' or 'swap' or 'mix_usdt' or 'mix_usd' - account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the transfer
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: any, currency?: Currency): {
        id: string;
        timestamp: any;
        datetime: any;
        currency: string;
        amount: any;
        fromAccount: any;
        toAccount: any;
        status: string;
        info: any;
    };
    /**
     * @method
     * @name coincatch#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://coincatch.github.io/github.io/en/spot/#get-coin-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] network for fetch deposit address
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name coincatch#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://coincatch.github.io/github.io/en/spot/#get-deposit-list
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (not used by exchange)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
     * @param {int} [params.pageNo] pageNo default 1
     * @param {int} [params.pageSize] pageSize (default 20, max 100)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name coincatch#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://coincatch.github.io/github.io/en/spot/#get-withdraw-list-v2
     * @param {string} code unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for (default 24 hours ago)
     * @param {int} [limit] the maximum number of transfer structures to retrieve (default 50, max 200)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for (default time now)
     * @param {string} [params.clientOid] clientOid
     * @param {string} [params.orderId] The response orderId
     * @param {string} [params.idLessThan] Requests the content on the page before this ID (older data), the value input should be the orderId of the corresponding interface.
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name coincatch#withdraw
     * @description make a withdrawal
     * @see https://coincatch.github.io/github.io/en/spot/#withdraw
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} [tag]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} params.network network for withdraw (mandatory)
     * @param {string} [params.remark] remark
     * @param {string} [params.clientOid] custom id
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransaction(transaction: any, currency?: Currency): Transaction;
    /**
     * @method
     * @name coincatch#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://coincatch.github.io/github.io/en/spot/#place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coincatch#createOrder
     * @description create a trade order
     * @see https://coincatch.github.io/github.io/en/spot/#place-order
     * @see https://coincatch.github.io/github.io/en/spot/#place-plan-order
     * @see https://coincatch.github.io/github.io/en/mix/#place-order
     * @see https://coincatch.github.io/github.io/en/mix/#place-plan-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit' or 'LIMIT_MAKER' for spot, 'market' or 'limit' or 'STOP' for swap
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *spot market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {float} [params.triggerPrice] the price that the order is to be triggered
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK' or 'PO'
     * @param {string} [params.clientOrderId] a unique id for the order - is mandatory for swap
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coincatch#createSpotOrder
     * @description create a trade order on spot market
     * @see https://coincatch.github.io/github.io/en/spot/#place-order
     * @see https://coincatch.github.io/github.io/en/spot/#place-plan-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.cost] *market buy only* the quote quantity that can be used as an alternative for the amount
     * @param {float} [params.triggerPrice] the price that the order is to be triggered at
     * @param {bool} [params.postOnly] if true, the order will only be posted to the order book and not executed immediately
     * @param {string} [params.timeInForce] 'GTC', 'IOC', 'FOK' or 'PO'
     * @param {string} [params.clientOrderId] a unique id for the order (max length 40)
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createSpotOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createSpotOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Dict;
    handleRequiresPriceAndCost(methodName: string, params?: Dict, price?: Num, amount?: Num, cost?: Str, side?: string): Dict;
    handleTimeInForceAndPostOnly(methodName: string, params?: Dict, isMarketOrder?: Bool): Dict;
    /**
     * @method
     * @name coincatch#createSwapOrder
     * @description create a trade order on swap market
     * @see https://coincatch.github.io/github.io/en/mix/#place-order
     * @see https://coincatch.github.io/github.io/en/mix/#place-plan-order
     * @see https://coincatch.github.io/github.io/en/mix/#place-stop-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of you want to trade in units of the base currency
     * @param {float} [price] the price that the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.postOnly] *non-trigger orders only* if true, the order will only be posted to the order book and not executed immediately
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce only
     * @param {string} [params.timeInForce] *non-trigger orders only* 'GTC', 'FOK', 'IOC' or 'PO'
     * @param {string} [params.clientOrderId] a unique id for the order
     * @param {float} [params.triggerPrice] the price that the order is to be triggered at
     * @param {float} [params.stopLossPrice] The price at which a stop loss order is triggered at
     * @param {float} [params.takeProfitPrice] The price at which a take profit order is triggered at
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered (perpetual swap markets only)
     * @param {float} [params.takeProfit.triggerPrice] take profit trigger price
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered (perpetual swap markets only)
     * @param {float} [params.stopLoss.triggerPrice] stop loss trigger price
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createSwapOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createSwapOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Dict;
    handleTriggerStopLossAndTakeProfit(symbol: any, side: any, type: any, price: any, methodName?: string, params?: {}): any;
    /**
     * @method
     * @name coincatch#createOrderWithTakeProfitAndStopLoss
     * @description *swap markets only* create an order with a stop loss or take profit attached (type 3)
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much you want to trade in units of the base currency or the number of contracts
     * @param {float} [price] the price to fulfill the order, in units of the quote currency, ignored in market orders
     * @param {float} [takeProfit] the take profit price, in units of the quote currency
     * @param {float} [stopLoss] the stop loss price, in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrderWithTakeProfitAndStopLoss(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, takeProfit?: Num, stopLoss?: Num, params?: {}): Promise<Order>;
    encodeTimeInForce(timeInForce: Str): Str;
    /**
     * @method
     * @name coincatch#createOrders
     * @description create a list of trade orders (all orders should be of the same symbol)
     * @see https://coincatch.github.io/github.io/en/spot/#batch-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params (max 50 entries)
     * @param {object} [params] extra parameters specific to the api endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Dict;
    /**
     * @method
     * @name coincatch#editOrder
     * @description edit a trade trigger, stop-looss or take-profit order
     * @see https://coincatch.github.io/github.io/en/spot/#modify-plan-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coincatch#editSpotOrder
     * @ignore
     * @description edit a trade order
     * @see https://coincatch.github.io/github.io/en/spot/#modify-plan-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order that can be used as an alternative for the id
     * @param {string} params.triggerPrice *mandatory* the price that the order is to be triggered at
     * @param {float} [params.cost] *market buy only* the quote quantity that can be used as an alternative for the amount
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editSpotOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coincatch#fetchOrder
     * @description fetches information on an order made by the user (non-trigger orders only)
     * @see https://coincatch.github.io/github.io/en/spot/#get-order-details
     * @see https://coincatch.github.io/github.io/en/mix/#get-order-details
     * @param {string} id the order id
     * @param {string} symbol unified symbol of the market the order was made in (is mandatory for swap)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entry for (default 'spot')
     * @param {string} [params.clientOrderId] a unique id for the order that can be used as an alternative for the id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coincatch#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://coincatch.github.io/github.io/en/spot/#get-order-list
     * @see https://coincatch.github.io/github.io/en/spot/#get-current-plan-orders
     * @see https://coincatch.github.io/github.io/en/mix/#get-open-order
     * @see https://coincatch.github.io/github.io/en/mix/#get-all-open-order
     * @see https://coincatch.github.io/github.io/en/mix/#get-plan-order-tpsl-list
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if fetching trigger orders (default false)
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot')
     * @param {string} [params.productType] *swap only* 'umcbl' or 'dmcbl' - the product type of the market to fetch entries for (default 'umcbl')
     * @param {string} [params.marginCoin] *swap only* the margin coin of the market to fetch entries for
     * @param {string} [params.isPlan] *swap trigger only* 'plan' or 'profit_loss' ('plan' (default) for trigger (plan) orders, 'profit_loss' for stop-loss and take-profit orders)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @ignore
     * @name coincatch#fetchOpenSpotOrders
     * @description fetch all unfilled currently open orders for spot markets
     * @see https://coincatch.github.io/github.io/en/spot/#get-order-list
     * @see https://coincatch.github.io/github.io/en/spot/#get-current-plan-orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if fetching trigger orders (default false)
     * @param {string} [params.lastEndId] *for trigger orders only* the last order id to fetch entries after
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenSpotOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @ignore
     * @name coincatch#fetchOpenSwapOrders
     * @description fetch all unfilled currently open orders for swap markets
     * @see https://coincatch.github.io/github.io/en/mix/#get-open-order
     * @see https://coincatch.github.io/github.io/en/mix/#get-all-open-order
     * @see https://coincatch.github.io/github.io/en/mix/#get-plan-order-tpsl-list
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true if fetching trigger orders (default false)
     * @param {string} [params.isPlan] 'plan' or 'profit_loss' ('plan' (default) for trigger (plan) orders, 'profit_loss' for stop-loss and take-profit orders)
     * @param {string} [params.productType] 'umcbl' or 'dmcbl' - the product type of the market to fetch entries for (default 'umcbl')
     * @param {string} [params.marginCoin] the margin coin of the market to fetch entries for
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenSwapOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coincatch#fetchCanceledAndClosedOrders
     * @description fetches information on multiple canceled and closed orders made by the user
     * @see https://coincatch.github.io/github.io/en/spot/#get-order-list
     * @see https://coincatch.github.io/github.io/en/spot/#get-history-plan-orders
     * @see https://coincatch.github.io/github.io/en/mix/#get-history-orders
     * @see https://coincatch.github.io/github.io/en/mix/#get-producttype-history-orders
     * @see https://coincatch.github.io/github.io/en/mix/#get-history-plan-orders-tpsl
     * @param {string} symbol *is mandatory* unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.trigger] true if fetching trigger orders (default false)
     * @param {string} [params.isPlan] *swap only* 'plan' or 'profit_loss' ('plan' (default) for trigger (plan) orders, 'profit_loss' for stop-loss and take-profit orders)
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to fetch entries for (default 'spot')
     * @param {string} [params.productType] *swap only* 'umcbl' or 'dmcbl' - the product type of the market to fetch entries for (default 'umcbl')
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @ignore
     * @name coincatch#fetchCanceledAndClosedSpotOrders
     * @description fetches information on multiple canceled and closed orders made by the user on spot markets
     * @see https://coincatch.github.io/github.io/en/spot/#get-order-history
     * @see https://coincatch.github.io/github.io/en/spot/#get-history-plan-orders
     * @param {string} symbol *is mandatory* unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] *for trigger orders only* the latest time in ms to fetch orders for
     * @param {boolean} [params.trigger] true if fetching trigger orders (default false)
     * @param {string} [params.lastEndId] *for trigger orders only* the last order id to fetch entries after
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledAndClosedSpotOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @ignore
     * @name coincatch#fetchCanceledAndClosedSwapOrders
     * @description fetches information on multiple canceled and closed orders made by the user on swap markets
     * @see https://coincatch.github.io/github.io/en/mix/#get-history-orders
     * @see https://coincatch.github.io/github.io/en/mix/#get-producttype-history-orders
     * @see https://coincatch.github.io/github.io/en/mix/#get-history-plan-orders-tpsl
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch orders for
     * @param {boolean} [params.trigger] true if fetching trigger orders (default false)
     * @param {string} [params.isPlan] *swap only* 'plan' or 'profit_loss' ('plan' (default) for trigger (plan) orders, 'profit_loss' for stop-loss and take-profit orders)
     * @param {string} [params.productType] *swap only* 'umcbl' or 'dmcbl' - the product type of the market to fetch entries for (default 'umcbl')
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledAndClosedSwapOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coincatch#cancelOrder
     * @description cancels an open order
     * @see https://coincatch.github.io/github.io/en/spot/#cancel-order-v2
     * @see https://coincatch.github.io/github.io/en/spot/#cancel-plan-order
     * @see https://coincatch.github.io/github.io/en/mix/#cancel-order
     * @see https://coincatch.github.io/github.io/en/mix/#cancel-plan-order-tpsl
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] a unique id for the order that can be used as an alternative for the id
     * @param {bool} [params.trigger] true for canceling a trigger order (default false)
     * @param {bool} [params.stop] *swap only* an alternative for trigger param
     * @param {string} [params.planType] *swap trigger only* the type of the plan order to cancel: 'profit_plan' - profit order, 'loss_plan' - loss order, 'normal_plan' - plan order, 'pos_profit' - position profit, 'pos_loss' - position loss, 'moving_plan' - Trailing TP/SL, 'track_plan' - Trailing Stop
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name coincatch#cancelAllOrders
     * @description cancels all open orders
     * @see https://coincatch.github.io/github.io/en/spot/#cancel-all-orders
     * @see https://coincatch.github.io/github.io/en/spot/#batch-cancel-plan-orders
     * @see https://coincatch.github.io/github.io/en/mix/#batch-cancel-order
     * @see https://coincatch.github.io/github.io/en/mix/#cancel-order-by-symbol
     * @see https://coincatch.github.io/github.io/en/mix/#cancel-plan-order-tpsl-by-symbol
     * @see https://coincatch.github.io/github.io/en/mix/#cancel-all-trigger-order-tpsl
     * @param {string} [symbol] unified symbol of the market the orders were made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap' - the type of the market to cancel orders for (default 'spot')
     * @param {bool} [params.trigger] true for canceling a trigger orders (default false)
     * @param {string} [params.productType] *swap only (if symbol is not provided* 'umcbl' or 'dmcbl' - the product type of the market to cancel orders for (default 'umcbl')
     * @param {string} [params.marginCoin] *mandatory for swap non-trigger dmcb (if symbol is not provided)* the margin coin of the market to cancel orders for
     * @param {string} [params.planType] *swap trigger only* the type of the plan order to cancel: 'profit_plan' - profit order, 'loss_plan' - loss order, 'normal_plan' - plan order, 'pos_profit' - position profit, 'pos_loss' - position loss, 'moving_plan' - Trailing TP/SL, 'track_plan' - Trailing Stop
     * @returns {object} response from the exchange
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name coincatch#cancelOrders
     * @description cancel multiple non-trigger orders
     * @see https://coincatch.github.io/github.io/en/spot/#cancel-order-in-batch-v2-single-instruments
     * @param {string[]} ids order ids
     * @param {string} symbol *is mandatory* unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    getResultFromBatchCancelingSwapOrders(response: any): any[];
    parseOrder(order: any, market?: any): Order;
    parseOrderStatus(status: Str): Str;
    parseOrderSide(side: Str): Str;
    parseOrderTimeInForce(timeInForce: Str): Str;
    parseFeeDetailString(feeDetailString: Str): any[];
    /**
     * @method
     * @name coincatch#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://coincatch.github.io/github.io/en/spot/#get-transaction-details
     * @see https://coincatch.github.io/github.io/en/mix/#get-order-fill-detail
     * @see https://coincatch.github.io/github.io/en/mix/#get-producttype-order-fill-detail
     * @param {string} symbol *is mandatory* unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] *swap markets only* the latest time in ms to fetch trades for, only supports the last 30 days timeframe
     * @param {string} [params.lastEndId] *swap markets only* query the data after this tradeId
     * @returns {Trade[]} a list of [trade structures]{@link https://github.com/ccxt/ccxt/wiki/Manual#trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name coincatch#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://coincatch.github.io/github.io/en/spot/#get-transaction-details
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
     * @name coincatch#fetchMarginMode
     * @description fetches the margin mode of the trading pair
     * @see https://coincatch.github.io/github.io/en/mix/#get-single-account
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/#/?id=margin-mode-structure}
     */
    fetchMarginMode(symbol: string, params?: {}): Promise<MarginMode>;
    parseMarginMode(marginMode: Dict, market?: any): MarginMode;
    parseMarginModeType(type: string): string;
    /**
     * @method
     * @name coincatch#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://coincatch.github.io/github.io/en/mix/#change-margin-mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    encodeMarginModeType(type: string): string;
    /**
     * @method
     * @name coincatch#fetchPositionMode
     * @description fetchs the position mode, hedged or one way
     * @see https://coincatch.github.io/github.io/en/mix/#get-single-account
     * @param {string} symbol unified symbol of the market to fetch entry for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    fetchPositionMode(symbol?: Str, params?: {}): Promise<{
        info: any;
        hedged: boolean;
    }>;
    /**
     * @method
     * @name coincatch#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://bingx-api.github.io/docs/#/en-us/swapV2/trade-api.html#Set%20Position%20Mode
     * @param {bool} hedged set to true to use dualSidePosition
     * @param {string} symbol unified symbol of the market to fetch entry for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.productType] 'umcbl' or 'dmcbl' (default 'umcbl' if symbol is not provided)
     * @returns {object} response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name coincatch#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://coincatch.github.io/github.io/en/mix/#get-single-account
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/#/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name coincatch#setLeverage
     * @description set the level of leverage for a market
     * @see https://hashkeyglobal-apidoc.readme.io/reference/change-futures-leverage-trade
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] *for isolated margin mode with hedged position mode only* 'long' or 'short'
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name coincatch#reduceMargin
     * @description remove margin from a position
     * @see https://coincatch.github.io/github.io/en/mix/#change-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] *for isolated margin mode with hedged position mode only* 'long' or 'short'
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name coincatch#addMargin
     * @description add margin
     * @see https://coincatch.github.io/github.io/en/mix/#change-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.side] *for isolated margin mode with hedged position mode only* 'long' or 'short'
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name coincatch#fetchPosition
     * @description fetch data on a single open contract trade position
     * @see https://coincatch.github.io/github.io/en/mix/#get-symbol-position
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string}  [params.side] 'long' or 'short' *for non-hedged position mode only* (default 'long')
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @description fetch open positions for a single market
     * @name coincatch#fetchPositionsForSymbol
     * @see https://coincatch.github.io/github.io/en/mix/#get-symbol-position
     * @description fetch all open positions for specific symbol
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositionsForSymbol(symbol: string, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name coincatch#fetchPositions
     * @description fetch all open positions
     * @see https://coincatch.github.io/github.io/en/mix/#get-all-position
     * @param {string[]} [symbols] list of unified market symbols (all symbols must belong to the same product type)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.productType] 'umcbl' or 'dmcbl' (default 'umcbl' if symbols are not provided)
     * @param {string} [params.marginCoin] the settle currency of the positions, needs to match the productType
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    safeMarketCustom(marketId: Str, market?: Market, settleId?: Str): Market;
    /**
     * @method
     * @name coincatch#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered balance of the user
     * @see https://coincatch.github.io/github.io/en/spot/#get-bills
     * @see https://coincatch.github.io/github.io/en/mix/#get-business-account-bill
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entrys to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] *swap only* the latest time in ms to fetch entries for
     * @param {string} [params.type] 'spot' or 'swap' (default 'spot')
     * @param {string} [params.after] *spot only* billId, return the data less than this billId
     * @param {string} [params.before] *spot only* billId, return the data greater than or equals to this billId
     * @param {string} [params.groupType] *spot only*
     * @param {string} [params.bizType] *spot only*
     * @param {string} [params.productType] *swap only* 'umcbl' or 'dmcbl' (default 'umcbl' or 'dmcbl' if code is provided and code is not equal to 'USDT')
     * @param {string} [params.business] *swap only*
     * @param {string} [params.lastEndId] *swap only*
     * @param {bool} [params.next] *swap only*
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: string): string;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
}
