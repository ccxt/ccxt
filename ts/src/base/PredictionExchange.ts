// ----------------------------------------------------------------------------

import { Exchange } from './Exchange.js';
import { ExchangeError, BadSymbol, NotSupported, ArgumentsRequired } from './errors.js';
import type { Str, Strings, Num, Int, Bool, Dictionary, Ticker, OrderBook, OHLCV, Trade, Order, OrderType, OrderSide, Dict, PredictionTicker, PredictionOrder, PredictionTrade, PredictionPosition } from './types.js';

// ----------------------------------------------------------------------------

/**
 * @class PredictionExchange
 * @augments Exchange
 * @description Base class for prediction-market exchanges. It carries the
 * prediction-specific state (events / outcomes) and helpers, and re-declares the
 * single-market unified methods using an `outcome` symbol instead of a `symbol`.
 */
export default class PredictionExchange extends Exchange {
    outcomes: Dictionary<any> = undefined;
    outcomes_by_id: Dictionary<any> = undefined;
    events: Dictionary<any> = undefined;
    events_by_slug: Dictionary<any> = undefined;
    reloadingEvents: Bool = undefined;
    eventsLoading: Promise<Dictionary<any>> = undefined;

    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

    isPrediction (): boolean {
        return this.safeBool (this.has, 'prediction', false);
    }

    async loadMarketsAndEvents (reload = false, params = {}) {
        const res = await Promise.all ([ this.loadMarkets (reload, params), this.loadEvents (reload, params) ]);
        return {
            'markets': res[0],
            'events': res[1],
        };
    }

    checkEventsAndMarkets (outcome: Str = undefined) {
        // pure synchronous guard (no I/O) — callers invoke it without await, so leaving it
        // async would make the coroutine never run in Python/PHP and silently skip validation.
        // outcomes are the real dependency for resolving a symbol; they are populated by
        // fetchEvents and also rebuilt from cached markets (loadMarkets), so accept either.
        // rebuild lazily from cached markets here because the setMarkets override that
        // normally does it is not dispatched by the base loadMarkets under the AST languages.
        if ((!this.outcomes || this.isEmpty (this.outcomes)) && !this.isEmpty (this.markets)) {
            this.setOutcomesFromMarkets ();
        }
        if (!this.outcomes || this.isEmpty (this.outcomes)) {
            throw new ArgumentsRequired ('Outcomes are required to be loaded, please fetch them first using fetchEvents (or loadMarkets)');
        }
        if (outcome !== undefined) {
            if (!(outcome in this.outcomes) && !(outcome in this.outcomes_by_id)) {
                throw new ArgumentsRequired ('The specified outcome is not valid/available, please fetch events and outcomes first using fetchEvents');
            }
        }
    }

    parseSearchQueries (params = {}): Strings {
        // accepts either `query` (a single search string) or `queries` (a list of strings)
        const singleQuery = this.safeString (params, 'query');
        if (singleQuery !== undefined) {
            return [ singleQuery ];
        }
        return this.safeList (params, 'queries', []);
    }

    async fetchEvents (params = {}): Promise<any[]> {
        throw new NotSupported (this.id + ' fetchEvents() is not supported yet');
    }

    async fetchEvent (id: string, params = {}): Promise<any> {
        throw new NotSupported (this.id + ' fetchEvent() is not supported yet');
    }

    setEvents (events: any[]): Dictionary<any> {
        this.events = {};
        this.events_by_slug = {};
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const id = this.safeString (event, 'id');
            const slug = this.safeString (event, 'slug');
            if (id !== undefined) {
                this.events[id] = event;
            }
            if (slug !== undefined) {
                this.events_by_slug[slug] = event;
            }
        }
        return this.events;
    }

    async loadEventsHelper (reload = false, params = {}) {
        if (!reload && this.events) {
            return this.events;
        }
        const events = await this.fetchEvents (params);
        return this.setEvents (events);
    }

    async loadEvents (reload = false, params = {}): Promise<Dictionary<any>> {
        return await this.loadEventsHelper (reload, params);
    }

    outcome (outcomeSymbol: string): any {
        if (this.outcomes === undefined) {
            throw new ExchangeError (this.id + ' outcomes not loaded');
        }
        if (outcomeSymbol in this.outcomes) {
            return this.outcomes[outcomeSymbol];
        }
        if (outcomeSymbol in this.outcomes_by_id) {
            return this.outcomes_by_id[outcomeSymbol];
        }
        throw new BadSymbol (this.id + ' does not have outcome symbol ' + outcomeSymbol);
    }

    safeOutcome (outcomeIdOrSymbol: Str, outcomeObj: any = undefined): any {
        if (outcomeIdOrSymbol !== undefined) {
            if ((this.outcomes !== undefined) && (outcomeIdOrSymbol in this.outcomes)) {
                return this.outcomes[outcomeIdOrSymbol];
            }
            if ((this.outcomes_by_id !== undefined) && (outcomeIdOrSymbol in this.outcomes_by_id)) {
                return this.outcomes_by_id[outcomeIdOrSymbol];
            }
        }
        if (outcomeObj !== undefined) {
            return outcomeObj;
        }
        return { 'outcome': outcomeIdOrSymbol, 'outcomeId': outcomeIdOrSymbol, 'market': undefined, 'label': undefined, 'info': {}};
    }

    safeOutcomeSymbol (outcomeIdOrSymbol: Str, outcomeObj: any = undefined): Str {
        outcomeObj = this.safeOutcome (outcomeIdOrSymbol, outcomeObj);
        return outcomeObj['outcome'];
    }

    shortenSlug (slug: string): string {
        const replacements = {
            'federal-reserve': 'fed',
            'interest-rates': 'rates',
            'interest-rate': 'rate',
            'basis-points': 'bps',
            'basis-point': 'bp',
            'executive-order': 'eo',
            'united-states': 'us',
            'united-kingdom': 'uk',
            'european-union': 'eu',
            'artificial-intelligence': 'ai',
            'republican-party': 'gop',
            'democratic-party': 'dems',
            'stock-market': 'market',
            'price-target': 'pt',
            'market-cap': 'mcap',
            'increase': 'hike',
            'decrease': 'cut',
            'higher': 'up',
            'lower': 'down',
            'greater': 'gt',
            'less': 'lt',
            'million': 'M',
            'billion': 'B',
            'trillion': 'T',
            'percent': 'pct',
        };
        const stopWords = [
            'will', 'the', 'a', 'an', 'after', 'before', 'in', 'at', 'by',
            'of', 'there', 'be', 'to', 'or', 'and', 'for', 'on', 'its',
            'that', 'this', 'from', 'with', 'as', 'is', 'are', 'was', 'were', '?', 'how', 'many', 'who', 'what', 'when', 'where', 'which', 'much',
        ];
        const lower = (slug === undefined) ? '' : slug.toLowerCase ();
        const allowed = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const chars = this.stringToCharsArray (lower);
        let s = '';
        let lastDash = true; // start true to drop leading separators
        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            if (allowed.indexOf (ch) >= 0) {
                s = s + ch;
                lastDash = false;
            } else if (!lastDash) {
                s = s + '-';
                lastDash = true;
            }
        }
        const replacementKeys = Object.keys (replacements);
        for (let i = 0; i < replacementKeys.length; i++) {
            const replacementKey = replacementKeys[i];
            const replacementValue = this.safeString (replacements, replacementKey);
            s = s.replaceAll (replacementKey, replacementValue);
        }
        const rawParts = s.split ('-');
        const parts = [];
        for (let i = 0; i < rawParts.length; i++) {
            const w = rawParts[i];
            if (w.length > 0 && !this.inArray (w, stopWords)) {
                parts.push (w);
            }
        }
        const joined = parts.join ('_');
        return joined.toUpperCase ();
    }

    slugToMarketSymbol (eventSlug: string, marketSlug: string): string {
        return this.shortenSlug (marketSlug);
    }

    slugToOutcomeSymbol (eventSlug: string, marketSlug: string, outcome: string): string {
        return this.shortenSlug (marketSlug) + ':' + outcome.toUpperCase ();
    }

    slugToMarketId (eventSlug: string, marketSlug: string, outcome: string): string {
        return this.slugToOutcomeSymbol (eventSlug, marketSlug, outcome);
    }

    setMarkets (markets, currencies = undefined) {
        const result = super.setMarkets (markets, currencies);
        this.setOutcomesFromMarkets ();
        return result;
    }

    setOutcomesFromMarkets () {
        // prediction markets carry their outcome tokens under the outcomes key,
        // rebuild the outcome lookup caches so cached market data works offline.
        // normalize each outcome object to the canonical identity keys (outcome /
        // outcomeId / market) so consumers and the safe* helpers are uniform even when
        // an exchange's parseMarket still emits the legacy symbol / id / marketSymbol keys.
        this.outcomes = {};
        this.outcomes_by_id = {};
        const marketKeys = Object.keys (this.markets);
        for (let i = 0; i < marketKeys.length; i++) {
            const market = this.markets[marketKeys[i]];
            const outcomesList = this.safeList (market, 'outcomes', []);
            for (let j = 0; j < outcomesList.length; j++) {
                const oc = outcomesList[j];
                const ocSymbol = this.safeString2 (oc, 'outcome', 'symbol');
                const ocId = this.safeString2 (oc, 'outcomeId', 'id');
                // assign unconditionally — safeString2 keeps the canonical key when present
                // and falls back to the legacy one, so this never clobbers and avoids a
                // missing-key access (which throws in Python/PHP, unlike TS undefined)
                oc['outcome'] = ocSymbol;
                oc['outcomeId'] = ocId;
                oc['market'] = this.safeString2 (oc, 'market', 'marketSymbol');
                if (ocSymbol !== undefined) {
                    this.outcomes[ocSymbol] = oc;
                }
                if (ocId !== undefined) {
                    this.outcomes_by_id[ocId] = oc;
                }
            }
        }
    }

    async fetchTicker (outcome: string, params = {}): Promise<Ticker> {
        return await super.fetchTicker (outcome, params);
    }

    async fetchOrderBook (outcome: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        return await super.fetchOrderBook (outcome, limit, params);
    }

    async fetchOHLCV (outcome: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        return await super.fetchOHLCV (outcome, timeframe, since, limit, params);
    }

    async fetchTrades (outcome: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await super.fetchTrades (outcome, since, limit, params);
    }

    async createOrder (outcome: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<Order> {
        return await super.createOrder (outcome, type, side, amount, price, params);
    }

    async cancelOrder (id: string, outcome: Str = undefined, params = {}): Promise<Order> {
        return await super.cancelOrder (id, outcome, params);
    }

    async watchTicker (outcome: string, params = {}): Promise<Ticker> {
        return await super.watchTicker (outcome, params);
    }

    async watchOrderBook (outcome: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        return await super.watchOrderBook (outcome, limit, params);
    }

    async watchTrades (outcome: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        return await super.watchTrades (outcome, since, limit, params);
    }

    safePredictionOrder (order: Dict, market = undefined): PredictionOrder {
        const parsed = super.safeOrder (order, market);
        return this.toPredictionStructure (parsed, order);
    }

    safePredictionTrade (trade: Dict, market = undefined): PredictionTrade {
        const parsed = super.safeTrade (trade, market);
        return this.toPredictionStructure (parsed, trade);
    }

    safePredictionTicker (ticker: Dict, market = undefined): PredictionTicker {
        const parsed = super.safeTicker (ticker, market);
        return this.toPredictionStructure (parsed, ticker);
    }

    safePredictionPosition (position: Dict): PredictionPosition {
        const parsed = super.safePosition (position);
        return this.toPredictionStructure (parsed, position);
    }

    toPredictionStructure (parsed: Dict, raw: Dict): any {
        // rename the unified `symbol` to the prediction `outcome` handle and attach the
        // prediction identity fields (raw exchange id, label, parent market/event) that the
        // base safe* helpers drop. the exchange parser passes them on the raw input dict.
        const outcomeSymbol = this.safeString2 (raw, 'outcome', 'symbol');
        parsed['outcome'] = outcomeSymbol;
        parsed['outcomeId'] = this.safeString (raw, 'outcomeId');
        parsed['label'] = this.safeString (raw, 'label');
        parsed['market'] = this.safeString (raw, 'market');
        parsed['event'] = this.safeString (raw, 'event');
        delete parsed['symbol'];
        return parsed;
    }

    filterByOutcomeSinceLimit (array, outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, tail = false) {
        return this.filterByValueSinceLimit (array, 'outcome', outcome, since, limit, 'timestamp', tail);
    }

    filterByOutcomesSinceLimit (array, outcomes: string[] = undefined, since: Int = undefined, limit: Int = undefined, tail = false) {
        const result = this.filterByArray (array, 'outcome', outcomes, false);
        return this.filterBySinceLimit (result, since, limit, 'timestamp', tail);
    }

    amountToPredictionPrecision (outcome: string, amount): string {
        const outcomeObj = this.outcome (outcome);
        const marketSymbol = this.safeString (outcomeObj, 'market');
        return this.amountToPrecision (marketSymbol, amount);
    }

    priceToPredictionPrecision (outcome: string, price): string {
        const outcomeObj = this.outcome (outcome);
        const marketSymbol = this.safeString (outcomeObj, 'market');
        return this.priceToPrecision (marketSymbol, price);
    }

    costToPredictionPrecision (outcome: string, cost): string {
        const outcomeObj = this.outcome (outcome);
        const marketSymbol = this.safeString (outcomeObj, 'market');
        return this.costToPrecision (marketSymbol, cost);
    }
}
