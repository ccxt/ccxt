- [Async Ticker](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
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
    pprint(asyncio.run(test(id, symbol)))
 
```