# -*- coding: utf-8 -*-

import asyncio
import ccxtpro


orderbooks = {}


def handle_all_orderbooks(orderbooks):
    print('We have the following orderbooks:')
    for exchange_id, orderbooks_by_symbol in orderbooks.items():
        for symbol in orderbooks_by_symbol.keys():
            orderbook = orderbooks_by_symbol[symbol]
            print(ccxtpro.Exchange.iso8601(orderbook['timestamp']), exchange_id, symbol, orderbook['asks'][0], orderbook['bids'][0])


async def loop(asyncio_loop, exchange_id, symbol):
    exchange = getattr(ccxtpro, exchange_id)({
        'enableRateLimit': True,
        'asyncio_loop': asyncio_loop,
    })
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            orderbooks[exchange.id] = orderbooks.get(exchange.id, {})
            orderbooks[exchange.id][symbol] = orderbook
            print('===========================================================')
            #
            # here you can do what you want
            # with the most recent versions of each orderbook you have so far
            #
            # you can also wait until all of them are available
            # by just looking into all the orderbooks and counting them
            #
            # we just print them here to keep this example simple
            #
            handle_all_orderbooks(orderbooks)
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