- [Binance Poll Balance](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)


exchange = ccxt.binance({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

markets = exchange.load_markets()

# exchange.verbose = True  # uncomment for debugging purposes if necessary

previous_timestamp = exchange.milliseconds()
while True:
    try:
        balance = exchange.fetch_balance()
        print('--------------------------------------------------------------')
        current_timestamp = exchange.milliseconds()
        print(exchange.iso8601(current_timestamp), 'balance:')
        pprint(balance)
        print('Fetched in', current_timestamp - previous_timestamp, 'milliseconds')
        previous_timestamp = current_timestamp
    except Exception as e:
        print(type(e).__name__, str(e))

 
```