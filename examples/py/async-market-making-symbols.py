# -*- coding: utf-8 -*-

from asyncio import gather, run
from pprint import pprint
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


async def load_markets(exchange):
    results = None
    try:
        await exchange.load_markets()
        print('Loaded', len(exchange.symbols), exchange.id, 'symbols')
        results = []
        for market in exchange.markets.values():
            if market['maker'] <= 0:
                results.append({'exchange': exchange.id, 'symbol': market['symbol']})
        if len(results) < 1:
            results = None
    except:
        results = None
    await exchange.close()
    return results


async def main():
    exchanges = [getattr(ccxt, exchange_id)() for exchange_id in ccxt.exchanges]
    # exchanges = [exchange for exchange in exchanges if exchange.certified]
    results = await gather(*[load_markets(exchange) for exchange in exchanges])
    results = [result for result in results if result is not None]
    pprint(results)


run(main())
