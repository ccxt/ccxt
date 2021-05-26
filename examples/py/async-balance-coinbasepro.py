# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def test():
    exchange = ccxt.coinbasepro({
        'apiKey': "a43edfe629bc5991acc83a536ac6358e",
        'secret': "xOvq+iH8NT07TheFB/fmY3GcnMZMwP7Xct9zwWtAZxsCbJh8rxeEe/0BGxfbV2em7P9iqQD7/TJGqmsDO8B/kw==",
        'password': 'zdmj8o7byla',
        'verbose': True,  # switch it to False if you don't want the HTTP log
    })
    # move to sandbox
    exchange.urls['api'] = exchange.urls['test']
    print(await exchange.fetch_balance())


asyncio.get_event_loop().run_until_complete(test())
