# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def test():
    bitfinex = ccxt.bitfinex({
        'apiKey': "4FlEDtxDl35gdEiobnfZ72vJeZteE4Bb7JdvqzjIjHq",
        'secret': "D4DXM8DZdHuAq9YptUsb42aWT1XBnGlIJgLi8a7tzFH",
        'verbose': True,  # switch it to False if you don't want the HTTP log
    })
    print(await bitfinex.public_get_symbols())
    await bitfinex.close()

loop = asyncio.get_event_loop()
loop.run_until_complete(test())
