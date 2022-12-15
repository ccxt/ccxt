# -*- coding: utf-8 -*-


def test_account(exchange, account, method):
    format = {
        'info': {},
        'code': 'BTC',
        # 'name': 'account name',
        'type': 'spot',  # 'spot', 'margin', 'futures', 'swap'
        'id': '12345',
    }
    keys = list(format.keys())
    for i in range(0, len(keys)):
        key = keys[i]
        keyInAccount = (key in account)
        assert keyInAccount, exchange.id + ' ' + method + ' ' + key + ' missing from response'

    accountKeys = list(account.keys())
    assert len(keys) == len(accountKeys), exchange.id + ' ' + method + ' respone includes more keys than expected'
    assert isinstance(account['info'], dict)
    assert account['id'] is None or isinstance(account['id'], str)
    # assert account['name'] is None or isinstance(account['name'], str)
    assert account['type'] is None or isinstance(account['type'], str)
    assert account['code'] is None or isinstance(account['code'], str)
