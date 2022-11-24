# -*- coding: utf-8 -*-

import ccxt.pro
from asyncio import run

async def main():
    exchange = ccxt.pro.coinbasepro()
    method = 'watchTrades'
    print('CCXT Pro version', ccxt.pro.__version__)
    if exchange.has[method]:
        while True:
            try:
                trades = await exchange.watch_trades('BTC/USD')
                num_trades = len(trades)
                trade = trades[-1]
                print(exchange.iso8601(exchange.milliseconds()), trade['symbol'], trade['datetime'], trade['price'], trade['amount'], 'stored', num_trades, 'trades in cache')
            except Exception as e:
                # stop
                await exchange.close()
                raise e
                # or retry
                # pass
    else:
        raise Exception(exchange.id + ' ' + method + ' is not supported or not implemented yet')


run(main())
