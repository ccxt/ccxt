# -*- coding: utf-8 -*-

import asyncio
import ccxtpro


async def loop(exchange, symbol, n):
    i = 0
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            # print every 100th bidask to avoid wasting CPU cycles on printing
            if not i % 100:
                # i = how many updates there were in total
                # n = the number of the pair to count subscriptions
                now = exchange.milliseconds()
                print(exchange.iso8601(now), n, symbol, i, orderbook['asks'][0], orderbook['bids'][0])
            i += 1
        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            # break  # you can also break just this one loop if it fails


async def main():
    exchange = ccxtpro.kraken({'enableRateLimit': True})
    await exchange.load_markets()
    markets = list(exchange.markets.values())
    symbols = [market['symbol'] for market in markets if not market['darkpool']]
    await asyncio.gather(*[loop(exchange, symbol, n) for n, symbol in enumerate(symbols)])
    await exchange.close()


if __name__ == '__main__':
    asyncio.get_event_loop().run_until_complete(main())
