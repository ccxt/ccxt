# -*- coding: utf-8 -*-

__all__ = ['test_ticker']


def test_ticker(exchange, ticker, method, symbol):
    print(
        exchange.id,
        symbol,
        method,
        'last:', ticker['last'],
        '24h vol:', ticker['baseVolume'],
    )
