# -*- coding: utf-8 -*-

from exchange.test_order_book import test_order_book


async def test_watch_order_book(exchange, symbol):
    # log (symbol.green, 'watching order book...')
    method = 'watchOrderBook'
    if exchange.has[method]:
        orderbook = None
        for i in range(0, 10):
            orderbook = await getattr(exchange, method)(symbol)
            test_order_book(exchange, orderbook, method, symbol)
        return orderbook
    else:
        print(method, 'not supported')


__all__ = ['test_watch_order_book']
