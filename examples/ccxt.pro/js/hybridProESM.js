import ccxtpro from 'ccxt.pro';
import {gateio} from 'ccxt.pro';

const exchange = new gateio();

async function main () {
    const exchange = new gateio ({
        'apiKey': '9c0e5229f3e078b32d472094393977cc',
        'secret': 'a770943b223f514a4ea61c50fe3a09f25d543637b07dfc8631a714327ce20267',
    })
    await exchange.loadMarkets ()
    exchange.verbose = true
    while (true) {
        try {
            const response = await exchange.watchTicker ("BTC/USDT")
            console.log (new Date (), response)
        } catch (e) {
            console.log (e.constructor.name, e.message)
            await exchange.sleep (1000)
        }
    }
}

await main()