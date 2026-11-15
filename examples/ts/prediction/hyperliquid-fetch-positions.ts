import ccxt from '../../../js/ccxt.js';

async function example () {
    const exchange = new ccxt.prediction.hyperliquid ({
        'sandboxMode': true,
        'walletAddress': 'YOUR_WALLET_ADDRESS',
    });

    await exchange.loadMarkets ();
    const allPositions = await exchange.fetchPositions ();
    console.log ('all positions', allPositions);

    const outcomes = [ 'YOUR_OUTCOME_SYMBOL_OR_OUTCOME_ID' ];
    const filteredPositions = await exchange.fetchPositions (outcomes);
    console.log ('filtered positions', filteredPositions);
}
await example ();
