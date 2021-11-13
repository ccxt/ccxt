# -*- coding: utf-8 -*-

import asyncio
import os
import sys

if not sys.version >= '3.6':
    print('This script requires Python 3.6+')
    sys.exit()

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def poll():
    exchange = ccxt.theocean()
    while True:
        yield await exchange.fetch_order_book('WETH/TUSD')
        await asyncio.sleep(exchange.rateLimit / 1000)


async def main():
    async for orderbook in poll():
        print(orderbook['bids'][0], orderbook['asks'][0])


asyncio.run(main())
