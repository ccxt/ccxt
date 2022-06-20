"use strict";

const ccxt = require ('../../ccxt.js')

console.log ('CCXT Version:', ccxt.version)

async function loadExchange (exchange) {
    try {
        await exchange.loadMarkets ()
        exchange.symbols.map (symbol => {
            const market = exchange.market (symbol)
            if (market['contract']) {
                console.log (exchange.id, 'loaded', market['type'], symbol, 'market')
            }
        })
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }
}

async function loadAllExchanges (exchangeId) {
    try {

        const exchanges = [];
        [ 'swap', 'future', 'options' ].forEach (defaultType => {
            const exchange = new ccxt[exchangeId]()
            if (exchange.has[defaultType]) {
                exchanges.push (exchange);
            }
        })
        await Promise.all (exchanges.map (exchange => loadExchange (exchange)))
    } catch (e) {
        console.log (e.constructor.name, e.message)
    }
}

async function main () {
    await Promise.all (ccxt.exchanges.map (exchangeId => loadAllExchanges (exchangeId)))
}

main ()