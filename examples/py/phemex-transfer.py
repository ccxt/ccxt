# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

exchange = ccxt.phemex({
    'apiKey': 'YOUR_API_KEY',
    'secret': 'YOUR_SECRET',
})

# Example 1: Transfer from main account to sub account
code = 'USDT'
fromAccount = '4018341'
toAccount = '4184432'
amount = 1

params = {}

transfer = exchange.transfer (code, amount, fromAccount, toAccount, params = {})
print(transfer)
