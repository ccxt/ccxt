# -*- coding: utf-8 -*-

# ----------------------------------------------------------------------------
# base class for prediction-market exchanges (Polymarket, Kalshi, Limitless, ...)
# the top of this file is hand-written; the methods below the delimiter are
# transpiled from ts/src/base/PredictionExchange.ts
# ----------------------------------------------------------------------------

from typing import Any, List
from ccxt.async_support.base.exchange import Exchange
from ccxt.base.types import Str, Strings, Int, Num, OrderType, OrderSide, PredictionOrderRequest, fetchEventsParams
from ccxt.base.errors import ExchangeError
from ccxt.base.errors import BadSymbol
from ccxt.base.errors import NotSupported
from ccxt.base.errors import ArgumentsRequired


class PredictionExchange(Exchange):
    outcomes = None
    outcomes_by_id = None
    events = None
    events_by_slug = None
    reloadingEvents = None
    eventsLoading = None

    # METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

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
        # entire exchange. require one of query / queries / tags / eventId / slug
        query = self.safe_string(params, 'query')
        queries = self.safe_list(params, 'queries', [])
        tags = self.safe_list(params, 'tags', [])
        eventId = self.safe_string(params, 'eventId')
        slug = self.safe_string(params, 'slug')
        if (query is None) and (len(queries) == 0) and (len(tags) == 0) and (eventId is None) and (slug is None):
            raise ArgumentsRequired(self.id + ' fetchEvents() requires at least one of query, queries, tags, eventId or slug to scope the search')
        return None

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
                result = self.sort_by(result, sortKey, True, 0)
        limit = self.safe_integer(params, 'limit')
        if limit is not None:
            result = self.array_slice(result, 0, limit)
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

    def shorten_slug(self, slug: str):
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

    def slug_to_market_symbol(self, eventSlug: str, marketSlug: str):
        return self.shorten_slug(marketSlug)

    def slug_to_outcome_symbol(self, eventSlug: str, marketSlug: str, outcome: str):
        return self.shorten_slug(marketSlug) + ':' + outcome.upper()

    def slug_to_market_id(self, eventSlug: str, marketSlug: str, outcome: str):
        return self.slug_to_outcome_symbol(eventSlug, marketSlug, outcome)

    def set_markets(self, markets, currencies=None):
        result = super(PredictionExchange, self).set_markets(markets, currencies)
        self.populate_outcomes()
        return result

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

    async def load_outcomes(self, reload=False, params={}):
        # outcome-addressed methods(fetchTicker/createOrder/...) call self first, mirroring how
        # every regular ccxt method calls loadMarkets(). reload/params mirror loadMarkets: reload
        # True refetches and rebuilds. idempotent otherwise: once outcomes are populated(here, or
        # already by an explicit fetchEvents/loadMarkets), later calls no-op and return the cache.
        # loadMarkets() does the actual fetch; populateOutcomes() then rebuilds the lookup caches
        # from the loaded markets(the setMarkets override that normally does self is not dispatched
        # by the base loadMarkets under the Go/C#/Java transpilers).
        if not reload and (self.outcomes is not None) and not self.is_empty(self.outcomes):
            return self.outcomes
        await self.load_markets(reload, params)
        self.populate_outcomes()
        return self.outcomes

    async def load_outcome(self, outcomeSymbol: str):
        # resolve a single outcome — the per-outcome analogue of loadMarkets()+market(). a cache hit
        # returns at once. on a miss, options.loadAllOutcomes(default True) bulk-loads the whole set
        # once so later lookups are 0-network hits; exchanges with too many markets to bulk-load
        # kalshi sets it False and overrides fetchOutcome to fetch just the requested one on demand.
        if self.outcomes is not None:
            if outcomeSymbol in self.outcomes:
                return self.outcomes[outcomeSymbol]
            if (self.outcomes_by_id is not None) and (outcomeSymbol in self.outcomes_by_id):
                return self.outcomes_by_id[outcomeSymbol]
        wasWarm = (self.outcomes is not None) and not self.is_empty(self.outcomes)
        # if markets are already loaded(offline-injected, or loaded by loadMarkets/fetchEvents)
        # but the outcome cache is cold, index them for free before hitting the network — self
        # makes cold-cache resolution consistent across languages regardless of loadAllOutcomes
        if not wasWarm and (self.markets is not None) and not self.is_empty(self.markets):
            self.populate_outcomes()
            if self.outcomes is not None:
                if outcomeSymbol in self.outcomes:
                    return self.outcomes[outcomeSymbol]
                if (self.outcomes_by_id is not None) and (outcomeSymbol in self.outcomes_by_id):
                    return self.outcomes_by_id[outcomeSymbol]
        loadAll = self.safe_bool(self.options, 'loadAllOutcomes', True)
        if loadAll and not wasWarm:
            # a miss on a cold cache: bulk-load once so later lookups are 0-network hits.
            # a miss on an already-warm cache is authoritative — the outcome genuinely isn't
            # listed, so fall through to fetchOutcome(a real BadSymbol) rather than refetching
            # the whole listing(which would mask typos and clobber offline-injected markets)
            await self.load_outcomes()
            if self.outcomes is not None:
                if outcomeSymbol in self.outcomes:
                    return self.outcomes[outcomeSymbol]
                if (self.outcomes_by_id is not None) and (outcomeSymbol in self.outcomes_by_id):
                    return self.outcomes_by_id[outcomeSymbol]
        return await self.fetch_outcome(outcomeSymbol)

    async def fetch_outcome(self, outcomeSymbol: str):
        # fetch just one outcome on demand. the base has no generic single-outcome endpoint, so it
        # resolves from the already-loaded set(loadOutcomes() is a cached no-op once warmed, and
        # self throws BadSymbol if the outcome is absent); exchanges with a by-id market fetch(kalshi)
        # override self to fetch and cache only the requested outcome — the "always fetch one" path.
        await self.load_outcomes()
        return self.outcome(outcomeSymbol)

    async def fetch_ticker(self, outcome: str, params={}):
        """
        fetches a price ticker for a single prediction outcome
        :param str outcome: unified outcome handle
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
        """
        return await super(PredictionExchange, self).fetch_ticker(outcome, params)

    async def fetch_order_book(self, outcome: str, limit: Int = None, params={}):
        """
        fetches the order book for a prediction outcome
        :param str outcome: unified outcome handle
        :param int [limit]: the maximum number of order book entries to return
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
        """
        return await super(PredictionExchange, self).fetch_order_book(outcome, limit, params)

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
        return await super(PredictionExchange, self).fetch_trades(outcome, since, limit, params)

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
        return await super(PredictionExchange, self).create_order(outcome, type, side, amount, price, params)

    async def cancel_order(self, id: str, outcome: Str = None, params={}):
        """
        cancels an open order
        :param str id: order id
        :param str [outcome]: unified outcome handle
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [order structure](https://docs.ccxt.com/#/?id=order-structure)
        """
        return await super(PredictionExchange, self).cancel_order(id, outcome, params)

    async def watch_ticker(self, outcome: str, params={}):
        """
        watches a price ticker for a single prediction outcome
        :param str outcome: unified outcome handle
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
        """
        return await super(PredictionExchange, self).watch_ticker(outcome, params)

    async def watch_order_book(self, outcome: str, limit: Int = None, params={}):
        """
        watches the order book for a prediction outcome
        :param str outcome: unified outcome handle
        :param int [limit]: the maximum number of order book entries to return
        :param dict [params]: extra exchange-specific parameters
        :returns dict: a prediction [order book structure](https://docs.ccxt.com/#/?id=order-book-structure)
        """
        return await super(PredictionExchange, self).watch_order_book(outcome, limit, params)

    async def watch_trades(self, outcome: str, since: Int = None, limit: Int = None, params={}):
        """
        watches the most recent trades for a prediction outcome
        :param str outcome: unified outcome handle
        :param int [since]: timestamp in ms of the earliest trade to fetch
        :param int [limit]: the maximum number of trades to fetch
        :param dict [params]: extra exchange-specific parameters
        :returns dict[]: a list of prediction [trade structures](https://docs.ccxt.com/#/?id=public-trades)
        """
        return await super(PredictionExchange, self).watch_trades(outcome, since, limit, params)

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
        if self.options['createMarketBuyOrderRequiresPrice'] or self.has['createMarketBuyOrderWithCost']:
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
        if self.options['createMarketSellOrderRequiresPrice'] or self.has['createMarketSellOrderWithCost']:
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

    def safe_prediction_order(self, order: dict, market=None):
        # the prediction identity is the `outcome` handle carried on the raw dict(read by
        # toPredictionStructure), not a ccxt `symbol`, so don't pass an outcome object market
        parsed = super(PredictionExchange, self).safe_order(order)
        return self.to_prediction_structure(parsed, order)

    def safe_prediction_trade(self, trade: dict, market=None):
        parsed = super(PredictionExchange, self).safe_trade(trade)
        return self.to_prediction_structure(parsed, trade)

    def safe_prediction_ticker(self, ticker: dict, market=None):
        parsed = super(PredictionExchange, self).safe_ticker(ticker)
        return self.to_prediction_structure(parsed, ticker)

    def safe_prediction_position(self, position: dict):
        parsed = super(PredictionExchange, self).safe_position(position)
        return self.to_prediction_structure(parsed, position)

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

    def to_prediction_structure(self, parsed: dict, raw: dict):
        # the prediction identity is the `outcome` handle(never the base `symbol`); attach it
        # and the other prediction fields(raw exchange id, label, parent market/event) that the
        # base safe* helpers drop. the exchange parser passes them on the raw input dict.
        parsed['outcome'] = self.safe_string(raw, 'outcome')
        parsed['outcomeId'] = self.safe_string(raw, 'outcomeId')
        parsed['label'] = self.safe_string(raw, 'label')
        parsed['market'] = self.safe_string(raw, 'market')
        parsed['event'] = self.safe_string(raw, 'event')
        # guard the delete: a bare `delete` is a no-op on a missing key in JS, but transpiles to
        # `del`/`unset` which raises in Python when the inherited `symbol` was never set
        if 'symbol' in parsed:
            del parsed['symbol']
        return parsed

    def parse_prediction_trades(self, trades: List[Any], outcomeObj: Any = None, since: Int = None, limit: Int = None, params={}):
        """
 @ignore
        parses a list of raw trades with the exchange's parseTrade, sorts them and filters by the outcome handle — the prediction analogue of the base parseTrades
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
            parsed = self.parse_trade(rows[i], outcomeObj)
            trade = self.extend(parsed, params)
            results.append(trade)
        results = self.sort_by_2(results, 'timestamp', 'id')
        outcomeHandle = self.safe_string(outcomeObj, 'outcome')
        return self.filter_by_outcome_since_limit(results, outcomeHandle, since, limit)

    def parse_prediction_orders(self, orders: List[Any], outcomeObj: Any = None, since: Int = None, limit: Int = None, params={}):
        """
 @ignore
        parses a list of raw orders with the exchange's parseOrder, sorts them and filters by the outcome handle — the prediction analogue of the base parseOrders
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
            parsed = self.parse_order(rows[i], outcomeObj)
            order = self.extend(parsed, params)
            results.append(order)
        results = self.sort_by(results, 'timestamp')
        outcomeHandle = self.safe_string(outcomeObj, 'outcome')
        return self.filter_by_outcome_since_limit(results, outcomeHandle, since, limit)

    def parse_prediction_positions(self, positions: List[Any], params={}):
        """
 @ignore
        parses a list of raw positions with the exchange's parsePosition — the prediction analogue of the base parsePositions
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
            parsed = self.parse_position(rows[i])
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
