# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402

exchange = ccxt.poloniex({
    'enableRateLimit': True,  # don't remove this line or they might ban you: https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
})


async def poll():
    while True:
        yield await exchange.fetch_ticker('ETH/BTC')


async def main():
    async for ticker in poll():
        print(ticker)


asyncio.get_event_loop().run_until_complete(main())
