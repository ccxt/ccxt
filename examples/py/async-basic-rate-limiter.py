# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def main():
    exchange = ccxt.binance()
    for i in range(0, 100):
        # this can be any call instead of fetch_ticker, really
        print(await exchange.fetch_ticker('ETH/BTC'))
    await exchange.close()


asyncio.run(main())
