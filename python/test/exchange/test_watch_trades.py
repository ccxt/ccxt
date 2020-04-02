# -*- coding: utf-8 -*-

from exchange.test_trade import test_trade
# from exchange.table import table


async def test_watch_trades(exchange, symbol):
    # todo add real ohlcv tests here
    # log (symbol.green, 'watching ohlcvs...')
    method = 'watchTrades'
    if (method in exchange.has) and exchange.has[method]:
        response = None
        now = exchange.milliseconds()
        end = now + 20000
        while now < end:
            # print('-----------------------------------------------------------')
            trades = await getattr(exchange, method)(symbol)
            now = exchange.milliseconds()
            print(exchange.iso8601(now), symbol, len(trades), 'trades')
            for trade in trades:
                test_trade(exchange, trade, method, symbol)
            # print(table([exchange.omit(t, ['info', 'timestamp']) for t in trades]))
        return response
    else:
        print(exchange.id, method, 'is not supported or not implemented yet')


__all__ = ['test_watch_trades']
