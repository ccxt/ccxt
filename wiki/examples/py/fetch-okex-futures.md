- [Fetch Okex Futures](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
import time
import ccxt  # noqa: E402
exchange = ccxt.okex()
exchange.load_markets()
for symbol in exchange.markets:
    market = exchange.markets[symbol]
    if market['future']:
        print('----------------------------------------------------')
        print(symbol, exchange.fetchTicker(symbol))
        time.sleep(exchange.rateLimit / 1000)
 
```