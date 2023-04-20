# -*- coding: utf-8 -*-

import asyncio
import ccxt.pro

from datetime import datetime

async def loop(exchange, symbol):
    since = datetime.utcnow()
    timestamp = int(since.timestamp() * 1000)
    while True:
        trades = await exchange.watch_trades(symbol, since=timestamp)
        print('--------------------------------------------------------------')
        print('Received', len(trades), 'after', exchange.iso8601 (timestamp))
        print('waiting for next update...')


async def main():
    exchange = ccxt.pro.gateio()
    await loop(exchange, 'BTC/USDT')
    await exchange.close()


if __name__ == '__main__':
    asyncio.run(main())
