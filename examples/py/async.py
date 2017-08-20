# -*- coding: utf-8 -*-

import asyncio
import os
import sys

#------------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root)

#------------------------------------------------------------------------------

import ccxt.async as ccxt  # noqa: E402

#------------------------------------------------------------------------------

async def main():
    p = ccxt.poloniex()
    result = await p.fetch_ticker('ETH/BTC')
    print(result)

#------------------------------------------------------------------------------

if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())