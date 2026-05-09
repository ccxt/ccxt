- [Order Book Extra Level Depth Param](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402

# return up to ten bidasks on each side of the order book stack
limit = 10
print(ccxt.cex().fetch_order_book('BTC/USD', limit))
 
```