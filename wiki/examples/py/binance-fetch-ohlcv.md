- [Binance Fetch Ohlcv](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys
import asciichart

import ccxt  # noqa: E402
binance = ccxt.binance()
symbol = 'BTC/USDT'
timeframe = '1h'

# each ohlcv candle is a list of [ timestamp, open, high, low, close, volume ]
index = 4  # use close price from each ohlcv candle

height = 15
length = 80


def print_chart(exchange, symbol, timeframe):

    print("\n" + exchange.name + ' ' + symbol + ' ' + timeframe + ' chart:')

    # get a list of ohlcv candles
    ohlcv = exchange.fetch_ohlcv(symbol, timeframe)

    # get the ohlCv (closing price, index == 4)
    series = [x[index] for x in ohlcv]

    # print the chart
    print("\n" + asciichart.plot(series[-length:], {'height': height}))  # print the chart

    last = ohlcv[len(ohlcv) - 1][index]  # last closing price
    return last


last = print_chart(binance, symbol, timeframe)
print("\n" + binance.name + " ₿ = $" + str(last) + "\n")  # print last closing price
 
```