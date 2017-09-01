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
ohlcv = kraken.fetch_ohlcv('BTC/USD', 60, kraken.seconds() - 86400)
index = 4 # [ timestamp, open, high, low, close, volume ]
last = ohlcv[len(ohlcv) - 1][index] # closing price
series = [x[index] for x in ohlcv]

rate = '₿ = $' + str(last)
print(asciichart.plot(series[0:120], {'height': 30}))
print("\n" + rate + "\n")
