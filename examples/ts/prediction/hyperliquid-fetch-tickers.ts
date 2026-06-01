import ccxt from '../../ts/ccxt.js';

async function example () {
    const exchange = new ccxt.hyperliquid ({
        'sandboxMode': true,  // outcome markets are on testnet
    });

    const events = await exchange.fetchEvents ([ 'BTC' ]);

    const first = events[0];

    const firstOutcome = first.markets[0].outcomes[0].id;
    const secondOutcome = first.markets[0].outcomes[1].id;

    console.log (firstOutcome);
    console.log (secondOutcome);

    const tickers = await exchange.fetchTickers ([ firstOutcome, secondOutcome ]);
    console.log (tickers);
}
await example ();
