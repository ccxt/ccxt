const ccxt = require ('../../ccxt');

const exchange = new ccxt.huobi ({
    'apiKey': 'ez2xc4vb6n-da8c4c7d-76cbde5b-7cc77',
    'secret': '03454cfd-cf15e71b-fe87eadf-16a79',
})

;(async () => {
    console.log (await exchange.fetchBalance ())

    const markets = await exchange.loadMarkets ()

    exchange.verbose = true // uncomment for debugging purposes if necessary

    const symbol = 'ADA/USD'
    const type = 'STOP_LOSS_LIMIT'
    const side = 'buy'
    const amount = 1
    const price = YOUR_PRICE_HERE
    const params = {
        'stopPrice': YOUR_STOP_PRICE_HERE,
        'timeInForce': 'GTC',
    }

    try {
        const order = await exchange.createOrder (symbol, type, side, amount, price, params)
        console.log (order)
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }
}) ()
