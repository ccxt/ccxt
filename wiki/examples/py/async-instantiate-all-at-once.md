- [Async Instantiate All At Once](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
import asyncio


import ccxt.async_support as ccxt  # noqa: E402

exchanges = {}  # a placeholder for your instances


async def main():
    for id in ccxt.exchanges:
        exchange = getattr(ccxt, id)
        exchanges[id] = exchange()
    # now exchanges dictionary contains all exchange instances...
    print(await exchanges['bittrex'].fetch_order_book('ETH/BTC'))
    # close the aiohttp session object
    for id in exchanges:
        await exchanges[id].close()

asyncio.run(main())
 
```