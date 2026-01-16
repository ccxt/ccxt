- [Async Bybit Transfer](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


async def main():
    exchange = ccxt.bybit({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # 'verbose': True,  # for debug output
    })
    await exchange.load_markets()
    try:
        pprint(await exchange.fetch_transfers())  # Fetch your transfer history
        # pprint(await exchange.transfer('USDT', 1.0, 'swap', 'spot'))  # Transfer to the spot wallet
        # pprint(await exchange.transfer('USDT', 1.0, 'spot', 'future'))  # Transfer to the Derivatives wallet
        # pprint(await exchange.transfer('USDT', 1.0, 'spot', 'swap'))  # Transfer to the Derivatives wallet
        # pprint(await exchange.transfer('USDC', 1.0, 'spot', 'option'))  # Transfer to the USDC Derivatives wallet
    except Exception as e:
        print(e)
    await exchange.close()


asyncio.run(main())
 
```