import Exchange from '../abstract/prediction/limitless.js';
import type { int, Int, Str, Num, Dict, Strings, Market, PredictionOrderBook, OHLCV, Bool, Account, fetchEventsParams, PredictionEvent, PredictionTicker, PredictionTickers, PredictionOrder, PredictionTrade, PredictionPosition } from '../base/types.js';
/**
 * @class limitless
 * @augments Exchange
 */
export default class limitless extends Exchange {
    describe(): any;
    /**
     * @method
     * @name limitless#fetchMarkets
     * @description fetches all active limitless markets paginated and returns one CCXT market per child market, each containing a list of outcome objects (YES/NO)
     * @see https://docs.limitless.exchange/api-reference/markets/get-active-markets
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.query] a single search query string to filter markets by
     * @param {string[]} [params.queries] multiple search query strings (alternative to query)
     * @param {int} [params.limit] max number of markets to collect (defaults to options.fetchMarketsLimit, 1000); caps the pages fetched
     * @returns {object[]} an array of objects representing market data
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    parseMarket(raw: Dict): Market;
    /**
     * @method
     * @name limitless#fetchEvent
     * @description fetches a single prediction-market event by its market slug or address
     * @see https://docs.limitless.exchange/api-reference/markets/get-market
     * @param {string} id the market slug or address
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction event structure](https://docs.ccxt.com/#/?id=prediction-event-structure)
     */
    fetchEvent(id: string, params?: {}): Promise<PredictionEvent>;
    parseEvent(event: Dict): any;
    /**
     * @method
     * @name limitless#fetchTicker
     * @description fetches the current price and best bid/ask for a single outcome token, combining the market detail and order book endpoints
     * @see https://docs.limitless.exchange/api-reference/markets/get-market
     * @see https://docs.limitless.exchange/api-reference/trading/orderbook
     * @param {string} outcome unified outcome like TRUMP_OUT_PRESIDENT_2027:YES or an outcome token id
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    fetchTicker(outcome: Str, params?: {}): Promise<PredictionTicker>;
    /**
     * @ignore
     * @method
     * @name limitless#parseTicker
     * @description parses a raw market object, or a composite market + book dict, into a unified ticker for the specified outcome token
     * @param {object} ticker a raw limitless market object or a dict with market and book entries
     * @param {object} [market] the outcome object the ticker belongs to
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    parseTicker(ticker: Dict, market?: Market): PredictionTicker;
    /**
     * @method
     * @name limitless#fetchTickers
     * @description fetches tickers for multiple outcome tokens, grouping requested outcomes by their parent market, fetches all active markets when outcomes is omitted
     * @see https://docs.limitless.exchange/api-reference/markets/get-market
     * @see https://docs.limitless.exchange/api-reference/trading/orderbook
     * @param {string[]} [outcomes] unified outcomes or outcome token ids
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome
     */
    fetchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @method
     * @name limitless#fetchTrades
     * @description fetches recent public trades for a single outcome token from the market events feed
     * @see https://docs.limitless.exchange/api-reference/trading/market-events
     * @param {string} outcome unified outcome like TRUMP_OUT_PRESIDENT_2027:YES or an outcome token id
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    fetchTrades(outcome: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name limitless#fetchOrderBook
     * @description fetches the order book for a single outcome token, converting 6-decimal USDC sizes to whole units, no outcomes are quoted at 1 - price with the sides swapped
     * @see https://docs.limitless.exchange/api-reference/trading/orderbook
     * @param {string} outcome unified outcome like TRUMP_OUT_PRESIDENT_2027:YES or an outcome token id
     * @param {int} [limit] not used by limitless fetchOrderBook
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    fetchOrderBook(outcome: Str, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @method
     * @name limitless#fetchOHLCV
     * @description fetches historical prices for a single limitless market outcome and maps them to OHLCV format, uses the `interval` query parameter and selects the YES/NO series that matches the requested outcome
     * @see https://docs.limitless.exchange/api-reference/trading/historical-price
     * @param {string} outcome outcome, e.g. "TRUMP_OUT:YES"
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to fetch
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(outcome: Str, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name limitless#fetchOrders
     * @description fetches orders for the authenticated user for a single outcome
     * @see https://docs.limitless.exchange/api-reference/orders/get-user-orders
     * @param {string} [outcome] outcome, e.g. "TRUMP_OUT:YES"
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name limitless#fetchOpenOrders
     * @description fetches open orders for the authenticated user for a single outcome
     * @see https://docs.limitless.exchange/api-reference/orders/get-user-orders
     * @param {string} [outcome] outcome, e.g. "TRUMP_OUT:YES"
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOpenOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name limitless#fetchClosedOrders
     * @description fetches closed orders for the authenticated user for a single outcome
     * @see https://docs.limitless.exchange/api-reference/orders/get-user-orders
     * @param {string} [outcome] outcome, e.g. "TRUMP_OUT:YES"
     * @param {int} [since] the earliest time in ms to fetch orders for
     * @param {int} [limit] the maximum number of order structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchClosedOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name limitless#fetchOrdersByIds
     * @description fetch orders by the list of order id
     * @see https://docs.limitless.exchange/api-reference/trading/order-status-batch
     * @param {string[]} ids list of order id
     * @param {string} [outcome] market outcome, e.g. "TRUMP_OUT:YES"
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrdersByIds(ids: any, outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name limitless#fetchOrder
     * @description fetches information on an order made by the user
     * @see https://docs.limitless.exchange/api-reference/trading/order-status-batch
     * @param {string} id the order id
     * @param {string} [outcome] market outcome, e.g. "TRUMP_OUT:YES"
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrder(id: string, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @ignore
     * @method
     * @name limitless#parseOrder
     * @description parses a raw limitless order object into a unified order object
     * @param {object} order the raw order object
     * @param {object} [market] the outcome object the order belongs to
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    parseOrder(order: Dict, market?: Market): PredictionOrder;
    /**
     * @ignore
     * @method
     * @name limitless#parseOrderStatus
     * @description maps an order status string to the CCXT unified status vocabulary
     * @param {string} status the raw limitless order status
     * @returns {string} the unified order status
     */
    parseOrderStatus(status: Str): Str;
    /**
     * @ignore
     * @method
     * @name limitless#parseOrderTimeInForce
     * @description maps an order time in force string to the CCXT unified type vocabulary
     * @param {string} timeInForce the raw limitless time in force
     * @returns {string} the unified time in force
     */
    parseOrderTimeInForce(timeInForce: Str): Str;
    /**
     * @ignore
     * @method
     * @name limitless#parseOrderSide
     * @description maps an order side string to the CCXT unified side vocabulary
     * @param {string} side the raw limitless order side
     * @returns {string} the unified order side
     */
    parseOrderSide(side: Str): Str;
    applyScale(amount: Str, multiply?: Bool): Str;
    parseAccount(account: Dict): Account;
    /**
     * @method
     * @name limitless#fetchAccounts
     * @description query for account id and info
     * @see https://docs.limitless.exchange/api-reference/portfolio/get-current-profile
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [account structures]
     */
    fetchAccounts(params?: {}): Promise<Account[]>;
    /**
     * @method
     * @name limitless#createOrder
     * @description places a limit or market order on limitless for the given outcome token
     * @see https://docs.limitless.exchange/api-reference/orders/create-order
     * @param {string} outcome outcome, e.g. "TRUMP_OUT:YES"
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount amount of outcome tokens
     * @param {float} [price] limit price (0–1 range)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    createOrder(outcome: string, type: Str, side: Str, amount: Num, price?: Num, params?: {}): Promise<PredictionOrder>;
    signOrderRequest(signRequest: Dict, marketSymbol: any): string;
    hashMessage(message: any): string;
    signHash(hash: any, privateKey: any): string;
    signMessage(message: any, privateKey: any): string;
    rlpEncodeBytes(hex: string): string;
    rlpEncodeList(items: string[]): string;
    intToRlpHex(value: number): string;
    hexToRlpBytes(hexValue: string): string;
    padHexToEven(hex: string): string;
    padHexAddress(address: string): string;
    signEvmTransaction(tx: Dict, privateKey: string): string;
    ethRpc(rpcUrl: string, method: string, rpcParams: any[]): Promise<any>;
    sendEvmTransaction(rpcUrl: string, chainId: number, fromAddress: string, to: string, value: string, data: string, gasLimit: string): Promise<string>;
    waitForTransactionReceipt(rpcUrl: string, txHash: string, timeout?: number): Promise<any>;
    /**
     * @method
     * @name limitless#approve
     * @description sets the on-chain ERC20 collateral (USDC) allowance for the limitless exchange contract on Base, which is required before an EOA maker can place orders ("Insufficient collateral allowance" otherwise). Sends a real on-chain transaction signed with the privateKey and waits for the receipt
     * @param {object} [params] extra parameters
     * @param {string} [params.token] the collateral token address (default USDC on Base)
     * @param {string} [params.spender] the exchange contract to approve (default the limitless CTF exchange); read from a market's venue when omitted
     * @param {string} [params.owner] the token holder address (default this.walletAddress or the address derived from the privateKey)
     * @param {float} [params.amount] the allowance in USDC (default: unlimited / maxUint256)
     * @param {string} [params.rpcUrl] the Base RPC url to broadcast through
     * @param {string} [params.gasLimit] gas limit hex for the approve tx (default '0x186a0')
     * @returns {object} the transaction receipt
     */
    approve(params?: {}): Promise<any>;
    /**
     * @method
     * @name limitless#cancelOrder
     * @description cancels a single open order by id
     * @see https://docs.limitless.exchange/api-reference/orders/cancel-order
     * @param {string} id order id
     * @param {string} [outcome] outcome, e.g. "TRUMP_OUT:YES"
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelOrder(id: Str, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name limitless#cancelOrders
     * @description cancel multiple orders at the same time
     * @see https://docs.limitless.exchange/api-reference/trading/cancel-batch
     * @param {string[]} ids order ids
     * @param {string} [outcome] unified market outcome, default is undefined
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelOrders(ids: string[], outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name limitless#cancelAllOrders
     * @description cancels all open orders for one market slug
     * @see https://docs.limitless.exchange/api-reference/orders/cancel-all-orders
     * @param {string} [outcome] outcome, e.g. "TRUMP_OUT:YES"
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.slug] the market slug to cancel all orders for
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelAllOrders(outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name limitless#fetchMyTrades
     * @description fetch all trades made by the user
     * @see https://docs.limitless.exchange/api-reference/trades/get-trades
     * @param {string} [outcome] outcome, e.g. "TRUMP_OUT:YES"
     * @param {int} [since] the earliest time in ms to fetch trades for
     * @param {int} [limit] the maximum number of trades structures to retrieve
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    fetchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name limitless#parseTrade
     * @description parses a raw trade from either the public market events feed or the private portfolio history into a unified trade object
     * @param {object} trade the raw trade object
     * @param {object} [market] the outcome object the trade belongs to
     * @returns {object} a [trade structure](https://docs.ccxt.com/#/?id=public-trades)
     */
    parseTrade(trade: Dict, market?: Market): PredictionTrade;
    getOutcomeBySlugAndLabel(slug: Str, label: Str, market?: Market): any;
    /**
     * @method
     * @name limitless#fetchPositions
     * @description fetches open positions for the authenticated limitless user from the portfolio endpoint
     * @see https://docs.limitless.exchange/api-reference/portfolio/get-positions
     * @param {string[]} [outcomes] filter by outcome ids or outcomes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    fetchPositions(outcomes?: Strings, params?: {}): Promise<PredictionPosition[]>;
    getPositionFromClobEntry(label: string, entry?: Dict): PredictionPosition;
    /**
     * @ignore
     * @method
     * @name limitless#parsePosition
     * @description parses a raw limitless portfolio position into a unified position object
     * @param {object} position the raw position object
     * @param {object} [market] the outcome object the position belongs to
     * @returns {object} a [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    parsePosition(position: Dict, market?: Market): PredictionPosition;
    /**
     * @method
     * @name limitless#fetchEvents
     * @description fetches prediction-market events matching the given search terms (or the most active markets, capped, when omitted) and caches their markets and outcomes on the instance
     * @see https://docs.limitless.exchange/api-reference/markets/search
     * @param {object} [params] extra exchange-specific parameters
     * @param {string} [params.query] a single search term; when omitted (and no queries) returns the events cached by loadMarkets (capped by options.fetchMarketsLimit)
     * @param {string[]} [params.queries] multiple search terms (alternative to query)
     * @param {int} [params.limit] maximum number of markets per query, defaults to 50
     * @returns {object[]} an array of event structures
     */
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
    /**
     * @ignore
     * @method
     * @name limitless#rebuildOutcomes
     * @description rebuilds this.outcomes and this.outcomes_by_id from the outcomes of every loaded market
     * @returns {undefined}
     */
    rebuildOutcomes(): void;
    /**
     * @ignore
     * @method
     * @name limitless#sign
     * @description builds the request URL and attaches the lmts authentication headers for private endpoints
     * @param {string} path the endpoint path
     * @param {string|string[]} [section] the api group and access level
     * @param {string} [method] HTTP method
     * @param {object} [params] request parameters
     * @param {object} [headers] request headers
     * @param {object} [body] request body
     * @returns {object} a dictionary with url, method, body and headers
     */
    sign(path: any, section?: any, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    /**
     * @ignore
     * @method
     * @name limitless#handleErrors
     * @description maps limitless error responses to ccxt exceptions
     */
    handleErrors(statusCode: int, statusText: string, url: string, method: string, responseHeaders: Dict, responseBody: string, response: any, requestHeaders: any, requestBody: any): any;
}
