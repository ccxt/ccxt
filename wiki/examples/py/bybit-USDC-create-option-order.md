- [Bybit Usdc Create Option Order](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402
print('CCXT Version:', ccxt.__version__)
exchange = ccxt.bybit ({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    'defaultType': 'option',
    # 'verbose': True,  # for debug output
})

# BASE/QUOTE:SETTLE-YYMMDD-STRIKE-C (end with C for call, end with P for put)
symbol = 'BTC/USD:USDC-221209-18000-C'
amount = 0.01
price = 280.0

try:
    order = exchange.create_order(symbol, 'limit', 'buy', amount, price)
    pprint(order)
except Exception as err:
    print(err)
 
```