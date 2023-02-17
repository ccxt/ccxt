'use strict'

const testCommonItems = require ('./test.commonItems.js');

function testAccount (exchange, account, method) {
    const format = {
        'info': {},
        'code': 'BTC',
        // 'name': 'account name',
        'type': 'spot', // 'spot', 'margin', 'futures', 'swap'
        'id': '12345',
    };
    const neededValues = [ 'code', 'type', 'info' ];
    testCommonItems.testStructureKeys (exchange, method, account, format, neededValues);
}

module.exports = testAccount;
