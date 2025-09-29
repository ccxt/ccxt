- [Coinone Markets](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402

exchange = ccxt.coinone({
    # 'verbose': True,  # uncomment for verbose output
})

markets = exchange.load_markets()
pprint(markets)
print('\n', exchange.name, 'supports', len(markets), 'pairs')
 
```