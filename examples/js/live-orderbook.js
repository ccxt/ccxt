

import asTable from 'as-table';
import ololog from 'ololog';
import ansicolor from 'ansicolor';
import ccxt from '../../js/ccxt.js';

const { noLocate } = ololog;
const log = noLocate;

ansicolor.nice

let printSupportedExchanges = function () {
    log ('Supported exchanges:', ccxt.exchanges.join (', ').green)
}

let printUsage = function () {
    log ('Usage: node', process.argv[1], 'exchange'.green, 'symbol'.yellow, 'depth'.cyan)
    printSupportedExchanges ()
}

let printOrderBook = async (id, symbol, depth) => {

    // check if the exchange is supported by ccxt
    let exchangeFound = ccxt.exchanges.indexOf (id) > -1
    if (exchangeFound) {

        log ('Instantiating', id.green, 'exchange')

        // instantiate the exchange by id
        let exchange = new ccxt[id] ()

        // load all markets from the exchange
        let markets = await exchange.loadMarkets ()

        // output a list of all market symbols
        // log (id.green, 'has', exchange.symbols.length, 'symbols:', exchange.symbols.join (', ').yellow)

        if (symbol in exchange.markets) {

            const market = exchange.markets[symbol]
            const pricePrecision = market.precision ? market.precision.price : 8
            const amountPrecision = market.precision ? market.precision.amount : 8

            // Object.values (markets).forEach (market => log (market))

            // make a table of all markets
            // const table = asTable.configure ({ delimiter: ' | ' }) (Object.values (markets))
            // log (table)

            const priceVolumeHelper = color => ([price, amount]) => ({
                price: price.toFixed (pricePrecision)[color],
                amount: amount.toFixed (amountPrecision)[color],
                '  ': '  ',
            })

            const cursorUp = '\u001b[1A'
            const tableHeight = depth * 2 + 4 // bids + asks + headers

            log (' ') // empty line

            while (true) {

                const orderbook = await exchange.fetchOrderBook (symbol)

                log (symbol.green, exchange.iso8601 (exchange.milliseconds ()))

                log (asTable.configure ({ delimiter: ' | '.dim, right: true }) ([
                    ... orderbook.asks.slice (0, depth).reverse ().map (priceVolumeHelper ('red')),
                    // { price: '--------'.dim, amount: '--------'.dim },
                    ... orderbook.bids.slice (0, depth).map (priceVolumeHelper ('green')),
                ]))

                log (cursorUp.repeat (tableHeight))
            }

        } else {

            log.error ('Symbol', symbol.bright, 'not found')
        }


    } else {

        log ('Exchange ' + id.red + ' not found')
        printSupportedExchanges ()
    }
}

;(async function main () {

    if (process.argv.length > 4) {

        const id = process.argv[2]
        const symbol = process.argv[3].toUpperCase ()
        const depth = parseInt (process.argv[4])
        await printOrderBook (id, symbol, depth)

    } else {

        printUsage ()
    }

    process.exit ()

}) ()