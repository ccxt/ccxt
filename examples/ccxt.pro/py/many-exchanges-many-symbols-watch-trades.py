# -*- coding: utf-8 -*-

import ccxt.pro
from asyncio import gather, run


async def symbol_loop(exchange, symbol):
    print('Starting the', exchange.id, 'symbol loop with', symbol)
    while True:
        try:
            trades = await exchange.watch_trades(symbol)
            now = exchange.milliseconds()
            print(exchange.iso8601(now), exchange.id, symbol, len(trades), trades[-1]['price'])
        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            break  # you can break just this one loop if it fails


async def exchange_loop(exchange_id, symbols):
    print('Starting the', exchange_id, 'exchange loop with', symbols)
    exchange = getattr(ccxt.pro, exchange_id)({
        'newUpdates': True,  # https://github.com/ccxt/ccxt/wiki/ccxt.pro.manual#incremental-data-structures
    })
    loops = [symbol_loop(exchange, symbol) for symbol in symbols]
    await gather(*loops)
    await exchange.close()


async def main():
    exchanges = {
        'okex': ['BTC/USDT', 'ETH/BTC', 'ETH/USDT'],
        'binance': ['BTC/USDT', 'ETH/BTC'],
    }
    loops = [exchange_loop(exchange_id, symbols) for exchange_id, symbols in exchanges.items()]
    await gather(*loops)


run(main())
