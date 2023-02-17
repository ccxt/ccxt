'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testTransaction (exchange, transaction, code, now) {
    const method = 'transaction';
    const format = {
        'info': {}, // or []
        'id': '1234',
        'txid': '0x1345FEG45EAEF7',
        'timestamp': 1502962946216,
        'datetime': '2017-08-17 12:42:48.000',
        'network': 'ETH',
        'address': '0xEFE3487358AEF352345345',
        'addressTo': '0xEFE3487358AEF352345123',
        'addressFrom': '0xEFE3487358AEF352345456',
        'tag': 'smth',
        'tagTo': 'smth',
        'tagFrom': 'smth',
        'type': 'deposit',
        'amount': exchange.parseNumber ('1.234'),
        'currency': 'USDT',
        'status': 'ok',
        'updated': 1502962946233,
        'fee': {},
    };
    testCommonItems.testStructureKeys (exchange, method, transaction, format);
    testCommonItems.testId (exchange, method, transaction);
    testCommonItems.testCommonTimestamp (exchange, method, transaction, now);
    const logText = testCommonItems.logTemplate (exchange, method, transaction);
    //
    const statuses = [
        'ok',
        'pending',
        'failed',
        'rejected',
        'canceled',
    ];
    assert (exchange.inArray (transaction['status'], statuses), 'status ' + transaction['status'] + ' not in expected list: ' + exchange.json (statuses) + logText);
    assert (transaction['currency'] === code, 'currency ' + transaction['currency'] + ' not equal to expected ' + code + logText);
    assert ((typeof transaction['type'] === 'string') && exchange.inArray (transaction['type'], ['deposit', 'withdrawal']), 'type ' + transaction['type'] + ' not in expected list: deposit, withdrawal' + logText);
    assert (typeof transaction['amount'] === 'number', 'amount ' + transaction['amount'] + ' is not a number' + logText);
    assert (transaction['amount'] >= 0, 'amount ' + transaction['amount'] + ' is negative' + logText);
    if (transaction['fee']) {
        assert (typeof transaction['fee']['cost'] === 'number', 'fee["cost"] ' + transaction['fee']['cost'] + ' is not a number' + logText);
        if (transaction['fee']['cost'] !== 0) {
            assert (typeof transaction['fee']['currency'] === 'string', 'fee["currency"] ' + transaction['fee']['currency'] + ' is not a string' + logText);
        }
    }
}

module.exports = testTransaction;
