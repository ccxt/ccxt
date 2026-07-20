'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Exchange = require('./Exchange.js');
var Precise = require('./Precise.js');
var errors = require('./errors.js');

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
/**
 * @class PredictionExchange
 * @augments BaseExchange
 * @description Base class for prediction-market exchanges. It carries the
 * prediction-specific state (events / outcomes) and helpers, and re-declares the
 * single-market unified methods using an `outcome` symbol instead of a `symbol`.
 */
class PredictionExchange extends Exchange.BaseExchange {
    constructor() {
        super(...arguments);
        this.outcomes = undefined;
        this.outcomes_by_id = undefined;
        this.events = undefined;
        this.events_by_slug = undefined;
    }
    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT
    describe() {
        return this.deepExtend(super.describe(), {
            'has': {
                'prediction': true,
                'approve': false,
                'redeem': false,
                'fetchEvent': false,
                'fetchEvents': false,
                'fetchOutcome': false,
                'fetchSettlements': false,
                'createOrder': false,
                'createOrders': false,
                'createLimitOrder': false,
                'createMarketOrder': false,
                'createMarketOrderWs': false,
                'createMarketBuyOrderWithCost': false,
                'cancelOrder': false,
                'cancelOrders': false,
                'cancelAllOrders': false,
                'editOrder': false,
                'fetchBalance': false,
                'fetchOrder': false,
                'fetchOrders': false,
                'fetchOrdersByIds': false,
                'fetchOrderTrades': false,
                'fetchOpenOrders': false,
                'fetchClosedOrders': false,
                'fetchCanceledOrders': false,
                'fetchMyTrades': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchAccounts': false,
                'fetchLedger': false,
                'fetchDeposits': false,
                'fetchWithdrawals': false,
                'fetchMarkets': false,
                'fetchCurrencies': false,
                'fetchTicker': false,
                'fetchTickers': false,
                'fetchOrderBook': false,
                'fetchL2OrderBook': false,
                'fetchOHLCV': false,
                'fetchTrades': false,
                'fetchStatus': false,
                'fetchTime': false,
                'fetchOpenInterest': false,
                'fetchTradingFee': false,
                'watchTicker': false,
                'watchTickers': false,
                'watchOrderBook': false,
                'watchTrades': false,
                'watchOrders': false,
                'watchMyTrades': false,
                'watchOHLCV': false,
                'watchPositions': false,
            },
        });
    }
    isPrediction() {
        return this.safeBool(this.has, 'prediction', false);
    }
    parseSearchQueries(params = {}) {
        // accepts either `query` (a single search string) or `queries` (a list of strings)
        const singleQuery = this.safeString(params, 'query');
        if (singleQuery !== undefined) {
            return [singleQuery];
        }
        return this.safeList(params, 'queries', []);
    }
    requireEventQuery(params = {}) {
        // fetchEvents must be scoped by at least one selector — an unfiltered call would page the
        // entire exchange. require one of query / queries / tags / eventId / slug, or one of the
        // venue-specific scope params an exchange declares in options['eventScopeParams'],
        // e.g. kalshi's category / series_ticker
        const query = this.safeString(params, 'query');
        const queries = this.safeList(params, 'queries', []);
        const tags = this.safeList(params, 'tags', []);
        const eventId = this.safeString(params, 'eventId');
        const slug = this.safeString(params, 'slug');
        const queriesLength = queries.length;
        const tagsLength = tags.length;
        if ((query !== undefined) || (queriesLength > 0) || (tagsLength > 0) || (eventId !== undefined) || (slug !== undefined)) {
            return undefined;
        }
        const extraScopeParams = this.safeList(this.options, 'eventScopeParams', []);
        const extraScopeParamsLength = extraScopeParams.length;
        let extraNames = '';
        for (let i = 0; i < extraScopeParamsLength; i++) {
            const scopeKey = extraScopeParams[i];
            if (scopeKey in params) {
                return undefined;
            }
            extraNames = extraNames + ', ' + scopeKey;
        }
        throw new errors.ArgumentsRequired(this.id + ' fetchEvents() requires at least one of query, queries, tags, eventId, slug' + extraNames + ' to scope the search');
    }
    applyEventFetchParams(events, params = {}, queries = undefined) {
        // applies the unified fetchEvents options client-side (eventId/slug/status/searchIn/sort/limit)
        // so exchanges whose API can't filter natively still support them consistently.
        // every fetched event lands in the cache before filtering, so loadEvents()/event()
        // serve them later without another request
        this.setEvents(events);
        let result = events;
        const eventId = this.safeString(params, 'eventId');
        const slug = this.safeString(params, 'slug');
        if ((eventId !== undefined) || (slug !== undefined)) {
            const filtered = [];
            for (let i = 0; i < result.length; i++) {
                const event = result[i];
                const idMatch = (eventId !== undefined) && (this.safeString(event, 'id') === eventId);
                const slugMatch = (slug !== undefined) && (this.safeString(event, 'slug') === slug);
                if (idMatch || slugMatch) {
                    filtered.push(event);
                }
            }
            result = filtered;
        }
        result = this.filterEventsByStatus(result, this.safeString(params, 'status'));
        result = this.filterEventsByTags(result, this.safeList(params, 'tags'));
        // own-line length read so the regex transpiler treats `queries` as an array (count())
        // and not a string (strlen()); guard undefined since the default is undefined
        let queriesLength = 0;
        if (queries !== undefined) {
            queriesLength = queries.length;
        }
        if (queriesLength > 0) {
            result = this.filterEventsBySearchIn(result, queries, this.safeString(params, 'searchIn'));
        }
        const sort = this.safeString(params, 'sort');
        if (sort !== undefined) {
            let sortKey = undefined;
            if (sort === 'volume') {
                sortKey = 'volume';
            }
            else if (sort === 'liquidity') {
                sortKey = 'liquidity';
            }
            else if (sort === 'newest') {
                sortKey = 'created';
            }
            if (sortKey !== undefined) {
                // normalize the sort key on every row first — sortBy reads it with a raw
                // subscript, which raises KeyError/undefined-index in Python/PHP when a
                // venue's parsed event omits the field (JS alone tolerates the miss)
                for (let i = 0; i < result.length; i++) {
                    result[i][sortKey] = this.safeNumber(result[i], sortKey, 0);
                }
                result = this.sortBy(result, sortKey, true, 0);
            }
        }
        const limit = this.safeInteger(params, 'limit');
        if (limit !== undefined) {
            // clamp to the result length: arraySlice(x, 0, limit) with limit > length panics in Go
            // via reflect Slice, and throws in C#, unlike JS/Python which return the whole array
            const resultLength = result.length;
            let sliceEnd = limit;
            if (sliceEnd > resultLength) {
                sliceEnd = resultLength;
            }
            result = this.arraySlice(result, 0, sliceEnd);
        }
        return result;
    }
    filterEventsByStatus(events, status = undefined) {
        // 'active' | 'inactive' | 'closed' | 'all' — 'inactive' and 'closed' are interchangeable
        if ((status === undefined) || (status === 'all')) {
            return events;
        }
        const wantActive = (status === 'active');
        const result = [];
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const isActive = this.safeBool(event, 'active');
            // keep events whose status is unknown (already filtered server-side, no `active` field)
            if ((isActive === undefined) || (isActive === wantActive)) {
                result.push(event);
            }
        }
        return result;
    }
    filterEventsBySearchIn(events, queries, searchIn = undefined) {
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
            const title = this.safeStringLower(event, 'title', '');
            const description = this.safeStringLower(event, 'description', '');
            let matched = false;
            for (let qi = 0; qi < queries.length; qi++) {
                const q = queries[qi].toLowerCase();
                if (checkTitle && (title.indexOf(q) >= 0)) {
                    matched = true;
                    break;
                }
                if (checkDescription && (description.indexOf(q) >= 0)) {
                    matched = true;
                    break;
                }
            }
            if (matched) {
                result.push(event);
            }
        }
        return result;
    }
    normalizeTagKey(tag) {
        // reduce a tag to lowercase alphanumeric words joined by single spaces ("Fed Rates" /
        // "fed-rates" / "FED_RATES" all become "fed rates") so label, slug and handle spellings
        // of the same tag compare equal — venues surface tags in different forms and callers
        // pass any of them. keeping the word boundary avoids cross-word false positives that
        // plain concatenation would create ("us open" vs "household")
        const lower = tag.toLowerCase();
        const allowed = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const chars = this.stringToCharsArray(lower);
        let s = '';
        let pendingSep = false;
        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            if (allowed.indexOf(ch) >= 0) {
                if (pendingSep && (s !== '')) {
                    s = s + ' ';
                }
                s = s + ch;
                pendingSep = false;
            }
            else {
                pendingSep = true;
            }
        }
        return s;
    }
    filterEventsByTags(events, tags = undefined) {
        // keep events carrying one of the requested tags; tolerant to string tags and to
        // object tags ({ slug, title, ... }) since venues differ. no-op when no tags requested
        let tagsLength = 0;
        if (tags !== undefined) {
            tagsLength = tags.length;
        }
        if (tagsLength === 0) {
            return events;
        }
        const wanted = [];
        for (let i = 0; i < tags.length; i++) {
            const wantedKey = this.normalizeTagKey(tags[i]);
            if (wantedKey !== '') {
                // an empty normalized key would substring-match every tag
                wanted.push(wantedKey);
            }
        }
        const result = [];
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const eventTags = this.safeList(event, 'tags', []);
            let matched = false;
            for (let ti = 0; ti < eventTags.length; ti++) {
                const tag = eventTags[ti];
                let tagLabel = undefined;
                if (typeof tag === 'string') {
                    tagLabel = tag;
                }
                else {
                    tagLabel = this.safeString2(tag, 'slug', 'title');
                }
                if (tagLabel !== undefined) {
                    const tagKey = this.normalizeTagKey(tagLabel);
                    for (let wi = 0; wi < wanted.length; wi++) {
                        if (tagKey.indexOf(wanted[wi]) >= 0) {
                            matched = true;
                            break;
                        }
                    }
                }
                if (matched) {
                    break;
                }
            }
            if (matched) {
                result.push(event);
            }
        }
        return result;
    }
    async fetchEvents(params = {}) {
        throw new errors.NotSupported(this.id + ' fetchEvents() is not supported yet');
    }
    async fetchEvent(id, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchEvent() is not supported yet');
    }
    setEvents(events) {
        // merge (not reset) so successive scoped fetchEvents calls accumulate into the cache.
        // index by the unified `event` handle too (that's the identifier every outcome's `event`
        // field carries), so getEvent (handle) resolves without each exchange hand-writing it
        if (this.events === undefined) {
            this.events = {};
        }
        if (this.events_by_slug === undefined) {
            this.events_by_slug = {};
        }
        for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const id = this.safeString(event, 'id');
            const slug = this.safeString(event, 'slug');
            const handle = this.safeString(event, 'event');
            if (id !== undefined) {
                this.events[id] = event;
            }
            if (handle !== undefined) {
                this.events[handle] = event;
            }
            if (slug !== undefined) {
                this.events_by_slug[slug] = event;
            }
        }
        return this.events;
    }
    eventsList() {
        // the cached events as a list; empty on a cold instance (this.events is keyed by both
        // id and handle, so de-duplicate by identity before returning)
        if (this.events === undefined) {
            return [];
        }
        const result = [];
        const seen = {};
        const keys = Object.keys(this.events);
        for (let i = 0; i < keys.length; i++) {
            const event = this.events[keys[i]];
            const identity = this.safeString2(event, 'id', 'event', keys[i]);
            if (!(identity in seen)) {
                seen[identity] = true;
                result.push(event);
            }
        }
        return result;
    }
    async loadEventsHelper(reload = false, params = {}) {
        // note: the cache-hit shortcut ignores params, so events fetched under one scope are
        // returned for a later differently-scoped call. events are scoped (unlike global
        // markets), so prefer fetchEvents (params) directly when you need a specific scope
        if (!reload && this.events) {
            return this.events;
        }
        const events = await this.fetchEvents(params);
        return this.setEvents(events);
    }
    async loadEvents(reload = false, params = {}) {
        // cached entry point mirroring loadMarkets. unlike loadMarkets there is no cross-call
        // promise coalescing: the promise-sharing idiom is not expressible in the transpiled
        // base, so two truly concurrent first calls may fetch twice (both land in the cache)
        return await this.loadEventsHelper(reload, params);
    }
    getEvent(eventIdOrSlug) {
        // cache-only event resolver (the event analogue of this.outcome) - the cache fills
        // through fetchEvents; this never fetches
        if ((this.events !== undefined) && (eventIdOrSlug in this.events)) {
            return this.events[eventIdOrSlug];
        }
        if ((this.events_by_slug !== undefined) && (eventIdOrSlug in this.events_by_slug)) {
            return this.events_by_slug[eventIdOrSlug];
        }
        throw new errors.BadSymbol(this.id + ' has no cached event ' + eventIdOrSlug + " - call fetchEvents ({ 'query': ... }) first");
    }
    outcome(outcomeSymbol) {
        if ((this.outcomes === undefined) || this.isEmpty(this.outcomes)) {
            throw new errors.ExchangeError(this.id + ' outcomes not loaded - call loadOutcomes () or an outcome-addressed method first');
        }
        if (outcomeSymbol in this.outcomes) {
            return this.outcomes[outcomeSymbol];
        }
        if ((this.outcomes_by_id !== undefined) && (outcomeSymbol in this.outcomes_by_id)) {
            return this.outcomes_by_id[outcomeSymbol];
        }
        throw new errors.BadSymbol(this.id + ' does not have outcome ' + outcomeSymbol + ' - pass a known outcome handle or outcomeId, or call fetchEvents ()/loadOutcomes () first');
    }
    hasOutcome(outcomeIdOrSymbol) {
        // sync cache-only membership probe — never throws and never fetches. this is the predicate
        // behind loadOutcome's fast path and loadOutcomes' miss filter; safeOutcome (stub on miss)
        // and outcome (throws on miss) are the accessors
        if ((this.outcomes !== undefined) && (outcomeIdOrSymbol in this.outcomes)) {
            return true;
        }
        if ((this.outcomes_by_id !== undefined) && (outcomeIdOrSymbol in this.outcomes_by_id)) {
            return true;
        }
        return false;
    }
    safeOutcome(outcomeIdOrSymbol, outcomeObj = undefined) {
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
        return { 'outcome': outcomeIdOrSymbol, 'outcomeId': outcomeIdOrSymbol, 'market': undefined, 'label': undefined, 'event': undefined, 'info': {} };
    }
    safeOutcomeSymbol(outcomeIdOrSymbol, outcomeObj = undefined) {
        outcomeObj = this.safeOutcome(outcomeIdOrSymbol, outcomeObj);
        return outcomeObj['outcome'];
    }
    shortenSlug(slug) {
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
        const lower = (slug === undefined) ? '' : slug.toLowerCase();
        const allowed = 'abcdefghijklmnopqrstuvwxyz0123456789';
        const chars = this.stringToCharsArray(lower);
        let s = '';
        let lastDash = true; // start true to drop leading separators
        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            if (allowed.indexOf(ch) >= 0) {
                s = s + ch;
                lastDash = false;
            }
            else if (!lastDash) {
                s = s + '-';
                lastDash = true;
            }
        }
        const replacementKeys = Object.keys(replacements);
        for (let i = 0; i < replacementKeys.length; i++) {
            const replacementKey = replacementKeys[i];
            const replacementValue = this.safeString(replacements, replacementKey);
            s = s.replaceAll(replacementKey, replacementValue);
        }
        const rawParts = s.split('-');
        const parts = [];
        for (let i = 0; i < rawParts.length; i++) {
            const w = rawParts[i];
            if (w.length > 0 && !this.inArray(w, stopWords)) {
                parts.push(w);
            }
        }
        const joined = parts.join('_');
        return joined.toUpperCase();
    }
    slugToMarketSymbol(eventSlug, marketSlug) {
        // eventSlug is nullable (Str): markets without a parent event (e.g. myriad's 1:1 markets)
        // pass undefined — the body already collapses an absent event to just the market part.
        // a strict `string` param would make PHP/typed transpilers throw on null before the body runs.
        // qualify the market handle with its event so two events that share a market label
        // — e.g. kalshi's KXFEDDECISION-28JAN and -27OCT both list "Cut 25bps" — do NOT collapse
        // to the same handle — a collision silently overwrites markets in this.markets and would
        // resolve an outcome to the wrong event (wrong-market trade). skip the prefix when the
        // event slug is absent or identical to the market slug (e.g. myriad's 1:1 markets), so
        // already-unique handles stay clean.
        const marketPart = this.shortenSlug(marketSlug);
        const eventPart = this.shortenSlug(eventSlug);
        if ((eventPart === undefined) || (eventPart === '') || (eventPart === marketPart)) {
            return marketPart;
        }
        return eventPart + '_' + marketPart;
    }
    slugToOutcomeSymbol(eventSlug, marketSlug, outcome) {
        // build on slugToMarketSymbol so the outcome handle stays consistent with the market symbol
        // — both event-qualified or both not — otherwise a qualified market + unqualified outcome mismatch.
        // the label gets a light slug treatment (uppercase alphanumerics joined by '_', no stop-word
        // removal so labels like "UP OR DOWN" survive intact) — venue labels with spaces or
        // currency symbols ("JD Vance", a dollar-sign price) yield clean handles (JD_VANCE, 120)
        // instead of leaking raw text into the outcome handle
        const upper = outcome.toUpperCase();
        const allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const chars = this.stringToCharsArray(upper);
        let label = '';
        let pendingSep = false;
        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            if (allowed.indexOf(ch) >= 0) {
                if (pendingSep && (label !== '')) {
                    label = label + '_';
                }
                label = label + ch;
                pendingSep = false;
            }
            else {
                pendingSep = true;
            }
        }
        if (label === '') {
            // a label with no alphanumerics at all (unrealistic, but keep the :LABEL contract)
            label = upper;
        }
        return this.slugToMarketSymbol(eventSlug, marketSlug) + ':' + label;
    }
    setMarkets(markets, currencies = undefined) {
        // prediction market rows carry only the unified `market` handle — `symbol` is
        // deprecated there. the base indexer keys this.markets/this.symbols by 'symbol',
        // so alias the handle onto a shallow copy per row; the caller's rows stay symbol-free
        const marketsList = this.toArray(markets);
        const aliased = [];
        for (let i = 0; i < marketsList.length; i++) {
            const row = marketsList[i];
            const copy = this.extend({}, row);
            copy['symbol'] = this.safeString2(row, 'market', 'symbol');
            aliased.push(copy);
        }
        super.setMarkets(aliased, currencies);
        // strip the alias back off the stored rows — venues assemble user-visible event
        // structures from this.markets (hyperliquid groups its outcome markets that way),
        // so a leftover 'symbol' key would leak the deprecated field back to the caller
        const marketKeys = Object.keys(this.markets);
        for (let i = 0; i < marketKeys.length; i++) {
            const key = marketKeys[i];
            this.markets[key] = this.omit(this.markets[key], 'symbol');
        }
        this.populateOutcomes();
        return this.markets;
    }
    indexMarketOutcomes(market) {
        // index one market's outcome tokens into this.outcomes / this.outcomes_by_id,
        // normalizing each to the canonical identity keys (outcome / outcomeId / market) so
        // consumers and the safe* helpers stay uniform even when an exchange's parseMarket
        // still emits the legacy symbol / id / marketSymbol keys. used both by populateOutcomes
        // for a full rebuild and by on-demand single-market fetches (kalshi fetchOutcome), so a
        // cache miss doesn't force a full O(markets x outcomes) rebuild per new outcome
        if (this.outcomes === undefined) {
            this.outcomes = {};
        }
        if (this.outcomes_by_id === undefined) {
            this.outcomes_by_id = {};
        }
        const outcomesList = this.safeList(market, 'outcomes', []);
        for (let j = 0; j < outcomesList.length; j++) {
            const oc = outcomesList[j];
            let ocSymbol = this.safeString2(oc, 'outcome', 'symbol');
            const ocId = this.safeString2(oc, 'outcomeId', 'id');
            // assign unconditionally — safeString2 keeps the canonical key when present
            // and falls back to the legacy one, so this never clobbers and avoids a
            // missing-key access that throws in Python/PHP, unlike TS undefined
            oc['outcomeId'] = ocId;
            oc['market'] = this.safeString2(oc, 'market', 'marketSymbol');
            if (ocSymbol !== undefined) {
                // shortenSlug is lossy, so two different markets can produce the same handle.
                // on a real collision of same handle but different outcomeId, disambiguate the
                // second one deterministically instead of silently overwriting the first —
                // trading the wrong market would otherwise be indistinguishable
                const existing = this.safeValue(this.outcomes, ocSymbol);
                if (existing !== undefined) {
                    const existingId = this.safeString(existing, 'outcomeId');
                    if ((existingId !== undefined) && (ocId !== undefined) && (existingId !== ocId)) {
                        const idLen = ocId.length;
                        let suffix = ocId;
                        if (idLen > 6) {
                            suffix = ocId.slice(idLen - 6);
                        }
                        ocSymbol = ocSymbol + '_' + suffix.toUpperCase();
                    }
                }
                oc['outcome'] = ocSymbol;
                this.outcomes[ocSymbol] = oc;
            }
            else {
                oc['outcome'] = ocSymbol;
            }
            if (ocId !== undefined) {
                this.outcomes_by_id[ocId] = oc;
            }
        }
    }
    populateOutcomes() {
        // rebuild the whole outcome lookup cache from this.markets (each market carries its
        // outcome tokens under the outcomes key) so cached market data works offline. no-op on
        // a cold instance where markets are not loaded yet (avoids a null-access crash on the
        // eventId/slug-only fetchEvents path)
        this.outcomes = {};
        this.outcomes_by_id = {};
        if (this.markets === undefined) {
            return;
        }
        const marketKeys = Object.keys(this.markets);
        for (let i = 0; i < marketKeys.length; i++) {
            this.indexMarketOutcomes(this.markets[marketKeys[i]]);
        }
    }
    indexEventOutcomes(event) {
        // register a single event's markets into this.markets and rebuild the outcome cache so the
        // handles fetchEvent() returns resolve immediately in outcome-addressed methods (fetchTicker,
        // createOrder, ...). without this, on a cold instance or a loadAllOutcomes:false venue
        // such as kalshi, the returned handles are unusable — fetchTicker(ev.markets[0].outcomes[0].outcome)
        // BadSymbols because the outcome was never cached
        if (this.markets === undefined) {
            this.markets = this.createSafeDictionary();
        }
        const markets = this.safeList(event, 'markets', []);
        const marketsLength = markets.length;
        for (let i = 0; i < marketsLength; i++) {
            const m = markets[i];
            const marketHandle = this.safeString2(m, 'market', 'symbol');
            if (marketHandle !== undefined) {
                this.markets[marketHandle] = m;
            }
        }
        this.populateOutcomes();
    }
    async loadOutcomes(outcomes = undefined, reload = false, params = {}) {
        // outcome-addressed methods call this first, mirroring loadMarkets(). two modes:
        // - an `outcomes` list (scoped): sync-filter the cache and resolve ONLY the misses through
        //   fetchOutcomes — venues with a batch by-id endpoint (kalshi, polymarket) override it to
        //   collapse all misses into one request; a warm cache returns with zero per-outcome awaits
        // - no `outcomes` (bulk): load the capped markets listing once and index every outcome —
        //   idempotent unless reload; only worth paying on venues whose whole universe is one
        //   cheap request (hyperliquid), or when the user explicitly wants the top-N set
        // loadMarkets()/populateOutcomes() rebuild the lookup caches explicitly (the setMarkets
        // override is not dispatched by the base loadMarkets under the Go/C#/Java transpilers)
        if (outcomes !== undefined) {
            let missing = [];
            for (let i = 0; i < outcomes.length; i++) {
                if (reload || !this.hasOutcome(outcomes[i])) {
                    missing.push(outcomes[i]);
                }
            }
            let missingLength = missing.length;
            const wasWarm = (this.outcomes !== undefined) && !this.isEmpty(this.outcomes);
            const loadAll = this.safeBool(this.options, 'loadAllOutcomes', false);
            if ((missingLength > 0) && loadAll && !wasWarm && !reload) {
                // same trade-off as loadOutcome: on venues where the whole universe is one cheap
                // request (hyperliquid), a cold miss bulk-warms once instead of fetching per outcome
                await this.loadOutcomes();
                const stillMissing = [];
                for (let i = 0; i < missingLength; i++) {
                    if (!this.hasOutcome(missing[i])) {
                        stillMissing.push(missing[i]);
                    }
                }
                missing = stillMissing;
                missingLength = missing.length;
            }
            if (missingLength > 0) {
                await this.fetchOutcomes(missing);
            }
            return this.outcomes;
        }
        if (!reload && (this.outcomes !== undefined) && !this.isEmpty(this.outcomes)) {
            return this.outcomes;
        }
        await this.loadMarkets(reload, params);
        this.populateOutcomes();
        return this.outcomes;
    }
    /**
     * @ignore
     * @method
     * @name PredictionExchange#fetchOutcomes
     * @description resolves several uncached outcomes. the base has no batch by-id endpoint, so it fetches them one by one through fetchOutcome (which throws BadSymbol for an unresolvable one); venues with a batch endpoint (kalshi, polymarket) override this to collapse the list into one request
     * @param {string[]} outcomeSymbols the uncached outcome handles or ids to resolve
     * @returns {object} the outcome cache
     */
    async fetchOutcomes(outcomeSymbols) {
        for (let i = 0; i < outcomeSymbols.length; i++) {
            await this.fetchOutcome(outcomeSymbols[i]);
        }
        return this.outcomes;
    }
    async loadOutcome(outcomeSymbol, reload = false) {
        // resolve a single outcome — the per-outcome analogue of loadMarkets()+market(). a cache hit
        // returns at once (pass reload=true to skip the cache and refetch the outcome's metadata).
        // on a miss, fetchOutcome resolves just the requested outcome on demand — a by-id fetch on
        // venues with such an endpoint (kalshi, polymarket) or the venue's scoped search otherwise.
        // options.loadAllOutcomes (default false) opts back into the legacy bulk warm-up: the first
        // miss loads the whole (capped) listing once so later lookups are 0-network hits — only
        // sane on venues whose full universe is one cheap request (hyperliquid)
        if (!reload) {
            if (this.hasOutcome(outcomeSymbol)) {
                return this.safeOutcome(outcomeSymbol);
            }
            const wasWarm = (this.outcomes !== undefined) && !this.isEmpty(this.outcomes);
            // if markets are already loaded (offline-injected, or loaded by loadMarkets/fetchEvents)
            // but the outcome cache is cold, index them for free before hitting the network — this
            // makes cold-cache resolution consistent across languages regardless of loadAllOutcomes
            if (!wasWarm && (this.markets !== undefined) && !this.isEmpty(this.markets)) {
                this.populateOutcomes();
                if (this.hasOutcome(outcomeSymbol)) {
                    return this.safeOutcome(outcomeSymbol);
                }
            }
            const loadAll = this.safeBool(this.options, 'loadAllOutcomes', false);
            if (loadAll && !wasWarm) {
                // a miss on a cold cache: bulk-load once so later lookups are 0-network hits.
                // a miss on an already-warm cache is authoritative — the outcome genuinely isn't
                // listed, so fall through to fetchOutcome (a real BadSymbol) rather than refetching
                // the whole listing (which would mask typos and clobber offline-injected markets)
                await this.loadOutcomes();
                if (this.hasOutcome(outcomeSymbol)) {
                    return this.safeOutcome(outcomeSymbol);
                }
            }
        }
        return await this.fetchOutcome(outcomeSymbol);
    }
    outcomeSearchQuery(outcomeSymbol) {
        // derive a human search query from a unified outcome handle (EVENT_MARKET:LABEL) so a
        // cache miss can be resolved through the venue's scoped search instead of a bulk listing
        // download. returns undefined for id-like inputs (numeric token ids, 0x hashes) that
        // carry no searchable words
        let marketPart = outcomeSymbol;
        const colonIndex = outcomeSymbol.indexOf(':');
        if (colonIndex >= 0) {
            marketPart = outcomeSymbol.slice(0, colonIndex);
        }
        if (marketPart.indexOf('0x') === 0) {
            return undefined;
        }
        // handles join words with '_' (slug-derived) or legacy '-' separated inputs (normalized below)
        const normalized = marketPart.toLowerCase().replaceAll('-', '_');
        const rawWords = normalized.split('_');
        const words = [];
        let hasLetters = false;
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        for (let i = 0; i < rawWords.length; i++) {
            const word = rawWords[i];
            // inline .length so the php transpiler emits strlen() — the standalone
            // `const n = str.length;` statement form wrongly becomes count() (array)
            if (word.length === 0) {
                continue;
            }
            let wordHasLetters = false;
            const chars = this.stringToCharsArray(word);
            for (let ci = 0; ci < chars.length; ci++) {
                if (letters.indexOf(chars[ci]) >= 0) {
                    wordHasLetters = true;
                    break;
                }
            }
            // the query is the handle's letter-bearing words only. standalone numeric
            // tokens (slug timestamps, strikes, years) are venue artifacts that title searches don't
            // reliably index — and since the result is re-checked against the EXACT handle,
            // a broader query only adds recall, never a wrong match
            if (!wordHasLetters) {
                continue;
            }
            words.push(word);
            hasLetters = true;
        }
        const wordsLength = words.length;
        if ((wordsLength === 0) || !hasLetters) {
            // a purely numeric/symbolic handle is an id, not searchable text
            return undefined;
        }
        return words.join(' ');
    }
    async fetchOutcome(outcomeSymbol) {
        // fetch just one outcome on demand — never through a bulk listing download. the base has
        // no generic by-id endpoint, so it derives a search query from the handle and resolves it
        // through the venue's own scoped fetchEvents (which caches everything it finds), then
        // re-checks the cache. venues with a real by-id fetch (kalshi by ticker, polymarket by
        // token id) override this with a cheaper single fetch and fall back to super on a miss.
        const searchQuery = this.outcomeSearchQuery(outcomeSymbol);
        if ((searchQuery !== undefined) && this.safeBool(this.has, 'fetchEvents', false)) {
            const searchLimit = this.safeInteger(this.options, 'fetchOutcomeSearchLimit', 10);
            try {
                await this.fetchEvents({ 'query': searchQuery, 'limit': searchLimit });
            }
            catch (e) {
                // a query with zero matches surfaces as BadSymbol on some venues — treat it as a
                // plain miss (the guidance-rich throw below); let real transport errors propagate
                if (!(e instanceof errors.BadSymbol)) {
                    throw e;
                }
            }
            if (this.hasOutcome(outcomeSymbol)) {
                return this.safeOutcome(outcomeSymbol);
            }
        }
        throw new errors.BadSymbol(this.id + ' could not resolve outcome ' + outcomeSymbol + " — call fetchEvents ({ 'query': ... }) first, or pass a known outcomeId");
    }
    /**
     * @method
     * @name fetchTicker
     * @description fetches a price ticker for a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async fetchTicker(outcome, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchTicker() is not supported yet');
    }
    /**
     * @method
     * @name fetchTickers
     * @description fetches price tickers for multiple prediction outcomes at once
     * @param {string[]} [outcomes] unified outcome handles or outcome ids
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome
     */
    async fetchTickers(outcomes = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchTickers() is not supported yet');
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
    async fetchOrderBook(outcome, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchOrderBook() is not supported yet');
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
    async fetchOHLCV(outcome, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        return await super.fetchOHLCV(outcome, timeframe, since, limit, params);
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
    async fetchTrades(outcome, since = undefined, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchTrades() is not supported yet');
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
    async createOrder(outcome, type, side, amount, price = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' createOrder() is not supported yet');
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
    async cancelOrder(id, outcome = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' cancelOrder() is not supported yet');
    }
    /**
     * @method
     * @name watchTicker
     * @description watches a price ticker for a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async watchTicker(outcome, params = {}) {
        throw new errors.NotSupported(this.id + ' watchTicker() is not supported yet');
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
    async watchOrderBook(outcome, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' watchOrderBook() is not supported yet');
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
    async watchTrades(outcome, since = undefined, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' watchTrades() is not supported yet');
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
    async fetchOrders(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchOrders() is not supported yet');
    }
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
    async fetchOpenOrders(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchOpenOrders() is not supported yet');
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
    async fetchClosedOrders(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchClosedOrders() is not supported yet');
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
    async fetchOrderTrades(id, outcome = undefined, since = undefined, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchOrderTrades() is not supported yet');
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
    async fetchMyTrades(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchMyTrades() is not supported yet');
    }
    /**
     * @method
     * @name fetchPosition
     * @description fetch the open position held on a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    async fetchPosition(outcome, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchPosition() is not supported yet');
    }
    /**
     * @method
     * @name fetchPositions
     * @description fetches the user's open positions
     * @param {string[]} [outcomes] unified outcome handles to filter by
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    async fetchPositions(outcomes = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchPositions() is not supported yet');
    }
    /**
     * @method
     * @name fetchTradingFee
     * @description fetch the trading fee for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
     */
    async fetchTradingFee(outcome, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchTradingFee() is not supported yet');
    }
    /**
     * @method
     * @name fetchOpenInterest
     * @description fetch the open interest of a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
     */
    async fetchOpenInterest(outcome, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchOpenInterest() is not supported yet');
    }
    /**
     * @method
     * @name createOrders
     * @description create a list of trade orders
     * @param {object[]} orders a list of PredictionOrderRequest objects, each carrying an `outcome` handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    async createOrders(orders, params = {}) {
        throw new errors.NotSupported(this.id + ' createOrders() is not supported yet');
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
    async cancelOrders(ids, outcome = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' cancelOrders() is not supported yet');
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
    async createMarketBuyOrderWithCost(outcome, cost, params = {}) {
        // safeBool, not this.options['...'] — a raw missing-key access throws KeyError in Python/PHP
        // when the option is undeclared (it is for every prediction exchange)
        if (this.safeBool(this.options, 'createMarketBuyOrderRequiresPrice', false) || this.safeBool(this.has, 'createMarketBuyOrderWithCost', false)) {
            return await this.createOrder(outcome, 'market', 'buy', cost, 1, params);
        }
        throw new errors.NotSupported(this.id + ' createMarketBuyOrderWithCost() is not supported yet');
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
    async createMarketSellOrderWithCost(outcome, cost, params = {}) {
        if (this.safeBool(this.options, 'createMarketSellOrderRequiresPrice', false) || this.safeBool(this.has, 'createMarketSellOrderWithCost', false)) {
            return await this.createOrder(outcome, 'market', 'sell', cost, 1, params);
        }
        throw new errors.NotSupported(this.id + ' createMarketSellOrderWithCost() is not supported yet');
    }
    /**
     * @method
     * @name watchTickers
     * @description watches price tickers for multiple prediction outcomes
     * @param {string[]} [outcomes] unified outcome handles to watch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    async watchTickers(outcomes = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' watchTickers() is not supported yet');
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
    async watchOrders(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' watchOrders() is not supported yet');
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
    async watchMyTrades(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' watchMyTrades() is not supported yet');
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
    async watchPositions(outcomes = undefined, since = undefined, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' watchPositions() is not supported yet');
    }
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
    async fetchSettlements(outcome = undefined, since = undefined, limit = undefined, params = {}) {
        throw new errors.NotSupported(this.id + ' fetchSettlements() is not supported yet');
    }
    safePredictionOrder(outcomeOrder, outcomeObj = undefined) {
        // build the prediction order directly (do NOT delegate to the crypto safeOrder, which injects
        // ~a dozen derivatives fields — stopPrice/triggerPrice/reduceOnly noise — the prediction type
        // never declares, and whose parseTrades post-filters embedded fills by `symbol`, dropping every
        // outcome-addressed row). prediction is always linear with a contract size of 1.
        let amount = this.omitZero(this.safeString(outcomeOrder, 'amount'));
        let filled = this.safeString(outcomeOrder, 'filled');
        let remaining = this.safeString(outcomeOrder, 'remaining');
        let cost = this.safeString(outcomeOrder, 'cost');
        let average = this.omitZero(this.safeString(outcomeOrder, 'average'));
        const price = this.omitZero(this.safeString(outcomeOrder, 'price'));
        let side = this.safeString(outcomeOrder, 'side');
        const status = this.safeString(outcomeOrder, 'status');
        let lastTradeTimestamp = this.safeInteger(outcomeOrder, 'lastTradeTimestamp');
        // parse embedded fills with the OUTCOME-aware parser (parseTrades would drop them on the symbol filter)
        const rawTrades = this.safeList(outcomeOrder, 'trades', []);
        const trades = this.parsePredictionTrades(rawTrades, outcomeObj);
        const tradesLength = trades.length;
        const feeList = [];
        if (tradesLength > 0) {
            if (filled === undefined) {
                filled = '0';
            }
            if (cost === undefined) {
                cost = '0';
            }
            for (let i = 0; i < tradesLength; i++) {
                const trade = trades[i];
                const tradeAmount = this.safeString(trade, 'amount');
                if (tradeAmount !== undefined) {
                    filled = Precise["default"].stringAdd(filled, tradeAmount);
                }
                const tradeCost = this.safeString(trade, 'cost');
                if (tradeCost !== undefined) {
                    cost = Precise["default"].stringAdd(cost, tradeCost);
                }
                if (side === undefined) {
                    side = this.safeString(trade, 'side');
                }
                const tradeTimestamp = this.safeInteger(trade, 'timestamp');
                if (tradeTimestamp !== undefined) {
                    if (lastTradeTimestamp === undefined) {
                        lastTradeTimestamp = tradeTimestamp;
                    }
                    else if (tradeTimestamp > lastTradeTimestamp) {
                        lastTradeTimestamp = tradeTimestamp;
                    }
                }
                const tradeFee = this.safeDict(trade, 'fee');
                if (tradeFee !== undefined) {
                    feeList.push(tradeFee);
                }
            }
        }
        // fill any totals the venue left undefined (linear, contract size 1)
        if ((filled === undefined) && (amount !== undefined) && (remaining !== undefined)) {
            filled = Precise["default"].stringSub(amount, remaining);
        }
        if ((remaining === undefined) && (amount !== undefined) && (filled !== undefined)) {
            remaining = Precise["default"].stringSub(amount, filled);
        }
        if ((amount === undefined) && (filled !== undefined) && (remaining !== undefined)) {
            amount = Precise["default"].stringAdd(filled, remaining);
        }
        if ((average === undefined) && (filled !== undefined) && (cost !== undefined) && Precise["default"].stringGt(filled, '0')) {
            average = Precise["default"].stringDiv(cost, filled);
        }
        if ((cost === undefined) && (filled !== undefined)) {
            const multiplyPrice = (average !== undefined) ? average : price;
            if (multiplyPrice !== undefined) {
                cost = Precise["default"].stringMul(filled, multiplyPrice);
            }
        }
        let fee = this.safeDict(outcomeOrder, 'fee');
        // own-line length reads so the regex transpiler emits count() (array), not strlen()
        const feeListLength = feeList.length;
        if ((fee === undefined) && (feeListLength > 0)) {
            const reduced = this.reduceFeesByCurrency(feeList);
            const reducedLength = reduced.length;
            if (reducedLength > 0) {
                fee = reduced[0];
            }
        }
        // derive timeInForce/postOnly the same way the crypto safeOrder does (prediction has no
        // trigger orders, so the isTriggerOrSLTp guard collapses): a market order defaults to IOC
        const orderType = this.safeString(outcomeOrder, 'type');
        let timeInForce = this.safeString(outcomeOrder, 'timeInForce');
        let postOnly = this.safeBool(outcomeOrder, 'postOnly');
        if (timeInForce === undefined) {
            if (orderType === 'market') {
                timeInForce = 'IOC';
            }
            if (postOnly) {
                timeInForce = 'PO';
            }
        }
        else if (postOnly === undefined) {
            postOnly = (timeInForce === 'PO');
        }
        const timestamp = this.safeInteger(outcomeOrder, 'timestamp');
        let datetime = this.safeString(outcomeOrder, 'datetime');
        if (datetime === undefined) {
            datetime = this.iso8601(timestamp);
        }
        const result = {
            'id': this.safeString(outcomeOrder, 'id'),
            'clientOrderId': this.safeString(outcomeOrder, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': this.safeInteger(outcomeOrder, 'lastUpdateTimestamp'),
            'status': status,
            'type': orderType,
            'timeInForce': timeInForce,
            'side': side,
            'price': this.parseNumber(price),
            'average': this.parseNumber(average),
            'amount': this.parseNumber(amount),
            'filled': this.parseNumber(filled),
            'remaining': this.parseNumber(remaining),
            'cost': this.parseNumber(cost),
            'fee': fee,
            'reduceOnly': this.safeBool(outcomeOrder, 'reduceOnly'),
            'postOnly': postOnly,
            'trades': trades,
            'outcome': this.safeString(outcomeOrder, 'outcome'),
            'outcomeId': this.safeString(outcomeOrder, 'outcomeId'),
            'label': this.safeString(outcomeOrder, 'label'),
            'market': this.safeString(outcomeOrder, 'market'),
            'event': this.safeString(outcomeOrder, 'event'),
            'info': this.safeValue(outcomeOrder, 'info', outcomeOrder),
        };
        return result;
    }
    safePredictionTrade(trade, outcomeObj = undefined) {
        // build the prediction trade directly (no crypto safeTrade, which leaks fields the type omits)
        const price = this.safeString(trade, 'price');
        const amount = this.safeString(trade, 'amount');
        let cost = this.safeString(trade, 'cost');
        if ((cost === undefined) && (price !== undefined) && (amount !== undefined)) {
            cost = Precise["default"].stringMul(price, amount);
        }
        const timestamp = this.safeInteger(trade, 'timestamp');
        let datetime = this.safeString(trade, 'datetime');
        if (datetime === undefined) {
            datetime = this.iso8601(timestamp);
        }
        const result = {
            'id': this.safeString(trade, 'id'),
            'order': this.safeString(trade, 'order'),
            'timestamp': timestamp,
            'datetime': datetime,
            'type': this.safeString(trade, 'type'),
            'side': this.safeString(trade, 'side'),
            'takerOrMaker': this.safeString(trade, 'takerOrMaker'),
            'price': this.parseNumber(price),
            'amount': this.parseNumber(amount),
            'cost': this.parseNumber(cost),
            'fee': this.safeDict(trade, 'fee'),
            'realizedPnl': this.safeNumber(trade, 'realizedPnl'),
            'outcome': this.safeString(trade, 'outcome'),
            'outcomeId': this.safeString(trade, 'outcomeId'),
            'label': this.safeString(trade, 'label'),
            'market': this.safeString(trade, 'market'),
            'info': this.safeValue(trade, 'info', trade),
        };
        return result;
    }
    safePredictionTicker(ticker, outcomeObj = undefined) {
        // build the prediction ticker directly (no crypto safeTicker, which injects vwap/previousClose/
        // indexPrice/markPrice the type omits). derive change/percentage/average only from open+close —
        // prediction venues report those directly, so the crypto back-derivation from percentage is moot.
        const open = this.omitZero(this.safeString(ticker, 'open'));
        const close = this.omitZero(this.safeString2(ticker, 'close', 'last'));
        const last = this.omitZero(this.safeString2(ticker, 'last', 'close'));
        let change = this.safeString(ticker, 'change');
        let percentage = this.omitZero(this.safeString(ticker, 'percentage'));
        let average = this.omitZero(this.safeString(ticker, 'average'));
        if ((change === undefined) && (open !== undefined) && (close !== undefined)) {
            change = Precise["default"].stringSub(close, open);
        }
        if ((percentage === undefined) && (change !== undefined) && (open !== undefined) && Precise["default"].stringGt(open, '0')) {
            percentage = Precise["default"].stringMul(Precise["default"].stringDiv(change, open), '100');
        }
        if ((average === undefined) && (open !== undefined) && (close !== undefined)) {
            average = Precise["default"].stringDiv(Precise["default"].stringAdd(open, close), '2');
        }
        const timestamp = this.safeInteger(ticker, 'timestamp');
        let datetime = this.safeString(ticker, 'datetime');
        if (datetime === undefined) {
            datetime = this.iso8601(timestamp);
        }
        const result = {
            'timestamp': timestamp,
            'datetime': datetime,
            'high': this.safeNumber(ticker, 'high'),
            'low': this.safeNumber(ticker, 'low'),
            'bid': this.parseNumber(this.omitZero(this.safeString(ticker, 'bid'))),
            'bidVolume': this.safeNumber(ticker, 'bidVolume'),
            'ask': this.parseNumber(this.omitZero(this.safeString(ticker, 'ask'))),
            'askVolume': this.safeNumber(ticker, 'askVolume'),
            'open': this.parseNumber(open),
            'close': this.parseNumber(close),
            'last': this.parseNumber(last),
            'change': this.parseNumber(change),
            'percentage': this.parseNumber(percentage),
            'average': this.parseNumber(average),
            'baseVolume': this.safeNumber(ticker, 'baseVolume'),
            'quoteVolume': this.safeNumber(ticker, 'quoteVolume'),
            'openInterest': this.safeNumber(ticker, 'openInterest'),
            'outcome': this.safeString(ticker, 'outcome'),
            'outcomeId': this.safeString(ticker, 'outcomeId'),
            'label': this.safeString(ticker, 'label'),
            'market': this.safeString(ticker, 'market'),
            'event': this.safeString(ticker, 'event'),
            'info': this.safeValue(ticker, 'info', ticker),
        };
        return result;
    }
    safePredictionPosition(position) {
        // build the prediction position directly (no crypto safePosition, which carries the whole
        // leverage/marginMode/liquidation block the prediction type omits)
        const timestamp = this.safeInteger(position, 'timestamp');
        let datetime = this.safeString(position, 'datetime');
        if (datetime === undefined) {
            datetime = this.iso8601(timestamp);
        }
        const result = {
            'id': this.safeString(position, 'id'),
            'timestamp': timestamp,
            'datetime': datetime,
            'contracts': this.safeNumber(position, 'contracts'),
            'contractSize': this.safeNumber(position, 'contractSize'),
            'side': this.safeString(position, 'side'),
            'notional': this.safeNumber(position, 'notional'),
            'unrealizedPnl': this.safeNumber(position, 'unrealizedPnl'),
            'realizedPnl': this.safeNumber(position, 'realizedPnl'),
            'collateral': this.safeNumber(position, 'collateral'),
            'entryPrice': this.safeNumber(position, 'entryPrice'),
            'markPrice': this.safeNumber(position, 'markPrice'),
            'lastPrice': this.safeNumber(position, 'lastPrice'),
            'percentage': this.safeNumber(position, 'percentage'),
            'resolved': this.safeBool(position, 'resolved'),
            'won': this.safeBool(position, 'won'),
            'settleFraction': this.safeNumber(position, 'settleFraction'),
            'payout': this.safeNumber(position, 'payout'),
            'outcome': this.safeString(position, 'outcome'),
            'outcomeId': this.safeString(position, 'outcomeId'),
            'label': this.safeString(position, 'label'),
            'market': this.safeString(position, 'market'),
            'event': this.safeString(position, 'event'),
            'info': this.safeValue(position, 'info', position),
        };
        return result;
    }
    safePredictionOrderBook(orderbook, outcomeObj = undefined) {
        // normalize a parsed order book to the prediction shape: replace the unified
        // `symbol` with the `outcome` handle and attach the outcome identity fields
        // outcomeId and market - so books match the PredictionOrderBook structure.
        const fallback = this.safeString2(orderbook, 'outcome', 'symbol');
        orderbook['outcome'] = (outcomeObj === undefined) ? fallback : this.safeString(outcomeObj, 'outcome', fallback);
        orderbook['outcomeId'] = (outcomeObj === undefined) ? this.safeString(orderbook, 'outcomeId') : this.safeString(outcomeObj, 'outcomeId');
        orderbook['market'] = (outcomeObj === undefined) ? this.safeString(orderbook, 'market') : this.safeString(outcomeObj, 'market');
        // omit (not delete) — `del dict['symbol']` raises KeyError in python/php when absent
        return this.omit(orderbook, 'symbol');
    }
    parsePredictionTicker(ticker, market = undefined) {
        throw new errors.NotSupported(this.id + ' parsePredictionTicker() is not supported yet');
    }
    parsePredictionOrder(order, market = undefined) {
        throw new errors.NotSupported(this.id + ' parsePredictionOrder() is not supported yet');
    }
    parsePredictionTrade(trade, market = undefined) {
        throw new errors.NotSupported(this.id + ' parsePredictionTrade() is not supported yet');
    }
    parsePredictionPosition(position, market = undefined) {
        throw new errors.NotSupported(this.id + ' parsePredictionPosition() is not supported yet');
    }
    parsePredictionOpenInterest(interest, market = undefined) {
        throw new errors.NotSupported(this.id + ' parsePredictionOpenInterest() is not supported yet');
    }
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
    parsePredictionTrades(trades, outcomeObj = undefined, since = undefined, limit = undefined, params = {}) {
        // prediction-market analogue of the base parseTrades: the base aggregator post-filters
        // by the market's `symbol` key, but prediction structures carry an `outcome` handle
        // instead — and an outcome object rebuilt from cached markets may still hold a legacy
        // `symbol` key, which would silently drop every parsed row
        const rows = this.toArray(trades);
        let results = [];
        for (let i = 0; i < rows.length; i++) {
            const parsed = this.parsePredictionTrade(rows[i], outcomeObj);
            const trade = this.extend(parsed, params);
            results.push(trade);
        }
        results = this.sortBy2(results, 'timestamp', 'id');
        const outcomeHandle = this.safeString(outcomeObj, 'outcome');
        return this.filterByOutcomeSinceLimit(results, outcomeHandle, since, limit);
    }
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
    parsePredictionOrders(orders, outcomeObj = undefined, since = undefined, limit = undefined, params = {}) {
        // prediction-market analogue of the base parseOrders — see parsePredictionTrades
        const rows = this.toArray(orders);
        let results = [];
        for (let i = 0; i < rows.length; i++) {
            const parsed = this.parsePredictionOrder(rows[i], outcomeObj);
            const order = this.extend(parsed, params);
            results.push(order);
        }
        results = this.sortBy(results, 'timestamp');
        const outcomeHandle = this.safeString(outcomeObj, 'outcome');
        return this.filterByOutcomeSinceLimit(results, outcomeHandle, since, limit);
    }
    /**
     * @ignore
     * @method
     * @name PredictionExchange#parsePredictionPositions
     * @description parses a list of raw positions with the exchange's parsePredictionPosition — the prediction analogue of the base parsePositions
     * @param {object[]} positions the raw positions
     * @param {object} [params] extra fields to merge into every parsed position
     * @returns {object[]} a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    parsePredictionPositions(positions, params = {}) {
        // prediction-market analogue of the base parsePositions, which resolves its `symbols`
        // argument through marketSymbols() and would throw BadSymbol on outcome handles.
        // venue-specific outcome filtering stays in the exchange (position identity differs
        // per venue: kalshi positions are market-level, polymarket ones are per token)
        const rows = this.toArray(positions);
        const results = [];
        for (let i = 0; i < rows.length; i++) {
            const parsed = this.parsePredictionPosition(rows[i]);
            const position = this.extend(parsed, params);
            results.push(position);
        }
        return results;
    }
    filterByOutcomeSinceLimit(array, outcome = undefined, since = undefined, limit = undefined, tail = false) {
        return this.filterByValueSinceLimit(array, 'outcome', outcome, since, limit, 'timestamp', tail);
    }
    filterByOutcomesSinceLimit(array, outcomes = undefined, since = undefined, limit = undefined, tail = false) {
        const result = this.filterByArray(array, 'outcome', outcomes, false);
        return this.filterBySinceLimit(result, since, limit, 'timestamp', tail);
    }
    amountToPredictionPrecision(outcome, amount) {
        const outcomeObj = this.outcome(outcome);
        const marketSymbol = this.safeString(outcomeObj, 'market');
        return this.amountToPrecision(marketSymbol, amount);
    }
    priceToPredictionPrecision(outcome, price) {
        const outcomeObj = this.outcome(outcome);
        const marketSymbol = this.safeString(outcomeObj, 'market');
        return this.priceToPrecision(marketSymbol, price);
    }
    costToPredictionPrecision(outcome, cost) {
        const outcomeObj = this.outcome(outcome);
        const marketSymbol = this.safeString(outcomeObj, 'market');
        return this.costToPrecision(marketSymbol, cost);
    }
    // ------------------------------------------------------------------------
    // shared EVM helpers — RLP encoding + a minimal JSON-RPC client + raw-tx
    // broadcast, used by the on-chain (EOA) trading paths of EVM prediction
    // venues (limitless, myriad). signEvmTransaction stays per-exchange because
    // it needs the noble crypto imports (keccak/ecdsa/secp256k1) which the
    // per-language prediction base skeletons don't carry; this base
    // sendEvmTransaction dispatches to the exchange's signEvmTransaction override
    padHexToEven(hex) {
        // prepend a nibble so the hex has an even number of characters (whole bytes)
        const hexLength = hex.length;
        if ((hexLength % 2) !== 0) {
            return '0' + hex;
        }
        return hex;
    }
    padHexAddress(address) {
        // left-pads a 20-byte address to a 32-byte ABI word (24 leading zero bytes)
        const stripped = this.remove0xPrefix(address);
        return '000000000000000000000000' + stripped;
    }
    rlpEncodeBytes(hex) {
        // RLP-encodes a single byte string (hex without 0x) per the Ethereum RLP spec
        const byteLength = this.parseToInt(hex.length / 2);
        if (byteLength === 0) {
            return '80';
        }
        if ((byteLength === 1) && (hex < '80')) {
            return hex;
        }
        if (byteLength < 56) {
            return this.intToBase16(128 + byteLength) + hex;
        }
        let lengthHex = this.intToBase16(byteLength);
        lengthHex = this.padHexToEven(lengthHex);
        const lengthOfLength = this.parseToInt(lengthHex.length / 2);
        return this.intToBase16(183 + lengthOfLength) + lengthHex + hex;
    }
    rlpEncodeList(items) {
        let concatenated = '';
        for (let i = 0; i < items.length; i++) {
            concatenated = concatenated + items[i];
        }
        const byteLength = this.parseToInt(concatenated.length / 2);
        if (byteLength < 56) {
            return this.intToBase16(192 + byteLength) + concatenated;
        }
        let lengthHex = this.intToBase16(byteLength);
        lengthHex = this.padHexToEven(lengthHex);
        const lengthOfLength = this.parseToInt(lengthHex.length / 2);
        return this.intToBase16(247 + lengthOfLength) + lengthHex + concatenated;
    }
    intToRlpHex(value) {
        // an integer as its minimal big-endian byte hex; 0 is the empty byte string
        if (value === 0) {
            return '';
        }
        let hex = this.intToBase16(value);
        hex = this.padHexToEven(hex);
        return hex;
    }
    hexToRlpBytes(hexValue) {
        // a hex value (e.g. an RPC result) as minimal big-endian byte hex; leading zero bytes
        // are stripped and 0 becomes the empty byte string (RLP integer encoding)
        let h = this.remove0xPrefix(hexValue);
        let start = 0;
        const total = h.length;
        while ((start < total) && (h.slice(start, start + 1) === '0')) {
            start = start + 1;
        }
        h = h.slice(start);
        if (h === '') {
            return '';
        }
        h = this.padHexToEven(h);
        return h;
    }
    // eslint-disable-next-line no-unused-vars
    signEvmTransaction(tx, privateKey) {
        // per-exchange override — needs the noble crypto imports. the base declares it so
        // sendEvmTransaction below can call it; a call on the base itself is unsupported
        throw new errors.NotSupported(this.id + ' signEvmTransaction() must be overridden by the exchange');
    }
    async ethRpc(rpcUrl, method, rpcParams) {
        const payload = { 'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': rpcParams };
        const headers = { 'Content-Type': 'application/json' };
        const response = await this.fetch(rpcUrl, 'POST', headers, this.json(payload));
        const rpcError = this.safeValue(response, 'error');
        if (rpcError !== undefined) {
            throw new errors.ExchangeError(this.id + ' rpc ' + method + ' error: ' + this.json(rpcError));
        }
        // the result is either a hex string (nonce/gasPrice/txhash) or an object (receipt) —
        // safeString would coerce a receipt object to "[object Object]"
        return this.safeValue(response, 'result');
    }
    async sendEvmTransaction(rpcUrl, chainId, fromAddress, to, value, data, gasLimit) {
        const nonce = await this.ethRpc(rpcUrl, 'eth_getTransactionCount', [fromAddress, 'pending']);
        const gasPrice = await this.ethRpc(rpcUrl, 'eth_gasPrice', []);
        const tx = {
            'chainId': chainId,
            'nonce': nonce,
            'maxPriorityFeePerGas': gasPrice,
            'maxFeePerGas': gasPrice,
            'gasLimit': gasLimit,
            'to': to,
            'value': value,
            'data': data,
        };
        const signed = this.signEvmTransaction(tx, this.privateKey);
        return await this.ethRpc(rpcUrl, 'eth_sendRawTransaction', [signed]);
    }
    async waitForTransactionReceipt(rpcUrl, txHash, timeout = 60000) {
        const start = this.milliseconds();
        while ((this.milliseconds() - start) < timeout) {
            const receipt = await this.ethRpc(rpcUrl, 'eth_getTransactionReceipt', [txHash]);
            if (receipt) {
                return receipt;
            }
            await this.sleep(2000);
        }
        throw new errors.ExchangeError(this.id + ' transaction ' + txHash + ' not mined within timeout');
    }
}

exports["default"] = PredictionExchange;
