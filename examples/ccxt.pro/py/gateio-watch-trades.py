# -*- coding: utf-8 -*-

import asyncio
import ccxtpro

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
    exchange = ccxtpro.gateio()
    await loop(exchange, 'BTC/USDT')
    await exchange.close()


if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())
