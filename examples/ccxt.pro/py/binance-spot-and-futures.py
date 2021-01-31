# -*- coding: utf-8 -*-

import ccxtpro
from asyncio import gather, get_event_loop


orderbooks = {}


def handle_all_orderbooks(orderbooks):
    print('We have the following orderbooks:')
    for id, orderbooks_by_symbol in orderbooks.items():
        for symbol in orderbooks_by_symbol.keys():
            orderbook = orderbooks_by_symbol[symbol]
            print(ccxtpro.Exchange.iso8601(orderbook['timestamp']), id, symbol, orderbook['asks'][0], orderbook['bids'][0])


async def symbol_loop(exchange, id, symbol):
    print('Starting', id, symbol)
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            orderbooks[id] = orderbooks.get(id, {})
            orderbooks[id][symbol] = orderbook
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


async def exchange_loop(asyncio_loop, id, config):
    print('Starting', id)
    exchange = getattr(ccxtpro, config['id'])({
        'enableRateLimit': True,
        'asyncio_loop': asyncio_loop,
        'options': config['options'],
    })
    loops = [symbol_loop(exchange, id, symbol) for symbol in config['symbols']]
    await gather(*loops)
    await exchange.close()


async def main(asyncio_loop):
    configs = {
        'Exchange A (Binance spot)': {
            'id': 'binance',
            'symbols': ['BTC/USDT', 'ETH/BTC','ETH/USDT'],
            'options': {
                'defaultType': 'spot',
            },
        },
        'Exchange B (Binance futures)': {
            'id': 'binance',
            'symbols': ['BTC/USDT', 'ETH/USDT'],
            'options': {
                'defaultType': 'future',
            },
        },
    }
    loops = [exchange_loop(asyncio_loop, id, config) for id, config in configs.items()]
    await gather(*loops)


if __name__ == '__main__':
    asyncio_loop = get_event_loop()
    asyncio_loop.run_until_complete(main(asyncio_loop))