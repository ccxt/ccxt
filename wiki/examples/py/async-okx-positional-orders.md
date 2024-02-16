- [Async Okx Positional Orders](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
from pprint import pprint
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402
# or
# import ccxtpro as ccxt


print('CCXT Version:', ccxt.__version__)


async def main():
    exchange = ccxt.okx({
        'apiKey': 'YOUR_API_KEY',  # https://github.com/ccxt/ccxt/wiki/Manual#authentication
        'secret': 'YOUR_API_SECRET',
        'password': 'YOUR_API_PASSWORD',
        'options': {
            'defaultType': 'future',
        },
    })
    try:
        markets = await exchange.load_markets()
        exchange.verbose = True  # uncomment for debugging
        print('---------------------------------------------------------------')
        print('Futures balance:')
        futures_balance = await exchange.fetch_balance()
        pprint(futures_balance)
        print('---------------------------------------------------------------')
        print('Futures symbols:')
        print([market['symbol'] for market in markets.values() if market['future']])
        print('---------------------------------------------------------------')
        symbol = 'BTC/USDT:USDT-201225'  # a futures symbol
        market = exchange.market(symbol)
        pprint(market)
        print('---------------------------------------------------------------')
        type = '1'  # 1:open long 2:open short 3:close long 4:close short for futures
        side = None  # irrelevant for futures
        amount = 1  # how many contracts you want to buy or sell
        price = 17000  # limit price
        params = {
            # 'order_type': '4',  # uncomment for a market order, makes limit price irrelevant
            # 'leverage': '10',  # or '20'
        }
        order = await exchange.create_order(symbol, type, side, amount, price, params)
        print('Order:')
        pprint(order)
        print('---------------------------------------------------------------')
    except Exception as e:
        print(type(e).__name__, str(e))
    await exchange.close()


asyncio.run(main())
 
```