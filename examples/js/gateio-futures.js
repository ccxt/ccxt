const ccxt = require ('../../ccxt');

//testnet
// const exchange = new ccxt.gateio ({
//     'apiKey': '39c98db8245cb3e7c2dc804fd4e3cfad',
//     'secret': '995bbde3d3ec4bc5bff51f45c14c1df5942e560e1ee3a14201edff258a488cdf',
//     'options': {
//         'defaultType': 'future',
//     },
// })

const exchange = new ccxt.gateio ({
    'apiKey': '9c0e5229f3e078b32d472094393977cc',
    'secret': 'a770943b223f514a4ea61c50fe3a09f25d543637b07dfc8631a714327ce20267',
    'password': '670667',
    'options': {
        'defaultType': 'future',
    },
})

;(async () => {
    // exchange.setSandboxMode (true)
    const markets = await exchange.loadMarkets ()

    exchange.verbose = true // uncomment for debugging purposes if necessary

    // Example 1: Creating and canceling a linear future (limit) order
    try {
        const symbol = 'LTC/USDT:USDT'
        const type = 'limit'
        const side = 'buy'
        const amount = 1
        const price = 55

        // placing an order
        const order = await exchange.createOrder (symbol, type, side, amount, price)
        console.log (order)

        // fetching open orders
        const openOrders = await exchange.fetchOpenOrders(symbol)
        console.log(openOrders)

        // canceling an order
        const cancel = await exchange.cancelOrder (order['id'], symbol)
        console.log (cancel)
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }

    // Example 2: Creating and canceling a inverse future (stop-limit) order with leverage
    try {
        const symbol = 'LTC/USDT:USDT'
        const type = 'limit'
        const side = 'buy'
        const amount = 1
        const price = 55

        const stopPrice = 40
        params = {
            'stopPrice': stopPrice,
        }
        // placing an order
        const order = await exchange.createOrder (symbol, type, side, amount, price, params)
        console.log (order)

        // canceling an order
        const cancel = await exchange.cancelOrder (order['id'], symbol)
        console.log (cancel)
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }

}) ()
