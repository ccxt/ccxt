import Exchange from './abstract/interactivebrokers.js';
import type { Account, Balances, Dict, Int, LastPrice, LastPrices, List, Market, Num, NullableDict, OHLCV, OpenInterest, OpenInterests, Order, OrderSide, OrderType, Position, Status, Str, Strings, Ticker, Tickers, Trade, int } from './base/types.js';
/**
 * @class interactivebrokers
 * @augments Exchange
 */
export default class interactivebrokers extends Exchange {
    describe(): Dict;
    /**
     * @method
     * @name interactivebrokers#signIn
     * @description obtains a live session token via the oauth 1.0a diffie-hellman exchange and opens the brokerage session, must be called prior to using other authenticated methods (called automatically by authenticate)
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/authentication/oauth-1-0-a/req-live-session-token
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-session/initialize-session
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} response from the exchange
     */
    signIn(params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name interactivebrokers#authenticate
     * @description signs in when there is no live session token yet or the current one is about to expire
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {string} the live session token
     */
    authenticate(params?: Dict): Promise<Str>;
    /**
     * @method
     * @name interactivebrokers#ibkrIsAuthenticated
     * @description true when the current session can be used without signing in again, with options.useGateway the gateway session was confirmed authenticated within options.gatewayAuthCheckInterval ms, otherwise the oauth live session token is fresh
     * @ignore
     * @returns {boolean} whether the current session can be used
     */
    ibkrIsAuthenticated(): boolean;
    /**
     * @method
     * @name interactivebrokers#ibkrGatewaySignIn
     * @description checks that the client portal gateway session is authenticated (taking the brokerage session back via ssodh/init options.autoRegainSession seconds after it was lost), loads the trading accounts and starts the keep-alive loop
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-session/get-brokerage-status
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-session/initialize-session
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the iserver/auth/status response
     */
    ibkrGatewaySignIn(params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name interactivebrokers#ibkrGatewayRegainSession
     * @description opens the brokerage session of the client portal gateway with POST iserver/auth/ssodh/init (taking it over from any other login with the same username) and polls iserver/auth/status until it is authenticated
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-session/initialize-session
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the last iserver/auth/status response
     */
    ibkrGatewayRegainSession(params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name interactivebrokers#ibkrGatewayRegainDelay
     * @description options.autoRegainSession in milliseconds, 0 when the lost brokerage session must not be taken back
     * @ignore
     * @returns {int} the delay in milliseconds
     */
    ibkrGatewayRegainDelay(): int;
    /**
     * @method
     * @name interactivebrokers#ibkrGatewayOnSessionLost
     * @description marks the brokerage session as lost and schedules taking it back, see options.autoRegainSession
     * @ignore
     * @returns {int} the timestamp when the session was found lost
     */
    ibkrGatewayOnSessionLost(): int;
    /**
     * @method
     * @name interactivebrokers#ibkrGatewayScheduleRegain
     * @description schedules taking the lost brokerage session back options.autoRegainSession seconds after it was lost, so it is regained even when no private calls are made, the synchronous python and php versions take it back on the next private call instead
     * @ignore
     * @returns {boolean} true if it was scheduled
     */
    ibkrGatewayScheduleRegain(): boolean;
    /**
     * @method
     * @name interactivebrokers#ibkrGatewayRegainLoop
     * @description takes the lost brokerage session back, rescheduled every options.autoRegainSession seconds until it succeeds, stops when it is set to 0 or the instance is closed
     * @ignore
     * @returns {undefined}
     */
    ibkrGatewayRegainLoop(): Promise<any>;
    /**
     * @method
     * @name interactivebrokers#ibkrGatewayStartKeepAlive
     * @description schedules the keep-alive loop once, see options.gatewayKeepAlive
     * @ignore
     * @returns {boolean} true if the loop is running
     */
    ibkrGatewayStartKeepAlive(): boolean;
    /**
     * @method
     * @name interactivebrokers#ibkrGatewayKeepAlive
     * @description keeps the client portal gateway session alive with POST /tickle every options.gatewayKeepAliveInterval ms and tracks its authentication status, stops when options.gatewayKeepAlive is set to false or the instance is closed
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-session/get-session-token
     * @returns {undefined}
     */
    ibkrGatewayKeepAlive(): Promise<any>;
    /**
     * @method
     * @name interactivebrokers#ibkrHasFreshSessionToken
     * @description true when a live session token is set and is not about to expire
     * @ignore
     * @returns {boolean} whether the current live session token can be used
     */
    ibkrHasFreshSessionToken(): boolean;
    /**
     * @method
     * @name interactivebrokers#loadAccountId
     * @description returns the account id from params, options, or the first account returned by fetchAccounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id to use
     * @returns {Array} the account id and the params without accountId
     */
    loadAccountId(params?: Dict): Promise<List>;
    /**
     * @method
     * @name interactivebrokers#fetchBalance
     * @description query for balance and get the amount of funds available for trading or funds locked in orders, the cash comes from the ledger, the crypto holdings from the positions and the locked ('used') amounts from the open orders of the current brokerage session
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-portfolio-ledger
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-uncached-positions
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"] or the selected account
     * @param {boolean} [params.positions] add the holdings of options.fetchBalance.positionAssetClasses (crypto by default) as balances, default true
     * @param {boolean} [params.openOrders] compute the locked ('used') amounts from the open orders, default true
     * @returns {object} a [balance structure]{@link https://docs.ccxt.com/?id=balance-structure}
     */
    fetchBalance(params?: Dict): Promise<Balances>;
    parseBalance(response: any): Balances;
    /**
     * @method
     * @name interactivebrokers#ibkrBalanceCode
     * @description resolves the currency code of a position held as a balance, BTC for the BTC crypto, AAPL for the AAPL shares
     * @ignore
     * @param {object} position a raw position from portfolio2/{accountId}/positions
     * @returns {string|undefined} the currency code
     */
    ibkrBalanceCode(position: Dict): Str;
    /**
     * @method
     * @name interactivebrokers#beforeClose
     * @description stops the client portal gateway keep-alive and session-regain loops when close () is called, otherwise the scheduled tickles keep the event loop alive after close ()
     * @ignore
     * @returns {undefined}
     */
    beforeClose(): any;
    loadMarkets(reload?: boolean, params?: Dict): Promise<import("./base/types.js").Dictionary<Market>>;
    /**
     * @method
     * @name interactivebrokers#fetchMarkets
     * @description retrieves data on the market types of options.fetchMarkets.types: stocks of options.fetchMarkets.exchanges.STK, crypto of options.fetchMarkets.cryptoSpotSymbols, fx pairs of options.fetchMarkets.forexCurrencies, coinbase derivatives perp-style futures discovered with the market scanner (as swap, e.g. BTC/USD:USD), dated coinbase derivatives futures (scanned) and CME and CFE crypto futures of options.fetchMarkets.cryptoCmeFutureSymbols (as future, e.g. BTC/USD:USD-261127) and cfds of options.fetchMarkets.cfdExchanges (as swap, e.g. AAPL/USD:USD), bonds of options.fetchMarkets.bondSymbols are loaded only with 'bond' in options.fetchMarkets.types (as spot, e.g. US-T-4.125-270131.SMART/USD), the market id is the IBKR conid
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-conids-by-exchange
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-bond-filters
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-info-and-rules
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-future-by-symbol
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#scanner-run
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-contract-symbols-from-body
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-currency-pairs
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-instrument-definition
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: Dict): Promise<Market[]>;
    /**
     * @method
     * @name interactivebrokers#ibkrDisambiguateContractSymbols
     * @description gives a unique symbol to the contract markets that share a symbol with an earlier market, e.g. the GRAYSCALE BITCOIN MINI ETF CFD (ticker BTC) and the BTC perp-style future both map to BTC/USD:USD, the cfd becomes BTC.IBUSCFD/USD:USD
     * @ignore
     * @param {object[]} markets parsed markets
     * @returns {object[]} the markets with unique symbols
     */
    ibkrDisambiguateContractSymbols(markets: Market[]): Market[];
    fetchSecWithDetails(plainEntries: Dict): Promise<Dict[]>;
    fetchForexMarkets(params?: Dict): Promise<Market[]>;
    fetchCryptoMarkets(params?: Dict): Promise<Market[]>;
    /**
     * @method
     * @name interactivebrokers#fetchCoinbaseDerivativesSymbols
     * @description discovers the coinbase derivatives (COINDERIV) futures symbols with the market scanner, the MOST_ACTIVE scan misses the contracts that have not traded yet, so it is merged with the NOT_YET_TRADED_TODAY scan
     * @ignore
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#scanner-run
     * @returns {string[]} the unique IBKR symbols, e.g. [ 'BIP', 'ETP', 'BIT', ... ]
     */
    fetchCoinbaseDerivativesSymbols(): Promise<string[]>;
    /**
     * @method
     * @name interactivebrokers#fetchFuturesAndSwapMarkets
     * @description retrieves the coinbase derivatives (COINDERIV) perp-style futures (as swaps) and dated futures, whose symbols are discovered with the market scanner, together with the CME and CFE dated crypto futures of options.fetchMarkets.cryptoCmeFutureSymbols, the swaps are kept with 'swap' in options.fetchMarkets.types and the futures with 'future'
     * @ignore
     * @see https://www.interactivebrokers.com/campus/ibkr-api-page/cpapi-v1/#scanner-run
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-future-by-symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchFuturesAndSwapMarkets(params?: Dict): Promise<Market[]>;
    /**
     * @method
     * @name interactivebrokers#fetchCfdMarkets
     * @description retrieves the cfd contracts listed on options.fetchMarkets.cfdExchanges
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-conids-by-exchange
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchCfdMarkets(params?: Dict): Promise<Market[]>;
    /**
     * @method
     * @name interactivebrokers#fetchBondMarkets
     * @description retrieves the bonds of the issuers of options.fetchMarkets.bondSymbols, narrowed by options.fetchMarkets.bondFilters
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-contract-symbols-from-body
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-bond-filters
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-info-and-rules
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} an array of objects representing market data
     */
    fetchBondMarkets(params?: Dict): Promise<Market[]>;
    fetchStockMarkets(params?: Dict): Promise<Market[]>;
    marketsEndpointCall(request: Dict, ep: string, defaultValue?: any): Promise<any>;
    parseMarket(market: Dict): Market;
    /**
     * @method
     * @name interactivebrokers#fetchTickers
     * @description fetches price tickers for multiple markets, the first snapshot request only subscribes to the market data, so the request is retried until data arrives
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-snapshot
     * @param {string[]} symbols unified symbols of the markets to fetch the ticker for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.fields] comma-separated snapshot field ids, max 50
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchTickers(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name interactivebrokers#ibkrFetchSnapshot
     * @description fetches a market data snapshot, the first snapshot request only subscribes to the market data, so the request is retried until data arrives
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-snapshot
     * @param {string[]} symbols unified market symbols
     * @param {string} fields comma-separated snapshot field ids
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string[]} [readyFields] the snapshot is ready once every item has at least one of these fields, default [ '31', '84', '86' ]
     * @returns {object[]} the raw snapshot items
     */
    ibkrFetchSnapshot(symbols: string[], fields: string, params?: Dict, readyFields?: Strings): Promise<List>;
    ibkrSnapshotReady(response: List, readyFields?: Strings): boolean;
    /**
     * @method
     * @name interactivebrokers#fetchBidsAsks
     * @description fetches the bid and ask price and volume for multiple markets
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-snapshot
     * @param {string[]} symbols unified symbols of the markets to fetch the bids and asks for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.fields] comma-separated snapshot field ids, default '84,85,86,88'
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchBidsAsks(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name interactivebrokers#fetchLastPrices
     * @description fetches the last price for multiple markets
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-snapshot
     * @param {string[]} symbols unified symbols of the markets to fetch the last prices for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [last price structures]{@link https://docs.ccxt.com/?id=last-price-structure}
     */
    fetchLastPrices(symbols?: Strings, params?: Dict): Promise<LastPrices>;
    parseLastPrice(entry: Dict, market?: Market): LastPrice;
    /**
     * @method
     * @name interactivebrokers#fetchMarkPrices
     * @description fetches the mark price for multiple markets
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-snapshot
     * @param {string[]} symbols unified symbols of the markets to fetch the mark prices for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/?id=ticker-structure}
     */
    fetchMarkPrices(symbols?: Strings, params?: Dict): Promise<Tickers>;
    /**
     * @method
     * @name interactivebrokers#fetchOpenInterests
     * @description retrieves the open interest of multiple futures or swap markets
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-snapshot
     * @param {string[]} symbols unified symbols of the markets to fetch the open interest for
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [open interest structures]{@link https://docs.ccxt.com/?id=open-interest-structure}
     */
    fetchOpenInterests(symbols?: Strings, params?: Dict): Promise<OpenInterests>;
    parseOpenInterest(interest: NullableDict, market?: Market): OpenInterest;
    /**
     * @method
     * @name interactivebrokers#fetchStatus
     * @description the status of the brokerage session, 'ok' when authenticated and connected
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-session/get-brokerage-status
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [status structure]{@link https://docs.ccxt.com/?id=exchange-status-structure}
     */
    fetchStatus(params?: Dict): Promise<Status>;
    ibkrParseValue(value: Str): Str;
    parseTicker(ticker: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name interactivebrokers#fetchOHLCV
     * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-market-data/get-md-history
     * @param {string} symbol unified symbol of the market to fetch OHLCV data for
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum amount of candles to fetch, max 1000
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {boolean} [params.outsideRth] include data outside regular trading hours
     * @param {string} [params.source] 'Last', 'Bid_Ask' or 'Midpoint'
     * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: Dict): Promise<OHLCV[]>;
    ibkrPeriod(duration: int, limit: int): string;
    ibkrFormatTime(timestamp: int): string;
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name interactivebrokers#fetchAccounts
     * @description fetch all the accounts associated with a profile
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-all-accounts
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'privateGetPortfolioAccounts' (default) or 'privateGetPortfolioSubaccounts'
     * @returns {object[]} a list of [account structures]{@link https://docs.ccxt.com/?id=account-structure}
     */
    fetchAccounts(params?: Dict): Promise<Account[]>;
    parseAccount(account: Dict): Account;
    /**
     * @method
     * @name interactivebrokers#fetchServiceAccounts
     * @description fetch the accounts the user has trading access to, must be called before modifying an order or querying open orders
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-accounts/get-brokerage-accounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw response from the exchange
     */
    fetchServiceAccounts(params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name interactivebrokers#fetchPortfolioAccounts
     * @description fetch the accounts for which the user can view position and account information
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-all-accounts
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-all-subaccounts
     * @ignore
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.method] 'privateGetPortfolioAccounts' (default) or 'privateGetPortfolioSubaccounts'
     * @returns {object[]} the raw response from the exchange
     */
    fetchPortfolioAccounts(params?: Dict): Promise<List>;
    /**
     * @method
     * @name interactivebrokers#switchToAccount
     * @description switch the active account (for users with multiple accounts)
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-accounts/set-active-account
     * @ignore
     * @param {string} accountId the account id to switch to
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the raw response from the exchange
     */
    switchToAccount(accountId: string, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name interactivebrokers#createOrder
     * @description create a trade order, order reply prompts are confirmed automatically when options.createOrder.autoConfirmOrderReplies is true
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/submit-new-order
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/confirm-order-reply
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {float} [params.triggerPrice] the stop price, creates a STP (market) or STP LMT (limit) order
     * @param {float} [params.trailingAmount] the trailing offset in quote currency, creates a TRAIL or TRAILLMT order
     * @param {float} [params.trailingPercent] the trailing offset in percent, creates a TRAIL or TRAILLMT order
     * @param {string} [params.timeInForce] 'DAY', 'IOC', 'GTC', 'OPG' or 'PAX'
     * @param {string} [params.clientOrderId] a unique id for the order, sent as cOID
     * @param {boolean} [params.outsideRTH] allow the order to execute outside regular trading hours
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    createOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<Order>;
    createTestOrder(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Promise<Dict>;
    /**
     * @method
     * @name interactivebrokers#createOrderRequest
     * @description builds a single order ticket for createOrder and editOrder
     * @ignore
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how much of currency you want to trade in units of base currency
     * @param {float} [price] the price at which the order is to be fulfilled
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} the order ticket
     */
    createOrderRequest(symbol: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: Dict): Dict;
    /**
     * @method
     * @name interactivebrokers#ibkrHandleOrderReplies
     * @description confirms order reply prompts until the order is accepted, or throws InvalidOrder when options.createOrder.autoConfirmOrderReplies is false
     * @ignore
     * @param {object} response the order submission response
     * @param {string} methodName the calling method name
     * @returns {object} the accepted order entry
     */
    ibkrHandleOrderReplies(response: any, methodName: string): Promise<Dict>;
    /**
     * @method
     * @name interactivebrokers#editOrder
     * @description edit a trade order
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/modify-open-order
     * @param {string} id order id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} [amount] how much of the currency you want to trade in units of the base currency
     * @param {float} [price] the price at which the order is to be fulfilled, in units of the quote currency, ignored in market orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint, see createOrder
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    editOrder(id: string, symbol: string, type: OrderType, side: OrderSide, amount?: Num, price?: Num, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name interactivebrokers#cancelOrder
     * @description cancels an open order
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/cancel-open-order
     * @param {string} id order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    cancelOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name interactivebrokers#fetchOrder
     * @description fetches information on an order made by the user, only orders of the current brokerage session are available
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-order-status
     * @param {string} id the order id
     * @param {string} [symbol] unified symbol of the market the order was made in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrder(id: string, symbol?: Str, params?: Dict): Promise<Order>;
    /**
     * @method
     * @name interactivebrokers#fetchOrders
     * @description fetches information on multiple orders of the current brokerage session
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders
     * @param {string} [symbol] unified market symbol of the market orders were made in
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.filters] a single exchange-side status filter, e.g. 'filled'
     * @param {boolean} [params.force] refresh the cached order list first, default true
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name interactivebrokers#fetchOpenOrders
     * @description fetch all unfilled currently open orders of the current brokerage session
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch open orders for
     * @param {int} [limit] the maximum number of open order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.filters] an exchange-side status filter, by default all orders are fetched and filtered by their unified status
     * @param {boolean} [params.force] refresh the cached order list first, default true
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name interactivebrokers#fetchClosedOrders
     * @description fetches information on multiple filled orders of the current brokerage session
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.filters] an exchange-side status filter, by default all orders are fetched and filtered by their unified status
     * @param {boolean} [params.force] refresh the cached order list first, default true
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name interactivebrokers#fetchCanceledOrders
     * @description fetches information on multiple canceled orders of the current brokerage session
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.filters] an exchange-side status filter, by default all orders are fetched and filtered by their unified status
     * @param {boolean} [params.force] refresh the cached order list first, default true
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name interactivebrokers#fetchCanceledAndClosedOrders
     * @description fetches information on multiple filled and canceled orders of the current brokerage session
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.filters] an exchange-side status filter, by default all orders are fetched and filtered by their unified status
     * @param {boolean} [params.force] refresh the cached order list first, default true
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchCanceledAndClosedOrders(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name interactivebrokers#fetchOrdersByStatusFilter
     * @description fetches the live orders, then keeps only the orders with the given unified status, the exchange-side filters are not used by default: a comma-separated list of them returns no orders and each filter has its own cached list
     * @ignore
     * @param {string} status unified order status to keep, 'open', 'closed' or 'canceled'
     * @param {string} [symbol] unified market symbol
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/?id=order-structure}
     */
    fetchOrdersByStatusFilter(status: string, symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Order[]>;
    /**
     * @method
     * @name interactivebrokers#fetchLiveOrdersRaw
     * @description fetches the raw live orders of the current brokerage session, refreshes the cached order list first (options.fetchOrders.force) and retries once when the request only starts the order subscription
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-open-orders
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} the raw orders
     */
    fetchLiveOrdersRaw(params?: Dict): Promise<Dict[]>;
    parseOrderStatus(status: Str): Str;
    parseOrderType(orderType: Str): Str;
    parseOrderTimeInForce(timeInForce: Str): Str;
    parseOrder(order: Dict, market?: Market): Order;
    /**
     * @method
     * @name interactivebrokers#fetchMyTrades
     * @description fetch all trades made by the user, over the last days (max 7) via iserver/account/trades, or for crypto markets (which iserver/account/trades does not return) via pa/transactions
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-orders/get-trade-history
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio-analyst/get-transactions
     * @param {string} [symbol] unified market symbol, required for crypto markets
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.days] number of days to fetch, max 7 for iserver/account/trades, default 90 for pa/transactions
     * @param {string} [params.method] 'privateGetIserverAccountTrades' or 'privatePostPaTransactions', default is 'privatePostPaTransactions' for crypto markets and 'privateGetIserverAccountTrades' otherwise
     * @param {string} [params.currency] pa/transactions only, the currency to display the amounts in, default 'USD'
     * @param {string} [params.accountId] pa/transactions only, the account id, defaults to options["accountId"]
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    /**
     * @method
     * @name interactivebrokers#fetchMyTradesFromTransactions
     * @description fetches the trades of a single market via pa/transactions, used for crypto markets as iserver/account/trades does not return them
     * @ignore
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio-analyst/get-transactions
     * @param {object} market the market to fetch the trades for
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/?id=trade-structure}
     */
    fetchMyTradesFromTransactions(market: Market, since?: Int, limit?: Int, params?: Dict): Promise<Trade[]>;
    parseTransactionDate(date: Str): Int;
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name interactivebrokers#fetchPositions
     * @description fetch all open positions
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-uncached-positions
     * @param {string[]} [symbols] list of unified market symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositions(symbols?: Strings, params?: Dict): Promise<Position[]>;
    /**
     * @method
     * @name interactivebrokers#fetchPositionsForSymbol
     * @description fetch the open positions of a single market
     * @see https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-portfolio/get-position-by-conid
     * @param {string} symbol unified market symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.accountId] the account id, defaults to options["accountId"]
     * @returns {object[]} a list of [position structures]{@link https://docs.ccxt.com/?id=position-structure}
     */
    fetchPositionsForSymbol(symbol: string, params?: Dict): Promise<Position[]>;
    parsePosition(position: Dict, market?: Market): Position;
    ibkrEncrypt(value: string): string;
    ibkrBaseString(method: string, url: string, params: Dict, prepend?: string): string;
    ibkrAuthHeader(params: Dict): string;
    ibkrOauthBase(consumerKey: string, consumerAccessToken: string): Dict;
    /**
     * @method
     * @name interactivebrokers#ibkrImplodePath
     * @description replaces the ':name' path parameters of the webapi endpoints with the matching values of params
     * @ignore
     * @param {string} path the endpoint path, e.g. 'v1/api/iserver/account/:accountId/orders'
     * @param {object} params the request params, the path params are read from here
     * @returns {Array} the imploded path, e.g. 'v1/api/iserver/account/U1234567/orders', and the names of the path params
     */
    ibkrImplodePath(path: string, params: Dict): List;
    /**
     * @method
     * @name interactivebrokers#ibkrGatewayBaseUrl
     * @description maps an api.ibkr.com base url to the client portal gateway url, e.g. 'https://api.ibkr.com/v1/api/' -> 'https://localhost:5000/v1/api/'
     * @ignore
     * @param {string} baseUrl the configured api url
     * @param {string} gatewayUrl options.gatewayUrl
     * @returns {string} the gateway base url
     */
    ibkrGatewayBaseUrl(baseUrl: string, gatewayUrl: string): string;
    /**
     * @method
     * @name interactivebrokers#ibkrCheckOauthCredentials
     * @description throws an AuthenticationError when the oauth 1.0a credentials (apiKey, secret and options.consumer_key) are missing, requiredCredentials can not be used for this, because the client portal gateway mode needs no credentials
     * @ignore
     * @returns {boolean} true if the oauth credentials are set
     */
    ibkrCheckOauthCredentials(): boolean;
    /**
     * @method
     * @name interactivebrokers#ibkrIsGatewayRequest
     * @description tells whether a request is routed to the client portal gateway instead of the oauth api
     * @ignore
     * @param {string} path the endpoint path
     * @returns {boolean} true if the request is sent to the client portal gateway
     */
    ibkrIsGatewayRequest(path: string): boolean;
    sign(path: string, api?: string[], method?: string, params?: Dict): Dict;
    /**
     * @method
     * @name interactivebrokers#ibkrIsAuthRequest
     * @description tells whether the endpoint is used by signIn () itself, so it must not trigger authenticate ()
     * @ignore
     * @param {string} path the endpoint path
     * @returns {boolean} true for the session/authentication endpoints
     */
    ibkrIsAuthRequest(path: string): boolean;
    request(path: string, api?: string[], method?: any, params?: Dict, config?: Dict): Promise<any>;
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): undefined;
}
