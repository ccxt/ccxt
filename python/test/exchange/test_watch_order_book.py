# -*- coding: utf-8 -*-

from exchange.test_order_book import test_order_book
from ccxt import NetworkError


async def test_watch_order_book(exchange, symbol):
    # log (symbol.green, 'watching order book...')
    method = 'watchOrderBook'
    # we have to skip some exchanges here due to the frequency of trading
    skipped_exchanges = [
        'ripio',
    ]
    if exchange.id in skipped_exchanges:
        print(exchange.id, method, 'test skipped')
        return
    if (method in exchange.has) and exchange.has[method]:
        response = None
        now = exchange.milliseconds()
        end = now + 20000
        while now < end:
            try:
                response = await getattr(exchange, method)(symbol)
                now = exchange.milliseconds()
                test_order_book(exchange, response, method, symbol)
            except NetworkError:
                now = exchange.milliseconds()
        return response
    else:
        print(method, 'not supported')


__all__ = ['test_watch_order_book']
