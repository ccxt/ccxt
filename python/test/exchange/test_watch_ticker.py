# -*- coding: utf-8 -*-

from exchange.test_ticker import test_ticker


async def test_watch_ticker(exchange, symbol):
    # todo add real ticker tests here
    # log (symbol.green, 'watching order book...')
    method = 'watchTicker'
    if (method in exchange.has) and exchange.has[method]:
        response = None
        now = exchange.milliseconds()
        end = now + 20000
        while now < end:
            response = await getattr(exchange, method)(symbol)
            now = exchange.milliseconds()
            test_ticker(exchange, response, method, symbol)
        return response
    else:
        print(exchange.id, method, 'is not supported or not implemented yet')


__all__ = ['test_watch_ticker']
