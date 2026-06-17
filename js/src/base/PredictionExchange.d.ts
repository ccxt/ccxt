import { Exchange } from './Exchange.js';
import type { Str, Strings, Num, Int, Bool, Dictionary, Ticker, OrderBook, OHLCV, Trade, Order, OrderType, OrderSide, Dict, PredictionTicker, PredictionOrder, PredictionTrade, PredictionPosition } from './types.js';
/**
 * @class PredictionExchange
 * @augments Exchange
 * @description Base class for prediction-market exchanges. It carries the
 * prediction-specific state (events / outcomes) and helpers, and re-declares the
 * single-market unified methods using an `outcome` symbol instead of a `symbol`.
 */
export default class PredictionExchange extends Exchange {
    outcomes: Dictionary<any>;
    outcomes_by_id: Dictionary<any>;
    events: Dictionary<any>;
    events_by_slug: Dictionary<any>;
    reloadingEvents: Bool;
    eventsLoading: Promise<Dictionary<any>>;
    isPrediction(): boolean;
    loadMarketsAndEvents(reload?: boolean, params?: {}): Promise<{
        markets: Dictionary<import("./types.js").MarketInterface>;
        events: Dictionary<any>;
    }>;
    checkEventsAndMarkets(outcome?: Str): void;
    parseSearchQueries(params?: {}): Strings;
    fetchEvents(params?: {}): Promise<any[]>;
    fetchEvent(id: string, params?: {}): Promise<any>;
    setEvents(events: any[]): Dictionary<any>;
    loadEventsHelper(reload?: boolean, params?: {}): Promise<Dictionary<any>>;
    loadEvents(reload?: boolean, params?: {}): Promise<Dictionary<any>>;
    outcome(outcomeSymbol: string): any;
    safeOutcome(outcomeIdOrSymbol: Str, outcomeObj?: any): any;
    safeOutcomeSymbol(outcomeIdOrSymbol: Str, outcomeObj?: any): Str;
    shortenSlug(slug: string): string;
    slugToMarketSymbol(eventSlug: string, marketSlug: string): string;
    slugToOutcomeSymbol(eventSlug: string, marketSlug: string, outcome: string): string;
    slugToMarketId(eventSlug: string, marketSlug: string, outcome: string): string;
    setMarkets(markets: any, currencies?: any): Dictionary<any>;
    setOutcomesFromMarkets(): void;
    fetchTicker(outcome: string, params?: {}): Promise<Ticker>;
    fetchOrderBook(outcome: string, limit?: Int, params?: {}): Promise<OrderBook>;
    fetchOHLCV(outcome: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    fetchTrades(outcome: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    createOrder(outcome: string, type: OrderType, side: OrderSide, amount: number, price?: Num, params?: {}): Promise<Order>;
    cancelOrder(id: string, outcome?: Str, params?: {}): Promise<Order>;
    watchTicker(outcome: string, params?: {}): Promise<Ticker>;
    watchOrderBook(outcome: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchTrades(outcome: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    safePredictionOrder(order: Dict, market?: any): PredictionOrder;
    safePredictionTrade(trade: Dict, market?: any): PredictionTrade;
    safePredictionTicker(ticker: Dict, market?: any): PredictionTicker;
    safePredictionPosition(position: Dict): PredictionPosition;
    toPredictionStructure(parsed: Dict, raw: Dict): any;
    filterByOutcomeSinceLimit(array: any, outcome?: Str, since?: Int, limit?: Int, tail?: boolean): any;
    filterByOutcomesSinceLimit(array: any, outcomes?: string[], since?: Int, limit?: Int, tail?: boolean): any;
    amountToPredictionPrecision(outcome: string, amount: any): string;
    priceToPredictionPrecision(outcome: string, price: any): string;
    costToPredictionPrecision(outcome: string, cost: any): string;
}
