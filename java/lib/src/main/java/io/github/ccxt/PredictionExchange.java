package io.github.ccxt;

// ----------------------------------------------------------------------------
// base class for prediction-market exchanges (Polymarket, Kalshi, Limitless, ...)
// the top of this file is hand-written; the methods below the delimiter are
// transpiled from ts/src/base/PredictionExchange.ts
// ----------------------------------------------------------------------------

import io.github.ccxt.base.*;
import io.github.ccxt.errors.*;
import io.github.ccxt.ws.*;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import io.github.ccxt.types.OHLCV;
import io.github.ccxt.types.PredictionEvent;
import io.github.ccxt.types.PredictionOpenInterest;
import io.github.ccxt.types.PredictionOrder;
import io.github.ccxt.types.PredictionOrderBook;
import io.github.ccxt.types.PredictionPosition;
import io.github.ccxt.types.PredictionSettlement;
import io.github.ccxt.types.PredictionTicker;
import io.github.ccxt.types.PredictionTickers;
import io.github.ccxt.types.PredictionTrade;
import io.github.ccxt.types.PredictionTradingFee;
import java.util.stream.Collectors;

public class PredictionExchange extends BaseExchange implements PredictionTypedSurface {
    public volatile Map<String, Object> outcomes = null;
    public volatile Map<String, Object> outcomes_by_id = null;
    public volatile Map<String, Object> events = null;
    public volatile Map<String, Object> events_by_slug = null;

    public PredictionExchange () {
        super();
    }

    public PredictionExchange (Object args) {
        super(args);
    }

    // Venue-specific prediction methods (limitless.redeem) are absent from
    // PredictionExchange.ts; the tier-wide typed surface still needs an
    // core to dispatch to, so unsupported venues throw here.
    public CompletableFuture<Object> redeem(String outcome, Map<String, Object> params) {
        return supplyAsync(() -> {
            throw new NotSupported(Helpers.add(this.id, " redeem() is not supported yet"));
        });
    }

    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

public Map<String, Object> describe()
    {
        return this.deepExtend(super.describe(), new HashMap<String, Object>() {{
            put( "has", new HashMap<String, Object>() {{
                put( "prediction", true );
                put( "approve", false );
                put( "redeem", false );
                put( "fetchEvent", false );
                put( "fetchEvents", false );
                put( "fetchOutcome", false );
                put( "fetchSettlements", false );
                put( "createOrder", false );
                put( "createOrders", false );
                put( "createLimitOrder", false );
                put( "createMarketOrder", false );
                put( "createMarketOrderWs", false );
                put( "createMarketBuyOrderWithCost", false );
                put( "cancelOrder", false );
                put( "cancelOrders", false );
                put( "cancelAllOrders", false );
                put( "editOrder", false );
                put( "fetchBalance", false );
                put( "fetchOrder", false );
                put( "fetchOrders", false );
                put( "fetchOrdersByIds", false );
                put( "fetchOrderTrades", false );
                put( "fetchOpenOrders", false );
                put( "fetchClosedOrders", false );
                put( "fetchCanceledOrders", false );
                put( "fetchMyTrades", false );
                put( "fetchPosition", false );
                put( "fetchPositions", false );
                put( "fetchAccounts", false );
                put( "fetchLedger", false );
                put( "fetchDeposits", false );
                put( "fetchWithdrawals", false );
                put( "fetchMarkets", false );
                put( "fetchCurrencies", false );
                put( "fetchTicker", false );
                put( "fetchTickers", false );
                put( "fetchOrderBook", false );
                put( "fetchL2OrderBook", false );
                put( "fetchOHLCV", false );
                put( "fetchTrades", false );
                put( "fetchStatus", false );
                put( "fetchTime", false );
                put( "fetchOpenInterest", false );
                put( "fetchTradingFee", false );
                put( "watchTicker", false );
                put( "watchTickers", false );
                put( "watchOrderBook", false );
                put( "watchTrades", false );
                put( "watchOrders", false );
                put( "watchMyTrades", false );
                put( "watchOHLCV", false );
                put( "watchPositions", false );
            }} );
        }});
    }

    public Object isPrediction()
    {
        return this.safeBool(this.has, "prediction", false);
    }

    public List<Object> parseSearchQueries(Map<String, Object> parameters)
    {
        // accepts either `query` (a single search string) or `queries` (a list of strings)
        String singleQuery = this.safeString(parameters, "query");
        if (!java.util.Objects.equals(singleQuery, null))
        {
            return new ArrayList<Object>(Arrays.asList(singleQuery));
        }
        // every element must be a string (a number is stringified like safeString does), so all ports see string[]
        List<Object> rawQueries = this.toArray(this.safeList(parameters, "queries", new ArrayList<Object>(Arrays.asList())));
        Integer rawQueriesLength = rawQueries.size();
        List<Object> queries = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; (rawQueriesLength != null && i < rawQueriesLength); i++)
        {
            String query = this.safeString(rawQueries, i);
            if (java.util.Objects.equals(query, null))
            {
                throw new BadRequest((this.id + " params.queries must be a list of strings")) ;
            }
            ((List<Object>)queries).add(query);
        }
        return queries;
    }

    public Object requireEventQuery(Map<String, Object> parameters)
    {
        // fetchEvents must be scoped by at least one selector — an unfiltered call would page the
        // entire exchange. require one of query / queries / tags / eventId / slug, or one of the
        // venue-specific scope params an exchange declares in options['eventScopeParams'],
        // e.g. kalshi's category / series_ticker
        String query = this.safeString(parameters, "query");
        List<Object> queries = this.safeList(parameters, "queries", new ArrayList<Object>(Arrays.asList()));
        List<Object> tags = this.safeList(parameters, "tags", new ArrayList<Object>(Arrays.asList()));
        String eventId = this.safeString(parameters, "eventId");
        String slug = this.safeString(parameters, "slug");
        Integer queriesLength = queries.size();
        Integer tagsLength = tags.size();
        if ((!java.util.Objects.equals(query, null)) || ((queriesLength != null && queriesLength > 0)) || ((tagsLength != null && tagsLength > 0)) || (!java.util.Objects.equals(eventId, null)) || (!java.util.Objects.equals(slug, null)))
        {
            return null;
        }
        List<Object> extraScopeParams = this.safeList(this.options, "eventScopeParams", new ArrayList<Object>(Arrays.asList()));
        Integer extraScopeParamsLength = extraScopeParams.size();
        String extraNames = "";
        for (var i = 0; (extraScopeParamsLength != null && i < extraScopeParamsLength); i++)
        {
            Object scopeKey = (extraScopeParams == null || i < 0 || i >= extraScopeParams.size() ? null : extraScopeParams.get(i));
            if ((scopeKey != null && parameters.containsKey(scopeKey)))
            {
                return null;
            }
            extraNames = ((extraNames + ", ") + scopeKey);
        }
        throw new ArgumentsRequired((((this.id + " fetchEvents() requires at least one of query, queries, tags, eventId, slug") + extraNames) + " to scope the search")) ;
    }

    public Object applyEventFetchParams(Object events, Map<String, Object> parameters, Object queries)
    {
        // applies the unified fetchEvents options client-side (eventId/slug/status/searchIn/sort/limit)
        // so exchanges whose API can't filter natively still support them consistently.
        // every fetched event lands in the cache before filtering, so loadEvents()/event()
        // serve them later without another request
        this.setEvents(events);
        Object result = events;
        String eventId = this.safeString(parameters, "eventId");
        String slug = this.safeString(parameters, "slug");
        if ((!java.util.Objects.equals(eventId, null)) || (!java.util.Objects.equals(slug, null)))
        {
            List<Object> filtered = new ArrayList<Object>(Arrays.asList());
            for (var i = 0; i < ((List<?>)result).size(); i++)
            {
                Map<String, Object> eventVar = this.safeDict(result, i, null);
                Boolean idMatch = (!java.util.Objects.equals(eventId, null)) && (java.util.Objects.equals(this.safeString(eventVar, "id"), eventId));
                Boolean slugMatch = (!java.util.Objects.equals(slug, null)) && (java.util.Objects.equals(this.safeString(eventVar, "slug"), slug));
                if (Boolean.TRUE.equals(idMatch) || Boolean.TRUE.equals(slugMatch))
                {
                    ((List<Object>)filtered).add(this.safeValue(result, i));
                }
            }
            result = filtered;
        }
        result = this.filterEventsByStatus(result, this.safeString(parameters, "status"));
        result = this.filterEventsByTags(result, this.safeList(parameters, "tags", null));
        // own-line length read so the regex transpiler treats `queries` as an array (count())
        // and not a string (strlen()); guard undefined since the default is undefined
        Integer queriesLength = 0;
        if (!java.util.Objects.equals(queries, null))
        {
            queriesLength = ((List<?>)queries).size();
        }
        if ((queriesLength != null && queriesLength > 0))
        {
            result = this.filterEventsBySearchIn(result, queries, this.safeString(parameters, "searchIn"));
        }
        String sort = this.safeString(parameters, "sort");
        if (!java.util.Objects.equals(sort, null))
        {
            String sortKey = "";
            if (java.util.Objects.equals(sort, "volume"))
            {
                sortKey = "volume";
            } else if (java.util.Objects.equals(sort, "liquidity"))
            {
                sortKey = "liquidity";
            } else if (java.util.Objects.equals(sort, "newest"))
            {
                sortKey = "created";
            }
            if (!java.util.Objects.equals(sortKey, ""))
            {
                // normalize the sort key on every row first — sortBy reads it with a raw
                // subscript, which raises KeyError/undefined-index in Python/PHP when a
                // venue's parsed event omits the field (JS alone tolerates the miss)
                for (var i = 0; i < ((List<?>)result).size(); i++)
                {
                    Helpers.addElementToObject(Helpers.GetValue(result, i), sortKey, this.safeNumber((result == null || i < 0 || i >= ((List<?>)result).size() ? null : ((List<?>)result).get(i)), sortKey, 0));
                }
                result = this.sortBy(result, sortKey, true, 0);
            }
        }
        Long limit = this.safeInteger(parameters, "limit");
        if (!java.util.Objects.equals(limit, null))
        {
            // clamp to the result length: arraySlice(x, 0, limit) with limit > length panics in Go
            // via reflect Slice, and throws in C#, unlike JS/Python which return the whole array
            Integer resultLength = ((List<?>)result).size();
            Long limitValue = this.safeInteger(parameters, "limit", 0);
            Object sliceEnd = resultLength;
            if ((resultLength != null && (limitValue == null || limitValue < resultLength)))
            {
                sliceEnd = limitValue;
            }
            result = this.arraySlice(result, 0, sliceEnd);
        }
        return result;
    }

    public Object filterEventsByStatus(Object events, String status)
    {
        // 'active' | 'inactive' | 'closed' | 'all' — 'inactive' and 'closed' are interchangeable
        if ((java.util.Objects.equals(status, null)) || (java.util.Objects.equals(status, "all")))
        {
            return events;
        }
        Boolean wantActive = (java.util.Objects.equals(status, "active"));
        List<Object> result = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < ((List<?>)events).size(); i++)
        {
            Map<String, Object> eventVar = this.safeDict(events, i, null);
            Boolean isActive = (Boolean) this.safeBool(eventVar, "active", null);
            // keep events whose status is unknown (already filtered server-side, no `active` field)
            if ((java.util.Objects.equals(isActive, null)) || (java.util.Objects.equals(isActive, wantActive)))
            {
                ((List<Object>)result).add(this.safeValue(events, i));
            }
        }
        return result;
    }

    public Object filterEventsBySearchIn(Object events, Object queries, String searchIn)
    {
        // keep events whose title and/or description contains one of the queries (searchIn defaults to 'both')
        // own-line length read so the regex transpiler uses count() (array) not strlen() (string)
        Integer queriesLength = 0;
        if (!java.util.Objects.equals(queries, null))
        {
            queriesLength = ((List<?>)queries).size();
        }
        if ((java.util.Objects.equals(searchIn, null)) || (java.util.Objects.equals(queriesLength, 0)))
        {
            return events;
        }
        Boolean checkTitle = (java.util.Objects.equals(searchIn, "title")) || (java.util.Objects.equals(searchIn, "both"));
        Boolean checkDescription = (java.util.Objects.equals(searchIn, "description")) || (java.util.Objects.equals(searchIn, "both"));
        List<Object> result = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < ((List<?>)events).size(); i++)
        {
            Map<String, Object> eventVar = this.safeDict(events, i, null);
            String title = this.safeStringLower(eventVar, "title", "");
            String description = this.safeStringLower(eventVar, "description", "");
            Boolean matched = false;
            for (var qi = 0; (queriesLength != null && qi < queriesLength); qi++)
            {
                String q = this.safeString(queries, qi, "").toLowerCase();
                if (Boolean.TRUE.equals(checkTitle) && (((String)title).indexOf(q) >= 0))
                {
                    matched = true;
                    break;
                }
                if (Boolean.TRUE.equals(checkDescription) && (((String)description).indexOf(q) >= 0))
                {
                    matched = true;
                    break;
                }
            }
            if (Boolean.TRUE.equals(matched))
            {
                ((List<Object>)result).add(this.safeValue(events, i));
            }
        }
        return result;
    }

    public String normalizeTagKey(Object tag)
    {
        // reduce a tag to lowercase alphanumeric words joined by single spaces ("Fed Rates" /
        // "fed-rates" / "FED_RATES" all become "fed rates") so label, slug and handle spellings
        // of the same tag compare equal — venues surface tags in different forms and callers
        // pass any of them. keeping the word boundary avoids cross-word false positives that
        // plain concatenation would create ("us open" vs "household")
        String lower = ((String)tag).toLowerCase();
        String allowed = "abcdefghijklmnopqrstuvwxyz0123456789";
        List<String> chars = this.stringToCharsArray(lower);
        String s = "";
        Boolean pendingSep = false;
        for (var i = 0; i < chars.size(); i++)
        {
            String ch = (chars == null || i < 0 || i >= chars.size() ? null : chars.get(i));
            if (((String)allowed).indexOf(ch) >= 0)
            {
                if (Boolean.TRUE.equals(pendingSep) && (!java.util.Objects.equals(s, "")))
                {
                    s = (s + " ");
                }
                s = (s + ch);
                pendingSep = false;
            } else
            {
                pendingSep = true;
            }
        }
        return s;
    }

    public Object filterEventsByTags(Object events, Object tags)
    {
        // keep events carrying one of the requested tags; tolerant to string tags and to
        // object tags ({ slug, title, ... }) since venues differ. no-op when no tags requested
        Integer tagsLength = 0;
        if (!java.util.Objects.equals(tags, null))
        {
            tagsLength = ((List<?>)tags).size();
        }
        if (java.util.Objects.equals(tagsLength, 0))
        {
            return events;
        }
        List<String> wanted = new ArrayList<String>(Arrays.asList());
        for (var i = 0; (tagsLength != null && i < tagsLength); i++)
        {
            String wantedKey = this.normalizeTagKey(this.safeString(tags, i, ""));
            if (!java.util.Objects.equals(wantedKey, ""))
            {
                // an empty normalized key would substring-match every tag
                wanted.add(wantedKey);
            }
        }
        List<Object> result = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < ((List<?>)events).size(); i++)
        {
            Map<String, Object> eventVar = this.safeDict(events, i, null);
            List<Object> eventTags = this.safeList(eventVar, "tags", new ArrayList<Object>(Arrays.asList()));
            Boolean matched = false;
            for (var ti = 0; ti < eventTags.size(); ti++)
            {
                Object tag = (eventTags == null || ti < 0 || ti >= eventTags.size() ? null : eventTags.get(ti));
                Object tagLabel = null;
                if ((tag instanceof String))
                {
                    tagLabel = tag;
                } else
                {
                    tagLabel = this.safeString2(tag, "slug", "title");
                }
                if (!java.util.Objects.equals(tagLabel, null))
                {
                    String tagKey = this.normalizeTagKey(tagLabel);
                    for (var wi = 0; wi < wanted.size(); wi++)
                    {
                        if ((tagKey == null || wanted == null || wi < 0 || wi >= wanted.size() || wanted.get(wi) == null ? -1 : tagKey.indexOf(wanted.get(wi))) >= 0)
                        {
                            matched = true;
                            break;
                        }
                    }
                }
                if (Boolean.TRUE.equals(matched))
                {
                    break;
                }
            }
            if (Boolean.TRUE.equals(matched))
            {
                ((List<Object>)result).add(this.safeValue(events, i));
            }
        }
        return result;
    }

    public CompletableFuture<List<PredictionEvent>> fetchEvents(Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchEvents() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionEvent::new).collect(Collectors.toList()));

    }

    public CompletableFuture<PredictionEvent> fetchEvent(String id, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchEvent() is not supported yet"))).thenApply(PredictionEvent::new);

    }

    public Object setEvents(Object events)
    {
        // merge (not reset) so successive scoped fetchEvents calls accumulate into the cache.
        // index by the unified `event` handle too (that's the identifier every outcome's `event`
        // field carries), so getEvent (handle) resolves without each exchange hand-writing it
        if (java.util.Objects.equals(this.events, null))
        {
            this.events = new HashMap<String, Object>() {{}};
        }
        if (java.util.Objects.equals(this.events_by_slug, null))
        {
            this.events_by_slug = new HashMap<String, Object>() {{}};
        }
        for (var i = 0; i < ((List<?>)events).size(); i++)
        {
            Map<String, Object> eventVar = this.safeDict(events, i, null);
            String id = this.safeString(eventVar, "id");
            String slug = this.safeString(eventVar, "slug");
            String handle = this.safeString(eventVar, "event");
            if (!java.util.Objects.equals(id, null))
            {
                this.events.put(id, eventVar);
            }
            if (!java.util.Objects.equals(handle, null))
            {
                this.events.put(handle, eventVar);
            }
            if (!java.util.Objects.equals(slug, null))
            {
                this.events_by_slug.put(slug, eventVar);
            }
        }
        return this.events;
    }

    public Object eventsList()
    {
        // the cached events as a list; empty on a cold instance (this.events is keyed by both
        // id and handle, so de-duplicate by identity before returning)
        if (java.util.Objects.equals(this.events, null))
        {
            return new ArrayList<Object>(Arrays.asList());
        }
        List<Object> result = new ArrayList<Object>(Arrays.asList());
        Map<String, Object> seen = new HashMap<String, Object>() {{}};
        List<String> keys = (this.events == null ? new ArrayList<String>() : new ArrayList<String>(this.events.keySet()));
        for (var i = 0; i < keys.size(); i++)
        {
            Object eventVar = Helpers.GetValue(this.events, (keys == null || i < 0 || i >= keys.size() ? null : keys.get(i)));
            String identity = this.safeString2(eventVar, "id", "event", (keys == null || i < 0 || i >= keys.size() ? null : keys.get(i)));
            if (!(seen.containsKey(identity)))
            {
                seen.put(identity, true);
                ((List<Object>)result).add(eventVar);
            }
        }
        return result;
    }

    public CompletableFuture<Object> loadEventsHelper(Boolean reload, Map<String, Object> parameters)
    {
        return BaseExchange.supplyAsync(() -> this.loadEventsHelperCore(reload, parameters));
    }

    private Object loadEventsHelperCore(Boolean reload, Map<String, Object> parameters)
    {

        // note: the cache-hit shortcut ignores params, so events fetched under one scope are
        // returned for a later differently-scoped call. events are scoped (unlike global
        // markets), so prefer fetchEvents (params) directly when you need a specific scope
        if (!java.util.Objects.requireNonNullElse(reload, false) && (!java.util.Objects.equals(this.events, null) && !java.util.Objects.equals(this.events, null)))
        {
            return this.events;
        }
        Object events = (this.fetchEvents(parameters)).join();
        return this.setEvents(events);

    }

    public CompletableFuture<Object> loadEvents(Boolean reload, Map<String, Object> parameters)
    {
        return BaseExchange.supplyAsync(() -> this.loadEventsCore(reload, parameters));
    }

    private Object loadEventsCore(Boolean reload, Map<String, Object> parameters)
    {

        // cached entry point mirroring loadMarkets. unlike loadMarkets there is no cross-call
        // promise coalescing: the promise-sharing idiom is not expressible in the transpiled
        // base, so two truly concurrent first calls may fetch twice (both land in the cache)
        return (this.loadEventsHelper(java.util.Objects.requireNonNullElse(reload, false), parameters)).join();

    }

    public Object getEvent(Object eventIdOrSlug)
    {
        // cache-only event resolver (the event analogue of this.outcome) - the cache fills
        // through fetchEvents; this never fetches
        if ((!java.util.Objects.equals(this.events, null)) && (((Map<?, ?>)this.events).containsKey(eventIdOrSlug)))
        {
            return this.safeDict(this.events, eventIdOrSlug, null);
        }
        if ((!java.util.Objects.equals(this.events_by_slug, null)) && (((Map<?, ?>)this.events_by_slug).containsKey(eventIdOrSlug)))
        {
            return this.safeDict(this.events_by_slug, eventIdOrSlug, null);
        }
        throw new BadSymbol((((this.id + " has no cached event ") + eventIdOrSlug) + " - call fetchEvents ({ 'query': ... }) first")) ;
    }

    public Map<String, Object> outcome(String outcomeSymbol)
    {
        if (java.util.Objects.equals(outcomeSymbol, null))
        {
            throw new ArgumentsRequired((this.id + " outcome() requires an outcomeSymbol argument")) ;
        }
        if ((java.util.Objects.equals(this.outcomes, null)) || this.isEmpty(this.outcomes))
        {
            throw new ExchangeError((this.id + " outcomes not loaded - call loadOutcomes () or an outcome-addressed method first")) ;
        }
        if (((Map<?, ?>)this.outcomes).containsKey(outcomeSymbol))
        {
            return (Map<String, Object>) (this.safeValue(this.outcomes, outcomeSymbol));
        }
        if ((!java.util.Objects.equals(this.outcomes_by_id, null)) && (((Map<?, ?>)this.outcomes_by_id).containsKey(outcomeSymbol)))
        {
            return (Map<String, Object>) (this.safeValue(this.outcomes_by_id, outcomeSymbol));
        }
        throw new BadSymbol((((this.id + " does not have outcome ") + outcomeSymbol) + " - pass a known outcome handle or outcomeId, or call fetchEvents ()/loadOutcomes () first")) ;
    }

    public Boolean hasOutcome(String outcomeIdOrSymbol)
    {
        // sync cache-only membership probe — never throws and never fetches. this is the predicate
        // behind loadOutcome's fast path and loadOutcomes' miss filter; safeOutcome (stub on miss)
        // and outcome (throws on miss) are the accessors
        if (java.util.Objects.equals(outcomeIdOrSymbol, null))
        {
            return false;
        }
        if ((!java.util.Objects.equals(this.outcomes, null)) && (((Map<?, ?>)this.outcomes).containsKey(outcomeIdOrSymbol)))
        {
            return true;
        }
        if ((!java.util.Objects.equals(this.outcomes_by_id, null)) && (((Map<?, ?>)this.outcomes_by_id).containsKey(outcomeIdOrSymbol)))
        {
            return true;
        }
        return false;
    }

    public Map<String, Object> safeOutcome(String outcomeIdOrSymbol, Map<String, Object> market)
    {
        if (!java.util.Objects.equals(outcomeIdOrSymbol, null))
        {
            if ((!java.util.Objects.equals(this.outcomes, null)) && (((Map<?, ?>)this.outcomes).containsKey(outcomeIdOrSymbol)))
            {
                return (Map<String, Object>) (this.safeValue(this.outcomes, outcomeIdOrSymbol));
            }
            if ((!java.util.Objects.equals(this.outcomes_by_id, null)) && (((Map<?, ?>)this.outcomes_by_id).containsKey(outcomeIdOrSymbol)))
            {
                return (Map<String, Object>) (this.safeValue(this.outcomes_by_id, outcomeIdOrSymbol));
            }
        }
        if (!java.util.Objects.equals(market, null))
        {
            return (Map<String, Object>) (market);
        }
        // stub for an unknown handle; it only carries the identity keys, not the market fields
        Map<String, Object> outcomeObjValue = new HashMap<String, Object>();
        outcomeObjValue.put("outcome", outcomeIdOrSymbol);
        outcomeObjValue.put("outcomeId", outcomeIdOrSymbol);
        outcomeObjValue.put("market", null);
        outcomeObjValue.put("label", null);
        outcomeObjValue.put("event", null);
        outcomeObjValue.put("info", new HashMap<String, Object>() {{}});
        return outcomeObjValue;
    }

    public String safeOutcomeSymbol(String outcomeIdOrSymbol, Object outcomeObj)
    {
        // outcomeObj may be any outcome-shaped dict, not only a market: read it here instead of
        // handing it to safeOutcome (whose fallback slot is a Market)
        if (!this.hasOutcome(outcomeIdOrSymbol) && (!java.util.Objects.equals(outcomeObj, null)))
        {
            return this.safeString(outcomeObj, "outcome");
        }
        Map<String, Object> outcomeObjValue = this.safeOutcome(outcomeIdOrSymbol, null);
        return (String) outcomeObjValue.get("outcome");
    }

    public String shortenSlug(String slug)
    {
        Map<String, Object> replacements = new HashMap<String, Object>() {{
            put( "federal-reserve", "fed" );
            put( "interest-rates", "rates" );
            put( "interest-rate", "rate" );
            put( "basis-points", "bps" );
            put( "basis-point", "bp" );
            put( "executive-order", "eo" );
            put( "united-states", "us" );
            put( "united-kingdom", "uk" );
            put( "european-union", "eu" );
            put( "artificial-intelligence", "ai" );
            put( "republican-party", "gop" );
            put( "democratic-party", "dems" );
            put( "stock-market", "market" );
            put( "price-target", "pt" );
            put( "market-cap", "mcap" );
            put( "increase", "hike" );
            put( "decrease", "cut" );
            put( "higher", "up" );
            put( "lower", "down" );
            put( "greater", "gt" );
            put( "less", "lt" );
            put( "million", "M" );
            put( "billion", "B" );
            put( "trillion", "T" );
            put( "percent", "pct" );
        }};
        List<String> stopWords = new ArrayList<String>(Arrays.asList("will", "the", "a", "an", "after", "before", "in", "at", "by", "of", "there", "be", "to", "or", "and", "for", "on", "its", "that", "this", "from", "with", "as", "is", "are", "was", "were", "?", "how", "many", "who", "what", "when", "where", "which", "much"));
        String lower = (((java.util.Objects.equals(slug, null)))) ? "" : slug.toLowerCase();
        String allowed = "abcdefghijklmnopqrstuvwxyz0123456789";
        List<String> chars = this.stringToCharsArray(lower);
        String s = "";
        Boolean lastDash = true; // start true to drop leading separators
        for (var i = 0; i < chars.size(); i++)
        {
            String ch = (chars == null || i < 0 || i >= chars.size() ? null : chars.get(i));
            if (((String)allowed).indexOf(ch) >= 0)
            {
                s = (s + ch);
                lastDash = false;
            } else if (!Boolean.TRUE.equals(lastDash))
            {
                s = (s + "-");
                lastDash = true;
            }
        }
        List<String> replacementKeys = new ArrayList<String>(replacements.keySet());
        for (var i = 0; i < replacementKeys.size(); i++)
        {
            String replacementKey = (replacementKeys == null || i < 0 || i >= replacementKeys.size() ? null : replacementKeys.get(i));
            String replacementValue = this.safeString(replacements, replacementKey);
            if (!java.util.Objects.equals(replacementValue, null))
            {
                s = Helpers.replaceAll(((String)s), replacementKey, replacementValue);
            }
        }
        List<Object> rawParts = new ArrayList<Object>(Arrays.asList(s.split(java.util.regex.Pattern.quote("-"))));
        List<String> parts = new ArrayList<String>(Arrays.asList());
        for (var i = 0; i < rawParts.size(); i++)
        {
            String w = (String) (rawParts == null || i < 0 || i >= rawParts.size() ? null : rawParts.get(i));
            if (w.length() > 0 && !this.inArray(w, stopWords))
            {
                parts.add(w);
            }
        }
        String joined = String.join("_", (List<String>)parts);
        return joined.toUpperCase();
    }

    public String slugToMarketSymbol(String eventSlug, String marketSlug)
    {
        // eventSlug is nullable (Str): markets without a parent event (e.g. myriad's 1:1 markets)
        // pass undefined — the body already collapses an absent event to just the market part.
        // a strict `string` param would make PHP/typed transpilers throw on null before the body runs.
        // qualify the market handle with its event so two events that share a market label
        // — e.g. kalshi's KXFEDDECISION-28JAN and -27OCT both list "Cut 25bps" — do NOT collapse
        // to the same handle — a collision silently overwrites markets in this.markets and would
        // resolve an outcome to the wrong event (wrong-market trade). skip the prefix when the
        // event slug is absent or identical to the market slug (e.g. myriad's 1:1 markets), so
        // already-unique handles stay clean.
        String marketPart = this.shortenSlug(marketSlug);
        String eventPart = this.shortenSlug(eventSlug);
        if ((java.util.Objects.equals(eventPart, null)) || (java.util.Objects.equals(eventPart, "")) || (java.util.Objects.equals(eventPart, marketPart)))
        {
            return marketPart;
        }
        return ((eventPart + "_") + marketPart);
    }

    public String slugToOutcomeSymbol(String eventSlug, String marketSlug, String outcome)
    {
        // build on slugToMarketSymbol so the outcome handle stays consistent with the market symbol
        // — both event-qualified or both not — otherwise a qualified market + unqualified outcome mismatch.
        // the label gets a light slug treatment (uppercase alphanumerics joined by '_', no stop-word
        // removal so labels like "UP OR DOWN" survive intact) — venue labels with spaces or
        // currency symbols ("JD Vance", a dollar-sign price) yield clean handles (JD_VANCE, 120)
        // instead of leaking raw text into the outcome handle
        String upper = (((java.util.Objects.equals(outcome, null)))) ? "" : outcome.toUpperCase();
        String allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        List<String> chars = this.stringToCharsArray(upper);
        String label = "";
        Boolean pendingSep = false;
        for (var i = 0; i < chars.size(); i++)
        {
            String ch = (chars == null || i < 0 || i >= chars.size() ? null : chars.get(i));
            if (((String)allowed).indexOf(ch) >= 0)
            {
                if (Boolean.TRUE.equals(pendingSep) && (!java.util.Objects.equals(label, "")))
                {
                    label = (label + "_");
                }
                label = (label + ch);
                pendingSep = false;
            } else
            {
                pendingSep = true;
            }
        }
        if (java.util.Objects.equals(label, ""))
        {
            // a label with no alphanumerics at all (unrealistic, but keep the :LABEL contract)
            label = upper;
        }
        return ((this.slugToMarketSymbol(eventSlug, marketSlug) + ":") + label);
    }

    public Map<String, Object> setMarkets(Object markets, Object currencies)
    {
        // prediction market rows carry only the unified `market` handle — `symbol` is
        // deprecated there. the base indexer keys this.markets/this.symbols by 'symbol',
        // so alias the handle onto a shallow copy per row; the caller's rows stay symbol-free
        List<Object> marketsList = this.toArray(markets);
        List<Object> aliased = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < marketsList.size(); i++)
        {
            Object row = (marketsList == null || i < 0 || i >= marketsList.size() ? null : marketsList.get(i));
            Map<String, Object> copy = this.extend(new HashMap<String, Object>() {{}}, row);
            copy.put("symbol", PredictionExchange.this.safeString2(row, "market", "symbol"));
            ((List<Object>)aliased).add(copy);
        }
        Map<String, Object> stored = super.setMarkets((Object) (aliased), currencies);
        // strip the alias back off the stored rows — venues assemble user-visible event
        // structures from this.markets (hyperliquid groups its outcome markets that way),
        // so a leftover 'symbol' key would leak the deprecated field back to the caller
        List<String> marketKeys = new ArrayList<String>(stored.keySet());
        for (var i = 0; i < marketKeys.size(); i++)
        {
            String key = (marketKeys == null || i < 0 || i >= marketKeys.size() ? null : marketKeys.get(i));
            stored.put(key, this.omit(this.safeDict(stored, key, new HashMap<String, Object>() {{}}), "symbol"));
        }
        this.populateOutcomes();
        return stored;
    }

    public void indexMarketOutcomes(Object market)
    {
        // index one market's outcome tokens into this.outcomes / this.outcomes_by_id,
        // normalizing each to the canonical identity keys (outcome / outcomeId / market) so
        // consumers and the safe* helpers stay uniform even when an exchange's parseMarket
        // still emits the legacy symbol / id / marketSymbol keys. used both by populateOutcomes
        // for a full rebuild and by on-demand single-market fetches (kalshi fetchOutcome), so a
        // cache miss doesn't force a full O(markets x outcomes) rebuild per new outcome
        if (java.util.Objects.equals(this.outcomes, null))
        {
            this.outcomes = new HashMap<String, Object>() {{}};
        }
        if (java.util.Objects.equals(this.outcomes_by_id, null))
        {
            this.outcomes_by_id = new HashMap<String, Object>() {{}};
        }
        List<Object> outcomesList = this.safeList(market, "outcomes", new ArrayList<Object>(Arrays.asList()));
        for (var j = 0; j < outcomesList.size(); j++)
        {
            Object oc = (outcomesList == null || j < 0 || j >= outcomesList.size() ? null : outcomesList.get(j));
            String ocSymbol = this.safeString2(oc, "outcome", "symbol");
            String ocId = this.safeString2(oc, "outcomeId", "id");
            // assign unconditionally — safeString2 keeps the canonical key when present
            // and falls back to the legacy one, so this never clobbers and avoids a
            // missing-key access that throws in Python/PHP, unlike TS undefined
            ((Map<String, Object>)oc).put("outcomeId", ocId);
            ((Map<String, Object>)oc).put("market", PredictionExchange.this.safeString2(oc, "market", "marketSymbol"));
            if (!java.util.Objects.equals(ocSymbol, null))
            {
                // shortenSlug is lossy, so two different markets can produce the same handle.
                // on a real collision of same handle but different outcomeId, disambiguate the
                // second one deterministically instead of silently overwriting the first —
                // trading the wrong market would otherwise be indistinguishable
                Map<String, Object> existing = this.safeDict(this.outcomes, ocSymbol, null);
                if (!java.util.Objects.equals(existing, null))
                {
                    String existingId = this.safeString(existing, "outcomeId");
                    if ((!java.util.Objects.equals(existingId, null)) && (!java.util.Objects.equals(ocId, null)) && (!java.util.Objects.equals(existingId, ocId)))
                    {
                        Integer idLen = ocId.length();
                        String suffix = ocId;
                        if ((idLen != null && idLen > 6))
                        {
                            suffix = (ocId == null ? null : ocId.substring((int) Math.min(Math.max(((((long) idLen) - 6L)) < 0 ? ocId.length() + ((((long) idLen) - 6L)) : ((((long) idLen) - 6L)), 0), ocId.length())));
                        }
                        ocSymbol = ((ocSymbol + "_") + suffix.toUpperCase());
                    }
                }
                ((Map<String, Object>)oc).put("outcome", ocSymbol);
                this.outcomes.put(ocSymbol, oc);
            } else
            {
                ((Map<String, Object>)oc).put("outcome", ocSymbol);
            }
            if (!java.util.Objects.equals(ocId, null))
            {
                this.outcomes_by_id.put(ocId, oc);
            }
        }
    }

    public void populateOutcomes()
    {
        // rebuild the whole outcome lookup cache from this.markets (each market carries its
        // outcome tokens under the outcomes key) so cached market data works offline. no-op on
        // a cold instance where markets are not loaded yet (avoids a null-access crash on the
        // eventId/slug-only fetchEvents path)
        this.outcomes = new HashMap<String, Object>() {{}};
        this.outcomes_by_id = new HashMap<String, Object>() {{}};
        if (java.util.Objects.equals(this.markets, null))
        {
            return;
        }
        List<String> marketKeys = (this.markets == null ? new ArrayList<String>() : new ArrayList<String>(this.markets.keySet()));
        for (var i = 0; i < marketKeys.size(); i++)
        {
            this.indexMarketOutcomes((this.markets == null ? null : ((Map<?, ?>)this.markets).get((marketKeys == null || i < 0 || i >= marketKeys.size() ? null : marketKeys.get(i)))));
        }
    }

    public void indexEventOutcomes(Object eventVar)
    {
        // register a single event's markets into this.markets and rebuild the outcome cache so the
        // handles fetchEvent() returns resolve immediately in outcome-addressed methods (fetchTicker,
        // createOrder, ...). without this, on a cold instance or a loadAllOutcomes:false venue
        // such as kalshi, the returned handles are unusable — fetchTicker(ev.markets[0].outcomes[0].outcome)
        // BadSymbols because the outcome was never cached
        if (java.util.Objects.equals(this.markets, null))
        {
            this.markets = this.createSafeDictionary();
        }
        List<Object> markets = this.safeList(eventVar, "markets", new ArrayList<Object>(Arrays.asList()));
        Integer marketsLength = markets.size();
        for (var i = 0; (marketsLength != null && i < marketsLength); i++)
        {
            Object m = (markets == null || i < 0 || i >= markets.size() ? null : markets.get(i));
            String marketHandle = this.safeString2(m, "market", "symbol");
            if (!java.util.Objects.equals(marketHandle, null))
            {
                ((Map<Object, Object>) (Map<?, ?>) this.markets).put(marketHandle, m);
            }
        }
        this.populateOutcomes();
    }

    public CompletableFuture<Object> loadOutcomes(List<String> outcomes, Boolean reload, Map<String, Object> parameters)
    {
        return BaseExchange.supplyAsync(() -> this.loadOutcomesCore(outcomes, reload, parameters));
    }

    private Object loadOutcomesCore(List<String> outcomes, Boolean reload, Map<String, Object> parameters)
    {

        // outcome-addressed methods call this first, mirroring loadMarkets(). two modes:
        // - an `outcomes` list (scoped): sync-filter the cache and resolve ONLY the misses through
        //   fetchOutcomes — venues with a batch by-id endpoint (kalshi, polymarket) override it to
        //   collapse all misses into one request; a warm cache returns with zero per-outcome awaits
        // - no `outcomes` (bulk): load the capped markets listing once and index every outcome —
        //   idempotent unless reload; only worth paying on venues whose whole universe is one
        //   cheap request (hyperliquid), or when the user explicitly wants the top-N set
        // loadMarkets()/populateOutcomes() rebuild the lookup caches explicitly (the setMarkets
        // override is not dispatched by the base loadMarkets under the Go/C#/Java transpilers)
        if (!java.util.Objects.equals(outcomes, null))
        {
            Boolean wasWarm = (!java.util.Objects.equals(this.outcomes, null)) && !this.isEmpty(this.outcomes);
            Boolean loadAll = (Boolean) this.safeBool(this.options, "loadAllOutcomes", false);
            if (Boolean.TRUE.equals(loadAll) && !Boolean.TRUE.equals(wasWarm) && !java.util.Objects.requireNonNullElse(reload, false))
            {
                // same trade-off as loadOutcome: on venues where the whole universe is one cheap
                // request (hyperliquid), a cold miss bulk-warms once instead of fetching per outcome
                Boolean coldMiss = false;
                for (var i = 0; i < outcomes.size(); i++)
                {
                    if (!this.hasOutcome((String) ((outcomes == null || i < 0 || i >= outcomes.size() ? null : outcomes.get(i)))))
                    {
                        coldMiss = true;
                    }
                }
                if (Boolean.TRUE.equals(coldMiss))
                {
                    (this.loadOutcomes(null, false, new HashMap<String, Object>() {{}})).join();
                }
            }
            List<String> missing = new ArrayList<String>(Arrays.asList());
            for (var i = 0; i < outcomes.size(); i++)
            {
                if (java.util.Objects.requireNonNullElse(reload, false) || !this.hasOutcome((String) ((outcomes == null || i < 0 || i >= outcomes.size() ? null : outcomes.get(i)))))
                {
                    missing.add((outcomes == null || i < 0 || i >= outcomes.size() ? null : outcomes.get(i)));
                }
            }
            Integer missingLength = missing.size();
            if ((missingLength != null && missingLength > 0))
            {
                (this.fetchOutcomes(missing)).join();
            }
            return this.outcomes;
        }
        if (!java.util.Objects.requireNonNullElse(reload, false) && (!java.util.Objects.equals(this.outcomes, null)) && !this.isEmpty(this.outcomes))
        {
            return this.outcomes;
        }
        (this.loadMarkets(java.util.Objects.requireNonNullElse(reload, false), parameters)).join();
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
    public CompletableFuture<Object> fetchOutcomes(List<String> outcomeSymbols)
    {
        return BaseExchange.supplyAsync(() -> this.fetchOutcomesCore(outcomeSymbols));
    }

    private Object fetchOutcomesCore(List<String> outcomeSymbols)
    {

        for (var i = 0; i < outcomeSymbols.size(); i++)
        {
            (this.fetchOutcome((outcomeSymbols == null || i < 0 || i >= outcomeSymbols.size() ? null : outcomeSymbols.get(i)))).join();
        }
        return this.outcomes;

    }

    public CompletableFuture<Map<String, Object>> loadOutcome(String outcomeSymbol, Boolean reload)
    {
        return BaseExchange.supplyAsync(() -> this.loadOutcomeCore(outcomeSymbol, reload)).thenApply(res -> (Map<String, Object>) res);
    }

    private Object loadOutcomeCore(String outcomeSymbol, Boolean reload)
    {

        // resolve a single outcome — the per-outcome analogue of loadMarkets()+market(). a cache hit
        // returns at once (pass reload=true to skip the cache and refetch the outcome's metadata).
        // on a miss, fetchOutcome resolves just the requested outcome on demand — a by-id fetch on
        // venues with such an endpoint (kalshi, polymarket) or the venue's scoped search otherwise.
        // options.loadAllOutcomes (default false) opts back into the legacy bulk warm-up: the first
        // miss loads the whole (capped) listing once so later lookups are 0-network hits — only
        // sane on venues whose full universe is one cheap request (hyperliquid)
        if (java.util.Objects.equals(outcomeSymbol, null))
        {
            throw new ArgumentsRequired((this.id + " loadOutcome() requires an outcomeSymbol argument")) ;
        }
        if (!java.util.Objects.requireNonNullElse(reload, false))
        {
            if (this.hasOutcome(outcomeSymbol))
            {
                return this.safeOutcome(outcomeSymbol, null);
            }
            Boolean wasWarm = (!java.util.Objects.equals(this.outcomes, null)) && !this.isEmpty(this.outcomes);
            // if markets are already loaded (offline-injected, or loaded by loadMarkets/fetchEvents)
            // but the outcome cache is cold, index them for free before hitting the network — this
            // makes cold-cache resolution consistent across languages regardless of loadAllOutcomes
            if (!Boolean.TRUE.equals(wasWarm) && (!java.util.Objects.equals(this.markets, null)) && !this.isEmpty(this.markets))
            {
                this.populateOutcomes();
                if (this.hasOutcome(outcomeSymbol))
                {
                    return this.safeOutcome(outcomeSymbol, null);
                }
            }
            Boolean loadAll = (Boolean) this.safeBool(this.options, "loadAllOutcomes", false);
            if (Boolean.TRUE.equals(loadAll) && !Boolean.TRUE.equals(wasWarm))
            {
                // a miss on a cold cache: bulk-load once so later lookups are 0-network hits.
                // a miss on an already-warm cache is authoritative — the outcome genuinely isn't
                // listed, so fall through to fetchOutcome (a real BadSymbol) rather than refetching
                // the whole listing (which would mask typos and clobber offline-injected markets)
                (this.loadOutcomes(null, false, new HashMap<String, Object>() {{}})).join();
                if (this.hasOutcome(outcomeSymbol))
                {
                    return this.safeOutcome(outcomeSymbol, null);
                }
            }
        }
        return (this.fetchOutcome(outcomeSymbol)).join();

    }

    public String outcomeSearchQuery(Object outcomeSymbol)
    {
        // derive a human search query from a unified outcome handle (EVENT_MARKET:LABEL) so a
        // cache miss can be resolved through the venue's scoped search instead of a bulk listing
        // download. returns undefined for id-like inputs (numeric token ids, 0x hashes) that
        // carry no searchable words
        Object marketPart = outcomeSymbol;
        Integer colonIndex = ((String)outcomeSymbol).indexOf(":");
        if (((colonIndex != null && colonIndex >= 0)))
        {
            marketPart = (outcomeSymbol == null ? null : ((String)outcomeSymbol).substring(0, (int) Math.min(colonIndex < 0 ? ((String)outcomeSymbol).length() + colonIndex : colonIndex, ((String)outcomeSymbol).length())));
        }
        if ((((String)marketPart).indexOf("0x") == 0))
        {
            return null;
        }
        // handles join words with '_' (slug-derived) or legacy '-' separated inputs (normalized below)
        String normalized = ((String)marketPart).toLowerCase().replace("-", "_");
        List<Object> rawWords = new ArrayList<Object>(Arrays.asList(((String)normalized).split(java.util.regex.Pattern.quote("_"))));
        List<String> words = new ArrayList<String>(Arrays.asList());
        Boolean hasLetters = false;
        String letters = "abcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < rawWords.size(); i++)
        {
            String word = (String) (rawWords == null || i < 0 || i >= rawWords.size() ? null : rawWords.get(i));
            if ((word.length() == 0))
            {
                continue;
            }
            Boolean wordHasLetters = false;
            List<String> chars = this.stringToCharsArray(word);
            for (var ci = 0; ci < chars.size(); ci++)
            {
                if ((letters == null || chars == null || ci < 0 || ci >= chars.size() || chars.get(ci) == null ? -1 : letters.indexOf(chars.get(ci))) >= 0)
                {
                    wordHasLetters = true;
                    break;
                }
            }
            // the query is the handle's letter-bearing words only. standalone numeric
            // tokens (slug timestamps, strikes, years) are venue artifacts that title searches don't
            // reliably index — and since the result is re-checked against the EXACT handle,
            // a broader query only adds recall, never a wrong match
            if (!Boolean.TRUE.equals(wordHasLetters))
            {
                continue;
            }
            words.add(word);
            hasLetters = true;
        }
        Integer wordsLength = words.size();
        if ((java.util.Objects.equals(wordsLength, 0)) || !Boolean.TRUE.equals(hasLetters))
        {
            // a purely numeric/symbolic handle is an id, not searchable text
            return null;
        }
        return String.join(" ", (List<String>)words);
    }

    public CompletableFuture<Object> fetchOutcome(Object outcomeSymbol)
    {
        return BaseExchange.supplyAsync(() -> this.fetchOutcomeCore(outcomeSymbol));
    }

    private Object fetchOutcomeCore(Object outcomeSymbol)
    {

        // fetch just one outcome on demand — never through a bulk listing download. the base has
        // no generic by-id endpoint, so it derives a search query from the handle and resolves it
        // through the venue's own scoped fetchEvents (which caches everything it finds), then
        // re-checks the cache. venues with a real by-id fetch (kalshi by ticker, polymarket by
        // token id) override this with a cheaper single fetch and fall back to super on a miss.
        String searchQuery = this.outcomeSearchQuery(outcomeSymbol);
        if ((!java.util.Objects.equals(searchQuery, null)) && Boolean.TRUE.equals(this.safeBool(this.has, "fetchEvents", false)))
        {
            Long searchLimit = this.safeInteger(this.options, "fetchOutcomeSearchLimit", 10);
            try
            {
                HashMap<String, Object> mapLiteral1 = new HashMap<String, Object>();
                mapLiteral1.put("query", searchQuery);
                mapLiteral1.put("limit", searchLimit);
                (this.fetchEvents(mapLiteral1)).join();
            } catch(Exception e)
            {
                // a query with zero matches surfaces as BadSymbol on some venues — treat it as a
                // plain miss (the guidance-rich throw below); let real transport errors propagate
                if (!(Helpers.isInstance(e, BadSymbol.class)))
                {
                    throw (e instanceof RuntimeException ? (RuntimeException)e : new RuntimeException(e));
                }
            }
            if (this.hasOutcome((String) (outcomeSymbol)))
            {
                return this.safeOutcome((String) (outcomeSymbol), null);
            }
        }
        throw new BadSymbol((((this.id + " could not resolve outcome ") + outcomeSymbol) + " — call fetchEvents ({ 'query': ... }) first, or pass a known outcomeId")) ;

    }

    /**
     * @method
     * @name fetchTicker
     * @description fetches a price ticker for a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    public CompletableFuture<PredictionTicker> fetchTicker(String outcome, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchTicker() is not supported yet"))).thenApply(PredictionTicker::new);

    }

    /**
     * @method
     * @name fetchTickers
     * @description fetches price tickers for multiple prediction outcomes at once
     * @param {string[]} [outcomes] unified outcome handles or outcome ids
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome
     */
    public CompletableFuture<PredictionTickers> fetchTickers(List<String> outcomes, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchTickers() is not supported yet"))).thenApply(PredictionTickers::new);

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
    public CompletableFuture<PredictionOrderBook> fetchOrderBook(String outcome, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchOrderBook() is not supported yet"))).thenApply(PredictionOrderBook::new);

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
    public CompletableFuture<List<OHLCV>> fetchOHLCV(String outcome, String timeframe, Long since, Long limit, Map<String, Object> parameters)
    {
        return BaseExchange.supplyAsync(() -> this.fetchOHLCVCore(outcome, timeframe, since, limit, parameters)).thenApply(res -> ((List<?>) res).stream().map(OHLCV::new).collect(Collectors.toList()));
    }

    private Object fetchOHLCVCore(String outcome, String timeframe, Long since, Long limit, Map<String, Object> parameters)
    {

        return (super.fetchOHLCV(outcome, java.util.Objects.requireNonNullElse(timeframe, "1m"), since, limit, parameters)).join();

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
    public CompletableFuture<List<PredictionTrade>> fetchTrades(String outcome, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchTrades() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionTrade::new).collect(Collectors.toList()));

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
    public CompletableFuture<PredictionOrder> createOrder(String outcome, String type, String side, Double amount, Double price, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " createOrder() is not supported yet"))).thenApply(PredictionOrder::new);

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
    public CompletableFuture<PredictionOrder> cancelOrder(String id, String outcome, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " cancelOrder() is not supported yet"))).thenApply(PredictionOrder::new);

    }

    /**
     * @method
     * @name watchTicker
     * @description watches a price ticker for a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    public CompletableFuture<PredictionTicker> watchTicker(String outcome, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " watchTicker() is not supported yet"))).thenApply(PredictionTicker::new);

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
    public CompletableFuture<PredictionOrderBook> watchOrderBook(String outcome, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " watchOrderBook() is not supported yet"))).thenApply(PredictionOrderBook::new);

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
    public CompletableFuture<List<PredictionTrade>> watchTrades(String outcome, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " watchTrades() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionTrade::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionOrder>> fetchOrders(String outcome, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchOrders() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionOrder>> fetchOpenOrders(String outcome, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchOpenOrders() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionOrder>> fetchClosedOrders(String outcome, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchClosedOrders() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionTrade>> fetchOrderTrades(String id, String outcome, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchOrderTrades() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionTrade::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionTrade>> fetchMyTrades(String outcome, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchMyTrades() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionTrade::new).collect(Collectors.toList()));

    }

    /**
     * @method
     * @name fetchPosition
     * @description fetch the open position held on a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    public CompletableFuture<PredictionPosition> fetchPosition(String outcome, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchPosition() is not supported yet"))).thenApply(PredictionPosition::new);

    }

    /**
     * @method
     * @name fetchPositions
     * @description fetches the user's open positions
     * @param {string[]} [outcomes] unified outcome handles to filter by
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    public CompletableFuture<List<PredictionPosition>> fetchPositions(List<String> outcomes, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchPositions() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionPosition::new).collect(Collectors.toList()));

    }

    /**
     * @method
     * @name fetchTradingFee
     * @description fetch the trading fee for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
     */
    public CompletableFuture<PredictionTradingFee> fetchTradingFee(String outcome, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchTradingFee() is not supported yet"))).thenApply(PredictionTradingFee::new);

    }

    /**
     * @method
     * @name fetchOpenInterest
     * @description fetch the open interest of a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
     */
    public CompletableFuture<PredictionOpenInterest> fetchOpenInterest(String outcome, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchOpenInterest() is not supported yet"))).thenApply(PredictionOpenInterest::new);

    }

    /**
     * @method
     * @name createOrders
     * @description create a list of trade orders
     * @param {object[]} orders a list of PredictionOrderRequest objects, each carrying an `outcome` handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    public CompletableFuture<List<PredictionOrder>> createOrders(List<?> orders, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " createOrders() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionOrder>> cancelOrders(List<String> ids, String outcome, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " cancelOrders() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

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
    public CompletableFuture<PredictionOrder> createMarketBuyOrderWithCost(String outcome, Double cost, Map<String, Object> parameters)
    {
        return BaseExchange.supplyAsync(() -> this.createMarketBuyOrderWithCostCore(outcome, cost, parameters)).thenApply(PredictionOrder::new);
    }

    private Object createMarketBuyOrderWithCostCore(String outcome, Double cost, Map<String, Object> parameters)
    {

        // safeBool, not this.options['...'] — a raw missing-key access throws KeyError in Python/PHP
        // when the option is undeclared (it is for every prediction exchange)
        if (Boolean.TRUE.equals(this.safeBool(this.options, "createMarketBuyOrderRequiresPrice", false)) || Boolean.TRUE.equals(this.safeBool(this.has, "createMarketBuyOrderWithCost", false)))
        {
            return (this.createOrder(outcome, "market", "buy", cost, 1.0, parameters)).join();
        }
        throw new NotSupported((this.id + " createMarketBuyOrderWithCost() is not supported yet")) ;

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
    public CompletableFuture<PredictionOrder> createMarketSellOrderWithCost(String outcome, Double cost, Map<String, Object> parameters)
    {
        return BaseExchange.supplyAsync(() -> this.createMarketSellOrderWithCostCore(outcome, cost, parameters)).thenApply(PredictionOrder::new);
    }

    private Object createMarketSellOrderWithCostCore(String outcome, Double cost, Map<String, Object> parameters)
    {

        if (Boolean.TRUE.equals(this.safeBool(this.options, "createMarketSellOrderRequiresPrice", false)) || Boolean.TRUE.equals(this.safeBool(this.has, "createMarketSellOrderWithCost", false)))
        {
            return (this.createOrder(outcome, "market", "sell", cost, 1.0, parameters)).join();
        }
        throw new NotSupported((this.id + " createMarketSellOrderWithCost() is not supported yet")) ;

    }

    /**
     * @method
     * @name watchTickers
     * @description watches price tickers for multiple prediction outcomes
     * @param {string[]} [outcomes] unified outcome handles to watch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    public CompletableFuture<PredictionTickers> watchTickers(List<String> outcomes, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " watchTickers() is not supported yet"))).thenApply(PredictionTickers::new);

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
    public CompletableFuture<List<PredictionOrder>> watchOrders(String outcome, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " watchOrders() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionTrade>> watchMyTrades(String outcome, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " watchMyTrades() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionTrade::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionPosition>> watchPositions(List<String> outcomes, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " watchPositions() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionPosition::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionSettlement>> fetchSettlements(String outcome, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchSettlements() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionSettlement::new).collect(Collectors.toList()));

    }

    public Map<String, Object> safePredictionOrder(Map<String, Object> outcomeOrder, Object outcomeObj)
    {
        // build the prediction order directly (do NOT delegate to the crypto safeOrder, which injects
        // ~a dozen derivatives fields — stopPrice/triggerPrice/reduceOnly noise — the prediction type
        // never declares, and whose parseTrades post-filters embedded fills by `symbol`, dropping every
        // outcome-addressed row). prediction is always linear with a contract size of 1.
        String amount = this.omitZero(this.safeString(outcomeOrder, "amount"));
        String filled = this.safeString(outcomeOrder, "filled");
        String remaining = this.safeString(outcomeOrder, "remaining");
        String cost = this.safeString(outcomeOrder, "cost");
        String average = this.omitZero(this.safeString(outcomeOrder, "average"));
        String price = this.omitZero(this.safeString(outcomeOrder, "price"));
        String side = this.safeString(outcomeOrder, "side");
        String status = this.safeString(outcomeOrder, "status");
        Long lastTradeTimestamp = this.safeInteger(outcomeOrder, "lastTradeTimestamp");
        // parse embedded fills with the OUTCOME-aware parser (parseTrades would drop them on the symbol filter)
        List<Object> rawTrades = this.safeList(outcomeOrder, "trades", new ArrayList<Object>(Arrays.asList()));
        List<Object> trades = this.parsePredictionTrades(rawTrades, outcomeObj, null, null, new HashMap<String, Object>() {{}});
        Integer tradesLength = trades.size();
        List<Object> feeList = new ArrayList<Object>(Arrays.asList());
        if ((tradesLength != null && tradesLength > 0))
        {
            if (java.util.Objects.equals(filled, null))
            {
                filled = "0";
            }
            if (java.util.Objects.equals(cost, null))
            {
                cost = "0";
            }
            for (var i = 0; (tradesLength != null && i < tradesLength); i++)
            {
                Map<String, Object> trade = (Map<String, Object>) (trades == null || i < 0 || i >= trades.size() ? null : trades.get(i));
                String tradeAmount = this.safeString(trade, "amount");
                if (!java.util.Objects.equals(tradeAmount, null))
                {
                    filled = Precise.stringAdd(filled, tradeAmount);
                }
                String tradeCost = this.safeString(trade, "cost");
                if (!java.util.Objects.equals(tradeCost, null))
                {
                    cost = Precise.stringAdd(cost, tradeCost);
                }
                if (java.util.Objects.equals(side, null))
                {
                    side = this.safeString(trade, "side");
                }
                Long tradeTimestamp = this.safeInteger(trade, "timestamp");
                if (!java.util.Objects.equals(tradeTimestamp, null))
                {
                    if (java.util.Objects.equals(lastTradeTimestamp, null))
                    {
                        lastTradeTimestamp = tradeTimestamp;
                    } else if ((tradeTimestamp != null && (lastTradeTimestamp == null || tradeTimestamp > lastTradeTimestamp)))
                    {
                        lastTradeTimestamp = tradeTimestamp;
                    }
                }
                Map<String, Object> tradeFee = this.safeDict(trade, "fee", null);
                if (!java.util.Objects.equals(tradeFee, null))
                {
                    ((List<Object>)feeList).add(tradeFee);
                }
            }
        }
        // fill any totals the venue left undefined (linear, contract size 1)
        if ((java.util.Objects.equals(filled, null)) && (!java.util.Objects.equals(amount, null)) && (!java.util.Objects.equals(remaining, null)))
        {
            filled = Precise.stringSub(amount, remaining);
        }
        if ((java.util.Objects.equals(remaining, null)) && (!java.util.Objects.equals(amount, null)) && (!java.util.Objects.equals(filled, null)))
        {
            remaining = Precise.stringSub(amount, filled);
        }
        if ((java.util.Objects.equals(amount, null)) && (!java.util.Objects.equals(filled, null)) && (!java.util.Objects.equals(remaining, null)))
        {
            amount = Precise.stringAdd(filled, remaining);
        }
        if ((java.util.Objects.equals(average, null)) && (!java.util.Objects.equals(filled, null)) && (!java.util.Objects.equals(cost, null)) && Precise.stringGt(filled, "0"))
        {
            average = Precise.stringDiv(cost, filled);
        }
        if ((java.util.Objects.equals(cost, null)) && (!java.util.Objects.equals(filled, null)))
        {
            String multiplyPrice = (((!java.util.Objects.equals(average, null)))) ? average : price;
            if (!java.util.Objects.equals(multiplyPrice, null))
            {
                cost = Precise.stringMul(filled, multiplyPrice);
            }
        }
        Map<String, Object> fee = this.safeDict(outcomeOrder, "fee", null);
        // own-line length reads so the regex transpiler emits count() (array), not strlen()
        Integer feeListLength = feeList.size();
        if ((java.util.Objects.equals(fee, null)) && ((feeListLength != null && feeListLength > 0)))
        {
            fee = (Map<String, Object>) this.safeDict(this.reduceFeesByCurrency(feeList), 0, null);
        }
        // derive timeInForce/postOnly the same way the crypto safeOrder does (prediction has no
        // trigger orders, so the isTriggerOrSLTp guard collapses): a market order defaults to IOC
        String orderType = this.safeString(outcomeOrder, "type");
        String timeInForce = this.safeString(outcomeOrder, "timeInForce");
        // the venue flag and the derived one are each written once, so neither local widens
        Boolean postOnlyValue = (Boolean) this.safeBool(outcomeOrder, "postOnly", null);
        Boolean derivedPostOnly = null;
        if (java.util.Objects.equals(timeInForce, null))
        {
            if (java.util.Objects.equals(orderType, "market"))
            {
                timeInForce = "IOC";
            }
            if (java.util.Objects.equals(postOnlyValue, true))
            {
                timeInForce = "PO";
            }
        } else if (java.util.Objects.equals(postOnlyValue, null))
        {
            derivedPostOnly = (java.util.Objects.equals(timeInForce, "PO"));
        }
        Long timestamp = this.safeInteger(outcomeOrder, "timestamp");
        String datetime = this.safeString(outcomeOrder, "datetime");
        if (java.util.Objects.equals(datetime, null))
        {
            datetime = this.iso8601(timestamp);
        }
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("id", this.safeString(outcomeOrder, "id"));
        result.put("clientOrderId", this.safeString(outcomeOrder, "clientOrderId"));
        result.put("timestamp", timestamp);
        result.put("datetime", datetime);
        result.put("lastTradeTimestamp", lastTradeTimestamp);
        result.put("lastUpdateTimestamp", this.safeInteger(outcomeOrder, "lastUpdateTimestamp"));
        result.put("status", status);
        result.put("type", orderType);
        result.put("timeInForce", timeInForce);
        result.put("side", side);
        result.put("price", this.parseNumber(price));
        result.put("average", this.parseNumber(average));
        result.put("amount", this.parseNumber(amount));
        result.put("filled", this.parseNumber(filled));
        result.put("remaining", this.parseNumber(remaining));
        result.put("cost", this.parseNumber(cost));
        result.put("fee", fee);
        result.put("reduceOnly", this.safeBool(outcomeOrder, "reduceOnly", null));
        result.put("postOnly", (((!java.util.Objects.equals(postOnlyValue, null)))) ? postOnlyValue : derivedPostOnly);
        result.put("trades", trades);
        result.put("outcome", this.safeString(outcomeOrder, "outcome"));
        result.put("outcomeId", this.safeString(outcomeOrder, "outcomeId"));
        result.put("label", this.safeString(outcomeOrder, "label"));
        result.put("market", this.safeString(outcomeOrder, "market"));
        result.put("event", this.safeString(outcomeOrder, "event"));
        result.put("info", this.safeValue(outcomeOrder, "info", outcomeOrder));
        return result;
    }

    public Map<String, Object> safePredictionTrade(Map<String, Object> trade, Object outcomeObj)
    {
        // build the prediction trade directly (no crypto safeTrade, which leaks fields the type omits)
        String price = this.safeString(trade, "price");
        String amount = this.safeString(trade, "amount");
        String cost = this.safeString(trade, "cost");
        if ((java.util.Objects.equals(cost, null)) && (!java.util.Objects.equals(price, null)) && (!java.util.Objects.equals(amount, null)))
        {
            cost = Precise.stringMul(price, amount);
        }
        Long timestamp = this.safeInteger(trade, "timestamp");
        String datetime = this.safeString(trade, "datetime");
        if (java.util.Objects.equals(datetime, null))
        {
            datetime = this.iso8601(timestamp);
        }
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("id", this.safeString(trade, "id"));
        result.put("order", this.safeString(trade, "order"));
        result.put("timestamp", timestamp);
        result.put("datetime", datetime);
        result.put("type", this.safeString(trade, "type"));
        result.put("side", this.safeString(trade, "side"));
        result.put("takerOrMaker", this.safeString(trade, "takerOrMaker"));
        result.put("price", this.parseNumber(price));
        result.put("amount", this.parseNumber(amount));
        result.put("cost", this.parseNumber(cost));
        result.put("fee", this.safeDict(trade, "fee", null));
        result.put("realizedPnl", this.safeNumber(trade, "realizedPnl", null));
        result.put("outcome", this.safeString(trade, "outcome"));
        result.put("outcomeId", this.safeString(trade, "outcomeId"));
        result.put("label", this.safeString(trade, "label"));
        result.put("market", this.safeString(trade, "market"));
        result.put("info", this.safeValue(trade, "info", trade));
        return result;
    }

    public Map<String, Object> safePredictionTicker(Map<String, Object> ticker, Object outcomeObj)
    {
        // build the prediction ticker directly (no crypto safeTicker, which injects vwap/previousClose/
        // indexPrice/markPrice the type omits). derive change/percentage/average only from open+close —
        // prediction venues report those directly, so the crypto back-derivation from percentage is moot.
        String open = this.omitZero(this.safeString(ticker, "open"));
        String close = this.omitZero(this.safeString2(ticker, "close", "last"));
        String last = this.omitZero(this.safeString2(ticker, "last", "close"));
        String change = this.safeString(ticker, "change");
        String percentage = this.omitZero(this.safeString(ticker, "percentage"));
        String average = this.omitZero(this.safeString(ticker, "average"));
        if ((java.util.Objects.equals(change, null)) && (!java.util.Objects.equals(open, null)) && (!java.util.Objects.equals(close, null)))
        {
            change = Precise.stringSub(close, open);
        }
        if ((java.util.Objects.equals(percentage, null)) && (!java.util.Objects.equals(change, null)) && (!java.util.Objects.equals(open, null)) && Precise.stringGt(open, "0"))
        {
            percentage = Precise.stringMul(Precise.stringDiv(change, open), "100");
        }
        if ((java.util.Objects.equals(average, null)) && (!java.util.Objects.equals(open, null)) && (!java.util.Objects.equals(close, null)))
        {
            average = Precise.stringDiv(Precise.stringAdd(open, close), "2");
        }
        Long timestamp = this.safeInteger(ticker, "timestamp");
        String datetime = this.safeString(ticker, "datetime");
        if (java.util.Objects.equals(datetime, null))
        {
            datetime = this.iso8601(timestamp);
        }
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("timestamp", timestamp);
        result.put("datetime", datetime);
        result.put("high", this.safeNumber(ticker, "high", null));
        result.put("low", this.safeNumber(ticker, "low", null));
        result.put("bid", this.parseNumber(this.omitZero(this.safeString(ticker, "bid"))));
        result.put("bidVolume", this.safeNumber(ticker, "bidVolume", null));
        result.put("ask", this.parseNumber(this.omitZero(this.safeString(ticker, "ask"))));
        result.put("askVolume", this.safeNumber(ticker, "askVolume", null));
        result.put("open", this.parseNumber(open));
        result.put("close", this.parseNumber(close));
        result.put("last", this.parseNumber(last));
        result.put("change", this.parseNumber(change));
        result.put("percentage", this.parseNumber(percentage));
        result.put("average", this.parseNumber(average));
        result.put("baseVolume", this.safeNumber(ticker, "baseVolume", null));
        result.put("quoteVolume", this.safeNumber(ticker, "quoteVolume", null));
        result.put("openInterest", this.safeNumber(ticker, "openInterest", null));
        result.put("outcome", this.safeString(ticker, "outcome"));
        result.put("outcomeId", this.safeString(ticker, "outcomeId"));
        result.put("label", this.safeString(ticker, "label"));
        result.put("market", this.safeString(ticker, "market"));
        result.put("event", this.safeString(ticker, "event"));
        result.put("info", this.safeValue(ticker, "info", ticker));
        return result;
    }

    public Map<String, Object> safePredictionPosition(Map<String, Object> position)
    {
        // build the prediction position directly (no crypto safePosition, which carries the whole
        // leverage/marginMode/liquidation block the prediction type omits)
        Long timestamp = this.safeInteger(position, "timestamp");
        String datetime = this.safeString(position, "datetime");
        if (java.util.Objects.equals(datetime, null))
        {
            datetime = this.iso8601(timestamp);
        }
        Map<String, Object> result = new HashMap<String, Object>();
        result.put("id", this.safeString(position, "id"));
        result.put("timestamp", timestamp);
        result.put("datetime", datetime);
        result.put("contracts", this.safeNumber(position, "contracts", null));
        result.put("contractSize", this.safeNumber(position, "contractSize", null));
        result.put("side", this.safeString(position, "side"));
        result.put("notional", this.safeNumber(position, "notional", null));
        result.put("unrealizedPnl", this.safeNumber(position, "unrealizedPnl", null));
        result.put("realizedPnl", this.safeNumber(position, "realizedPnl", null));
        result.put("collateral", this.safeNumber(position, "collateral", null));
        result.put("entryPrice", this.safeNumber(position, "entryPrice", null));
        result.put("markPrice", this.safeNumber(position, "markPrice", null));
        result.put("lastPrice", this.safeNumber(position, "lastPrice", null));
        result.put("percentage", this.safeNumber(position, "percentage", null));
        result.put("resolved", this.safeBool(position, "resolved", null));
        result.put("won", this.safeBool(position, "won", null));
        result.put("settleFraction", this.safeNumber(position, "settleFraction", null));
        result.put("payout", this.safeNumber(position, "payout", null));
        result.put("outcome", this.safeString(position, "outcome"));
        result.put("outcomeId", this.safeString(position, "outcomeId"));
        result.put("label", this.safeString(position, "label"));
        result.put("market", this.safeString(position, "market"));
        result.put("event", this.safeString(position, "event"));
        result.put("info", this.safeValue(position, "info", position));
        return result;
    }

    public Object safePredictionOrderBook(Map<String, Object> orderbook, Object outcomeObj)
    {
        // normalize a parsed order book to the prediction shape: replace the unified
        // `symbol` with the `outcome` handle and attach the outcome identity fields
        // outcomeId and market - so books match the PredictionOrderBook structure.
        String fallback = this.safeString2(orderbook, "outcome", "symbol");
        Map<String, Object> identity = new HashMap<String, Object>();
        identity.put("outcome", (((java.util.Objects.equals(outcomeObj, null)))) ? fallback : this.safeString(outcomeObj, "outcome", fallback));
        identity.put("outcomeId", (((java.util.Objects.equals(outcomeObj, null)))) ? this.safeString(orderbook, "outcomeId") : this.safeString(outcomeObj, "outcomeId"));
        identity.put("market", (((java.util.Objects.equals(outcomeObj, null)))) ? this.safeString(orderbook, "market") : this.safeString(outcomeObj, "market"));
        // omit (not delete) — `del dict['symbol']` raises KeyError in python/php when absent
        return this.extend(this.omit(orderbook, "symbol"), identity);
    }

    public Map<String, Object> parsePredictionTicker(Map<String, Object> ticker, Map<String, Object> market)
    {
        throw new NotSupported((this.id + " parsePredictionTicker() is not supported yet")) ;
    }

    public Map<String, Object> parsePredictionOrder(Map<String, Object> order, Map<String, Object> market)
    {
        throw new NotSupported((this.id + " parsePredictionOrder() is not supported yet")) ;
    }

    public Map<String, Object> parsePredictionTrade(Map<String, Object> trade, Map<String, Object> market)
    {
        throw new NotSupported((this.id + " parsePredictionTrade() is not supported yet")) ;
    }

    public Map<String, Object> parsePredictionPosition(Map<String, Object> position, Map<String, Object> market)
    {
        throw new NotSupported((this.id + " parsePredictionPosition() is not supported yet")) ;
    }

    public Object parsePredictionOpenInterest(Map<String, Object> interest, Map<String, Object> market)
    {
        throw new NotSupported((this.id + " parsePredictionOpenInterest() is not supported yet")) ;
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
    public List<Object> parsePredictionTrades(Object trades, Object outcomeObj, Long since, Long limit, Map<String, Object> parameters)
    {
        // prediction-market analogue of the base parseTrades: the base aggregator post-filters
        // by the market's `symbol` key, but prediction structures carry an `outcome` handle
        // instead — and an outcome object rebuilt from cached markets may still hold a legacy
        // `symbol` key, which would silently drop every parsed row
        List<Object> rows = this.toArray(trades);
        List<Object> results = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < rows.size(); i++)
        {
            Map<String, Object> parsed = (Map<String, Object>) this.parsePredictionTrade(this.safeDict(rows, i, new HashMap<String, Object>() {{}}), ((Map<String, Object>) (switch ((Object) (outcomeObj)) { case null -> (Map<String, Object>) null; case Map<?, ?> hx4J40v2 -> (Map<String, Object>) hx4J40v2; case Object hx4J40v2 -> throw new ClassCastException("ccxt: expected a dictionary, got " + hx4J40v2.getClass().getName()); })));
            Map<String, Object> trade = this.extend(parsed, parameters);
            ((List<Object>)results).add(trade);
        }
        results = this.sortBy2(results, "timestamp", "id");
        String outcomeHandle = this.safeString(outcomeObj, "outcome");
        return this.filterByValueSinceLimit(results, "outcome", outcomeHandle, since, limit, "timestamp", false);
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
    public Object parsePredictionOrders(Object orders, Object outcomeObj, Long since, Long limit, Map<String, Object> parameters)
    {
        // prediction-market analogue of the base parseOrders — see parsePredictionTrades
        List<Object> rows = this.toArray(orders);
        List<Object> results = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < rows.size(); i++)
        {
            Map<String, Object> parsed = (Map<String, Object>) this.parsePredictionOrder((Map<String, Object>) ((rows == null || i < 0 || i >= rows.size() ? null : rows.get(i))), ((Map<String, Object>) (switch ((Object) (outcomeObj)) { case null -> (Map<String, Object>) null; case Map<?, ?> hx4J40v1 -> (Map<String, Object>) hx4J40v1; case Object hx4J40v1 -> throw new ClassCastException("ccxt: expected a dictionary, got " + hx4J40v1.getClass().getName()); })));
            Map<String, Object> order = this.extend(parsed, parameters);
            ((List<Object>)results).add(order);
        }
        results = this.sortBy(results, "timestamp");
        String outcomeHandle = this.safeString(outcomeObj, "outcome");
        return this.filterByOutcomeSinceLimit(results, outcomeHandle, since, limit, false);
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
    public List<Object> parsePredictionPositions(Object positions, Map<String, Object> parameters)
    {
        // prediction-market analogue of the base parsePositions, which resolves its `symbols`
        // argument through marketSymbols() and would throw BadSymbol on outcome handles.
        // venue-specific outcome filtering stays in the exchange (position identity differs
        // per venue: kalshi positions are market-level, polymarket ones are per token)
        List<Object> rows = this.toArray(positions);
        List<Object> results = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < rows.size(); i++)
        {
            Map<String, Object> parsed = this.parsePredictionPosition(this.safeDict(rows, i, new HashMap<String, Object>() {{}}), null);
            Map<String, Object> position = this.extend(parsed, parameters);
            ((List<Object>)results).add(position);
        }
        return results;
    }

    public Object filterByOutcomeSinceLimit(Object array, String outcome, Long since, Long limit, Boolean tail)
    {
        return this.filterByValueSinceLimit(array, "outcome", outcome, since, limit, "timestamp", java.util.Objects.requireNonNullElse(tail, false));
    }

    public Object filterByOutcomesSinceLimit(Object array, Object outcomes, Long since, Long limit, Boolean tail)
    {
        List<Object> result = (List<Object>) this.filterByArray(array, "outcome", outcomes, false);
        return this.filterBySinceLimit(result, since, limit, "timestamp", java.util.Objects.requireNonNullElse(tail, false));
    }

    public String amountToPredictionPrecision(String outcome, Object amount)
    {
        Map<String, Object> outcomeObj = this.outcome(outcome);
        String marketSymbol = this.safeString(outcomeObj, "market");
        return this.amountToPrecision(marketSymbol, amount);
    }

    public String priceToPredictionPrecision(String outcome, Object price)
    {
        Map<String, Object> outcomeObj = this.outcome(outcome);
        String marketSymbol = this.safeString(outcomeObj, "market");
        return this.priceToPrecision(marketSymbol, price);
    }

    public String costToPredictionPrecision(String outcome, Object cost)
    {
        Map<String, Object> outcomeObj = this.outcome(outcome);
        String marketSymbol = this.safeString(outcomeObj, "market");
        return this.costToPrecision(marketSymbol, cost);
    }

    // ------------------------------------------------------------------------
    // shared EVM helpers — RLP encoding + a minimal JSON-RPC client + raw-tx
    // broadcast, used by the on-chain (EOA) trading paths of EVM prediction
    // venues (limitless, myriad). signEvmTransaction stays per-exchange because
    // it needs the noble crypto imports (keccak/ecdsa/secp256k1) which the
    // per-language prediction base skeletons don't carry; this base
    // sendEvmTransaction dispatches to the exchange's signEvmTransaction override
    public String padHexToEven(String hex)
    {
        if (java.util.Objects.equals(hex, null))
        {
            return "";
        }
        // prepend a nibble so the hex has an even number of characters (whole bytes)
        Integer hexLength = hex.length();
        if ((((((double) hexLength) % ((double) 2))) != 0))
        {
            return ("0" + hex);
        }
        return hex;
    }

    public String padHexAddress(String address)
    {
        if (java.util.Objects.equals(address, null))
        {
            return "";
        }
        // left-pads a 20-byte address to a 32-byte ABI word (24 leading zero bytes)
        String stripped = this.remove0xPrefix(address);
        return ("000000000000000000000000" + stripped);
    }

    public String rlpEncodeBytes(String hex)
    {
        if (java.util.Objects.equals(hex, null))
        {
            return "";
        }
        // RLP-encodes a single byte string (hex without 0x) per the Ethereum RLP spec
        Long byteLength = this.parseToInt((((double) hex.length()) / ((double) 2)));
        if (java.util.Objects.equals(byteLength, null))
        {
            return "";
        }
        if ((byteLength != null && byteLength == 0))
        {
            return "80";
        }
        if (((byteLength != null && byteLength == 1)) && (((java.util.function.BiPredicate<Object, Object>) (j38a, j38b) -> { java.util.function.Predicate<Object> j38n = j38o -> { if (j38o == null) return false; try { Double.parseDouble(String.valueOf(j38o)); return true; } catch (Exception j38x) { return false; } }; java.util.function.ToDoubleFunction<Object> j38d = j38o -> { if (j38o instanceof Double || j38o instanceof Float || j38o instanceof Long || j38o instanceof Integer || j38o instanceof java.math.BigDecimal) return ((Number) j38o).doubleValue(); try { return Double.parseDouble(String.valueOf(j38o)); } catch (NumberFormatException j38x) { return 0.0; } }; boolean j38g; if (j38a != null && j38b == null) j38g = true; else if (j38a == null || j38b == null) j38g = false; else { Object j38p = (j38a instanceof Integer) ? (Object) Long.valueOf(((Integer) j38a).longValue()) : j38a; Object j38q = (j38b instanceof Integer) ? (Object) Long.valueOf(((Integer) j38b).longValue()) : j38b; if (j38p instanceof Long && j38q instanceof Long) j38g = ((Long) j38p) > ((Long) j38q); else if (j38n.test(j38p) || j38n.test(j38q)) j38g = j38d.applyAsDouble(j38p) > j38d.applyAsDouble(j38q); else if (j38p instanceof String && j38q instanceof String) j38g = ((String) j38p).compareTo((String) j38q) > 0; else j38g = false; } java.util.function.Predicate<Object> j38i = j38o -> { if (j38o instanceof Byte || j38o instanceof Short || j38o instanceof Integer || j38o instanceof Long || j38o instanceof java.util.concurrent.atomic.AtomicInteger || j38o instanceof java.util.concurrent.atomic.AtomicLong) return true; return (j38o instanceof Float || j38o instanceof Double || j38o instanceof java.math.BigDecimal) && new java.math.BigDecimal(String.valueOf(j38o)).stripTrailingZeros().scale() <= 0; }; java.util.function.ToLongFunction<Object> j38l = j38o -> (j38o instanceof Long || j38o instanceof Integer || j38o instanceof Double || j38o instanceof Float || j38o instanceof java.math.BigDecimal) ? ((Number) j38o).longValue() : Long.parseLong(String.valueOf(j38o)); boolean j38e; try { if (j38a == null || j38b == null) j38e = j38a == j38b; else if (!j38a.getClass().equals(j38b.getClass()) && !(j38n.test(j38a) && j38n.test(j38b))) j38e = false; else if (j38i.test(j38a) && j38i.test(j38b)) j38e = j38l.applyAsLong(j38a) == j38l.applyAsLong(j38b); else if (j38a instanceof Double || j38b instanceof Double) j38e = j38d.applyAsDouble(j38a) == j38d.applyAsDouble(j38b); else if (j38a instanceof Float || j38b instanceof Float) j38e = (float) j38d.applyAsDouble(j38a) == (float) j38d.applyAsDouble(j38b); else if (j38a instanceof String && j38b instanceof String) j38e = j38a.equals(j38b); else if (j38a instanceof Boolean && j38b instanceof Boolean) j38e = j38a.equals(j38b); else if (j38n.test(j38a) && j38n.test(j38b)) j38e = new java.math.BigDecimal(String.valueOf(j38a)).compareTo(new java.math.BigDecimal(String.valueOf(j38b))) == 0; else j38e = false; } catch (Exception j38x) { j38e = false; } return !j38g && !j38e; }).test(hex, "80")))
        {
            return hex;
        }
        if (((byteLength == null || byteLength < 56)))
        {
            return (this.intToBase16((128L + byteLength)) + hex);
        }
        String lengthHex = this.intToBase16(byteLength);
        Integer lengthHexLength = lengthHex.length();
        if ((((((double) lengthHexLength) % ((double) 2))) != 0))
        {
            lengthHex = ("0" + lengthHex);
        }
        Long lengthOfLength = this.parseToInt((((double) lengthHex.length()) / ((double) 2)));
        return ((this.intToBase16((183L + lengthOfLength)) + lengthHex) + hex);
    }

    public String rlpEncodeList(Object items)
    {
        String concatenated = "";
        for (var i = 0; i < ((List<?>)items).size(); i++)
        {
            concatenated = (concatenated + this.safeString(items, i, ""));
        }
        Long byteLength = this.parseToInt((((double) concatenated.length()) / ((double) 2)));
        if (java.util.Objects.equals(byteLength, null))
        {
            return "";
        }
        if (((byteLength == null || byteLength < 56)))
        {
            return (this.intToBase16((192L + byteLength)) + concatenated);
        }
        String lengthHex = this.intToBase16(byteLength);
        Integer lengthHexLength = lengthHex.length();
        if ((((((double) lengthHexLength) % ((double) 2))) != 0))
        {
            lengthHex = ("0" + lengthHex);
        }
        Long lengthOfLength = this.parseToInt((((double) lengthHex.length()) / ((double) 2)));
        return ((this.intToBase16((247L + lengthOfLength)) + lengthHex) + concatenated);
    }

    public String intToRlpHex(Object value)
    {
        if (java.util.Objects.equals(value, null))
        {
            throw new ArgumentsRequired((this.id + " intToRlpHex() requires a value argument")) ;
        }
        // an integer as its minimal big-endian byte hex; 0 is the empty byte string
        if (Helpers.isEqual(value, 0))
        {
            return "";
        }
        String hex = this.intToBase16(value);
        Integer hexLength = hex.length();
        if ((((((double) hexLength) % ((double) 2))) != 0))
        {
            hex = ("0" + hex);
        }
        return hex;
    }

    public String hexToRlpBytes(String hexValue)
    {
        // a hex value (e.g. an RPC result) as minimal big-endian byte hex; leading zero bytes
        // are stripped and 0 becomes the empty byte string (RLP integer encoding)
        if (java.util.Objects.equals(hexValue, null))
        {
            return "";
        }
        String h = this.remove0xPrefix(hexValue);
        Integer total = h.length();
        for (var i = 0; (total != null && i < total); i++)
        {
            if (java.util.Objects.equals(Helpers.slice(h, i, (((long) i) + 1L)), "0"))
            {
                continue;
            }
            return this.padHexToEven((String) ((h == null ? null : h.substring((int) Math.min(((Number)i).intValue(), h.length())))));
        }
        return "";
    }

    // eslint-disable-next-line no-unused-vars
    public String signEvmTransaction(Map<String, Object> tx, String privateKey)
    {
        throw new NotSupported((this.id + " signEvmTransaction() must be overridden by the exchange")) ;
    }

    public CompletableFuture<Object> ethRpc(String rpcUrl, Object method, Object rpcParams)
    {
        return BaseExchange.supplyAsync(() -> this.ethRpcCore(rpcUrl, method, rpcParams));
    }

    private Object ethRpcCore(String rpcUrl, Object method, Object rpcParams)
    {

        Map<String, Object> payload = new HashMap<String, Object>() {{
            put( "jsonrpc", "2.0" );
            put( "id", 1 );
            put( "method", method );
            put( "params", rpcParams );
        }};
        Map<String, Object> headers = new HashMap<String, Object>() {{
            put( "Content-Type", "application/json" );
        }};
        Object response = (this.fetch(rpcUrl, "POST", headers, this.json(payload))).join();
        Object rpcError = this.safeValue(response, "error");
        if (!java.util.Objects.equals(rpcError, null))
        {
            throw new ExchangeError(((((this.id + " rpc ") + method) + " error: ") + this.json(rpcError))) ;
        }
        // the result is either a hex string (nonce/gasPrice/txhash) or an object (receipt) —
        // safeString would coerce a receipt object to "[object Object]"
        return this.safeValue(response, "result");

    }

    public CompletableFuture<String> sendEvmTransaction(String rpcUrl, Object chainId, String fromAddress, String to, String value, String data, String gasLimit)
    {
        return BaseExchange.supplyAsync(() -> this.sendEvmTransactionCore(rpcUrl, chainId, fromAddress, to, value, data, gasLimit)).thenApply(res -> (String) res);
    }

    private Object sendEvmTransactionCore(String rpcUrl, Object chainId, String fromAddress, String to, String value, String data, String gasLimit)
    {

        Object nonce = (this.ethRpc(rpcUrl, "eth_getTransactionCount", new ArrayList<Object>(Arrays.asList(fromAddress, "pending")))).join();
        Object gasPrice = (this.ethRpc(rpcUrl, "eth_gasPrice", new ArrayList<Object>(Arrays.asList()))).join();
        Map<String, Object> tx = new HashMap<String, Object>() {{
            put( "chainId", chainId );
            put( "nonce", nonce );
            put( "maxPriorityFeePerGas", gasPrice );
            put( "maxFeePerGas", gasPrice );
            put( "gasLimit", gasLimit );
            put( "to", to );
            put( "value", value );
            put( "data", data );
        }};
        String signed = this.signEvmTransaction(tx, this.privateKey);
        return (this.ethRpc(rpcUrl, "eth_sendRawTransaction", new ArrayList<Object>(Arrays.asList(signed)))).join();

    }

    public CompletableFuture<Object> waitForTransactionReceipt(String rpcUrl, String txHash, Long timeout)
    {
        return BaseExchange.supplyAsync(() -> this.waitForTransactionReceiptCore(rpcUrl, txHash, timeout));
    }

    private Object waitForTransactionReceiptCore(String rpcUrl, String txHash, Long timeout)
    {

        Long start = this.milliseconds();
        while ((((this.milliseconds() - start)) < java.util.Objects.requireNonNullElse(timeout, 60000L)))
        {
            Object receipt = (this.ethRpc(rpcUrl, "eth_getTransactionReceipt", new ArrayList<Object>(Arrays.asList(txHash)))).join();
            if ((!java.util.Objects.equals(receipt, null)) && (!java.util.Objects.equals(receipt, null)))
            {
                return receipt;
            }
            (this.sleep(2000)).join();
        }
        throw new ExchangeError((((this.id + " transaction ") + txHash) + " not mined within timeout")) ;

    }

public CompletableFuture<PredictionOrder> editOrder(String id, String symbol, String type, String side, Double amount, Double price, Map<String, Object> parameters)
    {
        return BaseExchange.supplyAsync(() -> this.editOrderCore(id, symbol, type, side, amount, price, parameters)).thenApply(PredictionOrder::new);
    }

    private Object editOrderCore(String id, String symbol, String type, String side, Double amount, Double price, Map<String, Object> parameters)
    {

        (this.cancelOrder(id, symbol, new HashMap<String, Object>() {{}})).join();
        return (this.createOrder(symbol, type, side, (Double) (amount), price, parameters)).join();

    }













    public CompletableFuture<PredictionOrder> fetchOrder(String id, String symbol, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchOrder() is not supported yet"))).thenApply(PredictionOrder::new);

    }

    /**
     * @method
     * @name fetchOrderWithClientOrderId
     * @description create a market order by providing the symbol, side and cost
     * @param {string} clientOrderId client order Id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */











    public CompletableFuture<PredictionOrder> createMarketOrderWithCost(String symbol, String side, Double cost, Map<String, Object> parameters)
    {
        return BaseExchange.supplyAsync(() -> this.createMarketOrderWithCostCore(symbol, side, cost, parameters)).thenApply(PredictionOrder::new);
    }

    private Object createMarketOrderWithCostCore(String symbol, String side, Double cost, Map<String, Object> parameters)
    {

        /**
         * @method
         * @name createMarketOrderWithCost
         * @description create a market order by providing the symbol, side and cost
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} side 'buy' or 'sell'
         * @param {float} cost how much you want to trade in units of the quote currency
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
         */
        if ((!java.util.Objects.equals(this.has.get("createMarketOrderWithCost"), null) && !java.util.Objects.equals(this.has.get("createMarketOrderWithCost"), false)) || ((!java.util.Objects.equals(this.has.get("createMarketBuyOrderWithCost"), null) && !java.util.Objects.equals(this.has.get("createMarketBuyOrderWithCost"), false)) && (!java.util.Objects.equals(this.has.get("createMarketSellOrderWithCost"), null) && !java.util.Objects.equals(this.has.get("createMarketSellOrderWithCost"), false))))
        {
            return (this.createOrder(symbol, "market", side, cost, 1.0, parameters)).join();
        }
        throw new NotSupported((this.id + " createMarketOrderWithCost() is not supported yet")) ;

    }















    /**
     * @method
     * @name cancelOrderWithClientOrderId
     * @description create a market order by providing the symbol, side and cost
     * @param {string} clientOrderId client order Id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */



    /**
     * @method
     * @name cancelOrdersWithClientOrderIds
     * @description create a market order by providing the symbol, side and cost
     * @param {string[]} clientOrderIds client order Ids
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */


    public CompletableFuture<List<PredictionOrder>> cancelAllOrders(String symbol, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " cancelAllOrders() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

    }











    public CompletableFuture<List<PredictionOrder>> fetchCanceledOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return CompletableFuture.failedFuture(new NotSupported((this.id + " fetchCanceledOrders() is not supported yet"))).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

    }
}
