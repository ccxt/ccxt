

import { nice as ansi } from 'ansicolor';
import ololog from 'ololog';
import asTable from 'as-table';

import ccxt from '../../js/ccxt.js';

const { noLocate } = ololog;
const log = noLocate;

const table = asTable.configure ({
        delimiter: ' | '.dim,
        right: true,
    });

const exchange = new ccxt.coinone ({
    'verbose': process.argv.includes ('--verbose'),
})

let printTickersAsTable = function (exchange, tickers) {
    log (exchange.id.green, exchange.iso8601 (exchange.milliseconds ()))
    log ('Fetched', Object.values (tickers).length.toString ().green, 'tickers:')
    log (table (ccxt.sortBy (Object.values (tickers), 'symbol', false)))
}

async function fetchAllAndPrint () {
    const tickers = await exchange.fetchTickers ()
    log ('---------------------------------------- fetchTickers ----------------------------------------')
    printTickersAsTable (exchange, tickers)
}

async function fetchOneByOneAndPrint () {
    const markets = await exchange.loadMarkets ()
    const symbols = Object.keys (markets)
    const tickers = []

    log ('---------------------------------------- fetchTicker (one by one) ----------------------------------------')

    for (let i = 0; i < symbols.length; i++) {
        const ticker = await exchange.fetchTicker (symbols[i])
        tickers.push (ticker)
        log (`${i+1} / ${symbols.length}`)
        log ('\u001b[1A'.repeat (2))  // cursor up
    }

    printTickersAsTable (exchange, tickers)
}

(async () => {
    await fetchAllAndPrint ()
    log ('\n')
    await fetchOneByOneAndPrint ()
}) ()
