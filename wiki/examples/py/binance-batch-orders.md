- [Binance Batch Orders](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402


exchange = ccxt.binance({
    "apiKey": "YOUR_API_KEY",
    "secret": "YOUR_SECRET",
})


orders = [
    {
        "symbol" : "BTCUSDT",
        "side" : "BUY",
        "positionSide" : "LONG",
        "type" : "MARKET",
        "quantity": float(0.005)
    }
]

orders = [exchange.encode_uri_component(exchange.json(order), safe=",") for order in orders]
response = exchange.fapiPrivatePostBatchOrders({
    'batchOrders': '[' + ','.join(orders) + ']'
})

print(response)
 
```