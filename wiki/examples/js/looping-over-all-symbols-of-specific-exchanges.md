- [Looping Over All Symbols Of Specific Exchanges](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';
import asTable from 'as-table';
import ansicolor from 'ansicolor';
import ololog from 'ololog';

const log = ololog.configure ({ locate: false }), verbose   = process.argv.includes ('--verbose');

ansicolor.nice

//-----------------------------------------------------------------------------

;(async () => {

    const exchanges = [ 'bittrex', 'poloniex', 'hitbtc2' ]

    for (let exchangeId of exchanges) {

        // create the exchange instance
        const exchange = new ccxt[exchangeId] ()

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

        for (let symbol in exchange.markets) {

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

}) ()
 
```