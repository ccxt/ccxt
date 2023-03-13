import testSharedMethods from './test.sharedMethods';
function testStatus(exchange, method, entry, now) {
    const format = {
        'info': {},
        'status': 'ok',
        'updated': undefined,
        'eta': undefined,
        'url': undefined, // a link to a GitHub issue or to an exchange post on the subject
    };
    const emptyNotAllowedFor = ['status'];
    testSharedMethods.assertStructureKeys(exchange, method, entry, format, emptyNotAllowedFor);
    //
    testSharedMethods.assertAgainstArray(exchange, method, entry, 'status', ['ok', 'error', 'shutdown', 'maintenance']);
    testSharedMethods.assertGreater(exchange, method, entry, 'updated', '0');
    testSharedMethods.assertGreater(exchange, method, entry, 'eta', '0');
}
export default testStatus;
