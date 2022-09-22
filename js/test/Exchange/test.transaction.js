'use strict';

const assert = require ('assert');
const testCommonItems = require ('./test.commonItems.js');

function testTransaction (exchange, transaction, code, now) {
    assert (transaction);
    assert ((transaction['id'] === undefined) || (typeof transaction['id'] === 'string'));
    testCommonItems.testCommonTimestamp (exchange, 'transaction', transaction);
    assert (transaction['timestamp'] < now);
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
    assert (transaction['type'] === 'deposit' || transaction['type'] === 'withdrawal');
    assert (typeof transaction['amount'] === 'number');
    assert (transaction['amount'] >= 0);
    if (transaction['fee']) {
        assert (typeof transaction['fee']['cost'] === 'number');
        if (transaction['fee']['cost'] !== 0) {
            assert (typeof transaction['fee']['currency'] === 'string');
        }
    }
    assert (transaction['info']);
}

module.exports = testTransaction;
