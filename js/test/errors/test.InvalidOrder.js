'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , ccxt = require ('../../../ccxt.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    if (!exchange.has.createOrder) {
        console.log ('createOrder not supported')
        return
    }

    try {

        await exchange.createLimitBuyOrder (symbol, 0, 0)
        assert (false)

    } catch (e) {

        if (e instanceof ccxt.InvalidOrder) {

            console.log ('InvalidOrder thrown as expected')
            return

        } else {

            console.log ('InvalidOrder failed, exception follows:')
            throw e
        }
    }
}
