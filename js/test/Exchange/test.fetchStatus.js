'use strict'

const assert = require ('assert')

module.exports = async (exchange) => {
    const method = 'fetchStatus';

    const skippedExchanges = [
        'binanceus',
    ];

    if (skippedExchanges.includes (exchange.id)) {
        console.log (exchange.id, 'found in ignored exchanges, skipping ' + method + '...');
        return;
    }

    if (exchange.has[method]) {
        const status = await exchange[method] ();
        const sampleStatus = {
            'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
            'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
            'eta': undefined, // when the maintenance or outage is expected to end
            'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
        };
        const keys = Object.keys (sampleStatus);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            assert (key in status);
        }
        return status;
    } else {
        console.log (method + '() is not supported');
    }
}
