- [Async Balance Coinbasepro](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def test():
    exchange = ccxt.coinbasepro({
        'apiKey': "YOUR_API_KEY",
        'secret': "YOUR_SECRET",
        'password': "YOUR_PASSWORD",
        'verbose': True,  # switch it to False if you don't want the HTTP log
    })
    # move to sandbox
    exchange.urls['api'] = exchange.urls['test']
    print(await exchange.fetch_balance())


asyncio.run(test())
 
```