'use strict'

const ccxt = require ('../../ccxt.js')
    , path = require ('path')
    , { writeFile } = require ('fs').promises
    , options = {} // exchange defaults
    // ------------------------------------------------------------------------
    // path to your folder, for example '/myproject/markets' or 'C:/myproject/markets'
    , folder = '' // writes to current working directory if left empty
    // ------------------------------------------------------------------------
    // use a reasonable value for maxConcurrency to avoid network congestion
    // a burst of requests in a short period of time will cause
    // excessive competition for networking resources within the application
    , maxConcurrency = 7

async function main () {

    const allExchanges = ccxt.exchanges.map (id => {
            try {
                return new ccxt[id] (options)
            } catch (e) {
                console.log ('Failed to initialize', id, e.constructor.name)
            }
        }).filter (x => x)
        , allExchangesByIds = ccxt.indexBy (allExchanges, 'id')
        , exchangeIds = Object.keys (allExchangesByIds)

    const load = async () => {
        while (exchangeIds.length > 0) {
            const id = exchangeIds.pop ()
            const exchange = allExchangesByIds[id]
            const file = path.join (folder, `saved-markets-${exchange.id}.json`)
            try {
                await exchange.loadMarkets ()
                const { id, markets } = exchange
                await writeFile (file, JSON.stringify ({ id, markets }))
                console.log ('Loaded markets from', id, 'to', file)
            } catch (e) {
                console.log ('Failed to load markets from', id, 'to', file, e.constructor.name)
            }
        }
    }

    const started = ccxt.milliseconds ()
    const loaders = Array (maxConcurrency).fill ().map (x => load ())
    await Promise.all (loaders)
    const stopped  = ccxt.milliseconds ()
    console.log ('Done loading', allExchanges.length, 'exchanges in', ((stopped - started) / 1000).toFixed (2), 'seconds')

    // other code...
}

main ()
