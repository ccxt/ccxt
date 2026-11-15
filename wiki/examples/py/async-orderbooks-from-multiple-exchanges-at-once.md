```python
# -*- coding: utf-8 -*-

import asyncio
from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run
import ccxt
import ccxt.async_support as ccxta  # noqa: E402
import time
import os
import sys


symbol = 'ETH/BTC'


def sync_client(exchange_id):
    orderbook = None
    exchange = getattr(ccxt, exchange_id)()
    try:
        exchange.load_markets()
        market = exchange.market(symbol)
        orderbook = exchange.fetch_order_book(market['symbol'])
    except Exception as e:
        print(type(e).__name__, str(e))
    return { 'exchange': exchange.id, 'orderbook': orderbook }


async def async_client(exchange_id):
    orderbook = None
    exchange = getattr(ccxta, exchange_id)()
    try:
        await exchange.load_markets()
        market = exchange.market(symbol)
        orderbook = await exchange.fetch_order_book(market['symbol'])
    except Exception as e:
        print(type(e).__name__, str(e))
    await exchange.close()
    return { 'exchange': exchange.id, 'orderbook': orderbook }


async def multi_orderbooks(exchanges):
    input_coroutines = [async_client(exchange) for exchange in exchanges]
    orderbooks = await asyncio.gather(*input_coroutines, return_exceptions=True)
    return orderbooks


if __name__ == '__main__':

    # Consider review request rate limit in the methods you call
    exchanges = ["kucoin", "bitfinex", "poloniex", "htx"]

    tic = time.time()
    a = run(multi_orderbooks(exchanges))
    print("async call spend:", time.time() - tic)

    time.sleep(1)

    tic = time.time()
    a = [sync_client(exchange) for exchange in exchanges]
    print("sync call spend:", time.time() - tic)

```
