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
    symbol = 'ETH/USDT:USDT-221028-1700-C'
    since = 1677102900000
    limit = 10
    order_id = 4612098335294532880
    try:
        response = await exchange.fetch_open_orders(symbol, since, limit)
        # Implicit API:
        # response = await exchange.eapiPrivateGetOpenOrders({
        #     # 'symbol': market_id,  # optional
        #     # 'orderId': order_id,  # optional
        # })
        pprint(response)
    except Exception as e:
        print('fetch_open_orders() failed')
        print(e)
    await exchange.close()


asyncio.run(main())
