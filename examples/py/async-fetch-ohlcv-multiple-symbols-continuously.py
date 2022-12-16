# -*- coding: utf-8 -*-

import os
import sys
from asyncio import run, gather

# -----------------------------------------------------------------------------

this_folder = os.path.dirname(os.path.abspath(__file__))
root_folder = os.path.dirname(os.path.dirname(this_folder))
sys.path.append(root_folder + '/python')
sys.path.append(this_folder)

# -----------------------------------------------------------------------------

import ccxt.async_support as ccxt  # noqa: E402

# -----------------------------------------------------------------------------


print('CCXT Version:', ccxt.__version__)


async def fetch_ohlcv(exchange, symbol, timeframe, limit):
    since = None
    while True:
        try:
            ohlcv = await exchange.fetch_ohlcv(symbol, timeframe, since, limit)
            if len(ohlcv):
                first_candle = ohlcv[0]
                datetime = exchange.iso8601(first_candle[0])
                print(datetime, exchange.id, symbol, first_candle[1:])
        except Exception as e:
            print(type(e).__name__, str(e))


async def main():
    exchange = ccxt.binance()
    timeframe = '1m'
    limit = 1
    symbols = [ 'BTC/USDT', 'ETH/USDT' ]
    loops = [fetch_ohlcv(exchange, symbol, timeframe, limit) for symbol in symbols]
    await gather(*loops)
    await exchange.close()


run(main())
