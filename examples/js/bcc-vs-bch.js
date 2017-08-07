"use strict";

const ccxt      = require ('../../ccxt.js')
const asTable   = require ('as-table')
const log       = require ('ololog').configure ({ locate: false })
const fs        = require ('fs')


require ('ansicolor').nice;

let sleep = (ms) => new Promise (resolve => setTimeout (resolve, ms));

let proxies = [
    '', // no proxy by default
    'https://crossorigin.me/',
    'https://cors-anywhere.herokuapp.com/',
];

(async function main () {

    let ids = ccxt.markets
    let markets = {}

    // instantiate all markets
    ccxt.markets.forEach (id => {
        markets[id] = new (ccxt)[id] ({ verbose: false })
    })

    // // move gdax to sandbox
    // markets['gdax'].urls['api'] = 'https://api-public.sandbox.gdax.com'

    // load api keys from config
    let config = JSON.parse (fs.readFileSync ('./keys.json', 'utf8'))

    // set up api keys appropriately
    for (let id in config)
        for (let key in config[id])
            markets[id][key] = config[id][key]

    log (ids.join (', ').yellow)

    // load all products from all exchange markets 

    await Promise.all (ids.map (async id => {

        let market = markets[id]

        // basic round-robin proxy scheduler
        let currentProxy = 0
        let maxRetries   = proxies.length
        
        for (let numRetries = 0; numRetries < maxRetries; numRetries++) {

            try { // try to load exchange products using current proxy

                market.proxy = proxies[currentProxy]
                await market.loadProducts ()

            } catch (e) { // rotate proxies in case of connectivity errors, catch all other exceptions

                // swallow connectivity exceptions only
                if ((e instanceof ccxt.DDoSProtectionError) || e.message.includes ('ECONNRESET')) {
                    log.bright.yellow (market.id + ' [DDoS Protection Error]')
                } else if (e instanceof ccxt.TimeoutError) {
                    log.bright.yellow (market.id + ' [Timeout Error] ' + e.message)
                } else if (e instanceof ccxt.AuthenticationError) {
                    log.bright.yellow (market.id + ' [Authentication Error] ' + e.message)
                } else if (e instanceof ccxt.MarketNotAvailableError) {
                    log.bright.yellow (market.id + ' [Market Not Available Error] ' + e.message)
                } else if (e instanceof ccxt.MarketError) {
                    log.bright.yellow (market.id + ' [Market Error] ' + e.message)
                } else {
                    throw e; // rethrow all other exceptions
                }

                // retry next proxy in round-robin fashion in case of error
                currentProxy = ++currentProxy % proxies.length 
            }
        }

        if (market.symbols)
            log (id.green, 'loaded', market.symbols.length.green, 'products')

    }))

    log ('Loaded all products'.green)

    let table = ccxt.markets.map (id => {
        console.log (id)
        let market = markets[id]
        if (market.currencies) {
            let hasBCC = market.currencies.includes ('BCC')
            let hasBCH = market.currencies.includes ('BCH')
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