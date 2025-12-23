- [Async Bittrex Orderbook](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys

if not sys.version >= '3.6':
    print('This script requires Python 3.6+')
    sys.exit()


import ccxt.async_support as ccxt  # noqa: E402


async def poll():
    exchange = ccxt.bittrex()
    while True:
        yield await exchange.fetch_order_book('BTC/USDT')
        await asyncio.sleep(exchange.rateLimit / 1000)


async def main():
    async for orderbook in poll():
        print(orderbook['bids'][0], orderbook['asks'][0])


asyncio.run(main())
 
```