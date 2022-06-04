const ccxt = require ('../../ccxt');


const exchange = new ccxt.gateio ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'options': {
        'defaultType': 'swap',
        'marginMode': 'cross'
    },
})


;(async () => {

    // exchange.setSandboxMode (true)
    
    const markets = await exchange.loadMarkets ()

    // exchange.verbose = true // uncomment for debugging purposes if necessary

    // Example: creating and closing a contract
    let symbol = 'LTC/USDT:USDT'
    let type = 'market'
    let side = 'buy'
    let amount = 1
    let price = undefined

    try {
        // fetching current balance
        const balance = await exchange.fetchBalance()
        console.log(balance)

        // placing an order / opening contract position
        const order = await exchange.createOrder (symbol, type, side, amount, price)
        console.log (order)

        // closing it by issuing an oposite contract 
        // and therefore close our previous position
        side = 'sell'
        type = 'market'
        reduce_only = true
        params = {'reduce_only': reduce_only}
        const opositeOrder = await exchange.createOrder (symbol, type, side, amount, price, params)
        console.log (opositeOrder)
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }
}) ()
