const ccxt = require ('../../ccxt');

const exchange = new ccxt.huobi ({
    'apiKey': 'ez2xc4vb6n-da8c4c7d-76cbde5b-7cc77',
    'secret': '03454cfd-cf15e71b-fe87eadf-16a79',
    'options': {
        'defaultType': 'futures',
    },
})

;(async () => {
    const markets = await exchange.loadMarkets ()

    // exchange.verbose = true // uncomment for debugging purposes if necessary

    // Example 1: Creating/cancelling a inverse future (limit) order 
    let symbol = 'ADA/USD:ADA-220121' // he last segment it's the date of expiration (can bee next week, next quarter,...) adjust it accordingly
    let type = 'limit'
    let side = 'buy'
    let offset= 'open'
    let clientOrderId = Math.floor (Math.random () * 10);
    let leverage = 1
    let amount = 1
    let price = 1 // 1 contract = 10 ADA = 10 usd in this case
    let params = {
        'offset': offset,
        'lever_rate': leverage,
        'client_order_id': clientOrderId
    }

    try {
        const order = await exchange.createOrder (symbol, type, side, amount, price, params)
        console.log (order)
        const cancel = await exchange.cancelOrder (order['id'], symbol)
        console.log (cancel)
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }

}) ()
