```python
# -*- coding: utf-8 -*-

from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run
import os
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402


async def main():
    exchange = ccxt.binance({
        'apiKey': 'YOUR_API_KEY',
        'secret': 'YOUR_SECRET',
        # 'verbose': True,  # for debug output
    })
    await exchange.load_markets()
    code = 'BTC'
    amount = 1
    currency = exchange.currency(code)
    try:
        response = await exchange.sapi_post_margin_loan({
            'asset': currency['id'],
            'amount': exchange.currency_to_precision(code, amount)
        })
        pprint(response)
    except ccxt.InsufficientFunds as e:
        print('sapi_post_margin_loan() failed – not enough funds')
        print(e)
    except Exception as e:
        print('sapi_post_margin_loan() failed')
        print(e)
    await exchange.close()


run(main())

```
