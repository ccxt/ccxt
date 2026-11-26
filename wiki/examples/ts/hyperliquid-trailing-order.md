```javascript
import ccxt from '../../js/ccxt.js';

async function example () {
    const exchange = new ccxt.hyperliquid ({
        'walletAddress': 'MY_WALLET_ADDRESS',
        'privateKey': 'MY_PRIVATE_KEY',
    });
    await exchange.loadMarkets ();
    const symbol = 'SOL/USDC:USDC';
    const order_type = 'market';
    const side = 'sell';
    const amount = 0.2;
    const price = undefined;
    const params = {
        'trailingPercent': 5,
        'trailingTriggerPrice': 100,
        'reduceOnly': true,
    };
    try {
        const order = await exchange.createOrder (symbol, order_type, side, amount, price, params);
        console.log (order);
        const openOrders = await exchange.fetchOpenOrders (symbol);
        console.log (openOrders);
        const canceled = await exchange.cancelOrder (order['id'], symbol);
        console.log (canceled);
    } catch (e) {
        console.log (e.toString ());
    }
}
await example ();

```
