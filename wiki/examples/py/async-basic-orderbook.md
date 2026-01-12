- [Async Basic Orderbook](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def test():

    exchange = ccxt.okex({
        # 'proxy': 'https://cors-anywhere.herokuapp.com/',
        # 'origin': 'foobar',  # when using CORS proxies, set this to some random string
    })

    try:
        orderbook = await exchange.fetch_order_book('BTC/USDT')
        await exchange.close()
        return orderbook
    except ccxt.BaseError as e:
        print(type(e).__name__, str(e), str(e.args))
        raise e


asyncio.run(test())
 
```