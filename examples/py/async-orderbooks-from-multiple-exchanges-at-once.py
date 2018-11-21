# -*- coding: utf-8 -*-

import asyncio
import ccxt
import ccxt.async_support as ccxta  # noqa: E402
import time
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

symbol = 'ETH/BTC'


def sync_client(exchange):
    client = getattr(ccxt, exchange)()
    client.load_markets()
    if symbol not in client.symbols:
        raise Exception(exchange + ' does not support symbol ' + symbol)
    orderbook = client.fetch_order_book(symbol)
    return orderbook


async def async_client(exchange):
    client = getattr(ccxta, exchange)()
    await client.load_markets()
    if symbol not in client.symbols:
        raise Exception(exchange + ' does not support symbol ' + symbol)
    tickers = await client.fetch_order_book(symbol)
    await client.close()
    return tickers


async def multi_orderbooks(exchanges):
    input_coroutines = [async_client(exchange) for exchange in exchanges]
    tickers = await asyncio.gather(*input_coroutines, return_exceptions=True)
    return tickers


if __name__ == '__main__':

    # Consider review request rate limit in the methods you call
    exchanges = ["coinex", "bittrex", "bitfinex", "poloniex", "hitbtc"]

    tic = time.time()
    a = asyncio.get_event_loop().run_until_complete(multi_orderbooks(exchanges))
    print("async call spend:", time.time() - tic)

    time.sleep(1)

    tic = time.time()
    a = [sync_client(exchange) for exchange in exchanges]
    print("sync call spend:", time.time() - tic)
