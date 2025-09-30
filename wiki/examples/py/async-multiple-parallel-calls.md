- [Async Multiple Parallel Calls](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys



import ccxt.async_support as ccxt
from asyncio import run, gather

print('CCXT Version:', ccxt.__version__)

# This example demonstrates how to execute multiple requests asynchronously.
# The requests will be executed in parallel independently of each other.
# In order to let them run in parallel the user has to disable the rate limiter.
# Disabling the rate limiter is not recommended, unless you really know
# what you are doing! If you are too aggressive with your requests and
# you don't do proper request timing precisely, the exchange can ban you!
# https://github.com/ccxt/ccxt/wiki/
# https://github.com/ccxt/ccxt/wiki/Manual
# https://github.com/ccxt/ccxt/wiki/Manual#rate-limit


async def main():
    exchange = ccxt.ftx({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'enableRateLimit': False,  # not recommended
    })
    markets = await exchange.load_markets()
    # exchange.verbose = True  # uncomment for debugging purposes
    symbol = 'BTC/USDT'
    loops = [
        exchange.fetch_balance(),
        exchange.fetch_order_book(symbol),
        exchange.fetch_open_orders()
    ]
    results = await gather(*loops)
    print('Balance:')
    print(results[0])
    print('------------------------------------------------------------------')
    print(symbol, 'orderbook:')
    print(results[1])
    print('------------------------------------------------------------------')
    print('Open orders:')
    print(results[2])
    await exchange.close()


run(main())
 
```