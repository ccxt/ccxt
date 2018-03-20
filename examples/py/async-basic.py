# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async as ccxt  # noqa: E402


async def test_gdax():
    gdax = ccxt.gdax()
    return await gdax.load_markets()


print(asyncio.get_event_loop().run_until_complete(test_gdax()))
