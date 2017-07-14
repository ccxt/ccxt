"use strict";

const ccxt      = require ('../../ccxt.es5.js')
const countries = require ('../../countries.js')
const asTable   = require ('as-table')
const util      = require ('util')
const log       = require ('ololog').configure ({ locate: false })

require ('ansicolor').nice;

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

let markets = {}

ccxt.markets.forEach (id => { markets[id] = new (ccxt)[id] () })

log ('The ccxt library supports', (ccxt.markets.length.toString ()).green, 'markets:')

var countryName = function (code) {
    return ((typeof countries[code] !== 'undefined') ? countries[code] : code)
}

log (asTable.configure ({ delimiter: ' | ' }) (Object.values (markets).map (market => {
    
    let countries = Array.isArray (market.countries) ? 
        market.countries.map (countryName).join (', ') : 
        countryName (market.countries)

    let website = Array.isArray (market.urls.www) ? market.urls.www[0] : market.urls.www

    return {
        id: market.id,
        name: market.name,
        url: website,
        countries: countries,
    }
            
})))