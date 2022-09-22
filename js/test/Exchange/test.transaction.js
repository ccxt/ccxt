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
    testCommonItems.testCommonTimestamp (exchange, method, transaction);
    testCommonItems.testInfo (exchange, method, transaction, 'object');

    const logText = ' <<< ' + exchange.id + ' ' + method + ' ::: ' + exchange.json (transaction) + ' >>> ';

    assert (transaction['timestamp'] < now, 'timestamp must be less than current time' + logText);

    assert ('updated' in transaction);
    assert ('address' in transaction);
    assert ('tag' in transaction);
    assert ('txid' in transaction);
    const statuses = [
        'ok',
        'pending',
        'failed',
        'rejected',
        'canceled',
    ];
    const transactionStatusIsValid = exchange.inArray (transaction['status'], statuses);
    assert (transactionStatusIsValid);
    assert (transaction['currency'] === code);
    assert (typeof transaction['type'] === 'string');
    assert ((transaction['type'] === 'deposit') || (transaction['type'] === 'withdrawal'));
    assert (typeof transaction['amount'] === 'number');
    assert (transaction['amount'] >= 0);
    if (transaction['fee']) {
        assert (typeof transaction['fee']['cost'] === 'number');
        if (transaction['fee']['cost'] !== 0) {
            assert (typeof transaction['fee']['currency'] === 'string');
        }
    }
}

module.exports = testTransaction;
