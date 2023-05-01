import testSharedMethods from './test.sharedMethods.js';

function testStatus (exchange, skippedProperties, method, entry, now : number) {
    const format = {
        'info': { },
        'status': 'ok', // 'ok', 'shutdown', 'error', 'maintenance'
        'updated': 1650000000000, // integer, last updated timestamp in milliseconds if updated via the API
        'eta': 1660000000000, // when the maintenance or outage is expected to end
        'url': 'https://example.com', // a link to a Git
    };
    const emptyNotAllowedFor = [ 'status' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyNotAllowedFor);
    //
    testSharedMethods.assertInArray (exchange, skippedProperties, method, entry, 'status', [ 'ok', 'error', 'shutdown', 'maintenance' ]);
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'updated', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'eta', '0');
    testSharedMethods.assertGreater (exchange, skippedProperties, method, entry, 'eta', now.toString ());
}

export default testStatus;
