- [Async Binance Usdm Fetch Continuous Klines Ohlcv](./examples/py/)


 ```python
 
# -*- coding: utf-8 -*-

import os
import sys
from asyncio import run

import ccxt.async_support as ccxt  # noqa: E402

print('CCXT Version:', ccxt.__version__)


def table(values):
    first = values[0]
    keys = list(first.keys()) if isinstance(first, dict) else range(0, len(first))
    widths = [max([len(str(v[k])) for v in values]) for k in keys]
    string = ' | '.join(['{:<' + str(w) + '}' for w in widths])
    return "\n".join([string.format(*[str(v[k]) for k in keys]) for v in values])


async def main():
    exchange = ccxt.binanceusdm()
    try:
        await exchange.load_markets()
        timeframe = '1m'
        limit = 1
        symbol = 'BTC/USDT'
        market = exchange.market(symbol)
        timeframe = '1m'
        params = {
            'pair': market['id'],
            'contractType': 'PERPETUAL',  # 'PERPETUAL', 'CURRENT_MONTH', 'NEXT_MONTH', 'CURRENT_QUARTER', 'NEXT_QUARTER'
            'interval': exchange.timeframes[timeframe],
        }
        # https://binance-docs.github.io/apidocs/futures/en/#continuous-contract-kline-candlestick-data
        ohlcvs = await exchange.fapiPublic_get_continuousklines(params)
        print(table([o for o in ohlcvs]))
        print(table([[exchange.iso8601(int(o[0]))] + o[1:] for o in ohlcvs]))
    except Exception as e:
        print(type(e).__name__, str(e))
    await exchange.close()


run(main())
 
```