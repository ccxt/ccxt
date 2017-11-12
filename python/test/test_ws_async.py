# -*- coding: utf-8 -*-

import argparse
import asyncio
import os
import sys
import json
import time
from os import _exit
from traceback import format_tb

# ------------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(root)

# ------------------------------------------------------------------------------

import ccxt.async.ws as ccxt  # noqa: E402

# ------------------------------------------------------------------------------
status_queue = asyncio.Queue(maxsize=1000)

# ------------------------------------------------------------------------------


async def status_monitor(status_queue):
    """ Monitor the latest async updates"""
    print('Listening for status')
    while 1:
        latest_status = await status_queue.get()
        # print('got a status')
        # print(latest_status)
        print('{0}.{1}\tExchange: {2}\tSymbol: {3}'.format(latest_status['datetime'][:-1],
                                                           str(latest_status['timestamp'] % 1)[2:5],
                                                           latest_status['exchange'],
                                                           latest_status['symbol']))
        status_queue.task_done()

# ------------------------------------------------------------------------------


async def main():

    asyncio.ensure_future(status_monitor(status_queue))

    print('Beginning tests')
    exchange = ccxt.bitfinex()
    exchange.verbose = True
    symbols_to_load = ['XRP/USD', 'BTC/USD', 'ETH/BTC', 'ETH/USD', 'LTC/BTC', 'LTC/USD']
    input_coroutines = [exchange.subscribe_order_book(symbol, status_queue=status_queue) for symbol in symbols_to_load]
    results = await asyncio.gather(*input_coroutines, return_exceptions=True)
    for result, symbol in zip(results, symbols_to_load):
        if isinstance(result, dict):
            print('ERROR loading Symbol: {0}, {1}'.format(symbol, result))

    await asyncio.sleep(3)

    for symbol in symbols_to_load:
        order_book = await exchange.fetchOrderBook(symbol)
        print('')
        print('Symbol: {0} OrderBook: {1}'.format(symbol, order_book))

    ### Fetch multiple order books & automatically subscribe to them
    # input_coroutines = [exchange.fetchOrderBook(symbol) for symbol in symbols_to_load]
    # results = await asyncio.gather(*input_coroutines, return_exceptions=True)
    # for result, symbol in zip(results, symbols_to_load):
    #     if result:
    #         print('')
    #         print(symbol)
    #         print(result)

    print('Finished tests')


# ------------------------------------------------------------------------------


asyncio.get_event_loop().run_until_complete(main())
