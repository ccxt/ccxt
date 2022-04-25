# -*- coding: utf-8 -*-

import os
import sys
from pprint import pprint

# -----------------------------------------------------------------------------

this_folder = os.path.dirname(os.path.abspath(__file__))
root_folder = os.path.dirname(os.path.dirname(this_folder))
sys.path.append(root_folder + '/python')
sys.path.append(this_folder)

# -----------------------------------------------------------------------------

import ccxt  # noqa: E402

# -----------------------------------------------------------------------------


def main():

    exchange = ccxt.binanceusdm()
    exchange.load_markets()

    timeframe = '1h'
    symbols = exchange.symbols

    allSwapSymbols = []
    for i in range(0, len(symbols)):
        symbol = symbols[i]
        market = exchange.market(symbol)
        if market['swap']:
            allSwapSymbols.append(symbol)

    ohlcvs = []
    for i in range(0, len(allSwapSymbols)):
        symbol = allSwapSymbols[i]
        ohlcv = exchange.fetchOHLCV(symbol, timeframe, None, 1)
        ohlcv[0].append(symbol)
        ohlcvs.append(ohlcv[0])

    priceChanges = []
    for i in range(0, len(ohlcvs)):
        ohlcv = ohlcvs[i]
        open = ohlcv[1]
        close = ohlcv[4]
        symbol = ohlcv[6]
        priceIncrease = close - open
        increaseAsRatio = priceIncrease / open
        priceChanges.append([increaseAsRatio, symbol])

    priceChanges.sort()
    pprint(priceChanges)


main()
