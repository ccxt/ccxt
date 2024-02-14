- [Multiple Subscriptions Watchxforsymbols](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
from random import randint
import sys
from pprint import pprint


import ccxt.pro as ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.binance({})


async def watch_multiple_trades(symbols):
    while True:
        trades = await exchange.watch_trades_for_symbols(symbols)
        print(f'trade: {trades[0]["symbol"], trades[0]["price"]}')


async def watch_multiple_orderbooks(symbols):
    while True:
        orderbooks = await exchange.watch_order_book_for_symbols(symbols)
        print(f'orderbook bid: {orderbooks["symbol"]}{orderbooks["bids"][0]}')



async def watch_multiple_ohlcv(symbols):
    while True:
        ohlcv = await exchange.watch_ohlcv_for_symbols(symbols)
        print(f'ohlcv: {ohlcv}')



async def example_1():

    await asyncio.gather(
        watch_multiple_trades(['BTC/USDT', 'ADA/USDT', 'ETH/USDT']),
        watch_multiple_orderbooks(['BTC/USDT', 'ETH/USDT']),
        watch_multiple_ohlcv([['BTC/USDT', '1m'], ['LTC/USDT', '1m']]),
    )
async def main():
    try:
        await example_1()
    except Exception as e:
        print(e)
    await exchange.close()


asyncio.run(main())
 
```