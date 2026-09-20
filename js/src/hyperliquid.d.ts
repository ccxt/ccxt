import Exchange from './abstract/hyperliquid.js';
import type { Market, TransferEntry, Balances, Int, OrderBook, OHLCV, Str, FundingRateHistory, Order, OrderType, OrderSide, Trade, Strings, Position, OrderRequest, Dict, NullableDict, List, Num, Bool, MarginModification, Currencies, CancellationRequest, int, Transaction, Currency, CurrencyInterface, TradingFeeInterface, Ticker, Tickers, LedgerEntry, FundingRates, FundingRate, OpenInterests, OpenInterest, MarketInterface, Status } from './base/types.js';
/**
 * @class hyperliquid
 * @augments Exchange
 */
export default class hyperliquid extends Exchange {
    describe(): any;
    setSandboxMode(enabled: boolean): void;
    nonce(): number;
    market(symbol: Str): MarketInterface;
    /**
     * @method
     * @name hyperliquid#fetchStatus
     * @description the latest known information on the availability of the exchange API
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    fetchStatus(params?: Dict): Promise<Status>;
    /**
     * @method
     * @name hyperliquid#fetchTime
     * @description fetches the current integer timestamp in milliseconds from the exchange server
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int} the current integer timestamp in milliseconds from the exchange server
     */
    fetchTime(params?: Dict): Promise<Int>;
    /**
     * @method
     * @name hyperliquid#fetchCurrencies
     * @description fetches all available currencies on an exchange
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an associative dictionary of currencies
     */
    fetchCurrencies(params?: Dict): Promise<Currencies>;
    parseCurrency(rawCurrency: Dict): CurrencyInterface;
    /**
     * @method
     * @name hyperliquid#fetchMarkets
     * @description retrieves data on all markets for hyperliquid
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: Dict): Promise<Market[]>;
    /**
     * @method
     * @name hyperliquid#fetchHip3Markets
     * @description retrieves data on all hip3 markets for hyperliquid
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-all-perpetual-dexs
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchHip3Markets(params?: Dict): Promise<Market[]>;
    /**
     * @method
     * @name hyperliquid#fetchSwapMarkets
     * @description retrieves data on all swap markets for hyperliquid
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchSwapMarkets(params?: Dict): Promise<Market[]>;
    /**
     * @method
     * @name hyperliquid#calculatePricePrecision
     * @description Helper function to calculate the Hyperliquid DECIMAL_PLACES price precision
     * @param {float} price the price to use in the calculation
     * @param {int} amountPrecision the amountPrecision to use in the calculation
     * @param {int} maxDecimals the maxDecimals to use in the calculation
     * @returns {int} The calculated price precision
     */
    calculatePricePrecision(price: number, amountPrecision: number, maxDecimals: number): number;
    /**
     * @method
     * @name hyperliquid#fetchSpotMarkets
     * @description retrieves data on all spot markets for hyperliquid
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchSpotMarkets(params?: Dict): Promise<Market[]>;
    parseMarket(market: Dict): Market;
    updateSpotCurrencyCode(code: Str): Str;
    /**
     * @method
     * @name hyperliquid#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @param {string} [params.type] wallet type, ['spot', 'swap'], defaults to swap
     * @param {string} [params.marginMode] 'cross' or 'isolated', for margin trading, uses this.options.defaultMarginMode if not passed, defaults to undefined/None/null
     * @param {string} [params.dex] for hip3 markets, the dex name, eg: 'xyz'
     * @param {string} [params.subAccountAddress] sub account user address
     * @param {boolean} [params.enableUnifiedMargin] enable unified margin, CCXT tries to auto-detects this value but you can override it
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: Dict): Promise<Balances>;
    /**
     * @method
     * @name hyperliquid#fetchOrderBook
     * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
     * @param {string} symbol unified symbol of the market to fetch the order book for
     * @param {int} [limit] the maximum amount of order book entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure]{@link https://docs.ccxt.com/?id=order-book-structure}
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: Dict): Promise<OrderBook>;
    /**
     * @method
     * @name hyperliquid#fetchTickers
     * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-spot-asset-contexts
     * @param {string[]} [symbols] unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'spot' or 'swap', by default fetches both
     * @param {boolean} [params.hip3] set to true to fetch hip3 markets only
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name hyperliquid#fetchFundingRate
     * @description fetch the current funding rate for a symbol - hyperliquid only offers a bulk endpoint, so this filters the result of fetchFundingRates
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
     */
    fetchFundingRate(symbol: string, params?: Dict): Promise<FundingRate>;
    /**
     * @method
     * @name hyperliquid#fetchFundingRates
     * @description retrieves data on all swap markets for hyperliquid
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-asset-contexts-includes-mark-price-current-funding-open-interest-etc
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchFundingRates(symbols?: Strings, params?: Dict): Promise<FundingRates>;
    parseFundingRate(info: any, market?: Market): FundingRate;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name hyperliquid#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents, support '1m', '15m', '1h', '1d'
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest candle to fetch
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    parseOHLCV(ohlcv: Dict, market?: Market): OHLCV;
    /**
     * @method
     * @name hyperliquid#fetchTrades
     * @description get the list of most recent trades for a particular symbol
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade
     * @param {string} [params.address] wallet address that made trades
     * @param {string} [params.user] wallet address that made trades
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    amountToPrecision(symbol: Str, amount: any): string;
    priceToPrecision(symbol: Str, price: any): Str;
    hashMessage(message: any): string;
    signHash(hash: string, privateKey: string): Dict;
    signMessage(message: any, privateKey: string): Dict;
    constructPhantomAgent(hash: any, isTestnet?: boolean): Dict;
    actionHash(action: any, vaultAddress: any, nonce: any, expiresAfter?: Int): string;
    signL1Action(action: any, nonce: any, vaultAdress?: Str, expiresAfter?: Int): object;
    signUserSignedAction(messageTypes: Dict, message: Dict): Dict;
    buildUsdSendSig(message: Dict): Dict;
    buildUsdClassSendSig(message: Dict): Dict;
    buildWithdrawSig(message: Dict): Dict;
    buildUserDexAbstractionSig(message: Dict): Dict;
    buildUserAbstractionSig(message: Dict): Dict;
    buildApproveBuilderFeeSig(message: Dict): Dict;
    setRef(): Promise<any>;
    approveBuilderFee(builder: string, maxFeeRate: string): Promise<any>;
    initializeClient(): Promise<boolean>;
    handleBuilderFeeApproval(): Promise<boolean>;
    /**
     * @method
     * @name hyperliquid#isUnifiedEnabled
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-abstraction-state
     * @description returns enableUnifiedMargin so the user can check if unified account is enabled
     * @param {string} method the method for which we want to check if unified margin is enabled, this is used to check options for specific methods (e.g. fetchBalance can have a specific option to enable unified margin)
     * @param {string} [address] the wallet address to query; defaults to the configured walletAddress
     * @param {boolean} [shouldRefresh] force a fresh request instead of returning the cached value
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {bool} enableUnifiedMargin
     */
    isUnifiedEnabled(method: string, address?: Str, shouldRefresh?: boolean, params?: Dict): Promise<[Bool, Dict]>;
    /**
     * @method
     * @name hyperliquid#setUserAbstraction
     * @description set user abstraction mode
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#set-user-abstraction
     * @param {string} abstraction one of the strings ["disabled", "unifiedAccount", "portfolioMargin"],
     * @param {object} [params]
     * @param {string} [params.type] 'userSetAbstraction' or 'agentSetAbstraction' default is 'userSetAbstraction'
     * @returns dictionary response from the exchange
     */
    setUserAbstraction(abstraction: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name hyperliquid#enableUserDexAbstraction
     * @description If set, actions on HIP-3 perps will automatically transfer collateral from validator-operated USDC perps balance for HIP-3 DEXs where USDC is the collateral token, and spot otherwise
     * @param {boolean} enabled whether to enable user dex abstraction
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'userDexAbstraction' or 'agentEnableDexAbstraction' default is 'userDexAbstraction'
     * @returns dictionary response from the exchange
     */
    enableUserDexAbstraction(enabled: boolean, params?: Dict): Promise<any>;
    /**
     * @method
     * @name hyperliquid#setAgentAbstraction
     * @description set agent abstraction mode
     * @param {string} abstraction one of the strings ["i", "u", "p"] where "i" is "disabled", "u" is "unifiedAccount", and "p" is "portfolioMargin"
     * @param {object} [params]
     * @returns dictionary response from the exchange
     */
    setAgentAbstraction(abstraction: string, params?: Dict): Promise<any>;
    /**
     * @method
     * @name hyperliquid#createOrder
     * @description create a trade order
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] 'Gtc', 'Ioc', 'Alo'
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {string} [params.clientOrderId] client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
     * @param {string} [params.slippage] the slippage for market order
     * @param {string} [params.vaultAddress] the vault address for order
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name hyperliquid#createTwapOrder
     * @description create a trade order that is executed as a TWAP order over a specified duration.
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {int} duration the duration of the TWAP order in milliseconds
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {bool} [params.randomize] whether to randomize the time intervals of the TWAP order slices (default is false, meaning equal intervals)
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {int} [params.expiresAfter] time in ms after which the twap order expires
     * @param {string} [params.vaultAddress] the vault address for order
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createTwapOrder(symbol: string, side: OrderSide, amount: number, duration: number, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name hyperliquid#createOrders
     * @description create a list of trade orders
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: Dict): Promise<Order[]>;
    createOrderRequest(symbol: Str, type: Str, side: Str, amount: string, price?: Str, params?: Dict): Dict;
    createOrdersRequest(orders: List, params?: Dict): Dict;
    /**
     * @method
     * @name hyperliquid#cancelOrder
     * @description cancels an open order
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
     * @param {string} [params.vaultAddress] the vault address for order
     * @param {string} [params.subAccountAddress] sub account user address
     * @param {boolean} [params.twap] whether the order to cancel is a twap order, (default is false)
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name hyperliquid#cancelOrders
     * @description cancel multiple orders
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string|string[]} [params.clientOrderId] client order ids, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
     * @param {string} [params.vaultAddress] the vault address
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrders(ids: string[], symbol?: Str, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name hyperliquid#cancelTwapOrder
     * @description cancels a running twap order
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-a-twap-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.expiresAfter] time in ms after which the twap order expires
     * @param {string} [params.vaultAddress] the vault address for order
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelTwapOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    cancelOrdersRequest(ids: string[], symbol?: Str, params?: Dict): Dict;
    /**
     * @method
     * @name hyperliquid#cancelOrdersForSymbols
     * @description cancel multiple orders for multiple symbols
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s-by-cloid
     * @param {CancellationRequest[]} orders each order should contain the parameters required by cancelOrder namely id and symbol, example [{"id": "a", "symbol": "BTC/USDT"}, {"id": "b", "symbol": "ETH/USDT"}]
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.vaultAddress] the vault address
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} an list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrdersForSymbols(orders: CancellationRequest[], params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name hyperliquid#cancelAllOrdersAfter
     * @description dead man's switch, cancel all orders after the given timeout
     * @param {number} timeout time in milliseconds, 0 represents cancel the timer
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.vaultAddress] the vault address
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} the api result
     */
    cancelAllOrdersAfter(timeout: Int, params?: Dict): Promise<Dict>;
    editOrdersRequest(orders: List, params?: Dict): Dict;
    /**
     * @method
     * @name hyperliquid#editOrder
     * @description edit a trade order
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
     * @param {string} id cancel order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] 'Gtc', 'Ioc', 'Alo'
     * @param {bool} [params.postOnly] true or false whether the order is post-only
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {float} [params.triggerPrice] The price at which a trigger order is triggered at
     * @param {string} [params.clientOrderId] client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
     * @param {string} [params.vaultAddress] the vault address for order
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: string, side: string, amount?: Num, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name hyperliquid#editOrders
     * @description edit a list of trade orders
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#modify-multiple-orders
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrders(orders: OrderRequest[], params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name hyperliquid#createVault
     * @description creates a value
     * @param {string} name The name of the vault
     * @param {string} description The description of the vault
     * @param {number} initialUsd The initialUsd of the vault
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the api result
     */
    createVault(name: string, description: string, initialUsd: int, params?: Dict): Promise<any>;
    /**
     * @method
     * @name hyperliquid#fetchFundingRateHistory
     * @description fetches historical funding rate prices
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-historical-funding-rates
     * @param {string} symbol unified symbol of the market to fetch the funding rate history for
     * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
     * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure} to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest funding rate
     * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/?id=funding-rate-history-structure}
     */
    fetchFundingRateHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<FundingRateHistory[]>;
    getDexFromHip3Symbol(market: Market): Str;
    /**
     * @method
     * @name hyperliquid#fetchOpenOrders
     * @description fetch all unfilled currently open orders
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @param {string} [params.method] 'openOrders' or 'frontendOpenOrders' default is 'frontendOpenOrders'
     * @param {string} [params.subAccountAddress] sub account user address
     * @param {string} [params.dex] perp dex name. default is null
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name hyperliquid#fetchClosedOrders
     * @description fetch all unfilled currently closed orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name hyperliquid#fetchCanceledOrders
     * @description fetch all canceled orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name hyperliquid#fetchCanceledAndClosedOrders
     * @description fetch all closed and canceled orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name hyperliquid#fetchOrders
     * @description fetch all orders
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open orders structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @param {string} [params.subAccountAddress] sub account user address
     * @param {string} [params.dex] perp dex name. default is null
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name hyperliquid#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] client order id, (optional 128 bit hex string e.g. 0x1234567890abcdef1234567890abcdef)
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} An [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): Str;
    parseOrderType(status: Str): Str;
    /**
     * @method
     * @name hyperliquid#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name hyperliquid#fetchPosition
     * @description fetch data on an open position
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
     * @param {string} symbol unified market symbol of the market the position is held in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object} a [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPosition(symbol: string, params?: Dict): Promise<Position>;
    getDexFromSymbols(methodName: string, symbols?: Strings): Str;
    /**
     * @method
     * @name hyperliquid#fetchPositions
     * @description fetch all open positions
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-perpetuals-account-summary
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @param {string} [params.subAccountAddress] sub account user address
     * @param {string} [params.dex] perp dex name, eg: XYZ
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: Dict): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    /**
     * @method
     * @name hyperliquid#setMarginMode
     * @description set margin mode (symbol)
     * @param {string} marginMode margin mode must be either [isolated, cross]
     * @param {string} symbol unified market symbol of the market the position is held in, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.leverage] the rate of leverage, is required if setting trade mode (symbol)
     * @param {string} [params.vaultAddress] the vault address
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} response from the exchange
     */
    setMarginMode(marginMode: string, symbol?: Str, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#setLeverage
     * @description set the level of leverage for a market
     * @param {float} leverage the rate of leverage
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.marginMode] margin mode must be either [isolated, cross], default is cross
     * @returns {object} response from the exchange
     */
    setLeverage(leverage: int, symbol?: Str, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#addMargin
     * @description add margin
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
     * @param {string} symbol unified market symbol
     * @param {float} amount amount of margin to add
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.vaultAddress] the vault address
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    addMargin(symbol: string, amount: number, params?: Dict): Promise<MarginModification>;
    /**
     * @method
     * @name hyperliquid#reduceMargin
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#update-isolated-margin
     * @description remove margin from a position
     * @param {string} symbol unified market symbol
     * @param {float} amount the amount of margin to remove
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.vaultAddress] the vault address
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} a [margin structure]{@link https://docs.ccxt.com/?id=margin-structure}
     */
    reduceMargin(symbol: string, amount: number, params?: Dict): Promise<MarginModification>;
    modifyMarginHelper(symbol: string, amount: any, type: any, params?: Dict): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name hyperliquid#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#l1-usdc-transfer
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from *spot, swap*
     * @param {string} toAccount account to transfer to *swap, spot or address*
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.vaultAddress] the vault address for order
     * @returns {object} a [transfer structure]{@link https://docs.ccxt.com/?id=transfer-structure}
     */
    transfer(code: string, amount: number, fromAccount: string, toAccount: string, params?: Dict): Promise<TransferEntry>;
    parseTransfer(transfer: Dict, currency?: Currency): TransferEntry;
    /**
     * @method
     * @name hyperliquid#withdraw
     * @description make a withdrawal (only support USDC)
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#initiate-a-withdrawal-request
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-or-withdraw-from-a-vault
     * @param {string} code unified currency code
     * @param {float} amount the amount to withdraw
     * @param {string} address the address to withdraw to
     * @param {string} tag
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.vaultAddress] vault address withdraw from
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, tag?: Str, params?: Dict): Promise<Transaction>;
    parseTransaction(transaction: Dict, currency?: Currency): Transaction;
    /**
     * @method
     * @name hyperliquid#fetchTradingFee
     * @description fetch the trading fees for a market
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} a [fee structure]{@link https://docs.ccxt.com/?id=fee-structure}
     */
    fetchTradingFee(symbol: string, params?: Dict): Promise<TradingFeeInterface>;
    parseTradingFee(fee: Dict, market?: Market): TradingFeeInterface;
    /**
     * @method
     * @name hyperliquid#fetchLedger
     * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
     * @param {string} [code] unified currency code
     * @param {int} [since] timestamp in ms of the earliest ledger entry
     * @param {int} [limit] max number of ledger entries to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest ledger entry
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/?id=ledger-entry-structure}
     */
    fetchLedger(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<LedgerEntry[]>;
    parseLedgerEntry(item: Dict, currency?: Currency): LedgerEntry;
    parseLedgerEntryType(type: Str): Str;
    /**
     * @method
     * @name hyperliquid#fetchDeposits
     * @description fetch all deposits made to an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch deposits for
     * @param {int} [limit] the maximum number of deposits structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch withdrawals for
     * @param {string} [params.subAccountAddress] sub account user address
     * @param {string} [params.vaultAddress] vault address
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchDeposits(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Transaction[]>;
    /**
     * @method
     * @name hyperliquid#fetchWithdrawals
     * @description fetch all withdrawals made from an account
     * @param {string} code unified currency code
     * @param {int} [since] the earliest time in ms to fetch withdrawals for
     * @param {int} [limit] the maximum number of withdrawals structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] the latest time in ms to fetch withdrawals for
     * @param {string} [params.subAccountAddress] sub account user address
     * @param {string} [params.vaultAddress] vault address
     * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    fetchWithdrawals(code?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Transaction[]>;
    /**
     * @method
     * @name hyperliquid#fetchOpenInterests
     * @description Retrieves the open interest for a list of symbols
     * @param {string[]} [symbols] Unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an open interest structure{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterests(symbols?: Strings, params?: Dict): Promise<OpenInterests>;
    /**
     * @method
     * @name hyperliquid#fetchOpenInterest
     * @description retrieves the open interest of a contract trading pair
     * @param {string} symbol unified CCXT market symbol
     * @param {object} [params] exchange specific parameters
     * @returns {object} an [open interest structure]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterest(symbol: string, params?: Dict): Promise<OpenInterest>;
    parseOpenInterest(interest: Dict, market?: Market): OpenInterest;
    /**
     * @method
     * @name hyperliquid#fetchFundingHistory
     * @description fetch the history of funding payments paid and received on this account
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch funding history for
     * @param {int} [limit] the maximum number of funding history structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.subAccountAddress] sub account user address
     * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/?id=funding-history-structure}
     */
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<import("./base/types.js").FundingHistory[]>;
    parseIncome(income: Dict, market?: Market): Dict;
    /**
     * @method
     * @name hyperliquid#reserveRequestWeight
     * @description Instead of trading to increase the address based rate limits, this action allows reserving additional actions for 0.0005 USDC per request. The cost is paid from the Perps balance.
     * @param {number} weight the weight to reserve, 1 weight = 1 action, 0.0005 USDC per action
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a response object
     */
    reserveRequestWeight(weight: Num, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#createAccount
     * @description creates a sub-account under the main account
     * @param {string} name the name of the sub-account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.expiresAfter] time in ms after which the sub-account will expire
     * @returns {object} a response object
     */
    createSubAccount(name: string, params?: Dict): Promise<Dict>;
    extractTypeFromDelta(data?: Dict[]): Dict[];
    formatVaultAddress(address?: Str): Str;
    handlePublicAddress(methodName: string, params: Dict): [Str, Dict];
    coinToMarketId(coin: Str): Str;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
    sign(path: any, api?: any, method?: string, params?: Dict, headers?: NullableDict, body?: Str): Dict;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
    parseCreateEditOrderArgs(id: Str, symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): [Dict, Dict];
}
