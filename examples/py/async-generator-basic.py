# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async as ccxt  # noqa: E402

exchange = ccxt.poloniex({
    'enableRateLimit': true,
})


async def poll():
    while True:
        yield await exchange.fetch_ticker('BTC/USD')


async def main():
    async for ticker in poll():
        print(ticker)


asyncio.get_event_loop().run_until_complete(main())
