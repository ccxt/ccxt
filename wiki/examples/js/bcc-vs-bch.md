- [Bcc Vs Bch](./examples/js/)


 ```javascript
 

import ccxt from '../../js/ccxt.js';
import asTable from 'as-table';
import ololog from 'ololog'
import config from '../../keys.json';
import ansicolor from 'ansicolor';

const log = ololog.configure ({ locate: false })

ansicolor.nice

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms))

let proxies = [
    '', // no proxy by default
    'https://crossorigin.me/',
    'https://cors-anywhere.herokuapp.com/',
]

;(async function main () {

    let ids = ccxt.exchanges
    let exchanges = {}

    // instantiate all exchanges
    ccxt.exchanges.forEach (id => {
        if (id in ccxt)
            exchanges[id] = new (ccxt)[id] ({
                verbose: false,
                substituteCommonCurrencyCodes: true,
            })
    })

    // set up api keys appropriately
    for (let id in config) {
        if (id in exchanges)
            for (let key in config[id])
                exchanges[id][key] = config[id][key]
    }

    log (ids.join (', ').yellow)

    // load all markets from all exchanges

    await Promise.all (ids.map (async id => {

        let exchange = exchanges[id]

        // basic round-robin proxy scheduler
        let currentProxy = 0
        let maxRetries   = proxies.length

        for (let numRetries = 0; numRetries < maxRetries; numRetries++) {

            try { // try to load exchange markets using current proxy

                exchange.proxy = proxies[currentProxy]
                await exchange.loadMarkets ()

            } catch (e) { // rotate proxies in case of connectivity errors, catch all other exceptions

                // swallow connectivity exceptions only
                if ((e instanceof ccxt.DDoSProtection) || e.message.includes ('ECONNRESET')) {
                    log.bright.yellow (exchange.id + ' [DDoS Protection]')
                } else if (e instanceof ccxt.RequestTimeout) {
                    log.bright.yellow (exchange.id + ' [Request Timeout] ' + e.message)
                } else if (e instanceof ccxt.AuthenticationError) {
                    log.bright.yellow (exchange.id + ' [Authentication Error] ' + e.message)
                } else if (e instanceof ccxt.ExchangeNotAvailable) {
                    log.bright.yellow (exchange.id + ' [Exchange Not Available] ' + e.message)
                } else if (e instanceof ccxt.ExchangeError) {
                    log.bright.yellow (exchange.id + ' [Exchange Error] ' + e.message)
                } else {
                    throw e; // rethrow all other exceptions
                }

                // retry next proxy in round-robin fashion in case of error
                currentProxy = ++currentProxy % proxies.length
            }
        }

        if (exchange.symbols)
            log (id.green, 'loaded', exchange.symbols.length.toString ().green, 'markets')

    }))

    log ('Loaded all markets'.green)

    let table = ccxt.exchanges.map (id => {
        console.log (id)
        let exchange = exchanges[id]
        if (exchange.currencies) {
            let hasBCC = exchange.currencies.includes ('BCC')
            let hasBCH = exchange.currencies.includes ('BCH')
            let hasBoth = (hasBCC && hasBCH)
            return {
                id,
                'BCC': hasBoth ? id.green : (hasBCC ? id.yellow : ''),
                'BCH': hasBCH ? id.green : '',
            }
        } else {
            return {
                'id': id.red,
                'BCC': '',
                'BCH': '',
            }
        }
    })

    log (asTable.configure ({ delimiter: ' | ' }) (table))

    process.exit ()

}) ()
 
```