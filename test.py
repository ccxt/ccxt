# -*- coding: utf-8 -*-

from asyncio import get_event_loop, sleep
import aiohttp
from pprint import pprint

import os
import sys

root = os.path.dirname(os.path.abspath(__file__))
sys.path.append(root + '/python')

import ccxtpro
from ccxtpro.base.exchange import Exchange
from ccxtpro.base.future import Future
from ccxt.base.errors import NetworkError, RequestTimeout


# -----------------------------------------------------------------------------

async def test():
    symbol = 'ETH/BTC'
    exchange = ccxtpro.kraken({
        'enableRateLimit': True,
        # 'urls': {
        #     'api': {
        #         'ws': 'ws://127.0.0.1:8080',
        #     },
        # },
    })
    while True:
        try:
            response = await exchange.watch_order_book(symbol)
            print(Exchange.iso8601(Exchange.milliseconds()), len(response['asks']), 'asks', response['asks'][0], len(response['bids']), 'bids', response['bids'][0])
        except Exception as e:
            print('Error', e)
            await sleep(1)
    await exchange.close()

# -----------------------------------------------------------------------------

if __name__ == '__main__':
    print(get_event_loop().run_until_complete(test()))
