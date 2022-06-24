# -*- coding: utf-8 -*-

import asyncio
import os
import sys

from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def test():

    exchange = ccxt.poloniex({
        #
        # ↓ The "proxy" property setting below is for CORS-proxying only!
        # Do not use it if you don't know what a CORS proxy is.
        # https://github.com/ccxt/ccxt/wiki/Install#cors-access-control-allow-origin
        # You should only use the "proxy" setting if you're having a problem with Access-Control-Allow-Origin
        # In Python you rarely need to use it, if ever at all.
        #
        # 'proxy': 'https://cors-anywhere.herokuapp.com/',
        #
        # ↓ The "aiohttp_proxy" setting is for HTTP(S)-proxying (SOCKS, etc...)
        # It is a standard method of sending your requests through your proxies
        # This gets passed to the `asyncio` and `aiohttp` implementation directly
        # You can use this setting as documented here:
        # https://docs.aiohttp.org/en/stable/client_advanced.html#proxy-support
        # This is the setting you should be using with async version of ccxt in Python 3.5+
        #
        'aiohttp_proxy': 'http://proxy.com',
        # 'aiohttp_proxy': 'http://user:pass@some.proxy.com',
        # 'aiohttp_proxy': 'http://10.10.1.10:3128',
    })

    # your code goes here...

    ticker = await exchange.fetch_ticker('ETH/BTC')

    pprint(ticker)

    # don't forget to free the used resources, when you don't need them anymore
    await exchange.close()


asyncio.run(test())
