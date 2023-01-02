# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

# -----------------------------------------------------------------------------

print('CCXT Version:', ccxt.__version__)

# -----------------------------------------------------------------------------

exchange = ccxt.kucoinfutures({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_API_SECRET',
    'password': 'YOUR_API_PASSWORD',
    # 'verbose': True,  # for debug output
})

symbol = 'BTC/USDT:USDT'
order_type = 'limit'
side = 'buy'
amount = 1  # number of contracts
price = 14000
params = {
    'stopPriceType': 'TP',  # 'TP', 'IP' or 'MP'
    'stopPrice': '17500',
}

try:
    order = exchange.create_order(symbol, order_type, side, amount, price, params)
    pprint(order)
except Exception as err:
    print(err)
