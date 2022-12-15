# -*- coding: utf-8 -*-

import os
import sys
import asciichartpy

# -----------------------------------------------------------------------------

this_folder = os.path.dirname(os.path.abspath(__file__))
root_folder = os.path.dirname(os.path.dirname(this_folder))
sys.path.append(root_folder + '/python')
sys.path.append(this_folder)

# -----------------------------------------------------------------------------

import ccxt  # noqa: E402

# -----------------------------------------------------------------------------

exchange = ccxt.kraken()
symbol = 'LTC/EUR'

# each ohlcv candle is a list of [ timestamp, open, high, low, close, volume ]
index = 4  # use close price from each ohlcv candle

length = 80
height = 15


def print_chart(exchange, symbol, timeframe):

    # get a list of ohlcv candles
    ohlcv = exchange.fetch_ohlcv(symbol, timeframe)

    # get the ohlCv (closing price, index == 4)
    series = [x[index] for x in ohlcv]

    # print datetime and other values
    for x in ohlcv:
        print(exchange.iso8601(x[0]), x)

    print("\n" + exchange.name + ' ' + symbol + ' ' + timeframe + ' chart:')

    # print the chart
    print("\n" + asciichartpy.plot(series[-length:], {'height': height}))  # print the chart

    last = ohlcv[len(ohlcv) - 1][index]  # last closing price
    return last


last = print_chart(exchange, symbol, '1m')
print("\n" + exchange.name + ' last price: ' + str(last) + "\n")  # print last closing price
