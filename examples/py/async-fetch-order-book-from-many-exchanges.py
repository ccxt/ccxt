# -*- coding: utf-8 -*-

import asyncio
import os
import sys
from pprint import pprint

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt.async_support as ccxt  # noqa: E402


exchange_ids = [ 'binance', 'kucoin', 'huobipro' ]
symbol = 'ETH/BTC'

async def loop(exchange_id, symbol):

    exchange_class = getattr(ccxt, exchange_id)
    exchange = exchange_class()
    orderbook = {}
    try:
        await exchange.load_markets()
        # exchange.verbose = True  # uncomment for debugging purposes
        orderbook = await exchange.fetch_order_book(symbol)
    except Exception as e:
        print(type(e).__name__, str(e))
    await exchange.close()
    return exchange.extend (orderbook, {
        'exchange_id': exchange_id,
        'symbol': symbol,
    })


async def run(exchange_ids, symbol):
    coroutines = [loop(exchange_id, symbol) for exchange_id in exchange_ids]
    return await asyncio.gather(*coroutines)


main = run(exchange_ids, symbol)
results = asyncio.run(main)
for result in results:
    bids = result['bids']
    asks = result['asks']
    print(
        result['exchange_id'],
        result['symbol'],
        'top bid', bids[0], 'of', len(bids), 'bids,',
        'top ask', asks[0], 'of', len(asks), 'asks'
    )
