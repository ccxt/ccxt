# -*- coding: utf-8 -*-

from asyncio import run
import ccxt.pro

async def loop(exchange, symbol):
    await exchange.throttle(10)
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            now = exchange.milliseconds()
            print(exchange.iso8601(now), symbol, orderbook['asks'][0], orderbook['bids'][0])
        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            # break  # you can also break just this one loop if it fails

async def main():
    exchange = ccxt.pro.ftx()
    symbols = ['BTC/USDT', 'ETH/USDT', 'ETH/BTC']
    await asyncio.gather(*[loop(exchange, symbol) for symbol in symbols])
    await exchange.close()


run(main())
