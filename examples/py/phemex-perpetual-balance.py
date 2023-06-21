# -*- coding: utf-8 -*-

from asyncio import run
import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402

print('CCXT Version:', ccxt.__version__)

async def main():
    exchange = ccxt.phemex({
        "apiKey": "YOUR_API_KEY",
        "secret": "YOUR_SECRET",
        'options': { 'defaultType': 'swap' }
    })
    markets = await exchange.load_markets()
    # exchange.verbose = True  # uncomment for debugging purposes if necessary
    usd_balance = await exchange.fetch_balance({'code': 'USD'})
    btc_balance = await exchange.fetch_balance({'code': 'BTC'})
    balance = exchange.deep_extend(usd_balance, btc_balance)
    pprint(balance)
    await exchange.close()


run(main())
