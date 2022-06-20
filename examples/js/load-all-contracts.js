"use strict";

const ccxt = require ('../../ccxt.js')

console.log ('CCXT Version:', ccxt.version)

async function loadExchange (exchangeId) {
    try {
        const exchange = new ccxt[exchangeId]()
        if (exchange.has['swap'] || exchange.has['future'] || exchange.has['option']) {
            await exchange.loadMarkets ()
            exchange.symbols.map (symbol => {
                const market = exchange.market (symbol)
                console.log (exchange.id, 'loaded', market['type'], symbol, 'market')
            })
        } else {
        }
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }
}

async function main () {

    await Promise.all (ccxt.exchanges.map (exchangeId => loadExchange (exchangeId)))
}

main ()