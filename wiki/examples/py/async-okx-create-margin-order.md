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
    exchange = ccxt.okx({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # okx requires this: https://github.com/ccxt/ccxt/wiki/Manual#authentication
        'password': 'YOUR_API_PASSWORD',
        # 'verbose': True,  # for debug output
    })
    try:
        # change the values here
        symbol = 'BTC/USDT'
        price = 123.45
        amount = 54.321
        type = 'limit'  # or market
        side = 'sell'
        order = await exchange.create_order(symbol, type, side, amount, price, {
            'margin': True,
            'marginMode': 'cross',
        })
        pprint(order)
    except ccxt.InsufficientFunds as e:
        print('create_order() failed – not enough funds')
        print(e)
    except Exception as e:
        print('create_order() failed')
        print(e)
    await exchange.close()


run(main())

```
