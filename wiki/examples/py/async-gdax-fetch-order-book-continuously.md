- [Async Gdax Fetch Order Book Continuously](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def main(symbol):
    exchange = ccxt.binance()
    while True:
        print('--------------------------------------------------------------')
        print(exchange.iso8601(exchange.milliseconds()), 'fetching', symbol, 'ticker from', exchange.name)
        # this can be any call really
        ticker = await exchange.fetch_order_book(symbol)
        print(exchange.iso8601(exchange.milliseconds()), 'fetched', symbol, 'ticker from', exchange.name)
        print(ticker)


asyncio.run(main('BTC/USDT'))
 
```