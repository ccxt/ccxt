- [Kucoin Withdraw Chain](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.kucoin({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
    'password': 'YOUR_API_PASSWORD',
})

markets = exchange.load_markets()

# exchange.verbose = True  # uncomment for debugging purposes

try:
    code = 'USDT'
    amount = 123
    address = '0x3010c3486f1c16cb608ba3e53e3597c9a3b01f41'
    tag = None
    params = {
        'chain': 'TRC20',  # 'ERC20', 'TRC20', default is ERC20
    }
    response = exchange.withdraw(code, amount, address, tag, params)
    pprint(response)
except Exception as e:
    print(type(e).__name__, str(e))
 
```