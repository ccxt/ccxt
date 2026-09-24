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
    public volatile Object outcomes = null;
    public volatile Object outcomes_by_id = null;
    public volatile Object events = null;
    public volatile Object events_by_slug = null;
    public volatile boolean reloadingEvents = false;
    public volatile java.util.concurrent.CompletableFuture<Object> eventsLoading = null;

    public PredictionExchange () {
        super();
    }

    public PredictionExchange (Object args) {
        super(args);
    }

    // Venue-specific prediction methods (limitless.redeem) are absent from
    // PredictionExchange.ts; the tier-wide typed surface still needs an
    // untyped core to dispatch to, so unsupported venues throw here.
    public CompletableFuture<Object> redeem(Object... optionalArgs) {
        return supplyAsync(() -> {
            throw new NotSupported(Helpers.add(this.id, " redeem() is not supported yet"));
        });
    }

    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

public Object describe()
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
        return (List<Object>) (this.safeList(parameters, "queries", new ArrayList<Object>(Arrays.asList())));
    }
    public List<Object> parseSearchQueries(Object... optionalArgs)
    {
        return this.parseSearchQueries(Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public Object requireEventQuery(Map<String, Object> parameters)
    {
        // fetchEvents must be scoped by at least one selector — an unfiltered call would page the
        // entire exchange. require one of query / queries / tags / eventId / slug, or one of the
        // venue-specific scope params an exchange declares in options['eventScopeParams'],
        // e.g. kalshi's category / series_ticker
        String query = this.safeString(parameters, "query");
        List<Object> queries = (List<Object>) this.safeList(parameters, "queries", new ArrayList<Object>(Arrays.asList()));
        List<Object> tags = (List<Object>) this.safeList(parameters, "tags", new ArrayList<Object>(Arrays.asList()));
        String eventId = this.safeString(parameters, "eventId");
        String slug = this.safeString(parameters, "slug");
        Integer queriesLength = ((List<?>)queries).size();
        Integer tagsLength = ((List<?>)tags).size();
        if ((!java.util.Objects.equals(query, null)) || (Helpers.isGreaterThan(queriesLength, 0)) || (Helpers.isGreaterThan(tagsLength, 0)) || (!java.util.Objects.equals(eventId, null)) || (!java.util.Objects.equals(slug, null)))
        {
            return null;
        }
        List<Object> extraScopeParams = (List<Object>) this.safeList(this.options, "eventScopeParams", new ArrayList<Object>(Arrays.asList()));
        Integer extraScopeParamsLength = ((List<?>)extraScopeParams).size();
        String extraNames = "";
        for (var i = 0; Helpers.isLessThan(i, extraScopeParamsLength); i++)
        {
            Object scopeKey = (extraScopeParams == null || i < 0 || i >= extraScopeParams.size() ? null : extraScopeParams.get(i));
            if ((scopeKey != null && ((Map<?, ?>)parameters).containsKey(scopeKey)))
            {
                return null;
            }
            extraNames = Helpers.add((extraNames + ", "), scopeKey);
        }
        throw new ArgumentsRequired((((this.id + " fetchEvents() requires at least one of query, queries, tags, eventId, slug") + extraNames) + " to scope the search")) ;
    }
    public Object requireEventQuery(Object... optionalArgs)
    {
        return this.requireEventQuery(Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
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
                Object eventVar = (result == null || i < 0 || i >= ((List<?>)result).size() ? null : ((List<?>)result).get(i));
                Boolean idMatch = (!java.util.Objects.equals(eventId, null)) && (java.util.Objects.equals(this.safeString(eventVar, "id"), eventId));
                Boolean slugMatch = (!java.util.Objects.equals(slug, null)) && (java.util.Objects.equals(this.safeString(eventVar, "slug"), slug));
                if (Boolean.TRUE.equals(idMatch) || Boolean.TRUE.equals(slugMatch))
                {
                    ((List<Object>)filtered).add(eventVar);
                }
            }
            result = filtered;
        }
        result = this.filterEventsByStatus(result, this.safeString(parameters, "status"));
        result = this.filterEventsByTags(result, this.safeList(parameters, "tags"));
        // own-line length read so the regex transpiler treats `queries` as an array (count())
        // and not a string (strlen()); guard undefined since the default is undefined
        Integer queriesLength = 0;
        if (!java.util.Objects.equals(queries, null))
        {
            queriesLength = ((List<?>)queries).size();
        }
        if (Helpers.isGreaterThan(queriesLength, 0))
        {
            result = this.filterEventsBySearchIn(result, queries, this.safeString(parameters, "searchIn"));
        }
        String sort = this.safeString(parameters, "sort");
        if (!java.util.Objects.equals(sort, null))
        {
            String sortKey = null;
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
            if (!java.util.Objects.equals(sortKey, null))
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
            Object sliceEnd = limit;
            if (Helpers.isGreaterThan(sliceEnd, resultLength))
            {
                sliceEnd = resultLength;
            }
            result = this.arraySlice(result, 0, sliceEnd);
        }
        return result;
    }
    public Object applyEventFetchParams(Object events, Object... optionalArgs)
    {
        return this.applyEventFetchParams(events, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}), optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null);
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
            Object eventVar = (events == null || i < 0 || i >= ((List<?>)events).size() ? null : ((List<?>)events).get(i));
            Boolean isActive = (Boolean) this.safeBool(eventVar, "active");
            // keep events whose status is unknown (already filtered server-side, no `active` field)
            if ((java.util.Objects.equals(isActive, null)) || (java.util.Objects.equals(isActive, wantActive)))
            {
                ((List<Object>)result).add(eventVar);
            }
        }
        return result;
    }
    public Object filterEventsByStatus(Object events, Object... optionalArgs)
    {
        return this.filterEventsByStatus(events, Helpers.getArgString(optionalArgs, 0, null));
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
        if ((java.util.Objects.equals(searchIn, null)) || (java.util.Objects.equals(queries, null)) || (java.util.Objects.equals(queriesLength, 0)))
        {
            return events;
        }
        Boolean checkTitle = (java.util.Objects.equals(searchIn, "title")) || (java.util.Objects.equals(searchIn, "both"));
        Boolean checkDescription = (java.util.Objects.equals(searchIn, "description")) || (java.util.Objects.equals(searchIn, "both"));
        List<Object> result = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < ((List<?>)events).size(); i++)
        {
            Object eventVar = (events == null || i < 0 || i >= ((List<?>)events).size() ? null : ((List<?>)events).get(i));
            String title = this.safeStringLower(eventVar, "title", "");
            String description = this.safeStringLower(eventVar, "description", "");
            Boolean matched = false;
            for (var qi = 0; qi < ((List<?>)queries).size(); qi++)
            {
                String q = ((String)(queries == null || qi < 0 || qi >= ((List<?>)queries).size() ? null : ((List<?>)queries).get(qi))).toLowerCase();
                if (java.util.Objects.equals(title, null))
                {
                    throw new ExchangeError((this.id + " filterEventsBySearchIn() missing title")) ;
                }
                if (Boolean.TRUE.equals(checkTitle) && (((String)title).indexOf(q) >= 0))
                {
                    matched = true;
                    break;
                }
                if (java.util.Objects.equals(description, null))
                {
                    throw new ExchangeError((this.id + " filterEventsBySearchIn() missing description")) ;
                }
                if (Boolean.TRUE.equals(checkDescription) && (((String)description).indexOf(q) >= 0))
                {
                    matched = true;
                    break;
                }
            }
            if (Boolean.TRUE.equals(matched))
            {
                ((List<Object>)result).add(eventVar);
            }
        }
        return result;
    }
    public Object filterEventsBySearchIn(Object events, Object queries, Object... optionalArgs)
    {
        return this.filterEventsBySearchIn(events, queries, Helpers.getArgString(optionalArgs, 0, null));
    }

    public Object normalizeTagKey(Object tag)
    {
        // reduce a tag to lowercase alphanumeric words joined by single spaces ("Fed Rates" /
        // "fed-rates" / "FED_RATES" all become "fed rates") so label, slug and handle spellings
        // of the same tag compare equal — venues surface tags in different forms and callers
        // pass any of them. keeping the word boundary avoids cross-word false positives that
        // plain concatenation would create ("us open" vs "household")
        String lower = ((String)tag).toLowerCase();
        String allowed = "abcdefghijklmnopqrstuvwxyz0123456789";
        Object chars = this.stringToCharsArray(lower);
        Object s = "";
        Boolean pendingSep = false;
        for (var i = 0; i < ((List<?>)chars).size(); i++)
        {
            Object ch = (chars == null || i < 0 || i >= ((List<?>)chars).size() ? null : ((List<?>)chars).get(i));
            if (((String)allowed).indexOf(((String)ch)) >= 0)
            {
                if (Boolean.TRUE.equals(pendingSep) && (!java.util.Objects.equals(s, "")))
                {
                    s = (s + " ");
                }
                s = Helpers.add(s, ch);
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
        if ((java.util.Objects.equals(tags, null)) || ((((List<?>)tags).size() == 0)))
        {
            return events;
        }
        List<Object> wanted = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < ((List<?>)tags).size(); i++)
        {
            Object wantedKey = this.normalizeTagKey((tags == null || i < 0 || i >= ((List<?>)tags).size() ? null : ((List<?>)tags).get(i)));
            if (!java.util.Objects.equals(wantedKey, ""))
            {
                // an empty normalized key would substring-match every tag
                ((List<Object>)wanted).add(wantedKey);
            }
        }
        List<Object> result = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < ((List<?>)events).size(); i++)
        {
            Object eventVar = (events == null || i < 0 || i >= ((List<?>)events).size() ? null : ((List<?>)events).get(i));
            List<Object> eventTags = (List<Object>) this.safeList(eventVar, "tags", new ArrayList<Object>(Arrays.asList()));
            Boolean matched = false;
            for (var ti = 0; ti < ((List<?>)eventTags).size(); ti++)
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
                    Object tagKey = this.normalizeTagKey(tagLabel);
                    for (var wi = 0; wi < ((List<?>)wanted).size(); wi++)
                    {
                        if (Helpers.getIndexOf(tagKey, (wanted == null || wi < 0 || wi >= wanted.size() ? null : wanted.get(wi))) >= 0)
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
                ((List<Object>)result).add(eventVar);
            }
        }
        return result;
    }
    public Object filterEventsByTags(Object events, Object... optionalArgs)
    {
        return this.filterEventsByTags(events, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null);
    }

    public CompletableFuture<List<PredictionEvent>> fetchEvents(Object parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchEvents() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionEvent::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<PredictionEvent>> fetchEvents(Object... optionalArgs)
    {
        return this.fetchEvents(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : new HashMap<String, Object>() {{}});
    }

    public CompletableFuture<PredictionEvent> fetchEvent(String id, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchEvent() is not supported yet")) ;
        }).thenApply(PredictionEvent::new);

    }
    public CompletableFuture<PredictionEvent> fetchEvent(String id, Object... optionalArgs)
    {
        return this.fetchEvent(id, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
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
            Object eventVar = (events == null || i < 0 || i >= ((List<?>)events).size() ? null : ((List<?>)events).get(i));
            String id = this.safeString(eventVar, "id");
            String slug = this.safeString(eventVar, "slug");
            String handle = this.safeString(eventVar, "event");
            if (!java.util.Objects.equals(id, null))
            {
                Helpers.addElementToObject(this.events, id, eventVar);
            }
            if (!java.util.Objects.equals(handle, null))
            {
                Helpers.addElementToObject(this.events, handle, eventVar);
            }
            if (!java.util.Objects.equals(slug, null))
            {
                Helpers.addElementToObject(this.events_by_slug, slug, eventVar);
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
        List<Object> keys = Helpers.objectKeys(this.events);
        for (var i = 0; i < ((List<?>)keys).size(); i++)
        {
            Object eventVar = Helpers.GetValue(this.events, (keys == null || i < 0 || i >= keys.size() ? null : keys.get(i)));
            String identity = this.safeString2(eventVar, "id", "event", (keys == null || i < 0 || i >= keys.size() ? null : keys.get(i)));
            if (!(seen.containsKey(identity)))
            {
                seen.put((String)identity, true);
                ((List<Object>)result).add(eventVar);
            }
        }
        return result;
    }

    public CompletableFuture<Object> loadEventsHelper(Object reload, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            // note: the cache-hit shortcut ignores params, so events fetched under one scope are
            // returned for a later differently-scoped call. events are scoped (unlike global
            // markets), so prefer fetchEvents (params) directly when you need a specific scope
            if (!Helpers.isTrue(reload) && (!java.util.Objects.equals(this.events, null) && !java.util.Objects.equals(this.events, null)))
            {
                return this.events;
            }
            Object events = (this.fetchEvents(parameters)).join();
            return this.setEvents(events);
        });

    }
    public CompletableFuture<Object> loadEventsHelper(Object... optionalArgs)
    {
        return this.loadEventsHelper(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : false, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public CompletableFuture<Object> loadEvents(Object reload, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            // cached entry point mirroring loadMarkets. unlike loadMarkets there is no cross-call
            // promise coalescing: the promise-sharing idiom is not expressible in the transpiled
            // base, so two truly concurrent first calls may fetch twice (both land in the cache)
            return (this.loadEventsHelper(reload, parameters)).join();
        });

    }
    public CompletableFuture<Object> loadEvents(Object... optionalArgs)
    {
        return this.loadEvents(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : false, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }

    public Object getEvent(Object eventIdOrSlug)
    {
        // cache-only event resolver (the event analogue of this.outcome) - the cache fills
        // through fetchEvents; this never fetches
        if ((!java.util.Objects.equals(this.events, null)) && (((Map<?, ?>)this.events).containsKey(eventIdOrSlug)))
        {
            return Helpers.GetValue(this.events, eventIdOrSlug);
        }
        if ((!java.util.Objects.equals(this.events_by_slug, null)) && (((Map<?, ?>)this.events_by_slug).containsKey(eventIdOrSlug)))
        {
            return Helpers.GetValue(this.events_by_slug, eventIdOrSlug);
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
            return (Map<String, Object>) (Helpers.GetValue(this.outcomes, outcomeSymbol));
        }
        if ((!java.util.Objects.equals(this.outcomes_by_id, null)) && (((Map<?, ?>)this.outcomes_by_id).containsKey(outcomeSymbol)))
        {
            return (Map<String, Object>) (Helpers.GetValue(this.outcomes_by_id, outcomeSymbol));
        }
        throw new BadSymbol((((this.id + " does not have outcome ") + outcomeSymbol) + " - pass a known outcome handle or outcomeId, or call fetchEvents ()/loadOutcomes () first")) ;
    }

    public Object hasOutcome(String outcomeIdOrSymbol)
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

    public Map<String, Object> safeOutcome(String outcomeIdOrSymbol, Object outcomeObj)
    {
        if (!java.util.Objects.equals(outcomeIdOrSymbol, null))
        {
            if ((!java.util.Objects.equals(this.outcomes, null)) && (((Map<?, ?>)this.outcomes).containsKey(outcomeIdOrSymbol)))
            {
                return (Map<String, Object>) (Helpers.GetValue(this.outcomes, outcomeIdOrSymbol));
            }
            if ((!java.util.Objects.equals(this.outcomes_by_id, null)) && (((Map<?, ?>)this.outcomes_by_id).containsKey(outcomeIdOrSymbol)))
            {
                return (Map<String, Object>) (Helpers.GetValue(this.outcomes_by_id, outcomeIdOrSymbol));
            }
        }
        if (!java.util.Objects.equals(outcomeObj, null))
        {
            return (Map<String, Object>) (outcomeObj);
        }
        // stub for an unknown handle; it only carries the identity keys, not the market fields
        final Object finalOutcomeIdOrSymbol = outcomeIdOrSymbol;
        outcomeObj = new HashMap<String, Object>() {{
            put( "outcome", finalOutcomeIdOrSymbol );
            put( "outcomeId", finalOutcomeIdOrSymbol );
            put( "market", null );
            put( "label", null );
            put( "event", null );
            put( "info", new HashMap<String, Object>() {{}} );
        }};
        return (Map<String, Object>) (outcomeObj);
    }
    public Map<String, Object> safeOutcome(String outcomeIdOrSymbol, Object... optionalArgs)
    {
        return this.safeOutcome(outcomeIdOrSymbol, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null);
    }

    public Object safeOutcomeSymbol(String outcomeIdOrSymbol, Object outcomeObj)
    {
        outcomeObj = this.safeOutcome((String) (outcomeIdOrSymbol), outcomeObj);
        return Helpers.GetValue(outcomeObj, "outcome");
    }
    public Object safeOutcomeSymbol(String outcomeIdOrSymbol, Object... optionalArgs)
    {
        return this.safeOutcomeSymbol(outcomeIdOrSymbol, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null);
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
        String lower = (((java.util.Objects.equals(slug, null)))) ? "" : ((String)slug).toLowerCase();
        String allowed = "abcdefghijklmnopqrstuvwxyz0123456789";
        Object chars = this.stringToCharsArray(lower);
        Object s = "";
        Boolean lastDash = true; // start true to drop leading separators
        for (var i = 0; i < ((List<?>)chars).size(); i++)
        {
            Object ch = (chars == null || i < 0 || i >= ((List<?>)chars).size() ? null : ((List<?>)chars).get(i));
            if (((String)allowed).indexOf(((String)ch)) >= 0)
            {
                s = Helpers.add(s, ch);
                lastDash = false;
            } else if (!Boolean.TRUE.equals(lastDash))
            {
                s = (s + "-");
                lastDash = true;
            }
        }
        List<String> replacementKeys = new ArrayList<String>(replacements.keySet());
        for (var i = 0; i < ((List<?>)replacementKeys).size(); i++)
        {
            String replacementKey = (replacementKeys == null || i < 0 || i >= replacementKeys.size() ? null : replacementKeys.get(i));
            String replacementValue = this.safeString(replacements, replacementKey);
            if (!java.util.Objects.equals(replacementValue, null))
            {
                s = Helpers.replaceAll(((String)s), replacementKey, replacementValue);
            }
        }
        List<Object> rawParts = new ArrayList<Object>(Arrays.asList(((String)s).split(java.util.regex.Pattern.quote("-"))));
        Object parts = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < ((List<?>)rawParts).size(); i++)
        {
            String w = (String) Helpers.GetValue(rawParts, i);
            if (w.length() > 0 && !this.inArray(w, stopWords))
            {
                ((List<Object>)parts).add(w);
            }
        }
        String joined = String.join("_", (List<String>)parts);
        return joined.toUpperCase();
    }

    public Object slugToMarketSymbol(String eventSlug, String marketSlug)
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
        String marketPart = this.shortenSlug((String) (marketSlug));
        String eventPart = this.shortenSlug((String) (eventSlug));
        if ((java.util.Objects.equals(eventPart, null)) || (java.util.Objects.equals(eventPart, "")) || (java.util.Objects.equals(eventPart, marketPart)))
        {
            return marketPart;
        }
        return ((eventPart + "_") + marketPart);
    }

    public Object slugToOutcomeSymbol(String eventSlug, String marketSlug, String outcome)
    {
        // build on slugToMarketSymbol so the outcome handle stays consistent with the market symbol
        // — both event-qualified or both not — otherwise a qualified market + unqualified outcome mismatch.
        // the label gets a light slug treatment (uppercase alphanumerics joined by '_', no stop-word
        // removal so labels like "UP OR DOWN" survive intact) — venue labels with spaces or
        // currency symbols ("JD Vance", a dollar-sign price) yield clean handles (JD_VANCE, 120)
        // instead of leaking raw text into the outcome handle
        if (java.util.Objects.equals(outcome, null))
        {
            outcome = "";
        }
        String upper = ((String)outcome).toUpperCase();
        String allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Object chars = this.stringToCharsArray(upper);
        Object label = "";
        Boolean pendingSep = false;
        for (var i = 0; i < ((List<?>)chars).size(); i++)
        {
            Object ch = (chars == null || i < 0 || i >= ((List<?>)chars).size() ? null : ((List<?>)chars).get(i));
            if (((String)allowed).indexOf(((String)ch)) >= 0)
            {
                if (Boolean.TRUE.equals(pendingSep) && (!java.util.Objects.equals(label, "")))
                {
                    label = (label + "_");
                }
                label = Helpers.add(label, ch);
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
        return ((this.slugToMarketSymbol((String) (eventSlug), (String) (marketSlug)) + ":") + label);
    }

    public Object setMarkets(Object markets, Object currencies)
    {
        // prediction market rows carry only the unified `market` handle — `symbol` is
        // deprecated there. the base indexer keys this.markets/this.symbols by 'symbol',
        // so alias the handle onto a shallow copy per row; the caller's rows stay symbol-free
        List<Object> marketsList = this.toArray(markets);
        List<Object> aliased = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < ((List<?>)marketsList).size(); i++)
        {
            Object row = (marketsList == null || i < 0 || i >= marketsList.size() ? null : marketsList.get(i));
            Map<String, Object> copy = this.extend(new HashMap<String, Object>() {{}}, row);
            copy.put("symbol", PredictionExchange.this.safeString2(row, "market", "symbol"));
            ((List<Object>)aliased).add(copy);
        }
        Object stored = super.setMarkets((Object) (aliased), currencies);
        // strip the alias back off the stored rows — venues assemble user-visible event
        // structures from this.markets (hyperliquid groups its outcome markets that way),
        // so a leftover 'symbol' key would leak the deprecated field back to the caller
        List<String> marketKeys = new ArrayList<String>(((Map<String, Object>)stored).keySet());
        for (var i = 0; i < ((List<?>)marketKeys).size(); i++)
        {
            String key = (marketKeys == null || i < 0 || i >= marketKeys.size() ? null : marketKeys.get(i));
            ((Map<String, Object>)stored).put((String)key, this.omit(Helpers.GetValue(stored, key), "symbol"));
        }
        this.populateOutcomes();
        return stored;
    }
    public Object setMarkets(Object markets, Object... optionalArgs)
    {
        return this.setMarkets(markets, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null);
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
        List<Object> outcomesList = (List<Object>) this.safeList(market, "outcomes", new ArrayList<Object>(Arrays.asList()));
        for (var j = 0; j < ((List<?>)outcomesList).size(); j++)
        {
            Object oc = (outcomesList == null || j < 0 || j >= outcomesList.size() ? null : outcomesList.get(j));
            String ocSymbol = this.safeString2(oc, "outcome", "symbol");
            String ocId = this.safeString2(oc, "outcomeId", "id");
            // assign unconditionally — safeString2 keeps the canonical key when present
            // and falls back to the legacy one, so this never clobbers and avoids a
            // missing-key access that throws in Python/PHP, unlike TS undefined
            Helpers.addElementToObject(oc, "outcomeId", ocId);
            Helpers.addElementToObject(oc, "market", this.safeString2(oc, "market", "marketSymbol"));
            if (!java.util.Objects.equals(ocSymbol, null))
            {
                // shortenSlug is lossy, so two different markets can produce the same handle.
                // on a real collision of same handle but different outcomeId, disambiguate the
                // second one deterministically instead of silently overwriting the first —
                // trading the wrong market would otherwise be indistinguishable
                Object existing = this.safeValue(this.outcomes, ocSymbol);
                if (!java.util.Objects.equals(existing, null))
                {
                    String existingId = this.safeString(existing, "outcomeId");
                    if ((!java.util.Objects.equals(existingId, null)) && (!java.util.Objects.equals(ocId, null)) && (!java.util.Objects.equals(existingId, ocId)))
                    {
                        Integer idLen = ocId.length();
                        Object suffix = ocId;
                        if (Helpers.isGreaterThan(idLen, 6))
                        {
                            suffix = Helpers.slice(ocId, (((long) idLen) - 6L), null);
                        }
                        ocSymbol = ((ocSymbol + "_") + ((String)suffix).toUpperCase());
                    }
                }
                Helpers.addElementToObject(oc, "outcome", ocSymbol);
                Helpers.addElementToObject(this.outcomes, ocSymbol, oc);
            } else
            {
                Helpers.addElementToObject(oc, "outcome", ocSymbol);
            }
            if (!java.util.Objects.equals(ocId, null))
            {
                Helpers.addElementToObject(this.outcomes_by_id, ocId, oc);
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
        List<Object> marketKeys = Helpers.objectKeys(this.markets);
        for (var i = 0; i < ((List<?>)marketKeys).size(); i++)
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
        List<Object> markets = (List<Object>) this.safeList(eventVar, "markets", new ArrayList<Object>(Arrays.asList()));
        Integer marketsLength = ((List<?>)markets).size();
        for (var i = 0; Helpers.isLessThan(i, marketsLength); i++)
        {
            Object m = (markets == null || i < 0 || i >= markets.size() ? null : markets.get(i));
            String marketHandle = this.safeString2(m, "market", "symbol");
            if (!java.util.Objects.equals(marketHandle, null))
            {
                Helpers.addElementToObject(this.markets, marketHandle, m);
            }
        }
        this.populateOutcomes();
    }

    public CompletableFuture<Object> loadOutcomes(Object outcomes2, Object reload2, Map<String, Object> parameters)
    {
        final Object outcomes3 = outcomes2;
        final Object reload3 = reload2;
        return BaseExchange.supplyAsync(() -> {
            Object outcomes = outcomes3;
            Object reload = reload3;
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
                List<Object> missing = new ArrayList<Object>(Arrays.asList());
                for (var i = 0; i < ((List<?>)outcomes).size(); i++)
                {
                    if (Helpers.isTrue(reload) || !Boolean.TRUE.equals(this.hasOutcome((String) ((outcomes == null || i < 0 || i >= ((List<?>)outcomes).size() ? null : ((List<?>)outcomes).get(i))))))
                    {
                        ((List<Object>)missing).add((outcomes == null || i < 0 || i >= ((List<?>)outcomes).size() ? null : ((List<?>)outcomes).get(i)));
                    }
                }
                Integer missingLength = ((List<?>)missing).size();
                Boolean wasWarm = (!java.util.Objects.equals(this.outcomes, null)) && !this.isEmpty(this.outcomes);
                Boolean loadAll = (Boolean) this.safeBool(this.options, "loadAllOutcomes", false);
                if ((Helpers.isGreaterThan(missingLength, 0)) && (java.util.Objects.equals(loadAll, true)) && !Boolean.TRUE.equals(wasWarm) && !Helpers.isTrue(reload))
                {
                    // same trade-off as loadOutcome: on venues where the whole universe is one cheap
                    // request (hyperliquid), a cold miss bulk-warms once instead of fetching per outcome
                    (this.loadOutcomes()).join();
                    List<Object> stillMissing = new ArrayList<Object>(Arrays.asList());
                    for (var i = 0; Helpers.isLessThan(i, missingLength); i++)
                    {
                        if (!Boolean.TRUE.equals(this.hasOutcome((String) ((missing == null || i < 0 || i >= missing.size() ? null : missing.get(i))))))
                        {
                            ((List<Object>)stillMissing).add((missing == null || i < 0 || i >= missing.size() ? null : missing.get(i)));
                        }
                    }
                    missing = stillMissing;
                    missingLength = ((List<?>)missing).size();
                }
                if (Helpers.isGreaterThan(missingLength, 0))
                {
                    (this.fetchOutcomes(missing)).join();
                }
                return this.outcomes;
            }
            if (!Helpers.isTrue(reload) && (!java.util.Objects.equals(this.outcomes, null)) && !this.isEmpty(this.outcomes))
            {
                return this.outcomes;
            }
            (this.loadMarkets(reload, parameters)).join();
            this.populateOutcomes();
            return this.outcomes;
        });

    }
    public CompletableFuture<Object> loadOutcomes(Object... optionalArgs)
    {
        return this.loadOutcomes(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : false, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }

    /**
     * @ignore
     * @method
     * @name PredictionExchange#fetchOutcomes
     * @description resolves several uncached outcomes. the base has no batch by-id endpoint, so it fetches them one by one through fetchOutcome (which throws BadSymbol for an unresolvable one); venues with a batch endpoint (kalshi, polymarket) override this to collapse the list into one request
     * @param {string[]} outcomeSymbols the uncached outcome handles or ids to resolve
     * @returns {object} the outcome cache
     */
    public CompletableFuture<Object> fetchOutcomes(Object outcomeSymbols)
    {

        return BaseExchange.supplyAsync(() -> {

            for (var i = 0; i < ((List<?>)outcomeSymbols).size(); i++)
            {
                (this.fetchOutcome((outcomeSymbols == null || i < 0 || i >= ((List<?>)outcomeSymbols).size() ? null : ((List<?>)outcomeSymbols).get(i)))).join();
            }
            return this.outcomes;
        });

    }

    public CompletableFuture<Map<String, Object>> loadOutcome(String outcomeSymbol2, Object reload)
    {
        final Object outcomeSymbol3 = outcomeSymbol2;
        return BaseExchange.supplyAsync(() -> {
            Object outcomeSymbol = outcomeSymbol3;
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
            if (!Helpers.isTrue(reload))
            {
                if (Boolean.TRUE.equals(this.hasOutcome((String) (outcomeSymbol))))
                {
                    return this.safeOutcome((String) (outcomeSymbol));
                }
                Boolean wasWarm = (!java.util.Objects.equals(this.outcomes, null)) && !this.isEmpty(this.outcomes);
                // if markets are already loaded (offline-injected, or loaded by loadMarkets/fetchEvents)
                // but the outcome cache is cold, index them for free before hitting the network — this
                // makes cold-cache resolution consistent across languages regardless of loadAllOutcomes
                if (!Boolean.TRUE.equals(wasWarm) && (!java.util.Objects.equals(this.markets, null)) && !this.isEmpty(this.markets))
                {
                    this.populateOutcomes();
                    if (Boolean.TRUE.equals(this.hasOutcome((String) (outcomeSymbol))))
                    {
                        return this.safeOutcome((String) (outcomeSymbol));
                    }
                }
                Boolean loadAll = (Boolean) this.safeBool(this.options, "loadAllOutcomes", false);
                if ((java.util.Objects.equals(loadAll, true)) && !Boolean.TRUE.equals(wasWarm))
                {
                    // a miss on a cold cache: bulk-load once so later lookups are 0-network hits.
                    // a miss on an already-warm cache is authoritative — the outcome genuinely isn't
                    // listed, so fall through to fetchOutcome (a real BadSymbol) rather than refetching
                    // the whole listing (which would mask typos and clobber offline-injected markets)
                    (this.loadOutcomes()).join();
                    if (Boolean.TRUE.equals(this.hasOutcome((String) (outcomeSymbol))))
                    {
                        return this.safeOutcome((String) (outcomeSymbol));
                    }
                }
            }
            return (this.fetchOutcome(outcomeSymbol)).join();
        }).thenApply(res -> (Map<String, Object>) res);

    }
    public CompletableFuture<Map<String, Object>> loadOutcome(String outcomeSymbol, Object... optionalArgs)
    {
        return this.loadOutcome(outcomeSymbol, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : false);
    }

    public String outcomeSearchQuery(Object outcomeSymbol)
    {
        // derive a human search query from a unified outcome handle (EVENT_MARKET:LABEL) so a
        // cache miss can be resolved through the venue's scoped search instead of a bulk listing
        // download. returns undefined for id-like inputs (numeric token ids, 0x hashes) that
        // carry no searchable words
        Object marketPart = outcomeSymbol;
        Object colonIndex = ((String)outcomeSymbol).indexOf(":");
        if (Helpers.isGreaterThanOrEqual(colonIndex, 0))
        {
            marketPart = Helpers.slice(outcomeSymbol, 0, colonIndex);
        }
        if ((((String)marketPart).indexOf("0x") == 0))
        {
            return null;
        }
        // handles join words with '_' (slug-derived) or legacy '-' separated inputs (normalized below)
        String normalized = Helpers.replaceAll(((String)((String)marketPart).toLowerCase()), "-", "_");
        List<Object> rawWords = new ArrayList<Object>(Arrays.asList(((String)normalized).split(java.util.regex.Pattern.quote("_"))));
        Object words = new ArrayList<Object>(Arrays.asList());
        Boolean hasLetters = false;
        String letters = "abcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < ((List<?>)rawWords).size(); i++)
        {
            String word = (String) Helpers.GetValue(rawWords, i);
            // inline .length so the php transpiler emits strlen() — the standalone
            // `const n = str.length;` statement form wrongly becomes count() (array)
            if ((word.length() == 0))
            {
                continue;
            }
            Boolean wordHasLetters = false;
            Object chars = this.stringToCharsArray(word);
            for (var ci = 0; ci < ((List<?>)chars).size(); ci++)
            {
                if (Helpers.getIndexOf(letters, (chars == null || ci < 0 || ci >= ((List<?>)chars).size() ? null : ((List<?>)chars).get(ci))) >= 0)
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
            ((List<Object>)words).add(word);
            hasLetters = true;
        }
        Integer wordsLength = ((List<?>)words).size();
        if ((java.util.Objects.equals(wordsLength, 0)) || !Boolean.TRUE.equals(hasLetters))
        {
            // a purely numeric/symbolic handle is an id, not searchable text
            return null;
        }
        return String.join(" ", (List<String>)words);
    }

    public CompletableFuture<Object> fetchOutcome(Object outcomeSymbol)
    {

        return BaseExchange.supplyAsync(() -> {

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
                    (this.fetchEvents(new HashMap<String, Object>() {{
                        put( "query", searchQuery );
                        put( "limit", searchLimit );
                    }})).join();
                } catch(Exception e)
                {
                    // a query with zero matches surfaces as BadSymbol on some venues — treat it as a
                    // plain miss (the guidance-rich throw below); let real transport errors propagate
                    if (!(Helpers.isInstance(e, BadSymbol.class)))
                    {
                        throw (e instanceof RuntimeException ? (RuntimeException)e : new RuntimeException(e));
                    }
                }
                if (Boolean.TRUE.equals(this.hasOutcome((String) (outcomeSymbol))))
                {
                    return this.safeOutcome((String) (outcomeSymbol));
                }
            }
            throw new BadSymbol((((this.id + " could not resolve outcome ") + outcomeSymbol) + " — call fetchEvents ({ 'query': ... }) first, or pass a known outcomeId")) ;
        });

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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTicker() is not supported yet")) ;
        }).thenApply(PredictionTicker::new);

    }
    /**
     * @method
     * @name fetchTicker
     * @description fetches a price ticker for a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    public CompletableFuture<PredictionTicker> fetchTicker(String outcome, Object... optionalArgs)
    {
        return this.fetchTicker(outcome, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    /**
     * @method
     * @name fetchTickers
     * @description fetches price tickers for multiple prediction outcomes at once
     * @param {string[]} [outcomes] unified outcome handles or outcome ids
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome
     */
    public CompletableFuture<PredictionTickers> fetchTickers(Object outcomes, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTickers() is not supported yet")) ;
        }).thenApply(PredictionTickers::new);

    }
    /**
     * @method
     * @name fetchTickers
     * @description fetches price tickers for multiple prediction outcomes at once
     * @param {string[]} [outcomes] unified outcome handles or outcome ids
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure) indexed by outcome
     */
    public CompletableFuture<PredictionTickers> fetchTickers(Object... optionalArgs)
    {
        return this.fetchTickers(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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
    public CompletableFuture<PredictionOrderBook> fetchOrderBook(Object outcome, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrderBook() is not supported yet")) ;
        }).thenApply(PredictionOrderBook::new);

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
    public CompletableFuture<PredictionOrderBook> fetchOrderBook(Object outcome, Object... optionalArgs)
    {
        return this.fetchOrderBook(outcome, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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
    public CompletableFuture<List<OHLCV>> fetchOHLCV(Object outcome, Object timeframe, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            return (super.fetchOHLCV(outcome, timeframe, since, limit, parameters)).join();
        }).thenApply(res -> ((List<?>) res).stream().map(OHLCV::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<OHLCV>> fetchOHLCV(Object outcome, Object... optionalArgs)
    {
        return this.fetchOHLCV(outcome, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : "1m", Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionTrade::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionTrade>> fetchTrades(String outcome, Object... optionalArgs)
    {
        return this.fetchTrades(outcome, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
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
    public CompletableFuture<PredictionOrder> createOrder(Object outcome, String type, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " createOrder() is not supported yet")) ;
        }).thenApply(PredictionOrder::new);

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
    public CompletableFuture<PredictionOrder> createOrder(Object outcome, String type, String side, Object amount, Object... optionalArgs)
    {
        return this.createOrder(outcome, type, side, amount, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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
    public CompletableFuture<PredictionOrder> cancelOrder(Object id, String outcome, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelOrder() is not supported yet")) ;
        }).thenApply(PredictionOrder::new);

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
    public CompletableFuture<PredictionOrder> cancelOrder(Object id, Object... optionalArgs)
    {
        return this.cancelOrder(id, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchTicker() is not supported yet")) ;
        }).thenApply(PredictionTicker::new);

    }
    /**
     * @method
     * @name watchTicker
     * @description watches a price ticker for a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    public CompletableFuture<PredictionTicker> watchTicker(String outcome, Object... optionalArgs)
    {
        return this.watchTicker(outcome, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchOrderBook() is not supported yet")) ;
        }).thenApply(PredictionOrderBook::new);

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
    public CompletableFuture<PredictionOrderBook> watchOrderBook(String outcome, Object... optionalArgs)
    {
        return this.watchOrderBook(outcome, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionTrade::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionTrade>> watchTrades(String outcome, Object... optionalArgs)
    {
        return this.watchTrades(outcome, Helpers.getArgLong(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionOrder>> fetchOrders(Object... optionalArgs)
    {
        return this.fetchOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOpenOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionOrder>> fetchOpenOrders(Object... optionalArgs)
    {
        return this.fetchOpenOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchClosedOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionOrder>> fetchClosedOrders(Object... optionalArgs)
    {
        return this.fetchClosedOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrderTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionTrade::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionTrade>> fetchOrderTrades(String id, Object... optionalArgs)
    {
        return this.fetchOrderTrades(id, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchMyTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionTrade::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionTrade>> fetchMyTrades(Object... optionalArgs)
    {
        return this.fetchMyTrades(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    /**
     * @method
     * @name fetchPosition
     * @description fetch the open position held on a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    public CompletableFuture<PredictionPosition> fetchPosition(Object outcome, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPosition() is not supported yet")) ;
        }).thenApply(PredictionPosition::new);

    }
    /**
     * @method
     * @name fetchPosition
     * @description fetch the open position held on a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    public CompletableFuture<PredictionPosition> fetchPosition(Object outcome, Object... optionalArgs)
    {
        return this.fetchPosition(outcome, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    /**
     * @method
     * @name fetchPositions
     * @description fetches the user's open positions
     * @param {string[]} [outcomes] unified outcome handles to filter by
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    public CompletableFuture<List<PredictionPosition>> fetchPositions(Object outcomes, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchPositions() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionPosition::new).collect(Collectors.toList()));

    }
    /**
     * @method
     * @name fetchPositions
     * @description fetches the user's open positions
     * @param {string[]} [outcomes] unified outcome handles to filter by
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [position structures](https://docs.ccxt.com/#/?id=position-structure)
     */
    public CompletableFuture<List<PredictionPosition>> fetchPositions(Object... optionalArgs)
    {
        return this.fetchPositions(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchTradingFee() is not supported yet")) ;
        }).thenApply(PredictionTradingFee::new);

    }
    /**
     * @method
     * @name fetchTradingFee
     * @description fetch the trading fee for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
     */
    public CompletableFuture<PredictionTradingFee> fetchTradingFee(String outcome, Object... optionalArgs)
    {
        return this.fetchTradingFee(outcome, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOpenInterest() is not supported yet")) ;
        }).thenApply(PredictionOpenInterest::new);

    }
    /**
     * @method
     * @name fetchOpenInterest
     * @description fetch the open interest of a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
     */
    public CompletableFuture<PredictionOpenInterest> fetchOpenInterest(String outcome, Object... optionalArgs)
    {
        return this.fetchOpenInterest(outcome, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    /**
     * @method
     * @name createOrders
     * @description create a list of trade orders
     * @param {object[]} orders a list of PredictionOrderRequest objects, each carrying an `outcome` handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    public CompletableFuture<List<PredictionOrder>> createOrders(Object orders, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " createOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

    }
    /**
     * @method
     * @name createOrders
     * @description create a list of trade orders
     * @param {object[]} orders a list of PredictionOrderRequest objects, each carrying an `outcome` handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    public CompletableFuture<List<PredictionOrder>> createOrders(Object orders, Object... optionalArgs)
    {
        return this.createOrders(orders, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
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
    public CompletableFuture<List<PredictionOrder>> cancelOrders(Object ids, String outcome, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionOrder>> cancelOrders(Object ids, Object... optionalArgs)
    {
        return this.cancelOrders(ids, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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
    public CompletableFuture<PredictionOrder> createMarketBuyOrderWithCost(String outcome, Object cost, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            // safeBool, not this.options['...'] — a raw missing-key access throws KeyError in Python/PHP
            // when the option is undeclared (it is for every prediction exchange)
            if (Boolean.TRUE.equals(this.safeBool(this.options, "createMarketBuyOrderRequiresPrice", false)) || Boolean.TRUE.equals(this.safeBool(this.has, "createMarketBuyOrderWithCost", false)))
            {
                return (this.createOrder((Object)(outcome), "market", "buy", (Object)(cost), (Object)(1), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createMarketBuyOrderWithCost() is not supported yet")) ;
        }).thenApply(PredictionOrder::new);

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
    public CompletableFuture<PredictionOrder> createMarketBuyOrderWithCost(String outcome, Object cost, Object... optionalArgs)
    {
        return this.createMarketBuyOrderWithCost(outcome, cost, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
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
    public CompletableFuture<PredictionOrder> createMarketSellOrderWithCost(String outcome, Object cost, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            if (Boolean.TRUE.equals(this.safeBool(this.options, "createMarketSellOrderRequiresPrice", false)) || Boolean.TRUE.equals(this.safeBool(this.has, "createMarketSellOrderWithCost", false)))
            {
                return (this.createOrder((Object)(outcome), "market", "sell", (Object)(cost), (Object)(1), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createMarketSellOrderWithCost() is not supported yet")) ;
        }).thenApply(PredictionOrder::new);

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
    public CompletableFuture<PredictionOrder> createMarketSellOrderWithCost(String outcome, Object cost, Object... optionalArgs)
    {
        return this.createMarketSellOrderWithCost(outcome, cost, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    /**
     * @method
     * @name watchTickers
     * @description watches price tickers for multiple prediction outcomes
     * @param {string[]} [outcomes] unified outcome handles to watch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    public CompletableFuture<PredictionTickers> watchTickers(Object outcomes, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchTickers() is not supported yet")) ;
        }).thenApply(PredictionTickers::new);

    }
    /**
     * @method
     * @name watchTickers
     * @description watches price tickers for multiple prediction outcomes
     * @param {string[]} [outcomes] unified outcome handles to watch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    public CompletableFuture<PredictionTickers> watchTickers(Object... optionalArgs)
    {
        return this.watchTickers(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionOrder>> watchOrders(Object... optionalArgs)
    {
        return this.watchOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchMyTrades() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionTrade::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionTrade>> watchMyTrades(Object... optionalArgs)
    {
        return this.watchMyTrades(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
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
    public CompletableFuture<List<PredictionPosition>> watchPositions(Object outcomes, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " watchPositions() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionPosition::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionPosition>> watchPositions(Object... optionalArgs)
    {
        return this.watchPositions(optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchSettlements() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionSettlement::new).collect(Collectors.toList()));

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
    public CompletableFuture<List<PredictionSettlement>> fetchSettlements(Object... optionalArgs)
    {
        return this.fetchSettlements(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }

    public Object safePredictionOrder(Map<String, Object> outcomeOrder, Object outcomeObj)
    {
        // build the prediction order directly (do NOT delegate to the crypto safeOrder, which injects
        // ~a dozen derivatives fields — stopPrice/triggerPrice/reduceOnly noise — the prediction type
        // never declares, and whose parseTrades post-filters embedded fills by `symbol`, dropping every
        // outcome-addressed row). prediction is always linear with a contract size of 1.
        Object amount = this.omitZero(this.safeString(outcomeOrder, "amount"));
        String filled = this.safeString(outcomeOrder, "filled");
        String remaining = this.safeString(outcomeOrder, "remaining");
        String cost = this.safeString(outcomeOrder, "cost");
        Object average = this.omitZero(this.safeString(outcomeOrder, "average"));
        String price = this.omitZero(this.safeString(outcomeOrder, "price"));
        String side = this.safeString(outcomeOrder, "side");
        String status = this.safeString(outcomeOrder, "status");
        Long lastTradeTimestamp = this.safeInteger(outcomeOrder, "lastTradeTimestamp");
        // parse embedded fills with the OUTCOME-aware parser (parseTrades would drop them on the symbol filter)
        List<Object> rawTrades = (List<Object>) this.safeList(outcomeOrder, "trades", new ArrayList<Object>(Arrays.asList()));
        Object trades = this.parsePredictionTrades(rawTrades, outcomeObj);
        Integer tradesLength = ((List<?>)trades).size();
        List<Object> feeList = new ArrayList<Object>(Arrays.asList());
        if (Helpers.isGreaterThan(tradesLength, 0))
        {
            if (java.util.Objects.equals(filled, null))
            {
                filled = "0";
            }
            if (java.util.Objects.equals(cost, null))
            {
                cost = "0";
            }
            for (var i = 0; Helpers.isLessThan(i, tradesLength); i++)
            {
                Object trade = (trades == null || i < 0 || i >= ((List<?>)trades).size() ? null : ((List<?>)trades).get(i));
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
                    } else if (Helpers.isGreaterThan(tradeTimestamp, lastTradeTimestamp))
                    {
                        lastTradeTimestamp = tradeTimestamp;
                    }
                }
                Map<String, Object> tradeFee = (Map<String, Object>) this.safeDict(trade, "fee");
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
            Object multiplyPrice = (((!java.util.Objects.equals(average, null)))) ? average : price;
            if (!java.util.Objects.equals(multiplyPrice, null))
            {
                cost = Precise.stringMul(filled, multiplyPrice);
            }
        }
        Object fee = this.safeDict(outcomeOrder, "fee");
        // own-line length reads so the regex transpiler emits count() (array), not strlen()
        Integer feeListLength = ((List<?>)feeList).size();
        if ((java.util.Objects.equals(fee, null)) && (Helpers.isGreaterThan(feeListLength, 0)))
        {
            Object reduced = this.reduceFeesByCurrency(feeList);
            Integer reducedLength = ((List<?>)reduced).size();
            if (Helpers.isGreaterThan(reducedLength, 0))
            {
                fee = (reduced == null || 0 >= ((List<?>)reduced).size() ? null : ((List<?>)reduced).get(0));
            }
        }
        // derive timeInForce/postOnly the same way the crypto safeOrder does (prediction has no
        // trigger orders, so the isTriggerOrSLTp guard collapses): a market order defaults to IOC
        String orderType = this.safeString(outcomeOrder, "type");
        String timeInForce = this.safeString(outcomeOrder, "timeInForce");
        Object postOnly = this.safeBool(outcomeOrder, "postOnly");
        if (java.util.Objects.equals(timeInForce, null))
        {
            if (java.util.Objects.equals(orderType, "market"))
            {
                timeInForce = "IOC";
            }
            if (java.util.Objects.equals(postOnly, true))
            {
                timeInForce = "PO";
            }
        } else if (java.util.Objects.equals(postOnly, null))
        {
            postOnly = (java.util.Objects.equals(timeInForce, "PO"));
        }
        Long timestamp = this.safeInteger(outcomeOrder, "timestamp");
        String datetime = this.safeString(outcomeOrder, "datetime");
        if (java.util.Objects.equals(datetime, null))
        {
            datetime = this.iso8601(timestamp);
        }
        final Object finalDatetime = datetime;
        final Object finalLastTradeTimestamp = lastTradeTimestamp;
        final Object finalOrderType = orderType;
        final Object finalTimeInForce = timeInForce;
        final Object finalSide = side;
        final Object finalAverage = average;
        final Object finalAmount = amount;
        final Object finalFilled = filled;
        final Object finalRemaining = remaining;
        final Object finalCost = cost;
        final Object finalFee = fee;
        final Object finalPostOnly = postOnly;
        Map<String, Object> result = new HashMap<String, Object>() {{
            put( "id", PredictionExchange.this.safeString(outcomeOrder, "id") );
            put( "clientOrderId", PredictionExchange.this.safeString(outcomeOrder, "clientOrderId") );
            put( "timestamp", timestamp );
            put( "datetime", finalDatetime );
            put( "lastTradeTimestamp", finalLastTradeTimestamp );
            put( "lastUpdateTimestamp", PredictionExchange.this.safeInteger(outcomeOrder, "lastUpdateTimestamp") );
            put( "status", status );
            put( "type", finalOrderType );
            put( "timeInForce", finalTimeInForce );
            put( "side", finalSide );
            put( "price", PredictionExchange.this.parseNumber(price) );
            put( "average", PredictionExchange.this.parseNumber(finalAverage) );
            put( "amount", PredictionExchange.this.parseNumber(finalAmount) );
            put( "filled", PredictionExchange.this.parseNumber(finalFilled) );
            put( "remaining", PredictionExchange.this.parseNumber(finalRemaining) );
            put( "cost", PredictionExchange.this.parseNumber(finalCost) );
            put( "fee", finalFee );
            put( "reduceOnly", PredictionExchange.this.safeBool(outcomeOrder, "reduceOnly") );
            put( "postOnly", finalPostOnly );
            put( "trades", trades );
            put( "outcome", PredictionExchange.this.safeString(outcomeOrder, "outcome") );
            put( "outcomeId", PredictionExchange.this.safeString(outcomeOrder, "outcomeId") );
            put( "label", PredictionExchange.this.safeString(outcomeOrder, "label") );
            put( "market", PredictionExchange.this.safeString(outcomeOrder, "market") );
            put( "event", PredictionExchange.this.safeString(outcomeOrder, "event") );
            put( "info", PredictionExchange.this.safeValue(outcomeOrder, "info", outcomeOrder) );
        }};
        return result;
    }
    public Object safePredictionOrder(Map<String, Object> outcomeOrder, Object... optionalArgs)
    {
        return this.safePredictionOrder(outcomeOrder, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null);
    }

    public Object safePredictionTrade(Map<String, Object> trade, Object outcomeObj)
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
        final Object finalDatetime = datetime;
        final Object finalPrice = price;
        final Object finalAmount = amount;
        final Object finalCost = cost;
        Map<String, Object> result = new HashMap<String, Object>() {{
            put( "id", PredictionExchange.this.safeString(trade, "id") );
            put( "order", PredictionExchange.this.safeString(trade, "order") );
            put( "timestamp", timestamp );
            put( "datetime", finalDatetime );
            put( "type", PredictionExchange.this.safeString(trade, "type") );
            put( "side", PredictionExchange.this.safeString(trade, "side") );
            put( "takerOrMaker", PredictionExchange.this.safeString(trade, "takerOrMaker") );
            put( "price", PredictionExchange.this.parseNumber(finalPrice) );
            put( "amount", PredictionExchange.this.parseNumber(finalAmount) );
            put( "cost", PredictionExchange.this.parseNumber(finalCost) );
            put( "fee", PredictionExchange.this.safeDict(trade, "fee") );
            put( "realizedPnl", PredictionExchange.this.safeNumber(trade, "realizedPnl") );
            put( "outcome", PredictionExchange.this.safeString(trade, "outcome") );
            put( "outcomeId", PredictionExchange.this.safeString(trade, "outcomeId") );
            put( "label", PredictionExchange.this.safeString(trade, "label") );
            put( "market", PredictionExchange.this.safeString(trade, "market") );
            put( "info", PredictionExchange.this.safeValue(trade, "info", trade) );
        }};
        return result;
    }
    public Object safePredictionTrade(Map<String, Object> trade, Object... optionalArgs)
    {
        return this.safePredictionTrade(trade, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null);
    }

    public Object safePredictionTicker(Map<String, Object> ticker, Object outcomeObj)
    {
        // build the prediction ticker directly (no crypto safeTicker, which injects vwap/previousClose/
        // indexPrice/markPrice the type omits). derive change/percentage/average only from open+close —
        // prediction venues report those directly, so the crypto back-derivation from percentage is moot.
        String open = this.omitZero(this.safeString(ticker, "open"));
        String close = this.omitZero(this.safeString2(ticker, "close", "last"));
        String last = this.omitZero(this.safeString2(ticker, "last", "close"));
        String change = this.safeString(ticker, "change");
        Object percentage = this.omitZero(this.safeString(ticker, "percentage"));
        Object average = this.omitZero(this.safeString(ticker, "average"));
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
        final Object finalDatetime = datetime;
        final Object finalOpen = open;
        final Object finalClose = close;
        final Object finalChange = change;
        final Object finalPercentage = percentage;
        final Object finalAverage = average;
        Map<String, Object> result = new HashMap<String, Object>() {{
            put( "timestamp", timestamp );
            put( "datetime", finalDatetime );
            put( "high", PredictionExchange.this.safeNumber(ticker, "high") );
            put( "low", PredictionExchange.this.safeNumber(ticker, "low") );
            put( "bid", PredictionExchange.this.parseNumber(PredictionExchange.this.omitZero(PredictionExchange.this.safeString(ticker, "bid"))) );
            put( "bidVolume", PredictionExchange.this.safeNumber(ticker, "bidVolume") );
            put( "ask", PredictionExchange.this.parseNumber(PredictionExchange.this.omitZero(PredictionExchange.this.safeString(ticker, "ask"))) );
            put( "askVolume", PredictionExchange.this.safeNumber(ticker, "askVolume") );
            put( "open", PredictionExchange.this.parseNumber(finalOpen) );
            put( "close", PredictionExchange.this.parseNumber(finalClose) );
            put( "last", PredictionExchange.this.parseNumber(last) );
            put( "change", PredictionExchange.this.parseNumber(finalChange) );
            put( "percentage", PredictionExchange.this.parseNumber(finalPercentage) );
            put( "average", PredictionExchange.this.parseNumber(finalAverage) );
            put( "baseVolume", PredictionExchange.this.safeNumber(ticker, "baseVolume") );
            put( "quoteVolume", PredictionExchange.this.safeNumber(ticker, "quoteVolume") );
            put( "openInterest", PredictionExchange.this.safeNumber(ticker, "openInterest") );
            put( "outcome", PredictionExchange.this.safeString(ticker, "outcome") );
            put( "outcomeId", PredictionExchange.this.safeString(ticker, "outcomeId") );
            put( "label", PredictionExchange.this.safeString(ticker, "label") );
            put( "market", PredictionExchange.this.safeString(ticker, "market") );
            put( "event", PredictionExchange.this.safeString(ticker, "event") );
            put( "info", PredictionExchange.this.safeValue(ticker, "info", ticker) );
        }};
        return result;
    }
    public Object safePredictionTicker(Map<String, Object> ticker, Object... optionalArgs)
    {
        return this.safePredictionTicker(ticker, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null);
    }

    public Object safePredictionPosition(Map<String, Object> position)
    {
        // build the prediction position directly (no crypto safePosition, which carries the whole
        // leverage/marginMode/liquidation block the prediction type omits)
        Long timestamp = this.safeInteger(position, "timestamp");
        String datetime = this.safeString(position, "datetime");
        if (java.util.Objects.equals(datetime, null))
        {
            datetime = this.iso8601(timestamp);
        }
        final Object finalDatetime = datetime;
        Map<String, Object> result = new HashMap<String, Object>() {{
            put( "id", PredictionExchange.this.safeString(position, "id") );
            put( "timestamp", timestamp );
            put( "datetime", finalDatetime );
            put( "contracts", PredictionExchange.this.safeNumber(position, "contracts") );
            put( "contractSize", PredictionExchange.this.safeNumber(position, "contractSize") );
            put( "side", PredictionExchange.this.safeString(position, "side") );
            put( "notional", PredictionExchange.this.safeNumber(position, "notional") );
            put( "unrealizedPnl", PredictionExchange.this.safeNumber(position, "unrealizedPnl") );
            put( "realizedPnl", PredictionExchange.this.safeNumber(position, "realizedPnl") );
            put( "collateral", PredictionExchange.this.safeNumber(position, "collateral") );
            put( "entryPrice", PredictionExchange.this.safeNumber(position, "entryPrice") );
            put( "markPrice", PredictionExchange.this.safeNumber(position, "markPrice") );
            put( "lastPrice", PredictionExchange.this.safeNumber(position, "lastPrice") );
            put( "percentage", PredictionExchange.this.safeNumber(position, "percentage") );
            put( "resolved", PredictionExchange.this.safeBool(position, "resolved") );
            put( "won", PredictionExchange.this.safeBool(position, "won") );
            put( "settleFraction", PredictionExchange.this.safeNumber(position, "settleFraction") );
            put( "payout", PredictionExchange.this.safeNumber(position, "payout") );
            put( "outcome", PredictionExchange.this.safeString(position, "outcome") );
            put( "outcomeId", PredictionExchange.this.safeString(position, "outcomeId") );
            put( "label", PredictionExchange.this.safeString(position, "label") );
            put( "market", PredictionExchange.this.safeString(position, "market") );
            put( "event", PredictionExchange.this.safeString(position, "event") );
            put( "info", PredictionExchange.this.safeValue(position, "info", position) );
        }};
        return result;
    }

    public Object safePredictionOrderBook(Map<String, Object> orderbook, Object outcomeObj)
    {
        // normalize a parsed order book to the prediction shape: replace the unified
        // `symbol` with the `outcome` handle and attach the outcome identity fields
        // outcomeId and market - so books match the PredictionOrderBook structure.
        String fallback = this.safeString2(orderbook, "outcome", "symbol");
        orderbook.put("outcome", (((java.util.Objects.equals(outcomeObj, null)))) ? fallback : this.safeString(outcomeObj, "outcome", fallback));
        orderbook.put("outcomeId", (((java.util.Objects.equals(outcomeObj, null)))) ? this.safeString(orderbook, "outcomeId") : this.safeString(outcomeObj, "outcomeId"));
        orderbook.put("market", (((java.util.Objects.equals(outcomeObj, null)))) ? this.safeString(orderbook, "market") : this.safeString(outcomeObj, "market"));
        // omit (not delete) — `del dict['symbol']` raises KeyError in python/php when absent
        return this.omit(orderbook, "symbol");
    }
    public Object safePredictionOrderBook(Map<String, Object> orderbook, Object... optionalArgs)
    {
        return this.safePredictionOrderBook(orderbook, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null);
    }

    public Map<String, Object> parsePredictionTicker(Map<String, Object> ticker, Map<String, Object> market)
    {
        throw new NotSupported((this.id + " parsePredictionTicker() is not supported yet")) ;
    }
    public Map<String, Object> parsePredictionTicker(Map<String, Object> ticker, Object... optionalArgs)
    {
        return this.parsePredictionTicker(ticker, Helpers.getArgMap(optionalArgs, 0, null));
    }

    public Object parsePredictionOrder(Map<String, Object> order, Map<String, Object> market)
    {
        throw new NotSupported((this.id + " parsePredictionOrder() is not supported yet")) ;
    }
    public Object parsePredictionOrder(Map<String, Object> order, Object... optionalArgs)
    {
        return this.parsePredictionOrder(order, Helpers.getArgMap(optionalArgs, 0, null));
    }

    public Object parsePredictionTrade(Map<String, Object> trade, Map<String, Object> market)
    {
        throw new NotSupported((this.id + " parsePredictionTrade() is not supported yet")) ;
    }
    public Object parsePredictionTrade(Map<String, Object> trade, Object... optionalArgs)
    {
        return this.parsePredictionTrade(trade, Helpers.getArgMap(optionalArgs, 0, null));
    }

    public Object parsePredictionPosition(Map<String, Object> position, Map<String, Object> market)
    {
        throw new NotSupported((this.id + " parsePredictionPosition() is not supported yet")) ;
    }
    public Object parsePredictionPosition(Map<String, Object> position, Object... optionalArgs)
    {
        return this.parsePredictionPosition(position, Helpers.getArgMap(optionalArgs, 0, null));
    }

    public Object parsePredictionOpenInterest(Map<String, Object> interest, Map<String, Object> market)
    {
        throw new NotSupported((this.id + " parsePredictionOpenInterest() is not supported yet")) ;
    }
    public Object parsePredictionOpenInterest(Map<String, Object> interest, Object... optionalArgs)
    {
        return this.parsePredictionOpenInterest(interest, Helpers.getArgMap(optionalArgs, 0, null));
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
    public Object parsePredictionTrades(Object trades, Object outcomeObj, Long since, Long limit, Map<String, Object> parameters)
    {
        // prediction-market analogue of the base parseTrades: the base aggregator post-filters
        // by the market's `symbol` key, but prediction structures carry an `outcome` handle
        // instead — and an outcome object rebuilt from cached markets may still hold a legacy
        // `symbol` key, which would silently drop every parsed row
        List<Object> rows = this.toArray(trades);
        List<Object> results = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < ((List<?>)rows).size(); i++)
        {
            Object parsed = this.parsePredictionTrade((Map<String, Object>) ((rows == null || i < 0 || i >= rows.size() ? null : rows.get(i))), outcomeObj);
            Map<String, Object> trade = this.extend(parsed, parameters);
            ((List<Object>)results).add(trade);
        }
        results = this.sortBy2(results, "timestamp", "id");
        String outcomeHandle = this.safeString(outcomeObj, "outcome");
        return this.filterByOutcomeSinceLimit(results, outcomeHandle, since, limit);
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
    public Object parsePredictionTrades(Object trades, Object... optionalArgs)
    {
        return this.parsePredictionTrades(trades, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
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
        for (var i = 0; i < ((List<?>)rows).size(); i++)
        {
            Object parsed = this.parsePredictionOrder((Map<String, Object>) ((rows == null || i < 0 || i >= rows.size() ? null : rows.get(i))), outcomeObj);
            Map<String, Object> order = this.extend(parsed, parameters);
            ((List<Object>)results).add(order);
        }
        results = this.sortBy(results, "timestamp");
        String outcomeHandle = this.safeString(outcomeObj, "outcome");
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
    public Object parsePredictionOrders(Object orders, Object... optionalArgs)
    {
        return this.parsePredictionOrders(orders, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
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
    public Object parsePredictionPositions(Object positions, Map<String, Object> parameters)
    {
        // prediction-market analogue of the base parsePositions, which resolves its `symbols`
        // argument through marketSymbols() and would throw BadSymbol on outcome handles.
        // venue-specific outcome filtering stays in the exchange (position identity differs
        // per venue: kalshi positions are market-level, polymarket ones are per token)
        List<Object> rows = this.toArray(positions);
        List<Object> results = new ArrayList<Object>(Arrays.asList());
        for (var i = 0; i < ((List<?>)rows).size(); i++)
        {
            Object parsed = this.parsePredictionPosition((Map<String, Object>) ((rows == null || i < 0 || i >= rows.size() ? null : rows.get(i))));
            Map<String, Object> position = this.extend(parsed, parameters);
            ((List<Object>)results).add(position);
        }
        return results;
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
    public Object parsePredictionPositions(Object positions, Object... optionalArgs)
    {
        return this.parsePredictionPositions(positions, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
    }

    public Object filterByOutcomeSinceLimit(Object array, String outcome, Long since, Long limit, Object tail)
    {
        return this.filterByValueSinceLimit(array, "outcome", outcome, since, limit, "timestamp", tail);
    }
    public Object filterByOutcomeSinceLimit(Object array, Object... optionalArgs)
    {
        return this.filterByOutcomeSinceLimit(array, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), optionalArgs != null && optionalArgs.length > 3 ? optionalArgs[3] : false);
    }

    public Object filterByOutcomesSinceLimit(Object array, Object outcomes, Long since, Long limit, Object tail)
    {
        List<Object> result = (List<Object>) this.filterByArray(array, "outcome", outcomes, false);
        return this.filterBySinceLimit(result, since, limit, "timestamp", tail);
    }
    public Object filterByOutcomesSinceLimit(Object array, Object... optionalArgs)
    {
        return this.filterByOutcomesSinceLimit(array, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), optionalArgs != null && optionalArgs.length > 3 ? optionalArgs[3] : false);
    }

    public Object amountToPredictionPrecision(String outcome, Object amount)
    {
        Map<String, Object> outcomeObj = this.outcome((String) (outcome));
        String marketSymbol = this.safeString(outcomeObj, "market");
        return this.amountToPrecision(marketSymbol, amount);
    }

    public Object priceToPredictionPrecision(String outcome, Object price)
    {
        Map<String, Object> outcomeObj = this.outcome((String) (outcome));
        String marketSymbol = this.safeString(outcomeObj, "market");
        return this.priceToPrecision(marketSymbol, price);
    }

    public String costToPredictionPrecision(String outcome, Object cost)
    {
        Map<String, Object> outcomeObj = this.outcome((String) (outcome));
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
    public Object padHexToEven(String hex)
    {
        if (java.util.Objects.equals(hex, null))
        {
            return "";
        }
        // prepend a nibble so the hex has an even number of characters (whole bytes)
        Integer hexLength = ((String)hex).length();
        if (!Helpers.isEqual(((((double) hexLength) % ((double) 2))), 0))
        {
            return ("0" + hex);
        }
        return hex;
    }

    public Object padHexAddress(String address)
    {
        if (java.util.Objects.equals(address, null))
        {
            return "";
        }
        // left-pads a 20-byte address to a 32-byte ABI word (24 leading zero bytes)
        Object stripped = this.remove0xPrefix(address);
        return Helpers.add("000000000000000000000000", stripped);
    }

    public Object rlpEncodeBytes(String hex)
    {
        if (java.util.Objects.equals(hex, null))
        {
            return "";
        }
        // RLP-encodes a single byte string (hex without 0x) per the Ethereum RLP spec
        Long byteLength = this.parseToInt(Helpers.divide(((String)hex).length(), 2));
        if ((byteLength != null && byteLength == 0))
        {
            return "80";
        }
        if (((byteLength != null && byteLength == 1)) && (Helpers.isLessThan(hex, "80")))
        {
            return hex;
        }
        if (Helpers.isLessThan(byteLength, 56))
        {
            return Helpers.add(this.intToBase16((128L + byteLength)), hex);
        }
        Object lengthHex = this.intToBase16(byteLength);
        lengthHex = this.padHexToEven((String) (lengthHex));
        Long lengthOfLength = this.parseToInt(Helpers.divide(((String)lengthHex).length(), 2));
        return Helpers.add(Helpers.add(this.intToBase16((183L + lengthOfLength)), lengthHex), hex);
    }

    public Object rlpEncodeList(Object items)
    {
        Object concatenated = "";
        for (var i = 0; i < ((List<?>)items).size(); i++)
        {
            concatenated = Helpers.add(concatenated, (items == null || i < 0 || i >= ((List<?>)items).size() ? null : ((List<?>)items).get(i)));
        }
        Long byteLength = this.parseToInt(Helpers.divide(((String)concatenated).length(), 2));
        if (Helpers.isLessThan(byteLength, 56))
        {
            return Helpers.add(this.intToBase16((192L + byteLength)), concatenated);
        }
        Object lengthHex = this.intToBase16(byteLength);
        lengthHex = this.padHexToEven((String) (lengthHex));
        Long lengthOfLength = this.parseToInt(Helpers.divide(((String)lengthHex).length(), 2));
        return Helpers.add(Helpers.add(this.intToBase16((247L + lengthOfLength)), lengthHex), concatenated);
    }

    public Object intToRlpHex(Object value)
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
        Object hex = this.intToBase16(value);
        hex = this.padHexToEven((String) (hex));
        return hex;
    }

    public Object hexToRlpBytes(String hexValue)
    {
        // a hex value (e.g. an RPC result) as minimal big-endian byte hex; leading zero bytes
        // are stripped and 0 becomes the empty byte string (RLP integer encoding)
        if (java.util.Objects.equals(hexValue, null))
        {
            return "";
        }
        Object h = this.remove0xPrefix(hexValue);
        Object start = 0;
        Integer total = Helpers.getArrayLength(h);
        while ((Helpers.isLessThan(start, total)) && (java.util.Objects.equals(Helpers.slice(h, start, Helpers.add(start, 1)), "0")))
        {
            start = Helpers.add(start, 1);
        }
        h = Helpers.slice(h, start, null);
        if (java.util.Objects.equals(h, ""))
        {
            return "";
        }
        h = this.padHexToEven((String) (h));
        return h;
    }

    // eslint-disable-next-line no-unused-vars
    public Object signEvmTransaction(Map<String, Object> tx, Object privateKey)
    {
        throw new NotSupported((this.id + " signEvmTransaction() must be overridden by the exchange")) ;
    }

    public CompletableFuture<Object> ethRpc(String rpcUrl, Object method, Object rpcParams)
    {

        return BaseExchange.supplyAsync(() -> {

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
        });

    }

    public CompletableFuture<Object> sendEvmTransaction(String rpcUrl, Object chainId, String fromAddress, String to, String value, String data, String gasLimit)
    {

        return BaseExchange.supplyAsync(() -> {

            Object nonce = (this.ethRpc((String) (rpcUrl), "eth_getTransactionCount", new ArrayList<Object>(Arrays.asList(fromAddress, "pending")))).join();
            Object gasPrice = (this.ethRpc((String) (rpcUrl), "eth_gasPrice", new ArrayList<Object>(Arrays.asList()))).join();
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
            Object signed = this.signEvmTransaction((Map<String, Object>) (tx), this.privateKey);
            return (this.ethRpc((String) (rpcUrl), "eth_sendRawTransaction", new ArrayList<Object>(Arrays.asList(signed)))).join();
        });

    }

    public CompletableFuture<Object> waitForTransactionReceipt(String rpcUrl, String txHash, Object timeout)
    {

        return BaseExchange.supplyAsync(() -> {

            Long start = this.milliseconds();
            while (Helpers.isLessThan(((this.milliseconds() - start)), timeout))
            {
                Object receipt = (this.ethRpc((String) (rpcUrl), "eth_getTransactionReceipt", new ArrayList<Object>(Arrays.asList(txHash)))).join();
                if ((!java.util.Objects.equals(receipt, null)) && (!java.util.Objects.equals(receipt, null)))
                {
                    return receipt;
                }
                (this.sleep(2000)).join();
            }
            throw new ExchangeError((((this.id + " transaction ") + txHash) + " not mined within timeout")) ;
        });

    }
    public CompletableFuture<Object> waitForTransactionReceipt(String rpcUrl, String txHash, Object... optionalArgs)
    {
        return this.waitForTransactionReceipt(rpcUrl, txHash, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : 60000);
    }

public CompletableFuture<PredictionOrder> editOrder(String id, String symbol, String type, String side, Object amount, Object price, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            (this.cancelOrder((Object)(id), (Object)(symbol))).join();
            return (this.createOrder((Object)(symbol), (String) (type), (String) (side), (Object)(amount), (Object)(price), (Object)(parameters))).join();
        }).thenApply(PredictionOrder::new);

    }
    public CompletableFuture<PredictionOrder> editOrder(String id, String symbol, String type, String side, Object... optionalArgs)
    {
        return this.editOrder(id, symbol, type, side, optionalArgs != null && optionalArgs.length > 0 ? optionalArgs[0] : null, optionalArgs != null && optionalArgs.length > 1 ? optionalArgs[1] : null, Helpers.getArgMap(optionalArgs, 2, new HashMap<String, Object>() {{}}));
    }










    public CompletableFuture<PredictionOrder> fetchOrder(Object id, String symbol, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchOrder() is not supported yet")) ;
        }).thenApply(PredictionOrder::new);

    }
    public CompletableFuture<PredictionOrder> fetchOrder(Object id, Object... optionalArgs)
    {
        return this.fetchOrder(id, Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
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
    /**
     * @method
     * @name fetchOrderWithClientOrderId
     * @description create a market order by providing the symbol, side and cost
     * @param {string} clientOrderId client order Id
     * @param {string} symbol unified symbol of the market to create an order in
     * @param {object} [params] extra parameters specific to the exchange API endpoint
     * @returns {object} an [order structure]{@link https://docs.ccxt.com/?id=order-structure}
     */






    public CompletableFuture<PredictionOrder> createMarketOrderWithCost(String symbol, String side, Object cost, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

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
            if ((!java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketOrderWithCost"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketOrderWithCost"), false)) || ((!java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketBuyOrderWithCost"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketBuyOrderWithCost"), false)) && (!java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketSellOrderWithCost"), null) && !java.util.Objects.equals(((Map<String, Object>)this.has).get("createMarketSellOrderWithCost"), false))))
            {
                return (this.createOrder((Object)(symbol), "market", (String) (side), (Object)(cost), (Object)(1), (Object)(parameters))).join();
            }
            throw new NotSupported((this.id + " createMarketOrderWithCost() is not supported yet")) ;
        }).thenApply(PredictionOrder::new);

    }
    public CompletableFuture<PredictionOrder> createMarketOrderWithCost(String symbol, String side, Object cost, Object... optionalArgs)
    {
        return this.createMarketOrderWithCost(symbol, side, cost, Helpers.getArgMap(optionalArgs, 0, new HashMap<String, Object>() {{}}));
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

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " cancelAllOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<PredictionOrder>> cancelAllOrders(Object... optionalArgs)
    {
        return this.cancelAllOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgMap(optionalArgs, 1, new HashMap<String, Object>() {{}}));
    }







    public CompletableFuture<List<PredictionOrder>> fetchCanceledOrders(String symbol, Long since, Long limit, Map<String, Object> parameters)
    {

        return BaseExchange.supplyAsync(() -> {

            throw new NotSupported((this.id + " fetchCanceledOrders() is not supported yet")) ;
        }).thenApply(res -> ((List<?>) res).stream().map(PredictionOrder::new).collect(Collectors.toList()));

    }
    public CompletableFuture<List<PredictionOrder>> fetchCanceledOrders(Object... optionalArgs)
    {
        return this.fetchCanceledOrders(Helpers.getArgString(optionalArgs, 0, null), Helpers.getArgLong(optionalArgs, 1, null), Helpers.getArgLong(optionalArgs, 2, null), Helpers.getArgMap(optionalArgs, 3, new HashMap<String, Object>() {{}}));
    }
}
