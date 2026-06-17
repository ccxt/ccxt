import Exchange from '../abstract/prediction/hyperliquid.js';
import type { Int, int, Str, Num, Dict, Market, Ticker, Tickers, OrderBook, Trade, OHLCV, Order, Balances, Position, Strings, PredictionEvent } from '../base/types.js';
/**
 * @class hyperliquid
 * @augments Exchange
 */
export default class hyperliquid extends Exchange {
    describe(): any;
    setSandboxMode(enabled: boolean): void;
    /**
     * @ignore
     * @method
     * @name hyperliquid#outcomeEncoding
     * @description computes the encoding for an outcome side: encoding = 10 * outcomeId + side (side 0 = YES, side 1 = NO)
     * @param {int} outcomeId integer outcome id
     * @param {int} side outcome side, 0 = YES, 1 = NO
     * @returns {int} the outcome side encoding
     */
    outcomeEncoding(outcomeId: number, side: number): number;
    /**
     * @ignore
     * @method
     * @name hyperliquid#outcomeAssetId
     * @description returns the asset id used for orders: 100_000_000 + encoding, e.g. 100000010
     * @param {int} encoding outcome side encoding
     * @returns {int} the asset id
     */
    outcomeAssetId(encoding: number): number;
    /**
     * @ignore
     * @method
     * @name hyperliquid#outcomeCoin
     * @description returns the coin name used in API calls: #<encoding>, e.g. #10 for outcome 1 side 0
     * @param {int} encoding outcome side encoding
     * @returns {string} the coin name
     */
    outcomeCoin(encoding: number): string;
    /**
     * @ignore
     * @method
     * @name hyperliquid#outcomeToken
     * @description returns the token name: +<encoding>, e.g. +10
     * @param {int} encoding outcome side encoding
     * @returns {string} the token name
     */
    outcomeToken(encoding: number): string;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parseOutcomeDescription
     * @description parses a description string of the form class:priceBinary|underlying:BTC|expiry:20260503-0600|targetPrice:78213|period:1d into a dict
     * @param {string} description the raw outcome description string
     * @returns {object} a dict of the parsed key/value pairs
     */
    parseOutcomeDescription(description: string): Dict;
    /**
     * @ignore
     * @method
     * @name hyperliquid#buildOutcomeSymbol
     * @description builds a human-readable outcome symbol from a parsed description and side, e.g. BTC-ABOVE-78213-20260503:YES for side 0 and BTC-ABOVE-78213-20260503:NO for side 1
     * @param {object} desc parsed outcome description
     * @param {int} side outcome side, 0 = YES, 1 = NO
     * @param {int} outcomeId integer outcome id
     * @returns {string} the outcome symbol
     */
    buildOutcomeSymbol(desc: Dict, side: number, outcomeId: number): string;
    /**
     * @ignore
     * @method
     * @name hyperliquid#slugifyUpper
     * @description converts a name into an upper-case slug of alphanumeric parts joined by hyphens
     * @param {string} name the raw name to slugify
     * @returns {string} the upper-case slug
     */
    slugifyUpper(name: string): string;
    /**
     * @ignore
     * @method
     * @name hyperliquid#buildOutcomeParentSymbol
     * @description builds a market id (parent symbol without YES/NO) from a parsed description, e.g. BTC-ABOVE-78213-20260503 for priceBinary outcomes or OUTCOME-9345 for non-priceBinary outcomes using the name field
     * @param {object} desc parsed outcome description
     * @param {int} outcomeId integer outcome id
     * @param {string} [name] outcome name
     * @param {object} [question] linked question object from outcomeMeta
     * @returns {string} the parent market symbol
     */
    buildOutcomeParentSymbol(desc: Dict, outcomeId: number, name?: string, question?: Dict): string;
    /**
     * @method
     * @name hyperliquid#fetchMarkets
     * @description Retrieves all Hyperliquid outcome markets from outcomeMeta.
     * Each binary outcome becomes one CCXT prediction market with two outcomes: YES and NO.
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/asset-ids#outcomes
     * @param {object} [params] extra parameters
     * @returns {Market[]} array of market structures
     */
    fetchMarkets(params?: {}): Promise<Market[]>;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parseOutcomeMarket
     * @description parses a single binary outcome market into a CCXT market structure with outcomes[]
     * @param {object} outcomeInfo raw entry from outcomeMeta outcomes array
     * @param {int} outcomeId integer outcome id
     * @param {object} [question] linked question object from outcomeMeta questions array
     * @returns {object} a [market structure](https://docs.ccxt.com/#/?id=market-structure)
     */
    parseOutcomeMarket(outcomeInfo: Dict, outcomeId: number, question?: Dict): Market;
    /**
     * @ignore
     * @method
     * @name hyperliquid#calculatePricePrecision
     * @description calculates an appropriate price precision tick size given midPx and szDecimals
     * @param {float} midPx the mid price
     * @param {int} szDecimals the number of size decimals
     * @returns {float} the price tick size
     */
    calculatePricePrecision(midPx: number, szDecimals: number): number;
    /**
     * @method
     * @name hyperliquid#fetchTicker
     * @description fetches a ticker for a single outcome market using the L2 order book snapshot
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
     * @param {string} symbol unified outcome symbol (e.g. 'BTC-ABOVE-78213-20260503:YES')
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    fetchTicker(symbol: string, params?: {}): Promise<Ticker>;
    /**
     * @method
     * @name hyperliquid#fetchTickers
     * @description fetches all outcome market tickers using allMids then optionally enriches with l2Book
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-all-mids-for-all-actively-traded-coins
     * @param {string[]} [symbols] filter by outcome ids or symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    fetchTickers(symbols?: Strings, params?: {}): Promise<Tickers>;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parseTicker
     * @description parses a raw l2Book response (or a synthetic mid dict) into a unified ticker object
     * @param {object} raw l2Book response or { mid, time } object
     * @param {object} [market] the market the ticker belongs to
     * @returns {object} a [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    parseTicker(raw: Dict, market?: Market): Ticker;
    /**
     * @method
     * @name hyperliquid#fetchOrderBook
     * @description fetches the L2 order book for an outcome market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
     * @param {string} symbol unified outcome symbol
     * @param {int} [limit] max depth levels (not used by hyperliquid but accepted)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    /**
     * @method
     * @name hyperliquid#fetchOHLCV
     * @description fetches candlestick OHLCV data for an outcome market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
     * @param {string} symbol unified outcome symbol
     * @param {string} timeframe '1m', '5m', '15m', '1h', '4h', '1d', etc.
     * @param {int} [since] timestamp in ms of earliest candle
     * @param {int} [limit] max number of candles
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end timestamp in ms
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parseOHLCV
     * @description parses a single hyperliquid candle object into a CCXT OHLCV tuple
     * @param {object} ohlcv the raw candle object
     * @param {object} [market] the market the candle belongs to
     * @returns {int[]} a candle ordered as timestamp, open, high, low, close, volume
     */
    parseOHLCV(ohlcv: any, market?: Market): OHLCV;
    /**
     * @method
     * @name hyperliquid#fetchBalance
     * @description Fetches spot balance (outcomes use spot-like balance).
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
     * @param {object} [params] extra parameters
     * @param {string} [params.user] wallet address (defaults to this.walletAddress)
     * @returns {Balances} balance structure
     */
    fetchBalance(params?: {}): Promise<Balances>;
    /**
     * @method
     * @name hyperliquid#fetchPositions
     * @description fetches outcome token positions from spot clearinghouse state, outcome tokens appear as spot token balances starting with '+'
     * @param {string[]} [symbols] filter by outcome ids or symbols
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] wallet address
     * @returns {object[]} a list of [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    fetchPositions(symbols?: Strings, params?: {}): Promise<Position[]>;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parsePosition
     * @description parses a spot balance entry for an outcome token into a unified position object
     * @param {object} position the raw balance entry
     * @param {object} [outcomeObj] the outcome object the position belongs to
     * @returns {object} a [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    parsePosition(position: Dict, outcomeObj?: any): Position;
    findOutcomeInMarket(market: Market, sideHint?: Str): Dict;
    parseOutcomeInputSideHint(outcomeInput: string): Str;
    resolveOutcomeInput(outcomeInput: string): Dict;
    /**
     * @method
     * @name hyperliquid#createOrder
     * @description creates a limit or market order for an outcome market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
     * @param {string} symbol unified outcome symbol
     * @param {string} type 'limit' or 'market'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount quantity of outcome tokens
     * @param {float} [price] limit price (0–1 range for prediction markets)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.timeInForce] 'Gtc' | 'Ioc' | 'Alo' (default 'Gtc')
     * @param {boolean} [params.postOnly] if true sets timeInForce to 'Alo'
     * @param {boolean} [params.reduceOnly] if true, marks the order as reduce only so it can only decrease an existing position
     * @param {string} [params.slippage] slippage for market orders (default 5%)
     * @param {string} [params.clientOrderId] hex cloid
     * @param {string} [params.vaultAddress] optional subaccount/vault address to trade on behalf of (master signer must be authorized)
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    createOrder(symbol: string, type: string, side: string, amount: number, price?: Num, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hyperliquid#cancelOrder
     * @description cancels a single open order
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
     * @param {string} id order id
     * @param {string} [symbol] unified outcome symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel by client order id
     * @param {string} [params.vaultAddress] optional subaccount/vault address to cancel on behalf of
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @method
     * @name hyperliquid#cancelOrders
     * @description cancels multiple open orders
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
     * @param {string[]} ids order ids
     * @param {string} [symbol] unified outcome symbol (required)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelOrders(ids: string[], symbol?: Str, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name hyperliquid#fetchOpenOrders
     * @description fetches currently open orders for the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
     * @param {string} [symbol] filter by outcome symbol
     * @param {int} [since] only return orders updated since this timestamp in ms
     * @param {int} [limit] max number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] wallet address
     * @param {string} [params.method] 'openOrders' | 'frontendOpenOrders' (default)
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOpenOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name hyperliquid#fetchOrders
     * @description fetches all historical orders for the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
     * @param {string} [symbol] filter by outcome symbol
     * @param {int} [since] only return orders updated since this timestamp in ms
     * @param {int} [limit] max number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] wallet address
     * @returns {object[]} a list of [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    /**
     * @method
     * @name hyperliquid#fetchOrder
     * @description fetches a single order by id
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
     * @param {string} id order id
     * @param {string} [symbol] outcome symbol
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] wallet address
     * @param {string} [params.clientOrderId] fetch by client order id instead
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrder(id: string, symbol?: Str, params?: {}): Promise<Order>;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parseOrder
     * @description parses a raw hyperliquid order object into a unified order object
     * @param {object} order the raw order object
     * @param {object} [market] the market the order belongs to
     * @returns {object} an [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    parseOrder(order: Dict, market?: Market): Order;
    parseOrderStatus(status: Str): Str;
    parseOrderType(status: Str): Str;
    parseTimeInForce(timeInForce: Str): Str;
    /**
     * @method
     * @name hyperliquid#fetchMyTrades
     * @description fetches the authenticated user's fill history
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
     * @param {string} [symbol] filter by outcome symbol
     * @param {int} [since] start timestamp in ms
     * @param {int} [limit] max number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] wallet address
     * @param {int} [params.until] end timestamp in ms
     * @returns {object[]} a list of [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    fetchMyTrades(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parseTrade
     * @description parses a single hyperliquid fill into a unified trade object
     * @param {object} trade the raw fill object
     * @param {object} [market] the market the trade belongs to
     * @returns {object} a [trade structure](https://docs.ccxt.com/#/?id=trade-structure)
     */
    parseTrade(trade: Dict, market?: Market): Trade;
    /**
     * @method
     * @name hyperliquid#fetchEvents
     * @description Groups outcome markets by their underlying (e.g. BTC-ABOVE-78213) into event structures. Each event contains both the YES and NO markets.
     * @param {object} [params] extra parameters
     * @param {string} [params.query] a single query string to filter by (matches description/symbol)
     * @param {string[]} [params.queries] multiple query strings (alternative to query)
     * @returns {PredictionEvent[]} array of event structures
     */
    fetchEvents(params?: {}): Promise<PredictionEvent[]>;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parseEvent
     * @description parses a grouped set of outcome markets into a unified prediction event object
     * @param {object} raw a dict with parentSymbol and markets entries
     * @returns {object} an event structure
     */
    parseEvent(raw: Dict): any;
    amountToPrecision(outcome: string, amount: any): string;
    priceToPrecision(outcome: string, price: any): string;
    hashMessage(message: any): string;
    signHash(hash: string, privateKey: string): Dict;
    signMessage(message: any, privateKey: string): Dict;
    constructPhantomAgent(hash: any, isTestnet?: boolean): Dict;
    actionHash(action: Dict, vaultAddress: Str, nonce: number): any;
    signL1Action(action: Dict, nonce: number, vaultAddress?: Str): Dict;
    initializeClient(): Promise<void>;
    handlePublicAddress(methodName: string, params: Dict): any;
    formatVaultAddress(address?: Str): Str;
    sign(path: any, api?: any, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(code: int, reason: string, url: string, method: string, headers: Dict, body: string, response: any, requestHeaders: any, requestBody: any): any;
    calculateRateLimiterCost(api: any, method: any, path: any, params: any, config?: {}): any;
}
