import Exchange from '../abstract/prediction/hyperliquid.js';
import type { Int, int, Str, Num, Dict, Market, PredictionOrderBook, OHLCV, Balances, fetchEventsParams, Strings, PredictionEvent, PredictionTicker, PredictionTickers, PredictionOrder, PredictionTrade, PredictionPosition } from '../base/types.js';
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
     * @description builds a human-readable outcome from a parsed description and side, e.g. BTC_ABOVE_78213_20260503:YES for side 0 and BTC_ABOVE_78213_20260503:NO for side 1
     * @param {object} desc parsed outcome description
     * @param {int} side outcome side, 0 = YES, 1 = NO
     * @param {int} outcomeId integer outcome id
     * @returns {string} the outcome
     */
    buildOutcomeSymbol(desc: Dict, side: number, outcomeId: number): string;
    /**
     * @ignore
     * @method
     * @name hyperliquid#buildOutcomeParentSymbol
     * @description builds a market id (parent outcome without YES/NO) from a parsed description, e.g. BTC_ABOVE_78213_20260503 for priceBinary outcomes or OUTCOME_9345 for non-priceBinary outcomes using the name field
     * @param {object} desc parsed outcome description
     * @param {int} outcomeId integer outcome id
     * @param {string} [name] outcome name
     * @param {object} [question] linked question object from outcomeMeta
     * @returns {string} the parent market outcome
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
     * @param {string} outcome unified outcome (e.g. 'BTC_ABOVE_78213_20260503:YES')
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    fetchTicker(outcome: string, params?: {}): Promise<PredictionTicker>;
    /**
     * @method
     * @name hyperliquid#fetchTickers
     * @description fetches all outcome market tickers using allMids then optionally enriches with l2Book
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-all-mids-for-all-actively-traded-coins
     * @param {string[]} [outcomes] filter by outcome ids or outcomes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a dictionary of [prediction ticker structures](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    fetchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parsePredictionTicker
     * @description parses a raw l2Book response (or a synthetic mid dict) into a unified ticker object
     * @param {object} raw l2Book response or { mid, time } object
     * @param {object} [market] the market the ticker belongs to
     * @returns {object} a [prediction ticker structure](https://docs.ccxt.com/#/?id=prediction-ticker-structure)
     */
    parsePredictionTicker(raw: Dict, market?: Market): PredictionTicker;
    /**
     * @method
     * @name hyperliquid#fetchOrderBook
     * @description fetches the L2 order book for an outcome market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#l2-book-snapshot
     * @param {string} outcome unified outcome
     * @param {int} [limit] max depth levels (not used by hyperliquid but accepted)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} a [prediction order book structure](https://docs.ccxt.com/#/?id=prediction-order-book-structure)
     */
    fetchOrderBook(outcome: string, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @method
     * @name hyperliquid#fetchOHLCV
     * @description fetches candlestick OHLCV data for an outcome market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#candle-snapshot
     * @param {string} outcome unified outcome
     * @param {string} timeframe '1m', '5m', '15m', '1h', '4h', '1d', etc.
     * @param {int} [since] timestamp in ms of earliest candle
     * @param {int} [limit] max number of candles
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {int} [params.until] end timestamp in ms
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(outcome: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
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
     * @description fetches the user's outcome positions; outcome positions are spot token balances under the "+<encoding>" coin form (size and entry notional), the value/entry/mark price/pnl are computed from the current mid prices
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint/spot#retrieve-a-users-token-balances
     * @param {string[]} [outcomes] filter by outcome ids or outcomes
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] wallet address
     * @returns {object[]} a list of [prediction position structures](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    fetchPositions(outcomes?: Strings, params?: {}): Promise<PredictionPosition[]>;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parsePredictionPosition
     * @description parses a spot balance entry for an outcome token into a unified position object
     * @param {object} position the raw balance entry
     * @param {object} [market] the outcome object the position belongs to
     * @returns {object} a [prediction position structure](https://docs.ccxt.com/#/?id=prediction-position-structure)
     */
    parsePredictionPosition(position: Dict, market?: Market): PredictionPosition;
    findOutcomeInMarket(market: Market, sideHint?: Str): Dict;
    parseOutcomeInputSideHint(outcomeInput: string): Str;
    resolveOutcomeInput(outcomeInput: string): Dict;
    /**
     * @method
     * @name hyperliquid#createOrder
     * @description creates a limit or market order for an outcome market
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#place-an-order
     * @param {string} outcome unified outcome
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
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    createOrder(outcome: string, type: string, side: string, amount: number, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name hyperliquid#cancelOrder
     * @description cancels a single open order
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
     * @param {string} id order id
     * @param {string} [outcome] unified outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.clientOrderId] cancel by client order id
     * @param {string} [params.vaultAddress] optional subaccount/vault address to cancel on behalf of
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrder(id: string, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name hyperliquid#cancelOrders
     * @description cancels multiple open orders
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint#cancel-order-s
     * @param {string[]} ids order ids
     * @param {string} [outcome] unified outcome (required)
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    cancelOrders(ids: string[], outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name hyperliquid#fetchOpenOrders
     * @description fetches currently open orders for the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-open-orders
     * @param {string} [outcome] filter by outcome
     * @param {int} [since] only return orders updated since this timestamp in ms
     * @param {int} [limit] max number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] wallet address
     * @param {string} [params.method] 'openOrders' | 'frontendOpenOrders' (default)
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOpenOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name hyperliquid#fetchOrders
     * @description fetches all historical orders for the user
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-historical-orders
     * @param {string} [outcome] filter by outcome
     * @param {int} [since] only return orders updated since this timestamp in ms
     * @param {int} [limit] max number of orders to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] wallet address
     * @returns {object[]} a list of [prediction order structures](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name hyperliquid#fetchOrder
     * @description fetches a single order by id
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#query-order-status-by-oid-or-cloid
     * @param {string} id order id
     * @param {string} [outcome] outcome
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] wallet address
     * @param {string} [params.clientOrderId] fetch by client order id instead
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    fetchOrder(id: string, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parsePredictionOrder
     * @description parses a raw hyperliquid order object into a unified order object
     * @param {object} order the raw order object
     * @param {object} [market] the market the order belongs to
     * @returns {object} a [prediction order structure](https://docs.ccxt.com/#/?id=prediction-order-structure)
     */
    parsePredictionOrder(order: Dict, market?: Market): PredictionOrder;
    parseOrderStatus(status: Str): Str;
    parseOrderType(status: Str): Str;
    parseTimeInForce(timeInForce: Str): Str;
    /**
     * @method
     * @name hyperliquid#fetchTrades
     * @description fetches the most recent public trades for an outcome
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-coins-recent-trades
     * @param {string} outcome unified outcome
     * @param {int} [since] only return trades at or after this timestamp in ms
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchTrades(outcome: string, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name hyperliquid#fetchMyTrades
     * @description fetches the authenticated user's fill history
     * @see https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint#retrieve-a-users-fills
     * @param {string} [outcome] filter by outcome
     * @param {int} [since] start timestamp in ms
     * @param {int} [limit] max number of trades to return
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @param {string} [params.user] wallet address
     * @param {int} [params.until] end timestamp in ms
     * @returns {object[]} a list of [prediction trade structures](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    fetchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @ignore
     * @method
     * @name hyperliquid#parsePredictionTrade
     * @description parses a single hyperliquid fill into a unified trade object
     * @param {object} trade the raw fill object
     * @param {object} [market] the market the trade belongs to
     * @returns {object} a [prediction trade structure](https://docs.ccxt.com/#/?id=prediction-trade-structure)
     */
    parsePredictionTrade(trade: Dict, market?: Market): PredictionTrade;
    /**
     * @method
     * @name hyperliquid#fetchEvents
     * @description Groups outcome markets by their underlying (e.g. BTC_ABOVE_78213) into event structures. Each event contains both the YES and NO markets.
     * @param {object} [params] extra parameters
     * @param {string} [params.query] a single query string to filter by (matches description/outcome)
     * @param {string[]} [params.queries] multiple query strings (alternative to query)
     * @returns {PredictionEvent[]} array of event structures
     */
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
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
    initializeClient(): Promise<any>;
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
