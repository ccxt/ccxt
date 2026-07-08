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

public class PredictionExchange extends BaseExchange {
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

    // METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT

public Object describe()
    {
        return this.deepExtend(super.describe(), new java.util.HashMap<String, Object>() {{
            put( "has", new java.util.HashMap<String, Object>() {{
                put( "prediction", true );
                put( "CORS", null );
                put( "spot", false );
                put( "margin", false );
                put( "swap", false );
                put( "future", false );
                put( "option", false );
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

    public Object parseSearchQueries(Object... optionalArgs)
    {
        // accepts either `query` (a single search string) or `queries` (a list of strings)
        Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        Object singleQuery = this.safeString(parameters, "query");
        if (Helpers.isTrue(!Helpers.isEqual(singleQuery, null)))
        {
            return new java.util.ArrayList<Object>(java.util.Arrays.asList(singleQuery));
        }
        return this.safeList(parameters, "queries", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
    }

    public Object requireEventQuery(Object... optionalArgs)
    {
        // fetchEvents must be scoped by at least one selector — an unfiltered call would page the
        // entire exchange. require one of query / queries / tags / eventId / slug
        Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        Object query = this.safeString(parameters, "query");
        Object queries = this.safeList(parameters, "queries", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Object tags = this.safeList(parameters, "tags", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Object eventId = this.safeString(parameters, "eventId");
        Object slug = this.safeString(parameters, "slug");
        Object queriesLength = Helpers.getArrayLength(queries);
        Object tagsLength = Helpers.getArrayLength(tags);
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(query, null))) && Helpers.isTrue((Helpers.isEqual(queriesLength, 0)))) && Helpers.isTrue((Helpers.isEqual(tagsLength, 0)))) && Helpers.isTrue((Helpers.isEqual(eventId, null)))) && Helpers.isTrue((Helpers.isEqual(slug, null)))))
        {
            throw new ArgumentsRequired((String)Helpers.add(this.id, " fetchEvents() requires at least one of query, queries, tags, eventId or slug to scope the search")) ;
        }
        return null;
    }

    public Object applyEventFetchParams(Object events, Object... optionalArgs)
    {
        // applies the unified fetchEvents options client-side (eventId/slug/status/searchIn/sort/limit)
        // so exchanges whose API can't filter natively still support them consistently.
        // every fetched event lands in the cache before filtering, so loadEvents()/event()
        // serve them later without another request
        Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        Object queries = Helpers.getArg(optionalArgs, 1, null);
        this.setEvents(events);
        Object result = events;
        Object eventId = this.safeString(parameters, "eventId");
        Object slug = this.safeString(parameters, "slug");
        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(eventId, null))) || Helpers.isTrue((!Helpers.isEqual(slug, null)))))
        {
            Object filtered = new java.util.ArrayList<Object>(java.util.Arrays.asList());
            for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(result)); i++)
            {
                Object eventVar = Helpers.GetValue(result, i);
                Object idMatch = Helpers.isTrue((!Helpers.isEqual(eventId, null))) && Helpers.isTrue((Helpers.isEqual(this.safeString(eventVar, "id"), eventId)));
                Object slugMatch = Helpers.isTrue((!Helpers.isEqual(slug, null))) && Helpers.isTrue((Helpers.isEqual(this.safeString(eventVar, "slug"), slug)));
                if (Helpers.isTrue(Helpers.isTrue(idMatch) || Helpers.isTrue(slugMatch)))
                {
                    ((java.util.List<Object>)filtered).add(eventVar);
                }
            }
            result = filtered;
        }
        result = this.filterEventsByStatus(result, this.safeString(parameters, "status"));
        result = this.filterEventsByTags(result, this.safeList(parameters, "tags"));
        // own-line length read so the regex transpiler treats `queries` as an array (count())
        // and not a string (strlen()); guard undefined since the default is undefined
        Object queriesLength = 0;
        if (Helpers.isTrue(!Helpers.isEqual(queries, null)))
        {
            queriesLength = Helpers.getArrayLength(queries);
        }
        if (Helpers.isTrue(Helpers.isGreaterThan(queriesLength, 0)))
        {
            result = this.filterEventsBySearchIn(result, queries, this.safeString(parameters, "searchIn"));
        }
        Object sort = this.safeString(parameters, "sort");
        if (Helpers.isTrue(!Helpers.isEqual(sort, null)))
        {
            Object sortKey = null;
            if (Helpers.isTrue(Helpers.isEqual(sort, "volume")))
            {
                sortKey = "volume";
            } else if (Helpers.isTrue(Helpers.isEqual(sort, "liquidity")))
            {
                sortKey = "liquidity";
            } else if (Helpers.isTrue(Helpers.isEqual(sort, "newest")))
            {
                sortKey = "created";
            }
            if (Helpers.isTrue(!Helpers.isEqual(sortKey, null)))
            {
                result = this.sortBy(result, sortKey, true, 0);
            }
        }
        Object limit = this.safeInteger(parameters, "limit");
        if (Helpers.isTrue(!Helpers.isEqual(limit, null)))
        {
            // clamp to the result length: arraySlice(x, 0, limit) with limit > length panics in Go
            // via reflect Slice, and throws in C#, unlike JS/Python which return the whole array
            Object resultLength = Helpers.getArrayLength(result);
            Object sliceEnd = limit;
            if (Helpers.isTrue(Helpers.isGreaterThan(sliceEnd, resultLength)))
            {
                sliceEnd = resultLength;
            }
            result = this.arraySlice(result, 0, sliceEnd);
        }
        return result;
    }

    public Object filterEventsByStatus(Object events, Object... optionalArgs)
    {
        // 'active' | 'inactive' | 'closed' | 'all' — 'inactive' and 'closed' are interchangeable
        Object status = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(status, null))) || Helpers.isTrue((Helpers.isEqual(status, "all")))))
        {
            return events;
        }
        Object wantActive = (Helpers.isEqual(status, "active"));
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(events)); i++)
        {
            Object eventVar = Helpers.GetValue(events, i);
            Object isActive = this.safeBool(eventVar, "active");
            // keep events whose status is unknown (already filtered server-side, no `active` field)
            if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(isActive, null))) || Helpers.isTrue((Helpers.isEqual(isActive, wantActive)))))
            {
                ((java.util.List<Object>)result).add(eventVar);
            }
        }
        return result;
    }

    public Object filterEventsBySearchIn(Object events, Object queries, Object... optionalArgs)
    {
        // keep events whose title and/or description contains one of the queries (searchIn defaults to 'both')
        // own-line length read so the regex transpiler uses count() (array) not strlen() (string)
        Object searchIn = Helpers.getArg(optionalArgs, 0, null);
        Object queriesLength = 0;
        if (Helpers.isTrue(!Helpers.isEqual(queries, null)))
        {
            queriesLength = Helpers.getArrayLength(queries);
        }
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(searchIn, null))) || Helpers.isTrue((Helpers.isEqual(queries, null)))) || Helpers.isTrue((Helpers.isEqual(queriesLength, 0)))))
        {
            return events;
        }
        Object checkTitle = Helpers.isTrue((Helpers.isEqual(searchIn, "title"))) || Helpers.isTrue((Helpers.isEqual(searchIn, "both")));
        Object checkDescription = Helpers.isTrue((Helpers.isEqual(searchIn, "description"))) || Helpers.isTrue((Helpers.isEqual(searchIn, "both")));
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(events)); i++)
        {
            Object eventVar = Helpers.GetValue(events, i);
            Object title = this.safeStringLower(eventVar, "title", "");
            Object description = this.safeStringLower(eventVar, "description", "");
            Object matched = false;
            for (var qi = 0; Helpers.isLessThan(qi, Helpers.getArrayLength(queries)); qi++)
            {
                Object q = ((String)Helpers.GetValue(queries, qi)).toLowerCase();
                if (Helpers.isTrue(Helpers.isTrue(checkTitle) && Helpers.isTrue((Helpers.isGreaterThanOrEqual(Helpers.getIndexOf(title, q), 0)))))
                {
                    matched = true;
                    break;
                }
                if (Helpers.isTrue(Helpers.isTrue(checkDescription) && Helpers.isTrue((Helpers.isGreaterThanOrEqual(Helpers.getIndexOf(description, q), 0)))))
                {
                    matched = true;
                    break;
                }
            }
            if (Helpers.isTrue(matched))
            {
                ((java.util.List<Object>)result).add(eventVar);
            }
        }
        return result;
    }

    public Object filterEventsByTags(Object events, Object... optionalArgs)
    {
        // keep events carrying one of the requested tags; tolerant to string tags and to
        // object tags ({ slug, title, ... }) since venues differ. no-op when no tags requested
        Object tags = Helpers.getArg(optionalArgs, 0, null);
        Object tagsLength = 0;
        if (Helpers.isTrue(!Helpers.isEqual(tags, null)))
        {
            tagsLength = Helpers.getArrayLength(tags);
        }
        if (Helpers.isTrue(Helpers.isEqual(tagsLength, 0)))
        {
            return events;
        }
        Object wanted = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(tags)); i++)
        {
            ((java.util.List<Object>)wanted).add(((String)Helpers.GetValue(tags, i)).toLowerCase());
        }
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(events)); i++)
        {
            Object eventVar = Helpers.GetValue(events, i);
            Object eventTags = this.safeList(eventVar, "tags", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
            Object matched = false;
            for (var ti = 0; Helpers.isLessThan(ti, Helpers.getArrayLength(eventTags)); ti++)
            {
                Object tag = Helpers.GetValue(eventTags, ti);
                Object tagLabel = null;
                if (Helpers.isTrue((tag instanceof String)))
                {
                    tagLabel = tag;
                } else
                {
                    tagLabel = this.safeString2(tag, "slug", "title");
                }
                if (Helpers.isTrue(!Helpers.isEqual(tagLabel, null)))
                {
                    Object tagLower = ((String)tagLabel).toLowerCase();
                    for (var wi = 0; Helpers.isLessThan(wi, Helpers.getArrayLength(wanted)); wi++)
                    {
                        if (Helpers.isTrue(Helpers.isGreaterThanOrEqual(Helpers.getIndexOf(tagLower, Helpers.GetValue(wanted, wi)), 0)))
                        {
                            matched = true;
                            break;
                        }
                    }
                }
                if (Helpers.isTrue(matched))
                {
                    break;
                }
            }
            if (Helpers.isTrue(matched))
            {
                ((java.util.List<Object>)result).add(eventVar);
            }
        }
        return result;
    }

    public java.util.concurrent.CompletableFuture<Object> fetchEvents(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchEvents() is not supported yet")) ;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchEvent(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchEvent() is not supported yet")) ;
        });

    }

    public Object setEvents(Object events)
    {
        // merge (not reset) so successive scoped fetchEvents calls accumulate into the cache.
        // index by the unified `event` handle too (that's the identifier every outcome's `event`
        // field carries), so getEvent (handle) resolves without each exchange hand-writing it
        if (Helpers.isTrue(Helpers.isEqual(this.events, null)))
        {
            this.events = new java.util.HashMap<String, Object>() {{}};
        }
        if (Helpers.isTrue(Helpers.isEqual(this.events_by_slug, null)))
        {
            this.events_by_slug = new java.util.HashMap<String, Object>() {{}};
        }
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(events)); i++)
        {
            Object eventVar = Helpers.GetValue(events, i);
            Object id = this.safeString(eventVar, "id");
            Object slug = this.safeString(eventVar, "slug");
            Object handle = this.safeString(eventVar, "event");
            if (Helpers.isTrue(!Helpers.isEqual(id, null)))
            {
                Helpers.addElementToObject(this.events, id, eventVar);
            }
            if (Helpers.isTrue(!Helpers.isEqual(handle, null)))
            {
                Helpers.addElementToObject(this.events, handle, eventVar);
            }
            if (Helpers.isTrue(!Helpers.isEqual(slug, null)))
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
        if (Helpers.isTrue(Helpers.isEqual(this.events, null)))
        {
            return new java.util.ArrayList<Object>(java.util.Arrays.asList());
        }
        Object result = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        Object seen = new java.util.HashMap<String, Object>() {{}};
        Object keys = Helpers.objectKeys(this.events);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(keys)); i++)
        {
            Object eventVar = Helpers.GetValue(this.events, Helpers.GetValue(keys, i));
            Object identity = this.safeString2(eventVar, "id", "event", Helpers.GetValue(keys, i));
            if (!Helpers.isTrue((Helpers.inOp(seen, identity))))
            {
                Helpers.addElementToObject(seen, identity, true);
                ((java.util.List<Object>)result).add(eventVar);
            }
        }
        return result;
    }

    public java.util.concurrent.CompletableFuture<Object> loadEventsHelper(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            // note: the cache-hit shortcut ignores params, so events fetched under one scope are
            // returned for a later differently-scoped call. events are scoped (unlike global
            // markets), so prefer fetchEvents (params) directly when you need a specific scope
            Object reload = Helpers.getArg(optionalArgs, 0, false);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(!Helpers.isTrue(reload) && Helpers.isTrue(this.events)))
            {
                return this.events;
            }
            Object events = (this.fetchEvents(parameters)).join();
            return this.setEvents(events);
        });

    }

    public java.util.concurrent.CompletableFuture<Object> loadEvents(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            // cached entry point mirroring loadMarkets. unlike loadMarkets there is no cross-call
            // promise coalescing: the promise-sharing idiom is not expressible in the transpiled
            // base, so two truly concurrent first calls may fetch twice (both land in the cache)
            Object reload = Helpers.getArg(optionalArgs, 0, false);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.loadEventsHelper(reload, parameters)).join();
        });

    }

    public Object getEvent(Object eventIdOrSlug)
    {
        // cache-only event resolver (the event analogue of this.outcome) - the cache fills
        // through fetchEvents; this never fetches
        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(this.events, null))) && Helpers.isTrue((Helpers.inOp(this.events, eventIdOrSlug)))))
        {
            return Helpers.GetValue(this.events, eventIdOrSlug);
        }
        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(this.events_by_slug, null))) && Helpers.isTrue((Helpers.inOp(this.events_by_slug, eventIdOrSlug)))))
        {
            return Helpers.GetValue(this.events_by_slug, eventIdOrSlug);
        }
        throw new BadSymbol((String)Helpers.add(Helpers.add(Helpers.add(this.id, " has no cached event "), eventIdOrSlug), " - call fetchEvents ({ 'query': ... }) first")) ;
    }

    public Object outcome(Object outcomeSymbol)
    {
        if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(this.outcomes, null))) || Helpers.isTrue(this.isEmpty(this.outcomes))))
        {
            throw new ExchangeError((String)Helpers.add(this.id, " outcomes not loaded - call loadOutcomes () or an outcome-addressed method first")) ;
        }
        if (Helpers.isTrue(Helpers.inOp(this.outcomes, outcomeSymbol)))
        {
            return Helpers.GetValue(this.outcomes, outcomeSymbol);
        }
        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(this.outcomes_by_id, null))) && Helpers.isTrue((Helpers.inOp(this.outcomes_by_id, outcomeSymbol)))))
        {
            return Helpers.GetValue(this.outcomes_by_id, outcomeSymbol);
        }
        throw new BadSymbol((String)Helpers.add(Helpers.add(Helpers.add(this.id, " does not have outcome "), outcomeSymbol), " - pass a known outcome handle or outcomeId, or call fetchEvents ()/loadOutcomes () first")) ;
    }

    public Object safeOutcome(Object outcomeIdOrSymbol, Object... optionalArgs)
    {
        Object outcomeObj = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(!Helpers.isEqual(outcomeIdOrSymbol, null)))
        {
            if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(this.outcomes, null))) && Helpers.isTrue((Helpers.inOp(this.outcomes, outcomeIdOrSymbol)))))
            {
                return Helpers.GetValue(this.outcomes, outcomeIdOrSymbol);
            }
            if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(this.outcomes_by_id, null))) && Helpers.isTrue((Helpers.inOp(this.outcomes_by_id, outcomeIdOrSymbol)))))
            {
                return Helpers.GetValue(this.outcomes_by_id, outcomeIdOrSymbol);
            }
        }
        if (Helpers.isTrue(!Helpers.isEqual(outcomeObj, null)))
        {
            return outcomeObj;
        }
        final Object finalOutcomeIdOrSymbol = outcomeIdOrSymbol;
        return new java.util.HashMap<String, Object>() {{
            put( "outcome", finalOutcomeIdOrSymbol );
            put( "outcomeId", finalOutcomeIdOrSymbol );
            put( "market", null );
            put( "label", null );
            put( "event", null );
            put( "info", new java.util.HashMap<String, Object>() {{}} );
        }};
    }

    public Object safeOutcomeSymbol(Object outcomeIdOrSymbol, Object... optionalArgs)
    {
        Object outcomeObj = Helpers.getArg(optionalArgs, 0, null);
        outcomeObj = this.safeOutcome(outcomeIdOrSymbol, outcomeObj);
        return Helpers.GetValue(outcomeObj, "outcome");
    }

    public Object shortenSlug(Object slug)
    {
        Object replacements = new java.util.HashMap<String, Object>() {{
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
        Object stopWords = new java.util.ArrayList<Object>(java.util.Arrays.asList("will", "the", "a", "an", "after", "before", "in", "at", "by", "of", "there", "be", "to", "or", "and", "for", "on", "its", "that", "this", "from", "with", "as", "is", "are", "was", "were", "?", "how", "many", "who", "what", "when", "where", "which", "much"));
        Object lower = ((Helpers.isTrue((Helpers.isEqual(slug, null))))) ? "" : ((String)slug).toLowerCase();
        Object allowed = "abcdefghijklmnopqrstuvwxyz0123456789";
        Object chars = this.stringToCharsArray(lower);
        Object s = "";
        Object lastDash = true; // start true to drop leading separators
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(chars)); i++)
        {
            Object ch = Helpers.GetValue(chars, i);
            if (Helpers.isTrue(Helpers.isGreaterThanOrEqual(Helpers.getIndexOf(allowed, ch), 0)))
            {
                s = Helpers.add(s, ch);
                lastDash = false;
            } else if (!Helpers.isTrue(lastDash))
            {
                s = Helpers.add(s, "-");
                lastDash = true;
            }
        }
        Object replacementKeys = Helpers.objectKeys(replacements);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(replacementKeys)); i++)
        {
            Object replacementKey = Helpers.GetValue(replacementKeys, i);
            Object replacementValue = this.safeString(replacements, replacementKey);
            s = Helpers.replaceAll((String)s, (String)replacementKey, (String)replacementValue);
        }
        Object rawParts = Helpers.split(s, "-");
        Object parts = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(rawParts)); i++)
        {
            Object w = Helpers.GetValue(rawParts, i);
            if (Helpers.isTrue(Helpers.isTrue(Helpers.isGreaterThan(((String)w).length(), 0)) && !Helpers.isTrue(this.inArray(w, stopWords))))
            {
                ((java.util.List<Object>)parts).add(w);
            }
        }
        Object joined = String.join((String)"_", (java.util.List<String>)parts);
        return ((String)joined).toUpperCase();
    }

    public Object slugToMarketSymbol(Object eventSlug, Object marketSlug)
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
        Object marketPart = this.shortenSlug(marketSlug);
        Object eventPart = this.shortenSlug(eventSlug);
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(eventPart, null))) || Helpers.isTrue((Helpers.isEqual(eventPart, "")))) || Helpers.isTrue((Helpers.isEqual(eventPart, marketPart)))))
        {
            return marketPart;
        }
        return Helpers.add(Helpers.add(eventPart, "_"), marketPart);
    }

    public Object slugToOutcomeSymbol(Object eventSlug, Object marketSlug, Object outcome)
    {
        // build on slugToMarketSymbol so the outcome handle stays consistent with the market symbol
        // — both event-qualified or both not — otherwise a qualified market + unqualified outcome mismatch
        return Helpers.add(Helpers.add(this.slugToMarketSymbol(eventSlug, marketSlug), ":"), ((String)outcome).toUpperCase());
    }

    public Object setMarkets(Object markets, Object... optionalArgs)
    {
        Object currencies = Helpers.getArg(optionalArgs, 0, null);
        Object result = super.setMarkets(markets, currencies);
        this.populateOutcomes();
        return result;
    }

    public void indexMarketOutcomes(Object market)
    {
        // index one market's outcome tokens into this.outcomes / this.outcomes_by_id,
        // normalizing each to the canonical identity keys (outcome / outcomeId / market) so
        // consumers and the safe* helpers stay uniform even when an exchange's parseMarket
        // still emits the legacy symbol / id / marketSymbol keys. used both by populateOutcomes
        // for a full rebuild and by on-demand single-market fetches (kalshi fetchOutcome), so a
        // cache miss doesn't force a full O(markets x outcomes) rebuild per new outcome
        if (Helpers.isTrue(Helpers.isEqual(this.outcomes, null)))
        {
            this.outcomes = new java.util.HashMap<String, Object>() {{}};
        }
        if (Helpers.isTrue(Helpers.isEqual(this.outcomes_by_id, null)))
        {
            this.outcomes_by_id = new java.util.HashMap<String, Object>() {{}};
        }
        Object outcomesList = this.safeList(market, "outcomes", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        for (var j = 0; Helpers.isLessThan(j, Helpers.getArrayLength(outcomesList)); j++)
        {
            Object oc = Helpers.GetValue(outcomesList, j);
            Object ocSymbol = this.safeString2(oc, "outcome", "symbol");
            Object ocId = this.safeString2(oc, "outcomeId", "id");
            // assign unconditionally — safeString2 keeps the canonical key when present
            // and falls back to the legacy one, so this never clobbers and avoids a
            // missing-key access that throws in Python/PHP, unlike TS undefined
            Helpers.addElementToObject(oc, "outcomeId", ocId);
            Helpers.addElementToObject(oc, "market", this.safeString2(oc, "market", "marketSymbol"));
            if (Helpers.isTrue(!Helpers.isEqual(ocSymbol, null)))
            {
                // shortenSlug is lossy, so two different markets can produce the same handle.
                // on a real collision of same handle but different outcomeId, disambiguate the
                // second one deterministically instead of silently overwriting the first —
                // trading the wrong market would otherwise be indistinguishable
                Object existing = this.safeValue(this.outcomes, ocSymbol);
                if (Helpers.isTrue(!Helpers.isEqual(existing, null)))
                {
                    Object existingId = this.safeString(existing, "outcomeId");
                    if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(existingId, null))) && Helpers.isTrue((!Helpers.isEqual(ocId, null)))) && Helpers.isTrue((!Helpers.isEqual(existingId, ocId)))))
                    {
                        Object idLen = ((String)ocId).length();
                        Object suffix = ocId;
                        if (Helpers.isTrue(Helpers.isGreaterThan(idLen, 6)))
                        {
                            suffix = Helpers.slice(ocId, Helpers.subtract(idLen, 6), null);
                        }
                        ocSymbol = Helpers.add(Helpers.add(ocSymbol, "_"), ((String)suffix).toUpperCase());
                    }
                }
                Helpers.addElementToObject(oc, "outcome", ocSymbol);
                Helpers.addElementToObject(this.outcomes, ocSymbol, oc);
            } else
            {
                Helpers.addElementToObject(oc, "outcome", ocSymbol);
            }
            if (Helpers.isTrue(!Helpers.isEqual(ocId, null)))
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
        this.outcomes = new java.util.HashMap<String, Object>() {{}};
        this.outcomes_by_id = new java.util.HashMap<String, Object>() {{}};
        if (Helpers.isTrue(Helpers.isEqual(this.markets, null)))
        {
            return;
        }
        Object marketKeys = Helpers.objectKeys(this.markets);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(marketKeys)); i++)
        {
            this.indexMarketOutcomes(Helpers.GetValue(this.markets, Helpers.GetValue(marketKeys, i)));
        }
    }

    public void indexEventOutcomes(Object eventVar)
    {
        // register a single event's markets into this.markets and rebuild the outcome cache so the
        // handles fetchEvent() returns resolve immediately in outcome-addressed methods (fetchTicker,
        // createOrder, ...). without this, on a cold instance or a loadAllOutcomes:false venue
        // such as kalshi, the returned handles are unusable — fetchTicker(ev.markets[0].outcomes[0].outcome)
        // BadSymbols because the outcome was never cached
        if (Helpers.isTrue(Helpers.isEqual(this.markets, null)))
        {
            this.markets = this.createSafeDictionary();
        }
        Object markets = this.safeList(eventVar, "markets", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
        Object marketsLength = Helpers.getArrayLength(markets);
        for (var i = 0; Helpers.isLessThan(i, marketsLength); i++)
        {
            Object m = Helpers.GetValue(markets, i);
            Object symbol = this.safeString(m, "symbol");
            if (Helpers.isTrue(!Helpers.isEqual(symbol, null)))
            {
                Helpers.addElementToObject(this.markets, symbol, m);
            }
        }
        this.populateOutcomes();
    }

    public java.util.concurrent.CompletableFuture<Object> loadOutcomes(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            // outcome-addressed methods (fetchTicker/createOrder/...) call this first, mirroring how
            // every regular ccxt method calls loadMarkets(). reload/params mirror loadMarkets: reload
            // true refetches and rebuilds. idempotent otherwise: once outcomes are populated (here, or
            // already by an explicit fetchEvents/loadMarkets), later calls no-op and return the cache.
            // loadMarkets() does the actual fetch; populateOutcomes() then rebuilds the lookup caches
            // from the loaded markets (the setMarkets override that normally does this is not dispatched
            // by the base loadMarkets under the Go/C#/Java transpilers).
            Object reload = Helpers.getArg(optionalArgs, 0, false);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isTrue(reload) && Helpers.isTrue((!Helpers.isEqual(this.outcomes, null)))) && !Helpers.isTrue(this.isEmpty(this.outcomes))))
            {
                return this.outcomes;
            }
            (this.loadMarkets(reload, parameters)).join();
            this.populateOutcomes();
            return this.outcomes;
        });

    }

    public java.util.concurrent.CompletableFuture<Object> loadOutcome(Object outcomeSymbol2)
    {
        final Object outcomeSymbol3 = outcomeSymbol2;
        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {
            Object outcomeSymbol = outcomeSymbol3;
            // resolve a single outcome — the per-outcome analogue of loadMarkets()+market(). a cache hit
            // returns at once. on a miss, options.loadAllOutcomes (default true) bulk-loads the whole set
            // once so later lookups are 0-network hits; exchanges with too many markets to bulk-load
            // kalshi sets it false and overrides fetchOutcome to fetch just the requested one on demand.
            if (Helpers.isTrue(!Helpers.isEqual(this.outcomes, null)))
            {
                if (Helpers.isTrue(Helpers.inOp(this.outcomes, outcomeSymbol)))
                {
                    return Helpers.GetValue(this.outcomes, outcomeSymbol);
                }
                if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(this.outcomes_by_id, null))) && Helpers.isTrue((Helpers.inOp(this.outcomes_by_id, outcomeSymbol)))))
                {
                    return Helpers.GetValue(this.outcomes_by_id, outcomeSymbol);
                }
            }
            Object wasWarm = Helpers.isTrue((!Helpers.isEqual(this.outcomes, null))) && !Helpers.isTrue(this.isEmpty(this.outcomes));
            // if markets are already loaded (offline-injected, or loaded by loadMarkets/fetchEvents)
            // but the outcome cache is cold, index them for free before hitting the network — this
            // makes cold-cache resolution consistent across languages regardless of loadAllOutcomes
            if (Helpers.isTrue(Helpers.isTrue(!Helpers.isTrue(wasWarm) && Helpers.isTrue((!Helpers.isEqual(this.markets, null)))) && !Helpers.isTrue(this.isEmpty(this.markets))))
            {
                this.populateOutcomes();
                if (Helpers.isTrue(!Helpers.isEqual(this.outcomes, null)))
                {
                    if (Helpers.isTrue(Helpers.inOp(this.outcomes, outcomeSymbol)))
                    {
                        return Helpers.GetValue(this.outcomes, outcomeSymbol);
                    }
                    if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(this.outcomes_by_id, null))) && Helpers.isTrue((Helpers.inOp(this.outcomes_by_id, outcomeSymbol)))))
                    {
                        return Helpers.GetValue(this.outcomes_by_id, outcomeSymbol);
                    }
                }
            }
            Object loadAll = this.safeBool(this.options, "loadAllOutcomes", true);
            if (Helpers.isTrue(Helpers.isTrue(loadAll) && !Helpers.isTrue(wasWarm)))
            {
                // a miss on a cold cache: bulk-load once so later lookups are 0-network hits.
                // a miss on an already-warm cache is authoritative — the outcome genuinely isn't
                // listed, so fall through to fetchOutcome (a real BadSymbol) rather than refetching
                // the whole listing (which would mask typos and clobber offline-injected markets)
                (this.loadOutcomes()).join();
                if (Helpers.isTrue(!Helpers.isEqual(this.outcomes, null)))
                {
                    if (Helpers.isTrue(Helpers.inOp(this.outcomes, outcomeSymbol)))
                    {
                        return Helpers.GetValue(this.outcomes, outcomeSymbol);
                    }
                    if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(this.outcomes_by_id, null))) && Helpers.isTrue((Helpers.inOp(this.outcomes_by_id, outcomeSymbol)))))
                    {
                        return Helpers.GetValue(this.outcomes_by_id, outcomeSymbol);
                    }
                }
            }
            return (this.fetchOutcome(outcomeSymbol)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOutcome(Object outcomeSymbol)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            // fetch just one outcome on demand. the base has no generic single-outcome endpoint, so it
            // resolves from the already-loaded set (loadOutcomes() is a cached no-op once warmed, and
            // this throws BadSymbol if the outcome is absent); exchanges with a by-id market fetch (kalshi)
            // override this to fetch and cache only the requested outcome — the "always fetch one" path.
            (this.loadOutcomes()).join();
            return this.outcome(outcomeSymbol);
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
    public java.util.concurrent.CompletableFuture<Object> fetchTicker(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTicker() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> fetchOrderBook(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrderBook() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> fetchOHLCV(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object timeframe = Helpers.getArg(optionalArgs, 0, "1m");
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            return (super.fetchOHLCV(outcome, timeframe, since, limit, parameters)).join();
        });

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
    public java.util.concurrent.CompletableFuture<Object> fetchTrades(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTrades() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> createOrder(Object outcome, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createOrder() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> cancelOrder(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcome = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelOrder() is not supported yet")) ;
        });

    }

    /**
     * @method
     * @name watchTicker
     * @description watches a price ticker for a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [ticker structure](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    public java.util.concurrent.CompletableFuture<Object> watchTicker(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchTicker() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> watchOrderBook(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchOrderBook() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> watchTrades(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchTrades() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> fetchOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcome = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrders() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> fetchClosedOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcome = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchClosedOrders() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> fetchOrderTrades(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcome = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrderTrades() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> fetchMyTrades(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcome = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchMyTrades() is not supported yet")) ;
        });

    }

    /**
     * @method
     * @name fetchPosition
     * @description fetch the open position held on a single prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [position structure](https://docs.ccxt.com/#/?id=position-structure)
     */
    public java.util.concurrent.CompletableFuture<Object> fetchPosition(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPosition() is not supported yet")) ;
        });

    }

    /**
     * @method
     * @name fetchTradingFee
     * @description fetch the trading fee for a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a prediction [fee structure](https://docs.ccxt.com/#/?id=fee-structure)
     */
    public java.util.concurrent.CompletableFuture<Object> fetchTradingFee(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTradingFee() is not supported yet")) ;
        });

    }

    /**
     * @method
     * @name fetchOpenInterest
     * @description fetch the open interest of a prediction outcome
     * @param {string} outcome unified outcome handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} an [open interest structure](https://docs.ccxt.com/#/?id=open-interest-structure)
     */
    public java.util.concurrent.CompletableFuture<Object> fetchOpenInterest(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOpenInterest() is not supported yet")) ;
        });

    }

    /**
     * @method
     * @name createOrders
     * @description create a list of trade orders
     * @param {object[]} orders a list of PredictionOrderRequest objects, each carrying an `outcome` handle
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object[]} a list of prediction [order structures](https://docs.ccxt.com/#/?id=order-structure)
     */
    public java.util.concurrent.CompletableFuture<Object> createOrders(Object orders, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " createOrders() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> cancelOrders(Object ids, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcome = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelOrders() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> createMarketBuyOrderWithCost(Object outcome, Object cost, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            // safeBool, not this.options['...'] — a raw missing-key access throws KeyError in Python/PHP
            // when the option is undeclared (it is for every prediction exchange)
            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(this.safeBool(this.options, "createMarketBuyOrderRequiresPrice", false)) || Helpers.isTrue(this.safeBool(this.has, "createMarketBuyOrderWithCost", false))))
            {
                return (this.createOrder(outcome, "market", "buy", cost, 1, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createMarketBuyOrderWithCost() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> createMarketSellOrderWithCost(Object outcome, Object cost, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.isTrue(this.safeBool(this.options, "createMarketSellOrderRequiresPrice", false)) || Helpers.isTrue(this.safeBool(this.has, "createMarketSellOrderWithCost", false))))
            {
                return (this.createOrder(outcome, "market", "sell", cost, 1, parameters)).join();
            }
            throw new NotSupported((String)Helpers.add(this.id, " createMarketSellOrderWithCost() is not supported yet")) ;
        });

    }

    /**
     * @method
     * @name watchTickers
     * @description watches price tickers for multiple prediction outcomes
     * @param {string[]} [outcomes] unified outcome handles to watch
     * @param {object} [params] extra exchange-specific parameters
     * @returns {object} a dictionary of prediction [ticker structures](https://docs.ccxt.com/#/?id=ticker-structure)
     */
    public java.util.concurrent.CompletableFuture<Object> watchTickers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcomes = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchTickers() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> watchOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcome = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchOrders() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> watchMyTrades(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcome = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchMyTrades() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> watchPositions(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcomes = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " watchPositions() is not supported yet")) ;
        });

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
    public java.util.concurrent.CompletableFuture<Object> fetchSettlements(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcome = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchSettlements() is not supported yet")) ;
        });

    }

    public Object safePredictionOrder(Object order, Object... optionalArgs)
    {
        // the prediction identity is the `outcome` handle carried on the raw dict (read by
        // toPredictionStructure), not a ccxt `symbol`, so don't pass an outcome object as a market
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object parsed = super.safeOrder(order);
        return this.toPredictionStructure(parsed, order);
    }

    public Object safePredictionTrade(Object trade, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object parsed = super.safeTrade(trade);
        return this.toPredictionStructure(parsed, trade);
    }

    public Object safePredictionTicker(Object ticker, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        Object parsed = super.safeTicker(ticker);
        return this.toPredictionStructure(parsed, ticker);
    }

    public Object safePredictionPosition(Object position)
    {
        Object parsed = super.safePosition(position);
        return this.toPredictionStructure(parsed, position);
    }

    public Object safePredictionOrderBook(Object orderbook, Object... optionalArgs)
    {
        // normalize a parsed order book to the prediction shape: replace the unified
        // `symbol` with the `outcome` handle and attach the outcome identity fields
        // outcomeId and market - so books match the PredictionOrderBook structure.
        Object outcomeObj = Helpers.getArg(optionalArgs, 0, null);
        Object fallback = this.safeString2(orderbook, "outcome", "symbol");
        Helpers.addElementToObject(orderbook, "outcome", ((Helpers.isTrue((Helpers.isEqual(outcomeObj, null))))) ? fallback : this.safeString(outcomeObj, "outcome", fallback));
        Helpers.addElementToObject(orderbook, "outcomeId", ((Helpers.isTrue((Helpers.isEqual(outcomeObj, null))))) ? this.safeString(orderbook, "outcomeId") : this.safeString(outcomeObj, "outcomeId"));
        Helpers.addElementToObject(orderbook, "market", ((Helpers.isTrue((Helpers.isEqual(outcomeObj, null))))) ? this.safeString(orderbook, "market") : this.safeString(outcomeObj, "market"));
        // omit (not delete) — `del dict['symbol']` raises KeyError in python/php when absent
        return this.omit(orderbook, "symbol");
    }

    public Object parsePredictionTicker(Object ticker, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parsePredictionTicker() is not supported yet")) ;
    }

    public Object parsePredictionOrder(Object order, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parsePredictionOrder() is not supported yet")) ;
    }

    public Object parsePredictionTrade(Object trade, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parsePredictionTrade() is not supported yet")) ;
    }

    public Object parsePredictionPosition(Object position, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parsePredictionPosition() is not supported yet")) ;
    }

    public Object parsePredictionOpenInterest(Object interest, Object... optionalArgs)
    {
        Object market = Helpers.getArg(optionalArgs, 0, null);
        throw new NotSupported((String)Helpers.add(this.id, " parsePredictionOpenInterest() is not supported yet")) ;
    }

    public Object toPredictionStructure(Object parsed, Object raw)
    {
        // the prediction identity is the `outcome` handle (never the base `symbol`); attach it
        // and the other prediction fields (raw exchange id, label, parent market/event) that the
        // base safe* helpers drop. the exchange parser passes them on the raw input dict.
        Helpers.addElementToObject(parsed, "outcome", this.safeString(raw, "outcome"));
        Helpers.addElementToObject(parsed, "outcomeId", this.safeString(raw, "outcomeId"));
        Helpers.addElementToObject(parsed, "label", this.safeString(raw, "label"));
        Helpers.addElementToObject(parsed, "market", this.safeString(raw, "market"));
        Helpers.addElementToObject(parsed, "event", this.safeString(raw, "event"));
        // guard the delete: a bare `delete` is a no-op on a missing key in JS, but transpiles to
        // `del`/`unset` which raises in Python when the inherited `symbol` was never set
        if (Helpers.isTrue(Helpers.inOp(parsed, "symbol")))
        {
            ((java.util.Map<String,Object>)parsed).remove((String)"symbol");
        }
        return parsed;
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
        // prediction-market analogue of the base parseTrades: the base aggregator post-filters
        // by the market's `symbol` key, but prediction structures carry an `outcome` handle
        // instead — and an outcome object rebuilt from cached markets may still hold a legacy
        // `symbol` key, which would silently drop every parsed row
        Object outcomeObj = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
        Object rows = this.toArray(trades);
        Object results = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(rows)); i++)
        {
            Object parsed = this.parsePredictionTrade(Helpers.GetValue(rows, i), outcomeObj);
            Object trade = this.extend(parsed, parameters);
            ((java.util.List<Object>)results).add(trade);
        }
        results = this.sortBy2(results, "timestamp", "id");
        Object outcomeHandle = this.safeString(outcomeObj, "outcome");
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
        // prediction-market analogue of the base parseOrders — see parsePredictionTrades
        Object outcomeObj = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
        Object rows = this.toArray(orders);
        Object results = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(rows)); i++)
        {
            Object parsed = this.parsePredictionOrder(Helpers.GetValue(rows, i), outcomeObj);
            Object order = this.extend(parsed, parameters);
            ((java.util.List<Object>)results).add(order);
        }
        results = this.sortBy(results, "timestamp");
        Object outcomeHandle = this.safeString(outcomeObj, "outcome");
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
    public Object parsePredictionPositions(Object positions, Object... optionalArgs)
    {
        // prediction-market analogue of the base parsePositions, which resolves its `symbols`
        // argument through marketSymbols() and would throw BadSymbol on outcome handles.
        // venue-specific outcome filtering stays in the exchange (position identity differs
        // per venue: kalshi positions are market-level, polymarket ones are per token)
        Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        Object rows = this.toArray(positions);
        Object results = new java.util.ArrayList<Object>(java.util.Arrays.asList());
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(rows)); i++)
        {
            Object parsed = this.parsePredictionPosition(Helpers.GetValue(rows, i));
            Object position = this.extend(parsed, parameters);
            ((java.util.List<Object>)results).add(position);
        }
        return results;
    }

    public Object filterByOutcomeSinceLimit(Object array, Object... optionalArgs)
    {
        Object outcome = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object tail = Helpers.getArg(optionalArgs, 3, false);
        return this.filterByValueSinceLimit(array, "outcome", outcome, since, limit, "timestamp", tail);
    }

    public Object filterByOutcomesSinceLimit(Object array, Object... optionalArgs)
    {
        Object outcomes = Helpers.getArg(optionalArgs, 0, null);
        Object since = Helpers.getArg(optionalArgs, 1, null);
        Object limit = Helpers.getArg(optionalArgs, 2, null);
        Object tail = Helpers.getArg(optionalArgs, 3, false);
        Object result = this.filterByArray(array, "outcome", outcomes, false);
        return this.filterBySinceLimit(result, since, limit, "timestamp", tail);
    }

    public Object amountToPredictionPrecision(Object outcome, Object amount)
    {
        Object outcomeObj = this.outcome(outcome);
        Object marketSymbol = this.safeString(outcomeObj, "market");
        return this.amountToPrecision(marketSymbol, amount);
    }

    public Object priceToPredictionPrecision(Object outcome, Object price)
    {
        Object outcomeObj = this.outcome(outcome);
        Object marketSymbol = this.safeString(outcomeObj, "market");
        return this.priceToPrecision(marketSymbol, price);
    }

    public Object costToPredictionPrecision(Object outcome, Object cost)
    {
        Object outcomeObj = this.outcome(outcome);
        Object marketSymbol = this.safeString(outcomeObj, "market");
        return this.costToPrecision(marketSymbol, cost);
    }

    // ------------------------------------------------------------------------
    // shared EVM helpers — RLP encoding + a minimal JSON-RPC client + raw-tx
    // broadcast, used by the on-chain (EOA) trading paths of EVM prediction
    // venues (limitless, myriad). signEvmTransaction stays per-exchange because
    // it needs the noble crypto imports (keccak/ecdsa/secp256k1) which the
    // per-language prediction base skeletons don't carry; this base
    // sendEvmTransaction dispatches to the exchange's signEvmTransaction override
    public Object padHexToEven(Object hex)
    {
        // prepend a nibble so the hex has an even number of characters (whole bytes)
        Object hexLength = ((String)hex).length();
        if (Helpers.isTrue(!Helpers.isEqual((Helpers.mod(hexLength, 2)), 0)))
        {
            return Helpers.add("0", hex);
        }
        return hex;
    }

    public Object padHexAddress(Object address)
    {
        // left-pads a 20-byte address to a 32-byte ABI word (24 leading zero bytes)
        Object stripped = this.remove0xPrefix(address);
        return Helpers.add("000000000000000000000000", stripped);
    }

    public Object rlpEncodeBytes(Object hex)
    {
        // RLP-encodes a single byte string (hex without 0x) per the Ethereum RLP spec
        Object byteLength = this.parseToInt(Helpers.divide(((String)hex).length(), 2));
        if (Helpers.isTrue(Helpers.isEqual(byteLength, 0)))
        {
            return "80";
        }
        if (Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(byteLength, 1))) && Helpers.isTrue((Helpers.isLessThan(hex, "80")))))
        {
            return hex;
        }
        if (Helpers.isTrue(Helpers.isLessThan(byteLength, 56)))
        {
            return Helpers.add(this.intToBase16(Helpers.add(128, byteLength)), hex);
        }
        Object lengthHex = this.intToBase16(byteLength);
        lengthHex = this.padHexToEven(lengthHex);
        Object lengthOfLength = this.parseToInt(Helpers.divide(((String)lengthHex).length(), 2));
        return Helpers.add(Helpers.add(this.intToBase16(Helpers.add(183, lengthOfLength)), lengthHex), hex);
    }

    public Object rlpEncodeList(Object items)
    {
        Object concatenated = "";
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(items)); i++)
        {
            concatenated = Helpers.add(concatenated, Helpers.GetValue(items, i));
        }
        Object byteLength = this.parseToInt(Helpers.divide(((String)concatenated).length(), 2));
        if (Helpers.isTrue(Helpers.isLessThan(byteLength, 56)))
        {
            return Helpers.add(this.intToBase16(Helpers.add(192, byteLength)), concatenated);
        }
        Object lengthHex = this.intToBase16(byteLength);
        lengthHex = this.padHexToEven(lengthHex);
        Object lengthOfLength = this.parseToInt(Helpers.divide(((String)lengthHex).length(), 2));
        return Helpers.add(Helpers.add(this.intToBase16(Helpers.add(247, lengthOfLength)), lengthHex), concatenated);
    }

    public Object intToRlpHex(Object value)
    {
        // an integer as its minimal big-endian byte hex; 0 is the empty byte string
        if (Helpers.isTrue(Helpers.isEqual(value, 0)))
        {
            return "";
        }
        Object hex = this.intToBase16(value);
        hex = this.padHexToEven(hex);
        return hex;
    }

    public Object hexToRlpBytes(Object hexValue)
    {
        // a hex value (e.g. an RPC result) as minimal big-endian byte hex; leading zero bytes
        // are stripped and 0 becomes the empty byte string (RLP integer encoding)
        Object h = this.remove0xPrefix(hexValue);
        Object start = 0;
        Object total = Helpers.getArrayLength(h);
        while (Helpers.isTrue((Helpers.isLessThan(start, total))) && Helpers.isTrue((Helpers.isEqual(Helpers.slice(h, start, Helpers.add(start, 1)), "0"))))
        {
            start = Helpers.add(start, 1);
        }
        h = Helpers.slice(h, start, null);
        if (Helpers.isTrue(Helpers.isEqual(h, "")))
        {
            return "";
        }
        h = this.padHexToEven(h);
        return h;
    }

    // eslint-disable-next-line no-unused-vars
    public Object signEvmTransaction(Object tx, Object privateKey)
    {
        throw new NotSupported((String)Helpers.add(this.id, " signEvmTransaction() must be overridden by the exchange")) ;
    }

    public java.util.concurrent.CompletableFuture<Object> ethRpc(Object rpcUrl, Object method, Object rpcParams)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object payload = new java.util.HashMap<String, Object>() {{
                put( "jsonrpc", "2.0" );
                put( "id", 1 );
                put( "method", method );
                put( "params", rpcParams );
            }};
            Object headers = new java.util.HashMap<String, Object>() {{
                put( "Content-Type", "application/json" );
            }};
            Object response = (this.fetch(rpcUrl, "POST", headers, this.json(payload))).join();
            Object rpcError = this.safeValue(response, "error");
            if (Helpers.isTrue(!Helpers.isEqual(rpcError, null)))
            {
                throw new ExchangeError((String)Helpers.add(Helpers.add(Helpers.add(Helpers.add(this.id, " rpc "), method), " error: "), this.json(rpcError))) ;
            }
            // the result is either a hex string (nonce/gasPrice/txhash) or an object (receipt) —
            // safeString would coerce a receipt object to "[object Object]"
            return this.safeValue(response, "result");
        });

    }

    public java.util.concurrent.CompletableFuture<Object> sendEvmTransaction(Object rpcUrl, Object chainId, Object fromAddress, Object to, Object value, Object data, Object gasLimit)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object nonce = (this.ethRpc(rpcUrl, "eth_getTransactionCount", new java.util.ArrayList<Object>(java.util.Arrays.asList(fromAddress, "pending")))).join();
            Object gasPrice = (this.ethRpc(rpcUrl, "eth_gasPrice", new java.util.ArrayList<Object>(java.util.Arrays.asList()))).join();
            Object tx = new java.util.HashMap<String, Object>() {{
                put( "chainId", chainId );
                put( "nonce", nonce );
                put( "maxPriorityFeePerGas", gasPrice );
                put( "maxFeePerGas", gasPrice );
                put( "gasLimit", gasLimit );
                put( "to", to );
                put( "value", value );
                put( "data", data );
            }};
            Object signed = this.signEvmTransaction(tx, this.privateKey);
            return (this.ethRpc(rpcUrl, "eth_sendRawTransaction", new java.util.ArrayList<Object>(java.util.Arrays.asList(signed)))).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> waitForTransactionReceipt(Object rpcUrl, Object txHash, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object timeout = Helpers.getArg(optionalArgs, 0, 60000);
            Object start = this.milliseconds();
            while (Helpers.isLessThan((Helpers.subtract(this.milliseconds(), start)), timeout))
            {
                Object receipt = (this.ethRpc(rpcUrl, "eth_getTransactionReceipt", new java.util.ArrayList<Object>(java.util.Arrays.asList(txHash)))).join();
                if (Helpers.isTrue(receipt))
                {
                    return receipt;
                }
                (this.sleep(2000)).join();
            }
            throw new ExchangeError((String)Helpers.add(Helpers.add(Helpers.add(this.id, " transaction "), txHash), " not mined within timeout")) ;
        });

    }

public java.util.concurrent.CompletableFuture<Object> editOrder(Object id, Object symbol, Object type, Object side, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object amount = Helpers.getArg(optionalArgs, 0, null);
            Object price = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            (this.cancelOrder(id, symbol)).join();
            return (this.createOrder(symbol, type, side, amount, price, parameters)).join();
        });

    }





    public java.util.concurrent.CompletableFuture<Object> fetchPositions(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchPositions() is not supported yet")) ;
        });

    }



    public java.util.concurrent.CompletableFuture<Object> fetchTickers(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbols = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchTickers() is not supported yet")) ;
        });

    }


    public java.util.concurrent.CompletableFuture<Object> fetchOrder(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchOrder() is not supported yet")) ;
        });

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

    public java.util.concurrent.CompletableFuture<Object> cancelAllOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " cancelAllOrders() is not supported yet")) ;
        });

    }





    public java.util.concurrent.CompletableFuture<Object> fetchOpenOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            if (Helpers.isTrue(Helpers.GetValue(this.has, "fetchOrders")))
            {
                Object orders = (this.fetchOrders(symbol, since, limit, parameters)).join();
                return this.filterBy(orders, "status", "open");
            }
            throw new NotSupported((String)Helpers.add(this.id, " fetchOpenOrders() is not supported yet")) ;
        });

    }


    public java.util.concurrent.CompletableFuture<Object> fetchCanceledOrders(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object symbol = Helpers.getArg(optionalArgs, 0, null);
            Object since = Helpers.getArg(optionalArgs, 1, null);
            Object limit = Helpers.getArg(optionalArgs, 2, null);
            Object parameters = Helpers.getArg(optionalArgs, 3, new java.util.HashMap<String, Object>() {{}});
            throw new NotSupported((String)Helpers.add(this.id, " fetchCanceledOrders() is not supported yet")) ;
        });

    }
}
