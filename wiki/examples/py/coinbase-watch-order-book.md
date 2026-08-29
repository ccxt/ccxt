```python
# -*- coding: utf-8 -*-

# Prefer watchOrderBook over polling fetchOrderBook in a loop: the level2
# WebSocket channel streams incremental updates instead of re-fetching the full
# product_book over REST on every tick.

import ccxt.pro
from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run

async def main():
    exchange = ccxt.pro.coinbase()
    method = 'watchOrderBook'
    print('CCXT Pro version', ccxt.pro.__version__)
    if exchange.has[method]:
        while True:
            try:
                orderbook = await exchange.watch_order_book('BTC/USD')
                print(exchange.iso8601(exchange.milliseconds()), orderbook['symbol'], 'bid', orderbook['bids'][0], 'ask', orderbook['asks'][0])
            except Exception as e:
                # stop
                await exchange.close()
                raise e
                # or retry
                # pass
    else:
        raise Exception(exchange.id + ' ' + method + ' is not supported or not implemented yet')


run(main())

```
