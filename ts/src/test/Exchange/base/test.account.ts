import testSharedMethods from './test.sharedMethods.js';

function testAccount (exchange, method, entry) {
    const format = {
        'info': {},
        'code': 'BTC',
        // 'name': 'account name',
        'type': 'spot', // 'spot', 'margin', 'futures', 'swap'
        'id': '12345',
    };
    const emptyNotAllowedFor = [ 'type' ];
    testSharedMethods.assertStructure (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.assertCurrencyCode (exchange, method, entry, entry['code']);
}

export default testAccount;
