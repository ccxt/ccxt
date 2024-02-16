- [Coinbase Create Order](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402
print('CCXT Version:', ccxt.__version__)
exchange = ccxt.coinbase({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    # 'verbose': True,  # for debug output
})

symbol = 'BTC/USDT'
order_type = 'limit'
side = 'buy'
amount = 0.0003
order_price = 13500
stop_params = {
    'triggerPrice': 15000
}

try:
    limit_order = exchange.create_order(symbol, order_type, side, amount, order_price)
    # stop_order = exchange.create_order(symbol, order_type, side, amount, order_price, stop_params)
    pprint(limit_order)
    # pprint(stop_order)
except Exception as err:
    print(err)
 
```