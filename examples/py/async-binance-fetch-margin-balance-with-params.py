# -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def main():
    exchange = ccxt.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
    })
    while True:
        try:
            balance = await exchange.fetch_balance({'type': 'margin'})
            pprint(balance)
        except Exception as e:
            print('fetch_balance() failed')
            print(e)
            break
    await exchange.close()


asyncio.run(main())
