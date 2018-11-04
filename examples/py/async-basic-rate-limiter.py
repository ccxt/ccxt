# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def main(exchange):
    for i in range(0, 10):
        # this can be any call instead of fetch_ticker, really
        print(await exchange.fetch_ticker('BTC/USD'))


# you can set enableRateLimit = True to enable the built-in rate limiter
# this way you request rate will never hit the limit of an exchange
# the library will throttle your requests to avoid that

exchange = ccxt.bitfinex({
    'enableRateLimit': True,  # this option enables the built-in rate limiter
})

asyncio.get_event_loop().run_until_complete(main(exchange))
