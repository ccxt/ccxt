import ccxt from '../../ts/ccxt.js';

async function example () {
    const exchange = new ccxt.hyperliquid ({
        'sandboxMode': true,  // outcome markets are on testnet
    });

    const events = await exchange.fetchEvents ([ 'BTC' ]);

    const first = events[0];

    const firstOutcome = first.markets[0].outcomes[0].id;

    console.log (firstOutcome);

    const firstOHLCV = await exchange.fetchOHLCV (firstOutcome);
    console.log (firstOHLCV);
}
await example ();
