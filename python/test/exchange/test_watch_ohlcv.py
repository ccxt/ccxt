# -*- coding: utf-8 -*-

from exchange.test_ohlcv import test_ohlcv


def as_table(values):
    widths = [max([len(str(v[i])) for v in values]) for i in range(0, len(values[0]))]
    string = ' | '.join(['{:<' + str(w) + '}' for w in widths])
    return "\n".join([string.format(*v) for v in values])


async def test_watch_ohlcv(exchange, symbol):
    # todo add real ohlcv tests here
    # log (symbol.green, 'watching ohlcvs...')
    method = 'watchOHLCV'
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
        end = now + 60000
        while now < end:
            print('-----------------------------------------------------------')
            ohlcvs = await getattr(exchange, method)(symbol, timeframe, since, limit)
            now = exchange.milliseconds()
            print(exchange.iso8601(now), symbol, timeframe)
            for ohlcv in ohlcvs:
                test_ohlcv(exchange, ohlcv, method, symbol)
            print(as_table([[exchange.iso8601(o[0])] + o[1:] for o in ohlcvs]))
        return response
    else:
        print(exchange.id, method, 'is not supported or not implemented yet')


__all__ = ['test_watch_ohlcv']
