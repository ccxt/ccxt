- [Async Fetch Ticker](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint


import ccxt.async_support as ccxt  # noqa: E402

pprint(asyncio.run(ccxt.binance().fetch_ticker('ETH/BTC')))
 
```