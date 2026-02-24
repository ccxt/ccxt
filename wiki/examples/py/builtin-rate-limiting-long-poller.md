- [Builtin Rate Limiting Long Poller](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402


exchange = ccxt.bitfinex()

for i in range(0, 10):
    # this can be any call instead of fetch_ticker, really
    print(exchange.fetch_ticker('BTC/USD'))
 
```