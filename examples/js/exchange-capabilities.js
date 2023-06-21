

import ccxt from '../../js/ccxt.js';
import ololog from 'ololog';
import ansicolor from 'ansicolor';
import asTable from 'as-table';

const { noLocate } = ololog;
const log = noLocate;

ansicolor.nice



const csv = process.argv.includes ('--csv'), delimiter = csv ? ',' : '|', asTableConfig = { delimiter: ' ' + delimiter + ' ', /* print: require ('string.ify').noPretty  */ }

asTable.configure (asTableConfig);

const sortCertified = process.argv.includes ('--sort-certified') || process.argv.includes ('--certified')
const exchangesArgument = process.argv.find (arg => arg.startsWith ('--exchanges='))
const exchangesArgumentParts = exchangesArgument ? exchangesArgument.split ('=') : []
const selectedExchanges = (exchangesArgumentParts.length > 1) ? exchangesArgumentParts[1].split (',') : []

console.log (ccxt.iso8601 (ccxt.milliseconds ()))
console.log ('CCXT v' + ccxt.version)

async function main () {

    let total = 0
    let notImplemented = 0
    let inexistentApi = 0
    let implemented = 0
    let emulated = 0

    const certified = [
        'ascendex',
        'binance',
        'binancecoinm',
        'binanceusdm',
        'bitmart',
        'bitvavo',
        'currencycom',
        'ftx',
        'gateio',
        'huobi',
        'idex',
        'mexc',
        'okx',
        'wavesexchange',
        'zb',
    ]
    const exchangeNames = ccxt.unique (sortCertified ? certified.concat (ccxt.exchanges) : ccxt.exchanges);
    let exchanges = exchangeNames.map (id => new ccxt[id] ())
    const metainfo = ccxt.flatten (exchanges.map (exchange => Object.keys (exchange.has)))
    const reduced = metainfo.reduce ((previous, current) => {
        previous[current] = (previous[current] || 0) + 1
        return previous
    }, {})
    const unified = Object.entries (reduced).filter (([ _, count ]) => count > 1)
    const methods = unified.map (([ method, _ ]) => method).sort ()
    if (selectedExchanges.length > 0) {
        exchanges = exchanges.filter ((exchange) => selectedExchanges.includes(exchange.id))
    }
    const table = asTable (exchanges.map (exchange => {
        let result = {};
        const basics = [
            'CORS',
            'spot',
            'margin',
            'swap',
            'future',
            'option',
        ];

        ccxt.unique (basics.concat (methods)).forEach (key => {

            total += 1

            let coloredString = '';

            const feature = exchange.has[key]
            const isFunction = (typeof exchange[key] === 'function')
            const isBasic = basics.includes (key)

            if (feature === false) {
                // if explicitly set to 'false' in exchange.has (to exclude mistake, we check if it's undefined too)
                coloredString = exchange.id.red.dim
                inexistentApi += 1
            } else if (feature === 'emulated') {
                // if explicitly set to 'emulated' in exchange.has
                coloredString = exchange.id.yellow
                emulated += 1
            } else if (feature) {
                if (isBasic) {
                    // if neither 'false' nor 'emulated', and if  method exists
                    coloredString = exchange.id.green
                    implemented += 1
                } else {
                    if (isFunction) {
                        coloredString = exchange.id.green
                        implemented += 1
                    } else {
                        // the feature is available in exchange.has and not implemented
                        // this is an error
                        coloredString = exchange.id.lightMagenta
                    }
                }
            } else {
                coloredString = exchange.id.lightRed
                notImplemented += 1
            }

            result[key] = coloredString
        })

        return result
    }))

    if (csv) {
        let lines = table.split ("\n")
        lines = lines.slice (0, 1).concat (lines.slice (2))
        log (lines.join ("\n"))
    } else {
        log (table)
    }

    log ('Summary: ',
        ccxt.exchanges.length.toString (), 'exchanges; ',
        'Methods [' + total.toString () + ' total]: ',
        implemented.toString ().green, 'implemented,',
        emulated.toString ().yellow, 'emulated,',
        (inexistentApi.toString ().red.dim), 'inexistentApi,',
        (notImplemented.toString ().lightRed), 'notImplemented',
    )

    log("\nMessy? Try piping to less (e.g. node script.js | less -S -R)\n".red)

}

main ()
