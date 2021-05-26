# -*- coding: utf-8 -*-

import asyncio
import ccxt
import ccxt.async_support as ccxta  # noqa: E402
import time
import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')


def sync_client(exchange):
    client = getattr(ccxt, exchange)()
    tickers = client.fetch_tickers()
    return tickers


async def async_client(exchange):
    client = getattr(ccxta, exchange)()
    tickers = await client.fetch_tickers()
    await client.close()
    return tickers


async def multi_tickers(exchanges):
    input_coroutines = [async_client(exchange) for exchange in exchanges]
    tickers = await asyncio.gather(*input_coroutines, return_exceptions=True)
    return tickers


if __name__ == '__main__':

    # Consider review request rate limit in the methods you call
    exchanges = ["coinex", "bittrex", "bitfinex", "poloniex", "hitbtc"]

    tic = time.time()
    a = asyncio.get_event_loop().run_until_complete(multi_tickers(exchanges))
    print("async call spend:", time.time() - tic)

    time.sleep(1)

    tic = time.time()
    a = [sync_client(exchange) for exchange in exchanges]
    print("sync call spend:", time.time() - tic)
