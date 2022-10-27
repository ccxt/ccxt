# -*- coding: utf-8 -*-


import numbers  # noqa E402


def test_margin_modification(exchange, marginModification):
    format = {
        info: {},
        type: 'add',
        amount: 0.1,
        total: 0.29934828,
        code: 'USDT',
        symbol: 'ADA/USDT:USDT',
        status: 'ok',
    }
    keys = list(format.keys())
    for i in range(0, len(keys)):
        assert keys[i] in marginModification

    assert isinstance(marginModification['info'], dict)
    if marginModification['type'] is not None:
        assert marginModification['type'] == 'add' or marginModification['type'] == 'reduce' or marginModification['type'] == 'set'

    if marginModification['amount'] is not None:
        assert isinstance(marginModification['amount'], numbers.Real)

    if marginModification['total'] is not None:
        assert isinstance(marginModification['total'], numbers.Real)

    if marginModification['code'] is not None:
        assert isinstance(marginModification['code'], str)

    if marginModification['symbol'] is not None:
        assert isinstance(marginModification['symbol'], str)

    if marginModification['status'] is not None:
        assert exchange.in_array(marginModification['status'], ['ok', 'pending', 'canceled', 'failed'])
