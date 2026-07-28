import { BaseExchange } from './Exchange.js';
import type { Str, Strings, Num, Int, Dictionary, OHLCV, OrderType, OrderSide, PredictionOrderRequest, Dict, Market, PredictionTicker, PredictionTickers, PredictionOrder, PredictionTrade, PredictionPosition, PredictionOrderBook, PredictionTradingFee, PredictionOpenInterest, PredictionEvent, PredictionSettlement, fetchEventsParams } from './types.js';
/**
 * @class PredictionExchange
 * @augments BaseExchange
 * @description Base class for prediction-market exchanges. It carries the
 * prediction-specific state (events / outcomes) and helpers, and re-declares the
 * single-market unified methods using an `outcome` symbol instead of a `symbol`.
 */
export default class PredictionExchange extends BaseExchange {
    outcomes: Dictionary<any>;
    outcomes_by_id: Dictionary<any>;
    events: Dictionary<any>;
    events_by_slug: Dictionary<any>;
    describe(): any;
    isPrediction(): boolean;
    parseSearchQueries(params?: {}): Strings;
    requireEventQuery(params?: {}): any;
    applyEventFetchParams(events: any[], params?: {}, queries?: string[]): any[];
    filterEventsByStatus(events: any[], status?: Str): any[];
    filterEventsBySearchIn(events: any[], queries: string[], searchIn?: Str): any[];
    normalizeTagKey(tag: string): string;
    filterEventsByTags(events: any[], tags?: string[]): any[];
    fetchEvents(params?: fetchEventsParams): Promise<PredictionEvent[]>;
    fetchEvent(id: string, params?: {}): Promise<PredictionEvent>;
    setEvents(events: any[]): Dictionary<any>;
    eventsList(): any[];
    loadEventsHelper(reload?: boolean, params?: {}): Promise<Dictionary<any>>;
    loadEvents(reload?: boolean, params?: {}): Promise<Dictionary<any>>;
    getEvent(eventIdOrSlug: string): any;
    outcome(outcomeSymbol: string): any;
    hasOutcome(outcomeIdOrSymbol: string): boolean;
    safeOutcome(outcomeIdOrSymbol: Str, outcomeObj?: any): any;
    safeOutcomeSymbol(outcomeIdOrSymbol: Str, outcomeObj?: any): Str;
    shortenSlug(slug: Str): string;
    slugToMarketSymbol(eventSlug: Str, marketSlug: string): string;
    slugToOutcomeSymbol(eventSlug: Str, marketSlug: string, outcome: string): string;
    setMarkets(markets: any, currencies?: any): Dictionary<any>;
    indexMarketOutcomes(market: any): void;
    populateOutcomes(): void;
    indexEventOutcomes(event: any): void;
    loadOutcomes(outcomes?: Strings, reload?: boolean, params?: {}): Promise<Dictionary<any>>;
    /**
     * @ignore
     * @method
     * @name PredictionExchange#fetchOutcomes
     * @description resolves several uncached outcomes. the base has no batch by-id endpoint, so it fetches them one by one through fetchOutcome (which throws BadSymbol for an unresolvable one); venues with a batch endpoint (kalshi, polymarket) override this to collapse the list into one request
     * @param {string[]} outcomeSymbols the uncached outcome handles or ids to resolve
     * @returns {object} the outcome cache
     */
    fetchOutcomes(outcomeSymbols: string[]): Promise<any>;
    loadOutcome(outcomeSymbol: string, reload?: boolean): Promise<any>;
    outcomeSearchQuery(outcomeSymbol: string): Str;
    fetchOutcome(outcomeSymbol: string): Promise<any>;
    /**
     * @method
     * @name fetchTicker
     * @description fetches a price ticker for a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    fetchTicker(outcome: string, params?: {}): Promise<PredictionTicker>;
    /**
     * @method
     * @name fetchTickers
     * @description fetches price tickers for multiple prediction outcomes at once
     * @param {string[]} [outcomes] unified outcome handles or outcome ids
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome
     */
    fetchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @method
     * @name fetchOrderBook
     * @description fetches the order book for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {int} [limit] the maximum number of order book entries to return
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    fetchOrderBook(outcome: string, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @method
     * @name fetchOHLCV
     * @description fetches historical candlestick data for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {string} timeframe the length of time each candle represents
     * @param {int} [since] timestamp in ms of the earliest candle to fetch
     * @param {int} [limit] the maximum number of candles to fetch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {int[][]} a list of candles ordered as timestamp, open, high, low, close, volume
     */
    fetchOHLCV(outcome: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    /**
     * @method
     * @name fetchTrades
     * @description get the list of most recent trades for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    fetchTrades(outcome: string, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name createOrder
     * @description create a trade order on a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {string} type 'market' or 'limit'
     * @param {string} side 'buy' or 'sell'
     * @param {float} amount how many shares of the outcome to trade
     * @param {float} [price] the price at which the order is to be filled, in cost per share
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    createOrder(outcome: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} [outcome] unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelOrder(id: string, outcome?: Str, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name watchTicker
     * @description watches a price ticker for a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    watchTicker(outcome: string, params?: {}): Promise<PredictionTicker>;
    /**
     * @method
     * @name watchOrderBook
     * @description watches the order book for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {int} [limit] the maximum number of order book entries to return
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    watchOrderBook(outcome: string, limit?: Int, params?: {}): Promise<PredictionOrderBook>;
    /**
     * @method
     * @name watchTrades
     * @description watches the most recent trades for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    watchTrades(outcome: string, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name fetchOrders
     * @description fetches information on multiple orders made by the user
     * @param {string} [outcome] unified outcome handle
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name fetchOpenOrders
     * @description fetches information on the user's open orders
     * @param {string} [outcome] unified outcome handle
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchOpenOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name fetchClosedOrders
     * @description fetches information on multiple closed orders made by the user
     * @param {string} [outcome] unified outcome handle
     * @param {int} [since] timestamp in ms of the earliest order to fetch
     * @param {int} [limit] the maximum number of orders to fetch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    fetchClosedOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name fetchOrderTrades
     * @description fetch all the trades made from a single order
     * @param {string} id order id
     * @param {string} [outcome] unified outcome handle
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    fetchOrderTrades(id: string, outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name fetchMyTrades
     * @description fetch all trades made by the user
     * @param {string} [outcome] unified outcome handle
     * @param {int} [since] timestamp in ms of the earliest trade to fetch
     * @param {int} [limit] the maximum number of trades to fetch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    fetchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name fetchPosition
     * @description fetch the open position held on a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    fetchPosition(outcome: string, params?: {}): Promise<PredictionPosition>;
    /**
     * @method
     * @name fetchPositions
     * @description fetches the user's open positions
     * @param {string[]} [outcomes] unified outcome handles to filter by
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    fetchPositions(outcomes?: Strings, params?: {}): Promise<PredictionPosition[]>;
    /**
     * @method
     * @name fetchTradingFee
     * @description fetch the trading fee for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
     */
    fetchTradingFee(outcome: string, params?: {}): Promise<PredictionTradingFee>;
    /**
     * @method
     * @name fetchOpenInterest
     * @description fetch the open interest of a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
     */
    fetchOpenInterest(outcome: string, params?: {}): Promise<PredictionOpenInterest>;
    /**
     * @method
     * @name createOrders
     * @description create a list of trade orders
     * @param {object[]} orders a list of PredictionOrderRequest objects, each carrying an `outcome` handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    createOrders(orders: PredictionOrderRequest[], params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name cancelOrders
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} [outcome] unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    cancelOrders(ids: string[], outcome?: Str, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name createMarketBuyOrderWithCost
     * @description create a market buy order on a prediction outcome by providing the cost
     * @param {string} outcome unified outcome handle
     * @param {float} cost how much you want to spend, in cost terms
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    createMarketBuyOrderWithCost(outcome: string, cost: number, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name createMarketSellOrderWithCost
     * @description create a market sell order on a prediction outcome by providing the cost
     * @param {string} outcome unified outcome handle
     * @param {float} cost how much you want to receive, in cost terms
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    createMarketSellOrderWithCost(outcome: string, cost: number, params?: {}): Promise<PredictionOrder>;
    /**
     * @method
     * @name watchTickers
     * @description watches price tickers for multiple prediction outcomes
     * @param {string[]} [outcomes] unified outcome handles to watch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    watchTickers(outcomes?: Strings, params?: {}): Promise<PredictionTickers>;
    /**
     * @method
     * @name watchOrders
     * @description watches information on multiple orders made by the user
     * @param {string} [outcome] unified outcome handle
     * @param {int} [since] timestamp in ms of the earliest order to watch
     * @param {int} [limit] the maximum number of orders to watch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    watchOrders(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionOrder[]>;
    /**
     * @method
     * @name watchMyTrades
     * @description watches all trades made by the user
     * @param {string} [outcome] unified outcome handle
     * @param {int} [since] timestamp in ms of the earliest trade to watch
     * @param {int} [limit] the maximum number of trades to watch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
     */
    watchMyTrades(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionTrade[]>;
    /**
     * @method
     * @name watchPositions
     * @description watches the open positions held by the user
     * @param {string[]} [outcomes] unified outcome handles to watch
     * @param {int} [since] timestamp in ms of the earliest position to watch
     * @param {int} [limit] the maximum number of positions to watch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    watchPositions(outcomes?: Strings, since?: Int, limit?: Int, params?: {}): Promise<PredictionPosition[]>;
    /**
     * @method
     * @name fetchSettlements
     * @description fetches the user's settled (resolved) positions — the "close the loop" record after
     * markets resolve, with the collateral paid out and the realized pnl
     * @param {string} [outcome] filter to a single unified outcome handle
     * @param {int} [since] timestamp in ms of the earliest settlement to fetch
     * @param {int} [limit] the maximum number of settlements to fetch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction settlement structures
     */
    fetchSettlements(outcome?: Str, since?: Int, limit?: Int, params?: {}): Promise<PredictionSettlement[]>;
    safePredictionOrder(outcomeOrder: Dict, outcomeObj?: any): PredictionOrder;
    safePredictionTrade(trade: Dict, outcomeObj?: any): PredictionTrade;
    safePredictionTicker(ticker: Dict, outcomeObj?: any): PredictionTicker;
    safePredictionPosition(position: Dict): PredictionPosition;
    safePredictionOrderBook(orderbook: Dict, outcomeObj?: Dict): PredictionOrderBook;
    parsePredictionTicker(ticker: Dict, market?: Market): PredictionTicker;
    parsePredictionOrder(order: Dict, market?: Market): PredictionOrder;
    parsePredictionTrade(trade: Dict, market?: Market): PredictionTrade;
    parsePredictionPosition(position: Dict, market?: Market): PredictionPosition;
    parsePredictionOpenInterest(interest: Dict, market?: Market): PredictionOpenInterest;
    /**
     * @ignore
     * @method
     * @name PredictionExchange#parsePredictionTrades
     * @description parses a list of raw trades with the exchange's parsePredictionTrade, sorts them and filters by the outcome handle — the prediction analogue of the base parseTrades
     * @param {object[]} trades the raw trades
     * @param {object} [outcomeObj] the resolved outcome object the trades belong to
     * @param {int} [since] timestamp in ms of the earliest trade to return
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra fields to merge into every parsed trade
     * @returns {object[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    parsePredictionTrades(trades: any[], outcomeObj?: any, since?: Int, limit?: Int, params?: {}): PredictionTrade[];
    /**
     * @ignore
     * @method
     * @name PredictionExchange#parsePredictionOrders
     * @description parses a list of raw orders with the exchange's parsePredictionOrder, sorts them and filters by the outcome handle — the prediction analogue of the base parseOrders
     * @param {object[]} orders the raw orders
     * @param {object} [outcomeObj] the resolved outcome object the orders belong to
     * @param {int} [since] timestamp in ms of the earliest order to return
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra fields to merge into every parsed order
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    parsePredictionOrders(orders: any[], outcomeObj?: any, since?: Int, limit?: Int, params?: {}): PredictionOrder[];
    /**
     * @ignore
     * @method
     * @name PredictionExchange#parsePredictionPositions
     * @description parses a list of raw positions with the exchange's parsePredictionPosition — the prediction analogue of the base parsePositions
     * @param {object[]} positions the raw positions
     * @param {object} [params] extra fields to merge into every parsed position
     * @returns {object[]} a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    parsePredictionPositions(positions: any[], params?: {}): PredictionPosition[];
    filterByOutcomeSinceLimit(array: any, outcome?: Str, since?: Int, limit?: Int, tail?: boolean): any;
    filterByOutcomesSinceLimit(array: any, outcomes?: string[], since?: Int, limit?: Int, tail?: boolean): any;
    amountToPredictionPrecision(outcome: string, amount: any): string;
    priceToPredictionPrecision(outcome: string, price: any): string;
    costToPredictionPrecision(outcome: string, cost: any): string;
    padHexToEven(hex: string): string;
    padHexAddress(address: string): string;
    rlpEncodeBytes(hex: string): string;
    rlpEncodeList(items: string[]): string;
    intToRlpHex(value: number): string;
    hexToRlpBytes(hexValue: string): string;
    signEvmTransaction(tx: Dict, privateKey: string): string;
    ethRpc(rpcUrl: string, method: string, rpcParams: any[]): Promise<any>;
    sendEvmTransaction(rpcUrl: string, chainId: number, fromAddress: string, to: string, value: string, data: string, gasLimit: string): Promise<string>;
    waitForTransactionReceipt(rpcUrl: string, txHash: string, timeout?: number): Promise<any>;
}
