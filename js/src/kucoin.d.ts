import Exchange from './abstract/kucoin.js';
import type { TransferEntry, Int, OrderSide, OrderType, Order, OHLCV, Trade, Balances, OrderRequest, Str, Transaction, Ticker, OrderBook, Tickers, Strings, Currency, Market, Num, Account, Dict, TradingFeeInterface, Currencies, int, LedgerEntry, DepositAddress, BorrowInterest } from './base/types.js';
/**
 * @class kucoin
 * @augments Exchange
 */
export default class kucoin extends Exchange {
    describe(): any;
    nonce(): number;
    /**
     * @method
     * @name kucoin#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @see https://docs.kucoin.com/#server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name kucoin#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://docs.kucoin.com/#service-status
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
     * @name kucoin#fetchMarkets
     * @description retrieves data on all markets for kucoin
     * @see https://docs.kucoin.com/#get-symbols-list-deprecated
     * @see https://docs.kucoin.com/#get-all-tickers
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @method
     * @name kucoin#loadMigrationStatus
     * @param {boolean} force load account state for non hf
     * @description loads the migration status for the account (hf or not)
     * @see https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/get-user-type
     * @returns {any} ignore
     */
    loadMigrationStatus(force?: boolean): Promise<boolean>;
    handleHfAndParams(params?: {}): {}[];
    /**
     * @method
     * @name kucoin#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://docs.kucoin.com/#get-currencies
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name kucoin#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://docs.kucoin.com/#list-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/#/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    /**
     * @method
     * @name kucoin#fetchTransactionFee
     * @description *DEPRECATED* please use fetchDepositWithdrawFee instead
     * @see https://docs.kucoin.com/#get-withdrawal-quotas
     * @param {string} code unified currency code
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTransactionFee(code: string, params?: {}): Promise<{
        info: any;
        withdraw: Dict;
        deposit: {};
    }>;
    /**
     * @method
     * @name kucoin#fetchDepositWithdrawFee
     * @description fetch the fee for deposits and withdrawals
     * @see https://docs.kucoin.com/#get-withdrawal-quotas
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] The chain of currency. This only apply for multi-chain currency, and there is no need for single chain currency; you can query the chain through the response of the GET /api/v2/currencies/{currency} interface
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFee(code: string, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): Dict;
    isFuturesMethod(methodName: any, params: any): boolean;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name kucoin#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://docs.kucoin.com/#get-all-tickers
     * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name kucoin#fetchMarkPrices
     * @description fetches the mark price for multiple markets
     * @see https://www.kucoin.com/docs/rest/margin-trading/margin-info/get-all-margin-trading-pairs-mark-prices
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name kucoin#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://docs.kucoin.com/#get-24hr-stats
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name kucoin#fetchMarkPrice
     * @description fetches the mark price for a specific market
     * @see https://www.kucoin.com/docs/rest/margin-trading/margin-info/get-mark-price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
     */
    fetchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name kucoin#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://docs.kucoin.com/#get-klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name kucoin#createDepositAddress
     * @see https://www.kucoin.com/docs/rest/funding/deposit/create-deposit-address-v3-
     * @description create a currency deposit address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network name
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name kucoin#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://docs.kucoin.com/#get-deposit-addresses-v2
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network name
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name kucoin#fetchDepositAddressesByNetwork
     * @see https://docs.kucoin.com/#get-deposit-addresses-v2
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [address structures]{@link https://docs.ccxt.com/#/?id=address-structure}
     */
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    /**
     * @method
     * @name kucoin#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.kucoin.com/docs/rest/spot-trading/market-data/get-part-order-book-aggregated-
     * @see https://www.kucoin.com/docs/rest/spot-trading/market-data/get-full-order-book-aggregated-
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleTriggerPrices(params: any): any[];
    /**
     * @method
     * @name kucoin#createOrder
     * @description Create an order on the exchange
     * @see https://docs.kucoin.com/spot#place-a-new-order
     * @see https://docs.kucoin.com/spot#place-a-new-order-2
     * @see https://docs.kucoin.com/spot#place-a-margin-order
     * @see https://docs.kucoin.com/spot-hf/#place-hf-order
     * @see https://www.kucoin.com/docs/rest/spot-trading/orders/place-order-test
     * @see https://www.kucoin.com/docs/rest/margin-trading/orders/place-margin-order-test
     * @see https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/sync-place-hf-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {string} [params.marginMode] 'cross', // cross (cross mode) and isolated (isolated mode), set to cross by default, the isolated mode will be released soon, stay tuned
     * @param {string} [params.timeInForce] GTC, GTT, IOC, or FOK, default is GTC, limit orders only
     * @param {string} [params.postOnly] Post only flag, invalid when timeInForce is IOC or FOK
     *
     * EXCHANGE SPECIFIC PARAMETERS
     * @param {string} [params.clientOid] client order id, defaults to uuid if not passed
     * @param {string} [params.remark] remark for the order, length cannot exceed 100 utf8 characters
     * @param {string} [params.tradeType] 'TRADE', // TRADE, MARGIN_TRADE // not used with margin orders
     * limit orders ---------------------------------------------------
     * @param {float} [params.cancelAfter] long, // cancel after n seconds, requires timeInForce to be GTT
     * @param {bool} [params.hidden] false, // Order will not be displayed in the order book
     * @param {bool} [params.iceberg] false, // Only a portion of the order is displayed in the order book
     * @param {string} [params.visibleSize] this.amountToPrecision (symbol, visibleSize), // The maximum visible size of an iceberg order
     * market orders --------------------------------------------------
     * @param {string} [params.funds] // Amount of quote currency to use
     * stop orders ----------------------------------------------------
     * @param {string} [params.stop]  Either loss or entry, the default is loss. Requires triggerPrice to be defined
     * margin orders --------------------------------------------------
     * @param {float} [params.leverage] Leverage size of the order
     * @param {string} [params.stp] '', // self trade prevention, CN, CO, CB or DC
     * @param {bool} [params.autoBorrow] false, // The system will first borrow you funds at the optimal interest rate and then place an order for you
     * @param {bool} [params.hf] false, // true for hf order
     * @param {bool} [params.test] set to true to test an order, no order will be created but the request will be validated
     * @param {bool} [params.sync] set to true to use the hf sync call
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @see https://www.kucoin.com/docs/rest/spot-trading/orders/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketOrderWithCost(symbol: string, side: OrderSide, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.kucoin.com/docs/rest/spot-trading/orders/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://www.kucoin.com/docs/rest/spot-trading/orders/place-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#createOrders
     * @description create a list of trade orders
     * @see https://www.kucoin.com/docs/rest/spot-trading/orders/place-multiple-orders
     * @see https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/place-multiple-hf-orders
     * @see https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/sync-place-multiple-hf-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {bool} [params.hf] false, // true for hf orders
     * @param {bool} [params.sync] false, // true to use the hf sync call
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    marketOrderAmountToPrecision(symbol: string, amount: any): string;
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name kucoin#editOrder
     * @description edit an order, kucoin currently only supports the modification of HF orders
     * @see https://docs.kucoin.com/spot-hf/#modify-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type not used
     * @param {string} side not used
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, defaults to id if not passed
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#cancelOrder
     * @description cancels an open order
     * @see https://docs.kucoin.com/spot#cancel-an-order
     * @see https://docs.kucoin.com/spot#cancel-an-order-2
     * @see https://docs.kucoin.com/spot#cancel-single-order-by-clientoid
     * @see https://docs.kucoin.com/spot#cancel-single-order-by-clientoid-2
     * @see https://docs.kucoin.com/spot-hf/#cancel-orders-by-orderid
     * @see https://docs.kucoin.com/spot-hf/#cancel-order-by-clientoid
     * @see https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/sync-cancel-hf-order-by-orderid
     * @see https://www.kucoin.com/docs/rest/spot-trading/spot-hf-trade-pro-account/sync-cancel-hf-order-by-clientoid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if cancelling a stop order
     * @param {bool} [params.hf] false, // true for hf order
     * @param {bool} [params.sync] false, // true to use the hf sync call
     * @returns Response from the exchange
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#cancelAllOrders
     * @description cancel all open orders
     * @see https://docs.kucoin.com/spot#cancel-all-orders
     * @see https://docs.kucoin.com/spot#cancel-orders
     * @see https://docs.kucoin.com/spot-hf/#cancel-all-hf-orders-by-symbol
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] *invalid for isolated margin* true if cancelling all stop orders
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @param {string} [params.orderIds] *stop orders only* Comma seperated order IDs
     * @param {bool} [params.hf] false, // true for hf order
     * @returns Response from the exchange
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoin#fetchOrdersByStatus
     * @description fetch a list of orders
     * @see https://docs.kucoin.com/spot#list-orders
     * @see https://docs.kucoin.com/spot#list-stop-orders
     * @see https://docs.kucoin.com/spot-hf/#obtain-list-of-active-hf-orders
     * @see https://docs.kucoin.com/spot-hf/#obtain-list-of-filled-hf-orders
     * @param {string} status *not used for stop orders* 'open' or 'closed'
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] max number of orders to return
     * @param {object} [params] exchange specific params
     * @param {int} [params.until] end time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit, market, limit_stop or market_stop
     * @param {string} [params.tradeType] TRADE for spot trading, MARGIN_TRADE for Margin Trading
     * @param {int} [params.currentPage] *trigger orders only* current page
     * @param {string} [params.orderIds] *trigger orders only* comma seperated order ID list
     * @param {bool} [params.trigger] True if fetching a trigger order
     * @param {bool} [params.hf] false, // true for hf order
     * @returns An [array of order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://docs.kucoin.com/spot#list-orders
     * @see https://docs.kucoin.com/spot#list-stop-orders
     * @see https://docs.kucoin.com/spot-hf/#obtain-list-of-active-hf-orders
     * @see https://docs.kucoin.com/spot-hf/#obtain-list-of-filled-hf-orders
     * @param {string} symbol unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit, market, limit_stop or market_stop
     * @param {string} [params.tradeType] TRADE for spot trading, MARGIN_TRADE for Margin Trading
     * @param {bool} [params.trigger] True if fetching a trigger order
     * @param {bool} [params.hf] false, // true for hf order
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://docs.kucoin.com/spot#list-orders
     * @see https://docs.kucoin.com/spot#list-stop-orders
     * @see https://docs.kucoin.com/spot-hf/#obtain-list-of-active-hf-orders
     * @see https://docs.kucoin.com/spot-hf/#obtain-list-of-filled-hf-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of  open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {bool} [params.trigger] true if fetching trigger orders
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit, market, limit_stop or market_stop
     * @param {string} [params.tradeType] TRADE for spot trading, MARGIN_TRADE for Margin Trading
     * @param {int} [params.currentPage] *trigger orders only* current page
     * @param {string} [params.orderIds] *trigger orders only* comma seperated order ID list
     * @param {bool} [params.hf] false, // true for hf order
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#fetchOrder
     * @description fetch an order
     * @see https://docs.kucoin.com/spot#get-an-order
     * @see https://docs.kucoin.com/spot#get-single-active-order-by-clientoid
     * @see https://docs.kucoin.com/spot#get-single-order-info
     * @see https://docs.kucoin.com/spot#get-single-order-by-clientoid
     * @see https://docs.kucoin.com/spot-hf/#details-of-a-single-hf-order
     * @see https://docs.kucoin.com/spot-hf/#obtain-details-of-a-single-hf-order-using-clientoid
     * @param {string} id Order id
     * @param {string} symbol not sent to exchange except for trigger orders with clientOid, but used internally by CCXT to filter
     * @param {object} [params] exchange specific parameters
     * @param {bool} [params.trigger] true if fetching a trigger order
     * @param {bool} [params.hf] false, // true for hf order
     * @param {bool} [params.clientOid] unique order id created by users to identify their orders
     * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name kucoin#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.kucoin.com/#list-fills
     * @see https://docs.kucoin.com/spot-hf/#transaction-details
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
     * @name kucoin#fetchMyTrades
     * @see https://docs.kucoin.com/#list-fills
     * @see https://docs.kucoin.com/spot-hf/#transaction-details
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {bool} [params.hf] false, // true for hf order
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kucoin#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.kucoin.com/docs/rest/spot-trading/market-data/get-trade-histories
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name kucoin#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.kucoin.com/docs/rest/funding/trade-fee/trading-pair-actual-fee-spot-margin-trade_hf
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name kucoin#withdraw
     * @description make a withdrawal
     * @see https://www.kucoin.com/docs/rest/funding/withdrawals/apply-withdraw-v3-
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
     * @name kucoin#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-list
     * @see https://www.kucoin.com/docs/rest/funding/deposit/get-v1-historical-deposits-list
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name kucoin#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.kucoin.com/docs/rest/funding/withdrawals/get-withdrawals-list
     * @see https://www.kucoin.com/docs/rest/funding/withdrawals/get-v1-historical-withdrawals-list
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseBalanceHelper(entry: any): import("./base/types.js").BalanceAccount;
    /**
     * @method
     * @name kucoin#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.kucoin.com/docs/rest/account/basic-info/get-account-list-spot-margin-trade_hf
     * @see https://www.kucoin.com/docs/rest/funding/funding-overview/get-account-detail-margin
     * @see https://www.kucoin.com/docs/rest/funding/funding-overview/get-account-detail-isolated-margin
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.marginMode] 'cross' or 'isolated', margin type for fetching margin balance
     * @param {object} [params.type] extra parameters specific to the exchange API endpoint
     * @param {object} [params.hf] *default if false* if true, the result includes the balance of the high frequency account
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name kucoin#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://www.kucoin.com/docs/rest/funding/transfer/inner-transfer
     * @see https://docs.kucoin.com/futures/#transfer-funds-to-kucoin-main-account-2
     * @see https://docs.kucoin.com/spot-hf/#internal-funds-transfers-in-high-frequency-trading-accounts
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    /**
     * @method
     * @name kucoin#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.kucoin.com/docs/rest/account/basic-info/get-account-ledgers-spot-margin
     * @see https://www.kucoin.com/docs/rest/account/basic-info/get-account-ledgers-trade_hf
     * @see https://www.kucoin.com/docs/rest/account/basic-info/get-account-ledgers-margin_hf
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.hf] default false, when true will fetch ledger entries for the high frequency trading account
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<LedgerEntry[]>;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
    parseBorrowRate(info: any, currency?: Currency): {
        currency: string;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    /**
     * @method
     * @name kucoin#fetchBorrowInterest
     * @description fetch the interest owed by the user for borrowing currency for margin trading
     * @see https://docs.kucoin.com/#get-repay-record
     * @see https://docs.kucoin.com/#query-isolated-margin-account-info
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol, required for isolated margin
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' default is 'cross'
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/#/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name kucoin#fetchBorrowRateHistories
     * @description retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined
     * @see https://www.kucoin.com/docs/rest/margin-trading/margin-trading-v3-/get-cross-isolated-margin-interest-records
     * @param {string[]|undefined} codes list of unified currency codes, default is undefined
     * @param {int} [since] timestamp in ms of the earliest borrowRate, default is undefined
     * @param {int} [limit] max number of borrow rate prices to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' default is 'cross'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object} a dictionary of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} indexed by the market symbol
     */
    fetchBorrowRateHistories(codes?: any, since?: Int, limit?: Int, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name kucoin#fetchBorrowRateHistory
     * @description retrieves a history of a currencies borrow interest rate at specific time slots
     * @see https://www.kucoin.com/docs/rest/margin-trading/margin-trading-v3-/get-cross-isolated-margin-interest-records
     * @param {string} code unified currency code
     * @param {int} [since] timestamp for the earliest borrow rate
     * @param {int} [limit] the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure} to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' default is 'cross'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/#/?id=borrow-rate-structure}
     */
    fetchBorrowRateHistory(code: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowRateHistories(response: any, codes: any, since: any, limit: any): Dict;
    /**
     * @method
     * @name kucoin#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://docs.kucoin.com/#1-margin-borrowing
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @param {string} [params.timeInForce] either IOC or FOK
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowCrossMargin(code: string, amount: number, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    /**
     * @method
     * @name kucoin#borrowIsolatedMargin
     * @description create a loan to borrow margin
     * @see https://docs.kucoin.com/#1-margin-borrowing
     * @param {string} symbol unified market symbol, required for isolated margin
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @param {string} [params.timeInForce] either IOC or FOK
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    borrowIsolatedMargin(symbol: string, code: string, amount: number, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    /**
     * @method
     * @name kucoin#repayCrossMargin
     * @description repay borrowed margin and interest
     * @see https://docs.kucoin.com/#2-repayment
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayCrossMargin(code: string, amount: any, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    /**
     * @method
     * @name kucoin#repayIsolatedMargin
     * @description repay borrowed margin and interest
     * @see https://docs.kucoin.com/#2-repayment
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
     */
    repayIsolatedMargin(symbol: string, code: string, amount: any, params?: {}): Promise<{
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    parseMarginLoan(info: any, currency?: Currency): {
        id: string;
        currency: string;
        amount: number;
        symbol: any;
        timestamp: number;
        datetime: string;
        info: any;
    };
    /**
     * @method
     * @name kucoin#fetchDepositWithdrawFees
     * @description fetch deposit and withdraw fees - *IMPORTANT* use fetchDepositWithdrawFee to get more in-depth info
     * @see https://docs.kucoin.com/#get-currencies
     * @param {string[]|undefined} codes list of unified currency codes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoin#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.kucoin.com/docs/rest/margin-trading/margin-trading-v3-/modify-leverage-multiplier
     * @param {int } [leverage] New leverage multiplier. Must be greater than 1 and up to two decimal places, and cannot be less than the user's current debt leverage or greater than the system's maximum leverage
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: Int, symbol?: Str, params?: {}): Promise<any>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
}
