# -*- coding: utf-8 -*-

import asyncio
import threading
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def test(loop):
    bittrex = ccxt.bittrex({
        'asyncio_loop': loop,
    })
    print(await bittrex.fetch_ticker('ETH/BTC'))
    await bittrex.close()


def functionInNewThread():
    asyncio.set_event_loop(asyncio.new_event_loop())
    loop = asyncio.get_event_loop()
    loop.run_until_complete(test(loop))

thread = threading.Thread(target=functionInNewThread)
thread.start()
thread.join()