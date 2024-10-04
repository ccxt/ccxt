import ccxt from '../../js/ccxt.js';
// AUTO-TRANSPILE //
async function example() {
    const exchange = new ccxt.pro.alephx({
        'apiKey': 'API_KEY',
        'secret': 'SECRET',
        'urls': {
            'api': {
                'ws': 'ws://localhost:4000/websocket',
            },
        },
    });
    exchange.verbose = true;
    while (true) {
        await exchange.loadHttpProxyAgent();
        const trades = await exchange.watchMyTrades();
        for (const [key, value] of Object.entries(trades)) {
            console.log(key, value);
        }
        // const orders = await exchange.watchOrders ();
        // for (const [key, value] of Object.entries(orders)) {
        //     console.log(key, value);
        //   }
    }
}
await example();
