'use strict';

const ccxt = require ('../../ccxt.js');

(async () => {

    const exchange = new ccxt.kraken ({
        'enableRateLimit': true,
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        // 'verbose': true,
    })

    const orders = await exchange.fetchClosedOrders ();

    for (let i = 0; i < orders.length; i++) {
        const order = await exchange.fetchOrder (orders[i]['id']);
        const trades = await exchange.fetchOrderTrades (order['id'], undefined, undefined, undefined, order);
        console.log (trades);
    }

    //
    // alternatively:
    //
    // const params = {
    //     'trades': [
    //         'TT5UC3-GOIRW-6AZZ6R',
    //         'TIY6G4-LKLAI-Y3GD4A',
    //         'T57FVC-OB4LN-Z55WUL',
    //         'TIMIRG-WUNNE-RRJ6GT',
    //     ]
    // }
    //
    // const trades = await exchange.fetchOrderTrades (order['id'], undefined, undefined, undefined, params);

}) ()
