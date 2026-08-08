```javascript
// @NO_AUTO_TRANSPILE



import ccxt from '../../js/ccxt.js';
import asTable from 'as-table';
import log from 'ololog';
import ansicolor from 'ansicolor';

// @ts-expect-error
ansicolor.nice

let printUsage = function () {
    log ('Usage: node', process.argv[1], ('symbol' as any).green)
}

;(async function main () {

    if (process.argv.length > 2) {

        let symbol = process.argv[2].toUpperCase ()

        for (let i = 0; i < ccxt.exchanges.length; i++) {

            let id = ccxt.exchanges[i]

            const exchange = new ccxt[id] ()
            if (exchange.has.fetchTicker) {

                try {

                    await exchange.loadMarkets ()

                    if (exchange.symbols.includes (symbol)) {

                        log ((id as any).green)

                        const ticker = await exchange.fetchTicker (symbol)

                        log.dim (ticker)

                        if (ticker['baseVolume'] && ticker['quoteVolume']) {

                            if (ticker['bid'] > 1) {

                                if (ticker['baseVolume'] > ticker['quoteVolume'])
                                log ((id as any).bright, ('baseVolume > quoteVolume ← !' as any).bright)

                            } else {

                                if (ticker['baseVolume'] < ticker['quoteVolume'])
                                    log ((id as any).bright, ('baseVolume < quoteVolume ← !' as any).bright)

                            }

                        }

                    } else {

                        log ((id as any).yellow)
                    }

                } catch (e) {

                    log.error ((id as any).red, e.toString ().red)
                }
            }
        }

    } else {

        printUsage ()
    }

    process.exit ()

}) ()
```
