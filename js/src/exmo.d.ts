import Exchange from './abstract/exmo.js';
import type { Dict, Int, Order, OrderSide, OrderType, Trade, OrderBook, OHLCV, Balances, Str, Transaction, Ticker, Tickers, Strings, Market, Currency, Num, MarginModification, Currencies, TradingFees, Dictionary, int, DepositAddress } from './base/types.js';
/**
 * @class exmo
 * @augments Exchange
 */
export default class exmo extends Exchange {
    describe(): any;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: {}): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name exmo#reduceMargin
     * @description remove margin from a position
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#eebf9f25-0289-4946-9482-89872c738449
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name exmo#addMargin
     * @description add margin
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#143ef808-79ca-4e49-9e79-a60ea4d8c0e3
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    /**
     * @method
     * @name exmo#fetchTradingFees
     * @description fetch the trading fees for multiple markets
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#90927062-256c-4b03-900f-2b99131f9a54
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#7de7e75c-5833-45a8-b937-c2276d235aaa
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
     */
    fetchTradingFees(params?: {}): Promise<TradingFees>;
    fetchPrivateTradingFees(params?: {}): Promise<Dict>;
    fetchPublicTradingFees(params?: {}): Promise<Dict>;
    parseFixedFloatValue(input: any): number;
    /**
     * @method
     * @name exmo#fetchTransactionFees
     * @deprecated
     * @description please use fetchDepositWithdrawFees instead
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction fees structures]{@link https://docs.ccxt.com/#/?id=fees-structure}
     */
    fetchTransactionFees(codes?: Strings, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name exmo#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction fees structures]{@link https://docs.ccxt.com/#/?id=fees-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): any;
    /**
     * @method
     * @name exmo#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#7cdf0ca8-9ff6-4cf3-aa33-bcec83155c49
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#4190035d-24b1-453d-833b-37e0a52f88e2
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name exmo#fetchMarkets
     * @description retrieves data on all markets for exmo
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#7de7e75c-5833-45a8-b937-c2276d235aaa
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name exmo#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#65eeb949-74e5-4631-9184-c38387fe53e8
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name exmo#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#59c5160f-27a1-4d9a-8cfb-7979c7ffaac6
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#c8388df7-1f9f-4d41-81c4-5a387d171dc6
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] *isolated* fetches the isolated margin balance
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name exmo#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#c60c51a8-e683-4f45-a000-820723d37871
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name exmo#fetchOrderBooks
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data for multiple markets
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#c60c51a8-e683-4f45-a000-820723d37871
     * @param {string[]|undefined} symbols list of unified market symbols, all symbols fetched if undefined, default is undefined
     * @param {int} [limit] max number of entries per orderbook to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbol
     */
    fetchOrderBooks(symbols?: Strings, limit?: Int, params?: {}): Promise<Dictionary<OrderBook>>;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name exmo#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#4c8e6459-3503-4361-b012-c34bb9f7e385
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name exmo#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#4c8e6459-3503-4361-b012-c34bb9f7e385
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name exmo#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#5a5a9c0d-cf17-47f6-9d62-6d4404ebd5ac
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name exmo#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#b8d8d9af-4f46-46a1-939b-ad261d79f452  // spot
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#f4b1aaf8-399f-403b-ab5e-4926d967a106  // margin
     * @param {string} symbol a symbol is required but it can be a single string, or a non-empty array
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] *required for margin orders* the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.offset] last deal offset, default = 0
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name exmo#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketOrderWithCost(symbol: string, side: OrderSide, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name exmo#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name exmo#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name exmo#createOrder
     * @description create a trade order
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#80daa469-ec59-4d0a-b229-6a311d8dd1cd
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#de6f4321-eeac-468c-87f7-c4ad7062e265  // stop market
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#3561b86c-9ff1-436e-8e68-ac926b7eb523  // margin
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the price at which a trigger order is triggered at
     * @param {string} [params.timeInForce] *spot only* 'fok', 'ioc' or 'post_only'
     * @param {boolean} [params.postOnly] *spot only* true for post only orders
     * @param {float} [params.cost] *spot only* *market orders only* the cost of the order in the quote currency for market orders
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name exmo#cancelOrder
     * @description cancels an open order
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#1f710d4b-75bc-4b65-ad68-006f863a3f26
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#a4d0aae8-28f7-41ac-94fd-c4030130453d  // stop market
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#705dfec5-2b35-4667-862b-faf54eca6209  // margin
     * @param {string} id order id
     * @param {string} symbol not used by exmo cancelOrder ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.trigger] true to cancel a trigger order
     * @param {string} [params.marginMode] set to 'cross' or 'isolated' to cancel a margin order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name exmo#fetchOrder
     * @description *spot only* fetches information on an order made by the user
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#cf27781e-28e5-4b39-a52d-3110f5d22459  // spot
     * @param {string} id order id
     * @param {string} symbol not used by exmo fetchOrder
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name exmo#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#cf27781e-28e5-4b39-a52d-3110f5d22459  // spot
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#00810661-9119-46c5-aec5-55abe9cb42c7  // margin
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] set to "isolated" to fetch trades for a margin order
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name exmo#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#0e135370-daa4-4689-8acd-b6876dee9ba1  // spot open orders
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#a7cfd4f0-476e-4675-b33f-22a46902f245  // margin
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] set to "isolated" for margin orders
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseStatus(status: any): string;
    parseSide(orderType: any): string;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name exmo#fetchCanceledOrders
     * @description fetches information on multiple canceled orders made by the user
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#1d2524dd-ae6d-403a-a067-77b50d13fbe5  // margin
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#a51be1d0-af5f-44e4-99d7-f7b04c6067d0  // spot canceled orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] timestamp in ms of the earliest order, default is undefined
     * @param {int} [limit] max number of orders to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] set to "isolated" for margin orders
     * @returns {object} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<any[]>;
    /**
     * @method
     * @name exmo#editOrder
     * @description *margin only* edit a trade order
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#f27ee040-c75f-4b59-b608-d05bd45b7899  // margin
     * @param {string} id order id
     * @param {string} symbol unified CCXT market symbol
     * @param {string} type not used by exmo editOrder
     * @param {string} side not used by exmo editOrder
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] stop price for stop-market and stop-limit orders
     * @param {string} params.marginMode must be set to isolated
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {int} [params.distance] distance for trailing stop orders
     * @param {int} [params.expire] expiration timestamp in UTC timezone for the order. order will not be expired if expire is 0
     * @param {string} [params.comment] optional comment for order. up to 50 latin symbols, whitespaces, underscores
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name exmo#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#c8f9ced9-7ab6-4383-a6a4-bc54469ba60e
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    getMarketFromTrades(trades: any): any;
    /**
     * @method
     * @name exmo#withdraw
     * @description make a withdrawal
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#3ab9c34d-ad58-4f87-9c57-2e2ea88a8325
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: any, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name exmo#fetchDepositsWithdrawals
     * @description fetch history of deposits and withdrawals
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#31e69a33-4849-4e6a-b4b4-6d574238f6a7
     * @param {string} [code] unified currency code for the currency of the deposit/withdrawals, default is undefined
     * @param {int} [since] timestamp in ms of the earliest deposit/withdrawal, default is undefined
     * @param {int} [limit] max number of deposit/withdrawals to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDepositsWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name exmo#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name exmo#fetchWithdrawal
     * @description fetch data on a currency withdrawal via the withdrawal id
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706
     * @param {string} id withdrawal id
     * @param {string} code unified currency code of the currency withdrawn, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawal(id: string, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name exmo#fetchDeposit
     * @description fetch information on a deposit
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706
     * @param {string} id deposit id
     * @param {string} code unified currency code, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposit(id?: any, code?: Str, params?: {}): Promise<Transaction>;
    /**
     * @method
     * @name exmo#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://documenter.getpostman.com/view/10287440/SzYXWKPi#97f1becd-7aad-4e0e-babe-7bbe09e33706
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    nonce(): number;
    handleErrors(httpCode: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
