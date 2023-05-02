import testSharedMethods from './test.sharedMethods.js';

function testAccount (exchange, skippedProperties, method, entry) {
    const format = {
        'info': {},
        'code': 'BTC', // todo
        // 'name': 'account name', // todo
        'type': 'spot', // 'spot', 'margin', 'futures', 'swap'
        'id': '12345', // todo
    };
    const emptyNotAllowedFor = [ 'type', 'info' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['code']);
}

export default testAccount;
