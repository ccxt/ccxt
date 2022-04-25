# -*- coding: utf-8 -*-

import os
import sys
import asyncio
from pprint import pprint


# -----------------------------------------------------------------------------

this_folder = os.path.dirname(os.path.abspath(__file__))
root_folder = os.path.dirname(os.path.dirname(this_folder))
sys.path.append(root_folder + '/python')
sys.path.append(this_folder)

# -----------------------------------------------------------------------------

import ccxt  # noqa: E402

# -----------------------------------------------------------------------------

exchange = ccxt.binanceusdm()
exchange.load_markets()
timeframe = '1h'
ohlcvs = []


async def fetchOHLCV(symbol):
    try:
        ohlcv = exchange.fetchOHLCV(symbol, timeframe, None, 1)
        ohlcv[0].append(symbol)
        ohlcvs.append(ohlcv[0])
    except Exception as e:
        print(f'{symbol} failed fetchOHLCV with exception {e}')


async def main():

    symbols = exchange.symbols

    allSwapSymbols = []
    for i in range(0, len(symbols)):
        symbol = symbols[i]
        market = exchange.market(symbol)
        if market['swap']:
            allSwapSymbols.append(symbol)

    await asyncio.gather(*[fetchOHLCV(symbol) for symbol in allSwapSymbols])

    priceChanges = []
    for i in range(len(ohlcvs)):
        ohlcv = ohlcvs[i]
        open = ohlcv[1]
        close = ohlcv[4]
        symbol = ohlcv[6]
        priceIncrease = close - open
        increaseAsRatio = priceIncrease / open
        priceChanges.append([increaseAsRatio, symbol])

    priceChanges.sort()
    pprint(priceChanges)

loop = asyncio.get_event_loop()
loop.run_until_complete(main())
loop.close()
