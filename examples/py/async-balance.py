# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def test():
    bittrex = ccxt.bittrex({
        'apiKey': "c5af1d0ceeaa4729ad87da1b05d9dfc3",
        'secret': "d055d8e47fdf4c3bbd0ec6c289ea8ffd",
        'verbose': True,  # switch it to False if you don't want the HTTP log
    })
    print(await bittrex.fetch_balance())


asyncio.get_event_loop().run_until_complete(test())
