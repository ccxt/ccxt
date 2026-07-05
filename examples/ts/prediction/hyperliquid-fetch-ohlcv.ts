import ccxt from '../../../ts/ccxt.js';

async function example () {
    const exchange = new ccxt.prediction.hyperliquid ({
        'sandboxMode': true,  // outcome markets are on testnet
    });

    const events = await exchange.fetchEvents ({ 'queries': [ 'BTC' ] });

    const first = events[0];

    const firstOutcome = first.markets[0].outcomes[0].outcomeId;

    console.log (firstOutcome);

    await exchange.loadMarkets ();  // fetchOHLCV resolves the outcome against loaded markets
    const firstOHLCV = await exchange.fetchOHLCV (firstOutcome);
    console.log (firstOHLCV);
}
await example ();
