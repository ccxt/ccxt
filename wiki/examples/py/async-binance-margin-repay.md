- [Async Binance Margin Repay](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


async def main():
    exchange = ccxt.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        'verbose': True,  # for debug output
    })
    await exchange.load_markets()
    code = 'BTC'
    amount = 1
    currency = exchange.currency(code)
    try:
        response = await exchange.sapi_post_margin_repay({
            'asset': currency['id'],
            'amount': exchange.currency_to_precision(code, amount)
        })
        pprint(response)
    except Exception as e:
        print('sapi_post_margin_repay() failed')
        print(e)
    await exchange.close()


asyncio.run(main())
 
```