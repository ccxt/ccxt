import ccxt from '../../ts/ccxt.js';

async function example () {
    const exchange = new ccxt.hyperliquid ({
        'sandboxMode': true, // outcome markets are on testnet
        'walletAddress': 'YOUR_WALLET_ADDRESS',
    });
    const balance = await exchange.fetchBalance ();
    console.log (balance);
}
await example ();
