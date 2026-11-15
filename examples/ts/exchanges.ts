// @NO_AUTO_TRANSPILE



import ccxt from '../../js/ccxt.js';
import countries from '../../build/countries.js';
import asTable from 'as-table';
import ololog from 'ololog'
import ansicolor from 'ansicolor';
const log = ololog.configure ({ locate: false })
// @ts-expect-error
ansicolor.nice

process.on ('uncaughtException',  e => { log.bright.red.error (e); process.exit (1) })
process.on ('unhandledRejection', e => { log.bright.red.error (e); process.exit (1) })

let exchanges = {}

ccxt.exchanges.forEach (id => { exchanges[id] = new (ccxt)[id] () })

log ('The ccxt library supports', (ccxt.exchanges.length.toString () as any).green, 'exchanges:')

var countryName = function (code) {
    return ((countries[code] !== undefined) ? countries[code] : code)
}

log (asTable.configure ({ delimiter: ' | ' }) (Object.values (exchanges).map ((exchange: any) => {

    let countries = Array.isArray (exchange.countries) ?
        exchange.countries.map (countryName).join (', ') :
        countryName (exchange.countries)

    let website = Array.isArray (exchange.urls.www) ? exchange.urls.www[0] : exchange.urls.www

    return {
        id: exchange.id,
        name: exchange.name,
        url: website,
        countries: countries,
    }

})))
