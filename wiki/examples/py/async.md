- [Async](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import asyncio
import functools
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def print_ticker(symbol, id):
    # verbose mode will show the order of execution to verify concurrency
    exchange = getattr(ccxt, id)({'verbose': True})
    print(await exchange.fetch_ticker(symbol))
    await exchange.close()


if __name__ == '__main__':

    symbol = 'ETH/BTC'
    print_ethbtc_ticker = functools.partial(print_ticker, symbol)
    [asyncio.ensure_future(print_ethbtc_ticker(id)) for id in [
        'bitfinex',
        'poloniex',
        'kraken',
        'bittrex',
        'hitbtc',
    ]]
    loop = asyncio.get_event_loop()
    pending = asyncio.all_tasks(loop)
    loop.run_until_complete(asyncio.gather(*pending))
 
```