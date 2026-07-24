import ccxt from '../../../js/ccxt.js';
// AUTO-TRANSPILE //
async function primeDirectOutcomeForFastFetchTrades(exchange, outcomeId) {
    const isNo = outcomeId.slice(-3) === '-NO';
    const baseTicker = isNo ? outcomeId.slice(0, -3) : outcomeId;
    const singleResponse = await exchange.kalshiPublicGetMarketsTicker({ 'ticker': baseTicker });
    const rawMarket = singleResponse?.market || singleResponse;
    const parsedMarket = exchange.parseMarket(rawMarket);
    // Seed minimal caches so fetchTrades() can keep using loadMarkets()+checkEventsAndMarkets()
    // without triggering full market pagination.
    exchange.markets = {
        [parsedMarket['symbol']]: parsedMarket,
    };
    exchange.markets_by_id = undefined;
    const eventTicker = rawMarket?.event_ticker || baseTicker;
    exchange.events = {
        [eventTicker]: {
            'id': eventTicker,
            'slug': eventTicker,
            'markets': [parsedMarket],
        },
    };
}
async function example() {
    const exchange = new ccxt.prediction.kalshi();
    // Direct path: if you already know the exact ticker/outcome ID, use it first.
    // Can be overridden from CLI:
    // tsx examples/ts/kalshi-fetch-trades.ts KXBNB15M-26APR040245-45
    const directOutcomeId = process.argv[2] || 'KXBNB15M-26APR040245-45';
    try {
        console.log('Trying direct outcome ID:', directOutcomeId);
        await primeDirectOutcomeForFastFetchTrades(exchange, directOutcomeId);
        const trades = await exchange.fetchTrades(directOutcomeId, undefined, 20);
        for (let i = 0; i < trades.length; i++) {
            const tradeOutcomeId = trades[i]['outcomeId'];
            if (tradeOutcomeId !== directOutcomeId) {
                throw new Error('Assertion failed: fetchTrades returned a trade for a different outcome. expected=' + directOutcomeId + ', got=' + tradeOutcomeId);
            }
        }
        console.log('Assertion passed: direct fetchTrades matches the requested outcomeId');
        console.log(trades);
        return;
    }
    catch (e) {
        const message = e?.message || String(e);
        console.log('Direct fetchTrades failed, falling back to fetchEvents scan:', message);
    }
    // Fallback path: event scan by prefix and multiple statuses.
    const query = directOutcomeId.split('-')[0];
    const statuses = ['open', 'closed', 'settled'];
    let events = [];
    for (let si = 0; si < statuses.length; si++) {
        events = await exchange.fetchEvents({ 'queries': [query], 'status': statuses[si] });
        if (events.length > 0) {
            console.log('Found events with status:', statuses[si]);
            break;
        }
    }
    if (events.length === 0) {
        console.log('No matching events found for query=' + query + ' across open/closed/settled statuses');
        return;
    }
    const candidateOutcomes = [];
    for (let ei = 0; ei < events.length; ei++) {
        const eventMarkets = events[ei]['markets'] || [];
        for (let mi = 0; mi < eventMarkets.length; mi++) {
            const marketOutcomes = eventMarkets[mi]['outcomes'] || [];
            for (let oi = 0; oi < marketOutcomes.length; oi++) {
                candidateOutcomes.push(marketOutcomes[oi]);
            }
        }
    }
    if (candidateOutcomes.length === 0) {
        console.log('No outcomes found in matched events');
        return;
    }
    for (let oi = 0; oi < candidateOutcomes.length; oi++) {
        const outcome = candidateOutcomes[oi];
        const outcomeId = outcome['id'];
        const expectedTicker = outcome['info']?.ticker;
        try {
            console.log('Trying outcome ID:', outcomeId);
            const trades = await exchange.fetchTrades(outcomeId, undefined, 20);
            for (let i = 0; i < trades.length; i++) {
                const tradeOutcomeId = trades[i]['outcomeId'];
                if (tradeOutcomeId !== outcomeId) {
                    throw new Error('Assertion failed: fetchTrades returned a trade for a different outcome. expected=' + outcomeId + ', got=' + tradeOutcomeId);
                }
                const tradeTicker = trades[i]['info']?.ticker || trades[i]['info']?.market_ticker;
                if (expectedTicker !== undefined && tradeTicker !== undefined && tradeTicker !== expectedTicker) {
                    throw new Error('Assertion failed: fetchTrades returned a trade for a different market ticker. expected=' + expectedTicker + ', got=' + tradeTicker);
                }
            }
            console.log('Assertion passed: all trades match the requested outcomeId and market ticker');
            console.log(trades);
            return;
        }
        catch (e) {
            const message = e?.message || String(e);
            if (message.indexOf('404') !== -1) {
                console.log('Skipping outcome due to 404:', outcomeId);
                continue;
            }
            throw e;
        }
    }
    console.log('No outcome returned trades successfully (all candidates failed with 404 or empty sources)');
}
await example();
