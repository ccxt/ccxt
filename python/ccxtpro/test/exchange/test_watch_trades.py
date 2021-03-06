# -*- coding: utf-8 -*-

from ccxt import NetworkError, test


async def test_watch_trades(exchange, symbol):

    method = 'watchTrades'

    skipped_exchanges = [
        'binanceje',  # does not have trades frequently enough to pass the test
        'bitvavo',
        'dsx',
        'currencycom',
        'idex2',  # rinkeby testnet, trades too rare
        'ripio',
    ]

    if exchange.id in skipped_exchanges:
        print(exchange.id, method, 'skipped')
        return

    if (method in exchange.has) and exchange.has[method]:
        response = None
        now = exchange.milliseconds()
        end = now + 15000
        while now < end:
            try:
                # print('-----------------------------------------------------------')
                trades = await getattr(exchange, method)(symbol)
                now = exchange.milliseconds()
                print(exchange.iso8601(now), symbol, len(trades), 'trades')
                for trade in trades:
                    test.test_trade(exchange, trade, symbol, now)
                # print(table([exchange.omit(t, ['info', 'timestamp']) for t in trades]))
            except NetworkError:
                now = exchange.milliseconds()
        return response
    else:
        print(exchange.id, method, 'is not supported or not implemented yet')


__all__ = ['test_watch_trades']
