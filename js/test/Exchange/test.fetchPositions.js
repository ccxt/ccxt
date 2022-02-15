'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , testPosition = require ('./test.position.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    const skippedExchanges = [
        'bitmart',
        'rightbtc',
    ]

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchPositions...')
        return
    }

    if (exchange.has['fetchPositions']) {
        const now = Date.now ()

        // without symbol
        const positions = await exchange.fetchPositions ()
        console.log ('fetched', positions.length, 'positions, asserting each...')
        assert (positions instanceof Array)
        for (let i = 0; i < positions.length; i++) {
            const position = positions[i]
            testPosition (exchange, position, undefined, now)
        }
        
        // with symbol
        const positionsForSymbol = await exchange.fetchPositions ([ symbol ])
        console.log ('fetched', positions.length, 'positions (' + symbol + '), asserting each...')
        assert (positionsForSymbol instanceof Array)
        for (let i = 0; i < positionsForSymbol.length; i++) {
            const position = positionsForSymbol[i]
            testPosition (exchange, position, symbol, now)
        }

    } else {

        console.log ('fetching positions not supported')
    }
}
