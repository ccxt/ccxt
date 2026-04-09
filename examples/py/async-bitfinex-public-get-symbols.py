# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def test():
    bitfinex = ccxt.bitfinex({
        'apiKey': "YOUR_API_KEY",
        'secret': "YOUR_SECRET",
        'verbose': True,  # switch it to False if you don't want the HTTP log
    })
    print(await bitfinex.public_get_symbols())
    await bitfinex.close()


asyncio.run(test())
