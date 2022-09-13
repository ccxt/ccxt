# -*- coding: utf-8 -*-

from exchange.test_ticker import test_ticker
from ccxt import NetworkError


async def test_watch_ticker(exchange, symbol):
    # todo add real ticker tests here
    # log (symbol.green, 'watching order book...')
    method = 'watchTicker'
    # we have to skip some exchanges here due to the frequency of trading
    skipped_exchanges = [
        'ripio',
        'mexc'
    ]
    if exchange.id in skipped_exchanges:
        print(exchange.id, method, 'test skipped')
        return
    if (method in exchange.has) and exchange.has[method]:
        response = None
        now = exchange.milliseconds()
        end = now + 10000
        while now < end:
            try:
                response = await getattr(exchange, method)(symbol)
                now = exchange.milliseconds()
                test_ticker(exchange, response, method, symbol)
            except NetworkError:
                now = exchange.milliseconds()
        return response
    else:
        print(exchange.id, method + '() is not supported or not implemented yet')


__all__ = ['test_watch_ticker']
