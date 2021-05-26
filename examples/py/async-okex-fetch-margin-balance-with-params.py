# -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def loop(exchange):
    while True:
        try:
            balance = await exchange.fetch_balance({
                'type': 'margin',
            })
            pprint(balance)
        except Exception as e:
            print('fetch_balance() failed')
            print(e)


async def main():
    exchange = ccxt.okex({
        'enableRateLimit': True,
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # okex requires this: https://github.com/ccxt/ccxt/wiki/Manual#authentication
        'password': 'YOUR_API_PASSWORD'
    })
    await loop(exchange)
    await exchange.close()

if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())
