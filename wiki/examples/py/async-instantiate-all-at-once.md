```python
# -*- coding: utf-8 -*-

import os
import sys
from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run


import ccxt.async_support as ccxt  # noqa: E402

exchanges = {}  # a placeholder for your instances


async def main():
    for id in ccxt.exchanges:
        exchange = getattr(ccxt, id)
        exchanges[id] = exchange()
    # now exchanges dictionary contains all exchange instances...
    print(await exchanges['kucoin'].fetch_order_book('ETH/BTC'))
    # close the aiohttp session object
    for id in exchanges:
        await exchanges[id].close()

run(main())

```
