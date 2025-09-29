- [Theocean](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402

walletAddress = os.environ['WALLET_ADDRESS']
privateKey = os.environ['PRIVATE_KEY']
apiKey = os.environ['API_KEY']
secret = os.environ['SECRET']
ocean = ccxt.theocean({
    'walletAddress': walletAddress,
    'privateKey': privateKey,
    'apiKey': apiKey,
    'secret': secret
})

# get balance
balance = ocean.fetch_balance_by_code('REP')
print('REP balance: ', balance)

# get order book
order_book = ocean.fetch_order_book('REP/ZRX')
print('REP/ZRX orderbook: ', order_book)

# placing order
place_result = ocean.create_order('REP/ZRX', 'limit', 'sell', '0.5', '30')
id = place_result['id']
print('result of placing order: ', place_result)

# cancel order
if place_result['remaining'] > 0:
    cancel_result = ocean.cancel_order(id)
    print('cancel result: ', cancel_result)

# cancel all open user orders
cancel_all_orders_result = ocean.cancel_all_orders()
print('cancel all orders result: ', cancel_all_orders_result)
 
```