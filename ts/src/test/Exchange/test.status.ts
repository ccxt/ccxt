import testSharedMethods from './test.sharedMethods.js';

function testStatus (exchange, method, entry, now : number) {
    const format = {
        'info': { },
        'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
        'updated': undefined, // integer, last updated timestamp in milliseconds if updated via the API
        'eta': undefined, // when the maintenance or outage is expected to end
        'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
    };
    const emptyNotAllowedFor = [ 'status' ];
    testSharedMethods.assertStructure (exchange, method, entry, format, emptyNotAllowedFor);
    //
    testSharedMethods.assertInArray (exchange, method, entry, 'status', [ 'ok', 'error', 'shutdown', 'maintenance' ]);
    testSharedMethods.assertGreater (exchange, method, entry, 'updated', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'eta', '0');
    testSharedMethods.assertGreater (exchange, method, entry, 'eta', now.toString ());
}

export default testStatus;
