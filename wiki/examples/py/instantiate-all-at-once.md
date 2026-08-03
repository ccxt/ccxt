```python
# -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402

exchanges = {}  # a placeholder for your instances

for id in ccxt.exchanges:
    exchange = getattr(ccxt, id)
    exchanges[id] = exchange()

# now exchanges dictionary contains all exchange instances...
exchanges['kucoin'].fetch_order_book('ETH/BTC')

```
