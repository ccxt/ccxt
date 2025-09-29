- [Binance Fetch Ohlcv Quote Volume](./examples/py/)


 ```python
 # -*- coding: utf-8 -*-

import os
import sys


import ccxt  # noqa: E402


def table(values):
    first = values[0]
    keys = list(first.keys()) if isinstance(first, dict) else range(0, len(first))
    widths = [max([len(str(v[k])) for v in values]) for k in keys]
    string = ' | '.join(['{:<' + str(w) + '}' for w in widths])
    return "\n".join([string.format(*[str(v[k]) for k in keys]) for v in values])


class Binance(ccxt.binance):
    def parse_ohlcv(self, ohlcv, market=None):
        #
        #     [
        #         1591478520000,  # open time
        #         "0.02501300",   # open
        #         "0.02501800",   # high
        #         "0.02500000",   # low
        #         "0.02500000",   # close
        #         "22.19000000",  # volume
        #         1591478579999,  # close time
        #         "0.55490906",   # quote asset volume
        #         40,             # number of trades
        #         "10.92900000",  # taker buy base asset volume
        #         "0.27336462",   # taker buy quote asset volume
        #         "0"             # ignore
        #     ]
        #
        return [
            self.safe_integer(ohlcv, 0),
            self.safe_number(ohlcv, 1),
            self.safe_number(ohlcv, 2),
            self.safe_number(ohlcv, 3),
            self.safe_number(ohlcv, 4),
            self.safe_number(ohlcv, 7),  # << here
        ]

exchange = Binance()
markets = exchange.load_markets()
# exchange.verbose = True  # uncomment for debugging purposes if necessary
ohlcv = exchange.fetch_ohlcv('BTC/USDT', '1h')
print(table(ohlcv))
 
```