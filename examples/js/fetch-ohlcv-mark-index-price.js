import ccxt from '../../ccxt.js';
import asTable from 'as-table';

const table  = asTable.configure ({ delimiter: ' | ' });

console.log ('CCXT Version:', ccxt.version)

async function main () {

    const exchange = new ccxt.binanceusdm()
        , symbol = 'ADA/USDT'
        , timeframe = '1h'
        , since = undefined
        , limit = undefined

    // ------------------------------------------------------------------------
    // method 1 – fetch mark price OHLCVs with a `price` override in `params`:

    const params = { 'price': 'mark' }
    const response = await exchange.fetchOHLCV (symbol, timeframe, since, limit, params)

    console.log (table (response))

    // ------------------------------------------------------------------------
    // method 2 – use convenience shorthands

    const mark = await exchange.fetchMarkOHLCV (symbol, timeframe)

    console.log ('-----------------------------------------------------------')
    console.log (table (mark))

    const index = await exchange.fetchIndexOHLCV (symbol, timeframe)

    console.log ('-----------------------------------------------------------')
    console.log (table (index))

}

main ()
