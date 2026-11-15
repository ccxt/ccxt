import ccxt from '../../../js/ccxt.js';

async function example () {
    const exchange = new ccxt.prediction.hyperliquid ({
        'sandboxMode': true,  // outcome markets are on testnet
    });

    const events = await exchange.fetchEvents ({ 'queries': [ 'BTC' ] });

    const first = events[0];

    const firstOutcome = first.markets[0].outcomes[0].outcomeId;

    console.log (firstOutcome);

    const firstOrderBook = await exchange.fetchOrderBook (firstOutcome);
    console.log (firstOrderBook);
}
await example ();
