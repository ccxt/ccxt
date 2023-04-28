import testSharedMethods from './test.sharedMethods.js';

function testAccount (exchange, skippedProperties, method, entry) {
    const format = {
        'info': {},
        'code': 'BTC',
        // 'name': 'account name',
        'type': 'spot', // 'spot', 'margin', 'futures', 'swap'
        'id': '12345',
    };
    const emptyNotAllowedFor = [ 'type' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['code']);
}

export default testAccount;
