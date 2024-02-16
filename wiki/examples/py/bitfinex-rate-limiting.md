- [Bitfinex Rate Limiting](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402


symbol = 'ETH/BTC'

exchange = ccxt.bitfinex({

    # BITFINEX RATELIMITS DON'T CORRESPOND TO THEIR DOCUMENTATION!

    # their actual rate limit is significantly more strict than documented!
    'rateLimit': 3000,  # once every 3 seconds, 20 times per minute – will work

    # this is their documented ratelimit according to this page:
    # https://docs.bitfinex.com/v1/reference#rest-public-orderbook
    # 'rateLimit': 1000,  # once every second, 60 times per minute – won't work, will throw DDoSProtection
})

for i in range(0, 100):
    print('--------------------------------------------------------------------')
    print(i)
    print('sent:', exchange.iso8601(exchange.milliseconds()))
    orderbook = exchange.fetch_order_book(symbol)
    print('received:', exchange.iso8601(exchange.milliseconds()), 'bid:', orderbook['bids'][0], 'ask:', orderbook['asks'][0])
 
```