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


async def main():
    symbol = 'BTC/USD'

    print('Beginning tests')
    bitfinex = ccxt.bitfinex()
    bitfinex.verbose = True
    # for symbol, symbol_info in bitfinex.markets.items():
    #     print(symbol_info['id'])
    # for sym in bitfinex.symbols:
    #     print('Testing symbol {0}'.format(sym))
    #     bitfinex.subscribe_order_book(sym)
    await bitfinex.subscribe_order_book(symbol)
    print('Finished tests')


# ------------------------------------------------------------------------------


asyncio.get_event_loop().run_until_complete(main())
