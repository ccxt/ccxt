```python
# -*- coding: utf-8 -*-

import asyncio
from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run
import ccxt.async_support as ccxt


async def poll(tickers):
    i = 0
    kraken = ccxt.kraken()
    while True:
        symbol = tickers[i % len(tickers)]
        yield (symbol, await kraken.fetch_ticker(symbol))
        i += 1
        await asyncio.sleep(kraken.rateLimit / 1000)


async def main():
    async for (symbol, ticker) in poll(['BTC/USD', 'ETH/BTC', 'BTC/EUR']):
        print(symbol, ticker)


run(main())

```
