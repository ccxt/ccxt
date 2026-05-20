- [Async Binance Fetch Option Orderbook](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-
# This example uses the implicit API, in the future we will have options unified which will make things easier.
# You can check if the unified methods are ready-to-use (createOrder, fetchOrder etc) by checking: `is_unified = exchange.has['option']`

import asyncio
import os
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


async def main():
    exchange = ccxt.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # 'verbose': True,  # for debug output
    })
    await exchange.load_markets()
    market_id = 'ETH-221028-1500-C'
    symbol = 'ETH/USDT:USDT-221028-1500-C'
    limit = 10
    try:
        response = await exchange.fetch_order_book(symbol, limit)
        # Implicit API:
        # response = await exchange.eapiPublicGetDepth({
        #     'symbol': market_id,
        #     # 'limit': limit,  # optional
        # })
        pprint(response)
    except Exception as e:
        print('fetch_order_book() failed')
        print(e)
    await exchange.close()


asyncio.run(main())
 
```