# -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def main(asyncio_loop):
    exchange = ccxt.okex({
        'asyncio_loop': asyncio_loop,
        'enableRateLimit': True,
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # okex requires this: https://github.com/ccxt/ccxt/wiki/Manual#authentication
        'password': 'YOUR_API_PASSWORD',
        # 'verbose': True,  # for debug output
    })
    try:
        # change the values here
        symbol = 'BTC/USDT'
        price = 123.45
        amount = 54.321
        type = 'limit'  # or market
        side = 'sell'
        order = await exchange.create_order(symbol, type, side, amount, price, {
            'margin_trading': '2',
        })
        pprint(order)
    except ccxt.InsufficientFunds as e:
        print('create_order() failed – not enough funds')
        print(e)
    except Exception as e:
        print('create_order() failed')
        print(e)
    await exchange.close()

if __name__ == '__main__':
    asyncio_loop = asyncio.get_event_loop()
    asyncio_loop.run_until_complete(main(asyncio_loop))
