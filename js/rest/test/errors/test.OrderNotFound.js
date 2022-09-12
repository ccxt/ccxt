'use strict'

// ----------------------------------------------------------------------------

const assert = require ('assert')
    , ccxt = require ('../../../ccxt.js')

// ----------------------------------------------------------------------------

module.exports = async (exchange, symbol) => {

    if (!exchange.has.createOrder) {
        console.log ('createOrder() is not supported')
        return
    }

    const id = 1

    try {

        await exchange.cancelOrder (id, symbol)

        console.log ('test failed')

        assert (false)

    } catch (e) {

        if (e instanceof ccxt.OrderNotFound) {

            console.log ('OrderNotFound thrown as expected')

        } else {

            console.log ('OrderNotFound test failed')
            throw e
        }
    }
}
