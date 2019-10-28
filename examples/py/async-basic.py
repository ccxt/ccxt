# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def test_binance():
    binance = ccxt.binance()
    markets = await binance.load_markets()
    await binance.close()
    return markets

if __name__ == '__main__':
    print(asyncio.get_event_loop().run_until_complete(test_binance()))
