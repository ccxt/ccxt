- [Async Binance Create Trailing Percent Order](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


async def main():
    exchange = ccxt.binanceusdm({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # 'verbose': True,  # for debug output
    })
    try:
        # change the values here
        symbol = 'BTC/USDT:USDT'
        type = 'market'
        side = 'sell'
        amount = 0.1
        price = None
        order = await exchange.create_order(symbol, type, side, amount, price, {
            'trailingPercent': 5,
            'reduceOnly': True,
            # 'trailingTriggerPrice': 45000,
        })
        # Or you can call the create_trailing_percent_order method:
        # trailing_percent = 5
        # trailing_trigger_price = 45000
        # params = {
        #     'reduceOnly': True,
        # }
        # order = await exchange.create_trailing_percent_order (symbol, type, side, amount, price, trailing_percent, trailing_trigger_price, params)
        pprint(order)
    except ccxt.InsufficientFunds as e:
        print('create_order() failed - not enough funds')
        print(e)
    except Exception as e:
        print('create_order() failed')
        print(e)
    await exchange.close()


asyncio.run(main())
 
```