import testSharedMethods from './test.sharedMethods.js';

function testAccount (exchange, skippedProperties, method, entry) {
    const format = {
        'info': {},
        'code': 'BTC', // todo
        // 'name': 'account name', // todo
        'type': 'spot', // 'spot', 'margin', 'futures', 'swap'
        'id': '12345', // todo
    };
    const emptyAllowedFor = [ 'code', 'id' ];
    testSharedMethods.assertStructure (exchange, skippedProperties, method, entry, format, emptyAllowedFor);
    testSharedMethods.assertCurrencyCode (exchange, skippedProperties, method, entry, entry['code']);
}

export default testAccount;
