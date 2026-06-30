import assert from 'assert';
import ccxt from '../../../ts/ccxt.js';

// AUTO-TRANSPILE //

async function testMyriadFetchOHLCV () {
    const exchange = new ccxt.prediction.myriad ();
    try {
        const events = await exchange.fetchEvents ({ 'queries': [ 'Trump' ], 'limit': 10 });
        assert (events.length > 0, 'No Myriad events found');

        const firstEventWithOutcomes = events.find ((event) =>
            (event.markets !== undefined) &&
            (event.markets.length > 0) &&
            (event.markets[0].outcomes !== undefined) &&
            (event.markets[0].outcomes.length > 0));

        assert (firstEventWithOutcomes !== undefined, 'No Myriad event with outcomes found');

        const market = firstEventWithOutcomes.markets[0];
        const outcome = market.outcomes[0];
        const outcomeSymbol = outcome.outcomeId;
        const timeframe = exchange.inArray ('1m', Object.keys (exchange.timeframes)) ? '1m' : Object.keys (exchange.timeframes)[0];

        const ohlcv = await exchange.fetchOHLCV (outcomeSymbol, timeframe, undefined, 10);
        assert (ohlcv.length > 0, 'Myriad fetchOHLCV returned an empty array');

        const candle = ohlcv[0];
        assert (candle.length >= 6, 'Invalid OHLCV candle shape');
        assert (typeof candle[0] === 'number', 'Invalid OHLCV timestamp type');

        console.log ('Myriad fetchOHLCV test passed');
        console.log ('event:', firstEventWithOutcomes.title || firstEventWithOutcomes.id);
        console.log ('outcome:', outcomeSymbol);
        console.log ('timeframe:', timeframe);
        console.log ('candles:', ohlcv.length);
        console.log ('first candle:', candle);
    } finally {
        await exchange.close ();
    }
}

await testMyriadFetchOHLCV ();
