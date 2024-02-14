- [Poloniex Limits Amount Min](./examples/js/)


 ```javascript
 import ccxt from '../../js/ccxt.js';
import fs from 'fs';
import ololog from 'ololog'

const log = ololog.configure.unlimited.noLocate,
      verbose = process.argv.includes ('--verbose'),
      keysGlobal = 'keys.json',
      keysLocal = 'keys.local.json',
      keysFile = fs.existsSync (keysLocal) ? keysLocal : (fs.existsSync (keysGlobal) ? keysGlobal : false),
      config = keysFile ? require ('../../' + keysFile) : {},
      exchange = new ccxt.poloniex (ccxt.extend ({
              enableRateLimit: true,
              verbose,
          }, config.poloniex || {}));(async () => {

    const test = async function (symbol) {

        try {

            await exchange.createOrder (symbol, 'limit', 'buy', 0, 0)

        } catch (e) {

            if (e instanceof ccxt.InvalidOrder) {

                const words = e.message.split (' ')
                let minAmount = parseFloat (words[words.length - 1])
                log.green ("'" + symbol + "': " + minAmount.toString () + ',')

            } else {

                throw e
            }
        }
    }

    await exchange.loadMarkets ()

    for (let i = 0; i < exchange.symbols.length; i++) {

        try {

            await test (exchange.symbols[i])

        } catch (e) {

            if (e instanceof ccxt.InvalidNonce) {

                log.yellow (e)

            } else {

                log.red (e)
                throw e
            }
        }


        await ccxt.sleep (5000) // sleep 5 seconds, no rush, safe delay
    }

}) () 
```