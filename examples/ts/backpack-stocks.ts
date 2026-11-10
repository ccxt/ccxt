// @NO_AUTO_TRANSPILE

import ccxt from '../../js/ccxt.js';

async function main () {
    const exchange = new ccxt.backpack ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'options': {
            'stock': true,
        },
    });
    const markets = await exchange.loadMarkets ();
    for (const market of Object.values (markets)) {
        console.log (market['symbol'], market['executionModel'] ?? 'venue');
    }
    const symbol = 'SPCX.US/USDC';
    const ticker = await exchange.fetchTicker (symbol);
    console.log (symbol, 'last', ticker['last']);
    const orderbook = await exchange.fetchOrderBook (symbol);
    console.log (symbol, 'best bid', orderbook['bids'][0], 'best ask', orderbook['asks'][0]);
    const order = await exchange.createOrder (symbol, 'limit', 'buy', 1, 100);
    console.log ('created', order['id'], order['status']);
    const canceled = await exchange.cancelOrder (order['id'], symbol);
    console.log ('canceled', canceled['id'], canceled['status']);
    const balance = await exchange.fetchBalance ();
    console.log ('stock holdings', balance['total']);
}

main ();
