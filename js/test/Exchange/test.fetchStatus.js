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

        const sampleStatus = {
            'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
            'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
            'eta': undefined, // when the maintenance or outage is expected to end
            'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
        }

        assert.containsAllKeys (status, sampleStatus)

        return status

    } else {

        log ('fetching status not supported')
    }
}
