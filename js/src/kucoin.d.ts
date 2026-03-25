import Exchange from './abstract/kucoin.js';
import type { ADL, Account, Balances, BorrowInterest, Currency, Currencies, DepositAddress, Dict, FundingHistory, FundingRate, Int, int, LedgerEntry, Leverage, LeverageTier, LeverageTiers, MarginMode, MarginModification, Market, Num, OHLCV, Order, OrderBook, OrderRequest, OrderSide, OrderType, Position, Str, Strings, Ticker, Tickers, Trade, TradingFeeInterface, Transaction, TransferEntry } from './base/types.js';
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
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-server-time
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-server-time
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: {}): Promise<Int>;
    /**
     * @method
     * @name kucoin#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-service-status
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-service-status
     * @see https://www.kucoin.com/docs-new/rest/ua/get-service-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] spot or swap
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {string} [params.tradeType] *uta only* set to SPOT or FUTURES
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
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
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-symbols
     * @see https://www.kucoin.com/docs-new/rest/ua/get-symbol
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-all-symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    fetchContractMarkets(params?: {}): Promise<Market[]>;
    fetchUTAMarkets(params?: {}): Promise<Market[]>;
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
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-currencies
     * @see https://www.kucoin.com/docs-new/rest/ua/get-currencies
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: {}): Promise<Currencies>;
    /**
     * @method
     * @name kucoin#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-list-spot
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [account structures]{@link https://docs.ccxt.com/?id=account-structure} indexed by the account type
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    /**
     * @method
     * @name kucoin#fetchTransactionFee
     * @description *DEPRECATED* please use fetchDepositWithdrawFee instead
     * @see https://docs.kucoin.com/#get-withdrawal-quotas
     * @param {string} code unified currency code
     * @param {object} params extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
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
     * @see https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-quotas
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] The chain of currency. This only apply for multi-chain currency, and there is no need for single chain currency; you can query the chain through the response of the GET /api/v2/currencies/{currency} interface
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchDepositWithdrawFee(code: string, params?: {}): Promise<any>;
    parseDepositWithdrawFee(fee: any, currency?: Currency): Dict;
    isFuturesMethod(methodName: any, params: any): boolean;
    parseSpotOrUtaTicker(ticker: Dict, market?: Market): Ticker;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    parseContractTicker(ticker: Dict, market?: Market): Ticker;
    typeToTradeType(type: Str): Str;
    /**
     * @method
     * @name kucoin#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-all-tickers
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-all-tickers
     * @see https://www.kucoin.com/docs-new/rest/ua/get-ticker
     * @param {string[]|undefined} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {string} [params.type] spot or swap (default is spot)
     * @param {string} [params.method] *swap only* the method to use, futuresPublicGetContractsActive or futuresPublicGetAllTickers (default is futuresPublicGetContractsActive)
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    fetchContractTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name kucoin#fetchMarkPrices
     * @description fetches the mark price for multiple markets
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/market-data/get-mark-price-list
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchMarkPrices(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @method
     * @name kucoin#fetchTicker
     * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-24hr-stats
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-ticker
     * @see https://www.kucoin.com/docs-new/rest/ua/get-ticker
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name kucoin#fetchMarkPrice
     * @description fetches the mark price for a specific market
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/market-data/get-mark-price-detail
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-mark-price
     * @param {string} symbol unified symbol of the market to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchMarkPrice(symbol: string, params?: {}): Promise<Ticker>;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name kucoin#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-klines
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-klines
     * @see https://www.kucoin.com/docs-new/rest/ua/get-klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @ignore
     * @name kucoin#fetchUTAOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.kucoin.com/docs-new/rest/ua/get-klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchUTAOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @ignore
     * @name kucoin#fetchSpotOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchSpotOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @ignore
     * @name kucoin#fetchContractOHLCV
     * @description helper method for fetchOHLCV
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-klines
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchContractOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name kucoin#createDepositAddress
     * @see https://www.kucoin.com/docs-new/rest/account-info/deposit/add-deposit-address-v3
     * @description create a currency deposit address
     * @param {string} code unified currency code of the currency for the deposit address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network name
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    createDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name kucoin#fetchDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-address-v3/en
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.network] the blockchain network name
     * @param {string} [params.accountType] 'main' or 'contract' (default is 'main')
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    /**
     * @method
     * @name kucoin#fetchContractDepositAddress
     * @description fetch the deposit address for a currency associated with this account
     * @see https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-address
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [address structure]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchContractDepositAddress(code: string, params?: {}): Promise<DepositAddress>;
    parseDepositAddress(depositAddress: any, currency?: Currency): DepositAddress;
    /**
     * @method
     * @name kucoin#fetchDepositAddressesByNetwork
     * @see https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-address-v3/en
     * @description fetch the deposit address for a currency associated with this account
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an array of [address structures]{@link https://docs.ccxt.com/?id=address-structure}
     */
    fetchDepositAddressesByNetwork(code: string, params?: {}): Promise<DepositAddress[]>;
    /**
     * @method
     * @name kucoin#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-part-orderbook
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-full-orderbook
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-part-orderbook
     * @see https://www.kucoin.com/docs-new/rest/ua/get-orderbook
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/?id=order-book-structure} indexed by market symbols
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    handleTriggerPrices(params: any): any[];
    /**
     * @method
     * @name kucoin#createOrder
     * @description Create an order on the exchange
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-stop-order
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-stop-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-take-profit-and-stop-loss-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * Check createSpotOrder() and createContractOrder() for more details on the extra parameters that can be used in params
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#createSpotOrder
     * @description helper method for creating spot orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-stop-order
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/add-stop-order
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
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createSpotOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createSpotOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    marketOrderAmountToPrecision(symbol: string, amount: any): string;
    /**
     * @method
     * @name kucoin#createContractOrder
     * @description helper method for creating contract orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-take-profit-and-stop-loss-order
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount the amount of currency to trade
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {object} [params.takeProfit] *takeProfit object in params* containing the triggerPrice at which the attached take profit order will be triggered and the triggerPriceType
     * @param {object} [params.stopLoss] *stopLoss object in params* containing the triggerPrice at which the attached stop loss order will be triggered and the triggerPriceType
     * @param {float} [params.triggerPrice] The price a trigger order is triggered at
     * @param {float} [params.stopLossPrice] price to trigger stop-loss orders
     * @param {float} [params.takeProfitPrice] price to trigger take-profit orders
     * @param {bool} [params.reduceOnly] A mark to reduce the position size only. Set to false by default. Need to set the position size when reduceOnly is true.
     * @param {string} [params.timeInForce] GTC, GTT, IOC, or FOK, default is GTC, limit orders only
     * @param {string} [params.postOnly] Post only flag, invalid when timeInForce is IOC or FOK
     * @param {float} [params.cost] the cost of the order in units of USDT
     * @param {string} [params.marginMode] 'cross' or 'isolated', default is 'isolated'
     * @param {bool} [params.hedged] *swap and future only* true for hedged mode, false for one way mode, default is false
     * ----------------- Exchange Specific Parameters -----------------
     * @param {float} [params.leverage] Leverage size of the order (mandatory param in request, default is 1)
     * @param {string} [params.clientOid] client order id, defaults to uuid if not passed
     * @param {string} [params.remark] remark for the order, length cannot exceed 100 utf8 characters
     * @param {string} [params.stop] 'up' or 'down', the direction the triggerPrice is triggered from, requires triggerPrice. down: Triggers when the price reaches or goes below the triggerPrice. up: Triggers when the price reaches or goes above the triggerPrice.
     * @param {string} [params.triggerPriceType] "last", "mark", "index" - defaults to "mark"
     * @param {string} [params.stopPriceType] exchange-specific alternative for triggerPriceType: TP, IP or MP
     * @param {bool} [params.closeOrder] set to true to close position
     * @param {bool} [params.test] set to true to use the test order endpoint (does not submit order, use to validate params)
     * @param {bool} [params.forceHold] A mark to forcely hold the funds for an order, even though it's an order to reduce the position size. This helps the order stay on the order book and not get canceled when the position size changes. Set to false by default.\
     * @param {string} [params.positionSide] *swap and future only* hedged two-way position side, LONG or SHORT
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createContractOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    createContractOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): any;
    /**
     * @method
     * @name kucoin#createMarketOrderWithCost
     * @description create a market order by providing the symbol, side and cost
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createMarketOrderWithCost(symbol: string, side: OrderSide, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#createMarketBuyOrderWithCost
     * @description create a market buy order by providing the symbol and cost
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createMarketBuyOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#createMarketSellOrderWithCost
     * @description create a market sell order by providing the symbol and cost
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {float} cost how much you want to trade in units of the quote currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createMarketSellOrderWithCost(symbol: string, cost: number, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#createOrders
     * @description create a list of trade orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders-sync
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * Check createSpotOrders() and createContractOrders() for more details on the extra parameters that can be used in params
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#createSpotOrders
     * @description helper method for creating spot orders in batch
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-add-orders-sync
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/batch-add-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @param {bool} [params.hf] false, // true for hf orders
     * @param {bool} [params.sync] false, // true to use the hf sync call
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createSpotOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#createContractOrders
     * @description helper method for creating contract orders in batch
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/batch-add-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params]  extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createContractOrders(orders: OrderRequest[], params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#editOrder
     * @description edit an order, kucoin currently only supports the modification of HF orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/modify-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type not used
     * @param {string} side not used
     * @param {float} amount how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, defaults to id if not passed
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#cancelOrder
     * @description cancels an open order
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-clientoid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {string} [params.marginMode] *spot only* 'cross' or 'isolated'
     * Check cancelSpotOrder() and cancelContractOrder() for more details on the extra parameters that can be used in params
     * @returns Response from the exchange
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#cancelSpotOrder
     * @description helper method for cancelling spot orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-orderld-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-order-by-clientoid-sync
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-stop-order-by-clientoid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] True if cancelling a stop order
     * @param {bool} [params.hf] false, // true for hf order
     * @param {bool} [params.sync] false, // true to use the hf sync call
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @returns Response from the exchange
     */
    cancelSpotOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#cancelContractOrder
     * @description helper method for cancelling contract orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-order-by-clientoid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel order by client order id
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelContractOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#cancelAllOrders
     * @description cancel all open orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders-by-symbol
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-cancel-stop-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-all-orders-by-symbol
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/batch-cancel-stop-orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-stop-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @param {string} [params.marginMode] *spot only* 'cross' or 'isolated'
     * @returns Response from the exchange
     */
    cancelAllOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#cancelAllSpotOrders
     * @description helper method for cancelling all spot orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders-by-symbol
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/cancel-all-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/batch-cancel-stop-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/cancel-all-orders-by-symbol
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/batch-cancel-stop-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.trigger] *invalid for isolated margin* true if cancelling all stop orders
     * @param {string} [params.marginMode] 'cross' or 'isolated'
     * @param {string} [params.orderIds] *stop orders only* Comma separated order IDs
     * @param {bool} [params.hf] false, // true for hf order
     * @returns Response from the exchange
     */
    cancelAllSpotOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#cancelAllContractOrders
     * @description helper method for cancelling all contract orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-orders
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/cancel-all-stop-orders
     * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.trigger] When true, all the trigger orders will be cancelled
     * @returns Response from the exchange
     */
    cancelAllContractOrders(symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#fetchOrdersByStatus
     * @description fetches a list of orders placed on the exchange
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
     * @param {string} status 'active' or 'closed', only 'active' is valid for stop orders
     * @param {string} symbol unified symbol for the market to retrieve orders from
     * @param {int} [since] timestamp in ms of the earliest order to retrieve
     * @param {int} [limit] The maximum number of orders to retrieve
     * @param {object} [params] exchange specific parameters
     * Check fetchSpotOrdersByStatus() and fetchContractOrdersByStatus() for more details on the extra parameters that can be used in params
     * @returns An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#fetchSpotOrdersByStatus
     * @description fetch a list of spot orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
     * @param {string} status *not used for stop orders* 'open' or 'closed'
     * @param {string} symbol unified market symbol
     * @param {int} [since] timestamp in ms of the earliest order
     * @param {int} [limit] max number of orders to return
     * @param {object} [params] exchange specific params
     * @param {int} [params.until] end time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit, market, limit_stop or market_stop
     * @param {string} [params.tradeType] TRADE for spot trading, MARGIN_TRADE or MARGIN_ISOLATED_TRADE for Margin Trading
     * @param {int} [params.currentPage] *trigger orders only* current page
     * @param {string} [params.orderIds] *trigger orders only* comma separated order ID list
     * @param {bool} [params.trigger] True if fetching a trigger order
     * @param {bool} [params.hf] false, // true for hf order
     * @param {string} [params.marginMode] 'cross' or 'isolated', only for margin orders
     * @returns An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchSpotOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#fetchContractOrdersByStatus
     * @description fetches a list of contract orders placed on the exchange
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
     * @param {string} status 'active' or 'closed', only 'active' is valid for stop orders
     * @param {string} symbol unified symbol for the market to retrieve orders from
     * @param {int} [since] timestamp in ms of the earliest order to retrieve
     * @param {int} [limit] The maximum number of orders to retrieve
     * @param {object} [params] exchange specific parameters
     * @param {bool} [params.trigger] set to true to retrieve untriggered stop orders
     * @param {int} [params.until] End time in ms
     * @param {string} [params.side] buy or sell
     * @param {string} [params.type] limit or market
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns An [array of order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchContractOrdersByStatus(status: any, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
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
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-orders-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-list
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-stop-order-list
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-open-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-closed-orders
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-list
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
     * @param {string} [params.orderIds] *trigger orders only* comma separated order ID list
     * @param {bool} [params.hf] false, // true for hf order
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/get-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/get-stop-order-by-clientoid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * Check fetchSpotOrder() and fetchContractOrder() for more details on the extra parameters that can be used in params
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: Str, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#fetchSpotOrder
     * @description fetch a spot order
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/get-stop-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-order-by-clientoid
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-stop-order-by-clientoid
     * @param {string} id Order id
     * @param {string} symbol not sent to exchange except for trigger orders with clientOid, but used internally by CCXT to filter
     * @param {object} [params] exchange specific parameters
     * @param {bool} [params.trigger] true if fetching a trigger order
     * @param {bool} [params.hf] false, // true for hf order
     * @param {bool} [params.clientOid] unique order id created by users to identify their orders
     * @param {object} [params.marginMode] 'cross' or 'isolated'
     * @returns An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchSpotOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#fetchContractOrder
     * @description fetc contract order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-order-by-orderld
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/get-stop-order-by-clientoid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchContractOrder(id: Str, symbol?: Str, params?: {}): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    parseContractOrder(order: Dict, market?: Market): Order;
    parseSpotOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name kucoin#fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @see https://docs.kucoin.com/#list-fills
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-trade-history
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
     * @param {string} id order id
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchOrderTrades(id: string, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kucoin#fetchMyTrades
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
     * @description fetch all trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.type] 'spot' or 'swap', used if symbol is not provided (default is 'spot')
     * Check fetchMySpotTrades() and fetchMyContractTrades() for more details on the extra parameters that can be used in params
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kucoin#fetchMySpotTrades
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/orders/get-trade-history
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/orders/get-trade-history
     * @description fetch all spot trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {bool} [params.hf] false, // true for hf order
     * @param {string} [params.marginMode] 'cross' or 'isolated', only for margin trades
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMySpotTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kucoin#fetchMyContractTrades
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/get-trade-history
     * @description fetch all contract trades made by the user
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] End time in ms
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyContractTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @method
     * @name kucoin#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://www.kucoin.com/docs-new/rest/spot-trading/market-data/get-trade-history
     * @see https://www.kucoin.com/docs-new/rest/ua/get-trades
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/market-data/get-trade-history
     * @param {string} symbol unified symbol of the market to fetch trades for
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum amount of trades to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to false
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=public-trades}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    parseSpotOrUtaTrade(trade: Dict, market?: Market): Trade;
    parseContractTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name kucoin#fetchTradingFee
     * @description fetch the trading fees for a market
     * @see https://www.kucoin.com/docs-new/rest/account-info/trade-fee/get-actual-fee-spot-margin
     * @see https://www.kucoin.com/docs-new/rest/account-info/trade-fee/get-actual-fee-futures
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: {}): Promise<TradingFeeInterface>;
    /**
     * @method
     * @name kucoin#withdraw
     * @description make a withdrawal
     * @see https://www.kucoin.com/docs-new/rest/account-info/withdrawals/withdraw-v3
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: {}): Promise<Transaction>;
    parseTransactionStatus(status: Str): string;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name kucoin#fetchDeposits
     * @description fetch all deposits made to an account
     * @see https://www.kucoin.com/docs-new/rest/account-info/deposit/get-deposit-history
     * @see https://www.kucoin.com/docs/rest/funding/deposit/get-deposit-list
     * @see https://www.kucoin.com/docs/rest/funding/deposit/get-v1-historical-deposits-list
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] *main account only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.accountType] 'main' or 'contract' (default is 'main')
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name kucoin#fetchContractDeposits
     * @description helper method for fetching deposits for futures accounts
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchContractDeposits(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name kucoin#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @see https://www.kucoin.com/docs-new/rest/account-info/withdrawals/get-withdrawal-history
     * @see https://www.kucoin.com/docs/rest/funding/withdrawals/get-withdrawals-list
     * @see https://www.kucoin.com/docs/rest/funding/withdrawals/get-v1-historical-withdrawals-list
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] *main account only* default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @param {string} [params.accountType] 'main' or 'contract' (default is 'main')
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    /**
     * @method
     * @name kucoin#fetchContractWithdrawals
     * @description helper method for fetching withdrawals for futures accounts
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchContractWithdrawals(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<Transaction[]>;
    parseBalanceHelper(entry: any): import("./base/types.js").BalanceAccount;
    /**
     * @method
     * @name kucoin#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-detail-spot
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-cross-margin
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-isolated-margin
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-futures
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.marginMode] 'cross' or 'isolated', margin type for fetching margin balance
     * @param {object} [params.type] extra parameters specific to the exchange API endpoint
     * @param {object} [params.hf] *default if false* if true, the result includes the balance of the high frequency account
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name kucoin#fetchContractBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-futures
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.code] the unified currency code to fetch the balance for, if not provided, the default .options['fetchBalance']['code'] will be used
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchContractBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name kucoin#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://www.kucoin.com/docs-new/rest/account-info/transfer/flex-transfer?lang=en_US&
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from
     * @param {string} toAccount account to transfer to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.transferType] INTERNAL, PARENT_TO_SUB, SUB_TO_PARENT (default is INTERNAL)
     * @param {string} [params.fromUserId] required if transferType is SUB_TO_PARENT
     * @param {string} [params.toUserId] required if transferType is PARENT_TO_SUB
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: {}): Promise<TransferEntry>;
    isHfOrMining(fromId: Str, toId: Str): boolean;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    parseTransferStatus(status: Str): Str;
    parseLedgerEntryType(type: any): string;
    parseLedgerDirection(direction: any): string;
    parseLedgerStatus(status: any): string;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    /**
     * @method
     * @name kucoin#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-spot-margin
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-tradehf
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-marginhf
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-futures
     * @param {string} [code] unified currency code, default is undefined
     * @param {int} [since] timestamp in ms of the earliest ledger entry, default is undefined
     * @param {int} [limit] max number of ledger entries to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {object} [params.type] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.hf] default false, when true will fetch ledger entries for the high frequency trading account
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [available parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
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
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-cross-margin
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-isolated-margin
     * @param {string} [code] unified currency code
     * @param {string} [symbol] unified market symbol, required for isolated margin
     * @param {int} [since] the earliest time in ms to fetch borrrow interest for
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' default is 'cross'
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name kucoin#fetchBorrowRateHistories
     * @description retrieves a history of a multiple currencies borrow interest rate at specific time slots, returns all currencies if no symbols passed, default is undefined
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/get-interest-history
     * @param {string[]|undefined} codes list of unified currency codes, default is undefined
     * @param {int} [since] timestamp in ms of the earliest borrowRate, default is undefined
     * @param {int} [limit] max number of borrow rate prices to return, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' default is 'cross'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object} a dictionary of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} indexed by the market symbol
     */
    fetchBorrowRateHistories(codes?: any, since?: Int, limit?: Int, params?: {}): Promise<Dict>;
    /**
     * @method
     * @name kucoin#fetchBorrowRateHistory
     * @description retrieves a history of a currencies borrow interest rate at specific time slots
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/get-interest-history
     * @param {string} code unified currency code
     * @param {int} [since] timestamp for the earliest borrow rate
     * @param {int} [limit] the maximum number of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure} to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] 'cross' or 'isolated' default is 'cross'
     * @param {int} [params.until] the latest time in ms to fetch entries for
     * @returns {object[]} an array of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
     */
    fetchBorrowRateHistory(code: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowRateHistories(response: any, codes: any, since: any, limit: any): Dict;
    /**
     * @method
     * @name kucoin#borrowCrossMargin
     * @description create a loan to borrow margin
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/borrow
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @param {string} [params.timeInForce] either IOC or FOK
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
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
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/borrow
     * @param {string} symbol unified market symbol, required for isolated margin
     * @param {string} code unified currency code of the currency to borrow
     * @param {float} amount the amount to borrow
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @param {string} [params.timeInForce] either IOC or FOK
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
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
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/repay
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
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
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/repay
     * @param {string} symbol unified market symbol
     * @param {string} code unified currency code of the currency to repay
     * @param {float} amount the amount to repay
     * @param {object} [params] extra parameters specific to the exchange API endpoints
     * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/?id=margin-loan-structure}
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
     * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchDepositWithdrawFees(codes?: Strings, params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoin#fetchLeverage
     * @description fetch the set leverage for a market
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-cross-margin-leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name kucoin#setLeverage
     * @description set the level of leverage for a market
     * @see https://www.kucoin.com/docs-new/rest/margin-trading/debit/modify-leverage
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/modify-cross-margin-leverage
     * @param {int } [leverage] New leverage multiplier. Must be greater than 1 and up to two decimal places, and cannot be less than the user's current debt leverage or greater than the system's maximum leverage
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoin#setContractLeverage
     * @description set the level of leverage for a market
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/modify-cross-margin-leverage
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setContractLeverage(leverage: int, symbol?: Str, params?: {}): Promise<Leverage>;
    /**
     * @method
     * @name kucoin#fetchFundingInterval
     * @description fetch the current funding rate interval
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-current-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    fetchFundingInterval(symbol: string, params?: {}): Promise<FundingRate>;
    /**
     * @method
     * @name kucoin#fetchFundingRate
     * @description fetch the current funding rate
     * @see https://www.kucoin.com/docs-new/rest/ua/get-current-funding-rate
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-current-funding-rate
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true for the unified trading account (uta)
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: {}): Promise<FundingRate>;
    parseFundingRate(data: any, market?: Market): FundingRate;
    parseFundingInterval(interval: any): string;
    /**
     * @method
     * @name kucoin#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-public-funding-history
     * @see https://www.kucoin.com/docs-new/rest/ua/get-history-funding-rate
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] not used by kucuoinfutures
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end time in ms
     * @param {boolean} [params.uta] set to true for the unified trading account (uta), defaults to true
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
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
     * @name kucoin#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/funding-fees/get-private-funding-history
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<FundingHistory[]>;
    /**
     * @method
     * @name kucoin#fetchPosition
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-details
     * @description fetch data on an open position
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: {}): Promise<Position>;
    /**
     * @method
     * @name kucoin#fetchPositions
     * @description fetch all open positions
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-list
     * @param {string[]|undefined} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @method
     * @name kucoin#fetchPositionsHistory
     * @description fetches historical positions
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-positions-history
     * @param {string[]} [symbols] list of unified market symbols
     * @param {int} [since] the earliest time in ms to fetch position history for
     * @param {int} [limit] the maximum number of entries to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] closing end time
     * @param {int} [params.pageId] page id
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositionsHistory(symbols?: Strings, since?: Int, limit?: Int, params?: {}): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name kucoin#cancelOrders
     * @description cancel multiple orders for contract markets
     * @see https://www.kucoin.com/docs-new/3470241e0
     * @param {string[]} ids order ids
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [params.clientOrderIds] client order ids
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name kucoin#addMargin
     * @description add margin
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/add-isolated-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.positionSide] *required for hedged position* 'BOTH', 'LONG' or 'SHORT' (default is 'BOTH')
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: {}): Promise<MarginModification>;
    parseMarginModification(info: any, market?: Market): MarginModification;
    /**
     * @method
     * @name kucoin#fetchMarginMode
     * @description fetches the margin mode of a trading pair
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-margin-mode
     * @param {string} symbol unified symbol of the market to fetch the margin mode for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [margin mode structure]{@link https://docs.ccxt.com/?id=margin-mode-structure}
     */
    fetchMarginMode(symbol: string, params?: {}): Promise<MarginMode>;
    parseMarginMode(marginMode: Dict, market?: any): MarginMode;
    /**
     * @method
     * @name kucoin#setMarginMode
     * @description set margin mode to 'cross' or 'isolated'
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/switch-margin-mode
     * @param {string} marginMode 'cross' or 'isolated'
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoin#setPositionMode
     * @description set hedged to true or false for a market
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/switch-position-mode
     * @param {bool} hedged set to true to use two way position
     * @param {string} [symbol] not used by bybit setPositionMode ()
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a response from the exchange
     */
    setPositionMode(hedged: boolean, symbol?: Str, params?: {}): Promise<any>;
    /**
     * @method
     * @name kucoin#fetchPositionMode
     * @description fetchs the position mode, hedged or one way
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-mode
     * @param {string} [symbol] unified symbol of the market to fetch the position mode for (not used in blofin fetchPositionMode)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an object detailing whether the market is in hedged or one-way mode
     */
    fetchPositionMode(symbol?: Str, params?: {}): Promise<{
        info: import("./base/types.js").Dictionary<any>;
        hedged: boolean;
    }>;
    /**
     * @method
     * @name kucoin#closePosition
     * @description closes open positions for a market
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/orders/add-order-test
     * @param {string} symbol Unified CCXT market symbol
     * @param {string} side not used by kucoin closePositions
     * @param {object} [params] extra parameters specific to the okx api endpoint
     * @param {string} [params.clientOrderId] client order id of the order
     * @returns {object[]} [A list of position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    closePosition(symbol: string, side?: OrderSide, params?: {}): Promise<Order>;
    /**
     * @method
     * @name kucoin#fetchMarketLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes for a single market
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-isolated-margin-risk-limit
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.uta] set to true to fetch leverage tiers for unified trading account instead of futures account (default is false)
     * @returns {object} a [leverage tiers structure]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}
     */
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<LeverageTier[]>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    /**
     * @method
     * @name kucoin#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @see https://www.kucoin.com/docs-new/rest/ua/get-position-tiers
     * @param {string[]} symbols list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: {}): Promise<LeverageTiers>;
    sign(path: any, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: any;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    /**
     * @method
     * @name kucoin#fetchTransfers
     * @description fetch a history of internal transfers made on an account
     * @see https://www.kucoin.com/docs-new/rest/account-info/account-funding/get-account-ledgers-spot-margin
     * @param {string} [code] unified currency code of the currency transferred
     * @param {int} [since] the earliest time in ms to fetch transfers for
     * @param {int} [limit] the maximum number of transfer structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch transfers for
     * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
     * @returns {object[]} a list of [transfer structures]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    fetchTransfers(code?: Str, since?: Int, limit?: Int, params?: {}): Promise<TransferEntry[]>;
    /**
     * @method
     * @name kucoinfutures#fetchPositionsADLRank
     * @description fetches the auto deleveraging rank and risk percentage for a list of symbols
     * @see https://www.kucoin.com/docs-new/rest/futures-trading/positions/get-position-list
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of [auto de leverage structures]{@link https://docs.ccxt.com/?id=auto-de-leverage-structure}
     */
    fetchPositionsADLRank(symbols?: Strings, params?: {}): Promise<ADL[]>;
    parseADLRank(info: Dict, market?: Market): ADL;
}
