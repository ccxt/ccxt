- [Async Generator Basic](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
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


asyncio.run(main())
 
```