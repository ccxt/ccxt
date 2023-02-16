'use strict'

const assert = require ('assert')

function testAccount (exchange, account, method) {
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
        assert (keyInAccount, exchange.id + ' ' + method + ' ' + key + ' missing from response');
    }
    const accountKeys = Object.keys (account);
    assert (keys.length === accountKeys.length, exchange.id + ' ' + method + ' respone includes more keys than expected');
    assert (typeof account['info'] === 'object');
    assert (account['id'] === undefined || typeof account['id'] === 'string');
    // assert (account['name'] === undefined || typeof account['name'] === 'string');
    assert (account['type'] === undefined || typeof account['type'] === 'string');
    assert (account['code'] === undefined || typeof account['code'] === 'string');
}

module.exports = testAccount;
