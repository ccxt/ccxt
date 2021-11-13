# -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def test(id, symbol):
    exchange = getattr(ccxt, id)({
        'enableRateLimit': True,  # required according to the Manual
    })
    ticker = await exchange.fetch_ticker(symbol)
    await exchange.close()
    return ticker

if __name__ == '__main__':
    id = 'binance'
    symbol = 'ETH/BTC'
    pprint(asyncio.get_event_loop().run_until_complete(test(id, symbol)))
