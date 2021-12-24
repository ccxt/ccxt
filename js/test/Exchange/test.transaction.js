'use strict';

// ----------------------------------------------------------------------------

const assert = require ('assert');

//  ---------------------------------------------------------------------------

function testTransaction (exchange, transaction, code, now) {
    assert (transaction);
    assert ((transaction['id'] === undefined) || (typeof transaction['id'] === 'string'));
    assert (typeof transaction['timestamp'] === 'number');
    assert (transaction['timestamp'] > 1230940800000); // 03 Jan 2009 - first block
    assert (transaction['timestamp'] < now);
    assert ('updated' in transaction);
    assert ('address' in transaction);
    assert ('tag' in transaction);
    assert ('txid' in transaction);
    assert (transaction['datetime'] === exchange.iso8601 (transaction['timestamp']));
    assert ((transaction['status'] === 'ok') || (transaction['status'] === 'pending') || (transaction['status'] === 'canceled'));
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
    assert (transaction.info);
}

module.exports = testTransaction;
