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


def function_in_a_thread():
    # get_running_loop doesn't work inside a thread
    loop = asyncio.new_event_loop()
    run(test(loop))


def another_threaded_function():
    global_run(test(global_loop))


global_loop = asyncio.get_running_loop()
thread = threading.Thread(target=function_in_a_thread)
thread2 = threading.Thread(target=another_threaded_function)
thread.start()
thread2.start()
thread.join()
thread2.join()
