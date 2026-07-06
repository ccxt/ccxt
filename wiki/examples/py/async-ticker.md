```python
# -*- coding: utf-8 -*-

from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run
import os
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


async def test(id, symbol):
    exchange = getattr(ccxt, id)()
    ticker = await exchange.fetch_ticker(symbol)
    await exchange.close()
    return ticker


if __name__ == '__main__':
    id = 'binance'
    symbol = 'ETH/BTC'
    pprint(run(test(id, symbol)))

```
