"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog')

require ('ansicolor').nice

let printUsage = function () {
    log ('Usage: node', process.argv[1], 'symbol'.green)
}

;(async function main () {

    if (process.argv.length > 2) {

        let symbol = process.argv[2].toUpperCase ()

        for (let i = 0; i < ccxt.exchanges.length; i++) {

            let id = ccxt.exchanges[i]

            const exchange = new ccxt[id] ()
            if (exchange.has.publicAPI) {

                try {

                    await exchange.loadMarkets ()

                    if (exchange.symbols.includes (symbol)) {

                        log (id.green)

                        const ticker = await exchange.fetchTicker (symbol)

                        log.dim (ticker)

                        if (ticker['baseVolume'] && ticker['quoteVolume']) {

                            if (ticker['bid'] > 1) {

                                if (ticker['baseVolume'] > ticker['quoteVolume'])
                                log (id.bright, 'baseVolume > quoteVolume ← !'.bright)

                            } else {

                                if (ticker['baseVolume'] < ticker['quoteVolume'])
                                    log (id.bright, 'baseVolume < quoteVolume ← !'.bright)

                            }

                        }

                    } else {

                        log (id.yellow)
                    }

                } catch (e) {

                    log.error (id.red, e.toString ().red)
                }
            }
        }

    } else {

        printUsage ()
    }

    process.exit ()

}) ()