import ccxt from '../../js/ccxt.js';

// Trade US stocks on InteractiveBrokers through the Client Portal Gateway. (you can alternatively use oauth 1.0 if your account allows it)
//
// Prerequisites:
// 1. download and run the client portal gateway locally
//    https://www.interactivebrokers.com/en/trading/ib-api.php#client-portal
// 2. log in at https://localhost:5000 (or any other port) in a browser (the session is reused by ccxt)

async function example () {
    const exchange = new ccxt.interactivebrokers ({
        'options': {
            'useGateway': true,
            'gatewayUrl': 'https://localhost:5001',
            'accountId': 'UXXXXX', // optional, defaults to the first account of the session
            'fetchMarkets': {
                'types': [ 'stock' ], // only load stocks (skip crypto/forex/futures) for a faster loadMarkets
                'exchanges': {
                    'STK': [ 'NASDAQ' ], // apple's primary listing venue (the default is NYSE)
                },
            },
        },
    });
    await exchange.loadMarkets ();
    const symbol = 'AAPL.NASDAQ/USD';
    const market = exchange.market (symbol);
    console.log ('Found', market['info']['name'], '— conid', market['id'], '— symbol', market['symbol']);
    const ticker = await exchange.fetchTicker (symbol);
    console.log (symbol, 'last:', ticker['last'], 'bid:', ticker['bid'], 'ask:', ticker['ask']);
    if (ticker['last'] === undefined) {
        throw new Error ('no last price available (market data subscription required?)');
    }
    // place a limit buy for 1 share, 5% below the last price so it rests on the book
    const amount = 1;
    const price = Number (exchange.priceToPrecision (symbol, ticker['last'] * 0.95));
    const order = await exchange.createOrder (symbol, 'limit', 'buy', amount, price);
    const orderId = order['id'] as string;
    console.log ('Placed order', orderId, order['status'], '-', order['side'], order['amount'], symbol, '@', order['price']);
    const fetched = await exchange.fetchOrder (orderId, symbol);
    console.log ('Order status:', fetched['status']);
}

await example ();
