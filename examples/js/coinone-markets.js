"use strict"

const log = require('ololog')
const ccxt = require('../../ccxt.js')
const exchange = new ccxt.coinone({
    'verbose': process.argv.includes('-v'),
})


async function main () {
    const markets = await exchange.load_markets()
    log(markets)
    log('\n' + exchange['name'] + ' supports ' + Object.keys(markets).length + ' pairs')
}

main()