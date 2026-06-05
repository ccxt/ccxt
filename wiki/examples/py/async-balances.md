```python
# -*- coding: utf-8 -*-

import asyncio
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def test(exchange):
    print(await exchange.fetch_balance())
    await exchange.close()


async def main():
    kraken = ccxt.kraken({
        'apiKey': "YOUR_API_KEY",
        'secret': "YOUR_SECRET",
        'verbose': True,  # switch it to False if you don't want the HTTP log
    })
    bitfinex = ccxt.bitfinex({
        'apiKey': "YOUR_API_KEY",
        'secret': "YOUR_SECRET",
        'verbose': True,  # switch it to False if you don't want the HTTP log
    })
    await asyncio.gather(*[test(exchange) for exchange in [kraken, bitfinex]])


asyncio.run(main())

```
