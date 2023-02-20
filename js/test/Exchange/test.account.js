'use strict'

const sharedMethods = require ('./test.commonItems.js');

function testAccount (exchange, entry, method) {
    const format = {
        'info': {},
        'code': 'BTC',
        // 'name': 'account name',
        'type': 'spot', // 'spot', 'margin', 'futures', 'swap'
        'id': '12345',
    };
    const emptyNotAllowedFor = [ 'type' ];
    sharedMethods.reviseStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    sharedMethods.reviseCurrencyCode (exchange, method, entry, entry['code']);
}

module.exports = testAccount;
