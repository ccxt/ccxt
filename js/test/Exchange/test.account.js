'use strict'

const assert = require ('assert');

function testAccount (exchange, account, method) {

    const msgPrefix = exchange.id + ' ' + method + ' : ';

    const format = {
        'info': {},
        'code': 'BTC',
        // 'name': 'account name',
        'type': 'spot', // 'spot', 'margin', 'futures', 'swap'
        'id': '12345',
    };
    const keys = Object.keys (format);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const keyInAccount = (key in account);
        assert (keyInAccount, msgPrefix + key + ' is missing from structure');
    }
    const accountKeys = Object.keys (account);
    const keysLength = keys.length;
    const accountKeysLength = accountKeys.length;
    assert (keysLength === accountKeysLength, msgPrefix + 'respone includes more keys than expected');
    assert (exchange.isObject (account['info']));
    assert ((account['id'] === undefined) || (typeof account['id'] === 'string'));
    // assert (account['name'] === undefined || typeof account['name'] === 'string');
    assert ((account['type'] === undefined) || (typeof account['type'] === 'string'));
    assert ((account['code'] === undefined) || (typeof account['code'] === 'string'));
}

module.exports = testAccount;
