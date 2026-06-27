# -*- coding: utf-8 -*-

import ccxt.pro
from asyncio import gather, run


async def symbol_loop(exchange, symbol):
    print('Starting the', exchange.id, 'symbol loop with', symbol)
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            now = exchange.milliseconds()
            print(exchange.iso8601(now), exchange.id, symbol, orderbook['asks'][0], orderbook['bids'][0])
        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            break  # you can break just this one loop if it fails

async def main():
    exchange = ccxt.pro.kucoin({
        "apiKey": "YOUR_API_KEY",
        "secret": "YOUR_API_SECRET",
        "password": "YOUR_API_PASSWORD",
    })
    symbols = ['KDA/USDT', 'KDA/BTC', 'BTC/USDT']
    loops = [symbol_loop(exchange, symbol) for symbol in symbols]
    await gather(*loops)
    await exchange.close()


run(main())
