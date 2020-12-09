# -*- coding: utf-8 -*-

import ccxtpro
from asyncio import gather, get_event_loop


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

async def exchange_loop(asyncio_loop, exchange_id, symbols):
    print('Starting the', exchange_id, 'exchange loop with', symbols)
    exchange = getattr(ccxtpro, exchange_id)({
        'enableRateLimit': True,
        'asyncio_loop': asyncio_loop,
    })
    loops = [symbol_loop(exchange, symbol) for symbol in symbols]
    await gather(*loops)
    await exchange.close()


async def main(asyncio_loop):
    exchanges = {
        'okex': ['BTC/USDT', 'ETH/BTC', 'ETH/USDT'],
        'binance': ['BTC/USDT', 'ETH/BTC'],
    }
    loops = [exchange_loop(asyncio_loop, exchange_id, symbols) for exchange_id, symbols in exchanges.items()]
    await gather(*loops)


if __name__ == '__main__':
    asyncio_loop = get_event_loop()
    asyncio_loop.run_until_complete(main(asyncio_loop))
