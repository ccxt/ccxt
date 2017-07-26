"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice;

//-----------------------------------------------------------------------------

// this script loads products from all markets
// if it cannot connect to an exchange market, it falls back to an alternative route via proxy
// it will retry to load a market until it either reaches the exchange or runs out of proxies

//-----------------------------------------------------------------------------

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

//-----------------------------------------------------------------------------

let loadMarket = async market => {
    await market.loadProducts ()
    log (market.id.green, 'loaded', 
        market.symbols.length.toString ().bright.green, 'symbols', 
        (market.proxy ? market.proxy : '_').blue)
}

//-----------------------------------------------------------------------------

let tryAllProxies = async function (market, proxies) {

    let currentProxy = 0
    let maxRetries   = proxies.length

    // a special case for ccex
    if (market.id == 'ccex')
        currentProxy = 1
    
    for (let numRetries = 0; numRetries < maxRetries; numRetries++) {

        try {

            market.proxy = proxies[currentProxy]
            await loadMarket (market)
            break

        } catch (e) {

            currentProxy = ++currentProxy % proxies.length
            if (e instanceof ccxt.DDoSProtectionError) {
                log.bright.yellow (market.id, '[DDoS Protection Error] ' + e.message)
            } else if (e instanceof ccxt.TimeoutError) {
                log.bright.yellow (market.id, '[Timeout Error] ' + e.message)
            } else if (e instanceof ccxt.AuthenticationError) {
                log.bright.yellow (market.id, '[Authentication Error] ' + e.message)
            } else if (e instanceof ccxt.MarketNotAvailableError) {
                log.bright.yellow (market.id, '[Market Not Available Error] ' + e.message)
            } else if (e instanceof ccxt.EndpointNotAvailableError) {
                log.bright.yellow (market.id, '[Endpoint Not Available Error] ' + e.message)
            } else {
                throw e;
            }
        }

    }
}

//-----------------------------------------------------------------------------

let proxies = [
    '',
    'https://cors-anywhere.herokuapp.com/',
    'https://crossorigin.me/',
]

let markets = []

async function main () {
    // instantiate all markets
    await Promise.all (ccxt.markets.map (async id => {
        let market = new (ccxt)[id] ()
        markets.push (market)
        await tryAllProxies (market, proxies)
    }))

    let succeeded = markets.filter (market => market.products ? true : false).length .toString ().bright.green
    let failed = markets.filter (market => market.products ? false : true).length
    let total = ccxt.markets.length.toString ().bright.white
    console.log (succeeded, 'of', total, 'markets loaded', ('(' + failed + ' errors)').red)
}

main ()
