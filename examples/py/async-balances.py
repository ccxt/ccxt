# -*- coding: utf-8 -*-

import asyncio
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def test(exchange):
    print(await exchange.fetch_balance())


kraken = ccxt.kraken({
    'apiKey': "hEvQNMDIeoCJbr7W/ZBb5CGOrx3G0lWF5B3zqa1JBxdZlEaL8EK+D0Mw",
    'secret': "JaE9wI6Nwgh5oRxiHcVxurwzwBxwc05W/qv/k1srGg4s3EYuXPpNkLLM5NYbbWpM8rCyijIeDavRuqWbU0ZV9A==",
    'verbose': True,  # switch it to False if you don't want the HTTP log
})
bitfinex = ccxt.bitfinex({
    'apiKey': "4FlEDtxDl35gdEiobnfZ72vJeZteE4Bb7JdvqzjIjHq",
    'secret': "D4DXM8DZdHuAq9YptUsb42aWT1XBnGlIJgLi8a7tzFH",
    'verbose': True,  # switch it to False if you don't want the HTTP log
})

[asyncio.ensure_future(test(exchange)) for exchange in [kraken, bitfinex]]
pending = asyncio.Task.all_tasks()
loop = asyncio.get_event_loop()
loop.run_until_complete(asyncio.gather(*pending))
