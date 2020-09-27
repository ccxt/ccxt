# -*- coding: utf-8 -*-

from exchange.test_ohlcv import test_ohlcv
from ccxt import NetworkError
# from exchange.table import table


async def test_watch_ohlcv(exchange, symbol):
    # todo add real ohlcv tests here
    # log (symbol.green, 'watching ohlcvs...')
    method = 'watchOHLCV'

    skipped_exchanges = [
        'dsx',
        'idex2',  # rinkeby testnet, trades too rare
    ]

    if exchange.id in skipped_exchanges:
        print(exchange.id, method, 'skipped')
        return

    try:
        timeframe = list(exchange.timeframes.keys())[0]
    except Exception:
        timeframe = '1d'
    limit = 10
    duration = exchange.parse_timeframe(timeframe)
    since = exchange.milliseconds() - duration * limit * 1000 - 1000
    if (method in exchange.has) and exchange.has[method]:
        response = None
        now = exchange.milliseconds()
        end = now + 15000
        while now < end:
            try:
                ohlcvs = await getattr(exchange, method)(symbol, timeframe, since, limit)
                now = exchange.milliseconds()
                print(exchange.iso8601(now), symbol, timeframe, len(ohlcvs), 'ohlcvs')
                for ohlcv in ohlcvs:
                    test_ohlcv(exchange, ohlcv, method, symbol)
                # print(table([[exchange.iso8601(o[0])] + o[1:] for o in ohlcvs]))
            except NetworkError:
                now = exchange.milliseconds()
        return response
    else:
        print(exchange.id, method, 'is not supported or not implemented yet')


__all__ = ['test_watch_ohlcv']
