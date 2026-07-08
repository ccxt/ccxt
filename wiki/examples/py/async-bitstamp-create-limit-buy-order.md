```python
# -*- coding: utf-8 -*-

from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def test():

    exchange = ccxt.bitstamp({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })

    response = None

    try:

        await exchange.load_markets()  # force-preload markets first

        exchange.verbose = True  # this is for debugging

        symbol = 'BTC/USD'  # change for your symbol
        amount = 1.0        # change the amount
        price = 6000.00     # change the price

        try:

            response = await exchange.create_limit_buy_order(symbol, amount, price)

        except Exception as e:
            print('Failed to create order with', exchange.id, type(e).__name__, str(e))

    except Exception as e:
        print('Failed to load markets from', exchange.id, type(e).__name__, str(e))

    await exchange.close()
    return response


print(run(test()))

```
