# -*- coding: utf-8 -*-

import os
import sys
import asyncio

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402

exchanges = {}  # a placeholder for your instances

for id in ccxt.exchanges:
    exchange = getattr(ccxt, id)
    exchanges[id] = exchange()

# now exchanges dictionary contains all exchange instances...
asyncio.get_event_loop().run_until_complete(exchanges['bittrex'].fetch_order_book('ETH/BTC'))
