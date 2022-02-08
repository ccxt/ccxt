const ccxt = require ('../../ccxt');

const exchange = new ccxt.huobi ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'options': {
        'defaultType': 'future',
    },
})

;(async () => {
    const markets = await exchange.loadMarkets ()

    // exchange.verbose = true // uncomment for debugging purposes if necessary

    // Example 1: Creating/cancelling a linear future (limit) order 
    let symbol = 'ETH/USDT:USDT-220121' // the last segment it's the date of expiration (can bee next week, next quarter,...) adjust it accordingly
    let type = 'limit'
    let side = 'buy'
    let offset= 'open'
    let clientOrderId = Math.floor (Math.random () * 100);
    let leverage = 1
    let amount = 1
    let price = 1
    let params = {
        'offset': offset,
        'lever_rate': leverage,
        'client_order_id': clientOrderId
    }

    try {
        // Checking balance
        const balance = await exchange.fetchBalance()
        // console.log(balance)

        // Order creation
        const order = await exchange.createOrder (symbol, type, side, amount, price, params)
        console.log (order)

        // Check opened order
        const openOrders = await exchange.fetchOpenOrders(symbol)
        console.log(openOrders)

        // Order cancelation
        const cancel = await exchange.cancelOrder (order['id'], symbol)
        console.log (cancel)
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }

    // Example 2: Creating/cancelling a inverse future (limit) order 
    symbol = 'ADA/USD:ADA-220121' // he last segment it's the date of expiration (can bee next week, next quarter,...) adjust it accordingly
    type = 'limit'
    side = 'buy'
    offset= 'open'
    clientOrderId = Math.floor (Math.random () * 100);
    leverage = 1
    amount = 1
    price = 1 // 1 contract = 10 ADA = 10 usd in this case
    params = {
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
