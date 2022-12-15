# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def poll():
    kraken = ccxt.kraken({
        'apiKey': "hEvQNMDIeoCJbr7W/ZBb5CGOrx3G0lWF5B3zqa1JBxdZlEaL8EK+D0Mw",
        'secret': "JaE9wI6Nwgh5oRxiHcVxurwzwBxwc05W/qv/k1srGg4s3EYuXPpNkLLM5NYbbWpM8rCyijIeDavRuqWbU0ZV9A==",
        # 'verbose': True, # switch it to False if you don't want the HTTP log
    })
    while True:
        yield await kraken.fetch_ticker('BTC/USD')
        await asyncio.sleep(kraken.rateLimit / 1000)


async def main():
    async for ticker in poll():
        print(ticker)


asyncio.run(main())
