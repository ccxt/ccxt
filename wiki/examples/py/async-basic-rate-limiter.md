```python
# -*- coding: utf-8 -*-

from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def main():
    exchange = ccxt.binance()
    for i in range(0, 100):
        # this can be any call instead of fetch_ticker, really
        print(await exchange.fetch_ticker('ETH/BTC'))
    await exchange.close()


run(main())

```
