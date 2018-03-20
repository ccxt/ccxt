# -*- coding: utf-8 -*-

import os
import sys
import time

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

# if you imported the ccxt library with `import ccxt` you can
# throttle your requests manually, by using the rateLimit property of an exchange
# to delay each request by waiting for some time to stay below request rate limits

exchange = ccxt.bitfinex()

# the rateLimit is in milliseconds → divide it by a thousand to get seconds
delay = exchange.rateLimit / 1000

for i in range(0, 10):
    # this can be any call instead of fetch_ticker, really
    print(exchange.fetch_ticker('BTC/USD'))
    time.sleep(delay)  # sleep a little before sending each next request
