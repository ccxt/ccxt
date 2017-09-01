# -*- coding: utf-8 -*-

import os
import sys

#------------------------------------------------------------------------------

this_folder = os.path.dirname(os.path.abspath(__file__))
root_folder = os.path.dirname(os.path.dirname(this_folder))
sys.path.append(root_folder)
sys.path.append(this_folder)

#------------------------------------------------------------------------------

import asciichart
import ccxt # noqa: E402

#------------------------------------------------------------------------------

kraken = ccxt.kraken()

# get a list of ohlcv candles
ohlcv = kraken.fetch_ohlcv('BTC/USD', 60)

# each ohlcv candle is a list of [ timestamp, open, high, low, close, volume ]
index = 4 # use close price from each ohlcv candle
series = [x[index] for x in ohlcv]

print(asciichart.plot(series[-120:], {'height': 30})) # print the chart

last = ohlcv[len(ohlcv) - 1][index] # last closing price
print("\n" + kraken.name + " ₿ = $" + str(last) + "\n") # print it
