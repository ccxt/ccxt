# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402

# if you imported the ccxt library with `import ccxt` you can
# set enableRateLimit = True to enable the rate limit in synchronous version of ccxt
# this way you request rate will never hit the limit of an exchange
# the library will throttle your requests to avoid that

exchange = ccxt.bitfinex({
    'enableRateLimit': True,  # this option enables the built-in rate limiter
})

for i in range(0, 10):
    # this can be any call instead of fetch_ticker, really
    print(exchange.fetch_ticker('BTC/USD'))
