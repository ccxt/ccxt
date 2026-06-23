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

public class PredictionExchange extends Exchange {
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

public Object isPrediction()
    {
        return this.safeBool(this.has, "prediction", false);
    }

    public void checkEvents(Object... optionalArgs)
    {
        // pure synchronous guard (no I/O) — callers invoke it without await, so leaving it
        // async would make the coroutine never run in Python/PHP and silently skip validation.
        // outcomes are the real dependency for resolving a symbol; they are populated by
        // fetchEvents and also rebuilt from cached markets (loadMarkets), so accept either.
        // rebuild lazily from cached markets here because the setMarkets override that
        // normally does it is not dispatched by the base loadMarkets under the AST languages.
        Object outcome = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isTrue(this.outcomes) || Helpers.isTrue(this.isEmpty(this.outcomes)))) && !Helpers.isTrue(this.isEmpty(this.markets))))
        {
            this.setOutcomesFromMarkets();
        }
        if (Helpers.isTrue(!Helpers.isTrue(this.outcomes) || Helpers.isTrue(this.isEmpty(this.outcomes))))
        {
            throw new ArgumentsRequired((String)"Outcomes are required to be loaded, please fetch them first using fetchEvents (or loadMarkets)") ;
        }
        if (Helpers.isTrue(!Helpers.isEqual(outcome, null)))
        {
            if (Helpers.isTrue(!Helpers.isTrue((Helpers.inOp(this.outcomes, outcome))) && !Helpers.isTrue((Helpers.inOp(this.outcomes_by_id, outcome)))))
            {
                throw new ArgumentsRequired((String)"The specified outcome is not valid/available, please fetch events and outcomes first using fetchEvents") ;
            }
        }
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

    public Object applyEventFetchParams(Object events, Object... optionalArgs)
    {
        // applies the unified fetchEvents options client-side (eventId/slug/status/searchIn/sort/limit)
        // so exchanges whose API can't filter natively still support them consistently
        Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
        Object queries = Helpers.getArg(optionalArgs, 1, null);
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
        if (Helpers.isTrue(Helpers.isTrue((!Helpers.isEqual(queries, null))) && Helpers.isTrue((Helpers.isGreaterThan(Helpers.getArrayLength(queries), 0)))))
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
            result = this.arraySlice(result, 0, limit);
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
        Object searchIn = Helpers.getArg(optionalArgs, 0, null);
        if (Helpers.isTrue(Helpers.isTrue(Helpers.isTrue((Helpers.isEqual(searchIn, null))) || Helpers.isTrue((Helpers.isEqual(queries, null)))) || Helpers.isTrue((Helpers.isEqual(Helpers.getArrayLength(queries), 0)))))
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
        this.events = new java.util.HashMap<String, Object>() {{}};
        this.events_by_slug = new java.util.HashMap<String, Object>() {{}};
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(events)); i++)
        {
            Object eventVar = Helpers.GetValue(events, i);
            Object id = this.safeString(eventVar, "id");
            Object slug = this.safeString(eventVar, "slug");
            if (Helpers.isTrue(!Helpers.isEqual(id, null)))
            {
                Helpers.addElementToObject(this.events, id, eventVar);
            }
            if (Helpers.isTrue(!Helpers.isEqual(slug, null)))
            {
                Helpers.addElementToObject(this.events_by_slug, slug, eventVar);
            }
        }
        return this.events;
    }

    public java.util.concurrent.CompletableFuture<Object> loadEventsHelper(Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

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

            Object reload = Helpers.getArg(optionalArgs, 0, false);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (this.loadEventsHelper(reload, parameters)).join();
        });

    }

    public Object outcome(Object outcomeSymbol)
    {
        if (Helpers.isTrue(Helpers.isEqual(this.outcomes, null)))
        {
            throw new ExchangeError((String)Helpers.add(this.id, " outcomes not loaded")) ;
        }
        if (Helpers.isTrue(Helpers.inOp(this.outcomes, outcomeSymbol)))
        {
            return Helpers.GetValue(this.outcomes, outcomeSymbol);
        }
        if (Helpers.isTrue(Helpers.inOp(this.outcomes_by_id, outcomeSymbol)))
        {
            return Helpers.GetValue(this.outcomes_by_id, outcomeSymbol);
        }
        throw new BadSymbol((String)Helpers.add(Helpers.add(this.id, " does not have outcome symbol "), outcomeSymbol)) ;
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
        return this.shortenSlug(marketSlug);
    }

    public Object slugToOutcomeSymbol(Object eventSlug, Object marketSlug, Object outcome)
    {
        return Helpers.add(Helpers.add(this.shortenSlug(marketSlug), ":"), ((String)outcome).toUpperCase());
    }

    public Object slugToMarketId(Object eventSlug, Object marketSlug, Object outcome)
    {
        return this.slugToOutcomeSymbol(eventSlug, marketSlug, outcome);
    }

    public Object setMarkets(Object markets, Object... optionalArgs)
    {
        Object currencies = Helpers.getArg(optionalArgs, 0, null);
        Object result = super.setMarkets(markets, currencies);
        this.setOutcomesFromMarkets();
        return result;
    }

    public void setOutcomesFromMarkets()
    {
        // prediction markets carry their outcome tokens under the outcomes key,
        // rebuild the outcome lookup caches so cached market data works offline.
        // normalize each outcome object to the canonical identity keys (outcome /
        // outcomeId / market) so consumers and the safe* helpers are uniform even when
        // an exchange's parseMarket still emits the legacy symbol / id / marketSymbol keys.
        this.outcomes = new java.util.HashMap<String, Object>() {{}};
        this.outcomes_by_id = new java.util.HashMap<String, Object>() {{}};
        Object marketKeys = Helpers.objectKeys(this.markets);
        for (var i = 0; Helpers.isLessThan(i, Helpers.getArrayLength(marketKeys)); i++)
        {
            Object market = Helpers.GetValue(this.markets, Helpers.GetValue(marketKeys, i));
            Object outcomesList = this.safeList(market, "outcomes", new java.util.ArrayList<Object>(java.util.Arrays.asList()));
            for (var j = 0; Helpers.isLessThan(j, Helpers.getArrayLength(outcomesList)); j++)
            {
                Object oc = Helpers.GetValue(outcomesList, j);
                Object ocSymbol = this.safeString2(oc, "outcome", "symbol");
                Object ocId = this.safeString2(oc, "outcomeId", "id");
                // assign unconditionally — safeString2 keeps the canonical key when present
                // and falls back to the legacy one, so this never clobbers and avoids a
                // missing-key access (which throws in Python/PHP, unlike TS undefined)
                Helpers.addElementToObject(oc, "outcome", ocSymbol);
                Helpers.addElementToObject(oc, "outcomeId", ocId);
                Helpers.addElementToObject(oc, "market", this.safeString2(oc, "market", "marketSymbol"));
                if (Helpers.isTrue(!Helpers.isEqual(ocSymbol, null)))
                {
                    Helpers.addElementToObject(this.outcomes, ocSymbol, oc);
                }
                if (Helpers.isTrue(!Helpers.isEqual(ocId, null)))
                {
                    Helpers.addElementToObject(this.outcomes_by_id, ocId, oc);
                }
            }
        }
    }

    public java.util.concurrent.CompletableFuture<Object> fetchTicker(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (super.fetchTicker(outcome, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> fetchOrderBook(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (super.fetchOrderBook(outcome, limit, parameters)).join();
        });

    }

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

    public java.util.concurrent.CompletableFuture<Object> fetchTrades(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            return (super.fetchTrades(outcome, since, limit, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> createOrder(Object outcome, Object type, Object side, Object amount, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object price = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (super.createOrder(outcome, type, side, amount, price, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> cancelOrder(Object id, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object outcome = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (super.cancelOrder(id, outcome, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTicker(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object parameters = Helpers.getArg(optionalArgs, 0, new java.util.HashMap<String, Object>() {{}});
            return (super.watchTicker(outcome, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchOrderBook(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object limit = Helpers.getArg(optionalArgs, 0, null);
            Object parameters = Helpers.getArg(optionalArgs, 1, new java.util.HashMap<String, Object>() {{}});
            return (super.watchOrderBook(outcome, limit, parameters)).join();
        });

    }

    public java.util.concurrent.CompletableFuture<Object> watchTrades(Object outcome, Object... optionalArgs)
    {

        return java.util.concurrent.CompletableFuture.supplyAsync(() -> {

            Object since = Helpers.getArg(optionalArgs, 0, null);
            Object limit = Helpers.getArg(optionalArgs, 1, null);
            Object parameters = Helpers.getArg(optionalArgs, 2, new java.util.HashMap<String, Object>() {{}});
            return (super.watchTrades(outcome, since, limit, parameters)).join();
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
        // (outcomeId / market) so books match the PredictionOrderBook structure.
        Object outcomeObj = Helpers.getArg(optionalArgs, 0, null);
        Object fallback = this.safeString2(orderbook, "outcome", "symbol");
        Helpers.addElementToObject(orderbook, "outcome", ((Helpers.isTrue((Helpers.isEqual(outcomeObj, null))))) ? fallback : this.safeString(outcomeObj, "outcome", fallback));
        Helpers.addElementToObject(orderbook, "outcomeId", ((Helpers.isTrue((Helpers.isEqual(outcomeObj, null))))) ? this.safeString(orderbook, "outcomeId") : this.safeString(outcomeObj, "outcomeId"));
        Helpers.addElementToObject(orderbook, "market", ((Helpers.isTrue((Helpers.isEqual(outcomeObj, null))))) ? this.safeString(orderbook, "market") : this.safeString(outcomeObj, "market"));
        // omit (not delete) — `del dict['symbol']` raises KeyError in python/php when absent
        return this.omit(orderbook, "symbol");
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
}
