# -*- coding: utf-8 -*-

__all__ = ['test_ohlcv']


def test_ohlcv(exchange, ohlcv, method, symbol):

    assert isinstance(ohlcv, list)
    assert len(ohlcv) >= 6

    assert isinstance(ohlcv[0], int)  # timestamp

    assert ohlcv[0] > 1230940800000  # 03 Jan 2009 - first block
    assert ohlcv[0] < 2147483648000  # 19 Jan 2038 - int32 overflows

    assert (ohlcv[1] is None) or isinstance(ohlcv[1], (int, float))  # open
    assert (ohlcv[2] is None) or isinstance(ohlcv[2], (int, float))  # high
    assert (ohlcv[3] is None) or isinstance(ohlcv[3], (int, float))  # low
    assert (ohlcv[4] is None) or isinstance(ohlcv[4], (int, float))  # close
    assert (ohlcv[5] is None) or isinstance(ohlcv[5], (int, float))  # volume

    skipped_exchanges = [
        'bitmex',
    ]

    if exchange.id not in skipped_exchanges:
        assert (ohlcv[1] is None) or (ohlcv[2] is None) or (ohlcv[1] <= ohlcv[2]), \
            'open (' + str(ohlcv[1]) + ') > high (' + str(ohlcv[2]) + ')'
        assert (ohlcv[3] is None) or (ohlcv[2] is None) or (ohlcv[3] <= ohlcv[2]), \
            'low (' + str(ohlcv[1]) + ') > high (' + str(ohlcv[2]) + ')'
        assert (ohlcv[3] is None) or (ohlcv[4] is None) or (ohlcv[3] <= ohlcv[4]), \
            'low (' + str(ohlcv[1]) + ') > close (' + str(ohlcv[2]) + ')'
