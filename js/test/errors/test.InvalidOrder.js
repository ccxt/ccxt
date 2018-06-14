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
        log ('createOrder not supported')
        return
    }

    try {

        await exchange.createLimitBuyOrder (symbol, 0, 0)
        assert.fail ()

    } catch (e) {

        if (e instanceof ccxt.InvalidOrder) {

            log ('InvalidOrder thrown as expected')
            return

        } else {

            log ('InvalidOrder failed, exception follows:')
            throw e
        }
    }
}