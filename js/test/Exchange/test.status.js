'use strict';

const sharedMethods = require ('./test.sharedMethods.js');

function testStatus (exchange, method, entry, now) {
    const format = {
        'info': { },
        'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
        'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
        'eta': undefined, // when the maintenance or outage is expected to end
        'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
    };
    const emptyNotAllowedFor = [ 'status' ];
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    //
    sharedMethods.reviseAgainstArray (exchange, method, entry, 'status', [ 'ok', 'error', 'shutdown', 'maintenance' ]);
    sharedMethods.Gt (exchange, method, entry, 'updated', '0');
    sharedMethods.Gt (exchange, method, entry, 'eta', '0');
}

module.exports = testStatus;
