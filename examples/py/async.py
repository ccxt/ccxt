# -*- coding: utf-8 -*-

import os
import sys
import logging

#------------------------------------------------------------------------------

logging.basicConfig(
    level=getattr(logging, loglevel),
    format='%(asctime)s %(levelname)s: %(message)s')

#------------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root)

#------------------------------------------------------------------------------

import ccxt.async as ccxt  # noqa: E402

#------------------------------------------------------------------------------

async def main():
    p = ccxt.poloniex()
    result = await p.fetch_markets()
    logging.info(result)

#------------------------------------------------------------------------------

if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())