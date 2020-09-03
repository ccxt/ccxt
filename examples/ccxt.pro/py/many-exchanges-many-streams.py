# -*- coding: utf-8 -*-

import asyncio
import ccxtpro


async def loop(asyncio_loop, exchange_id, symbol):
    exchange = getattr(ccxtpro, exchange_id)({
        'enableRateLimit': True,
        'asyncio_loop': asyncio_loop,
    })
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


async def main(asyncio_loop):
    symbols = ['BTC/USDT', 'ETH/BTC']
    # symbols = []
    exchanges = {
        'okex': symbols + ['ETH/USDT'],
        'binance': symbols,
    }
    loops = [loop(asyncio_loop, exchange_id, symbol) for exchange_id, symbols in exchanges.items() for symbol in symbols]
    await asyncio.gather(*loops)


if __name__ == '__main__':
    asyncio_loop = asyncio.get_event_loop()
    asyncio_loop.run_until_complete(main(asyncio_loop))
