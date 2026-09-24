# -*- coding: utf-8 -*-

# Prefer watchTicker over polling fetchTicker in a loop: a single WebSocket
# subscription streams live updates instead of hammering the REST ticker endpoint.

import ccxt.pro
from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run

async def main():
    exchange = ccxt.pro.coinbase()
    method = 'watchTicker'
    print('CCXT Pro version', ccxt.pro.__version__)
    if exchange.has[method]:
        while True:
            try:
                ticker = await exchange.watch_ticker('BTC/USD')
                print(exchange.iso8601(exchange.milliseconds()), ticker['symbol'], ticker['last'], ticker['bid'], ticker['ask'])
            except Exception as e:
                # stop
                await exchange.close()
                raise e
                # or retry
                # pass
    else:
        raise Exception(exchange.id + ' ' + method + ' is not supported or not implemented yet')


run(main())
