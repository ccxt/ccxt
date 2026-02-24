- [Coinbase Fetch Trades](./examples/py/)


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
since = None  # not used by coinbase
limit = 3

try:
    trades = exchange.fetch_trades(symbol, since, limit)
    my_trades = exchange.fetch_my_trades(symbol, since, limit)
    pprint(trades)
    pprint(my_trades)
except Exception as err:
    print(err)
 
```