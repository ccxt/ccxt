# -*- coding: utf-8 -*-

import asyncio
import ccxt.async_support as ccxt


async def poll(tickers):
    i = 0
    kraken = ccxt.kraken()
    while True:
        symbol = tickers[i % len(tickers)]
        yield (symbol, await kraken.fetch_ticker(symbol))
        i += 1
        await asyncio.sleep(kraken.rateLimit / 1000)


async def main():
    async for (symbol, ticker) in poll(['BTC/USD', 'ETH/BTC', 'BTC/EUR']):
        print(symbol, ticker)


asyncio.get_event_loop().run_until_complete(main())
