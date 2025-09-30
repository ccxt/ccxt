- [Coinbase Cancel Order](./examples/py/)


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

order_id = '04204eaf-94d6-444a-b9b7-2f8a485311f6'
# order_ids = ['04204eaf-94d6-444a-b9b7-2f8a485311f6', '7c13a059-d235-46e1-ab43-6794a5836db9']

try:
    cancel_order = exchange.cancel_order(order_id)
    # cancel_orders = exchange.cancel_orders(order_ids)
    pprint(cancel_order)
    # pprint(cancel_orders)
except Exception as err:
    print(err)
 
```