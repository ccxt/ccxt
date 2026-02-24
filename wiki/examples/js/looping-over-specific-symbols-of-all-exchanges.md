- [Looping Over Specific Symbols Of All Exchanges](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';
import asTable from 'as-table';
import ololog from 'ololog';
import ansicolor from 'ansicolor';

const log       = ololog.configure ({ locate: false }), verbose   = process.argv.includes ('--verbose');

ansicolor.nice

//-----------------------------------------------------------------------------

;(async () => {

    const exchanges = {};
    const symbols = [ 'ETH/BTC', 'XRP/BTC', 'BTC/USDT' ]

    for (let symbol of symbols) {

        for (let exchangeId of ccxt.exchanges) {

            let exchange = undefined

            try { // try creating the exchange instance first and handle errors if any

                // check if we have created an instance of this exchange already

                exchange = exchanges[exchangeId]

                if (exchange === undefined) {

                    // create the exchange instance
                    exchange = new ccxt[exchangeId] ()
                }

                exchanges[exchangeId] = exchange // save it for later use

            } catch (e) {

                log.red ('Could not create exchange', exchangeId + ':', e.constructor.name, e.message)

                // uncomment the following line to interrupt program execution on error
                // or leave it commented out to do nothing

                // process.exit ()

            }

            if (exchange !== undefined) {

                // preload all markets first, as explained in the Manual:
                // https://github.com/ccxt/ccxt/wiki/Manual#loading-markets

                // add error/exception handling as required by the Manual:
                // https://github.com/ccxt/ccxt/wiki/Manual#error-handling

                try {

                    await exchange.loadMarkets ();

                } catch (e) {

                    log.red ('Could not load markets from', exchange.id + ':', e.constructor.name, e.message)
                    continue; // skip this exchange if markets failed to load

                }

                for (let symbol of symbols) {

                    console.log (exchange.id, symbol)

                    // add error/exception handling as required by the Manual:
                    // https://github.com/ccxt/ccxt/wiki/Manual#error-handling

                    try { // try fetching the ticker for a symbol existing with that exchange

                        const ticker = await exchange.fetchTicker (symbol)
                        log.green (ticker)

                    } catch (e) { // catch the error (if any) and handle it or ignore it

                        log.red ('Could not fetch', symbol, 'ticker from', exchange.id + ':', e.constructor.name, e.message)

                    }
                }
            }
        }
    }

}) ()
 
```