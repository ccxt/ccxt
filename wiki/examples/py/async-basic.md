```python
# -*- coding: utf-8 -*-

from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def test_binance():
    exchange = ccxt.binance()
    markets = await exchange.load_markets()
    await exchange.close()
    return markets


if __name__ == '__main__':
    print(run(test_binance()))

```
