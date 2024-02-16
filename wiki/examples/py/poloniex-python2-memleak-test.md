- [Poloniex Python2 Memleak Test](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
import psutil


import ccxt  # noqa: E402
exchange = ccxt.poloniex()

while True:
    orderbook = exchange.fetch_order_book('ETH/BTC')
    process = psutil.Process(os.getpid())
    print(exchange.iso8601(exchange.milliseconds()), process.memory_info()[0])
 
```