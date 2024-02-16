- [Binance Futures Positions](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402

print('CCXT Version:', ccxt.__version__)

exchange = ccxt.binance({
    'apiKey': 'YOUR_TESTNET_API_KEY',
    'secret': 'YOUR_TESTNET_API_SECRET',
    'options': {
        'defaultType': 'future',
    },
})

exchange.set_sandbox_mode(True)  # comment if you're not using the testnet
markets = exchange.load_markets()
exchange.verbose = True  # debug output

balance = exchange.fetch_balance()
positions = balance['info']['positions']
pprint(positions)
 
```