import Exchange from './abstract/hyperliquid.js';
import type { Account, BorrowInterest, CrossBorrowRate, CrossBorrowRates, Leverage, LeverageTier, LeverageTiers, Market, TransferEntry, Balances, Int, OrderBook, OHLCV, Str, FundingRateHistory, Order, OrderType, OrderSide, Trade, Strings, Position, OrderRequest, Dict, NullableDict, List, Num, Bool, MarginModification, Currencies, CancellationRequest, int, Transaction, Currency, CurrencyInterface, TradingFeeInterface, Ticker, Tickers, LedgerEntry, Liquidation, FundingRates, FundingRate, OpenInterests, OpenInterest, MarketInterface, Status, FundingHistory } from './base/types.js';
/**
 * @class hyperliquid
 * @augments Exchange
 */
export default class hyperliquid extends Exchange {
    describe(): Dict;
    setSandboxMode(enabled: boolean): void;
    nonce(): int;
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
    calculatePricePrecision(price: number, amountPrecision: int, maxDecimals: int): int;
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
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-predicted-funding-rates-for-different-venues
     * @param {string} [params.dex] perp dex name for hip3 markets, eg: 'xyz', inferred from the symbols if not provided
     * @param {string} [params.method] 'metaAndAssetCtxs' (default) for the current funding rates, or 'predictedFundings' for the predicted rate and time of the next funding, only available for the main dex, the predictions for other venues are in info
     * @returns {object[]} an array of objects representing market data
     */
    fetchFundingRates(symbols?: Strings, params?: Dict): Promise<FundingRates>;
    parseFundingRate(info: NullableDict, market?: Market): FundingRate;
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
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
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
    actionHash(action: any, vaultAddress: Str, nonce: any, expiresAfter?: Int): Uint8Array<ArrayBufferLike>;
    signL1Action(action: any, nonce: any, vaultAdress?: Str, expiresAfter?: Int): Dict;
    signUserSignedAction(messageTypes: Dict, message: Dict): Dict;
    buildUsdSendSig(message: Dict): Dict;
    buildUsdClassSendSig(message: Dict): Dict;
    buildSendAssetSig(message: Dict): Dict;
    buildWithdrawSig(message: Dict): Dict;
    buildUserDexAbstractionSig(message: Dict): Dict;
    buildUserAbstractionSig(message: Dict): Dict;
    buildApproveBuilderFeeSig(message: Dict): Dict;
    setRef(alreadySet?: boolean): Promise<boolean>;
    approveBuilderFee(builder: string, maxFeeRate: string): Promise<Dict>;
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
    setUserAbstraction(abstraction: string, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#enableUserDexAbstraction
     * @description If set, actions on HIP-3 perps will automatically transfer collateral from validator-operated USDC perps balance for HIP-3 DEXs where USDC is the collateral token, and spot otherwise
     * @param {boolean} enabled whether to enable user dex abstraction
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.type] 'userDexAbstraction' or 'agentEnableDexAbstraction' default is 'userDexAbstraction'
     * @returns dictionary response from the exchange
     */
    enableUserDexAbstraction(enabled: boolean, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#setAgentAbstraction
     * @description set agent abstraction mode
     * @param {string} abstraction one of the strings ["i", "u", "p"] where "i" is "disabled", "u" is "unifiedAccount", and "p" is "portfolioMargin"
     * @param {object} [params]
     * @returns dictionary response from the exchange
     */
    setAgentAbstraction(abstraction: string, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#createOrder
     * @description create a trade order
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/priority-fees
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
     * @param {int} [params.priorityFee] the order priority fee rate in units of 1e-8 (10000 = 1 bp), only for IOC orders (market orders included) or post-only orders that are not reduce-only, paid in HYPE from the undelegated staking balance
     * @param {float} [params.trailingPercent] *swap only* the percent to trail away from the best mark price, the order is sent as a native trailing stop that executes as a market order
     * @param {float} [params.trailingAmount] *swap only* the quote amount to trail away from the best mark price, the order is sent as a native trailing stop that executes as a market order
     * @param {float} [params.trailingTriggerPrice] *swap only* the mark price at which a trailing order starts tracking, tracking starts immediately if omitted
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @method
     * @ignore
     * @name hyperliquid#createTrailingStopRequest
     * @description builds the signed request of a native trailing stop order, which executes as a market order once the mark price retraces from its best level, used by createOrder when trailingPercent or trailingAmount is set
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-a-trailing-stop-order
     * @param {string} symbol unified symbol of the swap market to create an order in
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.trailingPercent] the percent to trail away from the best mark price
     * @param {float} [params.trailingAmount] the quote amount to trail away from the best mark price
     * @param {float} [params.trailingTriggerPrice] the mark price at which the order starts tracking, tracking starts immediately if omitted
     * @param {bool} [params.reduceOnly] true or false whether the order is reduce-only
     * @param {string} [params.vaultAddress] the vault address for order
     * @returns {object} the request to be sent to the exchange endpoint
     */
    createTrailingStopRequest(symbol: string, side: OrderSide, amount: number, params?: Dict): Dict;
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
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/priority-fees
     * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.priorityFee] the order priority fee rate in units of 1e-8 (10000 = 1 bp) applied to the whole request, only when every order is IOC (market orders included) or every order is post-only and not reduce-only, paid in HYPE from the undelegated staking balance
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrders(orders: OrderRequest[], params?: Dict): Promise<Order[]>;
    createOrderRequest(symbol: Str, type: Str, side: Str, amount: Str, price?: Str, params?: Dict): Dict;
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
     * @param {boolean} [params.fast] whether to send the cancel with the fast flag, rejected for trigger orders, prioritized in the mempool in a future network upgrade, (default is false)
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
     * @param {boolean} [params.fast] whether to send the cancel with the fast flag, rejected for trigger orders, prioritized in the mempool in a future network upgrade, (default is false)
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
     * @param {boolean} [params.fast] whether to send the cancel with the fast flag, rejected for trigger orders, prioritized in the mempool in a future network upgrade, (default is false)
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
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: Dict): Promise<Order>;
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
    createVault(name: string, description: string, initialUsd: int, params?: Dict): Promise<Dict>;
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
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-twap-slice-fills
     * @param {string} symbol unified market symbol
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] timestamp in ms of the latest trade
     * @param {string} [params.subAccountAddress] sub account user address
     * @param {boolean} [params.twap] set to true to fetch the fills of twap orders instead, the exchange returns the 2000 most recent ones and ignores since and until
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name hyperliquid#fetchMyLiquidations
     * @description retrieves the users liquidated positions
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills-by-time
     * @param {string} [symbol] unified CCXT market symbol
     * @param {int} [since] the earliest time in ms to fetch liquidations for
     * @param {int} [limit] the maximum number of liquidation structures to retrieve
     * @param {object} [params] exchange specific parameters
     * @param {int} [params.until] timestamp in ms of the latest liquidation
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/?id=liquidation-structure}
     */
    fetchMyLiquidations(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Liquidation[]>;
    parseLiquidation(liquidation: any, market?: Market): Liquidation;
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
     * @name hyperliquid#fetchLeverageTiers
     * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-perpetuals-metadata-universe-and-margin-tables
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/trading/margin-tiers
     * @param {string[]} [symbols] list of unified market symbols, all symbols must belong to the same dex for hip3 markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.dex] the hip3 dex to fetch the tiers from, inferred from the symbols when omitted
     * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/?id=leverage-tiers-structure}, indexed by market symbols
     */
    fetchLeverageTiers(symbols?: Strings, params?: Dict): Promise<LeverageTiers>;
    parseMarketLeverageTiers(info: any, market?: Market): LeverageTier[];
    /**
     * @method
     * @name hyperliquid#fetchLeverage
     * @description fetch the set leverage and margin mode for a swap market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/perpetuals#retrieve-users-active-asset-data
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object} a [leverage structure]{@link https://docs.ccxt.com/?id=leverage-structure}
     */
    fetchLeverage(symbol: string, params?: Dict): Promise<Leverage>;
    parseLeverage(leverage: Dict, market?: Market): Leverage;
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
    modifyMarginHelper(symbol: string, amount: Num, type: string, params?: Dict): Promise<MarginModification>;
    parseMarginModification(data: Dict, market?: Market): MarginModification;
    /**
     * @method
     * @name hyperliquid#transfer
     * @description transfer currency internally between wallets on the same account
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-from-spot-account-to-perp-account-and-vice-versa
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#transfer-between-sub-accounts
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#send-asset
     * @param {string} code unified currency code
     * @param {float} amount amount to transfer
     * @param {string} fromAccount account to transfer from *spot, swap, main or a sub-account address*
     * @param {string} toAccount account to transfer to *swap, spot, main or a sub-account address*
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.vaultAddress] spot <> swap only, moves the balance inside this vault or sub-account instead of the main account
     * @param {string} [params.type] main <> sub-account only, 'spot' moves the spot ledger instead of the perp ledger
     * @param {string} [params.method] main <> sub-account only, 'sendAsset' forces the unified-account route, 'subAccountTransfer' forces the legacy sub-account actions; defaults to sendAsset when the account abstraction is unifiedAccount
     * @param {boolean} [params.enableUnifiedMargin] main <> sub-account only, skips the abstraction lookup and states whether the account is unified
     * @param {string} [params.sourceDex] sendAsset only, perp dex to move from, '' for the default USDC perp dex or 'spot', defaults to 'spot'
     * @param {string} [params.destinationDex] sendAsset only, perp dex to move to, '' for the default USDC perp dex or 'spot', defaults to 'spot'
     * @param {string} [params.user] sendAsset only, the master wallet address, defaults to walletAddress
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
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.tag] memo / destination tag, required for currencies in options['withdrawTagRequiredCurrencies']
     * @param {string} [params.vaultAddress] vault address withdraw from
     * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/?id=transaction-structure}
     */
    withdraw(code: string, amount: number, address: string, params?: Dict): Promise<Transaction>;
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
     * @param {string} [params.dex] perp dex name for hip3 markets, eg: 'xyz', inferred from the symbols if not provided
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
    parseOpenInterest(interest: NullableDict, market?: Market): OpenInterest;
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
    fetchFundingHistory(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<FundingHistory[]>;
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
    buildApproveAgentSig(message: Dict): Dict;
    /**
     * @method
     * @name hyperliquid#approveAgent
     * @description approves an API wallet (agent) that can trade on behalf of the account but can not withdraw, the request must be signed with the private key of the main wallet, not with the one of an API wallet
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#approve-an-api-wallet
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/nonces-and-api-wallets#api-wallets
     * @param {string} agentAddress the address of the API wallet to approve
     * @param {string} [agentName] the name of the API wallet, an account has a single unnamed API wallet, which is replaced when another unnamed one is approved, and up to 3 named ones, append ' valid_until <timestamp in ms>' to the name to set an expiration of at most 180 days
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a response object
     */
    approveAgent(agentAddress: string, agentName?: Str, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#noop
     * @description sends an action that does nothing but marks the nonce as used, which invalidates a pending request sent with the same nonce, it can be a more effective way to cancel in-flight orders than a cancel
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#invalidate-pending-nonce-noop
     * @param {int} [nonce] the nonce to mark as used, a new one is generated when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.vaultAddress] the vault or sub-account address to send the action for
     * @returns {object} a response object
     */
    noop(nonce?: Int, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#claimRewards
     * @description claims the rewards earned by the account
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#claim-rewards
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a response object
     */
    claimRewards(params?: Dict): Promise<Dict>;
    /**
     * @method
     * @ignore
     * @name hyperliquid#postL1Action
     * @description signs an L1 action that has no market or order data and posts it to the exchange endpoint
     * @param {object} action the action to sign and send
     * @param {int} [nonce] the nonce to sign with, a new one is generated when omitted
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.vaultAddress] the vault or sub-account address to send the action for
     * @returns {object} a response object
     */
    postL1Action(action: Dict, nonce?: Int, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#usdSend
     * @description sends USDC from the perp balance to another address on hyperliquid, it does not go through the EVM bridge, the request must be signed with the private key of the main wallet
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-usdc-transfer
     * @param {float} amount the amount of USDC to send
     * @param {string} address the address to send to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a response object
     */
    usdSend(amount: number, address: string, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#spotSend
     * @description sends a spot asset to another address on hyperliquid, it does not go through the EVM bridge, the request must be signed with the private key of the main wallet
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#core-spot-transfer
     * @param {string} code unified currency code of the asset to send
     * @param {float} amount the amount to send
     * @param {string} address the address to send to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a response object
     */
    spotSend(code: string, amount: number, address: string, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#stakingDeposit
     * @description moves HYPE from the spot balance into the staking balance, where it can be delegated to validators or used to pay priority fees, the request must be signed with the private key of the main wallet
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#deposit-into-staking
     * @param {float} amount the amount of HYPE to move into staking
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a response object
     */
    stakingDeposit(amount: number, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#stakingWithdraw
     * @description moves HYPE from the staking balance back to the spot balance, the amount goes through a 7 day unstaking queue, the request must be signed with the private key of the main wallet
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#withdraw-from-staking
     * @param {float} amount the amount of HYPE to move out of staking
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a response object
     */
    stakingWithdraw(amount: number, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#tokenDelegate
     * @description delegates HYPE of the staking balance to a validator, or undelegates it, a delegation is locked for 1 day, the request must be signed with the private key of the main wallet
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#delegate-or-undelegate-stake-from-validator
     * @param {string} validator the address of the validator
     * @param {float} amount the amount of HYPE to delegate or undelegate
     * @param {boolean} [isUndelegate] true to undelegate, false (default) to delegate
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a response object
     */
    tokenDelegate(validator: string, amount: number, isUndelegate?: boolean, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @ignore
     * @name hyperliquid#hyperliquidChainName
     * @description the chain name that user-signed actions are signed for
     * @returns {string} 'Testnet' in sandbox mode, 'Mainnet' otherwise
     */
    hyperliquidChainName(): string;
    /**
     * @method
     * @ignore
     * @name hyperliquid#hypeToWei
     * @description converts an amount of HYPE to wei, the unit used by the staking actions, HYPE has 8 decimals
     * @param {float} amount the amount of HYPE
     * @returns {int} the amount in wei
     */
    hypeToWei(amount: number): int;
    /**
     * @method
     * @ignore
     * @name hyperliquid#postUserSignedAction
     * @description signs a user-signed action with the EIP-712 types given and posts it to the exchange endpoint
     * @param {string} actionType the type of the action
     * @param {string} primaryType the EIP-712 primary type of the message
     * @param {object[]} messageTypes the EIP-712 fields of the message
     * @param {object} message the message to sign, its fields are sent as the action
     * @param {int} nonce the nonce of the request
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a response object
     */
    postUserSignedAction(actionType: string, primaryType: string, messageTypes: List, message: Dict, nonce: int, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#fetchApprovedBuilders
     * @description fetch the addresses of the builders the user approved a builder fee for
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-approved-builders-for-user
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {string[]} a list of builder addresses
     */
    fetchApprovedBuilders(params?: Dict): Promise<List>;
    /**
     * @method
     * @name hyperliquid#fetchVaultDetails
     * @description fetch the details of a vault, its leader, description, portfolio history, apr and followers
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-details-for-a-vault
     * @param {string} vaultAddress the address of the vault
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] a user address, when provided the response includes the state of that user as a follower of the vault
     * @returns {object} the vault details as returned by the exchange
     */
    fetchVaultDetails(vaultAddress: string, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#fetchStakingDelegations
     * @description fetch the amounts of HYPE the user delegated to each validator
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-delegations
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of delegations as returned by the exchange
     */
    fetchStakingDelegations(params?: Dict): Promise<List>;
    /**
     * @method
     * @name hyperliquid#fetchStakingSummary
     * @description fetch the staking balances of the user, the undelegated amount is the one priority fees are paid from
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-summary
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object} the staking summary as returned by the exchange
     */
    fetchStakingSummary(params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name hyperliquid#fetchStakingHistory
     * @description fetch the history of the staking deposits, withdrawals, delegations and undelegations of the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-history
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of staking events as returned by the exchange
     */
    fetchStakingHistory(params?: Dict): Promise<List>;
    /**
     * @method
     * @name hyperliquid#fetchStakingRewards
     * @description fetch the staking rewards earned by the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-a-users-staking-rewards
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of staking rewards as returned by the exchange
     */
    fetchStakingRewards(params?: Dict): Promise<List>;
    /**
     * @method
     * @name hyperliquid#fetchAccounts
     * @description fetch the sub-accounts of a master account
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-subaccounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] the master account address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
     */
    fetchAccounts(params?: Dict): Promise<Account[]>;
    parseAccount(account: Dict): Account;
    /**
     * @method
     * @name hyperliquid#fetchCrossBorrowRates
     * @description fetch the borrow interest rates of all currencies of the borrow/lend protocol
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-all-borrow-lend-reserve-states
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a list of [borrow rate structures]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
     */
    fetchCrossBorrowRates(params?: Dict): Promise<CrossBorrowRates>;
    /**
     * @method
     * @name hyperliquid#fetchCrossBorrowRate
     * @description fetch the borrow interest rate of a currency of the borrow/lend protocol
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-reserve-state
     * @param {string} code unified currency code
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [borrow rate structure]{@link https://docs.ccxt.com/?id=borrow-rate-structure}
     */
    fetchCrossBorrowRate(code: string, params?: Dict): Promise<CrossBorrowRate>;
    /**
     * @method
     * @ignore
     * @name hyperliquid#tokenIndexToCurrencyCode
     * @description resolves the index of a spot token, as used by the borrow/lend endpoints, to its unified currency code
     * @param {string} tokenIndex the index of the token
     * @returns {string} the unified currency code
     */
    tokenIndexToCurrencyCode(tokenIndex: Str): Str;
    parseBorrowRate(info: any, currency?: Currency): Dict;
    /**
     * @method
     * @name hyperliquid#fetchBorrowInterest
     * @description fetch the interest owed by the user for the currencies borrowed from the borrow/lend protocol
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-borrow-lend-user-state
     * @param {string} [code] unified currency code
     * @param {string} [symbol] not used by hyperliquid fetchBorrowInterest
     * @param {int} [since] not used by hyperliquid fetchBorrowInterest, the exchange returns the current state only
     * @param {int} [limit] the maximum number of structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] user address, will default to this.walletAddress if not provided
     * @returns {object[]} a list of [borrow interest structures]{@link https://docs.ccxt.com/?id=borrow-interest-structure}
     */
    fetchBorrowInterest(code?: Str, symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<BorrowInterest[]>;
    parseBorrowInterest(info: Dict, market?: Market): BorrowInterest;
    /**
     * @method
     * @name hyperliquid#createSubAccount
     * @description creates a sub-account under the main account
     * @param {string} name the name of the sub-account
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.expiresAfter] time in ms after which the sub-account will expire
     * @returns {object} a response object
     */
    createSubAccount(name: string, params?: Dict): Promise<Dict>;
    extractTypeFromDelta(data: Dict[]): Dict[];
    formatVaultAddress(address?: Str): Str;
    handlePublicAddress(methodName: string, params: Dict): [Str, Dict];
    coinToMarketId(coin: Str): Str;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: NullableDict, requestBody: Str): Bool;
    sign(path: string, api?: string[], method?: string, params?: Dict): Dict;
    calculateRateLimiterCost(api: string[], method: string, path: string, params: Dict, config?: Dict): any;
    parseCreateEditOrderArgs(id: Str, symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): [Dict, Dict];
    /**
     * @ignore
     * @method
     * @description narrows an info endpoint response for a request type that answers with a JSON array
     * @param {object|object[]|string} response the info endpoint response
     * @returns {object[]} the response array, or an empty array for any other response
     */
    infoList(response: Dict | List | string): Dict[];
}
