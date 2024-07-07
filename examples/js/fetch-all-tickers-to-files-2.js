import ccxt from '../../js/ccxt.js';
import { writeFileSync } from 'fs';
import path from 'path';

const enableRateLimit = true, exchanges = {}, tickers = {};


ccxt.exchanges.forEach (id => {
    try {
        const exchange = new ccxt[id] ()
        if (exchange.has['fetchTickers']) {
            exchanges[id] = exchange
        }
    } catch (e) {
        console.log ('Failed to initialize', id, e.constructor.name, e.message)
    }
})

async function main () {

    console.log ('Started')
    const start = Date.now ()

    try {
        const promises = Object.values (exchanges).map (exchange => (
            (async () => {
                console.log (exchange.id)
                try {
                    const response = await exchange.fetchTickers ()
                    tickers[exchange.id] = response
                } catch (e) {
                    console.log ('Failed to fetchTickers() from', exchange.id)
                }
            }) ()
        ))
        await Promise.all (promises)
    } catch (e) {
        console.log ('Failed awaiting all exchanges to complete')
    }

    Object.entries (tickers).forEach (([ id, response ]) => {
        const folder = 'C:/myproject/tickers'
        const filename = `${id}-tickers.json`
        console.log (path.join (folder, filename))
        writeFileSync (path.join (folder, filename), JSON.stringify (response))
    })

    const end = Date.now ()
    console.log (`Fetched tickers in ${(end - start) / 1000} seconds`)

}

main ()