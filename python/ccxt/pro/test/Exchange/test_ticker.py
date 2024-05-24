# -*- coding: utf-8 -*-

__all__ = ['test_ticker']


def test_ticker(exchange, ticker, method, symbol):
    print(
        exchange.id,
        symbol,
        method,
        ticker['datetime'],
        ticker['last']
    )
