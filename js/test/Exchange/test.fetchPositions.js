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
        console.log (exchange.id, 'found in ignored exchanges, skipping fetchMyTrades...')
        return
    }

    if (exchange.has['fetchPositions']) {

        const positions = await exchange.fetchPositions ()

        console.log ('fetched', positions.length, 'positions, asserting each...')

        assert (positions instanceof Array)

        const now = Date.now ()

        for (let i = 0; i < positions.length; i++) {
            const order = positions[i]
            testPosition (positions, order, symbol, now)
        }

    } else {

        console.log ('fetching positions not supported')
    }
}
