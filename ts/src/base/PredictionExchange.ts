// ----------------------------------------------------------------------------

import { Exchange } from './Exchange.js';
import { ExchangeError, BadSymbol, NotSupported, ArgumentsRequired } from './errors.js';
import type { Str, Strings, Num, Int, Bool, Dictionary, OHLCV, OrderType, OrderSide, PredictionOrderRequest, Dict, PredictionTicker, PredictionTickers, PredictionOrder, PredictionTrade, PredictionPosition, PredictionOrderBook, PredictionTradingFee, PredictionOpenInterest, fetchEventsParams } from './types.js';

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

    parseSearchQueries (params = {}): Strings {
        // accepts either `query` (a single search string) or `queries` (a list of strings)
        const singleQuery = this.safeString (params, 'query');
        if (singleQuery !== undefined) {
            return [ singleQuery ];
        }
        return this.safeList (params, 'queries', []);
    }

    requireEventQuery (params = {}) {
        // fetchEvents must be scoped by at least one selector — an unfiltered call would page the
        // entire exchange. require one of query / queries / tags / eventId / slug
        const query = this.safeString (params, 'query');
        const queries = this.safeList (params, 'queries', []);
        const tags = this.safeList (params, 'tags', []);
        const eventId = this.safeString (params, 'eventId');
        const slug = this.safeString (params, 'slug');
        if ((query === undefined) && (queries.length === 0) && (tags.length === 0) && (eventId === undefined) && (slug === undefined)) {
            throw new ArgumentsRequired (this.id + ' fetchEvents() requires at least one of query, queries, tags, eventId or slug to scope the search');
        }
        return undefined;
    }

    applyEventFetchParams (events: any[], params = {}, queries: string[] = undefined): any[] {
        // applies the unified fetchEvents options client-side (eventId/slug/status/searchIn/sort/limit)
        // so exchanges whose API can't filter natively still support them consistently
        let result = events;
        const eventId = this.safeString (params, 'eventId');
        const slug = this.safeString (params, 'slug');
        if ((eventId !== undefined) || (slug !== undefined)) {
            const filtered = [];
            for (let i = 0; i < result.length; i++) {
                const event = result[i];
                const idMatch = (eventId !== undefined) && (this.safeString (event, 'id') === eventId);
                const slugMatch = (slug !== undefined) && (this.safeString (event, 'slug') === slug);
                if (idMatch || slugMatch) {
                    filtered.push (event);
                }
            }
            result = filtered;
        }
        result = this.filterEventsByStatus (result, this.safeString (params, 'status'));
        // own-line length read so the regex transpiler treats `queries` as an array (count())
        // and not a string (strlen()); guard undefined since the default is undefined
        let queriesLength = 0;
        if (queries !== undefined) {
            queriesLength = queries.length;
        }
        if (queriesLength > 0) {
            result = this.filterEventsBySearchIn (result, queries, this.safeString (params, 'searchIn'));
        }
        const sort = this.safeString (params, 'sort');
        if (sort !== undefined) {
            let sortKey = undefined;
            if (sort === 'volume') {
                sortKey = 'volume';
            } else if (sort === 'liquidity') {
                sortKey = 'liquidity';
            } else if (sort === 'newest') {
                sortKey = 'created';
            }
            if (sortKey !== undefined) {
                result = this.sortBy (result, sortKey, true, 0);
            }
        }
        const limit = this.safeInteger (params, 'limit');
        if (limit !== undefined) {
            result = this.arraySlice (result, 0, limit);
        }
        return result;
    }

    filterEventsByStatus (events: any[], status: Str = undefined): any[] {
        // 'active' | 'inactive' | 'closed' | 'all' — 'inactive' and 'closed' are interchangeable
        if ((status === undefined) || (status === 'all')) {
            return events;
        }
        const wantActive = (status === 'active');
        const result = [];
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const isActive = this.safeBool (event, 'active');
            // keep events whose status is unknown (already filtered server-side, no `active` field)
            if ((isActive === undefined) || (isActive === wantActive)) {
                result.push (event);
            }
        }
        return result;
    }

    filterEventsBySearchIn (events: any[], queries: string[], searchIn: Str = undefined): any[] {
        // keep events whose title and/or description contains one of the queries (searchIn defaults to 'both')
        // own-line length read so the regex transpiler uses count() (array) not strlen() (string)
        let queriesLength = 0;
        if (queries !== undefined) {
            queriesLength = queries.length;
        }
        if ((searchIn === undefined) || (queries === undefined) || (queriesLength === 0)) {
            return events;
        }
        const checkTitle = (searchIn === 'title') || (searchIn === 'both');
        const checkDescription = (searchIn === 'description') || (searchIn === 'both');
        const result = [];
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const title = this.safeStringLower (event, 'title', '');
            const description = this.safeStringLower (event, 'description', '');
            let matched = false;
            for (let qi = 0; qi < queries.length; qi++) {
                const q = queries[qi].toLowerCase ();
                if (checkTitle && (title.indexOf (q) >= 0)) {
                    matched = true;
                    break;
                }
                if (checkDescription && (description.indexOf (q) >= 0)) {
                    matched = true;
                    break;
                }
            }
            if (matched) {
                result.push (event);
            }
        }
        return result;
    }

    async fetchEvents (params: fetchEventsParams = {}): Promise<any[]> {
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
        this.populateOutcomes ();
        return result;
    }

    populateOutcomes () {
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

    async loadOutcomes (reload = false, params = {}) {
        // outcome-addressed methods (fetchTicker/createOrder/...) call this first, mirroring how
        // every regular ccxt method calls loadMarkets(). reload/params mirror loadMarkets: reload
        // true refetches and rebuilds. idempotent otherwise: once outcomes are populated (here, or
        // already by an explicit fetchEvents/loadMarkets), later calls no-op and return the cache.
        // loadMarkets() does the actual fetch; populateOutcomes() then rebuilds the lookup caches
        // from the loaded markets (the setMarkets override that normally does this is not dispatched
        // by the base loadMarkets under the Go/C#/Java transpilers).
        if (!reload && (this.outcomes !== undefined) && !this.isEmpty (this.outcomes)) {
            return this.outcomes;
        }
        await this.loadMarkets (reload, params);
        this.populateOutcomes ();
        return this.outcomes;
    }

    async loadOutcome (outcomeSymbol: string) {
        // resolve a single outcome — the per-outcome analogue of loadMarkets()+market(). a cache hit
        // returns at once. on a miss, options.loadAllOutcomes (default true) bulk-loads the whole set
        // once so later lookups are 0-network hits; exchanges with too many markets to bulk-load
        // (kalshi) set it false and override fetchOutcome to fetch just the requested one on demand.
        if (this.outcomes !== undefined) {
            if (outcomeSymbol in this.outcomes) {
                return this.outcomes[outcomeSymbol];
            }
            if ((this.outcomes_by_id !== undefined) && (outcomeSymbol in this.outcomes_by_id)) {
                return this.outcomes_by_id[outcomeSymbol];
            }
        }
        const loadAll = this.safeBool (this.options, 'loadAllOutcomes', true);
        if (loadAll) {
            await this.loadOutcomes ();
            if (this.outcomes !== undefined) {
                if (outcomeSymbol in this.outcomes) {
                    return this.outcomes[outcomeSymbol];
                }
                if ((this.outcomes_by_id !== undefined) && (outcomeSymbol in this.outcomes_by_id)) {
                    return this.outcomes_by_id[outcomeSymbol];
                }
            }
        }
        return await this.fetchOutcome (outcomeSymbol);
    }

    async fetchOutcome (outcomeSymbol: string) {
        // fetch just one outcome on demand. the base has no generic single-outcome endpoint, so it
        // resolves from the already-loaded set (loadOutcomes() is a cached no-op once warmed, and
        // this throws BadSymbol if the outcome is absent); exchanges with a by-id market fetch (kalshi)
        // override this to fetch and cache only the requested outcome — the "always fetch one" path.
        await this.loadOutcomes ();
        return this.outcome (outcomeSymbol);
    }

    /**
     * @method
     * @name fetchTicker
     * @description fetches a price ticker for a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async fetchTicker (outcome: string, params = {}): Promise<PredictionTicker> {
        return await super.fetchTicker (outcome, params) as PredictionTicker;
    }

    /**
     * @method
     * @name fetchOrderBook
     * @description fetches the order book for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {int} [limit] the maximum number of order book entries to return
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    async fetchOrderBook (outcome: string, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        return await super.fetchOrderBook (outcome, limit, params) as PredictionOrderBook;
    }

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
    async fetchOHLCV (outcome: string, timeframe: string = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        return await super.fetchOHLCV (outcome, timeframe, since, limit, params);
    }

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
    async fetchTrades (outcome: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        return await super.fetchTrades (outcome, since, limit, params) as PredictionTrade[];
    }

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
    async createOrder (outcome: string, type: OrderType, side: OrderSide, amount: number, price: Num = undefined, params = {}): Promise<PredictionOrder> {
        return await super.createOrder (outcome, type, side, amount, price, params) as PredictionOrder;
    }

    /**
     * @method
     * @name cancelOrder
     * @description cancels an open order
     * @param {string} id order id
     * @param {string} [outcome] unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelOrder (id: string, outcome: Str = undefined, params = {}): Promise<PredictionOrder> {
        return await super.cancelOrder (id, outcome, params) as PredictionOrder;
    }

    /**
     * @method
     * @name watchTicker
     * @description watches a price ticker for a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async watchTicker (outcome: string, params = {}): Promise<PredictionTicker> {
        return await super.watchTicker (outcome, params) as PredictionTicker;
    }

    /**
     * @method
     * @name watchOrderBook
     * @description watches the order book for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {int} [limit] the maximum number of order book entries to return
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
     */
    async watchOrderBook (outcome: string, limit: Int = undefined, params = {}): Promise<PredictionOrderBook> {
        return await super.watchOrderBook (outcome, limit, params) as PredictionOrderBook;
    }

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
    async watchTrades (outcome: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        return await super.watchTrades (outcome, since, limit, params) as PredictionTrade[];
    }

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
    async fetchOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        throw new NotSupported (this.id + ' fetchOrders() is not supported yet');
    }

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
    async fetchClosedOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        throw new NotSupported (this.id + ' fetchClosedOrders() is not supported yet');
    }

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
    async fetchOrderTrades (id: string, outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        throw new NotSupported (this.id + ' fetchOrderTrades() is not supported yet');
    }

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
    async fetchMyTrades (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        throw new NotSupported (this.id + ' fetchMyTrades() is not supported yet');
    }

    /**
     * @method
     * @name fetchPosition
     * @description fetch the open position held on a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    async fetchPosition (outcome: string, params = {}): Promise<PredictionPosition> {
        throw new NotSupported (this.id + ' fetchPosition() is not supported yet');
    }

    /**
     * @method
     * @name fetchTradingFee
     * @description fetch the trading fee for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
     */
    async fetchTradingFee (outcome: string, params = {}): Promise<PredictionTradingFee> {
        throw new NotSupported (this.id + ' fetchTradingFee() is not supported yet');
    }

    /**
     * @method
     * @name fetchOpenInterest
     * @description fetch the open interest of a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
     */
    async fetchOpenInterest (outcome: string, params = {}): Promise<PredictionOpenInterest> {
        throw new NotSupported (this.id + ' fetchOpenInterest() is not supported yet');
    }

    /**
     * @method
     * @name createOrders
     * @description create a list of trade orders
     * @param {object[]} orders a list of PredictionOrderRequest objects, each carrying an `outcome` handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createOrders (orders: PredictionOrderRequest[], params = {}): Promise<PredictionOrder[]> {
        throw new NotSupported (this.id + ' createOrders() is not supported yet');
    }

    /**
     * @method
     * @name cancelOrders
     * @description cancel multiple orders
     * @param {string[]} ids order ids
     * @param {string} [outcome] unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async cancelOrders (ids: string[], outcome: Str = undefined, params = {}): Promise<PredictionOrder[]> {
        throw new NotSupported (this.id + ' cancelOrders() is not supported yet');
    }

    /**
     * @method
     * @name createMarketBuyOrderWithCost
     * @description create a market buy order on a prediction outcome by providing the cost
     * @param {string} outcome unified outcome handle
     * @param {float} cost how much you want to spend, in cost terms
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createMarketBuyOrderWithCost (outcome: string, cost: number, params = {}): Promise<PredictionOrder> {
        if (this.options['createMarketBuyOrderRequiresPrice'] || this.has['createMarketBuyOrderWithCost']) {
            return await this.createOrder (outcome, 'market', 'buy', cost, 1, params);
        }
        throw new NotSupported (this.id + ' createMarketBuyOrderWithCost() is not supported yet');
    }

    /**
     * @method
     * @name createMarketSellOrderWithCost
     * @description create a market sell order on a prediction outcome by providing the cost
     * @param {string} outcome unified outcome handle
     * @param {float} cost how much you want to receive, in cost terms
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createMarketSellOrderWithCost (outcome: string, cost: number, params = {}): Promise<PredictionOrder> {
        if (this.options['createMarketSellOrderRequiresPrice'] || this.has['createMarketSellOrderWithCost']) {
            return await this.createOrder (outcome, 'market', 'sell', cost, 1, params);
        }
        throw new NotSupported (this.id + ' createMarketSellOrderWithCost() is not supported yet');
    }

    /**
     * @method
     * @name watchTickers
     * @description watches price tickers for multiple prediction outcomes
     * @param {string[]} [outcomes] unified outcome handles to watch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async watchTickers (outcomes: Strings = undefined, params = {}): Promise<PredictionTickers> {
        throw new NotSupported (this.id + ' watchTickers() is not supported yet');
    }

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
    async watchOrders (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionOrder[]> {
        throw new NotSupported (this.id + ' watchOrders() is not supported yet');
    }

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
    async watchMyTrades (outcome: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionTrade[]> {
        throw new NotSupported (this.id + ' watchMyTrades() is not supported yet');
    }

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
    async watchPositions (outcomes: Strings = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<PredictionPosition[]> {
        throw new NotSupported (this.id + ' watchPositions() is not supported yet');
    }

    safePredictionOrder (order: Dict, market = undefined): PredictionOrder {
        // the prediction identity is the `outcome` handle carried on the raw dict (read by
        // toPredictionStructure), not a ccxt `symbol`, so don't pass an outcome object as a market
        const parsed = super.safeOrder (order);
        return this.toPredictionStructure (parsed, order);
    }

    safePredictionTrade (trade: Dict, market = undefined): PredictionTrade {
        const parsed = super.safeTrade (trade);
        return this.toPredictionStructure (parsed, trade);
    }

    safePredictionTicker (ticker: Dict, market = undefined): PredictionTicker {
        const parsed = super.safeTicker (ticker);
        return this.toPredictionStructure (parsed, ticker);
    }

    safePredictionPosition (position: Dict): PredictionPosition {
        const parsed = super.safePosition (position);
        return this.toPredictionStructure (parsed, position);
    }

    safePredictionOrderBook (orderbook: Dict, outcomeObj: Dict = undefined): PredictionOrderBook {
        // normalize a parsed order book to the prediction shape: replace the unified
        // `symbol` with the `outcome` handle and attach the outcome identity fields
        // (outcomeId / market) so books match the PredictionOrderBook structure.
        const fallback = this.safeString2 (orderbook, 'outcome', 'symbol');
        orderbook['outcome'] = (outcomeObj === undefined) ? fallback : this.safeString (outcomeObj, 'outcome', fallback);
        orderbook['outcomeId'] = (outcomeObj === undefined) ? this.safeString (orderbook, 'outcomeId') : this.safeString (outcomeObj, 'outcomeId');
        orderbook['market'] = (outcomeObj === undefined) ? this.safeString (orderbook, 'market') : this.safeString (outcomeObj, 'market');
        // omit (not delete) — `del dict['symbol']` raises KeyError in python/php when absent
        return this.omit (orderbook, 'symbol') as PredictionOrderBook;
    }

    toPredictionStructure (parsed: Dict, raw: Dict): any {
        // the prediction identity is the `outcome` handle (never the base `symbol`); attach it
        // and the other prediction fields (raw exchange id, label, parent market/event) that the
        // base safe* helpers drop. the exchange parser passes them on the raw input dict.
        parsed['outcome'] = this.safeString (raw, 'outcome');
        parsed['outcomeId'] = this.safeString (raw, 'outcomeId');
        parsed['label'] = this.safeString (raw, 'label');
        parsed['market'] = this.safeString (raw, 'market');
        parsed['event'] = this.safeString (raw, 'event');
        // guard the delete: a bare `delete` is a no-op on a missing key in JS, but transpiles to
        // `del`/`unset` which raises in Python when the inherited `symbol` was never set
        if ('symbol' in parsed) {
            delete parsed['symbol'];
        }
        return parsed;
    }

    /**
     * @ignore
     * @method
     * @name PredictionExchange#parsePredictionTrades
     * @description parses a list of raw trades with the exchange's parseTrade, sorts them and filters by the outcome handle — the prediction analogue of the base parseTrades
     * @param {object[]} trades the raw trades
     * @param {object} [outcomeObj] the resolved outcome object the trades belong to
     * @param {int} [since] timestamp in ms of the earliest trade to return
     * @param {int} [limit] the maximum number of trades to return
     * @param {object} [params] extra fields to merge into every parsed trade
     * @returns {object[]} a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
     */
    parsePredictionTrades (trades: any[], outcomeObj: any = undefined, since: Int = undefined, limit: Int = undefined, params = {}): PredictionTrade[] {
        // prediction-market analogue of the base parseTrades: the base aggregator post-filters
        // by the market's `symbol` key, but prediction structures carry an `outcome` handle
        // instead — and an outcome object rebuilt from cached markets may still hold a legacy
        // `symbol` key, which would silently drop every parsed row
        const rows = this.toArray (trades);
        let results = [];
        for (let i = 0; i < rows.length; i++) {
            const parsed = this.parseTrade (rows[i], outcomeObj);
            const trade = this.extend (parsed, params);
            results.push (trade);
        }
        results = this.sortBy2 (results, 'timestamp', 'id');
        const outcomeHandle = this.safeString (outcomeObj, 'outcome');
        return this.filterByOutcomeSinceLimit (results, outcomeHandle, since, limit) as PredictionTrade[];
    }

    /**
     * @ignore
     * @method
     * @name PredictionExchange#parsePredictionOrders
     * @description parses a list of raw orders with the exchange's parseOrder, sorts them and filters by the outcome handle — the prediction analogue of the base parseOrders
     * @param {object[]} orders the raw orders
     * @param {object} [outcomeObj] the resolved outcome object the orders belong to
     * @param {int} [since] timestamp in ms of the earliest order to return
     * @param {int} [limit] the maximum number of orders to return
     * @param {object} [params] extra fields to merge into every parsed order
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    parsePredictionOrders (orders: any[], outcomeObj: any = undefined, since: Int = undefined, limit: Int = undefined, params = {}): PredictionOrder[] {
        // prediction-market analogue of the base parseOrders — see parsePredictionTrades
        const rows = this.toArray (orders);
        let results = [];
        for (let i = 0; i < rows.length; i++) {
            const parsed = this.parseOrder (rows[i], outcomeObj);
            const order = this.extend (parsed, params);
            results.push (order);
        }
        results = this.sortBy (results, 'timestamp');
        const outcomeHandle = this.safeString (outcomeObj, 'outcome');
        return this.filterByOutcomeSinceLimit (results, outcomeHandle, since, limit) as PredictionOrder[];
    }

    /**
     * @ignore
     * @method
     * @name PredictionExchange#parsePredictionPositions
     * @description parses a list of raw positions with the exchange's parsePosition — the prediction analogue of the base parsePositions
     * @param {object[]} positions the raw positions
     * @param {object} [params] extra fields to merge into every parsed position
     * @returns {object[]} a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    parsePredictionPositions (positions: any[], params = {}): PredictionPosition[] {
        // prediction-market analogue of the base parsePositions, which resolves its `symbols`
        // argument through marketSymbols() and would throw BadSymbol on outcome handles.
        // venue-specific outcome filtering stays in the exchange (position identity differs
        // per venue: kalshi positions are market-level, polymarket ones are per token)
        const rows = this.toArray (positions);
        const results = [];
        for (let i = 0; i < rows.length; i++) {
            const parsed = this.parsePosition (rows[i]);
            const position = this.extend (parsed, params);
            results.push (position);
        }
        return results as PredictionPosition[];
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
