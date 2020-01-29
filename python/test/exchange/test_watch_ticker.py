# -*- coding: utf-8 -*-

from exchange.test_ticker import test_ticker


async def test_watch_ticker(exchange, symbol):
    # todo add real ticker tests here
    # log (symbol.green, 'watching order book...')
    method = 'watchTicker'
    if exchange.has[method]:
        response = None
        for i in range(0, 5):
            response = await getattr(exchange, method)(symbol)
            test_ticker(exchange, response, method, symbol)
        return response
    else:
        print(method, 'not supported')


__all__ = ['test_watch_ticker']
