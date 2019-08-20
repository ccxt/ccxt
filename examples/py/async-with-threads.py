# -*- coding: utf-8 -*-

import asyncio
import threading
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def test(loop):
    exchange = ccxt.bittrex({
        'asyncio_loop': loop,
        'enableRateLimit': True,  # as required by https://github.com/ccxt/ccxt/wiki/Manual#rate-limit
    })
    print(await exchange.fetch_ticker('ETH/BTC'))
    await exchange.close()


def functionInNewThread():
    loop = asyncio.new_event_loop()
    loop.run_until_complete(test(loop))

thread = threading.Thread(target=functionInNewThread)
thread.start()
thread.join()