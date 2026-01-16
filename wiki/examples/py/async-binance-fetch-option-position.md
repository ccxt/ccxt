- [Async Binance Fetch Option Position](./examples/py/)


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
    market_id = 'ETH-221028-1700-C'
    symbol = 'ETH/USDT:USDT-221028-1700-C'
    try:
        response = await exchange.fetch_position(symbol)
        # Implicit API:
        # response = await exchange.eapiPrivateGetPosition({
        #     # 'symbol': market_id,  # optional
        # })
        pprint(response)
    except Exception as e:
        print('fetch_position() failed')
        print(e)
    await exchange.close()


asyncio.run(main())
 
```