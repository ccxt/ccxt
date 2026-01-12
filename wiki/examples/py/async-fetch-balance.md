- [Async Fetch Balance](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def test():
    exchange = ccxt.bitstamp({
        # "verbose": True,  # useful for debugging purposes, uncomment if needed
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'uid': 'YOUR_UID',
        # i'm adding a CORS proxy here, because my country is blocked by bitstamp
        # you don't need this, so it's safe to comment it out
        # "proxy": "https://cors-anywhere.herokuapp.com/",
        # "origin": "bitstamp"
    })
    print(await exchange.fetch_balance())
    await exchange.close()  # don't forget to close it when you're done
    return True

if __name__ == '__main__':
    print('CCXT version:', ccxt.__version__)
    print(asyncio.run(test()))
 
```