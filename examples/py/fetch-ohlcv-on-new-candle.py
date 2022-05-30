# -*- coding: utf-8 -*-

import os
import sys
import time

# -----------------------------------------------------------------------------

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(root + '/python')

# -----------------------------------------------------------------------------

import ccxt  # noqa: E402
from ccxt.base.decimal_to_precision import ROUND_UP  # noqa: E402

# -----------------------------------------------------------------------------
# common constants

msec = 1000
minute = 60 * msec
hold = 30

# -----------------------------------------------------------------------------

exchange = ccxt.binance({
    'rateLimit': 1000,
    'enableRateLimit': True,
    # 'verbose': True,
})

limit = 500
timeframe = "5m"
interval = exchange.parse_timeframe(timeframe) * 1000

while True:

    try:

        print(exchange.milliseconds(), 'Fetching candles')
        since = exchange.round_timeframe(timeframe, exchange.milliseconds(), ROUND_UP) - (limit * interval)
        ohlcv = exchange.fetch_ohlcv('ETH/BTC', timeframe, since=since, limit=limit)
        print(exchange.milliseconds(), 'Fetched', len(ohlcv), 'candles')
        first = ohlcv[0][0]
        last = ohlcv[-1][0]
        print('First candle epoch', first, exchange.iso8601(first))
        print('Last candle epoch', last, exchange.iso8601(last))
        # Calculate time to next candle and sleep for that many seconds
        sleeptime = (exchange.round_timeframe(timeframe, last, ROUND_UP) - exchange.milliseconds()) / 1000
        print('sleeping for: ', sleeptime, 's', sleeptime // 60, 'min')
        time.sleep(sleeptime)
    except (ccxt.ExchangeError, ccxt.AuthenticationError, ccxt.ExchangeNotAvailable, ccxt.RequestTimeout) as error:

        print('Got an error', type(error).__name__, error.args, ', retrying in', hold, 'seconds...')
        time.sleep(hold)
