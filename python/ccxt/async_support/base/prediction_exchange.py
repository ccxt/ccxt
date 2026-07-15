# -*- coding: utf-8 -*-

# ----------------------------------------------------------------------------
# base class for prediction-market exchanges (Polymarket, Kalshi, Limitless, ...)
# the top of this file is hand-written; the methods below the delimiter are
# transpiled from ts/src/base/PredictionExchange.ts
# ----------------------------------------------------------------------------

from typing import Any, List
from ccxt.async_support.base.exchange import BaseExchange
from ccxt.base.types import Str, Strings, Int, Num, Market, OrderType, OrderSide, PredictionOrderRequest, fetchEventsParams
from ccxt.base.precise import Precise
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import BadSymbol
from ccxt.base.errors import NotSupported
from ccxt.base.errors import ArgumentsRequired


class PredictionExchange(BaseExchange):
    outcomes = None
    outcomes_by_id = None
    events = None
    events_by_slug = None
    reloadingEvents = None
    eventsLoading = None

    # METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

    def describe(self) -> Any:
        return self.deep_extend(super(PredictionExchange, self).describe(), {
            'has': {
                'prediction': True,
                'approve': False,
                'redeem': False,
                'fetchEvent': False,
                'fetchEvents': False,
                'fetchOutcome': False,
                'fetchSettlements': False,
                'createOrder': False,
                'createOrders': False,
                'createLimitOrder': False,
                'createMarketOrder': False,
                'createMarketOrderWs': False,
                'createMarketBuyOrderWithCost': False,
                'cancelOrder': False,
                'cancelOrders': False,
                'cancelAllOrders': False,
                'editOrder': False,
                'fetchBalance': False,
                'fetchOrder': False,
                'fetchOrders': False,
                'fetchOrdersByIds': False,
                'fetchOrderTrades': False,
                'fetchOpenOrders': False,
                'fetchClosedOrders': False,
                'fetchCanceledOrders': False,
                'fetchMyTrades': False,
                'fetchPosition': False,
                'fetchPositions': False,
                'fetchAccounts': False,
                'fetchLedger': False,
                'fetchDeposits': False,
                'fetchWithdrawals': False,
                'fetchMarkets': False,
                'fetchCurrencies': False,
                'fetchTicker': False,
                'fetchTickers': False,
                'fetchOrderBook': False,
                'fetchL2OrderBook': False,
                'fetchOHLCV': False,
                'fetchTrades': False,
                'fetchStatus': False,
                'fetchTime': False,
                'fetchOpenInterest': False,
                'fetchTradingFee': False,
                'watchTicker': False,
                'watchTickers': False,
                'watchOrderBook': False,
                'watchTrades': False,
                'watchOrders': False,
                'watchMyTrades': False,
                'watchOHLCV': False,
                'watchPositions': False,
            },
        })

    def is_prediction(self) -> bool:
        return self.safe_bool(self.has, 'prediction', False)

    def parse_search_queries(self, params={}):
        # accepts either `query`(a single search string) or `queries`(a list of strings)
        singleQuery = self.safe_string(params, 'query')
        if singleQuery is not None:
            return [singleQuery]
        return self.safe_list(params, 'queries', [])

    def require_event_query(self, params={}):
        # fetchEvents must be scoped by at least one selector — an unfiltered call would page the
        # entire exchange. require one of query / queries / tags / eventId / slug, or one of the
        # venue-specific scope params an exchange declares in options['eventScopeParams'],
        # e.g. kalshi's category / series_ticker
        query = self.safe_string(params, 'query')
        queries = self.safe_list(params, 'queries', [])
        tags = self.safe_list(params, 'tags', [])
        eventId = self.safe_string(params, 'eventId')
        slug = self.safe_string(params, 'slug')
        queriesLength = len(queries)
        tagsLength = len(tags)
        if (query is not None) or (queriesLength > 0) or (tagsLength > 0) or (eventId is not None) or (slug is not None):
            return None
        extraScopeParams = self.safe_list(self.options, 'eventScopeParams', [])
        extraScopeParamsLength = len(extraScopeParams)
        extraNames = ''
        for i in range(0, extraScopeParamsLength):
            scopeKey = extraScopeParams[i]
            if scopeKey in params:
                return None
            extraNames = extraNames + ', ' + scopeKey
        raise ArgumentsRequired(self.id + ' fetchEvents() requires at least one of query, queries, tags, eventId, slug' + extraNames + ' to scope the search')

    def apply_event_fetch_params(self, events: List[Any], params={}, queries: List[str] = None):
        # applies the unified fetchEvents options client-side(eventId/slug/status/searchIn/sort/limit)
        # so exchanges whose API can't filter natively still support them consistently.
        # every fetched event lands in the cache before filtering, so loadEvents()/event()
        # serve them later without another request
        self.set_events(events)
        result = events
        eventId = self.safe_string(params, 'eventId')
        slug = self.safe_string(params, 'slug')
        if (eventId is not None) or (slug is not None):
            filtered = []
            for i in range(0, len(result)):
                event = result[i]
                idMatch = (eventId is not None) and (self.safe_string(event, 'id') == eventId)
                slugMatch = (slug is not None) and (self.safe_string(event, 'slug') == slug)
                if idMatch or slugMatch:
                    filtered.append(event)
            result = filtered
        result = self.filter_events_by_status(result, self.safe_string(params, 'status'))
        result = self.filter_events_by_tags(result, self.safe_list(params, 'tags'))
        # own-line length read so the regex transpiler treats `queries` array(count())
        # and not a string(strlen()); guard None since the default is None
        queriesLength = 0
        if queries is not None:
            queriesLength = len(queries)
        if queriesLength > 0:
            result = self.filter_events_by_search_in(result, queries, self.safe_string(params, 'searchIn'))
        sort = self.safe_string(params, 'sort')
        if sort is not None:
            sortKey = None
            if sort == 'volume':
                sortKey = 'volume'
            elif sort == 'liquidity':
                sortKey = 'liquidity'
            elif sort == 'newest':
                sortKey = 'created'
            if sortKey is not None:
                # normalize the sort key on every row first — sortBy reads it with a raw
                # subscript, which raises KeyError/None-index in Python/PHP when a
                # venue's parsed event omits the field(JS alone tolerates the miss)
                for i in range(0, len(result)):
                    result[i][sortKey] = self.safe_number(result[i], sortKey, 0)
                result = self.sort_by(result, sortKey, True, 0)
        limit = self.safe_integer(params, 'limit')
        if limit is not None:
            # clamp to the result length: arraySlice(x, 0, limit) with limit > length panics in Go
            # via reflect Slice, and throws in C#, unlike JS/Python which return the whole array
            resultLength = len(result)
            sliceEnd = limit
            if sliceEnd > resultLength:
                sliceEnd = resultLength
            result = self.array_slice(result, 0, sliceEnd)
        return result

    def filter_events_by_status(self, events: List[Any], status: Str = None):
        # 'active' | 'inactive' | 'closed' | 'all' — 'inactive' and 'closed' are interchangeable
        if (status is None) or (status == 'all'):
            return events
        wantActive = (status == 'active')
        result = []
        for i in range(0, len(events)):
            event = events[i]
            isActive = self.safe_bool(event, 'active')
            # keep events whose status is unknown(already filtered server-side, no `active` field)
            if (isActive is None) or (isActive == wantActive):
                result.append(event)
        return result

    def filter_events_by_search_in(self, events: List[Any], queries: List[str], searchIn: Str = None):
        # keep events whose title and/or description contains one of the queries(searchIn defaults to 'both')
        # own-line length read so the regex transpiler uses count()(array) not strlen()(string)
        queriesLength = 0
        if queries is not None:
            queriesLength = len(queries)
        if (searchIn is None) or (queries is None) or (queriesLength == 0):
            return events
        checkTitle = (searchIn == 'title') or (searchIn == 'both')
        checkDescription = (searchIn == 'description') or (searchIn == 'both')
        result = []
        for i in range(0, len(events)):
            event = events[i]
            title = self.safe_string_lower(event, 'title', '')
            description = self.safe_string_lower(event, 'description', '')
            matched = False
            for qi in range(0, len(queries)):
                q = queries[qi].lower()
                if checkTitle and (title.find(q) >= 0):
                    matched = True
                    break
                if checkDescription and (description.find(q) >= 0):
                    matched = True
                    break
            if matched:
                result.append(event)
        return result

    def filter_events_by_tags(self, events: List[Any], tags: List[str] = None):
        # keep events carrying one of the requested tags; tolerant to string tags and to
        # object tags({slug, title, ...}) since venues differ. no-op when no tags requested
        tagsLength = 0
        if tags is not None:
            tagsLength = len(tags)
        if tagsLength == 0:
            return events
        wanted = []
        for i in range(0, len(tags)):
            wanted.append(tags[i].lower())
        result = []
        for i in range(0, len(events)):
            event = events[i]
            eventTags = self.safe_list(event, 'tags', [])
            matched = False
            for ti in range(0, len(eventTags)):
                tag = eventTags[ti]
                tagLabel = None
                if isinstance(tag, str):
                    tagLabel = tag
                else:
                    tagLabel = self.safe_string_2(tag, 'slug', 'title')
                if tagLabel is not None:
                    tagLower = tagLabel.lower()
                    for wi in range(0, len(wanted)):
                        if tagLower.find(wanted[wi]) >= 0:
                            matched = True
                            break
                if matched:
                    break
            if matched:
                result.append(event)
        return result

    async def fetch_events(self, params: fetchEventsParams = {}):
        raise NotSupported(self.id + ' fetchEvents() is not supported yet')

    async def fetch_event(self, id: str, params={}):
        raise NotSupported(self.id + ' fetchEvent() is not supported yet')

    def set_events(self, events: List[Any]):
        # merge(not reset) so successive scoped fetchEvents calls accumulate into the cache.
        # index by the unified `event` handle too(that's the identifier every outcome's `event`
        # field carries), so getEvent(handle) resolves without each exchange hand-writing it
        if self.events is None:
            self.events = {}
        if self.events_by_slug is None:
            self.events_by_slug = {}
        for i in range(0, len(events)):
            event = events[i]
            id = self.safe_string(event, 'id')
            slug = self.safe_string(event, 'slug')
            handle = self.safe_string(event, 'event')
            if id is not None:
                self.events[id] = event
            if handle is not None:
                self.events[handle] = event
            if slug is not None:
                self.events_by_slug[slug] = event
        return self.events

    def events_list(self) -> List[Any]:
        # the cached events list; empty on a cold instance(self.events is keyed by both
        # id and handle, so de-duplicate by identity before returning)
        if self.events is None:
            return []
        result = []
        seen = {}
        keys = list(self.events.keys())
        for i in range(0, len(keys)):
            event = self.events[keys[i]]
            identity = self.safe_string_2(event, 'id', 'event', keys[i])
            if not (identity in seen):
                seen[identity] = True
                result.append(event)
        return result

    async def load_events_helper(self, reload=False, params={}):
        # note: the cache-hit shortcut ignores params, so events fetched under one scope are
        # returned for a later differently-scoped call. events are scoped(unlike global
        # markets), so prefer fetchEvents(params) directly when you need a specific scope
        if not reload and self.events:
            return self.events
        events = await self.fetch_events(params)
        return self.set_events(events)

    async def load_events(self, reload=False, params={}):
        # cached entry point mirroring loadMarkets. unlike loadMarkets there is no cross-call
        # promise coalescing: the promise-sharing idiom is not expressible in the transpiled
        # base, so two truly concurrent first calls may fetch twice(both land in the cache)
        return await self.load_events_helper(reload, params)

    def get_event(self, eventIdOrSlug: str):
        # cache-only event resolver(the event analogue of self.outcome) - the cache fills
        # through fetchEvents; self never fetches
        if (self.events is not None) and (eventIdOrSlug in self.events):
            return self.events[eventIdOrSlug]
        if (self.events_by_slug is not None) and (eventIdOrSlug in self.events_by_slug):
            return self.events_by_slug[eventIdOrSlug]
        raise BadSymbol(self.id + ' has no cached event ' + eventIdOrSlug + " - call fetchEvents({'query': ...}) first")

    def outcome(self, outcomeSymbol: str):
        if (self.outcomes is None) or self.is_empty(self.outcomes):
            raise ExchangeError(self.id + ' outcomes not loaded - call loadOutcomes() or an outcome-addressed method first')
        if outcomeSymbol in self.outcomes:
            return self.outcomes[outcomeSymbol]
        if (self.outcomes_by_id is not None) and (outcomeSymbol in self.outcomes_by_id):
            return self.outcomes_by_id[outcomeSymbol]
        raise BadSymbol(self.id + ' does not have outcome ' + outcomeSymbol + ' - pass a known outcome handle or outcomeId, or call fetchEvents()/loadOutcomes() first')

    def has_outcome(self, outcomeIdOrSymbol: str):
        # sync cache-only membership probe — never throws and never fetches. self is the predicate
        # behind loadOutcome's fast path and loadOutcomes' miss filter; safeOutcome(stub on miss)
        # and outcome(throws on miss) are the accessors
        if (self.outcomes is not None) and (outcomeIdOrSymbol in self.outcomes):
            return True
        if (self.outcomes_by_id is not None) and (outcomeIdOrSymbol in self.outcomes_by_id):
            return True
        return False

    def safe_outcome(self, outcomeIdOrSymbol: Str, outcomeObj: Any = None):
        if outcomeIdOrSymbol is not None:
            if (self.outcomes is not None) and (outcomeIdOrSymbol in self.outcomes):
                return self.outcomes[outcomeIdOrSymbol]
            if (self.outcomes_by_id is not None) and (outcomeIdOrSymbol in self.outcomes_by_id):
                return self.outcomes_by_id[outcomeIdOrSymbol]
        if outcomeObj is not None:
            return outcomeObj
        return {'outcome': outcomeIdOrSymbol, 'outcomeId': outcomeIdOrSymbol, 'market': None, 'label': None, 'event': None, 'info': {}}

    def safe_outcome_symbol(self, outcomeIdOrSymbol: Str, outcomeObj: Any = None):
        outcomeObj = self.safe_outcome(outcomeIdOrSymbol, outcomeObj)
        return outcomeObj['outcome']

    def shorten_slug(self, slug: Str):
        replacements = {
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
        }
        stopWords = [
            'will', 'the', 'a', 'an', 'after', 'before', 'in', 'at', 'by',
            'of', 'there', 'be', 'to', 'or', 'and', 'for', 'on', 'its',
            'that', 'this', 'from', 'with', 'as', 'is', 'are', 'was', 'were', '?', 'how', 'many', 'who', 'what', 'when', 'where', 'which', 'much',
        ]
        lower = '' if (slug is None) else slug.lower()
        allowed = 'abcdefghijklmnopqrstuvwxyz0123456789'
        chars = self.string_to_chars_array(lower)
        s = ''
        lastDash = True  # start True to drop leading separators
        for i in range(0, len(chars)):
            ch = chars[i]
            if allowed.find(ch) >= 0:
                s = s + ch
                lastDash = False
            elif not lastDash:
                s = s + '-'
                lastDash = True
        replacementKeys = list(replacements.keys())
        for i in range(0, len(replacementKeys)):
            replacementKey = replacementKeys[i]
            replacementValue = self.safe_string(replacements, replacementKey)
            s = s.replace(replacementKey, replacementValue)
        rawParts = s.split('-')
        parts = []
        for i in range(0, len(rawParts)):
            w = rawParts[i]
            if len(w) > 0 and not self.in_array(w, stopWords):
                parts.append(w)
        joined = '_'.join(parts)
        return joined.upper()

    def slug_to_market_symbol(self, eventSlug: Str, marketSlug: str):
        # eventSlug is nullable(Str): markets without a parent event(e.g. myriad's 1:1 markets)
        # pass None — the body already collapses an absent event to just the market part.
        # a strict `string` param would make PHP/typed transpilers raise on null before the body runs.
        # qualify the market handle with its event so two events that share a market label
        # — e.g. kalshi's KXFEDDECISION-28JAN and -27OCT both list "Cut 25bps" — do NOT collapse
        # to the same handle — a collision silently overwrites markets in self.markets and would
        # resolve an outcome to the wrong event(wrong-market trade). skip the prefix when the
        # event slug is absent or identical to the market slug(e.g. myriad's 1:1 markets), so
        # already-unique handles stay clean.
        marketPart = self.shorten_slug(marketSlug)
        eventPart = self.shorten_slug(eventSlug)
        if (eventPart is None) or (eventPart == '') or (eventPart == marketPart):
            return marketPart
        return eventPart + '_' + marketPart

    def slug_to_outcome_symbol(self, eventSlug: Str, marketSlug: str, outcome: str):
        # build on slugToMarketSymbol so the outcome handle stays consistent with the market symbol
        # — both event-qualified or both not — otherwise a qualified market + unqualified outcome mismatch.
        # the label gets a light slug treatment(uppercase alphanumerics joined by '_', no stop-word
        # removal so labels like "UP OR DOWN" survive intact) — venue labels with spaces or
        # currency symbols("JD Vance", a dollar-sign price) yield clean handles(JD_VANCE, 120)
        # instead of leaking raw text into the outcome handle
        upper = outcome.upper()
        allowed = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        chars = self.string_to_chars_array(upper)
        label = ''
        pendingSep = False
        for i in range(0, len(chars)):
            ch = chars[i]
            if allowed.find(ch) >= 0:
                if pendingSep and (label != ''):
                    label = label + '_'
                label = label + ch
                pendingSep = False
            else:
                pendingSep = True
        if label == '':
            # a label with no alphanumerics at all(unrealistic, but keep the :LABEL contract)
            label = upper
        return self.slug_to_market_symbol(eventSlug, marketSlug) + ':' + label

    def set_markets(self, markets, currencies=None):
        # prediction market rows carry only the unified `market` handle — `symbol` is
        # deprecated there. the base indexer keys self.markets/self.symbols by 'symbol',
        # so alias the handle onto a shallow copy per row; the caller's rows stay symbol-free
        marketsList = self.to_array(markets)
        aliased = []
        for i in range(0, len(marketsList)):
            row = marketsList[i]
            copy = self.extend({}, row)
            copy['symbol'] = self.safe_string_2(row, 'market', 'symbol')
            aliased.append(copy)
        super(PredictionExchange, self).set_markets(aliased, currencies)
        # strip the alias back off the stored rows — venues assemble user-visible event
        # structures from self.markets(hyperliquid groups its outcome markets that way),
        # so a leftover 'symbol' key would leak the deprecated field back to the caller
        marketKeys = list(self.markets.keys())
        for i in range(0, len(marketKeys)):
            key = marketKeys[i]
            self.markets[key] = self.omit(self.markets[key], 'symbol')
        self.populate_outcomes()
        return self.markets

    def index_market_outcomes(self, market):
        # index one market's outcome tokens into self.outcomes / self.outcomes_by_id,
        # normalizing each to the canonical identity keys(outcome / outcomeId / market) so
        # consumers and the safe* helpers stay uniform even when an exchange's parseMarket
        # still emits the legacy symbol / id / marketSymbol keys. used both by populateOutcomes
        # for a full rebuild and by on-demand single-market fetches(kalshi fetchOutcome), so a
        # cache miss doesn't force a full O(markets x outcomes) rebuild per new outcome
        if self.outcomes is None:
            self.outcomes = {}
        if self.outcomes_by_id is None:
            self.outcomes_by_id = {}
        outcomesList = self.safe_list(market, 'outcomes', [])
        for j in range(0, len(outcomesList)):
            oc = outcomesList[j]
            ocSymbol = self.safe_string_2(oc, 'outcome', 'symbol')
            ocId = self.safe_string_2(oc, 'outcomeId', 'id')
            # assign unconditionally — safeString2 keeps the canonical key when present
            # and falls back to the legacy one, so self never clobbers and avoids a
            # missing-key access that throws in Python/PHP, unlike TS None
            oc['outcomeId'] = ocId
            oc['market'] = self.safe_string_2(oc, 'market', 'marketSymbol')
            if ocSymbol is not None:
                # shortenSlug is lossy, so two different markets can produce the same handle.
                # on a real collision of same handle but different outcomeId, disambiguate the
                # second one deterministically instead of silently overwriting the first —
                # trading the wrong market would otherwise be indistinguishable
                existing = self.safe_value(self.outcomes, ocSymbol)
                if existing is not None:
                    existingId = self.safe_string(existing, 'outcomeId')
                    if (existingId is not None) and (ocId is not None) and (existingId != ocId):
                        idLen = len(ocId)
                        suffix = ocId
                        if idLen > 6:
                            suffix = ocId[idLen - 6:]
                        ocSymbol = ocSymbol + '_' + suffix.upper()
                oc['outcome'] = ocSymbol
                self.outcomes[ocSymbol] = oc
            else:
                oc['outcome'] = ocSymbol
            if ocId is not None:
                self.outcomes_by_id[ocId] = oc

    def populate_outcomes(self):
        # rebuild the whole outcome lookup cache from self.markets(each market carries its
        # outcome tokens under the outcomes key) so cached market data works offline. no-op on
        # a cold instance where markets are not loaded yet(avoids a null-access crash on the
        # eventId/slug-only fetchEvents path)
        self.outcomes = {}
        self.outcomes_by_id = {}
        if self.markets is None:
            return
        marketKeys = list(self.markets.keys())
        for i in range(0, len(marketKeys)):
            self.index_market_outcomes(self.markets[marketKeys[i]])

    def index_event_outcomes(self, event: Any):
        # register a single event's markets into self.markets and rebuild the outcome cache so the
        # handles fetchEvent() returns resolve immediately in outcome-addressed methods(fetchTicker,
        # createOrder, ...). without self, on a cold instance or a loadAllOutcomes:false venue
        # such, the returned handles are unusable — fetchTicker(ev.markets[0].outcomes[0].outcome)
        # BadSymbols because the outcome was never cached
        if self.markets is None:
            self.markets = self.create_safe_dictionary()
        markets = self.safe_list(event, 'markets', [])
        marketsLength = len(markets)
        for i in range(0, marketsLength):
            m = markets[i]
            marketHandle = self.safe_string_2(m, 'market', 'symbol')
            if marketHandle is not None:
                self.markets[marketHandle] = m
        self.populate_outcomes()

    async def load_outcomes(self, outcomes: Strings = None, reload=False, params={}):
        # outcome-addressed methods call self first, mirroring loadMarkets(). two modes:
        # - an `outcomes` list(scoped): sync-filter the cache and resolve ONLY the misses through
        #   fetchOutcomes — venues with a batch by-id endpoint(kalshi, polymarket) override it to
        #   collapse all misses into one request; a warm cache returns with zero per-outcome awaits
        # - no `outcomes`(bulk): load the capped markets listing once and index every outcome —
        #   idempotent unless reload; only worth paying on venues whose whole universe is one
        #   cheap request(hyperliquid), or when the user explicitly wants the top-N set
        # loadMarkets()/populateOutcomes() rebuild the lookup caches explicitly(the setMarkets
        # override is not dispatched by the base loadMarkets under the Go/C#/Java transpilers)
        if outcomes is not None:
            missing = []
            for i in range(0, len(outcomes)):
                if reload or not self.has_outcome(outcomes[i]):
                    missing.append(outcomes[i])
            missingLength = len(missing)
            wasWarm = (self.outcomes is not None) and not self.is_empty(self.outcomes)
            loadAll = self.safe_bool(self.options, 'loadAllOutcomes', False)
            if (missingLength > 0) and loadAll and not wasWarm and not reload:
                # same trade-off: on venues where the whole universe is one cheap
                # request(hyperliquid), a cold miss bulk-warms once instead of fetching per outcome
                await self.load_outcomes()
                stillMissing = []
                for i in range(0, missingLength):
                    if not self.has_outcome(missing[i]):
                        stillMissing.append(missing[i])
                missing = stillMissing
                missingLength = len(missing)
            if missingLength > 0:
                await self.fetch_outcomes(missing)
            return self.outcomes
        if not reload and (self.outcomes is not None) and not self.is_empty(self.outcomes):
            return self.outcomes
        await self.load_markets(reload, params)
        self.populate_outcomes()
        return self.outcomes

    async def fetch_outcomes(self, outcomeSymbols: List[str]):
        """
 @ignore
        resolves several uncached outcomes. the base has no batch by-id endpoint, so it fetches them one by one through fetchOutcome(which throws BadSymbol for an unresolvable one); venues with a batch endpoint(kalshi, polymarket) override self to collapse the list into one request
        :param str[] outcomeSymbols: the uncached outcome handles or ids to resolve
        :returns dict: the outcome cache
        """
        for i in range(0, len(outcomeSymbols)):
            await self.fetch_outcome(outcomeSymbols[i])
        return self.outcomes

    async def load_outcome(self, outcomeSymbol: str, reload=False):
        # resolve a single outcome — the per-outcome analogue of loadMarkets()+market(). a cache hit
        # returns at once(pass reload=true to skip the cache and refetch the outcome's metadata).
        # on a miss, fetchOutcome resolves just the requested outcome on demand — a by-id fetch on
        # venues with such an endpoint(kalshi, polymarket) or the venue's scoped search otherwise.
        # options.loadAllOutcomes(default False) opts back into the legacy bulk warm-up: the first
        # miss loads the whole(capped) listing once so later lookups are 0-network hits — only
        # sane on venues whose full universe is one cheap request(hyperliquid)
        if not reload:
            if self.has_outcome(outcomeSymbol):
                return self.safe_outcome(outcomeSymbol)
            wasWarm = (self.outcomes is not None) and not self.is_empty(self.outcomes)
            # if markets are already loaded(offline-injected, or loaded by loadMarkets/fetchEvents)
            # but the outcome cache is cold, index them for free before hitting the network — self
            # makes cold-cache resolution consistent across languages regardless of loadAllOutcomes
            if not wasWarm and (self.markets is not None) and not self.is_empty(self.markets):
                self.populate_outcomes()
                if self.has_outcome(outcomeSymbol):
                    return self.safe_outcome(outcomeSymbol)
            loadAll = self.safe_bool(self.options, 'loadAllOutcomes', False)
            if loadAll and not wasWarm:
                # a miss on a cold cache: bulk-load once so later lookups are 0-network hits.
                # a miss on an already-warm cache is authoritative — the outcome genuinely isn't
                # listed, so fall through to fetchOutcome(a real BadSymbol) rather than refetching
                # the whole listing(which would mask typos and clobber offline-injected markets)
                await self.load_outcomes()
                if self.has_outcome(outcomeSymbol):
                    return self.safe_outcome(outcomeSymbol)
        return await self.fetch_outcome(outcomeSymbol)

    def outcome_search_query(self, outcomeSymbol: str):
        # derive a human search query from a unified outcome handle(EVENT_MARKET:LABEL) so a
        # cache miss can be resolved through the venue's scoped search instead of a bulk listing
        # download. returns None for id-like inputs(numeric token ids, 0x hashes) that
        # carry no searchable words
        marketPart = outcomeSymbol
        colonIndex = outcomeSymbol.find(':')
        if colonIndex >= 0:
            marketPart = outcomeSymbol[0:colonIndex]
        if marketPart.find('0x') == 0:
            return None
        # handles join words with '_'(slug-derived) or legacy '-' separated inputs(normalized below)
        normalized = marketPart.lower().replace('-', '_')
        rawWords = normalized.split('_')
        words = []
        hasLetters = False
        letters = 'abcdefghijklmnopqrstuvwxyz'
        for i in range(0, len(rawWords)):
            word = rawWords[i]
            # inline .length so the php transpiler emits strlen() — the standalone
            # `n = len(str);` statement form wrongly becomes count()(array)
            if len(word) == 0:
                continue
            wordHasLetters = False
            chars = self.string_to_chars_array(word)
            for ci in range(0, len(chars)):
                if letters.find(chars[ci]) >= 0:
                    wordHasLetters = True
                    break
            # the query is the handle's letter-bearing words only. standalone numeric
            # tokens(slug timestamps, strikes, years) are venue artifacts that title searches don't
            # reliably index — and since the result is re-checked against the EXACT handle,
            # a broader query only adds recall, never a wrong match
            if not wordHasLetters:
                continue
            words.append(word)
            hasLetters = True
        wordsLength = len(words)
        if (wordsLength == 0) or not hasLetters:
            # a purely numeric/symbolic handle is an id, not searchable text
            return None
        return ' '.join(words)

    async def fetch_outcome(self, outcomeSymbol: str):
        # fetch just one outcome on demand — never through a bulk listing download. the base has
        # no generic by-id endpoint, so it derives a search query from the handle and resolves it
        # through the venue's own scoped fetchEvents(which caches everything it finds), then
        # re-checks the cache. venues with a real by-id fetch(kalshi by ticker, polymarket by
        # token id) override self with a cheaper single fetch and fall back to super on a miss.
        searchQuery = self.outcome_search_query(outcomeSymbol)
        if (searchQuery is not None) and self.safe_bool(self.has, 'fetchEvents', False):
            searchLimit = self.safe_integer(self.options, 'fetchOutcomeSearchLimit', 10)
            try:
                await self.fetch_events({'query': searchQuery, 'limit': searchLimit})
            except Exception as e:
                # a query with zero matches surfaces on some venues — treat it
                # plain miss(the guidance-rich raise below); real transport errors propagate
                if not (isinstance(e, BadSymbol)):
                    raise e
            if self.has_outcome(outcomeSymbol):
                return self.safe_outcome(outcomeSymbol)
        raise BadSymbol(self.id + ' could not resolve outcome ' + outcomeSymbol + " — call fetchEvents({'query': ...}) first, or pass a known outcomeId")

    async def fetch_ticker(self, outcome: str, params={}):
        """
        fetches a price ticker for a single prediction outcome
        :param str outcome: unified outcome handle
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
        """
        raise NotSupported(self.id + ' fetchTicker() is not supported yet')

    async def fetch_tickers(self, outcomes: Strings = None, params={}):
        """
        fetches price tickers for multiple prediction outcomes at once
        :param str[] [outcomes]: unified outcome handles or outcome ids
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome
        """
        raise NotSupported(self.id + ' fetchTickers() is not supported yet')

    async def fetch_order_book(self, outcome: str, limit: Int = None, params={}):
        """
        fetches the order book for a prediction outcome
        :param str outcome: unified outcome handle
        :param int [limit]: the maximum number of order book entries to return
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
        """
        raise NotSupported(self.id + ' fetchOrderBook() is not supported yet')

    async def fetch_ohlcv(self, outcome: str, timeframe: str = '1m', since: Int = None, limit: Int = None, params={}):
        """
        fetches historical candlestick data for a prediction outcome
        :param str outcome: unified outcome handle
        :param str timeframe: the length of time each candle represents
        :param int [since]: timestamp in ms of the earliest candle to fetch
        :param int [limit]: the maximum number of candles to fetch
        :param dict [params]: extra exchange-specific parameters
        :returns int[][]: a list of candles ordered, open, high, low, close, volume
        """
        return await super(PredictionExchange, self).fetch_ohlcv(outcome, timeframe, since, limit, params)

    async def fetch_trades(self, outcome: str, since: Int = None, limit: Int = None, params={}):
        """
        get the list of most recent trades for a prediction outcome
        :param str outcome: unified outcome handle
        :param int [since]: timestamp in ms of the earliest trade to fetch
        :param int [limit]: the maximum number of trades to fetch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
        """
        raise NotSupported(self.id + ' fetchTrades() is not supported yet')

    async def create_order(self, outcome: str, type: OrderType, side: OrderSide, amount: float, price: Num = None, params={}):
        """
        create a trade order on a prediction outcome
        :param str outcome: unified outcome handle
        :param str type: 'market' or 'limit'
        :param str side: 'buy' or 'sell'
        :param float amount: how many shares of the outcome to trade
        :param float [price]: the price at which the order is to be filled, in cost per share
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
        """
        raise NotSupported(self.id + ' createOrder() is not supported yet')

    async def cancel_order(self, id: str, outcome: Str = None, params={}):
        """
        cancels an open order
        :param str id: order id
        :param str [outcome]: unified outcome handle
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
        """
        raise NotSupported(self.id + ' cancelOrder() is not supported yet')

    async def watch_ticker(self, outcome: str, params={}):
        """
        watches a price ticker for a single prediction outcome
        :param str outcome: unified outcome handle
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
        """
        raise NotSupported(self.id + ' watchTicker() is not supported yet')

    async def watch_order_book(self, outcome: str, limit: Int = None, params={}):
        """
        watches the order book for a prediction outcome
        :param str outcome: unified outcome handle
        :param int [limit]: the maximum number of order book entries to return
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
        """
        raise NotSupported(self.id + ' watchOrderBook() is not supported yet')

    async def watch_trades(self, outcome: str, since: Int = None, limit: Int = None, params={}):
        """
        watches the most recent trades for a prediction outcome
        :param str outcome: unified outcome handle
        :param int [since]: timestamp in ms of the earliest trade to fetch
        :param int [limit]: the maximum number of trades to fetch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
        """
        raise NotSupported(self.id + ' watchTrades() is not supported yet')

    async def fetch_orders(self, outcome: Str = None, since: Int = None, limit: Int = None, params={}):
        """
        fetches information on multiple orders made by the user
        :param str [outcome]: unified outcome handle
        :param int [since]: timestamp in ms of the earliest order to fetch
        :param int [limit]: the maximum number of orders to fetch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
        """
        raise NotSupported(self.id + ' fetchOrders() is not supported yet')

    async def fetch_open_orders(self, outcome: Str = None, since: Int = None, limit: Int = None, params={}):
        """
        fetches information on the user's open orders
        :param str [outcome]: unified outcome handle
        :param int [since]: timestamp in ms of the earliest order to fetch
        :param int [limit]: the maximum number of orders to fetch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
        """
        raise NotSupported(self.id + ' fetchOpenOrders() is not supported yet')

    async def fetch_closed_orders(self, outcome: Str = None, since: Int = None, limit: Int = None, params={}):
        """
        fetches information on multiple closed orders made by the user
        :param str [outcome]: unified outcome handle
        :param int [since]: timestamp in ms of the earliest order to fetch
        :param int [limit]: the maximum number of orders to fetch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
        """
        raise NotSupported(self.id + ' fetchClosedOrders() is not supported yet')

    async def fetch_order_trades(self, id: str, outcome: Str = None, since: Int = None, limit: Int = None, params={}):
        """
        fetch all the trades made from a single order
        :param str id: order id
        :param str [outcome]: unified outcome handle
        :param int [since]: timestamp in ms of the earliest trade to fetch
        :param int [limit]: the maximum number of trades to fetch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
        """
        raise NotSupported(self.id + ' fetchOrderTrades() is not supported yet')

    async def fetch_my_trades(self, outcome: Str = None, since: Int = None, limit: Int = None, params={}):
        """
        fetch all trades made by the user
        :param str [outcome]: unified outcome handle
        :param int [since]: timestamp in ms of the earliest trade to fetch
        :param int [limit]: the maximum number of trades to fetch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
        """
        raise NotSupported(self.id + ' fetchMyTrades() is not supported yet')

    async def fetch_position(self, outcome: str, params={}):
        """
        fetch the open position held on a single prediction outcome
        :param str outcome: unified outcome handle
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [position structure](https://docs.ccxt.com/#/?id=position-structure)
        """
        raise NotSupported(self.id + ' fetchPosition() is not supported yet')

    async def fetch_positions(self, outcomes: Strings = None, params={}):
        """
        fetches the user's open positions
        :param str[] [outcomes]: unified outcome handles to filter by
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
        """
        raise NotSupported(self.id + ' fetchPositions() is not supported yet')

    async def fetch_trading_fee(self, outcome: str, params={}):
        """
        fetch the trading fee for a prediction outcome
        :param str outcome: unified outcome handle
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
        """
        raise NotSupported(self.id + ' fetchTradingFee() is not supported yet')

    async def fetch_open_interest(self, outcome: str, params={}):
        """
        fetch the open interest of a prediction outcome
        :param str outcome: unified outcome handle
        :param dict [params]: extra exchange-specific parameters
        :returns dict: an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
        """
        raise NotSupported(self.id + ' fetchOpenInterest() is not supported yet')

    async def create_orders(self, orders: List[PredictionOrderRequest], params={}):
        """
        create a list of trade orders
        :param dict[] orders: a list of PredictionOrderRequest objects, each carrying an `outcome` handle
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
        """
        raise NotSupported(self.id + ' createOrders() is not supported yet')

    async def cancel_orders(self, ids: List[str], outcome: Str = None, params={}):
        """
        cancel multiple orders
        :param str[] ids: order ids
        :param str [outcome]: unified outcome handle
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
        """
        raise NotSupported(self.id + ' cancelOrders() is not supported yet')

    async def create_market_buy_order_with_cost(self, outcome: str, cost: float, params={}):
        """
        create a market buy order on a prediction outcome by providing the cost
        :param str outcome: unified outcome handle
        :param float cost: how much you want to spend, in cost terms
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
        """
        # safeBool, not self.options['...'] — a raw missing-key access throws KeyError in Python/PHP
        # when the option is undeclared(it is for every prediction exchange)
        if self.safe_bool(self.options, 'createMarketBuyOrderRequiresPrice', False) or self.safe_bool(self.has, 'createMarketBuyOrderWithCost', False):
            return await self.create_order(outcome, 'market', 'buy', cost, 1, params)
        raise NotSupported(self.id + ' createMarketBuyOrderWithCost() is not supported yet')

    async def create_market_sell_order_with_cost(self, outcome: str, cost: float, params={}):
        """
        create a market sell order on a prediction outcome by providing the cost
        :param str outcome: unified outcome handle
        :param float cost: how much you want to receive, in cost terms
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
        """
        if self.safe_bool(self.options, 'createMarketSellOrderRequiresPrice', False) or self.safe_bool(self.has, 'createMarketSellOrderWithCost', False):
            return await self.create_order(outcome, 'market', 'sell', cost, 1, params)
        raise NotSupported(self.id + ' createMarketSellOrderWithCost() is not supported yet')

    async def watch_tickers(self, outcomes: Strings = None, params={}):
        """
        watches price tickers for multiple prediction outcomes
        :param str[] [outcomes]: unified outcome handles to watch
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
        """
        raise NotSupported(self.id + ' watchTickers() is not supported yet')

    async def watch_orders(self, outcome: Str = None, since: Int = None, limit: Int = None, params={}):
        """
        watches information on multiple orders made by the user
        :param str [outcome]: unified outcome handle
        :param int [since]: timestamp in ms of the earliest order to watch
        :param int [limit]: the maximum number of orders to watch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
        """
        raise NotSupported(self.id + ' watchOrders() is not supported yet')

    async def watch_my_trades(self, outcome: Str = None, since: Int = None, limit: Int = None, params={}):
        """
        watches all trades made by the user
        :param str [outcome]: unified outcome handle
        :param int [since]: timestamp in ms of the earliest trade to watch
        :param int [limit]: the maximum number of trades to watch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [trade structures](https://docs.ccxt.com/#/?id=trade-structure)
        """
        raise NotSupported(self.id + ' watchMyTrades() is not supported yet')

    async def watch_positions(self, outcomes: Strings = None, since: Int = None, limit: Int = None, params={}):
        """
        watches the open positions held by the user
        :param str[] [outcomes]: unified outcome handles to watch
        :param int [since]: timestamp in ms of the earliest position to watch
        :param int [limit]: the maximum number of positions to watch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
        """
        raise NotSupported(self.id + ' watchPositions() is not supported yet')

    async def fetch_settlements(self, outcome: Str = None, since: Int = None, limit: Int = None, params={}):
        """
        fetches the user's settled(resolved) positions — the "close the loop" record after
 markets resolve, with the collateral paid out and the realized pnl
        :param str [outcome]: filter to a single unified outcome handle
        :param int [since]: timestamp in ms of the earliest settlement to fetch
        :param int [limit]: the maximum number of settlements to fetch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction settlement structures
        """
        raise NotSupported(self.id + ' fetchSettlements() is not supported yet')

    def safe_prediction_order(self, outcomeOrder: dict, outcomeObj=None):
        # build the prediction order directly(do NOT delegate to the crypto safeOrder, which injects
        # ~a dozen derivatives fields — stopPrice/triggerPrice/reduceOnly noise — the prediction type
        # never declares, and whose parseTrades post-filters embedded fills by `symbol`, dropping every
        # outcome-addressed row). prediction is always linear with a contract size of 1.
        amount = self.omit_zero(self.safe_string(outcomeOrder, 'amount'))
        filled = self.safe_string(outcomeOrder, 'filled')
        remaining = self.safe_string(outcomeOrder, 'remaining')
        cost = self.safe_string(outcomeOrder, 'cost')
        average = self.omit_zero(self.safe_string(outcomeOrder, 'average'))
        price = self.omit_zero(self.safe_string(outcomeOrder, 'price'))
        side = self.safe_string(outcomeOrder, 'side')
        status = self.safe_string(outcomeOrder, 'status')
        lastTradeTimestamp = self.safe_integer(outcomeOrder, 'lastTradeTimestamp')
        # parse embedded fills with the OUTCOME-aware parser(parseTrades would drop them on the symbol filter)
        rawTrades = self.safe_list(outcomeOrder, 'trades', [])
        trades = self.parse_prediction_trades(rawTrades, outcomeObj)
        tradesLength = len(trades)
        feeList = []
        if tradesLength > 0:
            if filled is None:
                filled = '0'
            if cost is None:
                cost = '0'
            for i in range(0, tradesLength):
                trade = trades[i]
                tradeAmount = self.safe_string(trade, 'amount')
                if tradeAmount is not None:
                    filled = Precise.string_add(filled, tradeAmount)
                tradeCost = self.safe_string(trade, 'cost')
                if tradeCost is not None:
                    cost = Precise.string_add(cost, tradeCost)
                if side is None:
                    side = self.safe_string(trade, 'side')
                tradeTimestamp = self.safe_integer(trade, 'timestamp')
                if tradeTimestamp is not None:
                    if lastTradeTimestamp is None:
                        lastTradeTimestamp = tradeTimestamp
                    elif tradeTimestamp > lastTradeTimestamp:
                        lastTradeTimestamp = tradeTimestamp
                tradeFee = self.safe_dict(trade, 'fee')
                if tradeFee is not None:
                    feeList.append(tradeFee)
        # fill any totals the venue left None(linear, contract size 1)
        if (filled is None) and (amount is not None) and (remaining is not None):
            filled = Precise.string_sub(amount, remaining)
        if (remaining is None) and (amount is not None) and (filled is not None):
            remaining = Precise.string_sub(amount, filled)
        if (amount is None) and (filled is not None) and (remaining is not None):
            amount = Precise.string_add(filled, remaining)
        if (average is None) and (filled is not None) and (cost is not None) and Precise.string_gt(filled, '0'):
            average = Precise.string_div(cost, filled)
        if (cost is None) and (filled is not None):
            multiplyPrice = average if (average is not None) else price
            if multiplyPrice is not None:
                cost = Precise.string_mul(filled, multiplyPrice)
        fee = self.safe_dict(outcomeOrder, 'fee')
        # own-line length reads so the regex transpiler emits count()(array), not strlen()
        feeListLength = len(feeList)
        if (fee is None) and (feeListLength > 0):
            reduced = self.reduce_fees_by_currency(feeList)
            reducedLength = len(reduced)
            if reducedLength > 0:
                fee = reduced[0]
        # derive timeInForce/postOnly the same way the crypto safeOrder does(prediction has no
        # trigger orders, so the isTriggerOrSLTp guard collapses): a market order defaults to IOC
        orderType = self.safe_string(outcomeOrder, 'type')
        timeInForce = self.safe_string(outcomeOrder, 'timeInForce')
        postOnly = self.safe_bool(outcomeOrder, 'postOnly')
        if timeInForce is None:
            if orderType == 'market':
                timeInForce = 'IOC'
            if postOnly:
                timeInForce = 'PO'
        elif postOnly is None:
            postOnly = (timeInForce == 'PO')
        timestamp = self.safe_integer(outcomeOrder, 'timestamp')
        datetime = self.safe_string(outcomeOrder, 'datetime')
        if datetime is None:
            datetime = self.iso8601(timestamp)
        result = {
            'id': self.safe_string(outcomeOrder, 'id'),
            'clientOrderId': self.safe_string(outcomeOrder, 'clientOrderId'),
            'timestamp': timestamp,
            'datetime': datetime,
            'lastTradeTimestamp': lastTradeTimestamp,
            'lastUpdateTimestamp': self.safe_integer(outcomeOrder, 'lastUpdateTimestamp'),
            'status': status,
            'type': orderType,
            'timeInForce': timeInForce,
            'side': side,
            'price': self.parse_number(price),
            'average': self.parse_number(average),
            'amount': self.parse_number(amount),
            'filled': self.parse_number(filled),
            'remaining': self.parse_number(remaining),
            'cost': self.parse_number(cost),
            'fee': fee,
            'reduceOnly': self.safe_bool(outcomeOrder, 'reduceOnly'),
            'postOnly': postOnly,
            'trades': trades,
            'outcome': self.safe_string(outcomeOrder, 'outcome'),
            'outcomeId': self.safe_string(outcomeOrder, 'outcomeId'),
            'label': self.safe_string(outcomeOrder, 'label'),
            'market': self.safe_string(outcomeOrder, 'market'),
            'event': self.safe_string(outcomeOrder, 'event'),
            'info': self.safe_value(outcomeOrder, 'info', outcomeOrder),
        }
        return result

    def safe_prediction_trade(self, trade: dict, outcomeObj=None):
        # build the prediction trade directly(no crypto safeTrade, which leaks fields the type omits)
        price = self.safe_string(trade, 'price')
        amount = self.safe_string(trade, 'amount')
        cost = self.safe_string(trade, 'cost')
        if (cost is None) and (price is not None) and (amount is not None):
            cost = Precise.string_mul(price, amount)
        timestamp = self.safe_integer(trade, 'timestamp')
        datetime = self.safe_string(trade, 'datetime')
        if datetime is None:
            datetime = self.iso8601(timestamp)
        result = {
            'id': self.safe_string(trade, 'id'),
            'order': self.safe_string(trade, 'order'),
            'timestamp': timestamp,
            'datetime': datetime,
            'type': self.safe_string(trade, 'type'),
            'side': self.safe_string(trade, 'side'),
            'takerOrMaker': self.safe_string(trade, 'takerOrMaker'),
            'price': self.parse_number(price),
            'amount': self.parse_number(amount),
            'cost': self.parse_number(cost),
            'fee': self.safe_dict(trade, 'fee'),
            'realizedPnl': self.safe_number(trade, 'realizedPnl'),
            'outcome': self.safe_string(trade, 'outcome'),
            'outcomeId': self.safe_string(trade, 'outcomeId'),
            'label': self.safe_string(trade, 'label'),
            'market': self.safe_string(trade, 'market'),
            'info': self.safe_value(trade, 'info', trade),
        }
        return result

    def safe_prediction_ticker(self, ticker: dict, outcomeObj=None):
        # build the prediction ticker directly(no crypto safeTicker, which injects vwap/previousClose/
        # indexPrice/markPrice the type omits). derive change/percentage/average only from open+close —
        # prediction venues report those directly, so the crypto back-derivation from percentage is moot.
        open = self.omit_zero(self.safe_string(ticker, 'open'))
        close = self.omit_zero(self.safe_string_2(ticker, 'close', 'last'))
        last = self.omit_zero(self.safe_string_2(ticker, 'last', 'close'))
        change = self.safe_string(ticker, 'change')
        percentage = self.omit_zero(self.safe_string(ticker, 'percentage'))
        average = self.omit_zero(self.safe_string(ticker, 'average'))
        if (change is None) and (open is not None) and (close is not None):
            change = Precise.string_sub(close, open)
        if (percentage is None) and (change is not None) and (open is not None) and Precise.string_gt(open, '0'):
            percentage = Precise.string_mul(Precise.string_div(change, open), '100')
        if (average is None) and (open is not None) and (close is not None):
            average = Precise.string_div(Precise.string_add(open, close), '2')
        timestamp = self.safe_integer(ticker, 'timestamp')
        datetime = self.safe_string(ticker, 'datetime')
        if datetime is None:
            datetime = self.iso8601(timestamp)
        result = {
            'timestamp': timestamp,
            'datetime': datetime,
            'high': self.safe_number(ticker, 'high'),
            'low': self.safe_number(ticker, 'low'),
            'bid': self.parse_number(self.omit_zero(self.safe_string(ticker, 'bid'))),
            'bidVolume': self.safe_number(ticker, 'bidVolume'),
            'ask': self.parse_number(self.omit_zero(self.safe_string(ticker, 'ask'))),
            'askVolume': self.safe_number(ticker, 'askVolume'),
            'open': self.parse_number(open),
            'close': self.parse_number(close),
            'last': self.parse_number(last),
            'change': self.parse_number(change),
            'percentage': self.parse_number(percentage),
            'average': self.parse_number(average),
            'baseVolume': self.safe_number(ticker, 'baseVolume'),
            'quoteVolume': self.safe_number(ticker, 'quoteVolume'),
            'openInterest': self.safe_number(ticker, 'openInterest'),
            'outcome': self.safe_string(ticker, 'outcome'),
            'outcomeId': self.safe_string(ticker, 'outcomeId'),
            'label': self.safe_string(ticker, 'label'),
            'market': self.safe_string(ticker, 'market'),
            'event': self.safe_string(ticker, 'event'),
            'info': self.safe_value(ticker, 'info', ticker),
        }
        return result

    def safe_prediction_position(self, position: dict):
        # build the prediction position directly(no crypto safePosition, which carries the whole
        # leverage/marginMode/liquidation block the prediction type omits)
        timestamp = self.safe_integer(position, 'timestamp')
        datetime = self.safe_string(position, 'datetime')
        if datetime is None:
            datetime = self.iso8601(timestamp)
        result = {
            'id': self.safe_string(position, 'id'),
            'timestamp': timestamp,
            'datetime': datetime,
            'contracts': self.safe_number(position, 'contracts'),
            'contractSize': self.safe_number(position, 'contractSize'),
            'side': self.safe_string(position, 'side'),
            'notional': self.safe_number(position, 'notional'),
            'unrealizedPnl': self.safe_number(position, 'unrealizedPnl'),
            'realizedPnl': self.safe_number(position, 'realizedPnl'),
            'collateral': self.safe_number(position, 'collateral'),
            'entryPrice': self.safe_number(position, 'entryPrice'),
            'markPrice': self.safe_number(position, 'markPrice'),
            'lastPrice': self.safe_number(position, 'lastPrice'),
            'percentage': self.safe_number(position, 'percentage'),
            'resolved': self.safe_bool(position, 'resolved'),
            'won': self.safe_bool(position, 'won'),
            'settleFraction': self.safe_number(position, 'settleFraction'),
            'payout': self.safe_number(position, 'payout'),
            'outcome': self.safe_string(position, 'outcome'),
            'outcomeId': self.safe_string(position, 'outcomeId'),
            'label': self.safe_string(position, 'label'),
            'market': self.safe_string(position, 'market'),
            'event': self.safe_string(position, 'event'),
            'info': self.safe_value(position, 'info', position),
        }
        return result

    def safe_prediction_order_book(self, orderbook: dict, outcomeObj: dict = None):
        # normalize a parsed order book to the prediction shape: replace the unified
        # `symbol` with the `outcome` handle and attach the outcome identity fields
        # outcomeId and market - so books match the PredictionOrderBook structure.
        fallback = self.safe_string_2(orderbook, 'outcome', 'symbol')
        orderbook['outcome'] = fallback if (outcomeObj is None) else self.safe_string(outcomeObj, 'outcome', fallback)
        orderbook['outcomeId'] = self.safe_string(orderbook, 'outcomeId') if (outcomeObj is None) else self.safe_string(outcomeObj, 'outcomeId')
        orderbook['market'] = self.safe_string(orderbook, 'market') if (outcomeObj is None) else self.safe_string(outcomeObj, 'market')
        # omit(not delete) — `del dict['symbol']` raises KeyError in python/php when absent
        return self.omit(orderbook, 'symbol')

    def parse_prediction_ticker(self, ticker: dict, market: Market = None):
        raise NotSupported(self.id + ' parsePredictionTicker() is not supported yet')

    def parse_prediction_order(self, order: dict, market: Market = None):
        raise NotSupported(self.id + ' parsePredictionOrder() is not supported yet')

    def parse_prediction_trade(self, trade: dict, market: Market = None):
        raise NotSupported(self.id + ' parsePredictionTrade() is not supported yet')

    def parse_prediction_position(self, position: dict, market: Market = None):
        raise NotSupported(self.id + ' parsePredictionPosition() is not supported yet')

    def parse_prediction_open_interest(self, interest: dict, market: Market = None):
        raise NotSupported(self.id + ' parsePredictionOpenInterest() is not supported yet')

    def parse_prediction_trades(self, trades: List[Any], outcomeObj: Any = None, since: Int = None, limit: Int = None, params={}):
        """
 @ignore
        parses a list of raw trades with the exchange's parsePredictionTrade, sorts them and filters by the outcome handle — the prediction analogue of the base parseTrades
        :param dict[] trades: the raw trades
        :param dict [outcomeObj]: the resolved outcome object the trades belong to
        :param int [since]: timestamp in ms of the earliest trade to return
        :param int [limit]: the maximum number of trades to return
        :param dict [params]: extra fields to merge into every parsed trade
        :returns dict[]: a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
        """
        # prediction-market analogue of the base parseTrades: the base aggregator post-filters
        # by the market's `symbol` key, but prediction structures carry an `outcome` handle
        # instead — and an outcome object rebuilt from cached markets may still hold a legacy
        # `symbol` key, which would silently drop every parsed row
        rows = self.to_array(trades)
        results = []
        for i in range(0, len(rows)):
            parsed = self.parse_prediction_trade(rows[i], outcomeObj)
            trade = self.extend(parsed, params)
            results.append(trade)
        results = self.sort_by_2(results, 'timestamp', 'id')
        outcomeHandle = self.safe_string(outcomeObj, 'outcome')
        return self.filter_by_outcome_since_limit(results, outcomeHandle, since, limit)

    def parse_prediction_orders(self, orders: List[Any], outcomeObj: Any = None, since: Int = None, limit: Int = None, params={}):
        """
 @ignore
        parses a list of raw orders with the exchange's parsePredictionOrder, sorts them and filters by the outcome handle — the prediction analogue of the base parseOrders
        :param dict[] orders: the raw orders
        :param dict [outcomeObj]: the resolved outcome object the orders belong to
        :param int [since]: timestamp in ms of the earliest order to return
        :param int [limit]: the maximum number of orders to return
        :param dict [params]: extra fields to merge into every parsed order
        :returns dict[]: a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
        """
        # prediction-market analogue of the base parseOrders — see parsePredictionTrades
        rows = self.to_array(orders)
        results = []
        for i in range(0, len(rows)):
            parsed = self.parse_prediction_order(rows[i], outcomeObj)
            order = self.extend(parsed, params)
            results.append(order)
        results = self.sort_by(results, 'timestamp')
        outcomeHandle = self.safe_string(outcomeObj, 'outcome')
        return self.filter_by_outcome_since_limit(results, outcomeHandle, since, limit)

    def parse_prediction_positions(self, positions: List[Any], params={}):
        """
 @ignore
        parses a list of raw positions with the exchange's parsePredictionPosition — the prediction analogue of the base parsePositions
        :param dict[] positions: the raw positions
        :param dict [params]: extra fields to merge into every parsed position
        :returns dict[]: a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
        """
        # prediction-market analogue of the base parsePositions, which resolves its `symbols`
        # argument through marketSymbols() and would raise BadSymbol on outcome handles.
        # venue-specific outcome filtering stays in the exchange(position identity differs
        # per venue: kalshi positions are market-level, polymarket ones are per token)
        rows = self.to_array(positions)
        results = []
        for i in range(0, len(rows)):
            parsed = self.parse_prediction_position(rows[i])
            position = self.extend(parsed, params)
            results.append(position)
        return results

    def filter_by_outcome_since_limit(self, array, outcome: Str = None, since: Int = None, limit: Int = None, tail=False):
        return self.filter_by_value_since_limit(array, 'outcome', outcome, since, limit, 'timestamp', tail)

    def filter_by_outcomes_since_limit(self, array, outcomes: List[str] = None, since: Int = None, limit: Int = None, tail=False):
        result = self.filter_by_array(array, 'outcome', outcomes, False)
        return self.filter_by_since_limit(result, since, limit, 'timestamp', tail)

    def amount_to_prediction_precision(self, outcome: str, amount):
        outcomeObj = self.outcome(outcome)
        marketSymbol = self.safe_string(outcomeObj, 'market')
        return self.amount_to_precision(marketSymbol, amount)

    def price_to_prediction_precision(self, outcome: str, price):
        outcomeObj = self.outcome(outcome)
        marketSymbol = self.safe_string(outcomeObj, 'market')
        return self.price_to_precision(marketSymbol, price)

    def cost_to_prediction_precision(self, outcome: str, cost):
        outcomeObj = self.outcome(outcome)
        marketSymbol = self.safe_string(outcomeObj, 'market')
        return self.cost_to_precision(marketSymbol, cost)

    def pad_hex_to_even(self, hex: str):
        # prepend a nibble so the hex has an even number of characters(whole bytes)
        hexLength = len(hex)
        if (hexLength % 2) != 0:
            return '0' + hex
        return hex

    def pad_hex_address(self, address: str):
        # left-pads a 20-byte address to a 32-byte ABI word(24 leading zero bytes)
        stripped = self.remove0x_prefix(address)
        return '000000000000000000000000' + stripped

    def rlp_encode_bytes(self, hex: str):
        # RLP-encodes a single byte string(hex without 0x) per the Ethereum RLP spec
        byteLength = self.parse_to_int(len(hex) / 2)
        if byteLength == 0:
            return '80'
        if (byteLength == 1) and (hex < '80'):
            return hex
        if byteLength < 56:
            return self.int_to_base16(128 + byteLength) + hex
        lengthHex = self.int_to_base16(byteLength)
        lengthHex = self.pad_hex_to_even(lengthHex)
        lengthOfLength = self.parse_to_int(len(lengthHex) / 2)
        return self.int_to_base16(183 + lengthOfLength) + lengthHex + hex

    def rlp_encode_list(self, items: List[str]):
        concatenated = ''
        for i in range(0, len(items)):
            concatenated = concatenated + items[i]
        byteLength = self.parse_to_int(len(concatenated) / 2)
        if byteLength < 56:
            return self.int_to_base16(192 + byteLength) + concatenated
        lengthHex = self.int_to_base16(byteLength)
        lengthHex = self.pad_hex_to_even(lengthHex)
        lengthOfLength = self.parse_to_int(len(lengthHex) / 2)
        return self.int_to_base16(247 + lengthOfLength) + lengthHex + concatenated

    def int_to_rlp_hex(self, value: float):
        # an integer minimal big-endian byte hex; 0 is the empty byte string
        if value == 0:
            return ''
        hex = self.int_to_base16(value)
        hex = self.pad_hex_to_even(hex)
        return hex

    def hex_to_rlp_bytes(self, hexValue: str):
        # a hex value(e.g. an RPC result) big-endian byte hex; leading zero bytes
        # are stripped and 0 becomes the empty byte string(RLP integer encoding)
        h = self.remove0x_prefix(hexValue)
        start = 0
        total = len(h)
        while((start < total) and (h[start:start + 1] == '0')):
            start = start + 1
        h = h[start:]
        if h == '':
            return ''
        h = self.pad_hex_to_even(h)
        return h

    def sign_evm_transaction(self, tx: dict, privateKey: str):
        # per-exchange override — needs the noble crypto imports. the base declares it so
        # sendEvmTransaction below can call it; a call on the base itself is unsupported
        raise NotSupported(self.id + ' signEvmTransaction() must be overridden by the exchange')

    async def eth_rpc(self, rpcUrl: str, method: str, rpcParams: List[Any]):
        payload = {'jsonrpc': '2.0', 'id': 1, 'method': method, 'params': rpcParams}
        headers = {'Content-Type': 'application/json'}
        response = await self.fetch(rpcUrl, 'POST', headers, self.json(payload))
        rpcError = self.safe_value(response, 'error')
        if rpcError is not None:
            raise ExchangeError(self.id + ' rpc ' + method + ' error: ' + self.json(rpcError))
        # the result is either a hex string(nonce/gasPrice/txhash) or an object(receipt) —
        # safeString would coerce a receipt object to "[object Object]"
        return self.safe_value(response, 'result')

    async def send_evm_transaction(self, rpcUrl: str, chainId: float, fromAddress: str, to: str, value: str, data: str, gasLimit: str):
        nonce = await self.eth_rpc(rpcUrl, 'eth_getTransactionCount', [fromAddress, 'pending'])
        gasPrice = await self.eth_rpc(rpcUrl, 'eth_gasPrice', [])
        tx = {
            'chainId': chainId,
            'nonce': nonce,
            'maxPriorityFeePerGas': gasPrice,
            'maxFeePerGas': gasPrice,
            'gasLimit': gasLimit,
            'to': to,
            'value': value,
            'data': data,
        }
        signed = self.sign_evm_transaction(tx, self.privateKey)
        return await self.eth_rpc(rpcUrl, 'eth_sendRawTransaction', [signed])

    async def wait_for_transaction_receipt(self, rpcUrl: str, txHash: str, timeout=60000):
        start = self.milliseconds()
        while((self.milliseconds() - start) < timeout):
            receipt = await self.eth_rpc(rpcUrl, 'eth_getTransactionReceipt', [txHash])
            if receipt:
                return receipt
            await self.sleep(2000)
        raise ExchangeError(self.id + ' transaction ' + txHash + ' not mined within timeout')
