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
        # 'verbose': True,  # for debug output
    })
    await exchange.load_markets()
    market_id = 'ETH-221028-1700-C'
    try:
        response = await exchange.eapiPrivateGetPosition({
            # 'symbol': market_id,  # optional
        })
        pprint(response)
    except Exception as e:
        print('eapiPrivateGetPosition() failed')
        print(e)
    await exchange.close()


asyncio.run(main())
