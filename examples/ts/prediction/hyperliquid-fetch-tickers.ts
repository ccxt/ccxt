import ccxt from '../../../js/ccxt.js';

async function example () {
    const exchange = new ccxt.prediction.hyperliquid ({
        'sandboxMode': true,  // outcome markets are on testnet
    });

    const events = await exchange.fetchEvents ({ 'queries': [ 'BTC' ] });

    const first = events[0];

    const firstOutcome = first.markets[0].outcomes[0].outcomeId;
    const secondOutcome = first.markets[0].outcomes[1].outcomeId;

    console.log (firstOutcome);
    console.log (secondOutcome);

    const tickers = await exchange.fetchTickers ([ firstOutcome, secondOutcome ]);
    console.log (tickers);
}
await example ();
