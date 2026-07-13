import ccxt from '../../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const exchange = new ccxt.prediction.polymarket ();

    const events = await exchange.fetchEvents ({ 'queries': [ 'Trump' ] });

    if (events.length === 0) {
        console.log ('No matching events found');
        return;
    }

    const markets = events[0]['markets'] || [];
    if (markets.length === 0) {
        console.log ('No markets found for the first event');
        return;
    }

    const outcomes = markets[0]['outcomes'] || [];
    if (outcomes.length === 0) {
        console.log ('No outcomes found for the first market');
        return;
    }

    const outcomeId = outcomes[0]['outcomeId'];
    console.log ('Outcome ID:', outcomeId);

    const trades = await exchange.fetchTrades (outcomeId, undefined, 20);
    for (let i = 0; i < trades.length; i++) {
        const tradeOutcomeId = trades[i]['outcomeId'];
        if (tradeOutcomeId !== outcomeId) {
            throw new Error ('Assertion failed: fetchTrades returned trade for a different outcome. expected=' + outcomeId + ', got=' + tradeOutcomeId);
        }
    }
    console.log ('Assertion passed: all trades match the requested outcomeId');
    console.log (trades);
}
await example ();
