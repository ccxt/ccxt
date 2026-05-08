// see this issue for details
// https://github.com/ccxt/ccxt/issues/6659

const ccxt = require ('ccxt')

 const exchange = new ccxt.pro.kraken ()

function yellow (s) {
    return '\x1b[33m' + s + '\x1b[0m'
}

async function runWs () {
    while (1) {
        const book = await exchange.watchOrderBook ('ETH/BTC')
        console.log (new Date (), 'WS  ', book['datetime'], book['bids'][0][0], book['asks'][0][0])
    }
}

async function runRest () {
    while (1) {
        const book = await exchange.fetchOrderBook ('ETH/BTC')
        const timestamp = new Date (exchange.last_response_headers['Date']).getTime ()
        const datetime = exchange.iso8601 (timestamp)
        console.log (new Date (), 'REST', yellow (datetime), book['bids'][0][0], book['asks'][0][0])
    }
}

runWs ()
runRest ()