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
    market_id = 'ETH-221028-1700-C'
    order_id = 4612100534317768959
    try:
        response = await exchange.eapiPrivateDeleteOrder({
            'symbol': market_id,
            'orderId': order_id,
        })
        pprint(response)
    except Exception as e:
        print('eapiPrivateDeleteOrder() failed')
        print(e)
    await exchange.close()


asyncio.run(main())
