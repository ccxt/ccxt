const ccxt = require ('../../../ccxt')

console.log ('CCXT Pro version:', ccxt.version)

async function main () {
     const exchange = new ccxt.pro.gateio ({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })
    await exchange.loadMarkets ()
    exchange.verbose = true
    while (true) {
        try {
            const response = await exchange.watchBalance ()
            console.log (new Date (), response)
        } catch (e) {
            console.log (e.constructor.name, e.message)
            await exchange.sleep (1000)
        }
    }
}

main ()
