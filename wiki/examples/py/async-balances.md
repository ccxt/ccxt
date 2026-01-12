- [Async Balances](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def test(exchange):
    print(await exchange.fetch_balance())
    await exchange.close()


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

[asyncio.ensure_future(test(exchange)) for exchange in [kraken, bitfinex]]
pending = asyncio.Task.all_tasks()
loop = asyncio.get_event_loop()
loop.run_until_complete(asyncio.gather(*pending))
 
```