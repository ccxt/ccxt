# -*- coding: utf-8 -*-

from asyncio import run, gather
import ccxtpro


print('CCXT Pro Version:', ccxtpro.__version__)


async def loop(exchange_id, symbol):
    exchange = getattr(ccxtpro, exchange_id)()
    markets = await exchange.load_markets()
    # exchange.verbose = True  # uncomment for debugging purposes if necessary
    while True:
        try:
            ticker = await exchange.watch_ticker(symbol)
            now = exchange.milliseconds()
            print(exchange.iso8601(now), exchange.id, symbol, 'bid:', ticker['bid'], 'ask:', ticker['ask'], 'last:', ticker['last'], 'on', ticker['datetime'])
        except Exception as e:
            print(str(e))
            # raise e  # uncomment to break all loops in case of an error in any one of them
            break  # you can break just this one loop if it fails
    await exchange.close()


async def main():
    symbols = {
        'binance': 'ADA/USDT',
        'ftx': 'ADA/USD:USD',  # same as ADA-PERP
    }
    await gather(*[loop(exchange_id, symbol) for exchange_id, symbol in symbols.items()])


run(main())
