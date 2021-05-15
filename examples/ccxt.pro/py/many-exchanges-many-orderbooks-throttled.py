# -*- coding: utf-8 -*-

import ccxtpro
from asyncio import get_event_loop, gather, sleep


orderbooks = {}


def handle_all_orderbooks(orderbooks):
    print('We have the following orderbooks:')
    for exchange_id, orderbooks_by_symbol in orderbooks.items():
        for symbol in orderbooks_by_symbol.keys():
            orderbook = orderbooks_by_symbol[symbol]
            print(ccxtpro.Exchange.iso8601(orderbook['timestamp']), exchange_id, symbol, orderbook['asks'][0], orderbook['bids'][0])


async def handling_loop(orderbooks):
    delay = 5
    while True:
        await sleep(delay)
        handle_all_orderbooks(orderbooks)


async def symbol_loop(exchange, symbol):
    while True:
        try:
            orderbook = await exchange.watch_order_book(symbol)
            orderbooks[exchange.id] = orderbooks.get(exchange.id, {})
            orderbooks[exchange.id][symbol] = orderbook
        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            break  # you can break just this one loop if it fails


async def exchange_loop(asyncio_loop, exchange_id, symbols):
    exchange = getattr(ccxtpro, exchange_id)({
        'enableRateLimit': True,
        'asyncio_loop': asyncio_loop,
    })
    loops = [symbol_loop(exchange, symbol) for symbol in symbols]
    await gather(*loops)
    await exchange.close()


async def main(asyncio_loop):
    symbols = ['BTC/USDT', 'ETH/BTC']
    # symbols = []
    exchanges = {
        'okex': symbols + ['ETH/USDT'],
        'binance': symbols,
    }
    loops = [exchange_loop(asyncio_loop, exchange_id, symbols) for exchange_id, symbols in exchanges.items()]
    loops += [ handling_loop(orderbooks) ]
    await gather(*loops)


if __name__ == '__main__':
    asyncio_loop = get_event_loop()
    asyncio_loop.run_until_complete(main(asyncio_loop))