'use strict';

const testSharedMethods = require ('./test.sharedMethods.js');

function testStatus (exchange, method, entry, now) {
    const format = {
        'info': { },
        'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
        'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
        'eta': undefined, // when the maintenance or outage is expected to end
        'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
    };
    const emptyNotAllowedFor = [ 'status' ];
    testSharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    //
    testSharedMethods.reviseAgainstArray (exchange, method, entry, 'status', [ 'ok', 'error', 'shutdown', 'maintenance' ]);
    testSharedMethods.Gt (exchange, method, entry, 'updated', '0');
    testSharedMethods.Gt (exchange, method, entry, 'eta', '0');
}

module.exports = testStatus;
