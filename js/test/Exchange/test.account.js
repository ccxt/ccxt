'use strict'

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testAccount (exchange, account, method) {
    const format = {
        'info': {},
        'code': 'BTC',
        // 'name': 'account name',
        'type': 'spot', // 'spot', 'margin', 'futures', 'swap'
        'id': '12345',
    };
    testCommonItems.testStructureKeys (exchange, method, account, format);
    testCommonItems.testId (exchange, method, account);

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (account) + ' >>> ';

    const accountKeys = Object.keys (account);
    const keysLength = keys.length;
    const accountKeysLength = accountKeys.length;
    assert (keysLength === accountKeysLength, 'respone includes more keys than expected' + logText);
    // assert (account['name'] === undefined || typeof account['name'] === 'string');
    assert ((account['type'] === undefined) || (typeof account['type'] === 'string'));
    assert ((account['code'] === undefined) || (typeof account['code'] === 'string'));
}

module.exports = testAccount;
