```python
# -*- coding: utf-8 -*-

from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run
import os
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


async def main():
    exchange = ccxt.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        "options": {
            "fetchBalance": "margin",
        },
        # set verbose mode to True for debugging output
        # 'verbose': True,
    })
    while True:
        try:
            balance = await exchange.fetch_balance()
            pprint(balance)
        except Exception as e:
            print('fetch_balance() failed')
            print(e)
            break
    await exchange.close()


run(main())

```
