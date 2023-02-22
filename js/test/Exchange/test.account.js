'use strict'

const testSharedMethods = require ('./test.sharedMethods.js');

function testAccount (exchange, method, entry) {
    const format = {
        'info': {},
        'code': 'BTC',
        // 'name': 'account name',
        'type': 'spot', // 'spot', 'margin', 'futures', 'swap'
        'id': '12345',
    };
    const emptyNotAllowedFor = [ 'type' ];
    testSharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testSharedMethods.reviseCurrencyCode (exchange, method, entry, entry['code']);
}

module.exports = testAccount;
