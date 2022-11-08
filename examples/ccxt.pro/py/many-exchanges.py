# -*- coding: utf-8 -*-

import asyncio
import ccxt.pro


async def loop(exchange_id, symbol):
    exchange = getattr(ccxt.pro, exchange_id)()
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            now = exchange.milliseconds()
            print(exchange.iso8601(now), exchange.id, symbol, orderbook['asks'][0], orderbook['bids'][0])
        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            break  # you can break just this one loop if it fails
    await exchange.close()


async def main():
    symbols = {
        'poloniex': 'BTC/USDT',
        'binance': 'BTC/USDT',
        'bitmex': 'BTC/USD',
    }
    await asyncio.gather(*[loop(exchange_id, symbol) for exchange_id, symbol in symbols.items()])


asyncio.run(main())
