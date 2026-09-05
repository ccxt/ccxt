import ccxt from '../../../js/ccxt.js';
async function example() {
    const exchange = new ccxt.prediction.hyperliquid({
        'sandboxMode': true, // outcome markets are on testnet
        'walletAddress': 'YOUR_WALLET_ADDRESS',
    });
    // fetch all trades (no outcome filter)
    const allTrades = await exchange.fetchMyTrades();
    console.log('all trades', allTrades);
    // fetch trades filtered by outcome symbol
    await exchange.loadMarkets(); // required before using outcome symbols
    const outcomeSymbol = 'YOUR_OUTCOME_SYMBOL_OR_OUTCOME_ID';
    const filteredTrades = await exchange.fetchMyTrades(outcomeSymbol);
    console.log('filtered trades', filteredTrades);
}
await example();
