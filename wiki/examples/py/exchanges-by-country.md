- [Exchanges By Country](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)


country = 'US'
exchanges = []
for exchange_id in ccxt.exchanges:
    try:
        exchange = getattr(ccxt, exchange_id)()
        if country in exchange.countries:
            print(country, exchange_id, exchange.countries)
            exchanges.append(exchange)
    except Exception as e:
        print(type(e).__name__, str(e))
 
```