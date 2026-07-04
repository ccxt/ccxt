# -*- coding: utf-8 -*-

from importlib import import_module
from importlib.util import find_spec

run = import_module(next(filter(find_spec, ('uvloop', 'winloop', 'asyncio')))).run
import ccxt.pro

from datetime import datetime, timezone

async def loop(exchange, symbol):
    since = datetime.now(timezone.utc)
    timestamp = int(since.timestamp() * 1000)
    while True:
        trades = await exchange.watch_trades(symbol, since=timestamp)
        print('--------------------------------------------------------------')
        print('Received', len(trades), 'after', exchange.iso8601 (timestamp))
        print('waiting for next update...')


async def main():
    exchange = ccxt.pro.gate()
    await loop(exchange, 'BTC/USDT')
    await exchange.close()


if __name__ == '__main__':
    run(main())
