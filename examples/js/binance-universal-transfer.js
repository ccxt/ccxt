const ccxt = require ('../../ccxt.js')

;(async () => {

    // apiKey must have universal transfer permissions
    const binance = new ccxt.binance ({
        "apiKey": "",
        "secret": "",
    })

    console.log (await binance.transfer ('USDT', 1, 'spot', 'future'))
    const transfers = await binance.fetchTransfers ();
    console.log ('got ', transfers.length, ' transfers')
    console.log (await binance.transfer ('USDT', 1, 'spot', 'margin'))

    // binance requires from and to in the params
    console.log (await binance.fetchTransfers (undefined, undefined, { from: 'spot', to: 'margin' }))

    // alternatively the same effect as above
    console.log (await binance.fetchTransfers (undefined, undefined, { type: 'MAIN_MARGIN' })) // defaults to MAIN_UMFUTURE
}) ()
