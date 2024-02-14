- [Binance Coin Margined Take Profit](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint


import ccxt  # noqa: E402


print('CCXT Version:', ccxt.__version__)

exchange = ccxt.binancecoinm({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

markets = exchange.load_markets()

exchange.verbose = True  # uncomment for debugging purposes if necessary

# edit for your values below

symbol = 'EOS/USD'
order_type = 'TAKE_PROFIT'
side = 'sell'
amount = YOUR_AMOUNT_HERE
price = YOUR_LIMIT_PRICE_HERE
stopPrice = YOUR_STOP_PRICE
params = {'stopPrice': stopPrice}

try:
    order = exchange.create_order(symbol, order_type, side, amount, price, params)
    print(order)
except Exception as e:
    print(type(e).__name__, str(e))
 
```