

import ccxt from '../../js/ccxt.js';

console.log ('CCXT Version:', ccxt.version)

async function main () {

    const exchange = new ccxt.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_API_SECRET',
        'options': {
            'defaultType': 'margin',
        },
    })

    const markets = await exchange.loadMarkets ()

    exchange.verbose = true // uncomment for debugging purposes if necessary

    const symbol = 'BTC/USDT'
    const type = 'STOP_LOSS_LIMIT'
    const side = 'buy'
    const amount = YOUR_AMOUNT_HERE
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
}

main ()
