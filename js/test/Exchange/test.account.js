'use strict'

const testCommonItems = require ('./test.commonItems.js');

function testAccount (exchange, entry, method) {
    const format = {
        'info': {},
        'code': 'BTC',
        // 'name': 'account name',
        'type': 'spot', // 'spot', 'margin', 'futures', 'swap'
        'id': '12345',
    };
    const emptyNotAllowedFor = [ 'type', 'info' ];
    testCommonItems.testStructureKeys (exchange, method, entry, format, emptyNotAllowedFor);
    testCommonItems.testCyrrencyCode (exchange, method, entry, entry['code']);
}

module.exports = testAccount;
