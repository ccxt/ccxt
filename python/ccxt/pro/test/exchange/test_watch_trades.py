# -*- coding: utf-8 -*-

from ccxt import NetworkError
from ccxt.test.base import test_trade


async def test_watch_trades(exchange, symbol):

    method = 'watchTrades'

    skipped_exchanges = [
        'binanceje',  # does not have trades frequently enough to pass the test
        'bitvavo',
        'dsx',
        'currencycom',
        'idex2',  # rinkeby testnet, trades too rare
        'luno',  # requires authentication for watch_trades
        'ripio',
        'coinflex',  # too illiquid
        'woo',
        'independentreserve',  # too illiquid
    ]

    skipped_properties = {}

    if exchange.id in skipped_exchanges:
        print(exchange.id, method, 'skipped')
        return

    if (method in exchange.has) and exchange.has[method]:
        response = None
        now = exchange.milliseconds()
        end = now + 10000
        while now < end:
            try:
                # print('-----------------------------------------------------------')
                trades = await getattr(exchange, method)(symbol)
                now = exchange.milliseconds()
                print(exchange.iso8601(now), symbol, len(trades), 'trades')
                for trade in trades:
                    test_trade(exchange, skipped_properties, method, trade, symbol, now)
                # print(table([exchange.omit(t, ['info', 'timestamp']) for t in trades]))
            except NetworkError:
                now = exchange.milliseconds()
        return response
    else:
        print(exchange.id, method + '() is not supported or not implemented yet')


__all__ = ['test_watch_trades']
