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
timeframe = '5m'
ohlcvs = []


async def fetchOHLCV(symbol):
    '''
    Wrapper around exchange.fetchOHLCV method
    :param str symbol: CCXT unified symbol
    :returns [float|str]: 1d array with a single ohlcv record with the market symbol appended
    '''
    try:
        ohlcv = exchange.fetchOHLCV(symbol, timeframe, None, 2)
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
    allSwapSymbols = [symbol for symbol in exchange.symbols if exchange.market(symbol)['swap']]
    await asyncio.gather(*[fetchOHLCV(symbol) for symbol in allSwapSymbols])
    priceChanges = [getPriceChangePercent(ohlcv) for ohlcv in ohlcvs]
    priceChanges.sort()
    pprint(priceChanges)


loop = asyncio.get_event_loop()
loop.run_until_complete(main())
loop.close()
