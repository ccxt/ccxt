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

    log.green ('AuthenticationError (bad nonce) test...')

    const hasFetchBalance  = exchange.has.fetchBalance
    const hasFetchMyTrades = exchange.has.fetchMyTrades
    const hasFetchOrders   = exchange.has.fetchOrders

    if (hasFetchBalance || hasFetchMyTrades || hasFetchOrders) {

        // save the nonce temporarily and replace it with a fake one
        const nonce = exchange.nonce
        exchange.nonce = () => 1

        try {

            // check if handleErrors() throws AuthenticationError if an exchange
            // responds with an error on a bad nonce
            // (still, some exchanges that require nonce silently eat bad nonce w/o an error)

            if (hasFetchBalance)
                await exchange.fetchBalance ()
            else if (hasFetchMyTrades)
                await exchange.fetchMyTrades (symbol, 0)
            else
                await exchange.fetchOrders (symbol)

            // restore the nonce so the caller may proceed in case bad nonce was accepted by an exchange
            exchange.nonce = nonce
            log.warn (exchange.id + ': AuthenticationError: bad nonce swallowed')

        } catch (e) {

            // restore the nonce so the caller may proceed in case the test failed
            exchange.nonce = nonce

            if (e instanceof ccxt.AuthenticationError || e instanceof ccxt.InvalidNonce) {

                // it has thrown the exception as expected
                log.green ('AuthenticationError test passed')

            } else {

                // rethrow an unexpected error if any
                throw e
            }
        }

    } else {

        log (exchange.id + ' has no means of testing for bad nonce')

    }
}