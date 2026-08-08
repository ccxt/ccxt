```python
# -*- coding: utf-8 -*-

from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def poll():
    exchange = ccxt.poloniex()
    while True:
        yield await exchange.fetch_ticker('ETH/BTC')


async def main():
    async for ticker in poll():
        print(ticker)


run(main())

```
