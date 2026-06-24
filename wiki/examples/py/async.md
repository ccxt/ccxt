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


async def main():
    symbol = 'ETH/BTC'
    print_ethbtc_ticker = functools.partial(print_ticker, symbol)
    await asyncio.gather(*[print_ethbtc_ticker(id) for id in [
        'bitfinex',
        'poloniex',
        'kraken',
        'kucoin',
        'hitbtc',
    ]])


if __name__ == '__main__':
    asyncio.run(main())

```
