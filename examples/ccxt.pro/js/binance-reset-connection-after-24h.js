"use strict";

const ccxt = require ('../../../ccxt')

console.log ('CCXT Pro version:', ccxt.version)

async function main () {
     const exchange = new ccxt.pro.binance ({
        //'apiKey': 'YOUR_API_KEY',
        //'secret': 'YOUR_SECRET',
    })
    await exchange.loadMarkets ()
    // exchange.verbose = true  // Uncomment to debug
    exchange.options['resetConnectionInterval'] = 3000 // set in ms. 24 hours minus 5 minutes, set to 0 to turn off. Binance will close the connection after 24 hours

    while (true) {
        try {
            const response = await exchange.watchOHLCV ('BTC/USDT')
            console.log (new Date (), response)
        } catch (e) {
            if (e instanceof ccxt.ResetConnection) {
                console.log ('Reseting connection');
            }
            else {
                throw e
            }
        }
    }
}

main ()
