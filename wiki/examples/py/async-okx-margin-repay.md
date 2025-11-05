- [Async Okx Margin Repay](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


async def main():
    exchange = ccxt.okx({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # okx requires this: https://github.com/ccxt/ccxt/wiki/Manual#authentication
        'password': 'YOUR_API_PASSWORD',
        # 'verbose': True,  # for debug output
    })
    await exchange.load_markets()
    code = 'BTC'
    amount = 1
    order_id = 'YOUR_ORDER_ID_FROM_BORROWING'
    try:
        response = await exchange.repayCrossMargin(code, amount, {
            'ordId': order_id,
        })
        pprint(response)
    except ccxt.InsufficientFunds as e:
        print('repayCrossMargin() failed – not enough funds')
        print(e)
    except Exception as e:
        print('repayCrossMargin() failed')
        print(e)
    await exchange.close()


asyncio.run(main())
 
```