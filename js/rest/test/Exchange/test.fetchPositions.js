'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testPosition = require ('./test.position.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const method = 'fetchPositions'

    const skippedExchanges = [
        'bitmart',
        'rightbtc',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...')
        return
    }

    if (exchange.has[method]) {
        const now = Date.now ()

        // without symbol
        const positions = await exchange[method] ()
        console.log ('fetched', positions.length, 'positions, asserting each...')
        assert (positions instanceof Array)
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i]
            testPosition (exchange, position, undefined, now)
        }
        
        // with symbol
        const positionsForSymbol = await exchange[method] ([ symbol ])
        console.log ('fetched', positions.length, 'positions (' + symbol + '), asserting each...')
        assert (positionsForSymbol instanceof Array)
        for (let i = 0; i < positionsForSymbol.length; i++) {
            const position = positionsForSymbol[i]
            testPosition (exchange, position, symbol, now)
        }

    } else {

        console.log (method + '() is not supported')
    }
}
