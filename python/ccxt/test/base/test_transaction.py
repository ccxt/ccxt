# -*- coding: utf-8 -*-


import numbers  # noqa E402


#  ---------------------------------------------------------------------------

def test_transaction(exchange, transaction, code, now):
    assert transaction
    assert(transaction['id'] is None) or (isinstance(transaction['id'], str))
    assert isinstance(transaction['timestamp'], numbers.Real)
    assert transaction['timestamp'] > 1230940800000  # 03 Jan 2009 - first block
    assert transaction['timestamp'] < now
    assert 'updated' in transaction
    assert 'address' in transaction
    assert 'tag' in transaction
    assert 'txid' in transaction
    assert transaction['datetime'] == exchange.iso8601(transaction['timestamp'])
    statuses = [
        'ok',
        'pending',
        'failed',
        'rejected',
        'canceled',
    ]
    transactionStatusIsValid = exchange.in_array(transaction['status'], statuses)
    assert transactionStatusIsValid
    assert transaction['currency'] == code
    assert isinstance(transaction['type'], str)
    assert transaction['type'] == 'deposit' or transaction['type'] == 'withdrawal'
    assert isinstance(transaction['amount'], numbers.Real)
    assert transaction['amount'] >= 0
    if transaction['fee']:
        assert isinstance(transaction['fee']['cost'], numbers.Real)
        if transaction['fee']['cost'] != 0:
            assert isinstance(transaction['fee']['currency'], str)

    assert transaction.info
