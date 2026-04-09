# -*- coding: utf-8 -*-

import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

import ccxt  # noqa: E402
from ccxt.base.exchange import Exchange  # noqa: E402


# An example of OOP / class inheritance in Python

class ohlcv(Exchange):
    def fetch_all_ohlcvs(self, symbol, timeframe, max_retries=3):
        print('Loading', self.id, 'markets...')
        self.load_markets()
        print('Loaded', self.id, 'markets.')
        limit = 100
        earliest_timestamp = self.milliseconds()
        timeframe_duration_in_seconds = self.parse_timeframe(timeframe)
        timeframe_duration_in_ms = timeframe_duration_in_seconds * 1000
        timedelta = limit * timeframe_duration_in_ms
        ohlcv_dictionary = {}
        ohlcv_list = []
        i = 0
        done = False
        while True:
            # this printout is here for explanation purposes
            print('===========================================================')
            print('Iteration', i)
            fetch_since = earliest_timestamp - timedelta
            print('Fetching', self.id, symbol, timeframe, 'candles from', self.iso8601(fetch_since), 'to', self.iso8601(earliest_timestamp))
            num_retries = 0
            try:
                num_retries += 1
                ohlcv = self.fetch_ohlcv(symbol, timeframe, fetch_since, limit)
                if (len(ohlcv)):
                    earliest_timestamp = ohlcv[0][0] - timeframe_duration_in_ms
                    print('Fetched', len(ohlcv), self.id, symbol, timeframe, 'candles from', self.iso8601(ohlcv[0][0]), 'to', self.iso8601(ohlcv[-1][0]))
                else:
                    print('Fetched', len(ohlcv), self.id, symbol, timeframe, 'candles')
                    done = True
            except Exception:
                if num_retries > max_retries:
                    raise
                else:
                    continue
            i += 1
            ohlcv_dictionary = self.extend(ohlcv_dictionary, self.indexBy(ohlcv, 0))
            ohlcv_list = self.sort_by(ohlcv_dictionary.values(), 0)
            if len(ohlcv_list):
                print('Stored', len(ohlcv_list), self.id, symbol, timeframe, 'candles from', self.iso8601(ohlcv_list[0][0]), 'to', self.iso8601(ohlcv_list[-1][0]))
            if done:
                break
        return ohlcv_list


# Another example of OOP / class inheritance.
# This time my_okex class is inherited from two other classes
# both ohlcv and ccxt.okex, and has the methods from both classes.
# This is just an example, it is not necessary do it this way.
# You can combine classes and methods using Python's OOP how you like.

class my_okex(ohlcv, ccxt.okex):
    pass


# instantiate your class and call the inherited method

exchange = my_okex({
    # 'hostname': 'okex.me',  # if you're in mainland China
})

symbol = 'BTC/USDT'
timeframe = '1m'
ohlcvs = exchange.fetch_all_ohlcvs(symbol, timeframe)
print('Done.')
