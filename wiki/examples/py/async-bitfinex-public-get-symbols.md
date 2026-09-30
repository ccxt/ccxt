```python
# -*- coding: utf-8 -*-

from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run
import os
import sys


import ccxt.async_support as ccxt  # noqa: E402


async def test():
    bitfinex = ccxt.bitfinex({
        'apiKey': "YOUR_API_KEY",
        'secret': "YOUR_SECRET",
        'verbose': True,  # switch it to False if you don't want the HTTP log
    })
    print(await bitfinex.public_get_symbols())
    await bitfinex.close()


run(test())

```
