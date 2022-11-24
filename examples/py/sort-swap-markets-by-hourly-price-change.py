# -*- coding: utf-8 -*-

import os
import sys
import asyncio
import time
from pprint import pprint
from datetime import datetime

# -----------------------------------------------------------------------------

this_folder = os.path.dirname(os.path.abspath(__file__))
root_folder = os.path.dirname(os.path.dirname(this_folder))
sys.path.append(root_folder + '/python')
sys.path.append(this_folder)

# -----------------------------------------------------------------------------

import ccxt.async_support as ccxt  # noqa: E402

# -----------------------------------------------------------------------------

exchange = ccxt.binanceusdm()
timeframe = '1h'
ohlcvs = []


async def fetchOHLCV(symbol):
    '''
    Wrapper around exchange.fetchOHLCV method
    :param str symbol: CCXT unified symbol
    :returns [float|str]: 1d array with a single ohlcv record with the market symbol appended
    '''
    try:
        ohlcv = await exchange.fetchOHLCV(symbol, timeframe, None, 2)
        ohlcv[0].append(symbol)
        ohlcvs.append(ohlcv[0])
    except Exception as e:
        print(f'{symbol} failed fetchOHLCV with exception {e}')


def getPriceChangePercent(ohlcv):
    '''
    Gets the price change of a market as a percentage
    :param [float] ohlcv: A single ohlcv record with the market symbol appended
    :returns [float, str]: The price change as a percent with the symbol for the market
    '''
    open = ohlcv[1]
    close = ohlcv[4]
    symbol = ohlcv[6]
    priceIncrease = close - open
    increaseAsRatio = priceIncrease / open
    return [increaseAsRatio, symbol]


async def main():
    '''
    Gets the price change as a percent of every market matching type over the last timeframe matching timeframe and prints a sorted list.
    The most immediate candle is ignored because it is incomplete
    '''
    start = time.time()

    await exchange.load_markets()
    allSwapSymbols = [symbol for symbol in exchange.symbols if exchange.market(symbol)['swap']]
    await asyncio.gather(*[fetchOHLCV(symbol) for symbol in allSwapSymbols])
    await exchange.close()
    priceChanges = [getPriceChangePercent(ohlcv) for ohlcv in ohlcvs]
    priceChanges.sort()

    end = time.time()
    duration = str(int((end - start) * 1000))
    now = str(datetime.utcnow().isoformat())

    print('python', sys.version)
    print('CCXT Version:', ccxt.__version__)
    print(now + ' iteration 0 passed in ' + duration + ' ms')
    print()
    pprint(priceChanges)


asyncio.run(main())
