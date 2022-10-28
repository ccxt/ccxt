# -*- coding: utf-8 -*-
# This example uses the implicit API, in the future we will have options unified which will make things easier.
# You can check if the unified methods are ready-to-use (createOrder, fetchOrder etc) by checking: `is_unified = exchange.has['option']`

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
        # 'verbose': True,  # for debug output
    })
    await exchange.load_markets()
    try:
        response = await exchange.eapiPrivatePostOrder({
            # ETH/USDT call option strike 1700 USDT expiry on 2022-10-28
            'symbol': 'ETH-221028-1700-C',
            'side': 'BUY',
            'type': 'LIMIT',
            'quantity': 1,
            'price': 2.1,
        })
        pprint(response)
    except ccxt.InsufficientFunds as e:
        print('eapiPrivatePostOrder() failed - not enough funds')
        print(e)
    except Exception as e:
        print('eapiPrivatePostOrder() failed')
        print(e)
    await exchange.close()


asyncio.run(main())
