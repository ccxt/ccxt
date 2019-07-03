'use strict'

// ----------------------------------------------------------------------------

const log       = require ('ololog')
    , ansi      = require ('ansicolor').nice
    , chai      = require ('chai')
    , expect    = chai.expect
    , assert    = chai.assert

/*  ------------------------------------------------------------------------ */

module.exports = async (exchange) => {

    if (exchange.has.fetchStatus) {

        // log ('fetching status...')

        const method = 'fetchStatus'
        const status = await exchange[method] ()

        expect (status).to.have.key('status')
        expect (status).to.have.key('updated')
        expect (status).to.have.key('eta')
        expect (status).to.have.key('url')
        return status

    } else {

        log ('fetching status not supported')
    }
}

