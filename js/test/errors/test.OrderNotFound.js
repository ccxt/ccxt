'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , ccxt      = require ('../../../ccxt.js')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange, symbol) => {

    if (!exchange.has.createOrder) {
        log ('createOrder not supported -> test skipped')
        return
    }

    let id = 1

    try {

        await exchange.cancelOrder (id, symbol)

        log ('test failed')

        assert.fail ()

    } catch (e) {

        if (e instanceof ccxt.OrderNotFound) {

            log ('OrderNotFound thrown as expected')

        } else {

            log ('OrderNotFound test failed')
            throw e
        }
    }
}