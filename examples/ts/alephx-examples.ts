import ccxt from '../../js/ccxt.js';

// AUTO-TRANSPILE //

async function example () {
    const exchange = new ccxt.alephx ({
        // local
        'apiKey': 'API_KEY',
        'secret': 'SECRET',
        'proxyUrl': 'http://localhost:4000',
        'urls': {
            'api': {
                'rest': '',
            },
        },
        // remote
        // 'apiKey': 'API_KEY',
        // 'secret': 'SECRET',
    });

    exchange.verbose = true; // uncomment for debugging purposes if necessary
    // 1. createOrder
    const symbol = 'CLEO-ALEO';
    const type = 'limit';
    const side = 'buy';
    const amount = 0.1;
    const price = 1.1;
    const params = { 'timeInForce': 'gtc', 'idempotencyKey': exchange.uuid () };
    const newOrder = await exchange.createOrder (symbol, type, side, amount, price, params);
    console.log (newOrder);
    // 2. fetchOrders
    const orders = await exchange.fetchOrders ();
    console.log (orders);
    // 3. fetchOrder
    const getOrder = await exchange.fetchOrder (newOrder['id']);
    console.log (getOrder);
    // 4. cancelOrder
    const cancelOrder = await exchange.cancelOrder (newOrder['id']);
    console.log (cancelOrder);
    // 5. fetchMyTrades
    const trades = await exchange.fetchMyTrades ();
    console.log (trades);

}
await example ();
