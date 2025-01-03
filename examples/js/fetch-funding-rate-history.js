import ccxt from '../../js/ccxt.js';
import asTable from 'as-table';

const table  = asTable.configure ({ delimiter: ' | ' });

console.log ('CCXT Version:', ccxt.version)

async function main () {

    const exchange = new ccxt.binanceusdm()
        , symbol = 'ETH/USDT'
        , since = undefined
        , limit = undefined
        , params = {}

    // ------------------------------------------------------------------------
    // fetch the history of the funding rate for a symbol

    const response = await exchange.fetchFundingRateHistory (symbol, since, limit, params)

    console.log (table (response))

}

main ()
